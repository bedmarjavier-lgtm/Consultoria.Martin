import React from 'react';
import { motion } from 'framer-motion';

const BuildingScan3D = ({ address, area }) => {
    // Simulación de vista 3D del exterior
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            className="absolute bottom-12 right-10 w-96 h-64 z-[2000] glass-card !p-0 overflow-hidden border-cyan-500/40 shadow-[0_0_50px_rgba(0,242,255,0.15)] pointer-events-auto"
        >
            <div className="absolute top-0 left-0 w-full p-4 z-20 bg-gradient-to-b from-black/90 to-transparent flex justify-between items-start">
                <div>
                    <h4 className="text-[10px] font-black tracking-[0.4em] text-cyan-400 uppercase">Inspección Exterior 3D</h4>
                    <p className="text-[8px] text-white/50 border-l border-cyan-500/30 pl-2 mt-1 uppercase tracking-tighter">
                        Análisis de Fachada • @Geo-Architect
                    </p>
                </div>
                <div className="text-right">
                    <span className="text-[8px] text-cyan-400/60 uppercase block">LiDAR Link</span>
                    <span className="text-[10px] font-mono text-white tracking-widest">SYNC: OK</span>
                </div>
            </div>

            <div className="w-full h-full bg-[#000810] relative flex items-center justify-center">
                {/* Simulación de vista exterior de alta resolución */}
                <div className="absolute inset-0 grayscale-[0.2] contrast-[1.1]">
                    <img
                        src={`https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80`}
                        className="w-full h-full object-cover opacity-60"
                        alt="Building exterior"
                    />
                    <div className="absolute inset-0 bg-cyan-900/10 mix-blend-overlay"></div>
                </div>

                {/* HUD Crosshair */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-20 h-20 border border-cyan-400/20 rounded-full flex items-center justify-center">
                        <div className="w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_10px_#00f2ff]"></div>
                    </div>
                    <div className="absolute w-full h-[0.5px] bg-cyan-400/10"></div>
                    <div className="absolute h-full w-[0.5px] bg-cyan-400/10"></div>
                </div>
            </div>

            {/* Info Badge */}
            <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-1">
                <p className="text-[9px] font-mono text-cyan-400 bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-cyan-400/20 uppercase tracking-widest">
                    {address?.split(',')[0]}
                </p>
                <p className="text-[8px] text-white/40 tracking-[0.2em] px-2 italic font-light lowercase">
                    coordenadas verificadas vía osm nodes
                </p>
            </div>

            {/* Scanline Effect */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-400/50 animate-scan z-30"></div>
        </motion.div>
    );
};

export default BuildingScan3D;
