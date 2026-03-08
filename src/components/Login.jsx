import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const Login = ({ onLogin, initialMode = 'login' }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    // mode: 'login' | 'register' | 'forgot' | 'reset'
    const [mode, setMode] = useState(initialMode);
    const [loading, setLoading] = useState(false);

    // Sincroniza el modo cuando el padre cambia initialMode
    // (necesario para el flujo PASSWORD_RECOVERY: el componente ya está montado
    // en modo 'login' cuando Supabase dispara el evento y el padre lo pone en 'reset')
    useEffect(() => {
        setMode(initialMode);
    }, [initialMode]);
    const [forgotSent, setForgotSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (mode === 'reset') {
                if (password !== confirmPassword) {
                    toast.error('Las contraseñas no coinciden.');
                    setLoading(false);
                    return;
                }
                if (password.length < 6) {
                    toast.error('La contraseña debe tener al menos 6 caracteres.');
                    setLoading(false);
                    return;
                }
                const { error } = await supabase.auth.updateUser({ password });
                if (error) throw error;
                toast.success('¡Contraseña actualizada correctamente! Iniciando sesión...');
                onLogin();
            } else if (mode === 'forgot') {
                const redirectUrl = `${window.location.origin}/reset-password`;
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: redirectUrl,
                });
                if (error) throw error;
                setForgotSent(true);
                toast.success('Enlace de recuperación enviado. Revisa tu correo.');
            } else if (mode === 'register') {
                const { error, data } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                if (data.user && data.session) {
                    toast.success('Cuenta creada con éxito');
                    onLogin();
                } else {
                    toast.success('Verifica tu correo electrónico para confirmar el registro');
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                toast.success('Acceso autorizado');
                onLogin();
            }
        } catch (error) {
            console.error('Auth error:', error.message);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const titles = {
        login: 'Identificación',
        register: 'Registro',
        forgot: 'Recuperar Acceso',
        reset: 'Nueva Contraseña',
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="relative z-[6000] w-full max-w-md"
        >
            <div className="glass-card p-12 border-white/10 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                {/* Scanline Effect */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-400/30 animate-scan pointer-events-none"></div>

                <div className="mb-10 text-center">


                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
                        {titles[mode]}
                    </h2>
                    <p className="text-cyan-400 text-[9px] font-bold tracking-[0.4em] uppercase">
                        Acceso a Red de Inteligencia
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {/* ESTADO: Correo de recuperación enviado */}
                    {mode === 'forgot' && forgotSent ? (
                        <motion.div
                            key="sent"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center space-y-4"
                        >
                            <div className="text-4xl mb-4">📧</div>
                            <p className="text-white/70 text-xs leading-relaxed">
                                Hemos enviado un enlace de recuperación a<br />
                                <span className="text-cyan-400 font-bold">{email}</span>
                            </p>
                            <p className="text-white/30 text-[10px] uppercase tracking-widest mt-2">
                                Revisa también tu carpeta de spam.
                            </p>
                            <button
                                onClick={() => { setMode('login'); setForgotSent(false); setEmail(''); }}
                                className="mt-6 text-[9px] uppercase tracking-widest text-white/30 hover:text-white transition-colors font-bold"
                            >
                                Volver al inicio de sesión
                            </button>
                        </motion.div>
                    ) : (
                        <motion.form
                            key={mode}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                            {/* Email - oculto en modo reset (la sesión temporal ya está activa) */}
                            {mode !== 'reset' && (
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2 font-bold">Correo Electrónico</label>
                                    <div className="relative group/input">
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="usuario@consultoria.martin"
                                            autoComplete="email"
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 focus:shadow-[0_0_15px_rgba(0,242,255,0.1)] transition-all duration-300 font-montserrat backdrop-blur-sm"
                                        />
                                        <div className="absolute inset-0 rounded-2xl bg-cyan-400/5 opacity-0 group-focus-within/input:opacity-100 pointer-events-none transition-opacity"></div>
                                    </div>
                                </div>
                            )}

                            {/* Contraseña - solo en login/register/reset */}
                            <AnimatePresence>
                                {mode !== 'forgot' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-1 overflow-hidden"
                                    >
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2 font-bold">
                                            {mode === 'reset' ? 'Nueva Contraseña' : 'Contraseña'}
                                        </label>
                                        <div className="relative group/input">
                                            <input
                                                type="password"
                                                required={mode !== 'forgot'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 focus:shadow-[0_0_15px_rgba(0,242,255,0.1)] transition-all duration-300 font-mono tracking-widest backdrop-blur-sm"
                                            />
                                            <div className="absolute inset-0 rounded-2xl bg-cyan-400/5 opacity-0 group-focus-within/input:opacity-100 pointer-events-none transition-opacity"></div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Confirmar contraseña - solo en modo reset */}
                            <AnimatePresence>
                                {mode === 'reset' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-1 overflow-hidden"
                                    >
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2 font-bold">Confirmar Contraseña</label>
                                        <div className="relative group/input">
                                            <input
                                                type="password"
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 focus:shadow-[0_0_15px_rgba(0,242,255,0.1)] transition-all duration-300 font-mono tracking-widest backdrop-blur-sm"
                                            />
                                            <div className="absolute inset-0 rounded-2xl bg-cyan-400/5 opacity-0 group-focus-within/input:opacity-100 pointer-events-none transition-opacity"></div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(0,242,255,0.2)] hover:shadow-[0_0_30px_rgba(0,242,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mt-4 disabled:opacity-50"
                            >
                                {loading
                                    ? 'Procesando...'
                                    : mode === 'reset'
                                        ? 'Establecer Nueva Contraseña'
                                        : mode === 'forgot'
                                            ? 'Enviar Enlace de Recuperación'
                                            : mode === 'register'
                                                ? 'Crear Cuenta'
                                                : 'Iniciar Sesión'
                                }
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>

                {/* Links de navegación entre modos */}
                {!(mode === 'forgot' && forgotSent) && (
                    <div className="mt-8 flex flex-col items-center gap-3">
                        {mode === 'login' && (
                            <>
                                <button
                                    onClick={() => setMode('register')}
                                    className="text-[9px] uppercase tracking-widest text-white/30 hover:text-white transition-colors font-bold"
                                >
                                    ¿Nuevo Consultor? Solicitar Acceso
                                </button>
                                <button
                                    onClick={() => setMode('forgot')}
                                    className="text-[9px] uppercase tracking-widest text-white/20 hover:text-cyan-400 transition-colors"
                                >
                                    Olvidé mi contraseña
                                </button>
                            </>
                        )}
                        {mode === 'register' && (
                            <button
                                onClick={() => setMode('login')}
                                className="text-[9px] uppercase tracking-widest text-white/30 hover:text-white transition-colors font-bold"
                            >
                                ¿Ya tienes cuenta? Conéctate
                            </button>
                        )}
                        {mode === 'forgot' && !forgotSent && (
                            <button
                                onClick={() => setMode('login')}
                                className="text-[9px] uppercase tracking-widest text-white/30 hover:text-white transition-colors font-bold"
                            >
                                ← Volver al inicio de sesión
                            </button>
                        )}
                    </div>
                )}
            </div>

            <style jsx="true">{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    50% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .animate-scan {
                    animation: scan 4s linear infinite;
                }
            `}</style>
        </motion.div>
    );
};

export default Login;
