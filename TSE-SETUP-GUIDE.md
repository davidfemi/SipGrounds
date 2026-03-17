# SipGrounds — TSE Setup Guide

A step-by-step guide to get the SipGrounds platform running locally, including Stripe payment testing end-to-end.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Clone the Repository](#2-clone-the-repository)
3. [Backend Setup](#3-backend-setup)
4. [Frontend Setup](#4-frontend-setup)
5. [Stripe Setup (Local)](#5-stripe-setup-local)
6. [Seed the Database](#6-seed-the-database)
7. [Run the App](#7-run-the-app)
8. [End-to-End Test Checklist](#8-end-to-end-test-checklist)
9. [Test Credentials](#9-test-credentials)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites

Install the following before starting.

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | https://nodejs.org |
| npm | Comes with Node | — |
| MongoDB | 6+ (local) or Atlas URI | https://www.mongodb.com/try/download/community |
| Stripe CLI | Latest | `brew install stripe/stripe-cli/stripe` |
| Git | Any | pre-installed on macOS |

> **macOS note:** Port 5000 is reserved by AirPlay Receiver on macOS 12+. The backend is already configured to run on **port 5001** to avoid this conflict. Do not change it.

---

## 2. Clone the Repository

```bash
git clone <repo-url>
cd SipGrounds
```

You'll see two folders:

```
SipGrounds/
├── sipgrounds-backend/    # Node.js + Express + MongoDB
└── sipgrounds-frontend/   # React + TypeScript
```

---

## 3. Backend Setup

### 3a. Install dependencies

```bash
cd sipgrounds-backend
npm install
```

### 3b. Create the `.env` file

```bash
cp .env.example .env
```

Open `.env` and fill in the values below. The Stripe keys are pre-filled for the test environment — you only need to add `STRIPE_WEBHOOK_SECRET` after completing Step 5.

```bash
# ── Database ────────────────────────────────────────────
# Use local MongoDB:
MONGODB_URI=mongodb://localhost:27017/sipgrounds
# OR use a MongoDB Atlas connection string:
# MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/sipgrounds

# ── Session ─────────────────────────────────────────────
SECRET=....

# ── Server ──────────────────────────────────────────────
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# ── Stripe ──────────────────────────────────────────────
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=           # ← fill this in after Step 5

# ── Cloudinary (image uploads) ──────────────────────────
CLOUDINARY_CLOUD_NAME=           # ask team lead for credentials
CLOUDINARY_KEY=
CLOUDINARY_SECRET=

# ── Mapbox (maps) ───────────────────────────────────────
MAPBOX_TOKEN=                    # ask team lead for credentials
```

> **Cloudinary & Mapbox:** The app works without these for basic testing. Images will not render and the map will be blank, but checkout, auth, and menu browsing all work. Get the credentials from the team lead when you need them.

---

## 4. Frontend Setup

### 4a. Install dependencies

```bash
# from the SipGrounds root
cd sipgrounds-frontend
npm install
```

### 4b. Create the `.env` file

The frontend already has a `.env` file. Verify it contains:

```bash
REACT_APP_API_URL=http://localhost:5001
REACT_APP_MAPBOX_TOKEN=
```

If the file doesn't exist, create it at `sipgrounds-frontend/.env` with the content above.

---

## 5. Stripe Setup (Local)

This is the critical step for payment testing. Stripe sends payment events to a webhook endpoint on the backend — without this wired up, orders will not confirm after payment.

### 5a. Login to the Stripe CLI

```bash
stripe login
```

This opens a browser. Authenticate with the Stripe account linked to the project test keys.

### 5b. Start the webhook forwarder

Open a **dedicated terminal tab** and keep it running throughout your session:

```bash
stripe listen --forward-to localhost:5001/api/payments/webhook
```

You'll see output like:

```
> Ready! You are using Stripe API Version [2024-xx-xx]
> Your webhook signing secret is whsec_abc123def456...  ← copy this
```

### 5c. Add the secret to `.env`

Paste the `whsec_...` value into `sipgrounds-backend/.env`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_abc123def456...
```

> **Important:** This value changes every time you run `stripe listen`. You must restart the backend after updating it (see Step 7).

---

## 6. Seed the Database

The database needs initial data to work. Run these from inside `sipgrounds-backend/`:

```bash
cd sipgrounds-backend

# Seed the full menu (drinks + food items)
node scripts/seed-sipgrounds-menu.js

# Seed cafe locations
node scripts/auto-seed-cafes.js

# (Optional) Seed rewards tiers
node scripts/seed-rewards.js
```

> Each script prints confirmation when done. If a script errors with a duplicate key, the data is already seeded — that's fine, move on.

---

## 7. Run the App

You need **three terminal tabs** running simultaneously:

**Tab 1 — Backend**
```bash
cd sipgrounds-backend
npm run dev
# Expected: "✅ Database connected" and "Server running on port 5001"
```

**Tab 2 — Frontend**
```bash
cd sipgrounds-frontend
npm start
# Opens http://localhost:3000 automatically
```

**Tab 3 — Stripe webhook listener** *(from Step 5b, keep it running)*
```bash
stripe listen --forward-to localhost:5001/api/payments/webhook
```

---

## 8. End-to-End Test Checklist

Work through these in order to verify the full flow.

- [ ] **Homepage loads** at `http://localhost:3000`
- [ ] **Register a new account** at `/register` (use a real email format, any password)
- [ ] **Browse the menu** at `/menu` — categories and items should load
- [ ] **Add an item to cart** by navigating to any subcategory and clicking "Add"
- [ ] **Go to Checkout** at `/checkout`
  - Select a pickup store from the dropdown
  - Select a pickup time
  - Click **"Place Order & Pay"**
- [ ] **Stripe Checkout page opens** in the browser (hosted by Stripe)
- [ ] **Enter test card details** (see Section 9 below)
- [ ] **Successful redirect** back to `/checkout/success`
- [ ] **Check the Stripe CLI tab** — you should see `payment_intent.succeeded` event logged
- [ ] **Check Orders** at `/orders` — the order should appear as "confirmed"
- [ ] **Check Profile** at `/profile` — points balance should have increased

---

## 9. Test Credentials

### App Login (create your own account, or use these if seeded)

| Field | Value |
|-------|-------|
| Email | `test@sipgrounds.com` |
| Password | `password123` |

> If login fails, register a new account at `/register`.

### Stripe Test Cards

All test cards use **any future expiry date**, **any 3-digit CVC**, and **any 5-digit ZIP**.

| Scenario | Card Number |
|----------|-------------|
| ✅ Successful payment | `4242 4242 4242 4242` |
| ❌ Card declined | `4000 0000 0000 0002` |
| 🔐 3D Secure required | `4000 0025 0000 3155` |
| 💳 Insufficient funds | `4000 0000 0000 9995` |

> These are Stripe test-mode cards. No real charges are made. The `sk_test_...` key in `.env` ensures you are always in test mode.

### Stripe Dashboard (test mode)

To see transactions, webhook logs, and payment intents:

- URL: https://dashboard.stripe.com/test/payments
- Log in with the account associated with the `sk_test_...` key above
- Switch to **Test mode** (toggle in the top-left) if not already there

---

## 10. Troubleshooting

### "Cannot connect to database"
- Make sure MongoDB is running: `brew services start mongodb-community`
- Or verify your Atlas connection string is correct and your IP is whitelisted

### "STRIPE_SECRET_KEY is not set" / payments fail silently
- Confirm `.env` has `STRIPE_SECRET_KEY=sk_test_...`
- Restart the backend after any `.env` change: stop the process (`Ctrl+C`) and re-run `npm run dev`

### "Webhook Error: No signatures found"
- Your `STRIPE_WEBHOOK_SECRET` doesn't match the current `stripe listen` session
- Stop and restart `stripe listen`, copy the new `whsec_...` value into `.env`, restart the backend

### Checkout redirects back to `/cart?status=cancel`
- This means you closed the Stripe page or clicked "Back" — not an error
- Try the checkout again

### "Product not found" error at checkout
- The cart has stale item IDs from before seeding
- Clear your browser localStorage: DevTools → Application → Local Storage → Clear All
- Add items to cart again and retry

### Port 5001 already in use
```bash
lsof -ti:5001 | xargs kill -9
```
Then restart the backend.

### `npm install` fails on the frontend (AJV error)
The project pins `ajv@6.12.6` and `ajv-keywords@3.5.2` to fix a Create React App compatibility issue. These are already in `devDependencies`. If you see AJV errors anyway:
```bash
cd sipgrounds-frontend
rm -rf node_modules package-lock.json
npm install
```

---

## Quick Reference

| What | URL / Command |
|------|---------------|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5001/api |
| Stripe test dashboard | https://dashboard.stripe.com/test/payments |
| Start backend | `cd sipgrounds-backend && npm run dev` |
| Start frontend | `cd sipgrounds-frontend && npm start` |
| Start webhook forwarder | `stripe listen --forward-to localhost:5001/api/payments/webhook` |
| Re-seed menu | `node scripts/seed-sipgrounds-menu.js` |
| Re-seed cafes | `node scripts/auto-seed-cafes.js` |

---

*Questions? Ping the team lead or open an issue on GitHub.*
