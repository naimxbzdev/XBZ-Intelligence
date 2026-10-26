import fs from 'fs';
import path from 'path';

export interface AuditLogEntry {
  id: string;
  adminEmail: string;
  action:
    | 'payment_approved'
    | 'payment_rejected'
    | 'user_updated'
    | 'user_banned'
    | 'user_unbanned'
    | 'device_approved'
    | 'device_reset'
    | 'pricing_updated';
  actionLabel: string;
  targetId: string;
  targetEmail?: string;
  details: string;
  timestamp: string;
  ip?: string;
}

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit_init_01',
    adminEmail: 'naimxbz@gmail.com',
    action: 'payment_approved',
    actionLabel: 'পেমেন্ট অনুমোদন ও প্ল্যান আপগ্রেড',
    targetId: 'pay_01',
    targetEmail: 'tanvir@fashionbd.com',
    details: 'Approved ৳499 Merchant Pro package for Tanvir Hasan (TrxID: 9K8J7H6G5F) and unlocked 2,500 checks.',
    timestamp: '2026-03-22T10:20:00Z',
    ip: '103.114.98.22',
  },
  {
    id: 'audit_init_02',
    adminEmail: 'naeem@webxpress.com.bd',
    action: 'payment_approved',
    actionLabel: 'এন্টারপ্রাইজ প্যাকেজ অনুমোদন',
    targetId: 'pay_02',
    targetEmail: 'sabrina@glamourbd.com',
    details: 'Approved ৳1,499 Enterprise Unlimited plan for Sabrina Akter (TrxID: NGD8271948).',
    timestamp: '2026-03-23T15:00:00Z',
    ip: '103.145.112.5',
  },
];

class AuditLogDatabase {
  private logs: AuditLogEntry[] = [...INITIAL_AUDIT_LOGS];
  private storageFile = path.resolve(process.cwd(), '.audit_logs_db.json');

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(this.storageFile)) {
        const raw = fs.readFileSync(this.storageFile, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.logs = parsed;
        }
      } else {
        this.saveToDisk();
      }
    } catch {
      // In-memory fallback
    }
  }

  private saveToDisk() {
    try {
      fs.writeFileSync(this.storageFile, JSON.stringify(this.logs, null, 2), 'utf-8');
    } catch {
      // Ignore disk error
    }
  }

  public getAllLogs(): AuditLogEntry[] {
    return [...this.logs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public addLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const newLog: AuditLogEntry = {
      ...entry,
      id: 'audit_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
    };
    this.logs.unshift(newLog);
    // Keep max 200 recent audit records
    if (this.logs.length > 200) {
      this.logs = this.logs.slice(0, 200);
    }
    this.saveToDisk();
    return newLog;
  }
}

export const auditLogDb = new AuditLogDatabase();
