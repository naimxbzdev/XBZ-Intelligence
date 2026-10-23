# Admin Control Center: Package Approvals, User Ban & Plan Limit Management

A complete administrative management suite enabling root administrators to review, approve, reject, and delete merchant package upgrade requests, ban or reinstate users with immediate session and API key revocation, and directly modify any merchant's plan tier and remaining credit check limits.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed through interactive clarification and will guide implementation:

- **Confirmed Decision 1 (Limit Assignment on Approval)**: When an admin approves a package upgrade request, the user's account is automatically provisioned with the standard plan quota (Free: 100, Pro: 2,500, Enterprise: 99,999) with an instant option to enter a custom credit check limit.
- **Confirmed Decision 2 (Ban Restrictions)**: Banning a merchant immediately blocks authentication/login, suspends existing active sessions, and revokes access to the courier fraud analysis engine and REST API.
- **Confirmed Decision 3 (Interface Layout)**: Package approval, rejection, and deletion workflows will be housed in a dedicated "প্যাকেজ রিকোয়েস্ট (Package Requests)" tab with actionable batch filters, plus quick-action controls inline within the User Management directory.

---

### 1. Overview & Core Concept

- **What It Does**: Empowers administrators of XBZ Intelligence to exert granular authority over merchant subscriptions and system security:
  1. **Package Request Queue**: View real-time bKash, Nagad, and Rocket package upgrade transactions, review sender numbers and TrxIDs, with single-click **Approve**, **Reject** (with reason), and **Delete** capabilities.
  2. **Ban / Suspend Engine**: One-click user ban toggling (`suspended` $\leftrightarrow$ `approved`) with instantaneous API revocation and friendly bilingual warning prompts on merchant login attempts.
  3. **Plan & Limit Customizer**: A dedicated modal allowing admins to reassign any user's subscription tier (Free, Pro, Enterprise, or Custom) and manually override their credit balance (`checksRemaining`) to any custom value.
- **Target Audience**: Platform administrators and operations managers (`naimxbz@gmail.com`, `xbz.dev@gmail.com`).
- **Key Value**: Streamlines payment verification and monetization operations, eliminates manual database editing, and provides rapid moderation tools to counter abusive or fraudulent users.

---

### 2. User Experience & Visual Design

- **Admin Dashboard Layout**:
  - **Tabs Navigation**: `মার্চেন্ট তালিকা (Users)` · `প্যাকেজ রিকোয়েস্ট (Package Requests)` · `এনালিটিক্স (Analytics)` · `মূল্য তালিকা (Pricing Settings)`.
  - **Package Requests Tab**:
    - High-density table featuring Submission Date, Merchant Name/Email, Requested Plan, Amount (BDT), Payment Gateway (bKash/Nagad/Rocket badge), Sender Number, TrxID, and Status (`pending`, `verified/approved`, `rejected`).
    - Action controls for each row:
      - **Approve (অনুমোদন)**: Activates package, assigns plan credits to the merchant account, and updates status with green indicator.
      - **Reject (বাতিল)**: Rejects the request, logs administrative reason, and retains record for audit.
      - **Delete (মুছে ফেলুন)**: Confirms and permanently purges invalid/spam payment records.
  - **User Directory Enhancements**:
    - **Status Column**: Clear indicators for `Approved (সক্রিয়)`, `Pending (অপেক্ষমান)`, and `Banned / Suspended (স্থগিত)`.
    - **Inline Quick Actions**:
      - **Edit Plan & Limit**: Opens modal with plan selector dropdown and numerical credit balance input.
      - **Ban / Unban**: Dynamic button with shield-alert icon to immediately revoke or reinstate account access.
      - **Delete User**: Permanent removal confirmation modal with protected immunity for master administrator accounts.
  - **Edit Package & Limit Modal**:
    - Plan Tier selection (`Free Starter`, `Merchant Pro`, `Enterprise Unlimited`, `Custom Plan`).
    - Direct credit input with tabular figures (`font-mono`) and preset quick-add buttons (`+500`, `+1,000`, `+5,000`, `Unlimited`).
    - Status toggle (`Approved`, `Pending`, `Banned`).
    - Instant preview of changes with save confirmation toast.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Synchronization between Local Storage and Server Disk DB**:
  - *Chosen Approach*: Maintain full dual synchronization between the Express server (`userDb.ts` / `paymentDb.ts`) and client-side `localStorage`.
  - *Why*: Ensures flawless responsiveness both in full-stack server modes and static preview / Netlify serverless runtimes.
