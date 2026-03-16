import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingFooter({ onShowTerms, onShowPrivacy }) {
    const year = new Date().getFullYear();
    const [copied, setCopied] = useState(false);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const navLinks = [
        { label: 'Cómo Trabajamos', href: '#como-trabajamos' },
        { label: 'Garantías', href: '#garantias' },
        { label: 'Preguntas Frecuentes', href: '#preguntas-frecuentes' },
    ];

    return (
        <footer className="relative mt-8 border-t border-cyan-400/20 bg-[#00080f]/90 backdrop-blur-xl">
            {/* Línea de acento superior */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

            <div className="max-w-6xl mx-auto px-4 md:px-12 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
                    {/* Brand */}
                    <div>
                        <div className="mb-4 leading-none">
                            <span className="text-xl font-black text-white tracking-tighter" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                Consultoría.
                            </span>
                            <span className="text-xl font-black text-[#ff8c42] tracking-tighter" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                Martin
                            </span>
                        </div>
                        <p className="text-white/40 text-xs leading-relaxed max-w-xs">
                            Consultoría energética independiente especializada en autoconsumo solar, eficiencia energética y optimización de tarifas eléctricas en España.
                        </p>

                        {/* Botón Compartir */}
                        <motion.button
                            onClick={handleShare}
                            whileTap={{ scale: 0.95 }}
                            className="mt-6 group flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-cyan-400/30 transition-all"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-3 h-3 text-cyan-400" />
                                    <span className="text-[9px] tracking-[0.3em] uppercase text-cyan-400 font-bold">Copiado</span>
                                </>
                            ) : (
                                <>
                                    <Share2 className="w-3 h-3 text-white/40 group-hover:text-cyan-400 transition-colors" />
                                    <span className="text-[9px] tracking-[0.3em] uppercase text-white/40 group-hover:text-cyan-400 font-bold transition-colors">Compartir</span>
                                </>
                            )}
                        </motion.button>
                    </div>

                    {/* Navigation */}
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-cyan-400/50 mb-5">Navegación</p>
                        <nav aria-label="Footer navigation">
                            <ul className="space-y-3">
                                {navLinks.map(l => (
                                    <li key={l.label}>
                                        <a href={l.href} className="text-white/40 hover:text-white transition-colors text-sm hover:pl-1 transition-all duration-200">
                                            {l.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>

                    {/* CTA */}
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-cyan-400/50 mb-5">Contacto Directo</p>
                        <p className="text-white/40 text-xs mb-5">Martín atiende personalmente cada consulta.</p>
                        <a
                            href="mailto:info@consultoriamartin.es"
                            className="inline-flex items-center gap-2 bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-full hover:bg-cyan-400/20 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(0,242,255,0.15)] transition-all duration-300"
                        >
                            <span>✉</span> info@consultoriamartin.es
                        </a>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-white/30 text-[10px] tracking-wider">
                        © {year} Consultoría.Martin · Todos los derechos reservados
                    </p>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={onShowPrivacy}
                            className="text-white/30 hover:text-cyan-400 text-[10px] tracking-wider transition-colors font-medium"
                        >
                            Política de Privacidad
                        </button>
                        <div className="w-[1px] h-3 bg-white/10" />
                        <button
                            onClick={onShowTerms}
                            className="text-white/30 hover:text-cyan-400 text-[10px] tracking-wider transition-colors font-medium"
                        >
                            Términos de Uso
                        </button>
                    </div>
                </div>
            </div>

            {/* Línea de acento inferior */}
            <div className="h-[2px] bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
        </footer>
    );
}
