import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, FileText, HelpCircle, MapPin, Phone, Mail, History, Upload, CheckCircle2, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

const UserDashboard = ({ isOpen, onClose, onLogout, session }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [userData, setUserData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        invoices: [],
        history: []
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [fileUploadStatus, setFileUploadStatus] = useState('idle');


    const fetchUserData = useCallback(async () => {
        setLoading(true);
        try {
            const userId = session.user.id;

            // 1. Perfil (Datos manuales)
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            // 2. Historial de búsquedas (solar_analysis)
            const { data: searches } = await supabase
                .from('solar_analysis')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            // 3. Facturas (leads que pertenecen a este usuario)
            const { data: leads } = await supabase
                .from('leads')
                .select('*')
                .eq('userId', userId)
                .order('timestamp', { ascending: false });

            setUserData({
                fullName: profile?.full_name || '',
                email: profile?.email || session.user.email || '',
                phone: profile?.phone || '',
                address: profile?.address || '',
                invoices: (leads || []).filter(l => l.billFile), // Solo mostramos los que tienen factura/imagen
                history: searches || []
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, [session]);

    useEffect(() => {
        if (isOpen && session) {
            fetchUserData();
        }
    }, [isOpen, session, fetchUserData]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: session.user.id,
                    full_name: userData.fullName,
                    email: userData.email,
                    phone: userData.phone,
                    address: userData.address,
                    updated_at: new Date()
                });

            if (error) throw error;
            toast.success('Perfil actualizado');
        } catch (error) {
            toast.error('Error al guardar');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileUploadStatus('uploading');
        const formData = new FormData();
        formData.append('bill', file);
        formData.append('fullName', userData.fullName || 'Usuario Dashboard');
        formData.append('email', userData.email);
        formData.append('phone', userData.phone);
        formData.append('address', userData.address || 'Carga Directa Dashboard');
        formData.append('userId', session.user.id);

        try {
            const response = await fetch('http://localhost:5001/api/leads', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                toast.success('Factura subida');
                fetchUserData(); // Recargar historial de facturas
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            toast.error('Error al subir');
            console.error(error);
        } finally {
            setFileUploadStatus('idle');
        }
    };

    const tabs = [
        { id: 'profile', label: 'Datos', fullLabel: 'Mis Datos', icon: User },
        { id: 'invoices', label: 'Facturas', fullLabel: 'Mis Facturas', icon: FileText },
        { id: 'history', label: 'Búsq.', fullLabel: 'Mis Búsquedas', icon: History },
        { id: 'faq', label: 'Ayuda', fullLabel: 'FAQ', icon: HelpCircle },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[7000] flex items-end md:items-center justify-center">
            <Toaster position="top-right" />

            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />

            <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="relative w-full max-w-6xl h-[92vh] md:h-[85vh] bg-white text-black rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-[0_-20px_60px_rgba(0,0,0,0.4)]"
            >
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <div className="flex flex-col">
                        <span className="text-lg font-black tracking-tighter uppercase font-montserrat leading-tight text-black">
                            Consultoria.<span className="text-[#ff6a00]">Martin</span>
                        </span>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-50 rounded-full">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Sidebar (Desktop Only) */}
                <aside className="hidden md:flex w-80 bg-gray-50 border-r border-gray-100 p-8 flex-col">
                    <div className="mb-12">
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-black tracking-tighter">Consultoria.</span>
                            <span className="text-2xl font-black text-[#ff6a00] tracking-tighter mt-[-8px]">Martin</span>
                        </div>
                        <div className="flex items-center gap-2 mt-6">
                            <div className="w-8 h-[2px] bg-black/20"></div>
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Hub de Inteligencia</span>
                        </div>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-4 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-xl ${activeTab === tab.id
                                        ? 'bg-black text-white shadow-xl translate-x-1'
                                        : 'text-gray-400 hover:text-black hover:bg-gray-200/50'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.fullLabel}
                                </button>
                            );
                        })}
                    </nav>

                    <button
                        onClick={onLogout}
                        className="mt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#ff6a00] hover:scale-105 transition-all w-fit ml-6"
                    >
                        Cerrar Sesión
                    </button>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-16 bg-white pb-32 md:pb-16 flex flex-col">
                    <div className="hidden md:flex justify-between items-start mb-12">
                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-gray-800 border-b-2 border-black pb-2">
                            {tabs.find(t => t.id === activeTab).fullLabel}
                        </h3>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            {activeTab === 'profile' && (
                                <div className="max-w-xl">
                                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                                        <div>
                                            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-2 ml-1">Nombre Completo</label>
                                            <input
                                                type="text"
                                                value={userData.fullName}
                                                onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-black outline-none transition-all"
                                                placeholder="Nombre y apellidos..."
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-2 ml-1">Email de Contacto</label>
                                            <div className="relative">
                                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                                <input
                                                    type="email"
                                                    value={userData.email}
                                                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-14 pr-6 py-4 text-sm font-medium focus:ring-2 focus:ring-black outline-none transition-all"
                                                    placeholder="ejemplo@martin.com"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-2 ml-1">Teléfono</label>
                                                <div className="relative">
                                                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                                    <input
                                                        type="tel"
                                                        value={userData.phone}
                                                        onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-14 pr-6 py-4 text-sm font-medium focus:ring-2 focus:ring-black outline-none transition-all"
                                                        placeholder="600 000 000"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-2 ml-1">Dirección / Calle</label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                                    <input
                                                        type="text"
                                                        value={userData.address}
                                                        onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-14 pr-6 py-4 text-sm font-medium focus:ring-2 focus:ring-black outline-none transition-all"
                                                        placeholder="Calle, Número, Ciudad..."
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="w-full bg-black text-white rounded-2xl py-4 text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-gray-900 transition-all disabled:opacity-50"
                                        >
                                            {saving ? 'Guardando...' : 'Actualizar mis datos'}
                                        </button>
                                    </form>

                                    <div className="mt-12 p-8 bg-black/5 rounded-[2rem] border border-black/5 flex items-start gap-6">
                                        <div className="w-10 h-10 bg-black text-white rounded-2xl flex items-center justify-center shrink-0">
                                            <CheckCircle2 size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm mb-1">Protección de Datos Activa</h4>
                                            <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-tighter">Tus datos están protegidos por encriptación bancaria AES-256 y protocolos de seguridad Row Level Security (RLS).</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'invoices' && (
                                <div className="space-y-8">
                                    <div className="relative group p-8 md:p-12 border-2 border-dashed border-gray-200 rounded-[2rem] md:rounded-[2.5rem] bg-gray-50/50 hover:bg-white hover:border-black/30 transition-all text-center">
                                        <input
                                            type="file"
                                            onChange={handleFileUpload}
                                            disabled={fileUploadStatus === 'uploading'}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            accept="image/*,.pdf"
                                        />
                                        <div className="flex flex-col items-center">
                                            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                                                <Upload className="w-6 h-6 text-[#ff6a00]" />
                                            </div>
                                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-800">Cargar Nueva Factura</h4>
                                            <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-tight">Tap para seleccionar archivo</p>
                                        </div>
                                        {fileUploadStatus === 'uploading' && (
                                            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-20 rounded-[2rem] md:rounded-[2.5rem]">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-6 h-6 border-3 border-[#ff6a00] border-t-transparent rounded-full animate-spin"></div>
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Sincronizando...</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-4 px-2">Historial de Documentos</h4>
                                        {userData.invoices.length === 0 ? (
                                            <div className="text-center py-16 bg-gray-50 rounded-[2rem]">
                                                <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">No hay facturas guardadas</p>
                                            </div>
                                        ) : (
                                            userData.invoices.map((inv) => (
                                                <div key={inv.id || inv.timestamp} className="flex items-center justify-between p-5 md:p-6 bg-gray-50 rounded-2xl md:rounded-3xl border border-gray-100 group hover:bg-white transition-all shadow-sm">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0">
                                                            <FileText className="w-5 h-5 text-gray-400" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="font-bold text-gray-800 text-xs truncate max-w-[120px] md:max-w-none">{inv.address?.split(',')[0]}</h4>
                                                            <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">{new Date(inv.timestamp).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={inv.billFile && inv.billFile.startsWith('http') ? inv.billFile : `http://localhost:5001/${inv.billFile}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="shrink-0 p-3 md:px-6 md:py-3 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-xl"
                                                    >
                                                        {window.innerWidth > 768 ? 'Ver Documento' : <Upload className="w-4 h-4 rotate-180" />}
                                                    </a >
                                                </div >
                                            ))
                                        )}
                                    </div >
                                </div >
                            )}

                            {
                                activeTab === 'history' && (
                                    <div className="space-y-4">
                                        {userData.history.length === 0 ? (
                                            <p className="text-gray-400 text-center py-20 bg-gray-50 rounded-[2rem] text-xs uppercase tracking-widest">Historial vacío</p>
                                        ) : (
                                            userData.history.map((search) => (
                                                <div key={search.id} className="p-6 md:p-8 bg-gray-50 rounded-3xl border border-gray-100 space-y-4 hover:bg-white transition-all shadow-sm">
                                                    <p className="text-xs md:text-sm font-bold text-gray-800 leading-tight">{search.address}</p>
                                                    <div className="flex flex-wrap gap-3">
                                                        <span className="text-[8px] md:text-[9px] uppercase font-black text-gray-500 bg-white border border-gray-100 px-3 py-1.5 rounded-lg">{search.roof_area_m2}m²</span>
                                                        <span className="text-[8px] md:text-[9px] uppercase font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">+{search.annual_savings_eur}€/Año</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )
                            }

                            {
                                activeTab === 'faq' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                                        {[
                                            { q: "Seguridad Digital", a: "Tus datos están protegidos por encriptación bancaria y Row Level Security (RLS)." },
                                            { q: "Auditoría OCR", a: "Analizamos tu factura automáticamente para detectar anomalías de precio." },
                                            { q: "Borrado de Datos", a: "Puedes solicitar el borrado total de tu historial enviando un ticket." },
                                            { q: "Confirmación", a: "Asegúrate de confirmar tu email para recibir alertas en tiempo real." }
                                        ].map((item, i) => (
                                            <div key={i} className="p-8 bg-gray-50 border border-gray-100 rounded-[2rem] md:rounded-[2.5rem]">
                                                <h4 className="font-black tracking-tight text-base mb-3 text-black">{item.q}</h4>
                                                <p className="text-gray-500 text-[11px] leading-relaxed font-medium">{item.a}</p>
                                            </div>
                                        ))}
                                    </div>
                                )
                            }
                        </div >
                    )}
                </main >

                {/* Mobile Bottom Navigation */}
                < nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 px-4 py-3 pb-8 flex justify-around items-center z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]" >
                    {
                        tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex flex-col items-center gap-1.5 transition-all px-4 py-2 rounded-2xl ${activeTab === tab.id
                                        ? 'bg-black text-white'
                                        : 'text-gray-400'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-[8px] font-black uppercase tracking-widest">{tab.label}</span>
                                </button>
                            );
                        })
                    }
                    < button
                        onClick={onLogout}
                        className="flex flex-col items-center gap-1.5 text-red-400 px-3"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Salir</span>
                    </button >
                </nav >
            </motion.div >
        </div >
    );
};

export default UserDashboard;
