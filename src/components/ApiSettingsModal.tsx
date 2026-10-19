import React, { useState, useEffect } from 'react';
import { X, Key, Shield, CheckCircle2, Loader2, Sparkles, Globe, Lock } from 'lucide-react';
import type { Language } from '../utils/translations.ts';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onConfigUpdated?: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  lang,
  onConfigUpdated,
}) => {
  const [smartposKey, setSmartposKey] = useState('');
  const [smartposDomain, setSmartposDomain] = useState('');
  const [steadfastKey, setSteadfastKey] = useState('');
  const [steadfastSecret, setSteadfastSecret] = useState('');
  const [pathaoClientId, setPathaoClientId] = useState('');
  const [pathaoClientSecret, setPathaoClientSecret] = useState('');
  const [redxToken, setRedxToken] = useState('');
  const [enableSandbox, setEnableSandbox] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/couriers/config')
        .then((res) => res.json())
        .then((data) => {
          if (data.enableSandbox !== undefined) {
            setEnableSandbox(data.enableSandbox);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = { enableSandbox };
      if (smartposKey) payload.smartposApiKey = smartposKey;
      if (smartposDomain) payload.smartposDomain = smartposDomain;
      if (steadfastKey) payload.steadfastApiKey = steadfastKey;
      if (steadfastSecret) payload.steadfastSecretKey = steadfastSecret;
      if (pathaoClientId) payload.pathaoClientId = pathaoClientId;
      if (pathaoClientSecret) payload.pathaoClientSecret = pathaoClientSecret;
      if (redxToken) payload.redxApiToken = redxToken;

      const res = await fetch('/api/couriers/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess(true);
        if (onConfigUpdated) onConfigUpdated();
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1500);
      }
    } catch (e) {
      // error handling
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg p-6 rounded-2xl bg-[#0d1527] border border-cyan-500/30 shadow-2xl shadow-cyan-950/60 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {lang === 'bn' ? 'মার্চেন্ট এপিআই কি সেটিংস' : 'Merchant API Key Settings'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'bn' ? 'X-API-KEY অথবা নিজস্ব কুরিয়ার ক্রেডেনশিয়াল যুক্ত করুন' : 'Configure X-API-KEY or private courier gateway tokens'}
            </p>
          </div>
        </div>

        {success ? (
          <div className="p-6 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">
              {lang === 'bn' ? 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'Settings Saved Successfully!'}
            </h4>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* Primary: SmartPOS Unified Fraud Screening API Key */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>X-API-KEY (সেন্ট্রাল ফ্রড চেকার টোকেন)</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-mono">
                  5 Couriers Live
                </span>
              </div>

              <input
                type="password"
                value={smartposKey}
                onChange={(e) => setSmartposKey(e.target.value)}
                placeholder="fraud_live_9a87d...your_merchant_token"
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 text-white px-3 py-2 rounded-lg font-mono outline-none"
              />

              <div className="pt-1">
                <label className="text-slate-400 font-semibold block mb-1">
                  {lang === 'bn' ? 'X-Domain (ডোমেন লক থাকলে)' : 'X-Domain (If domain-locked)'}
                </label>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={smartposDomain}
                    onChange={(e) => setSmartposDomain(e.target.value)}
                    placeholder="yourstore.com"
                    className="w-full bg-transparent text-white font-mono outline-none text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Sandbox Toggle */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{lang === 'bn' ? '১৫-দিনের লোকাল ক্যাশ ও ডেমো মোড' : '15-Day Local Cache & Sandbox'}</span>
                </span>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  {lang === 'bn' 
                    ? 'টোকেন ছাড়া দ্রুত সাব-২০ms রেসপন্স ও স্যাম্পল টেস্ট করতে সক্রিয় রাখুন।' 
                    : 'Provides sub-20ms instant verification fallback without waiting for live keys.'}
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableSandbox}
                  onChange={(e) => setEnableSandbox(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
              </label>
            </div>

            {/* Individual Courier Fallback Keys */}
            <div className="space-y-3 pt-2">
              <span className="text-slate-400 font-bold uppercase tracking-wider block text-[11px]">
                {lang === 'bn' ? 'বিকল্প কুরিয়ার এপিআই ক্রেডেনশিয়াল (ঐচ্ছিক)' : 'Individual Courier Fallback Keys (Optional)'}
              </span>

              {/* Steadfast */}
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
                <span className="font-bold text-white block">Steadfast Courier API</span>
                <div className="space-y-2">
                  <input
                    type="password"
                    value={steadfastKey}
                    onChange={(e) => setSteadfastKey(e.target.value)}
                    placeholder="Steadfast Api-Key"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 text-white px-3 py-1.5 rounded-lg font-mono outline-none"
                  />
                  <input
                    type="password"
                    value={steadfastSecret}
                    onChange={(e) => setSteadfastSecret(e.target.value)}
                    placeholder="Steadfast Secret-Key"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 text-white px-3 py-1.5 rounded-lg font-mono outline-none"
                  />
                </div>
              </div>

              {/* Pathao */}
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
                <span className="font-bold text-white block">Pathao Courier API</span>
                <div className="space-y-2">
                  <input
                    type="password"
                    value={pathaoClientId}
                    onChange={(e) => setPathaoClientId(e.target.value)}
                    placeholder="Pathao Client ID"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 text-white px-3 py-1.5 rounded-lg font-mono outline-none"
                  />
                  <input
                    type="password"
                    value={pathaoClientSecret}
                    onChange={(e) => setPathaoClientSecret(e.target.value)}
                    placeholder="Pathao Client Secret"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 text-white px-3 py-1.5 rounded-lg font-mono outline-none"
                  />
                </div>
              </div>

              {/* REDX */}
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
                <span className="font-bold text-white block">REDX API Token</span>
                <input
                  type="password"
                  value={redxToken}
                  onChange={(e) => setRedxToken(e.target.value)}
                  placeholder="REDX Bearer Token"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 text-white px-3 py-1.5 rounded-lg font-mono outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-cyan-950/20 text-cyan-300 text-[11px] border border-cyan-500/20">
              <Shield className="w-4 h-4 shrink-0" />
              <span>
                {lang === 'bn' 
                  ? 'আপনার এপিআই কি সুরক্ষিত সার্ভার মেমরিতে জমা থাকে, ব্রাউজারে কখনো এক্সপোজ হয় না।' 
                  : 'Keys are stored safely on the server side and never exposed in browser code.'}
              </span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800 transition-colors"
              >
                {lang === 'bn' ? 'বন্ধ করুন' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all flex items-center gap-2 disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>{lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Credentials'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
