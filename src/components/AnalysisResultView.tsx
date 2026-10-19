import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  UserPlus, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Package, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Building2, 
  AlertCircle,
  FileWarning,
  Sparkles,
  ExternalLink,
  Calculator,
  MessageSquare,
  Printer,
  Share2,
  DollarSign
} from 'lucide-react';
import type { Language } from '../utils/translations.ts';
import { translations } from '../utils/translations.ts';
import type { PhoneAnalysisResult, CourierName } from '../types/intelligence.ts';

interface AnalysisResultViewProps {
  result: PhoneAnalysisResult;
  lang: Language;
  onOpenReportModal: (phone: string) => void;
  onOpenApiSettings: () => void;
}

export const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({
  result,
  lang,
  onOpenReportModal,
  onOpenApiSettings,
}) => {
  const [isMasked, setIsMasked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [orderValue, setOrderValue] = useState<number>(1500);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(130);
  const [activeTabTool, setActiveTabTool] = useState<'calculator' | 'sms' | null>(null);

  const t = translations[lang];

  // Mask phone helper
  const formatPhone = (num: string) => {
    if (!isMasked) return num;
    if (num.length >= 11) {
      return num.slice(0, 4) + '****' + num.slice(-3);
    }
    return num;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Print report
  const handlePrint = () => {
    window.print();
  };

  // Risk tier configuration
  const getRiskBadgeConfig = (level: string) => {
    switch (level) {
      case 'low':
        return {
          label: t.results.riskLevels.low,
          bg: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300',
          gaugeColor: '#10b981',
          icon: ShieldCheck,
          accent: 'emerald',
          badgeText: lang === 'bn' ? 'নিরাপদ গ্রাহক' : 'Safe Customer'
        };
      case 'medium':
        return {
          label: t.results.riskLevels.medium,
          bg: 'bg-amber-950/40 border-amber-500/30 text-amber-300',
          gaugeColor: '#f59e0b',
          icon: AlertTriangle,
          accent: 'amber',
          badgeText: lang === 'bn' ? 'সতর্কতা প্রয়োজন' : 'Caution Required'
        };
      case 'high':
        return {
          label: t.results.riskLevels.high,
          bg: 'bg-rose-950/40 border-rose-500/30 text-rose-300',
          gaugeColor: '#f43f5e',
          icon: AlertOctagon,
          accent: 'rose',
          badgeText: lang === 'bn' ? 'উচ্চ রিটার্ন ঝুঁকি' : 'High Return Risk'
        };
      case 'blacklisted':
        return {
          label: t.results.riskLevels.blacklisted,
          bg: 'bg-red-950/60 border-red-500/50 text-red-200',
          gaugeColor: '#ef4444',
          icon: FileWarning,
          accent: 'red',
          badgeText: lang === 'bn' ? 'ব্ল্যাকলিস্টেড / ফ্রড প্রাপ্ত' : 'Blacklisted / Fraud'
        };
      default:
        return {
          label: t.results.riskLevels.new_customer,
          bg: 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300',
          gaugeColor: '#06b6d4',
          icon: UserPlus,
          accent: 'cyan',
          badgeText: lang === 'bn' ? 'নতুন গ্রাহক' : 'New Customer'
        };
    }
  };

  const riskConfig = getRiskBadgeConfig(result.riskLevel);
  const RiskIcon = riskConfig.icon;
  const returnRate = result.totalOrders > 0 ? Math.max(0, 100 - result.deliveryRate) : 0;

  // COD Risk Calculation
  const returnCost = deliveryCharge * 2; // Forward + Return delivery expense
  const failureProb = result.totalOrders > 0 ? (returnRate / 100) : 0.35;
  const expectedLoss = Math.round(failureProb * returnCost);
  const shouldRequireAdvance = failureProb >= 0.25 || result.riskLevel === 'high' || result.riskLevel === 'blacklisted';

  // WhatsApp / SMS Template
  const confirmationMsg = lang === 'bn'
    ? `আসসালামু আলাইকুম। আপনার ৳${orderValue} টাকার অর্ডারটি কুরিয়ারে বুকিং দেওয়ার জন্য প্রস্তুত। ডেলিভারি চার্জ ৳${deliveryCharge}। আপনি কি পার্সেলটি নিশ্চিত গ্রহণ করবেন? অনুগ্রহ করে 'হ্যাঁ' লিখে কনফার্ম করুন। ধন্যবাদ!`
    : `Hello! Your order of ৳${orderValue} is ready for dispatch via courier. Delivery charge: ৳${deliveryCharge}. Please reply 'YES' to confirm receipt. Thank you!`;

  const copyConfirmationMsg = () => {
    navigator.clipboard.writeText(confirmationMsg);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  const courierKeys: CourierName[] = ['steadfast', 'pathao', 'redx', 'carrybee', 'paperfly'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner: Tested Number, Operator, Actions */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0d1527]/90 border border-cyan-500/20 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-white tracking-wider">
              {formatPhone(result.phone)}
            </span>
            <button
              onClick={() => setIsMasked(!isMasked)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isMasked ? t.results.unmaskPhone : t.results.maskPhone}
            >
              {isMasked ? <Eye className="w-4 h-4 text-cyan-400" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={t.results.copyShareLink}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <span className="text-xs text-slate-400 font-medium px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
            {result.operator}
          </span>

          <span className={`text-xs px-2.5 py-1 rounded-md border font-semibold flex items-center gap-1.5 ${riskConfig.bg}`}>
            <RiskIcon className="w-3.5 h-3.5" />
            <span>{riskConfig.badgeText}</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-400">
          {/* Quick Action Tools */}
          <button
            onClick={() => setActiveTabTool(activeTabTool === 'calculator' ? null : 'calculator')}
            className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
              activeTabTool === 'calculator' 
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50' 
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'bn' ? 'রিস্ক ক্যালকুলেটর' : 'Risk Calculator'}</span>
          </button>

          <button
            onClick={() => setActiveTabTool(activeTabTool === 'sms' ? null : 'sms')}
            className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
              activeTabTool === 'sms' 
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50' 
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'bn' ? 'অর্ডার কনফার্মেশন SMS' : 'WhatsApp / SMS'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-2.5 py-1.5 rounded-lg border bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            title="Print or Save PDF Report"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>{lang === 'bn' ? 'প্রিন্ট রিপোর্ট' : 'Print'}</span>
          </button>

          <span className="flex items-center gap-1 ml-1 text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono text-slate-400">
              {new Date(result.searchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </span>
        </div>
      </div>

      {/* TOOL DRAWER 1: COD Financial Risk Calculator */}
      {activeTabTool === 'calculator' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0e1f38] to-[#070b14] border border-cyan-500/30 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-cyan-400" />
              <h4 className="text-sm sm:text-base font-bold text-white">
                {lang === 'bn' ? 'ক্যাশ-অন-ডেলিভারি (সিওডি) আর্থিক ক্ষতি ক্যালকুলেটর' : 'Cash-on-Delivery Risk & Loss Calculator'}
              </h4>
            </div>
            <button
              onClick={() => setActiveTabTool(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                {lang === 'bn' ? 'অর্ডারের মোট মূল্য (টাকা):' : 'Order Total Value (BDT):'}
              </label>
              <input
                type="number"
                value={orderValue}
                onChange={(e) => setOrderValue(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white font-mono focus:border-cyan-400 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                {lang === 'bn' ? 'একদিকের কুরিয়ার চার্জ (টাকা):' : 'One-way Courier Charge (BDT):'}
              </label>
              <input
                type="number"
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white font-mono focus:border-cyan-400 outline-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700 space-y-1">
              <span className="text-slate-400 block">{lang === 'bn' ? 'পার্সেল রিটার্ন হলে নিশ্চিত ক্ষতি:' : 'Loss if Parcel Returns:'}</span>
              <span className="text-base font-mono font-bold text-rose-400">
                ৳{returnCost} BDT
              </span>
              <span className="text-[10px] text-slate-500 block">
                {lang === 'bn' ? '(যাওয়ার + আসার ডেলিভারি চার্জ)' : '(Forward + return delivery charges)'}
              </span>
            </div>
          </div>

          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
            shouldRequireAdvance 
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-300' 
              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
          }`}>
            <div className="space-y-1">
              <span className="font-bold text-sm block text-white">
                {shouldRequireAdvance
                  ? (lang === 'bn' ? '⚠️ পরামর্শ: ডেলিভারি চার্জ ৳' + deliveryCharge + ' অগ্রিম গ্রহণ করুন' : '⚠️ Recommendation: Collect ৳' + deliveryCharge + ' Delivery Charge in Advance')
                  : (lang === 'bn' ? '✅ পরামর্শ: সম্পূর্ণ ক্যাশ অন ডেলিভারিতে পাঠানো নিরাপদ' : '✅ Recommendation: Safe to dispatch on Full Cash-on-Delivery')}
              </span>
              <p className="text-xs opacity-90">
                {lang === 'bn'
                  ? `গ্রাহকের রিটার্ন ঝুঁকি প্রায় ${Math.round(failureProb * 100)}%। সম্ভাব্য আর্থিক ঝুঁকির পরিমাপ ৳${expectedLoss} টাকা।`
                  : `Customer return probability is approx ${Math.round(failureProb * 100)}%. Financial risk factor: ৳${expectedLoss}.`}
              </p>
            </div>

            <span className="font-mono text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 shrink-0">
              {lang === 'bn' ? 'ঝুঁকি স্কোর: ' : 'Risk: '} {Math.round(failureProb * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* TOOL DRAWER 2: WhatsApp / SMS Confirmation Generator */}
      {activeTabTool === 'sms' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0a201c] to-[#070b14] border border-emerald-500/30 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm sm:text-base font-bold text-white">
                {lang === 'bn' ? 'হোয়াটসঅ্যাপ ও এসএমএস অর্ডার কনফার্মেশন মেসেজ' : 'WhatsApp & SMS Order Confirmation Message'}
              </h4>
            </div>
            <button
              onClick={() => setActiveTabTool(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-xs font-sans leading-relaxed">
            {confirmationMsg}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">
              {lang === 'bn' ? 'কাস্টমারকে কুরিয়ারে বুকিং দেওয়ার পূর্বে এটি পাঠিয়ে কনফার্ম করুন।' : 'Send this to customer before dispatching parcel.'}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyConfirmationMsg}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors flex items-center gap-1.5"
              >
                {copiedMsg ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMsg ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : (lang === 'bn' ? 'মেসেজ কপি' : 'Copy Message')}</span>
              </button>

              <a
                href={`https://wa.me/88${result.phone}?text=${encodeURIComponent(confirmationMsg)}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <span>WhatsApp এ পাঠান</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Delivery Intelligence Grid (2 columns on large screens) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Radial Score & Quantitative Stats (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-2xl bg-[#0d1527]/80 border border-slate-800 relative overflow-hidden">
          {/* Subtle glow highlight */}
          <div 
            className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] pointer-events-none -z-10"
            style={{ backgroundColor: `${riskConfig.gaugeColor}15` }}
          />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                {t.results.riskIndicator}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold border ${riskConfig.bg}`}>
                Score: {result.riskScore}/100
              </span>
            </div>

            {/* Circular Gauge Display */}
            <div className="flex flex-col items-center justify-center my-4 py-2">
              <div className="relative w-40 h-40 flex items-center justify-center">
                {/* SVG Ring Gauge */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#1e293b"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  {/* Active Value Ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={riskConfig.gaugeColor}
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - (result.totalOrders > 0 ? result.deliveryRate / 100 : 0.05))}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                {/* Inner Percentage Readout */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
                    {result.totalOrders > 0 ? `${result.score || result.deliveryRate}%` : 'N/A'}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                    {t.results.overallRate}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-1.5 mt-3">
                <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${riskConfig.bg}`}>
                  <RiskIcon className="w-4 h-4" />
                  <span>{riskConfig.label}</span>
                </div>

                {/* Sub-20ms Engine / Source Indicator */}
                <div className="flex items-center gap-1.5 text-[11px] text-cyan-300/80 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>
                    {result.source === 'database_cache'
                      ? t.results.sourceCache
                      : result.source === 'live'
                      ? t.results.sourceLive
                      : t.results.sourceFallback}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Quantitative Metric Cards */}
          <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-800">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>{t.results.totalParcels}</span>
                <Package className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <span className="text-xl font-bold font-mono text-white tabular-nums">
                {result.totalOrders}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-emerald-400 text-xs mb-1">
                <span>{t.results.deliveredParcels}</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-xl font-bold font-mono text-emerald-300 tabular-nums">
                {result.deliveredOrders}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-rose-400 text-xs mb-1">
                <span>{t.results.cancelledParcels}</span>
                <XCircle className="w-3.5 h-3.5" />
              </div>
              <span className="text-xl font-bold font-mono text-rose-300 tabular-nums">
                {result.cancelledOrders}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-amber-400 text-xs mb-1">
                <span>{t.results.returnRate}</span>
                <TrendingDown className="w-3.5 h-3.5" />
              </div>
              <span className="text-xl font-bold font-mono text-amber-300 tabular-nums">
                {returnRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Recommendation & Risk Factors (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          {/* Actionable Merchant Recommendation */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0e172a] to-[#070b14] border border-cyan-500/25 relative overflow-hidden">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>{t.results.recommendationTitle}</span>
                </h3>
                <p className="mt-2 text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
                  {result.recommendation[lang]}
                </p>
              </div>
            </div>

            {/* Quick operational tip badge */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-400">
                {lang === 'bn' 
                  ? 'ক্যাশ অন ডেলিভারি সুরক্ষা নিশ্চিত করুন' 
                  : 'Cash on delivery loss prevention tip'}
              </span>
              <span className="text-cyan-400 font-semibold font-mono">
                XBZ Intelligence Engine v2.4
              </span>
            </div>
          </div>

          {/* Key Risk Factors List */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0d1527]/80 border border-slate-800 flex-1">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-cyan-400" />
              <span>{t.results.riskFactorsTitle}</span>
            </h3>

            <div className="space-y-2.5">
              {result.riskFactors[lang].map((factor, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 text-xs text-slate-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                  <span className="leading-relaxed">{factor}</span>
                </div>
              ))}
            </div>

            {/* Community Report Fast Trigger */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {lang === 'bn' ? 'এই গ্রাহক আপনাকে ক্ষতিগ্রস্ত করেছে?' : 'Has this customer caused losses?'}
              </span>
              <button
                onClick={() => onOpenReportModal(result.phone)}
                className="px-3 py-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <FileWarning className="w-3.5 h-3.5" />
                <span>{t.results.reportFraudBtn}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Courier-by-Courier Breakdown Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>{t.results.courierBreakdownTitle}</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {lang === 'bn' ? '৫টি কুরিয়ার বিশ্লেষিত' : '5 Couriers Analyzed'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {courierKeys.map((key) => {
            const courier = result.courierBreakdown[key];
            if (!courier) return null;

            return (
              <div
                key={key}
                className="p-4 rounded-xl bg-[#0d1527]/80 border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white truncate">
                      {courier.displayName}
                    </span>
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      {courier.deliveryRate}%
                    </span>
                  </div>

                  {/* Rating / Latency chips */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-2.5">
                    {courier.rating && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        courier.rating.includes('excellent') ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' :
                        courier.rating.includes('bad') ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {courier.rating.replace('_', ' ')}
                      </span>
                    )}
                    {courier.responseTime !== undefined && (
                      <span className="text-slate-500 ml-auto">
                        {courier.responseTime}s
                      </span>
                    )}
                  </div>

                  {/* Mini Progress Bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full transition-all duration-500 ${
                        courier.deliveryRate >= 80 ? 'bg-emerald-400' :
                        courier.deliveryRate >= 60 ? 'bg-amber-400' : 'bg-rose-500'
                      }`}
                      style={{ width: `${courier.totalOrders > 0 ? courier.deliveryRate : 0}%` }}
                    />
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>{lang === 'bn' ? 'মোট পার্সেল:' : 'Total:'}</span>
                      <span className="font-mono text-white tabular-nums font-semibold">{courier.totalOrders}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span>{lang === 'bn' ? 'ডেলিভার্ড:' : 'Delivered:'}</span>
                      <span className="font-mono tabular-nums font-semibold">{courier.deliveredOrders}</span>
                    </div>
                    <div className="flex justify-between text-rose-400">
                      <span>{lang === 'bn' ? 'বাতিল/রিটার্ন:' : 'Cancelled:'}</span>
                      <span className="font-mono tabular-nums font-semibold">{courier.cancelledOrders}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                  <span className="truncate">{courier.statusMessage[lang]}</span>
                  {courier.lastActiveDate && (
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">
                      {courier.lastActiveDate.slice(5)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Community Merchant Dispute Database Section */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0d1527]/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileWarning className="w-4 h-4 text-rose-400" />
              <span>{t.results.communityReportsTitle}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'bn'
                ? 'অনলাইন মার্চেন্টদের কমিউনিটি ক্রাউডসোর্সড ফ্রড ডাটাবেস রেকর্ড'
                : 'Crowdsourced fraud claims reported by verified e-commerce stores'}
            </p>
          </div>

          <button
            onClick={() => onOpenReportModal(result.phone)}
            className="px-3.5 py-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5"
          >
            <FileWarning className="w-3.5 h-3.5" />
            <span>{t.results.reportFraudBtn}</span>
          </button>
        </div>

        {result.communityReports.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{t.results.noReportsFound}</span>
          </div>
        ) : (
          <div className="space-y-3">
            {result.communityReports.map((report: any) => (
              <div
                key={report.id}
                className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs text-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-rose-300">
                      {report.reporter_name || report.reporterStore || 'Verified Merchant'}
                    </span>
                    {report.incident_type && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-900/40 text-rose-200 border border-rose-700/50 text-[10px] font-mono">
                        {report.incident_type.replace('_', ' ')}
                      </span>
                    )}
                    {report.courier_name && (
                      <span className="text-slate-400 font-mono text-[11px]">
                        [{report.courier_name}]
                      </span>
                    )}
                    {report.courierConsignment && (
                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                        Memo: {report.courierConsignment}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 font-medium">
                    {report.title || report.reason}
                  </p>
                </div>

                {(report.order_amount || report.lossAmountBDT) && (
                  <div className="shrink-0 md:text-right">
                    <span className="text-[11px] text-slate-400 block">{lang === 'bn' ? 'অর্ডার ক্ষতি:' : 'Order Loss:'}</span>
                    <span className="text-sm font-bold font-mono text-rose-300">
                      ৳{report.order_amount || report.lossAmountBDT} BDT
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
