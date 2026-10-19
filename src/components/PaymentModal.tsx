import React, { useState } from 'react';
import { X, Check, Copy, Loader2, CheckCircle2, AlertOctagon, ShieldCheck, Sparkles, Smartphone, ArrowRight, Zap, Gift, UserPlus } from 'lucide-react';
import type { Language } from '../utils/translations.ts';
import type { PlanTier, PaymentMethod } from '../types/intelligence.ts';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  initialPlan?: PlanTier;
  onPaymentSuccess: (plan: PlanTier) => void;
  user?: any;
  onOpenRegister?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  lang,
  initialPlan = 'pro',
  onPaymentSuccess,
  user,
  onOpenRegister,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>(initialPlan || 'pro');
  const [method, setMethod] = useState<PaymentMethod>('bkash');
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Sync initial plan if opened with different plan
  React.useEffect(() => {
    if (initialPlan) {
      setSelectedPlan(initialPlan);
    }
  }, [initialPlan, isOpen]);

  if (!isOpen) return null;

  // Exact payment numbers provided by user
  const paymentNumbers = {
    bkash: {
      name: 'bKash (বিকাশ)',
      type: 'Personal (সেন্ড মানি)',
      number: '01703-223141',
      raw: '01703223141',
      border: 'border-pink-500/40',
      activeBg: 'bg-pink-950/40 text-pink-300 border-pink-500/50',
      logo: '🌸',
    },
    nagad: {
      name: 'Nagad (নগদ)',
      type: 'Personal (সেন্ড মানি)',
      number: '01703-223141',
      raw: '01703223141',
      border: 'border-orange-500/40',
      activeBg: 'bg-orange-950/40 text-orange-300 border-orange-500/50',
      logo: '🟠',
    },
    rocket: {
      name: 'Rocket (রকেট)',
      type: 'Personal (সেন্ড মানি)',
      number: '01703-223141-8',
      raw: '017032231418',
      border: 'border-purple-500/40',
      activeBg: 'bg-purple-950/40 text-purple-300 border-purple-500/50',
      logo: '🟣',
    },
  };

  const currentMethodConfig = paymentNumbers[method];
  const amountBDT = selectedPlan === 'enterprise' ? 1499 : selectedPlan === 'pro' ? 499 : 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMethodConfig.raw);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleFillDemoPayment = () => {
    setSenderNumber('01703223141');
    setTransactionId(method.toUpperCase().slice(0, 2) + Math.random().toString(36).substring(2, 8).toUpperCase());
    setError(null);
  };

  // Direct activation for Free Starter Plan
  const handleActivateFreePlan = () => {
    // If not logged in, prompt user to register free account first!
    if (!user) {
      onClose();
      if (onOpenRegister) {
        onOpenRegister();
      }
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        onPaymentSuccess('free');
        setSuccess(false);
        onClose();
      }, 1200);
    }, 400);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedPlan === 'free') {
      handleActivateFreePlan();
      return;
    }

    if (!senderNumber || !transactionId) {
      setError(lang === 'bn' ? 'প্রেরক মোবাইল নম্বর এবং Transaction ID (TrxID) পূরণ করুন।' : 'Please fill sender phone and Transaction ID.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/payment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan,
          paymentMethod: method,
          senderNumber,
          transactionId,
          userEmail: user?.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Payment submission failed');
      }

      setSuccess(true);
      setTimeout(() => {
        onPaymentSuccess(selectedPlan);
        setSuccess(false);
        onClose();
      }, 1600);
    } catch (err: any) {
      setError(err.message || 'Error completing payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg p-6 rounded-2xl bg-[#0d1527] border border-cyan-500/30 shadow-2xl shadow-cyan-950/70 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {lang === 'bn' ? 'মার্চেন্ট প্ল্যান ক্রয় ও আপগ্রেড' : 'Purchase & Upgrade Plan'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'bn' ? 'ফ্রি স্টার্টার চালান অথবা বিকাশ/নগদ সেন্ড মানি দিয়ে প্রো আনলক করুন' : 'Run Free Starter or upgrade to Pro via bKash / Nagad Send Money'}
            </p>
          </div>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-xl font-bold text-white">
              {selectedPlan === 'free' 
                ? (lang === 'bn' ? 'ফ্রি স্টার্টার প্যাকেজ সক্রিয় হয়েছে!' : 'Free Starter Plan Activated!')
                : (lang === 'bn' ? 'অভিনন্দন! আপনার প্ল্যান সক্রিয় হয়েছে' : 'Congratulations! Plan Activated')}
            </h4>
            <p className="text-sm text-cyan-300 font-medium">
              {selectedPlan === 'enterprise' ? 'Enterprise Unlimited Plan' : selectedPlan === 'pro' ? 'Merchant Pro Plan' : 'Free Starter Plan'}
            </p>
            <p className="text-xs text-slate-400">
              {selectedPlan === 'free'
                ? (lang === 'bn' ? 'আপনি প্রতি মাসে ১০০টি ফোন নম্বর বিনামূল্যে যাচাই করতে পারবেন।' : 'You can search up to 100 numbers per month for free.')
                : (lang === 'bn' ? 'বাল্ক সার্চ, প্রতারক ডাটাবেস, কুরিয়ার স্ট্যাটাস ও এপিআই ডক্স আনলক হয়েছে।' : 'Bulk search, fraud database, courier status, and API docs are now unlocked.')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <p className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </p>
            )}

            {/* Step 1: 3-Plan Selector (Free Starter, Merchant Pro, Enterprise) */}
            <div>
              <label className="text-slate-300 font-bold block mb-1.5 uppercase tracking-wider text-[11px]">
                {lang === 'bn' ? '১. কাঙ্ক্ষিত প্যাকেজ নির্বাচন করুন:' : '1. Choose your plan:'}
              </label>

              <div className="grid grid-cols-3 gap-2">
                {/* Free Starter */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlan('free');
                    setError(null);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedPlan === 'free'
                      ? 'border-emerald-400 bg-emerald-950/40 shadow-md shadow-emerald-950/50 ring-1 ring-emerald-500/30'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-white text-[11px] truncate">ফ্রি স্টার্টার</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-extrabold text-xs block">৳০ / ফ্রি</span>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    ১০০ চেক/মাস
                  </span>
                </button>

                {/* Merchant Pro */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlan('pro');
                    setError(null);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all relative ${
                    selectedPlan === 'pro'
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-md shadow-cyan-950/50 ring-1 ring-cyan-500/30'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-white text-[11px] truncate">Merchant Pro</span>
                  </div>
                  <span className="font-mono text-cyan-300 font-extrabold text-xs block">৳৪৯৯/মাস</span>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    সব ফিচার আনলক
                  </span>
                </button>

                {/* Enterprise */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlan('enterprise');
                    setError(null);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedPlan === 'enterprise'
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-md shadow-cyan-950/50 ring-1 ring-cyan-500/30'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-white text-[11px] truncate">Enterprise</span>
                  </div>
                  <span className="font-mono text-cyan-300 font-extrabold text-xs block">৳১,৪৯৯/মাস</span>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    সীমাহীন চেক
                  </span>
                </button>
              </div>
            </div>

            {/* CONDITIONAL: If Free Starter is selected -> Direct registration / activation prompt */}
            {selectedPlan === 'free' ? (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-500/30 text-emerald-400 shrink-0">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {lang === 'bn' ? 'ফ্রি স্টার্টার প্যাকেজ (কোনো পেমেন্ট লাগবে না)' : 'Free Starter Plan (No Payment Required)'}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {user
                        ? (lang === 'bn' 
                            ? 'আপনার অ্যাকাউন্টে ফ্রি স্টার্টার মোড সক্রিয় করতে নিচের বাটনে ক্লিক করুন।' 
                            : 'Click below to activate Free Starter mode on your merchant account.')
                        : (lang === 'bn' 
                            ? 'ফ্রি স্টার্টার প্যাকেজে প্রতি মাসে ১০০টি ফ্রি কুরিয়ার চেক উপভোগ করতে বিনামূল্যে অ্যাকাউন্ট তৈরি করুন। কোনো ক্রেডিট কার্ড বা পেমেন্ট লাগবে না।' 
                            : 'To enjoy 100 free courier checks per month on the Free Starter plan, please register for free. No credit card or payment needed.')}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{lang === 'bn' ? 'প্রতি মাসে ১০০টি ফোন নম্বর কুরিয়ার হিস্ট্রি চেক' : '100 courier history checks per month'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{lang === 'bn' ? '৫টি কুরিয়ার নেটওয়ার্ক ডেলিভারি স্কোর' : '5 Courier networks delivery score'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-slate-500 text-xs">•</span>
                    <span>{lang === 'bn' ? 'বাল্ক সার্চ ও এপিআই ডক্স প্রো প্যাকেজে উপলব্ধ' : 'Bulk search & REST API available in Pro'}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleActivateFreePlan}
                    disabled={loading}
                    className="w-full py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-98"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : user ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    <span>
                      {user 
                        ? (lang === 'bn' ? 'ফ্রি স্টার্টার মোড সক্রিয় করুন' : 'Activate Free Starter Plan') 
                        : (lang === 'bn' ? 'ফ্রি অ্যাকাউন্ট তৈরি করে সক্রিয় করুন' : 'Register Free Account to Activate')}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              /* If Pro or Enterprise -> Show bKash, Nagad, Rocket with Exact User Numbers */
              <>
                {/* Step 2: Payment Method Selector */}
                <div>
                  <label className="text-slate-300 font-bold block mb-1.5 uppercase tracking-wider text-[11px]">
                    {lang === 'bn' ? '২. পেমেন্ট মাধ্যম বেছে নিন:' : '2. Select Payment Method:'}
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    {(['bkash', 'nagad', 'rocket'] as PaymentMethod[]).map((m) => {
                      const cfg = paymentNumbers[m];
                      const isSel = method === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMethod(m)}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            isSel ? cfg.activeBg : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className="text-base block mb-0.5">{cfg.logo}</span>
                          <span className="font-bold block text-xs">{cfg.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 3: Send Money Details Box */}
                <div className={`p-4 rounded-xl bg-slate-900/80 border ${currentMethodConfig.border} space-y-2.5`}>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-bold">
                      {currentMethodConfig.name} {currentMethodConfig.type}
                    </span>
                    <span className="font-mono text-cyan-300 font-bold text-sm">
                      পাঠাতে হবে: ৳{amountBDT} BDT
                    </span>
                  </div>

                  {/* Number with Copy button */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="font-mono text-base font-bold text-white tracking-wider">
                      {currentMethodConfig.number}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors flex items-center gap-1"
                    >
                      {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedNumber ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : (lang === 'bn' ? 'নম্বর কপি' : 'Copy')}</span>
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-400 leading-relaxed space-y-1">
                    <p>
                      ১. আপনার {currentMethodConfig.name} অ্যাপ থেকে উপরের নম্বরে <span className="text-cyan-300 font-semibold font-mono">৳{amountBDT}</span> টাকা <strong className="text-white">Send Money</strong> করুন।
                    </p>
                    <p>
                      ২. ফিরতি এসএমএস থেকে <strong className="text-white">Transaction ID (TrxID)</strong> টি কপি করে নিচে বসান।
                    </p>
                  </div>
                </div>

                {/* Step 4: Verification Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      {lang === 'bn' ? 'আপনার বিকাশ/নগদ নম্বর *' : 'Your Sender Number *'}
                    </label>
                    <input
                      type="tel"
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 text-white px-3.5 py-2.5 rounded-xl font-mono outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      {lang === 'bn' ? 'Transaction ID (TrxID) *' : 'Transaction ID (TrxID) *'}
                    </label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="9K8J7H6G5F"
                      className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 text-white px-3.5 py-2.5 rounded-xl font-mono uppercase outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Fast Demo Fill Button */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleFillDemoPayment}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-medium"
                  >
                    {lang === 'bn' ? 'টেস্টের জন্য ১-ক্লিকে TrxID অটো-ফিল করুন' : 'Auto-fill sample TrxID for testing'}
                  </button>

                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>তাৎক্ষণিক ভেরিফিকেশন</span>
                  </span>
                </div>

                {/* Submit Button */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800 transition-colors"
                  >
                    {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/25 disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    <span>{lang === 'bn' ? 'পেমেন্ট নিশ্চিত ও প্ল্যান সক্রিয় করুন' : 'Confirm & Activate Plan'}</span>
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
