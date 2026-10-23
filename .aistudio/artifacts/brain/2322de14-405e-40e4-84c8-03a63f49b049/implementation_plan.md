# SmartPOS Multi-API Key Pooling & Automatic Failover Engine

An enterprise multi-key load balancer and failover rotation architecture for SmartPOS fraud screening. Allows administrators to configure multiple API keys (each with an individual quota, default 1,000 checks/month). When an active key hits its 1,000-request limit or returns an upstream quota error, the system automatically rolls over to the next available API key in real time with zero downtime or merchant-facing interruption.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed through interactive clarification and will guide implementation:

- **Confirmed Decision 1 (Rollover Trigger)**: The engine advances to the next key in the pool whenever a key reaches its 1,000-lookup ceiling (`usageCount >= monthlyLimit`) OR receives an upstream HTTP quota exceeded / rate limit error (HTTP 429, 402, 403, or quota-depleted response payload).
- **Confirmed Decision 2 (Admin Management & Visual Telemetry)**: Keys and real-time usage meters will be managed directly in the Admin Dashboard with key-wise live progress bars, remaining check counters, active key badges, and monthly reset controls.
- **Confirmed Decision 3 (Pool Exhaustion Fallback)**: If every configured API key in the pool becomes exhausted, the system seamlessly falls back to the local benchmark and community dispute cache with administrative alerts, ensuring public and merchant check workflows never break.

---

### 1. Overview & Core Concept

- **What It Does**:
  1. **Key Pool Management**: Store and cycle through an arbitrary number of SmartPOS API credentials (`Key 1`, `Key 2`, `Key 3`, ...).
  2. **Automated Cascade Failover**: Tracks actual requests served per key. Upon reaching 1,000 queries (or an API limit exception), automatically switches traffic to the next standby key in milliseconds without dropping the user's search request.
  3. **Live Admin Monitoring**: Real-time visual progress bars (`420 / 1,000`), status indicators (`Active`, `Standby`, `Exhausted`, `Disabled`), and manual counter reset/recharge controls.
  4. **Resilient Dual Storage**: Persistent state stored on disk in `.smartpos_keys.json` with REST synchronization and client-side fallback.
- **Target Audience**: Platform administrators looking to combine multiple 1,000-limit SmartPOS accounts to achieve higher monthly capacity (e.g., 3,000, 5,000, or 10,000+ checks).
- **Key Value**: Guarantees 100% uptime for merchant checkout plugins and phone screenings even when individual vendor API limits are capped at 1,000 checks.

---

### 2. User Experience & Visual Design

- **Admin Dashboard Integration**:
  - Embedded within the Admin Dashboard as a dedicated control module: **"SmartPOS এপিআই পুল ও অটো-ফেইলওভার (SmartPOS Key Pool & Failover)"**.
  - **Summary Metric Header**:
    - `Active Key`: Name and truncated token of the currently serving API key (e.g., `Account #1 (Primary) · fraud_vRSy...0Ms`).
    - `Total Pool Capacity`: Aggregate lookups across all configured keys (e.g., `2,340 / 3,000 checks remaining` with total pool gauge).
    - `Healthy / Active Standby Keys`: Count of ready-to-serve keys.
  - **Key Cards & Progress Meters**:
    - High-density card for each configured key:
      - Key Title & Gateway domain.
      - Usage Progress Bar: Emerald (`< 75%`), Amber (`75% - 95%`), Crimson / Pulsing (`Exhausted / 100%`).
      - Tabular Numerals: `font-mono tabular-nums` display of `Used: 840 / 1,000 (84%) · Remaining: 160`.
      - Status Badges:
        - `Serving Traffic (সক্রিয়)` - glowing cyan/emerald border.
        - `Standby (স্ট্যান্ডবাই)` - ready to take over once current key exhausts.
        - `Limit Exhausted (সীমা শেষ)` - reached 1,000 checks or upstream limit error.
        - `Disabled` - temporarily paused by admin.
    - Inline Actions:
      - **Reset Counter (কাউন্টার রিসেট)**: Resets monthly tally back to 0 upon billing cycle renewal.
      - **Edit Quota (কোটা পরিবর্তন)**: Adjust monthly limit (e.g., change from 1,000 to custom limit).
      - **Toggle Active / Disabled**: Enable or disable a key manually.
      - **Delete Key (মুছে ফেলুন)**: Remove key from pool.
  - **Add Key Modal**:
    - Form fields: Key Label/Name, SmartPOS API Key (`X-API-KEY`), Domain (`X-Domain`, optional), and Monthly Quota (default: 1,000).

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Pre-Emptive Counter + Reactive Error Catching**:
  - *Chosen Approach*: Increment a persistent internal counter for each successful query, AND catch upstream quota errors (HTTP 429/402/403 or `{ status: false, message: 'limit' }`).
  - *Why*: Pre-emptive counter prevents unnecessary failed network round-trips once 1,000 requests are hit, while reactive error catching immediately detects if a key was capped early upstream.
