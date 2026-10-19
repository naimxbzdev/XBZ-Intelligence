import fs from 'fs';
import path from 'path';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  storeName: string;
  role: 'admin' | 'merchant';
  plan: string;
  planId: 'free' | 'pro' | 'enterprise';
  status: 'approved' | 'pending' | 'suspended';
  checksRemaining: number;
  apiKey: string;
  createdAt: string;
  lastLoginAt: string;
}

const ADMIN_EMAILS = ['naimxbz@gmail.com', 'xbz.dev@gmail.com'];
const ADMIN_PASSWORD = 'n@!mXbz0';

const INITIAL_USERS: UserRecord[] = [
  {
    id: 'admin_naim',
    name: 'Naim Xbz',
    email: 'naimxbz@gmail.com',
    password: ADMIN_PASSWORD,
    phone: '01703223141',
    storeName: 'XBZ Intelligence HQ',
    role: 'admin',
    plan: 'Enterprise Admin (Unlimited)',
    planId: 'enterprise',
    status: 'approved',
    checksRemaining: 999999,
    apiKey: 'xbz_admin_live_master_9a87d6e5c4b3a2',
    createdAt: '2026-01-01T00:00:00Z',
    lastLoginAt: '2026-03-24T12:00:00Z',
  },
  {
    id: 'admin_naim_secondary',
    name: 'Naim Xbz (Dev)',
    email: 'xbz.dev@gmail.com',
    password: ADMIN_PASSWORD,
    phone: '01703223141',
    storeName: 'XBZ Intelligence Lab',
    role: 'admin',
    plan: 'Enterprise Admin (Unlimited)',
    planId: 'enterprise',
    status: 'approved',
    checksRemaining: 999999,
    apiKey: 'xbz_admin_dev_master_3f2a1b9c8d7e6',
    createdAt: '2026-01-01T00:00:00Z',
    lastLoginAt: '2026-03-24T12:00:00Z',
  },
  {
    id: 'user_merchant_01',
    name: 'তানভীর হাসান',
    email: 'tanvir@fashionbd.com',
    password: 'password123',
    phone: '01711223344',
    storeName: 'Dhaka Fashion Hub',
    role: 'merchant',
    plan: 'Merchant Pro (2,500 checks)',
    planId: 'pro',
    status: 'approved',
    checksRemaining: 2340,
    apiKey: 'fraud_live_df827a19c83b4e7261',
    createdAt: '2026-03-10T10:14:00Z',
    lastLoginAt: '2026-03-23T16:30:00Z',
  },
  {
    id: 'user_merchant_02',
    name: 'সাবরিনা আক্তার',
    email: 'sabrina@glamourbd.com',
    password: 'password123',
    phone: '01822334455',
    storeName: 'Glamour Boutique',
    role: 'merchant',
    plan: 'Free Starter (100 checks/mo)',
    planId: 'free',
    status: 'approved',
    checksRemaining: 74,
    apiKey: 'fraud_live_9b8c7d6e5f4a3b2c1d',
    createdAt: '2026-03-15T14:20:00Z',
    lastLoginAt: '2026-03-22T11:45:00Z',
  },
  {
    id: 'user_merchant_03',
    name: 'মাহমুদুল ইসলাম',
    email: 'mahmud@techzonebd.com',
    password: 'password123',
    phone: '01933445566',
    storeName: 'TechZone BD',
    role: 'merchant',
    plan: 'Enterprise Unlimited',
    planId: 'enterprise',
    status: 'approved',
    checksRemaining: 99999,
    apiKey: 'fraud_live_e3f2d1c9b8a7654321',
    createdAt: '2026-03-01T09:00:00Z',
    lastLoginAt: '2026-03-24T08:15:00Z',
  },
  {
    id: 'user_merchant_04',
    name: 'কামরুল হাসান',
    email: 'kamrul@organicfood.bd',
    password: 'password123',
    phone: '01655667788',
    storeName: 'Organic Agro Mart',
    role: 'merchant',
    plan: 'Free Starter (100 checks/mo)',
    planId: 'free',
    status: 'pending',
    checksRemaining: 100,
    apiKey: 'fraud_live_7a6b5c4d3e2f109876',
    createdAt: '2026-03-23T18:05:00Z',
    lastLoginAt: '2026-03-23T18:05:00Z',
  },
];

