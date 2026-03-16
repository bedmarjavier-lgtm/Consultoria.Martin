import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

// Custom AnimatedTestimonials component built specifically for this section
// Inspired by the provided Aceternity-style animation 
function AnimatedTestimonials({ testimonials }) {
    const [active, setActive] = useState(0);

    const handleNext = () => {
        setActive((prev) => (prev + 1) % testimonials.length);
    };

    const handlePrev = () => {
        setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const isActive = (index) => {
        return index === active;
    };

    useEffect(() => {
        const interval = setInterval(handleNext, 6000);
        return () => clearInterval(interval);
    }, []);

    const randomRotateY = () => {
        return Math.floor(Math.random() * 21) - 10;
    };

    return (
        <div className="max-w-6xl mx-auto antialiased font-sans px-4 md:px-8 lg:px-12 py-12">
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
                {/* Image Stack */}
                <div className="relative h-64 md:h-96 w-full flex items-center justify-center">
                    <AnimatePresence>
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={testimonial.src}
                                initial={{
                                    opacity: 0,
                                    scale: 0.9,
                                    z: -100,
                                    rotate: randomRotateY(),
                                }}
                                animate={{
                                    opacity: isActive(index) ? 1 : 0.4,
                                    scale: isActive(index) ? 1 : 0.95,
                                    z: isActive(index) ? 0 : -100,
                                    rotate: isActive(index) ? 0 : randomRotateY(),
                                    zIndex: isActive(index)
                                        ? 999
                                        : testimonials.length + 2 - index,
                                    y: isActive(index) ? [0, -80, 0] : 0,
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.9,
                                    z: 100,
                                    rotate: randomRotateY(),
                                }}
                                transition={{
                                    duration: 0.6,
                                    ease: "easeInOut",
                                }}
                                className="absolute inset-0 origin-bottom bg-white/[0.02] border border-white/5 p-4 rounded-3xl"
                            >
                                <div className="w-full h-full bg-black/50 rounded-2xl flex items-center justify-center p-6 backdrop-blur-md overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                                    <img
                                        src={testimonial.src}
                                        alt={testimonial.name}
                                        draggable={false}
                                        className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] rounded-xl"
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Text & Content */}
                <div className="flex flex-col justify-center h-full">
                    <motion.div
                        key={active}
                        initial={{
                            y: 20,
                            opacity: 0,
                        }}
                        animate={{
                            y: 0,
                            opacity: 1,
                        }}
                        exit={{
                            y: -20,
                            opacity: 0,
                        }}
                        transition={{
                            duration: 0.4,
                            ease: "easeInOut",
                        }}
                        className="relative"
                    >
                        <div className="absolute -top-10 -left-6 text-7xl text-cyan-500/20 font-serif z-0">
                            "
                        </div>
                        <h3 className="text-2xl md:text-4xl font-black text-white leading-tight uppercase relative z-10" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {testimonials[active].name}
                        </h3>
                        <p className="text-cyan-400 text-sm font-bold tracking-widest uppercase mt-2 relative z-10">
                            {testimonials[active].designation}
                        </p>
                        <motion.p className="text-white/60 text-lg md:text-xl mt-6 leading-relaxed relative z-10 font-light">
                            {testimonials[active].quote.split(" ").map((word, index) => (
                                <motion.span
                                    key={index}
                                    initial={{
                                        filter: "blur(4px)",
                                        opacity: 0,
                                        y: 5,
                                    }}
                                    animate={{
                                        filter: "blur(0px)",
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    transition={{
                                        duration: 0.2,
                                        ease: "easeInOut",
                                        delay: 0.02 * index,
                                    }}
                                    className="inline-block"
                                >
                                    {word}&nbsp;
                                </motion.span>
                            ))}
                        </motion.p>
                    </motion.div>
                    
                    <div className="flex gap-4 pt-10 mt-auto border-t border-white/10 md:mt-16">
                        <button
                            onClick={handlePrev}
                            className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center group transition-colors shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                        >
                            <svg className="w-5 h-5 text-white/50 group-hover:text-white transition-colors rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                        <button
                            onClick={handleNext}
                            className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-600/50 to-blue-800/50 hover:from-cyan-500 hover:to-blue-600 border border-cyan-400/30 flex items-center justify-center group transition-all shadow-[0_0_20px_rgba(0,242,255,0.2)]"
                        >
                            <svg className="w-5 h-5 text-white/80 group-hover:text-white group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const clientTestimonialsData = [
    {
        quote:
            "El ajuste de potencia y el análisis exhaustivo de nuestras facturas redujeron brutalmente los sobrecostes en fábrica. Una vez en marcha, el nuevo punto de suministro es 100% eficiente.",
        name: "Gamito",
        designation: "Industria Alimentaria",
        src: "/clientes/gamito logo.png",
    },
    {
        quote:
            "En la hostelería cada kilovatio cuenta. La auditoría LiDAR nos reveló el potencial oculto de nuestra azotea, y tras la consultoría el retorno de la inversión está siendo rapidísimo.",
        name: "La Góndola",
        designation: "Hostelería Restauración",
        src: "/clientes/gondola.jpeg",
    },
    {
        quote:
            "Excelente consultora energética. Optimizamos las tarifas de nuestras naves comerciales sin ninguna inversión inicial, y ahora tenemos mayor control en la demanda.",
        name: "SV Comercial",
        designation: "Sector Industrial Comercial",
        src: "/clientes/logo sv comercial.png",
    },
    {
        quote:
            "Hortofrutícola Valenzuela dependía de inmensos costes de almacenamiento en frío. Martín diseñó un plan a medida de compensación que absorbe nuestros picos de consumo diarios.",
        name: "Hortofrutícola Valenzuela",
        designation: "Almacenaje y Exportación",
        src: "/clientes/logo hortofruticula valenzuela.jpg",
    },
    {
        quote:
            "Recinovel ha rebajado por completo los recargos por energía reactiva que soportábamos en los meses pico gracias a su gestión directa con distribuidoras.",
        name: "Recinovel",
        designation: "Procesado y Reciclaje Industrial",
        src: "/clientes/logo recinovel.png",
    },
    {
        quote:
            "Como industria alimentaria de alta capacidad frigorífica, el ahorro conseguido en todas nuestras cámaras tras el cambio de condiciones ha sido brutal y cuantioso.",
        name: "Heladería Montalbam",
        designation: "Producción Alimentaria",
        src: "/clientes/logo heladeria montalbam.jpg",
    },
    {
        quote:
            "Recomendables al 100%. Todo el proceso de tramitación, ingeniería y despliegue del estudio de rentabilidad fotovoltaico fue impecable, directo y transparente.",
        name: "Gestidro",
        designation: "Gestión Medioambiental",
        src: "/clientes/logo gestidro.png",
    },
    {
        quote:
            "Desde el estudio de consumo hasta la firma oficial, el equipo nos dio una confianza técnica absoluta para ejecutar nuestro autoconsumo logístico expansivo.",
        name: "Logística P3",
        designation: "Centros Logísticos y Transporte",
        src: "/clientes/p3 logo.png",
    },
];

export default function InteractiveClients() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section
            id="casos-exito"
            ref={ref}
            aria-labelledby="clients-heading"
            className="relative py-24 md:py-36 min-h-[50vh] overflow-hidden"
        >
            {/* Ambient Backgrounds */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="absolute top-10 left-10 w-[600px] h-[300px] bg-cyan-700/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-10 right-10 w-[600px] h-[300px] bg-blue-900/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7 }}
                className="text-center mb-8 relative z-10 px-4"
            >
                <p className="text-[10px] font-black tracking-[0.5em] text-cyan-400 uppercase mb-4">
                    Nuestra Experiencia
                </p>
                <h2 id="clients-heading" className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase mb-4"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Casos de <span className="text-orange-gradient">Éxito</span>
                </h2>
                <p className="text-white/40 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                    Testimonios y proyectos reales. Descubre cómo estas empresas optimizaron drásticamente su rentabilidad reduciendo su tarifa de luz y consumo eléctrico.
                </p>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative z-10"
            >
                <AnimatedTestimonials testimonials={clientTestimonialsData} />
            </motion.div>
        </section>
    );
}
