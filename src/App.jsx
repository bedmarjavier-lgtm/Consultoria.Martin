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

      if ((isCmdOrCtrl && isAltKey && key === 'a') || (isAltKey && key === 'l')) {
        e.preventDefault();
        setShowAdmin(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setLoading(true);
    setResults(null);

    try {
      // Nominatim: Búsqueda de alta precisión
      const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1&countrycodes=es`;

      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: { 'Accept-Language': 'es' }
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      if (data && data.length > 0) {
        // Algoritmo de selección: Priorizar números de portal y edificios
        const preciseResult = data.find(item =>
          (item.class === 'building' || item.address.house_number) &&
          item.type !== 'administrative'
        ) || data[0];

        const lat = parseFloat(preciseResult.lat);
        const lon = parseFloat(preciseResult.lon);

        setMarkerPos([lat, lon]);
        setMapCenter([lat, lon]);

        const roundedLat = Math.round(lat * 10000) / 10000;
        const roundedLon = Math.round(lon * 10000) / 10000;
        const seed = (Math.abs(roundedLat) * 1000 + Math.abs(roundedLon) * 1000) % 1;
        const detectedArea = Math.floor(40 + seed * 90);
        const randomPrice = 0.14 + (Math.random() * 0.05);
        const impact = calculateSolarImpact(detectedArea, randomPrice);

        const finalResult = { ...impact, area: detectedArea, address: preciseResult.display_name };

        // Timeout para que el usuario perciba que algo ha pasado
        setTimeout(() => {
          setResults(finalResult);
          setShowSearch(false);
          toast.success("Ubicación Encontrada");
        }, 300);

        if (session) {
          saveAnalysis(finalResult);
        }
      } else {
        toast.error("Sin resultados. Prueba: Calle, Número, Ciudad.");
      }
    } catch (error) {
      console.error("Geocoding failure", error);
      toast.error("Error en la conexión. Reintenta.");
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = async (coords) => {
    setLoading(true)
    setMapCenter(coords)
    setMarkerPos(coords)
    try {
      const [lat, lon] = coords
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
      const data = await response.json()
      const address = data.display_name || `Coordenadas: ${lat.toFixed(4)}, ${lon.toFixed(4)}`

      const roundedLat = Math.round(lat * 10000) / 10000;
      const roundedLon = Math.round(lon * 10000) / 10000;
      const seed = (Math.abs(roundedLat) * 1000 + Math.abs(roundedLon) * 1000) % 1;
      const detectedArea = Math.floor(40 + seed * 90)
      const randomPrice = 0.14 + (Math.random() * 0.05)
      const impact = calculateSolarImpact(detectedArea, randomPrice)

      const finalResult = { ...impact, area: detectedArea, address };
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
    setMapCenter([37.3891, -4.7636]);
    setSearchQuery('');
    setLoading(false);
    setShowSearch(false);
    setShowUserDashboard(false); // Clear user dashboard state
    setShowAdmin(false); // Clear admin dashboard state
    setShowTerms(false); // Clear terms state
    setShowPrivacy(false); // Clear privacy state
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
        full_name: session.user.user_metadata?.full_name || 'Consultor OceanX'
      }, { onConflict: 'id' });

      toast.success(`Sincronización Completa: ${data.address.split(',')[0]}`);
    } catch (error) {
      console.error('Error in unified sync:', error);
    }
  }, [session]);

  useEffect(() => {
    if (results && results.address) {
      saveAnalysis(results);
    }
  }, [results, saveAnalysis]);

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
              {!session && (
                <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6 bg-black/20 text-black">
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
              <MapComponent center={mapCenter} markerPos={markerPos} onMapClick={handleMapClick} isMobile={isMobile} />
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
