import React from 'react';
import { Tag, Check, ArrowRight, Zap, ShieldCheck, Gift, Smartphone, UserPlus } from 'lucide-react';
import type { Language } from '../utils/translations.ts';
import { translations } from '../utils/translations.ts';
import type { PlanTier } from '../types/intelligence.ts';

interface PricingViewProps {
  lang: Language;
  onSelectPlan: (plan: PlanTier) => void;
  activePlan?: PlanTier;
  user?: any;
}

export const PricingView: React.FC<PricingViewProps> = ({ 
  lang, 
  onSelectPlan,
  activePlan = 'free',
  user,
}) => {
  const t = translations[lang];

  const plans = [
    {
      id: 'free' as PlanTier,
      name: t.pricing.freePlan,
      desc: t.pricing.freeDesc,
      price: '০',
      priceEn: '0',
      period: lang === 'bn' ? '/আজীবন ফ্রি' : '/Forever Free',
      popular: false,
      badge: lang === 'bn' ? 'রেজিস্ট্রেশন করলেই ১০০ চেক' : '100 Checks on Register',
      features: [
        lang === 'bn' ? 'মাসে ১০০টি ফোন নম্বর চেক' : '100 phone checks / month',
        lang === 'bn' ? '৫টি কুরিয়ারের ইতিহাস অনুসন্ধান' : 'All 5 major courier networks',
        lang === 'bn' ? 'ঝুঁকি বিশ্লেষণ ও রিকমেন্ডেশন' : 'Delivery risk score & recommendations',
        lang === 'bn' ? 'অপারেটর ডিটেকশন ও রিয়েলটাইম স্কোর' : 'Operator detection & live score',
      ],
      buttonText: user
        ? (activePlan === 'free' 
            ? (lang === 'bn' ? 'বর্তমানে সক্রিয়' : 'Currently Active') 
            : (lang === 'bn' ? 'ফ্রি স্টার্টার চালু করুন' : 'Switch to Free Starter'))
        : (lang === 'bn' ? 'ফ্রি অ্যাকাউন্ট খুলে ১০০ চেক নিন' : 'Sign Up Free (100 checks)'),
      accentColor: 'border-emerald-500/30 bg-gradient-to-b from-[#0e2420]/40 to-[#0d1527]',
      isFree: true,
    },
    {
      id: 'pro' as PlanTier,
      name: t.pricing.proPlan,
      desc: t.pricing.proDesc,
      price: '৪৯৯',
      priceEn: '499',
      period: lang === 'bn' ? '/প্রতি মাস' : '/month',
      popular: true,
      badge: lang === 'bn' ? 'বিকাশ / নগদ / রকেট সেন্ড মানি' : 'bKash / Nagad / Rocket',
      features: [
        lang === 'bn' ? 'মাসে ২,৫০০টি ফোন নম্বর চেক' : '2,500 phone checks / month',
        lang === 'bn' ? 'বাল্ক সার্চ (একসাথে ৩০টি ও CSV এক্সপোর্ট)' : 'Bulk CSV batch verification',
        lang === 'bn' ? 'প্রতারক ডাটাবেস সম্পূর্ণ এক্সেস' : 'Community dispute registry access',
        lang === 'bn' ? '৫টি কুরিয়ার লাইভ টেকনিক্যাল স্ট্যাটাস' : '5 Couriers live technical specs',
        lang === 'bn' ? 'REST API এক্সেস ও WooCommerce প্লাগইন' : 'REST API token & WooCommerce plugin',
      ],
      buttonText: lang === 'bn' ? 'প্রো প্ল্যান নিন (৳৪৯৯)' : 'Upgrade to Pro (৳499)',
      accentColor: 'border-cyan-400 bg-gradient-to-b from-[#0e1e38] to-[#0d1527] shadow-xl shadow-cyan-950/60 ring-1 ring-cyan-500/30',
      isFree: false,
    },
    {
      id: 'enterprise' as PlanTier,
      name: t.pricing.enterprisePlan,
      desc: t.pricing.enterpriseDesc,
      price: '১,৪৯৯',
      priceEn: '1,499',
      period: lang === 'bn' ? '/প্রতি মাস' : '/month',
      popular: false,
      badge: lang === 'bn' ? 'বিকাশ / নগদ / রকেট সেন্ড মানি' : 'bKash / Nagad / Rocket',
      features: [
        lang === 'bn' ? 'সীমাহীন (Unlimited) ফোন অনুসন্ধান' : 'Unlimited phone lookups / month',
        lang === 'bn' ? 'বাল্ক সার্চ + প্রতারক ডাটাবেস + সব প্রো ফিচার' : 'All Pro features + Bulk + Fraud DB',
        lang === 'bn' ? 'ডেডিকেটেড এপিআই রেট লিমিট (500 req/min)' : 'Dedicated API rate limit (500 req/min)',
        lang === 'bn' ? 'কাস্টম ERP / POS সফটওয়্যার ইন্টিগ্রেশন' : 'Custom ERP / POS software integration',
        lang === 'bn' ? 'অগ্রাধিকার ভিত্তিতে ২৪/৭ সাপোর্ট' : 'Dedicated priority 24/7 support',
      ],
      buttonText: lang === 'bn' ? 'এন্টারপ্রাইজ নিন (৳১,৪৯৯)' : 'Choose Enterprise',
      accentColor: 'border-slate-700 bg-[#0d1527]/70',
      isFree: false,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t.pricing.title}
        </h2>
        <p className="text-sm sm:text-base text-slate-300/80 mt-2">
          {t.pricing.subtitle}
        </p>

        {/* bKash, Nagad, Rocket acceptance banner with exact user numbers */}
        <div className="mt-5 p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300 shadow-xl">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>{lang === 'bn' ? 'সেন্ড মানি পেমেন্ট নম্বর:' : 'Payment Numbers:'}</span>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-pink-950/60 border border-pink-500/30 text-pink-300 font-mono font-bold">
            🌸 বিকাশ: 01703223141
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-orange-950/60 border border-orange-500/30 text-orange-300 font-mono font-bold">
            🟠 নগদ: 01703223141
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-300 font-mono font-bold">
            🟣 রকেট: 017032231418
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`p-6 rounded-2xl border transition-all flex flex-col justify-between relative ${plan.accentColor}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[11px] font-extrabold uppercase tracking-wider shadow-md">
                {t.pricing.popular}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                  plan.isFree ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                }`}>
                  {plan.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{plan.desc}</p>

              <div className="my-5 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-cyan-400">{t.pricing.bdt}</span>
                <span className="text-4xl font-extrabold font-mono text-white tracking-tight">
                  {lang === 'bn' ? plan.price : plan.priceEn}
                </span>
                <span className="text-xs text-slate-400">{plan.period}</span>
              </div>

              <div className="space-y-3 border-t border-slate-800/80 pt-4">
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.isFree ? 'text-emerald-400' : 'text-cyan-400'}`} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onSelectPlan(plan.id)}
              className={`mt-8 w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                plan.isFree
                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                  : plan.popular
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-lg shadow-cyan-500/25 active:scale-98'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
            >
              {plan.isFree && (user ? <Gift className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />)}
              <span>{plan.buttonText}</span>
              {!plan.isFree && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
