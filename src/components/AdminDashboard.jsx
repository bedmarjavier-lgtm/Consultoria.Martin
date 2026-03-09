import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';


const AdminDashboard = ({ isOpen, onClose, session }) => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    // Bypasseamos el login si es el administrador principal
    const isAdmin = session?.user?.email === 'bedmarjavier@gmail.com';

    useEffect(() => {
        if (isOpen) {
            if (isAdmin) {
                setIsAuthenticated(true);
            }
        } else {
            // Reset when closing
            setIsAuthenticated(false);
            setPassword('');
        }
    }, [isOpen, isAdmin]);

    useEffect(() => {
        if (isOpen && isAuthenticated) {
            fetchLeads();
        }
    }, [isOpen, isAuthenticated]);

    const handleLogin = (e) => {
        e.preventDefault();
        // Clave de Seguridad Administrador (Fallback si no es isAdmin directo)
        if (password === 'martin2026') {
            setIsAuthenticated(true);
            setError(false);
        } else {
            setError(true);
            setPassword('');
        }
    };

    const fetchLeads = async () => {
        setLoading(true);
        try {
            // Consultamos al servidor central (Hub Unificado)
            const API_URL = import.meta.env.VITE_API_URL || 'https://consultoria-martin.onrender.com';
            const response = await fetch(`${API_URL}/api/leads_data`, {
                headers: {
                    'x-api-key': import.meta.env.VITE_ADMIN_API_KEY || 'martin_secure_api_key_2026'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setLeads(data || []);
            }
        } catch (error) {
            console.error("Error fetching leads from Central Hub:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    if (!isAuthenticated) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-[10000] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6"
            >
                <div className="w-full max-w-md glass-card p-10 border-white/10 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-400/30 animate-scan"></div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Acceso Restringido</h2>
                    <p className="text-cyan-400 text-[9px] font-bold tracking-[0.4em] uppercase mb-8">Introduzca Clave de Inteligencia</p>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <input
                            type="password"
                            autoFocus
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center text-white placeholder:text-white/10 focus:outline-none focus:border-cyan-500/50 transition-all font-mono tracking-[1em]"
                        />
                        {error && <p className="text-red-500 text-[8px] uppercase tracking-widest font-bold">Clave Incorrecta • Inténtelo de nuevo</p>}

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-4 border border-white/10 rounded-2xl text-[9px] font-bold text-white/30 uppercase tracking-widest hover:bg-white/5 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-4 bg-cyan-500 rounded-2xl text-[9px] font-black text-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_20px_#00f2ff33]"
                            >
                                Validar
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-10"
        >
            <div className="w-full max-w-7xl h-full flex flex-col">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Panel de Inteligencia</h2>
                        <p className="text-cyan-400 text-[10px] font-bold tracking-[0.5em] uppercase mt-2">Gestión de Leads • @Consultoria.Martin</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-white/10 rounded-full text-white/40 hover:text-white hover:bg-white/5 uppercase text-[10px] tracking-widest transition-all"
                    >
                        Cerrar Monitor
                    </button>
                </div>

                <div className="flex-grow overflow-auto custom-scrollbar border border-white/10 rounded-3xl bg-white/[0.02]">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-[#000810] z-10">
                            <tr className="border-b border-white/10">
                                <th className="p-6 text-[10px] font-black uppercase text-white/40 tracking-widest">Lead / Fecha</th>
                                <th className="p-6 text-[10px] font-black uppercase text-white/40 tracking-widest">Cliente</th>
                                <th className="p-6 text-[10px] font-black uppercase text-white/40 tracking-widest">Ubicación</th>
                                <th className="p-6 text-[10px] font-black uppercase text-white/40 tracking-widest">Contacto</th>
                                <th className="p-6 text-[10px] font-black uppercase text-white/40 tracking-widest">Análisis OCR</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan="5" className="p-20 text-center text-cyan-400 animate-pulse uppercase tracking-widest font-black text-xs">Sincronizando Base de Datos...</td></tr>
                            ) : leads.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center text-white/20 uppercase text-[10px] tracking-[0.5em]">No se han detectado leads en el sistema</td>
                                </tr>
                            ) : leads.map((lead, idx) => (
                                <tr key={lead.id || idx} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-6">
                                        <div className="text-[10px] text-white/70 font-mono mb-1">#{lead.id ? lead.id.toString().slice(-8) : idx}</div>
                                        <div className="text-[9px] text-white/30 uppercase tracking-widest">
                                            {lead.timestamp ? new Date(lead.timestamp).toLocaleDateString() : 'N/A'}
                                            <span className="ml-2 opacity-50">{lead.timestamp ? new Date(lead.timestamp).toLocaleTimeString() : ''}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="text-xs font-black text-white uppercase tracking-tight group-hover:text-cyan-400 transition-colors">{lead.fullName || 'Anónimo'}</div>
                                        <div className="text-[9px] text-white/40 font-mono mt-1">{lead.cups || 'SIN CUPS'}</div>
                                    </td>
                                    <td className="p-6">
                                        <div className="text-[10px] text-white/70 max-w-[250px] leading-relaxed italic">{lead.address || 'Mapa Directo'}</div>
                                        {lead.zone && <div className="text-[8px] text-[#ff6a00] font-black uppercase mt-1 tracking-widest">{lead.zone}</div>}
                                    </td>
                                    <td className="p-6">
                                        <div className="text-xs text-white/80">{lead.email}</div>
                                        <div className="text-[9px] text-white/30 mt-1 font-mono">{lead.phone}</div>
                                    </td>
                                    <td className="p-6">
                                        {lead.billFile ? (
                                            <a
                                                href={lead.billFile.startsWith('http') ? lead.billFile : `${import.meta.env.VITE_API_URL || 'https://consultoria-martin.onrender.com'}/${lead.billFile}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[9px] font-black uppercase rounded-lg hover:bg-cyan-500 hover:text-black transition-all cursor-pointer inline-flex items-center gap-2"
                                            >
                                                Ver Factura
                                            </a>
                                        ) : (
                                            <span className="text-[9px] text-white/10 uppercase font-bold tracking-widest">Sin adjunto</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminDashboard;
