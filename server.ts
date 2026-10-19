import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { CourierRegistry } from './src/server/courierAdapters.ts';
import { reportsDb } from './src/server/reportsDb.ts';
import { paymentDb } from './src/server/paymentDb.ts';
import { analyzePhoneNumber, normalizeBDPhone } from './src/server/analysisEngine.ts';
import { SmartposClient } from './src/server/smartposClient.ts';
import type { CourierConfig } from './src/types/intelligence.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

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

// POST /api/v1/fraud-check
app.post('/api/v1/fraud-check', async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
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

// GET /api/v1/fraud-check/:phone
app.get('/api/v1/fraud-check/:phone', async (req: Request, res: Response) => {
  try {
    const { phone } = req.params;
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

// Merchant auth mock
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'ইমেইল ও পাসওয়ার্ড প্রদান করুন।' });
  }

  const mockUser = {
    id: 'user_' + Math.random().toString(36).substr(2, 6),
    name: email.split('@')[0],
    email,
    storeName: email.split('@')[0].toUpperCase() + ' Express',
    apiKey: 'fraud_live_' + Buffer.from(email + Date.now()).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 24),
    plan: 'Merchant Pro',
    checksRemaining: 2500,
  };

  return res.json({
    success: true,
    user: mockUser,
    token: 'jwt_' + Buffer.from(JSON.stringify(mockUser)).toString('base64'),
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, storeName, phone } = req.body;
  if (!name || !email || !storeName) {
    return res.status(400).json({ error: 'সকল তথ্য পূরণ করা আবশ্যক।' });
  }

  const mockUser = {
    id: 'user_' + Math.random().toString(36).substr(2, 6),
    name,
    email,
    storeName,
    phone: phone || '',
    apiKey: 'fraud_live_' + Buffer.from(email + Date.now()).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 24),
    plan: 'Free Starter (100 checks/mo)',
    checksRemaining: 100,
  };

  return res.json({
    success: true,
    message: 'রেজিস্ট্রেশন সফল হয়েছে!',
    user: mockUser,
    token: 'jwt_' + Buffer.from(JSON.stringify(mockUser)).toString('base64'),
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
    });

    return res.json({
      success: true,
      message: 'পেমেন্ট সফলভাবে নিশ্চিত হয়েছে এবং আপনার অ্যাকাউন্ট তাৎক্ষণিকভাবে আপগ্রেড করা হয়েছে!',
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

// Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`XBZ Intelligence Server is live on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
