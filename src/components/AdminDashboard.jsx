import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AdminDashboard = ({ isOpen, onClose }) => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    useEffect(() => {
        if (isOpen && isAuthenticated) {
            fetchLeads();
        }
    }, [isOpen, isAuthenticated]);

    const handleLogin = (e) => {
        e.preventDefault();
        // Clave de Seguridad Administrador
        if (password === 'martin2026') {
            setIsAuthenticated(true);
            setError(false);
        } else {
            setError(true);
            setPassword('');
        }
    };

    const handleClose = () => {
        setIsAuthenticated(false);
        setPassword('');
        setError(false);
        onClose();
    };

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5001/api/leads_data');
            if (response.ok) {
                const data = await response.json();
                setLeads(data);
            }
        } catch (error) {
            console.error("Error fetching leads:", error);
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
            <div className="w-full max-w-6xl h-full flex flex-col">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Panel de Inteligencia</h2>
                        <p className="text-cyan-400 text-[10px] font-bold tracking-[0.5em] uppercase mt-2">Gestión de Leads • @Consultoria.Martin</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="px-6 py-2 border border-white/10 rounded-full text-white/40 hover:text-white hover:bg-white/5 uppercase text-[10px] tracking-widest transition-all"
                    >
                        Cerrar Monitor
                    </button>
                </div>

                <div className="flex-grow overflow-auto custom-scrollbar border border-white/10 rounded-3xl bg-white/[0.02]">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-[#050505] z-10">
                            <tr className="border-b border-white/10">
                                <th className="p-6 text-[10px] font-black uppercase text-white/40 tracking-widest">ID / Fecha</th>
                                <th className="p-6 text-[10px] font-black uppercase text-white/40 tracking-widest">Cliente</th>
                                <th className="p-6 text-[10px] font-black uppercase text-white/40 tracking-widest">Dirección / Zona</th>
                                <th className="p-6 text-[10px] font-black uppercase text-white/40 tracking-widest">Contacto</th>
                                <th className="p-6 text-[10px] font-black uppercase text-white/40 tracking-widest">Factura</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center text-white/20 uppercase text-[10px] tracking-[0.5em]">No hay datos de entrada detectados</td>
                                </tr>
                            ) : [...leads].reverse().map(lead => (
                                <tr key={lead.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="p-6">
                                        <div className="text-xs text-white font-mono">{lead.id}</div>
                                        <div className="text-[9px] text-white/30 lowercase mt-1">{new Date(lead.timestamp).toLocaleString()}</div>
                                    </td>
                                    <td className="p-6">
                                        <div className="text-xs font-bold text-white uppercase">{lead.fullName}</div>
                                        <div className="text-[9px] text-cyan-400/60 font-mono mt-1">{lead.cups || 'SIN CUPS'}</div>
                                    </td>
                                    <td className="p-6">
                                        <div className="text-xs text-white/70 max-w-[200px] truncate">{lead.address}</div>
                                        <div className="text-[9px] text-orange-400 font-bold uppercase mt-1">{lead.zone}</div>
                                    </td>
                                    <td className="p-6">
                                        <div className="text-xs text-white">{lead.email}</div>
                                        <div className="text-[9px] text-white/40 mt-1 font-mono">{lead.phone}</div>
                                    </td>
                                    <td className="p-6">
                                        {lead.billFile ? (
                                            <a
                                                href={`http://localhost:5001/${lead.billFile.replace(/\\/g, '/')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-2 py-1 bg-green-500/20 text-green-400 text-[8px] font-black uppercase rounded hover:bg-green-500/40 transition-all cursor-pointer inline-block"
                                            >
                                                Descargar/Ver
                                            </a>
                                        ) : (
                                            <span className="px-2 py-1 bg-white/5 text-white/20 text-[8px] font-black uppercase rounded">N/A</span>
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
