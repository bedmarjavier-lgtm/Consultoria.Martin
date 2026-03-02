import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './index.css'

// Componentes
import MapComponent from './components/MapComponent'
import ResultCard from './components/ResultCard'
import GlobeDiscovery from './components/GlobeDiscovery'
import AdminDashboard from './components/AdminDashboard'
import { Terms, Privacy } from './components/Legal'
import { calculateSolarImpact } from './utils/SolarCalculator'
import ConsumptionChart from './components/ConsumptionChart'
import SmartInsights from './components/SmartInsights'
import Login from './components/Login'
import UserDashboard from './components/UserDashboard'
import { Menu, Search, User as UserIcon, Briefcase, X } from 'lucide-react'
import { supabase } from './lib/supabase'
import toast, { Toaster } from 'react-hot-toast'


function App() {
  const [showGlobe, setShowGlobe] = useState(true)
  const [showAdmin, setShowAdmin] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const SPAIN_CENTER = [40.4165, -3.7026]; // Madrid, centro geográfico de España
  const SPAIN_ZOOM = 6;
  const [mapCenter, setMapCenter] = useState(SPAIN_CENTER)
  const [mapZoom, setMapZoom] = useState(SPAIN_ZOOM)
  const [markerPos, setMarkerPos] = useState(null)
  const [results, setResults] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [showUserDashboard, setShowUserDashboard] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [session, setSession] = useState(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isRecovery, setIsRecovery] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // El usuario llegó desde el enlace del email de recuperación
        setIsRecovery(true)
        setSession(session) // La sesión temporal OTP ya está activa
      } else {
        setIsRecovery(false)
        setSession(session)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Acceso Secreto al Panel Admin (Mac: Cmd + Opt + A | Alt + L)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      const isAltKey = e.altKey;
      const key = e.key.toLowerCase();

      if ((isCmdOrCtrl && isAltKey && key === 'a') || (isAltKey && key === 'l')) {
        e.preventDefault();
        setShowAdmin(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /**
   * snapToBuilding: Dado un punto lat/lon (puede estar en la calle),
   * consulta Overpass API para encontrar el edificio OSM más cercano.
   * Si se pasa houseNumber, prioriza el edificio que tenga ese addr:housenumber.
   * Calcula el centroide real y el área real en m² (Shoelace).
   * @param {number} lat
   * @param {number} lon
   * @param {string|null} houseNumber  — número de portal para priorizar (opcional)
   * @returns {{ lat, lon, areaMq, found }}
   */
  const snapToBuilding = async (lat, lon, houseNumber = null) => {
    // Helper: calcula centroide + área de un array de nodos {lat,lon}
    const processPolygon = (nodes) => {
      const cLat = nodes.reduce((s, n) => s + n.lat, 0) / nodes.length;
      const cLon = nodes.reduce((s, n) => s + n.lon, 0) / nodes.length;
      const DEG_LAT = 111320;
      const DEG_LON = 111320 * Math.cos(cLat * Math.PI / 180);
      let area = 0;
      for (let i = 0; i < nodes.length; i++) {
        const j = (i + 1) % nodes.length;
        const xi = (nodes[i].lon - cLon) * DEG_LON;
        const yi = (nodes[i].lat - cLat) * DEG_LAT;
        const xj = (nodes[j].lon - cLon) * DEG_LON;
        const yj = (nodes[j].lat - cLat) * DEG_LAT;
        area += xi * yj - xj * yi;
      }
      return { cLat, cLon, areaMq: Math.round(Math.abs(area) / 2) };
    };

    // Helper: ejecuta la query de Overpass con un radio dado (con servidores de respaldo)
    const OVERPASS_SERVERS = [
      'https://overpass-api.de/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter',
      'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
    ];
    const queryOverpass = async (radius) => {
      const q = `[out:json][timeout:10];(way(around:${radius},${lat},${lon})["building"];relation(around:${radius},${lat},${lon})["building"];);out body geom;`;
      for (const server of OVERPASS_SERVERS) {
        try {
          const r = await fetch(server, {
            method: 'POST', body: q,
            headers: { 'Content-Type': 'text/plain' },
            signal: AbortSignal.timeout(11000)
          });
          if (!r.ok) continue;
          const d = await r.json();
          return d.elements || [];
        } catch { continue; }
      }
      return [];
    };

    try {
      // Intento 1: radio 80m
      let elements = await queryOverpass(80);
      // Intento 2: si no hay resultado, ampliar radio a 150m
      if (elements.length === 0) {
        elements = await queryOverpass(150);
      }
      if (elements.length === 0) return { lat, lon, areaMq: null, found: false };

      // Filtrar elementos sin geometría válida
      const valid = elements.filter(el => el.geometry && el.geometry.length >= 3);
      if (valid.length === 0) return { lat, lon, areaMq: null, found: false };

      // Calcular datos de cada edificio
      const buildings = valid.map(el => {
        const { cLat, cLon, areaMq } = processPolygon(el.geometry);
        const dist = Math.hypot(cLat - lat, cLon - lon);
        const hn = el.tags?.['addr:housenumber'] || el.tags?.['addr:street_number'] || null;
        return { cLat, cLon, areaMq, dist, houseNumberOSM: hn, el };
      });

      let best = null;

      // Prioridad 1: edificio cuyo número de portal coincide exactamente con el buscado
      if (houseNumber) {
        best = buildings
          .filter(b => b.houseNumberOSM === String(houseNumber))
          .sort((a, b) => a.dist - b.dist)[0] || null;
      }

      // Prioridad 2: edificio más cercano que NO sea enorme (>8000m² = manzana entera)
      if (!best) {
        best = buildings
          .filter(b => b.areaMq < 8000)
          .sort((a, b) => a.dist - b.dist)[0] || null;
      }

      // Prioridad 3: el más cercano sin importar tamaño
      if (!best) {
        best = buildings.sort((a, b) => a.dist - b.dist)[0];
      }

      return { lat: best.cLat, lon: best.cLon, areaMq: best.areaMq, found: true };
    } catch {
      return { lat, lon, areaMq: null, found: false };
    }
  };


  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    // Normalizar: eliminar saltos de línea, tabs, espacios dobles
    const query = searchQuery.trim().replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ');
    if (!query) return;

    setLoading(true);
    setResults(null);

    try {
      // ─── PARSING DE LA DIRECCIÓN ───────────────────────────────────────────
      // Detecta: calle, número de portal, código postal (5 dígitos), ciudad
      // Soporta cualquier formato español: con/sin C.P., con/sin ciudad, multilínea
      const streetMatch = query.match(/^(.+?)[,\s]+(\d+)[,\s]*(.*)$/);

      let streetPart = null;
      let numberPart = null;
      let postalCode = null;
      let cityPart = null;

      if (streetMatch) {
        streetPart = streetMatch[1].trim();
        numberPart = streetMatch[2].trim();
        const rest = streetMatch[3].trim();

        if (rest) {
          const cpMatch = rest.match(/^(\d{5})[,\s]+(.+)$/);
          if (cpMatch) {
            postalCode = cpMatch[1];
            cityPart = cpMatch[2].split(',')[0].trim();
          } else if (/^\d{5}$/.test(rest.split(/[,\s]/)[0])) {
            postalCode = rest.split(/[,\s]/)[0];
            cityPart = null;
          } else {
            cityPart = rest.split(',')[0].trim();
          }
        }
      }

      // ─── HELPER: quita prefijos de calle habituales ────────────────────────
      // "Calle de la Rúa Mayor" → "Rúa Mayor"   "Avenida de la Paz" → "Paz"
      const stripStreetPrefix = (s) => {
        if (!s) return s;
        return s
          .replace(/^(calle|c\/|avda?\.?|avenida|paseo|plaza|ronda|carretera|camino|travess?[íi]a|rambla|via|vía|boulevard|bulevar)\s+(de\s+(la\s+|las\s+|el\s+|los\s+|l[ao]\s+)?|del\s+|de\s+)?/i, '')
          .trim();
      };

      const strippedStreet = streetPart ? stripStreetPrefix(streetPart) : null;

      // ─── MOTOR DE BÚSQUEDA EN CASCADA ─────────────────────────────────────
      // Genera hasta 7 variantes de URL y las prueba en orden hasta que una devuelva resultados
      const nominatimSearch = async (q, extraParams = '') => {
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=10${extraParams}&q=${encodeURIComponent(q)}`;
        try {
          const r = await fetch(url, { headers: { 'Accept-Language': 'es' } });
          if (!r.ok) return [];
          return await r.json();
        } catch { return []; }
      };

      // Búsqueda estructurada (más precisa cuando el nombre de calle coincide exactamente en OSM)
      const nominatimStructured = async (street, number, city, cp) => {
        let url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=es&street=${encodeURIComponent(number + ' ' + street)}`;
        if (city) url += `&city=${encodeURIComponent(city)}`;
        if (cp) url += `&postalcode=${encodeURIComponent(cp)}`;
        try {
          const r = await fetch(url, { headers: { 'Accept-Language': 'es' } });
          if (!r.ok) return [];
          return await r.json();
        } catch { return []; }
      };

      let data = [];

      // Las variantes se prueban en orden, parando al primer éxito
      const variants = [
        // 1. Estructurada con nombre completo
        ...(streetPart && numberPart ? [() => nominatimStructured(streetPart, numberPart, cityPart, postalCode)] : []),
        // 2. Estructurada con nombre simplificado (sin "Calle de la…")
        ...(strippedStreet && strippedStreet !== streetPart && numberPart ? [() => nominatimStructured(strippedStreet, numberPart, cityPart, postalCode)] : []),
        // 3. Query libre: "14 Calle de la Rúa Mayor, 37002, Salamanca" (España)
        ...(streetPart && numberPart ? [() => {
          const parts = [numberPart + ' ' + streetPart];
          if (postalCode) parts.push(postalCode);
          if (cityPart) parts.push(cityPart);
          return nominatimSearch(parts.join(', '), '&countrycodes=es');
        }] : []),
        // 4. Query libre con nombre simplificado (España)
        ...(strippedStreet && strippedStreet !== streetPart && numberPart ? [() => {
          const parts = [numberPart + ' ' + strippedStreet];
          if (postalCode) parts.push(postalCode);
          if (cityPart) parts.push(cityPart);
          return nominatimSearch(parts.join(', '), '&countrycodes=es');
        }] : []),
        // 5. Query completa normalizada tal cual (España)
        () => nominatimSearch(query, '&countrycodes=es'),
        // 6. Query completa normalizada SIN restricción de país (último recurso España)
        () => nominatimSearch(query, ''),
        // 7. Solo nombre simplificado + ciudad/CP (por si el número no existe en OSM)
        ...(strippedStreet && (cityPart || postalCode) ? [() => {
          const parts = [strippedStreet];
          if (postalCode) parts.push(postalCode);
          if (cityPart) parts.push(cityPart);
          return nominatimSearch(parts.join(', '), '');
        }] : []),
      ];

      for (const variant of variants) {
        if (data.length > 0) break;
        const result = await variant();
        if (result.length > 0) data = result;
      }
      // ──────────────────────────────────────────────────────────────────────

      if (data && data.length > 0) {
        // Selección: portal exacto > edificio > house_number > no-admin > primero
        const preciseResult =
          (numberPart && data.find(item => item.class === 'building' && item.address?.house_number === numberPart)) ||
          data.find(item => item.class === 'building') ||
          (numberPart && data.find(item => item.address?.house_number === numberPart)) ||
          data.find(item => item.address?.house_number) ||
          data.find(item => item.type !== 'administrative') ||
          data[0];

        const nominatimLat = parseFloat(preciseResult.lat);
        const nominatimLon = parseFloat(preciseResult.lon);

        // ── SNAP AL TEJADO REAL (Overpass) ──
        toast.loading('Localizando tejado del edificio...', { id: 'snap' });
        const snap = await snapToBuilding(nominatimLat, nominatimLon, numberPart || null);
        toast.dismiss('snap');

        const lat = snap.lat;
        const lon = snap.lon;

        setMarkerPos([lat, lon]);
        setMapCenter([lat, lon]);
        setMapZoom(20);

        const randomPrice = 0.14 + (Math.random() * 0.05);
        let detectedArea;
        if (snap.found && snap.areaMq && snap.areaMq > 20) {
          detectedArea = Math.round(snap.areaMq * 0.70);
        } else {
          const seed = (Math.abs(Math.round(lat * 10000) / 10000) * 1000 + Math.abs(Math.round(lon * 10000) / 10000) * 1000) % 1;
          detectedArea = Math.floor(40 + seed * 90);
        }
        const impact = calculateSolarImpact(detectedArea, randomPrice);

        const foundHouseNumber = preciseResult.address?.house_number;
        const finalResult = { ...impact, area: detectedArea, address: preciseResult.display_name, buildingSnapped: snap.found };

        setTimeout(() => {
          setResults(finalResult);
          setShowSearch(false);
          toast.success(
            snap.found
              ? `Tejado Nº${foundHouseNumber || numberPart || ''} · ${detectedArea}m² reales`
              : foundHouseNumber ? `Portal Nº${foundHouseNumber} Localizado` : 'Ubicación Encontrada'
          );
        }, 300);

        if (session) saveAnalysis(finalResult);

      } else {
        toast.error('Sin resultados. Prueba a incluir ciudad o código postal.');
      }
    } catch (error) {
      console.error('Geocoding failure', error);
      toast.error('Error inesperado. Reintenta.');
    } finally {
      setLoading(false);
    }
  };


  const handleMapClick = async (coords) => {
    setLoading(true)
    setMapZoom(20)
    try {
      const [clickLat, clickLon] = coords

      // 1. Snap al edificio más cercano al click
      const snap = await snapToBuilding(clickLat, clickLon);
      const lat = snap.lat;
      const lon = snap.lon;

      setMapCenter([lat, lon]);
      setMarkerPos([lat, lon]);

      // 2. Reverse geocoding de las coordenadas del edificio (no del click)
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
      const data = await response.json()
      const address = data.display_name || `Coordenadas: ${lat.toFixed(4)}, ${lon.toFixed(4)}`

      const randomPrice = 0.14 + (Math.random() * 0.05)
      let detectedArea;
      if (snap.found && snap.areaMq && snap.areaMq > 20) {
        detectedArea = Math.round(snap.areaMq * 0.70);
      } else {
        const seed = (Math.abs(Math.round(lat * 10000) / 10000) * 1000 + Math.abs(Math.round(lon * 10000) / 10000) * 1000) % 1;
        detectedArea = Math.floor(40 + seed * 90);
      }
      const impact = calculateSolarImpact(detectedArea, randomPrice)

      const finalResult = { ...impact, area: detectedArea, address, buildingSnapped: snap.found };
      setResults(finalResult);

      if (session) {
        saveAnalysis(finalResult);
      }
    } catch (error) {
      console.error("Reverse geocoding failure", error)
    } finally {
      setLoading(false)
    }
  }

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogoClick = () => {
    setResults(null);
    setMarkerPos(null);
    setMapCenter(SPAIN_CENTER);
    setMapZoom(SPAIN_ZOOM);
    setSearchQuery('');
    setLoading(false);
    setShowSearch(false);
    setShowUserDashboard(false);
    setShowAdmin(false);
    setShowTerms(false);
    setShowPrivacy(false);
    toast.success('Información reiniciada', {
      style: { background: '#00050a', color: '#fff', border: '1px solid #ffffff10' }
    });
  };

  const saveAnalysis = useCallback(async (data) => {
    try {
      if (!session) return;
      const userId = session.user.id;

      const { error: analysisError } = await supabase
        .from('solar_analysis')
        .insert({
          user_id: userId,
          address: data.address,
          roof_area_m2: data.area,
          panels_count: data.numPanels,
          annual_savings_eur: data.annualSavings
        })
        .select()
        .single();

      if (analysisError) throw analysisError;

      await supabase.from('profiles').upsert({
        id: userId,
        email: session.user.email,
        fullname: session.user.user_metadata?.fullname || 'Consultor OceanX'
      }, { onConflict: 'id' });

      toast.success(`Sincronización Completa: ${data.address.split(',')[0]}`);
    } catch (error) {
      console.error('Error in unified sync:', error);
    }
  }, [session]);

  // NOTA: saveAnalysis se llama directamente en handleSearch y handleMapClick.
  // El useEffect que lo llamaba al cambiar 'results' ha sido eliminado para
  // evitar el guardado doble que causaba entradas duplicadas en solar_analysis.

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      setSession(null);
      setShowGlobe(true);
      setShowUserDashboard(false);
      setResults(null);
      setMarkerPos(null);
      toast.success('Sesión finalizada correctamente');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#00050a] flex flex-col lg:overflow-hidden">
      <Toaster />
      <h1 className="sr-only">Consultoria Martin - Auditoría Energética</h1>

      <AnimatePresence>
        {showGlobe && (
          <motion.div
            key="globe"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[5000]"
          >
            <GlobeDiscovery
              isBlurred={!session}
              isZooming={isAuthenticating}
              onEnterExperience={() => setShowGlobe(false)}
              onShowTerms={() => setShowTerms(true)}
              onShowPrivacy={() => setShowPrivacy(true)}
            />

            <AnimatePresence>
              {(!session || isRecovery) && (
                <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6 bg-black/20 text-black">
                  <Login
                    initialMode={isRecovery ? 'reset' : 'login'}
                    onLogin={() => {
                      setIsRecovery(false)
                      setIsAuthenticating(true);
                      setTimeout(() => {
                        setIsAuthenticating(false);
                      }, 2000);
                    }}
                  />
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {!showGlobe && (
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="flex flex-col relative w-full min-h-screen lg:h-screen lg:overflow-hidden overflow-y-auto overflow-x-hidden scroll-smooth"
        >
          <header className="fixed top-0 left-0 w-full p-4 md:px-12 md:py-8 z-[2000] grid grid-cols-3 items-center bg-transparent border-none backdrop-blur-sm lg:backdrop-blur-none">
            {/* Izquierda: Buscador (Movido para no molestar al logo) */}
            <div className="flex items-center justify-start">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`transition-all hover:scale-110 active:scale-95 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] ${showSearch ? 'text-cyan-400' : 'text-white/70 hover:text-cyan-400'}`}
              >
                <Search size={22} strokeWidth={2.5} />
              </button>
            </div>

            {/* Centro: Logo Clickable para Reset */}
            <div
              onClick={handleLogoClick}
              className="text-center animate-fade-in cursor-pointer hover:scale-105 transition-transform flex flex-col items-center justify-center"
            >
              <div className="text-xl md:text-2xl lg:text-3xl font-black tracking-tighter uppercase font-montserrat leading-tight text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Consultoria.<span className="text-[#ff6a00]">Martin</span>
              </div>
              <p className="text-white/40 tracking-[0.5em] uppercase text-[6px] md:text-[8px] font-bold hidden md:block mt-1">
                CENTRAL INTELLIGENCE
              </p>
            </div>

            {/* Derecha: Usuario y Admin */}
            <div className="flex items-center justify-end gap-6 md:gap-10">
              <button
                onClick={() => setShowUserDashboard(true)}
                className="text-white/70 hover:text-cyan-400 transition-all hover:scale-110 active:scale-95 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] relative"
              >
                <UserIcon size={22} strokeWidth={2.5} />
              </button>

              {session?.user?.email === 'bedmarjavier@gmail.com' && (
                <button
                  onClick={() => setShowAdmin(true)}
                  className="text-white/70 hover:text-orange-400 transition-all hover:scale-110 active:scale-95 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                >
                  <Briefcase size={22} strokeWidth={2.5} />
                </button>
              )}
            </div>

          </header>

          <AnimatePresence>
            {showSearch && (
              <div
                className={isMobile
                  ? "fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                  : "fixed top-32 left-1/2 -translate-x-1/2 w-[600px] z-[5000]"
                }
              >
                <motion.div
                  initial={isMobile ? { opacity: 0, scale: 0.9, y: 30 } : { opacity: 0, y: -20 }}
                  animate={isMobile ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1, y: 0 }}
                  exit={isMobile ? { opacity: 0, scale: 0.9, y: 30 } : { opacity: 0, y: -20 }}
                  className="bg-black/95 backdrop-blur-3xl p-10 md:p-14 rounded-[3.5rem] border-2 border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.9)] w-full relative pointer-events-auto"
                >
                  <div className="relative flex flex-col items-center">
                    <div className="text-[10px] font-black tracking-[0.5em] text-cyan-400 uppercase mb-8 text-center animate-pulse">SISTEMA DE ESCANEO ACTIVO</div>
                    <input
                      type="text"
                      autoFocus
                      placeholder="Calle y Número, Ciudad..."
                      className="w-full bg-transparent border-b-2 border-white/5 px-0 py-6 text-2xl md:text-5xl font-black tracking-tighter text-white placeholder:text-white/10 uppercase focus:outline-none focus:border-cyan-400 transition-all text-center mb-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearch(e);
                      }}
                    />
                    <button
                      onClick={handleSearch}
                      disabled={loading}
                      className="px-12 py-5 bg-cyan-400 text-black rounded-full text-[12px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 w-full md:w-auto"
                    >
                      {loading ? 'PROCESANDO...' : 'INICIAR AUDITORÍA'}
                    </button>

                    <button
                      onClick={() => setShowSearch(false)}
                      className="mt-8 text-white/30 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all"
                    >
                      CERRAR PANEL
                    </button>

                    <button
                      onClick={() => setShowSearch(false)}
                      className="absolute -top-6 -right-6 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-white transition-all backdrop-blur-xl"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>


          <div className="relative w-full h-full flex-1 overflow-x-hidden">
            {/* Mapa como Fondo Total (Z-0) */}
            <section className="fixed inset-0 z-0 h-[100svh] w-full">
              <MapComponent center={mapCenter} zoom={mapZoom} markerPos={markerPos} onMapClick={handleMapClick} isMobile={isMobile} />
            </section>

            {/* Capa de Contenido (Z-10) */}
            <div className="relative z-10 w-full min-h-[100svh] pointer-events-none flex flex-col">

              {/* Espaciador dinámico: más grande en móvil para ver el mapa */}
              <div className="h-[65vh] lg:h-[20vh] shrink-0 pointer-events-none" />

              <div className="flex flex-col lg:flex-row justify-between w-full flex-1 relative px-4 md:px-10 pb-24 md:pb-10 gap-6">
                <aside className="w-full lg:w-[400px] pointer-events-auto flex flex-col gap-6">
                  <SmartInsights results={results} />
                  <ConsumptionChart />
                </aside>

                <div className="w-full lg:w-auto pointer-events-auto">
                  <AnimatePresence>
                    {results && (
                      <ResultCard results={results} onClose={() => setResults(null)} userId={session?.user?.id} />
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </motion.main >
      )
      }

      <AdminDashboard isOpen={showAdmin} onClose={() => setShowAdmin(false)} session={session} />
      <UserDashboard isOpen={showUserDashboard} onClose={() => setShowUserDashboard(false)} onLogout={handleLogout} session={session} />
      <Terms isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <Privacy isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />

      <style jsx="true">{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 1s forwards; }
      `}</style>
    </div >
  )
}

export default App
