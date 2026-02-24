import React, { useEffect, useRef, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { motion, AnimatePresence } from 'framer-motion';

const communities = [
    { name: 'Andalucía', lat: 37.544, lng: -4.727, zoom: 7, desc: 'Potencial solar extremo. Líder en fotovoltaica.' },
    { name: 'Madrid', lat: 40.416, lng: -3.703, zoom: 8, desc: 'Eficiencia urbana y comunidades energéticas.' },
    { name: 'Cataluña', lat: 41.591, lng: 1.520, zoom: 7, desc: 'Innovación en autoconsumo industrial.' },
    { name: 'Valencia', lat: 39.484, lng: -0.376, zoom: 7, desc: 'Clima óptimo para flujos continuos.' },
    { name: 'Galicia', lat: 42.575, lng: -8.133, zoom: 7, desc: 'Optimización en baja radiación.' }
];

const GlobeDiscovery = ({ onEnterExperience }) => {
    const globeRef = useRef();
    const [currentCommunity, setCurrentCommunity] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Geo-Architect: Sincronización de Coordenadas de España
    useEffect(() => {
        if (globeRef.current) {
            globeRef.current.controls().enableZoom = false;
            globeRef.current.pointOfView({ lat: 40, lng: -3, altitude: 2.5 }, 2000);
        }
    }, []);

    const handleScroll = (e) => {
        if (isTransitioning) return;

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
            <div className="absolute inset-0 opacity-60 pointer-events-none">
                <Globe
                    ref={globeRef}
                    globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
                    atmosphereColor="#00f2ff"
                    atmosphereAltitude={0.35}
                    backgroundColor="rgba(0,0,0,0)"
                />
            </div>

            <div className="relative z-10 text-center px-10 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <div className="flex flex-col items-center mb-16">
                        <div className="w-16 h-16 rounded-full border border-[var(--accent-orange)]/30 flex items-center justify-center mb-6">
                            <div className="w-8 h-8 rounded-full border-2 border-[var(--accent-orange)] animate-pulse shadow-[0_0_15px_var(--accent-orange)]"></div>
                        </div>
                        <span className="text-[10px] tracking-[1em] text-[var(--accent-orange)]/50 uppercase font-light font-montserrat">Auditoría Energética de Precisión</span>
                    </div>

                    <h1 className="font-montserrat text-7xl font-bold text-white mb-6 uppercase tracking-tighter">
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
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-12 flex flex-col items-center gap-4 opacity-30 animate-bounce">
                <span className="text-[10px] tracking-[0.5em] uppercase font-light text-white">Scroll to Explore</span>
                <div className="w-[1px] h-10 bg-gradient-to-b from-white to-transparent"></div>
            </div>
        </div>
    );
};

export default GlobeDiscovery;
