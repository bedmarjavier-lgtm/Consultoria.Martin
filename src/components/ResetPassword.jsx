import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

/**
 * ResetPassword — Página dedicada al cambio de contraseña.
 *
 * Supabase redirige aquí con:
 *   /reset-password#access_token=...&type=recovery
 *
 * El listener de onAuthStateChange detecta PASSWORD_RECOVERY y
 * habilita el formulario para que el usuario pueda introducir su
 * nueva contraseña.
 */
export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false);   // true cuando Supabase confirma el token
    const [done, setDone] = useState(false);      // true tras actualizar con éxito

    // ── Inyectar meta noindex dinámicamente ────────────────────────────────
    useEffect(() => {
        const meta = document.createElement('meta');
        meta.name = 'robots';
        meta.content = 'noindex, nofollow';
        document.head.appendChild(meta);

        const titleBak = document.title;
        document.title = 'Restablecer Contraseña | Consultoria.Martin';

        return () => {
            document.head.removeChild(meta);
            document.title = titleBak;
        };
    }, []);

    // ── Detectar token de recuperación ────────────────────────────────────
    useEffect(() => {
        // Supabase v2 con PKCE procesa el hash automáticamente.
        // El evento PASSWORD_RECOVERY indica que hay una sesión temporal válida.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setReady(true);
            }
        });

        // Fallback: si el hash ya fue procesado antes de que montemos el listener,
        // getSession() devolverá la sesión de recovery activa.
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) setReady(true);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden.');
            return;
        }
        if (password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            setDone(true);
            toast.success('¡Contraseña actualizada! Redirigiendo...');
            // Cerrar sesión temporal y volver al login después de 2s
            await supabase.auth.signOut();
            setTimeout(() => {
                window.location.replace('/');
            }, 2000);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#00050a] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <Toaster />

            {/* Fondo de partículas / decoración sutíl */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl" />
                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(0,242,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,255,0.5) 1px, transparent 1px)',
                        backgroundSize: '60px 60px'
                    }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative w-full max-w-md"
            >
                {/* Card */}
                <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-12 shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative overflow-hidden">

                    {/* Scanline animado */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-400/30 animate-scan pointer-events-none" />

                    {/* Logo */}
                    <div className="text-center mb-10">
                        <a href="/" className="inline-block mb-6 hover:opacity-80 transition-opacity">
                            <div className="leading-none">
                                <span className="text-2xl font-black text-white tracking-tighter" style={{ fontFamily: 'Montserrat, sans-serif' }}>Consultoria.</span>
                                <span className="text-2xl font-black text-[#ff6a00] tracking-tighter" style={{ fontFamily: 'Montserrat, sans-serif' }}>Martin</span>
                            </div>

                        </a>

                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
                            Nueva Contraseña
                        </h1>
                        <p className="text-cyan-400 text-[9px] font-bold tracking-[0.4em] uppercase">
                            Restablecimiento Seguro de Acceso
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {/* Estado: Completado */}
                        {done ? (
                            <motion.div
                                key="done"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-4 py-4"
                            >
                                <div className="text-5xl mb-4">✅</div>
                                <p className="text-white font-bold text-lg">¡Contraseña actualizada!</p>
                                <p className="text-white/40 text-xs tracking-widest uppercase">
                                    Redirigiendo al inicio...
                                </p>
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-4">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 2, ease: 'linear' }}
                                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                                    />
                                </div>
                            </motion.div>
                        ) : !ready ? (
                            /* Estado: Verificando token */
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center space-y-4 py-8"
                            >
                                <div className="flex justify-center mb-4">
                                    <div className="w-10 h-10 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                                </div>
                                <p className="text-white/50 text-xs tracking-widest uppercase">
                                    Verificando enlace de seguridad...
                                </p>
                                <p className="text-white/20 text-[10px]">
                                    Si esto tarda demasiado, el enlace puede haber expirado.
                                </p>
                                <button
                                    onClick={() => window.location.replace('/')}
                                    className="mt-4 text-[9px] uppercase tracking-widest text-white/20 hover:text-cyan-400 transition-colors"
                                >
                                    Solicitar nuevo enlace →
                                </button>
                            </motion.div>
                        ) : (
                            /* Estado: Formulario activo */
                            <motion.form
                                key="form"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.25 }}
                                onSubmit={handleSubmit}
                                className="space-y-5"
                            >
                                {/* Nueva contraseña */}
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2 font-bold">
                                        Nueva Contraseña
                                    </label>
                                    <div className="relative group/input">
                                        <input
                                            id="new-password"
                                            type="password"
                                            required
                                            minLength={6}
                                            autoFocus
                                            autoComplete="new-password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 focus:shadow-[0_0_15px_rgba(0,242,255,0.1)] transition-all duration-300 font-mono tracking-widest backdrop-blur-sm"
                                        />
                                        <div className="absolute inset-0 rounded-2xl bg-cyan-400/5 opacity-0 group-focus-within/input:opacity-100 pointer-events-none transition-opacity" />
                                    </div>
                                </div>

                                {/* Confirmar contraseña */}
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2 font-bold">
                                        Confirmar Contraseña
                                    </label>
                                    <div className="relative group/input">
                                        <input
                                            id="confirm-password"
                                            type="password"
                                            required
                                            minLength={6}
                                            autoComplete="new-password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 focus:shadow-[0_0_15px_rgba(0,242,255,0.1)] transition-all duration-300 font-mono tracking-widest backdrop-blur-sm"
                                        />
                                        <div className="absolute inset-0 rounded-2xl bg-cyan-400/5 opacity-0 group-focus-within/input:opacity-100 pointer-events-none transition-opacity" />
                                    </div>
                                    {/* Indicador de coincidencia */}
                                    {confirmPassword.length > 0 && (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className={`text-[9px] ml-2 mt-1 font-bold tracking-wider ${password === confirmPassword ? 'text-green-400' : 'text-red-400'
                                                }`}
                                        >
                                            {password === confirmPassword ? '✓ Las contraseñas coinciden' : '✗ No coinciden'}
                                        </motion.p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || password !== confirmPassword}
                                    className="w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(0,242,255,0.2)] hover:shadow-[0_0_30px_rgba(0,242,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mt-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Actualizando...
                                        </span>
                                    ) : 'Establecer Nueva Contraseña'}
                                </button>

                                <div className="text-center mt-2">
                                    <button
                                        type="button"
                                        onClick={() => window.location.replace('/')}
                                        className="text-[9px] uppercase tracking-widest text-white/20 hover:text-white/50 transition-colors"
                                    >
                                        ← Volver al inicio de sesión
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                {/* Texto inferior */}
                <p className="text-center text-white/20 text-[9px] tracking-widest uppercase mt-6">
                    Este enlace expira tras 1 uso · Protegido por Supabase Auth
                </p>
            </motion.div>

            <style>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    50% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .animate-scan { animation: scan 4s linear infinite; }
            `}</style>
        </div>
    );
}
