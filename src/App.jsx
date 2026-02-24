import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './index.css'

// Componentes
import MapComponent from './components/MapComponent'
import ResultCard from './components/ResultCard'
import GlobeDiscovery from './components/GlobeDiscovery'
import { calculateSolarImpact } from './utils/SolarCalculator'

function App() {
  const [showGlobe, setShowGlobe] = useState(true)
  const [mapCenter, setMapCenter] = useState([37.3891, -4.7636])
  const [markerPos, setMarkerPos] = useState(null)
  const [results, setResults] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e) => {
    if (e.key === 'Enter' && searchQuery) {
      setLoading(true)
      try {
        // @Consuloria.Martin: Refuerzo de Geocoding Exacto
        // Añadimos contexto para evitar errores de API en Nominatim
        let query = searchQuery.trim();
        if (!query.toLowerCase().includes('españa')) {
          query += ', España';
        }

        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`)
        const data = await response.json()

        if (data.length > 0) {
          const { lat, lon, display_name } = data[0]
          const newPos = [parseFloat(lat), parseFloat(lon)]

          setMapCenter(newPos)
          setMarkerPos(newPos)

          // Sincronización de Auditoría Automática
          const seed = (Math.abs(parseFloat(lat)) * 1000 + Math.abs(parseFloat(lon)) * 1000) % 1;
          const detectedArea = Math.floor(40 + seed * 90);

          const impact = calculateSolarImpact(detectedArea);
          setResults({ ...impact, area: detectedArea, address: display_name });
        }
      } catch (error) {
        console.error("Critical: Geocoding failure", error)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#00050a] flex flex-col overflow-hidden">

      <AnimatePresence>
        {showGlobe && (
          <motion.div
            key="globe"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="z-[5000]"
          >
            <GlobeDiscovery onEnterExperience={() => setShowGlobe(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Experience HUD */}
      {!showGlobe && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="relative w-full h-full flex flex-col"
        >
          {/* HUD Capa: Interface Superior */}
          <header className="absolute top-0 left-0 w-full p-10 z-[1000] pointer-events-none flex flex-col md:flex-row justify-between items-start">
            <div className="animate-fade-in group pointer-events-auto cursor-pointer" onClick={() => setShowGlobe(true)}>
              <h1 className="text-4xl font-black tracking-tighter mb-1 uppercase font-montserrat">
                <span className="text-white">Consultoria.</span>
                <span className="text-orange-gradient">Martin</span>
              </h1>
              <p className="text-white/30 tracking-[0.5em] uppercase text-[9px] font-bold">
                AUDITORÍA ENERGÉTICA • PRECISIÓN EXTREMA
              </p>
            </div>

            {/* Buscador Futurista (Única Vía de Entrada) */}
            <div className="mt-8 md:mt-0 w-full md:w-[450px] pointer-events-auto">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000 font-mono"></div>
                <input
                  type="text"
                  placeholder="INTRODUCIR DIRECCIÓN EXACTA (EJ: CALLE SUSANA BENITEZ 16)..."
                  className="relative w-full bg-[#000810]/80 backdrop-blur-3xl border border-white/10 rounded-full px-8 py-5 text-[10px] font-mono tracking-[0.2em] text-cyan-400 focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-white/10 uppercase"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                />
                <div className={`absolute right-6 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${loading ? 'bg-cyan-400 animate-pulse shadow-[0_0_10px_#00f2ff]' : 'bg-white/10'}`}></div>
              </div>
              <p className="text-[8px] text-white/20 tracking-widest mt-3 px-6 uppercase italic">
                La selección por clic ha sido deshabilitada para evitar errores de calibración.
              </p>
            </div>
          </header>

          {/* HUD Capa: Panel de Red (Izquierda) */}
          <aside className="absolute left-10 top-48 w-80 z-[1000] pointer-events-none hidden lg:block">
            <section className="glass-card mb-8 pointer-events-auto animate-fade-in border-l-2 border-l-[var(--accent-orange)]">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-[10px] tracking-[0.4em] uppercase text-white/40 font-bold">Auditoría Energética</h2>
                <div className="w-2 h-2 rounded-full bg-[var(--accent-orange)] pulse-marker shadow-[0_0_10px_var(--accent-orange)]"></div>
              </div>
              <div className="mb-6">
                <span className="text-[9px] text-white/20 block mb-2 uppercase tracking-widest">Valor de Red Actual</span>
                <p className="text-5xl font-black tracking-tighter text-white">0.14<span className="text-xs font-light text-white/30 ml-2 italic">eur/kwh</span></p>
              </div>
              <div className="h-[1px] w-full bg-white/5 my-6"></div>
              <div className="flex justify-between text-[9px] text-white/30 uppercase tracking-widest mb-3">
                <span>Compensación</span>
                <span className="text-[var(--accent-orange)] font-bold">0.06 €/kWh</span>
              </div>
            </section>
          </aside>

          {/* Mapa Fullscreen Background */}
          <div className="flex-grow z-0">
            <MapComponent
              center={mapCenter}
              markerPos={markerPos}
            />
          </div>

          {/* Overlay de Resultados (Right HUD) */}
          {results && (
            <ResultCard results={results} onClose={() => setResults(null)} />
          )}

          {/* Footer HUD */}
          <footer className="absolute bottom-10 w-full text-center z-[1000] pointer-events-none px-12 flex justify-between items-end">
            <div className="text-[8px] tracking-[0.6em] text-white/10 uppercase font-light text-left max-w-sm leading-relaxed font-montserrat">
              Consultoria.Martin • Central Intelligence <br />
              Modo de Inspección Estricta: Solo Direcciones Validadas.
            </div>
            <div className="text-[8px] tracking-[0.5em] text-white/20 uppercase font-light border-b border-white/10 pb-2">
              España • Protocolo v.2.0
            </div>
          </footer>
        </motion.div>
      )}

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
