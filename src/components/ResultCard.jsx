import React from 'react';
import AuditForm from './AuditForm';

const ResultCard = ({ results, onClose }) => {
    if (!results) return null;

    const maxValue = Math.max(...results.chartData.map(d => d.value));

    return (
        <div className="fixed right-8 top-40 w-[420px] z-[2000] animate-slide-in max-h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar">
            <div className="glass-card p-8 border-white/10 relative overflow-hidden">
                {/* Scanline Effect */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-400/30 animate-scan"></div>

                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h3 className="text-[10px] font-bold tracking-[0.4em] text-cyan-400 uppercase mb-1">Análisis Geometrizado</h3>
                        <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-light">Sincronizado por @Geo-Architect</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all text-sm"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-8">
                    {/* LiDAR Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/[0.04] p-5 rounded-2xl border border-white/10 shadow-lg">
                            <span className="text-[10px] uppercase text-white/40 block mb-2 tracking-widest font-bold">Superficie Útil</span>
                            <p className="text-3xl font-black tracking-tighter text-white">{results.area}<span className="text-xs text-white/40 ml-1 font-light">m²</span></p>
                        </div>
                        <div className="bg-white/[0.04] p-5 rounded-2xl border border-white/10 shadow-lg">
                            <span className="text-[10px] uppercase text-white/40 block mb-2 tracking-widest font-bold">Gen. Teórica</span>
                            <p className="text-3xl font-black tracking-tighter text-cyan-400 drop-shadow-[0_0_8px_rgba(0,242,255,0.4)]">{results.annualEnergyProduction}<span className="text-xs text-white/40 ml-1 font-light italic">kWh</span></p>
                        </div>
                    </div>

                    <div className="bg-white/[0.04] p-6 rounded-3xl border border-white/15 backdrop-blur-md">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-[11px] uppercase text-white/60 tracking-[0.2em] font-bold">Auditoría Factura</span>
                            <span className="text-[9px] bg-cyan-400 text-black px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">RD 244/2019</span>
                        </div>
                        <div className="flex justify-between text-sm mb-4 border-b border-white/5 pb-4">
                            <span className="text-white/50 font-medium">Consumo Est.</span>
                            <span className="font-black text-white text-lg">{results.estimatedConsumption} <span className="text-[10px] font-light opacity-40">kWh</span></span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-white/50 font-medium">Compensación</span>
                            <span className="font-black text-cyan-400 text-lg">0.06 <span className="text-[10px] font-light opacity-60">€/kWh</span></span>
                        </div>
                    </div>

                    {/* Savings Focus */}
                    <div className="relative py-10 text-center bg-gradient-to-b from-cyan-500/10 to-transparent rounded-3xl border border-cyan-500/20 overflow-hidden shadow-[0_0_30px_rgba(0,242,255,0.1)] mb-8">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(0,242,255,0.15)_0%,_transparent_70%)]"></div>
                        <span className="text-[11px] uppercase text-white/60 tracking-[0.5em] block mb-2 relative z-10 font-bold">Ahorro Anual Neto</span>
                        <p className="text-6xl font-black text-white relative z-10 tracking-tighter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                            <span className="text-cyan-400">+</span>{results.annualSavings}€
                        </p>
                    </div>

                    {/* Formulario de Captación */}
                    <AuditForm address={results.address} />

                    {/* Comparison Chart */}
                    <div className="space-y-5 pt-4">
                        <span className="text-[10px] uppercase text-white/20 tracking-[0.3em] block mb-2">Proyección Financiera 2026</span>
                        {results.chartData.map((item, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex justify-between text-[10px] font-medium tracking-widest uppercase">
                                    <span className="text-white/40">{item.name}</span>
                                    <span className="text-white">{item.value}€</span>
                                </div>
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full transition-all duration-1000 ease-out"
                                        style={{
                                            width: `${(item.value / maxValue) * 100}%`,
                                            backgroundColor: item.color,
                                            boxShadow: item.color.includes('f2ff') ? `0 0 10px ${item.color}50` : 'none'
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer info */}
                <p className="mt-10 text-[9px] text-white/20 italic leading-relaxed text-center font-light uppercase tracking-widest">
                    Factores de autoconsumo 40% (directo) / 60% (vertido). <br />
                    Network Scanning Active • © OceanX 2026
                </p>
            </div>

            <style jsx="true">{`
                @keyframes slide-in {
                    from { opacity: 0; transform: translateX(40px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-slide-in {
                    animation: slide-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    50% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .animate-scan {
                    animation: scan 4s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default ResultCard;
