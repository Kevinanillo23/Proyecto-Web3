
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ethers } from 'ethers';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ChevronRight, Loader2, Wallet, X } from 'lucide-react';

/**
 * Login component providing a secure entry point to the Nexus AI Terminal.
 * Handles credential submission via Axios and manages navigation to the registration flow.
 */
const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Forgot Password Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  /* 
   * Auto-redirect to dashboard disabled per user request to land on Login page first.
   */
  // React.useEffect(() => {
  //   if (isAuthenticated) {
  //     navigate('/dashboard', { replace: true });
  //   }
  // }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post('/api/users/auth', { email, password });
      login(data.token, data);
      navigate('/basics');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess(false);

    try {
      await axios.post('/api/users/forgotpassword', { email: forgotEmail });
      setForgotSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setForgotSuccess(false);
        setForgotEmail('');
      }, 3000);
    } catch (err: any) {
      setForgotError(err.response?.data?.message || 'Error sending recovery link.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="glass p-8 rounded-3xl shadow-2xl border border-white/10 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 blur-3xl rounded-full"></div>

          <div className="relative z-10">
            <div className="flex flex-col items-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4">
                <Lock className="text-white w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Nexus AI
              </h1>
              <p className="text-slate-400 mt-2 font-light">Secure Dashboard Access</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all"
                  />
                </div>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              {error && <p className="text-red-400 text-sm text-center font-medium animate-pulse">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="glow-btn w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 group transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center gap-4 text-sm">
              <p className="text-slate-500">
                Don't have an account? <Link to="/register" className="text-indigo-400 cursor-pointer hover:underline">Create Account</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass w-full max-w-sm p-8 rounded-3xl border border-white/10 relative shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/10 blur-2xl rounded-full"></div>

            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative z-10">
              <div className="flex flex-col items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-4 border border-indigo-500/20">
                  <Mail className="text-indigo-400 w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-white">Reset Password</h2>
                <p className="text-slate-400 text-sm mt-1 text-center leading-relaxed">
                  Enter your email to receive a secure recovery link.
                </p>
              </div>

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all text-sm"
                    />
                  </div>
                </div>

                {forgotError && <p className="text-red-400 text-xs text-center font-medium">{forgotError}</p>}
                {forgotSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-emerald-400 text-xs text-center animate-in slide-in-from-top-2">
                    Reset link sent! Check your email.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={forgotLoading || forgotSuccess}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 group"
                >
                  {forgotLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Send Recovery Link</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
