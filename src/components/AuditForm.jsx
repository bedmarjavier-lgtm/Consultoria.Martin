import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Tesseract from 'tesseract.js';
import toast from 'react-hot-toast';

// 1. Zod Schema para Validación Estricta
const schema = z.object({
    fullName: z.string().min(3, 'Mínimo 3 caracteres'),
    email: z.string().email('Email inválido'),
    phone: z.string().regex(/^[0-9\s+]{9,15}$/, 'Número de teléfono inválido'),
    cups: z.string()
        .optional()
        .refine(val => !val || /^(ES|es)[A-Za-z0-9]{18,20}$/.test(val.replace(/\s/g, '')), {
            message: 'El CUPS debe empezar por ES seguido de 20 caracteres'
        })
});

const AuditForm = ({ address, userId }) => {
    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            fullName: '',
            email: '',
            phone: '',
            cups: ''
        }
    });

    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, scanning, loading, success, error
    const [scanProgress, setScanProgress] = useState(0);

    // 2. Real OCR scan con Tesseract.js (cuando suben una imagen)
    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);

        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setStatus('scanning');
            setScanProgress(10);

            try {
                // Configurar OCR
                const worker = await Tesseract.createWorker('spa', 1, {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setScanProgress(15 + Math.floor(m.progress * 85));
                        }
                    }
                });

                const { data: { text } } = await Tesseract.recognize(selectedFile);
                console.log("=== Texto Extraido OCR ===", text);

                // Buscar patrón de CUPS (ES seguido de 20-22 caracteres)
                const cupsMatch = text.replace(/\s+/g, '').match(/(ES)[A-Z0-9]{18,20}/i);

                if (cupsMatch) {
                    setValue('cups', cupsMatch[0].toUpperCase()); // Rellena el input automáticamente
                    toast.success('¡CUPS detectado y rellenado automáticamente!', {
                        style: { background: '#00cc66', color: '#fff' }
                    });
                } else {
                    toast('Factura leída, pero no encontré el número CUPS claro. Puedes escribirlo a mano.', {
                        icon: '⚠️',
                        style: { background: '#222', color: '#fff' }
                    });
                }

                await worker.terminate();
            } catch (err) {
                console.error('OCR Error:', err);
                toast.error('Hubo un problema leyendo la factura.');
            } finally {
                setStatus('idle');
                setScanProgress(0);
            }
        }
    };

    // 3. Envío Oficial al Servidor
    const onSubmit = async (formData) => {
        setStatus('loading');

        const data = new FormData();
        data.append('fullName', formData.fullName);
        data.append('email', formData.email);
        data.append('phone', formData.phone);
        data.append('cups', formData.cups || '');
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
                        <h4 className="text-[10px] font-black uppercase text-cyan-400 tracking-[0.3em] animate-pulse">
                            Motor AI Leyendo Factura ({scanProgress}%)...
                        </h4>
                        <p className="text-[8px] text-white/30 mt-2 uppercase tracking-widest">Buscando número CUPS</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mb-6">
                <h4 className="text-[11px] font-black tracking-[0.3em] text-[var(--accent-orange)] uppercase mb-2">Solicitar Auditoría Gratuita</h4>
                <p className="text-[10px] text-white/40 font-light leading-relaxed">
                    <span className="text-[var(--accent-orange)] font-bold">Últimas 5 auditorías gratuitas</span> esta semana en tu zona.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="text-[9px] uppercase tracking-widest text-white/30 block mb-1.5 ml-1 flex justify-between">
                        Nombre Completo
                        {errors.fullName && <span className="text-red-400 normal-case">{errors.fullName.message}</span>}
                    </label>
                    <input
                        {...register('fullName')}
                        placeholder="Introduce tu nombre..."
                        className={`w-full bg-white/5 border ${errors.fullName ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/10 focus:outline-none focus:border-[var(--accent-orange)]/50 transition-all font-montserrat`}
                    />
                </div>

                <div>
                    <label className="text-[9px] uppercase tracking-widest text-white/30 block mb-1.5 ml-1 flex justify-between">
                        Email de Contacto
                        {errors.email && <span className="text-red-400 normal-case">{errors.email.message}</span>}
                    </label>
                    <input
                        type="email"
                        {...register('email')}
                        placeholder="tu@email.com"
                        className={`w-full bg-white/5 border ${errors.email ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/10 focus:outline-none focus:border-[var(--accent-orange)]/50 transition-all font-montserrat`}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[9px] uppercase tracking-widest text-white/30 block mb-1.5 ml-1 flex justify-between flex-wrap">
                            Teléfono
                            {errors.phone && <span className="text-red-400 normal-case w-full mt-1">{errors.phone.message}</span>}
                        </label>
                        <input
                            type="tel"
                            {...register('phone')}
                            placeholder="600 000 000"
                            className={`w-full bg-white/5 border ${errors.phone ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/10 focus:outline-none focus:border-[var(--accent-orange)]/50 transition-all font-mono`}
                        />
                    </div>
                    <div>
                        <label className="text-[9px] uppercase tracking-widest text-white/30 block mb-1.5 ml-1 flex justify-between flex-wrap">
                            Catastro / CUPS
                            {errors.cups && <span className="text-red-400 normal-case w-full mt-1">{errors.cups.message}</span>}
                        </label>
                        <input
                            {...register('cups')}
                            placeholder="Opcional (ES...)"
                            className={`w-full bg-white/5 border ${errors.cups ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/10 focus:outline-none focus:border-[var(--accent-orange)]/50 transition-all font-mono uppercase`}
                        />
                    </div>
                </div>

                <div>
                    <label className="text-[9px] uppercase tracking-widest text-white/30 block mb-1.5 ml-1">Adjuntar Factura (Activará Autorellenado OCR)</label>
                    <div className="relative group">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-full bg-cyan-400/5 border border-dashed border-cyan-400/20 rounded-xl px-4 py-4 text-center group-hover:bg-cyan-400/10 group-hover:border-cyan-400/40 transition-all">
                            <span className="text-[10px] text-cyan-400/80 uppercase tracking-widest font-bold">
                                {file ? file.name : '📄 Subir y extraer CUPS'}
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={status === 'loading' || status === 'scanning'}
                    className="w-full py-4 bg-gradient-to-r from-[var(--accent-orange)] to-[#ff6a00] rounded-xl text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[var(--accent-orange)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                    {status === 'loading' ? 'Enviando Datos...' : status === 'scanning' ? 'Analizando Factura...' : 'Solicitar Auditoría Gratuita'}
                </button>

                {status === 'error' && (
                    <p className="text-[9px] text-red-400 text-center mt-2 uppercase tracking-widest font-bold">Error en la red. Inténtalo de nuevo.</p>
                )}
            </form>
        </div>
    );
};

export default AuditForm;
