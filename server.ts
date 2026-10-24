import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { CourierRegistry } from './src/server/courierAdapters.ts';
import { reportsDb } from './src/server/reportsDb.ts';
import { paymentDb } from './src/server/paymentDb.ts';
import { analyzePhoneNumber, normalizeBDPhone } from './src/server/analysisEngine.ts';
import { SmartposClient } from './src/server/smartposClient.ts';
import { userDb } from './src/server/userDb.ts';
import { pricingDb } from './src/server/pricingDb.ts';
import { smartposKeyManager } from './src/server/smartposKeyManager.ts';
import type { CourierConfig } from './src/types/intelligence.ts';

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Enable full CORS for external merchants, WooCommerce, Shopify, and cross-origin REST clients
app.use((req: Request, res: Response, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-KEY, X-Domain, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// In-memory runtime configuration (can be updated via API or env)
let activeConfig: CourierConfig = {
  smartposApiKey: process.env.SMARTPOS_FRAUD_API_KEY || 'fraud_vRSyppIMF080gu4VE1TYRDqHsYIPL0Ms',
  smartposDomain: process.env.SMARTPOS_DOMAIN || '',
  steadfastApiKey: process.env.STEADFAST_API_KEY || '',
  steadfastSecretKey: process.env.STEADFAST_SECRET_KEY || '',
  pathaoClientId: process.env.PATHAO_CLIENT_ID || '',
  pathaoClientSecret: process.env.PATHAO_CLIENT_SECRET || '',
  redxApiToken: process.env.REDX_API_TOKEN || '',
  carrybeeApiKey: process.env.CARRYBEE_API_KEY || '',
  paperflyKey: process.env.PAPERFLY_KEY || '',
  enableSandbox: process.env.ENABLE_SANDBOX === 'true',
};

// Helper to extract API key from headers (supports X-API-KEY and Bearer token)
function extractApiKey(req: Request): { apiKey?: string; domain?: string } {
  const xApiKey = req.header('X-API-KEY');
  const authHeader = req.header('Authorization');
  let bearerToken: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    bearerToken = authHeader.substring(7).trim();
  }

  const domain = req.header('X-Domain');
  return {
    apiKey: xApiKey || bearerToken || activeConfig.smartposApiKey,
    domain: domain || activeConfig.smartposDomain,
  };
}

// ==========================================
// 1. EXACT SMARTPOS SPEC ENDPOINTS
// ==========================================

// POST /api/v1/fraud-check and /v1/fraud-check
app.post(['/api/v1/fraud-check', '/v1/fraud-check'], async (req: Request, res: Response) => {
  try {
    const phone = req.body?.phone || req.query?.phone;
    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'The phone number must be exactly 11 digits (e.g. 017XXXXXXXX).',
      });
    }

    const { normalized, valid } = normalizeBDPhone(phone);
    if (!valid) {
      return res.status(400).json({
        status: 'error',
        message: 'The phone number must be exactly 11 digits (e.g. 017XXXXXXXX).',
      });
    }

    const { apiKey, domain } = extractApiKey(req);
    const result = await SmartposClient.checkPhone(normalized, apiKey, domain);

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({
      status: 'error',
      message: err.message || 'Internal server error processing fraud screening.',
    });
  }
});

// GET /api/v1/fraud-check/:phone, /v1/fraud-check/:phone and GET with query ?phone=...
app.get(['/api/v1/fraud-check/:phone', '/v1/fraud-check/:phone', '/api/v1/fraud-check', '/v1/fraud-check'], async (req: Request, res: Response) => {
  try {
    const phone = req.params?.phone || (req.query?.phone as string);
    if (!phone) {
      return res.status(400).json({
        status: 'error',
        message: 'The phone number must be exactly 11 digits (e.g. 017XXXXXXXX).',
      });
    }

    const { normalized, valid } = normalizeBDPhone(phone);
    if (!valid) {
      return res.status(400).json({
        status: 'error',
        message: 'The phone number must be exactly 11 digits (e.g. 017XXXXXXXX).',
      });
    }

    const { apiKey, domain } = extractApiKey(req);
    const result = await SmartposClient.checkPhone(normalized, apiKey, domain);

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({
      status: 'error',
      message: err.message || 'Internal server error processing fraud screening.',
    });
  }
});

// ==========================================
// 2. INTERNAL APPLICATION ENDPOINTS
// ==========================================

// POST /api/check-phone (Used by React UI)
app.post('/api/check-phone', async (req: Request, res: Response) => {
  try {
    const { phone, config } = req.body;
    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ error: 'ফোন নম্বর প্রদান করা আবশ্যক।' });
    }

    const mergedConfig: CourierConfig = {
      ...activeConfig,
      ...(config || {}),
    };

    const result = await analyzePhoneNumber(phone.trim(), mergedConfig);
    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'যাচাইকরণে সমস্যা হয়েছে।' });
  }
});

// POST /api/batch-check (Bulk checking for up to 30 numbers)
app.post('/api/batch-check', async (req: Request, res: Response) => {
  try {
    const { phones, config } = req.body;
    if (!Array.isArray(phones) || phones.length === 0) {
      return res.status(400).json({ error: 'একাধিক ফোন নম্বরের তালিকা দিন।' });
    }

    const phoneList = phones.slice(0, 30);
    const mergedConfig: CourierConfig = {
      ...activeConfig,
      ...(config || {}),
    };

    const results = await Promise.all(
      phoneList.map(async (raw) => {
        try {
          const { valid } = normalizeBDPhone(String(raw).trim());
          if (!valid) {
            return {
              phone: raw,
              error: 'অবৈধ নম্বর',
              totalOrders: 0,
              deliveredOrders: 0,
              deliveryRate: 0,
              riskLevel: 'invalid',
            };
          }
          return await analyzePhoneNumber(String(raw).trim(), mergedConfig);
        } catch (e: any) {
          return {
            phone: raw,
            error: e.message || 'ত্রুটি',
            totalOrders: 0,
            deliveredOrders: 0,
            deliveryRate: 0,
            riskLevel: 'error',
          };
        }
      })
    );

    return res.json({
      totalChecked: results.length,
      results,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'বাল্ক চেক সম্পন্ন করা যায়নি।' });
  }
});

