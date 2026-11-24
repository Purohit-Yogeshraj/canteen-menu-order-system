# Canteen Menu & Order Queue System

**A smart, responsive digital canteen ordering and queue management application.**

> **Live Application:** https://canteen-menu-order-system.vercel.app/

---

## About the Project

The Canteen Menu & Order Queue System is a web-based application designed to simplify food ordering and order management in a college canteen.

Students can browse available food items, add products to their cart, place orders, and track their order status using a daily sequential token number.

Kitchen staff can manage incoming orders and update their preparation status, while the owner can manage food items, prices, and availability.

---

## Main Features

### 1. Student Menu (`/`)
- Browse 16 realistic Indian canteen food items.
- Search dishes and filter by food categories (*Snacks*, *Meals*, *Beverages*, *Desserts*).
- Filter by dietary preference (*Pure Veg*, *Non-Veg*, *All*).
- View food prices in Indian Rupees (₹) and detailed descriptions.
- Add products to cart with quantity controls (up to 10 units maximum).
- Clear identification and disabled actions for sold-out products.
- Mobile-first responsive layout with floating sticky cart summary bar.

### 2. Shopping Cart (`/cart`)
- Add and remove products with touch-friendly controls.
- Increase and decrease quantities (bounded between 1 and 10 units).
- Accurate subtotal and grand total calculation in Indian Rupees (₹).
- Enter student information (Full Name and College Roll Number).
- Automatic eviction notification if an item becomes sold out while in the cart.
- Strict ordering cutoff enforcement at 4:45 PM IST.
- Place food orders with accidental duplicate submission protection.

### 3. Order Status (`/order/:id`)
- Generate and display a prominent daily sequential order token (e.g., `#001`, `#042`).
- 3-stage visual progress timeline: *Placed* $\to$ *Preparing* $\to$ *Ready*.
- Dynamic queue waiting time calculation based on active orders ahead.
- Automatic confetti celebration and Counter 1 collection directions when *Ready*.
- Real-time status synchronization without page refresh.

### 4. Kitchen Board (`/kitchen`)
- 3-column Kanban view: **NEW**, **PREPARING**, and **READY**.
- Displays token numbers, student names, roll numbers, ordered items, and order time.
- Implement forward-only status progression actions: *Start Preparing*, *Mark Ready*, and *Mark Collected*.
- Highlight orders older than 15 minutes with an amber-red overdue warning badge.
- Automatically receive new orders with an audible chime alert.
- Real-time multi-window synchronization.

### 5. Now Serving Display (`/display`)
- Fullscreen dark interface optimized for 1920×1080 cafeteria TV screens.
- Distinct *Preparing in Kitchen* and *Ready for Pickup* zones.
- Extra-large readable token numbers.
- Newly ready tokens trigger a 5-second pulsing blink animation.
- Automatically clear collected tokens from the screen.
- Real-time updates without manual browser refresh.

### 6. Owner Menu Manager (`/admin`)
- 4 real-time business KPI metrics: Today's Orders, Gross Sales (₹), Total Items Sold, Top-Selling Dish.
- Display all menu items with search and category filtering.
- Add new food items via modal form.
- Edit existing food items (prices, names, descriptions, categories, images).
- Interactive availability toggle: marks items *Available* or *Sold Out* instantly.
- Live synchronization pushes updates to student menus and carts immediately.

---

## Technology Stack

| Technology | Purpose |
|---|---|
| **React 18** | Frontend component development |
| **Vite 5** | High-performance bundling and development server |
| **Tailwind CSS 3** | Mobile-first responsive styling and animations |
| **Supabase** | PostgreSQL database and WebSocket Realtime subscriptions |
| **BroadcastChannel API** | Multi-window real-time synchronization in local mock mode |
| **React Router DOM v6** | Declarative client-side routing across all 6 screens |
| **Git & GitHub** | Source code management and version control |
| **Vercel** | Edge deployment platform with automated builds |

---

## Application Routes

