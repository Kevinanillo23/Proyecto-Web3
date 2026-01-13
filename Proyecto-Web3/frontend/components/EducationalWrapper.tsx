
import React from 'react';
import { motion } from 'framer-motion';
import CyberBackground from './CyberBackground';

interface EducationalWrapperProps {
    children: React.ReactNode;
    title: string;
    description?: string;
}

const EducationalWrapper: React.FC<EducationalWrapperProps> = ({ children, title, description }) => {
    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-950 text-slate-50 selection:bg-indigo-500/30">
            <CyberBackground />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 max-w-4xl mx-auto px-6 py-16 md:py-24"
            >
                <div className="flex flex-col items-center mb-12 text-center">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-slate-400 mb-4">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-slate-400 text-lg max-w-2xl font-light">
                                {description}
                            </p>
                        )}
                    </motion.div>
                </div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="glass rounded-3xl border border-white/10 p-8 md:p-12 shadow-2xl relative overflow-hidden"
                >
                    {/* Decorative glows */}
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full"></div>
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/5 blur-3xl rounded-full"></div>

                    <div className="relative z-10">
                        {children}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default EducationalWrapper;