class UserDatabase {
  private users: UserRecord[] = [...INITIAL_USERS];
  private storageFile = path.resolve(process.cwd(), '.users_db.json');

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(this.storageFile)) {
        const raw = fs.readFileSync(this.storageFile, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge ensuring admin records always exist
          const map = new Map<string, UserRecord>();
          INITIAL_USERS.forEach((u) => map.set(u.email.toLowerCase(), u));
          parsed.forEach((u: UserRecord) => {
            if (u && u.email) {
              map.set(u.email.toLowerCase(), u);
            }
          });
          this.users = Array.from(map.values());
        }
      } else {
        this.saveToDisk();
      }
    } catch {
      // Fallback to initial
    }
  }

  private saveToDisk() {
    try {
      fs.writeFileSync(this.storageFile, JSON.stringify(this.users, null, 2), 'utf-8');
    } catch {
      // Ignore disk error in memory fallback
    }
  }

  public getAllUsers(includeSensitive = false): Partial<UserRecord>[] {
    return this.users.map((u) => {
      const copy = { ...u };
      if (!includeSensitive) {
        delete copy.password;
      }
      return copy;
    });
  }

  public findByEmail(email: string): UserRecord | undefined {
    const clean = email.trim().toLowerCase();
    return this.users.find((u) => u.email.toLowerCase() === clean);
  }

  public findById(id: string): UserRecord | undefined {
    return this.users.find((u) => u.id === id);
  }

  public authenticate(email: string, password: string): { user?: UserRecord; error?: string; isAdmin: boolean } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. Direct Master Admin Check
    if (ADMIN_EMAILS.includes(cleanEmail)) {
      if (cleanPass === ADMIN_PASSWORD) {
        let admin = this.findByEmail(cleanEmail);
        if (!admin) {
          admin = {
            id: 'admin_' + Math.random().toString(36).substr(2, 6),
            name: 'Naim Xbz (Admin)',
            email: cleanEmail,
            password: ADMIN_PASSWORD,
            phone: '01703223141',
            storeName: 'XBZ Intelligence HQ',
            role: 'admin',
            plan: 'Enterprise Admin (Unlimited)',
            planId: 'enterprise',
            status: 'approved',
            checksRemaining: 999999,
            apiKey: 'xbz_admin_' + Date.now(),
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          };
          this.users.push(admin);
          this.saveToDisk();
        } else {
          admin.lastLoginAt = new Date().toISOString();
          this.saveToDisk();
        }
        return { user: admin, isAdmin: true };
      }
      return { error: 'এডমিন পাসওয়ার্ড ভুল প্রদান করা হয়েছে।', isAdmin: true };
    }

    // 2. Regular Registered Merchant Check
    const user = this.findByEmail(cleanEmail);
    if (!user) {
      return { error: 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে রেজিস্ট্রেশন করুন।', isAdmin: false };
    }

    if (user.status === 'suspended') {
      return { error: 'আপনার অ্যাকাউন্ট সাময়িকভাবে স্থগিত করা হয়েছে। সাপোর্টে যোগাযোগ করুন।', isAdmin: false };
    }

    if (user.password !== cleanPass) {
      return { error: 'পাসওয়ার্ড সঠিক নয়। অনুগ্রহ করে পুনরায় চেষ্টা করুন।', isAdmin: false };
    }

    user.lastLoginAt = new Date().toISOString();
    this.saveToDisk();

    return { user, isAdmin: user.role === 'admin' };
  }

  public register(data: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    storeName: string;
    planId?: 'free' | 'pro' | 'enterprise';
  }): { user?: UserRecord; error?: string } {
    const cleanEmail = data.email.trim().toLowerCase();

    if (this.findByEmail(cleanEmail)) {
      return { error: 'এই ইমেইল দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট সক্রিয় রয়েছে। অনুগ্রহ করে লগইন করুন।' };
    }

    const planId = data.planId || 'free';
    const planName = planId === 'enterprise' 
      ? 'Enterprise Unlimited' 
      : planId === 'pro' 
      ? 'Merchant Pro (2,500 checks)' 
      : 'Free Starter (100 checks/mo)';
    
    const checksRemaining = planId === 'enterprise' ? 99999 : planId === 'pro' ? 2500 : 100;

    const newUser: UserRecord = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name: data.name.trim(),
      email: cleanEmail,
      password: data.password ? data.password.trim() : 'password123',
      phone: data.phone ? data.phone.trim() : '01700000000',
      storeName: data.storeName.trim(),
      role: 'merchant',
      plan: planName,
      planId,
      status: 'approved',
      checksRemaining,
      apiKey: 'fraud_live_' + Buffer.from(cleanEmail + Date.now()).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 24),
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    this.saveToDisk();

    return { user: newUser };
  }

  public updateUser(id: string, updates: Partial<UserRecord>): UserRecord | null {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    this.users[index] = {
      ...this.users[index],
      ...updates,
    };
    this.saveToDisk();
    return this.users[index];
  }

  public deleteUser(id: string): boolean {
    const user = this.findById(id);
    if (!user) return false;
    // Don't delete master admin
    if (user.role === 'admin' && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      return false;
    }

    this.users = this.users.filter((u) => u.id !== id);
    this.saveToDisk();
    return true;
  }

  public deductCheck(emailOrId: string): number {
    const user = this.users.find((u) => u.id === emailOrId || u.email.toLowerCase() === emailOrId.toLowerCase());
    if (!user) return 0;
    if (user.planId === 'enterprise' || user.role === 'admin') return 999999;
    user.checksRemaining = Math.max(0, user.checksRemaining - 1);
    this.saveToDisk();
    return user.checksRemaining;
  }
}

export const userDb = new UserDatabase();
