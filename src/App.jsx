import { useState, useRef, useEffect } from 'react'
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
  const [mapCenter, setMapCenter] = useState([37.3891, -4.7636])
  const [markerPos, setMarkerPos] = useState(null)
  const [results, setResults] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [showUserDashboard, setShowUserDashboard] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [session, setSession] = useState(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Acceso Secreto al Panel Admin (Mac: Cmd + Opt + A | Alt + L)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      const isAltKey = e.altKey;
      const key = e.key.toLowerCase();

      // Atajo 1: Cmd/Ctrl + Opt/Alt + A
      // Atajo 2: Alt + L (Leads)
      if ((isCmdOrCtrl && isAltKey && key === 'a') || (isAltKey && key === 'l')) {
        e.preventDefault();
        console.log("Acceso administrativo: Interruptor activado");
        setShowAdmin(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    console.log("Estado de AdminDashboard:", showAdmin ? "ABIERTO" : "CERRADO");
  }, [showAdmin]);



  const handleSearch = async (e) => {
    if (e.key === 'Enter' && searchQuery) {
      setLoading(true)
      try {
        // @Consuloria.Martin: Refuerzo de Geocoding Exacto
        let query = searchQuery.trim();
        if (!query.toLowerCase().includes('españa')) {
          query += ', España';
        }

        let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1&countrycodes=es`)
        let data = await response.json()

        // Sistema de Reintento Inteligente: Si falla la búsqueda exacta (ej. por número de portal inexistente en el mapa)
        if (data.length === 0) {
          console.log("Intento 1 fallido, probando búsqueda flexible...");
          // Eliminar el número de portal para buscar la calle general
          const flexibleQuery = query.replace(/\s\d+([^\d]|$)/, ' ').trim();
          const responseFlex = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(flexibleQuery)}&limit=1&addressdetails=1&countrycodes=es`);
          data = await responseFlex.json();
        }

        if (data.length > 0) {
          const result = data[0];

          // Validación de Credibilidad: ¿Es una estructura o dirección válida?
          const validTypes = ['house', 'building', 'residential', 'apartments', 'industrial', 'commercial', 'retail', 'office', 'amenity', 'shop', 'school', 'hospital', 'tourism'];
          const resultAddress = result.address || {};
          const isStructure = validTypes.includes(result.type) || validTypes.includes(result.class) || resultAddress.house_number;

          const urbanKeywords = ['Calle', 'Avenida', 'Plaza', 'Vía', 'Carrer', 'Rúa', 'Prolongación', 'Prolongacion', 'Carretera', 'Travesía', 'Travesia', 'Camino', 'Paseo', 'Ronda'];
          const isUrban = result.display_name && urbanKeywords.some(keyword => result.display_name.includes(keyword));

          if (!isStructure && !isUrban) {
            setResults(null);
            setMarkerPos(null);
            setLoading(false);
            alert("Ubicación detectada como zona no urbanizada o exterior. Por favor, introduce una dirección de calle específica.");
            return;
          }

          const lat = parseFloat(result.lat);
          const lon = parseFloat(result.lon);

          if (isNaN(lat) || isNaN(lon)) {
            throw new Error("Invalid coordinates returned");
          }

          const newPos = [lat, lon];
          setMapCenter(newPos);
          setMarkerPos(newPos);

          // Sincronización de Auditoría Automática - Determinismo por tejado (redondeo a 4 decimales ~11m)
          const roundedLat = Math.round(lat * 10000) / 10000;
          const roundedLon = Math.round(lon * 10000) / 10000;
          const seed = (Math.abs(roundedLat) * 1000 + Math.abs(roundedLon) * 1000) % 1;
          const detectedArea = Math.floor(40 + seed * 90);

          const randomPrice = 0.14 + (Math.random() * 0.05);
          const impact = calculateSolarImpact(detectedArea, randomPrice);
          setResults({ ...impact, area: detectedArea, address: result.display_name });
        } else {
          setResults(null);
          setMarkerPos(null);
          alert("No se han encontrado resultados para esta dirección. Asegúrate de incluir el nombre correcto de la calle o prueba a buscar solo la calle y el municipio.");
        }
      } catch (error) {
        console.error("Critical: Geocoding failure", error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleMapClick = async (coords) => {
    setLoading(true)
    setMapCenter(coords)
    setMarkerPos(coords)
    try {
      const [lat, lon] = coords
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
      const data = await response.json()

      // Validación de Credibilidad en Click: Filtrar campo/mar/zonas vacías
      const validTypes = ['house', 'building', 'residential', 'apartments', 'industrial', 'commercial', 'retail', 'office', 'amenity', 'shop', 'school', 'hospital', 'tourism'];

      const isStructure = validTypes.includes(data.type) ||
        validTypes.includes(data.class) ||
        (data.address && data.address.house_number);

      const urbanKeywords = ['Calle', 'Avenida', 'Plaza', 'Vía', 'Carrer', 'Rúa', 'Prolongación', 'Prolongacion', 'Carretera', 'Travesía', 'Travesia', 'Camino', 'Paseo', 'Ronda'];
      const isUrban = data.display_name && urbanKeywords.some(keyword => data.display_name.includes(keyword));

      if (!isStructure && !isUrban) {
        setResults(null);
        setMarkerPos(null);
        setLoading(false);
        return;
      }

      const address = data.display_name || `Coordenadas: ${lat.toFixed(4)}, ${lon.toFixed(4)}`

      // Sincronización de Auditoría Automática - Determinismo por tejado (redondeo a 4 decimales ~11m)
      const roundedLat = Math.round(lat * 10000) / 10000;
      const roundedLon = Math.round(lon * 10000) / 10000;
      const seed = (Math.abs(roundedLat) * 1000 + Math.abs(roundedLon) * 1000) % 1;
      const detectedArea = Math.floor(40 + seed * 90)
      const randomPrice = 0.14 + (Math.random() * 0.05)
      const impact = calculateSolarImpact(detectedArea, randomPrice)

      setResults({ ...impact, area: detectedArea, address })
    } catch (error) {
      console.error("Reverse geocoding failure", error)
    } finally {
      setLoading(false)
    }
  }

  const logoClicks = useRef(0);
  const handleLogoClick = () => {
    logoClicks.current++;
    if (logoClicks.current >= 3) {
      setShowAdmin(true);
      logoClicks.current = 0;
    }
    setTimeout(() => { logoClicks.current = 0; }, 1000);
  };

  const saveAnalysis = async (data) => {
    try {
      if (!session) return;
      const userId = session.user.id;

      // 1. Guardar en solar_analysis
      const { data: analysisEntry, error: analysisError } = await supabase
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

      // 2. Guardar en financial_audit vinculado al análisis
      const { error: auditError } = await supabase
        .from('financial_audit')
        .insert({
          analysis_id: analysisEntry.id,
          current_bill_avg: Math.round(data.currentPrice * data.estimatedConsumption / 12),
          optimized_tariff: "Mercado Optimizado",
          annual_savings_eur: data.annualSavings
        });

      if (auditError) throw auditError;

      // 3. Opcional: Asegurar que el perfil existe
      await supabase.from('profiles').upsert({
        id: userId,
        email: session.user.email,
        full_name: session.user.user_metadata?.full_name || 'Consultor OceanX'
      }, { onConflict: 'id' });

      toast.success(`Sincronización Completa: ${data.address.split(',')[0]}`, {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#000810',
          color: '#00f2ff',
          border: '1px solid rgba(0, 242, 255, 0.2)',
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontWeight: 'bold'
        }
      });
    } catch (error) {
      console.error('Error in unified sync:', error);
      toast.error('Fallo en sincronización OceanX Cloud');
    }
  };

  useEffect(() => {
    if (results && results.address) {
      saveAnalysis(results);
    }
  }, [results]);


  return (
    <div className="relative min-h-screen bg-[#00050a] flex flex-col lg:overflow-hidden">
      <Toaster />
      {/* Etiqueta H1 Única para SEO (Oculta visualmente pero presente para crawlers) */}
      <h1 className="sr-only">Consultoria Martin - Auditoría Energética y Autoconsumo Solar</h1>

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
              {!session && (
                <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6 bg-black/20">
                  <Login onLogin={() => {
                    setIsAuthenticating(true);
                    setTimeout(() => {
                      setIsAuthenticating(false);
                    }, 2000);
                  }} />
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Experience HUD / Normal Web on Mobile */}
      {!showGlobe && (
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="flex flex-col relative w-full min-h-screen lg:h-screen lg:overflow-hidden overflow-y-auto overflow-x-hidden scroll-smooth"
        >
          {/* Header Superior Estilo Gymshark */}
          <header className="fixed top-0 left-0 w-full p-6 md:px-12 md:py-8 z-[2000] flex justify-between items-center bg-[#00050a]/95 border-b border-white/5 backdrop-blur-3xl lg:bg-transparent lg:border-none lg:backdrop-blur-none">

            {/* Izquierda: Menu y Buscar */}
            <div className="flex items-center gap-6 md:gap-10">
              <button className="text-white hover:text-cyan-400 pb-1 transition-colors">
                <Menu size={24} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`text-white hover:text-cyan-400 pb-1 transition-colors ${showSearch ? 'text-cyan-400' : ''}`}
              >
                <Search size={22} strokeWidth={2.5} />
              </button>
            </div>

            {/* Centro: Logo */}
            <div className="absolute left-1/2 -translate-x-1/2 text-center animate-fade-in group cursor-pointer" onClick={handleLogoClick}>
              <div className="text-xl md:text-2xl lg:text-3xl font-black tracking-tighter uppercase font-montserrat leading-tight">
                <span className="text-white">Consultoria.</span>
                <span className="text-orange-gradient">Martin</span>
              </div>
              <p className="text-white/20 tracking-[0.5em] uppercase text-[6px] md:text-[8px] font-bold hidden md:block">
                CENTRAL INTELLIGENCE
              </p>
            </div>

            {/* Derecha: Usuario y Centro Proyectos (Admin/Briefcase) */}
            <div className="flex items-center gap-6 md:gap-10">
              <button
                onClick={() => setShowUserDashboard(true)}
                className="text-white hover:text-cyan-400 pb-1 transition-colors relative group"
              >
                <UserIcon size={22} strokeWidth={2.5} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full scale-0 group-hover:scale-100 transition-transform shadow-[0_0_10px_#00f2ff]"></span>
              </button>
              <button
                onClick={() => setShowAdmin(true)}
                className="text-white hover:text-orange-400 pb-1 transition-colors group relative"
              >
                <Briefcase size={22} strokeWidth={2.5} />
              </button>
            </div>

            {/* Buscador Desplegable (Gymshark style search) */}
            <AnimatePresence>
              {showSearch && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-full left-0 w-full bg-[#000810]/95 backdrop-blur-3xl p-6 md:p-10 border-t border-white/5"
                >
                  <div className="max-w-4xl mx-auto relative group">
                    <input
                      type="text"
                      autoFocus
                      placeholder="INTRODUCIR DIRECCIÓN PARA AUDITORÍA..."
                      className="w-full bg-white/5 border-b border-white/20 px-4 py-6 text-xl md:text-3xl font-black tracking-tighter text-cyan-400 placeholder:text-white/10 uppercase focus:outline-none focus:border-cyan-400 transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch(e);
                          setShowSearch(false);
                        }
                      }}
                    />
                    <button
                      onClick={() => setShowSearch(false)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      <X size={32} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </header>

          <div className="flex flex-col lg:flex-row h-full relative">

            {/* Mapa: En móvil es una sección fija, en desktop es el fondo completo */}
            <section className="order-1 lg:order-none relative w-full h-[50vh] lg:h-full lg:absolute lg:inset-0 lg:z-0 border-y lg:border-none border-white/5">
              <MapComponent
                center={mapCenter}
                markerPos={markerPos}
                onMapClick={handleMapClick}
              />
            </section>

            {/* Contenedor Flex para Sidebars en Desktop y Stack Scrollable en Mobile */}
            <div className="order-2 lg:order-none relative w-full lg:h-full flex flex-col lg:flex-row justify-between lg:pointer-events-none p-6 lg:p-10 gap-10 lg:gap-0">

              {/* Panel de Red e Insights (Izquierda) */}
              <aside className="relative lg:absolute left-0 lg:left-10 top-0 lg:top-32 w-full lg:w-[450px] z-[1500] pointer-events-auto flex flex-col gap-10 lg:max-h-[calc(100vh-180px)] lg:overflow-y-auto lg:custom-scrollbar lg:pr-4 mb-8 lg:mb-0">
                <section className="glass-card animate-fade-in border-l-2 border-l-[var(--accent-orange)] !py-6 !px-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[10px] tracking-[0.4em] uppercase text-white/40 font-bold">Auditoría Energética</h2>
                    <div className="w-2 h-2 rounded-full bg-[var(--accent-orange)] pulse-marker shadow-[0_0_10px_var(--accent-orange)]"></div>
                  </div>
                  <div className="mb-4 text-left">
                    <span className="text-[9px] text-white/20 block mb-1 uppercase tracking-widest">Valor de Red Actual</span>
                    <p className="text-4xl lg:text-5xl font-black tracking-tighter text-white">0.14<span className="text-xs font-light text-white/30 ml-2 italic">eur/kwh</span></p>
                  </div>
                  <div className="h-[1px] w-full bg-white/5 my-4"></div>
                  <div className="flex justify-between text-[9px] text-white/30 uppercase tracking-widest px-1">
                    <span>Compensación</span>
                    <span className="text-[var(--accent-orange)] font-bold">0.06 €/kWh</span>
                  </div>
                </section>

                <section className="glass-card animate-fade-in !p-6" style={{ animationDelay: '0.2s' }}>
                  <SmartInsights results={results} />
                </section>

                <section className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                  <ConsumptionChart />
                </section>
              </aside>

              {/* Contenedor de Resultado (Derecha) */}
              <div className="relative lg:absolute right-0 lg:right-10 top-0 lg:top-32 w-full lg:w-auto z-[1500] pointer-events-auto">
                <AnimatePresence>
                  {results && (
                    <ResultCard results={results} onClose={() => setResults(null)} />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Footer HUD (Visible al final del scroll en móvil o fijo en desktop) */}
          <footer className="relative lg:absolute bottom-0 left-0 w-full bg-[#00050a] lg:bg-transparent py-10 lg:py-10 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center md:items-end gap-6 z-[2000] border-t lg:border-none border-white/5">
            <div className="text-[8px] md:text-[9px] tracking-[0.4em] md:tracking-[0.6em] text-white/10 uppercase font-light text-center md:text-left max-w-sm leading-relaxed font-montserrat hidden sm:block">
              Consultoria.Martin • Central Intelligence <br />
              <span className="text-[6px] tracking-[0.2em] text-white/5">Modo de Inspección Estricta: Solo Direcciones Validadas.</span>
            </div>

            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
              <button
                onClick={() => setShowPrivacy(true)}
                className="text-[9px] md:text-[10px] tracking-[0.3em] md:tracking-[0.4em] text-white/30 uppercase font-bold hover:text-cyan-400 transition-colors"
              >
                Privacidad
              </button>
              <button
                onClick={() => setShowTerms(true)}
                className="text-[9px] md:text-[10px] tracking-[0.3em] md:tracking-[0.4em] text-white/30 uppercase font-bold hover:text-cyan-400 transition-colors"
              >
                Condiciones
              </button>
            </div>
          </footer>

        </motion.main>
      )}

      {/* Modales Globales (Accesibles desde cualquier sitio) */}
      <AdminDashboard isOpen={showAdmin} onClose={() => setShowAdmin(false)} />
      <UserDashboard isOpen={showUserDashboard} onClose={() => setShowUserDashboard(false)} />
      <Terms isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <Privacy isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />

      <style jsx="true">{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  )
}

export default App
