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
    approvedAt: '2026-03-22T10:30:00Z',
    approvedBy: 'naeem@webxpress.com.bd',
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
    approvedAt: '2026-03-23T15:20:00Z',
    approvedBy: 'naimxbz@gmail.com',
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

  public getPaymentById(id: string): PaymentSubmission | undefined {
    return this.payments.find((p) => p.id === id);
  }

  public addPayment(
    payment: Omit<PaymentSubmission, 'id' | 'status' | 'submittedAt'> & { status?: 'verified' | 'pending' | 'rejected' }
  ): PaymentSubmission {
    const newPayment: PaymentSubmission = {
      ...payment,
      id: 'pay_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4),
      status: payment.status || 'pending',
      submittedAt: new Date().toISOString(),
    };

    this.payments.unshift(newPayment);
    this.saveToDisk();
    return newPayment;
  }

  public updatePaymentStatus(
    id: string,
    status: 'verified' | 'pending' | 'rejected',
    meta?: {
      rejectionReason?: string;
      customLimitGranted?: number;
      approvedBy?: string;
      approvedAt?: string;
      rejectedBy?: string;
      rejectedAt?: string;
    }
  ): PaymentSubmission | null {
    const payment = this.payments.find((p) => p.id === id);
    if (!payment) return null;

    payment.status = status;
    if (status === 'verified') {
      payment.approvedAt = meta?.approvedAt || new Date().toISOString();
      if (meta?.approvedBy) {
        payment.approvedBy = meta.approvedBy;
      }
      if (meta?.customLimitGranted !== undefined) {
        payment.customLimitGranted = meta.customLimitGranted;
      }
    } else if (status === 'rejected') {
      payment.rejectedAt = meta?.rejectedAt || new Date().toISOString();
      if (meta?.rejectedBy) {
        payment.rejectedBy = meta.rejectedBy;
      }
      if (meta?.rejectionReason) {
        payment.rejectionReason = meta.rejectionReason;
      }
    }

    this.saveToDisk();
    return payment;
  }

  public deletePayment(id: string): boolean {
    const index = this.payments.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.payments.splice(index, 1);
    this.saveToDisk();
    return true;
  }
}

export const paymentDb = new PaymentDatabase();