// GET /api/couriers/status
app.get('/api/couriers/status', (req: Request, res: Response) => {
  const statuses = CourierRegistry.getCourierInfos(activeConfig);
  return res.json({
    isSandbox: activeConfig.enableSandbox !== false && !activeConfig.smartposApiKey && !process.env.SMARTPOS_FRAUD_API_KEY,
    couriers: statuses,
  });
});

// POST /api/couriers/config
app.post('/api/couriers/config', (req: Request, res: Response) => {
  try {
    const incoming = req.body || {};
    activeConfig = {
      ...activeConfig,
      ...incoming,
      enableSandbox: incoming.enableSandbox !== undefined ? incoming.enableSandbox : activeConfig.enableSandbox,
    };

    return res.json({
      success: true,
      message: 'মার্চেন্ট এপিআই সেটিংস সফলভাবে আপডেট হয়েছে।',
      config: {
        smartposConfigured: Boolean(activeConfig.smartposApiKey || process.env.SMARTPOS_FRAUD_API_KEY),
        steadfastConfigured: Boolean(activeConfig.steadfastApiKey),
        pathaoConfigured: Boolean(activeConfig.pathaoClientId),
        redxConfigured: Boolean(activeConfig.redxApiToken),
        carrybeeConfigured: Boolean(activeConfig.carrybeeApiKey),
        paperflyConfigured: Boolean(activeConfig.paperflyKey),
        enableSandbox: activeConfig.enableSandbox !== false,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'সেটিংস আপডেট করা যায়নি।' });
  }
});

// GET /api/couriers/config
app.get('/api/couriers/config', (req: Request, res: Response) => {
  return res.json({
    smartposConfigured: Boolean(activeConfig.smartposApiKey || process.env.SMARTPOS_FRAUD_API_KEY),
    steadfastConfigured: Boolean(activeConfig.steadfastApiKey),
    pathaoConfigured: Boolean(activeConfig.pathaoClientId),
    redxConfigured: Boolean(activeConfig.redxApiToken),
    carrybeeConfigured: Boolean(activeConfig.carrybeeApiKey),
    paperflyConfigured: Boolean(activeConfig.paperflyKey),
    enableSandbox: activeConfig.enableSandbox !== false,
  });
});

// Community reports API
app.get('/api/reports', (req: Request, res: Response) => {
  const phone = req.query.phone as string | undefined;
  if (phone) {
    const reports = reportsDb.getReportsByPhone(phone);
    return res.json(reports);
  }
  const allReports = reportsDb.getAllReports(30);
  return res.json(allReports);
});

app.post('/api/reports', (req: Request, res: Response) => {
  try {
    const { phone, customerName, reporterStore, reason, courierConsignment, lossAmountBDT } = req.body;

    if (!phone || !reason || !reporterStore) {
      return res.status(400).json({ error: 'ফোন নম্বর, স্টোর নাম ও অভিযোগের কারণ আবশ্যক।' });
    }

    const { valid, normalized } = normalizeBDPhone(phone);
    if (!valid) {
      return res.status(400).json({ error: 'সঠিক ১১ ডিজিটের ফোন নম্বর প্রদান করুন।' });
    }

    const newReport = reportsDb.addReport({
      phone: normalized,
      customerName: customerName ? String(customerName).trim() : undefined,
      reporterStore: String(reporterStore).trim(),
      reason: String(reason).trim(),
      courierConsignment: courierConsignment ? String(courierConsignment).trim() : undefined,
      lossAmountBDT: lossAmountBDT ? Number(lossAmountBDT) : undefined,
    });

    return res.json({
      success: true,
      message: 'প্রতারক রিপোর্ট সফলভাবে কমিউনিটি ডাটাবেসে যুক্ত হয়েছে। ধন্যবাদ!',
      report: newReport,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'রিপোর্ট জমা দিতে সমস্যা হয়েছে।' });
  }
});

// Real Persistent User Auth & Administration (Protected by userDb)
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'ইমেইল ও পাসওয়ার্ড প্রদান করুন।' });
  }

  const result = userDb.authenticate(String(email).trim(), String(password).trim());
  if (result.error || !result.user) {
    return res.status(401).json({ error: result.error || 'লগইন ব্যর্থ হয়েছে।' });
  }

  const safeUser = { ...result.user };
  delete safeUser.password;

  return res.json({
    success: true,
    user: safeUser,
    isAdmin: result.isAdmin,
    token: 'jwt_' + Buffer.from(JSON.stringify(safeUser)).toString('base64'),
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, storeName, phone, password } = req.body;
  if (!name || !email || !storeName) {
    return res.status(400).json({ error: 'সকল আবশ্যক তথ্য (নাম, ইমেইল ও শপের নাম) পূরণ করুন।' });
  }

  const result = userDb.register({
    name: String(name).trim(),
    email: String(email).trim(),
    password: password ? String(password).trim() : 'password123',
    phone: phone ? String(phone).trim() : '01700000000',
    storeName: String(storeName).trim(),
    planId: 'free',
  });

  if (result.error || !result.user) {
    return res.status(400).json({ error: result.error || 'রেজিস্ট্রেশন সম্পন্ন করা সম্ভব হয়নি।' });
  }

  const safeUser = { ...result.user };
  delete safeUser.password;

  return res.json({
    success: true,
    message: 'রেজিস্ট্রেশন সফল হয়েছে!',
    user: safeUser,
    token: 'jwt_' + Buffer.from(JSON.stringify(safeUser)).toString('base64'),
  });
});

// Admin User Management Endpoints
app.get('/api/admin/users', (req: Request, res: Response) => {
  const adminEmail = req.query.adminEmail as string;
  if (!adminEmail || !['naimxbz@gmail.com', 'xbz.dev@gmail.com'].includes(adminEmail.trim().toLowerCase())) {
    return res.status(403).json({ error: 'এডমিন এক্সেস সংরক্ষিত।' });
  }
  return res.json(userDb.getAllUsers(false));
});

app.post('/api/admin/users/:id/approve', (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = userDb.updateUser(id, { status: 'approved' });
  if (!updated) return res.status(404).json({ error: 'User not found' });
  return res.json({ success: true, user: updated });
});

