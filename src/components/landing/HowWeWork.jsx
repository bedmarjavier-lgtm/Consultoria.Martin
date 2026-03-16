import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const steps = [
    {
        number: '01',
        icon: '🛰️',
        title: 'Análisis LiDAR',
        subtitle: 'Escaneo de Precisión',
        desc: 'Nuestra IA analiza la geometría exacta de tu tejado mediante datos LiDAR satelitales. Calculamos orientación, inclinación y metros cuadrados reales disponibles — sin necesidad de visita técnica.',
        tag: 'Tecnología NASA',
        color: 'from-cyan-500/20 to-cyan-500/5',
        border: 'border-cyan-500/30',
        accent: '#00f2ff',
    },
    {
        number: '02',
        icon: '📊',
        title: 'Simulación Real',
        subtitle: 'Precios de Mercado Actuales',
        desc: 'Cruzamos tu perfil de consumo con los precios OMIE/ESIOS en tiempo real. El resultado: una proyección exacta de tu ahorro anual, tiempo de amortización y excedentes a red.',
        tag: 'Datos oficiales REE',
        color: 'from-orange-500/20 to-orange-500/5',
        border: 'border-orange-500/30',
        accent: '#ff8c42',
    },
    {
        number: '03',
        icon: '⚡',
        title: 'Instalación Smart',
        subtitle: 'Red de Instaladores Certificados',
        desc: 'Te conectamos con los mejores instaladores de tu provincia, homologados por el MITERD. Tú solo firmas — nosotros gestionamos permisos, tramitación de bonificaciones y puesta en marcha.',
        tag: 'Garantía 25 años',
        color: 'from-green-500/20 to-green-500/5',
        border: 'border-green-500/30',
        accent: '#22c55e',
    },
];

export default function HowWeWork() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section
            id="metodologia"
            ref={ref}
            aria-labelledby="how-heading"
            className="relative py-24 md:py-36 px-4 md:px-12 overflow-hidden"
        >
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl" />
            </div>

            <div className="max-w-6xl mx-auto relative">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-20"
                >
                    <p className="text-[10px] font-black tracking-[0.5em] text-cyan-400 uppercase mb-4">
                        Metodología Exclusiva
                    </p>
                    <h2 id="how-heading" className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase mb-4"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Cómo <span className="text-orange-gradient">Trabajamos</span>
                    </h2>
                    <p className="text-white/40 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                        Un proceso transparente, basado en datos reales, sin compromisos y sin sorpresas en la factura.
                    </p>
                </motion.div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">
                    {/* Connector line (desktop) */}
                    <div className="hidden md:block absolute top-16 left-[16.7%] right-[16.7%] h-[1px] bg-gradient-to-r from-cyan-500/20 via-orange-500/20 to-green-500/20" />

                    {steps.map((step, i) => (
                        <motion.article
                            key={step.number}
                            initial={{ opacity: 0, y: 40 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.15 * i + 0.2 }}
                            className={`relative bg-gradient-to-b ${step.color} border ${step.border} rounded-3xl p-8 group hover:-translate-y-2 transition-transform duration-500`}
                        >
                            {/* Step number badge */}
                            <div className="flex items-center justify-between mb-6">
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black"
                                    style={{ background: `${step.accent}15`, border: `1px solid ${step.accent}40`, color: step.accent }}
                                >
                                    {step.number}
                                </div>
                                <span className="text-3xl">{step.icon}</span>
                            </div>

                            <h3 className="text-xl font-black text-white tracking-tight mb-1"
                                style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                {step.title}
                            </h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: step.accent }}>
                                {step.subtitle}
                            </p>
                            <p className="text-white/50 text-sm leading-relaxed mb-6">
                                {step.desc}
                            </p>

                            {/* Tag */}
                            <div
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest"
                                style={{ background: `${step.accent}10`, border: `1px solid ${step.accent}20`, color: step.accent }}
                            >
                                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: step.accent }} />
                                {step.tag}
                            </div>

                            {/* Hover shimmer */}
                            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                style={{ boxShadow: `inset 0 0 40px ${step.accent}08` }} />
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
