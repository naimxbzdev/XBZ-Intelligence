import React from 'react';
import { Shield, Key, User, Globe, Layers, Database, Activity, Code2, Tag, Search, Sparkles, Lock, Zap, CheckCircle2, Award } from 'lucide-react';
import type { Language } from '../utils/translations.ts';
import { translations } from '../utils/translations.ts';
import type { PlanTier } from '../types/intelligence.ts';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  openApiSettings: () => void;
  openAuth: () => void;
  openPayment: () => void;
  openTrustBadge: () => void;
  isSandbox: boolean;
  user: any;
  userPlan: PlanTier;
  guestSearchesCount?: number;
  isGuestLimitReached?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  lang,
  setLang,
  openApiSettings,
  openAuth,
  openPayment,
  openTrustBadge,
  isSandbox,
  user,
  userPlan,
  guestSearchesCount = 0,
  isGuestLimitReached = false,
}) => {
  const t = translations[lang];
  const isPaid = userPlan === 'pro' || userPlan === 'enterprise';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/15 bg-[#070b14]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark (Clean XBZ Intelligence as requested) */}
        <div 
          onClick={() => setCurrentTab('search')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-transparent border border-cyan-400/30 group-hover:border-cyan-400 transition-colors">
            <Shield className="w-5 h-5 text-cyan-400 group-hover:scale-105 transition-transform" />
            <div className="absolute inset-0 rounded-xl bg-cyan-400/10 blur-sm -z-10" />
          </div>
          <div className="flex items-center">
            <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap">
              XBZ Intelligence
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Single line, whitespace-nowrap) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium">
          {/* Public Search - Free */}
          <button
            onClick={() => setCurrentTab('search')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'search'
                ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>{t.nav.search}</span>
          </button>

          {/* Gated: Batch Check */}
          <button
            onClick={() => setCurrentTab('batch')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'batch'
                ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{t.nav.batch}</span>
            {!isPaid && <Lock className="w-3 h-3 text-amber-400/80 ml-0.5" />}
          </button>

          {/* Gated: Community DB */}
          <button
            onClick={() => setCurrentTab('community')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'community'
                ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{t.nav.community}</span>
            {!isPaid && <Lock className="w-3 h-3 text-amber-400/80 ml-0.5" />}
          </button>

          {/* Gated: Couriers */}
          <button
            onClick={() => setCurrentTab('couriers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'couriers'
                ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>{t.nav.couriers}</span>
            {!isPaid && <Lock className="w-3 h-3 text-amber-400/80 ml-0.5" />}
          </button>

          {/* Gated: API Docs */}
          <button
            onClick={() => setCurrentTab('apiDocs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'apiDocs'
                ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>{t.nav.apiDocs}</span>
            {!isPaid && <Lock className="w-3 h-3 text-amber-400/80 ml-0.5" />}
          </button>

          {/* Pricing */}
          <button
            onClick={() => setCurrentTab('pricing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'pricing'
                ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>{t.nav.pricing}</span>
          </button>
        </nav>

        {/* Zone 3: Actions (Trust badge, Upgrade, Plan badge, Language toggle, Auth) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Trust Seal Tool Button */}
          <button
            onClick={openTrustBadge}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 rounded-lg transition-colors whitespace-nowrap"
            title="Generate Merchant Trust Seal"
          >
            <Award className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'bn' ? 'ট্রাস্ট সিল' : 'Trust Seal'}</span>
          </button>

          {/* Active Plan Badge or Upgrade Button */}
          {user ? (
            isPaid ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-cyan-300 bg-cyan-950/50 border border-cyan-500/40 rounded-lg">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span className="capitalize">{userPlan} Plan</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-mono">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{user.checksRemaining || 100} চেক বাকি</span>
                </span>
                <button
                  onClick={openPayment}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 rounded-lg shadow-sm shadow-amber-500/20 transition-all whitespace-nowrap"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>{lang === 'bn' ? 'আপগ্রেড' : 'Upgrade'}</span>
                </button>
              </div>
            )
          ) : (
            <button
              onClick={openPayment}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 rounded-lg shadow-sm shadow-amber-500/20 transition-all whitespace-nowrap"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{lang === 'bn' ? 'প্ল্যান কিনুন' : 'Buy Plan'}</span>
            </button>
          )}

          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors whitespace-nowrap"
            title="Switch Language / ভাষা পরিবর্তন"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'bn' ? 'EN' : 'বাংলা'}</span>
          </button>

          {/* Merchant API Settings button */}
          <button
            onClick={openApiSettings}
            className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors whitespace-nowrap"
            title="Configure API Keys"
          >
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">{t.nav.apiSettings}</span>
          </button>

          {/* Auth Button */}
          <button
            onClick={openAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-lg shadow-sm shadow-cyan-500/20 transition-all whitespace-nowrap"
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{user ? user.name : t.nav.login}</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation bar with Lock indicators */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-800/80 bg-[#070b14]/95 px-2 py-1.5 text-xs font-medium overflow-x-auto">
        <button
          onClick={() => setCurrentTab('search')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'search' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          <Search className="w-3.5 h-3.5" />
          {t.nav.search}
        </button>
        <button
          onClick={() => setCurrentTab('batch')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'batch' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          <Layers className="w-3.5 h-3.5" />
          {t.nav.batch}
          {!isPaid && <Lock className="w-2.5 h-2.5 text-amber-400" />}
        </button>
        <button
          onClick={() => setCurrentTab('community')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'community' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          <Database className="w-3.5 h-3.5" />
          {t.nav.community}
          {!isPaid && <Lock className="w-2.5 h-2.5 text-amber-400" />}
        </button>
        <button
          onClick={() => setCurrentTab('couriers')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'couriers' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          <Activity className="w-3.5 h-3.5" />
          {t.nav.couriers}
          {!isPaid && <Lock className="w-2.5 h-2.5 text-amber-400" />}
        </button>
        <button
          onClick={() => setCurrentTab('apiDocs')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'apiDocs' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          <Code2 className="w-3.5 h-3.5" />
          {t.nav.apiDocs}
          {!isPaid && <Lock className="w-2.5 h-2.5 text-amber-400" />}
        </button>
        <button
          onClick={() => setCurrentTab('pricing')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'pricing' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          <Tag className="w-3.5 h-3.5" />
          {t.nav.pricing}
        </button>
        <button
          onClick={openTrustBadge}
          className="flex items-center gap-1 px-2.5 py-1 rounded whitespace-nowrap text-cyan-300 font-medium"
        >
          <Award className="w-3.5 h-3.5 text-cyan-400" />
          <span>সিল</span>
        </button>
      </div>
    </header>
  );
};