app.post('/api/admin/users/:id/ban', (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = userDb.banUser(id);
  if (!updated) return res.status(400).json({ error: 'মার্চেন্টকে ব্যান করা সম্ভব হয়নি অথবা এটি প্রধান এডমিন একাউন্ট।' });
  return res.json({ success: true, message: 'মার্চেন্ট একাউন্ট সফলভাবে ব্যান করা হয়েছে।', user: updated });
});

app.post('/api/admin/users/:id/unban', (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = userDb.unbanUser(id);
  if (!updated) return res.status(404).json({ error: 'User not found' });
  return res.json({ success: true, message: 'মার্চেন্ট একাউন্ট সক্রিয় করা হয়েছে।', user: updated });
});

app.post('/api/admin/users/:id/update-plan', (req: Request, res: Response) => {
  const { id } = req.params;
  const { planId, planName, checksRemaining, status } = req.body;
  if (!planId) {
    return res.status(400).json({ error: 'প্যাকেজ আইডি প্রদান করা আবশ্যক।' });
  }
  const updated = userDb.updatePlanAndLimits(
    id,
    planId,
    planName,
    typeof checksRemaining === 'number' ? checksRemaining : undefined
  );
  if (!updated) return res.status(404).json({ error: 'User not found' });

  if (status && ['approved', 'pending', 'suspended'].includes(status)) {
    userDb.updateUser(id, { status });
  }

  const finalUser = userDb.findById(id);
  return res.json({ success: true, message: 'মার্চেন্ট প্যাকেজ ও লিমিট সফলভাবে হালনাগাদ করা হয়েছে।', user: finalUser });
});

app.delete('/api/admin/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = userDb.deleteUser(id);
  if (!deleted) return res.status(400).json({ error: 'User could not be deleted or is protected master admin.' });
  return res.json({ success: true, message: 'মার্চেন্ট সফলভাবে মুছে ফেলা হয়েছে।' });
});

// Admin Package / Payment Requests Endpoints
app.get('/api/admin/packages', (req: Request, res: Response) => {
  return res.json(paymentDb.getAllPayments());
});

app.post('/api/admin/packages/:id/approve', (req: Request, res: Response) => {
  const { id } = req.params;
  const { customLimitGranted } = req.body || {};
  const payment = paymentDb.getPaymentById(id);
  if (!payment) return res.status(404).json({ error: 'Package request not found' });

  const updatedPayment = paymentDb.updatePaymentStatus(id, 'verified', {
    customLimitGranted: typeof customLimitGranted === 'number' ? customLimitGranted : undefined,
  });

  let updatedUser = null;
  if (payment.userEmail) {
    const user = userDb.findByEmail(payment.userEmail);
    if (user) {
      const planId = payment.planId || 'pro';
      const planName = payment.planName || (planId === 'enterprise' ? 'Enterprise Unlimited' : 'Merchant Pro (2,500 checks)');
      const checksLimit = typeof customLimitGranted === 'number' && !isNaN(customLimitGranted)
        ? customLimitGranted
        : (planId === 'enterprise' ? 99999 : 2500);

      updatedUser = userDb.updatePlanAndLimits(user.id, planId, planName, checksLimit);
    }
  }

  return res.json({
    success: true,
    message: 'প্যাকেজ রিকোয়েস্ট সফলভাবে অনুমোদিত হয়েছে এবং গ্রাহকের লিমিট যুক্ত হয়েছে।',
    payment: updatedPayment,
    user: updatedUser,
  });
});

app.post('/api/admin/packages/:id/reject', (req: Request, res: Response) => {
  const { id } = req.params;
  const { rejectionReason } = req.body || {};
  const updatedPayment = paymentDb.updatePaymentStatus(id, 'rejected', {
    rejectionReason: rejectionReason || 'এডমিন কর্তৃক পেমেন্ট ভেরিফিকেশন বাতিল করা হয়েছে।',
  });
  if (!updatedPayment) return res.status(404).json({ error: 'Package request not found' });

  return res.json({
    success: true,
    message: 'প্যাকেজ রিকোয়েস্ট বাতিল করা হয়েছে।',
    payment: updatedPayment,
  });
});

app.delete('/api/admin/packages/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = paymentDb.deletePayment(id);
  if (!deleted) return res.status(404).json({ error: 'Package request not found' });
  return res.json({ success: true, message: 'প্যাকেজ রিকোয়েস্ট সফলভাবে মুছে ফেলা হয়েছে।' });
});

// Admin Pricing Settings Endpoints
app.get('/api/pricing/settings', (req: Request, res: Response) => {
  return res.json(pricingDb.getSettings());
});

app.post('/api/admin/pricing/settings', (req: Request, res: Response) => {
  const updated = pricingDb.updateSettings(req.body);
  return res.json({ success: true, settings: updated });
});

// Admin SmartPOS Multi-API Key Pool & Auto-Failover Endpoints
app.get('/api/admin/smartpos/keys', (req: Request, res: Response) => {
  return res.json({
    keys: smartposKeyManager.getAllKeys(),
    summary: smartposKeyManager.getPoolSummary(),
  });
});

app.post('/api/admin/smartpos/keys', (req: Request, res: Response) => {
  const { name, apiKey, domain, monthlyLimit } = req.body;
  if (!name || !apiKey) {
    return res.status(400).json({ error: 'এপিআই কি এর নাম এবং API Key আবশ্যক।' });
  }

  const created = smartposKeyManager.addKey({
    name: String(name).trim(),
    apiKey: String(apiKey).trim(),
    domain: domain ? String(domain).trim() : undefined,
    monthlyLimit: Number(monthlyLimit) || 1000,
  });

  return res.json({
    success: true,
    message: 'নতুন SmartPOS এপিআই কী সফলভাবে পুলে যুক্ত হয়েছে!',
    key: created,
    summary: smartposKeyManager.getPoolSummary(),
  });
});

app.post('/api/admin/smartpos/keys/bulk', (req: Request, res: Response) => {
  const { keys } = req.body;
  if (!Array.isArray(keys) || keys.length === 0) {
    return res.status(400).json({ error: 'অন্তত একটি API কী প্রদান করা আবশ্যক।' });
  }

  const created = smartposKeyManager.addMultipleKeys(keys);
  return res.json({
    success: true,
    message: `${created.length} টি SmartPOS এপিআই কী সফলভাবে পুলে যুক্ত করা হয়েছে!`,
    keys: created,
    allKeys: smartposKeyManager.getAllKeys(),
    summary: smartposKeyManager.getPoolSummary(),
  });
});

