import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { LiveFraudTicker } from './components/LiveFraudTicker.tsx';
import { HeroSearch } from './components/HeroSearch.tsx';
import { CourierStatusStrip } from './components/CourierStatusStrip.tsx';
import { LiveSupportButton } from './components/LiveSupportButton.tsx';
import { Footer } from './components/Footer.tsx';
import { SmartPosHomeContent } from './components/SmartPosHomeContent.tsx';
import type { Language } from './utils/translations.ts';
import type { PhoneAnalysisResult, CourierStatusInfo, PlanTier, RecentSearchItem, PaymentSubmission } from './types/intelligence.ts';
import { safeApiFetch } from './utils/apiClient.ts';
import { getDeviceFingerprint } from './utils/deviceFingerprint.ts';
import { CheckCircle2, AlertOctagon, X, Bell, Loader2, ShieldAlert, MessageSquare, ArrowRight } from 'lucide-react';

// Code-split heavy views and modals to guarantee instant initial page paint (<300ms)
const AnalysisResultView = lazy(() => import('./components/AnalysisResultView.tsx').then(m => ({ default: m.AnalysisResultView })));
const BatchCheckView = lazy(() => import('./components/BatchCheckView.tsx').then(m => ({ default: m.BatchCheckView })));
const CommunityDatabaseView = lazy(() => import('./components/CommunityDatabaseView.tsx').then(m => ({ default: m.CommunityDatabaseView })));
const CourierSpecsView = lazy(() => import('./components/CourierSpecsView.tsx').then(m => ({ default: m.CourierSpecsView })));
const ApiDocsView = lazy(() => import('./components/ApiDocsView.tsx').then(m => ({ default: m.ApiDocsView })));
const PricingView = lazy(() => import('./components/PricingView.tsx').then(m => ({ default: m.PricingView })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard.tsx').then(m => ({ default: m.AdminDashboard })));
const PlanGatePaywall = lazy(() => import('./components/PlanGatePaywall.tsx').then(m => ({ default: m.PlanGatePaywall })));
const ReportFraudModal = lazy(() => import('./components/ReportFraudModal.tsx').then(m => ({ default: m.ReportFraudModal })));
const ApiSettingsModal = lazy(() => import('./components/ApiSettingsModal.tsx').then(m => ({ default: m.ApiSettingsModal })));
const AuthModal = lazy(() => import('./components/AuthModal.tsx').then(m => ({ default: m.AuthModal })));
const PaymentModal = lazy(() => import('./components/PaymentModal.tsx').then(m => ({ default: m.PaymentModal })));
const TrustBadgeModal = lazy(() => import('./components/TrustBadgeModal.tsx').then(m => ({ default: m.TrustBadgeModal })));
const UsageQuotaView = lazy(() => import('./components/UsageQuotaView.tsx').then(m => ({ default: m.UsageQuotaView })));

const ViewLoadingFallback = () => (
  <div className="flex flex-col items-center justify-center py-24 px-4 min-h-[400px]">
    <div className="w-10 h-10 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin mb-3"></div>
    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">লোড হচ্ছে...</p>
  </div>
);


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
  const [rawCouriers, setRawCouriers] = useState<any[]>([]);

  // Memoize courier statuses computation to prevent unnecessary re-renders during state updates
  const courierStatuses = useMemo<CourierStatusInfo[]>(() => {
    if (!rawCouriers || rawCouriers.length === 0) {
      return INITIAL_COURIER_STATUSES;
    }
    return rawCouriers.map((incoming: any) => {
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
  }, [rawCouriers]);
  
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

  // Sidebar states
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);

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

  // Pending payment submission awaiting admin approval
  const [pendingPayment, setPendingPayment] = useState<PaymentSubmission | null>(() => {
    try {
      const saved = localStorage.getItem('xbz_pending_payment');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isCheckingPaymentStatus, setIsCheckingPaymentStatus] = useState(false);
  const [isDeviceLimitBlocked, setIsDeviceLimitBlocked] = useState(false);
  const [deviceLimitMessage, setDeviceLimitMessage] = useState<string | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Status check & auto-upgrade poller: Synchronizes user state as soon as admin approves
  const checkPendingPaymentStatus = async (silent = false) => {
    try {
      if (!silent) setIsCheckingPaymentStatus(true);
      const deviceId = getDeviceFingerprint();
      const query = new URLSearchParams();
      if (user?.email) query.set('email', user.email);
      if (deviceId) query.set('deviceId', deviceId);

      const res = await fetch(`/api/payment/my-status?${query.toString()}`, {
        headers: {
          'X-Device-Id': deviceId,
          ...(user?.email ? { 'X-User-Email': user.email } : {}),
        },
      });

      if (!res.ok) return;
      const data = await res.json();

      if (data.isApproved && data.user) {
        // Admin has approved the payment!
        const approvedPlan = (data.user.planId === 'enterprise' ? 'enterprise' : 'pro') as PlanTier;
        setUserPlan(approvedPlan);
        localStorage.setItem('xbz_user_plan', approvedPlan);
        setUser(data.user);
        localStorage.setItem('xbz_user', JSON.stringify(data.user));
        setPendingPayment(null);
        localStorage.removeItem('xbz_pending_payment');
        setIsDeviceLimitBlocked(false);
        setDeviceLimitMessage(null);

        if (!silent) {
          showToast(
            lang === 'bn'
              ? `অভিনন্দন! আপনার ${data.user.plan} সফলভাবে অনুমোদিত হয়েছে। সকল প্রিমিয়াম ফিচার আনলক করা হয়েছে!`
              : `Congratulations! Your ${data.user.plan} has been approved. All premium features are unlocked!`,
            'success'
          );
        }
      } else if (data.hasPending && data.latestPayment) {
        setPendingPayment(data.latestPayment);
        localStorage.setItem('xbz_pending_payment', JSON.stringify(data.latestPayment));
        if (!silent) {
          showToast(
            lang === 'bn'
              ? 'পেমেন্ট এখনো অ্যাডমিন ভেরিফিকেশনে রয়েছে। দ্রুত অনুমোদনের জন্য হোয়াটসঅ্যাপে যোগাযোগ করতে পারেন।'
              : 'Payment is pending admin verification. Reach out on WhatsApp for instant activation.',
            'info'
          );
        }
      } else if (data.latestPayment?.status === 'rejected') {
        setPendingPayment(null);
        localStorage.removeItem('xbz_pending_payment');
        if (!silent) {
          showToast(
            lang === 'bn'
              ? `পেমেন্ট বাতিল হয়েছে: ${data.latestPayment.rejectionReason || 'তথ্য সঠিক ছিল না'}`
              : `Payment was rejected: ${data.latestPayment.rejectionReason || 'Invalid details'}`,
            'error'
          );
        }
      } else if (!data.hasPending && pendingPayment) {
        setPendingPayment(null);
        localStorage.removeItem('xbz_pending_payment');
      }
    } catch (err) {
      console.warn('Payment status polling error:', err);
    } finally {
      if (!silent) setIsCheckingPaymentStatus(false);
    }
  };

  // Poll status on user email change and interval
  useEffect(() => {
    checkPendingPaymentStatus(true);
  }, [user?.email]);

  useEffect(() => {
    if (!pendingPayment) return;
    const interval = setInterval(() => {
      checkPendingPaymentStatus(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [pendingPayment, user?.email]);

  // Enterprise Usage Quota monitoring & 90% threshold alert state
  const [quotaInfo, setQuotaInfo] = useState<any>(null);
  const [isQuotaAlertDismissed, setIsQuotaAlertDismissed] = useState(false);

  const fetchUsageQuota = async () => {
    try {
      const email = user?.email || 'naeem@webxpress.com.bd';
      const res = await fetch(`/api/user/usage-quota?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setQuotaInfo(data);
      }
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchUsageQuota();
    const qInterval = setInterval(fetchUsageQuota, 25000);
    return () => clearInterval(qInterval);
  }, [user?.email]);

  // Fetch courier status on mount with resilient fallbacks
  const fetchCourierStatus = async () => {
    try {
      const res = await fetch('/api/couriers/status');
      if (!res.ok) return;
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return;
      const data = await res.json();
      if (Array.isArray(data.couriers) && data.couriers.length > 0) {
        setRawCouriers(data.couriers);
        setIsSandbox(data.isSandbox === true);
      }
    } catch {
      // Retain INITIAL_COURIER_STATUSES without crashing
    }
  };

  useEffect(() => {
    // Defer network call by 200ms so initial DOM paint happens in <100ms with built-in courier defaults
    const timer = setTimeout(() => {
      fetchCourierStatus();
    }, 200);
    return () => clearTimeout(timer);
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

  // Phone search handler with server-authoritative IP & Hardware Device anti-cheat detection
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
      const deviceId = getDeviceFingerprint();
      const res = await fetch('/api/check-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': deviceId,
          ...(user?.email ? { 'X-User-Email': user.email } : {}),
        },
        body: JSON.stringify({ phone, deviceId }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && (data.error === 'DEVICE_LIMIT_EXCEEDED' || data.requiresApproval)) {
          setIsDeviceLimitBlocked(true);
          const limitMsg = data.message || (lang === 'bn'
            ? '⚠️ এই ডিভাইস বা আইপি-র ফ্রি লিমিট শেষ হয়েছে! প্যাকেজ কিনুন অথবা এডমিনের অনুমোদন নিন।'
            : '⚠️ Free search limit reached for this device/IP. Upgrade or contact admin.');
          setDeviceLimitMessage(limitMsg);
          setSearchError(limitMsg);
          return;
        }
        throw new Error(data.error || 'যাচাইকরণ ব্যর্থ হয়েছে');
      }

      setIsDeviceLimitBlocked(false);
      setDeviceLimitMessage(null);
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
      const updatedUser = { ...user, plan: 'Free Starter (100 checks/mo)', planId: 'free', checksRemaining: user.checksRemaining ?? 100 };
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
    if (newPlan === 'free') {
      setUserPlan('free');
      localStorage.setItem('xbz_user_plan', 'free');
      if (user) {
        const updated = { ...user, plan: 'Free Starter (100 checks/mo)', planId: 'free', checksRemaining: 100 };
        setUser(updated);
        localStorage.setItem('xbz_user', JSON.stringify(updated));
      }
    } else {
      // Paid plan submissions require admin verification before activation
      checkPendingPaymentStatus(false);
    }
  };

  // Strict Paid User Access: Free users and guests are NEVER allowed access to gated features.
  // Only admin users OR users whose status is approved and whose plan is pro/enterprise in the database have access.
  const isPaidUser = Boolean(
    user && (
      user.role === 'admin' ||
      (user.status === 'approved' && (user.planId === 'pro' || user.planId === 'enterprise') && (userPlan === 'pro' || userPlan === 'enterprise'))
    )
  );

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

      {/* Top Bar Navigation (Streamlined: Logo + Buy Plan + Theme Toggle + API Settings + Auth) */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lang={lang}
        setLang={setLang}
        openApiSettings={() => setIsApiSettingsOpen(true)}
        openAuth={() => handleOpenAuth('login')}
        openPayment={() => handleOpenPaymentModal('pro')}
        openTrustBadge={() => setIsTrustBadgeOpen(true)}
        user={user}
        userPlan={userPlan}
        guestSearchesCount={guestSearchesCount}
        isGuestLimitReached={isGuestLimitReached}
        theme={theme}
        toggleTheme={toggleTheme}
        onSelectTheme={(t) => setTheme(t)}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        onToggleDesktopSidebar={() => setIsDesktopSidebarCollapsed((prev) => !prev)}
        isSidebarCollapsed={isDesktopSidebarCollapsed}
      />

      {/* Responsive Workspace Layout: Collapsible Left Sidebar + Main Viewport */}
      <div className="flex-1 flex w-full relative">
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          lang={lang}
          isOpenMobile={isMobileSidebarOpen}
          setIsOpenMobile={setIsMobileSidebarOpen}
          isCollapsed={isDesktopSidebarCollapsed}
          setIsCollapsed={setIsDesktopSidebarCollapsed}
          user={user}
          userPlan={userPlan}
          guestSearchesCount={guestSearchesCount}
          checksRemaining={userChecksRemaining}
          openPayment={() => handleOpenPaymentModal('pro')}
          openAuth={() => handleOpenAuth('login')}
        />

        {/* Dynamic content wrapper with left padding corresponding to desktop sidebar */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
            isDesktopSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
          }`}
        >
          {/* Contained Live Fraud Ticker Wrapper with strict viewport boundary */}
          <div className="w-full max-w-full overflow-hidden relative">
            <LiveFraudTicker
              lang={lang}
              onOpenReportModal={() => handleOpenReportModal()}
              onViewDatabase={() => {
                setCurrentTab('community');
              }}
            />
          </div>

          {/* Global Enterprise Quota Approaching 90% Alert Banner */}
          {quotaInfo && (quotaInfo.isApproachingDaily || quotaInfo.isApproachingMonthly || quotaInfo.isExceeded) && !isQuotaAlertDismissed && (
            <div className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white px-4 py-2.5 text-xs shadow-md">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-black/20 animate-pulse shrink-0">
                    <AlertOctagon className="w-4 h-4" />
                  </span>
                  <span>
                    <strong className="font-extrabold">
                      {lang === 'bn' ? '⚠️ এন্টারপ্রাইজ কোটা সতর্কতা: ' : '⚠️ Enterprise Quota Alert: '}
                    </strong>
                    {lang === 'bn'
                      ? `আপনার এন্টারপ্রাইজ API রিকোয়েস্ট লিমিটের ${Math.round(quotaInfo.dailyPercentage)}% ব্যবহৃত হয়েছে (${quotaInfo.dailyUsed.toLocaleString()} / ${quotaInfo.dailyLimit.toLocaleString()})! বাকি মাত্র ${quotaInfo.dailyRemaining.toLocaleString()} টি রিকোয়েস্ট।`
                      : `You have reached ${Math.round(quotaInfo.dailyPercentage)}% (${quotaInfo.dailyUsed.toLocaleString()} / ${quotaInfo.dailyLimit.toLocaleString()}) of your daily API limit!`}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    onClick={() => setCurrentTab('usageQuota')}
                    className="px-2.5 py-1 rounded-lg bg-white text-slate-900 font-bold hover:bg-slate-100 transition-colors shadow-xs text-[11px] cursor-pointer"
                  >
                    {lang === 'bn' ? 'কোটা মনিটর দেখুন' : 'View Quota'}
                  </button>
                  <button
                    onClick={() => setIsQuotaAlertDismissed(true)}
                    className="p-1 text-white/80 hover:text-white cursor-pointer"
                    title="Dismiss alert banner"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main View Area */}
          <main className="flex-1">
        {/* TAB 1: Public Search */}
        {currentTab === 'search' && (
          <>
            {/* Server-Enforced Hardware Device & IP Anti-Cheat Lock Banner */}
            {isDeviceLimitBlocked && (
              <div className="max-w-3xl mx-auto px-4 pt-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/90 via-red-950/70 to-slate-900 border border-rose-500/50 shadow-2xl text-xs space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                      <ShieldAlert className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        {lang === 'bn' ? '⚠️ ডিভাইস ও আইপি ফ্রড চেক লিমিট শেষ (Anti-Cheat Security Active)' : '⚠️ Search Limit Exhausted for this Device/IP'}
                      </h4>
                      <p className="text-rose-200 mt-1 leading-relaxed">
                        {deviceLimitMessage || (lang === 'bn'
                          ? 'আপনার ডিভাইস ও ইন্টারনেট নেটওয়ার্কের ফ্রি সার্চ লিমিট শেষ হয়েছে। ব্রাউজার ক্যাশ বা ইনকগনিটো দিয়ে বাইপাস করা সম্ভব নয়।'
                          : 'Your device and network free screening quota has been exhausted. Admin approval or a package purchase is required.')}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-rose-800/40">
                    <button
                      onClick={() => handleOpenPaymentModal('pro')}
                      className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-cyan-950/50"
                    >
                      <span>{lang === 'bn' ? 'মার্চেন্ট প্রো আপগ্রেড করুন' : 'Upgrade to Pro'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={`https://wa.me/8801703223141?text=${encodeURIComponent(
                        `আসসালামু আলাইকুম Naim Xbz ভাইয়া, আমার ডিভাইসের ফ্রি ফ্রড চেক লিমিট শেষ হয়েছে। Device ID: ${getDeviceFingerprint()}। দয়া করে আমার অ্যাকাউন্ট/ডিভাইসটি আনলক করে দিন।`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-950/50"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'এডমিনকে হোয়াটসঅ্যাপ করুন (+8801703223141)' : 'WhatsApp Admin (+8801703223141)'}</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

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
                <Suspense fallback={<ViewLoadingFallback />}>
                  <AnalysisResultView
                    result={searchResult}
                    lang={lang}
                    onOpenReportModal={handleOpenReportModal}
                    onOpenApiSettings={() => setIsApiSettingsOpen(true)}
                  />
                </Suspense>
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

        <Suspense fallback={<ViewLoadingFallback />}>
          {/* TAB 2: Batch Search (Gated - Requires Pro or Enterprise) */}
          {currentTab === 'batch' && (
            isPaidUser ? (
              <BatchCheckView lang={lang} user={user} />
            ) : (
              <PlanGatePaywall
                featureTitle={lang === 'bn' ? 'বাল্ক কুরিয়ার ফ্রড চেকার (Bulk Verification)' : 'Bulk Courier Verification Tool'}
                featureDesc={
                  lang === 'bn'
                    ? 'একসাথে একাধিক ফোন নম্বর দ্রুত স্ক্যান ও CSV রিপোর্ট ডাউনলোড করতে মার্চেন্ট প্ল্যান প্রয়োজন। বিকাশ, নগদ বা রকেট দিয়ে পেমেন্ট তথ্য সাবমিট করুন; এডমিন অনুমোদনের পর ফিচারটি স্বয়ংক্রিয়ভাবে সক্রিয় হবে।'
                    : 'Batch phone screening and CSV downloads require an approved merchant package. Submit payment details for instant admin verification.'
                }
                lang={lang}
                onOpenPaymentModal={() => handleOpenPaymentModal('pro')}
                onViewPricing={() => setCurrentTab('pricing')}
                pendingPayment={pendingPayment}
                onRefreshPaymentStatus={() => checkPendingPaymentStatus(false)}
                isCheckingStatus={isCheckingPaymentStatus}
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
                    ? 'বাংলাদেশের হাজারো অনলাইন মার্চেন্টের শেয়ার করা ফেক অর্ডার, পার্সেল প্রত্যাখ্যানকারী ও প্রতারকদের কেন্দ্রীয় তালিকা দেখতে অনুমোদিত মার্চেন্ট প্ল্যান প্রয়োজন। প্যাকেজ কিনে সাবমিট করলে এডমিন অনুমোদনের পর ডাটাবেস এক্সেস পাবেন।'
                    : 'Full access to the shared dispute registry and fraudster lookup requires an approved Merchant Pro plan.'
                }
                lang={lang}
                onOpenPaymentModal={() => handleOpenPaymentModal('pro')}
                onViewPricing={() => setCurrentTab('pricing')}
                pendingPayment={pendingPayment}
                onRefreshPaymentStatus={() => checkPendingPaymentStatus(false)}
                isCheckingStatus={isCheckingPaymentStatus}
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
                    ? '৫টি শীর্ষ কুরিয়ারের অফিশিয়াল এপিআই প্রোটোকল, এন্ডপয়েন্ট স্পেসিফিকেশন ও রেসপন্স টাইম মেট্রিক্স দেখতে অনুমোদিত মার্চেন্ট প্ল্যান প্রয়োজন।'
                    : 'Detailed courier gateway connectivity specs and documentation are reserved for verified merchant members.'
                }
                lang={lang}
                onOpenPaymentModal={() => handleOpenPaymentModal('pro')}
                onViewPricing={() => setCurrentTab('pricing')}
                pendingPayment={pendingPayment}
                onRefreshPaymentStatus={() => checkPendingPaymentStatus(false)}
                isCheckingStatus={isCheckingPaymentStatus}
              />
            )
          )}

          {/* TAB 5: REST API Docs (Gated - Requires Pro or Enterprise) */}
          {(currentTab === 'apiDocs' || currentTab === 'api') && (
            isPaidUser ? (
              <ApiDocsView
                lang={lang}
                onNavigateQuota={() => setCurrentTab('usageQuota')}
              />
            ) : (
              <PlanGatePaywall
                featureTitle={lang === 'bn' ? 'ফ্রি কুরিয়ার ফ্রড স্ক্রিনিং REST API' : 'Fraud Screening REST API Reference'}
                featureDesc={
                  lang === 'bn'
                    ? 'আপনার WooCommerce, Shopify বা কাস্টম ওয়েবসাইটে অটোমেটিক ফ্রড চেকিং প্লাগইন যুক্ত করতে এপিআই ডক্স ও মার্চেন্ট টোকেন প্রয়োজন। পেমেন্ট সাবমিট করে এডমিনের অনুমোদনের পর এপিআই কি সক্রিয় হবে।'
                    : 'Production REST API integration guide, WooCommerce snippets, and private token access require an approved paid plan.'
                }
                lang={lang}
                onOpenPaymentModal={() => handleOpenPaymentModal('pro')}
                onViewPricing={() => setCurrentTab('pricing')}
                pendingPayment={pendingPayment}
                onRefreshPaymentStatus={() => checkPendingPaymentStatus(false)}
                isCheckingStatus={isCheckingPaymentStatus}
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

          {/* TAB 8: Usage Quota & Limits Monitoring (Enterprise) */}
          {currentTab === 'usageQuota' && (
            <UsageQuotaView
              lang={lang}
              user={user}
              userPlan={userPlan}
              onOpenPayment={() => handleOpenPaymentModal('enterprise')}
            />
          )}
        </Suspense>
      </main>

      {/* Professional Footer aligned with desktop sidebar */}
      <Footer 
        lang={lang} 
        onNavigate={(tab: string) => setCurrentTab(tab)} 
        openTrustBadge={() => setIsTrustBadgeOpen(true)}
      />
    </div>
  </div>

      {/* Modals: Lazy loaded only on demand for zero initial overhead */}
      <Suspense fallback={null}>
        {isPaymentModalOpen && (
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            lang={lang}
            initialPlan={selectedPlanForPayment}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentSubmitted={(payment) => {
              setPendingPayment(payment);
              try {
                localStorage.setItem('xbz_pending_payment', JSON.stringify(payment));
              } catch {}
              showToast(
                lang === 'bn'
                  ? 'পেমেন্ট তথ্য সফলভাবে সাবমিট হয়েছে! এডমিন অনুমোদনের পর আপনার প্যাকেজ সক্রিয় হবে।'
                  : 'Payment submitted! Your package features will unlock upon admin review.',
                'info'
              );
            }}
            user={user}
            onOpenRegister={() => handleOpenAuth('register', false)}
          />
        )}

        {isTrustBadgeOpen && (
          <TrustBadgeModal
            isOpen={isTrustBadgeOpen}
            onClose={() => setIsTrustBadgeOpen(false)}
            lang={lang}
            storeName={user?.storeName}
          />
        )}

        {isReportModalOpen && (
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
        )}

        {isApiSettingsOpen && (
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
        )}

        {isAuthModalOpen && (
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
        )}
      </Suspense>

      {/* Persistent 24/7 WhatsApp Live Support Floating Button */}
      <LiveSupportButton lang={lang} />
    </div>
  );
}
