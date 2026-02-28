import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LegalModal = ({ isOpen, onClose, title, content }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[6000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-[#000810] border border-white/10 p-8 rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto custom-scrollbar relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                        <h2 className="text-2xl font-black text-white mb-8 tracking-tighter uppercase font-montserrat">{title}</h2>
                        <div className="space-y-6 text-white/60 text-xs leading-relaxed tracking-wide font-light">
                            {content}
                        </div>
                        <div className="mt-12 pt-6 border-t border-white/5 text-center">
                            <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-white/20 italic">
                                Sincronizado v2.0 • Consultoria.Martin
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export const Terms = ({ isOpen, onClose }) => {
    const content = (
        <>
            <p className="font-bold text-white uppercase text-[10px] tracking-widest mb-2">1. Aceptación de los Términos</p>
            <p>Al acceder y utilizar este simulador de auditoría energética, usted acepta estar sujeto a estos términos y condiciones. Este software es una herramienta de estimación técnica y no constituye un contrato vinculante de ahorro garantizado hasta que haya una revisión física por nuestros técnicos.</p>

            <p className="font-bold text-white uppercase text-[10px] tracking-widest mb-2">2. Uso del Simulador</p>
            <p>Los datos proporcionados por el simulador (área útil, generación estimada, ahorro anual) se basan en algoritmos de precisión LiDAR y datos históricos de radiación. Sin embargo, factores locales como sombras proyectadas no detectadas o inclinaciones específicas pueden variar el resultado final.</p>

            <p className="font-bold text-white uppercase text-[10px] tracking-widest mb-2">3. Propiedad Intelectual</p>
            <p>Todo el diseño visual, algoritmos de cálculo y marca Consultoria.Martin son propiedad exclusiva. Queda prohibida la reproducción total o parcial del código o interfaz sin autorización.</p>

            <p className="font-bold text-white uppercase text-[10px] tracking-widest mb-2">4. Limitación de Responsabilidad</p>
            <p>Consultoria.Martin no se hace responsable de decisiones financieras tomadas basadas exclusivamente en la simulación online sin la validación técnica oficial posterior de uno de nuestros ingenieros.</p>
        </>
    );

    return <LegalModal isOpen={isOpen} onClose={onClose} title="Términos y Condiciones" content={content} />;
};

export const Privacy = ({ isOpen, onClose }) => {
    const content = (
        <>
            <p className="font-bold text-white uppercase text-[10px] tracking-widest mb-2">1. Recopilación de Datos</p>
            <p>Recopilamos información básica para realizar el análisis: nombre, teléfono, CUPS (opcional) y dirección. También procesamos los documentos subirda para la auditoría mediante tecnología OCR para extraer datos de consumo y potencia.</p>

            <p className="font-bold text-white uppercase text-[10px] tracking-widest mb-2">2. Finalidad del Tratamiento</p>
            <p>Sus datos son utilizados exclusivamente para: 1. Realizar el estudio de ahorro personalizado. 2. Contactar con usted para presentarle los resultados. 3. Gestionar la instalación en caso de que decida proceder.</p>

            <p className="font-bold text-white uppercase text-[10px] tracking-widest mb-2">3. No Venta de Datos</p>
            <p>Consultoria.Martin se compromete solemnemente a no vender ni ceder sus datos personales a terceros con fines publicitarios. Sus datos están seguros en nuestra infraestructura cifrada.</p>

            <p className="font-bold text-white uppercase text-[10px] tracking-widest mb-2">4. Derechos del Usuario</p>
            <p>Puede solicitar el acceso, rectificación o eliminación de sus datos en cualquier momento enviando un correo a nuestro equipo de auditoría.</p>
        </>
    );

    return <LegalModal isOpen={isOpen} onClose={onClose} title="Política de Privacidad" content={content} />;
};
