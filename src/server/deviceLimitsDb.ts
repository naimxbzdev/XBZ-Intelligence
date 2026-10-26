import fs from 'fs';
import path from 'path';

export interface DeviceRecord {
  deviceId: string;
  lastIp: string;
  guestSearches: number;
  freeSearches: number;
  isApprovedByAdmin: boolean;
  isWhitelisted: boolean;
  customLimit?: number;
  lastActive: string;
  associatedEmails: string[];
}

export interface IpRecord {
  ip: string;
  totalSearches: number;
  blocked: boolean;
  lastActive: string;
}

const GUEST_SEARCH_LIMIT = 3;
const FREE_TIER_MONTHLY_LIMIT = 100;

class DeviceLimitsDatabase {
  private devices: Map<string, DeviceRecord> = new Map();
  private ips: Map<string, IpRecord> = new Map();
  private storageFile = path.resolve(process.cwd(), '.device_limits_db.json');

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(this.storageFile)) {
        const raw = fs.readFileSync(this.storageFile, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.devices && typeof parsed.devices === 'object') {
          for (const [id, record] of Object.entries(parsed.devices)) {
            this.devices.set(id, record as DeviceRecord);
          }
        }
        if (parsed.ips && typeof parsed.ips === 'object') {
          for (const [ip, record] of Object.entries(parsed.ips)) {
            this.ips.set(ip, record as IpRecord);
          }
        }
      }
    } catch {
      // In-memory fallback
    }
  }

  private saveToDisk() {
    try {
      const serialized = {
        devices: Object.fromEntries(this.devices),
        ips: Object.fromEntries(this.ips),
      };
      fs.writeFileSync(this.storageFile, JSON.stringify(serialized, null, 2), 'utf-8');
    } catch {
      // Ignore disk error
    }
  }

  private getCleanIp(ip: string): string {
    if (!ip) return '127.0.0.1';
    let clean = ip.trim();
    if (clean.includes(',')) {
      clean = clean.split(',')[0].trim();
    }
    if (clean.startsWith('::ffff:')) {
      clean = clean.replace('::ffff:', '');
    }
    return clean;
  }

  public getOrCreateDevice(deviceId: string, ip: string): DeviceRecord {
    const cleanId = (deviceId || 'dev_unknown').trim();
    const cleanIp = this.getCleanIp(ip);

    let device = this.devices.get(cleanId);
    if (!device) {
      device = {
        deviceId: cleanId,
        lastIp: cleanIp,
        guestSearches: 0,
        freeSearches: 0,
        isApprovedByAdmin: false,
        isWhitelisted: false,
        lastActive: new Date().toISOString(),
        associatedEmails: [],
      };
      this.devices.set(cleanId, device);
      this.saveToDisk();
    } else {
      device.lastIp = cleanIp;
      device.lastActive = new Date().toISOString();
    }
    return device;
  }

  public checkQuota(
    deviceId: string,
    ip: string,
    userPlanId?: 'free' | 'pro' | 'enterprise',
    userRole?: 'admin' | 'merchant',
    userStatus?: string
  ): {
    allowed: boolean;
    remaining: number;
    reason?: string;
    limit: number;
    used: number;
    requiresApproval: boolean;
  } {
    // 1. Admin or Paid Approved Users have unhindered access
    if (userRole === 'admin') {
      return { allowed: true, remaining: 999999, limit: 999999, used: 0, requiresApproval: false };
    }

    if (userStatus === 'approved' && (userPlanId === 'pro' || userPlanId === 'enterprise')) {
      return { allowed: true, remaining: 99999, limit: 99999, used: 0, requiresApproval: false };
    }

    const device = this.getOrCreateDevice(deviceId, ip);
    const cleanIp = this.getCleanIp(ip);
    const ipRecord = this.ips.get(cleanIp);

    // If device was explicitly whitelisted by admin
    if (device.isWhitelisted || device.isApprovedByAdmin) {
      return { allowed: true, remaining: 500, limit: 500, used: device.freeSearches, requiresApproval: false };
    }

    // Check IP block
    if (ipRecord && ipRecord.blocked) {
      return {
        allowed: false,
        remaining: 0,
        limit: 0,
        used: ipRecord.totalSearches,
        requiresApproval: true,
        reason: 'আপনার আইপি নেটওয়ার্ক সাময়িকভাবে স্থগিত করা হয়েছে। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।',
      };
    }

    // 2. Guest User Check (Not logged in)
    if (!userPlanId) {
      const allowedGuestLimit = GUEST_SEARCH_LIMIT;
      const used = device.guestSearches;
      const remaining = Math.max(0, allowedGuestLimit - used);

      if (remaining <= 0) {
        return {
          allowed: false,
          remaining: 0,
          limit: allowedGuestLimit,
          used,
          requiresApproval: true,
          reason: `এই ডিভাইস/আইপি থেকে গেস্ট হিসেবে সর্বোচ্চ ${allowedGuestLimit}টি ফ্রি সার্চ সম্পন্ন হয়েছে। আরও ফ্রি ব্যবহার করতে রেজিস্টার করুন অথবা প্যাকেজ কিনুন।`,
        };
      }
      return { allowed: true, remaining, limit: allowedGuestLimit, used, requiresApproval: false };
    }

    // 3. Free Registered User Check
    const allowedFreeLimit = device.customLimit || FREE_TIER_MONTHLY_LIMIT;
    const used = device.freeSearches;
    const remaining = Math.max(0, allowedFreeLimit - used);

    if (remaining <= 0) {
      return {
        allowed: false,
        remaining: 0,
        limit: allowedFreeLimit,
        used,
        requiresApproval: true,
        reason: `এই ডিভাইস/আইপি থেকে চলতি মাসের ফ্রি সার্চ লিমিট (${allowedFreeLimit}টি) সম্পন্ন হয়েছে। অ্যাডমিন অনুমোদন অথবা প্যাকেজ আপগ্রেড ব্যতিরেকে অতিরিক্ত সার্চ করা সম্ভব নয়।`,
      };
    }

    return { allowed: true, remaining, limit: allowedFreeLimit, used, requiresApproval: false };
  }

  public recordUsage(deviceId: string, ip: string, userEmail?: string, userPlanId?: string) {
    const device = this.getOrCreateDevice(deviceId, ip);
    const cleanIp = this.getCleanIp(ip);

    if (!userPlanId) {
      device.guestSearches += 1;
    } else {
      device.freeSearches += 1;
    }

    if (userEmail && !device.associatedEmails.includes(userEmail.toLowerCase())) {
      device.associatedEmails.push(userEmail.toLowerCase());
    }
    device.lastActive = new Date().toISOString();

    let ipRecord = this.ips.get(cleanIp);
    if (!ipRecord) {
      ipRecord = { ip: cleanIp, totalSearches: 1, blocked: false, lastActive: new Date().toISOString() };
      this.ips.set(cleanIp, ipRecord);
    } else {
      ipRecord.totalSearches += 1;
      ipRecord.lastActive = new Date().toISOString();
    }

    this.saveToDisk();
  }

  public approveDevice(deviceId: string): boolean {
    const device = this.devices.get(deviceId);
    if (!device) return false;
    device.isApprovedByAdmin = true;
    device.isWhitelisted = true;
    device.guestSearches = 0;
    this.saveToDisk();
    return true;
  }

  public resetDeviceLimits(deviceId: string): boolean {
    const device = this.devices.get(deviceId);
    if (!device) return false;
    device.guestSearches = 0;
    device.freeSearches = 0;
    this.saveToDisk();
    return true;
  }

  public setCustomLimit(deviceId: string, limit: number): boolean {
    const device = this.devices.get(deviceId);
    if (!device) return false;
    device.customLimit = limit;
    this.saveToDisk();
    return true;
  }

  public getAllDevices(): DeviceRecord[] {
    return Array.from(this.devices.values()).sort(
      (a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
    );
  }

  public getAllIps(): IpRecord[] {
    return Array.from(this.ips.values()).sort(
      (a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
    );
  }
}

export const deviceLimitsDb = new DeviceLimitsDatabase();
