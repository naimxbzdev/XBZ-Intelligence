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
  Package,
  Sliders,
  Edit3,
  XCircle,
  CheckSquare,
  Ban,
  ShieldOff,
  Shuffle,
  RefreshCw,
  Play,
  Gauge,
  List,
  LayoutGrid,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Smartphone,
  History,
  Download,
} from 'lucide-react';
import type { PaymentSubmission, SmartposKeyConfig } from '../types/intelligence.ts';
import { DashboardStatistics } from './DashboardStatistics.tsx';
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
export const AUTHORIZED_ADMIN_EMAILS = ['naimxbz@gmail.com', 'xbz.dev@gmail.com', 'naeem@webxpress.com.bd'];
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
const LOCAL_STORAGE_PAYMENTS_KEY = 'xbz_payment_submissions';

const INITIAL_PACKAGE_REQUESTS: PaymentSubmission[] = [
  {
    id: 'pay_req_01',
    planId: 'pro',
    planName: 'Merchant Pro (2,500 checks)',
    amountBDT: 499,
    paymentMethod: 'bkash',
    senderNumber: '01711223344',
    transactionId: 'BK82914710',
    userEmail: 'tanvir@fashionbd.com',
    status: 'pending',
    submittedAt: '2026-03-24T10:15:00Z',
  },
  {
    id: 'pay_req_02',
    planId: 'enterprise',
    planName: 'Enterprise Unlimited',
    amountBDT: 1499,
    paymentMethod: 'nagad',
    senderNumber: '01822334455',
    transactionId: 'NGD8271948',
    userEmail: 'sabrina@glamourbd.com',
    status: 'verified',
    approvedAt: '2026-03-23T15:20:00Z',
    submittedAt: '2026-03-23T14:40:00Z',
  },
  {
    id: 'pay_req_03',
    planId: 'pro',
    planName: 'Merchant Pro (2,500 checks)',
    amountBDT: 499,
    paymentMethod: 'rocket',
    senderNumber: '01511224466',
    transactionId: 'RKT9912847',
    userEmail: 'rafiq@gadgetbazaar.com',
    status: 'pending',
    submittedAt: '2026-03-24T11:05:00Z',
  },
  {
    id: 'pay_req_04',
    planId: 'pro',
    planName: 'Merchant Pro (2,500 checks)',
    amountBDT: 499,
    paymentMethod: 'bkash',
    senderNumber: '01933445566',
    transactionId: 'BK11029481',
    userEmail: 'mahmud@techzonebd.com',
    status: 'rejected',
    rejectionReason: 'ভুল TrxID প্রদান করা হয়েছে, টাকা জমা পাওয়া যায়নি।',
    rejectedAt: '2026-03-22T16:00:00Z',
    submittedAt: '2026-03-22T14:20:00Z',
  },
];

const LOCAL_STORAGE_SMARTPOS_KEYS_KEY = 'xbz_smartpos_keys';

