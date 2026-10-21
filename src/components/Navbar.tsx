import React, { useState } from 'react';
import {
  ShieldCheck,
  Key,
  User,
  Globe,
  Layers,
  Database,
  Activity,
  Code2,
  Tag,
  Search,
  Lock,
  Zap,
  CheckCircle2,
  Award,
  Menu,
  X,
} from 'lucide-react';
import type { Language } from '../utils/translations.ts';
import { translations } from '../utils/translations.ts';
import type { PlanTier } from '../types/intelligence.ts';
import { BrandLogo } from './BrandLogo.tsx';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  openApiSettings: () => void;
  openAuth: () => void;
  openPayment: () => void;
  openTrustBadge: () => void;
  isSandbox?: boolean;
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
  user,
  userPlan,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[lang];
  const isPaid = userPlan === 'pro' || userPlan === 'enterprise';

  // Strictly gate admin link to naimxbz@gmail.com and xbz.dev@gmail.com
  const isAdmin = Boolean(
    user?.email &&
      ['naimxbz@gmail.com', 'xbz.dev@gmail.com'].includes(String(user.email).trim().toLowerCase())
  );

  const handleNavClick = (tab: string) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* =========================================================================
          NATIVE ANDROID STYLE TOP APP BAR (Compact 56px, high tactile density)
         ========================================================================= */}
      <header className="sticky top-0 z-40 w-full border-b border-cyan-500/15 bg-[#070b14]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-6">
          {/* Zone 1: Futuristic Glossy Emblem Logo & Compact High-Tech Wordmark */}
          <button
            type="button"
            onClick={() => handleNavClick('search')}
            className="cursor-pointer shrink-0 select-none text-left focus:outline-none"
            aria-label="XBZ Home"
          >
            <BrandLogo size="md" showTagline={false} />
          </button>

          {/* Zone 2: Desktop Navigation Links (Single line, whitespace-nowrap) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium">
            {/* Public Search */}
            <button
              onClick={() => handleNavClick('search')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'search'
                  ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>{t.nav.search}</span>
            </button>

            {/* Batch Check */}
            <button
              onClick={() => handleNavClick('batch')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'batch'
                  ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{t.nav.batch}</span>
              {!isPaid && <Lock className="w-3 h-3 text-amber-400/80 ml-0.5" />}
            </button>

            {/* Community Database */}
            <button
              onClick={() => handleNavClick('community')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'community'
                  ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>{t.nav.community}</span>
              {!isPaid && <Lock className="w-3 h-3 text-amber-400/80 ml-0.5" />}
            </button>

            {/* Courier Status */}
            <button
              onClick={() => handleNavClick('couriers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'couriers'
                  ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>{t.nav.couriers}</span>
              {!isPaid && <Lock className="w-3 h-3 text-amber-400/80 ml-0.5" />}
            </button>

            {/* API Docs */}
            <button
              onClick={() => handleNavClick('apiDocs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'apiDocs'
                  ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>{t.nav.apiDocs}</span>
              {!isPaid && <Lock className="w-3 h-3 text-amber-400/80 ml-0.5" />}
            </button>

            {/* Pricing */}
            <button
              onClick={() => handleNavClick('pricing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'pricing'
                  ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>{t.nav.pricing}</span>
            </button>

            {/* Admin Panel: Gated */}
            {isAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  currentTab === 'admin'
                    ? 'text-cyan-400 bg-cyan-950/60 border border-cyan-400/50 font-bold shadow-sm shadow-cyan-950'
                    : 'text-cyan-300 hover:text-white bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-500/30'
                }`}
                title="Authorized Admin Console"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>{t.nav.admin || 'Admin Panel'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              </button>
            )}
          </nav>

          {/* Zone 3: Actions (Upgrade, Language switcher, Auth & Mobile Menu toggle) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Active Plan Badge or Upgrade Button */}
            {user ? (
              isPaid ? (
                <div className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-cyan-300 bg-cyan-950/50 border border-cyan-500/40 rounded-lg">
                  <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="capitalize hidden sm:inline">{userPlan} Plan</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={openPayment}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 rounded-lg shadow-sm shadow-amber-500/20 transition-all whitespace-nowrap active:scale-95 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>{lang === 'bn' ? 'আপগ্রেড' : 'Upgrade'}</span>
                  </button>
                </div>
              )
            ) : (
              <button
                onClick={openPayment}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 rounded-lg shadow-sm shadow-amber-500/20 transition-all whitespace-nowrap active:scale-95 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">{lang === 'bn' ? 'প্ল্যান কিনুন' : 'Buy Plan'}</span>
                <span className="sm:hidden">{lang === 'bn' ? 'প্ল্যান' : 'Plan'}</span>
              </button>
            )}

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors whitespace-nowrap cursor-pointer active:scale-95"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'bn' ? 'EN' : 'বাংলা'}</span>
            </button>

            {/* Merchant API Settings button (Desktop) */}
            <button
              onClick={openApiSettings}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              title="Configure API Keys"
            >
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">{t.nav.apiSettings}</span>
            </button>

            {/* Auth / Profile Button */}
            <button
              onClick={openAuth}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-900 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-lg shadow-sm shadow-cyan-500/20 transition-all whitespace-nowrap active:scale-95 cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span className="max-w-[75px] sm:max-w-[100px] truncate">{user ? user.name : t.nav.login}</span>
            </button>

            {/* Mobile More Options Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/70 transition-colors"
              aria-label="Toggle navigation options"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Sheet for Secondary Actions (Specs, Settings, Seal) */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-[#070b14]/98 px-4 py-3.5 space-y-3 backdrop-blur-2xl animate-fade-in shadow-2xl">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800/80">
              <span className="font-semibold text-white">More Quick Tools</span>
              <span className="font-mono text-[10px] text-cyan-400">XBZ INTELLIGENCE</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleNavClick('couriers')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white"
              >
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>{t.nav.couriers}</span>
              </button>

              <button
                onClick={() => handleNavClick('apiDocs')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white"
              >
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>{t.nav.apiDocs}</span>
              </button>

              <button
                onClick={() => {
                  openTrustBadge();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-cyan-300 font-semibold"
              >
                <Award className="w-4 h-4 text-cyan-400" />
                <span>{lang === 'bn' ? 'মার্চেন্ট সিল' : 'Trust Seal'}</span>
              </button>

              <button
                onClick={() => {
                  openApiSettings();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white"
              >
                <Key className="w-4 h-4 text-cyan-400" />
                <span>{t.nav.apiSettings}</span>
              </button>
            </div>

            {isAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 text-xs font-bold"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>{t.nav.admin || 'Admin Panel'}</span>
                </div>
                <span className="text-[10px] bg-cyan-400 text-slate-950 px-2 py-0.5 rounded font-mono font-bold">
                  AUTHORIZED
                </span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* =========================================================================
          NATIVE ANDROID FIXED BOTTOM NAVIGATION BAR (Thumb Zone - 100% Native App Feel)
         ========================================================================= */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#070b14]/95 backdrop-blur-xl border-t border-slate-800/90 lg:hidden flex items-center justify-around h-16 px-1 shadow-[0_-8px_30px_rgba(0,0,0,0.7)] select-none"
      >
        {/* Tab 1: Search (Home) */}
        <button
          type="button"
          onClick={() => handleNavClick('search')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-all active:scale-90 ${
            currentTab === 'search' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Search className="w-5 h-5" />
            {currentTab === 'search' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight leading-none">
            {lang === 'bn' ? 'সার্চ' : 'Search'}
          </span>
        </button>

        {/* Tab 2: Batch Check */}
        <button
          type="button"
          onClick={() => handleNavClick('batch')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-all active:scale-90 ${
            currentTab === 'batch' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Layers className="w-5 h-5" />
            {currentTab === 'batch' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight leading-none">
            {lang === 'bn' ? 'বাল্ক' : 'Batch'}
          </span>
        </button>

        {/* Tab 3: Fraud Community Database */}
        <button
          type="button"
          onClick={() => handleNavClick('community')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-all active:scale-90 ${
            currentTab === 'community' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Database className="w-5 h-5" />
            {currentTab === 'community' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight leading-none">
            {lang === 'bn' ? 'প্রতারক' : 'Fraud DB'}
          </span>
        </button>

        {/* Tab 4: Pricing */}
        <button
          type="button"
          onClick={() => handleNavClick('pricing')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-all active:scale-90 ${
            currentTab === 'pricing' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Tag className="w-5 h-5" />
            {currentTab === 'pricing' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight leading-none">
            {lang === 'bn' ? 'প্যাকেজ' : 'Pricing'}
          </span>
        </button>

        {/* Tab 5: Admin Panel (if admin) or Trust Seal */}
        {isAdmin ? (
          <button
            type="button"
            onClick={() => handleNavClick('admin')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-all active:scale-90 ${
              currentTab === 'admin' ? 'text-cyan-400 font-bold' : 'text-cyan-300/80 hover:text-cyan-200'
            }`}
          >
            <div className="relative">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              {currentTab === 'admin' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight leading-none">
              {lang === 'bn' ? 'এডমিন' : 'Admin'}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={openTrustBadge}
            className="flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-all active:scale-90 text-cyan-300 hover:text-white"
          >
            <Award className="w-5 h-5 text-cyan-400" />
            <span className="text-[10px] mt-1 tracking-tight leading-none">
              {lang === 'bn' ? 'সিল' : 'Seal'}
            </span>
          </button>
        )}
      </nav>
    </>
  );
};
