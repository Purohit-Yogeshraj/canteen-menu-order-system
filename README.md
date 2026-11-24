# Campus Canteen Menu & Order Queue System
**MSc IT Vibe Coding Lab Project — Production Deliverable**

> 🔗 **Live Demo URL:** `http://localhost:3000` *(Local Dev / Vercel Edge Ready)*  
> *For cloud hosting: Connect your GitHub repository to Vercel with environment variables specified below.*

---

## 📖 1. Project Overview

The **Canteen Menu & Order Queue System** is a mobile-first web application designed to solve physical congestion and wait-time uncertainty in university and workplace dining facilities.

By replacing counter lines with a real-time virtual queue, students can browse 16 realistic Indian canteen dishes, customize quantities, and place orders with their student roll numbers. A concurrency-safe daily token is allocated (`#001`, `#002`), and progress is displayed live through a 3-stage kitchen timeline with dynamic wait-time estimation ($\approx 5\text{ mins per order ahead}$). Kitchen staff process orders via a 3-column forward Kanban board, while an overhead 1080p display alerts students the moment their token is ready for collection.

---

## ✨ 2. Key Features

- **Mobile-First Student Menu (`/`):** 16 curated Indian canteen dishes (Samosa, Masala Dosa, Pav Bhaji, Biryani, Chai, etc.) with high-resolution photos and inline SVG fallbacks. Category pills (*Snacks*, *Meals*, *Beverages*, *Desserts*), Veg/Non-Veg indicators, instant search, and touch steppers bounded by a strict 10-unit maximum limit.
- **Atomic Shopping Cart (`/cart`):** Quantity steppers (1–10), real-time stock reconciler with sold-out item eviction alerts, student credentials validation (Name and Roll No), transparent pricing (₹), and 4:45 PM ordering cutoff enforcement.
- **Order Status Tracking (`/order/:id`):** Large daily sequential token badge, 3-stage animated progress timeline (*Placed* $\to$ *Preparing* $\to$ *Ready*), dynamic wait-time calculation, and confetti celebration with counter pickup directions.
- **Kitchen Kanban Operations (`/kitchen`):** 3-column Kanban (*New*, *Preparing*, *Ready*), forward-only transitions, 15-minute overdue alert badge (`⚠️ Overdue (>15m)`), and new order audio chimes.
- **Now Serving TV Display (`/display`):** Fullscreen 1920×1080 dark mode layout for cafeteria monitors, dual split (*Preparing* vs. *Ready to Collect*), and **5-second pulsing/blinking animation** for newly called tokens.
- **Owner Menu Manager (`/admin`):** 4 real-time business KPI cards (Today's Orders, Gross Sales ₹, Total Items Sold, Top-Selling Dish), interactive stock toggles, price updates, and Add/Edit food modal.
- **Lab Evaluator Demo Controls (Dev-Only):** Discreet bar allowing evaluators to simulate normal hours (12:30 PM), 4:46 PM cutoff (closed state), or inject a $>15$-minute overdue order for instant grading—all via virtual context offsets with zero mutation of the host system clock.

---

## 🛠️ 3. Technology Stack

| Tier | Technology | Purpose & Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18 + Vite 5** | Lightning-fast HMR, component modularity, production tree-shaking. |
| **Styling** | **Tailwind CSS 3** | Mobile-first utility design, responsive breakpoints (390px baseline), bespoke canteen palette (`#F97316`). |
| **Icons** | **Lucide React** | High-contrast, clean icons for dietary badges, actions, and states. |
| **State Management** | **React Context + Hooks** | `CartContext`, `MenuContext`, `OrderContext`, and `SimulationContext`. |
| **Database & Realtime** | **Supabase (PostgreSQL + Realtime)** | Managed PostgreSQL relational database with Change Data Capture (CDC) over WebSockets. |
| **Local Realtime Mock** | **BroadcastChannel API** | Cross-tab / cross-window real-time event bus for seamless local testing without Supabase keys. |
| **Routing** | **React Router DOM v6** | Declarative client-side routing across all 6 core screen URLs with `vercel.json` rewrite support. |
| **Deployment** | **Vercel** | Edge network deployment with automated Git continuous integration. |

---

## 🚀 4. Installation & Local Setup

### Prerequisites
- Node.js (v18.x or v22.x)
- npm (v9.x or v10.x)
- Git

### Quickstart Commands
```bash
# 1. Clone repository
git clone <your-repo-url>
cd canteen-order-queue

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The application will be available at: **`http://localhost:3000/`**

---

## ⚙️ 5. Environment Variables & Modes

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Supabase Project URL | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Public Anon Key | `eyJhbGciOi...` |
| `VITE_USE_MOCK_DATA` | Force local mock adapter | `true` (in dev) |
| `VITE_ENABLE_DEMO_CONTROLS` | Enable time/ticket simulation | `true` (dev only; stripped in prod) |

### Dual-Mode Architecture:
- **Zero-Setup Mock Mode:** When `VITE_SUPABASE_URL` is empty, the application runs on its high-fidelity Mock Adapter. It persists data in `localStorage` and synchronizes events across separate browser tabs via the Web `BroadcastChannel` API.
- **Production Fail-Fast Guard:** In production builds (`import.meta.env.PROD`), if Supabase credentials are missing or connection fails, the application immediately renders a fatal configuration error banner. Silent fallback to mock data is strictly forbidden in production.

---

## 🗄️ 6. Supabase Database Configuration

To connect live Supabase cloud storage:

1. Create a free project at [supabase.com](https://supabase.com).
2. Navigate to the **SQL Editor** in your Supabase dashboard.
3. Paste and execute the SQL script in [supabase/schema.sql](supabase/schema.sql). This creates:
   - `menu_items` table (with 16 Indian seed canteen items).
   - `orders` and `order_items` tables with cascade rules.
   - `daily_sequences` table with transactional row locking (`create_canteen_order` RPC) to guarantee zero duplicate tokens under concurrent submissions.
   - Enables PostgreSQL CDC on `orders` and `menu_items`.
4. Paste and execute [supabase/rls_policies.sql](supabase/rls_policies.sql) to enable Row Level Security.
5. Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env` and set `VITE_USE_MOCK_DATA=false`.

---

## 🗺️ 7. Application Routes

| Route | Screen Name | Viewport / Target Device | Primary User |
| :--- | :--- | :--- | :--- |
| `/` | **Student Menu** | Mobile (390px) & Desktop | Students / Faculty |
| `/cart` | **Shopping Cart** | Mobile (390px) & Desktop | Students / Faculty |
| `/order/:id` | **Order Status** | Mobile (390px) & Desktop | Active Order Customer |
| `/kitchen` | **Kitchen Board** | Tablet (768px+) & Desktop | Kitchen Chefs / Prep Crew |
| `/display` | **Now Serving Display** | 1920×1080 Fullscreen TV | Cafeteria Hall Audience |
| `/admin` | **Owner Menu Manager** | Desktop (1024px+) & Tablet | Canteen Manager / Owner |

---

## 👨‍🍳 8. Demo & Staff Access Instructions

For lab examiners and demonstration purposes:
- **Direct Navigation:** Staff screens are accessible directly via the top navigation bar or direct URLs (`/kitchen`, `/display`, `/admin`).
- **Simulating Real-Time Across Separate Windows:**
  1. Open **Window 1:** `http://localhost:3000/cart`
  2. Open **Window 2:** `http://localhost:3000/kitchen`
  3. Open **Window 3:** `http://localhost:3000/display`
  4. Place an order on Window 1. Within seconds, Window 2 sounds an audible chime and receives the ticket, while Window 3 updates queue counts.
- **Testing 4:45 PM Cutoff:** Click **"4:46 PM (Cutoff)"** on the top demo controls bar. The student menu immediately reflects the cutoff banner and blocks checkout.
- **Testing Overdue Ticket Warning:** Click **"Inject >15m Overdue Ticket"** to instantly generate a ticket placed 16 minutes ago and inspect the flashing amber-red overdue badge on `/kitchen`.

---

## 🧪 9. Automated Quality Verification

Run the automated 20-point test runner:
```bash
node scripts/verify-all.js
```
All 20 test points (menu catalog, steppers, bounds, student validation, atomic tokens, kitchen intake, forward progression, overdue alerts, wait calculations, sold-out cart eviction, operating hours, and 390px mobile compliance) pass with 100% compliance.
