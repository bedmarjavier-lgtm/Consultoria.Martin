import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';

const testimonials = [
    {
        name: 'Carlos Ruiz',
        type: 'Empresa',
        role: 'Director de Operaciones, Muebles Ruiz',
        quote: 'Gracias a la consultoría energética de Martín, identificamos penalizaciones por energía reactiva que no conocíamos. Ahora ahorramos más de 4.000€ anuales y tenemos un sistema fotovoltaico rindiendo al 100%.',
        rating: 5,
        location: 'Sevilla'
    },
    {
        name: 'Laura Gómez',
        type: 'Residencial',
        role: 'Propietaria Vivienda Unifamiliar',
        quote: 'Como consultoría, Martín me dio la confianza que ninguna instaladora supo darme. El análisis LiDAR clavó la producción exacta de mis 8 paneles solares. Amortización real en menos de 5 años.',
        rating: 5,
        location: 'Córdoba'
    },
    {
        name: 'Antonio López',
        type: 'Comunidad',
        role: 'Presidente de Comunidad',
        quote: 'Una consultora energética que de verdad vela por el cliente. Estudiaron nuestros gastos en zonas comunes y gestionaron la instalación compartida. Trato directo y muy profesional.',
        rating: 5,
        location: 'Málaga'
    }
];

export default function InteractiveClients() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });
    const [activeIndex, setActiveIndex] = useState(0);

    // Auto-play
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((current) => (current + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section
            id="casos-exito"
            ref={ref}
            aria-labelledby="clients-heading"
            className="relative py-24 md:py-36 px-4 md:px-12 overflow-hidden mx-auto max-w-6xl"
        >
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[800px] h-[300px] bg-cyan-700/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7 }}
                className="text-center mb-16 relative z-10"
            >
                <p className="text-[10px] font-black tracking-[0.5em] text-cyan-400 uppercase mb-4">
                    Casos Reales
                </p>
                <h2 id="clients-heading" className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase mb-4"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Casos de <span className="text-orange-gradient">Éxito</span>
                </h2>
                <p className="text-white/40 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                    Descubre cómo nuestra consultoría energética ha ayudado a particulares y empresas a optimizar su consumo.
                </p>
            </motion.div>

            <div className="relative mt-12 z-10 flex flex-col items-center">
                <div className="relative w-full max-w-3xl min-h-[250px] bg-white/[0.03] border border-white/10 rounded-3xl p-8 md:p-12 mb-8 shadow-2xl backdrop-blur-sm transition-all duration-300">
                    <div className="absolute top-4 right-6 text-5xl text-cyan-500/20 font-serif">"</div>
                    {testimonials.map((test, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: activeIndex === index ? 1 : 0, x: activeIndex === index ? 0 : -20, pointerEvents: activeIndex === index ? 'auto' : 'none' }}
                            transition={{ duration: 0.5 }}
                            className={`${activeIndex === index ? 'relative' : 'absolute inset-0 hidden'} flex flex-col justify-center h-full`}
                        >
                            <p className="text-white/80 text-lg md:text-xl md:leading-relaxed mb-6 italic">"{test.quote}"</p>
                            <div className="flex items-center gap-4 mt-auto">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-600 to-blue-800 flex items-center justify-center text-white font-bold text-lg">
                                    {test.name.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white font-black uppercase text-sm">{test.name}</span>
                                    <span className="text-white/40 text-[10px] uppercase tracking-wider">{test.role} • {test.location}</span>
                                </div>
                                <div className="ml-auto flex gap-1 text-cyan-400 text-sm">
                                    {'★'.repeat(test.rating)}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="flex gap-4">
                    {testimonials.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveIndex(idx)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${activeIndex === idx ? 'bg-cyan-400 scale-125 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'bg-white/20 hover:bg-white/40'}`}
                            aria-label={`Ver testimonio ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
