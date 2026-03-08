import { Suspense, lazy, useState } from 'react';
import { motion } from 'framer-motion';
import Login from '../Login';

// Lazy load del globo (Three.js es pesado)
const GlobeDiscovery = lazy(() => import('../GlobeDiscovery'));

function GlobeFallback() {
    return (
        <div className="absolute inset-0 bg-[#00050a] flex items-center justify-center">
            <div className="w-16 h-16 border-2 border-cyan-400/10 border-t-cyan-400/50 rounded-full animate-spin" />
        </div>
    );
}

export default function HeroSection({
    session,
    isRecovery,
    isAuthenticating,
    onShowTerms,
    onShowPrivacy,
    onEnterExperience,
    onLogin,
}) {
    const [isZooming, setIsZooming] = useState(false);
    const [showLogin, setShowLogin] = useState(false);

    const handleLogin = () => {
        setIsZooming(true);
        setTimeout(() => setIsZooming(false), 2000);
        onLogin();
    };

    return (
        <section
            id="hero"
            aria-labelledby="hero-heading"
            className="relative w-full overflow-hidden"
            style={{ minHeight: '100svh' }}
        >
            {/* ── Globo 3D como fondo ── */}
            {/* pointer-events-none para que el scroll de la landing funcione */}
            <div className="absolute inset-0 pointer-events-none">
                <Suspense fallback={<GlobeFallback />}>
                    <GlobeDiscovery
                        isBlurred={showLogin || isRecovery}
                        isZooming={isZooming}
                    />
                </Suspense>
            </div>

            {/* Overlay degradado inferior para mezclar con las secciones de debajo */}
            <div
                className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none z-10"
                style={{ background: 'linear-gradient(to bottom, transparent, #00050a)' }}
            />

            {/* ── Contenido centrado ── */}
            <div className="relative z-20 flex flex-col items-center justify-center min-h-[100svh] px-4 py-16 gap-10">

                {/* Tagline + H1 */}
                <motion.div
                    initial={{ opacity: 0, y: -24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    className="text-center pointer-events-none select-none"
                >

                    <h1
                        id="hero-heading"
                        className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase leading-none"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                        Consultoría.<span className="text-orange-gradient">Martin</span>
                    </h1>
                    <p className="text-white/30 text-xs md:text-sm tracking-[0.3em] mt-4 uppercase">
                        Expertos en Ahorro Energético &amp; Placas Solares
                    </p>
                </motion.div>

                {/* Login glassmorphism — se muestra si se requiere login o recuperación */}
                {(showLogin || isRecovery) && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
                        className="w-full max-w-md relative"
                    >
                        {/* Botón para arrinconar el login y cancelarlo si alguien se arrepiente */}
                        {!isRecovery && !session && (
                            <button
                                onClick={() => setShowLogin(false)}
                                className="absolute -top-10 right-2 z-50 text-white/50 hover:text-white uppercase tracking-widest text-[9px] font-bold transition-colors"
                            >
                                ← Volver
                            </button>
                        )}
                        <Login
                            initialMode={isRecovery ? 'reset' : 'login'}
                            onLogin={handleLogin}
                        />
                    </motion.div>
                )}

                {/* Botón Principal (siempre visible a menos que se abra el panel de login o recuperación) */}
                {!isRecovery && !showLogin && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.7 }}
                        className="flex flex-col items-center gap-6"
                    >
                        <button
                            onClick={() => {
                                if (session) {
                                    onEnterExperience();
                                } else {
                                    setShowLogin(true);
                                }
                            }}
                            className="group flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-full text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_0_40px_rgba(0,242,255,0.3)] hover:shadow-[0_0_60px_rgba(0,242,255,0.5)] hover:scale-105 active:scale-95 transition-all duration-300"
                        >
                            <span>Iniciar Análisis Solar</span>
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </button>

                        <div className="flex flex-col items-center gap-2 animate-bounce opacity-40 pointer-events-none">
                            <span className="text-[9px] tracking-[0.5em] uppercase text-white">Descubre más</span>
                            <div className="w-[1px] h-8 bg-gradient-to-b from-white to-transparent" />
                        </div>
                    </motion.div>
                )}
            </div>
        </section>
    );
}
