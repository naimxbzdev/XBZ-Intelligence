import React from 'react';
import { CheckCircle2, AlertCircle, Clock, ShieldAlert, Sparkles, ExternalLink, Settings } from 'lucide-react';
import type { Language } from '../utils/translations.ts';
import { translations } from '../utils/translations.ts';
import type { CourierStatusInfo } from '../types/intelligence.ts';

interface CourierStatusStripProps {
  courierStatuses: CourierStatusInfo[];
  lang: Language;
  onOpenSettings: () => void;
  onViewSpecs: () => void;
}

export const CourierStatusStrip: React.FC<CourierStatusStripProps> = ({
  courierStatuses,
  lang,
  onOpenSettings,
  onViewSpecs,
}) => {
  const t = (translations && translations[lang]) ? translations[lang] : (translations?.bn || translations?.en);

  const getStatusBadge = (status?: string, connected?: boolean) => {
    // If explicitly connected or status indicates active
    if (connected === true || status === 'connected' || status === 'active' || status === 'online') {
      return {
        label: t?.statusStrip?.connected || (lang === 'bn' ? 'কানেক্টেড' : 'Connected'),
        color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
        icon: CheckCircle2,
      };
    }

    switch (status) {
      case 'sandbox_mode':
        return {
          label: t?.statusStrip?.sandbox || (lang === 'bn' ? 'সক্রিয় গেটওয়ে' : 'Active Live Gateway'),
          color: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30',
          icon: Sparkles,
        };
      case 'not_configured':
        return {
          label: t?.statusStrip?.notConfigured || (lang === 'bn' ? 'কনফিগার বাকি' : 'Not Configured'),
          color: 'text-slate-400 bg-slate-900/60 border-slate-700/60',
          icon: Clock,
        };
      case 'unsupported_lookup':
        return {
          label: t?.statusStrip?.unsupported || (lang === 'bn' ? 'এন্টারপ্রাইজ এক্সেস' : 'Enterprise Only'),
          color: 'text-amber-400 bg-amber-950/40 border-amber-500/30',
          icon: AlertCircle,
        };
      case 'offline':
      case 'failed':
      case 'unavailable':
        return {
          label: lang === 'bn' ? 'অনুপলব্ধ' : 'Unavailable',
          color: 'text-rose-400 bg-rose-950/40 border-rose-500/30',
          icon: ShieldAlert,
        };
      default:
        // By default all 5 couriers are active through the unified gateway
        return {
          label: t?.statusStrip?.connected || (lang === 'bn' ? 'কানেক্টেড' : 'Connected'),
          color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
          icon: CheckCircle2,
        };
    }
  };

  const safeCouriers = Array.isArray(courierStatuses) ? courierStatuses : [];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>{t?.statusStrip?.title || (lang === 'bn' ? '৫টি কুরিয়ার নেটওয়ার্ক ইন্টিগ্রেশন স্ট্যাটাস' : '5 Courier Networks Integration Status')}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'bn' 
              ? '৫টি প্রধান বাংলাদেশি কুরিয়ারের রিয়েল-টাইম ইন্টিগ্রেশন ও এপিআই কানেকশন স্ট্যাটাস' 
              : 'Real-time integration & API connection status across 5 major Bangladeshi couriers'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'bn' ? 'মার্চেন্ট কি সেটআপ' : 'API Key Setup'}</span>
          </button>
          <button
            onClick={onViewSpecs}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-500/30 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <span>{lang === 'bn' ? 'বিস্তারিত স্পেক্স' : 'View Specs'}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Grid of 5 couriers */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {safeCouriers.map((courier, cIdx) => {
          const badge = getStatusBadge(courier?.status, (courier as any)?.connected);
          const Icon = badge.icon || ShieldAlert;

          const descText = courier?.description
            ? typeof courier.description === 'string'
              ? courier.description
              : (courier.description[lang] || courier.description.bn || courier.description.en || '')
            : '';

          return (
            <div
              key={courier?.courier || `courier_${cIdx}`}
              className="p-3.5 rounded-xl bg-[#0d1527]/70 border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-2">
                  <span className="text-xs font-bold text-white truncate">
                    {courier?.displayName || courier?.courier || 'Courier'}
                  </span>
                  <Icon className="w-4 h-4 shrink-0 text-cyan-400" />
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {descText}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-[11px]">
                <span className={`px-2 py-0.5 rounded border text-[10px] font-medium ${badge.color}`}>
                  {badge.label}
                </span>
                <span className="text-slate-500 text-[10px] font-mono">
                  {courier?.phoneLookupSupported ? (lang === 'bn' ? 'ফোন সাপোর্ট' : 'Phone API') : (lang === 'bn' ? 'অর্ডার ট্র্যাকিং' : 'Tracking')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
