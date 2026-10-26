import React from 'react';
import {
  Key,
  User,
  Globe,
  Zap,
  Menu,
  Sun,
  Moon,
  PanelLeft,
  ChevronRight,
  ShieldCheck,
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
  openTrustBadge?: () => void;
  user: any;
  userPlan: PlanTier;
  guestSearchesCount?: number;
  isGuestLimitReached?: boolean;
  theme?: 'dark' | 'light';
  toggleTheme?: () => void;
  onSelectTheme?: (theme: 'dark' | 'light') => void;
  onToggleMobileSidebar: () => void;
  onToggleDesktopSidebar: () => void;
  isSidebarCollapsed: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  setCurrentTab,
  lang,
  setLang,
  openApiSettings,
  openAuth,
  openPayment,
  user,
  userPlan,
  theme = 'light',
  toggleTheme,
  onSelectTheme,
  onToggleMobileSidebar,
  onToggleDesktopSidebar,
  isSidebarCollapsed,
}) => {
  const t = (translations && translations[lang]) ? translations[lang] : (translations?.bn || translations?.en);
  const isPaid = userPlan === 'pro' || userPlan === 'enterprise';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-[#070b14]/95 backdrop-blur-md shadow-xs">
      <div className="w-full px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Sidebar Toggle Button + Brand Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
          {/* Mobile Sidebar Hamburger Toggle */}
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-colors cursor-pointer"
            aria-label="Open navigation sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop Sidebar Quick Collapse/Expand Toggle */}
          <button
            type="button"
            onClick={onToggleDesktopSidebar}
            className="hidden lg:flex p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 transition-colors cursor-pointer"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label="Toggle Sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          {/* Brand Emblem Logo with SmartPOS Style Lockup */}
          <button
            type="button"
            onClick={() => setCurrentTab('search')}
            className="cursor-pointer shrink-0 select-none text-left focus:outline-none flex items-center gap-2.5 py-1"
            aria-label="Home"
          >
            <img
              src="/logo_transparent.png"
              alt="Logo"
              className="h-8 sm:h-9 w-auto object-contain transition-transform duration-300 hover:scale-105"
            />
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                {lang === 'bn' ? 'কুরিয়ার ফ্রড চেকার' : 'Courier Fraud Checker'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                Smart Delivery Screening
              </span>
            </div>
          </button>
        </div>

        {/* Right: Only the requested 4 utilities (Plan CTA, Theme toggle, API settings, Auth/Profile) + Language */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* 1. Plan কিনুন / প্যাকেজ কিনুন Button */}
          {user && isPaid ? (
            <button
              onClick={() => setCurrentTab('pricing')}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 dark:text-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-600/50 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
              title="View Plan Details"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 fill-current" />
              <span className="capitalize">{userPlan} Plan</span>
            </button>
          ) : (
            <button
              onClick={openPayment}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-xl shadow-xs transition-all whitespace-nowrap active:scale-95 cursor-pointer hover:shadow-md"
              title="Buy or Upgrade Plan"
            >
              <Zap className="w-3.5 h-3.5 text-white fill-current" />
              <span className="hidden sm:inline font-bold">
                {lang === 'bn' ? 'প্যাকেজ কিনুন' : 'Buy Plan'}
              </span>
              <span className="sm:hidden font-bold">
                {lang === 'bn' ? 'প্ল্যান' : 'Plan'}
              </span>
            </button>
          )}

          {/* 2. Light & Dark Mode Segmented Toggle */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 select-none">
            <button
              type="button"
              onClick={() => {
                if (onSelectTheme) onSelectTheme('light');
                else if (theme === 'dark' && toggleTheme) toggleTheme();
              }}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              title="লাইট মোড সক্রিয় করুন (Switch to Light Mode)"
              aria-pressed={theme === 'light'}
            >
              <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-amber-500 fill-amber-500/30' : 'text-slate-400'}`} />
              <span className="hidden md:inline text-[11px]">Light</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onSelectTheme) onSelectTheme('dark');
                else if (theme === 'light' && toggleTheme) toggleTheme();
              }}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#0f172a] text-cyan-400 shadow-xs border border-cyan-500/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="ডার্ক মোড সক্রিয় করুন (Switch to Dark Mode)"
              aria-pressed={theme === 'dark'}
            >
              <Moon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-cyan-400 fill-cyan-400/30' : 'text-slate-500'}`} />
              <span className="hidden md:inline text-[11px]">Dark</span>
            </button>
          </div>

          {/* 3. API Settings Button */}
          <button
            onClick={openApiSettings}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 dark:text-slate-200 dark:hover:text-white dark:bg-slate-800/60 dark:hover:bg-slate-800 dark:border-slate-700/80 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            title="Configure Merchant API Keys"
          >
            <Key className="w-3.5 h-3.5 text-emerald-600 dark:text-cyan-400" />
            <span className="hidden md:inline">{t.nav.apiSettings}</span>
          </button>

          {/* 4. Log in / Sign up (or Profile) Button */}
          <button
            onClick={openAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all whitespace-nowrap active:scale-95 cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            <span className="max-w-[70px] sm:max-w-[110px] truncate">
              {user ? user.name : (lang === 'bn' ? 'লগইন / সাইনআপ' : 'Login / Sign Up')}
            </span>
          </button>

          {/* 5. Language Switcher (Compact) */}
          <button
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="hidden sm:flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 dark:text-slate-300 dark:hover:text-white dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:border-slate-700/60 rounded-xl transition-colors whitespace-nowrap cursor-pointer active:scale-95"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-cyan-400" />
            <span>{lang === 'bn' ? 'EN' : 'বাংলা'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
