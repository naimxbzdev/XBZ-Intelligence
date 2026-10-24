import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { LiveFraudTicker } from './components/LiveFraudTicker.tsx';
import { HeroSearch } from './components/HeroSearch.tsx';
import { CourierStatusStrip } from './components/CourierStatusStrip.tsx';
import { AnalysisResultView } from './components/AnalysisResultView.tsx';
import { BatchCheckView } from './components/BatchCheckView.tsx';
import { CommunityDatabaseView } from './components/CommunityDatabaseView.tsx';
import { CourierSpecsView } from './components/CourierSpecsView.tsx';
import { ApiDocsView } from './components/ApiDocsView.tsx';
import { PricingView } from './components/PricingView.tsx';
import { ReportFraudModal } from './components/ReportFraudModal.tsx';
import { ApiSettingsModal } from './components/ApiSettingsModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { PaymentModal } from './components/PaymentModal.tsx';
import { TrustBadgeModal } from './components/TrustBadgeModal.tsx';
import { PlanGatePaywall } from './components/PlanGatePaywall.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { LiveSupportButton } from './components/LiveSupportButton.tsx';
import { Footer } from './components/Footer.tsx';
import { SmartPosHomeContent } from './components/SmartPosHomeContent.tsx';
import type { Language } from './utils/translations.ts';
import type { PhoneAnalysisResult, CourierStatusInfo, PlanTier, RecentSearchItem } from './types/intelligence.ts';
import { safeApiFetch } from './utils/apiClient.ts';
import { CheckCircle2, AlertOctagon, X, Bell } from 'lucide-react';