| Route | Screen Name | Target Viewport / User |
|---|---|---|
| `/` | **Student Menu** | Mobile (390px) & Desktop — Students / Faculty |
| `/cart` | **Shopping Cart** | Mobile (390px) & Desktop — Checkout |
| `/order/:id` | **Order Status** | Mobile (390px) & Desktop — Live Customer Tracking |
| `/kitchen` | **Kitchen Board** | Tablet (768px+) & Desktop — Kitchen Chefs / Staff |
| `/display` | **Now Serving Display** | 1920×1080 Fullscreen TV — Cafeteria Hall Audience |
| `/admin` | **Owner Menu Manager** | Desktop (1024px+) & Tablet — Canteen Manager |

---

## Installation and Setup

### Prerequisites
- Node.js (v18.x or v22.x)
- npm (v9.x or v10.x)
- Git

### Step 1: Clone the repository
```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### Step 2: Open the project directory
```bash
cd canteen-order-queue
```

### Step 3: Install dependencies
```bash
npm install
```

### Step 4: Configure environment variables
Copy `.env.example` into `.env`:
```bash
cp .env.example .env
```
Enter your Supabase configuration if connecting to live cloud storage. If left blank, the application runs on its built-in local Mock Adapter.

Never commit secret credentials or service role keys.

### Step 5: Start the development server
```bash
npm run dev
```
Open the local URL provided by Vite (default: `http://localhost:3000`).

### Step 6: Build for production
```bash
npm run build
```

---

## Database Configuration

The application uses Supabase for persistent storage and real-time updates:

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Run `supabase/schema.sql` to create tables, constraints, seed data, and the atomic sequential token stored procedure (`create_canteen_order`).
4. Run `supabase/rls_policies.sql` to apply Row Level Security policies.
5. Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env`.

The local mock mode can be used for development without Supabase credentials, persisting data in `localStorage` and synchronizing events across tabs via the Web `BroadcastChannel` API.

---

## Business Rules

- **Status Sequence:** Orders follow the strict sequence `Placed` $\to$ `Preparing` $\to$ `Ready` $\to$ `Collected`. Backward transitions are strictly forbidden.
- **Daily Tokens:** Sequential tokens start from `#001` each day, resetting at 00:00:00 `Asia/Kolkata` time.
- **Quantity Caps:** Maximum quantity per product is 10 units.
- **Operating Hours:** Canteen operational hours are 08:00 AM – 05:00 PM IST.
- **Order Cutoff:** New orders close strictly at 04:45 PM IST.
- **Real-Time Sync:** Status and stock updates synchronize automatically across active windows within 5 seconds.

---

## Staff & Admin Access Control

To protect kitchen management and menu administration from unauthorized public changes, role-based password authentication is enforced:

| Role | Default Password | Accessible Screens & Features |
| :--- | :--- | :--- |
| **Student / Public** | *None (open)* | Canteen Menu (`/`), Shopping Cart (`/cart`), Order Status (`/order/:id`) |
| **Kitchen Staff** | `staff123` | Kitchen Kanban Board (`/kitchen`), Now Serving TV Display (`/display`) |
| **Canteen Admin** | `admin123` | Owner Menu Manager (`/admin`), Kitchen Board (`/kitchen`), Now Serving TV (`/display`) |

Passwords can be customized via `VITE_STAFF_PASSWORD` and `VITE_ADMIN_PASSWORD` in `.env`.

---

## Project Documentation

- `AGENTS.md` — Agent instructions, safety architecture, and invariants.
- `docs/01-brief.md` — Project overview, personas, and scope boundaries.
- `docs/02-screens.md` — Screen specifications and button action tables.
- `docs/03-flows-rules.md` — Business rules, state machines, and QA test matrix.
- `project_plan_and_architecture.md` — System architecture and implementation roadmap.
- `prompts.md` — Chronological record of all executed AI prompts.
- `reflection.md` — Academic reflection on AI-assisted development.

---

## Author

**Student Name:** Purohit Yogeshraj Bhanwarlal  
**Course:** MSc IT  
**Enrollment No.:** 202612091  

---

## Acknowledgement

Google Antigravity was used as an AI-assisted development tool for project planning, architecture design, implementation, and test verification.