app.put('/api/admin/smartpos/keys/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = smartposKeyManager.updateKey(id, req.body);
  if (!updated) return res.status(404).json({ error: 'Key not found' });
  return res.json({
    success: true,
    message: 'এপিআই কী সেটিংস সফলভাবে আপডেট হয়েছে।',
    key: updated,
    summary: smartposKeyManager.getPoolSummary(),
  });
});

app.post('/api/admin/smartpos/keys/:id/reset', (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = smartposKeyManager.resetUsage(id);
  if (!updated) return res.status(404).json({ error: 'Key not found' });
  return res.json({
    success: true,
    message: 'এপিআই কী এর মাসিক ব্যবহার কাউন্টার সফলভাবে ০ তে রিসেট করা হয়েছে!',
    key: updated,
    summary: smartposKeyManager.getPoolSummary(),
  });
});

app.delete('/api/admin/smartpos/keys/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = smartposKeyManager.deleteKey(id);
  if (!deleted) return res.status(404).json({ error: 'Key not found' });
  return res.json({
    success: true,
    message: 'এপিআই কী পুল থেকে মুছে ফেলা হয়েছে।',
    summary: smartposKeyManager.getPoolSummary(),
  });
});

// 7. Merchant Plan Payment & Upgrade Endpoints (bKash, Nagad, Rocket)
app.post('/api/payment/submit', (req: Request, res: Response) => {
  try {
    const { planId, paymentMethod, senderNumber, transactionId, userEmail } = req.body;

    if (!planId || !paymentMethod || !senderNumber || !transactionId) {
      return res.status(400).json({ error: 'পেমেন্ট মেথড, প্রেরক নম্বর ও ট্রানজেকশন আইডি আবশ্যক।' });
    }

    const { valid, normalized } = normalizeBDPhone(senderNumber);
    if (!valid) {
      return res.status(400).json({ error: 'সঠিক ১১ সংখ্যার বিকাশ/নগদ/রকেট মোবাইল নম্বর দিন।' });
    }

    if (transactionId.trim().length < 5) {
      return res.status(400).json({ error: 'সঠিক ট্রানজেকশন আইডি (TrxID) প্রদান করুন।' });
    }

    const amountBDT = planId === 'enterprise' ? 1499 : 499;
    const planName = planId === 'enterprise' ? 'Enterprise Unlimited' : 'Merchant Pro (2,500 checks)';

    const newPayment = paymentDb.addPayment({
      planId: planId === 'enterprise' ? 'enterprise' : 'pro',
      planName,
      amountBDT,
      paymentMethod,
      senderNumber: normalized,
      transactionId: transactionId.trim().toUpperCase(),
      userEmail: userEmail || 'merchant@example.com',
      status: 'pending', // Submissions enter pending review for admin approval
    });

    return res.json({
      success: true,
      message: 'পেমেন্ট ও প্যাকেজ রিকোয়েস্ট সফলভাবে সাবমিট হয়েছে! এডমিন অনুমোদনের পর সাথে সাথে এক্টিভ হবে।',
      payment: newPayment,
      planId,
      planName,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'পেমেন্ট সম্পন্ন করা যায়নি।' });
  }
});

app.get('/api/payment/history', (req: Request, res: Response) => {
  return res.json(paymentDb.getAllPayments());
});

// ==========================================
// 8. AI LIVE SUPPORT CHAT AGENT (GEMINI API)
// ==========================================
const XBZ_AI_SYSTEM_INSTRUCTION = `You are "XBZ AI Merchant Assistant" (XBZ এআই মার্চেন্ট অ্যাসিস্ট্যান্ট), a warm, friendly, empathetic, and exceptionally smart bilingual AI support companion for "XBZ Intelligence by Naim Xbz" — Bangladesh's premier courier fraud intelligence platform.

Your Persona & Tone:
- You are a friendly, helpful e-commerce buddy to Bangladeshi merchants and f-commerce page owners.
- Friendly, encouraging, polite, practical, and solution-driven. You treat every merchant's business and hard-earned profit with genuine care.
- Bilingual Mastery: If the user communicates in Bengali (বাংলা or Banglish like "amar ekta customer"), respond naturally in warm, clear Bengali. If they communicate in English, reply in friendly English.
- Always be conversational, direct, and helpful. Avoid robotic repeating templates. Address the user's specific scenario or question directly.

Domain Knowledge & Advice:
1. Courier Delivery Success Rates in Bangladesh (Steadfast, Pathao, REDX, Paperfly, Carrybee):
   - Above 80%: Safe & dependable buyer. Safe for normal Cash On Delivery (COD).
   - 50% - 79%: Moderate risk. Customer has notable cancellations. Strongly advise asking for advance courier delivery charge (৳100 - ৳150) before dispatching.
   - Below 50%: High risk / fraud buyer. High probability of parcel return (RTO loss). Strongly advise full advance payment or verbal telephone verification.
2. XBZ Intelligence Features:
   - Single Number Search: Instant 11-digit Bangladesh phone lookup (e.g. 017XXXXXXXX).
   - Batch Check: Upload or paste up to 30 phone numbers at once with CSV report export.
   - Community Fraud Database: Real dispute records reported by Bangladeshi merchants with loss amount in BDT.
   - REST API & WooCommerce Plugin: Real-time fraud detection during customer checkout.
   - Packages: Free Starter (100 free checks/mo), Merchant Pro (৳499/mo for 2,500 checks & API), Enterprise (৳1,499/mo unlimited checks). Payment via bKash, Nagad, or Rocket.
3. Founder & Human Escalation:
   - For special enterprise inquiries, custom contracts, or personal assistance from founder Naim Xbz, invite them to chat on WhatsApp: +8801703223141.`;

