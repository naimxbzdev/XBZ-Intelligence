import type { PaymentSubmission } from '../types/intelligence.ts';
import fs from 'fs';
import path from 'path';

const INITIAL_PAYMENTS: PaymentSubmission[] = [
  {
    id: 'pay_01',
    planId: 'pro',
    planName: 'Merchant Pro (2,500 checks)',
    amountBDT: 499,
    paymentMethod: 'bkash',
    senderNumber: '01711223344',
    transactionId: '9K8J7H6G5F',
    userEmail: 'merchant@example.com',
    status: 'verified',
    submittedAt: '2026-03-22T10:15:00Z',
  },
  {
    id: 'pay_02',
    planId: 'enterprise',
    planName: 'Enterprise Unlimited',
    amountBDT: 1499,
    paymentMethod: 'nagad',
    senderNumber: '01822334455',
    transactionId: 'NGD8271948',
    userEmail: 'store@dhakafashion.com',
    status: 'verified',
    submittedAt: '2026-03-23T14:40:00Z',
  }
];

class PaymentDatabase {
  private payments: PaymentSubmission[] = [...INITIAL_PAYMENTS];
  private storageFile = path.resolve(process.cwd(), '.payments_db.json');

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(this.storageFile)) {
        const raw = fs.readFileSync(this.storageFile, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.payments = parsed;
        }
      }
    } catch (e) {
      // ignore
    }
  }

  private saveToDisk() {
    try {
      fs.writeFileSync(this.storageFile, JSON.stringify(this.payments, null, 2), 'utf-8');
    } catch (e) {
      // ignore
    }
  }

  public getAllPayments(): PaymentSubmission[] {
    return [...this.payments];
  }

  public addPayment(payment: Omit<PaymentSubmission, 'id' | 'status' | 'submittedAt'>): PaymentSubmission {
    const newPayment: PaymentSubmission = {
      ...payment,
      id: 'pay_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4),
      status: 'verified', // instant automatic activation upon TrxID submission
      submittedAt: new Date().toISOString(),
    };

    this.payments.unshift(newPayment);
    this.saveToDisk();
    return newPayment;
  }
}

export const paymentDb = new PaymentDatabase();
