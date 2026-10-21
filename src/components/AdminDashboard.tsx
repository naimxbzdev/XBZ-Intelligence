import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  UserCheck,
  UserX,
  Clock,
  Search,
  Filter,
  Trash2,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Plus,
  Mail,
  Phone,
  Store,
  Zap,
  TrendingUp,
  Activity,
  Layers,
  ArrowUpRight,
  Lock,
  LogIn,
  Key,
  X,
  Copy,
  Check,
  Tag,
  Settings,
  CreditCard,
  FileSpreadsheet,
  AlertOctagon,
  Eye,
  EyeOff,
  DollarSign,
  Save,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import type { Language } from '../utils/translations.ts';

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  storeName: string;
  role: 'admin' | 'merchant';
  plan: string;
  planId: 'free' | 'pro' | 'enterprise';
  status: 'approved' | 'pending' | 'suspended';
  checksRemaining: number;
  apiKey: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface PricingConfig {
  freeChecksMonthly: number;
  proPriceBDT: number;
  proChecksMonthly: number;
  enterprisePriceBDT: number;
  enterpriseChecksMonthly: number;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  supportWhatsapp: string;
}

// Authorized Admin Emails and Master Credentials (Hashed to prevent secret exposure in production builds)
export const AUTHORIZED_ADMIN_EMAILS = ['naimxbz@gmail.com', 'xbz.dev@gmail.com'];
const MASTER_ADMIN_HASHES = [
  '18ad921104e138a2e578c9497e704ea8848dcf373bfe4cbe0666dd9f3906a583',
  'ef50005d5c07ba045ce600df5a5874246fe18eb8a37930ee1d62c1615f36e4f3',
];

async function computeSHA256(text: string): Promise<string> {
  try {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    return '';
  }
}

const LOCAL_STORAGE_USERS_KEY = 'xbz_registered_users';
const LOCAL_STORAGE_PRICING_KEY = 'xbz_pricing_config';

