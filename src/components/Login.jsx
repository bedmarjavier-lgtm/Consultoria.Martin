import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isRegister) {
                const { error, data } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                if (data.user && data.session) {
                    toast.success('Cuenta creada con éxito');
                    onLogin();
                } else {
                    toast.success('Verifica tu correo electrónico para confirmar el registro');
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
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
                        {isRegister ? 'Registro' : 'Identificación'}
                    </h2>
                    <p className="text-cyan-400 text-[9px] font-bold tracking-[0.4em] uppercase">
                        Acceso a Red de Inteligencia
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2 font-bold">Correo Electrónico</label>
                        <div className="relative group/input">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="usuario@consultoria.martin"
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 focus:shadow-[0_0_15px_rgba(0,242,255,0.1)] transition-all duration-300 font-montserrat backdrop-blur-sm"
                            />
                            <div className="absolute inset-0 rounded-2xl bg-cyan-400/5 opacity-0 group-focus-within/input:opacity-100 pointer-events-none transition-opacity"></div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2 font-bold">Contraseña</label>
                        <div className="relative group/input">
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 focus:shadow-[0_0_15px_rgba(0,242,255,0.1)] transition-all duration-300 font-mono tracking-widest backdrop-blur-sm"
                            />
                            <div className="absolute inset-0 rounded-2xl bg-cyan-400/5 opacity-0 group-focus-within/input:opacity-100 pointer-events-none transition-opacity"></div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(0,242,255,0.2)] hover:shadow-[0_0_30px_rgba(0,242,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mt-4"
                    >
                        {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => setIsRegister(!isRegister)}
                        className="text-[9px] uppercase tracking-widest text-white/30 hover:text-white transition-colors font-bold"
                    >
                        {isRegister ? '¿Ya tienes cuenta? Conéctate' : '¿Nuevo Consultor? Solicitar Acceso'}
                    </button>
                </div>
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