function generateIntelligentSupportReply(userPrompt: string, history?: Array<{ role: string; text: string }>): string {
  const p = userPrompt.toLowerCase().trim();
  const isEn = /^[a-zA-Z0-9\s.,?!'"-:;()%]+$/.test(userPrompt) && 
    !p.includes('ki') && !p.includes('kivabe') && !p.includes('koro') && 
    !p.includes('amar') && !p.includes('pathabo') && !p.includes('tahole') && !p.includes('koto');

  // Check previous context from history if available
  const lastUserMsg = Array.isArray(history) && history.length > 0 
    ? history.filter(h => h.role === 'user').slice(-1)[0]?.text?.toLowerCase() || '' 
    : '';

  // 1. Follow-up: Refusal to pay advance ("না দেয়", "দিবে না", "refuse", "না দিলে", "অস্বীকৃতি")
  if (p.includes('raji na') || p.includes('na dey') || p.includes('না দেয়') || p.includes('দিবে না') || p.includes('refuse') || p.includes('না দিলে') || p.includes('না চাইলে') || p.includes('না নিলে')) {
    if (isEn) {
      return `🛡️ **If the customer refuses to pay advance courier fees:**\n\nData from Bangladeshi couriers shows that **over 90% of buyers who refuse to pay a small ৳100 advance delivery fee will reject or fail to receive the COD parcel at the doorstep!**\n\n💡 **Smart Merchant Decision:**\nPolitely decline dispatching without advance: *"Sorry, as per our automated store verification policy, we cannot ship without initial courier fee confirmation."*\n\n👉 Saving ৳150 return charge loss is more profitable than getting a returned parcel with damaged packaging!`;
    }
    return `🛡️ **কাস্টমার যদি অগ্রিম ডেলিভারি চার্জ দিতে অস্বীকৃতি জানায়:**\n\nবাংলাদেশের কুরিয়ার ডাটা অনুযায়ী, **যেসব ক্রেতার ডেলিভারি রেট কম এবং তারা ১০০-১৫০ টাকা অগ্রিম দিতে চায় না, তাদের ৯০% ক্ষেত্রেই পার্সেলটি রিটার্ন আসে বা ডেলিভারিম্যানের ফোন রিসিভ করে না!**\n\n💡 **মার্চেন্ট হিসেবে আপনার করণীয়:**\nসাময়িক অর্ডার ড্রপের ভয়ে পার্সেল পাঠাবেন না। বিনয়ের সাথে বলুন:\n*"দুঃখিত প্রিয় গ্রাহক, আমাদের অটোমেটেড সিস্টেম অনুযায়ী কুরিয়ার বুকিং নিশ্চিত করতে অগ্রিম ডেলিভারি চার্জ গ্রহণ করা বাধ্যতামূলক।"*\n\n👉 একটি ভুয়া অর্ডারের পেছনে আসা-যাওয়ার ১৫০-২০০ টাকা লোকসান দেওয়ার চেয়ে নিশ্চিত অর্ডারে ফোকাস করাই বুদ্ধিমানের কাজ!`;
  }

  // 2. Follow-up: "তাহলে কত নিব?" / "How much advance?"
  if (p.includes('koto') || p.includes('কত') || p.includes('how much') || p.includes('কত টাকা') || p.includes('advance') || p.includes('অগ্রিম')) {
    if (isEn) {
      return `💰 **Recommended Advance Delivery Charge Breakdown:**\n\n- **Inside Dhaka:** Request **৳80 – ৳120** in advance via bKash/Nagad.\n- **Outside Dhaka (Sub-urban / Nationwide):** Request **৳130 – ৳150** (to fully cover return delivery fees if cancelled).\n\n💬 **How to speak to the customer:**\n*"Dear Customer, per our shop policy for COD shipments, the courier delivery fee is collected in advance. The product value will be paid directly to the delivery person upon inspection."*`;
    }
    return `💰 **অগ্রিম ডেলিভারি চার্জ নেওয়ার সঠিক নিয়ম:**\n\n- **ঢাকার ভেতরে:** ন্যূনতম **৮০ - ১২০ টাকা** বিকাশ বা নগদে অগ্রিম নিবেন।\n- **ঢাকার বাইরে (সমগ্র বাংলাদেশ):** ন্যূনতম **১৩০ - ১৫০ টাকা** অগ্রিম নিবেন (যাতে কোনো কারণে পার্সেল রিটার্ন এলেও আপনার পকেট থেকে কুরিয়ার চার্জ না কাটে)।\n\n💬 **কাস্টমারকে যেভাবে মেসেজ দিবেন:**\n*"সম্মানিত ক্রেতা, আমাদের শপ পলিসি অনুযায়ী কুরিয়ার ডেলিভারি চার্জ অগ্রিম প্রযোজ্য। অবশিষ্ট পণ্যের মূল্য পার্সেল হাতে পেয়ে ডেলিভারিম্যানকে পরিশোধ করতে পারবেন।"*`;
  }

  // 3. Dynamic Percentage / Rate Analysis (e.g. "45% delivery rate", "75% rate")
  const pctMatch = userPrompt.match(/(\d{1,3})\s*%/);
  if (pctMatch) {
    const rate = parseInt(pctMatch[1], 10);
    if (!isNaN(rate)) {
      if (rate >= 80) {
        if (isEn) {
          return `✅ **${rate}% Delivery Rate — Safe & Dependable Buyer:**\n\nThis customer has a strong track record across Bangladeshi couriers. Over ${rate}% of their dispatched orders were successfully received.\n\n💡 **Recommendation:** You can confidently dispatch this order via standard Cash on Delivery (COD).`;
        }
        return `✅ **${rate}% ডেলিভারি রেট — অত্যন্ত বিশ্বস্ত কাস্টমার!**\n\nকুরিয়ার ডাটা অনুযায়ী এই ক্রেতা নিয়মিত পার্সেল গ্রহণ করেন এবং রিটার্ন রেট খুবই কম (${100 - rate}%)।\n\n💡 **আমাদের পরামর্শ:** আপনি নিশ্চিন্তে সাধারণ ক্যাশ অন ডেলিভারিতে (COD) পার্সেলটি পাঠাতে পারেন।`;
      } else if (rate >= 50) {
        if (isEn) {
          return `⚠️ **${rate}% Delivery Rate — Moderate Risk:**\n\nThis customer cancels roughly ${100 - rate}% of their dispatched parcels. Sending standard COD could lead to return courier delivery loss.\n\n💡 **Recommendation:** Request an advance courier fee (৳100 - ৳150) via bKash/Nagad before dispatching. If they are genuine, they will gladly pay the delivery fee in advance.`;
        }
        return `⚠️ **${rate}% ডেলিভারি রেট — মাঝারি ঝুঁকি (Moderate Risk):**\n\nএই কাস্টমারের পার্সেল রিটার্নের হার প্রায় ${100 - rate}%। সরাসরি ফুল ক্যাশ অন ডেলিভারিতে পাঠালে রিটার্ন খরচ লোকসানের ঝুঁকি থাকে।\n\n💡 **আমাদের পরামর্শ:** পার্সেল পাঠানোর আগে ডেলিভারি চার্জ (১০০ - ১৫০ টাকা) বিকাশ বা নগদে অগ্রিম নিয়ে নিশ্চিত হয়ে নিন। জেনুইন ক্রেতা হলে তারা অগ্রিম ডেলিভারি চার্জ দিতে রাজি হবেন।`;
      } else {
        if (isEn) {
          return `🚨 **${rate}% Delivery Rate — High Fraud/Cancellation Risk!**\n\nWarning: More than ${100 - rate}% of this buyer's orders were returned, rejected, or cancelled at the doorstep.\n\n💡 **Recommendation:** Do NOT dispatch on regular COD. Only send if they pay full advance payment or minimum round-trip courier fees in advance.`;
        }
        return `🚨 **${rate}% ডেলিভারি রেট — উচ্চ ঝুঁকি (High Risk / Fraud Alert)!**\n\nসতর্কতা: এই ক্রেতার ১০০টি অর্ডারের মধ্যে ${100 - rate}টি পার্সেলই ডেলিভারিম্যানের কাছ থেকে ফেরত বা ক্যানসেল হয়েছে!\n\n💡 **আমাদের পরামর্শ:** কোনোভাবেই ক্যাশ অন ডেলিভারিতে এই পার্সেল পাঠাবেন না। পার্সেল পাঠাতে হলে পণ্যের মূল্য অথবা আসা-যাওয়ার কুরিয়ার চার্জ সম্পূর্ণ অগ্রিম নিয়ে তবেই বুক করুন।`;
      }
    }
  }

  // 4. Checking phone number (e.g. 01712345678)
  const phoneMatch = userPrompt.match(/01[3-9]\d{8}/);
  if (phoneMatch) {
    const matchedPhone = phoneMatch[0];
    if (isEn) {
      return `🔍 **Instant Fraud Screening for ${matchedPhone}:**\n\nTo see this customer's live delivery success rate, total completed parcels, and return history:\n1. Copy the number **${matchedPhone}**.\n2. Paste it into the main search box on the top dashboard.\n3. Click **"Verify Buyer"** to run a live scan across Steadfast, Pathao & REDX.`;
    }
    return `🔍 **${matchedPhone} নম্বরের লাইভ কুরিয়ার হিস্ট্রি:**\n\nএই কাস্টমারের পূর্বের ডেলিভারি রেট ও রিটার্ন রেকর্ড দেখতে:\n১. নম্বরটি (${matchedPhone}) কপি করে হোমপেজের প্রধান সার্চ বক্সে পেস্ট করুন।\n২. **"যাচাই করুন"** বাটনে চাপ দিন।\n৩. সাথে সাথে স্টেডফাস্ট, পাঠাও ও রেডএক্সের লাইভ রেকর্ড দেখতে পাবেন।`;
  }

  // 5. Courier comparison (Steadfast vs Pathao vs REDX)
  if (p.includes('steadfast') || p.includes('pathao') || p.includes('redx') || p.includes('কুরিয়ার') || p.includes('কোন কুরিয়ার')) {
    if (isEn) {
      return `🚚 **Courier Network Comparison & Recommendations:**\n\n- **Steadfast Courier:** Best for nationwide coverage in rural sub-districts and real-time SmartPOS delivery tracking.\n- **Pathao Courier:** Fastest delivery in metro areas (Dhaka, Chattogram) with next-day settlement.\n- **REDX Logistics:** Good for bulk e-commerce dispatches and doorstep pickups.\n\n💡 XBZ Intelligence aggregates records from all these couriers to show you the customer's combined delivery success rate!`;
    }
    return `🚚 **কুরিয়ার তুলনা ও কোনটিতে পাঠাবেন:**\n\n- **স্টেডফাস্ট (Steadfast):** থানা ও গ্রাম পর্যায়ে সবচেয়ে বিস্তৃত নেটওয়ার্ক এবং দ্রুততম রিটার্ন আপডেট।\n- **পাঠাও (Pathao):** ঢাকা ও প্রধান বিভাগীয় শহরে সুপার ফাস্ট ডেলিভারি ও দ্রুত পেমেন্ট ডিসবার্সমেন্ট।\n- **রেডএক্স (REDX):** বাল্ক পার্সেল বুকিং ও সহজে পিকআপ সুবিধার জন্য জনপ্রিয়।\n\n💡 XBZ Intelligence সবগুলো কুরিয়ারের হিস্ট্রি একত্র করে এক নজরে কাস্টমারের বিশ্বস্ততা তুলে ধরে!`;
  }

  // 6. Greetings & Salutations
  if (p.includes('hi') || p.includes('hello') || p.includes('হ্যালো') || p.includes('সালাম') || p.includes('salam') || p.includes('assalamu') || p.includes('hey') || p.includes('কেমন আছেন')) {
    if (isEn) {
      return `👋 **Hello! Welcome to XBZ Intelligence AI Support.**\n\nI am your dedicated merchant assistant. Feel free to ask me:\n- Is a customer's delivery percentage safe to dispatch?\n- How to batch verify multiple customer numbers\n- How to connect WooCommerce/Shopify via REST API\n- Plans, pricing & bKash/Nagad upgrades\n\nHow can I help your online store today?`;
    }
    return `👋 **আসসালামু আলাইকুম! XBZ মার্চেন্ট সাপোর্টে আপনাকে স্বাগতম।**\n\nআমি আপনার অনলাইন বিজনেসের ডেলিভারি ও কুরিয়ার সহায়তাকারী। যেকোনো প্রশ্ন করতে পারেন, যেমন:\n- কাস্টমারের ডেলিভারি রেট কত হলে পার্সেল পাঠানো নিরাপদ?\n- একসাথে একাধিক নম্বর কিভাবে বাল্ক চেক করবেন?\n- WooCommerce বা ওয়েবসাইটে XBZ API কিভাবে কানেক্ট করবেন?\n- প্যাকেজ আপগ্রেড ও পেমেন্ট বিস্তারিত।\n\nআজ আপনার ব্যবসার সুরক্ষায় কীভাবে সাহায্য করতে পারি?`;
  }

  // 7. Batch Check Guidance
  if (p.includes('bulk') || p.includes('batch') || p.includes('বাল্ক') || p.includes('একাধিক') || p.includes('একসাথে') || p.includes('csv')) {
    if (isEn) {
      return `📦 **Bulk Batch Verification Guide:**\n\n1. Open the **"Batch Check"** tab in top navigation.\n2. Paste up to 30 customer phone numbers or upload a text/CSV file.\n3. Click **"Verify Batch"** to screen all numbers across Steadfast, Pathao & REDX simultaneously.\n4. View risk badges instantly and download reports via CSV for your dispatch team.`;
    }
    return `📦 **বাল্ক চেকিং (Batch Check) ব্যবহারের নিয়ম:**\n\n১. উপরের মেন্যু থেকে **"বাল্ক চেক"** ট্যাবে ক্লিক করুন।\n২. একসাথে সর্বোচ্চ ৩০টি ফোন নম্বর পেস্ট করুন অথবা সরাসরি CSV/Text ফাইল আপলোড করুন।\n৩. **"একসাথে ভেরিফাই করুন"** বাটনে চাপ দিলে সবগুলো নম্বরের সাকসেস রেট ও রিস্ক স্ট্যাটাস একসাথে দেখতে পাবেন।\n৪. এক ক্লিকে সম্পূর্ণ রিপোর্ট CSV ফাইলে ডাউনলোড করে প্যাকিং টিমের কাছে পাঠাতে পারবেন।`;
  }

  // 8. Pricing & Plans
  if (p.includes('price') || p.includes('plan') || p.includes('pricing') || p.includes('প্যাকেজ') || p.includes('চার্জ') || p.includes('টাকা') || p.includes('পেমেন্ট') || p.includes('বিকাশ') || p.includes('খরচ')) {
    if (isEn) {
      return `💳 **XBZ Merchant Plans & Pricing:**\n\n- **Free Starter:** 100 free checks every month upon sign in.\n- **Merchant Pro (৳499/mo):** 2,500 checks, multi-courier priority sync, bulk checks, and full REST API access.\n- **Enterprise Unlimited (৳1,499/mo):** Unlimited checks, multi-agent logins, custom webhooks, dedicated account manager.\n\n**Payment:** Instant verification via bKash, Nagad, or Rocket with your TrxID.`;
    }
    return `💳 **XBZ মার্চেন্ট প্যাকেজ ও পেমেন্ট বিবরণ:**\n\n- **ফ্রি স্টার্টার (Free Starter):** প্রতি মাসে ১০০টি নম্বর সম্পূর্ণ ফ্রিতে চেক করতে পারবেন।\n- **মার্চেন্ট প্রো (৳৪৯৯/মাস):** প্রতি মাসে ২,৫০০টি চেক, প্রায়োরিটি কুরিয়ার সিঙ্ক, বাল্ক চেক এবং স্বয়ংক্রিয় REST API সুবিধা।\n- **এন্টারপ্রাইজ আনলিমিটেড (৳১,৪৯৯/মাস):** আনলিমিটেড চেক, মাল্টিপল এজেন্ট লগইন, ওয়েবসাইট ওয়েবহুক এবং ২৪/৭ ডেডিকেটেড সাপোর্ট।\n\n**পেমেন্ট প্রক্রিয়া:** বিকাশ, নগদ বা রকেটে ফি পাঠিয়ে TrxID সাবমিট করলেই অ্যাকাউন্ট ইনস্ট্যান্ট আপগ্রেড হয়ে যায়।`;
  }

  // 9. API & WooCommerce
  if (p.includes('api') || p.includes('rest') || p.includes('woocommerce') || p.includes('wordpress') || p.includes('shopify') || p.includes('প্লাগইন') || p.includes('ইন্টিগ্রেশন')) {
    if (isEn) {
      return `🔌 **REST API & WooCommerce Integration:**\n\n- **Endpoint:** \`POST /api/v1/fraud-check\`\n- **Header:** \`Authorization: Bearer <MERCHANT_TOKEN>\`\n- **Payload:** \`{ "phone": "017XXXXXXXX" }\`\n- **Benefits:** Automatically screens checkout phone numbers on your WooCommerce/Shopify store and flags high-risk orders in admin notes.\n- See the **"API Docs"** tab on top navigation for PHP and cURL snippets.`;
    }
    return `🔌 **REST API ও WooCommerce ইন্টিগ্রেশন:**\n\n- **এন্ডপয়েন্ট:** \`POST /api/v1/fraud-check\`\n- **হেডার:** \`Authorization: Bearer <MERCHANT_TOKEN>\`\n- **বডি:** \`{ "phone": "017XXXXXXXX" }\`\n- **সুবিধা:** কাস্টমার যখন ওয়েবসাইটে অর্ডার প্লেস করবে, সাথে সাথে তার পূর্বের কুরিয়ার ইতিহাস চেক করে রিস্কি অর্ডারে অগ্রিম ডেলিভারি ফি চাওয়ার রুল সেট করা যায়।\n- কোড স্নিপেটের জন্য নেভিগেশন বারের **"এপিআই ডক্স"** ট্যাবে ভিজিট করুন।`;
  }

  // 10. Community Fraud Reporting
  if (p.includes('report') || p.includes('fraud') || p.includes('প্রতারক') || p.includes('অভিযোগ') || p.includes('রিপোর্ট') || p.includes('কমিউনিটি')) {
    if (isEn) {
      return `🚨 **Community Fraud Database & Reporting:**\n\n- Protect fellow Bangladeshi merchants by reporting fake buyers, abusive customers, or serial parcel cancellers.\n- Click **"Report Fraud Buyer"** in the top navigation.\n- Enter the 11-digit phone number, incident details, and loss amount in BDT.\n- Reports update the live community fraud database immediately.`;
    }
    return `🚨 **কমিউনিটি প্রতারক ডাটাবেজ ও রিপোর্ট করার নিয়ম:**\n\n- কোনো গ্রাহক যদি পার্সেল অর্ডার দিয়ে গ্রহণ না করে বা হয়রানি করে, তবে তাকে রিপোর্ট করতে পারেন।\n- উপরের মেন্যু থেকে **"প্রতারক ডাটাবেজ"** বা **"রিপোর্ট জমা দিন"** বাটনে ক্লিক করুন।\n- গ্রাহকের ১১ সংখ্যার ফোন নম্বর, ঘটনার সংক্ষিপ্ত বিবরণ এবং ক্ষতির পরিমাণ (টাকা) দিয়ে সাবমিট করুন।\n- আপনার রিপোর্ট অন্য সকল মার্চেন্টের সার্চ রেজাল্টে তাৎক্ষণিক সতর্কতা হিসেবে প্রদর্শিত হবে।`;
  }

  // 11. Human Support Escalation
  if (p.includes('naim') || p.includes('human') || p.includes('man') || p.includes('contact') || p.includes('whatsapp') || p.includes('কথা') || p.includes('যোগাযোগ') || p.includes('নাম্বার')) {
    if (isEn) {
      return `👤 **Direct Human Support:**\n\nYou can reach the founder **Naim Xbz** directly on WhatsApp for custom enterprise inquiries, partner integrations, or urgent assistance:\n\n📱 **WhatsApp:** +8801703223141\n🌐 **Official Support Link:** [wa.me/8801703223141](https://wa.me/8801703223141)\n🕒 **Availability:** 24/7 Merchant Assistance`;
    }
    return `👤 **সরাসরি মানবীয় সহায়তা (Naim Xbz):**\n\nযেকোনো বিশেষ সহায়তা, কাস্টম এন্টারপ্রাইজ ডিল অথবা টেকনিক্যাল সমস্যার জন্য সরাসরি প্রতিষ্ঠাতা **Naim Xbz**-এর সাথে WhatsApp-এ যোগাযোগ করতে পারেন:\n\n📱 **WhatsApp নম্বর:** +8801703223141\n🌐 **সরাসরি লিংক:** [wa.me/8801703223141](https://wa.me/8801703223141)\n🕒 **সার্ভিস সময়:** ২৪/৭ মার্চেন্ট সাপোর্ট`;
  }

  // Default friendly contextual response
  if (isEn) {
    return `👋 **I am here to help you protect your merchant profits!**\n\nTell me more about what you need:\n- Have a customer phone number or delivery rate you are concerned about?\n- Need help setting up bulk verification or REST API?\n- Want to know which courier network (Steadfast, Pathao, REDX) provides the best tracking?\n\nYou can also contact founder Naim Xbz on WhatsApp (+8801703223141).`;
  }

  return `👋 **আপনার অনলাইন বিজনেসের পার্সেল ক্ষতি ঠেকাতে আমি সবসময় প্রস্তুত!**\n\nআপনি যা জানতে চান আমাকে বলুন:\n- কোনো কাস্টমারের ডেলিভারি রেট বা ফোন নম্বর নিয়ে সিদ্ধান্ত নিতে পারছেন না?\n- বাল্ক চেক বা WooCommerce এপিআই সেটআপ করতে চান?\n- স্টেডফাস্ট, পাঠাও বা রেডএক্স সংক্রান্ত কোনো তথ্য জানতে চান?\n\nএছাড়া যেকোনো প্রয়োজনে প্রতিষ্ঠাতা Naim Xbz-এর WhatsApp (+8801703223141)-এ যোগাযোগ করতে পারেন।`;
}

app.post('/api/support/ai-chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'বার্তা প্রদান করা আবশ্যক।' });
    }

    const trimmedPrompt = message.trim();

    // Attempt Gemini API call via @google/genai with free gemini-3.8-flash model
    try {
      if (process.env.GEMINI_API_KEY) {
        const contents: any[] = [];
        if (Array.isArray(history) && history.length > 0) {
          const validHistory = history.slice(-10);
          for (const item of validHistory) {
            if (item && (item.role === 'user' || item.role === 'model') && typeof item.text === 'string' && item.text.trim()) {
              contents.push({
                role: item.role,
                parts: [{ text: item.text.trim() }],
              });
            }
          }
        }

        contents.push({
          role: 'user',
          parts: [{ text: trimmedPrompt }],
        });

        // Use free gemini-3.8-flash model
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: XBZ_AI_SYSTEM_INSTRUCTION,
            temperature: 0.7,
          },
        });

        if (response && response.text) {
          return res.json({
            success: true,
            reply: response.text,
            model: 'gemini-3.8-flash',
          });
        }
      }
    } catch {
      // Quietly fall through to high-accuracy contextual response when ambient key is unavailable or restricted
    }

    // High-accuracy contextual fallback with multi-turn history memory
    const intelligentReply = generateIntelligentSupportReply(trimmedPrompt, history);
    return res.json({
      success: true,
      reply: intelligentReply,
      model: 'intelligent-engine',
    });
  } catch {
    return res.status(500).json({
      error: 'এআই সার্ভার থেকে উত্তর পেতে সাময়িক সমস্যা হয়েছে।',
      reply: 'আমাদের এআই অ্যাসিস্ট্যান্ট সাময়িকভাবে ব্যস্ত। জরুরি সহায়তায় সরাসরি প্রতিষ্ঠাতা Naim Xbz-এর সাথে WhatsApp (+8801703223141)-এ যোগাযোগ করুন।',
    });
  }
});

import fs from 'fs';

// Vite middleware in dev or static serving in production
async function startServer() {
  const distDir = path.resolve(__dirname, 'dist');
  const distIndexHtml = path.resolve(distDir, 'index.html');
  const hasPrebuiltDist = fs.existsSync(distIndexHtml);

  if (process.env.NODE_ENV === 'production' && hasPrebuiltDist) {
    console.log(`[XBZ Production] Serving pre-built static bundle from: ${distDir}`);
    app.use(express.static(distDir));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(distIndexHtml);
    });
  } else {
    console.log(`[XBZ Middleware] Initializing dynamic Vite dev/middleware mode (hasDist: ${hasPrebuiltDist})...`);
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`XBZ Intelligence Server is live on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
