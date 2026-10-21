import React, { useState, useEffect } from 'react';
import { X, User, Key, Check, Copy, LogOut, Loader2, Store, Mail, Phone, Sparkles, ShieldCheck, Lock } from 'lucide-react';
import type { Language } from '../utils/translations.ts';
import { BrandLogo } from './BrandLogo.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  user: any;
  setUser: (user: any) => void;
  initialMode?: 'login' | 'register' | 'admin';
  isFromLimitBlock?: boolean;
  onAdminLoginSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  lang,
  user,
  setUser,
  initialMode = 'login',
  isFromLimitBlock = false,
  onAdminLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'admin'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
    setError(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  // Merchant or Admin Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let targetEmail = email.trim();
      // Handle admin shorthand aliases
      if (mode === 'admin') {
        if (targetEmail.toLowerCase() === 'naimxbz' || targetEmail.toLowerCase() === 'naim') {
          targetEmail = 'naimxbz@gmail.com';
        } else if (targetEmail.toLowerCase() === 'xbz.dev' || targetEmail.toLowerCase() === 'xbz') {
          targetEmail = 'xbz.dev@gmail.com';
        }
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: password.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      setUser(data.user);
      localStorage.setItem('xbz_user', JSON.stringify(data.user));

      // If logged in user is admin, trigger redirect/tab switch to admin
      if (data.isAdmin || ['naimxbz@gmail.com', 'xbz.dev@gmail.com'].includes(data.user.email?.toLowerCase())) {
        if (onAdminLoginSuccess) {
          onAdminLoginSuccess();
        }
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Error logging in');
    } finally {
      setLoading(false);
    }
  };

  // Real User Registration handler (Persists in userDb and localStorage)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          storeName: storeName.trim(),
          phone: phone.trim() || '01700000000',
          password: password.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setUser(data.user);
      localStorage.setItem('xbz_user', JSON.stringify(data.user));

      // Append to registered users list in localStorage for Admin Dashboard
      try {
        const stored = localStorage.getItem('xbz_registered_users');
        const list = stored ? JSON.parse(stored) : [];
        if (!list.some((u: any) => u.email.toLowerCase() === data.user.email.toLowerCase())) {
          list.unshift({
            id: data.user.id || 'usr_' + Date.now(),
            name: data.user.name,
            email: data.user.email,
            phone: phone.trim() || '01700000000',
            storeName: data.user.storeName,
            role: 'merchant',
            plan: data.user.plan || 'Free Starter (100 checks/mo)',
            planId: 'free',
            status: 'approved',
            checksRemaining: data.user.checksRemaining || 100,
            apiKey: data.user.apiKey || 'fraud_live_' + Date.now(),
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          });
          localStorage.setItem('xbz_registered_users', JSON.stringify(list));
        }
      } catch {
        // ignore
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Error registering');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('xbz_user');
    onClose();
  };

  const copyApiKey = () => {
    if (user?.apiKey) {
      navigator.clipboard.writeText(user.apiKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-6 rounded-2xl bg-[#0d1527] border border-cyan-500/30 shadow-2xl shadow-cyan-950/60 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {user ? (
          /* Logged In View */
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-bold text-lg">
                {user.name ? user.name.charAt(0).toUpperCase() : 'M'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{user.name}</h3>
                  {['naimxbz@gmail.com', 'xbz.dev@gmail.com'].includes(user.email?.toLowerCase()) && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                      ADMIN
                    </span>
                  )}
                </div>
                <p className="text-xs text-cyan-400 font-medium">{user.storeName || 'Merchant Store'}</p>
                <p className="text-[11px] text-slate-400">{user.email}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>{lang === 'bn' ? 'সক্রিয় প্যাকেজ:' : 'Active Plan:'}</span>
                <span className="font-semibold text-emerald-400">{user.plan || 'Free Starter'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{lang === 'bn' ? 'অবশিষ্ট কোরি চেক:' : 'Remaining Checks:'}</span>
                <span className="font-mono text-cyan-300 font-bold tabular-nums">
                  {user.checksRemaining > 90000 ? 'Unlimited' : `${user.checksRemaining || 100} Checks`}
                </span>
              </div>
            </div>

            {/* Merchant API Key */}
            <div className="space-y-1.5 text-xs">
              <label className="text-slate-400 font-semibold block">
                {lang === 'bn' ? 'আপনার মার্চেন্ট এপিআই কি (REST API):' : 'Your Merchant API Key:'}
              </label>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-700">
                <span className="font-mono text-cyan-200 truncate text-[11px] flex-1">
                  {user.apiKey}
                </span>
                <button
                  onClick={copyApiKey}
                  className="p-1 text-slate-400 hover:text-white"
                  title="Copy API Key"
                >
                  {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'লগআউট' : 'Logout'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Authentication Forms */
          <div className="space-y-4">
            {/* Header Brand Logo */}
            <div className="flex items-center justify-between pb-1">
              <BrandLogo size="md" showTagline={false} />
              <span className="text-[11px] font-mono text-cyan-400 font-semibold">PORTAL</span>
            </div>

            {/* Limit Banner if opened due to reaching 3-search limit */}
            {isFromLimitBlock && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white font-semibold">
                    {lang === 'bn' ? 'গেস্ট সার্চ লিমিট (৩/৩) শেষ!' : 'Guest search limit (3/3) reached!'}
                  </strong>
                  <span>
                    {lang === 'bn' 
                      ? 'অ্যাকাউন্ট তৈরি করলেই প্রতি মাসে ১০০টি ফ্রি কুরিয়ার চেক উপভোগ করতে পারবেন।' 
                      : 'Create a free account to unlock 100 free courier checks per month.'}
                  </span>
                </div>
              </div>
            )}

            {/* Mode Selector Tabs (Clean segmented navigation) */}
            <div className="flex items-center p-1 bg-slate-900/90 border border-slate-800 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                  mode === 'login'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'bn' ? 'মার্চেন্ট লগইন' : 'Merchant Login'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                  mode === 'register'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'bn' ? 'নতুন অ্যাকাউন্ট' : 'Register'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('admin');
                  setError(null);
                }}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 ${
                  mode === 'admin'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-3 h-3 text-rose-400" />
                <span>{lang === 'bn' ? 'এডমিন লগইন' : 'Admin'}</span>
              </button>
            </div>

            {/* Section Heading */}
            <div className="border-b border-slate-800 pb-2.5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {mode === 'admin' ? (
                  <>
                    <ShieldCheck className="w-5 h-5 text-rose-400" />
                    <span>{lang === 'bn' ? 'সিস্টেম এডমিন পোর্টাল লগইন' : 'System Admin Portal Login'}</span>
                  </>
                ) : mode === 'register' ? (
                  <span>{lang === 'bn' ? 'বিনামূল্যে মার্চেন্ট অ্যাকাউন্ট খুলুন' : 'Create Free Merchant Account'}</span>
                ) : (
                  <span>{lang === 'bn' ? 'মার্চেন্ট অ্যাকাউন্টে প্রবেশ' : 'Sign in to Merchant Portal'}</span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {mode === 'admin'
                  ? (lang === 'bn' ? 'শুধুমাত্র অনুমোদিত এডমিন (naimxbz@gmail.com / xbz.dev@gmail.com)' : 'Strictly authorized administrators only')
                  : mode === 'register'
                  ? (lang === 'bn' ? '১০০টি ফ্রি চেক/মাস এবং নিজস্ব এপিআই কি' : '100 free checks/mo and merchant API key')
                  : (lang === 'bn' ? 'আপনার নিবন্ধিত ইমেইল ও পাসওয়ার্ড প্রদান করুন' : 'Enter your registered email and password')}
              </p>
            </div>

            {error && (
              <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 p-2.5 rounded-lg">
                {error}
              </p>
            )}

            {/* Main Form */}
            <form onSubmit={mode === 'register' ? handleRegister : handleLogin} className="space-y-3 text-xs">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="text-slate-300 block mb-1 font-medium">
                      {lang === 'bn' ? 'আপনার নাম *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Naeem Hasan"
                      className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-lg outline-none focus:border-cyan-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-medium">
                      {lang === 'bn' ? 'ই-কমার্স শপের নাম *' : 'Store / Brand Name *'}
                    </label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="WebXpress Hub"
                      className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-lg outline-none focus:border-cyan-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-medium">
                      {lang === 'bn' ? 'মোবাইল নম্বর (ঐচ্ছিক)' : 'Mobile Number (Optional)'}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-lg outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-slate-300 block mb-1 font-medium">
                  {mode === 'admin'
                    ? (lang === 'bn' ? 'এডমিন ইমেইল বা ইউজারনেম *' : 'Admin Username or Email *')
                    : (lang === 'bn' ? 'ইমেইল অ্যাড্রেস *' : 'Email Address *')}
                </label>
                <input
                  type={mode === 'admin' ? 'text' : 'email'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={mode === 'admin' ? 'naimxbz@gmail.com' : 'merchant@example.com'}
                  className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-lg outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">
                  {mode === 'admin'
                    ? (lang === 'bn' ? 'এডমিন সিক্রেট পাসওয়ার্ড *' : 'Admin Secret Password *')
                    : (lang === 'bn' ? 'পাসওয়ার্ড *' : 'Password *')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-lg outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mt-4 shadow-lg cursor-pointer ${
                  mode === 'admin'
                    ? 'text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-950/50'
                    : 'text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 shadow-cyan-500/20'
                }`}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>
                  {mode === 'admin'
                    ? (lang === 'bn' ? 'এডমিন প্যানেলে প্রবেশ করুন' : 'Authenticate as Admin')
                    : mode === 'register'
                    ? (lang === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন (১০০ ফ্রি চেক)' : 'Create Free Account (100 checks)')
                    : (lang === 'bn' ? 'লগইন করুন' : 'Sign In')}
                </span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
