# Strict Feature Gating, Admin Payment Approval & Device/IP Abuse Prevention

A comprehensive, production-grade security and access control system ensuring premium features remain strictly locked for Free and Guest merchants until admin approval, enforced with server-side IP and hardware device fingerprinting to prevent free-tier cheating.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following specifications reflect the user's confirmed choices:
> - **Premium Features to Lock**: Batch Check, Community Fraud Database, and REST API Integration are strictly locked for all Guest and Free tier accounts.
> - **Anti-Cheat Enforcement**: User IP and Device Fingerprint detection will enforce usage limits server-side across all sessions, preventing users from resetting counters via incognito mode, cookie clearing, or new dummy accounts.
> - **Strict Payment Approval Gate**: Submitting bKash/Nagad/Rocket payment details places the request in `pending` review. Features remain locked with a dedicated "Pending Admin Review" status card and instant WhatsApp escalation button until an Admin approves the payment from the Admin Console.

---

## 1. Overview & Core Concept

### What It Does
1. **Server-Authoritative Device & IP Tracking**:
   - Computes a client-side multi-signal device fingerprint (canvas hash, WebGL hardware signature, audio context, screen depth, user-agent) paired with the server-detected client IP (`X-Forwarded-For` / remote IP).
   - Tracks exact lifetime search limits: 3 lifetime searches for unregistered guests, 100 monthly searches for free registered accounts per device/IP.
   - Prevents bypasses: Opening private/incognito tabs, clearing `localStorage`, or registering throwaway accounts from the same device/IP will immediately be identified by the backend and rejected with an HTTP 403 `LIMIT_REACHED` response until an admin grants an override or approves a paid package.

2. **Zero Instant-Unlock on Payment Submission**:
   - Replaces the premature client-side auto-activation with a strict transactional workflow.
   - Submissions persist to `.payments_db.json` with status `pending`.
   - The user interface immediately reflects the pending status with an informative timeline card, Transaction ID receipt, and direct 1-click WhatsApp verification contact to founder Naim Xbz (+8801703223141).
   - Only when an Admin logs into the Admin Dashboard and clicks "Approve Payment" does the server elevate the account to `pro` or `enterprise`, unlock the features, and grant quota.

3. **Strict Feature Gating (Guest & Free)**:
   - **Batch Check**: Locked. Shows high-conversion paywall with pending payment status if a submission is awaiting review.
   - **Community Database**: Locked. Shows verified merchant shield paywall.
   - **REST API & Plugins**: Locked. Token generation and documentation hidden behind active paid tier.
   - **Single Search**: Limited by server-enforced device/IP quota (3 for guest, 100 for free). When exhausted, a sleek modal prompts plan upgrade or WhatsApp administrative approval.

---

## 2. User Experience & Visual Design

### User Experience Flows

```
[ Visitor / Merchant arrives ]
       │
       ▼
[ Performs Search ] ──▶ [ Server checks IP + Device Fingerprint ]
       │                       │
       ├─ Quota remaining ─────┴─▶ Scan results displayed
       │
       └─ Quota exhausted ─────▶ [ Anti-Cheat Lockout Screen ]
                                        │
                                        ├─▶ [ Upgrade Package ]
                                        └─▶ [ Contact Admin on WhatsApp ]

[ Upgrades to Pro / Enterprise ]
       │
       ▼
[ Sends bKash/Nagad/Rocket & Submits TrxID ]
       │
       ▼
[ Status: PENDING ADMIN REVIEW ]
(Features remain LOCKED; Live status poller + WhatsApp priority review card)
       │
       ▼
[ Admin Reviews in Dashboard & Clicks "Approve" ]
       │
       ▼
[ Real-Time Sync ] ──▶ [ Account elevated: Pro / Enterprise UNLOCKED ]
```

### Visual Identity & Components
- **Pending Review Banner & Card**:
  - Deep slate background (`#0b1324`) with an amber badge indicating "অ্যাডমিন ভেরিফিকেশন অপেক্ষমান (Pending Approval)".
  - Displays submitted TrxID, sender number, timestamp, and package name.
  - Action button: Direct WhatsApp link (`wa.me/8801703223141`) with pre-filled message including TrxID for instant human verification.
  - Live "Check Status" button allowing the user to refresh their verification state instantly without a hard page reload.
- **Device & IP Abuse Prevention Lock Screen**:
  - Appears smoothly when the server returns 403 `QUOTA_EXHAUSTED`.
  - Explains cleanly that this device or IP network has completed its allotted free tier checks.
  - Removes all bypass cheat buttons ("Instant 1-Click Unlock").
- **Admin Package Approval Console**:
  - Enhanced UI in `AdminDashboard.tsx` with quick 1-click "Approve & Unlock Package", "Reject", and "Grant Custom Check Quota".
  - Shows IP address and Device Fingerprint associated with the payment submission.

---

## 3. Key Product Decisions & Trade-Offs

| Decision | Chosen Approach | Why | Alternative Considered |
| :--- | :--- | :--- | :--- |
| **Device Identification** | Combined client canvas/hardware fingerprint + Server IP | Client cookies and localStorage are easily wiped by users in incognito mode. Server-side IP + device hash pairing stops abuse across sessions. | Pure IP tracking (fails when users share NAT/office Wi-Fi) or pure cookies (easily cleared). |
| **Payment Verification State** | Server-persisted `pending` state with polling & WebSocket/fetch sync | Guarantees no merchant gets free access before money actually reaches the merchant account. | Automated SMS scrapers (unreliable and fragile in Bangladesh mobile banking). |
| **Instant Demo Unlock Button** | Completely removed from production paywall | Prevent users from self-unlocking premium features without paying or admin permission. | Hidden test button (too easy to find in DOM). |
| **Fast-Track WhatsApp Escalation** | Direct WhatsApp button with pre-filled TrxID | Bangladeshi e-commerce merchants prefer fast 2-minute confirmation via WhatsApp. | Email ticketing (too slow for real-time order dispatch). |

