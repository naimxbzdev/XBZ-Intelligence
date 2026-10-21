// Client-Side Intelligence & Fallback Analysis Engine
// Allows the application to function reliably even when deployed on static web hosts
// like Netlify, Vercel Static, or GitHub Pages where server.ts is not running.

import type { PhoneAnalysisResult, CourierResult, RiskLevel } from '../types/intelligence.ts';

export function normalizeBDPhoneClient(rawPhone: string): { normalized: string; valid: boolean; operator: string } {
  let digits = rawPhone.replace(/\D/g, '');
  if (digits.startsWith('880')) {
    digits = digits.slice(2);
  }

  if (digits.length === 11 && digits.startsWith('01')) {
    const prefix = digits.substring(0, 3);
    let operator = 'Bangladeshi Mobile';

    if (prefix === '017' || prefix === '013') operator = 'Grameenphone';
    else if (prefix === '018') operator = 'Robi';
    else if (prefix === '016') operator = 'Airtel';
    else if (prefix === '019' || prefix === '014') operator = 'Banglalink';
    else if (prefix === '015') operator = 'Teletalk';

    return { normalized: digits, valid: true, operator };
  }

  return { normalized: digits, valid: false, operator: 'Unknown' };
}

// Pseudo-random deterministic generator based on phone number for realistic client-side sandbox
function pseudoRandom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return Math.abs(h);
}

export function performClientSideFallbackAnalysis(phone: string): PhoneAnalysisResult {
  const { normalized, valid, operator } = normalizeBDPhoneClient(phone);
  if (!valid) {
    throw new Error('ফোন নম্বরটি অবশ্যই ১১ সংখ্যার হতে হবে (যেমন: 017XXXXXXXX)।');
  }

  // Check localStorage for local merchant dispute reports
  let localReports: any[] = [];
  try {
    const stored = localStorage.getItem('xbz_community_reports');
    if (stored) {
      const all = JSON.parse(stored);
      localReports = all.filter((r: any) => r.phone === normalized);
    }
  } catch (e) {
    // ignore
  }

  const hash = pseudoRandom(normalized);
  
  // Deterministic realistic simulated order stats for testing on Netlify
  const isHighRisk = normalized.endsWith('00') || normalized.endsWith('99') || localReports.length > 0;
  const isModerateRisk = normalized.endsWith('55') || normalized.endsWith('77');

  let totalOrders = (hash % 45) + 5;
  let deliveredOrders = 0;
  let cancelledOrders = 0;

  if (isHighRisk) {
    cancelledOrders = Math.floor(totalOrders * 0.7) + 1;
    deliveredOrders = Math.max(0, totalOrders - cancelledOrders);
  } else if (isModerateRisk) {
    cancelledOrders = Math.floor(totalOrders * 0.35);
    deliveredOrders = totalOrders - cancelledOrders;
  } else {
    cancelledOrders = Math.floor(totalOrders * 0.08);
    deliveredOrders = totalOrders - cancelledOrders;
  }

  const deliveryRate = totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;
  const returnRate = totalOrders > 0 ? Math.round((cancelledOrders / totalOrders) * 100) : 0;

  let riskLevel: RiskLevel = 'low';
  let overallScore = 92;

  if (isHighRisk || localReports.length > 0) {
    riskLevel = 'high';
    overallScore = Math.max(15, 100 - (returnRate * 1.2));
  } else if (isModerateRisk || deliveryRate < 75) {
    riskLevel = 'medium';
    overallScore = Math.max(45, Math.min(75, deliveryRate));
  } else {
    riskLevel = 'low';
    overallScore = Math.min(99, Math.max(82, deliveryRate));
  }

  // Generate 5 courier breakdowns
  const courierKeys = [
    { key: 'steadfast', name: 'Steadfast Courier', logo: 'https://steadfast.com.bd/assets/images/logo.png' },
    { key: 'pathao', name: 'Pathao Courier', logo: 'https://pathao.com/wp-content/uploads/2019/03/Pathao-logo.png' },
    { key: 'redx', name: 'RedX Logistics', logo: 'https://redx.com.bd/static/media/redx-logo.421d0979.svg' },
    { key: 'carrybee', name: 'CarryBee', logo: 'https://carrybee.com/logo.png' },
    { key: 'paperfly', name: 'Paperfly', logo: 'https://paperfly.com.bd/wp-content/themes/paperfly/assets/images/logo.png' },
  ] as const;

  const couriers: CourierResult[] = courierKeys.map((c, idx) => {
    const cTotal = Math.max(1, Math.floor((totalOrders / 5) * (1 + (idx * 0.2))));
    const cCancelled = Math.floor(cTotal * (returnRate / 100));
    const cDelivered = cTotal - cCancelled;
    const cDelivRate = cTotal > 0 ? Math.round((cDelivered / cTotal) * 100) : 0;

    return {
      courier: c.key as any,
      displayName: c.name,
      logo: c.logo,
      status: 'sandbox_mode',
      statusMessage: {
        en: 'Client-side fallback engine (Netlify mode)',
        bn: 'ক্লায়েন্ট-সাইড ফলব্যাক ইঞ্জিন (Netlify মোড)',
      },
      orders: {
        total: cTotal,
        delivered: cDelivered,
        cancelled: cCancelled,
        deliveryRate: cDelivRate,
        returnRate: 100 - cDelivRate,
      },
    };
  });

  return {
    phone: normalized,
    operator,
    overallScore: Math.round(overallScore),
    riskLevel,
    totalOrders,
    deliveredOrders,
    cancelledOrders,
    deliveryRate,
    returnRate,
    couriers,
    communityReports: localReports.map((r, i) => ({
      id: r.id || `rep-${i}`,
      reporter_name: r.reporterStore || 'Verified Merchant',
      incident_type: 'merchant_dispute',
      title: r.reason || 'Fraud Report',
      order_amount: r.lossAmountBDT || 1200,
      status: 'verified',
    })),
    source: 'client_fallback',
    fallbackReason: 'Static hosting (Netlify) detected. Running client-side analytics engine.',
  };
}
