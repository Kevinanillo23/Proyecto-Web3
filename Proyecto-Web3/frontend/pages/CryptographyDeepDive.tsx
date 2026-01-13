
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Layers, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import EducationalWrapper from '../components/EducationalWrapper';

const CryptographyDeepDive: React.FC = () => {
    const navigate = useNavigate();

    return (
        <EducationalWrapper
            title="CBC Cryptography"
            description="Why Cipher Block Chaining (CBC) is the backbone of secure digital assets."
        >
            <div className="space-y-12">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Layers className="text-indigo-400" />
                            Block Chaining Logic
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            In CBC mode, each block of encrypted data depends on the previous one. This creates a
                            <span className="text-indigo-300 font-mono"> cryptographic dependency</span> that makes pattern recognition
                            statistically impossible for an attacker.
                        </p>
                        <div className="p-5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                            <div className="flex gap-2 mb-3">
                                <div className="w-3 h-3 rounded-full bg-indigo-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-indigo-500/30"></div>
                                <div className="w-3 h-3 rounded-full bg-indigo-500/10"></div>
                            </div>
                            <p className="text-xs text-indigo-200 font-mono uppercase tracking-widest">Initialization Vector (IV) Applied</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                            <ShieldCheck className="text-emerald-400" />
                            Primary Benefits
                        </h3>
                        <ul className="space-y-4">
                            {[
                                { title: "Data Integrity", desc: "Small changes in plaintext lead to massive changes in ciphertext." },
                                { title: "Anti-Replay", desc: "Each session is unique, preventing 'double decryption' attacks." },
                                { title: "AES Standard", desc: "World-class encryption trusted by governments and protocols." }
                            ].map((item, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + (i * 0.1) }}
                                    className="flex gap-3 items-start"
                                >
                                    <Zap className="text-yellow-400 w-4 h-4 mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="text-white font-semibold text-sm">{item.title}</h4>
                                        <p className="text-slate-500 text-xs">{item.desc}</p>
                                    </div>
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-indigo-500"></div>
                            <Lock className="text-indigo-400 animate-pulse" />
                            <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-indigo-500"></div>
                        </div>

                        <p className="text-slate-400 text-center text-sm mb-10 max-w-lg">
                            Now that your node understands the security protocols, it's time to monitor your assets in real-time.
                        </p>

                        <motion.button
                            onClick={() => navigate('/dashboard')}
                            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 px-10 rounded-2xl flex items-center gap-4 transition-all shadow-xl shadow-emerald-500/20"
                        >
                            <span>Initialize Live Tracker</span>
                            <ArrowRight className="w-6 h-6" />
                        </motion.button>
                    </div>
                </div>
            </div>
        </EducationalWrapper>
    );
};

export default CryptographyDeepDive;
