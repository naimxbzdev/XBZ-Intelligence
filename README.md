# XBZ Intelligence (XBZ ইন্টেলিজেন্স)

> **Bangladesh's Premier E-Commerce Courier History Lookup & Delivery-Risk Analysis Platform**  
> *Developed by Naim Xbz (WebXpress BD)*

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)](#)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Directory Structure](#-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running the App](#running-the-app)
- [API Reference](#-api-reference)
  - [1. Universal Fraud Check (`POST /api/v1/fraud-check`)](#1-universal-fraud-check-post-apiv1fraud-check)
  - [2. Quick Phone Lookup (`GET /api/v1/fraud-check/:phone`)](#2-quick-phone-lookup-get-apiv1fraud-checkphone)
  - [3. Batch Check (`POST /api/batch-check`)](#3-batch-check-post-apibatch-check)
  - [4. Community Reports (`GET & POST /api/reports`)](#4-community-reports-get--post-apireports)
- [Code Integration Examples](#-code-integration-examples)
  - [cURL](#curl)
  - [PHP / WooCommerce](#php--woocommerce)
  - [Node.js (Axios)](#nodejs-axios)
  - [Python](#python)
- [Supported Couriers](#-supported-couriers)
- [Admin Portal & Master Control](#-admin-portal--master-control)
- [License & Credits](#-license--credits)

---

## 🔍 Overview

**XBZ Intelligence** is a specialized fraud-mitigation and delivery intelligence engine tailored for Bangladeshi e-commerce and F-commerce merchants. 

Cash on Delivery (COD) return rates in Bangladesh often cost merchants between ৳120 to ৳300 in non-refundable courier fees per failed parcel. **XBZ Intelligence** empowers merchants to screen customer phone numbers before parcel dispatch by aggregating delivery track records, return rates, cancellation ratios, and reported fraud incidents across Bangladesh’s major couriers (**Steadfast, Pathao, RedX, Carrybee, and Paperfly**).

---

## ✨ Key Features

- **⚡ Instant 11-Digit BD Phone Analysis**: Validates and normalizes phone numbers (`013`, `014`, `015`, `016`, `017`, `018`, `019`) with automatic telecom operator detection (Grameenphone, Banglalink, Robi, Airtel, Teletalk).
- **🚚 Multi-Courier Breakdown**: Aggregates parcel records across 5 top courier networks:
  - **Steadfast Courier**
  - **Pathao Courier**
  - **RedX Delivery**
  - **Carrybee**
  - **Paperfly**
- **🛡️ 5-Tier Risk Assessment Engine**:
  - `Safe` (High delivery success rate > 85%)
  - `Moderate Risk` (Delivery success rate between 60% – 85%)
  - `High Risk` (Delivery success rate < 60% or frequent COD cancellations)
  - `Blacklisted` (Flagged in merchant community database for refusal/fraud)
  - `New Customer` (First-time online shopper with no historical parcel footprint)
- **🧠 Bilingual Actionable Recommendations**: Instant guidance in Bengali (বাংলা) and English (e.g., whether to ship COD, request advance delivery charge via bKash, or cancel suspicious orders).
- **📦 Batch / Bulk Phone Verification**: Analyze up to 30 customer phone numbers simultaneously via multi-line text or CSV paste.
- **🚀 15-Day Ultra-Fast Smart Cache**: Built-in 15-day caching layer delivering sub-20ms response times for repeated queries.
- **👥 Merchant Community Blacklist**: Real-time crowd-sourced fraud reports where merchants submit fake orders, unreceived consignments, and financial loss data.
- **💳 Plan Upgrades & Mobile Financial Services (MFS)**: Instant plan verification with **bKash**, **Nagad**, and **Rocket** transaction ID validation.
- **👑 Role-Based Admin Dashboard**:
  - Approve or manage merchant registrations.
  - Review MFS payment submissions.
  - Adjust pricing plans and custom MFS merchant numbers on the fly.
  - Broadcast system-wide banners to all merchants.
- **🏷️ Embeddable Trust Badge**: Customizable verified merchant badge modal with HTML/JS embed codes for WooCommerce, Shopify, and custom landing pages.
- **🌐 Full REST API & Developer Docs**: Plug-and-play endpoints compatible with SmartPOS specifications.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser / Client                      │
│            React 19 + Tailwind CSS v4 + Motion              │
│       (Bilingual UI: বাংলা / English, Dark Modern Theme)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Express Backend (server.ts)                 │
│         Hosted on Node.js / Cloud Run (Port 3000)           │
├──────────────────────────────┬──────────────────────────────┤
│  REST API Router:            │  Analysis Engine:            │
│  • /api/v1/fraud-check       │  • Phone Normalization       │
│  • /api/check-phone          │  • Risk Weighting Algorithm  │
│  • /api/batch-check          │  • Courier Aggregation       │
│  • /api/reports              │  • Bilingual Recommendations │
│  • /api/auth & /api/admin    │  • 15-Day Smart Disk Cache   │
└──────────────────────────────┼──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data & Services                        │
├──────────────────────────────┬──────────────────────────────┤
│ • SmartPOS API Engine        │ • Local Persistence DBs:     │
│ • Courier Direct APIs        │    - .smartpos_cache.json    │
│ • Google Gemini SDK          │    - .payments_db.json       │
└──────────────────────────────┴──────────────────────────────┘
```

---

## 💻 Tech Stack

- **Frontend**:
  - [React 19](https://react.dev/) - Modern component-driven UI
  - [Tailwind CSS v4](https://tailwindcss.com/) - High-performance styling
  - [Motion](https://motion.dev/) - Smooth layout animations & transitions
  - [Recharts](https://recharts.org/) - Visual parcel ratio charts
  - [Lucide React](https://lucide.dev/) - Interface iconography
- **Backend**:
  - [Express 4](https://expressjs.com/) - REST API server
  - [tsx](https://github.com/privatenumber/tsx) - Native TypeScript execution
  - [dotenv](https://github.com/motdotla/dotenv) - Environment variable management
  - [@google/genai](https://www.npmjs.com/package/@google/genai) - Google Gemini API integration
- **Build & Dev Tooling**:
  - [Vite 8](https://vitejs.dev/) - Lightning-fast frontend build pipeline

---

## 📁 Directory Structure

```text
├── .env.example                  # Environment variable blueprint
├── .gitignore                    # Git exclusions
├── .payments_db.json             # Payment & subscription ledger
├── .smartpos_cache.json          # 15-day smart cache for phone lookups
├── index.html                    # Single page HTML entry point
├── metadata.json                 # AI Studio applet configuration
├── netlify.toml                  # Optional Netlify deployment config
├── package.json                  # Dependencies and scripts
├── server.ts                     # Full-stack Express server & API endpoints
├── tsconfig.json                 # TypeScript compiler configuration
├── vite.config.ts                # Vite frontend bundler config
├── public/
│   ├── _redirects                # SPA redirect fallback
│   └── manifest.json             # Web application manifest
└── src/
    ├── main.tsx                  # React bootstrap entry point
    ├── index.css                 # Global CSS & Tailwind v4 setup
    ├── App.tsx                   # Master app container & tab manager
    ├── components/
    │   ├── AdminDashboard.tsx         # User, payment & pricing control center
    │   ├── AnalysisResultView.tsx     # Single phone risk & courier breakdown
    │   ├── ApiDocsView.tsx            # Interactive API docs & code generators
    │   ├── ApiSettingsModal.tsx       # Merchant courier credentials modal
    │   ├── AuthModal.tsx              # Merchant login & registration modal
    │   ├── BatchCheckView.tsx         # Bulk phone numbers analyzer (up to 30)
    │   ├── BrandLogo.tsx              # Official XBZ brand logo SVG component
    │   ├── CommunityDatabaseView.tsx  # Crowd-sourced fraud reports database
    │   ├── CourierSpecsView.tsx       # Courier API docs & connection specs
    │   ├── CourierStatusStrip.tsx     # Live status indicators for couriers
    │   ├── Footer.tsx                 # App footer with links & credits
    │   ├── HeroSearch.tsx             # Main phone number search bar & filters
    │   ├── LiveFraudTicker.tsx        # Live marquee of recently reported frauds
    │   ├── LiveSupportButton.tsx      # WhatsApp & hotline support trigger
    │   ├── Navbar.tsx                 # Navigation bar with language & auth toggle
    │   ├── PaymentModal.tsx           # bKash / Nagad / Rocket payment submission
    │   ├── PlanGatePaywall.tsx        # Paywall prompt when limits are reached
    │   ├── PricingView.tsx            # Plans: Free, Merchant Pro, Enterprise
    │   ├── ReportFraudModal.tsx       # Modal to submit fraud incident reports
    │   └── TrustBadgeModal.tsx        # Store trust badge generator & embeds
    ├── server/
    │   ├── analysisEngine.ts          # Core risk assessment & scoring algorithm
    │   ├── courierAdapters.ts         # Courier registry & connection adapters
    │   ├── paymentDb.ts               # Local file database for subscription payments
    │   ├── pricingDb.ts               # Local file database for pricing configurations
    │   ├── reportsDb.ts               # Local file database for community reports
    │   ├── smartposClient.ts          # SmartPOS upstream integration & 15-day cache
    │   └── userDb.ts                  # Merchant authentication & registration DB
    ├── types/
    │   └── intelligence.ts            # TypeScript definitions for the system
    └── utils/
        └── translations.ts            # Complete Bengali & English translations
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version `v18.0.0` or higher recommended)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository_url>
   cd <repository_folder>
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

### Environment Configuration

Create a `.env` file in the project root based on `.env.example`:

```bash
cp .env.example .env
```

Set the appropriate keys:

```env
# Google Gemini API key (optional, for AI features)
GEMINI_API_KEY="your_gemini_api_key"

# Base Application URL
APP_URL="http://localhost:3000"

# SmartPOS Fraud Checker API Key (Optional; fallback cache and sandbox provided by default)
SMARTPOS_FRAUD_API_KEY="fraud_live_xxxxxxxxxxxxxxxxxxxxxxxx"

# Optional domain locking header
SMARTPOS_DOMAIN="yourstore.com"

# Port (Defaults to 3000)
PORT=3000
```

### Running the App

- **Development Mode** (Runs Express with Vite middleware):
  ```bash
  npm run dev
  ```
  Open `http://localhost:3000` in your browser.

- **Production Build**:
  ```bash
  npm run build
  npm start
  ```

- **Type Check / Lint**:
  ```bash
  npm run lint
  ```

---

## 📡 API Reference

### 1. Universal Fraud Check (`POST /api/v1/fraud-check`)

Checks a single phone number across all connected courier databases.

- **Endpoint**: `POST /api/v1/fraud-check`
- **Headers**:
  - `Content-Type: application/json`
  - `Accept: application/json`
  - `X-API-KEY: <your_merchant_key>` *(Optional)*
  - `X-Domain: <your_domain>` *(Optional)*
- **Body**:
  ```json
  {
    "phone": "01712345678"
  }
  ```
- **Response**:
  ```json
  {
    "phone": "01712345678",
    "score": 94.5,
    "status": "Safe",
    "source": "database_cache",
    "total_parcel": 42,
    "success_parcel": 40,
    "cancel_parcel": 2,
    "unresolved_reports": 0,
    "community_reports": [],
    "response": {
      "steadfast": {
        "status": true,
        "message": "Data retrieved successfully.",
        "data": {
          "total": 20,
          "success": 19,
          "cancel": 1,
          "deliveredPercentage": 95,
          "returnPercentage": 5,
          "rating": "5.00",
          "response_time": 32
        }
      },
      "pathao": { ... },
      "redx": { ... },
      "carrybee": { ... },
      "paperfly": { ... }
    }
  }
  ```

### 2. Quick Phone Lookup (`GET /api/v1/fraud-check/:phone`)

- **Endpoint**: `GET /api/v1/fraud-check/01712345678`
- **Headers**: `X-API-KEY`, `X-Domain`

### 3. Batch Check (`POST /api/batch-check`)

Analyze multiple phone numbers at once (up to 30).

- **Endpoint**: `POST /api/batch-check`
- **Body**:
  ```json
  {
    "phones": [
      "01712345678",
      "01812345678",
      "01912345678"
    ]
  }
  ```

### 4. Community Reports (`GET & POST /api/reports`)

- **List Reports**: `GET /api/reports?phone=01712345678`
- **Submit Report**: `POST /api/reports`
  ```json
  {
    "phone": "01712345678",
    "customerName": "Rahim Ahmed",
    "reporterStore": "Fashion Zone BD",
    "reason": "Repeatedly ordered COD and rejected parcel at doorstep.",
    "courierConsignment": "ST-98765432",
    "lossAmountBDT": 150
  }
  ```

---

## 💻 Code Integration Examples

### cURL

```bash
curl -X POST "https://your-domain.com/api/v1/fraud-check" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "X-API-KEY: your_api_key_here" \
  -d '{"phone": "01712345678"}'
```

### PHP / WooCommerce

Add this snippet to your child theme's `functions.php` to prevent high-risk COD orders:

```php
<?php
add_action('woocommerce_checkout_process', 'xbz_verify_cod_customer_risk');

function xbz_verify_cod_customer_risk() {
    $chosen_gateway = WC()->session->get('chosen_payment_method');
    $billing_phone  = sanitize_text_field($_POST['billing_phone'] ?? '');

    if ($chosen_gateway === 'cod' && !empty($billing_phone)) {
        $response = wp_remote_post('https://your-domain.com/api/v1/fraud-check', [
            'headers' => [
                'Content-Type' => 'application/json',
                'Accept'       => 'application/json',
                'X-API-KEY'    => 'your_api_key_here',
            ],
            'body'    => json_encode(['phone' => $billing_phone]),
            'timeout' => 4,
        ]);

        if (!is_wp_error($response)) {
            $data = json_decode(wp_remote_retrieve_body($response), true);
            
            if (isset($data['status']) && ($data['status'] === 'High Risk' || $data['score'] < 50)) {
                wc_add_notice(
                    'আপনার ডেলিভারি সফলতার হার কম থাকায় ক্যাশ অন ডেলিভারি প্রযোজ্য নয়। অনুগ্রহ করে অগ্রিম ডেলিভারি চার্জ পরিশোধ করুন।',
                    'error'
                );
            }
        }
    }
}
```

### Node.js (Axios)

```javascript
import axios from 'axios';

async function verifyCustomer(phone) {
  try {
    const res = await axios.post('https://your-domain.com/api/v1/fraud-check', {
      phone: phone
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': 'your_api_key_here'
      }
    });

    const { score, status, total_parcel, success_parcel } = res.data;
    console.log(`Risk Status: ${status} | Score: ${score}% (${success_parcel}/${total_parcel} delivered)`);
    return res.data;
  } catch (error) {
    console.error('Verification failed:', error.response?.data || error.message);
  }
}

verifyCustomer('01712345678');
```

### Python

```python
import requests

def check_fraud(phone: str, api_key: str):
    url = "https://your-domain.com/api/v1/fraud-check"
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-API-KEY": api_key
    }
    payload = {"phone": phone}

    response = requests.post(url, json=payload, headers=headers, timeout=5)
    if response.status_code == 200:
        data = response.json()
        print(f"Status: {data['status']}, Score: {data['score']}%")
        return data
    else:
        print(f"Error {response.status_code}: {response.text}")
        return None

check_fraud("01712345678", "your_api_key_here")
```

---

## 🚚 Supported Couriers

| Courier | Courier Code | Delivery Rate Metric | Status Supported | Direct Phone Lookup API |
| :--- | :--- | :---: | :---: | :---: |
| **Steadfast Courier** | `steadfast` | ✅ | ✅ Connected | Merchant Key / Fraud Check |
| **Pathao Courier** | `pathao` | ✅ | ✅ Connected | Client ID & Secret |
| **RedX Delivery** | `redx` | ✅ | ✅ Connected | Bearer API Token |
| **Carrybee** | `carrybee` | ✅ | ✅ Connected | API Key |
| **Paperfly** | `paperfly` | ✅ | ✅ Connected | Merchant Key |

---

## 👑 Admin Portal & Master Control

The platform includes a built-in administrative suite protected by master account privileges:

- **Master Admin Emails**:
  - `naimxbz@gmail.com`
  - `xbz.dev@gmail.com`
- **Admin Capabilities**:
  - **User Management**: Approve merchant registrations, elevate accounts to Pro/Enterprise tiers, or suspend abusers.
  - **Payment Verification**: Review incoming bKash, Nagad, and Rocket Transaction IDs (TrxID) and mark payments as verified.
  - **Dynamic Pricing Controls**: Configure subscription plan costs, check allowances, and custom MFS numbers (`01887563060`, etc.) in real time.
  - **System Notice**: Broadcast priority alert banners displayed across the user dashboard.

---

## 📄 License & Credits

- **Author**: [Naim Xbz](https://github.com/naimxbz) / WebXpress BD
- **Project**: XBZ Intelligence Platform
- **License**: Private / Proprietary for e-commerce merchant security.
