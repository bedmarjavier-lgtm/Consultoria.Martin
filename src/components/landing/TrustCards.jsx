import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';

const stats = [
    { prefix: '€', numericValue: 2100, suffix: '', formatted: '€2.100', label: 'Ahorro medio anual', sub: 'por hogar asesorado', color: 'text-cyan-400' },
    { prefix: '', numericValue: 98, suffix: '%', formatted: '98%', label: 'Clientes satisfechos', sub: 'según encuesta post-servicio', color: 'text-cyan-400' },
    { prefix: '<', numericValue: 48, suffix: 'h', formatted: '<48h', label: 'Tiempo de análisis', sub: 'desde solicitud a informe', color: 'text-orange-400' },
    { prefix: '', numericValue: 0, suffix: '€', formatted: '0€', label: 'Consulta inicial', sub: 'sin letra pequeña', color: 'text-cyan-400' },
];

const cards = [
    {
        icon: '🛡️',
        title: 'Garantía de Resultado',
        desc: 'Si nuestro análisis LiDAR no detecta ahorro potencial en tu instalación, te lo decimos antes de cobrar un solo euro. Sin riesgos, sin compromisos.',
        highlight: 'Sin letra pequeña',
    },
    {
        icon: '👤',
        title: 'Soporte Personal de Martín',
        desc: 'Cada cliente tiene acceso directo a Martín, nuestro consultor principal. Un número real, una persona real, respuesta garantizada en menos de 4 horas hábiles.',
        highlight: 'Asesoramiento directo',
    },
    {
        icon: '📋',
        title: 'Informe Técnico Certificado',
        desc: 'Entregamos un informe detallado con cálculos de potencia, producción estimada, retorno de inversión y compatibilidad con tarifas de compensación de excedentes.',
        highlight: 'Formato oficial MITERD',
    },
    {
        icon: '🔗',
        title: 'Red de Instaladores Auditados',
        desc: 'Trabajamos solo con empresas instaladoras homologadas, con seguro de responsabilidad civil vigente y mínimo 5 años de experiencia en proyectos residenciales.',
        highlight: 'Instaladores verificados',
    },
];

// Formatea el número igual que el valor final (con puntos de miles)
function formatNumber(n, stat) {
    if (stat.prefix === '<') return `<${Math.round(n)}${stat.suffix}`;
    if (stat.suffix === '€' && stat.prefix === '') return `${Math.round(n)}€`;
    if (stat.prefix === '€') {
        const rounded = Math.round(n);
        return `€${rounded >= 1000 ? rounded.toLocaleString('es-ES') : rounded}`;
    }
    if (stat.suffix === '%') return `${Math.round(n)}%`;
    return `${stat.prefix}${Math.round(n)}${stat.suffix}`;
}

function AnimatedStat({ stat, inView, delay }) {
    const [display, setDisplay] = useState(stat.numericValue === 0 ? '0' : stat.prefix === '<' ? `<0${stat.suffix}` : `${stat.prefix}0${stat.suffix}`);
    const rafRef = useRef(null);

    useEffect(() => {
        if (!inView) return;
        if (stat.numericValue === 0) {
            // 0€ — animar de 99 a 0 (efecto "cayendo")
            const start = performance.now();
            const duration = 900;
            const from = 99;
            const to = 0;
            const tick = (now) => {
                const t = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - t, 3);
                const val = Math.round(from + (to - from) * eased);
                setDisplay(`${val}€`);
                if (t < 1) rafRef.current = requestAnimationFrame(tick);
            };
            rafRef.current = requestAnimationFrame(tick);
        } else {
            const start = performance.now();
            const duration = 1400 + delay * 200;
            const from = 0;
            const to = stat.numericValue;
            const tick = (now) => {
                const t = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - t, 3);
                const val = from + (to - from) * eased;
                setDisplay(formatNumber(val, stat));
                if (t < 1) rafRef.current = requestAnimationFrame(tick);
                else setDisplay(stat.formatted);
            };
            rafRef.current = requestAnimationFrame(tick);
        }
        return () => rafRef.current && cancelAnimationFrame(rafRef.current);
    }, [inView]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <span className={`text-3xl md:text-4xl font-black tracking-tighter tabular-nums ${stat.color}`}
            style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {display}
        </span>
    );
}

function TiltCard({ card, delay }) {
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
        const rect = cardRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = ((e.clientX - cx) / rect.width) * 12;
        const dy = ((e.clientY - cy) / rect.height) * -12;
        setTilt({ x: dx, y: dy });
    };

    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay }}
        >
            <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setTilt({ x: 0, y: 0 })}
                style={{
                    transform: `perspective(800px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
                    transition: tilt.x === 0 ? 'transform 0.6s ease' : 'transform 0.1s ease',
                }}
                className="relative h-full bg-white/[0.03] border border-white/10 rounded-3xl p-8 group cursor-default hover:border-white/20 hover:bg-white/[0.05] transition-colors duration-300 overflow-hidden"
            >
                {/* Glow on hover */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: 'radial-gradient(circle at 50% 0%, rgba(0,242,255,0.04) 0%, transparent 70%)' }} />

                <div className="text-4xl mb-5">{card.icon}</div>
                <h3 className="text-lg font-black text-white tracking-tight mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {card.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed mb-5">{card.desc}</p>
                <div className="inline-flex items-center gap-2 bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    {card.highlight}
                </div>
            </div>
        </motion.div>
    );
}

export default function TrustCards() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section
            id="garantias"
            ref={ref}
            aria-labelledby="trust-heading"
            className="relative py-24 md:py-36 px-4 md:px-12 overflow-hidden"
        >
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-3xl" />
            </div>

            <div className="max-w-6xl mx-auto">
                {/* Stats bar con animación de conteo */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-20"
                >
                    {stats.map((s, i) => (
                        <motion.div
                            key={s.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={inView ? { opacity: 1, scale: 1 } : {}}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className="text-center p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition-colors duration-300"
                        >
                            <div className="mb-1">
                                <AnimatedStat stat={s} inView={inView} delay={i} />
                            </div>
                            <div className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-1">{s.label}</div>
                            <div className="text-white/20 text-[9px]">{s.sub}</div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-center mb-14"
                >
                    <p className="text-[10px] font-black tracking-[0.5em] text-orange-400 uppercase mb-4">Nuestro Compromiso</p>
                    <h2 id="trust-heading" className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase mb-4"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Confianza <span className="text-orange-gradient">Garantizada</span>
                    </h2>
                    <p className="text-white/40 text-sm md:text-base max-w-xl mx-auto">
                        No somos un comparador. Somos tu consultor energético personal, con nombre y apellido.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {cards.map((card, i) => (
                        <TiltCard key={card.title} card={card} delay={i * 0.12 + 0.3} />
                    ))}
                </div>
            </div>
        </section>
    );
}
