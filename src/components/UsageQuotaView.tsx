import React, { useState, useEffect } from 'react';
import {
  Gauge,
  AlertTriangle,
  Clock,
  Calendar,
  Zap,
  Bell,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Send,
  Webhook,
  Sliders,
  ShieldCheck,
  Key,
  Copy,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Info,
  Check,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Language } from '../utils/translations.ts';
import type { UsageQuotaInfo } from '../types/intelligence.ts';

interface UsageQuotaViewProps {
  lang: Language;
  user: any;
  userPlan: string;
  onOpenPayment?: () => void;
}

export const UsageQuotaView: React.FC<UsageQuotaViewProps> = ({
  lang,
  user,
  userPlan,
  onOpenPayment,
}) => {
  const [quota, setQuota] = useState<UsageQuotaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [activeTab, setActiveTab] = useState<'hourly' | 'daily'>('hourly');

  // Settings form state
  const [threshold, setThreshold] = useState<number>(90);
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [notifyEmail, setNotifyEmail] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchQuota = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const email = user?.email || 'naeem@webxpress.com.bd';
      const res = await fetch(`/api/user/usage-quota?email=${encodeURIComponent(email)}`, {
        headers: {
          'X-User-Email': email,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setQuota(data);
        setThreshold(data.warningThreshold || 90);
        setWebhookUrl(data.webhookUrl || '');
        setNotifyEmail(data.notifyEmail || data.userEmail || '');
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
      if (isManualRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQuota();
  }, [user]);

  const handleSimulate = async (percent: number) => {
    setIsSimulating(true);
    try {
      const email = user?.email || 'naeem@webxpress.com.bd';
      const res = await fetch('/api/user/usage-quota/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, percent }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.quota) {
          setQuota(data.quota);
        }
      }
    } finally {
      setIsSimulating(false);
    }
  };

  const handleReset = async () => {
    setIsSimulating(true);
    try {
      const email = user?.email || 'naeem@webxpress.com.bd';
      const res = await fetch('/api/user/usage-quota/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.quota) {
          setQuota(data.quota);
        }
      }
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const email = user?.email || 'naeem@webxpress.com.bd';
      const res = await fetch('/api/user/usage-quota/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          warningThreshold: threshold,
          webhookUrl,
          notifyEmail,
        }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
        fetchQuota();
      }
    } catch {
      // silent
    }
  };

  const handleAcknowledgeNotif = async (id: string) => {
    try {
      const email = user?.email || 'naeem@webxpress.com.bd';
      await fetch('/api/user/usage-quota/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, notificationId: id }),
      });
      if (quota) {
        setQuota({
          ...quota,
          notifications: quota.notifications.map((n) =>
            n.id === id ? { ...n, acknowledged: true } : n
          ),
        });
      }
    } catch {
      // silent
    }
  };

  const copyApiKey = () => {
    if (quota?.apiKey) {
      navigator.clipboard.writeText(quota.apiKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 min-h-[400px]">
        <div className="w-10 h-10 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin mb-3"></div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {lang === 'bn' ? 'ব্যবহার কোটা লোড হচ্ছে...' : 'Loading usage quota...'}
        </p>
      </div>
    );
  }

  const isWarning = Boolean(quota?.isApproachingDaily || quota?.isApproachingMonthly);
  const isExceeded = Boolean(quota?.isExceeded);
  const dailyPercent = quota?.dailyPercentage || 0;
  const monthlyPercent = quota?.monthlyPercentage || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-500 border border-cyan-500/30">
              <Gauge className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {lang === 'bn' ? 'এন্টারপ্রাইজ ব্যবহার কোটা ও লিমিট ট্র্যাকার' : 'Enterprise Usage Quota & Limits'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                  Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {lang === 'bn'
                  ? 'দৈনিক ও মাসিক REST API রিকোয়েস্ট লিমিট মনিটরিং এবং ৯০% লিমিট সতর্কতা সিস্টেম'
                  : 'Daily & Monthly REST API request monitoring with 90% threshold automated alerts'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchQuota(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title="Refresh quota metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{lang === 'bn' ? 'রিফ্রেশ' : 'Refresh'}</span>
          </button>

          <a
            href="https://wa.me/8801703223141?text=Hello%20XBZ,%20I%20need%20to%20expand%20my%20Enterprise%20API%20daily%20and%20monthly%20quota%20limits."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'কোটা বৃদ্ধি করুন' : 'Expand Quota'}</span>
          </a>
        </div>
      </div>

      {/* 90% Threshold Alert Banner (When approaching or exceeding limit) */}
      {(isWarning || isExceeded) && (
        <div
          className={`relative overflow-hidden p-4 sm:p-5 rounded-2xl border transition-all shadow-lg ${
            isExceeded
              ? 'bg-rose-950/40 border-rose-500/50 text-rose-200 shadow-rose-950/30'
              : 'bg-amber-950/40 border-amber-500/50 text-amber-200 shadow-amber-950/30'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-xl shrink-0 mt-0.5 sm:mt-0 ${
                  isExceeded ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400 animate-pulse'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-white">
                    {isExceeded
                      ? (lang === 'bn' ? '🚨 এপিআই কোটা সীমা অতিক্রম করেছে!' : '🚨 API Request Limit Exceeded!')
                      : (lang === 'bn'
                          ? `⚠️ সতর্কতা: আপনি এপিআই রিকোয়েস্ট লিমিটের ${Math.round(dailyPercent)}% অতিক্রম করেছেন!`
                          : `⚠️ Warning: You have reached ${Math.round(dailyPercent)}% of your API request limit!`)}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                      isExceeded ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-950'
                    }`}
                  >
                    {isExceeded ? '100% EXCEEDED' : '90% THRESHOLD'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {lang === 'bn'
                    ? `আজকের দৈনিক কোটার ${dailyPercent}% (${quota?.dailyUsed.toLocaleString()} / ${quota?.dailyLimit.toLocaleString()} রিকোয়েস্ট) ইতোমধ্যে ব্যবহৃত হয়েছে। অবশিষ্ট আছে মাত্র ${quota?.dailyRemaining.toLocaleString()} টি রিকোয়েস্ট। পরিষেবা নিরবচ্ছিন্ন রাখতে এখনই কোটা আপগ্রেড করুন।`
                    : `Your team has used ${dailyPercent}% (${quota?.dailyUsed.toLocaleString()} / ${quota?.dailyLimit.toLocaleString()}) of today's requests. Only ${quota?.dailyRemaining.toLocaleString()} calls remaining.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
              <a
                href="https://wa.me/8801703223141?text=Hello%20XBZ,%20my%20Enterprise%20account%20reached%2090%25%20API%20limit.%20Please%20increase%20limit."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto text-center px-3.5 py-1.5 text-xs font-bold rounded-xl bg-white text-slate-900 hover:bg-slate-100 transition-colors shadow-xs"
              >
                {lang === 'bn' ? 'হোয়াটসঅ্যাপে বৃদ্ধি করুন' : 'Request Increase'}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Strip: Daily, Monthly, and Gateway Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Daily API Requests */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-500" />
              <span>{lang === 'bn' ? 'আজকের দৈনিক ব্যবহার' : 'Today\'s Daily Usage'}</span>
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                dailyPercent >= 90
                  ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/30'
                  : dailyPercent >= 75
                  ? 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {dailyPercent}% {lang === 'bn' ? 'ব্যবহৃত' : 'Used'}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {quota?.dailyUsed.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              / {quota?.dailyLimit.toLocaleString()} {lang === 'bn' ? 'রিকোয়েস্ট' : 'reqs'}
            </span>
          </div>

          {/* Progress Bar with 90% alert marker */}
          <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden my-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                dailyPercent >= 90
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                  : dailyPercent >= 75
                  ? 'bg-gradient-to-r from-cyan-500 to-amber-500'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500'
              }`}
              style={{ width: `${Math.min(100, dailyPercent)}%` }}
            />
            {/* 90% threshold notch */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-rose-400/80 z-10"
              style={{ left: '90%' }}
              title="90% Alert Threshold"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <span>
              {lang === 'bn' ? 'বাকি আছে:' : 'Remaining:'}{' '}
              <strong className="text-slate-700 dark:text-slate-200">
                {quota?.dailyRemaining.toLocaleString()}
              </strong>
            </span>
            <span className="flex items-center gap-1 font-mono text-[10px]">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>রিসেট: 00:00 UTC (৬ ঘণ্টা পর)</span>
            </span>
          </div>
        </div>

        {/* Card 2: Monthly API Requests */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-500" />
              <span>{lang === 'bn' ? 'চলতি মাসের ব্যবহার' : 'Current Month Usage'}</span>
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                monthlyPercent >= 90
                  ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/30'
                  : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30'
              }`}
            >
              {monthlyPercent}% {lang === 'bn' ? 'ব্যবহৃত' : 'Used'}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {quota?.monthlyUsed.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              / {quota?.monthlyLimit.toLocaleString()} {lang === 'bn' ? 'রিকোয়েস্ট' : 'reqs'}
            </span>
          </div>

          {/* Progress Bar with 90% marker */}
          <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden my-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                monthlyPercent >= 90
                  ? 'bg-gradient-to-r from-purple-500 to-rose-500'
                  : 'bg-gradient-to-r from-purple-500 to-indigo-500'
              }`}
              style={{ width: `${Math.min(100, monthlyPercent)}%` }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-rose-400/80 z-10"
              style={{ left: '90%' }}
              title="90% Alert Threshold"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <span>
              {lang === 'bn' ? 'বাকি আছে:' : 'Remaining:'}{' '}
              <strong className="text-slate-700 dark:text-slate-200">
                {quota?.monthlyRemaining.toLocaleString()}
              </strong>
            </span>
            <span className="flex items-center gap-1 font-mono text-[10px]">
              <Calendar className="w-3 h-3 text-purple-400" />
              <span>রিসেট: ১লা তারিখ</span>
            </span>
          </div>
        </div>

        {/* Card 3: Active Key & Gateway SLA */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-500" />
                <span>{lang === 'bn' ? 'সক্রিয় এপিআই ক্রেডেনশিয়াল' : 'Active API Key'}</span>
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>200 OK Live</span>
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300">
              <span className="truncate max-w-[200px]">
                {quota?.apiKey
                  ? `${quota.apiKey.slice(0, 14)}••••••••${quota.apiKey.slice(-4)}`
                  : 'xbz_admin_webxpress_live_••••'}
              </span>
              <button
                onClick={copyApiKey}
                className="p-1 text-slate-400 hover:text-cyan-500 transition-colors cursor-pointer"
                title="Copy API Key"
              >
                {copiedKey ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
            <div>
              <span className="text-slate-400 block">{lang === 'bn' ? 'গেটওয়ে লেটেন্সি' : 'Gateway Latency'}</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-mono">18ms (Fast)</strong>
            </div>
            <div>
              <span className="text-slate-400 block">{lang === 'bn' ? 'সাপোর্টেড কুরিয়ার' : 'Connected Couriers'}</span>
              <strong className="text-slate-700 dark:text-slate-200">Steadfast + 4 Live</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Traffic Chart View: Hourly vs Daily Breakdown */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-500" />
              <span>{lang === 'bn' ? 'এপিআই ট্রাফিক ও রিকোয়েস্ট ট্রেন্ড' : 'API Traffic & Request Volume'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'bn'
                ? 'পিক আওয়ার ও ই-কমার্স অর্ডার ডেলিভারি যাচাইকরণের রিয়েল-টাইম বিতরণ'
                : 'Real-time breakdown of API verification requests during peak e-commerce hours'}
            </p>
          </div>

          {/* Hourly vs Daily Selector */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start sm:self-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTab('hourly')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'hourly'
                  ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {lang === 'bn' ? 'আজকের ২৪ ঘণ্টা' : 'Today (24 Hours)'}
            </button>
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'daily'
                  ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {lang === 'bn' ? 'গত ১৪ দিন' : 'Past 14 Days'}
            </button>
          </div>
        </div>

        {/* Recharts Traffic Visualization */}
        <div className="w-full h-64 sm:h-72 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'hourly' ? (
              <AreaChart data={quota?.hourlyTraffic || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#06b6d4',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${Number(val).toLocaleString()} requests`, 'API Calls']}
                />
                <Area type="monotone" dataKey="requests" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#reqGrad)" />
              </AreaChart>
            ) : (
              <BarChart data={quota?.dailyTraffic || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#a855f7',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${Number(val).toLocaleString()} requests`, 'Daily Volume']}
                />
                <Bar dataKey="requests" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Grid: Alert Notification System & Automation Config */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Notification Center & History */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              <span>{lang === 'bn' ? 'কোটা সতর্কতা ও নোটিফিকেশন হিস্ট্রি' : 'Quota Alert & Warning History'}</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
              {quota?.notifications.length || 0} {lang === 'bn' ? 'সতর্কতা' : 'alerts'}
            </span>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {quota && quota.notifications.length > 0 ? (
              quota.notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-xl border text-xs transition-colors flex items-start justify-between gap-3 ${
                    !notif.acknowledged
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">{notif.title}</span>
                      {!notif.acknowledged && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500 text-slate-950">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] text-slate-400 block pt-0.5">
                      {new Date(notif.timestamp).toLocaleString('bn-BD', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {!notif.acknowledged && (
                    <button
                      onClick={() => handleAcknowledgeNotif(notif.id)}
                      className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Acknowledge alert"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p>{lang === 'bn' ? 'কোনো সক্রিয় সতর্কতা নেই। ব্যবহার কোটা স্বাভাবিক।' : 'No active alerts. Quota usage is within normal range.'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Automated Alert & Webhook Settings */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-500" />
              <span>{lang === 'bn' ? 'স্বয়ংক্রিয় নোটিফিকেশন ও থ্রেশহোল্ড সেটিংস' : 'Automated Alert & Webhook Settings'}</span>
            </h3>
            {saveSuccess && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500">
                <Check className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'সংরক্ষিত!' : 'Saved!'}</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            {/* Warning Threshold Selector */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
                {lang === 'bn' ? 'সতর্কতা ট্রিগার থ্রেশহোল্ড (Alert Threshold)' : 'Warning Trigger Threshold'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[80, 85, 90, 95].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setThreshold(val)}
                    className={`py-2 text-center rounded-xl font-bold border transition-all cursor-pointer ${
                      threshold === val
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                    }`}
                  >
                    {val}%
                    {val === 90 && (
                      <span className="block text-[9px] font-normal opacity-90">
                        {lang === 'bn' ? 'ডিফল্ট' : 'Standard'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {lang === 'bn'
                  ? `ব্যবহার সীমা ${threshold}% এ পৌঁছালে ইন-অ্যাপ ব্যানার এবং স্বয়ংক্রিয় অ্যালার্ট পাঠানো হবে।`
                  : `Automated alert notifications fire when daily/monthly calls reach ${threshold}%.`}
              </p>
            </div>

            {/* Webhook Alert Endpoint */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                {lang === 'bn' ? 'ওয়েবহুক অ্যালার্ট ইউআরএল (Webhook Alert URL)' : 'Webhook Alert URL'}
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://yourstore.com/api/quota-webhook"
                  className="w-full px-3 py-2 pl-8 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <Webhook className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>

            {/* Notification Email */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                {lang === 'bn' ? 'নোটিফিকেশন ইমেইল' : 'Alert Recipient Email'}
              </label>
              <input
                type="email"
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                placeholder="developer@yourstore.com"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors shadow-xs cursor-pointer active:scale-98"
            >
              {lang === 'bn' ? 'অ্যালার্ট সেটিংস সংরক্ষণ করুন' : 'Save Alert Preferences'}
            </button>
          </form>

          {/* Interactive Simulation / Testing Controls */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              {lang === 'bn' ? 'টেস্টিং ও সিমুলেশন টুল (Testing & Verification)' : 'Testing & Verification Sandbox'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSimulate(92.4)}
                disabled={isSimulating}
                className="flex-1 py-1.5 px-2 text-center rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30 text-[11px] font-bold transition-colors cursor-pointer"
                title="Simulate reaching 92% quota to test warning banner"
              >
                {lang === 'bn' ? '⚡ ৯০%+ অ্যালার্ট টেস্ট করুন' : '⚡ Test 90% Alert'}
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={isSimulating}
                className="py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                title="Reset usage counter back to normal"
              >
                {lang === 'bn' ? 'রিসেট' : 'Reset'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
