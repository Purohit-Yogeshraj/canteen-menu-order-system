# AGENTS.md — Canteen Menu & Order Queue System
**Project Guide & Autonomous Operating Manual for Engineering Agents**

---

## 1. Project Identity & Operational Role

- **Project Name:** Canteen Menu & Order Queue System
- **Academic Context:** MSc IT Vibe Coding Lab Project
- **Target Deliverable:** Production-grade, mobile-first web application deployed on Vercel with real-time Supabase integration.
- **Operating Persona:** Senior Full-Stack Developer, Lead UI/UX Designer, and Senior QA Engineer.
- **Fundamental Rule:** Do NOT generate application code until the user approves the planning documents, architecture, and phased implementation roadmap. Build iteratively, one feature at a time, validating each step.

---

## 2. Core Architecture & Tech Stack

| Tier | Technology | Purpose & Rationale |
| :--- | :--- | :--- |
| **Framework** | **React 18 + Vite** | High-performance bundling, modular component structure, rapid HMR. |
| **Styling** | **Tailwind CSS** | Mobile-first utility design, responsive breakpoints, bespoke canteen styling. |
| **Icons** | **Lucide React** | Lightweight, clean, modern icon set for status indicators, categories, and actions. |
| **State Management** | **React Context + Hooks** | Predictable local and shared application state without bloated third-party dependencies. |
| **Database & Realtime** | **Supabase (PostgreSQL + Realtime)** | Managed relational persistence, WebSocket change-data-capture (CDC), row-level security. |
| **Local Realtime Mock** | **BroadcastChannel API** | Cross-tab / cross-window real-time event bus for seamless local testing without Supabase keys. |
| **Routing** | **React Router DOM (v6)** | Declarative client-side routing across all 6 core screen URLs. |
| **Deployment** | **Vercel** | Edge network deployment with automated Git continuous integration. |

---

## 3. Directory & File Structure Conventions

```text
canteen-order-queue/
├── AGENTS.md                   # Operational guidelines & engineering rules (this file)
├── docs/
│   ├── 01-brief.md             # Project vision, personas, scope, and technical stack
│   ├── 02-screens.md           # Screen-by-screen UX, component layout, and behavior
│   └── 03-flows-rules.md       # State machines, business rules, edge cases, test checklist
├── supabase/
│   ├── schema.sql              # PostgreSQL schema, atomic token function, RLS & seed data
│   └── rls_policies.sql        # Explicit Row Level Security security rules
├── public/
│   └── images/food/            # Optimized Indian canteen food imagery & SVG fallbacks
├── src/
│   ├── api/                    # Data service abstraction (Supabase & Mock adapters)
│   │   ├── client.js           # Supabase client initialization & mode switcher
│   │   ├── dataAdapter.js      # Unified data interface (strict contract)
│   │   ├── supabaseAdapter.js  # Live Supabase PostgreSQL + WebSocket driver
│   │   ├── mockAdapter.js      # High-fidelity local adapter with BroadcastChannel
│   │   ├── menuService.js      # Menu item CRUD & stock toggling service
│   │   └── orderService.js     # Order placement, status progression, metrics service
│   ├── assets/                 # SVGs, icons, static graphic assets
│   ├── components/             # Reusable UI components
│   │   ├── common/             # Button, Badge, Modal, Navbar, EmptyState, LoadingSpinner, FallbackImage
│   │   ├── menu/               # FoodCard, CategoryFilter, SearchBar, VegNonVegBadge
│   │   ├── cart/               # CartItemRow, OrderSummary, CheckoutForm
│   │   ├── order/              # TokenBadge, StatusTimeline, QueueEstimator
│   │   ├── kitchen/            # KitchenCard, ColumnKanban, DelayedWarningBadge
│   │   ├── admin/              # MetricsCard, MenuTable, AddEditItemModal
│   │   └── dev/                # DemoControls (dev-only virtual time/ticket simulation)
│   ├── context/                # CartContext, OrderContext, MenuContext, SimulationContext
│   ├── hooks/                  # useRealtimeOrders, useCanteenHours, useMenu
│   ├── pages/                  # 6 Core Application Screens
│   │   ├── StudentMenu.jsx     # Route: /
│   │   ├── ShoppingCart.jsx    # Route: /cart
│   │   ├── OrderStatus.jsx     # Route: /order/:id
│   │   ├── KitchenBoard.jsx    # Route: /kitchen
│   │   ├── NowServing.jsx      # Route: /display (1920x1080 TV display)
│   │   └── AdminManager.jsx    # Route: /admin
│   ├── utils/                  # Currency formatting, time calculation, validation helpers
│   ├── App.jsx                 # Routing and global provider setup
│   ├── index.css               # Tailwind CSS directives and custom animations
│   └── main.jsx                # Application root entrypoint
├── .env.example                # Template for environment variables (no secrets committed)
├── index.html                  # HTML entrypoint with metadata and mobile viewport
├── tailwind.config.js          # Custom theme: orange primary (#F97316), warm neutrals
├── vite.config.js              # Vite configuration
└── package.json                # Project dependencies and scripts
```

