import type { SmartposKeyConfig } from '../types/intelligence.ts';
import fs from 'fs';
import path from 'path';

const INITIAL_SMARTPOS_KEYS: SmartposKeyConfig[] = [
  {
    id: 'sp_key_01',
    name: 'SmartPOS Account #1 (Primary)',
    apiKey: process.env.SMARTPOS_FRAUD_API_KEY || 'fraud_vRSyppIMF080gu4VE1TYRDqHsYIPL0Ms',
    domain: process.env.SMARTPOS_DOMAIN || 'intelligence.xbz.com.bd',
    monthlyLimit: 1000,
    usageCount: 385,
    status: 'active',
    lastUsedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    createdAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'sp_key_02',
    name: 'SmartPOS Account #2 (Standby Backup)',
    apiKey: 'fraud_k982j3h4g5f6d7s8a9q0w1e2r3t4y5u6',
    domain: 'backup.xbz.com.bd',
    monthlyLimit: 1000,
    usageCount: 0,
    status: 'active',
    createdAt: '2026-03-15T00:00:00Z',
  },
  {
    id: 'sp_key_03',
    name: 'SmartPOS Account #3 (Reserve Pool)',
    apiKey: 'fraud_m1n2b3v4c5x6z7l8k9j0h1g2f3d4s5a6',
    monthlyLimit: 1000,
    usageCount: 0,
    status: 'active',
    createdAt: '2026-03-20T00:00:00Z',
  },
];

class SmartposKeyManager {
  private keys: SmartposKeyConfig[] = [...INITIAL_SMARTPOS_KEYS];
  private storageFile = path.resolve(process.cwd(), '.smartpos_keys.json');

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(this.storageFile)) {
        const raw = fs.readFileSync(this.storageFile, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.keys = parsed;
        }
      } else {
        this.saveToDisk();
      }
    } catch {
      // Memory fallback
    }
  }

  private saveToDisk() {
    try {
      fs.writeFileSync(this.storageFile, JSON.stringify(this.keys, null, 2), 'utf-8');
    } catch {
      // Ignore
    }
  }

  public getAllKeys(): SmartposKeyConfig[] {
    return [...this.keys];
  }

  public getKeyById(id: string): SmartposKeyConfig | undefined {
    return this.keys.find((k) => k.id === id);
  }

  /**
   * Returns keys that are enabled and not exhausted, in priority order
   */
  public getEligibleKeys(): SmartposKeyConfig[] {
    return this.keys.filter(
      (k) => k.status !== 'disabled' && k.status !== 'exhausted' && k.usageCount < k.monthlyLimit
    );
  }

  /**
   * Retrieves the current primary serving key
   */
  public getActiveServingKey(): SmartposKeyConfig | null {
    const eligible = this.getEligibleKeys();
    return eligible.length > 0 ? eligible[0] : null;
  }

  /**
   * Records a successful query using the specified key
   */
  public recordSuccess(keyId: string): void {
    const key = this.getKeyById(keyId);
    if (!key) return;

    key.usageCount += 1;
    key.lastUsedAt = new Date().toISOString();

    // Auto-mark as exhausted when limit reaches 1000
    if (key.usageCount >= key.monthlyLimit) {
      key.status = 'exhausted';
      key.lastError = `Monthly limit of ${key.monthlyLimit.toLocaleString()} checks reached. Traffic automatically rerouted to next standby key.`;
    }

    this.saveToDisk();
  }

  /**
   * Marks a key as exhausted due to upstream quota/rate limit error (e.g. HTTP 429 / 402 / 403)
   */
  public recordQuotaExhausted(keyId: string, errorReason?: string): void {
    const key = this.getKeyById(keyId);
    if (!key) return;

    key.status = 'exhausted';
    key.lastError = errorReason || 'Upstream SmartPOS API quota exceeded (HTTP 429/402). Standby key engaged.';
    key.lastUsedAt = new Date().toISOString();
    this.saveToDisk();
  }

  /**
   * Adds a new API key to the rotation pool
   */
  public addKey(data: {
    name: string;
    apiKey: string;
    domain?: string;
    monthlyLimit?: number;
  }): SmartposKeyConfig {
    const newKey: SmartposKeyConfig = {
      id: 'sp_key_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4),
      name: data.name.trim(),
      apiKey: data.apiKey.trim(),
      domain: data.domain?.trim() || undefined,
      monthlyLimit: typeof data.monthlyLimit === 'number' && data.monthlyLimit > 0 ? data.monthlyLimit : 1000,
      usageCount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    this.keys.push(newKey);
    this.saveToDisk();
    return newKey;
  }

  /**
   * Adds multiple keys to the pool in a batch
   */
  public addMultipleKeys(
    keysData: Array<{ name?: string; apiKey: string; domain?: string; monthlyLimit?: number }>
  ): SmartposKeyConfig[] {
    const createdKeys: SmartposKeyConfig[] = [];
    for (const data of keysData) {
      if (!data.apiKey || !data.apiKey.trim()) continue;
      const count = this.keys.length + 1;
      const created = this.addKey({
        name: data.name?.trim() || `SmartPOS Key #${count}`,
        apiKey: data.apiKey.trim(),
        domain: data.domain?.trim() || undefined,
        monthlyLimit: typeof data.monthlyLimit === 'number' && data.monthlyLimit > 0 ? data.monthlyLimit : 1000,
      });
      createdKeys.push(created);
    }
    return createdKeys;
  }

  /**
   * Updates key configuration (e.g. limit, status, name)
   */
  public updateKey(id: string, updates: Partial<SmartposKeyConfig>): SmartposKeyConfig | null {
    const index = this.keys.findIndex((k) => k.id === id);
    if (index === -1) return null;

    this.keys[index] = {
      ...this.keys[index],
      ...updates,
    };

    // If usage count is manually set below limit and status was exhausted, reactivate
    if (
      typeof updates.usageCount === 'number' &&
      this.keys[index].usageCount < this.keys[index].monthlyLimit &&
      this.keys[index].status === 'exhausted'
    ) {
      this.keys[index].status = 'active';
      delete this.keys[index].lastError;
    }

    this.saveToDisk();
    return this.keys[index];
  }

  /**
   * Resets monthly usage count back to 0 (recharges key)
   */
  public resetUsage(id: string): SmartposKeyConfig | null {
    const key = this.getKeyById(id);
    if (!key) return null;

    key.usageCount = 0;
    key.status = 'active';
    delete key.lastError;
    this.saveToDisk();
    return key;
  }

  /**
   * Removes key from the pool
   */
  public deleteKey(id: string): boolean {
    const index = this.keys.findIndex((k) => k.id === id);
    if (index === -1) return false;

    this.keys.splice(index, 1);
    this.saveToDisk();
    return true;
  }

  /**
   * Aggregate pool statistics
   */
  public getPoolSummary() {
    const totalCapacity = this.keys.reduce((sum, k) => sum + k.monthlyLimit, 0);
    const usedChecks = this.keys.reduce((sum, k) => sum + k.usageCount, 0);
    const remainingChecks = Math.max(0, totalCapacity - usedChecks);
    const eligible = this.getEligibleKeys();
    const activeServingKey = eligible.length > 0 ? eligible[0] : null;

    return {
      totalKeys: this.keys.length,
      activeKeysCount: eligible.length,
      exhaustedKeysCount: this.keys.filter((k) => k.status === 'exhausted').length,
      totalCapacity,
      usedChecks,
      remainingChecks,
      activeServingKey,
    };
  }
}

export const smartposKeyManager = new SmartposKeyManager();