- **Decision 2: In-Flight Retry on Limit Detection**:
  - *Chosen Approach*: When a lookup fails due to quota exhaustion on Key $N$, the backend immediately invokes Key $N+1$ inside the same HTTP request cycle and returns the successful result to the merchant without requiring a retry button click.
  - *Why*: Provides true zero-downtime failover with seamless latency.
- **Decision 3: Fallback Preservation**:
  - *Chosen Approach*: If all pool keys become exhausted, seamlessly return high-fidelity cached and community dispute intelligence with an administrative warning.
  - *Why*: Never breaks customer checkout or merchant lookup operations.

---

### 4. Technical Architecture & Data Strategy

```
┌───────────────────────────────────────────────────────────────────────────┐
│                      Phone Fraud Screening Request                        │
│                 (POST /api/check-phone or REST /api/v1/check)             │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                        SmartposKeyManager (Singleton)                     │
│  - Reads key pool from .smartpos_keys.json                                │
│  - Selects active key where status === 'active' & usageCount < limit      │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                 ┌────────────────────┴────────────────────┐
                 │                                         │
        [Active Key #1 Ready]                     [All Keys Exhausted]
                 │                                         │
                 ▼                                         ▼
┌────────────────────────────────┐        ┌────────────────────────────────┐
│   Execute SmartPOS Request     │        │ Fall back to Local Smart Cache │
│   X-API-KEY: Key #1            │        │ & Community Dispute Registry   │
└────────┬──────────────┬────────┘        └────────────────────────────────┘
         │              │
    [Success 200]  [Quota 429/Error]
         │              │
         ▼              ▼
┌─────────────────┐ ┌──────────────────────────────────────────────────────┐
│ usageCount++    │ │ Mark Key #1 as 'exhausted'                           │
│ Return Result   │ │ Instant In-Flight Rollover -> Execute with Key #2    │
└─────────────────┘ └──────────────────────────────────────────────────────┘
```

#### File Modifications & Implementation Steps:
1. **`src/types/intelligence.ts`**:
   - Define `SmartposKeyConfig` interface:
     ```ts
     export interface SmartposKeyConfig {
       id: string;
       name: string;
       apiKey: string;
       domain?: string;
       monthlyLimit: number;
       usageCount: number;
       status: 'active' | 'exhausted' | 'disabled' | 'error';
       lastUsedAt?: string;
       lastError?: string;
       createdAt: string;
     }
     ```
2. **`src/server/smartposKeyManager.ts` (New Core Engine)**:
   - Manages list of keys with persistent JSON storage in `.smartpos_keys.json`.
   - Methods: `getActiveKey()`, `recordSuccess(keyId)`, `recordQuotaExhausted(keyId, error)`, `addKey(data)`, `updateKey(id, updates)`, `resetUsage(id)`, `deleteKey(id)`.
   - Seed with initial production key and mock pool entries so the user can test failover immediately.
3. **`src/server/smartposClient.ts`**:
   - Upgrade `SmartposClient.checkPhone`:
     - Loop through eligible keys from `SmartposKeyManager`.
     - Execute fetch with current key.
     - On success: call `recordSuccess(keyId)` and return data.
     - On limit/quota failure: call `recordQuotaExhausted(keyId)` and immediately try the next key in the pool.
     - If all keys fail: fall back to local benchmark database.
4. **`server.ts`**:
   - Add admin endpoints:
     - `GET /api/admin/smartpos/keys`
     - `POST /api/admin/smartpos/keys`
     - `PUT /api/admin/smartpos/keys/:id`
     - `POST /api/admin/smartpos/keys/:id/reset`
     - `DELETE /api/admin/smartpos/keys/:id`
5. **`src/components/AdminDashboard.tsx`**:
   - Added Sub-Tab: **"SmartPOS কী পুল (SmartPOS Key Pool)"** with active counter badge.
   - Rendered interactive key cards with live progress bars, status badges, tabular numerals, and action buttons (Reset, Pause/Enable, Edit Limit, Delete).
   - Included "Add New API Key", "Edit Key Limit", and "Delete Key" modal dialogs.
   - Added interactive "Test Auto-Rollover" simulator allowing the admin to click and observe real-time rollover to the standby key.

---

### 5. Implementation Status: Complete ✅

- **Admin Package Approval / Rejection / Deletion**: Fully operational with customizable check credit overrides.
- **Admin User Ban / Unban**: Real-time account locking with API key invalidation and session protection for root admins.
- **Admin Direct Package & Limit Editing**: Preset selector with direct manual credit allocation.
- **SmartPOS Multi-API Key Pooling & Automatic Failover**: Fully implemented with disk persistence (`.smartpos_keys.json`), REST endpoints, in-flight cascade rollover across all configured keys upon 1,000 requests or HTTP 429 quota errors, live visual progress bars, and zero-downtime local database fallback.
