import fs from 'fs';
import path from 'path';

export interface QuotaNotification {
  id: string;
  type: 'warning_90_daily' | 'warning_90_monthly' | 'exceeded_daily' | 'exceeded_monthly' | 'info';
  title: string;
  message: string;
  percentage: number;
  timestamp: string;
  acknowledged: boolean;
}

export interface ApiQuotaRecord {
  userId: string;
  userEmail: string;
  apiKey: string;
  planId: 'free' | 'pro' | 'enterprise';
  tierName: string;
  dailyLimit: number;
  dailyUsed: number;
  monthlyLimit: number;
  monthlyUsed: number;
  lastResetDaily: string;
  lastResetMonthly: string;
  warningThreshold: number; // default 90%
  webhookUrl?: string;
  notifyEmail?: string;
  notifications: QuotaNotification[];
  hourlyTraffic: Array<{ hour: string; requests: number }>;
  dailyTraffic: Array<{ date: string; requests: number }>;
}

const getTodayDateStr = () => new Date().toISOString().slice(0, 10);
const getCurrentMonthStr = () => new Date().toISOString().slice(0, 7);

const generateDefaultHourly = (baseCount: number) => {
  const currentHour = new Date().getUTCHours();
  return Array.from({ length: 24 }).map((_, i) => {
    const hourLabel = `${String(i).padStart(2, '0')}:00`;
    // Distribute baseCount across hours up to currentHour
    let reqs = 0;
    if (i <= currentHour) {
      const weight = i >= 8 && i <= 21 ? 1.5 : 0.4;
      reqs = Math.max(5, Math.round((baseCount / (currentHour + 1)) * weight * (0.8 + Math.random() * 0.4)));
    }
    return { hour: hourLabel, requests: reqs };
  });
};

const generateDefaultDaily = (baseCount: number) => {
  const today = new Date();
  return Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (13 - i));
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const isToday = i === 13;
    const reqs = isToday ? baseCount : Math.round(3800 + Math.random() * 900);
    return { date: label, requests: reqs };
  });
};

