import type { CourierName, CourierResult, CourierStatusInfo, CourierConfig } from '../types/intelligence.ts';

export class CourierRegistry {
  static getCourierInfos(config: CourierConfig): CourierStatusInfo[] {
    const isSandbox = config.enableSandbox !== false;
    const hasSmartpos = Boolean(config.smartposApiKey || process.env.SMARTPOS_FRAUD_API_KEY);

    return [
      {
        courier: 'steadfast',
        displayName: 'Steadfast Courier',
        status: hasSmartpos || config.steadfastApiKey ? 'connected' : (isSandbox ? 'sandbox_mode' : 'not_configured'),
        description: {
          bn: 'বাংলাদেশের শীর্ষ কুরিয়ার। অফিসিয়াল মার্চেন্ট এপিআই ও সেন্ট্রাল গেটওয়ে দিয়ে ফোন ফ্রড চেক সাপোর্ট করে।',
          en: 'Leading courier in Bangladesh. Supports phone number fraud checking via merchant API & unified gateway.'
        },
        phoneLookupSupported: true,
        officialDocUrl: 'https://portal.steadfast.com.bd/api-doc',
        requiredFields: ['Api-Key', 'Secret-Key']
      },
      {
        courier: 'pathao',
        displayName: 'Pathao Courier',
        status: hasSmartpos || config.pathaoClientId ? 'connected' : (isSandbox ? 'sandbox_mode' : 'unsupported_lookup'),
        description: {
          bn: 'পাঠাও মার্চেন্ট নেটওয়ার্ক। সেন্ট্রাল এপিআই দিয়ে রেটিং (excellent, moderate, bad) ও সফল ডেলিভারি হিস্ট্রি প্রাপ্তি।',
          en: 'Pathao Courier network. Integrated rating indicators (excellent, moderate, bad) and delivery stats.'
        },
        phoneLookupSupported: true,
        officialDocUrl: 'https://developer.pathao.com',
        requiredFields: ['client_id', 'client_secret']
      },
      {
        courier: 'redx',
        displayName: 'REDX Delivery',
        status: hasSmartpos || config.redxApiToken ? 'connected' : (isSandbox ? 'sandbox_mode' : 'not_configured'),
        description: {
          bn: 'রেডএক্স ডেলিভারি নেটওয়ার্ক। মার্চেন্ট টোকেন ও সেন্ট্রাল এপিআই ভিত্তিক পার্সেল ট্র্যাকিং ও সফলতার হার।',
          en: 'REDX Delivery Network. Token & gateway based parcel verification and success rates.'
        },
        phoneLookupSupported: true,
        officialDocUrl: 'https://openapi.redx.com.bd',
        requiredFields: ['api_token']
      },
      {
        courier: 'carrybee',
        displayName: 'CarryBee',
        status: hasSmartpos || config.carrybeeApiKey ? 'connected' : (isSandbox ? 'sandbox_mode' : 'not_configured'),
        description: {
          bn: 'ক্যারিবি এক্সপ্রেস ডেলিভারি নেটওয়ার্ক। রিয়েল-টাইম পার্সেল সংখ্যা, সফল ডেলিভারি ও রিটার্ন মেট্রিক্স।',
          en: 'CarryBee Express Delivery. Real-time parcel counts, successful deliveries, and return statistics.'
        },
        phoneLookupSupported: true,
        officialDocUrl: 'https://carrybee.com',
        requiredFields: ['api_key']
      },
      {
        courier: 'paperfly',
        displayName: 'Paperfly (Smart Check v2)',
        status: hasSmartpos || config.paperflyKey ? 'connected' : (isSandbox ? 'sandbox_mode' : 'not_configured'),
        description: {
          bn: 'পেপারফ্লাই উইংস ডোরস্টেপ কুরিয়ার। রিটার্ন-টু-সেলার (RTS) অ্যানালাইসিস ও কাস্টমার রেটিং।',
          en: 'Paperfly Wings doorstep courier. RTS return analysis & customer delivery evaluation.'
        },
        phoneLookupSupported: true,
        officialDocUrl: 'https://api.paperfly.com.bd',
        requiredFields: ['username', 'password/key']
      }
    ];
  }
}
