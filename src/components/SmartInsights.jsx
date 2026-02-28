import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, ShieldCheck } from 'lucide-react';

const SmartInsights = ({ results }) => {
    // Generación dinámica de alertas basadas en resultados reales
    const dynamicAlerts = useMemo(() => {
        const list = [];

        if (!results) {
            return [{
                id: 'idle',
                type: 'PREVENTIVE',
                title: 'Esperando Auditoría',
                desc: 'Introduce una dirección para activar el motor de análisis en tiempo real.',
                icon: <ShieldCheck className="w-4 h-4" />,
                color: 'text-white/40',
                bgColor: 'bg-white/5',
                borderColor: 'border-white/10'
            }];
        }

        // 1. Alerta Crítica: Sobreprecio de mercado
        if (results.priceAnomaly) {
            list.push({
                id: 'anomaly',
                type: 'CRITICAL',
                title: 'Anomalía Detectada',
                desc: `Tu precio actual (${results.currentPrice.toFixed(3)}€) es un 15%+ superior al mercado (${results.marketPrice}€).`,
                icon: <AlertTriangle className="w-4 h-4" />,
                color: 'text-red-400',
                bgColor: 'bg-red-400/10',
                borderColor: 'border-red-400/20'
            });
        }

        // 2. Alerta Oportunidad: Potencial de ahorro solar
        if (results.annualSavings > 1000) {
            list.push({
                id: 'saving',
                type: 'OPPORTUNITY',
                title: 'Potencial de Ahorro Extremo',
                desc: `Con ${results.area}m² de superficie, puedes generar ${results.annualEnergyProduction}kWh anuales.`,
                icon: <TrendingUp className="w-4 h-4" />,
                color: 'text-cyan-400',
                bgColor: 'bg-cyan-400/10',
                borderColor: 'border-cyan-400/20'
            });
        }

        // 3. Alerta Preventiva: Recomendación horaria
        list.push({
            id: 'schedule',
            type: 'PREVENTIVE',
            title: 'Optimización Horaria',
            desc: 'Los picos de generación en tu zona ocurren entre las 12:00 y las 16:00. Programa tus consumos.',
            icon: <ShieldCheck className="w-4 h-4" />,
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-400/10',
            borderColor: 'border-yellow-400/20'
        });

        return list;
    }, [results]);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-[11px] font-bold tracking-[0.4em] text-white/40 uppercase">Smart Insights</h3>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${results ? 'bg-cyan-400 text-black' : 'bg-white/5 text-white/40'}`}>
                    {results ? 'Análisis Activo' : 'Standby Mode'}
                </span>
            </div>

            <div className="space-y-3">
                {dynamicAlerts.map((alert, idx) => (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`p-4 rounded-2xl border ${alert.borderColor} ${alert.bgColor} backdrop-blur-md group cursor-pointer hover:border-white/30 transition-all`}
                    >
                        <div className="flex gap-4 items-start">
                            <div className={`${alert.color} mt-0.5 transition-transform group-hover:scale-110 duration-300`}>
                                {alert.icon}
                            </div>
                            <div>
                                <h4 className={`text-[13px] font-black uppercase tracking-widest ${alert.color} mb-1`}>
                                    {alert.title}
                                </h4>
                                <p className="text-[11px] text-white/60 leading-relaxed font-medium">
                                    {alert.desc}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default SmartInsights;
