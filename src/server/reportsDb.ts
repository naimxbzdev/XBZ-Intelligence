import type { FraudReport } from '../types/intelligence.ts';
import fs from 'fs';
import path from 'path';

// Pre-seeded authentic community reports for demonstration and realistic safety
const INITIAL_REPORTS: FraudReport[] = [
  {
    id: 'rep_01',
    phone: '01911223344',
    customerName: 'রফিক হাসান (নকল নাম)',
    reporterStore: 'TrendZone BD (Fashion Hub)',
    reason: 'অর্ডার কনফার্ম করার পর পার্সেল ডেলিভারিতে পাঠালে ফোন বন্ধ করে রাখে। ৩টি পার্সেল রিটার্ন হয়েছে, ৭২০ টাকা কুরিয়ার লস।',
    courierConsignment: 'SF-9482710',
    lossAmountBDT: 720,
    reportedAt: '2026-03-20T14:30:00Z',
    verified: true,
  },
  {
    id: 'rep_02',
    phone: '01911223344',
    customerName: 'সাকিব আরমান',
    reporterStore: 'Smart Gadget Dhaka',
    reason: 'পার্সেল ডেলিভারি ম্যান পৌঁছানোর পর রিসিভ না করে দুর্ব্যবহার করে এবং ডেলিভারি চার্জ দিতে অস্বীকার করে।',
    courierConsignment: 'PT-882194',
    lossAmountBDT: 260,
    reportedAt: '2026-03-22T09:15:00Z',
    verified: true,
  },
  {
    id: 'rep_03',
    phone: '01811223344',
    customerName: 'তানভীর আহমেদ',
    reporterStore: 'Cosmetics Hub BD',
    reason: 'উচ্চ রিটার্ন রেশিও। ক্যাশ অন ডেলিভারি অর্ডার দিয়ে পরে বলে সে এমন কোনো অর্ডার দেয়নি।',
    courierConsignment: 'RX-773120',
    lossAmountBDT: 340,
    reportedAt: '2026-03-12T16:45:00Z',
    verified: true,
  },
  {
    id: 'rep_04',
    phone: '01799887766',
    customerName: 'ফারুক হোসেন',
    reporterStore: 'Shoes Gallery BD',
    reason: 'বক্স খুলে পণ্য দেখে রিটার্ন করার চেষ্টা, সাইজ ইস্যু বলে পার্সেল প্রত্যাখ্যান। ডেলিভারি চার্জ না দিয়েই ফেরত দেয়।',
    courierConsignment: 'PF-491028',
    lossAmountBDT: 180,
    reportedAt: '2026-03-05T11:20:00Z',
    verified: true,
  }
];

class ReportsDatabase {
  private reports: FraudReport[] = [...INITIAL_REPORTS];
  private storageFile = path.resolve(process.cwd(), '.fraud_reports_db.json');

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(this.storageFile)) {
        const raw = fs.readFileSync(this.storageFile, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.reports = parsed;
        }
      }
    } catch (e) {
      // In case of read error, default to in-memory
    }
  }

  private saveToDisk() {
    try {
      fs.writeFileSync(this.storageFile, JSON.stringify(this.reports, null, 2), 'utf-8');
    } catch (e) {
      // fallback
    }
  }

  public getReportsByPhone(phone: string): FraudReport[] {
    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-11);
    return this.reports.filter(r => r.phone.replace(/[^0-9]/g, '').slice(-11) === cleanPhone);
  }

  public getAllReports(limit = 50): FraudReport[] {
    return [...this.reports]
      .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
      .slice(0, limit);
  }

  public addReport(report: Omit<FraudReport, 'id' | 'reportedAt' | 'verified'>): FraudReport {
    const newReport: FraudReport = {
      ...report,
      id: 'rep_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4),
      reportedAt: new Date().toISOString(),
      verified: true
    };
    this.reports.unshift(newReport);
    this.saveToDisk();
    return newReport;
  }

  public deleteReport(id: string): boolean {
    const prevLen = this.reports.length;
    this.reports = this.reports.filter((r) => r.id !== id);
    if (this.reports.length !== prevLen) {
      this.saveToDisk();
      return true;
    }
    return false;
  }
}

export const reportsDb = new ReportsDatabase();
