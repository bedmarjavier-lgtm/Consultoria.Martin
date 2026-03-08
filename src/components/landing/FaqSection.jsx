import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const faqs = [
    {
        q: '¿Cuánto puedo ahorrar en mi factura de luz con placas solares?',
        a: 'El ahorro depende de tu consumo, orientación del tejado y tarifa contratada, pero nuestros clientes registran un ahorro medio de 2.100€ anuales. Con nuestra simulación gratuita obtienes un cálculo personalizado basado en datos reales de mercado OMIE.',
    },
    {
        q: '¿Qué es el autoconsumo solar con excedentes?',
        a: 'Es un modelo en el que instalas paneles solares para consumir su energía directamente, y la electricidad que sobra (excedente) se vierte a la red eléctrica recibiendo una compensación económica en tu factura. Es la modalidad más popular para hogares y pymes en España.',
    },
    {
        q: '¿En cuánto tiempo se amortiza la instalación solar?',
        a: 'El período de retorno medio en España está entre 5 y 8 años, dependiendo del coste de instalación, las horas de sol en tu provincia y tu consumo eléctrico. En Andalucía, con más de 3.000 horas de sol al año, la amortización puede ser inferior a 5 años.',
    },
    {
        q: '¿Necesito reformar el tejado antes de instalar las placas?',
        a: 'No necesariamente. Nuestro análisis LiDAR detecta si la cubierta tiene la resistencia estructural adecuada antes de hacer ninguna propuesta. Si hubiera que reforzar algo, te lo indicamos en el informe técnico con presupuesto desglosado.',
    },
    {
        q: '¿La consulta inicial tiene algún coste?',
        a: 'No. El análisis de tu tejado, la simulación de ahorro energético y el primer informe son completamente gratuitos. Solo te cobraremos si decides avanzar con el proyecto de instalación, y siempre con presupuesto aceptado por ti.',
    },
    {
        q: '¿Qué diferencia hay entre Consultoría.Martin y una empresa instaladora?',
        a: 'Somos consultores independientes, no vendemos ni instalamos. Nuestro único interés es que tomes la mejor decisión para ti. Por eso auditamos tu factura, estudiamos tu tejado y, solo si tiene sentido económico, te recomendamos instaladores de nuestra red auditada.',
    },
];

// JSON-LD Schema.org para FAQ Rich Snippets
const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
    })),
};

function FaqItem({ faq, index, inView }) {
    const [open, setOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.08 + 0.2 }}
            className={`border rounded-2xl overflow-hidden transition-colors duration-300 ${open ? 'border-cyan-400/30 bg-cyan-400/[0.03]' : 'border-white/8 bg-white/[0.02] hover:border-white/15'
                }`}
        >
            <button
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="w-full flex items-center justify-between p-6 text-left gap-4 group"
            >
                <span className="text-white/80 group-hover:text-white transition-colors text-sm md:text-base font-semibold leading-snug">
                    {faq.q}
                </span>
                <motion.div
                    animate={{ rotate: open ? 45 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="shrink-0 w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-white/40 group-hover:text-cyan-400 group-hover:border-cyan-400/30 transition-colors"
                >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </motion.div>
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <div className="px-6 pb-6 text-white/50 text-sm leading-relaxed border-t border-white/5 pt-4">
                            {faq.a}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function FaqSection() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <>
            {/* Schema.org JSON-LD para Rich Snippets */}
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify(faqSchema)}
                </script>
            </Helmet>

            <section
                id="preguntas-frecuentes"
                ref={ref}
                aria-labelledby="faq-heading"
                className="relative py-24 md:py-36 px-4 md:px-12"
            >
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-14"
                    >
                        <p className="text-[10px] font-black tracking-[0.5em] text-cyan-400 uppercase mb-4">Centro de Ayuda</p>
                        <h2
                            id="faq-heading"
                            className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase mb-4"
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                            Preguntas <span className="text-orange-gradient">Frecuentes</span>
                        </h2>
                        <p className="text-white/40 text-sm leading-relaxed">
                            Todo lo que necesitas saber sobre eficiencia energética, autoconsumo solar y ahorro en factura de luz.
                        </p>
                    </motion.div>

                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <FaqItem key={i} faq={faq} index={i} inView={inView} />
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={inView ? { opacity: 1 } : {}}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        className="text-center mt-12"
                    >
                        <p className="text-white/30 text-sm">
                            ¿No encuentras tu pregunta?{' '}
                            <a
                                href="mailto:info@consultoriamartin.com"
                                className="text-cyan-400 hover:text-white transition-colors font-semibold"
                            >
                                Escríbenos directamente
                            </a>
                        </p>
                    </motion.div>
                </div>
            </section>
        </>
    );
}
