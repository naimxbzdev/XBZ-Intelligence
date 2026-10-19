import React from 'react';
import { Lock, Sparkles, Check, ArrowRight, ShieldCheck, Smartphone, Zap, Tag } from 'lucide-react';
import type { Language } from '../utils/translations.ts';

interface PlanGatePaywallProps {
  featureTitle: string;
  featureDesc: string;
  lang: Language;
  onOpenPaymentModal: () => void;
  onInstantUnlockTest: () => void;
  onViewPricing?: () => void;
}

export const PlanGatePaywall: React.FC<PlanGatePaywallProps> = ({
  featureTitle,
  featureDesc,
  lang,
  onOpenPaymentModal,
  onInstantUnlockTest,
  onViewPricing,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#0e1c33] via-[#0d1527] to-[#070b14] border border-cyan-500/30 shadow-2xl shadow-cyan-950/60 relative overflow-hidden">
        {/* Glowing aura */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none -z-10" />

        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-400/40 text-cyan-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-cyan-500/20">
          <Lock className="w-8 h-8" />
        </div>

        {/* Headline */}
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 block mb-2">
          {lang === 'bn' ? 'মার্চেন্ট প্ল্যান আবশ্যক (Merchant Plan Required)' : 'Merchant Plan Required'}
        </span>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          {featureTitle}
        </h2>

        <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          {featureDesc}
        </p>

        {/* Payment Numbers Strip */}
        <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 p-2 px-3 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-300">
          <span className="font-semibold text-white">{lang === 'bn' ? 'সেন্ড মানি নম্বর:' : 'Send Money:'}</span>
          <span className="text-pink-300 font-mono font-bold">🌸 বিকাশ 01703223141</span>
          <span>·</span>
          <span className="text-orange-300 font-mono font-bold">🟠 নগদ 01703223141</span>
          <span>·</span>
          <span className="text-purple-300 font-mono font-bold">🟣 রকেট 017032231418</span>
        </div>

        {/* Unlocked Features Highlights */}
        <div className="mt-7 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 max-w-lg mx-auto text-left space-y-2.5 text-xs text-slate-300">
          <span className="font-bold text-white block mb-2 uppercase tracking-wider text-[11px] text-cyan-300">
            {lang === 'bn' ? 'মার্চেন্ট প্রো (৳৪৯৯/মাস) প্ল্যানে যা যা পাবেন:' : 'Unlocked with Merchant Pro (৳499/mo):'}
          </span>

          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{lang === 'bn' ? 'বাল্ক সার্চ ও একসাথে ৩০টি নম্বর ফ্রড স্ক্রিনিং + CSV ডাউনলোড' : 'Bulk verification & unlimited CSV exports'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{lang === 'bn' ? 'কমিউনিটি প্রতারক ডাটাবেস সম্পূর্ণ এক্সেস ও অভিযোগ ট্র্যাকিং' : 'Full community fraud registry search & reporting'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{lang === 'bn' ? '৫টি কুরিয়ার রিয়েল-টাইম গেটওয়ে ও টেকনিক্যাল স্পেক্স' : '5 Couriers live technical status & specs'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{lang === 'bn' ? 'REST API এক্সেস, WooCommerce ও Shopify প্লাগইন কোড' : 'REST API token & WooCommerce integration'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onOpenPaymentModal}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition-all flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/30 active:scale-98"
          >
            <Smartphone className="w-4 h-4" />
            <span>
              {lang === 'bn' ? 'বিকাশ / নগদ / রকেট দিয়ে এখনই কিনুন' : 'Buy Now with bKash / Nagad / Rocket'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {onViewPricing && (
            <button
              onClick={onViewPricing}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'bn' ? 'প্যাকেজের মূল্য তালিকা দেখুন' : 'View Pricing Plans'}</span>
            </button>
          )}

          <button
            onClick={onInstantUnlockTest}
            className="w-full sm:w-auto px-4 py-3.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 transition-colors flex items-center justify-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {lang === 'bn' ? '১-ক্লিকে ডেমো টেস্ট আনলক' : '1-Click Instant Test Unlock'}
            </span>
          </button>
        </div>

        <p className="text-[11px] text-slate-500 mt-4">
          {lang === 'bn' 
            ? 'পেমেন্ট সাবমিট করার সাথে সাথেই সিস্টেম স্বয়ংক্রিয়ভাবে ফিচারগুলো আনলক করে দেয়।' 
            : 'Features are instantly unlocked upon submitting transaction details.'}
        </p>
      </div>
    </div>
  );
};