const INITIAL_COURIER_STATUSES: CourierStatusInfo[] = [
  {
    courier: 'steadfast',
    displayName: 'Steadfast Courier',
    status: 'connected',
    description: {
      bn: 'বাংলাদেশের শীর্ষ কুরিয়ার। অফিসিয়াল মার্চেন্ট এপিআই ও সেন্ট্রাল গেটওয়ে দিয়ে ফোন ফ্রড চেক সাপোর্ট করে।',
      en: 'Leading courier in Bangladesh. Supports phone number fraud checking via merchant API & unified gateway.'
    },
    phoneLookupSupported: true,
    officialDocUrl: 'https://portal.steadfast.com.bd/api-doc',
    requiredFields: ['Api-Key', 'Secret-Key']
  },
  {
    courier: 'pathao',
    displayName: 'Pathao Courier',
    status: 'connected',
    description: {
      bn: 'পাঠাও মার্চেন্ট নেটওয়ার্ক। সেন্ট্রাল এপিআই দিয়ে রেটিং (excellent, moderate, bad) ও সফল ডেলিভারি হিস্ট্রি প্রাপ্তি।',
      en: 'Pathao Courier network. Integrated rating indicators (excellent, moderate, bad) and delivery stats.'
    },
    phoneLookupSupported: true,
    officialDocUrl: 'https://developer.pathao.com',
    requiredFields: ['client_id', 'client_secret']
  },
  {
    courier: 'redx',
    displayName: 'REDX Delivery',
    status: 'connected',
    description: {
      bn: 'রেডএক্স ডেলিভারি নেটওয়ার্ক। মার্চেন্ট টোকেন ও সেন্ট্রাল এপিআই ভিত্তিক পার্সেল ট্র্যাকিং ও সফলতার হার।',
      en: 'REDX Delivery Network. Token & gateway based parcel verification and success rates.'
    },
    phoneLookupSupported: true,
    officialDocUrl: 'https://openapi.redx.com.bd',
    requiredFields: ['api_token']
  },
  {
    courier: 'carrybee',
    displayName: 'CarryBee',
    status: 'connected',
    description: {
      bn: 'ক্যারিবি এক্সপ্রেস ডেলিভারি নেটওয়ার্ক। রিয়েল-টাইম পার্সেল সংখ্যা, সফল ডেলিভারি ও রিটার্ন মেট্রিক্স।',
      en: 'CarryBee Express Delivery. Real-time parcel counts, successful deliveries, and return statistics.'
    },
    phoneLookupSupported: true,
    officialDocUrl: 'https://carrybee.com',
    requiredFields: ['api_key']
  },
  {
    courier: 'paperfly',
    displayName: 'Paperfly (Smart Check v2)',
    status: 'connected',
    description: {
      bn: 'পেপারফ্লাই উইংস ডোরস্টেপ কুরিয়ার। রিটার্ন-টু-সেলার (RTS) অ্যানালাইসিস ও কাস্টমার রেটিং।',
      en: 'Paperfly Wings doorstep courier. RTS return analysis & customer delivery evaluation.'
    },
    phoneLookupSupported: true,
    officialDocUrl: 'https://api.paperfly.com.bd',
    requiredFields: ['username', 'password/key']
  }
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('search');
  const [lang, setLang] = useState<Language>('bn');
  const [searchResult, setSearchResult] = useState<PhoneAnalysisResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSandbox, setIsSandbox] = useState(false);
  const [courierStatuses, setCourierStatuses] = useState<CourierStatusInfo[]>(INITIAL_COURIER_STATUSES);
  
  // User & Plan state (Persistent from localStorage)
  const [user, setUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('xbz_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [userPlan, setUserPlan] = useState<PlanTier>(() => {
    try {
      const savedPlan = localStorage.getItem('xbz_user_plan');
      if (savedPlan === 'pro' || savedPlan === 'enterprise' || savedPlan === 'free') {
        return savedPlan;
      }
      return 'free';
    } catch {
      return 'free';
    }
  });

  // Guest Search Count tracking (Max 3 searches for non-registered visitors)
  const [guestSearchesCount, setGuestSearchesCount] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('xbz_guest_searches') || 0);
    } catch {
      return 0;
    }
  });

  // Recent Searches state: Last 5 phone numbers checked in current session (stored in localStorage)
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>(() => {
    try {
      const saved = localStorage.getItem('xbz_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addRecentSearch = (phone: string, resultData?: PhoneAnalysisResult) => {
    try {
      const cleanDigits = phone.replace(/\D/g, '');
      const validPhone = cleanDigits.startsWith('880') ? cleanDigits.slice(2) : cleanDigits;
      if (!validPhone) return;

      setRecentSearches((prev) => {
        // Remove existing item if searched previously so it is moved to top
        const filtered = prev.filter((item) => item.phone !== validPhone);
        const newItem: RecentSearchItem = {
          phone: validPhone,
          operator: resultData?.operator,
          status: resultData?.status,
          riskLevel: resultData?.riskLevel,
          score: resultData?.score,
          deliveryRate: resultData?.deliveryRate,
          searchedAt: Date.now(),
        };
        const updated = [newItem, ...filtered].slice(0, 5); // Keep strictly the last 5
        localStorage.setItem('xbz_recent_searches', JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.warn('Error saving recent searches to localStorage:', e);
    }
  };

  const handleClearRecentSearches = () => {
    try {
      localStorage.removeItem('xbz_recent_searches');
    } catch {}
    setRecentSearches([]);
    showToast(lang === 'bn' ? 'সাম্প্রতিক সার্চ তালিকা মুছে ফেলা হয়েছে।' : 'Recent searches cleared.', 'info');
  };

  const handleRemoveRecentSearch = (phoneToRemove: string) => {
    try {
      setRecentSearches((prev) => {
        const updated = prev.filter((item) => item.phone !== phoneToRemove);
        localStorage.setItem('xbz_recent_searches', JSON.stringify(updated));
        return updated;
      });
    } catch {}
  };


  // Theme state: 'light' (SmartPOS BD Clean Light) | 'dark' (Deep Dark)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const savedTheme = localStorage.getItem('xbz_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
      return 'light'; // SmartPOS BD clean light default
    } catch {
      return 'light';
    }
  });

  // Sync theme with documentElement CSS classes and attributes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
      try {
        localStorage.setItem('xbz_theme', 'light');
      } catch {}
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      try {
        localStorage.setItem('xbz_theme', 'dark');
      } catch {}
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportModalPhone, setReportModalPhone] = useState('');
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isAuthFromLimit, setIsAuthFromLimit] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<PlanTier>('pro');
  const [isTrustBadgeOpen, setIsTrustBadgeOpen] = useState(false);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Fetch courier status on mount with resilient fallbacks
  const fetchCourierStatus = async () => {
    try {
      const res = await fetch('/api/couriers/status');
      if (!res.ok) return;
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return;
      const data = await res.json();
      if (Array.isArray(data.couriers) && data.couriers.length > 0) {
        const sanitized = data.couriers.map((incoming: any) => {
          const courierKey = incoming?.courier || incoming?.key || incoming?.id;
          const fallback = INITIAL_COURIER_STATUSES.find((d) => d.courier === courierKey);
          const computedStatus = incoming?.status || (incoming?.connected ? 'connected' : (fallback?.status || 'connected'));
          return {
            ...fallback,
            ...incoming,
            courier: courierKey || fallback?.courier,
            displayName: incoming?.displayName || incoming?.name || fallback?.displayName,
            status: computedStatus,
            description: incoming?.description && typeof incoming.description === 'object'
              ? { ...fallback?.description, ...incoming.description }
              : (fallback?.description || { bn: '', en: '' }),
          };
        });
        setCourierStatuses(sanitized);
        setIsSandbox(data.isSandbox === true);
      }
    } catch {
      // Retain INITIAL_COURIER_STATUSES without crashing
    }
  };

  useEffect(() => {
    fetchCourierStatus();
  }, []);

  // Sync user plan if user object changes
  useEffect(() => {
    if (user?.plan) {
      const lower = user.plan.toLowerCase();
      if (lower.includes('enterprise')) {
        setUserPlan('enterprise');
        localStorage.setItem('xbz_user_plan', 'enterprise');
      } else if (lower.includes('pro')) {
        setUserPlan('pro');
        localStorage.setItem('xbz_user_plan', 'pro');
      } else {
        setUserPlan('free');
        localStorage.setItem('xbz_user_plan', 'free');
      }
    }
  }, [user]);

  // Checks Remaining for logged-in user
  const userChecksRemaining = user?.checksRemaining !== undefined ? user.checksRemaining : 100;
  const isFreeLimitReached = Boolean(user && userPlan === 'free' && userChecksRemaining <= 0);
  const isGuestLimitReached = Boolean(!user && guestSearchesCount >= 3);

  // Phone search handler with 3-search limit for guests and 100 checks for free starter
  const handlePhoneSearch = async (phone: string) => {
    // 1. Check guest search limit
    if (!user) {
      if (guestSearchesCount >= 3) {
        setSearchError(lang === 'bn' 
          ? '⚠️ আপনার ৩টি ফ্রি গেস্ট সার্চ লিমিট শেষ হয়েছে! কুরিয়ার ডেলিভারি হিস্ট্রি চেক ও ফ্রড স্ক্রিনিং চালিয়ে যেতে অনুগ্রহ করে অ্যাকাউন্ট তৈরি করুন বা লগইন করুন।' 
          : '⚠️ Your 3 free guest searches limit has ended. Please sign in or create a free account to continue.');
        setIsAuthFromLimit(true);
        setAuthModalMode('register');
        setIsAuthModalOpen(true);
        return;
      }
    } else {
      // 2. Check registered free starter limit (100 checks/mo)
      if (userPlan === 'free' && userChecksRemaining <= 0) {
        setSearchError(lang === 'bn'
          ? '⚠️ আপনার চলতি মাসের ১০০টি ফ্রি কুরিয়ার চেক লিমিট শেষ হয়েছে! আরও সার্চ চালিয়ে যেতে অনুগ্রহ করে মার্চেন্ট প্রো প্যাকেজে আপগ্রেড করুন।'
          : '⚠️ Your monthly 100 free checks limit has been reached! Please upgrade to Merchant Pro to continue.');
        handleOpenPaymentModal('pro');
        return;
      }
    }

    setIsSearching(true);
    setSearchError(null);
    setCurrentTab('search');

    try {
      const data = await safeApiFetch<PhoneAnalysisResult>('/api/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
        allowFallback: true,
      });

      setSearchResult(data);
      addRecentSearch(data.phone || phone, data);

      // Decrement searches / increment guest count
      if (!user) {
        const nextCount = guestSearchesCount + 1;
        setGuestSearchesCount(nextCount);
        localStorage.setItem('xbz_guest_searches', String(nextCount));

        if (nextCount === 3) {
          showToast(
            lang === 'bn' 
              ? 'এটি আপনার ৩টি গেস্ট ফ্রি সার্চের শেষটি! প্রতি মাসে ১০০টি ফ্রি চেক পেতে অ্যাকাউন্ট তৈরি করুন।' 
              : 'This was your last free guest check! Create an account to get 100 free checks per month.',
            'info'
          );
        }
      } else if (userPlan === 'free') {
        const nextChecks = Math.max(0, userChecksRemaining - 1);
        const updatedUser = { ...user, checksRemaining: nextChecks };
        setUser(updatedUser);
        localStorage.setItem('xbz_user', JSON.stringify(updatedUser));

        if (nextChecks === 0) {
          showToast(
            lang === 'bn'
              ? 'আপনার চলতি মাসের ১০০টি ফ্রি চেক সম্পন্ন হয়েছে! আনলিমিটেড চেক করতে প্রো প্ল্যানে আপগ্রেড করুন।'
              : 'You have used all 100 monthly free checks! Upgrade to Pro for unlimited checks.',
            'info'
          );
        }
      }

      setTimeout(() => {
        const el = document.getElementById('analysis-result');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err: any) {
      setSearchError(err.message || 'ত্রুটি ঘটেছে');
    } finally {
      setIsSearching(false);
    }
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login', fromLimit = false) => {
    setAuthModalMode(mode);
    setIsAuthFromLimit(fromLimit);
    setIsAuthModalOpen(true);
  };

  const handleOpenReportModal = (phone?: string) => {
    setReportModalPhone(phone || searchResult?.phone || '');
    setIsReportModalOpen(true);
  };

  const handleOpenPaymentModal = (plan: PlanTier = 'pro') => {
    setSelectedPlanForPayment(plan);
    setIsPaymentModalOpen(true);
  };

  // Plan Selection handler: Free Starter prompts registration if not logged in!
  const handleSelectPlan = (plan: PlanTier) => {
    if (plan === 'free') {
      if (!user) {
        // Prompt register first
        handleOpenAuth('register', false);
        showToast(
          lang === 'bn'
            ? 'ফ্রি স্টার্টার প্যাকেজের ১০০টি ফ্রি চেক পেতে অ্যাকাউন্ট তৈরি করুন।'
            : 'Please create an account to activate your 100 free monthly checks.',
          'info'
        );
        return;
      }

      setUserPlan('free');
      localStorage.setItem('xbz_user_plan', 'free');
      const updatedUser = { ...user, plan: 'Free Starter (100 checks/mo)', checksRemaining: user.checksRemaining ?? 100 };
      setUser(updatedUser);
      localStorage.setItem('xbz_user', JSON.stringify(updatedUser));

      showToast(
        lang === 'bn' 
          ? 'ফ্রি স্টার্টার প্যাকেজ সক্রিয় হয়েছে! কোনো পেমেন্টের প্রয়োজন নেই। প্রতি মাসে ১০০টি ফোন ফ্রি চেক করুন।' 
          : 'Free Starter plan activated! No payment required. Enjoy 100 free checks per month.',
        'success'
      );
      return;
    }

    handleOpenPaymentModal(plan);
  };

  const handlePaymentSuccess = (newPlan: PlanTier) => {
    setUserPlan(newPlan);
    localStorage.setItem('xbz_user_plan', newPlan);

    const planName = newPlan === 'enterprise' 
      ? 'Enterprise Unlimited' 
      : newPlan === 'pro' 
      ? 'Merchant Pro (2,500 checks)' 
      : 'Free Starter (100 checks/mo)';

    if (user) {
      const updated = {
        ...user,
        plan: planName,
        checksRemaining: newPlan === 'enterprise' ? 99999 : newPlan === 'pro' ? 2500 : 100,
      };
      setUser(updated);
      localStorage.setItem('xbz_user', JSON.stringify(updated));
    }

    showToast(
      lang === 'bn' 
        ? `${planName} সফলভাবে সক্রিয় হয়েছে! সকল প্রিমিয়াম ফিচার আনলক করা হয়েছে।` 
        : `${planName} activated successfully! All features unlocked.`,
      'success'
    );
  };

  const isPaidUser = userPlan === 'pro' || userPlan === 'enterprise';

  return (
    <div className="min-h-screen bg-[#eef2f6] dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col font-sans relative overflow-x-hidden transition-colors duration-200">
      {/* Toast Notification (Top Right to avoid floating WhatsApp button) */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-md p-4 rounded-2xl bg-gradient-to-r from-[#0d1e38] to-[#070b14] border border-cyan-500/40 shadow-2xl text-xs flex items-start gap-3 backdrop-blur-md animate-fade-in">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : toastMessage.type === 'error' ? (
            <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <Bell className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <span className="font-semibold text-white block leading-relaxed">
              {toastMessage.text}
            </span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Bar Navigation (Clean XBZ Intelligence Logo) */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lang={lang}
        setLang={setLang}
        openApiSettings={() => setIsApiSettingsOpen(true)}
        openAuth={() => handleOpenAuth('login')}
        openPayment={() => handleOpenPaymentModal('pro')}
        openTrustBadge={() => setIsTrustBadgeOpen(true)}
        isSandbox={isSandbox}
        user={user}
        userPlan={userPlan}
        guestSearchesCount={guestSearchesCount}
        isGuestLimitReached={isGuestLimitReached}
        theme={theme}
        toggleTheme={toggleTheme}
        onSelectTheme={(t) => setTheme(t)}
      />

      {/* Contained Live Fraud Ticker Wrapper with strict viewport boundary */}
      <div className="w-full max-w-full overflow-hidden relative">
        <LiveFraudTicker
          lang={lang}
          onOpenReportModal={() => handleOpenReportModal()}
          onViewDatabase={() => {
            if (isPaidUser) {
              setCurrentTab('community');
            } else {
              setCurrentTab('community');
            }
          }}
        />
      </div>

      {/* Main View Area */}
      <main className="flex-1">
        {/* TAB 1: Public Search */}
        {currentTab === 'search' && (
          <>
            <HeroSearch
              onSearch={handlePhoneSearch}
              isLoading={isSearching}
              lang={lang}
              isGuest={!user}
              guestSearchesCount={guestSearchesCount}
              isGuestLimitReached={isGuestLimitReached}
              isFreeLimitReached={isFreeLimitReached}
              checksRemaining={userChecksRemaining}
              onOpenAuth={(mode) => handleOpenAuth(mode, true)}
              onOpenUpgrade={() => handleOpenPaymentModal('pro')}
              user={user}
              recentSearches={recentSearches}
              onClearRecentSearches={handleClearRecentSearches}
              onRemoveRecentSearch={handleRemoveRecentSearch}
              lastResultRiskLevel={searchResult?.riskLevel}
            />

            {/* Error banner if search fails */}
            {searchError && (
              <div className="max-w-2xl mx-auto px-4 my-2">
                <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
                  {searchError}
                </div>
              </div>
            )}

            {/* Analysis Result Dashboard */}
            {searchResult && (
              <div id="analysis-result">
                <AnalysisResultView
                  result={searchResult}
                  lang={lang}
                  onOpenReportModal={handleOpenReportModal}
                  onOpenApiSettings={() => setIsApiSettingsOpen(true)}
                />
              </div>
            )}

            {/* 5 Courier Status Strip */}
            <div className="border-t border-slate-200 dark:border-slate-800/80 mt-6">
              <CourierStatusStrip
                courierStatuses={courierStatuses}
                lang={lang}
                onOpenSettings={() => setIsApiSettingsOpen(true)}
                onViewSpecs={() => setCurrentTab('couriers')}
              />
            </div>

            {/* SmartPOS BD Homepage Complete Sections: How It Works, Why Choose, FAQ, and Merchant CTA */}
            <div className="border-t border-slate-200 dark:border-slate-800/80">
              <SmartPosHomeContent
                lang={lang}
                onOpenAuth={(mode) => handleOpenAuth(mode, true)}
                onOpenUpgrade={() => handleOpenPaymentModal('pro')}
                onNavigate={(tab) => setCurrentTab(tab)}
              />
            </div>
          </>
        )}

        {/* TAB 2: Batch Search (Gated - Requires Pro or Enterprise) */}
        {currentTab === 'batch' && (
          isPaidUser ? (
            <BatchCheckView lang={lang} />
          ) : (
            <PlanGatePaywall
              featureTitle={lang === 'bn' ? 'বাল্ক কুরিয়ার ফ্রড চেকার (Bulk Verification)' : 'Bulk Courier Verification Tool'}
              featureDesc={
                lang === 'bn'
                  ? 'একসাথে একাধিক ফোন নম্বর দ্রুত স্ক্যান ও CSV রিপোর্ট ডাউনলোড করতে মার্চেন্ট প্ল্যান প্রয়োজন। বিকাশ, নগদ বা রকেট দিয়ে এখনই আনলক করুন।'
                  : 'Batch phone screening and CSV downloads require an active merchant package. Unlock now via bKash, Nagad, or Rocket.'
              }
              lang={lang}
              onOpenPaymentModal={() => handleOpenPaymentModal('pro')}
              onInstantUnlockTest={() => handlePaymentSuccess('pro')}
              onViewPricing={() => setCurrentTab('pricing')}
            />
          )
        )}

        {/* TAB 3: Community Fraud Database (Gated - Requires Pro or Enterprise) */}
        {currentTab === 'community' && (
          isPaidUser ? (
            <CommunityDatabaseView
              lang={lang}
              onOpenReportModal={() => handleOpenReportModal()}
            />
          ) : (
            <PlanGatePaywall
              featureTitle={lang === 'bn' ? 'মার্চেন্ট কমিউনিটি প্রতারক ডাটাবেস' : 'Crowdsourced Merchant Fraud Database'}
              featureDesc={
                lang === 'bn'
                  ? 'বাংলাদেশের হাজারো অনলাইন মার্চেন্টের শেয়ার করা ফেক অর্ডার, পার্সেল প্রত্যাখ্যানকারী ও প্রতারকদের কেন্দ্রীয় তালিকা দেখতে মার্চেন্ট প্ল্যান প্রয়োজন।'
                  : 'Full access to the shared dispute registry and fraudster lookup requires a Merchant Pro plan.'
              }
              lang={lang}
              onOpenPaymentModal={() => handleOpenPaymentModal('pro')}
              onInstantUnlockTest={() => handlePaymentSuccess('pro')}
              onViewPricing={() => setCurrentTab('pricing')}
            />
          )
        )}

        {/* TAB 4: Courier Technical Specs (Gated - Requires Pro or Enterprise) */}
        {currentTab === 'couriers' && (
          isPaidUser ? (
            <CourierSpecsView
              courierStatuses={courierStatuses}
              lang={lang}
              onOpenSettings={() => setIsApiSettingsOpen(true)}
            />
          ) : (
            <PlanGatePaywall
              featureTitle={lang === 'bn' ? 'কুরিয়ার এপিআই আর্কিটেকচার ও লাইভ স্ট্যাটাস' : 'Courier API Specs & Architecture'}
              featureDesc={
                lang === 'bn'
                  ? '৫টি শীর্ষ কুরিয়ারের অফিশিয়াল এপিআই প্রোটোকল, এন্ডপয়েন্ট স্পেসিফিকেশন ও রেসপন্স টাইম মেট্রিক্স দেখতে মার্চেন্ট প্ল্যান প্রয়োজন।'
                  : 'Detailed courier gateway connectivity specs and documentation are reserved for verified merchant members.'
              }
              lang={lang}
              onOpenPaymentModal={() => handleOpenPaymentModal('pro')}
              onInstantUnlockTest={() => handlePaymentSuccess('pro')}
              onViewPricing={() => setCurrentTab('pricing')}
            />
          )
        )}

        {/* TAB 5: REST API Docs (Gated - Requires Pro or Enterprise) */}
        {currentTab === 'apiDocs' && (
          isPaidUser ? (
            <ApiDocsView lang={lang} />
          ) : (
            <PlanGatePaywall
              featureTitle={lang === 'bn' ? 'ফ্রি কুরিয়ার ফ্রড স্ক্রিনিং REST API' : 'Fraud Screening REST API Reference'}
              featureDesc={
                lang === 'bn'
                  ? 'আপনার WooCommerce, Shopify বা কাস্টম ওয়েবসাইটে অটোমেটিক ফ্রড চেকিং প্লাগইন যুক্ত করতে এপিআই ডক্স ও মার্চেন্ট টোকেন প্রয়োজন।'
                  : 'Production REST API integration guide, WooCommerce snippets, and private token access require a paid plan.'
              }
              lang={lang}
              onOpenPaymentModal={() => handleOpenPaymentModal('pro')}
              onInstantUnlockTest={() => handlePaymentSuccess('pro')}
              onViewPricing={() => setCurrentTab('pricing')}
            />
          )
        )}

        {/* TAB 6: Pricing / Packages */}
        {currentTab === 'pricing' && (
          <PricingView
            lang={lang}
            activePlan={userPlan}
            onSelectPlan={handleSelectPlan}
            user={user}
          />
        )}

        {/* TAB 7: Admin Console & User Management (Protected) */}
        {currentTab === 'admin' && (
          <AdminDashboard
            lang={lang}
            user={user}
            setUser={(u) => {
              setUser(u);
              if (u) {
                showToast(
                  lang === 'bn' 
                    ? `এডমিন হিসেবে সংযুক্ত: ${u.email}` 
                    : `Authenticated as administrator: ${u.email}`,
                  'success'
                );
              }
            }}
            onNavigateHome={() => setCurrentTab('search')}
          />
        )}
      </main>

      {/* Modals */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        lang={lang}
        initialPlan={selectedPlanForPayment}
        onPaymentSuccess={handlePaymentSuccess}
        user={user}
        onOpenRegister={() => handleOpenAuth('register', false)}
      />

      <TrustBadgeModal
        isOpen={isTrustBadgeOpen}
        onClose={() => setIsTrustBadgeOpen(false)}
        lang={lang}
        storeName={user?.storeName}
      />

      <ReportFraudModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        defaultPhone={reportModalPhone}
        lang={lang}
        onSuccess={() => {
          if (searchResult) {
            handlePhoneSearch(searchResult.phone);
          }
        }}
      />

      <ApiSettingsModal
        isOpen={isApiSettingsOpen}
        onClose={() => setIsApiSettingsOpen(false)}
        lang={lang}
        onConfigUpdated={() => {
          fetchCourierStatus();
          if (searchResult) {
            handlePhoneSearch(searchResult.phone);
          }
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        lang={lang}
        user={user}
        setUser={(u) => {
          setUser(u);
          if (u) {
            // When user logs in or registers, clear guest limit and set 100 free checks
            setGuestSearchesCount(0);
            localStorage.setItem('xbz_guest_searches', '0');
            showToast(
              lang === 'bn' 
                ? `স্বাগতম, ${u.name}! আপনার ${u.plan || 'Free Starter'} অ্যাকাউন্ট সক্রিয়। প্রতি মাসে ১০০টি চেক করতে পারবেন।` 
                : `Welcome, ${u.name}! Your ${u.plan || 'Free Starter'} account is active with 100 monthly checks.`,
              'success'
            );
          }
        }}
        initialMode={authModalMode}
        isFromLimitBlock={isAuthFromLimit}
        onAdminLoginSuccess={() => setCurrentTab('admin')}
      />

      {/* Persistent 24/7 WhatsApp Live Support Floating Button */}
      <LiveSupportButton lang={lang} />

      {/* Professional Footer */}
      <Footer 
        lang={lang} 
        onNavigate={(tab: string) => setCurrentTab(tab)} 
        openTrustBadge={() => setIsTrustBadgeOpen(true)}
      />
    </div>
  );
}
