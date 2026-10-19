import React from 'react';
import { Activity, ExternalLink, CheckCircle2, AlertCircle, Shield, Key, Lock, ArrowRight } from 'lucide-react';
import type { Language } from '../utils/translations.ts';
import type { CourierStatusInfo } from '../types/intelligence.ts';

interface CourierSpecsViewProps {
  courierStatuses: CourierStatusInfo[];
  lang: Language;
  onOpenSettings: () => void;
}

export const CourierSpecsView: React.FC<CourierSpecsViewProps> = ({
  courierStatuses,
  lang,
  onOpenSettings,
}) => {
  const specs = [
    {
      id: 'steadfast',
      name: 'Steadfast Courier',
      endpoint: 'GET https://portal.steadfast.com.bd/api/v1/fraud-check/{phone}',
      authMethod: 'Custom Headers (Api-Key, Secret-Key)',
      phoneLookup: 'Supported natively via official Merchant Portal API',
      trackingOrder: 'Supported via /api/v1/status_by_cid/{cid}',
      rateLimits: '60 requests / minute',
      notesBn: 'স্টেডফাস্ট সরাসরি ফোন নম্বর ভিত্তিক পার্সেল সংখ্যা, সফল ডেলিভারি ও ক্যান্সেলেশন হিস্ট্রি প্রদান করে।',
      notesEn: 'Steadfast directly provides total parcels, successful deliveries, and cancellation counts per phone number.',
      docsUrl: 'https://portal.steadfast.com.bd/api-doc',
    },
    {
      id: 'pathao',
      name: 'Pathao Courier',
      endpoint: 'POST https://api.hermes.pathao.com/aladdin/api/v1/issue-token',
      authMethod: 'OAuth2 Bearer Token (client_id, client_secret, password grant)',
      phoneLookup: 'Enterprise Agreement Required (Universal phone audit not in standard public API)',
      trackingOrder: 'Supported via /aladdin/api/v1/orders/{consignment_id}/info',
      rateLimits: '100 requests / minute',
      notesBn: 'পাঠাও এর সাধারণ মার্চেন্ট এপিআই দিয়ে নির্দিষ্ট অর্ডার ট্র্যাক করা যায়। ফোন নম্বর দিয়ে সম্পূর্ণ নেটওয়ার্ক হিস্ট্রি দেখতে এন্টারপ্রাইজ পার্টনারশিপ প্রয়োজন।',
      notesEn: 'Pathao standard API tracks consignments. Universal phone-based fraud history requires enterprise data access.',
      docsUrl: 'https://developer.pathao.com',
    },
    {
      id: 'redx',
      name: 'REDX Delivery',
      endpoint: 'GET https://openapi.redx.com.bd/v1.0.0-beta/orders',
      authMethod: 'Bearer API Token',
      phoneLookup: 'Supported via Merchant Partner Analytics',
      trackingOrder: 'Supported via /v1.0.0-beta/tracking/{tracking_id}',
      rateLimits: '120 requests / minute',
      notesBn: 'রেডএক্স মার্চেন্ট টোকেনের মাধ্যমে পার্সেল স্ট্যাটাস এবং রিটার্ন রেশিও পর্যবেক্ষণ করা যায়।',
      notesEn: 'REDX API token allows tracking parcels, return ratios, and recipient confirmation history.',
      docsUrl: 'https://openapi.redx.com.bd',
    },
    {
      id: 'carrybee',
      name: 'CarryBee Express',
      endpoint: 'POST https://carrybee.com/api/v1/parcel-stats',
      authMethod: 'X-API-KEY / Bearer Token Header',
      phoneLookup: 'Supported natively via unified gateway',
      trackingOrder: 'Supported via /api/v1/track',
      rateLimits: '80 requests / minute',
      notesBn: 'ক্যারিবি এক্সপ্রেস নেটওয়ার্ক থেকে পার্সেল ডেলিভারি শতাংশ, সফল ও বাতিল পার্সেল সংখ্যা এবং রেসপন্স টাইম তথ্য সংগ্রহ করা হয়।',
      notesEn: 'CarryBee Express network provides delivered percentages, success and cancel counts, and sub-second latency data.',
      docsUrl: 'https://carrybee.com',
    },
    {
      id: 'paperfly',
      name: 'Paperfly (Smart Check v2)',
      endpoint: 'POST https://api.paperfly.com.bd/OrderTracking',
      authMethod: 'Basic Auth / API Key Header',
      phoneLookup: 'Supported via Smart Check v2 Customer History',
      trackingOrder: 'Supported via Paperfly Wings tracking system',
      rateLimits: '60 requests / minute',
      notesBn: 'পেপারফ্লাই স্মার্ট চেক v2 দিয়ে রিটার্ন-টু-সেলার (RTS) পরিসংখ্যান ও গ্রাহক সফলতার হার নির্ণয় করা হয়।',
      notesEn: 'Paperfly Smart Check v2 provides return-to-seller (RTS) analytics and doorstep success rates.',
      docsUrl: 'https://api.paperfly.com.bd',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>{lang === 'bn' ? 'কুরিয়ার এপিআই আর্কিটেকচার ও কানেক্টিভিটি' : 'Courier API Technical Architecture'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            {lang === 'bn'
              ? 'XBZ Intelligence কেবলমাত্র অনুমোদিত এবং অফিশিয়াল এপিআই প্রোটোকল ব্যবহার করে। প্রতিটি কুরিয়ারের আলাদা অ্যাডাপ্টার আর্কিটেকচার বজায় রাখা হয়।'
              : 'XBZ Intelligence integrates only authorized, official API endpoints with transparent normalization and secure server-side adapters.'}
          </p>
        </div>

        <button
          onClick={onOpenSettings}
          className="self-start sm:self-auto px-4 py-2 text-xs sm:text-sm font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-500/20 whitespace-nowrap flex items-center gap-1.5"
        >
          <Key className="w-4 h-4" />
          <span>{lang === 'bn' ? 'এপিআই কি কনফিগার করুন' : 'Configure API Keys'}</span>
        </button>
      </div>

      {/* Courier Cards List */}
      <div className="space-y-4">
        {specs.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-[#0d1527]/80 border border-slate-800 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <h3 className="text-base font-bold text-white">{item.name}</h3>
              </div>

              <a
                href={item.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
              >
                <span>{lang === 'bn' ? 'অফিসিয়াল ডকুমেন্টেশন' : 'Official Docs'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <span className="text-slate-400 block font-semibold">
                  {lang === 'bn' ? 'অথেনটিকেশন মেথড:' : 'Authentication Protocol:'}
                </span>
                <span className="text-slate-200 font-mono">{item.authMethod}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <span className="text-slate-400 block font-semibold">
                  {lang === 'bn' ? 'এন্ডপয়েন্ট প্রিভিউ:' : 'Endpoint:'}
                </span>
                <span className="text-cyan-300 font-mono break-all">{item.endpoint}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              {lang === 'bn' ? item.notesBn : item.notesEn}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
