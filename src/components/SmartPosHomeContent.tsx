import React, { useState } from 'react';
import { 
  CheckCircle2, 
  HelpCircle, 
  ShieldCheck, 
  Search, 
  Database, 
  ArrowRight, 
  TrendingUp, 
  Layers, 
  Lock, 
  Sparkles, 
  ShieldAlert, 
  Clock, 
  Store, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  Package, 
  Truck, 
  DollarSign 
} from 'lucide-react';
import type { Language } from '../utils/translations.ts';

interface SmartPosHomeContentProps {
  lang: Language;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenUpgrade: () => void;
  onNavigate: (tab: string) => void;
}

export const SmartPosHomeContent: React.FC<SmartPosHomeContentProps> = ({
  lang,
  onOpenAuth,
  onOpenUpgrade,
  onNavigate,
}) => {
  // FAQ accordion open states
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = lang === 'bn' ? [
    {
      q: 'কুরিয়ার ফ্রড চেকার কি সম্পূর্ণ ফ্রি নাকি পেইড প্যাকেজ আছে?',
      a: 'আমাদের প্ল্যাটফর্মে রেজিস্ট্রেশন করলেই প্রতি মাসে ১০০টি সার্চ সম্পূর্ণ ফ্রি উপভোগ করতে পারবেন। তবে আপনার মাসিক অর্ডার ভলিউম বেশি হলে বা ১০০ চেকের ফ্রি লিমিট শেষ হয়ে গেলে আপনি আমাদের সাশ্রয়ী মার্চেন্ট প্রো (৳৪৯৯/মাস - ২,৫০০ চেক) অথবা আনলিমিটেড এন্টারপ্রাইজ (৳১,৪৯৯/মাস) প্যাকেজ বিকাশ, নগদ বা রকেটের মাধ্যমে নিয়ে নিরবচ্ছিন্নভাবে ব্যবহার করতে পারবেন।'
    },
    {
      q: 'কোন কোন কুরিয়ার সার্ভিসের ডাটা এখানে পাওয়া যায়?',
      a: 'আমাদের প্ল্যাটফর্মটি সরাসরি Steadfast, Pathao, REDX, CarryBee এবং Paperfly—এই ৫টি প্রধান কুরিয়ার নেটওয়ার্কের সেন্ট্রাল এপিআই ও মার্চেন্ট গেটওয়ে থেকে রিয়েল-টাইমে পার্সেল ডেলিভারি হিস্ট্রি স্ক্যান করে।'
    },
    {
      q: 'গ্রাহকের ডেলিভারি সাকসেস রেট (Success Rate) কীভাবে হিসাব করা হয়?',
      a: 'গ্রাহকের ফোন নম্বরে অতীতে বুকিং দেওয়া মোট পার্সেল সংখ্যা, সফলভাবে গ্রহণ করা পার্সেল সংখ্যা এবং রিটার্ন বা বাতিল হওয়া পার্সেলের অনুপাত বিশ্লেষণ করে শতকরা ডেলিভারি রেট (যেমন: ৯০%, ৮৫%, ৩৫%) এবং রিস্ক লেভেল হিসাব করা হয়।'
    },
    {
      q: 'কোনো গ্রাহকের ডেলিভারি রেট খারাপ হলে মার্চেন্টের কী করা উচিত?',
      a: 'যদি কোনো গ্রাহকের ডেলিভারি রেট ৬০%-এর কম হয় বা পূর্বে ফ্রড রিপোর্ট থাকে, তবে তাকে সম্পূর্ণ ক্যাশ অন ডেলিভারিতে পাঠানোর পরিবর্তে অগ্রিম কুরিয়ার ডেলিভারি চার্জ (যেমন: ৳১৩০-৳১৫০ টাকা) বিকাশ বা নগদে গ্রহণ করে পার্সেল বুক করার সুপারিশ করা হয়।'
    },
    {
      q: 'যদি কোনো গ্রাহক "নতুন গ্রাহক (New Customer)" দেখায়?',
      a: 'যেসব নম্বরে ইতিপূর্বে কোনো কুরিয়ারে পার্সেল ডেলিভারির রেকর্ড পাওয়া যায়নি, তারা নতুন অনলাইন ক্রেতা হতে পারেন। এক্ষেত্রে ফোন করে তাদের ডেলিভারি ঠিকানা নিশ্চিত হয়ে অর্ডার প্রসেস করার পরামর্শ দেওয়া হয়।'
    },
    {
      q: 'আমি কি আমার WooCommerce, Shopify বা কাস্টম ওয়েবসাইটে এটি যুক্ত করতে পারি?',
      a: 'হ্যাঁ! আমাদের প্ল্যাটফর্মে শক্তিশালী REST API রয়েছে যা প্রো ও এন্টারপ্রাইজ প্ল্যানে অন্তর্ভুক্ত। এর মাধ্যমে আপনি আপনার ওয়ার্ডপ্রেস, শপিফাই বা লারাভেল ই-কমার্স স্টোরে অর্ডার প্লেস হওয়ার সাথে সাথে স্বয়ংক্রিয়ভাবে ব্যাকগ্রাউন্ডে ফ্রড চেকিং সম্পন্ন করতে পারবেন।'
    }
  ] : [
    {
      q: 'Is the Courier Fraud Checker completely free, or are packages available?',
      a: 'Creating an account provides 100 free checks each month. Once the 100 free checks limit is reached or for higher order volumes, you can upgrade to Merchant Pro (৳499/mo for 2,500 checks) or Unlimited Enterprise (৳1,499/mo) via bKash, Nagad, or Rocket.'
    },
    {
      q: 'Which courier services are integrated into the checker?',
      a: 'We aggregate real-time delivery histories across Bangladesh’s top 5 logistics networks: Steadfast, Pathao, REDX, CarryBee, and Paperfly.'
    },
    {
      q: 'How is the customer delivery success rate calculated?',
      a: 'The system computes the ratio of successfully received parcels against total dispatched and cancelled/returned shipments across all connected courier gateways.'
    },
    {
      q: 'What should a merchant do if a customer has a low delivery rate?',
      a: 'If a customer has a return rate above 40% or multiple dispute reports, we recommend collecting advance delivery fees (৳130 - ৳150) before dispatching the order.'
    },
    {
      q: 'What does "New Customer" status indicate?',
      a: 'A new customer has no prior delivery records in the central courier gateway. Simply call to verify their delivery address before shipping.'
    },
    {
      q: 'Can I integrate this with WooCommerce, Shopify, or Laravel?',
      a: 'Yes! Complete developer REST API endpoints are included in our Pro and Enterprise tiers, allowing you to screen incoming orders automatically from your custom online store checkout.'
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* =========================================================================
          SECTION 1: HOW IT WORKS (এটি কীভাবে কাজ করে?)
          ========================================================================= */}
      <section className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 mb-3 shadow-xs">
          <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{lang === 'bn' ? 'সহজ ৩টি ধাপ' : 'Simple 3-Step Process'}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {lang === 'bn' ? 'কুরিয়ার ফ্রড চেকার কীভাবে কাজ করে?' : 'How Does Courier Fraud Checker Work?'}
        </h2>
        <p className="mt-2.5 text-sm sm:text-base text-slate-700 dark:text-slate-300 max-w-2xl mx-auto font-medium">
          {lang === 'bn'
            ? 'মাত্র ৩টি সহজ ধাপে যেকোনো গ্রাহকের পূর্বের পার্সেল ডেলিভারি ইতিহাস ও ফ্রড রেকর্ড মুহূর্তেই জেনে নিন।'
            : 'Screen customer courier records and prevent cash-on-delivery parcel returns in 3 easy steps.'}
        </p>

        <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left relative">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800 shadow-sm relative group hover:border-emerald-400 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-extrabold text-lg mb-4">
              ০১
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'গ্রাহকের ফোন নম্বর দিন' : 'Enter Customer Phone Number'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
              {lang === 'bn'
                ? 'আপনার শপ বা পেজে কাস্টমার অর্ডার দেওয়ার পর তার ১১ ডিজিটের মোবাইল নম্বরটি সার্চ বক্সে ইনপুট করুন।'
                : 'Input the customer 11-digit mobile number upon receiving an order request on your online shop.'}
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800 shadow-sm relative group hover:border-emerald-400 transition-all">
            <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-700 dark:text-sky-400 font-extrabold text-lg mb-4">
              ০২
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? '৫টি কুরিয়ারে স্বয়ংক্রিয় স্ক্যান' : 'Automated 5-Courier Scan'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
              {lang === 'bn'
                ? 'সিস্টেমটি মুহূর্তেই Steadfast, Pathao, RedX, CarryBee ও Paperfly থেকে পার্সেল ডেলিভারি হিস্ট্রি স্ক্যান করে।'
                : 'The platform scans live parcel records across Steadfast, Pathao, REDX, CarryBee, and Paperfly gateways.'}
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800 shadow-sm relative group hover:border-emerald-400 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-700 dark:text-purple-400 font-extrabold text-lg mb-4">
              ০৩
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'স্মার্ট ডেলিভারি সিদ্ধান্ত নিন' : 'Take Safe Delivery Decision'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
              {lang === 'bn'
                ? 'সফল ডেলিভারি ও রিটার্নের সঠিক হার দেখে সম্পূর্ণ ক্যাশ অন ডেলিভারিতে পাঠাবেন নাকি অগ্রিম চার্জ নেবেন তা নিশ্চিত হন।'
                : 'Inspect delivery rate and return ratios to determine whether to ship COD or collect advance delivery fees.'}
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: WHY CHOOSE (কেন ব্যবহার করবেন?)
          ========================================================================= */}
      <section className="p-8 sm:p-12 rounded-3xl bg-slate-200/50 dark:bg-[#0b1325] border border-slate-300/60 dark:border-slate-800">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {lang === 'bn' ? 'কেন ব্যবহার করবেন কুরিয়ার ফ্রড চেকার?' : 'Why Every Online Merchant Needs Fraud Checker?'}
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {lang === 'bn'
              ? 'অনলাইন বিজনেসে পার্সেল রিটার্ন হলে মার্চেন্টের যাতায়াত কুরিয়ার চার্জ মিলিয়ে ১৫০-২০০ টাকা ক্ষতি হয়। এই ক্ষতি শূন্যে নামিয়ে আনুন।'
              : 'Every uncollected COD parcel costs BDT 150-200 in return logistics charges. Eliminate unnecessary operational losses.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
          {/* Card 1 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-3.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'ফেক অর্ডার ও রিটার্ন পার্সেল রোধ' : 'Prevent Fake Orders & Returns'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed">
              {lang === 'bn'
                ? 'অসৎ ক্রেতারা পার্সেল গ্রহণ না করলে যে কুরিয়ার চার্জ লস হয়, তা আগে থেকেই চিহ্নিত করে পুরোপুরি বন্ধ করুন।'
                : 'Identify unreliable shoppers who repeatedly reject parcels before dispatching items.'}
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3.5">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'ডেলিভারি সাকসেস রেট বৃদ্ধি' : 'Maximize Delivery Success Ratio'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed">
              {lang === 'bn'
                ? 'বিশ্বস্ত ও নিয়মিত ক্রেতাদের দ্রুত ক্যাশ অন ডেলিভারিতে পণ্য পাঠিয়ে ডেলিভারি রেট ৯০%+ এ উন্নীত করুন।'
                : 'Deliver with confidence to verified, high-rating customers and elevate your overall delivery fulfillment.'}
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-3.5">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'একসাথে ৫টি কুরিয়ারের ডেটা' : 'Centralized 5-Courier Database'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed">
              {lang === 'bn'
                ? 'আলাদা আলাদা কুরিয়ার ওয়েবসাইটে খোঁজাখুঁজি না করে একটি ক্লিকেই সেন্ট্রাল গেটওয়ে থেকে হিস্ট্রি পান।'
                : 'No need to manually cross-check multiple courier portals; get consolidated data in one search.'}
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3.5">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'অগ্রিম ডেলিভারি চার্জ নিশ্চিত' : 'Advance Courier Fee Guidance'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed">
              {lang === 'bn'
                ? 'সিস্টেম স্বয়ংক্রিয়ভাবে হিসাব করে জানিয়ে দেয় কোন কাস্টমারের কাছ থেকে অগ্রিম ডেলিভারি চার্জ নেওয়া উচিত।'
                : 'Smart algorithms advise when it is necessary to ask for advance delivery charges via bKash/Nagad.'}
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3.5">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'ডেভেলপার REST API ইন্টিগ্রেশন' : 'Automated Store REST API'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed">
              {lang === 'bn'
                ? 'WooCommerce, Shopify ও Laravel সাইটের সাথে সরাসরি API কানেক্ট করে অটোমেটিক অর্ডার ফ্রড স্ক্রিনিং।'
                : 'Seamless developer REST API for real-time automated fraud checks right at your online store checkout.'}
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-3.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'মাসে ১০০টি ফ্রি চেক ও সাশ্রয়ী প্যাকেজ' : '100 Free Monthly Checks & Pro Packages'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed">
              {lang === 'bn'
                ? 'সাইন আপে প্রতি মাসে ১০০টি ফ্রি চেক। লিমিট শেষ হলে প্রো (৳৪৯৯/মাস) বা আনলিমিটেড এন্টারপ্রাইজ (৳১,৪৯৯/মাস) প্যাকেজ নেওয়ার সুবিধা।'
                : 'Enjoy 100 free monthly checks on sign up. Upgrade to Pro (৳499/mo) or Unlimited Enterprise (৳1,499/mo) as your orders expand.'}
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: FAQ (সচরাচর জিজ্ঞাসা)
          ========================================================================= */}
      <section className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 mb-2.5">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>FAQ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {lang === 'bn' ? 'সচরাচর জিজ্ঞাসা (FAQ)' : 'Frequently Asked Questions'}
          </h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 font-medium">
            {lang === 'bn'
              ? 'কুরিয়ার ফ্রড চেকার সম্পর্কে অনলাইন মার্চেন্টদের সাধারণ প্রশ্ন ও উত্তর।'
              : 'Common questions and answers regarding courier screening and delivery rates.'}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-bold text-slate-900 dark:text-white hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  <span className="text-sm sm:text-base leading-snug">{faq.q}</span>
                  <span className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-700 dark:text-slate-200 border-t border-slate-100 dark:border-slate-800/80 leading-relaxed font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: MERCHANT CTA BANNER (আজই শুরু করুন)
          ========================================================================= */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-700/20 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md uppercase tracking-wider">
            {lang === 'bn' ? 'মাসে ১০০ ফ্রি চেক + সাশ্রয়ী প্যাকেজ' : '100 Free Checks / Month + Scalable Packages'}
          </span>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {lang === 'bn' ? 'আজই আপনার অনলাইন শপের ডেলিভারি লস বন্ধ করুন' : 'Stop Cash-on-Delivery Return Losses Today'}
          </h2>

          <p className="text-sm sm:text-base text-emerald-50 leading-relaxed">
            {lang === 'bn'
              ? '৩০ সেকেন্ডে অ্যাকাউন্ট খুলে প্রতি মাসে ১০০টি ফ্রি চেক উপভোগ করুন। আরও বেশি ভলিউম বা ১০০ সার্চ শেষ হলে রয়েছে প্রো (৳৪৯৯/মাস) ও এন্টারপ্রাইজ (৳১,৪৯৯/মাস) প্যাকেজ।'
              : 'Sign up in 30 seconds to enjoy 100 free monthly checks. Upgrade to Pro (৳499/mo) or Unlimited Enterprise (৳1,499/mo) when limits are reached.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="px-6 py-3 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'bn' ? 'ফ্রি সাইন আপ (১০০ চেক)' : 'Free Sign Up (100 checks)'}</span>
              <ArrowRight className="w-4 h-4 text-emerald-700" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('pricing')}
              className="px-6 py-3 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-white font-bold text-sm border border-emerald-400/50 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-current" />
              <span>{lang === 'bn' ? 'প্যাকেজ ও প্রাইসিং দেখুন' : 'View Packages & Pricing'}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
