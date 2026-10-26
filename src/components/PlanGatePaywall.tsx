import React from 'react';
import { Lock, Check, ArrowRight, Smartphone, Tag, Clock, RefreshCw, MessageSquare } from 'lucide-react';
import type { Language } from '../utils/translations.ts';
import type { PaymentSubmission } from '../types/intelligence.ts';

interface PlanGatePaywallProps {
  featureTitle: string;
  featureDesc: string;
  lang: Language;
  onOpenPaymentModal: () => void;
  onViewPricing?: () => void;
  pendingPayment?: PaymentSubmission | null;
  onRefreshPaymentStatus?: () => void;
  isCheckingStatus?: boolean;
}

export const PlanGatePaywall: React.FC<PlanGatePaywallProps> = ({
  featureTitle,
  featureDesc,
  lang,
  onOpenPaymentModal,
  onViewPricing,
  pendingPayment,
  onRefreshPaymentStatus,
  isCheckingStatus = false,
}) => {
  const whatsappUrl = pendingPayment
    ? `https://wa.me/8801703223141?text=${encodeURIComponent(
        `আসসালামু আলাইকুম Naim Xbz ভাইয়া, আমি XBZ Intelligence-এ ${pendingPayment.planName} প্যাকেজের জন্য পেমেন্ট সাবমিট করেছি। TrxID: ${pendingPayment.transactionId}, প্রেরক নম্বর: ${pendingPayment.senderNumber}। দয়া করে প্যাকেজটি দ্রুত এক্টিভ করে দিন।`
      )}`
    : 'https://wa.me/8801703223141?text=Hello%20Naim%20Xbz,%20I%20want%20to%20activate%20a%20merchant%20package%20on%20XBZ%20Intelligence.';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#0e1c33] via-[#0d1527] to-[#070b14] border border-cyan-500/30 shadow-2xl shadow-cyan-950/60 relative overflow-hidden">
        {/* Ambient aura */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none -z-10" />

        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-400/40 text-cyan-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-cyan-500/20">
          <Lock className="w-8 h-8" />
        </div>

        {/* Headline */}
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 block mb-2">
          {lang === 'bn' ? 'মার্চেন্ট প্ল্যান আবশ্যক (পেইড ফিচার)' : 'Merchant Plan Required (Paid Feature)'}
        </span>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          {featureTitle}
        </h2>

        <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          {featureDesc}
        </p>

        {/* Active Pending Approval Card */}
        {pendingPayment && pendingPayment.status === 'pending' ? (
          <div className="mt-7 p-6 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-left max-w-xl mx-auto space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-200">
                  {lang === 'bn' ? 'পেমেন্ট সাবমিট হয়েছে — অ্যাডমিন অনুমোদনের অপেক্ষায়' : 'Payment Submitted — Awaiting Admin Approval'}
                </h4>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  {lang === 'bn'
                    ? 'আপনার পেমেন্ট তথ্য গৃহীত হয়েছে। অ্যাডমিন ভেরিফাই করে অনুমোদন করলেই ফিচারটি আনলক হবে।'
                    : 'Your transaction info is recorded. Features will instantly unlock upon admin approval.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-black/40 p-3 rounded-xl border border-amber-500/20 font-mono">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">প্যাকেজ</span>
                <span className="text-white font-semibold">{pendingPayment.planName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">পরিশোধ পদ্ধতি</span>
                <span className="text-cyan-300 font-semibold uppercase">{pendingPayment.paymentMethod}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">TrxID</span>
                <span className="text-amber-300 font-semibold break-all">{pendingPayment.transactionId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">পরিমাণ</span>
                <span className="text-emerald-400 font-semibold">৳{pendingPayment.amountBDT}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-950/50"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{lang === 'bn' ? 'হোয়াটসঅ্যাপে দ্রুত অনুমোদন নিন' : 'Fast Approval via WhatsApp'}</span>
              </a>

              {onRefreshPaymentStatus && (
                <button
                  onClick={onRefreshPaymentStatus}
                  disabled={isCheckingStatus}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin text-cyan-400' : ''}`} />
                  <span>{lang === 'bn' ? 'স্ট্যাটাস যাচাই করুন' : 'Check Status'}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
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
                <span>{lang === 'bn' ? 'REST API এক্সেস, WooCommerce ও Shopify প্লাগইন কোড' : 'REST API token & WooCommerce integration'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{lang === 'bn' ? 'এডমিন অনুমোদনের পর ডিভাইস ও অ্যাকাউন্টের লিমিট আনলক' : 'Device and account limits unlocked on admin approval'}</span>
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
            </div>
          </>
        )}

        <p className="text-[11px] text-slate-500 mt-5">
          {lang === 'bn'
            ? 'পেমেন্ট তথ্য সাবমিট করার পর এডমিন যাচাই করে আপনার প্যাকেজ এক্টিভ করবেন। সহায়তায় WhatsApp: +8801703223141'
            : 'After payment submission, features unlock upon admin verification. Support WhatsApp: +8801703223141'}
        </p>
      </div>
    </div>
  );
};
