
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Cpu, Globe, ArrowRight } from 'lucide-react';
import EducationalWrapper from '../components/EducationalWrapper';

const CryptoBasics: React.FC = () => {
    const navigate = useNavigate();

    const sections = [
        {
            icon: Globe,
            title: "Decentralization",
            content: "Unlike traditional banking, crypto operates on a peer-to-peer network. No single entity controls your funds, making the system immune to centralized failures or censorship."
        },
        {
            icon: Shield,
            title: "Immutable Ledger",
            content: "Every transaction is cryptographically recorded in a 'block'. Once confirmed, it's impossible to alter, ensuring 100% transparency and trust without intermediaries."
        },
        {
            icon: Cpu,
            title: "Smart Contracts",
            content: "Self-executing code that handles agreements automatically. This removes the need for lawyers or brokers, reducing costs and human error in the digital economy."
        }
    ];

    return (
        <EducationalWrapper
            title="The Crypto Foundation"
            description="Understanding the core pillars of the decentralized revolution."
        >
            <div className="grid gap-8">
                {sections.map((section, idx) => (
                    <motion.div
                        key={section.title}
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        viewport={{ once: true }}
                        className="flex flex-col md:flex-row gap-6 items-start p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all group"
                    >
                        <div className="p-4 bg-indigo-500/10 rounded-xl group-hover:scale-110 transition-transform">
                            <section.icon className="text-indigo-400 w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">{section.title}</h3>
                            <p className="text-slate-400 leading-relaxed text-sm">
                                {section.content}
                            </p>
                        </div>
                    </motion.div>
                ))}

                <motion.div
                    className="mt-8 flex justify-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <button
                        onClick={() => navigate('/cryptography')}
                        className="glow-btn bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-2xl flex items-center gap-3 transition-all"
                    >
                        <span>Step 2: Security & CBC</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </motion.div>
            </div>
        </EducationalWrapper>
    );
};

export default CryptoBasics;
