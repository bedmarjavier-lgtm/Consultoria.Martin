import { useRef, useEffect, useState } from 'react';
import Globe from 'react-globe.gl';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Check } from 'lucide-react';

const communities = [
    { name: 'Andalucía', lat: 37.544, lng: -4.727, zoom: 7, desc: 'Potencial solar extremo. Líder en fotovoltaica.' },
    { name: 'Madrid', lat: 40.416, lng: -3.703, zoom: 8, desc: 'Eficiencia urbana y comunidades energéticas.' },
    { name: 'Cataluña', lat: 41.591, lng: 1.520, zoom: 7, desc: 'Innovación en autoconsumo industrial.' },
    { name: 'Valencia', lat: 39.484, lng: -0.376, zoom: 7, desc: 'Clima óptimo para flujos continuos.' },
    { name: 'Galicia', lat: 42.575, lng: -8.133, zoom: 7, desc: 'Optimización en baja radiación.' }
];

const GlobeDiscovery = ({ onEnterExperience, onShowTerms, onShowPrivacy, isBlurred, isZooming }) => {
    const globeRef = useRef();
    const [currentCommunity, setCurrentCommunity] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });
    const [copied, setCopied] = useState(false);

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Manejar redimensionado de ventana para el globo
    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Geo-Architect: Sincronización de Coordenadas de España (Ajustado para Zoom-In)
    useEffect(() => {
        if (globeRef.current) {
            globeRef.current.controls().enableZoom = false;
            // Estado inicial desde el espacio lejano
            globeRef.current.pointOfView({ lat: 40, lng: -3, altitude: isBlurred ? 4.5 : 2.5 }, 0);
        }
    }, [isBlurred]);

    useEffect(() => {
        if (globeRef.current && isZooming) {
            // Efecto Zoom-In Orbital al identificar
            globeRef.current.pointOfView({ lat: 40, lng: -3, altitude: 1.5 }, 2000);
        }
    }, [isZooming]);

    const handleScroll = (e) => {
        if (isTransitioning || isBlurred) return; // Bloquear scroll si está borroso (login)

        if (e.deltaY > 0) {
            if (currentCommunity < communities.length - 1) {
                setIsTransitioning(true);
                const next = currentCommunity + 1;
                setCurrentCommunity(next);
                globeRef.current.pointOfView({
                    lat: communities[next].lat,
                    lng: communities[next].lng,
                    altitude: 1.5
                }, 1200);
                setTimeout(() => setIsTransitioning(false), 1200);
            }
        } else {
            if (currentCommunity > 0) {
                setIsTransitioning(true);
                const prev = currentCommunity - 1;
                setCurrentCommunity(prev);
                globeRef.current.pointOfView({
                    lat: communities[prev].lat,
                    lng: communities[prev].lng,
                    altitude: 1.5
                }, 1200);
                setTimeout(() => setIsTransitioning(false), 1200);
            }
        }
    };

    return (
        <div
            className="fixed inset-0 z-[5000] bg-[#00050a] flex flex-col items-center justify-center overflow-hidden"
            onWheel={handleScroll}
        >
            <div className={`absolute inset-0 transition-all duration-2000 ${isBlurred ? 'blur-2xl scale-110 opacity-30' : 'opacity-80'}`}>
                <Globe
                    ref={globeRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                    bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                    atmosphereColor="#00f2ff"
                    atmosphereAltitude={0.15}
                    backgroundColor="rgba(0,0,0,0)"
                    showStars={true}
                    starRadius={0.4}
                    starColor={() => "#ffffff"}
                />
                <div className="absolute inset-0 bg-radial-gradient pointer-events-none"></div>
            </div>

            {!isBlurred && (
                <>
                    <div className="relative z-10 text-center px-10 max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                        >
                            <div className="flex flex-col items-center mb-10 md:mb-16">
                                <span className="text-[8px] md:text-[10px] tracking-[0.5em] md:tracking-[1em] text-white/50 uppercase font-light font-montserrat px-4">Auditoría Energética de Precisión</span>
                            </div>

                            <h1 className="font-montserrat text-4xl md:text-7xl font-bold text-white mb-6 uppercase tracking-tighter">
                                Consultoria.<span className="text-orange-gradient">Martin</span>
                            </h1>

                            <div className="h-32 mb-12">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentCommunity}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-4"
                                    >
                                        <h2 className="text-3xl font-light text-cyan-400 tracking-[0.3em] uppercase">
                                            {communities[currentCommunity].name}
                                        </h2>
                                        <p className="text-white/40 text-sm tracking-widest font-light italic">
                                            {communities[currentCommunity].desc}
                                        </p>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            <button
                                onClick={onEnterExperience}
                                className="group relative px-12 py-5 rounded-full overflow-hidden transition-all hover:scale-105"
                            >
                                <div className="absolute inset-0 bg-white opacity-10 group-hover:opacity-20 transition-opacity"></div>
                                <div className="absolute inset-0 border border-white/20 rounded-full"></div>
                                <span className="relative text-white tracking-[0.5em] text-xs font-bold uppercase transition-spacing group-hover:tracking-[0.7em]">
                                    Enter Experience
                                </span>
                            </button>

                            {/* Partners Section */}
                            <div className="mt-10 md:mt-20 pt-10 border-t border-white/5 px-4">
                                <p className="text-[7px] md:text-[8px] tracking-[0.4em] text-white/20 uppercase font-black mb-6 md:mb-8 text-center">Nuestros Aliados Estratégicos</p>
                                <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-6 md:gap-12 opacity-30 grayscale hover:opacity-60 transition-opacity duration-700">
                                    <div className="flex flex-col items-center min-w-[80px]">
                                        <span className="text-[10px] md:text-sm font-bold tracking-tighter text-white">AUDAX</span>
                                        <div className="w-6 md:w-8 h-[1px] bg-orange-500 mt-1"></div>
                                    </div>
                                    <div className="flex flex-col items-center min-w-[80px]">
                                        <span className="text-[10px] md:text-sm font-bold tracking-tighter text-white">ENDESA</span>
                                        <div className="w-6 md:w-8 h-[1px] bg-blue-500 mt-1"></div>
                                    </div>
                                    <div className="flex flex-col items-center min-w-[80px]">
                                        <span className="text-[10px] md:text-sm font-bold tracking-tighter text-white">IBERDROLA</span>
                                        <div className="w-6 md:w-8 h-[1px] bg-green-500 mt-1"></div>
                                    </div>
                                    <div className="flex flex-col items-center min-w-[80px]">
                                        <span className="text-[10px] md:text-sm font-bold tracking-tighter text-white">TOTALENERGY</span>
                                        <div className="w-6 md:w-8 h-[1px] bg-red-500 mt-1"></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-16 flex flex-col items-center gap-4 opacity-30 animate-bounce">
                        <span className="text-[10px] tracking-[0.5em] uppercase font-light text-white">Scroll to Explore</span>
                        <div className="w-[1px] h-10 bg-gradient-to-b from-white to-transparent"></div>
                    </div>

                    {/* Landing Footer Legal */}
                    <div className="absolute bottom-6 right-12 flex gap-8 z-20">
                        <button
                            onClick={onShowPrivacy}
                            className="text-[8px] md:text-[10px] tracking-[0.4em] md:tracking-[0.8em] text-white/50 uppercase font-bold hover:text-white transition-colors"
                        >
                            Privacidad
                        </button>
                        <button
                            onClick={onShowTerms}
                            className="text-[8px] md:text-[10px] tracking-[0.4em] md:tracking-[0.8em] text-white/50 uppercase font-bold hover:text-white transition-colors"
                        >
                            Condiciones
                        </button>
                    </div>

                    {/* Share Button (Bottom Left) */}
                    <div className="absolute bottom-6 left-12 z-20">
                        <button
                            onClick={handleCopyUrl}
                            className="group flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all active:scale-95"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-3 h-3 text-green-400" />
                                    <span className="text-[8px] tracking-[0.3em] uppercase text-green-400 font-bold">Copiado</span>
                                </>
                            ) : (
                                <>
                                    <Share2 className="w-3 h-3 text-white/40 group-hover:text-white transition-colors" />
                                    <span className="text-[8px] tracking-[0.3em] uppercase text-white/40 group-hover:text-white font-bold">Compartir</span>
                                </>
                            )}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default GlobeDiscovery;
