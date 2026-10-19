import React, { useState } from 'react';
import { X, ShieldCheck, Check, Copy, Download, Sparkles, Award, ExternalLink, Code2 } from 'lucide-react';
import type { Language } from '../utils/translations.ts';

interface TrustBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  storeName?: string;
}

export const TrustBadgeModal: React.FC<TrustBadgeModalProps> = ({
  isOpen,
  onClose,
  lang,
  storeName = 'Your Store Name',
}) => {
  const [customStore, setCustomStore] = useState(storeName || 'WebXpress Hub');
  const [badgeTheme, setBadgeTheme] = useState<'cyan' | 'gold' | 'emerald' | 'minimal'>('cyan');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const embedCode = `<div style="display:inline-flex;align-items:center;gap:10px;padding:8px 16px;background:#070b14;border:1px solid #06b6d4;border-radius:12px;color:#fff;font-family:sans-serif;box-shadow:0 8px 24px rgba(6,182,212,0.15)">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  <div>
    <div style="font-size:11px;font-weight:700;color:#fff">${customStore}</div>
    <div style="font-size:9px;color:#38bdf8;font-weight:600">VERIFIED BY XBZ INTELLIGENCE · FRAUD PROTECTED</div>
  </div>
</div>`;

  const copyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl p-6 sm:p-7 rounded-3xl bg-[#0d1527] border border-cyan-500/30 shadow-2xl shadow-cyan-950/70 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{lang === 'bn' ? 'মার্চেন্ট ট্রাস্ট সিল / ব্যাজ জেনারেটর' : 'Merchant Trust Badge Generator'}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                PRO SEAL
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'bn'
                ? 'আপনার ফেসবুক পেজ, ওয়েবসাইট বা শপিফাই/ওয়ার্ডপ্রেসে “Protected by XBZ Intelligence” ব্যাজ প্রদর্শন করুন'
                : 'Display official XBZ Intelligence fraud protection badge on your store & social media'}
            </p>
          </div>
        </div>

        <div className="space-y-5 text-xs">
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                {lang === 'bn' ? 'আপনার শপ / পেজের নাম:' : 'Store / Brand Name:'}
              </label>
              <input
                type="text"
                value={customStore}
                onChange={(e) => setCustomStore(e.target.value)}
                placeholder="My Store BD"
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 text-white px-3.5 py-2.5 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                {lang === 'bn' ? 'ডিজাইন থিম নির্বাচন করুন:' : 'Badge Design Theme:'}
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'cyan', label: 'Cyan', color: 'bg-cyan-500' },
                  { id: 'gold', label: 'Gold', color: 'bg-amber-400' },
                  { id: 'emerald', label: 'Green', color: 'bg-emerald-400' },
                  { id: 'minimal', label: 'Dark', color: 'bg-slate-700' },
                ].map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setBadgeTheme(th.id as any)}
                    className={`py-2 px-1 rounded-xl border text-center transition-all ${
                      badgeTheme === th.id
                        ? 'border-cyan-400 bg-cyan-950/40 text-white font-bold'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${th.color} inline-block mb-0.5`} />
                    <span className="block text-[10px]">{th.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Preview Area */}
          <div>
            <label className="text-slate-400 font-semibold block mb-2 uppercase tracking-wider text-[11px]">
              {lang === 'bn' ? 'লাইভ ব্যাজ প্রিভিউ:' : 'Live Badge Preview:'}
            </label>

            <div className="p-8 rounded-2xl bg-[#070b14] border border-slate-800 flex items-center justify-center">
              {/* Badge Element */}
              <div className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-center gap-4 shadow-2xl ${
                badgeTheme === 'cyan'
                  ? 'bg-gradient-to-r from-[#0d1e38] to-[#070b14] border-cyan-400/50 shadow-cyan-950/80 ring-1 ring-cyan-500/20'
                  : badgeTheme === 'gold'
                  ? 'bg-gradient-to-r from-[#241c0e] to-[#0d0f17] border-amber-400/50 shadow-amber-950/80 ring-1 ring-amber-500/20'
                  : badgeTheme === 'emerald'
                  ? 'bg-gradient-to-r from-[#0d261e] to-[#070b14] border-emerald-400/50 shadow-emerald-950/80 ring-1 ring-emerald-500/20'
                  : 'bg-slate-900 border-slate-700 shadow-slate-950'
              }`}>
                <div className={`p-3 rounded-xl border shrink-0 ${
                  badgeTheme === 'cyan'
                    ? 'bg-cyan-950 text-cyan-400 border-cyan-500/40'
                    : badgeTheme === 'gold'
                    ? 'bg-amber-950 text-amber-400 border-amber-500/40'
                    : badgeTheme === 'emerald'
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  <ShieldCheck className="w-8 h-8" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-extrabold text-white tracking-wide">
                      {customStore}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${
                      badgeTheme === 'cyan' ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30' :
                      badgeTheme === 'gold' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' :
                      'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                    }`}>
                      VERIFIED
                    </span>
                  </div>

                  <p className="text-[11px] font-bold text-slate-200 mt-0.5">
                    PROTECTED BY XBZ INTELLIGENCE
                  </p>

                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                    <span>100% COD Fraud Shield</span>
                    <span>•</span>
                    <span className="text-cyan-400">ID: XBZ-{(customStore.length * 891 + 1042).toString(16).toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Embed Code Snippet */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>{lang === 'bn' ? 'ওয়েবসাইটে যুক্ত করার HTML কোড:' : 'HTML Embed Code for Your Store:'}</span>
              </label>

              <button
                type="button"
                onClick={copyEmbed}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? (lang === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (lang === 'bn' ? 'কোড কপি করুন' : 'Copy Code')}</span>
              </button>
            </div>

            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap select-all">
              {embedCode}
            </pre>
          </div>

          {/* Advice */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 text-[11px] leading-relaxed">
            {lang === 'bn'
              ? '💡 টিপস: ফেসবুক পেজের কভার ফটো, বায়ো বা ওয়েবসাইটের ফুটার/চেকআউট পেজে এই ট্রাস্ট সিল ব্যবহার করলে ক্রেতাদের আস্থা বৃদ্ধি পায় এবং অর্ডার ড্রপআউট কমে।'
              : '💡 Tip: Displaying this trust badge on your website checkout or social media increases customer trust and reduces order dropouts.'}
          </div>
        </div>
      </div>
    </div>
  );
};