const INITIAL_REGISTERED_USERS: RegisteredUser[] = [
  {
    id: 'usr_admin_1',
    name: 'Naim Xbz',
    email: 'naimxbz@gmail.com',
    phone: '01703223141',
    storeName: 'XBZ Intelligence HQ',
    role: 'admin',
    plan: 'Enterprise Admin',
    planId: 'enterprise',
    status: 'approved',
    checksRemaining: 999999,
    apiKey: 'xbz_admin_live_master_9a87d6e5',
    createdAt: '2026-01-05T10:00:00Z',
    lastLoginAt: '2026-03-24T12:00:00Z',
  },
  {
    id: 'usr_admin_2',
    name: 'Naim Xbz (Dev)',
    email: 'xbz.dev@gmail.com',
    phone: '01703223141',
    storeName: 'XBZ Intelligence Lab',
    role: 'admin',
    plan: 'Enterprise Admin',
    planId: 'enterprise',
    status: 'approved',
    checksRemaining: 999999,
    apiKey: 'xbz_admin_dev_master_3f2a1b9c',
    createdAt: '2026-01-10T12:00:00Z',
    lastLoginAt: '2026-03-24T11:30:00Z',
  },
  {
    id: 'usr_m_101',
    name: 'তানভীর হাসান',
    email: 'tanvir@fashionbd.com',
    phone: '01711223344',
    storeName: 'Dhaka Fashion Hub',
    role: 'merchant',
    plan: 'Merchant Pro (2,500 checks)',
    planId: 'pro',
    status: 'approved',
    checksRemaining: 2340,
    apiKey: 'fraud_live_df827a19c83b4e7261',
    createdAt: '2026-01-18T14:30:00Z',
    lastLoginAt: '2026-03-23T16:30:00Z',
  },
  {
    id: 'usr_m_102',
    name: 'সাবরিনা আক্তার',
    email: 'sabrina@glamourbd.com',
    phone: '01822334455',
    storeName: 'Glamour Boutique',
    role: 'merchant',
    plan: 'Free Starter (100 checks/mo)',
    planId: 'free',
    status: 'approved',
    checksRemaining: 68,
    apiKey: 'fraud_live_9b8c7d6e5f4a3b2c1d',
    createdAt: '2026-01-25T11:20:00Z',
    lastLoginAt: '2026-03-22T11:45:00Z',
  },
  {
    id: 'usr_m_103',
    name: 'মাহমুদুল ইসলাম',
    email: 'mahmud@techzonebd.com',
    phone: '01933445566',
    storeName: 'TechZone BD',
    role: 'merchant',
    plan: 'Enterprise Unlimited',
    planId: 'enterprise',
    status: 'approved',
    checksRemaining: 99999,
    apiKey: 'fraud_live_e3f2d1c9b8a7654321',
    createdAt: '2026-02-02T09:15:00Z',
    lastLoginAt: '2026-03-24T08:15:00Z',
  },
  {
    id: 'usr_m_104',
    name: 'কামরুল হাসান',
    email: 'kamrul@organicfood.bd',
    phone: '01655667788',
    storeName: 'Organic Agro Mart',
    role: 'merchant',
    plan: 'Free Starter (100 checks/mo)',
    planId: 'free',
    status: 'pending',
    checksRemaining: 100,
    apiKey: 'fraud_live_7a6b5c4d3e2f109876',
    createdAt: '2026-02-14T18:05:00Z',
    lastLoginAt: '2026-03-23T18:05:00Z',
  },
  {
    id: 'usr_m_105',
    name: 'সাদিয়া জাহান',
    email: 'sadia@hijabchic.com',
    phone: '01799887766',
    storeName: 'Chic Hijab Collection',
    role: 'merchant',
    plan: 'Merchant Pro (2,500 checks)',
    planId: 'pro',
    status: 'approved',
    checksRemaining: 1890,
    apiKey: 'fraud_live_4b8c9d0e1f2a3b4c5d',
    createdAt: '2026-02-22T15:40:00Z',
    lastLoginAt: '2026-03-24T09:20:00Z',
  },
  {
    id: 'usr_m_106',
    name: 'রফিকুল আলম',
    email: 'rafiq@gadgetbazaar.com',
    phone: '01511224466',
    storeName: 'Gadget Bazaar BD',
    role: 'merchant',
    plan: 'Merchant Pro (2,500 checks)',
    planId: 'pro',
    status: 'pending',
    checksRemaining: 2500,
    apiKey: 'fraud_live_6c7d8e9f0a1b2c3d4e',
    createdAt: '2026-03-01T12:00:00Z',
    lastLoginAt: '2026-03-21T10:10:00Z',
  },
  {
    id: 'usr_m_107',
    name: 'নাঈম হাসান',
    email: 'naeem@webxpress.com.bd',
    phone: '01712345678',
    storeName: 'WebXpress BD Hub',
    role: 'merchant',
    plan: 'Free Starter (100 checks/mo)',
    planId: 'free',
    status: 'approved',
    checksRemaining: 95,
    apiKey: 'fraud_live_9a87d6e5c4b3a21098',
    createdAt: '2026-03-08T08:30:00Z',
    lastLoginAt: '2026-03-24T14:10:00Z',
  },
  {
    id: 'usr_m_108',
    name: 'ফারজানা ইয়াসমিন',
    email: 'farzana@babycarebd.com',
    phone: '01855443322',
    storeName: 'BabyCare Bangladesh',
    role: 'merchant',
    plan: 'Free Starter (100 checks/mo)',
    planId: 'free',
    status: 'pending',
    checksRemaining: 100,
    apiKey: 'fraud_live_1a2b3c4d5e6f7a8b9c',
    createdAt: '2026-03-12T16:20:00Z',
    lastLoginAt: '2026-03-23T19:00:00Z',
  },
  {
    id: 'usr_m_109',
    name: 'জাহিদুল কবির',
    email: 'jahid@leathercraftbd.com',
    phone: '01766554433',
    storeName: 'Bengal Leather Craft',
    role: 'merchant',
    plan: 'Merchant Pro (2,500 checks)',
    planId: 'pro',
    status: 'approved',
    checksRemaining: 2110,
    apiKey: 'fraud_live_3e4f5a6b7c8d9e0f1a',
    createdAt: '2026-03-18T10:45:00Z',
    lastLoginAt: '2026-03-24T07:50:00Z',
  },
  {
    id: 'usr_m_110',
    name: 'মোস্তাফিজুর রহমান',
    email: 'mostafiz@perfumehouse.bd',
    phone: '01988776655',
    storeName: 'The Perfume House BD',
    role: 'merchant',
    plan: 'Free Starter (100 checks/mo)',
    planId: 'free',
    status: 'suspended',
    checksRemaining: 0,
    apiKey: 'fraud_live_8f9a0b1c2d3e4f5a6b',
    createdAt: '2026-03-20T13:10:00Z',
    lastLoginAt: '2026-03-22T17:30:00Z',
  },
];

const DEFAULT_PRICING: PricingConfig = {
  freeChecksMonthly: 100,
  proPriceBDT: 499,
  proChecksMonthly: 2500,
  enterprisePriceBDT: 1499,
  enterpriseChecksMonthly: 999999,
  bkashNumber: '01703223141',
  nagadNumber: '01703223141',
  rocketNumber: '017032231418',
  supportWhatsapp: '01703223141',
};

