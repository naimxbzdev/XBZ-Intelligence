import fs from 'fs';
import path from 'path';

export interface PricingSettings {
  freeChecksMonthly: number;
  proPriceBDT: number;
  proChecksMonthly: number;
  enterprisePriceBDT: number;
  enterpriseChecksMonthly: number;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  supportWhatsapp: string;
  systemNotice?: string;
}

const DEFAULT_PRICING: PricingSettings = {
  freeChecksMonthly: 100,
  proPriceBDT: 499,
  proChecksMonthly: 2500,
  enterprisePriceBDT: 1499,
  enterpriseChecksMonthly: 999999,
  bkashNumber: '01703223141',
  nagadNumber: '01703223141',
  rocketNumber: '017032231418',
  supportWhatsapp: '01703223141',
  systemNotice: '',
};

class PricingDatabase {
  private settings: PricingSettings = { ...DEFAULT_PRICING };
  private storageFile = path.resolve(process.cwd(), '.pricing_db.json');

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(this.storageFile)) {
        const raw = fs.readFileSync(this.storageFile, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          this.settings = { ...DEFAULT_PRICING, ...parsed };
        }
      } else {
        this.saveToDisk();
      }
    } catch {
      // Fallback
    }
  }

  private saveToDisk() {
    try {
      fs.writeFileSync(this.storageFile, JSON.stringify(this.settings, null, 2), 'utf-8');
    } catch {
      // Ignore
    }
  }

  public getSettings(): PricingSettings {
    return { ...this.settings };
  }

  public updateSettings(updates: Partial<PricingSettings>): PricingSettings {
    this.settings = {
      ...this.settings,
      ...updates,
    };
    this.saveToDisk();
    return this.settings;
  }
}

export const pricingDb = new PricingDatabase();