---

## 4. Mandatory Architectural & Safety Invariants

### 4.1 Strict Business Rule Parity (Mock vs. Supabase)
- Both `supabaseAdapter.js` and `mockAdapter.js` must implement the exact same TypeScript/JSDoc interface contract (`dataAdapter.js`).
- Business logic validation (max 10 units per item, roll number validation, forward-only status progression, daily token generation, and operating hours checks) must execute identically in both modes. Mock mode is never permitted to bypass or soften any business rule.

### 4.2 Production Fail-Fast (No Silent Fallback)
- In production builds (`import.meta.env.PROD`), the application **must never silently fall back** to mock data.
- If `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are missing, malformed, or the database connection fails in production, the application must immediately render a high-visibility configuration error banner halting execution, rather than silently masquerading local mock data as live cloud data.
- Mock mode is strictly restricted to development environments (`import.meta.env.DEV === true` or explicit `VITE_USE_MOCK_DATA === 'true'`).

### 4.3 Safe Demo Controls Architecture
- Demo controls (e.g. simulating the 4:45 PM cutoff or generating an order placed $>15$ minutes ago) must **never monkey-patch `Date.now`**, alter the host system clock, or bypass business invariants.
- Demo controls operate via an isolated `SimulationContext` that injects a virtual time offset into the hours hook (`useCanteenHours`).
- **Production Guard:** Demo controls are disabled and stripped from production builds by default (`import.meta.env.DEV` check).

### 4.4 Cross-Window Real-Time Synchronization
- Real-time updates must work seamlessly across separate browser windows and tabs.
- **Supabase Mode:** Driven by Supabase Realtime WebSocket subscriptions on PostgreSQL Change Data Capture (`INSERT`, `UPDATE`).
- **Mock Mode:** Driven by the Web standard **`BroadcastChannel` API** (`canteen_realtime_bus`) backed by `window.addEventListener('storage', ...)`. When an order is placed on `/cart` in Window 1, Window 2 (`/kitchen`) and Window 3 (`/display`) must instantly receive the event and update without manual browser refresh.

### 4.5 Concurrency-Safe Daily Token Generation
- Token numbers reset to `1` every single day at midnight (e.g., `#001`, `#002`).
- **Supabase Mode:** Handled via an atomic PostgreSQL stored procedure (`create_canteen_order`) using transactional row locking (`SELECT ... FOR UPDATE` or advisory lock) on a `daily_sequences` table, guaranteeing zero duplicate tokens even under simultaneous multi-user submissions.
- **Mock Mode:** Synchronized via an atomic counter stored with tab-level mutual exclusion.

### 4.6 Strict Credential & Secret Hygiene
- All Supabase credentials must be loaded via Vite environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- Never commit actual API keys or service role secrets to Git.
- Provide a clear `.env.example`.
- Enforce Supabase Row Level Security (RLS) policies on all tables so clients operate safely with the public anonymous key.

### 4.7 Mobile First (390px Viewport Standard)
- Guaranteed pixel-perfect rendering and full usability at **390px** width (iPhone 12/13/14 baseline) up to 4K desktop screens.
- All interactive touch targets must be $\ge 44\text{px}$.
- No horizontal scrolling (`overflow-x-hidden`).
- Category tabs must support smooth horizontal touch scrolling with hidden scrollbars.
- Menu page must feature appropriate bottom padding (`pb-28`) so floating cart bars never obscure food cards.

