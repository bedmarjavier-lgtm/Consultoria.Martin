import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, FileText, HelpCircle, AlertTriangle, MapPin, Phone, Mail } from 'lucide-react';

const UserDashboard = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('profile');

    // Datos simulados basados en la captura del usuario
    const userData = {
        fullName: 'JAVIER BEDMAR MARTIN',
        email: 'bedmarjavier@gmail.com',
        phone: '+34 622 712 311',
        address: 'Calle Susana Benítez, Barrio de la Isla, Puente Genil, Córdoba, 14500, España',
        invoices: [
            { id: 'INV-2024-001', date: '27 Feb 2024', status: 'En revisión', file: 'Factura_Luz_Enero.pdf' },
            { id: 'INV-2024-002', date: '15 Feb 2024', status: 'Aprobada', file: 'Factura_Luz_Febrero.pdf' }
        ]
    };

    const tabs = [
        { id: 'profile', label: 'Mis Datos', icon: User },
        { id: 'invoices', label: 'Mis Facturas', icon: FileText },
        { id: 'faq', label: 'Preguntas Frecuentes', icon: HelpCircle },
        { id: 'troubleshooting', label: 'Ayuda Técnica', icon: AlertTriangle }
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[7000] flex items-center justify-center p-4 md:p-10">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-6xl h-full max-h-[850px] bg-white text-black rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
            >
                {/* Sidebar del estilo Gymshark */}
                <aside className="w-full md:w-80 bg-gray-50 border-r border-gray-100 p-8 flex flex-col">
                    <div className="mb-12">
                        <h2 className="text-3xl font-black text-black tracking-tighter leading-none mb-2">
                            {userData.fullName.split(' ')[0]}<br />
                            {userData.fullName.split(' ').slice(1).join(' ')}
                        </h2>
                        <div className="flex items-center gap-2 mt-4">
                            <div className="w-12 h-1 bg-black"></div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Consultor Nivel 1</span>
                        </div>
                    </div>

                    <nav className="flex-1 space-y-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-4 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab.id
                                            ? 'bg-black text-white shadow-lg translate-x-2'
                                            : 'text-gray-400 hover:text-black hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>

                    <button
                        onClick={onClose}
                        className="mt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
                    >
                        Cerrar Sesión
                    </button>
                </aside>

                {/* Área de Contenido Principal */}
                <main className="flex-1 overflow-y-auto p-8 md:p-16 bg-white">
                    <div className="flex justify-between items-start mb-12">
                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-gray-800 border-b-2 border-black pb-2">
                            {tabs.find(t => t.id === activeTab).label}
                        </h3>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="animate-fade-in">
                        {activeTab === 'profile' && (
                            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-8">
                                    <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                                        <div className="flex items-center gap-4 mb-4">
                                            <MapPin className="w-5 h-5 text-gray-400" />
                                            <span className="text-[10px] uppercase tracking-widest font-black text-gray-400">Dirección Completa</span>
                                        </div>
                                        <p className="text-lg font-bold leading-relaxed">{userData.address}</p>
                                    </div>
                                    <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                                        <div className="flex items-center gap-4 mb-4">
                                            <Phone className="w-5 h-5 text-gray-400" />
                                            <span className="text-[10px] uppercase tracking-widest font-black text-gray-400">Teléfono Movil</span>
                                        </div>
                                        <p className="text-lg font-bold">{userData.phone}</p>
                                    </div>
                                </div>
                                <div className="space-y-8">
                                    <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                                        <div className="flex items-center gap-4 mb-4">
                                            <Mail className="w-5 h-5 text-gray-400" />
                                            <span className="text-[10px] uppercase tracking-widest font-black text-gray-400">Email Corporativo</span>
                                        </div>
                                        <p className="text-lg font-bold">{userData.email}</p>
                                    </div>
                                    <div className="p-8 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center">
                                        <p className="text-xs text-gray-400 mb-4">¿Quieres cambiar tus datos?</p>
                                        <button className="px-8 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform">
                                            Editar Perfil
                                        </button>
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeTab === 'invoices' && (
                            <div className="space-y-4">
                                <p className="text-xs text-gray-400 mb-8 tracking-widest uppercase">Gestiona tus documentos subidos</p>
                                {userData.invoices.map((inv) => (
                                    <div key={inv.id} className="flex flex-col md:flex-row items-center justify-between p-8 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-black transition-all">
                                        <div className="flex items-center gap-6 mb-4 md:mb-0">
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                                <FileText className="w-6 h-6 text-black" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-black">{inv.id}</h4>
                                                <p className="text-xs text-gray-400">{inv.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-10">
                                            <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${inv.status === 'Aprobada' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                                }`}>
                                                {inv.status}
                                            </span>
                                            <button className="text-[10px] font-black uppercase tracking-widest border-b-2 border-transparent hover:border-black transition-all">
                                                Descargar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'faq' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { q: "¿Cómo se calcula el ahorro?", a: "Usamos algoritmos LiDAR de alta precisión para medir tu tejado y radiación local." },
                                    { q: "¿Qué subvenciones existen?", a: "Tramitamos los fondos Next Generation y bonificaciones de IBI según tu ayuntamiento." },
                                    { q: "¿Duración de la instalación?", a: "Normalmente entre 1 y 2 días para instalaciones residenciales estándar." },
                                    { q: "¿Garantía de los paneles?", a: "Ofrecemos 25 años de garantía de producto y rendimiento lineal." }
                                ].map((item, i) => (
                                    <div key={i} className="p-8 bg-white border border-gray-100 rounded-3xl hover:shadow-xl transition-all">
                                        <h4 className="font-bold text-lg mb-4 text-black">{item.q}</h4>
                                        <p className="text-gray-500 text-sm leading-relaxed">{item.a}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'troubleshooting' && (
                            <div className="space-y-8">
                                <div className="p-10 bg-red-50 border border-red-100 rounded-3xl">
                                    <div className="flex items-center gap-4 mb-6">
                                        <AlertTriangle className="w-8 h-8 text-red-500" />
                                        <h4 className="text-xl font-black text-red-900 uppercase tracking-tighter">Problemas Comunes</h4>
                                    </div>
                                    <ul className="space-y-4 text-red-800">
                                        <li className="flex gap-4">
                                            <span className="font-bold">01.</span>
                                            <span>El mapa no carga: Verifica tu conexión o refresca el navegador (Ctrl+R / Cmd+R).</span>
                                        </li>
                                        <li className="flex gap-4">
                                            <span className="font-bold">02.</span>
                                            <span>No reconoce mi dirección: Asegúrate de poner el municipio correcto. El LiDAR solo cubre zonas urbanas validadas.</span>
                                        </li>
                                        <li className="flex gap-4">
                                            <span className="font-bold">03.</span>
                                            <span>Error al subir factura: El archivo debe pesar menos de 5MB y ser PDF o imagen (JPG/PNG).</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="p-10 bg-gray-900 text-white rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div>
                                        <h4 className="text-xl font-black uppercase tracking-tighter mb-2">¿Necesitas soporte humano?</h4>
                                        <p className="text-gray-400 text-sm">Nuestro equipo técnico está operativo de 8:00 a 20:00.</p>
                                    </div>
                                    <button className="px-10 py-5 bg-white text-black text-xs font-black uppercase tracking-[0.2em] rounded-full hover:scale-105 transition-transform">
                                        Contactar Soporte
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </motion.div>
        </div>
    );
};

export default UserDashboard;