// Fraud statistics stream for Recharts
const FRAUD_STATISTICS_STREAM = [
  { month: 'Nov 2025', reports: 142, lossPreventedBDT: 185000, blacklistedPhones: 38 },
  { month: 'Dec 2025', reports: 210, lossPreventedBDT: 294000, blacklistedPhones: 62 },
  { month: 'Jan 2026', reports: 345, lossPreventedBDT: 462000, blacklistedPhones: 95 },
  { month: 'Feb 2026', reports: 490, lossPreventedBDT: 685000, blacklistedPhones: 134 },
  { month: 'Mar 2026', reports: 680, lossPreventedBDT: 924000, blacklistedPhones: 188 },
];

interface AdminDashboardProps {
  lang: Language;
  user: any;
  setUser: (u: any) => void;
  onNavigateHome?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  lang,
  user,
  setUser,
  onNavigateHome,
}) => {
  // Check authorization against naimxbz@gmail.com and xbz.dev@gmail.com
  const currentUserEmail = user?.email ? String(user.email).trim().toLowerCase() : '';
  const isAuthorized = AUTHORIZED_ADMIN_EMAILS.some(
    (adminEmail) => adminEmail.toLowerCase() === currentUserEmail
  );

  // In-portal login state for when someone opens Admin without being logged in as admin
  const [adminInputEmail, setAdminInputEmail] = useState('');
  const [adminInputPassword, setAdminInputPassword] = useState('');
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);

  // Active Admin View Tab: 'users' | 'analytics' | 'pricing'
  const [adminTab, setAdminTab] = useState<'users' | 'analytics' | 'pricing'>('users');

  // Users state fetched from localStorage
  const [users, setUsers] = useState<RegisteredUser[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(INITIAL_REGISTERED_USERS));
      return INITIAL_REGISTERED_USERS;
    } catch {
      return INITIAL_REGISTERED_USERS;
    }
  });

  // Pricing configuration state
  const [pricing, setPricing] = useState<PricingConfig>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_PRICING_KEY);
      if (stored) return { ...DEFAULT_PRICING, ...JSON.parse(stored) };
      return DEFAULT_PRICING;
    } catch {
      return DEFAULT_PRICING;
    }
  });

  // UI state for filter, search, selection, and modals
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'suspended'>('all');
  const [planFilter, setPlanFilter] = useState<'all' | 'free' | 'pro' | 'enterprise'>('all');
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [userToDelete, setUserToDelete] = useState<RegisteredUser | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserStore, setNewUserStore] = useState('');
  const [newUserPlan, setNewUserPlan] = useState<'free' | 'pro' | 'enterprise'>('pro');
  const [newUserStatus, setNewUserStatus] = useState<'approved' | 'pending'>('approved');

  // Sync users to localStorage & backend
  const saveUsers = (updated: RegisteredUser[]) => {
    setUsers(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const showFeedback = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Direct login inside the portal
  const handleAdminPortalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginLoading(true);
    setAdminLoginError(null);

    const emailClean = adminInputEmail.trim().toLowerCase();
    const passClean = adminInputPassword.trim();

    const normalizedEmail =
      emailClean === 'naimxbz' || emailClean === 'naim'
        ? 'naimxbz@gmail.com'
        : emailClean === 'xbz.dev' || emailClean === 'xbz'
        ? 'xbz.dev@gmail.com'
        : emailClean;

    const hash1 = await computeSHA256(passClean);
    const hash2 = await computeSHA256(passClean.replace(/\s+/g, ''));
    const isMatch =
      AUTHORIZED_ADMIN_EMAILS.includes(normalizedEmail) &&
      (MASTER_ADMIN_HASHES.includes(hash1) || MASTER_ADMIN_HASHES.includes(hash2));

    if (!isMatch) {
      setAdminLoginError(
        lang === 'bn'
          ? 'ভুল এডমিন ক্রেডেনশিয়াল! শুধুমাত্র naimxbz@gmail.com বা xbz.dev@gmail.com প্রবেশ করতে পারবে।'
          : 'Invalid admin credentials! Access restricted to authorized root administrators.'
      );
      setAdminLoginLoading(false);
      return;
    }

    try {
      // Sync with server session
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password: passClean }),
      });
      const data = await res.json();
      const adminUser = data.user || {
        id: normalizedEmail === 'naimxbz@gmail.com' ? 'usr_admin_1' : 'usr_admin_2',
        name: normalizedEmail === 'naimxbz@gmail.com' ? 'Naim Xbz (Admin)' : 'Naim Xbz (Dev)',
        email: normalizedEmail,
        storeName: 'XBZ Intelligence HQ',
        role: 'admin',
        plan: 'Enterprise Admin (Unlimited)',
        checksRemaining: 999999,
      };

      setUser(adminUser);
      localStorage.setItem('xbz_user', JSON.stringify(adminUser));
      showFeedback(`Welcome Administrator ${adminUser.email}`, 'success');
    } catch {
      const fallbackAdmin = {
        id: 'usr_admin_1',
        name: 'Naim Xbz',
        email: normalizedEmail,
        storeName: 'XBZ Intelligence HQ',
        role: 'admin',
        plan: 'Enterprise Admin',
        checksRemaining: 999999,
      };
      setUser(fallbackAdmin);
      localStorage.setItem('xbz_user', JSON.stringify(fallbackAdmin));
    } finally {
      setAdminLoginLoading(false);
    }
  };

  // Approve User handler
  const handleApprove = async (userId: string) => {
    const updated = users.map((u) => (u.id === userId ? { ...u, status: 'approved' as const } : u));
    saveUsers(updated);

    try {
      await fetch(`/api/admin/users/${userId}/approve`, { method: 'POST' });
    } catch {
      // localStorage already updated
    }

    const target = users.find((u) => u.id === userId);
    showFeedback(
      lang === 'bn'
        ? `গ্রাহক ${target?.name || ''} এর অ্যাকাউন্ট সফলভাবে অনুমোদিত হয়েছে।`
        : `User ${target?.name || ''} approved successfully!`,
      'success'
    );
  };

  // Delete User handler
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    if (AUTHORIZED_ADMIN_EMAILS.includes(userToDelete.email.toLowerCase())) {
      showFeedback(
        lang === 'bn' ? 'প্রধান এডমিন অ্যাকাউন্ট মুছে ফেলা সম্ভব নয়।' : 'Cannot delete primary root administrator account.',
        'error'
      );
      setUserToDelete(null);
      return;
    }

    const updated = users.filter((u) => u.id !== userToDelete.id);
    saveUsers(updated);

    try {
      await fetch(`/api/admin/users/${userToDelete.id}`, { method: 'DELETE' });
    } catch {
      // localStorage already updated
    }

    showFeedback(
      lang === 'bn'
        ? `গ্রাহক ${userToDelete.name} (${userToDelete.email}) ডাটাবেস থেকে মুছে ফেলা হয়েছে।`
        : `User ${userToDelete.name} has been removed.`,
      'info'
    );
    setUserToDelete(null);
  };

  // Pricing settings update handler
  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(LOCAL_STORAGE_PRICING_KEY, JSON.stringify(pricing));
      await fetch('/api/admin/pricing/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pricing),
      });
      showFeedback(
        lang === 'bn' ? 'প্যাকেজ ও পেমেন্ট মূল্য তালিকা সফলভাবে সংরক্ষিত হয়েছে!' : 'Package pricing settings saved successfully!',
        'success'
      );
    } catch {
      showFeedback('Saved locally', 'success');
    }
  };

  // Create new merchant handler
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserStore) {
      showFeedback('Please fill out all required fields', 'error');
      return;
    }

    if (users.some((u) => u.email.toLowerCase() === newUserEmail.trim().toLowerCase())) {
      showFeedback('A user with this email already exists.', 'error');
      return;
    }

    const planName =
      newUserPlan === 'enterprise'
        ? 'Enterprise Unlimited'
        : newUserPlan === 'pro'
        ? 'Merchant Pro (2,500 checks)'
        : 'Free Starter (100 checks/mo)';

    const checksRemaining = newUserPlan === 'enterprise' ? 99999 : newUserPlan === 'pro' ? 2500 : 100;

    const created: RegisteredUser = {
      id: 'usr_' + Date.now(),
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      phone: newUserPhone.trim() || '01700000000',
      storeName: newUserStore.trim(),
      role: 'merchant',
      plan: planName,
      planId: newUserPlan,
      status: newUserStatus,
      checksRemaining,
      apiKey: 'fraud_live_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    saveUsers([created, ...users]);
    setIsAddModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setNewUserStore('');
    showFeedback(`Merchant ${created.name} added successfully!`, 'success');
  };

  // Reset sample dataset helper
  const handleResetData = () => {
    saveUsers(INITIAL_REGISTERED_USERS);
    showFeedback(
      lang === 'bn' ? 'নমুনা ব্যবহারকারী ডাটা সফলভাবে রিস্টোর করা হয়েছে।' : 'Sample dataset restored successfully.',
      'info'
    );
  };

  // Filtered users calculation
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (statusFilter !== 'all' && u.status !== statusFilter) return false;
      if (planFilter !== 'all' && u.planId !== planFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.storeName.toLowerCase().includes(q) ||
          u.phone.includes(q)
        );
      }
      return true;
    });
  }, [users, statusFilter, planFilter, searchQuery]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const total = users.length;
    const approved = users.filter((u) => u.status === 'approved').length;
    const pending = users.filter((u) => u.status === 'pending').length;
    const suspended = users.filter((u) => u.status === 'suspended').length;
    const paid = users.filter((u) => u.planId === 'pro' || u.planId === 'enterprise').length;
    const totalChecks = users.reduce((acc, u) => acc + (u.checksRemaining || 0), 0);

    return { total, approved, pending, suspended, paid, totalChecks };
  }, [users]);

  // Recharts Growth Timeline
  const userGrowthChartData = useMemo(() => {
    return [
      { period: 'Jan 10', users: 3, newSignups: 3 },
      { period: 'Jan 25', users: 5, newSignups: 2 },
      { period: 'Feb 10', users: 7, newSignups: 2 },
      { period: 'Feb 25', users: 9, newSignups: 2 },
      { period: 'Mar 10', users: 11, newSignups: 2 },
      { period: 'Mar 24', users: users.length, newSignups: Math.max(1, users.length - 11) },
    ];
  }, [users.length]);

  // Recharts Plan Breakdown Data
  const planDistributionData = useMemo(() => {
    const freeCount = users.filter((u) => u.planId === 'free').length;
    const proCount = users.filter((u) => u.planId === 'pro').length;
    const entCount = users.filter((u) => u.planId === 'enterprise').length;

    return [
      { tier: 'Free Starter', count: freeCount, fill: '#38bdf8' },
      { tier: 'Merchant Pro', count: proCount, fill: '#818cf8' },
      { tier: 'Enterprise', count: entCount, fill: '#34d399' },
    ];
  }, [users]);

  // =========================================================================
  // ACCESS RESTRICTED SCREEN (Direct Admin Credential Login)
  // =========================================================================
  if (!isAuthorized) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="rounded-2xl border border-rose-500/30 bg-[#0d1527] p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Lock className="h-7 w-7" />
          </div>

          <div className="space-y-1.5 text-center">
            <h2 className="text-xl font-bold tracking-tight text-white">
              {lang === 'bn' ? 'এডমিন পোর্টাল অ্যাক্সেস' : 'Admin Console Security Gateway'}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'bn'
                ? 'সিস্টেম ডাটাবেজ, ব্যবহারকারী ও প্যাকেজ মূল্য পরিচালনা করতে অনুমোদিত এডমিন ক্রেডেনশিয়াল দিন।'
                : 'Enter authorized administrator credentials to manage users, approvals, and package pricing.'}
            </p>
          </div>

          {adminLoginError && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs">
              {adminLoginError}
            </div>
          )}

          {/* Secure Admin Credentials Login Form */}
          <form onSubmit={handleAdminPortalLogin} className="space-y-3.5 text-xs">
            <div>
              <label className="text-slate-300 block mb-1 font-medium">
                {lang === 'bn' ? 'এডমিন ইউজারনেম বা ইমেইল' : 'Admin Username / Email'}
              </label>
              <input
                type="text"
                value={adminInputEmail}
                onChange={(e) => setAdminInputEmail(e.target.value)}
                placeholder="naimxbz@gmail.com"
                required
                className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl outline-none focus:border-rose-400 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-medium">
                {lang === 'bn' ? 'এডমিন পাসওয়ার্ড' : 'Admin Password'}
              </label>
              <input
                type="password"
                value={adminInputPassword}
                onChange={(e) => setAdminInputPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl outline-none focus:border-rose-400 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={adminLoginLoading}
              className="w-full py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{lang === 'bn' ? 'এডমিন প্যানেলে প্রবেশ করুন' : 'Unlock Admin Console'}</span>
            </button>
          </form>

          {onNavigateHome && (
            <div className="text-center pt-2">
              <button
                onClick={onNavigateHome}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors underline"
              >
                {lang === 'bn' ? 'প্রধান পেজে ফিরে যান' : 'Return to Public Search'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // AUTHORIZED ADMIN VIEW
  // =========================================================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div className="fixed top-20 right-6 z-50 p-3.5 rounded-xl bg-slate-900/95 border border-cyan-500/40 shadow-2xl text-xs flex items-center gap-2.5 backdrop-blur-md animate-fade-in text-white">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  {lang === 'bn' ? 'এডমিন কন্ট্রোল সেন্টার' : 'Master Admin Control Center'}
                </h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                  ROOT VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'bn'
                  ? `এডমিন: ${currentUserEmail} · ব্যবহারকারী, প্যাকেজ প্রাইসিং ও এপ্রুভাল ফুল কন্ট্রোল`
                  : `Administrator: ${currentUserEmail} · Complete user, pricing & approval control`}
              </p>
            </div>
          </div>
        </div>

        {/* Admin Navigation Sub-Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
            <button
              onClick={() => setAdminTab('users')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                adminTab === 'users'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'ইউজার তালিকা' : 'User Database'}</span>
            </button>

            <button
              onClick={() => setAdminTab('analytics')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                adminTab === 'analytics'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'গ্রোথ ও ফ্রড মেট্রিক্স' : 'Analytics & Fraud'}</span>
            </button>

            <button
              onClick={() => setAdminTab('pricing')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                adminTab === 'pricing'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'প্যাকেজ প্রাইস' : 'Package Pricing'}</span>
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-xl shadow-md shadow-cyan-500/20 transition-all whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === 'bn' ? 'নতুন মার্চেন্ট' : 'Add User'}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          RECHARTS SUMMARY SECTION: REGISTERED USERS, SUBSCRIPTIONS & FRAUD STATS
         ========================================================================= */}
      <section className="space-y-6">
        {/* KPI Summary Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#0d1527] border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">{lang === 'bn' ? 'মোট নিবন্ধিত মার্চেন্ট' : 'Total Registered Users'}</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-white font-mono tabular-nums">{metrics.total}</span>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> +28%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              {metrics.approved} {lang === 'bn' ? 'অনুমোদিত সক্রিয় একাউন্ট' : 'Active approved accounts'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0d1527] border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">{lang === 'bn' ? 'সক্রিয় পেইড সাবস্ক্রিপশন' : 'Active Subscriptions'}</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-cyan-400 font-mono tabular-nums">{metrics.paid}</span>
              <span className="text-[11px] text-slate-400 font-mono">
                {Math.round((metrics.paid / (metrics.total || 1)) * 100)}% Conversion
              </span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              Pro (৳{pricing.proPriceBDT}) & Enterprise (৳{pricing.enterprisePriceBDT})
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0d1527] border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">{lang === 'bn' ? 'অপেক্ষমান অনুমোদন' : 'Pending Approvals'}</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-amber-400 font-mono tabular-nums">{metrics.pending}</span>
              {metrics.pending > 0 && (
                <button
                  onClick={() => {
                    setAdminTab('users');
                    setStatusFilter('pending');
                  }}
                  className="text-[11px] text-cyan-400 hover:underline"
                >
                  Review
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              {lang === 'bn' ? 'এডমিন ভেরিফিকেশন অপেক্ষমান' : 'Accounts awaiting review'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0d1527] border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">{lang === 'bn' ? 'কমিউনিটি ফ্রড প্রতিরোধ' : 'Loss Prevented (BDT)'}</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-emerald-400 font-mono tabular-nums">৳9.24L</span>
              <span className="text-[11px] text-slate-400 font-mono">680+ Reports</span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              {lang === 'bn' ? 'ক্যাশ অন ডেলিভারি রিটার্ন সেভড' : 'COD courier losses avoided'}
            </p>
          </div>
        </div>

        {/* Charts Row: User Growth + Subscriptions + Fraud Report Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: User Growth Timeline */}
          <div className="p-5 rounded-2xl bg-[#0d1527] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>{lang === 'bn' ? 'ব্যবহারকারী বৃদ্ধি গ্রাফ' : 'User Growth Curve'}</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">{metrics.total} Users</span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="adminUserGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="period" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#070b14', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#22d3ee" strokeWidth={2} fill="url(#adminUserGrad)" name="Total Registered" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Active Subscriptions Tier Breakdown */}
          <div className="p-5 rounded-2xl bg-[#0d1527] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>{lang === 'bn' ? 'সাবস্ক্রিপশন প্যাকেজ বিতরণ' : 'Subscription Distribution'}</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">Tiers</span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={planDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="tier" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#070b14', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px', color: '#fff' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Merchants" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Recent Fraud Report Statistics & Loss Prevented */}
          <div className="p-5 rounded-2xl bg-[#0d1527] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <span>{lang === 'bn' ? 'সাম্প্রতিক ফ্রড রিপোর্ট পরিসংখ্যান' : 'Recent Fraud Report Stats'}</span>
              </h3>
              <span className="text-xs text-emerald-400 font-mono">৳924k saved</span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={FRAUD_STATISTICS_STREAM} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#070b14', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px', color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="reports" stroke="#f43f5e" strokeWidth={2} name="Reports Filed" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="blacklistedPhones" stroke="#38bdf8" strokeWidth={2} name="Blacklisted" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          TAB 1: USER DATABASE & TABLE WITH APPROVE / DELETE CONTROLS
         ========================================================================= */}
      {adminTab === 'users' && (
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'bn' ? 'মার্চেন্ট নাম, ইমেইল, স্টোর বা ফোন...' : 'Search by name, email, store, or phone...'}
                className="w-full bg-[#0d1527] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition-colors"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-[#0d1527] border border-slate-800 rounded-xl text-xs">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    statusFilter === 'all' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({users.length})
                </button>
                <button
                  onClick={() => setStatusFilter('approved')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    statusFilter === 'approved' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Approved ({metrics.approved})
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    statusFilter === 'pending' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pending ({metrics.pending})
                </button>
                <button
                  onClick={() => setStatusFilter('suspended')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    statusFilter === 'suspended' ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Suspended ({metrics.suspended})
                </button>
              </div>

              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value as any)}
                className="bg-[#0d1527] border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 outline-none focus:border-cyan-400"
              >
                <option value="all">All Plans</option>
                <option value="free">Free Starter</option>
                <option value="pro">Merchant Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-2xl border border-slate-800 bg-[#0d1527] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th scope="col" className="px-4 py-3.5">
                      {lang === 'bn' ? 'মার্চেন্ট ও শপের নাম' : 'Merchant & Store'}
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      {lang === 'bn' ? 'ক্রেডেনশিয়াল ও যোগাযোগ' : 'Credentials & Contact'}
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      {lang === 'bn' ? 'প্যাকেজ কোটা' : 'Plan & Quota'}
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      {lang === 'bn' ? 'স্ট্যাটাস' : 'Status'}
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      {lang === 'bn' ? 'নিবন্ধনের তারিখ' : 'Registered Date'}
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-right">
                      {lang === 'bn' ? 'এডমিন অ্যাকশন' : 'Approve / Delete'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                        <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p>{lang === 'bn' ? 'কোনো মার্চেন্ট পাওয়া যায়নি।' : 'No users match criteria.'}</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((item) => {
                      const isRootAdmin = AUTHORIZED_ADMIN_EMAILS.includes(item.email.toLowerCase());
                      const isPending = item.status === 'pending';
                      const isApproved = item.status === 'approved';
                      const isSuspended = item.status === 'suspended';

                      return (
                        <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-300 text-xs shrink-0">
                                {item.name ? item.name.charAt(0).toUpperCase() : 'M'}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-white truncate">{item.name}</span>
                                  {isRootAdmin && (
                                    <span className="text-[10px] text-cyan-400 font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                                      ADMIN
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-400 truncate block">
                                  {item.storeName || 'Merchant Store'}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 text-slate-300">
                                <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                                <span className="truncate max-w-[180px] font-mono">{item.email}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                                <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                                <span>{item.phone}</span>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="space-y-0.5">
                              <span className="font-medium text-slate-200 block truncate">{item.plan}</span>
                              <span className="text-[11px] text-cyan-300 font-mono tabular-nums">
                                {item.checksRemaining > 90000 ? 'Unlimited' : `${item.checksRemaining} checks`}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            {isApproved && (
                              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>Approved</span>
                              </div>
                            )}
                            {isPending && (
                              <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs">
                                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span>Pending Approval</span>
                              </div>
                            )}
                            {isSuspended && (
                              <div className="flex items-center gap-1.5 text-rose-400 font-semibold text-xs">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                <span>Suspended</span>
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px] tabular-nums whitespace-nowrap">
                            {new Date(item.createdAt).toLocaleDateString('en-GB', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>

                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {/* APPROVE CONTROL */}
                              {isPending || isSuspended ? (
                                <button
                                  onClick={() => handleApprove(item.id)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm shadow-emerald-500/20 transition-all cursor-pointer"
                                  title="Approve this merchant registration"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>{lang === 'bn' ? 'অনুমোদন' : 'Approve'}</span>
                                </button>
                              ) : (
                                <span className="text-[11px] text-emerald-400 font-medium px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30">
                                  Approved
                                </span>
                              )}

                              {/* DELETE CONTROL */}
                              <button
                                onClick={() => setUserToDelete(item)}
                                disabled={isRootAdmin}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isRootAdmin
                                    ? 'text-slate-700 cursor-not-allowed'
                                    : 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 cursor-pointer'
                                }`}
                                title={isRootAdmin ? 'Cannot delete root admin' : 'Delete user'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          TAB 2: PACKAGE PRICING & PAYMENT WALLET MANAGEMENT
         ========================================================================= */}
      {adminTab === 'pricing' && (
        <section className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0d1527] border border-cyan-500/30 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Tag className="w-5 h-5 text-cyan-400" />
                  <span>{lang === 'bn' ? 'প্যাকেজ মূল্য ও পেমেন্ট নম্বর ব্যবস্থাপনা' : 'Package Pricing & Payment Configuration'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === 'bn'
                    ? 'এখানে পরিবর্তন করলে সকল মার্চেন্টদের জন্য বিকাশ, নগদ ও সাবস্ক্রিপশন ফি আপডেট হয়ে যাবে।'
                    : 'Modify plan fees, monthly quotas, and receiving wallets for bKash, Nagad, and Rocket.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetData}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
              >
                Reset Defaults
              </button>
            </div>

            <form onSubmit={handleSavePricing} className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Free Plan */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-slate-200 font-bold">
                    <span>Free Starter Plan</span>
                    <span className="text-emerald-400">৳0 BDT</span>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Monthly Free Checks</label>
                    <input
                      type="number"
                      value={pricing.freeChecksMonthly}
                      onChange={(e) => setPricing({ ...pricing, freeChecksMonthly: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>

                {/* Merchant Pro Plan */}
                <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-3">
                  <div className="flex justify-between items-center text-cyan-300 font-bold">
                    <span>Merchant Pro Plan</span>
                    <span className="text-cyan-400">Monthly</span>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Price (BDT)</label>
                    <input
                      type="number"
                      value={pricing.proPriceBDT}
                      onChange={(e) => setPricing({ ...pricing, proPriceBDT: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Checks Included</label>
                    <input
                      type="number"
                      value={pricing.proChecksMonthly}
                      onChange={(e) => setPricing({ ...pricing, proChecksMonthly: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>

                {/* Enterprise Plan */}
                <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/30 space-y-3">
                  <div className="flex justify-between items-center text-indigo-300 font-bold">
                    <span>Enterprise Unlimited</span>
                    <span className="text-indigo-400">Monthly</span>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Price (BDT)</label>
                    <input
                      type="number"
                      value={pricing.enterprisePriceBDT}
                      onChange={(e) => setPricing({ ...pricing, enterprisePriceBDT: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Checks Quota</label>
                    <input
                      type="number"
                      value={pricing.enterpriseChecksMonthly}
                      onChange={(e) => setPricing({ ...pricing, enterpriseChecksMonthly: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Receiving Wallets */}
              <div className="border-t border-slate-800 pt-5 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'bn' ? 'মার্চেন্ট পেমেন্ট গ্রহণ নম্বর (Merchant Wallets)' : 'Payment Receiving Mobile Wallets'}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-slate-300 block mb-1">bKash Personal/Merchant</label>
                    <input
                      type="text"
                      value={pricing.bkashNumber}
                      onChange={(e) => setPricing({ ...pricing, bkashNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Nagad Number</label>
                    <input
                      type="text"
                      value={pricing.nagadNumber}
                      onChange={(e) => setPricing({ ...pricing, nagadNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Rocket Number</label>
                    <input
                      type="text"
                      value={pricing.rocketNumber}
                      onChange={(e) => setPricing({ ...pricing, rocketNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Support WhatsApp (24/7)</label>
                    <input
                      type="text"
                      value={pricing.supportWhatsapp}
                      onChange={(e) => setPricing({ ...pricing, supportWhatsapp: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-xl shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'পরিবর্তনসমূহ সংরক্ষণ করুন' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* =========================================================================
          DELETE CONFIRMATION MODAL
         ========================================================================= */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#0d1527] border border-rose-500/30 p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {lang === 'bn' ? 'ব্যবহারকারী মুছে ফেলতে নিশ্চিত?' : 'Confirm User Deletion'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === 'bn'
                    ? `আপনি কি নিশ্চিত যে আপনি ${userToDelete.name} (${userToDelete.email}) কে মুছে ফেলতে চান? এটি ডাটাবেস থেকে অপসারিত হবে।`
                    : `Are you sure you want to delete ${userToDelete.name} (${userToDelete.email})?`}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADD NEW MERCHANT MODAL
         ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#0d1527] border border-cyan-500/30 p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Register New Merchant</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Merchant Full Name *</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Mahin Ahmed"
                  required
                  className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-lg outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Store / Brand Name *</label>
                <input
                  type="text"
                  value={newUserStore}
                  onChange={(e) => setNewUserStore(e.target.value)}
                  placeholder="e.g. BD Express Outlet"
                  required
                  className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-lg outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Email Address *</label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="mahin@bdexpress.com"
                    required
                    className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-lg outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Phone Number</label>
                  <input
                    type="tel"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="01711223344"
                    className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-lg outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Assigned Package</label>
                  <select
                    value={newUserPlan}
                    onChange={(e) => setNewUserPlan(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-lg outline-none focus:border-cyan-400"
                  >
                    <option value="free">Free Starter (100 checks)</option>
                    <option value="pro">Merchant Pro (2,500 checks)</option>
                    <option value="enterprise">Enterprise Unlimited</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Initial Status</label>
                  <select
                    value={newUserStatus}
                    onChange={(e) => setNewUserStatus(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-lg outline-none focus:border-cyan-400"
                  >
                    <option value="approved">Approved (Active)</option>
                    <option value="pending">Pending Review</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-xl shadow-md shadow-cyan-500/20 cursor-pointer"
                >
                  Save & Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
