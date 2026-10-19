import type { 
  CourierName, 
  CourierResult, 
  PhoneAnalysisResult, 
  RiskLevel, 
  CourierConfig,
  SmartposApiResponse,
  SmartposCommunityReport,
} from '../types/intelligence.ts';
import { SmartposClient } from './smartposClient.ts';
import { reportsDb } from './reportsDb.ts';

export function normalizeBDPhone(rawPhone: string): { normalized: string; valid: boolean; operator: string } {
  // Strip non-digits
  let digits = rawPhone.replace(/\D/g, '');

  // Strip international prefix +880 or 880
  if (digits.startsWith('880')) {
    digits = digits.slice(2);
  }

  // Must be 11 digits starting with 01
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

export async function analyzePhoneNumber(
  phone: string, 
  config: CourierConfig
): Promise<PhoneAnalysisResult> {
  const { normalized, valid, operator } = normalizeBDPhone(phone);

  if (!valid) {
    throw new Error('The phone number must be exactly 11 digits (e.g. 017XXXXXXXX).');
  }

  // 1. Query unified Fraud Screening REST API / Cached Engine
  const apiData: SmartposApiResponse = await SmartposClient.checkPhone(
    normalized,
    config.smartposApiKey,
    config.smartposDomain
  );

  // 2. Query local community reports database
  const localDbReports = reportsDb.getReportsByPhone(normalized);

  // Merge community reports
  const allCommunityReports: SmartposCommunityReport[] = [...apiData.community_reports];
  for (const r of localDbReports) {
    if (!allCommunityReports.some(cr => String(cr.id) === String(r.id))) {
      allCommunityReports.push({
        id: r.id,
        reporter_name: r.reporterStore,
        incident_type: 'merchant_dispute',
        title: r.reason,
        order_amount: r.lossAmountBDT,
        courier_name: r.courierConsignment ? 'steadfast' : undefined,
        status: 'verified',
      });
    }
  }

  const unresolvedReports = Math.max(apiData.unresolved_reports, allCommunityReports.length);

  // 3. Construct 5 courier items
  const rawCouriers = apiData.response || {};
  const isSandbox = !config.smartposApiKey && !process.env.SMARTPOS_FRAUD_API_KEY && (config.enableSandbox !== false);

  const buildCourierResult = (
    key: CourierName,
    displayName: string,
    logo: string
  ): CourierResult => {
    const item = (rawCouriers as any)[key];
    const data = item?.data || { total: 0, success: 0, cancel: 0, deliveredPercentage: 0, returnPercentage: 0 };

    const total = Number(data.total || 0);
    const delivered = Number(data.success || 0);
    const cancelled = Number(data.cancel || 0);
    const delivRate = total > 0 ? Number(data.deliveredPercentage || Math.round((delivered / total) * 100)) : 0;
    const retRate = total > 0 ? Number(data.returnPercentage || Math.round((cancelled / total) * 100)) : 0;

    return {
      courier: key,
      displayName,
      logo,
      status: apiData.source === 'live' ? 'connected' : (isSandbox ? 'sandbox_mode' : 'connected'),
      statusMessage: {
        bn: item?.message === 'Successful.' ? (apiData.source === 'live' ? 'লাইভ গেটওয়ে থেকে সরাসরি সংগৃহীত' : '১৫-দিনের লোকাল ক্যাশড ডেটা') : 'রেকর্ড পাওয়া যায়নি',
        en: item?.message === 'Successful.' ? (apiData.source === 'live' ? 'Verified from live gateway' : '15-day cached intelligence') : 'No records found',
      },
      totalOrders: total,
      deliveredOrders: delivered,
      cancelledOrders: cancelled,
      deliveryRate: delivRate,
      returnRate: retRate,
      rating: data.rating,
      responseTime: data.response_time,
      lastActiveDate: total > 0 ? '2026-03-24' : undefined,
    };
  };

  const courierBreakdown: Record<CourierName, CourierResult> = {
    steadfast: buildCourierResult('steadfast', 'Steadfast Courier', 'https://steadfast.com.bd/images/logo.png'),
    pathao: buildCourierResult('pathao', 'Pathao Courier', 'https://pathao.com/wp-content/uploads/2021/04/Pathao-logo.png'),
    redx: buildCourierResult('redx', 'REDX Delivery', 'https://redx.com.bd/static/media/redx-logo.png'),
    carrybee: buildCourierResult('carrybee', 'CarryBee', 'https://carrybee.com/favicon.ico'),
    paperfly: buildCourierResult('paperfly', 'Paperfly (Smart Check v2)', 'https://paperfly.com.bd/assets/images/logo.png'),
  };

  const totalOrders = apiData.total_parcel;
  const deliveredOrders = apiData.success_parcel;
  const cancelledOrders = apiData.cancel_parcel;
  const deliveryRate = totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;
  const returnRate = totalOrders > 0 ? Math.round((cancelledOrders / totalOrders) * 100) : 0;

  // 4. Map Risk Level & Exact Policy
  let riskLevel: RiskLevel = 'new_customer';
  let status = apiData.status;

  if (totalOrders === 0 && unresolvedReports === 0) {
    riskLevel = 'new_customer';
    status = 'New Customer';
  } else if (unresolvedReports > 0) {
    riskLevel = 'blacklisted';
    status = 'High Risk';
  } else if (apiData.score >= 80) {
    riskLevel = 'low';
    status = 'Safe';
  } else if (apiData.score >= 50) {
    riskLevel = 'medium';
    status = 'Moderate Risk';
  } else {
    riskLevel = 'high';
    status = 'High Risk';
  }

  // 5. Official Delivery Policy Recommendations from SmartPOS spec
  let recommendation = {
    bn: '',
    en: '',
  };

  if (riskLevel === 'low' || status === 'Safe') {
    recommendation = {
      bn: 'নিরাপদ গ্রাহক (Safe): স্কোর ৮০% বা তার বেশি। অতীত ডেলিভারি সফলতার হার চমৎকার। অগ্রিম ডেলিভারি চার্জ ছাড়াই সাধারণ ক্যাশ অন ডেলিভারি (COD) পার্সেল বুকিং করতে পারেন।',
      en: 'Safe Customer: Score 80%+. Excellent past delivery track record. Standard Cash on Delivery (COD) booking without advance shipping fee.',
    };
  } else if (riskLevel === 'medium' || status === 'Moderate Risk') {
    recommendation = {
      bn: 'মাঝারি ঝুঁকি (Moderate Risk): স্কোর ৫০–৭৯%। মাঝেমধ্যে পার্সেল বাতিলের পূর্ব ইতিহাস রয়েছে। পার্সেল বুকিং দেওয়ার পূর্বে গ্রাহককে কল দিয়ে অর্ডার নিশ্চিত করার পরামর্শ দেওয়া হয়।',
      en: 'Moderate Risk: Score 50–79%. Occasional parcel cancellation history. Calling customer to verify shipping address before dispatch is advised.',
    };
  } else if (riskLevel === 'new_customer') {
    recommendation = {
      bn: 'নতুন গ্রাহক (New Customer): পূর্ববর্তী কোনো পার্সেল হিস্ট্রি পাওয়া যায়নি। ফোন নম্বরে যোগাযোগ করে ডেলিভারি লোকেশন ও যোগাযোগের সঠিকতা নিশ্চিত করে অর্ডার প্রসেস করুন।',
      en: 'New Customer: No historical delivery records in supported couriers. Confirm recipient phone and location accessibility before sending.',
    };
  } else {
    recommendation = {
      bn: 'উচ্চ ঝুঁকি (High Risk): স্কোর ৫০% এর কম অথবা সক্রিয় ফ্রড রিপোর্ট রয়েছে। ঘন ঘন পার্সেল ফেরত আসার রেকর্ড আছে। পার্সেল পাঠানোর পূর্বে অবশ্যই সম্পূর্ণ ডেলিভারি চার্জ অগ্রিম নিন।',
      en: 'High Risk: Score below 50% or active dispute reports. History of frequent parcel rejections. Mandatory to collect 100% advance delivery fee.',
    };
  }

  // Risk Factors list
  const riskFactorsBn: string[] = [];
  const riskFactorsEn: string[] = [];

  if (unresolvedReports > 0) {
    riskFactorsBn.push(`কমিউনিটি ডাটাবেসে ${unresolvedReports}টি সক্রিয় ফ্রড বা ডেলিভারি প্রত্যাখ্যান রিপোর্ট পাওয়া গেছে`);
    riskFactorsEn.push(`${unresolvedReports} active merchant fraud/rejection dispute report(s) found`);
  }

  if (totalOrders > 0) {
    riskFactorsBn.push(`মোট ৫টি কুরিয়ার মিলে ${totalOrders}টি অর্ডারের মধ্যে ${deliveredOrders}টি সফল ডেলিভারি (${apiData.score}%)`);
    riskFactorsEn.push(`Consolidated across 5 couriers: ${deliveredOrders} delivered successfully out of ${totalOrders} orders (${apiData.score}%)`);
  }

  // Add courier ratings if present
  for (const c of Object.values(courierBreakdown)) {
    if (c.totalOrders > 0) {
      const ratingText = c.rating ? ` [${c.rating.replace('_', ' ')}]` : '';
      riskFactorsBn.push(`${c.displayName}: ${c.deliveredOrders}/${c.totalOrders} সফল ডেলিভারি${ratingText}`);
      riskFactorsEn.push(`${c.displayName}: ${c.deliveredOrders}/${c.totalOrders} delivered${ratingText}`);
    }
  }

  return {
    phone,
    normalizedPhone: normalized,
    operator,
    score: apiData.score,
    status,
    source: apiData.source,
    totalOrders,
    deliveredOrders,
    cancelledOrders,
    deliveryRate,
    returnRate,
    unresolvedReports,
    riskLevel,
    riskScore: Math.round(apiData.score),
    recommendation,
    riskFactors: {
      bn: riskFactorsBn,
      en: riskFactorsEn,
    },
    courierBreakdown,
    communityReports: allCommunityReports,
    legacyReports: localDbReports,
    rawSmartpos: apiData,
    searchedAt: new Date().toISOString(),
    isSandbox,
  };
}
