# Campus Canteen Menu & Order Queue System
**MSc IT Vibe Coding Lab Project — Production Deliverable**

A high-performance, real-time college canteen pre-ordering and virtual queue management system built with **React 18**, **Vite**, **Tailwind CSS**, and **Supabase (PostgreSQL + Realtime)**, featuring a multi-window development mock adapter powered by the Web **BroadcastChannel API**.

---

## 🌟 Key Features

1. **Student Menu (`/`):**
   - 16 curated realistic Indian canteen dishes with photos and SVG fallbacks.
   - Filter by category (*Snacks*, *Meals*, *Beverages*, *Desserts*) and pure vegetarian / non-vegetarian.
   - Instant search and stepper controls (capped at 10 max per item).
   - Real-time sold-out item indicators and floating sticky cart bar.
   - Mobile-first responsive layout (390px iPhone baseline up to 4K desktop).

2. **Shopping Cart (`/cart`):**
   - Item quantity steppers (1–10 bound) and removal.
   - Real-time stock reconciler: automatically removes sold-out items with a friendly notice.
   - Student Full Name and Roll Number validation.
   - Operating hours enforcement: blocks checkout after 4:45 PM cutoff with an explanatory notice.

3. **Order Status Tracking (`/order/:id`):**
   - Prominent daily sequential token badge (e.g., `#001`, `#042`).
   - 3-stage visual progress timeline: *Placed* $\to$ *Preparing* $\to$ *Ready*.
   - Dynamic queue wait-time calculator ($\approx 5$ minutes per order ahead).
   - Confetti celebration and pickup prompt when food is *Ready*.
   - Real-time WebSocket updates across devices.

4. **Kitchen Operations Board (`/kitchen`):**
   - 3-column Kanban board (*New*, *Preparing*, *Ready*).
   - Strict forward-only status progression ($Placed \to Preparing \to Ready \to Collected$).
   - Overdue alert badge: highlights orders waiting $> 15$ minutes.
   - Live ticket intake with an audible chime alert (Web Audio API synthetic chime).

5. **Now Serving TV Display (`/display`):**
   - Fullscreen 1920×1080 high-contrast dark mode display for cafeteria monitors.
   - Dual-zone view: *Preparing in Kitchen* vs. *Ready for Pickup*.
   - **5-second pulsing animation** for newly ready tokens.
   - Digital clock and running information ticker.

6. **Owner Menu Manager (`/admin`):**
   - 4 KPI cards: Today's Orders, Gross Sales (₹), Total Items Sold, Top-Selling Dish.
   - Live availability toggle: immediately marks items sold out across all student menus.
   - Add/Edit modal to update prices, descriptions, and dietary classifications.

7. **Lab Evaluator Demo Controls (Dev-Only):**
   - Discreet bar to simulate normal hours, 4:46 PM cutoff, or inject a $>15$-minute overdue order for instant grading.
   - Operates via virtual context offset — zero modification to the host system clock.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+ or v22+)
- npm (v9+)

### 2. Installation
```bash
git clone <your-repo-url>
cd canteen-order-queue
npm install
```

### 3. Running Locally
```bash
npm run dev
```
The application will start at `http://localhost:3000`.

### 4. Running the 14-Test Automated Verification Suite
```bash
node scripts/verify-all.js
```

---

## 🗄️ Database & Supabase Configuration

The application includes full SQL schema and RLS policies in the `supabase/` directory:

1. Create a free project at [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste and run the contents of [supabase/schema.sql](file:///a:/canteen-order-queue/supabase/schema.sql).
4. Paste and run [supabase/rls_policies.sql](file:///a:/canteen-order-queue/supabase/rls_policies.sql).
5. Copy your Project URL and Anon Public Key into `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   VITE_USE_MOCK_DATA=false
   ```

*Note:* When `VITE_SUPABASE_URL` is empty, the application runs on its high-fidelity **Mock Adapter**, which supports multi-window real-time events via `BroadcastChannel` with zero cloud setup!

---

## ☁️ Deployment to Vercel

1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Set your production environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy! Vercel will automatically build using `npm run build`.

---

## 📁 Repository Structure

```text
canteen-order-queue/
├── AGENTS.md                  # Developer & autonomous agent manual
├── docs/
│   ├── 01-brief.md            # Vision, scope, personas, and architecture
│   ├── 02-screens.md          # Screen-by-screen UX specifications
│   └── 03-flows-rules.md      # Business rules, state machines, QA checklist
├── supabase/
│   ├── schema.sql             # PostgreSQL schema, seed items, atomic token RPC
│   └── rls_policies.sql       # Row Level Security policies
├── scripts/
│   └── verify-all.js          # Automated 14-test QA test runner
├── src/
│   ├── api/                   # Dual-mode data layer (Supabase + Mock BroadcastChannel)
│   ├── components/            # Reusable UI cards, filters, sticky bars, dev controls
│   ├── context/               # CartContext, MenuContext, OrderContext, SimulationContext
│   ├── hooks/                 # useCanteenHours hook (08:00–17:00, 16:45 cutoff)
│   ├── pages/                 # 6 Core screens (Menu, Cart, Status, Kitchen, Display, Admin)
│   ├── utils/                 # Currency formatters, wait-time calculator, constants
│   ├── App.jsx                # Application root with Fail-Fast production guard
│   └── main.jsx               # React entrypoint
```
