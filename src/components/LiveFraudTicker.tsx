import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Store, 
  ShieldAlert, 
  ArrowRight, 
  Clock, 
  Pause, 
  Play, 
  Gauge, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import type { Language } from '../utils/translations.ts';

interface FraudTickerItem {
  id: string;
  phone: string;
  location: string;
  store: string;
  reason: string;
  lossBDT: number;
  timeAgoBn: string;
  timeAgoEn: string;
}

// 40 completely unique, non-repeating realistic community fraud reports across Bangladesh
const UNIQUE_FRAUD_STREAM: FraudTickerItem[] = [
  {
    id: 'f_01',
    phone: '01911***344',
    location: 'মিরপুর-১০, ঢাকা',
    store: 'TrendBD Fashion',
    reason: 'ডেলিভারিতে পাঠালে ফোন বন্ধ ও মেসেঞ্জারে ব্লক',
    lossBDT: 1350,
    timeAgoBn: '২ মি. আগে',
    timeAgoEn: '2m ago',
  },
  {
    id: 'f_02',
    phone: '01812***561',
    location: 'আগ্রাবাদ, চট্টগ্রাম',
    store: 'GadgetZone BD',
    reason: 'পার্সেল খুলে দেখে ডেলিভারি ম্যানের সামনে বাতিল',
    lossBDT: 2400,
    timeAgoBn: '৫ মি. আগে',
    timeAgoEn: '5m ago',
  },
  {
    id: 'f_03',
    phone: '01732***190',
    location: 'উত্তরা সেক্টর ৭, ঢাকা',
    store: 'StyleHub Express',
    reason: 'ভুয়া নাম ও অস্তিত্বহীন ঠিকানা ব্যবহার করে অর্ডার',
    lossBDT: 950,
    timeAgoBn: '৮ মি. আগে',
    timeAgoEn: '8m ago',
  },
  {
    id: 'f_04',
    phone: '01648***211',
    location: 'জলেশ্বরীতলা, বগুড়া',
    store: 'Glamour Footwear',
    reason: 'পার্সেল রিজেক্ট এবং রিটার্ন ডেলিভারি চার্জ ক্ষতিসাধন',
    lossBDT: 1800,
    timeAgoBn: '১২ মি. আগে',
    timeAgoEn: '12m ago',
  },
  {
    id: 'f_05',
    phone: '01533***782',
    location: 'জিন্দাবাজার, সিলেট',
    store: 'TechMart BD',
    reason: 'সিওডি পার্সেল গ্রহণ করতে অস্বীকৃতি ও অসৌজন্যমূলক আচরণ',
    lossBDT: 1200,
    timeAgoBn: '১৬ মি. আগে',
    timeAgoEn: '16m ago',
  },
  {
    id: 'f_06',
    phone: '01719***824',
    location: 'চাষাড়া, নারায়ণগঞ্জ',
    store: 'Urban Lifestyle',
    reason: 'একই সাথে ৩টি শপে জামা অর্ডার করে ১টি রেখে বাকিগুলো ফেরত',
    lossBDT: 1650,
    timeAgoBn: '২০ মি. আগে',
    timeAgoEn: '20m ago',
  },
  {
    id: 'f_07',
    phone: '01844***901',
    location: 'জিইসি মোড়, চট্টগ্রাম',
    store: 'Cosmetics Valley',
    reason: 'কল রিসিভ করে বলে আমি অর্ডার করিনি, অন্য কেউ করেছে',
    lossBDT: 2150,
    timeAgoBn: '২৪ মি. আগে',
    timeAgoEn: '24m ago',
  },
  {
    id: 'f_08',
    phone: '01970***412',
    location: 'ধানমন্ডি ২৭, ঢাকা',
    store: 'WatchHub Dhaka',
    reason: 'বিকাশে টাকা পাঠাচ্ছি বলে ডেলিভারি ম্যানকে ঘণ্টার পর ঘণ্টা বসিয়ে রাখা',
    lossBDT: 3200,
    timeAgoBn: '২৭ মি. আগে',
    timeAgoEn: '27m ago',
  },
  {
    id: 'f_09',
    phone: '01625***339',
    location: 'চান্দনা চৌরাস্তা, গাজীপুর',
    store: 'Kids Corner BD',
    reason: 'অর্ডার কুরিয়ারে বুকিং দেওয়ার পর ফোন রিসিভ করা বন্ধ',
    lossBDT: 1100,
    timeAgoBn: '৩১ মি. আগে',
    timeAgoEn: '31m ago',
  },
  {
    id: 'f_10',
    phone: '01788***650',
    location: 'সাহেব বাজার, রাজশাহী',
    store: 'Organic Food Hub',
    reason: 'পার্সেল নেওয়ার সময় টাকা নেই বলে ডেলিভারি আটকে রাখা ও ফেরত',
    lossBDT: 1400,
    timeAgoBn: '৩৫ মি. আগে',
    timeAgoEn: '35m ago',
  },
  {
    id: 'f_11',
    phone: '01511***492',
    location: 'শিববাড়ী মোড়, খুলনা',
    store: 'Denim Lounge BD',
    reason: 'ডেলিভারি ম্যান যাওয়ার পর বাসা চেনে না দাবি করে অর্ডার বাতিল',
    lossBDT: 1950,
    timeAgoBn: '৩৮ মি. আগে',
    timeAgoEn: '38m ago',
  },
  {
    id: 'f_12',
    phone: '01861***723',
    location: 'কান্দিরপাড়, কুমিল্লা',
    store: 'Smart Electronics',
    reason: 'অর্ডার কনফার্ম করার পর ডেলিভারি চার্জ দিতে অস্বীকার ও রিটার্ন',
    lossBDT: 2800,
    timeAgoBn: '৪২ মি. আগে',
    timeAgoEn: '42m ago',
  },
  {
    id: 'f_13',
    phone: '01933***518',
    location: 'সদর রোড, বরিশাল',
    store: 'Boutique House BD',
    reason: 'অন্য পেজ থেকে কম দামে পেয়ে এই পার্সেলটি রিসিভ না করে ফেরত',
    lossBDT: 1750,
    timeAgoBn: '৪৭ মি. আগে',
    timeAgoEn: '47m ago',
  },
  {
    id: 'f_14',
    phone: '01742***991',
    location: 'ধাপ, রংপুর',
    store: 'ShoeMart Express',
    reason: 'পার্সেল রিসিভ করার নির্দিষ্ট সময়ে ইচ্ছাকৃতভাবে মোবাইল বন্ধ রাখা',
    lossBDT: 1300,
    timeAgoBn: '৫১ মি. আগে',
    timeAgoEn: '51m ago',
  },
  {
    id: 'f_15',
    phone: '01677***104',
    location: 'টাউন হল, ময়মনসিংহ',
    store: 'Leather Craft BD',
    reason: 'ভুয়া ফোন নাম্বার ও অপরিপূর্ণ ঠিকানা দিয়ে ফেক অর্ডার',
    lossBDT: 2100,
    timeAgoBn: '৫৫ মি. আগে',
    timeAgoEn: '55m ago',
  },
  {
    id: 'f_16',
    phone: '01829***883',
    location: 'কোটবাড়ি, কুমিল্লা',
    store: 'Crafty Fashion BD',
    reason: 'অগ্রিম পেমেন্ট করব বলে ডেলিভারি ম্যানের সময় অপচয় ও রিজেক্ট',
    lossBDT: 1550,
    timeAgoBn: '১ ঘণ্টা আগে',
    timeAgoEn: '1h ago',
  },
  {
    id: 'f_17',
    phone: '01955***227',
    location: 'মেইন রোড, কক্সবাজার',
    store: 'Perfume Gallery',
    reason: 'অর্ডার পৌঁছানোর পর বলে আমি কিছু অর্ডার করিনি',
    lossBDT: 3400,
    timeAgoBn: '১ ঘণ্টা আগে',
    timeAgoEn: '1h ago',
  },
  {
    id: 'f_18',
    phone: '01761***405',
    location: 'দড়াটানা, যশোর',
    store: 'Daily Gadget BD',
    reason: 'কুরিয়ার হাব থেকে পার্সেল রিসিভ না করে ফেলে রাখা',
    lossBDT: 1600,
    timeAgoBn: '১ ঘণ্টা আগে',
    timeAgoEn: '1h ago',
  },
  {
    id: 'f_19',
    phone: '01302***674',
    location: 'সাভার বাসস্ট্যান্ড, ঢাকা',
    store: 'Silk Heritage BD',
    reason: 'সাইজ বড় হয়েছে অজুহাতে খোলা পার্সেল ফিরিয়ে দেওয়া ও চার্জ না দেওয়া',
    lossBDT: 2250,
    timeAgoBn: '১ ঘণ্টা আগে',
    timeAgoEn: '1h ago',
  },
  {
    id: 'f_20',
    phone: '01890***128',
    location: 'বড়বাজার, পাবনা',
    store: 'Mobile Mart BD',
    reason: 'কুরিয়ার অফিসে গিয়েও পার্সেল ছাড়িয়ে নেয়নি এবং কল ধরেনি',
    lossBDT: 4150,
    timeAgoBn: '১ ঘণ্টা আগে',
    timeAgoEn: '1h ago',
  },
  {
    id: 'f_21',
    phone: '01639***882',
    location: 'নিউ মার্কেট, সিলেট',
    store: 'Hijab Collection',
    reason: 'কুরিয়ার রিটার্ন খরচ না দিয়ে উল্টো মার্চেন্টকে হুমকি প্রদান',
    lossBDT: 850,
    timeAgoBn: '১ ঘণ্টা আগে',
    timeAgoEn: '1h ago',
  },
  {
    id: 'f_22',
    phone: '01755***391',
    location: 'স্টেশন রোড, দিনাজপুর',
    store: 'BookShop BD',
    reason: 'বই অর্ডার করে ডেলিভারির দিন মোবাইল ফোন সম্পূর্ণ বন্ধ করে রাখা',
    lossBDT: 1050,
    timeAgoBn: '২ ঘণ্টা আগে',
    timeAgoEn: '2h ago',
  },
  {
    id: 'f_23',
    phone: '01988***612',
    location: 'ভৈরব বাজার, কিশোরগঞ্জ',
    store: 'Mens Wear BD',
    reason: 'ডেলিভারি ম্যানকে ৩ ঘণ্টা বসিয়ে রেখে পরে ফোন সুইচড অফ করা',
    lossBDT: 2300,
    timeAgoBn: '২ ঘণ্টা আগে',
    timeAgoEn: '2h ago',
  },
  {
    id: 'f_24',
    phone: '01876***543',
    location: 'পটিয়া, চট্টগ্রাম',
    store: 'Kitchen Tools BD',
    reason: 'পণ্য দেখে বলে পছন্দ হয়নি, রিটার্ন চার্জও দেবে না',
    lossBDT: 1700,
    timeAgoBn: '২ ঘণ্টা আগে',
    timeAgoEn: '2h ago',
  },
  {
    id: 'f_25',
    phone: '01521***769',
    location: 'মুক্তাগাছা, ময়মনসিংহ',
    store: 'Honey Pure BD',
    reason: 'আসল ঠিকানার বদলে ভিন্ন গ্রামের ঠিকানা দিয়ে বিভ্রান্তি তৈরি',
    lossBDT: 900,
    timeAgoBn: '২ ঘণ্টা আগে',
    timeAgoEn: '2h ago',
  },
  {
    id: 'f_26',
    phone: '01614***920',
    location: 'বনানী ১১, ঢাকা',
    store: 'Glow Skin BD',
    reason: 'পণ্য নেওয়ার পর বলে অনলাইনে টাকা দিচ্ছি কিন্তু দেয়নি',
    lossBDT: 3800,
    timeAgoBn: '২ ঘণ্টা আগে',
    timeAgoEn: '2h ago',
  },
  {
    id: 'f_27',
    phone: '01704***318',
    location: 'মহাস্থানগড় মোড়, বগুড়া',
    store: 'Agro Seeds BD',
    reason: 'অর্ডার কনফার্ম করে ডেলিভারির সময় রিসিভ করতে সরাসরি অস্বীকৃতি',
    lossBDT: 1450,
    timeAgoBn: '২ ঘণ্টা আগে',
    timeAgoEn: '2h ago',
  },
  {
    id: 'f_28',
    phone: '01944***502',
    location: 'সোনাডাঙ্গা, খুলনা',
    store: 'Sports Hub BD',
    reason: 'সাইজ নিশ্চিত করার পরও ডেলিভারির সময় পার্সেল রিজেক্ট',
    lossBDT: 2100,
    timeAgoBn: '৩ ঘণ্টা আগে',
    timeAgoEn: '3h ago',
  },
  {
    id: 'f_29',
    phone: '01833***119',
    location: 'পার্ক মোড়, রংপুর',
    store: 'Smart Watch BD',
    reason: 'ডেলিভারি ম্যানের কল কেটে দিয়ে নাম্বার ব্লকলিস্টে যোগ করা',
    lossBDT: 2600,
    timeAgoBn: '৩ ঘণ্টা আগে',
    timeAgoEn: '3h ago',
  },
  {
    id: 'f_30',
    phone: '01689***441',
    location: 'কোর্ট পয়েন্ট, সিলেট',
    store: 'Abaya Fashion BD',
    reason: 'এক সাথে ৫টি শপ থেকে একই জিনিস অর্ডার করে অযথা রিটার্ন',
    lossBDT: 1900,
    timeAgoBn: '৩ ঘণ্টা আগে',
    timeAgoEn: '3h ago',
  },
  {
    id: 'f_31',
    phone: '01777***835',
    location: 'চকবাজার, ঢাকা',
    store: 'Electrical Solutions',
    reason: 'দোকানে পার্সেল নিয়ে গেলে বলে মালিক দেশের বাইরে',
    lossBDT: 3100,
    timeAgoBn: '৩ ঘণ্টা আগে',
    timeAgoEn: '3h ago',
  },
  {
    id: 'f_32',
    phone: '01540***992',
    location: 'কালীবাড়ি রোড, টাঙ্গাইল',
    store: 'Trendy Shoes BD',
    reason: 'ট্র্যাকিং দেখার পরও পার্সেল ডেলিভারি না নেওয়া ও ক্ষতিসাধন',
    lossBDT: 1500,
    timeAgoBn: '৩ ঘণ্টা আগে',
    timeAgoEn: '3h ago',
  },
  {
    id: 'f_33',
    phone: '01922***716',
    location: 'রূপসা মোড়, খুলনা',
    store: 'Tea Corner BD',
    reason: 'অর্ডার পাঠিয়ে কল দিলে বারবার কল কেটে দেয়',
    lossBDT: 750,
    timeAgoBn: '৪ ঘণ্টা আগে',
    timeAgoEn: '4h ago',
  },
  {
    id: 'f_34',
    phone: '01855***629',
    location: 'হালিশহর, চট্টগ্রাম',
    store: 'Baby Land BD',
    reason: 'ডেলিভারি চার্জ না দেওয়ার জন্য কাল্পনিক অজুহাত তৈরি',
    lossBDT: 2050,
    timeAgoBn: '৪ ঘণ্টা আগে',
    timeAgoEn: '4h ago',
  },
  {
    id: 'f_35',
    phone: '01712***483',
    location: 'কাজির দেউড়ি, চট্টগ্রাম',
    store: 'Fashion Pulse BD',
    reason: 'বারবার তারিখ পরিবর্তন করে শেষ পর্যন্ত রিটার্ন পাঠায়',
    lossBDT: 1850,
    timeAgoBn: '৪ ঘণ্টা আগে',
    timeAgoEn: '4h ago',
  },
  {
    id: 'f_36',
    phone: '01601***337',
    location: 'বাসস্ট্যান্ড, কুষ্টিয়া',
    store: 'Bag Zone BD',
    reason: 'ঠিকানায় কোনো ব্যক্তি খুঁজে পাওয়া যায়নি এবং ফোন আনরিচেবল',
    lossBDT: 1350,
    timeAgoBn: '৫ ঘণ্টা আগে',
    timeAgoEn: '5h ago',
  },
  {
    id: 'f_37',
    phone: '01966***842',
    location: 'এস এস কে রোড, ফেনী',
    store: 'Audio Tech BD',
    reason: 'হেডফোন খুলে চেক করে ইচ্ছাকৃতভাবে ফেরত পাঠানো',
    lossBDT: 2900,
    timeAgoBn: '৫ ঘণ্টা আগে',
    timeAgoEn: '5h ago',
  },
  {
    id: 'f_38',
    phone: '01888***215',
    location: 'জেল রোড, ব্রাহ্মণবাড়িয়া',
    store: 'Panjabi Gallery',
    reason: 'পার্সেল ডেলিভারি নিতে অস্বীকার ও ডেলিভারি ম্যানের সাথে দুর্ব্যবহার',
    lossBDT: 2750,
    timeAgoBn: '৫ ঘণ্টা আগে',
    timeAgoEn: '5h ago',
  },
  {
    id: 'f_39',
    phone: '01799***501',
    location: 'বড়পুল, কুমিল্লা',
    store: 'Home Decor BD',
    reason: 'ফেক নাম ও বন্ধ সিম কার্ড দিয়ে ফেসবুক পেজে অর্ডার প্লেস',
    lossBDT: 3300,
    timeAgoBn: '৬ ঘণ্টা আগে',
    timeAgoEn: '6h ago',
  },
  {
    id: 'f_40',
    phone: '01555***178',
    location: 'রেলগেট, রাজশাহী',
    store: 'Herbal Health BD',
    reason: 'কুরিয়ারে পার্সেল পাঠিয়ে মার্চেন্টের নগদ ক্যাশ ক্ষতিসাধন',
    lossBDT: 1150,
    timeAgoBn: '৬ ঘণ্টা আগে',
    timeAgoEn: '6h ago',
  },
];

