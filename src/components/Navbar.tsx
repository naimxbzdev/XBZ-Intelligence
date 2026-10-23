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
  Sun,
  Moon,
  Bot,
} from 'lucide-react';
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
  isSandbox?: boolean;
  user: any;
  userPlan: PlanTier;
  guestSearchesCount?: number;
  isGuestLimitReached?: boolean;
  theme?: 'dark' | 'light';
  toggleTheme?: () => void;
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
  theme = 'dark',
  toggleTheme,
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
          {/* Brand Emblem Logo (Clean emblem image without text) */}
          <button
            type="button"
            onClick={() => handleNavClick('search')}
            className="cursor-pointer shrink-0 select-none text-left focus:outline-none flex items-center py-1"
            aria-label="XBZ Home"
          >
            <img
              src="/logo_transparent.png"
              alt="XBZ XI Emblem"
              className="h-8 sm:h-9 w-auto object-contain drop-shadow-[0_0_12px_rgba(34,211,238,0.5)] transition-transform duration-300 hover:scale-105"
            />
          </button>

          {/* Desktop Navigation Links (Single line, whitespace-nowrap) */}
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

          {/* Zone: Actions (Upgrade, Language switcher, Auth & Mobile Menu toggle) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-auto lg:ml-0">
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

            {/* Theme Toggle (Deep Dark / Light) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-all whitespace-nowrap cursor-pointer active:scale-95"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Deep Dark Theme'}
              aria-label="Toggle color theme"
            >
              {theme === 'dark' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />
                  <span className="hidden sm:inline text-[11px] font-medium">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                  <span className="hidden sm:inline text-[11px] font-medium text-slate-700">Light</span>
                </>
              )}
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

              <button
                onClick={() => {
                  if (toggleTheme) toggleTheme();
                }}
                className="col-span-2 flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white"
              >
                <div className="flex items-center gap-2">
                  {theme === 'dark' ? (
                    <Moon className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-500" />
                  )}
                  <span>{theme === 'dark' ? (lang === 'bn' ? 'ডিপ ডার্ক থিম' : 'Deep Dark Theme') : (lang === 'bn' ? 'লাইট থিম' : 'Light Theme')}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 uppercase">
                  {theme}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-xbz-ai-chat'));
                  setMobileMenuOpen(false);
                }}
                className="col-span-2 flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/80 via-indigo-950/70 to-emerald-950/70 border border-cyan-500/40 text-cyan-200 hover:text-white transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold text-xs">{lang === 'bn' ? '২৪/৭ এআই লাইভ সাপোর্ট (Gemini)' : '24/7 AI Live Support (Gemini)'}</span>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{lang === 'bn' ? 'লাইভ চ্যাট' : 'Live Chat'}</span>
                </span>
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
          className="flex flex-col items-center justify-center flex-1 h-full py-1 transition-all active:scale-95 cursor-pointer min-h-[48px]"
          aria-label={lang === 'bn' ? 'সার্চ' : 'Search'}
        >
          <div className={`flex items-center justify-center px-3.5 py-1 rounded-full transition-all ${
            currentTab === 'search' ? 'bg-cyan-500/25 text-cyan-300 shadow-sm shadow-cyan-500/20' : 'text-slate-400'
          }`}>
            <Search className="w-5 h-5" />
          </div>
          <span className={`text-[10px] mt-1 tracking-tight leading-none ${
            currentTab === 'search' ? 'text-cyan-300 font-bold' : 'text-slate-400 font-medium'
          }`}>
            {lang === 'bn' ? 'সার্চ' : 'Search'}
          </span>
        </button>

        {/* Tab 2: Batch Check */}
        <button
          type="button"
          onClick={() => handleNavClick('batch')}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 transition-all active:scale-95 cursor-pointer min-h-[48px]"
          aria-label={lang === 'bn' ? 'বাল্ক' : 'Batch'}
        >
          <div className={`flex items-center justify-center px-3.5 py-1 rounded-full transition-all ${
            currentTab === 'batch' ? 'bg-cyan-500/25 text-cyan-300 shadow-sm shadow-cyan-500/20' : 'text-slate-400'
          }`}>
            <Layers className="w-5 h-5" />
          </div>
          <span className={`text-[10px] mt-1 tracking-tight leading-none ${
            currentTab === 'batch' ? 'text-cyan-300 font-bold' : 'text-slate-400 font-medium'
          }`}>
            {lang === 'bn' ? 'বাল্ক' : 'Batch'}
          </span>
        </button>

        {/* Tab 3: Fraud Community Database */}
        <button
          type="button"
          onClick={() => handleNavClick('community')}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 transition-all active:scale-95 cursor-pointer min-h-[48px]"
          aria-label={lang === 'bn' ? 'প্রতারক' : 'Fraud DB'}
        >
          <div className={`flex items-center justify-center px-3.5 py-1 rounded-full transition-all ${
            currentTab === 'community' ? 'bg-cyan-500/25 text-cyan-300 shadow-sm shadow-cyan-500/20' : 'text-slate-400'
          }`}>
            <Database className="w-5 h-5" />
          </div>
          <span className={`text-[10px] mt-1 tracking-tight leading-none ${
            currentTab === 'community' ? 'text-cyan-300 font-bold' : 'text-slate-400 font-medium'
          }`}>
            {lang === 'bn' ? 'প্রতারক' : 'Fraud DB'}
          </span>
        </button>

        {/* Tab 4: Pricing */}
        <button
          type="button"
          onClick={() => handleNavClick('pricing')}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 transition-all active:scale-95 cursor-pointer min-h-[48px]"
          aria-label={lang === 'bn' ? 'প্যাকেজ' : 'Pricing'}
        >
          <div className={`flex items-center justify-center px-3.5 py-1 rounded-full transition-all ${
            currentTab === 'pricing' ? 'bg-cyan-500/25 text-cyan-300 shadow-sm shadow-cyan-500/20' : 'text-slate-400'
          }`}>
            <Tag className="w-5 h-5" />
          </div>
          <span className={`text-[10px] mt-1 tracking-tight leading-none ${
            currentTab === 'pricing' ? 'text-cyan-300 font-bold' : 'text-slate-400 font-medium'
          }`}>
            {lang === 'bn' ? 'প্যাকেজ' : 'Pricing'}
          </span>
        </button>

        {/* Tab 5: Admin Panel (if admin) or Trust Seal */}
        {isAdmin ? (
          <button
            type="button"
            onClick={() => handleNavClick('admin')}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 transition-all active:scale-95 cursor-pointer min-h-[48px]"
            aria-label={lang === 'bn' ? 'এডমিন' : 'Admin'}
          >
            <div className={`flex items-center justify-center px-3.5 py-1 rounded-full transition-all ${
              currentTab === 'admin' ? 'bg-cyan-500/25 text-cyan-300 shadow-sm shadow-cyan-500/20' : 'text-cyan-400/80'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className={`text-[10px] mt-1 tracking-tight leading-none ${
              currentTab === 'admin' ? 'text-cyan-300 font-bold' : 'text-cyan-400/80 font-medium'
            }`}>
              {lang === 'bn' ? 'এডমিন' : 'Admin'}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={openTrustBadge}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 transition-all active:scale-95 cursor-pointer min-h-[48px]"
            aria-label={lang === 'bn' ? 'সিল' : 'Seal'}
          >
            <div className="flex items-center justify-center px-3.5 py-1 rounded-full text-cyan-400 hover:text-white transition-all">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-1 tracking-tight leading-none text-cyan-300 font-medium">
              {lang === 'bn' ? 'সিল' : 'Seal'}
            </span>
          </button>
        )}
      </nav>
    </>
  );
};