### 4.8 Status Progression & Invariants
1. **Strict Forward Status Progression:**
   $$\text{Placed} \longrightarrow \text{Preparing} \longrightarrow \text{Ready} \longrightarrow \text{Collected}$$
   - Backward transitions (e.g., *Ready* back to *Preparing*) are strictly forbidden at both UI and database API layers.
2. **Queue Wait-Time Calculation:**
   $$\text{Estimated Time} = \max(5, (\text{Orders Ahead in Placed or Preparing} + 1) \times 5)\text{ minutes}$$
   - When order status is **Ready** or **Collected**, estimated wait time is **0 minutes** (*"Ready for pickup immediately"*).
3. **Order Limits & Validation:**
   - Maximum **10 units** of any individual item per order.
   - Student Name and College Roll Number are mandatory non-empty strings.
   - Orders cannot be empty.
4. **Operating Hours Enforcement:**
   - Canteen operational hours: **08:00 AM – 05:00 PM (17:00)**.
   - **Order Cutoff Time: 04:45 PM (16:45).** No orders accepted after 16:45; cart checkout must disable and present a helpful warning notice.
5. **Real-Time Latency Target:**
   - Status changes and new orders must propagate across all active clients within **$\le$ 5 seconds**.
6. **Currency & Financial Calculation:**
   - All prices are strictly Indian Rupees (**₹**). Exact arithmetic with zero floating-point rounding errors.
7. **Scope Guardrails:**
   - **Do NOT** implement: external payment gateways, home/campus delivery, Google OAuth login, user reviews, or loyalty reward points.

---

## 5. UI/UX & Responsive Design Rules

- **Palette:**
  - Primary Accent: Warm Canteen Orange (`#F97316` / Tailwind `orange-500` / `orange-600` hover).
  - Backgrounds: Clean whites (`#FFFFFF`) and warm cream/stone neutrals (`#FAFAF9` / `#F5F5F4`).
  - Dark Surface (Now Serving Display): Rich slate/black (`#0F172A` / `#020617`).
  - Text: High-contrast slate (`#0F172A`, `#334155`).
  - Badges: Veg (Forest Green `#16A34A`), Non-Veg (Crimson `#DC2626`).
- **TV Display Standard:**
  - `/display` route designed specifically for **1920×1080** overhead monitors with large typography readable from 15+ feet away.
  - Newly ready tokens must trigger a distinct 5-second pulsing animation.

---

## 6. Phased Implementation Roadmap (Post-Approval)

When user approval is granted, execute in sequential phases:

1. **Stage 1 — Project Initialization & Styling Scaffold:**
   - Initialize Vite React project, configure Tailwind CSS, set up design tokens, routes, responsive navbar, and layout shell.
2. **Stage 2 — Data Architecture & Supabase Service Layer:**
   - Define SQL schema, RLS policies, atomic token RPC, implement `client.js`, `dataAdapter.js`, `supabaseAdapter.js`, and `mockAdapter.js` (with BroadcastChannel).
3. **Stage 3 — Student Menu (`/`) & Shopping Cart (`/cart`):**
   - Category filtering, search, quantity controls, sticky cart bar, cart drawer/page, roll number validation, sold-out eviction, and order submission.
4. **Stage 4 — Order Status Screen (`/order/:id`):**
   - Live token badge, progress timeline, dynamic wait time estimation, and real-time subscription.
5. **Stage 5 — Kitchen Board (`/kitchen`):**
   - 3-column Kanban, status transition buttons, 15-minute overdue warning alert, and audio/visual notifications.
6. **Stage 6 — Now Serving Display (`/display`):**
   - Fullscreen 1920×1080 dark display, Preparing vs. Ready split, 5-second blinking token animation.
7. **Stage 7 — Owner Menu Manager (`/admin`):**
   - Metrics bar, menu CRUD, price adjustments, stock toggles, live synchronization to student menu.
8. **Stage 8 — End-to-End Verification, Test Suite & Deployment Prep:**
   - Execute the 14-test QA checklist (TC-01 through TC-14), verify edge cases, and prepare Vercel deployment documentation.
