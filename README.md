# 🛒 BD E-Commerce Platform

একটি পূর্ণাঙ্গ বাংলাদেশি ই-কমার্স প্ল্যাটফর্ম — কাস্টমার-ফেসিং শপ এবং অ্যাডমিন প্যানেল সহ। React + Vite (Frontend) এবং Express + PostgreSQL (Backend) দিয়ে তৈরি। Vercel-এ সম্পূর্ণ ফ্রিতে হোস্ট করা যায়।

**Live Demo:** [ecommerce.vercel.app](https://bd-ecommerce-platform-ecommerce.vercel.app)  
**API Server:** [api-server.vercel.app](https://bd-ecommerce-platform-api-server.vercel.app/api/healthz)

---

## 📋 সূচিপত্র

- [ফিচার সমূহ](#-ফিচার-সমূহ)
- [টেক স্ট্যাক](#-টেক-স্ট্যাক)
- [প্রজেক্ট স্ট্রাকচার](#-প্রজেক্ট-স্ট্রাকচার)
- [Environment Variables](#-environment-variables)
- [Firebase সেটআপ](#-firebase-সেটআপ)
- [Database সেটআপ](#-database-সেটআপ)
- [লোকাল ডেভেলপমেন্ট](#-লোকাল-ডেভেলপমেন্ট)
- [Vercel ডিপ্লয়মেন্ট](#-vercel-ডিপ্লয়মেন্ট)
- [API এন্ডপয়েন্ট](#-api-এন্ডপয়েন্ট)
- [অ্যাডমিন প্যানেল গাইড](#-অ্যাডমিন-প্যানেল-গাইড)

---

## ✨ ফিচার সমূহ

### 🧑‍💼 কাস্টমার শপ
| ফিচার | বিবরণ |
|-------|--------|
| 🏠 হোমপেজ | ব্যানার স্লাইডার, ফিচার্ড প্রোডাক্ট, ক্যাটাগরি |
| 🛍️ শপ পেজ | ফিল্টার, সার্চ, সর্টিং, প্যাজিনেশন |
| 📦 প্রোডাক্ট ডিটেইল | ছবি গ্যালারি, রিভিউ, রেটিং |
| 🛒 কার্ট | লোকাল স্টোরেজে সেভ, কুয়ান্টিটি আপডেট |
| 💳 চেকআউট | কুপন কোড, ডেলিভারি ঠিকানা |
| 📍 অর্ডার ট্র্যাক | অর্ডার নম্বর দিয়ে স্ট্যাটাস চেক |
| 👤 অ্যাকাউন্ট | অর্ডার হিস্টরি (Firebase Auth) |
| 📧 নিউজলেটার | সাবস্ক্রাইব ফর্ম |

### 🔧 অ্যাডমিন প্যানেল (`/admin`)
| মডিউল | বিবরণ |
|--------|--------|
| 📊 ড্যাশবোর্ড | রেভিনিউ চার্ট, অর্ডার স্ট্যাটিস্টিক্স, লো-স্টক অ্যালার্ট |
| 📦 প্রোডাক্ট | CRUD — যোগ করুন, এডিট করুন, মুছুন |
| 🛒 অর্ডার | স্ট্যাটাস আপডেট (Pending → Shipped → Delivered) |
| 🖼️ ব্যানার | হোমপেজ ব্যানার ম্যানেজ করুন |
| 🏷️ ক্যাটাগরি | প্রোডাক্ট ক্যাটাগরি তৈরি ও সম্পাদনা |
| 🏭 ব্র্যান্ড | ব্র্যান্ড ম্যানেজমেন্ট |
| 🎟️ কুপন | ডিসকাউন্ট কুপন তৈরি |
| ⭐ রিভিউ মডারেশন | কাস্টমার রিভিউ অনুমোদন/প্রত্যাখ্যান |
| 📧 নিউজলেটার | সাবস্ক্রাইবার লিস্ট |
| ⚙️ সেটিংস | সাইটের নাম, ঠিকানা, যোগাযোগ তথ্য |

---

## 🛠️ টেক স্ট্যাক

### Frontend (`artifacts/ecommerce`)
| টুল | ব্যবহার |
|-----|---------|
| React 18 + Vite | UI ফ্রেমওয়ার্ক |
| TypeScript | টাইপ-সেফ কোড |
| Tailwind CSS | স্টাইলিং |
| shadcn/ui + Radix UI | UI কম্পোনেন্ট |
| TanStack Query | API স্টেট ম্যানেজমেন্ট |
| Wouter | ক্লায়েন্ট-সাইড রাউটিং |
| Firebase Auth | লগইন/রেজিস্ট্রেশন (Google + Email) |
| Zustand | কার্ট স্টেট ম্যানেজমেন্ট |
| Recharts | ড্যাশবোর্ড চার্ট |
| Framer Motion | অ্যানিমেশন |

### Backend (`artifacts/api-server`)
| টুল | ব্যবহার |
|-----|---------|
| Node.js 24 + Express 5 | API সার্ভার |
| TypeScript | টাইপ-সেফ কোড |
| PostgreSQL + Drizzle ORM | ডেটাবেস |
| Zod | ইনপুট ভ্যালিডেশন |
| Firebase Admin SDK | JWT টোকেন যাচাই |
| Helmet | HTTP সিকিউরিটি হেডার |
| express-rate-limit | স্প্যাম প্রতিরোধ |
| Pino | লগিং |

---

## 📁 প্রজেক্ট স্ট্রাকচার

```
bd-ecommerce-platform/
│
├── artifacts/
│   ├── ecommerce/              ← Frontend (React + Vite)
│   │   └── src/
│   │       ├── pages/
│   │       │   ├── Home.tsx
│   │       │   ├── Shop.tsx (ProductDetail, Cart, Checkout ...)
│   │       │   └── admin/   ← অ্যাডমিন প্যানেল
│   │       ├── components/  ← Reusable UI কম্পোনেন্ট
│   │       ├── context/     ← AuthContext
│   │       ├── lib/
│   │       │   └── api.ts   ← getApiBase() — API URL সোর্স অব ট্রুথ
│   │       └── firebase.ts  ← Firebase কনফিগ
│   │
│   └── api-server/             ← Backend (Express)
│       ├── src/
│       │   ├── routes/      ← সব API রাউট
│       │   │   ├── products.ts
│       │   │   ├── orders.ts
│       │   │   ├── reviews.ts
│       │   │   ├── newsletter.ts
│       │   │   ├── dashboard.ts
│       │   │   └── ...
│       │   ├── middleware/
│       │   │   └── auth.ts  ← Firebase JWT যাচাই
│       │   └── app.ts       ← CORS, Rate Limiting, Helmet
│       └── vercel.json      ← Vercel সার্ভারলেস কনফিগ
│
├── lib/
│   ├── api-client-react/       ← Auto-generated React Query hooks
│   │   └── src/
│   │       ├── generated/   ← `pnpm codegen` দিয়ে তৈরি (এডিট করবেন না)
│   │       └── custom-fetch.ts ← Base URL ও Auth টোকেন লজিক
│   ├── api-spec/
│   │   └── openapi.yaml     ← API কন্ট্র্যাক্ট (Single Source of Truth)
│   ├── api-zod/             ← Auto-generated Zod স্কিমা
│   └── db/
│       └── src/schema/      ← Drizzle ডেটাবেস স্কিমা
│
└── pnpm-workspace.yaml      ← Monorepo কনফিগ
```

---

## 🔑 Environment Variables

### Frontend — `artifacts/ecommerce` (Vercel-এ সেট করুন)

| Variable | উদাহরণ মান | বিবরণ |
|----------|-----------|--------|
| `VITE_API_URL` | `https://bd-ecommerce-platform-api-server.vercel.app` | ব্যাকএন্ড API-এর URL **⚠️ অবশ্যই দিতে হবে** |
| `VITE_FIREBASE_API_KEY` | `AIzaSy...` | Firebase কনসোল থেকে |
| `VITE_FIREBASE_AUTH_DOMAIN` | `yourapp.firebaseapp.com` | Firebase কনসোল থেকে |
| `VITE_FIREBASE_PROJECT_ID` | `your-project-id` | Firebase কনসোল থেকে |
| `VITE_FIREBASE_STORAGE_BUCKET` | `yourapp.appspot.com` | Firebase কনসোল থেকে |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123456789` | Firebase কনসোল থেকে |
| `VITE_FIREBASE_APP_ID` | `1:123:web:abc` | Firebase কনসোল থেকে |

> **নোট:** `VITE_` prefix ছাড়া variable Vite দেখতে পাবে না।

---

### Backend — `artifacts/api-server` (Vercel-এ সেট করুন)

| Variable | উদাহরণ মান | বিবরণ |
|----------|-----------|--------|
| `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` | Neon / Supabase PostgreSQL URL **⚠️ অবশ্যই দিতে হবে** |
| `FIREBASE_PROJECT_ID` | `your-project-id` | Firebase Admin SDK-এর জন্য |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk@...iam.gserviceaccount.com` | Firebase Service Account |
| `FIREBASE_PRIVATE_KEY` | `-----BEGIN PRIVATE KEY-----\n...` | Firebase Service Account (নিউলাইন `\n` হিসেবে দিন) |
| `NODE_ENV` | `production` | Vercel-এ `production` সেট করুন |
| `ALLOWED_ORIGINS` | *(ফাঁকা রাখুন)* | ফাঁকা রাখলে সব origin অ্যালাউ (*.vercel.app অটো অ্যালাউ) |

---

## 🔥 Firebase সেটআপ

### ধাপ ১ — Firebase প্রজেক্ট তৈরি
1. [console.firebase.google.com](https://console.firebase.google.com) → **Add project**
2. প্রজেক্ট নাম দিন → Continue → Create project

### ধাপ ২ — Authentication চালু করুন
1. **Authentication** → **Get started**
2. **Sign-in method** ট্যাবে যান
3. **Email/Password** ও **Google** চালু করুন

### ধাপ ৩ — Web App যোগ করুন (Frontend-এর জন্য)
1. Project Settings → **Add app** → Web (`</>`)
2. App nickname দিন → **Register app**
3. যে `firebaseConfig` object দেখাবে, সেই values থেকে `VITE_FIREBASE_*` variables পাবেন

### ধাপ ৪ — Service Account তৈরি (Backend-এর জন্য)
1. Project Settings → **Service accounts**
2. **Generate new private key** → JSON ফাইল ডাউনলোড হবে
3. ঐ JSON থেকে:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (পুরো string, `\n` সহ)

### ধাপ ৫ — অ্যাডমিন ইউজার সেট করুন
1. Firebase Console → **Authentication** → **Users**
2. আপনার অ্যাডমিন ইমেইল দিয়ে প্রথমে সাইনআপ করুন (ওয়েবসাইট থেকে)
3. Firebase Console → **Firestore** অথবা Custom Claims ব্যবহার করে `admin: true` সেট করুন

> **সহজ পদ্ধতি:** Firebase Admin SDK দিয়ে একবার script রান করুন:
> ```js
> admin.auth().setCustomUserClaims(uid, { admin: true })
> ```

---

## 🗄️ Database সেটআপ

### Neon (বিনামূল্যে, Recommended)

1. [neon.tech](https://neon.tech) → **Sign up** → **New Project**
2. Region: Singapore (বাংলাদেশের কাছে)
3. **Dashboard** → **Connection string** কপি করুন
4. এই URL-টি `DATABASE_URL` হিসেবে ব্যাকএন্ড Vercel-এ দিন

### স্কিমা পুশ করুন (প্রথমবার)

```bash
# লোকালে `.env` ফাইলে DATABASE_URL সেট করুন
cd /path/to/project
echo "DATABASE_URL=postgresql://..." > lib/db/.env

# স্কিমা পুশ করুন (টেবিল তৈরি হবে)
pnpm --filter @workspace/db run push
```

### ডেটাবেস টেবিলসমূহ

| টেবিল | বিবরণ |
|-------|--------|
| `products` | প্রোডাক্ট তথ্য |
| `categories` | প্রোডাক্ট ক্যাটাগরি |
| `brands` | ব্র্যান্ড |
| `orders` | অর্ডার |
| `banners` | হোমপেজ ব্যানার |
| `coupons` | ডিসকাউন্ট কুপন |
| `reviews` | প্রোডাক্ট রিভিউ (মডারেশন সহ) |
| `newsletter` | নিউজলেটার সাবস্ক্রাইবার |
| `site_settings` | সাইট কনফিগারেশন |

---

## 💻 লোকাল ডেভেলপমেন্ট

### প্রয়োজনীয় টুল
- Node.js 20+
- pnpm (`npm install -g pnpm`)

### ধাপ ১ — রিপো ক্লোন করুন
```bash
git clone https://github.com/akash00785/bd-ecommerce-platform.git
cd bd-ecommerce-platform
pnpm install
```

### ধাপ ২ — Environment Variables সেট করুন

**Frontend** — `artifacts/ecommerce/.env.local` ফাইল তৈরি করুন:
```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Backend** — `artifacts/api-server/.env` ফাইল তৈরি করুন:
```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@....iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
NODE_ENV=development
PORT=5000
```

### ধাপ ৩ — সার্ভার চালান

**Terminal 1 — Backend:**
```bash
pnpm --filter @workspace/api-server run dev
# → http://localhost:5000/api/healthz
```

**Terminal 2 — Frontend:**
```bash
pnpm --filter @workspace/ecommerce run dev
# → http://localhost:5173
```

### API কোড রিজেনারেট করুন (OpenAPI স্কিমা পরিবর্তন হলে)
```bash
pnpm --filter @workspace/api-spec run codegen
```

---

## 🚀 Vercel ডিপ্লয়মেন্ট

দুটো আলাদা Vercel প্রজেক্ট তৈরি করতে হবে — একটি Frontend, একটি Backend।

---

### Backend ডিপ্লয় করুন (আগে করুন)

1. [vercel.com](https://vercel.com) → **Add New Project**
2. GitHub থেকে এই রিপো import করুন
3. **Root Directory:** `artifacts/api-server` সেট করুন
4. **Framework Preset:** Other
5. **Environment Variables** ট্যাবে নিচের variables যোগ করুন:

```
DATABASE_URL          = postgresql://...
FIREBASE_PROJECT_ID   = your-project-id
FIREBASE_CLIENT_EMAIL = firebase-adminsdk@...
FIREBASE_PRIVATE_KEY  = -----BEGIN PRIVATE KEY-----\n...
NODE_ENV              = production
```

6. **Deploy** ক্লিক করুন
7. ডিপ্লয় হওয়ার পর URL নোট করুন: `https://your-api.vercel.app`
8. যাচাই করুন: `https://your-api.vercel.app/api/healthz` → `{"status":"ok"}` দেখাবে

---

### Frontend ডিপ্লয় করুন (Backend এর পরে)

1. [vercel.com](https://vercel.com) → **Add New Project** (আবার)
2. একই GitHub রিপো import করুন
3. **Root Directory:** `artifacts/ecommerce` সেট করুন
4. **Framework Preset:** Vite
5. **Environment Variables** ট্যাবে নিচের variables যোগ করুন:

```
VITE_API_URL                    = https://your-api.vercel.app  ← Backend URL
VITE_FIREBASE_API_KEY           = AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN       = yourapp.firebaseapp.com
VITE_FIREBASE_PROJECT_ID        = your-project-id
VITE_FIREBASE_STORAGE_BUCKET    = yourapp.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID = 123456789
VITE_FIREBASE_APP_ID            = 1:123:web:abc
```

6. **Deploy** ক্লিক করুন

> ⚠️ **গুরুত্বপূর্ণ:** `VITE_API_URL` সেট না করলে Reviews ও Newsletter পেজে "API সংযোগ পাওয়া যাচ্ছে না" এরর দেখাবে।

---

### আপডেট পুশ করলে কী হয়?
GitHub-এ নতুন commit push হলে Vercel **স্বয়ংক্রিয়ভাবে** redeploy করবে। কোনো ম্যানুয়াল কাজ লাগবে না।

---

## 📡 API এন্ডপয়েন্ট

Base URL: `https://your-api.vercel.app`

### 🔓 পাবলিক এন্ডপয়েন্ট (auth ছাড়া)

| Method | Endpoint | বিবরণ |
|--------|----------|--------|
| `GET` | `/api/healthz` | সার্ভার স্ট্যাটাস চেক |
| `GET` | `/api/products` | প্রোডাক্ট লিস্ট (ফিল্টার + প্যাজিনেশন) |
| `GET` | `/api/products/:id` | একটি প্রোডাক্টের বিস্তারিত |
| `GET` | `/api/products/featured` | ফিচার্ড প্রোডাক্ট |
| `GET` | `/api/categories` | সব ক্যাটাগরি |
| `GET` | `/api/brands` | সব ব্র্যান্ড |
| `GET` | `/api/banners` | হোমপেজ ব্যানার |
| `POST` | `/api/orders` | নতুন অর্ডার তৈরি |
| `GET` | `/api/orders/:orderNumber` | অর্ডার ট্র্যাক |
| `GET` | `/api/products/:id/reviews` | প্রোডাক্টের অনুমোদিত রিভিউ |
| `POST` | `/api/products/:id/reviews` | রিভিউ সাবমিট (মডারেশনে যাবে) |
| `POST` | `/api/coupons/validate` | কুপন যাচাই |
| `POST` | `/api/newsletter/subscribe` | নিউজলেটার সাবস্ক্রাইব |
| `GET` | `/api/settings` | সাইট সেটিংস |

### 🔒 অ্যাডমিন এন্ডপয়েন্ট (Firebase JWT লাগবে)

| Method | Endpoint | বিবরণ |
|--------|----------|--------|
| `GET` | `/api/dashboard/stats` | ড্যাশবোর্ড স্ট্যাটিস্টিক্স |
| `GET` | `/api/dashboard/revenue` | মাসিক রেভিনিউ চার্ট ডেটা |
| `GET` | `/api/orders` | সব অর্ডার লিস্ট |
| `PATCH` | `/api/orders/:id/status` | অর্ডার স্ট্যাটাস আপডেট |
| `POST` | `/api/products` | নতুন প্রোডাক্ট যোগ |
| `PATCH` | `/api/products/:id` | প্রোডাক্ট আপডেট |
| `DELETE` | `/api/products/:id` | প্রোডাক্ট মুছুন |
| `GET` | `/api/reviews/admin` | পেন্ডিং রিভিউ লিস্ট |
| `PATCH` | `/api/reviews/:id/moderation` | রিভিউ অনুমোদন/প্রত্যাখ্যান |
| `GET` | `/api/newsletter/subscribers` | সাবস্ক্রাইবার লিস্ট |
| `POST/PATCH/DELETE` | `/api/banners` | ব্যানার ম্যানেজমেন্ট |
| `POST/PATCH/DELETE` | `/api/coupons` | কুপন ম্যানেজমেন্ট |
| `PATCH` | `/api/settings` | সাইট সেটিংস আপডেট |

---

## 🖥️ অ্যাডমিন প্যানেল গাইড

### অ্যাক্সেস করুন
URL: `https://your-site.vercel.app/admin/login`

> অ্যাডমিন লগইন করতে Firebase-এ `admin: true` Custom Claim সেট করা থাকতে হবে।

### পেজ সমূহ

| URL | কাজ |
|-----|-----|
| `/admin` | ড্যাশবোর্ড — রেভিনিউ, অর্ডার, লো-স্টক |
| `/admin/products` | প্রোডাক্ট যোগ/এডিট/ডিলিট |
| `/admin/orders` | অর্ডার দেখুন ও স্ট্যাটাস বদলান |
| `/admin/banners` | হোমপেজ ব্যানার আপলোড |
| `/admin/categories` | ক্যাটাগরি ম্যানেজমেন্ট |
| `/admin/brands` | ব্র্যান্ড ম্যানেজমেন্ট |
| `/admin/coupons` | কুপন তৈরি ও ম্যানেজ |
| `/admin/reviews` | কাস্টমার রিভিউ মডারেশন |
| `/admin/newsletter` | নিউজলেটার সাবস্ক্রাইবার |
| `/admin/settings` | সাইটের নাম, যোগাযোগ, ঠিকানা |

---

## 🔧 সাধারণ সমস্যা ও সমাধান

### "API সংযোগ পাওয়া যাচ্ছে না"
**কারণ:** `VITE_API_URL` সেট করা নেই  
**সমাধান:** Vercel Frontend প্রজেক্টে `VITE_API_URL = https://your-api.vercel.app` সেট করুন → Redeploy

### "CORS error" ব্রাউজার কনসোলে
**কারণ:** Backend CORS-এ Frontend URL অনুমোদিত নয়  
**সমাধান:** `*.vercel.app` ডোমেইন অটো-অ্যালাউ আছে। কাস্টম ডোমেইন থাকলে `ALLOWED_ORIGINS=https://yourdomain.com` Backend-এ সেট করুন

### লগইন কাজ করছে না
**কারণ:** Firebase variables সঠিক নয়  
**সমাধান:** Firebase Console → Project Settings → Your apps থেকে config কপি করুন

### অ্যাডমিন প্যানেলে `403 Forbidden`
**কারণ:** Firebase Custom Claim `admin: true` সেট নেই  
**সমাধান:** Firebase Admin SDK দিয়ে `setCustomUserClaims(uid, { admin: true })` রান করুন

### ডেটা দেখাচ্ছে না / Database error
**কারণ:** `DATABASE_URL` ভুল বা স্কিমা পুশ হয়নি  
**সমাধান:** `pnpm --filter @workspace/db run push` রান করুন

---

## 📝 লাইসেন্স

MIT License — ব্যক্তিগত ও বাণিজ্যিক উভয় কাজে ব্যবহার করা যাবে।

---

## 🙋 সাহায্য দরকার?

কোনো সমস্যা হলে [GitHub Issues](https://github.com/akash00785/bd-ecommerce-platform/issues) খুলুন।
