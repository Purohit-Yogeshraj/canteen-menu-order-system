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
├── public/
│   └── images/food/            # Optimized Indian canteen food imagery & fallbacks
├── src/
│   ├── api/                    # Supabase client and query/mutation services
│   │   ├── client.js           # Configured Supabase client
│   │   ├── menuService.js      # Menu item CRUD & stock toggling
│   │   └── orderService.js     # Order placement, status progression, metrics
│   ├── assets/                 # SVGs, icons, static graphic assets
│   ├── components/             # Reusable UI components
│   │   ├── common/             # Button, Badge, Modal, Navbar, EmptyState, LoadingSpinner
│   │   ├── menu/               # FoodCard, CategoryFilter, SearchBar, VegNonVegBadge
│   │   ├── cart/               # CartItemRow, OrderSummary, CheckoutForm
│   │   ├── order/              # TokenBadge, StatusTimeline, QueueEstimator
│   │   ├── kitchen/            # KitchenCard, ColumnKanban, DelayedWarningBadge
│   │   └── admin/              # MetricsCard, MenuTable, AddEditItemModal
│   ├── context/                # CartContext, OrderContext, NotificationContext
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
├── index.html                  # HTML entrypoint with metadata and mobile viewport
├── tailwind.config.js          # Custom theme: orange primary (#F97316), warm neutrals
├── vite.config.js              # Vite configuration
└── package.json                # Project dependencies and scripts
```

---

## 4. Non-Negotiable System & Business Invariants

1. **Strict Forward Status Progression:**
   $$\text{Placed} \longrightarrow \text{Preparing} \longrightarrow \text{Ready} \longrightarrow \text{Collected}$$
   - Backward transitions (e.g., *Ready* back to *Preparing*) are strictly forbidden at both UI and database API layers.
2. **Daily Sequential Token Numbers:**
   - Tokens reset to `1` every single day at midnight (e.g., `#001`, `#002`).
   - Token numbers must never be generated randomly or produce duplicates.
3. **Queue Wait-Time Calculation:**
   - Displayed wait time equals approximately **5 minutes** per pending order ahead in the queue:
     $$\text{Estimated Time} = (\text{Orders Ahead in Placed or Preparing}) \times 5\text{ minutes}$$
4. **Order Limits & Validation:**
   - Maximum **10 units** of any individual item per order.
   - Student Name and College Roll Number are mandatory non-empty strings.
   - Orders cannot be empty.
5. **Operating Hours Enforcement:**
   - Canteen operational hours: **08:00 AM – 05:00 PM (17:00)**.
   - **Order Cutoff Time: 04:45 PM (16:45).** No orders accepted after 16:45; cart checkout must disable and present a helpful warning notice.
6. **Real-Time Latency Target:**
   - Status changes and new orders must propagate across all active clients within **$\le$ 5 seconds** via Supabase Realtime subscriptions (with automatic reconnection and graceful fallback).
7. **Currency & Financial Calculation:**
   - All prices are strictly Indian Rupees (**₹**).
   - Math calculations must be exact, preventing floating-point rounding errors.
8. **Scope Guardrails:**
   - **Do NOT** implement: external payment gateways, home/campus delivery, Google OAuth login, user reviews, or loyalty reward points. Keep the order queue fast, direct, and distraction-free.

---

## 5. UI/UX & Responsive Design Rules

- **Palette:**
  - Primary Accent: Warm Canteen Orange (`#F97316` / Tailwind `orange-500` / `orange-600` hover).
  - Backgrounds: Clean whites (`#FFFFFF`) and warm cream/stone neutrals (`#FAFAF9` / `#F5F5F4`).
  - Dark Surface (Now Serving Display): Rich slate/black (`#0F172A` / `#020617`).
  - Text: High-contrast slate (`#0F172A`, `#334155`).
  - Badges: Veg (Forest Green `#16A34A`), Non-Veg (Crimson `#DC2626`).
- **Mobile First Standard:**
  - Tested and guaranteed pixel-perfect layout at **390px** width (iPhone 12/13/14 viewport) up to 4K desktop screens.
  - Generous touch targets ($\ge 44\text{px}$) for touchscreens.
- **TV Display Standard:**
  - `/display` route designed specifically for **1920×1080** overhead monitors with large typography readable from 15+ feet away.
  - Newly ready tokens must trigger a distinct 5-second pulsing animation.

---

## 6. Engineering Procedure for Phase Execution

When user approval is granted to begin coding, implement systematically across phased iterations:

1. **Stage 1 — Project Initialization & Styling Scaffold:**
   - Initialize Vite React project, configure Tailwind CSS, set up design tokens, routes, and layout shell.
2. **Stage 2 — Data Architecture & Supabase Service Layer:**
   - Define SQL schema, seed script with 15+ Indian canteen food items, and implement `client.js` with mock-fallback capability.
3. **Stage 3 — Student Menu (`/`) & Shopping Cart (`/cart`):**
   - Category filtering, search, quantity controls, sticky cart bar, cart drawer/page, roll number validation, and order submission.
4. **Stage 4 — Order Status Screen (`/order/:id`):**
   - Live token badge, progress timeline, dynamic wait time estimation, and real-time subscription.
5. **Stage 5 — Kitchen Board (`/kitchen`):**
   - 3-column Kanban, status transition buttons, 15-minute overdue warning alert, and audio/visual notifications.
6. **Stage 6 — Now Serving Display (`/display`):**
   - Fullscreen 1920×1080 dark display, Preparing vs. Ready split, 5-second blinking token animation.
7. **Stage 7 — Owner Menu Manager (`/admin`):**
   - Metrics bar, menu CRUD, price adjustments, stock toggles, live synchronization to student menu.
8. **Stage 8 — End-to-End Verification, Test Suite & Deployment Prep:**
   - Execute the 12-test QA checklist, verify edge cases, and prepare Vercel deployment documentation.

*After each stage, output:*
- Files created or modified.
- Features implemented.
- Exact commands to run and test.
- Verification checklist results.
- Open items or dependencies for next stage.