---

## 4. Technical Architecture & Data Strategy

### Technical Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                               CLIENT                                   │
│                                                                        │
│  ┌───────────────────────┐           ┌──────────────────────────────┐  │
│  │ Device Fingerprinter  │           │   Gated Components           │  │
│  │ (Canvas + Screen + UA)│           │   (BatchCheck, DB, API Docs) │  │
│  └──────────┬────────────┘           └──────────────▲───────────────┘  │
│             │                                       │                  │
│             ▼                                       │ (Gated by        │
│   HTTP Headers / Payload                            │  user.planId &   │
│   (X-Device-Id, X-Client-Ip)                        │  payment.status) │
│             │                                       │                  │
└─────────────┼───────────────────────────────────────┼──────────────────┘
              │                                       │
              ▼                                       │
┌─────────────────────────────────────────────────────┼──────────────────┐
│                           EXPRESS BACKEND           │                  │
│                                                     │                  │
│  ┌─────────────────────────┐         ┌──────────────┴───────────────┐  │
│  │ deviceLimitsDb          │         │ paymentDb & userDb           │  │
│  │ - IP + Device tracking  │         │ - Stores pending submissions │  │
│  │ - 3 guest / 100 free    │         │ - Admin approval elevates    │  │
│  │ - Admin whitelist       │         │   merchant to Pro/Enterprise │  │
│  └──────────┬──────────────┘         └──────────────▲───────────────┘  │
│             │                                       │                  │
│             ▼                                       │                  │
│  ┌─────────────────────────┐                        │                  │
│  │ /api/check-phone Guard  │                        │                  │
│  │ Blocks if quota reached ├────────────────────────┘                  │
│  └─────────────────────────┘                        │                  │
│                                                     │                  │
│  ┌──────────────────────────────────────────────────┴───────────────┐  │
│  │ Admin Endpoints                                                  │  │
│  │ POST /api/admin/packages/:id/approve ──▶ Unlocks Plan & Device   │  │
│  │ POST /api/admin/devices/reset        ──▶ Reset Device Quota      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Storage Schemas

#### 1. `.device_limits_db.json`
```json
{
  "devices": {
    "dev_fingerprint_hash": {
      "ip": "103.xxx.xxx.xxx",
      "guestSearches": 3,
      "freeSearches": 100,
      "isApprovedByAdmin": false,
      "lastActive": "2026-10-25T13:00:00Z",
      "associatedEmails": ["user@domain.com"]
    }
  },
  "ips": {
    "103.xxx.xxx.xxx": {
      "totalSearches": 103,
      "blocked": false
    }
  }
}
```

#### 2. Payment Flow Updates in `server.ts`
- `POST /api/payment/submit`: Creates submission with status `'pending'`. Does NOT update user's plan.
- `GET /api/payment/my-status`: Allows client to check the status of their latest payment using email or device fingerprint.
- `POST /api/admin/packages/:id/approve`:
  - Changes payment status to `'verified'`.
  - Updates merchant plan to `pro` / `enterprise`.
  - Upgrades checks quota (2,500 or 99,999).
  - Unblocks the associated device/IP so limits are lifted immediately.

#### 3. Client Frontend Upgrades
- `src/utils/deviceFingerprint.ts`: Lightweight, deterministic hardware fingerprinting utility (Canvas rendering hash, audio context seed, screen resolution, color depth, browser platform).
- `src/App.tsx`:
  - Pass `X-Device-Id` on all API requests.
  - Replace client-side optimistic plan upgrades with verified server plan check.
  - Render `PlanGatePaywall` for Batch Check, Community Database, and API Docs if user is `guest` or `free`.
  - If a user has a pending payment, `PlanGatePaywall` renders the active "Approval Pending" card with WhatsApp verification CTA instead of the purchase form.
- `src/components/PlanGatePaywall.tsx`:
  - Eliminate the demo unlock button.
  - Add Pending Approval state with transaction details and WhatsApp speedup button.
- `src/components/AdminDashboard.tsx`:
  - Add pending package notification badge.
  - Add Device/IP quota inspector with manual unlock/reset action for customer support.
  - Audit Log tab displaying all administrative actions (approvals, rejections, whitelisting, quota adjustments) with timestamps, admin email, and IP addresses.

---

## 5. Verification & Completed Deliverables

- [x] **Strict Feature Gating**: Batch Check, Community Database, and REST API are fully locked for all Guest and Free tier accounts.
- [x] **Zero Instant-Unlock on Payment**: When submitting bKash/Nagad/Rocket payments, the request enters `pending` review. Features stay locked until an admin explicitly clicks "Approve".
- [x] **Live Pending Status & WhatsApp CTA**: Gated feature paywalls and payment modal display a live pending card with Transaction ID and direct WhatsApp escalation link to founder Naim Xbz (`+8801703223141`).
- [x] **Hardware & IP Anti-Cheat Tracking**: `deviceLimitsDb.ts` + `getDeviceFingerprint()` track usage across browser sessions, incognito tabs, and cookie resets (enforcing 3 lifetime searches for guests, 100 free searches for registered accounts).
- [x] **Admin Dashboard with Audit Log & Device Inspector**: Admin can approve/reject pending submissions, view device fingerprints/IPs, whitelist devices, and inspect full audit logs of all actions with admin email and timestamps.
- [x] **Full Type-Check & Production Build**: Both `lint_applet` and `compile_applet` pass with 0 errors.
