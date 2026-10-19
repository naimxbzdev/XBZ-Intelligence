import React, { useState, useEffect } from 'react';
import { X, User, Key, Check, Copy, LogOut, Loader2, Store, Mail, Phone, Sparkles, ShieldCheck } from 'lucide-react';
import type { Language } from '../utils/translations.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  user: any;
  setUser: (user: any) => void;
  initialMode?: 'login' | 'register';
  isFromLimitBlock?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  lang,
  user,
  setUser,
  initialMode = 'login',
  isFromLimitBlock = false,
}) => {
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
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
      setIsRegister(initialMode === 'register');
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      setUser(data.user);
      localStorage.setItem('xbz_user', JSON.stringify(data.user));
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error logging in');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, storeName, phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setUser(data.user);
      localStorage.setItem('xbz_user', JSON.stringify(data.user));
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error registering');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('naeem@webxpress.com.bd');
    setPassword('demo123456');
    const demoUser = {
      id: 'usr_demo_882',
      name: 'Naeem Hasan',
      email: 'naeem@webxpress.com.bd',
      storeName: 'WebXpress BD Hub',
      apiKey: 'fraud_live_9a87d6e5c4b3a21098765432',
      plan: 'Free Starter (100 checks/mo)',
      checksRemaining: 100,
    };
    setUser(demoUser);
    localStorage.setItem('xbz_user', JSON.stringify(demoUser));
    onClose();
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
                <h3 className="text-base font-bold text-white">{user.name}</h3>
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
                  {user.checksRemaining || 100} / {user.plan?.includes('Pro') ? 2500 : 100}
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
                className="px-4 py-2 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'লগআউট' : 'Logout'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Login / Register Form */
          <div className="space-y-4">
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

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  {isRegister
                    ? (lang === 'bn' ? 'বিনামূল্যে মার্চেন্ট অ্যাকাউন্ট খুলুন' : 'Create Free Merchant Account')
                    : (lang === 'bn' ? 'মার্চেন্ট লগইন' : 'Merchant Login')}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isRegister 
                    ? (lang === 'bn' ? '১০০টি ফ্রি চেক/মাস এবং সুরক্ষিত মার্চেন্ট প্যানেল' : '100 free checks/mo & secure merchant panel') 
                    : (lang === 'bn' ? 'আপনার সংরক্ষিত ক্রেডেনশিয়াল দিয়ে প্রবেশ করুন' : 'Enter with your saved credentials')}
                </p>
              </div>

              <button
                onClick={() => setIsRegister(!isRegister)}
                className="text-xs text-cyan-400 hover:underline shrink-0"
              >
                {isRegister
                  ? (lang === 'bn' ? 'লগইন করুন' : 'Sign In')
                  : (lang === 'bn' ? 'নতুন অ্যাকাউন্ট' : 'Register')}
              </button>
            </div>

            {error && (
              <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 p-2.5 rounded-lg">
                {error}
              </p>
            )}

            <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-3 text-xs">
              {isRegister && (
                <>
                  <div>
                    <label className="text-slate-300 block mb-1">
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
                    <label className="text-slate-300 block mb-1">
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
                    <label className="text-slate-300 block mb-1">
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
                <label className="text-slate-300 block mb-1">
                  {lang === 'bn' ? 'ইমেইল অ্যাড্রেস *' : 'Email Address *'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="merchant@example.com"
                  className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-lg outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">
                  {lang === 'bn' ? 'পাসওয়ার্ড *' : 'Password *'}
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
                className="w-full py-2.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-cyan-500/20"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>
                  {isRegister
                    ? (lang === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন (১০০ ফ্রি চেক)' : 'Create Free Account (100 checks)')
                    : (lang === 'bn' ? 'লগইন করুন' : 'Sign In')}
                </span>
              </button>
            </form>

            {/* Quick Demo Login helper */}
            <div className="pt-2 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="text-xs text-slate-400 hover:text-cyan-300 transition-colors underline"
              >
                {lang === 'bn' ? '১-ক্লিকে ডেমো মার্চেন্ট অ্যাকাউন্ট দিয়ে ঢুকুন' : 'Sign in as Demo Merchant (1-Click)'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
