import React, { useState } from 'react';
import { Code2, Copy, Check, Terminal, FileCode2, Globe2, ShieldCheck, Zap, Layers, Server, Gauge, ArrowRight } from 'lucide-react';
import type { Language } from '../utils/translations.ts';
import { translations } from '../utils/translations.ts';

interface ApiDocsViewProps {
  lang: Language;
  onNavigateQuota?: () => void;
}

export const ApiDocsView: React.FC<ApiDocsViewProps> = ({ lang, onNavigateQuota }) => {
  const [activeLang, setActiveLang] = useState<'curl' | 'php' | 'node' | 'python'>('curl');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedGet, setCopiedGet] = useState(false);
  const t = (translations && translations[lang]) ? translations[lang] : (translations?.bn || translations?.en);

  const codeSnippets = {
    curl: `curl -X POST "https://fraudchecker.smartposbd.com/api/v1/fraud-check" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -H "X-API-KEY: your_api_key_here" \\
  -d '{"phone": "01614322788"}'`,

    php: `<?php
// PHP / Laravel & WooCommerce Fraud Verification
$phone = '01614322788';
$apiKey = 'your_api_key_here';

$response = wp_remote_post('https://fraudchecker.smartposbd.com/api/v1/fraud-check', [
    'headers' => [
        'Content-Type' => 'application/json',
        'Accept'       => 'application/json',
        'X-API-KEY'    => $apiKey,
        'X-Domain'     => 'yourstore.com' // Optional domain lock
    ],
    'body'    => json_encode(['phone' => $phone]),
    'timeout' => 5
]);

if (!is_wp_error($response)) {
    $result = json_decode(wp_remote_retrieve_body($response), true);
    
    // Check score & status
    if ($result['status'] === 'High Risk' || $result['score'] < 50) {
        // Enforce advance COD payment
        wc_add_notice('উচ্চ রিটার্ন ঝুঁকির কারণে সম্পূর্ণ ডেলিভারি চার্জ অগ্রিম প্রযোজ্য।', 'error');
    }
}`,

    node: `import axios from 'axios';

async function checkFraudRisk(phone) {
  try {
    const response = await axios.post(
      'https://fraudchecker.smartposbd.com/api/v1/fraud-check',
      { phone },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-API-KEY': 'your_api_key_here',
          'X-Domain': 'yourstore.com' // Optional
        }
      }
    );

    const { score, status, source, total_parcel, response: couriers } = response.data;
    console.log(\`Score: \${score}%, Status: \${status}, Source: \${source}\`);
    return response.data;
  } catch (err) {
    console.error('API Error:', err.response?.data || err.message);
  }
}`,

    python: `import requests

def check_fraud(phone_number: str, api_key: str):
    url = "https://fraudchecker.smartposbd.com/api/v1/fraud-check"
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-API-KEY": api_key
    }
    payload = {"phone": phone_number}

    response = requests.post(url, json=payload, headers=headers, timeout=5)
    data = response.json()
    
    print(f"Status: {data.get('status')}, Delivery Score: {data.get('score')}%")
    return data`
  };

  const getCurlExample = `curl -X GET "https://fraudchecker.smartposbd.com/api/v1/fraud-check/01614322788" \\
  -H "Accept: application/json" \\
  -H "X-API-KEY: your_api_key_here"`;

  const copyCode = (code: string, isGet = false) => {
    navigator.clipboard.writeText(code);
    if (isGet) {
      setCopiedGet(true);
      setTimeout(() => setCopiedGet(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Core Highlights */}
      <div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
          <Code2 className="w-6 h-6 text-cyan-400" />
          <span>{t.apiDocs.title}</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-4xl leading-relaxed">
          {t.apiDocs.subtitle}
        </p>

        {/* 3 Pillars strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-5">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-white block">হেডার অথেনটিকেশন</span>
              <span className="text-[11px] text-slate-400 font-mono">X-API-KEY ও Bearer সাপোর্ট</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <Zap className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-white block">সাব-২০ms ইঞ্জিন</span>
              <span className="text-[11px] text-slate-400">১৫ দিনের লোকাল ক্যাশড ভেরিফিকেশন</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <Layers className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-white block">৫টি কুরিয়ার নেটওয়ার্ক</span>
              <span className="text-[11px] text-slate-400 font-mono">Steadfast, Pathao, RedX, CarryBee, Paperfly</span>
            </div>
          </div>
        </div>

        {/* Enterprise Usage Quota Status Strip */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-cyan-950/40 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs sm:text-sm">
                  {lang === 'bn' ? 'এন্টারপ্রাইজ API ব্যবহার কোটা ট্র্যাকার' : 'Enterprise API Usage Quota Tracker'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                  90% Alert Active
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {lang === 'bn'
                  ? 'দৈনিক ৫,০০০ এবং মাসিক ১৫০,০০০ রিকোয়েস্ট লিমিট ট্র্যাকিং ও স্বয়ংক্রিয় থ্রেশহোল্ড অ্যালার্ট'
                  : 'Track daily (5,000) and monthly (150,000) limits with real-time 90% threshold warnings'}
              </p>
            </div>
          </div>
          {onNavigateQuota && (
            <button
              onClick={onNavigateQuota}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <span>{lang === 'bn' ? 'ব্যবহার কোটা মনিটর' : 'View Quota Monitor'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* HTTP Headers & Domain Locking */}
      <div className="p-5 rounded-2xl bg-[#0d1527]/90 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Server className="w-4 h-4 text-cyan-400" />
          <span>অথেনটিকেশন ও প্রয়োজনীয় HTTP হেডারসমূহ</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">X-API-KEY:</span>
            <span className="text-slate-300 text-[11px] break-all">fraud_live_9a87d...token</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">Accept:</span>
            <span className="text-slate-300 text-[11px]">application/json</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">Content-Type:</span>
            <span className="text-slate-300 text-[11px]">application/json</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">X-Domain (ঐচ্ছিক):</span>
            <span className="text-slate-300 text-[11px]">yourstore.com (ডোমেন লক)</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          টোকেন অপব্যবহার ও চুরি রোধে আপনি আপনার মার্চেন্ট ড্যাশবোর্ড থেকে API কী নির্দিষ্ট ডোমেনে (যেমন: yourstore.com) লক করে রাখতে পারেন। API স্বয়ংক্রিয়ভাবে Origin, Referer এবং X-Domain যাচাই করে অনুমোদনহীন রিকোয়েস্টে 403 Forbidden প্রদান করে।
        </p>
      </div>

      {/* Endpoint 1: POST /api/v1/fraud-check */}
      <div className="rounded-2xl bg-[#0d1527]/90 border border-slate-800 overflow-hidden shadow-xl">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold">
              POST
            </span>
            <span className="font-mono text-xs sm:text-sm font-bold text-white">
              /api/v1/fraud-check
            </span>
          </div>

          <div className="flex items-center gap-1 mt-2 sm:mt-0">
            <button
              onClick={() => setActiveLang('curl')}
              className={`px-3 py-1 rounded-md text-xs font-mono font-semibold transition-colors ${
                activeLang === 'curl' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              cURL
            </button>
            <button
              onClick={() => setActiveLang('php')}
              className={`px-3 py-1 rounded-md text-xs font-mono font-semibold transition-colors ${
                activeLang === 'php' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              PHP / Laravel
            </button>
            <button
              onClick={() => setActiveLang('node')}
              className={`px-3 py-1 rounded-md text-xs font-mono font-semibold transition-colors ${
                activeLang === 'node' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Node.js
            </button>
            <button
              onClick={() => setActiveLang('python')}
              className={`px-3 py-1 rounded-md text-xs font-mono font-semibold transition-colors ${
                activeLang === 'python' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Python
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="relative p-4 sm:p-5 overflow-x-auto bg-[#070b14]/90">
          <button
            onClick={() => copyCode(codeSnippets[activeLang])}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
          </button>
          <pre className="text-xs sm:text-sm font-mono text-cyan-200 leading-relaxed whitespace-pre">
            <code>{codeSnippets[activeLang]}</code>
          </pre>
        </div>
      </div>

      {/* Endpoint 2: GET /api/v1/fraud-check/{phone} */}
      <div className="p-5 rounded-2xl bg-[#0d1527]/90 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
              GET
            </span>
            <span className="font-mono text-xs sm:text-sm font-bold text-white">
              /api/v1/fraud-check/&#123;phone&#125;
            </span>
          </div>

          <button
            onClick={() => copyCode(getCurlExample, true)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors"
          >
            {copiedGet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedGet ? 'Copied!' : 'cURL GET'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-400">
          সহজ GET ইন্টিগ্রেশনের জন্য হালকা এন্ডপয়েন্ট। URL পাথে সরাসরি ১১-সংখ্যার নম্বরটি দিন (যেমন: /api/v1/fraud-check/01614322788)।
        </p>

        <pre className="p-3 bg-slate-900 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto">
          <code>{getCurlExample}</code>
        </pre>
      </div>

      {/* Sample JSON Responses Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">
          স্যাম্পল JSON রেসপন্স (Official Response Schemas)
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Safe 200 */}
          <div className="p-4 rounded-2xl bg-[#0d1527]/90 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-emerald-400 font-mono">
                200 OK — নিরাপদ গ্রাহক (৯৭.১৪%)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">database_cache</span>
            </div>

            <pre className="text-[11px] font-mono text-emerald-300 bg-slate-950 p-3 rounded-xl overflow-x-auto max-h-80 overflow-y-auto leading-relaxed">
{`{
  "phone": "01614322788",
  "score": 97.14,
  "status": "Safe",
  "source": "database_cache",
  "total_parcel": 86,
  "success_parcel": 77,
  "cancel_parcel": 9,
  "unresolved_reports": 0,
  "community_reports": [],
  "response": {
    "steadfast": {
      "status": true,
      "message": "Successful.",
      "data": {
        "total": 30,
        "success": 29,
        "cancel": 1,
        "deliveredPercentage": 97.00,
        "returnPercentage": 2.00,
        "response_time": 0.543
      }
    },
    "pathao": {
      "status": true,
      "message": "Successful.",
      "data": {
        "total": 40,
        "success": 39,
        "cancel": 1,
        "deliveredPercentage": 97.50,
        "returnPercentage": 2.50,
        "rating": "excellent_customer",
        "response_time": 0.687
      }
    },
    "redx": {
      "status": true,
      "message": "Successful.",
      "data": {
        "total": 10,
        "success": 6,
        "cancel": 4,
        "deliveredPercentage": 60.00,
        "returnPercentage": 40.00,
        "rating": "moderate_customer",
        "response_time": 0.288
      }
    },
    "carrybee": {
      "status": true,
      "message": "Successful.",
      "data": {
        "total": 6,
        "success": 3,
        "cancel": 3,
        "deliveredPercentage": 50.00,
        "returnPercentage": 50.00,
        "response_time": 0.530
      }
    },
    "paperfly": {
      "status": true,
      "message": "Successful.",
      "data": {
        "total": 0,
        "success": 0,
        "cancel": 0,
        "deliveredPercentage": 0.00,
        "returnPercentage": 0.00,
        "rating": "No Data Available",
        "response_time": 0.364
      }
    }
  }
}`}
            </pre>
          </div>

          {/* High Risk 200 */}
          <div className="p-4 rounded-2xl bg-[#0d1527]/90 border border-rose-500/30 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-rose-400 font-mono">
                200 OK — উচ্চ ঝুঁকি (৩৬.৩৬%)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">live</span>
            </div>

            <pre className="text-[11px] font-mono text-rose-300 bg-slate-950 p-3 rounded-xl overflow-x-auto max-h-80 overflow-y-auto leading-relaxed">
{`{
  "phone": "01812984561",
  "score": 36.36,
  "status": "High Risk",
  "source": "live",
  "total_parcel": 22,
  "success_parcel": 8,
  "cancel_parcel": 14,
  "unresolved_reports": 1,
  "community_reports": [
    {
      "id": 14,
      "reporter_name": "Fashion Store BD",
      "incident_type": "fake_order",
      "title": "Customer refused delivery without answering phone",
      "order_amount": 1850,
      "courier_name": "steadfast",
      "status": "verified"
    }
  ],
  "response": {
    "steadfast": {
      "status": true,
      "message": "Successful.",
      "data": {
        "total": 15,
        "success": 4,
        "cancel": 11,
        "deliveredPercentage": 26.67,
        "returnPercentage": 73.33,
        "response_time": 0.512
      }
    },
    "pathao": {
      "status": true,
      "message": "Successful.",
      "data": {
        "total": 7,
        "success": 4,
        "cancel": 3,
        "deliveredPercentage": 57.14,
        "returnPercentage": 42.86,
        "rating": "bad_customer",
        "response_time": 0.655
      }
    },
    "redx": {
      "status": true,
      "message": "Successful.",
      "data": {
        "total": 0,
        "success": 0,
        "cancel": 0,
        "deliveredPercentage": 0.00,
        "returnPercentage": 0.00,
        "response_time": 0.290
      }
    },
    "carrybee": {
      "status": true,
      "message": "Successful.",
      "data": {
        "total": 0,
        "success": 0,
        "cancel": 0,
        "deliveredPercentage": 0.00,
        "returnPercentage": 0.00,
        "response_time": 0.520
      }
    },
    "paperfly": {
      "status": true,
      "message": "Successful.",
      "data": {
        "total": 0,
        "success": 0,
        "cancel": 0,
        "deliveredPercentage": 0.00,
        "returnPercentage": 0.00,
        "response_time": 0.350
      }
    }
  }
}`}
            </pre>
          </div>
        </div>
      </div>

      {/* HTTP Status Codes & Error Handling Table */}
      <div className="p-5 rounded-2xl bg-[#0d1527]/90 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          এইচটিটিপি স্ট্যাটাস কোড ও এরর হ্যান্ডলিং
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="font-mono text-emerald-400 font-bold block mb-1">200 OK (সফল)</span>
            <span className="text-slate-400">গ্রাহকের ডেলিভারি রেকর্ড ও ফ্রড স্কোর সফলভাবে প্রদান করা হয়েছে।</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="font-mono text-amber-400 font-bold block mb-1">400 Bad Request</span>
            <span className="text-slate-400">মোবাইল নম্বরটি ১১ সংখ্যার বৈধ বাংলাদেশি নম্বর নয়।</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="font-mono text-rose-400 font-bold block mb-1">401 Unauthorized</span>
            <span className="text-slate-400">X-API-KEY বা Bearer হেডারে API টোকেন অনুপস্থিত বা মেয়াদোত্তীর্ণ।</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="font-mono text-red-400 font-bold block mb-1">403 Forbidden</span>
            <span className="text-slate-400">API কী নিষ্ক্রিয় অথবা ডোমেন/আইপি রেস্ট্রিকশন অমান্য হয়েছে।</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="font-mono text-cyan-400 font-bold block mb-1">429 Rate Limit</span>
            <span className="text-slate-400">অনুরোধের সীমা অতিক্রম হয়েছে (প্রতি মিনিটে ৬০টি রিকোয়েস্ট)।</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="font-mono text-purple-400 font-bold block mb-1">500 Internal Error</span>
            <span className="text-slate-400">কুরিয়ার সার্ভারজনিত ডাউনটাইমে অটো অফলাইন ব্যাকআপ ক্যাশ থেকে তথ্য প্রদান।</span>
          </div>
        </div>
      </div>
    </div>
  );
};