const INITIAL_SMARTPOS_KEYS_CLIENT: SmartposKeyConfig[] = [
  {
    id: 'sp_key_01',
    name: 'SmartPOS Account #1 (Primary)',
    apiKey: 'fraud_vRSyppIMF080gu4VE1TYRDqHsYIPL0Ms',
    domain: 'intelligence.xbz.com.bd',
    monthlyLimit: 1000,
    usageCount: 385,
    status: 'active',
    lastUsedAt: '2026-03-24T12:00:00Z',
    createdAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'sp_key_02',
    name: 'SmartPOS Account #2 (Standby Backup)',
    apiKey: 'fraud_k982j3h4g5f6d7s8a9q0w1e2r3t4y5u6',
    domain: 'backup.xbz.com.bd',
    monthlyLimit: 1000,
    usageCount: 0,
    status: 'active',
    createdAt: '2026-03-15T00:00:00Z',
  },
  {
    id: 'sp_key_03',
    name: 'SmartPOS Account #3 (Reserve Pool)',
    apiKey: 'fraud_m1n2b3v4c5x6z7l8k9j0h1g2f3d4s5a6',
    monthlyLimit: 1000,
    usageCount: 0,
    status: 'active',
    createdAt: '2026-03-20T00:00:00Z',
  },
];

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

  // Active Admin View Tab: 'users' | 'packages' | 'history' | 'devices' | 'audit' | 'smartpos' | 'analytics' | 'pricing'
  const [adminTab, setAdminTab] = useState<'users' | 'packages' | 'history' | 'devices' | 'audit' | 'smartpos' | 'analytics' | 'pricing'>('users');

  // Payment History Search & Filter State
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'all' | 'verified' | 'rejected' | 'pending'>('all');
  const [historyMethodFilter, setHistoryMethodFilter] = useState<'all' | 'bkash' | 'nagad' | 'rocket'>('all');
  const [historySortOrder, setHistorySortOrder] = useState<'newest' | 'oldest' | 'highest_amount'>('newest');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoadingAuditLogs, setIsLoadingAuditLogs] = useState(false);

  // Device & IP Anti-Cheat State
  const [devicesList, setDevicesList] = useState<any[]>([]);
  const [ipsList, setIpsList] = useState<any[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);

  // Fetch Audit Logs from backend
  const fetchAuditLogs = async () => {
    setIsLoadingAuditLogs(true);
    try {
      const res = await fetch('/api/admin/audit-logs');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setAuditLogs(data);
      }
    } catch {} finally {
      setIsLoadingAuditLogs(false);
    }
  };

  // Fetch Devices and IPs from backend
  const fetchDevices = async () => {
    setIsLoadingDevices(true);
    try {
      const res = await fetch(`/api/admin/devices?adminEmail=${encodeURIComponent(currentUserEmail || 'naeem@webxpress.com.bd')}`);
      if (res.ok) {
        const data = await res.json();
        if (data.devices) setDevicesList(data.devices);
        if (data.ips) setIpsList(data.ips);
      }
    } catch {} finally {
      setIsLoadingDevices(false);
    }
  };

  useEffect(() => {
    if (adminTab === 'audit') fetchAuditLogs();
    if (adminTab === 'devices') fetchDevices();
  }, [adminTab]);

  // SmartPOS Multi-API Key Pool state
  const [smartposKeys, setSmartposKeys] = useState<SmartposKeyConfig[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_SMARTPOS_KEYS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_SMARTPOS_KEYS_CLIENT;
    } catch {
      return INITIAL_SMARTPOS_KEYS_CLIENT;
    }
  });

  // Fetch SmartPOS keys from backend
  useEffect(() => {
    fetch('/api/admin/smartpos/keys')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.keys) && data.keys.length > 0) {
          setSmartposKeys(data.keys);
          try {
            localStorage.setItem(LOCAL_STORAGE_SMARTPOS_KEYS_KEY, JSON.stringify(data.keys));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const saveSmartposKeys = (updated: SmartposKeyConfig[]) => {
    setSmartposKeys(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_SMARTPOS_KEYS_KEY, JSON.stringify(updated));
    } catch {}
  };

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

  // Package & Payment submissions state
  const [payments, setPayments] = useState<PaymentSubmission[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_PAYMENTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      localStorage.setItem(LOCAL_STORAGE_PAYMENTS_KEY, JSON.stringify(INITIAL_PACKAGE_REQUESTS));
      return INITIAL_PACKAGE_REQUESTS;
    } catch {
      return INITIAL_PACKAGE_REQUESTS;
    }
  });

  // Fetch package requests from backend on mount
  useEffect(() => {
    fetch('/api/admin/packages')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPayments(data);
          try {
            localStorage.setItem(LOCAL_STORAGE_PAYMENTS_KEY, JSON.stringify(data));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

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

  // UI state for user filter, search, selection, and modals
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'suspended'>('all');
  const [planFilter, setPlanFilter] = useState<'all' | 'free' | 'pro' | 'enterprise'>('all');
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [userToDelete, setUserToDelete] = useState<RegisteredUser | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Package Requests Filter & Search State
  const [packageFilter, setPackageFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [packageSearchQuery, setPackageSearchQuery] = useState('');

  // Modals for Package Actions: Approve, Reject, Delete
  const [packageToApprove, setPackageToApprove] = useState<PaymentSubmission | null>(null);
  const [approvalCustomLimit, setApprovalCustomLimit] = useState<number>(2500);
  const [packageToReject, setPackageToReject] = useState<PaymentSubmission | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('');
  const [packageToDelete, setPackageToDelete] = useState<PaymentSubmission | null>(null);

  // SmartPOS Key Pool Modals & Action States
  const [isAddKeyModalOpen, setIsAddKeyModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyApiKey, setNewKeyApiKey] = useState('');
  const [newKeyDomain, setNewKeyDomain] = useState('');
  const [newKeyMonthlyLimit, setNewKeyMonthlyLimit] = useState<number>(1000);
  const [editingSmartposKey, setEditingSmartposKey] = useState<SmartposKeyConfig | null>(null);
  const [editKeyMonthlyLimit, setEditKeyMonthlyLimit] = useState<number>(1000);
  const [editKeyStatus, setEditKeyStatus] = useState<'active' | 'disabled' | 'exhausted' | 'error'>('active');
  const [keyToDelete, setKeyToDelete] = useState<SmartposKeyConfig | null>(null);
  const [isSimulatingRollover, setIsSimulatingRollover] = useState(false);

  // SmartPOS Multi-Key Form & View Mode States
  const [isMultiKeyFormOpen, setIsMultiKeyFormOpen] = useState(true);
  const [multiKeyMode, setMultiKeyMode] = useState<'rows' | 'bulk'>('rows');
  const [multiKeyRows, setMultiKeyRows] = useState<Array<{ id: string; name: string; apiKey: string; domain: string; monthlyLimit: number }>>([
    { id: '1', name: '', apiKey: '', domain: '', monthlyLimit: 1000 },
    { id: '2', name: '', apiKey: '', domain: '', monthlyLimit: 1000 },
  ]);
  const [bulkPasteText, setBulkPasteText] = useState('');
  const [isSubmittingMultiKeys, setIsSubmittingMultiKeys] = useState(false);
  const [smartposViewMode, setSmartposViewMode] = useState<'list' | 'grid'>('list');

  // Edit User Package & Limit Modal State
  const [editingUser, setEditingUser] = useState<RegisteredUser | null>(null);
  const [editUserPlanId, setEditUserPlanId] = useState<'free' | 'pro' | 'enterprise'>('pro');
  const [editUserPlanName, setEditUserPlanName] = useState<string>('');
  const [editUserChecks, setEditUserChecks] = useState<number>(2500);
  const [editUserStatus, setEditUserStatus] = useState<'approved' | 'pending' | 'suspended'>('approved');

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserStore, setNewUserStore] = useState('');
  const [newUserPlan, setNewUserPlan] = useState<'free' | 'pro' | 'enterprise'>('pro');
  const [newUserStatus, setNewUserStatus] = useState<'approved' | 'pending'>('approved');

  // Helper to persist payments
  const savePayments = (updated: PaymentSubmission[]) => {
    setPayments(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_PAYMENTS_KEY, JSON.stringify(updated));
    } catch {}
  };

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
    savePayments(INITIAL_PACKAGE_REQUESTS);
    showFeedback(
      lang === 'bn' ? 'নমুনা ব্যবহারকারী ও প্যাকেজ ডাটা সফলভাবে রিস্টোর করা হয়েছে।' : 'Sample dataset restored successfully.',
      'info'
    );
  };

  // User Ban / Unban Toggle Handler
  const handleToggleBan = async (targetUser: RegisteredUser) => {
    if (AUTHORIZED_ADMIN_EMAILS.includes(targetUser.email.toLowerCase())) {
      showFeedback(
        lang === 'bn' ? 'প্রধান এডমিন অ্যাকাউন্ট ব্যান করা সম্ভব নয়।' : 'Cannot ban root administrator account.',
        'error'
      );
      return;
    }

    const isBanning = targetUser.status !== 'suspended';
    const nextStatus: 'suspended' | 'approved' = isBanning ? 'suspended' : 'approved';
    const updated = users.map((u) => (u.id === targetUser.id ? { ...u, status: nextStatus } : u));
    saveUsers(updated);

    try {
      const endpoint = isBanning ? `/api/admin/users/${targetUser.id}/ban` : `/api/admin/users/${targetUser.id}/unban`;
      await fetch(endpoint, { method: 'POST' });
    } catch {}

    showFeedback(
      isBanning
        ? lang === 'bn'
          ? `গ্রাহক ${targetUser.name} (${targetUser.email}) কে তাৎক্ষণিকভাবে ব্যান ও স্থগিত করা হয়েছে।`
          : `User ${targetUser.name} has been banned & suspended.`
        : lang === 'bn'
          ? `গ্রাহক ${targetUser.name} এর অ্যাকাউন্ট সফলভাবে সক্রিয় ও আনব্যান করা হয়েছে।`
          : `User ${targetUser.name} has been unbanned and restored.`,
      isBanning ? 'error' : 'success'
    );
  };

  // Open Edit User Package & Limit Modal
  const handleOpenEditUser = (targetUser: RegisteredUser) => {
    setEditingUser(targetUser);
    setEditUserPlanId(targetUser.planId);
    setEditUserPlanName(targetUser.plan);
    setEditUserChecks(targetUser.checksRemaining);
    setEditUserStatus(targetUser.status);
  };

  // Save User Package & Limit changes
  const handleSaveUserPlanAndLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const planLabel =
      editUserPlanName.trim() ||
      (editUserPlanId === 'enterprise'
        ? 'Enterprise Unlimited'
        : editUserPlanId === 'pro'
        ? 'Merchant Pro (2,500 checks)'
        : 'Free Starter (100 checks/mo)');

    const updated = users.map((u) => {
      if (u.id === editingUser.id) {
        return {
          ...u,
          planId: editUserPlanId,
          plan: planLabel,
          checksRemaining: Number(editUserChecks) || 0,
          status: editUserStatus,
        };
      }
      return u;
    });

    saveUsers(updated);

    try {
      await fetch(`/api/admin/users/${editingUser.id}/update-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: editUserPlanId,
          planName: planLabel,
          checksRemaining: Number(editUserChecks) || 0,
          status: editUserStatus,
        }),
      });
    } catch {}

    showFeedback(
      lang === 'bn'
        ? `গ্রাহক ${editingUser.name} এর প্যাকেজ ও লিমিট সফলভাবে হালনাগাদ করা হয়েছে!`
        : `Package & credit limit updated for ${editingUser.name}!`,
      'success'
    );
    setEditingUser(null);
  };

  // Open Package Approval modal with default limit
  const handleOpenApprovePackage = (p: PaymentSubmission) => {
    setPackageToApprove(p);
    const standardLimit = p.planId === 'enterprise' ? 99999 : 2500;
    setApprovalCustomLimit(standardLimit);
  };

  // Confirm Package Approval
  const handleConfirmApprovePackage = async () => {
    if (!packageToApprove) return;

    const grantedLimit = Number(approvalCustomLimit) || (packageToApprove.planId === 'enterprise' ? 99999 : 2500);
    const nowIso = new Date().toISOString();

    const actingAdminEmail = currentUserEmail || 'naeem@webxpress.com.bd';

    const updatedPayments = payments.map((p) =>
      p.id === packageToApprove.id
        ? {
            ...p,
            status: 'verified' as const,
            approvedAt: nowIso,
            approvedBy: actingAdminEmail,
            customLimitGranted: grantedLimit,
          }
        : p
    );
    savePayments(updatedPayments);

    // Also update merchant in users state if email matches
    if (packageToApprove.userEmail) {
      const targetEmail = packageToApprove.userEmail.toLowerCase();
      const updatedUsers = users.map((u) => {
        if (u.email.toLowerCase() === targetEmail) {
          return {
            ...u,
            planId: packageToApprove.planId,
            plan: packageToApprove.planName,
            checksRemaining: grantedLimit,
            status: 'approved' as const,
          };
        }
        return u;
      });
      saveUsers(updatedUsers);
    }

    try {
      await fetch(`/api/admin/packages/${packageToApprove.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customLimitGranted: grantedLimit,
          adminEmail: actingAdminEmail,
        }),
      });
    } catch {}

    showFeedback(
      lang === 'bn'
        ? `প্যাকেজ রিকোয়েস্ট (TrxID: ${packageToApprove.transactionId}) সফলভাবে অনুমোদিত হয়েছে এবং গ্রাহককে ${grantedLimit.toLocaleString()} লিমিট দেওয়া হয়েছে!`
        : `Package request approved! ${grantedLimit.toLocaleString()} checks allocated.`,
      'success'
    );
    setPackageToApprove(null);
  };

  // Open Package Rejection modal
  const handleOpenRejectPackage = (p: PaymentSubmission) => {
    setPackageToReject(p);
    setRejectionReasonInput('');
  };

  // Confirm Package Rejection
  const handleConfirmRejectPackage = async () => {
    if (!packageToReject) return;

    const reason = rejectionReasonInput.trim() || 'পেমেন্ট ভেরিফিকেশন ব্যর্থ হয়েছে / ভুল TrxID।';
    const nowIso = new Date().toISOString();
    const actingAdminEmail = currentUserEmail || 'naeem@webxpress.com.bd';

    const updatedPayments = payments.map((p) =>
      p.id === packageToReject.id
        ? {
            ...p,
            status: 'rejected' as const,
            rejectedAt: nowIso,
            rejectedBy: actingAdminEmail,
            rejectionReason: reason,
          }
        : p
    );
    savePayments(updatedPayments);

    try {
      await fetch(`/api/admin/packages/${packageToReject.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rejectionReason: reason,
          adminEmail: actingAdminEmail,
        }),
      });
    } catch {}

    showFeedback(
      lang === 'bn'
        ? `প্যাকেজ রিকোয়েস্ট (TrxID: ${packageToReject.transactionId}) বাতিল করা হয়েছে।`
        : `Package request rejected.`,
      'info'
    );
    setPackageToReject(null);
  };

  // Open Package Deletion
  const handleOpenDeletePackage = (p: PaymentSubmission) => {
    setPackageToDelete(p);
  };

  // Confirm Package Deletion
  const handleConfirmDeletePackage = async () => {
    if (!packageToDelete) return;

    const updatedPayments = payments.filter((p) => p.id !== packageToDelete.id);
    savePayments(updatedPayments);

    try {
      await fetch(`/api/admin/packages/${packageToDelete.id}`, { method: 'DELETE' });
    } catch {}

    showFeedback(
      lang === 'bn'
        ? `প্যাকেজ রিকোয়েস্ট রেকর্ড সফলভাবে মুছে ফেলা হয়েছে।`
        : `Package request record deleted.`,
      'info'
    );
    setPackageToDelete(null);
  };

  // Filtered package requests calculation
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (packageFilter !== 'all' && p.status !== packageFilter) return false;
      if (packageSearchQuery.trim()) {
        const q = packageSearchQuery.toLowerCase();
        return (
          p.transactionId.toLowerCase().includes(q) ||
          p.senderNumber.includes(q) ||
          (p.userEmail && p.userEmail.toLowerCase().includes(q)) ||
          p.paymentMethod.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [payments, packageFilter, packageSearchQuery]);

  const pendingPackagesCount = useMemo(() => {
    return payments.filter((p) => p.status === 'pending').length;
  }, [payments]);

  // Payment History Records Calculation (Searchable across TrxID, sender phone, merchant email, admin username, method)
  const paymentHistoryRecords = useMemo(() => {
    return payments
      .filter((p) => {
        if (historyStatusFilter !== 'all' && p.status !== historyStatusFilter) return false;
        if (historyMethodFilter !== 'all' && p.paymentMethod !== historyMethodFilter) return false;
        if (historySearchQuery.trim()) {
          const q = historySearchQuery.toLowerCase().trim();
          const matchesTrx = p.transactionId?.toLowerCase().includes(q);
          const matchesSender = p.senderNumber?.includes(q);
          const matchesEmail = p.userEmail?.toLowerCase().includes(q);
          const matchesAdmin = Boolean(
            (p.approvedBy && p.approvedBy.toLowerCase().includes(q)) ||
            (p.rejectedBy && p.rejectedBy.toLowerCase().includes(q))
          );
          const matchesPlan = p.planName?.toLowerCase().includes(q);
          const matchesMethod = p.paymentMethod?.toLowerCase().includes(q);
          return Boolean(matchesTrx || matchesSender || matchesEmail || matchesAdmin || matchesPlan || matchesMethod);
        }
        return true;
      })
      .sort((a, b) => {
        if (historySortOrder === 'oldest') {
          return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
        }
        if (historySortOrder === 'highest_amount') {
          return (b.amountBDT || 0) - (a.amountBDT || 0);
        }
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      });
  }, [payments, historyStatusFilter, historyMethodFilter, historySearchQuery, historySortOrder]);

  const historyMetrics = useMemo(() => {
    const verified = payments.filter((p) => p.status === 'verified');
    const totalApprovedRevenue = verified.reduce((sum, p) => sum + (p.amountBDT || 0), 0);
    const rejectedCount = payments.filter((p) => p.status === 'rejected').length;
    const pendingCount = payments.filter((p) => p.status === 'pending').length;
    return {
      total: payments.length,
      verifiedCount: verified.length,
      totalApprovedRevenue,
      rejectedCount,
      pendingCount,
    };
  }, [payments]);

  // Export Payment History to CSV
  const handleExportPaymentHistoryCSV = () => {
    if (paymentHistoryRecords.length === 0) {
      showFeedback(lang === 'bn' ? 'এক্সপোর্ট করার মতো কোনো পেমেন্ট রেকর্ড নেই।' : 'No payment records to export.', 'info');
      return;
    }
    const headers = [
      'Transaction ID',
      'Gateway',
      'Package',
      'Amount (BDT)',
      'Merchant Email',
      'Sender Phone',
      'Status',
      'Submission Timestamp',
      'Approval Timestamp',
      'Administrator Username',
      'Notes / Reason',
    ];
    const rows = paymentHistoryRecords.map((p) => [
      p.transactionId,
      p.paymentMethod.toUpperCase(),
      p.planName,
      p.amountBDT,
      p.userEmail || '',
      p.senderNumber,
      p.status,
      p.submittedAt ? new Date(p.submittedAt).toLocaleString('en-GB') : '',
      p.approvedAt
        ? new Date(p.approvedAt).toLocaleString('en-GB')
        : p.rejectedAt
        ? new Date(p.rejectedAt).toLocaleString('en-GB')
        : 'Pending Review',
      p.approvedBy || p.rejectedBy || (p.status === 'verified' ? 'naeem@webxpress.com.bd' : 'N/A'),
      p.rejectionReason || (p.customLimitGranted ? `Granted: ${p.customLimitGranted} checks` : ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `xbz_payment_history_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback(lang === 'bn' ? 'পেমেন্ট হিস্ট্রি CSV ফাইল সফলভাবে ডাউনলোড হয়েছে!' : 'Payment history exported to CSV successfully!', 'success');
  };

  // SmartPOS Pool Summary calculation
  const smartposPoolSummary = useMemo(() => {
    const totalCapacity = smartposKeys.reduce((sum, k) => sum + k.monthlyLimit, 0);
    const usedChecks = smartposKeys.reduce((sum, k) => sum + k.usageCount, 0);
    const remainingChecks = Math.max(0, totalCapacity - usedChecks);
    const eligible = smartposKeys.filter(
      (k) => k.status !== 'disabled' && k.status !== 'exhausted' && k.usageCount < k.monthlyLimit
    );
    const activeServingKey = eligible.length > 0 ? eligible[0] : null;

    return {
      totalCapacity,
      usedChecks,
      remainingChecks,
      activeKeysCount: eligible.length,
      exhaustedKeysCount: smartposKeys.filter((k) => k.status === 'exhausted').length,
      activeServingKey,
    };
  }, [smartposKeys]);

  // Reset usage on a key (recharges key)
  const handleResetSmartposKey = async (keyId: string) => {
    const updated = smartposKeys.map((k) =>
      k.id === keyId ? { ...k, usageCount: 0, status: 'active' as const, lastError: undefined } : k
    );
    saveSmartposKeys(updated);

    try {
      await fetch(`/api/admin/smartpos/keys/${keyId}/reset`, { method: 'POST' });
    } catch {}

    showFeedback(
      lang === 'bn' ? 'এপিআই কী এর ব্যবহার কাউন্টার ০ তে রিসেট করা হয়েছে!' : 'Key usage reset to 0!',
      'success'
    );
  };

  // Toggle enable/disable key
  const handleToggleSmartposKey = async (key: SmartposKeyConfig) => {
    const nextStatus: 'active' | 'disabled' = key.status === 'disabled' ? 'active' : 'disabled';
    const updated = smartposKeys.map((k) => (k.id === key.id ? { ...k, status: nextStatus } : k));
    saveSmartposKeys(updated);

    try {
      await fetch(`/api/admin/smartpos/keys/${key.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch {}

    showFeedback(
      nextStatus === 'disabled'
        ? (lang === 'bn' ? 'কী সাময়িকভাবে বন্ধ করা হয়েছে।' : 'Key disabled.')
        : (lang === 'bn' ? 'কী পুনরায় চালু করা হয়েছে।' : 'Key activated.'),
      'info'
    );
  };

  // Add new SmartPOS Key
  const handleAddSmartposKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim() || !newKeyApiKey.trim()) {
      showFeedback('Name and API Key are required', 'error');
      return;
    }

    const created: SmartposKeyConfig = {
      id: 'sp_key_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4),
      name: newKeyName.trim(),
      apiKey: newKeyApiKey.trim(),
      domain: newKeyDomain.trim() || undefined,
      monthlyLimit: Number(newKeyMonthlyLimit) || 1000,
      usageCount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    saveSmartposKeys([...smartposKeys, created]);
    setIsAddKeyModalOpen(false);
    setNewKeyName('');
    setNewKeyApiKey('');
    setNewKeyDomain('');
    setNewKeyMonthlyLimit(1000);

    try {
      await fetch('/api/admin/smartpos/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created),
      });
    } catch {}

    showFeedback(
      lang === 'bn' ? 'নতুন SmartPOS এপিআই কী সফলভাবে যুক্ত হয়েছে!' : 'New SmartPOS key added to pool!',
      'success'
    );
  };

  // Multi-key Row Operations
  const handleAddMultiKeyRow = () => {
    const nextId = String(Date.now() + Math.random());
    setMultiKeyRows((prev) => [
      ...prev,
      { id: nextId, name: '', apiKey: '', domain: '', monthlyLimit: 1000 },
    ]);
  };

  const handleRemoveMultiKeyRow = (id: string) => {
    if (multiKeyRows.length <= 1) return;
    setMultiKeyRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateMultiKeyRow = (
    id: string,
    field: 'name' | 'apiKey' | 'domain' | 'monthlyLimit',
    value: any
  ) => {
    setMultiKeyRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  // Submit multi-key rows form
  const handleSubmitMultiKeyRows = async (e: React.FormEvent) => {
    e.preventDefault();
    const validRows = multiKeyRows.filter((r) => r.apiKey && r.apiKey.trim().length > 0);
    if (validRows.length === 0) {
      showFeedback(lang === 'bn' ? 'কমপক্ষে একটি API কী ইনপুট দিন!' : 'Please enter at least one API key!', 'error');
      return;
    }

    setIsSubmittingMultiKeys(true);
    try {
      const payload = validRows.map((r, i) => ({
        name: r.name.trim() || `SmartPOS Key #${smartposKeys.length + i + 1}`,
        apiKey: r.apiKey.trim(),
        domain: r.domain.trim() || undefined,
        monthlyLimit: Number(r.monthlyLimit) || 1000,
      }));

      const res = await fetch('/api/admin/smartpos/keys/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys: payload }),
      });
      const data = await res.json();
      if (data && data.allKeys) {
        saveSmartposKeys(data.allKeys);
      } else if (data && data.keys) {
        saveSmartposKeys([...smartposKeys, ...data.keys]);
      } else {
        const localCreated: SmartposKeyConfig[] = payload.map((p, idx) => ({
          id: 'sp_key_' + Date.now().toString(36) + '_' + idx,
          name: p.name,
          apiKey: p.apiKey,
          domain: p.domain,
          monthlyLimit: p.monthlyLimit,
          usageCount: 0,
          status: 'active',
          createdAt: new Date().toISOString(),
        }));
        saveSmartposKeys([...smartposKeys, ...localCreated]);
      }

      setMultiKeyRows([
        { id: '1', name: '', apiKey: '', domain: '', monthlyLimit: 1000 },
        { id: '2', name: '', apiKey: '', domain: '', monthlyLimit: 1000 },
      ]);
      showFeedback(
        lang === 'bn'
          ? `${validRows.length}টি SmartPOS কী সফলভাবে পুলে যুক্ত হয়েছে!`
          : `Successfully added ${validRows.length} SmartPOS keys to pool!`,
        'success'
      );
    } catch {
      showFeedback('Keys saved locally', 'success');
    } finally {
      setIsSubmittingMultiKeys(false);
    }
  };

  // Submit bulk paste text form
  const handleSubmitBulkPaste = async (e: React.FormEvent) => {
    e.preventDefault();
    const lines = bulkPasteText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('#'));

    if (lines.length === 0) {
      showFeedback(lang === 'bn' ? 'কোনো বৈধ API কী পাওয়া যায়নি!' : 'No valid API keys found in text!', 'error');
      return;
    }

    setIsSubmittingMultiKeys(true);
    try {
      const payload = lines.map((line, idx) => {
        const parts = line.split(',').map((p) => p.trim());
        if (parts.length >= 2 && (parts[1].startsWith('fraud_') || parts[1].length > 10)) {
          return {
            name: parts[0] || `SmartPOS Bulk #${smartposKeys.length + idx + 1}`,
            apiKey: parts[1],
            domain: parts[2] || undefined,
            monthlyLimit: Number(parts[3]) || 1000,
          };
        }
        return {
          name: `SmartPOS Key #${smartposKeys.length + idx + 1}`,
          apiKey: parts[0],
          domain: undefined,
          monthlyLimit: 1000,
        };
      });

      const res = await fetch('/api/admin/smartpos/keys/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys: payload }),
      });
      const data = await res.json();
      if (data && data.allKeys) {
        saveSmartposKeys(data.allKeys);
      } else {
        const localCreated: SmartposKeyConfig[] = payload.map((p, idx) => ({
          id: 'sp_key_' + Date.now().toString(36) + '_' + idx,
          name: p.name,
          apiKey: p.apiKey,
          domain: p.domain,
          monthlyLimit: p.monthlyLimit,
          usageCount: 0,
          status: 'active',
          createdAt: new Date().toISOString(),
        }));
        saveSmartposKeys([...smartposKeys, ...localCreated]);
      }

      setBulkPasteText('');
      showFeedback(
        lang === 'bn'
          ? `${payload.length}টি API কী সফলভাবে ইমপোর্ট হয়েছে!`
          : `Successfully imported ${payload.length} API keys!`,
        'success'
      );
    } catch {
      showFeedback('Keys saved', 'success');
    } finally {
      setIsSubmittingMultiKeys(false);
    }
  };

  // Save Edit Key
  const handleSaveEditSmartposKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSmartposKey) return;

    const updated = smartposKeys.map((k) =>
      k.id === editingSmartposKey.id
        ? {
            ...k,
            monthlyLimit: Number(editKeyMonthlyLimit) || 1000,
            status: editKeyStatus,
          }
        : k
    );

    saveSmartposKeys(updated);

    try {
      await fetch(`/api/admin/smartpos/keys/${editingSmartposKey.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyLimit: Number(editKeyMonthlyLimit) || 1000,
          status: editKeyStatus,
        }),
      });
    } catch {}

    showFeedback(
      lang === 'bn' ? 'কী সেটিংস হালনাগাদ করা হয়েছে।' : 'Key configuration updated.',
      'success'
    );
    setEditingSmartposKey(null);
  };

  // Delete SmartPOS Key
  const handleDeleteSmartposKey = async () => {
    if (!keyToDelete) return;

    const updated = smartposKeys.filter((k) => k.id !== keyToDelete.id);
    saveSmartposKeys(updated);

    try {
      await fetch(`/api/admin/smartpos/keys/${keyToDelete.id}`, { method: 'DELETE' });
    } catch {}

    showFeedback(
      lang === 'bn' ? 'কী পুল থেকে মুছে ফেলা হয়েছে।' : 'Key removed from pool.',
      'info'
    );
    setKeyToDelete(null);
  };

  // Rollover Simulation Handler (Demonstrates automatic in-flight switch)
  const handleSimulateRollover = () => {
    if (!smartposPoolSummary.activeServingKey) {
      showFeedback('No active serving key available to simulate.', 'error');
      return;
    }

    setIsSimulatingRollover(true);
    const targetKey = smartposPoolSummary.activeServingKey;

    setTimeout(() => {
      // Mark current key as exhausted (reached 1000 limit)
      const updated = smartposKeys.map((k) => {
        if (k.id === targetKey.id) {
          return {
            ...k,
            usageCount: k.monthlyLimit,
            status: 'exhausted' as const,
            lastError: `Monthly limit of ${k.monthlyLimit.toLocaleString()} checks reached. Traffic automatically rerouted to next standby key.`,
            lastUsedAt: new Date().toISOString(),
          };
        }
        return k;
      });

      saveSmartposKeys(updated);
      setIsSimulatingRollover(false);

      showFeedback(
        lang === 'bn'
          ? `সিমুলেশন সম্পন্ন! "${targetKey.name}" এর ১,০০০ সীমা পূর্ণ হওয়ায় স্বয়ংক্রিয়ভাবে পরবর্তী কী-তে ট্রাফিক সুইচ হয়েছে!`
          : `Rollover Simulated! "${targetKey.name}" hit 1,000 limit and traffic seamlessly switched to next standby key!`,
        'success'
      );
    }, 800);
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
              onClick={() => setAdminTab('packages')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer relative ${
                adminTab === 'packages'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'প্যাকেজ রিকোয়েস্ট' : 'Package Requests'}</span>
              {pendingPackagesCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950 font-mono">
                  {pendingPackagesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setAdminTab('history')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer relative ${
                adminTab === 'history'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'পেমেন্ট হিস্ট্রি' : 'Payment History'}</span>
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-750 font-mono">
                {payments.length}
              </span>
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
              <span>{lang === 'bn' ? 'ড্যাশবোর্ড অ্যানালিটিক্স' : 'Dashboard Stats'}</span>
            </button>

            <button
              onClick={() => setAdminTab('smartpos')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer relative ${
                adminTab === 'smartpos'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'SmartPOS কী পুল' : 'SmartPOS Key Pool'}</span>
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 font-mono">
                {smartposPoolSummary.activeKeysCount} Active
              </span>
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

            <button
              onClick={() => setAdminTab('devices')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                adminTab === 'devices'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'ডিভাইস কন্ট্রোল' : 'Devices & Anti-Cheat'}</span>
            </button>

            <button
              onClick={() => setAdminTab('audit')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                adminTab === 'audit'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'অডিট লগ' : 'Audit Log'}</span>
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
            <span className="text-xs text-slate-400 block">{lang === 'bn' ? 'অপেক্ষমান প্যাকেজ রিকোয়েস্ট' : 'Pending Package Upgrades'}</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-amber-400 font-mono tabular-nums">{pendingPackagesCount}</span>
              {pendingPackagesCount > 0 && (
                <button
                  onClick={() => {
                    setAdminTab('packages');
                    setPackageFilter('pending');
                  }}
                  className="text-[11px] text-cyan-400 hover:underline cursor-pointer font-medium"
                >
                  {lang === 'bn' ? 'রিভিউ করুন' : 'Review'}
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              {lang === 'bn' ? `${metrics.pending} ইউজার + ${pendingPackagesCount} প্যাকেজ রিকোয়েস্ট` : `${metrics.pending} users & ${pendingPackagesCount} package payments`}
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
                      {lang === 'bn' ? 'অ্যাকশন (প্যাকেজ / ব্যান / ডিলিট)' : 'Actions (Plan / Ban / Delete)'}
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
                      const userPendingPackage = payments.find(
                        (p) => p.userEmail?.toLowerCase() === item.email.toLowerCase() && p.status === 'pending'
                      );

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
                            <div className="space-y-1">
                              <span className="font-medium text-slate-200 block truncate">{item.plan}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-cyan-300 font-mono tabular-nums">
                                  {item.checksRemaining > 90000 ? 'Unlimited' : `${item.checksRemaining.toLocaleString()} checks`}
                                </span>
                                {userPendingPackage && (
                                  <button
                                    onClick={() => handleOpenApprovePackage(userPendingPackage)}
                                    className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors cursor-pointer"
                                    title="Click to approve requested package upgrade"
                                  >
                                    Req: {userPendingPackage.planId.toUpperCase()}
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            {isApproved && (
                              <div className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold text-xs px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>{lang === 'bn' ? 'সক্রিয়' : 'Active'}</span>
                              </div>
                            )}
                            {isPending && (
                              <div className="inline-flex items-center gap-1.5 text-amber-400 font-semibold text-xs px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/30">
                                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span>{lang === 'bn' ? 'অপেক্ষমান' : 'Pending'}</span>
                              </div>
                            )}
                            {isSuspended && (
                              <div className="inline-flex items-center gap-1.5 text-rose-400 font-semibold text-xs px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/40">
                                <Ban className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                <span>{lang === 'bn' ? 'ব্যানকৃত' : 'Banned'}</span>
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
                            <div className="flex items-center justify-end gap-1.5">
                              {/* 1. EDIT PLAN & LIMIT CONTROL */}
                              <button
                                onClick={() => handleOpenEditUser(item)}
                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 rounded-lg shadow-sm transition-all cursor-pointer"
                                title={lang === 'bn' ? 'প্যাকেজ ও লিমিট পরিবর্তন করুন' : 'Edit Package & Quota Limit'}
                              >
                                <Sliders className="w-3.5 h-3.5" />
                                <span className="hidden xl:inline">{lang === 'bn' ? 'প্যাকেজ ও লিমিট' : 'Plan & Limit'}</span>
                              </button>

                              {/* 2. APPROVE IF PENDING */}
                              {isPending && (
                                <button
                                  onClick={() => handleApprove(item.id)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm shadow-emerald-500/20 transition-all cursor-pointer"
                                  title="Approve this merchant registration"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>{lang === 'bn' ? 'অনুমোদন' : 'Approve'}</span>
                                </button>
                              )}

                              {/* 3. BAN / UNBAN CONTROL */}
                              {!isRootAdmin && (
                                <button
                                  onClick={() => handleToggleBan(item)}
                                  className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                    isSuspended
                                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/80'
                                      : 'bg-rose-950/40 border-rose-500/40 text-rose-300 hover:bg-rose-900/60'
                                  }`}
                                  title={
                                    isSuspended
                                      ? (lang === 'bn' ? 'আনব্যান করুন' : 'Unban User')
                                      : (lang === 'bn' ? 'ব্যান করুন' : 'Ban User')
                                  }
                                >
                                  {isSuspended ? (
                                    <>
                                      <UserCheck className="w-3.5 h-3.5" />
                                      <span>{lang === 'bn' ? 'আনব্যান' : 'Unban'}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Ban className="w-3.5 h-3.5" />
                                      <span>{lang === 'bn' ? 'ব্যান' : 'Ban'}</span>
                                    </>
                                  )}
                                </button>
                              )}

                              {/* 4. DELETE CONTROL */}
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
          TAB: PACKAGE & PAYMENT UPGRADE REQUESTS (APPROVE / REJECT / DELETE)
         ========================================================================= */}
      {adminTab === 'packages' && (
        <section className="space-y-6 animate-fade-in">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-cyan-400" />
                <span>{lang === 'bn' ? 'প্যাকেজ ও পেমেন্ট রিকোয়েস্ট ম্যানেজমেন্ট' : 'Package Upgrade & Payment Requests'}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'bn'
                  ? 'মার্চেন্টদের পাঠানো বিকাশ, নগদ ও রকেট পেমেন্ট ট্রানজেকশন যাচাই করে প্যাকেজ অনুমোদন (Approve), বাতিল (Reject) বা মুছে ফেলুন (Delete)।'
                  : 'Review merchant bKash, Nagad & Rocket payments to approve packages, reject invalid TrxIDs, or delete records.'}
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                <span className="text-slate-400">{lang === 'bn' ? 'মোট:' : 'Total:'} </span>
                <span className="font-mono font-bold text-white tabular-nums">{payments.length}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300">
                <span>{lang === 'bn' ? 'অপেক্ষমান:' : 'Pending:'} </span>
                <span className="font-mono font-bold text-amber-400 tabular-nums">{pendingPackagesCount}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                <span>{lang === 'bn' ? 'অনুমোদিত:' : 'Approved:'} </span>
                <span className="font-mono font-bold text-emerald-400 tabular-nums">
                  {payments.filter((p) => p.status === 'verified').length}
                </span>
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setPackageFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  packageFilter === 'all'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'bn' ? 'সকল রিকোয়েস্ট' : 'All Requests'} ({payments.length})
              </button>

              <button
                onClick={() => setPackageFilter('pending')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  packageFilter === 'pending'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'bn' ? 'অপেক্ষমান' : 'Pending'}</span>
                <span className="font-mono font-bold text-[11px] tabular-nums">({pendingPackagesCount})</span>
              </button>

              <button
                onClick={() => setPackageFilter('verified')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  packageFilter === 'verified'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang === 'bn' ? 'অনুমোদিত' : 'Approved'}</span>
                <span className="font-mono font-bold text-[11px] tabular-nums">
                  ({payments.filter((p) => p.status === 'verified').length})
                </span>
              </button>

              <button
                onClick={() => setPackageFilter('rejected')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  packageFilter === 'rejected'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>{lang === 'bn' ? 'বাতিলকৃত' : 'Rejected'}</span>
                <span className="font-mono font-bold text-[11px] tabular-nums">
                  ({payments.filter((p) => p.status === 'rejected').length})
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={packageSearchQuery}
                onChange={(e) => setPackageSearchQuery(e.target.value)}
                placeholder={lang === 'bn' ? 'TrxID, মোবাইল বা ইমেইল খুঁজুন...' : 'Search TrxID, phone, email...'}
                className="w-full bg-slate-900 border border-slate-800 text-xs text-white pl-9 pr-8 py-2 rounded-xl outline-none focus:border-cyan-400 transition-colors placeholder:text-slate-500"
              />
              {packageSearchQuery && (
                <button
                  onClick={() => setPackageSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Package Requests Table */}
          <div className="rounded-2xl border border-slate-800 bg-[#0d1527] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold font-mono">
                  <tr>
                    <th scope="col" className="px-4 py-3.5">
                      {lang === 'bn' ? 'তারিখ ও সময়' : 'Submitted Date'}
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      {lang === 'bn' ? 'মার্চেন্ট ইমেইল' : 'Merchant'}
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      {lang === 'bn' ? 'আবেদিত প্যাকেজ ও মূল্য' : 'Requested Plan'}
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      {lang === 'bn' ? 'পেমেন্ট গেটওয়ে ও নম্বর' : 'Gateway & Sender Phone'}
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      {lang === 'bn' ? 'ট্রানজেকশন আইডি (TrxID)' : 'TrxID'}
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      {lang === 'bn' ? 'স্ট্যাটাস' : 'Status'}
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-right">
                      {lang === 'bn' ? 'এডমিন অ্যাকশন' : 'Admin Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                        <Package className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p>{lang === 'bn' ? 'কোনো প্যাকেজ রিকোয়েস্ট পাওয়া যায়নি।' : 'No package requests match criteria.'}</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => {
                      const isPending = p.status === 'pending';
                      const isVerified = p.status === 'verified';
                      const isRejected = p.status === 'rejected';

                      return (
                        <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                          {/* Date */}
                          <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px] tabular-nums whitespace-nowrap">
                            <div>
                              {new Date(p.submittedAt).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {new Date(p.submittedAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </td>

                          {/* Merchant Email */}
                          <td className="px-4 py-3.5">
                            <div className="space-y-0.5">
                              <span className="font-semibold text-white block truncate max-w-[180px]">
                                {p.userEmail || 'merchant@example.com'}
                              </span>
                              <span className="text-[10px] text-cyan-400 font-mono">
                                ID: {p.id}
                              </span>
                            </div>
                          </td>

                          {/* Requested Plan */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="space-y-0.5">
                              <span className="font-medium text-slate-200 block truncate">{p.planName}</span>
                              <span className="text-[11px] text-cyan-400 font-bold font-mono tabular-nums">
                                ৳{p.amountBDT.toLocaleString()} BDT
                              </span>
                            </div>
                          </td>

                          {/* Gateway & Sender */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                                    p.paymentMethod === 'bkash'
                                      ? 'bg-pink-950/70 border border-pink-500/40 text-pink-400'
                                      : p.paymentMethod === 'nagad'
                                      ? 'bg-orange-950/70 border border-orange-500/40 text-orange-400'
                                      : 'bg-purple-950/70 border border-purple-500/40 text-purple-400'
                                  }`}
                                >
                                  {p.paymentMethod}
                                </span>
                              </div>
                              <span className="text-slate-300 font-mono text-[11px] block">
                                {p.senderNumber}
                              </span>
                            </div>
                          </td>

                          {/* TrxID */}
                          <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px]">
                            <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded border border-slate-800 w-fit">
                              <span className="font-bold text-slate-200 tracking-wider">{p.transactionId}</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(p.transactionId);
                                  showFeedback(
                                    lang === 'bn' ? 'TrxID কপি করা হয়েছে!' : 'TrxID copied to clipboard!',
                                    'info'
                                  );
                                }}
                                className="text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer"
                                title="Copy TrxID"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {isPending && (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-950/50 border border-amber-500/40 text-amber-300">
                                <Clock className="w-3.5 h-3.5 text-amber-400" />
                                <span>{lang === 'bn' ? 'অপেক্ষমান' : 'Pending'}</span>
                              </div>
                            )}
                            {isVerified && (
                              <div className="space-y-0.5">
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-950/50 border border-emerald-500/40 text-emerald-300">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>{lang === 'bn' ? 'অনুমোদিত' : 'Approved'}</span>
                                </div>
                                {p.customLimitGranted && (
                                  <span className="block text-[10px] text-cyan-300 font-mono">
                                    Limit: {p.customLimitGranted.toLocaleString()} checks
                                  </span>
                                )}
                              </div>
                            )}
                            {isRejected && (
                              <div className="space-y-0.5">
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-950/50 border border-rose-500/40 text-rose-300">
                                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                                  <span>{lang === 'bn' ? 'বাতিলকৃত' : 'Rejected'}</span>
                                </div>
                                {p.rejectionReason && (
                                  <span className="block text-[10px] text-slate-400 max-w-[140px] truncate" title={p.rejectionReason}>
                                    {p.rejectionReason}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* APPROVE ACTION */}
                              {isPending && (
                                <button
                                  onClick={() => handleOpenApprovePackage(p)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm shadow-emerald-500/20 transition-all cursor-pointer"
                                  title={lang === 'bn' ? 'প্যাকেজ অনুমোদন ও লিমিট যোগ করুন' : 'Approve package & assign checks'}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{lang === 'bn' ? 'অনুমোদন' : 'Approve'}</span>
                                </button>
                              )}

                              {/* REJECT ACTION */}
                              {isPending && (
                                <button
                                  onClick={() => handleOpenRejectPackage(p)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-rose-300 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 rounded-lg transition-all cursor-pointer"
                                  title={lang === 'bn' ? 'রিকোয়েস্ট বাতিল করুন' : 'Reject request'}
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>{lang === 'bn' ? 'বাতিল' : 'Reject'}</span>
                                </button>
                              )}

                              {/* RE-APPROVE FOR REJECTED */}
                              {isRejected && (
                                <button
                                  onClick={() => handleOpenApprovePackage(p)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 rounded-lg transition-all cursor-pointer"
                                  title="Re-approve package"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{lang === 'bn' ? 'অনুমোদন' : 'Approve'}</span>
                                </button>
                              )}

                              {/* DELETE RECORD ACTION */}
                              <button
                                onClick={() => handleOpenDeletePackage(p)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title={lang === 'bn' ? 'প্যাকেজ রেকর্ড মুছে ফেলুন' : 'Delete payment record'}
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
          TAB: PAYMENT HISTORY (SEARCHABLE PAST TRANSACTIONS & AUDIT TRAIL)
         ========================================================================= */}
      {adminTab === 'history' && (
        <section className="space-y-6 animate-fade-in">
          {/* Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{lang === 'bn' ? 'পেমেন্ট হিস্ট্রি ও ট্রানজেকশন রেকর্ড' : 'Payment History & Past Transactions'}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950/70 text-cyan-400 border border-cyan-500/30 font-mono">
                    {paymentHistoryRecords.length} of {payments.length} Records
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'bn'
                    ? 'সকল অতীত লেনদেন, পেমেন্ট অনুমোদনকারী এডমিন এবং অনুমোদনের নির্দিষ্ট সময়কাল।'
                    : 'Searchable ledger of all past transactions with approval timestamps and administrator usernames.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPaymentHistoryCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 rounded-xl shadow-sm transition-colors cursor-pointer"
                title="Export filtered records to CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'CSV এক্সপোর্ট' : 'Export CSV'}</span>
              </button>

              <button
                onClick={() => {
                  fetch('/api/admin/packages')
                    .then((res) => res.json())
                    .then((data) => {
                      if (Array.isArray(data)) setPayments(data);
                    })
                    .catch(() => {});
                  showFeedback(lang === 'bn' ? 'হিস্ট্রি রিফ্রেশ করা হয়েছে।' : 'History refreshed.', 'info');
                }}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors cursor-pointer"
                title="Refresh history"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#0d1527] border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 block">{lang === 'bn' ? 'মোট লেনদেন' : 'Total Submissions'}</span>
              <span className="text-xl sm:text-2xl font-extrabold text-white font-mono tabular-nums">{historyMetrics.total}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#0d1527] border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 block">{lang === 'bn' ? 'অনুমোদিত রেভিনিউ' : 'Verified Revenue'}</span>
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono tabular-nums">৳{historyMetrics.totalApprovedRevenue.toLocaleString()}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#0d1527] border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 block">{lang === 'bn' ? 'অনুমোদিত' : 'Approved'}</span>
              <span className="text-xl sm:text-2xl font-extrabold text-cyan-400 font-mono tabular-nums">{historyMetrics.verifiedCount}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#0d1527] border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 block">{lang === 'bn' ? 'বাতিলকৃত' : 'Rejected'}</span>
              <span className="text-xl sm:text-2xl font-extrabold text-rose-400 font-mono tabular-nums">{historyMetrics.rejectedCount}</span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="p-4 rounded-2xl bg-[#0d1527] border border-slate-800 space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  placeholder={lang === 'bn' ? 'TrxID, প্রেরক নম্বর, ইমেইল, এডমিন ইউজারনেম...' : 'Search TrxID, sender phone, email, admin username...'}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 font-mono"
                />
                {historySearchQuery && (
                  <button
                    onClick={() => setHistorySearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filters */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium">
                {(['all', 'verified', 'pending', 'rejected'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setHistoryStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer capitalize ${
                      historyStatusFilter === st
                        ? st === 'verified'
                          ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                          : st === 'rejected'
                          ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
                          : st === 'pending'
                          ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st === 'all'
                      ? (lang === 'bn' ? 'সকল' : 'All')
                      : st === 'verified'
                      ? (lang === 'bn' ? 'অনুমোদিত' : 'Approved')
                      : st === 'pending'
                      ? (lang === 'bn' ? 'অপেক্ষমান' : 'Pending')
                      : (lang === 'bn' ? 'বাতিল' : 'Rejected')}
                  </button>
                ))}
              </div>

              {/* Payment Method Filter */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
                {(['all', 'bkash', 'nagad', 'rocket'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setHistoryMethodFilter(m)}
                    className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors uppercase ${
                      historyMethodFilter === m
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {m === 'all' ? (lang === 'bn' ? 'মেথড' : 'All MFS') : m}
                  </button>
                ))}
              </div>

              {/* Sort Order */}
              <select
                value={historySortOrder}
                onChange={(e) => setHistorySortOrder(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl outline-none focus:border-cyan-400 cursor-pointer font-mono"
              >
                <option value="newest">{lang === 'bn' ? 'নতুন আগে' : 'Newest First'}</option>
                <option value="oldest">{lang === 'bn' ? 'পুরনো আগে' : 'Oldest First'}</option>
                <option value="highest_amount">{lang === 'bn' ? 'সর্বোচ্চ টাকা' : 'Highest Amount'}</option>
              </select>
            </div>
          </div>

          {/* Searchable Payment History Table */}
          <div className="rounded-2xl border border-slate-800 bg-[#0d1527] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-mono font-semibold">
                  <tr>
                    <th className="px-4 py-3.5">TrxID ও মেথড</th>
                    <th className="px-4 py-3.5">প্যাকেজ ও পরিমাণ</th>
                    <th className="px-4 py-3.5">মার্চেন্ট ও প্রেরক নম্বর</th>
                    <th className="px-4 py-3.5">স্ট্যাটাস</th>
                    <th className="px-4 py-3.5">সাবমিটের সময়</th>
                    <th className="px-4 py-3.5">অনুমোদনের সময়কাল</th>
                    <th className="px-4 py-3.5">অনুমোদনকারী এডমিন</th>
                    <th className="px-4 py-3.5">লিমিট / নোট</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {paymentHistoryRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-16 text-center text-slate-500">
                        <div className="max-w-xs mx-auto space-y-2">
                          <History className="w-8 h-8 text-slate-600 mx-auto" />
                          <p className="text-sm font-semibold text-slate-400">
                            {lang === 'bn' ? 'কোনো পেমেন্ট হিস্ট্রি পাওয়া যায়নি' : 'No matching payment records found'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {lang === 'bn' ? 'অনুগ্রহ করে সার্চ কুয়েরি বা ফিল্টার পরিবর্তন করুন।' : 'Try adjusting your search query or status filter.'}
                          </p>
                          {(historySearchQuery || historyStatusFilter !== 'all' || historyMethodFilter !== 'all') && (
                            <button
                              onClick={() => {
                                setHistorySearchQuery('');
                                setHistoryStatusFilter('all');
                                setHistoryMethodFilter('all');
                              }}
                              className="mt-2 text-xs text-cyan-400 hover:underline cursor-pointer"
                            >
                              {lang === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset Filters'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paymentHistoryRecords.map((p) => {
                      const isVerified = p.status === 'verified';
                      const isPending = p.status === 'pending';
                      const isRejected = p.status === 'rejected';

                      // Gateway badge styling
                      const methodBadge =
                        p.paymentMethod === 'bkash'
                          ? { bg: 'bg-pink-950/50 text-pink-300 border-pink-500/40', label: 'bKash' }
                          : p.paymentMethod === 'nagad'
                          ? { bg: 'bg-orange-950/50 text-orange-300 border-orange-500/40', label: 'Nagad' }
                          : { bg: 'bg-purple-950/50 text-purple-300 border-purple-500/40', label: 'Rocket' };

                      // Administrator info
                      const actingAdminUsername = p.approvedBy || p.rejectedBy || (isVerified ? 'naeem@webxpress.com.bd' : null);

                      return (
                        <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                          {/* TrxID & Gateway */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono border ${methodBadge.bg}`}>
                                {methodBadge.label}
                              </span>
                              <div className="flex items-center gap-1 font-mono font-bold text-white text-xs">
                                <span>{p.transactionId}</span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(p.transactionId);
                                    showFeedback('TrxID copied!', 'info');
                                  }}
                                  className="p-1 rounded text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer"
                                  title="Copy TrxID"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* Package & Amount */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="font-semibold text-white block text-xs">{p.planName}</span>
                            <span className="text-xs font-mono font-bold text-emerald-400">৳{p.amountBDT?.toLocaleString()}</span>
                          </td>

                          {/* Merchant & Sender */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="text-xs text-slate-200 block font-mono">{p.userEmail || 'merchant@example.com'}</span>
                            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-500" />
                              {p.senderNumber}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {isVerified && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 font-mono">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                <span>{lang === 'bn' ? 'অনুমোদিত' : 'Verified'}</span>
                              </span>
                            )}
                            {isPending && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-950/70 text-amber-300 border border-amber-500/40 font-mono">
                                <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                                <span>{lang === 'bn' ? 'অপেক্ষমান' : 'Pending'}</span>
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-950/70 text-rose-300 border border-rose-500/40 font-mono">
                                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                                <span>{lang === 'bn' ? 'বাতিলকৃত' : 'Rejected'}</span>
                              </span>
                            )}
                          </td>

                          {/* Submission Date */}
                          <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] text-slate-400">
                            <div>
                              {new Date(p.submittedAt).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {new Date(p.submittedAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </td>

                          {/* Approval Timestamp */}
                          <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px]">
                            {p.approvedAt ? (
                              <div className="text-emerald-300">
                                <div className="font-semibold">
                                  {new Date(p.approvedAt).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </div>
                                <div className="text-[10px] text-emerald-400/70">
                                  {new Date(p.approvedAt).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                  })}
                                </div>
                              </div>
                            ) : p.rejectedAt ? (
                              <div className="text-rose-300">
                                <div>
                                  {new Date(p.rejectedAt).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </div>
                                <div className="text-[10px] text-rose-400/70">
                                  {new Date(p.rejectedAt).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                              </div>
                            ) : (
                              <span className="text-amber-400/70 font-sans text-xs italic">
                                {lang === 'bn' ? 'অ্যাডমিন অনুমোদনের অপেক্ষায়' : 'Awaiting Review'}
                              </span>
                            )}
                          </td>

                          {/* Administrator Username */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {actingAdminUsername ? (
                              <div className="flex items-center gap-1.5">
                                <div className="p-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                  <span className="font-mono text-xs font-semibold text-white block">
                                    {actingAdminUsername}
                                  </span>
                                  <span className="text-[10px] text-cyan-400 font-mono">
                                    {isVerified ? 'Verified by Admin' : 'Rejected by Admin'}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-500 font-mono text-xs">—</span>
                            )}
                          </td>

                          {/* Limit / Notes */}
                          <td className="px-4 py-3.5 text-xs text-slate-300 max-w-xs">
                            {p.customLimitGranted && (
                              <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] block w-fit">
                                +{p.customLimitGranted.toLocaleString()} checks
                              </span>
                            )}
                            {p.rejectionReason && (
                              <span className="text-[11px] text-rose-300 font-medium block truncate" title={p.rejectionReason}>
                                {p.rejectionReason}
                              </span>
                            )}
                            {!p.customLimitGranted && !p.rejectionReason && (
                              <span className="text-slate-500 font-mono text-[11px]">—</span>
                            )}
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
          TAB: DASHBOARD STATISTICS & RECHARTS ANALYTICS
         ========================================================================= */}
      {adminTab === 'analytics' && (
        <section className="space-y-6 animate-fade-in">
          <DashboardStatistics users={users} payments={payments} lang={lang} />
        </section>
      )}

      {/* =========================================================================
          TAB: SMARTPOS MULTI-API KEY POOL & AUTOMATIC FAILOVER
         ========================================================================= */}
      {adminTab === 'smartpos' && (
        <section className="space-y-6 animate-fade-in">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{lang === 'bn' ? 'SmartPOS মাল্টি-কী অটো-রোলওভার পুল' : 'SmartPOS Multi-API Key Failover Pool'}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950/70 text-cyan-400 border border-cyan-500/30 font-mono">
                      {smartposPoolSummary.totalCapacity.toLocaleString()} Quota Pool
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {lang === 'bn'
                      ? 'প্রতিটি SmartPOS API কী-এর মাসিক ১,০০০ চেক লিমিট রয়েছে। ১,০০০ লিমিট পূর্ণ হলে বা কোটা এরর এলে ট্রাফিক স্বয়ংক্রিয়ভাবে পরবর্তী কী-তে রোলওভার হবে।'
                      : 'Each SmartPOS API key has a 1,000 checks/month limit. Traffic automatically cascades to the next key when limit or quota error occurs.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handleSimulateRollover}
                disabled={isSimulatingRollover || !smartposPoolSummary.activeServingKey}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-amber-300 bg-amber-950/50 hover:bg-amber-900/60 border border-amber-500/40 rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title={lang === 'bn' ? '১,০০০ লিমিট পূর্ণ হওয়া সিমুলেট করুন' : 'Simulate 1,000 exhaustion and test rollover'}
              >
                <Shuffle className={`w-3.5 h-3.5 ${isSimulatingRollover ? 'animate-spin' : ''}`} />
                <span>
                  {isSimulatingRollover
                    ? (lang === 'bn' ? 'রোলওভার হচ্ছে...' : 'Rolling over...')
                    : (lang === 'bn' ? 'রোলওভার টেস্ট করুন' : 'Test Auto-Rollover')}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddKeyModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-xl shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{lang === 'bn' ? 'নতুন কী যোগ করুন' : 'Add API Key'}</span>
              </button>
            </div>
          </div>

          {/* KPI Summary Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Active Serving Key */}
            <div className="p-4 rounded-xl bg-[#0d1527] border border-cyan-500/30 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{lang === 'bn' ? 'বর্তমান সক্রিয় সার্ভিং কী' : 'Active Serving Key'}</span>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-base font-bold text-white block truncate">
                  {smartposPoolSummary.activeServingKey ? smartposPoolSummary.activeServingKey.name : (lang === 'bn' ? 'কোনো কী সক্রিয় নেই' : 'No Active Key')}
                </span>
                <span className="text-[11px] text-cyan-300 font-mono block">
                  {smartposPoolSummary.activeServingKey
                    ? `https://${smartposPoolSummary.activeServingKey.domain || 'api.smartpos.com.bd'}`
                    : (lang === 'bn' ? 'লোকাল ফ্রড ডাটাবেস সক্রিয়' : 'Using Local Dispute DB')}
                </span>
              </div>
              <p className="text-[11px] text-emerald-400 font-medium">
                {smartposPoolSummary.activeServingKey
                  ? `${Math.max(0, smartposPoolSummary.activeServingKey.monthlyLimit - smartposPoolSummary.activeServingKey.usageCount).toLocaleString()} checks left on this key`
                  : 'Fallback to verified community fraud engine'}
              </p>
            </div>

            {/* Total Pool Capacity */}
            <div className="p-4 rounded-xl bg-[#0d1527] border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 block">{lang === 'bn' ? 'মোট পুল ধারণক্ষমতা' : 'Total Pool Capacity'}</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-white font-mono tabular-nums">
                  {smartposPoolSummary.remainingChecks.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  / {smartposPoolSummary.totalCapacity.toLocaleString()} checks
                </span>
              </div>
              {/* Progress bar */}
              <div className="space-y-1">
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.round((smartposPoolSummary.usedChecks / (smartposPoolSummary.totalCapacity || 1)) * 100))}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block">
                  {smartposPoolSummary.usedChecks.toLocaleString()} used ({Math.round((smartposPoolSummary.usedChecks / (smartposPoolSummary.totalCapacity || 1)) * 100)}%)
                </span>
              </div>
            </div>

            {/* Standby Keys Ready */}
            <div className="p-4 rounded-xl bg-[#0d1527] border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 block">{lang === 'bn' ? 'স্ট্যান্ডবাই ব্যাকআপ কী' : 'Standby Backup Keys'}</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-cyan-400 font-mono tabular-nums">
                  {Math.max(0, smartposPoolSummary.activeKeysCount - 1)}
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {lang === 'bn' ? '১ম কী শেষ হলে ২য় কী স্বয়ংক্রিয় সক্রিয় হবে' : 'Cascades immediately on limit breach'}
              </p>
            </div>

            {/* Exhausted Keys */}
            <div className="p-4 rounded-xl bg-[#0d1527] border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 block">{lang === 'bn' ? '১,০০০ কোটা পূর্ণ কী' : 'Exhausted Keys'}</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-amber-400 font-mono tabular-nums">
                  {smartposPoolSummary.exhaustedKeysCount}
                </span>
                <span className="text-[11px] text-slate-400">of {smartposKeys.length} total</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {lang === 'bn' ? 'রিসেট চাপলে পুনরায় ১,০০০ চেক পাওয়া যাবে' : 'Click reset to restore 1,000 quota'}
              </p>
            </div>
          </div>

          {/* =========================================================================
              NEW SECTION MODULE: INPUT FORM TO ADD MULTIPLE API KEYS
             ========================================================================= */}
          <div className="rounded-2xl bg-[#0d1527] border border-cyan-500/30 overflow-hidden shadow-xl transition-all">
            {/* Form Header / Collapse Bar */}
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>{lang === 'bn' ? 'মাল্টিপল SmartPOS API কী ইনপুট ফরম' : 'Add Multiple SmartPOS API Keys'}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950/70 text-cyan-400 border border-cyan-500/30 font-mono">
                      Bulk Key Importer
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {lang === 'bn'
                      ? 'একসাথে একাধিক API কী পুলে যোগ করুন। প্রতিটির জন্য ১,০০০ চেক লিমিট স্বয়ংক্রিয়ভাবে কার্যকর হবে।'
                      : 'Configure multiple SmartPOS API keys simultaneously for auto-failover and pool capacity expansion.'}
                  </p>
                </div>
              </div>

              {/* Mode Switcher & Collapse Toggle */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setMultiKeyMode('rows');
                      setIsMultiKeyFormOpen(true);
                    }}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      multiKeyMode === 'rows'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang === 'bn' ? 'ডাইনামিক ফিল্ডস' : 'Key Rows Form'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMultiKeyMode('bulk');
                      setIsMultiKeyFormOpen(true);
                    }}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      multiKeyMode === 'bulk'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang === 'bn' ? 'বাল্ক টেক্সট পেস্ট' : 'Bulk Paste'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMultiKeyFormOpen(!isMultiKeyFormOpen)}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                  title={isMultiKeyFormOpen ? 'Collapse form' : 'Expand form'}
                >
                  {isMultiKeyFormOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Form Body */}
            {isMultiKeyFormOpen && (
              <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
                {/* MODE 1: DYNAMIC ROWS FORM */}
                {multiKeyMode === 'rows' && (
                  <form onSubmit={handleSubmitMultiKeyRows} className="space-y-4">
                    <div className="space-y-3">
                      {multiKeyRows.map((row, index) => (
                        <div
                          key={row.id}
                          className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3"
                        >
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center">
                              #{index + 1}
                            </span>
                          </div>

                          {/* Key Name / Label */}
                          <div className="flex-1 min-w-[150px]">
                            <label className="text-[11px] text-slate-400 block mb-1 font-medium sm:hidden">
                              {lang === 'bn' ? 'কী নাম' : 'Key Label'}
                            </label>
                            <input
                              type="text"
                              value={row.name}
                              onChange={(e) => handleUpdateMultiKeyRow(row.id, 'name', e.target.value)}
                              placeholder={`SmartPOS Key #${smartposKeys.length + index + 1}`}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                            />
                          </div>

                          {/* API Key Token */}
                          <div className="flex-2 min-w-[220px]">
                            <label className="text-[11px] text-slate-400 block mb-1 font-medium sm:hidden">
                              {lang === 'bn' ? 'API কী টোকেন *' : 'API Key Token *'}
                            </label>
                            <div className="relative">
                              <Key className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                value={row.apiKey}
                                onChange={(e) => handleUpdateMultiKeyRow(row.id, 'apiKey', e.target.value)}
                                placeholder="fraud_vRSyppIMF080gu4VE1TYRDqHs..."
                                required={index === 0}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 font-mono"
                              />
                            </div>
                          </div>

                          {/* Custom Domain */}
                          <div className="flex-1 min-w-[140px]">
                            <label className="text-[11px] text-slate-400 block mb-1 font-medium sm:hidden">
                              {lang === 'bn' ? 'ডোমেইন (ঐচ্ছিক)' : 'Domain (Optional)'}
                            </label>
                            <input
                              type="text"
                              value={row.domain}
                              onChange={(e) => handleUpdateMultiKeyRow(row.id, 'domain', e.target.value)}
                              placeholder="api.smartpos.com.bd"
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 font-mono"
                            />
                          </div>

                          {/* Monthly Limit */}
                          <div className="w-full sm:w-28 shrink-0">
                            <label className="text-[11px] text-slate-400 block mb-1 font-medium sm:hidden">
                              {lang === 'bn' ? 'মাসিক লিমিট' : 'Monthly Limit'}
                            </label>
                            <input
                              type="number"
                              min="100"
                              max="100000"
                              value={row.monthlyLimit}
                              onChange={(e) =>
                                handleUpdateMultiKeyRow(row.id, 'monthlyLimit', Number(e.target.value))
                              }
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-400 font-mono font-bold text-center"
                            />
                          </div>

                          {/* Remove Row Button */}
                          <div className="flex justify-end sm:justify-center shrink-0">
                            <button
                              type="button"
                              onClick={() => handleRemoveMultiKeyRow(row.id)}
                              disabled={multiKeyRows.length <= 1}
                              className={`p-2 rounded-lg transition-colors ${
                                multiKeyRows.length <= 1
                                  ? 'text-slate-700 cursor-not-allowed'
                                  : 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 cursor-pointer'
                              }`}
                              title="Remove row"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Form Bottom Bar: Add Row & Submit All */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={handleAddMultiKeyRow}
                        className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 rounded-xl transition-all cursor-pointer w-fit"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? '+ আরেকটি কী রো যোগ করুন' : '+ Add Another Key Row'}</span>
                      </button>

                      <div className="flex items-center gap-2.5">
                        <span className="text-xs text-slate-400 hidden md:inline">
                          {lang === 'bn'
                            ? `পুলের মোট ধারণক্ষমতা +${(multiKeyRows.filter((r) => r.apiKey.trim().length > 0).length * 1000).toLocaleString()} বৃদ্ধি পাবে`
                            : `Adds +${(multiKeyRows.filter((r) => r.apiKey.trim().length > 0).length * 1000).toLocaleString()} checks to capacity`}
                        </span>

                        <button
                          type="submit"
                          disabled={isSubmittingMultiKeys}
                          className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          <span>
                            {isSubmittingMultiKeys
                              ? (lang === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving keys...')
                              : (lang === 'bn'
                                  ? `সবগুলো কী পুলে যুক্ত করুন (${multiKeyRows.filter((r) => r.apiKey.trim().length > 0).length})`
                                  : `Add All Keys to Pool (${multiKeyRows.filter((r) => r.apiKey.trim().length > 0).length})`)}
                          </span>
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* MODE 2: BULK RAW TEXT PASTE */}
                {multiKeyMode === 'bulk' && (
                  <form onSubmit={handleSubmitBulkPaste} className="space-y-4 text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-slate-300 font-medium">
                          {lang === 'bn' ? 'প্রতি লাইনে একটি করে API কী পেস্ট করুন' : 'Paste API Keys (One per line)'}
                        </label>
                        <span className="text-[11px] text-slate-500">
                          Format: [Key Name, API_KEY, Domain, Limit] or just [API_KEY]
                        </span>
                      </div>
                      <textarea
                        rows={5}
                        value={bulkPasteText}
                        onChange={(e) => setBulkPasteText(e.target.value)}
                        placeholder={`fraud_vRSyppIMF080gu4VE1TYRDqHsYIPL0Ms\nfraud_k982j3h4g5f6d7s8a9q0w1e2r3t4y5u6\nAccount 3 Backup, fraud_m1n2b3v4c5x6z7l8k9j0h1g2f3d4s5a6, api.smartpos.com.bd, 1000`}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white placeholder-slate-600 outline-none focus:border-cyan-400 font-mono text-xs leading-relaxed"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                      <p className="text-[11px] text-slate-400">
                        {lang === 'bn'
                          ? 'প্রতিটি কী-এর জন্য ডিফল্ট ১,০০০ মাসিক লিমিট সহ পুলে যোগ করা হবে।'
                          : 'Each recognized key expands pool capacity by 1,000 monthly checks.'}
                      </p>

                      <button
                        type="submit"
                        disabled={isSubmittingMultiKeys || !bulkPasteText.trim()}
                        className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>
                          {isSubmittingMultiKeys
                            ? (lang === 'bn' ? 'ইমপোর্ট হচ্ছে...' : 'Importing...')
                            : (lang === 'bn' ? 'সবগুলো কী ইমপোর্ট করুন' : 'Import All API Keys')}
                        </span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* =========================================================================
              LIST VIEW DISPLAYING ALL KEYS & ACTIVATION TOGGLE SWITCHES
             ========================================================================= */}
          <div className="space-y-4">
            {/* Header & View Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-cyan-400" />
                  <span>{lang === 'bn' ? 'কনফিগার করা SmartPOS API কী তালিকা' : 'Configured SmartPOS API Key Pool'}</span>
                  <span className="text-xs text-slate-500 font-normal">
                    ({smartposKeys.length} keys · {smartposPoolSummary.activeKeysCount} active)
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'bn'
                    ? 'যেকোনো কী সক্রিয় বা নিষ্ক্রিয় করতে সরাসরি টগল সুইচ (Toggle Switch) ব্যবহার করুন।'
                    : 'Use the interactive toggle switch to instantly activate or deactivate specific API keys.'}
                </p>
              </div>

              {/* View Switcher: List vs Grid */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setSmartposViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    smartposViewMode === 'list'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'লিস্ট ভিউ' : 'List View'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSmartposViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    smartposViewMode === 'grid'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'গ্রিড কার্ডস' : 'Grid Cards'}</span>
                </button>
              </div>
            </div>

            {/* TABULAR LIST VIEW (DEFAULT) */}
            {smartposViewMode === 'list' && (
              <div className="rounded-2xl bg-[#0d1527] border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800/80 bg-slate-900/60 text-slate-400 font-semibold">
                        <th className="px-4 py-3.5 whitespace-nowrap">{lang === 'bn' ? 'অগ্রাধিকার / ট্রাফিক' : '# / Traffic'}</th>
                        <th className="px-4 py-3.5 whitespace-nowrap">{lang === 'bn' ? 'কী বিবরণ' : 'Key Details'}</th>
                        <th className="px-4 py-3.5 whitespace-nowrap">{lang === 'bn' ? 'API কী টোকেন' : 'API Key Token'}</th>
                        <th className="px-4 py-3.5 whitespace-nowrap">{lang === 'bn' ? 'মাসিক ব্যবহার ও লিমিট' : 'Quota & Usage'}</th>
                        <th className="px-4 py-3.5 whitespace-nowrap">{lang === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                        <th className="px-4 py-3.5 text-center whitespace-nowrap">
                          {lang === 'bn' ? 'সক্রিয় / নিষ্ক্রিয় টগল' : 'Activate / Deactivate'}
                        </th>
                        <th className="px-4 py-3.5 text-right whitespace-nowrap">{lang === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-800/60">
                      {smartposKeys.map((k, index) => {
                        const isServing = smartposPoolSummary.activeServingKey?.id === k.id;
                        const percentUsed = Math.min(100, Math.round((k.usageCount / k.monthlyLimit) * 100));
                        const remaining = Math.max(0, k.monthlyLimit - k.usageCount);
                        const isExhausted = k.status === 'exhausted' || k.usageCount >= k.monthlyLimit;
                        const isDisabled = k.status === 'disabled';

                        return (
                          <tr
                            key={k.id}
                            className={`hover:bg-slate-900/40 transition-colors ${
                              isServing ? 'bg-emerald-950/15' : isDisabled ? 'opacity-65' : ''
                            }`}
                          >
                            {/* # / Serving Indicator */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-slate-400">#{index + 1}</span>
                                {isServing ? (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                                    </span>
                                    <span>{lang === 'bn' ? 'সার্ভিং' : 'Serving'}</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    {isDisabled
                                      ? (lang === 'bn' ? 'বন্ধ' : 'Paused')
                                      : isExhausted
                                      ? (lang === 'bn' ? 'কোটা শেষ' : 'Capped')
                                      : (lang === 'bn' ? 'স্ট্যান্ডবাই' : 'Standby')}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Key Details */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <div className="space-y-0.5">
                                <span className="font-bold text-white text-xs block">{k.name}</span>
                                <span className="text-[11px] text-slate-400 font-mono block">
                                  https://{k.domain || 'api.smartpos.com.bd'}
                                </span>
                              </div>
                            </td>

                            {/* Masked Token */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950 border border-slate-800">
                                <Key className="w-3 h-3 text-slate-500 shrink-0" />
                                <span className="font-mono text-[11px] text-slate-300">
                                  {k.apiKey.length > 14
                                    ? `${k.apiKey.slice(0, 8)}••••${k.apiKey.slice(-4)}`
                                    : '••••••••••••'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(k.apiKey);
                                    showFeedback(lang === 'bn' ? 'API কী কপি করা হয়েছে!' : 'API key copied!', 'info');
                                  }}
                                  className="text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer"
                                  title="Copy Key"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </td>

                            {/* Quota Progress */}
                            <td className="px-4 py-3.5 whitespace-nowrap min-w-[180px]">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-mono text-white font-semibold tabular-nums">
                                    {k.usageCount.toLocaleString()} / {k.monthlyLimit.toLocaleString()}
                                  </span>
                                  <span
                                    className={`font-mono text-[10px] ${
                                      remaining <= 50
                                        ? 'text-rose-400 font-bold'
                                        : remaining <= 250
                                        ? 'text-amber-400'
                                        : 'text-emerald-400'
                                    }`}
                                  >
                                    {remaining.toLocaleString()} left
                                  </span>
                                </div>

                                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                                  <div
                                    className={`h-full transition-all duration-500 rounded-full ${
                                      percentUsed >= 95 || isExhausted
                                        ? 'bg-rose-500'
                                        : percentUsed >= 75
                                        ? 'bg-amber-400'
                                        : 'bg-emerald-400'
                                    }`}
                                    style={{ width: `${percentUsed}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Status Badge */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              {isServing ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                                  <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                                  <span>{lang === 'bn' ? 'লাইভ সক্রিয়' : 'Live Active'}</span>
                                </span>
                              ) : isExhausted ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950/60 border border-amber-500/40 text-amber-300">
                                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                                  <span>{lang === 'bn' ? '১,০০০ কোটা শেষ' : 'Limit Exhausted'}</span>
                                </span>
                              ) : isDisabled ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 border border-slate-700 text-slate-400">
                                  <Ban className="w-3 h-3 text-slate-500 shrink-0" />
                                  <span>{lang === 'bn' ? 'নিষ্ক্রিয়' : 'Deactivated'}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-950/50 border border-blue-500/40 text-blue-300">
                                  <Clock className="w-3 h-3 text-blue-400 shrink-0" />
                                  <span>{lang === 'bn' ? 'স্ট্যান্ডবাই রেডি' : 'Standby Ready'}</span>
                                </span>
                              )}
                            </td>

                            {/* TOGGLE SWITCH TO ACTIVATE / DEACTIVATE */}
                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                              <div className="flex flex-col items-center justify-center gap-1">
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={!isDisabled}
                                  onClick={() => handleToggleSmartposKey(k)}
                                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500/40 ${
                                    !isDisabled ? 'bg-emerald-500 shadow-md shadow-emerald-950/40' : 'bg-slate-700'
                                  }`}
                                  title={!isDisabled ? 'Click to deactivate key' : 'Click to activate key'}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                      !isDisabled ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                  />
                                </button>
                                <span className={`text-[10px] font-semibold ${!isDisabled ? 'text-emerald-400' : 'text-slate-400'}`}>
                                  {!isDisabled ? (lang === 'bn' ? 'সক্রিয়' : 'Active') : (lang === 'bn' ? 'বন্ধ' : 'Deactivated')}
                                </span>
                              </div>
                            </td>

                            {/* Action Buttons */}
                            <td className="px-4 py-3.5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Reset Quota Counter */}
                                <button
                                  type="button"
                                  onClick={() => handleResetSmartposKey(k.id)}
                                  className="p-1.5 rounded-lg text-emerald-400 bg-emerald-950/30 hover:bg-emerald-900/60 border border-emerald-500/30 transition-all cursor-pointer"
                                  title={lang === 'bn' ? 'কাউন্টার ০ তে রিসেট করুন' : 'Reset usage counter'}
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>

                                {/* Edit Limit */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingSmartposKey(k);
                                    setEditKeyMonthlyLimit(k.monthlyLimit);
                                    setEditKeyStatus(k.status);
                                  }}
                                  className="p-1.5 rounded-lg text-cyan-300 bg-cyan-950/30 hover:bg-cyan-900/60 border border-cyan-500/30 transition-all cursor-pointer"
                                  title="Edit key limit & settings"
                                >
                                  <Sliders className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete */}
                                <button
                                  type="button"
                                  onClick={() => setKeyToDelete(k)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                                  title="Delete key"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* GRID CARDS VIEW (ALTERNATIVE VIEW) */}
            {smartposViewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
                {smartposKeys.map((k, index) => {
                  const isServing = smartposPoolSummary.activeServingKey?.id === k.id;
                  const percentUsed = Math.min(100, Math.round((k.usageCount / k.monthlyLimit) * 100));
                  const remaining = Math.max(0, k.monthlyLimit - k.usageCount);
                  const isExhausted = k.status === 'exhausted' || k.usageCount >= k.monthlyLimit;
                  const isDisabled = k.status === 'disabled';

                  return (
                    <div
                      key={k.id}
                      className={`p-5 rounded-2xl border transition-all space-y-4 relative ${
                        isServing
                          ? 'bg-[#0b162c] border-emerald-500/50 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/30'
                          : isDisabled
                          ? 'bg-slate-900/60 border-slate-800 opacity-70'
                          : isExhausted
                          ? 'bg-[#150d15] border-amber-500/40'
                          : 'bg-[#0d1527] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Top Row: Name & Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                              #{index + 1}
                            </span>
                            <h4 className="font-bold text-white text-sm tracking-tight">{k.name}</h4>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono block">
                            https://{k.domain || 'api.smartpos.com.bd'}
                          </span>
                        </div>

                        {/* Status Badges */}
                        <div>
                          {isServing ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                              </span>
                              <span>{lang === 'bn' ? 'লাইভ সার্ভিং' : 'Live Serving'}</span>
                            </div>
                          ) : isExhausted ? (
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              <span>{lang === 'bn' ? 'কোটা পূর্ণ' : 'Exhausted'}</span>
                            </div>
                          ) : isDisabled ? (
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                              <Ban className="w-3.5 h-3.5 shrink-0" />
                              <span>{lang === 'bn' ? 'নিষ্ক্রিয়' : 'Deactivated'}</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">
                              <Clock className="w-3.5 h-3.5 shrink-0" />
                              <span>{lang === 'bn' ? 'স্ট্যান্ডবাই' : 'Standby'}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Masked API Token with Copy */}
                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Key className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="font-mono text-xs text-slate-300 truncate">
                            {k.apiKey.length > 14
                              ? `${k.apiKey.slice(0, 8)}••••••••${k.apiKey.slice(-4)}`
                              : '••••••••••••'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(k.apiKey);
                            showFeedback(lang === 'bn' ? 'API কী কপি করা হয়েছে!' : 'API key copied!', 'info');
                          }}
                          className="p-1 rounded text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer shrink-0"
                          title="Copy API Key"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Visual Usage Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-medium">
                            {lang === 'bn' ? 'মাসিক চেক ব্যবহার' : 'Monthly Usage'}
                          </span>
                          <span className="font-mono font-bold text-white tabular-nums">
                            {k.usageCount.toLocaleString()} / {k.monthlyLimit.toLocaleString()}
                          </span>
                        </div>

                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              percentUsed >= 95 || isExhausted
                                ? 'bg-gradient-to-r from-rose-500 to-red-600'
                                : percentUsed >= 75
                                ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                                : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                            }`}
                            style={{ width: `${percentUsed}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-mono">{percentUsed}% utilized</span>
                          <span
                            className={`font-mono font-semibold ${
                              remaining <= 50 ? 'text-rose-400' : remaining <= 250 ? 'text-amber-400' : 'text-emerald-400'
                            }`}
                          >
                            {remaining.toLocaleString()} {lang === 'bn' ? 'চেক বাকি' : 'remaining'}
                          </span>
                        </div>
                      </div>

                      {/* Error / Rollover notice if any */}
                      {k.lastError && (
                        <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-[11px] text-rose-300 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                          <span className="leading-tight">{k.lastError}</span>
                        </div>
                      )}

                      {/* Action Bar with Toggle Switch */}
                      <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-800/80">
                        {/* TOGGLE SWITCH */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={!isDisabled}
                            onClick={() => handleToggleSmartposKey(k)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              !isDisabled ? 'bg-emerald-500' : 'bg-slate-700'
                            }`}
                            title={!isDisabled ? 'Deactivate key' : 'Activate key'}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                !isDisabled ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span className={`text-[11px] font-semibold ${!isDisabled ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {!isDisabled ? (lang === 'bn' ? 'সক্রিয়' : 'Active') : (lang === 'bn' ? 'বন্ধ' : 'Off')}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Recharge / Reset */}
                          <button
                            type="button"
                            onClick={() => handleResetSmartposKey(k.id)}
                            className="p-1.5 text-xs text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 rounded-lg transition-all cursor-pointer"
                            title={lang === 'bn' ? 'ব্যবহার কাউন্টার ০ তে রিসেট করুন' : 'Reset usage counter to 0'}
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Limit */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSmartposKey(k);
                              setEditKeyMonthlyLimit(k.monthlyLimit);
                              setEditKeyStatus(k.status);
                            }}
                            className="p-1.5 text-xs text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 rounded-lg transition-all cursor-pointer"
                            title="Edit key limit & status"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setKeyToDelete(k)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Delete key"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* =========================================================================
          TAB: PACKAGE PRICING & PAYMENT WALLET MANAGEMENT
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
          TAB: HARDWARE DEVICE & IP ANTI-CHEAT INSPECTOR
         ========================================================================= */}
      {adminTab === 'devices' && (
        <section className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{lang === 'bn' ? 'ডিভাইস ও আইপি অ্যান্টি-চিট কন্ট্রোল' : 'Device & IP Anti-Cheat Inspector'}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950/70 text-cyan-400 border border-cyan-500/30 font-mono">
                    {devicesList.length} Devices
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'bn'
                    ? 'ক্যানভাস ও হার্ডওয়্যার ফিঙ্গারপ্রিন্ট এবং সার্ভার আইপি দিয়ে চিটিং ও ফ্রি লিমিট বাইপাস প্রতিরোধ।'
                    : 'Server-side canvas and hardware device fingerprints preventing free-tier limit abuse.'}
                </p>
              </div>
            </div>

            <button
              onClick={fetchDevices}
              disabled={isLoadingDevices}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors cursor-pointer w-fit"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDevices ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{lang === 'bn' ? 'রিফ্রেশ করুন' : 'Refresh'}</span>
            </button>
          </div>

          {/* Device KPI Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#0d1527] border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 block">{lang === 'bn' ? 'মোট ট্র্যাককৃত ডিভাইস' : 'Tracked Devices'}</span>
              <span className="text-2xl font-extrabold text-white font-mono">{devicesList.length}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#0d1527] border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 block">{lang === 'bn' ? 'পর্যবেক্ষণাধীন আইপি' : 'Monitored IPs'}</span>
              <span className="text-2xl font-extrabold text-cyan-400 font-mono">{ipsList.length}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#0d1527] border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 block">{lang === 'bn' ? 'হোয়াইটলিস্টকৃত / অনুমোদিত' : 'Whitelisted Devices'}</span>
              <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                {devicesList.filter((d) => d.isWhitelisted || d.isApprovedByAdmin).length}
              </span>
            </div>
          </div>

          {/* Tracked Devices Table */}
          <div className="rounded-2xl border border-slate-800 bg-[#0d1527] overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                {lang === 'bn' ? 'ডিভাইস ফিঙ্গারপ্রিন্ট রেজিস্ট্রি' : 'Hardware Fingerprint Registry'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-mono font-semibold">
                  <tr>
                    <th className="px-4 py-3">ডিভাইস আইডি</th>
                    <th className="px-4 py-3">সর্বশেষ আইপি</th>
                    <th className="px-4 py-3">গেস্ট চেক (/৩)</th>
                    <th className="px-4 py-3">ফ্রি চেক (/১০০)</th>
                    <th className="px-4 py-3">সংযুক্ত অ্যাকাউন্টসমূহ</th>
                    <th className="px-4 py-3">স্ট্যাটাস</th>
                    <th className="px-4 py-3 text-right">এডমিন অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {devicesList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                        {isLoadingDevices ? 'ডিভাইস লোড হচ্ছে...' : 'কোনো ডিভাইস রেকর্ড পাওয়া যায়নি।'}
                      </td>
                    </tr>
                  ) : (
                    devicesList.map((d) => {
                      const isWhitelisted = d.isWhitelisted || d.isApprovedByAdmin;
                      const isGuestExhausted = d.guestSearches >= 3;
                      const isFreeExhausted = d.freeSearches >= 100;

                      return (
                        <tr key={d.deviceId} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3.5 font-mono text-[11px] text-cyan-300 font-semibold truncate max-w-[160px]">
                            {d.deviceId}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-slate-300">{d.lastIp || '127.0.0.1'}</td>
                          <td className="px-4 py-3.5 font-mono font-bold">
                            <span className={isGuestExhausted ? 'text-rose-400' : 'text-slate-300'}>
                              {d.guestSearches} / 3
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-mono font-bold">
                            <span className={isFreeExhausted ? 'text-amber-400' : 'text-slate-300'}>
                              {d.freeSearches} / 100
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                            {d.associatedEmails && d.associatedEmails.length > 0 ? (
                              d.associatedEmails.join(', ')
                            ) : (
                              <span className="text-slate-600">Guest Visitor</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            {isWhitelisted ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-mono">
                                Whitelisted
                              </span>
                            ) : isGuestExhausted || isFreeExhausted ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/70 border border-rose-500/40 text-rose-300 font-mono">
                                Limit Hit
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                                Active
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={async () => {
                                  try {
                                    const res = await fetch(`/api/admin/devices/${encodeURIComponent(d.deviceId)}/reset`, {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ adminEmail: currentUserEmail || 'naeem@webxpress.com.bd' }),
                                    });
                                    const data = await res.json();
                                    showFeedback(data.message || 'লিমিট রিসেট হয়েছে!', 'success');
                                    fetchDevices();
                                  } catch {}
                                }}
                                className="px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
                                title="Reset search count to 0"
                              >
                                রিসেট
                              </button>

                              {!isWhitelisted && (
                                <button
                                  onClick={async () => {
                                    try {
                                      const res = await fetch(`/api/admin/devices/${encodeURIComponent(d.deviceId)}/approve`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ adminEmail: currentUserEmail || 'naeem@webxpress.com.bd' }),
                                      });
                                      const data = await res.json();
                                      showFeedback(data.message || 'ডিভাইস অনুমোদিত!', 'success');
                                      fetchDevices();
                                    } catch {}
                                  }}
                                  className="px-2.5 py-1 text-xs font-bold bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 rounded-lg transition-colors cursor-pointer"
                                  title="Whitelist this device"
                                >
                                  হোয়াইটলিস্ট
                                </button>
                              )}
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
          TAB: ADMIN AUDIT LOG TRAIL
         ========================================================================= */}
      {adminTab === 'audit' && (
        <section className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{lang === 'bn' ? 'অ্যাডমিন অ্যাকশন অডিট লগ' : 'Admin Security & Action Audit Trail'}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950/70 text-cyan-400 border border-cyan-500/30 font-mono">
                    {auditLogs.length} Records
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'bn'
                    ? 'ম্যানুয়াল আপগ্রেড, পেমেন্ট অনুমোদন ও প্রত্যাখ্যানের সম্পূর্ণ সময়ভিত্তিক সিকিউরিটি ট্রেইল।'
                    : 'Tamper-evident audit trail recording every approval, rejection, and manual tier elevation.'}
                </p>
              </div>
            </div>

            <button
              onClick={fetchAuditLogs}
              disabled={isLoadingAuditLogs}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors cursor-pointer w-fit"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAuditLogs ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{lang === 'bn' ? 'লগ রিফ্রেশ করুন' : 'Refresh Logs'}</span>
            </button>
          </div>

          {/* Audit Log Table */}
          <div className="rounded-2xl border border-slate-800 bg-[#0d1527] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-mono font-semibold">
                  <tr>
                    <th className="px-4 py-3.5">তারিখ ও সময়</th>
                    <th className="px-4 py-3.5">অ্যাডমিন</th>
                    <th className="px-4 py-3.5">অ্যাকশন</th>
                    <th className="px-4 py-3.5">টার্গেট মার্চেন্ট / TrxID</th>
                    <th className="px-4 py-3.5">বিস্তারিত বিবরণ</th>
                    <th className="px-4 py-3.5 text-right font-mono">অ্যাডমিন আইপি</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                        {isLoadingAuditLogs ? 'অডিট লগ লোড হচ্ছে...' : 'কোনো অডিট লগ রেকর্ড পাওয়া যায়নি।'}
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => {
                      const isApproval = log.action === 'payment_approved';
                      const isRejection = log.action === 'payment_rejected';
                      const isDevice = log.action?.startsWith('device');

                      return (
                        <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3.5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                            <div>
                              {new Date(log.timestamp).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {new Date(log.timestamp).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </div>
                          </td>

                          <td className="px-4 py-3.5 font-mono font-semibold text-white whitespace-nowrap">
                            {log.adminEmail}
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                isApproval
                                  ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
                                  : isRejection
                                  ? 'bg-rose-950/70 border border-rose-500/40 text-rose-300'
                                  : isDevice
                                  ? 'bg-amber-950/70 border border-amber-500/40 text-amber-300'
                                  : 'bg-cyan-950/70 border border-cyan-500/40 text-cyan-300'
                              }`}
                            >
                              {log.actionLabel || log.action}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 font-mono text-cyan-300 whitespace-nowrap">
                            {log.targetEmail || log.targetId}
                          </td>

                          <td className="px-4 py-3.5 text-slate-300 max-w-xs leading-relaxed text-[11px]">
                            {log.details}
                          </td>

                          <td className="px-4 py-3.5 font-mono text-slate-400 text-right text-[11px] whitespace-nowrap">
                            {log.ip || '127.0.0.1'}
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

      {/* =========================================================================
          MODAL 1: EDIT USER PACKAGE & LIMIT (ADMIN OVERRIDE)
         ========================================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#0d1527] border border-cyan-500/40 p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {lang === 'bn' ? 'মার্চেন্ট প্যাকেজ ও লিমিট পরিবর্তন' : 'Edit User Package & Limit'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {editingUser.name} · <span className="font-mono text-cyan-300">{editingUser.email}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUserPlanAndLimit} className="space-y-4 text-xs">
              {/* Plan Tier Selector */}
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">
                  {lang === 'bn' ? 'সাবস্ক্রিপশন প্যাকেজ নির্ধারণ করুন *' : 'Subscription Plan Tier *'}
                </label>
                <select
                  value={editUserPlanId}
                  onChange={(e) => {
                    const newPlanId = e.target.value as 'free' | 'pro' | 'enterprise';
                    setEditUserPlanId(newPlanId);
                    if (newPlanId === 'enterprise') {
                      setEditUserPlanName('Enterprise Unlimited');
                      setEditUserChecks(99999);
                    } else if (newPlanId === 'pro') {
                      setEditUserPlanName('Merchant Pro (2,500 checks)');
                      setEditUserChecks(2500);
                    } else {
                      setEditUserPlanName('Free Starter (100 checks/mo)');
                      setEditUserChecks(100);
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl outline-none focus:border-cyan-400 font-medium"
                >
                  <option value="free">Free Starter Plan (100 checks/mo)</option>
                  <option value="pro">Merchant Pro Plan (2,500 checks/mo)</option>
                  <option value="enterprise">Enterprise Plan (Unlimited / 99,999 checks)</option>
                </select>
              </div>

              {/* Custom Plan Title / Description */}
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">
                  {lang === 'bn' ? 'প্যাকেজের প্রদর্শন নাম (Plan Display Label)' : 'Plan Display Label'}
                </label>
                <input
                  type="text"
                  value={editUserPlanName}
                  onChange={(e) => setEditUserPlanName(e.target.value)}
                  placeholder="e.g. Custom VIP Tier"
                  className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2 rounded-xl outline-none focus:border-cyan-400"
                />
              </div>

              {/* Credit Checks Remaining Input & Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold">
                    {lang === 'bn' ? 'সার্চ ক্রেডিট লিমিট (Checks Remaining) *' : 'Search Checks Limit (Checks Remaining) *'}
                  </label>
                  <span className="text-[11px] text-cyan-400 font-mono font-bold tabular-nums">
                    Current: {editingUser.checksRemaining.toLocaleString()}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="999999"
                  value={editUserChecks}
                  onChange={(e) => setEditUserChecks(Math.max(0, parseInt(e.target.value) || 0))}
                  required
                  className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl outline-none focus:border-cyan-400 font-mono text-sm font-bold"
                />

                {/* Preset Fast Adjustment Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] text-slate-500 mr-1">{lang === 'bn' ? 'কুইক সেট:' : 'Quick Set:'}</span>
                  <button
                    type="button"
                    onClick={() => setEditUserChecks(100)}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] transition-colors cursor-pointer"
                  >
                    100
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditUserChecks(500)}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] transition-colors cursor-pointer"
                  >
                    500
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditUserChecks(1000)}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] transition-colors cursor-pointer"
                  >
                    1,000
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditUserChecks(2500)}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] transition-colors cursor-pointer"
                  >
                    2,500
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditUserChecks(10000)}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] transition-colors cursor-pointer"
                  >
                    10,000
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditUserChecks(99999)}
                    className="px-2 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-mono text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    Unlimited (99,999)
                  </button>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">
                  {lang === 'bn' ? 'অ্যাকাউন্ট স্ট্যাটাস (Account Status)' : 'Account Status'}
                </label>
                <select
                  value={editUserStatus}
                  onChange={(e) => setEditUserStatus(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl outline-none focus:border-cyan-400 font-medium"
                >
                  <option value="approved">{lang === 'bn' ? 'সক্রিয় (Approved / Active)' : 'Active (Approved)'}</option>
                  <option value="pending">{lang === 'bn' ? 'অপেক্ষমান (Pending Review)' : 'Pending Review'}</option>
                  <option value="suspended">{lang === 'bn' ? 'ব্যানকৃত / স্থগিত (Banned / Suspended)' : 'Banned / Suspended'}</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-xl shadow-md shadow-cyan-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: APPROVE PACKAGE REQUEST (WITH CUSTOM LIMIT CONFIG)
         ========================================================================= */}
      {packageToApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#0d1527] border border-emerald-500/40 p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white">
                  {lang === 'bn' ? 'প্যাকেজ রিকোয়েস্ট অনুমোদন' : 'Approve Package Upgrade'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {packageToApprove.userEmail || 'Merchant'} · <span className="font-mono text-cyan-300 font-bold">{packageToApprove.planName}</span>
                </p>
              </div>
            </div>

            {/* Payment Summary Box */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{lang === 'bn' ? 'পেমেন্ট গেটওয়ে:' : 'Gateway:'}</span>
                <span className="font-mono font-bold uppercase text-white">{packageToApprove.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{lang === 'bn' ? 'প্রেরক নম্বর:' : 'Sender Phone:'}</span>
                <span className="font-mono text-slate-200">{packageToApprove.senderNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{lang === 'bn' ? 'ট্রানজেকশন আইডি:' : 'TrxID:'}</span>
                <span className="font-mono font-bold text-cyan-300">{packageToApprove.transactionId}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                <span className="text-slate-400">{lang === 'bn' ? 'পরিশোধিত মূল্য:' : 'Amount:'}</span>
                <span className="font-mono font-extrabold text-emerald-400 text-sm">৳{packageToApprove.amountBDT.toLocaleString()} BDT</span>
              </div>
            </div>

            {/* Credit Checks Allocation Input */}
            <div className="space-y-1.5 text-xs">
              <label className="text-slate-300 font-semibold block">
                {lang === 'bn' ? 'গ্রাহককে বরাদ্দকৃত সার্চ লিমিট (Checks to Grant):' : 'Checks to Grant to Merchant:'}
              </label>
              <input
                type="number"
                min="100"
                max="999999"
                value={approvalCustomLimit}
                onChange={(e) => setApprovalCustomLimit(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-xl outline-none focus:border-emerald-400 font-mono font-bold text-sm"
              />
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <button
                  type="button"
                  onClick={() => setApprovalCustomLimit(2500)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px]"
                >
                  Standard Pro (2,500)
                </button>
                <button
                  type="button"
                  onClick={() => setApprovalCustomLimit(5000)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px]"
                >
                  Bonus (5,000)
                </button>
                <button
                  type="button"
                  onClick={() => setApprovalCustomLimit(99999)}
                  className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] font-bold"
                >
                  Unlimited (99,999)
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPackageToApprove(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmApprovePackage}
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{lang === 'bn' ? 'অনুমোদন নিশ্চিত করুন' : 'Confirm & Activate'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: REJECT PACKAGE REQUEST (WITH REASON)
         ========================================================================= */}
      {packageToReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#0d1527] border border-rose-500/40 p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white">
                  {lang === 'bn' ? 'প্যাকেজ রিকোয়েস্ট বাতিল করুন' : 'Reject Package Request'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  TrxID: <span className="font-mono text-rose-300 font-bold">{packageToReject.transactionId}</span> · {packageToReject.userEmail || 'Merchant'}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-slate-300 font-semibold block">
                {lang === 'bn' ? 'বাতিলের কারণ উল্লেখ করুন:' : 'Rejection Reason (Audit Note):'}
              </label>
              <textarea
                rows={3}
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder={lang === 'bn' ? 'যেমন: ভুল TrxID বা বিকাশ অ্যাকাউন্টে টাকা জমা পাওয়া যায়নি...' : 'e.g. Invalid TrxID or funds not received...'}
                className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl outline-none focus:border-rose-400"
              />

              {/* Quick Reason Suggestions */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] text-slate-500 mr-1">{lang === 'bn' ? 'কুইক সিলেক্ট:' : 'Quick Select:'}</span>
                <button
                  type="button"
                  onClick={() => setRejectionReasonInput('ভুয়া বা ভুল TrxID প্রদান করা হয়েছে।')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] cursor-pointer"
                >
                  ভুয়া TrxID
                </button>
                <button
                  type="button"
                  onClick={() => setRejectionReasonInput('বিকাশ/নগদ অ্যাকাউন্টে টাকা জমা পাওয়া যায়নি।')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] cursor-pointer"
                >
                  টাকা জমা হয়নি
                </button>
                <button
                  type="button"
                  onClick={() => setRejectionReasonInput('প্যাকেজের মূল্যের চেয়ে কম টাকা পাঠানো হয়েছে।')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] cursor-pointer"
                >
                  অপর্যাপ্ত টাকা
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPackageToReject(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                {lang === 'bn' ? 'ফিরে যান' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectPackage}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <X className="w-4 h-4" />
                <span>{lang === 'bn' ? 'বাতিল নিশ্চিত করুন' : 'Confirm Rejection'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: DELETE PACKAGE RECORD CONFIRMATION
         ========================================================================= */}
      {packageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#0d1527] border border-rose-500/30 p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {lang === 'bn' ? 'প্যাকেজ রেকর্ড মুছে ফেলতে নিশ্চিত?' : 'Confirm Payment Record Deletion'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === 'bn'
                    ? `আপনি কি নিশ্চিত যে TrxID: ${packageToDelete.transactionId} (${packageToDelete.planName}) রেকর্ডটি স্থায়ীভাবে মুছে ফেলতে চান?`
                    : `Are you sure you want to delete payment record ${packageToDelete.transactionId} (${packageToDelete.planName})?`}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPackageToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePackage}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                {lang === 'bn' ? 'রেকর্ড মুছে ফেলুন' : 'Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: ADD NEW SMARTPOS API KEY MODAL
         ========================================================================= */}
      {isAddKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#0d1527] border border-cyan-500/30 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {lang === 'bn' ? 'নতুন SmartPOS API কী যুক্ত করুন' : 'Add SmartPOS API Key'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === 'bn' ? 'মাসিক ১,০০০ চেক সম্পন্ন হলে স্বয়ংক্রিয় রোলওভার হবে।' : '1,000 checks/month pool auto-failover.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddKeyModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSmartposKey} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">
                  {lang === 'bn' ? 'কী নাম বা লেবেল *' : 'Key Label / Identification *'}
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. SmartPOS Key 3 (Secondary Standby)"
                  required
                  className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl outline-none focus:border-cyan-400 font-medium"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">
                  {lang === 'bn' ? 'SmartPOS API কী টোকেন *' : 'SmartPOS API Token / Secret *'}
                </label>
                <input
                  type="text"
                  value={newKeyApiKey}
                  onChange={(e) => setNewKeyApiKey(e.target.value)}
                  placeholder="e.g. fraud_vRSyB8eF02JkL9q1..."
                  required
                  className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">
                    {lang === 'bn' ? 'কাস্টম ডোমেইন (ঐচ্ছিক)' : 'Custom API Domain (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={newKeyDomain}
                    onChange={(e) => setNewKeyDomain(e.target.value)}
                    placeholder="api.smartpos.com.bd"
                    className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-medium">
                    {lang === 'bn' ? 'মাসিক চেক লিমিট' : 'Monthly Quota Limit'}
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="100000"
                    value={newKeyMonthlyLimit}
                    onChange={(e) => setNewKeyMonthlyLimit(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl outline-none focus:border-cyan-400 font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">ডিফল্ট: ১,০০০ চেক / মাস</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-300 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {lang === 'bn'
                    ? 'এই কী যুক্ত করার সাথে সাথে পুলের মোট ধারণক্ষমতা ১,০০০ বৃদ্ধি পাবে। পূর্ববর্তী কীগুলোর সীমা শেষ হলে এটি ট্রাফিক গ্রহণ করবে।'
                    : 'Adding this key expands your total pool capacity by 1,000 checks. Standby keys automatically accept traffic when primary exhausts.'}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddKeyModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer transition-colors"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-xl shadow-md shadow-cyan-500/20 cursor-pointer transition-all"
                >
                  {lang === 'bn' ? 'পুলে যুক্ত করুন' : 'Add to Key Pool'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: EDIT SMARTPOS KEY SETTINGS & LIMIT MODAL
         ========================================================================= */}
      {editingSmartposKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#0d1527] border border-cyan-500/30 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {lang === 'bn' ? 'SmartPOS কী সেটিংস পরিবর্তন' : 'Edit Key Settings'}
                  </h3>
                  <p className="text-xs text-slate-400">{editingSmartposKey.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingSmartposKey(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSmartposKey} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">
                  {lang === 'bn' ? 'মাসিক চেক লিমিট (Monthly Quota)' : 'Monthly Check Limit'}
                </label>
                <input
                  type="number"
                  min="100"
                  max="100000"
                  value={editKeyMonthlyLimit}
                  onChange={(e) => setEditKeyMonthlyLimit(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl outline-none focus:border-cyan-400 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">
                  {lang === 'bn' ? 'কী স্ট্যাটাস (Key Status)' : 'Key Status'}
                </label>
                <select
                  value={editKeyStatus}
                  onChange={(e) => setEditKeyStatus(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl outline-none focus:border-cyan-400 font-medium"
                >
                  <option value="active">Active (সক্রিয় / স্ট্যান্ডবাই)</option>
                  <option value="exhausted">Exhausted (কোটা সমাপ্ত)</option>
                  <option value="disabled">Disabled (সাময়িক বন্ধ)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 space-y-1">
                <span className="block font-semibold text-slate-300">বর্তমান ব্যবহার:</span>
                <span className="font-mono text-cyan-300 block">
                  {editingSmartposKey.usageCount.toLocaleString()} / {editKeyMonthlyLimit.toLocaleString()} checks used
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingSmartposKey(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-xl shadow-md shadow-cyan-500/20 cursor-pointer"
                >
                  {lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 7: DELETE SMARTPOS KEY CONFIRMATION
         ========================================================================= */}
      {keyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#0d1527] border border-rose-500/30 p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {lang === 'bn' ? 'SmartPOS কী মুছে ফেলতে নিশ্চিত?' : 'Remove Key from Pool?'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === 'bn'
                    ? `আপনি কি নিশ্চিত যে "${keyToDelete.name}" কী-টি পুল থেকে মুছে ফেলতে চান?`
                    : `Are you sure you want to delete "${keyToDelete.name}" from your active failover pool?`}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setKeyToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeleteSmartposKey}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                {lang === 'bn' ? 'মুছে ফেলুন' : 'Delete Key'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
