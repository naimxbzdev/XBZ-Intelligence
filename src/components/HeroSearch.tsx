import React, { useState } from 'react';
import { Search, Loader2, ArrowRight, Phone, ShieldCheck, CheckCircle2, AlertTriangle, AlertOctagon, UserPlus, X, Lock, Sparkles, UserCheck, Zap } from 'lucide-react';
import type { Language } from '../utils/translations.ts';
import { translations } from '../utils/translations.ts';

interface HeroSearchProps {
  onSearch: (phone: string) => void;
  isLoading: boolean;
  lang: Language;
  isGuest?: boolean;
  guestSearchesCount?: number;
  isGuestLimitReached?: boolean;
  isFreeLimitReached?: boolean;
  checksRemaining?: number;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onOpenUpgrade?: () => void;
  user?: any;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({ 
  onSearch, 
  isLoading, 
  lang,
  isGuest = true,
  guestSearchesCount = 0,
  isGuestLimitReached = false,
  isFreeLimitReached = false,
  checksRemaining = 100,
  onOpenAuth,
  onOpenUpgrade,
  user,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const t = translations[lang];

  // Operator detection
  const getOperator = (val: string) => {
    const clean = val.replace(/\D/g, '');
    const prefix = clean.startsWith('880') ? clean.slice(2, 5) : clean.slice(0, 3);
    if (prefix === '017' || prefix === '013') return { name: 'Grameenphone', color: 'text-sky-400 bg-sky-950/40 border-sky-500/30' };
    if (prefix === '018') return { name: 'Robi Axiata', color: 'text-red-400 bg-red-950/40 border-red-500/30' };
    if (prefix === '016') return { name: 'Airtel', color: 'text-rose-400 bg-rose-950/40 border-rose-500/30' };
    if (prefix === '019' || prefix === '014') return { name: 'Banglalink', color: 'text-orange-400 bg-orange-950/40 border-orange-500/30' };
    if (prefix === '015') return { name: 'Teletalk', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30' };
    return null;
  };

  const detectedOperator = getOperator(phoneNumber);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isGuestLimitReached) {
      if (onOpenAuth) onOpenAuth('register');
      return;
    }

    if (isFreeLimitReached) {
      if (onOpenUpgrade) onOpenUpgrade();
      return;
    }

    const clean = phoneNumber.replace(/\D/g, '');
    const digits = clean.startsWith('880') ? clean.slice(2) : clean;

    if (digits.length !== 11 || !digits.startsWith('01')) {
      setInputError(lang === 'bn' 
        ? 'অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01614322788)' 
        : 'Please provide a valid 11-digit Bangladeshi mobile number (e.g. 01614322788)');
      return;
    }

    setInputError(null);
    onSearch(digits);
  };

  const handleQuickSelect = (num: string) => {
    if (isGuestLimitReached) {
      if (onOpenAuth) onOpenAuth('register');
      return;
    }
    if (isFreeLimitReached) {
      if (onOpenUpgrade) onOpenUpgrade();
      return;
    }
    setPhoneNumber(num);
    setInputError(null);
    onSearch(num);
  };

  return (
    <section className="relative pt-6 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/10 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-0 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-[90px] pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto text-center">
        {/* Exact Hero Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-300">
            {t.hero.headlinePart1}
          </span>
          <span className="block mt-1 sm:mt-2 text-cyan-400">
            {t.hero.headlinePart2}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-slate-300/90 max-w-2xl mx-auto leading-relaxed">
          {t.hero.subtitle}
        </p>

        {/* Guest or Logged-in Plan Status Pill */}
        <div className="mt-4 flex items-center justify-center">
          {isGuest ? (
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs border backdrop-blur-md transition-all ${
              isGuestLimitReached 
                ? 'bg-rose-950/60 border-rose-500/40 text-rose-300 shadow-lg shadow-rose-950/50' 
                : 'bg-slate-900/80 border-cyan-500/30 text-cyan-300'
            }`}>
              <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isGuestLimitReached ? 'bg-rose-400' : 'bg-cyan-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isGuestLimitReached ? 'bg-rose-500' : 'bg-cyan-500'}`}></span>
              </span>
              <span className="font-medium">
                {lang === 'bn' ? 'গেস্ট ফ্রি চেক:' : 'Guest Free Checks:'}
              </span>
              <span className="font-mono font-bold">
                {guestSearchesCount} / ৩ {lang === 'bn' ? 'ব্যবহৃত' : 'used'}
              </span>
              <span className="text-slate-500">|</span>
              <button
                type="button"
                onClick={() => onOpenAuth && onOpenAuth('register')}
                className="text-cyan-400 hover:text-white underline font-semibold transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>{lang === 'bn' ? 'ফ্রি অ্যাকাউন্ট খুলুন (১০০ চেক)' : 'Create Free Account (100 checks)'}</span>
              </button>
            </div>
          ) : (
            <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3.5 py-1.5 rounded-full text-xs bg-slate-900/80 border border-emerald-500/30 text-emerald-300 backdrop-blur-md">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                {lang === 'bn' ? 'মার্চেন্ট:' : 'Merchant:'} <strong className="text-white">{user?.storeName || user?.name}</strong>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-mono text-[11px] font-bold">
                {user?.plan?.includes('Pro') ? 'Merchant Pro (2,500 Checks)' : user?.plan?.includes('Enterprise') ? 'Enterprise Unlimited' : 'ফ্রি স্টার্টার'}
              </span>
              <span className="font-mono text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                {checksRemaining} {lang === 'bn' ? 'চেক বাকি' : 'left'}
              </span>
            </div>
          )}
        </div>

        {/* 1. Guest Limit Block Banner (When 3 searches reached without account) */}
        {isGuestLimitReached && (
          <div className="mt-5 max-w-2xl mx-auto p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-rose-950/60 via-slate-900 to-[#0d1527] border border-rose-500/40 shadow-2xl text-left space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-950 border border-rose-500/30 text-rose-400 shrink-0 mt-0.5">
                <Lock className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{lang === 'bn' ? 'আপনার ৩টি ফ্রি গেস্ট সার্চ লিমিট শেষ হয়েছে!' : 'Your 3 Free Guest Checks Limit Reached!'}</span>
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    ৩/৩ লিমিট শেষ
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {lang === 'bn'
                    ? 'কুরিয়ার ডেলিভারি হিস্ট্রি চেক ও ফ্রড স্ক্রিনিং অব্যাহত রাখতে অনুগ্রহ করে মাত্র ৩০ সেকেন্ডে একটি বিনামূল্যে মার্চেন্ট অ্যাকাউন্ট খুলুন বা লগইন করুন। অ্যাকাউন্ট খুললেই প্রতি মাসে ১০০টি ফ্রি চেক উপভোগ করতে পারবেন!'
                    : 'To continue courier delivery screening, please create a free merchant account or sign in. Registration instantly provides 100 free checks per month!'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-slate-800">
              <button
                type="button"
                onClick={() => onOpenAuth && onOpenAuth('login')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 border border-slate-700 transition-colors"
              >
                {lang === 'bn' ? 'লগইন করুন' : 'Sign In'}
              </button>

              <button
                type="button"
                onClick={() => onOpenAuth && onOpenAuth('register')}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'বিনামূল্যে অ্যাকাউন্ট তৈরি করুন' : 'Create Free Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 2. Free Starter 100-Checks Limit Reached Banner */}
        {isFreeLimitReached && (
          <div className="mt-5 max-w-2xl mx-auto p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-[#0d1527] border border-amber-500/40 shadow-2xl text-left space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-950 border border-amber-500/40 text-amber-400 shrink-0 mt-0.5">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{lang === 'bn' ? 'আপনার চলতি মাসের ১০০টি ফ্রি চেক লিমিট শেষ হয়েছে!' : 'Your Monthly 100 Free Checks Limit Reached!'}</span>
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    ১০০/১০০ সম্পন্ন
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {lang === 'bn'
                    ? 'আপনার ব্যবসার কুরিয়ার ডেলিভারি হিস্ট্রি চেক অব্যাহত রাখতে এবং বাল্ক সার্চ ও এপিআই সুবিধা পেতে এখনই বিকাশ, নগদ বা রকেট দিয়ে মার্চেন্ট প্রো প্যাকেজে আপগ্রেড করুন।'
                    : 'To continue courier delivery checks and unlock bulk search + REST API, please upgrade to Merchant Pro via bKash, Nagad, or Rocket.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-slate-800">
              <button
                type="button"
                onClick={onOpenUpgrade}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/25"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>{lang === 'bn' ? 'মার্চেন্ট প্রো আপগ্রেড করুন (৳৪৯৯/মাস)' : 'Upgrade to Merchant Pro (৳499/mo)'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Search Card Container */}
        <div className="mt-6 max-w-2xl mx-auto">
          <form 
            onSubmit={handleFormSubmit}
            className="p-2 sm:p-2.5 rounded-2xl bg-[#0d1527]/90 border border-cyan-500/25 shadow-2xl shadow-cyan-950/50 backdrop-blur-xl relative"
          >
            <div className="flex flex-col sm:flex-row items-center gap-2">
              {/* Country selector */}
              <div className="flex items-center gap-2 px-3.5 py-3 sm:py-2.5 bg-slate-900/80 border border-slate-700/60 rounded-xl text-slate-200 text-sm font-medium w-full sm:w-auto justify-between sm:justify-start">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🇧🇩</span>
                  <span className="font-mono text-cyan-300 font-semibold">+880</span>
                </div>
                {detectedOperator && (
                  <span className={`sm:hidden text-[11px] px-2 py-0.5 rounded border ${detectedOperator.color}`}>
                    {detectedOperator.name}
                  </span>
                )}
              </div>

              {/* Phone Input Box */}
              <div className="relative flex-1 w-full">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    if (inputError) setInputError(null);
                  }}
                  placeholder={t.hero.inputPlaceholder}
                  className="w-full bg-slate-900/60 border border-slate-700/60 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white placeholder-slate-500 px-4 py-3 sm:py-3.5 rounded-xl text-base font-mono tracking-wide outline-none transition-all pr-12"
                  autoComplete="tel"
                />

                {phoneNumber && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhoneNumber('');
                      setInputError(null);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-98 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 disabled:opacity-60 whitespace-nowrap shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t.hero.searching}</span>
                  </>
                ) : isGuestLimitReached ? (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>{lang === 'bn' ? 'অ্যাকাউন্ট খুলুন' : 'Sign Up to Check'}</span>
                  </>
                ) : isFreeLimitReached ? (
                  <>
                    <Zap className="w-5 h-5 fill-current" />
                    <span>{lang === 'bn' ? 'আপগ্রেড করুন' : 'Upgrade Plan'}</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>{t.hero.searchBtn}</span>
                    <ArrowRight className="w-4 h-4 hidden sm:inline" />
                  </>
                )}
              </button>
            </div>

            {/* Operator Badge (Desktop) */}
            {detectedOperator && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 mt-2 text-xs border-t border-slate-800/80 text-left">
                <span className="text-slate-400">{t.results.operator}:</span>
                <span className={`px-2 py-0.5 rounded font-medium border ${detectedOperator.color}`}>
                  {detectedOperator.name}
                </span>
                <span className="text-slate-500 text-[11px] ml-auto">
                  {lang === 'bn' ? 'স্বয়ংক্রিয়ভাবে অপারেটর শনাক্ত' : 'Auto-detected Network'}
                </span>
              </div>
            )}
          </form>

          {/* Validation Error Message */}
          {inputError && (
            <p className="mt-2.5 text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 px-3 py-2 rounded-lg text-left flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{inputError}</span>
            </p>
          )}

          {/* Quick Demo Test Buttons */}
          <div className="mt-5 text-left bg-slate-900/40 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-xs font-semibold text-slate-400 block mb-2">
              {t.hero.quickTestTitle}
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickSelect('01614322788')}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-300 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/30 rounded-lg transition-colors whitespace-nowrap"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.hero.safeTest}</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('01711223344')}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-300 bg-amber-950/30 hover:bg-amber-900/40 border border-amber-500/30 rounded-lg transition-colors whitespace-nowrap"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.hero.modTest}</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('01812984561')}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-rose-300 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/30 rounded-lg transition-colors whitespace-nowrap"
              >
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                <span>{t.hero.riskTest}</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('01911223344')}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-red-400 bg-red-950/50 hover:bg-red-900/60 border border-red-500/50 rounded-lg transition-colors whitespace-nowrap font-semibold"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                <span>{t.hero.fraudTest}</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('01511223344')}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-cyan-300 bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-500/30 rounded-lg transition-colors whitespace-nowrap"
              >
                <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.hero.newTest}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
