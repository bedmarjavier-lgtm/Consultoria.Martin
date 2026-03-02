import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AuditForm = ({ address, userId }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        cups: ''
    });
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, scanning, loading, success, error
    const [scanProgress, setScanProgress] = useState(0);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (file) {
            setStatus('scanning');
            // Simulación de OCR (@Facturas: Chief Billing Auditor)
            for (let i = 0; i <= 100; i += 20) {
                setScanProgress(i);
                await new Promise(r => setTimeout(r, 200));
            }
        }

        setStatus('loading');

        const data = new FormData();
        data.append('fullName', formData.fullName);
        data.append('email', formData.email);
        data.append('phone', formData.phone);
        data.append('cups', formData.cups);
        data.append('address', address);
        if (userId) data.append('userId', userId);
        if (file) data.append('bill', file);

        try {
            const response = await fetch('http://localhost:5001/api/leads', {
                method: 'POST',
                body: data,
            });

            if (response.ok) {
                setStatus('success');
                setFormData({ fullName: '', email: '', phone: '', cups: '' });
                setFile(null);
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Error enviando formulario:', error);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl text-center"
            >
                <p className="text-green-400 font-bold text-sm uppercase tracking-widest">¡Solicitud Enviada!</p>
                <p className="text-[10px] text-white/60 mt-2">Un consultor experto se pondrá en contacto contigo pronto.</p>
                <button
                    onClick={() => setStatus('idle')}
                    className="mt-4 text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                >
                    Enviar otra solicitud
                </button>
            </motion.div>
        );
    }

    return (
        <div className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden">
            <AnimatePresence>
                {status === 'scanning' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-[#000810]/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
                    >
                        <div className="w-full h-1 bg-white/5 rounded-full mb-4 overflow-hidden">
                            <motion.div
                                className="h-full bg-cyan-400 shadow-[0_0_10px_#00f2ff]"
                                initial={{ width: 0 }}
                                animate={{ width: `${scanProgress}%` }}
                            />
                        </div>
                        <h4 className="text-[10px] font-black uppercase text-cyan-400 tracking-[0.3em] animate-pulse">Analizando Factura (OCR)...</h4>
                        <p className="text-[8px] text-white/30 mt-2 uppercase tracking-widest">Extrayendo CUPS y Consumos • @Facturas</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mb-6">
                <h4 className="text-[11px] font-black tracking-[0.3em] text-[var(--accent-orange)] uppercase mb-2">Solicitar Auditoría Gratuita</h4>
                <p className="text-[10px] text-white/40 font-light leading-relaxed">
                    <span className="text-[var(--accent-orange)] font-bold">Últimas 5 auditorías gratuitas</span> esta semana en tu zona.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-[9px] uppercase tracking-widest text-white/30 block mb-1.5 ml-1">Nombre Completo</label>
                    <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Introduce tu nombre..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/10 focus:outline-none focus:border-[var(--accent-orange)]/50 transition-all font-montserrat"
                    />
                </div>

                <div>
                    <label className="text-[9px] uppercase tracking-widest text-white/30 block mb-1.5 ml-1">Email de Contacto</label>
                    <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="tu@email.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/10 focus:outline-none focus:border-[var(--accent-orange)]/50 transition-all font-montserrat"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[9px] uppercase tracking-widest text-white/30 block mb-1.5 ml-1">Teléfono</label>
                        <input
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="600 000 000"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/10 focus:outline-none focus:border-[var(--accent-orange)]/50 transition-all font-mono"
                        />
                    </div>
                    <div>
                        <label className="text-[9px] uppercase tracking-widest text-white/30 block mb-1.5 ml-1">Catastro / CUPS</label>
                        <input
                            type="text"
                            name="cups"
                            value={formData.cups}
                            onChange={handleChange}
                            placeholder="Opcional"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/10 focus:outline-none focus:border-[var(--accent-orange)]/50 transition-all font-mono"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-[9px] uppercase tracking-widest text-white/30 block mb-1.5 ml-1">Adjuntar Factura (Análisis OCR)</label>
                    <div className="relative group">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-full bg-white/5 border border-dashed border-white/20 rounded-xl px-4 py-4 text-center group-hover:bg-white/[0.08] group-hover:border-cyan-500/30 transition-all">
                            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                                {file ? file.name : 'Vincular factura para escaneo'}
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={status === 'loading' || status === 'scanning'}
                    className="w-full py-4 bg-gradient-to-r from-[var(--accent-orange)] to-[#ff6a00] rounded-xl text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[var(--accent-orange)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                    {status === 'loading' ? 'Enviando Datos...' : status === 'scanning' ? 'Analizando...' : 'Solicitar Auditoría Gratuita'}
                </button>

                {status === 'error' && (
                    <p className="text-[9px] text-red-400 text-center mt-2 uppercase tracking-widest font-bold">Error en la red. Inténtalo de nuevo.</p>
                )}
            </form>
        </div>
    );
};

export default AuditForm;