- **Decision 2: Strict Ban Enforcement in Authentication and API Endpoints**:
  - *Chosen Approach*: When a merchant is banned (`status: 'suspended'`), check both the login route `/api/auth/login` and courier fraud query routes (`/api/check`, `/api/bulk-check`, REST API token validators) to reject requests immediately with HTTP 403.
  - *Why*: Prevents banned accounts from consuming server resources or using previously cached API keys.
- **Decision 3: Non-Destructive Reject vs. Permanent Delete**:
  - *Chosen Approach*: Package requests support both "Reject" (marks status as `rejected` with timestamp for audit trails) and "Delete" (purges the record from the database).
  - *Why*: Accommodates administrative reviews where a payment might have been sent with a wrong TrxID without losing the merchant's contact record.

---

### 4. Technical Architecture & Data Strategy

```
┌───────────────────────────────────────────────────────────────────────────┐
│                       Admin Dashboard (React SPA)                         │
├─────────────────────────────┬─────────────────────────────────────────────┤
│   [Users Management Tab]    │       [Package Requests Tab]                │
│  - Filter & Search          │      - Filter: Pending / Approved / Rejected│
│  - Edit Plan & Limit Modal  │      - Approve Button (Auto-credit user)    │
│  - Ban / Unban Toggle       │      - Reject Button (Audit log)            │
│  - Delete User Confirmation │      - Delete Record Action                 │
└──────────────┬──────────────┴──────────────────────┬──────────────────────┘
               │                                     │
               ▼                                     ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                           Express Server API                              │
├───────────────────────────────────────────────────────────────────────────┤
│  POST /api/admin/users/:id/update     POST /api/admin/packages/:id/approve│
│  POST /api/admin/users/:id/ban        POST /api/admin/packages/:id/reject │
│  POST /api/admin/users/:id/unban      DELETE /api/admin/packages/:id      │
│  DELETE /api/admin/users/:id          GET /api/payment/history            │
└──────────────┬─────────────────────────────────────┬──────────────────────┘
               │                                     │
               ▼                                     ▼
┌───────────────────────────────┐     ┌─────────────────────────────────────┐
│  userDb (.users_db.json)      │     │  paymentDb (.payments_db.json)      │
│  - UserRecord                 │     │  - PaymentSubmission                │
│    status: 'approved' |       │     │    status: 'pending' | 'verified' | │
│            'pending' |        │     │            'rejected'               │
│            'suspended'        │     │    userEmail, planId, trxId         │
│    checksRemaining: number    │     │    amountBDT, senderNumber          │
│    planId, planName           │     └─────────────────────────────────────┘
└───────────────────────────────┘
```

#### API & Data Store Updates
1. **`src/types/intelligence.ts` & `src/server/paymentDb.ts`**:
   - Update `PaymentSubmission['status']` type to `'pending' | 'verified' | 'rejected'`.
   - Add methods to `paymentDb`: `updatePaymentStatus(id, status, reason?)`, `deletePayment(id)`.
2. **`src/server/userDb.ts`**:
   - Add methods `banUser(id)`, `unbanUser(id)`, and `updatePlanAndLimits(id, planId, planName, checksRemaining)`.
   - Enforce ban check in `authenticate` and `deductCheck`.
3. **`server.ts`**:
   - Wire admin routes for package approvals, rejections, deletions, and user plan/limit edits with admin email authorization guard.
4. **`src/components/AdminDashboard.tsx`**:
   - Add new `packages` tab navigation.
   - Implement package requests data table with quick filters and Approve/Reject/Delete action handlers.
   - Implement "Edit Plan & Limit" modal with custom check inputs.
   - Add Ban / Unban actions with visual status tags and confirmation alerts.
   - Ensure all English and Bengali labels are seamlessly translated.
