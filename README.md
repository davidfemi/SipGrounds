# Sip Grounds — Web App Spec & Starter Plan

A map‑first café discovery website with points, coupon‑code perks, polls, and Stripe payments. All cafés are pre‑onboarded partners.

---

## 1) Product Overview

**Elevator pitch:** Sip Grounds helps people discover great partner cafés on a map, pay seamlessly, earn points instantly, and redeem for drinks, pastries, or swag. Perks are distributed via alphanumeric coupon codes.

**Primary goals**

* Increase foot traffic & repeat visits for partner cafés.
* Give customers a simple, rewarding experience (discover → pay → earn → redeem).
* Keep engagement high via polls and photo reviews.

**Assumptions (change anytime):**

* Phase 1 is **web-first** (responsive). Native apps later.
* Payments: Stripe Checkout/Payment Elements; card-on-file for 1‑click reorders.
* Pre‑onboarded partners are added by an internal admin (no self‑serve onboarding in MVP).
* Dummy data for cafés + orders in dev; production uses Stripe + Postgres.

---

## 2) MVP Scope

1. Public map of partner cafés with filters & profile pages
2. Auth (email link or OAuth) + user profile
3. **🍽️ Comprehensive Menu System** with drinks & food categories, seasonal items, and customizations
4. Stripe payments for menu items and points accrual
5. Points wallet & redemption for predefined reward items
6. Coupon codes: generate, list, redeem (in‑app checkout or marked as used in‑store)
7. Reviews & photos
8. Community polls (single‑select)
9. Basic admin: manage cafés, coupons, rewards, and menus

---

## 3) Tech Stack

* **Framework:** Next.js 14 (App Router) + TypeScript
* **UI:** Tailwind CSS + shadcn/ui
* **Map:** Mapbox GL JS
* **Auth:** Session-based authentication
* **DB/ORM:** MongoDB
* **Payments:** Stripe (Checkout + Webhooks)
* **Storage:** Cloudinary

---

## 🍽️ Menu System

The platform now includes a comprehensive menu system with:

### Features
* **Object-oriented design** with Drinks and Food classes
* **Seasonal & Limited-Time Items** section featuring pumpkin spice, pecan, and horchata flavors
* **Advanced customization** with sizes, milk options, extras, and dietary preferences
* **Rich metadata** including nutritional info, allergens, and preparation times
* **Smart categorization** with automatic seasonal item prioritization

### Categories
* **Hot Coffee**: Brewed Coffee, Latte, Americano, Cappuccino, Mocha, Cortado
* **Cold Coffee**: Cold Brew, Nitro Cold Brew, Iced Shaken Espresso, Iced Latte, Iced Mocha
* **Seasonal Drinks**: Pumpkin Spice Latte, Pumpkin Cream Cold Brew, Pecan Cortado, Protein Cold Foam
* **Food**: Breakfast items, bakery goods, snacks, and seasonal treats

### Quick Start
```bash
# Seed menu data
cd sipgrounds-backend
node seed-menu.js

# Start servers and navigate to /cafes/{cafeId}/menu
```

See `MENU_QUICK_START.md` for detailed setup instructions.

---