// Realistic Seed Quotas for Enterprise / Admins / Pro Users
const INITIAL_QUOTAS: ApiQuotaRecord[] = [
  {
    userId: 'admin_naeem_webxpress',
    userEmail: 'naeem@webxpress.com.bd',
    apiKey: 'xbz_admin_webxpress_live_7e8d9c0b1a2f',
    planId: 'enterprise',
    tierName: 'Enterprise Unlimited API',
    dailyLimit: 5000,
    dailyUsed: 4620, // 92.4% -> triggers 90% warning
    monthlyLimit: 150000,
    monthlyUsed: 137400, // 91.6% -> triggers 90% monthly warning
    lastResetDaily: getTodayDateStr(),
    lastResetMonthly: getCurrentMonthStr(),
    warningThreshold: 90,
    webhookUrl: 'https://api.webxpress.com.bd/webhooks/fraud-alerts',
    notifyEmail: 'naeem@webxpress.com.bd',
    notifications: [
      {
        id: 'notif_ent_01',
        type: 'warning_90_daily',
        title: '⚠️ দৈনিক API কোটা ৯০% অতিক্রম করেছে',
        message: 'আপনার দৈনিক API রিকোয়েস্ট লিমিটের ৯২.৪% (৪,৬২০ / ৫,০০০) ব্যবহৃত হয়েছে। বাকি আছে মাত্র ৩৮০টি রিকোয়েস্ট।',
        percentage: 92.4,
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        acknowledged: false,
      },
      {
        id: 'notif_ent_02',
        type: 'warning_90_monthly',
        title: '📊 মাসিক এন্টারপ্রাইজ ভলিউম সতর্কতা',
        message: 'আপনার চলতি মাসের এন্টারপ্রাইজ কোটা ৯০% ছাড়িয়েছে (১৩৭,৪০০ / ১৫০,০০০)।',
        percentage: 91.6,
        timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        acknowledged: false,
      },
    ],
    hourlyTraffic: [
      { hour: '00:00', requests: 45 },
      { hour: '02:00', requests: 30 },
      { hour: '04:00', requests: 25 },
      { hour: '06:00', requests: 110 },
      { hour: '08:00', requests: 380 },
      { hour: '10:00', requests: 590 },
      { hour: '12:00', requests: 620 },
      { hour: '14:00', requests: 710 },
      { hour: '16:00', requests: 840 },
      { hour: '18:00', requests: 680 },
      { hour: '20:00', requests: 430 },
      { hour: '22:00', requests: 160 },
    ],
    dailyTraffic: [
      { date: 'Oct 13', requests: 4120 },
      { date: 'Oct 14', requests: 4350 },
      { date: 'Oct 15', requests: 4600 },
      { date: 'Oct 16', requests: 4210 },
      { date: 'Oct 17', requests: 4480 },
      { date: 'Oct 18', requests: 4720 },
      { date: 'Oct 19', requests: 4890 },
      { date: 'Oct 20', requests: 4500 },
      { date: 'Oct 21', requests: 4680 },
      { date: 'Oct 22', requests: 4850 },
      { date: 'Oct 23', requests: 4910 },
      { date: 'Oct 24', requests: 4590 },
      { date: 'Oct 25', requests: 4740 },
      { date: 'Oct 26', requests: 4620 },
    ],
  },
  {
    userId: 'admin_naim',
    userEmail: 'naimxbz@gmail.com',
    apiKey: 'xbz_admin_live_master_9a87d6e5c4b3a2',
    planId: 'enterprise',
    tierName: 'Enterprise Unlimited API',
    dailyLimit: 10000,
    dailyUsed: 2150,
    monthlyLimit: 300000,
    monthlyUsed: 84200,
    lastResetDaily: getTodayDateStr(),
    lastResetMonthly: getCurrentMonthStr(),
    warningThreshold: 90,
    notifyEmail: 'naimxbz@gmail.com',
    notifications: [],
    hourlyTraffic: generateDefaultHourly(2150),
    dailyTraffic: generateDefaultDaily(2150),
  },
  {
    userId: 'user_merchant_03',
    userEmail: 'mahmud@techzonebd.com',
    apiKey: 'fraud_live_e3f2d1c9b8a7654321',
    planId: 'enterprise',
    tierName: 'Enterprise Unlimited API',
    dailyLimit: 5000,
    dailyUsed: 4550, // 91%
    monthlyLimit: 150000,
    monthlyUsed: 121000,
    lastResetDaily: getTodayDateStr(),
    lastResetMonthly: getCurrentMonthStr(),
    warningThreshold: 90,
    notifyEmail: 'mahmud@techzonebd.com',
    notifications: [
      {
        id: 'notif_tz_01',
        type: 'warning_90_daily',
        title: '⚠️ দৈনিক API লিমিটের ৯১% অতিক্রম করেছে',
        message: 'TechZone BD এন্টারপ্রাইজ কোটার ৯১% ব্যবহৃত হয়েছে (৪,৫৫০ / ৫,০০০)।',
        percentage: 91,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      },
    ],
    hourlyTraffic: generateDefaultHourly(4550),
    dailyTraffic: generateDefaultDaily(4550),
  },
];