interface LiveFraudTickerProps {
  lang: Language;
  onOpenReportModal: () => void;
  onViewDatabase: () => void;
}

export const LiveFraudTicker: React.FC<LiveFraudTickerProps> = ({
  lang,
  onOpenReportModal,
  onViewDatabase,
}) => {
  const [tickerItems, setTickerItems] = useState<FraudTickerItem[]>(UNIQUE_FRAUD_STREAM);
  const [isPaused, setIsPaused] = useState(false);
  // Speeds: 'slow' = 420s, 'extra-slow' = 580s (super slow, smooth reading experience)
  const [speedMode, setSpeedMode] = useState<'slow' | 'extra-slow'>('slow');

  // Fetch newly reported items from backend and strictly deduplicate by phone & id
  useEffect(() => {
    const fetchFreshReports = async () => {
      try {
        const res = await fetch('/api/reports');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const formatted: FraudTickerItem[] = data.map((rep: any, idx: number) => ({
            id: rep.id || `live_rep_${idx}`,
            phone: rep.phone ? rep.phone.slice(0, 5) + '***' + rep.phone.slice(-3) : '017XXXXXXXX',
            location: rep.district || 'বাংলাদেশ',
            store: rep.reporterStore || 'Verified Merchant',
            reason: rep.reason || 'ক্যাশ অন ডেলিভারি ক্ষতিসাধন ও অর্ডার রিজেক্ট',
            lossBDT: rep.lossAmountBDT || 1200,
            timeAgoBn: 'সম্প্রতি',
            timeAgoEn: 'Just now',
          }));

          // Strict Deduplication by Phone Number
          const seenPhones = new Set<string>();
          const dedupedList: FraudTickerItem[] = [];

          [...formatted, ...UNIQUE_FRAUD_STREAM].forEach((item) => {
            if (!seenPhones.has(item.phone)) {
              seenPhones.add(item.phone);
              dedupedList.push(item);
            }
          });

          setTickerItems(dedupedList);
        }
      } catch {
        // Fallback to initial 40 unique items
      }
    };

    fetchFreshReports();
  }, []);

  const durationSec = speedMode === 'extra-slow' ? 580 : 420;

  return (
    <div 
      className="relative w-full bg-[#080d1a] border-y border-rose-500/25 py-2 overflow-hidden select-none"
      style={{ '--ticker-duration': `${durationSec}s` } as React.CSSProperties}
    >
      <div className="flex items-center">
        {/* Pinned Left Label: Hidden on mobile view, visible on tablet/desktop */}
        <div className="hidden md:flex relative z-20 items-center gap-2 pl-4 pr-3 bg-gradient-to-r from-[#080d1a] via-[#080d1a] to-transparent shrink-0">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </span>
          <span className="flex px-2.5 py-1 rounded-lg bg-rose-950/90 border border-rose-500/40 text-rose-300 font-bold text-[11px] uppercase tracking-wider items-center gap-1.5 shadow-md shadow-rose-950/60 whitespace-nowrap">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>{lang === 'bn' ? 'লাইভ প্রতারক সতর্কতা' : 'LIVE FRAUD TICKER'}</span>
          </span>

          {/* Unique Count Badge */}
          <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium text-slate-400 bg-slate-900 border border-slate-800 whitespace-nowrap">
            <span>{tickerItems.length}টি অনন্য রিপোর্ট</span>
          </span>
        </div>

        {/* Continuous Horizontal Marquee (Moving slowly right-to-left like a TV news ticker) */}
        <div className="flex-1 overflow-hidden relative">
          {/* Subtle edge fade gradients */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#080d1a] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#080d1a] to-transparent z-10 pointer-events-none" />

          {/* Marquee Track with CSS var duration */}
          <div 
            className={`animate-ticker-marquee flex items-center gap-6 cursor-pointer ${isPaused ? 'is-paused' : ''}`}
          >
            {/* Sequence 1: All 40 completely unique items */}
            {tickerItems.map((item) => (
              <div
                key={item.id}
                onClick={onViewDatabase}
                className="inline-flex items-center gap-2.5 px-3 py-1 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-rose-500/40 transition-colors shrink-0 group text-xs text-slate-300"
              >
                {/* Masked phone badge */}
                <span className="font-mono font-bold text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-700/80 group-hover:border-rose-500/40 group-hover:text-rose-300 transition-colors">
                  {item.phone}
                </span>

                {/* Location */}
                <span className="flex items-center gap-1 text-slate-400 font-medium whitespace-nowrap">
                  <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>{item.location}</span>
                </span>

                {/* Store */}
                <span className="hidden sm:inline-flex items-center gap-1 text-slate-400 whitespace-nowrap">
                  <Store className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="text-slate-300 font-medium">{item.store}</span>
                </span>

                {/* Reason */}
                <span className="text-rose-200 font-medium truncate max-w-[280px] sm:max-w-[360px]">
                  &ldquo;{item.reason}&rdquo;
                </span>

                {/* Loss Amount */}
                <span className="font-mono font-bold text-rose-400 shrink-0 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-900/40 whitespace-nowrap">
                  ৳{item.lossBDT} ক্ষতি
                </span>

                {/* Time */}
                <span className="text-[10px] text-slate-500 font-mono hidden md:inline-flex items-center gap-0.5 whitespace-nowrap">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{lang === 'bn' ? item.timeAgoBn : item.timeAgoEn}</span>
                </span>

                {/* Separator dot */}
                <span className="text-slate-600 pl-1 font-bold">•</span>
              </div>
            ))}

            {/* Sequence 2: Exact seamless loop continuation for continuous scroll */}
            {tickerItems.map((item) => (
              <div
                key={`dup_${item.id}`}
                onClick={onViewDatabase}
                className="inline-flex items-center gap-2.5 px-3 py-1 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-rose-500/40 transition-colors shrink-0 group text-xs text-slate-300"
              >
                {/* Masked phone badge */}
                <span className="font-mono font-bold text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-700/80 group-hover:border-rose-500/40 group-hover:text-rose-300 transition-colors">
                  {item.phone}
                </span>

                {/* Location */}
                <span className="flex items-center gap-1 text-slate-400 font-medium whitespace-nowrap">
                  <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>{item.location}</span>
                </span>

                {/* Store */}
                <span className="hidden sm:inline-flex items-center gap-1 text-slate-400 whitespace-nowrap">
                  <Store className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="text-slate-300 font-medium">{item.store}</span>
                </span>

                {/* Reason */}
                <span className="text-rose-200 font-medium truncate max-w-[280px] sm:max-w-[360px]">
                  &ldquo;{item.reason}&rdquo;
                </span>

                {/* Loss Amount */}
                <span className="font-mono font-bold text-rose-400 shrink-0 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-900/40 whitespace-nowrap">
                  ৳{item.lossBDT} ক্ষতি
                </span>

                {/* Time */}
                <span className="text-[10px] text-slate-500 font-mono hidden md:inline-flex items-center gap-0.5 whitespace-nowrap">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{lang === 'bn' ? item.timeAgoBn : item.timeAgoEn}</span>
                </span>

                {/* Separator dot */}
                <span className="text-slate-600 pl-1 font-bold">•</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pinned Right Controls: Pause/Play, Speed Toggle & Action Buttons */}
        <div className="relative z-20 flex items-center gap-1.5 sm:gap-2 pl-3 pr-3 sm:pr-5 bg-gradient-to-l from-[#080d1a] via-[#080d1a] to-transparent shrink-0">
          {/* Pause / Play toggle */}
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 sm:px-2 sm:py-1 rounded-md text-[10px] font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center gap-1 transition-colors"
            title={isPaused ? 'Resume ticker' : 'Pause ticker'}
          >
            {isPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
            <span className="hidden md:inline">{isPaused ? (lang === 'bn' ? 'চালু' : 'Play') : (lang === 'bn' ? 'বিরতি' : 'Pause')}</span>
          </button>

          {/* Speed Toggle: Slow / Extra Slow */}
          <button
            type="button"
            onClick={() => setSpeedMode(speedMode === 'slow' ? 'extra-slow' : 'slow')}
            className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono font-medium text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400 transition-colors"
            title="Toggle ticker crawling speed"
          >
            <Gauge className="w-3 h-3 text-cyan-400" />
            <span>{speedMode === 'slow' ? (lang === 'bn' ? 'স্লো' : 'Slow') : (lang === 'bn' ? 'আরও স্লো' : 'Extra Slow')}</span>
          </button>

          <span className="text-slate-700 hidden sm:inline">|</span>

          {/* Direct DB View link */}
          <button
            type="button"
            onClick={onViewDatabase}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold underline transition-colors whitespace-nowrap hidden sm:flex items-center gap-1"
          >
            <span>{lang === 'bn' ? 'ডাটাবেস' : 'View DB'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          {/* Report Alert Button */}
          <button
            type="button"
            onClick={onOpenReportModal}
            className="px-2 sm:px-2.5 py-1 text-[11px] font-bold text-rose-300 hover:text-white bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap shadow-sm"
          >
            <AlertTriangle className="w-3 h-3" />
            <span>{lang === 'bn' ? 'রিপোর্ট' : 'Report'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
