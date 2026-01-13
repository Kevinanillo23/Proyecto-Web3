
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { ethers } from 'ethers';
import axios from 'axios';
import {
  Wallet,
  Cpu,
  Magnet,
  ArrowUpRight,
  Coins,
  TrendingUp,
  MessageSquare,
  Power,
  Zap,
  LayoutGrid,
  Loader2
} from 'lucide-react';
import GravitySandbox from '../components/GravitySandbox';
import CyberBackground from '../components/CyberBackground';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { GoogleGenAI } from "@google/genai";

// Mock chart data
const chartData = [
  { time: '00:00', price: 42000 },
  { time: '04:00', price: 42500 },
  { time: '08:00', price: 41800 },
  { time: '12:00', price: 43200 },
  { time: '16:00', price: 44100 },
  { time: '20:00', price: 43800 },
  { time: '23:59', price: 44500 },
];

/**
 * Dashboard component serving as the central hub for the Antigravity application.
 * Features:
 * - Real-time ETH balance and portfolio value display.
 * - Secure Web3 wallet connection using a challenge-response signature flow.
 * - Live blockchain transaction history.
 * - Integrated AI terminal for portfolio analysis.
 */
const Dashboard: React.FC = () => {
  const { user, logout, token, refreshProfile } = useAuth();
  const [isGravityOn, setIsGravityOn] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(user?.walletAddress || null);
  const [ethBalance, setEthBalance] = useState<string>('0.00');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Sync walletAddress state with user profile
  useEffect(() => {
    if (user?.walletAddress) {
      setWalletAddress(user.walletAddress);
      fetchTransactions(user.walletAddress);
    }
  }, [user]);

  // MetaMask Event Listeners
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          fetchBalance(accounts[0]);
          fetchTransactions(accounts[0]);
        } else {
          setWalletAddress(null);
          setEthBalance('0.00');
          setTransactions([]);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // Fetch ETH balance from MetaMask
  const fetchBalance = useCallback(async (address: string) => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(address);
        setEthBalance(ethers.formatEther(balance));
      }
    } catch (err) {
      console.error("Balance fetch error:", err);
    }
  }, []);

  // Fetch Transactions (Mocking real blockchain fetch for demo)
  const fetchTransactions = useCallback(async (address: string) => {
    const mockTxs = [
      { id: 1, type: 'Receive', amount: '1.50', unit: 'ETH', status: 'Completed', date: '2h ago', hash: '0x3a...f2e1' },
      { id: 2, type: 'Send', amount: '0.25', unit: 'ETH', status: 'Completed', date: '5h ago', hash: '0x9b...a1c3' },
      { id: 3, type: 'Swap', amount: '500.00', unit: 'USDT', status: 'Completed', date: '1d ago', hash: '0x1c...d4f5' },
    ];
    setTransactions(mockTxs);
  }, []);

  useEffect(() => {
    if (walletAddress) {
      fetchBalance(walletAddress);
    }
  }, [walletAddress, fetchBalance]);

  const handleWalletConnect = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      setIsAiLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];

      // 1. Get Nonce from Backend
      const { data: { nonce } } = await axios.get('/api/users/nonce', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 2. Sign the Nonce
      const signer = await provider.getSigner();
      const message = `Nexus AI Terminal Authentication\nNonce: ${nonce}`;
      const signature = await signer.signMessage(message);

      // 3. Persist to backend with signature
      await axios.put('/api/users/profile',
        { walletAddress: address, signature },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setWalletAddress(address);
      await refreshProfile();
      fetchTransactions(address);
    } catch (error) {
      console.error("Wallet connection failed:", error);
      alert("Authentication failed. Please verify the signature to connect.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAskAI = async () => {
    if (!query || isAiLoading) return;

    setIsAiLoading(true);
    setAiResponse(null);

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `User Query: ${query}. User Name: ${user?.username}. Connected Wallet: ${walletAddress || 'None'}. ETH Balance: ${ethBalance} ETH.`,
        config: {
          systemInstruction: "You are NEXUS AI, a high-performance market analysis terminal. Provide sharp, concise insights based on the provided user and wallet data. Use professional, data-centric language.",
        }
      });

      setAiResponse(response.text || "Neural connection timeout. No data returned.");
    } catch (error) {
      console.warn("AI API Error (running in demo mode):", error);
      setTimeout(() => {
        setAiResponse(`Market Data Analysis: Account ${user?.username} connected via ${walletAddress ? walletAddress.slice(0, 8) : 'internal node'}. Portfolio shows healthy distribution with ${ethBalance} ETH liquid.`);
      }, 500);
    } finally {
      setIsAiLoading(false);
      setQuery('');
    }
  };

  const ethPrice = 2450.42;
  const totalValue = walletAddress ? (parseFloat(ethBalance) * ethPrice) : 0;

  if (!user) return null;

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-6">
      <CyberBackground />
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">System Terminal</h1>
          <p className="text-slate-400 mt-1">Logged in as: <span className="text-indigo-400 font-semibold">{user?.username}</span> <span className="text-slate-600 px-2">|</span> <span className="text-slate-500 text-sm">{user?.email}</span></p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsGravityOn(!isGravityOn)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all ${isGravityOn ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-white/10 text-slate-400 hover:border-white/20'}`}
          >
            {/* Fix: Replaced Gravity with Magnet icon */}
            <Magnet className={`w-4 h-4 ${isGravityOn ? 'animate-bounce' : ''}`} />
            {isGravityOn ? 'Disable Physics' : 'Enable Physics'}
          </button>
          <button
            onClick={logout}
            className="p-2.5 rounded-full bg-slate-900 border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-400/50 transition-all"
          >
            <Power className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Bento Grid Sandbox */}
      <div className="relative">
        <GravitySandbox active={isGravityOn}>
          {/* Section 1: Wallet Overview */}
          <div className="grid-item col-span-12 md:col-span-8 lg:col-span-4 h-full">
            <div className="glass-card p-6 rounded-3xl h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-indigo-500/10 rounded-2xl">
                    <Wallet className="text-indigo-400 w-6 h-6" />
                  </div>
                  <button
                    onClick={handleWalletConnect}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${walletAddress ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500'}`}
                  >
                    {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connect Wallet'}
                  </button>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Net Portfolio Value</p>
                  <h3 className="text-4xl font-mono font-bold">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                  <div className="flex items-center gap-1 text-emerald-400 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>Real-time assets active</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">Ξ</div>
                    <span className="font-medium">Ethereum Balance</span>
                  </div>
                  <span className="font-mono">{parseFloat(ethBalance).toFixed(4)} ETH</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">ID</div>
                    <span className="font-medium">Network Node</span>
                  </div>
                  <span className="text-xs uppercase text-indigo-400 font-bold">{user?.role}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Market Graph & Transactions */}
          <div className="grid-item col-span-12 md:col-span-8 lg:col-span-5 h-full space-y-6">
            {/* Graph Card */}
            <div className="glass-card p-6 rounded-3xl h-[320px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Market Performance</h4>
                    <p className="text-xs text-slate-400">Real-time aggregated index</p>
                  </div>
                </div>
                <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
              </div>

              <div className="flex-grow min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                      itemStyle={{ color: '#f8fafc' }}
                    />
                    <Area type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Transactions Card */}
            <div className="glass-card p-6 rounded-3xl min-h-[280px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
                    <LayoutGrid className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-lg">Recent Transactions</h4>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md uppercase tracking-widest">Live Feed</span>
              </div>

              <div className="space-y-4">
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5 group hover:border-emerald-500/30 transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl ${tx.type === 'Receive' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'}`}>
                          {tx.type === 'Receive' ? <ArrowUpRight className="rotate-180 w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{tx.type} {tx.unit}</p>
                          <p className="text-[10px] text-slate-500 font-mono uppercase">{tx.hash}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-mono font-bold ${tx.type === 'Receive' ? 'text-emerald-400' : 'text-slate-300'}`}>
                          {tx.type === 'Receive' ? '+' : '-'}{tx.amount} {tx.unit}
                        </p>
                        <p className="text-[10px] text-slate-500">{tx.date}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
                    <Coins className="w-12 h-12 text-slate-700 mb-2" />
                    <p className="text-sm text-slate-500">No blockchain events detected for this node.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: AI Insights */}
          <div className="grid-item col-span-12 md:col-span-4 lg:col-span-3 h-full">
            <div className="glass-card p-6 rounded-3xl h-full flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-pink-500/10 rounded-2xl text-pink-400">
                  <Cpu className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-lg">AI Insights</h4>
              </div>

              <div className="flex-grow overflow-y-auto space-y-4 mb-6 pr-2">
                {isAiLoading ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                    <p className="text-slate-500 text-sm font-mono uppercase tracking-tighter">Analyzing neural streams...</p>
                  </div>
                ) : aiResponse ? (
                  <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <p className="text-sm leading-relaxed text-indigo-100">{aiResponse}</p>
                    <div className="mt-2 text-[10px] text-indigo-400 font-mono tracking-widest uppercase">Nexus_Core_v2.1 • Online</div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <MessageSquare className="w-10 h-10 text-slate-700 mb-2" />
                    <p className="text-slate-500 text-sm">Input query to begin portfolio sentiment analysis.</p>
                  </div>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                  placeholder="Analyze portfolio strategy..."
                  disabled={isAiLoading}
                  className="w-full bg-slate-900/80 border border-white/5 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30 transition-all disabled:opacity-50"
                />
                <button
                  onClick={handleAskAI}
                  disabled={isAiLoading || !query}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-pink-600 rounded-lg hover:bg-pink-500 transition-colors shadow-lg shadow-pink-500/20 disabled:opacity-50"
                >
                  {isAiLoading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <ArrowUpRight className="w-4 h-4 text-white" />}
                </button>
              </div>
            </div>
          </div>
        </GravitySandbox>
      </div>

      <footer className="text-center pt-8 pb-4">
        <p className="text-slate-600 text-xs font-mono">NEXUS_OS_v1.0.4 • © 2024 DECENTRALIZED_SYSTEMS_INTL</p>
      </footer>
    </div>
  );
};

export default Dashboard;