class ApiQuotaDatabase {
  private records: ApiQuotaRecord[] = [...INITIAL_QUOTAS];
  private storageFile = path.resolve(process.cwd(), '.api_quotas_db.json');

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(this.storageFile)) {
        const raw = fs.readFileSync(this.storageFile, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, ApiQuotaRecord>();
          INITIAL_QUOTAS.forEach((q) => map.set(q.userEmail.toLowerCase(), q));
          parsed.forEach((q: ApiQuotaRecord) => {
            if (q && q.userEmail) {
              map.set(q.userEmail.toLowerCase(), q);
            }
          });
          this.records = Array.from(map.values());
        }
      } else {
        this.saveToDisk();
      }
    } catch {
      // memory fallback
    }
  }

  private saveToDisk() {
    try {
      fs.writeFileSync(this.storageFile, JSON.stringify(this.records, null, 2), 'utf-8');
    } catch {
      // silent
    }
  }

  public getOrCreate(email: string, planId: 'free' | 'pro' | 'enterprise' = 'enterprise', apiKey?: string): ApiQuotaRecord {
    const cleanEmail = email.trim().toLowerCase();
    let record = this.records.find((r) => r.userEmail.toLowerCase() === cleanEmail);

    const todayStr = getTodayDateStr();
    const currentMonthStr = getCurrentMonthStr();

    if (!record) {
      const isEnt = planId === 'enterprise';
      const isPro = planId === 'pro';
      const dailyLimit = isEnt ? 5000 : isPro ? 500 : 50;
      const monthlyLimit = isEnt ? 150000 : isPro ? 15000 : 100;

      record = {
        userId: 'usr_quota_' + Date.now(),
        userEmail: cleanEmail,
        apiKey: apiKey || 'fraud_key_' + Math.random().toString(36).substr(2, 9),
        planId,
        tierName: isEnt ? 'Enterprise Unlimited API' : isPro ? 'Merchant Pro API' : 'Free Starter API',
        dailyLimit,
        dailyUsed: 0,
        monthlyLimit,
        monthlyUsed: 0,
        lastResetDaily: todayStr,
        lastResetMonthly: currentMonthStr,
        warningThreshold: 90,
        notifyEmail: cleanEmail,
        notifications: [],
        hourlyTraffic: generateDefaultHourly(0),
        dailyTraffic: generateDefaultDaily(0),
      };
      this.records.push(record);
      this.saveToDisk();
    } else {
      // Check auto-resets
      let needsSave = false;
      if (record.lastResetDaily !== todayStr) {
        record.dailyUsed = 0;
        record.lastResetDaily = todayStr;
        record.hourlyTraffic = generateDefaultHourly(0);
        needsSave = true;
      }
      if (record.lastResetMonthly !== currentMonthStr) {
        record.monthlyUsed = 0;
        record.lastResetMonthly = currentMonthStr;
        record.dailyTraffic = generateDefaultDaily(0);
        needsSave = true;
      }
      if (apiKey && apiKey !== record.apiKey) {
        record.apiKey = apiKey;
        needsSave = true;
      }
      if (needsSave) {
        this.saveToDisk();
      }
    }

    return record;
  }

  public recordApiRequest(identifier: string, count: number = 1): {
    allowed: boolean;
    dailyUsed: number;
    dailyLimit: number;
    monthlyUsed: number;
    monthlyLimit: number;
    approachingDaily: boolean;
    approachingMonthly: boolean;
    exceeded: boolean;
  } {
    const clean = identifier.trim().toLowerCase();
    const record = this.records.find((r) => r.userEmail.toLowerCase() === clean || r.apiKey === identifier.trim());

    if (!record) {
      return {
        allowed: true,
        dailyUsed: count,
        dailyLimit: 5000,
        monthlyUsed: count,
        monthlyLimit: 150000,
        approachingDaily: false,
        approachingMonthly: false,
        exceeded: false,
      };
    }

    // Check date resets
    const todayStr = getTodayDateStr();
    const currentMonthStr = getCurrentMonthStr();
    if (record.lastResetDaily !== todayStr) {
      record.dailyUsed = 0;
      record.lastResetDaily = todayStr;
      record.hourlyTraffic = generateDefaultHourly(0);
    }
    if (record.lastResetMonthly !== currentMonthStr) {
      record.monthlyUsed = 0;
      record.lastResetMonthly = currentMonthStr;
    }

    record.dailyUsed += count;
    record.monthlyUsed += count;

    // Update current hour in hourlyTraffic
    const curHourLabel = `${String(new Date().getUTCHours()).padStart(2, '0')}:00`;
    const hourItem = record.hourlyTraffic.find((h) => h.hour === curHourLabel);
    if (hourItem) {
      hourItem.requests += count;
    }

    const dailyPercent = (record.dailyUsed / record.dailyLimit) * 100;
    const monthlyPercent = (record.monthlyUsed / record.monthlyLimit) * 100;
    const threshold = record.warningThreshold || 90;

    const approachingDaily = dailyPercent >= threshold && dailyPercent < 100;
    const approachingMonthly = monthlyPercent >= threshold && monthlyPercent < 100;
    const exceeded = dailyPercent >= 100 || monthlyPercent >= 100;

    // Trigger Notification if reaching threshold and no active notification for today
    if (dailyPercent >= threshold) {
      const alreadyHasDailyWarning = record.notifications.some(
        (n) => n.type === 'warning_90_daily' && n.timestamp.startsWith(todayStr)
      );
      if (!alreadyHasDailyWarning) {
        record.notifications.unshift({
          id: 'notif_' + Date.now(),
          type: 'warning_90_daily',
          title: `⚠️ দৈনিক API কোটা ${Math.round(dailyPercent)}% অতিক্রম করেছে`,
          message: `আপনার দৈনিক API লিমিটের ${dailyPercent.toFixed(1)}% (${record.dailyUsed.toLocaleString()} / ${record.dailyLimit.toLocaleString()}) ব্যবহৃত হয়েছে। জরুরি প্রয়োজনে কোটা বৃদ্ধি করতে এডমিনের সাথে যোগাযোগ করুন।`,
          percentage: Number(dailyPercent.toFixed(1)),
          timestamp: new Date().toISOString(),
          acknowledged: false,
        });
      }
    }

    if (monthlyPercent >= threshold) {
      const alreadyHasMonthlyWarning = record.notifications.some(
        (n) => n.type === 'warning_90_monthly' && n.timestamp.startsWith(currentMonthStr)
      );
      if (!alreadyHasMonthlyWarning) {
        record.notifications.unshift({
          id: 'notif_mon_' + Date.now(),
          type: 'warning_90_monthly',
          title: `📊 মাসিক API কোটা ${Math.round(monthlyPercent)}% অতিক্রম করেছে`,
          message: `আপনার চলতি মাসের কোটার ${monthlyPercent.toFixed(1)}% (${record.monthlyUsed.toLocaleString()} / ${record.monthlyLimit.toLocaleString()}) ব্যবহৃত হয়েছে।`,
          percentage: Number(monthlyPercent.toFixed(1)),
          timestamp: new Date().toISOString(),
          acknowledged: false,
        });
      }
    }

    this.saveToDisk();

    return {
      allowed: !exceeded,
      dailyUsed: record.dailyUsed,
      dailyLimit: record.dailyLimit,
      monthlyUsed: record.monthlyUsed,
      monthlyLimit: record.monthlyLimit,
      approachingDaily,
      approachingMonthly,
      exceeded,
    };
  }

  public simulateUsage(email: string, targetPercent: number): ApiQuotaRecord | null {
    const record = this.getOrCreate(email);
    if (!record) return null;

    const targetDaily = Math.round(record.dailyLimit * (targetPercent / 100));
    record.dailyUsed = targetDaily;

    if (targetPercent >= (record.warningThreshold || 90)) {
      record.notifications.unshift({
        id: 'notif_sim_' + Date.now(),
        type: 'warning_90_daily',
        title: `⚠️ দৈনিক API কোটা ${targetPercent}% এ পৌঁছেছে (সিমুলেটেড)`,
        message: `সিমুলেশন সতর্কতা: আপনার দৈনিক কোটার ${targetPercent}% (${record.dailyUsed.toLocaleString()} / ${record.dailyLimit.toLocaleString()}) ব্যবহৃত হয়েছে।`,
        percentage: targetPercent,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    }

    this.saveToDisk();
    return record;
  }

  public resetUsage(email: string): ApiQuotaRecord | null {
    const record = this.getOrCreate(email);
    if (!record) return null;
    record.dailyUsed = 420;
    record.monthlyUsed = 12500;
    record.notifications = record.notifications.map((n) => ({ ...n, acknowledged: true }));
    this.saveToDisk();
    return record;
  }

  public updateSettings(email: string, updates: {
    warningThreshold?: number;
    webhookUrl?: string;
    notifyEmail?: string;
    dailyLimit?: number;
    monthlyLimit?: number;
  }): ApiQuotaRecord | null {
    const record = this.getOrCreate(email);
    if (!record) return null;

    if (typeof updates.warningThreshold === 'number') {
      record.warningThreshold = Math.max(50, Math.min(99, updates.warningThreshold));
    }
    if (updates.webhookUrl !== undefined) {
      record.webhookUrl = updates.webhookUrl.trim();
    }
    if (updates.notifyEmail !== undefined) {
      record.notifyEmail = updates.notifyEmail.trim();
    }
    if (typeof updates.dailyLimit === 'number' && updates.dailyLimit > 0) {
      record.dailyLimit = updates.dailyLimit;
    }
    if (typeof updates.monthlyLimit === 'number' && updates.monthlyLimit > 0) {
      record.monthlyLimit = updates.monthlyLimit;
    }

    this.saveToDisk();
    return record;
  }

  public acknowledgeNotification(email: string, notifId: string): boolean {
    const record = this.getOrCreate(email);
    if (!record) return false;
    const notif = record.notifications.find((n) => n.id === notifId);
    if (notif) {
      notif.acknowledged = true;
      this.saveToDisk();
      return true;
    }
    return false;
  }
}

export const apiQuotaDb = new ApiQuotaDatabase();
