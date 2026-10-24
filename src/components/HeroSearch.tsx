import React, { useState } from 'react';
import { 
  Search, 
  Loader2, 
  ArrowRight, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  UserPlus, 
  X, 
  Lock, 
  Sparkles, 
  UserCheck, 
  Zap, 
  History, 
  Trash2,
  Layers,
  TrendingUp,
  ShieldAlert,
  CheckCircle
} from 'lucide-react';
import type { Language } from '../utils/translations.ts';
import { translations } from '../utils/translations.ts';
import type { RecentSearchItem } from '../types/intelligence.ts';

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
  recentSearches?: RecentSearchItem[];
  onClearRecentSearches?: () => void;
  onRemoveRecentSearch?: (phone: string) => void;
  lastResultRiskLevel?: string;
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
  recentSearches = [],
  onClearRecentSearches,
  onRemoveRecentSearch,
  lastResultRiskLevel,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const t = (translations && translations[lang]) ? translations[lang] : (translations?.bn || translations?.en);

  // Dynamic border highlight & glow animation based on safety score
  const getDynamicBorderClass = () => {
    if (inputError) {
      return 'border-2 border-rose-500 shadow-[0_0_25px_-2px_rgba(239,68,68,0.45)] ring-2 ring-rose-500/20';
    }
    if (lastResultRiskLevel) {
      if (lastResultRiskLevel === 'low') {
        return 'border-2 border-emerald-500 shadow-[0_0_30px_-2px_rgba(16,185,129,0.5)] ring-2 ring-emerald-500/25 animate-glow-safe';
      }
      if (lastResultRiskLevel === 'medium') {
        return 'border-2 border-amber-500 shadow-[0_0_30px_-2px_rgba(245,158,11,0.5)] ring-2 ring-amber-500/25 animate-glow-moderate';
      }
      if (lastResultRiskLevel === 'high' || lastResultRiskLevel === 'blacklisted') {
        return 'border-2 border-rose-500 shadow-[0_0_30px_-2px_rgba(239,68,68,0.5)] ring-2 ring-rose-500/25 animate-glow-risk';
      }
      return 'border-2 border-cyan-500 shadow-[0_0_25px_-2px_rgba(6,182,212,0.4)] ring-2 ring-cyan-500/25';
    }
    return 'border-2 border-slate-300 dark:border-slate-700 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.08),0_4px_16px_-4px_rgba(15,23,42,0.04)]';
  };

  // Operator detection with clean SmartPOS styling
  const getOperator = (val: string) => {
    const clean = val.replace(/\D/g, '');
    const prefix = clean.startsWith('880') ? clean.slice(2, 5) : clean.slice(0, 3);
    if (prefix === '017' || prefix === '013') {
      return { 
        name: 'Grameenphone', 
        color: 'text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-300 dark:bg-sky-950/40 dark:border-sky-800' 
      };
    }
    if (prefix === '018') {
      return { 
        name: 'Robi Axiata', 
        color: 'text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950/40 dark:border-red-800' 
      };
    }
    if (prefix === '016') {
      return { 
        name: 'Airtel', 
        color: 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-950/40 dark:border-rose-800' 
      };
    }
    if (prefix === '019' || prefix === '014') {
      return { 
        name: 'Banglalink', 
        color: 'text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-300 dark:bg-orange-950/40 dark:border-orange-800' 
      };
    }
    if (prefix === '015') {
      return { 
        name: 'Teletalk', 
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800' 
      };
    }
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
    <section className="relative pt-6 sm:pt-10 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-transparent dark:bg-[#070b14]/50">
      {/* Subtle background atmosphere matching SmartPOS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto text-center">
        {/* SmartPOS Style Trust Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40 mb-3 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{lang === 'bn' ? 'স্মার্ট কুরিয়ার ফ্রড চেকার প্ল্যাটফর্ম' : 'Smart Courier Fraud Screening Platform'}</span>
        </div>

        {/* Clean Hero Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
          <span>{lang === 'bn' ? 'কুরিয়ার পার্সেল ডেলিভারি সাকসেস রেট যাচাই করুন' : 'Verify Courier Delivery Success Rate'}</span>
        </h1>

        {/* Subtitle with deep high-contrast text */}
        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-700 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
          {t.hero.subtitle}
        </p>

        {/* User Quota Indicator (Clean & Professional) */}
        <div className="mt-4 flex items-center justify-center">
          {isGuest ? (
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs border transition-all ${
              isGuestLimitReached 
                ? 'bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/60 dark:border-rose-500/40 dark:text-rose-300' 
                : 'bg-white border-slate-300 text-slate-800 shadow-xs dark:bg-slate-900/80 dark:border-slate-700 dark:text-slate-300 font-semibold'
            }`}>
              <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isGuestLimitReached ? 'bg-rose-400' : 'bg-emerald-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isGuestLimitReached ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
              </span>
              <span className="font-medium text-slate-700 dark:text-slate-400">
                {lang === 'bn' ? 'গেস্ট ফ্রি চেক:' : 'Guest Free Checks:'}
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {guestSearchesCount} / ৩ {lang === 'bn' ? 'ব্যবহৃত' : 'used'}
              </span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <button
                type="button"
                onClick={() => onOpenAuth && onOpenAuth('register')}
                className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>{lang === 'bn' ? 'ফ্রি সাইন আপ (১০০ চেক)' : 'Free Sign Up (100 checks)'}</span>
              </button>
            </div>
          ) : (
            <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3.5 py-1.5 rounded-full text-xs bg-white border border-slate-300 text-slate-800 shadow-xs dark:bg-slate-900/80 dark:border-emerald-500/30 dark:text-emerald-300 font-semibold">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                {lang === 'bn' ? 'মার্চেন্ট:' : 'Merchant:'} <strong className="text-slate-900 dark:text-white">{user?.storeName || user?.name}</strong>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-[11px] font-bold dark:bg-emerald-950/60 dark:border-emerald-500/40 dark:text-emerald-400">
                {user?.plan?.includes('Pro') ? 'Merchant Pro (2,500 Checks)' : user?.plan?.includes('Enterprise') ? 'Enterprise Unlimited' : 'ফ্রি স্টার্টার'}
              </span>
              <span className="font-mono text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/30">
                {checksRemaining} {lang === 'bn' ? 'চেক বাকি' : 'left'}
              </span>
            </div>
          )}
        </div>

        {/* 1. Guest Limit Block Banner (When 3 searches reached without account) */}
        {isGuestLimitReached && (
          <div className="mt-5 max-w-2xl mx-auto p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 dark:bg-rose-950/60 dark:border-rose-500/40 shadow-sm text-left space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-100 border border-rose-300 text-rose-700 dark:bg-rose-950 dark:border-rose-500/30 dark:text-rose-400 shrink-0 mt-0.5">
                <Lock className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{lang === 'bn' ? 'আপনার ৩টি ফ্রি গেস্ট সার্চ লিমিট শেষ হয়েছে!' : 'Your 3 Free Guest Checks Limit Reached!'}</span>
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-rose-200/80 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 font-semibold">
                    ৩/৩ লিমিট শেষ
                  </span>
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed font-medium">
                  {lang === 'bn'
                    ? 'কুরিয়ার ডেলিভারি হিস্ট্রি চেক ও ফ্রড স্ক্রিনিং অব্যাহত রাখতে মাত্র ৩০ সেকেন্ডে একটি বিনামূল্যে মার্চেন্ট অ্যাকাউন্ট খুলুন বা লগইন করুন। প্রতি মাসে ১০০টি ফ্রি চেক উপভোগ করতে পারবেন!'
                    : 'To continue courier delivery screening, please create a free merchant account or sign in. Registration instantly provides 100 free checks per month!'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-rose-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => onOpenAuth && onOpenAuth('login')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 transition-colors cursor-pointer dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white"
              >
                {lang === 'bn' ? 'লগইন করুন' : 'Sign In'}
              </button>

              <button
                type="button"
                onClick={() => onOpenAuth && onOpenAuth('register')}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-600/30 cursor-pointer"
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
          <div className="mt-5 max-w-2xl mx-auto p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 dark:bg-amber-950/60 dark:border-amber-500/40 shadow-sm text-left space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 dark:bg-amber-950 dark:border-amber-500/40 dark:text-amber-400 shrink-0 mt-0.5">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{lang === 'bn' ? 'চলতি মাসের ১০০টি ফ্রি চেক লিমিট শেষ হয়েছে!' : 'Monthly 100 Free Checks Limit Reached!'}</span>
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-amber-200/80 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300 font-semibold">
                    ১০০/১০০ সম্পন্ন
                  </span>
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed font-medium">
                  {lang === 'bn'
                    ? 'আপনার ব্যবসার কুরিয়ার ডেলিভারি হিস্ট্রি চেক অব্যাহত রাখতে এবং বাল্ক সার্চ ও এপিআই সুবিধা পেতে এখনই বিকাশ, নগদ বা রকেট দিয়ে মার্চেন্ট প্রো প্যাকেজে আপগ্রেড করুন।'
                    : 'To continue courier delivery checks and unlock bulk search + REST API, please upgrade to Merchant Pro via bKash, Nagad, or Rocket.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-amber-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onOpenUpgrade}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all flex items-center gap-1.5 shadow-sm shadow-amber-600/30 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>{lang === 'bn' ? 'মার্চেন্ট প্রো আপগ্রেড করুন (৳৪৯৯/মাস)' : 'Upgrade to Merchant Pro (৳499/mo)'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* SmartPOS Clean Search Card Container with Dynamic Glow Animation */}
        <div className="mt-6 sm:mt-8 max-w-3xl mx-auto">
          <form 
            onSubmit={handleFormSubmit}
            className={`p-2 sm:p-2.5 rounded-[16px] bg-white dark:bg-[#0d1527] relative transition-all duration-500 ${getDynamicBorderClass()}`}
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {/* Country selector (Taller 56px height) */}
              <div className="flex items-center gap-2.5 px-4 h-13 sm:h-14 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-[12px] text-slate-800 dark:text-slate-200 text-sm font-semibold w-full sm:w-auto justify-between sm:justify-start shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🇧🇩</span>
                  <span className="font-mono text-slate-900 dark:text-emerald-400 font-bold text-base">+880</span>
                </div>
                {detectedOperator && (
                  <span className={`sm:hidden text-[11px] px-2 py-0.5 rounded border ${detectedOperator.color}`}>
                    {detectedOperator.name}
                  </span>
                )}
              </div>

              {/* Phone Input Box (Taller 56px height with soft focus ring) */}
              <div className="relative flex-1 w-full">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    if (inputError) setInputError(null);
                  }}
                  placeholder={t.hero.inputPlaceholder}
                  className="w-full h-13 sm:h-14 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500/15 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 px-4 rounded-[12px] text-base sm:text-lg font-mono font-medium tracking-wide outline-none transition-all pr-12"
                  autoComplete="tel"
                />

                {phoneNumber && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhoneNumber('');
                      setInputError(null);
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-md cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Flat, Wide-Reaching Emerald Green Search Button (Taller 56px height) */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto sm:min-w-[190px] md:min-w-[210px] h-13 sm:h-14 px-7 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm sm:text-base rounded-[12px] transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
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
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 mt-2 text-xs border-t border-slate-100 dark:border-slate-800 text-left">
                <span className="text-slate-500 dark:text-slate-400">{t.results.operator}:</span>
                <span className={`px-2 py-0.5 rounded font-medium border ${detectedOperator.color}`}>
                  {detectedOperator.name}
                </span>
                <span className="text-slate-400 dark:text-slate-500 text-[11px] ml-auto">
                  {lang === 'bn' ? 'স্বয়ংক্রিয়ভাবে অপারেটর শনাক্ত' : 'Auto-detected Network'}
                </span>
              </div>
            )}
          </form>

          {/* Validation Error Message */}
          {inputError && (
            <p className="mt-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 dark:text-rose-400 dark:bg-rose-950/40 dark:border-rose-500/30 px-3 py-2 rounded-lg text-left flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{inputError}</span>
            </p>
          )}

          {/* =========================================================
              RECENT SEARCHES (Stored in localStorage, last 5 numbers)
              ========================================================= */}
          {recentSearches && recentSearches.length > 0 && (
            <div className="mt-4 p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800 shadow-sm text-left">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-cyan-400">
                    <History className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-white tracking-wide">
                    {lang === 'bn' ? 'সাম্প্রতিক সার্চ (সর্বশেষ ৫টি)' : 'Recent Searches (Last 5)'}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px] font-bold">
                    {recentSearches.length}/5
                  </span>
                </div>

                {onClearRecentSearches && (
                  <button
                    type="button"
                    onClick={onClearRecentSearches}
                    className="text-[11px] text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors px-2 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    title={lang === 'bn' ? 'সকল সাম্প্রতিক সার্চ মুছুন' : 'Clear search history'}
                  >
                    <Trash2 className="w-3 h-3 text-slate-400 hover:text-rose-600" />
                    <span>{lang === 'bn' ? 'মুছে ফেলুন' : 'Clear'}</span>
                  </button>
                )}
              </div>

              {/* Chips for the last 5 numbers */}
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((item) => {
                  const isHigh = item.riskLevel === 'high' || item.riskLevel === 'blacklisted';
                  const isMedium = item.riskLevel === 'medium';
                  const isSafe = item.riskLevel === 'low';

                  return (
                    <div
                      key={item.phone}
                      className="group inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 shadow-xs transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => handleQuickSelect(item.phone)}
                        className="flex items-center gap-1.5 text-left cursor-pointer"
                        title={lang === 'bn' ? `${item.phone} পুনরায় চেক করুন` : `Re-check ${item.phone}`}
                      >
                        <Phone className="w-3 h-3 text-emerald-600 dark:text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-700 transition-colors">
                          {item.phone}
                        </span>

                        {item.operator && (
                          <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium px-1.5 py-0.2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            {item.operator}
                          </span>
                        )}

                        {item.status && (
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                              isHigh
                                ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-500/40'
                                : isMedium
                                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-500/40'
                                : isSafe
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/40'
                                : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {item.status}
                          </span>
                        )}
                      </button>

                      {onRemoveRecentSearch && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveRecentSearch(item.phone);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer ml-0.5"
                          title={lang === 'bn' ? 'তালিকা থেকে বাদ দিন' : 'Remove this search'}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Demo Sample Numbers */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600 dark:text-cyan-400" />
              <span>{lang === 'bn' ? 'দ্রুত টেস্ট করতে ক্লিক করুন:' : 'Sample Numbers:'}</span>
            </span>
            <button
              type="button"
              onClick={() => handleQuickSelect('01614322788')}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:border-emerald-500/30 dark:text-emerald-300 text-[11px] font-mono font-medium transition-colors cursor-pointer"
            >
              01614322788 ({lang === 'bn' ? 'নিরাপদ ৯৭%' : 'Safe 97%'})
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect('01711223344')}
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 dark:border-amber-500/30 dark:text-amber-300 text-[11px] font-mono font-medium transition-colors cursor-pointer"
            >
              01711223344 ({lang === 'bn' ? 'মাঝারি ৭১%' : 'Mod 71%'})
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect('01812984561')}
              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:border-rose-500/30 dark:text-rose-300 text-[11px] font-mono font-medium transition-colors cursor-pointer"
            >
              01812984561 ({lang === 'bn' ? 'উচ্চ ঝুঁকি ৩৬%' : 'Risk 36%'})
            </button>
          </div>
        </div>

        {/* SmartPOS BD Features Row (4 Core Pillars of Courier Fraud Protection) */}
        <div className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-left">
          {/* Feature 1 */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? '৫টি শীর্ষ কুরিয়ার নেটওয়ার্ক' : '5 Major Courier Networks'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {lang === 'bn' 
                ? 'Steadfast, Pathao, RedX, CarryBee ও Paperfly এর সেন্ট্রাল গেটওয়ে থেকে সরাসরি পার্সেল হিস্ট্রি।' 
                : 'Centralized parcel records directly from Bangladesh top courier networks.'}
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'ডেলিভারি সাকসেস রেশিও' : 'Delivery Success Ratio'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {lang === 'bn' 
                ? 'গ্রাহকের সফল ডেলিভারি ও রিটার্ন পার্সেলের সঠিক শতাংশ দেখে নিরাপদ সিদ্ধান্ত নিন।' 
                : 'Accurate percentage of delivered vs returned parcels to make informed dispatch choices.'}
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'ক্যাশ অন ডেলিভারি সুরক্ষা' : 'COD Loss Prevention'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {lang === 'bn' 
                ? 'ঝুঁকিপূর্ণ কাস্টমারদের ক্ষেত্রে অগ্রিম ডেলিভারি চার্জ নেওয়ার স্মার্ট রিকমেন্ডেশন।' 
                : 'Automated guidance on when to collect advance delivery charges before shipping.'}
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'মাসে ১০০ ফ্রি চেক ও প্যাকেজ' : '100 Free Checks & Packages'}
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-400 mt-1 leading-relaxed font-medium">
              {lang === 'bn' 
                ? 'প্রতি মাসে ১০০টি ফ্রি চেক। লিমিট শেষ হলে সাশ্রয়ী প্রো ও এন্টারপ্রাইজ প্যাকেজে আনলিমিটেড ব্যবহার।' 
                : '100 free checks monthly. Flexible upgrade to Pro or Enterprise packages when the limit is reached.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
