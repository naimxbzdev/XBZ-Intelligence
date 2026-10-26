import React from 'react';
import {
  Search,
  Layers,
  Database,
  Activity,
  Tag,
  Code2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  ArrowRight,
  X,
  Store,
  ShieldAlert,
  Gauge,
} from 'lucide-react';
import type { Language } from '../utils/translations.ts';
import type { PlanTier } from '../types/intelligence.ts';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lang: Language;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  user: any;
  userPlan: PlanTier;
  guestSearchesCount?: number;
  checksRemaining?: number;
  openPayment: () => void;
  openAuth: () => void;
}

const SidebarComponent: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  lang,
  isOpenMobile,
  setIsOpenMobile,
  isCollapsed,
  setIsCollapsed,
  user,
  userPlan,
  checksRemaining = 100,
  openPayment,
  openAuth,
}) => {
  const isPaid = userPlan === 'pro' || userPlan === 'enterprise';
  const isAdmin = Boolean(
    user?.email &&
      ['naimxbz@gmail.com', 'xbz.dev@gmail.com', 'naeem@webxpress.com.bd'].includes(String(user.email).trim().toLowerCase())
  );

  const navItems = [
    {
      id: 'search',
      labelBn: 'পাবলিক সার্চ',
      labelEn: 'Public Search',
      subtitleBn: 'ফোন নম্বর ও কুরিয়ার বিশ্লেষণ',
      subtitleEn: 'Phone & Courier Lookup',
      icon: Search,
      isPro: false,
    },
    {
      id: 'batch',
      labelBn: 'বাল্ক ভেরিফিকেশন',
      labelEn: 'Bulk Verification',
      subtitleBn: 'একসাথে ৩০টি ও CSV এক্সপোর্ট',
      subtitleEn: 'Batch Screening & CSV',
      icon: Layers,
      isPro: true,
      badge: 'PRO',
    },
    {
      id: 'community',
      labelBn: 'প্রতারক ডাটাবেস',
      labelEn: 'Dispute Registry',
      subtitleBn: 'কমিউনিটি রিপোর্ট ও হিস্ট্রি',
      subtitleEn: 'Community Fraud Database',
      icon: Database,
      badge: lang === 'bn' ? 'লাইভ' : 'LIVE',
    },
    {
      id: 'couriers',
      labelBn: '৫টি কুরিয়ার স্পেক্স',
      labelEn: '5 Couriers Status',
      subtitleBn: 'সেন্ট্রাল গেটওয়ে ও এপিআই',
      subtitleEn: 'Gateway & Live Endpoints',
      icon: Activity,
    },
    {
      id: 'pricing',
      labelBn: 'প্যাকেজ ও প্রাইসিং',
      labelEn: 'Pricing & Plans',
      subtitleBn: 'ফ্রি ও মার্চেন্ট প্রো প্ল্যান',
      subtitleEn: 'Free & Merchant Plans',
      icon: Tag,
      badge: lang === 'bn' ? '১০০ ফ্রি' : '100 Free',
    },
    {
      id: 'apiDocs',
      labelBn: 'API ডকুমেন্টেশন',
      labelEn: 'API Documentation',
      subtitleBn: 'WooCommerce ও REST API',
      subtitleEn: 'Store API & Endpoints',
      icon: Code2,
    },
    {
      id: 'usageQuota',
      labelBn: 'ব্যবহার কোটা (API)',
      labelEn: 'Usage Quota',
      subtitleBn: 'দৈনিক ও মাসিক লিমিট ট্র্যাকার',
      subtitleEn: 'Daily & Monthly Tracker',
      icon: Gauge,
      badge: '90% ALERT',
    },
  ];

  if (isAdmin) {
    navItems.push({
      id: 'admin',
      labelBn: 'এডমিন ড্যাশবোর্ড',
      labelEn: 'Admin Dashboard',
      subtitleBn: 'ইউজার ও রিপোর্ট কন্ট্রোল',
      subtitleEn: 'Users & System Health',
      icon: ShieldAlert,
      badge: 'ADMIN',
      isPro: false,
    });
  }

  const handleSelectTab = (tabId: string) => {
    setCurrentTab(tabId);
    setIsOpenMobile(false);
  };

  const planDisplayName = user
    ? userPlan === 'enterprise'
      ? (lang === 'bn' ? 'এন্টারপ্রাইজ' : 'Enterprise')
      : userPlan === 'pro'
      ? (lang === 'bn' ? 'মার্চেন্ট প্রো' : 'Merchant Pro')
      : (lang === 'bn' ? 'ফ্রি স্টার্টার' : 'Free Starter')
    : (lang === 'bn' ? 'গেস্ট ইউজার' : 'Guest User');

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      {/* Navigation Header / Group Label */}
      <div className="space-y-4">
        {/* Mobile Header Inside Drawer */}
        <div className="lg:hidden flex items-center justify-between px-4 pt-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo_transparent.png"
              alt="Logo"
              className="h-7 w-auto object-contain"
            />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'কুরিয়ার ফ্রড চেকার' : 'Fraud Checker'}
            </span>
          </div>
          <button
            onClick={() => setIsOpenMobile(false)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section title on desktop */}
        <div className="px-3 pt-2">
          {!isCollapsed ? (
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {lang === 'bn' ? 'নেভিগেশন মেনু' : 'Navigation Menu'}
              </span>
              <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-1.5 py-0.5 rounded">
                v2.4
              </span>
            </div>
          ) : (
            <div className="h-2" />
          )}

          {/* Nav List */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              const Icon = item.icon;
              const label = lang === 'bn' ? item.labelBn : item.labelEn;
              const subtitle = lang === 'bn' ? item.subtitleBn : item.subtitleEn;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  title={isCollapsed ? label : undefined}
                  className={`w-full text-left rounded-xl transition-all cursor-pointer flex items-center gap-3 select-none ${
                    isCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'
                  } ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20 font-bold dark:bg-cyan-500/20 dark:text-cyan-300 dark:border dark:border-cyan-500/40'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive
                        ? 'text-white dark:text-cyan-300'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  />

                  {!isCollapsed && (
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-1.5">
                      <div className="truncate">
                        <div className="text-xs sm:text-sm font-semibold truncate leading-tight">
                          {label}
                        </div>
                        <div
                          className={`text-[10px] truncate leading-tight mt-0.5 ${
                            isActive
                              ? 'text-emerald-100 dark:text-cyan-200/80 font-normal'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {subtitle}
                        </div>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide shrink-0 ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : item.isPro
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300/60'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300/60'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar Footer - Account Status & Collapse Toggle */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 space-y-3">
        {/* User Account / Plan Card */}
        {!isCollapsed ? (
          <div className="p-3 rounded-xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {lang === 'bn' ? 'আপনার প্ল্যান' : 'Current Plan'}
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isPaid
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {planDisplayName}
              </span>
            </div>

            <div className="text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center justify-between">
              <span>{lang === 'bn' ? 'অবশিষ্ট চেক:' : 'Checks Left:'}</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {userPlan === 'enterprise' ? '∞' : `${checksRemaining} টি`}
              </span>
            </div>

            {!isPaid ? (
              <button
                type="button"
                onClick={openPayment}
                className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300 fill-current" />
                <span>{lang === 'bn' ? 'প্রো আনলক করুন (৳৪৯৯)' : 'Upgrade Pro (৳499)'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSelectTab('pricing')}
                className="w-full py-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-[10px] text-center transition-colors"
              >
                {lang === 'bn' ? 'প্যাকেজ ডিটেইলস' : 'View Plan Details'}
              </button>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => handleSelectTab('pricing')}
              title={lang === 'bn' ? 'প্যাকেজ ও প্রাইসিং' : 'Pricing & Plans'}
              className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 transition-colors"
            >
              <Zap className="w-4 h-4 fill-current" />
            </button>
          </div>
        )}

        {/* Desktop Collapse / Expand Toggle Button */}
        <div className="hidden lg:flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full py-1.5 px-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-center gap-2 text-xs font-semibold"
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>{lang === 'bn' ? 'সাইডবার গুটিয়ে নিন' : 'Collapse Sidebar'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Mobile Drawer Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* 2. Mobile Drawer Slide-over Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-[#070b14] border-r border-slate-200/90 dark:border-slate-800 shadow-2xl lg:hidden transform transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile Sidebar"
      >
        {sidebarContent}
      </aside>

      {/* 3. Desktop Fixed Collapsible Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed top-14 sm:top-16 bottom-0 left-0 z-30 bg-white/95 dark:bg-[#070b14]/95 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
        aria-label="Desktop Sidebar"
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export const Sidebar = React.memo(SidebarComponent);

