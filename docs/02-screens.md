# 02. Screen-by-Screen UX & UI Specifications
**Project Name:** Canteen Menu & Order Queue System  
**Academic Context:** MSc IT Vibe Coding Lab Project  
**Design Standards:** Warm Canteen Orange Accent (`#F97316`), Mobile-First (390px+), Accessible, Clean States  

---

## Screen Overview Matrix

| # | Screen Name | Route | Primary Device / Viewport | Primary Target User | Realtime Channel |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Student Menu** | `/` | Mobile (390px) & Desktop | Students / Faculty | `menu_items` (stock updates) |
| **2** | **Shopping Cart** | `/cart` | Mobile (390px) & Desktop | Students / Faculty | `menu_items` (out-of-stock check) |
| **3** | **Order Status** | `/order/:id` | Mobile (390px) & Desktop | Customer with active order | `orders` (status changes) |
| **4** | **Kitchen Board** | `/kitchen` | Tablet (768px+) & Desktop | Kitchen Chefs / Prep Crew | `orders`, `order_items` (live new orders) |
| **5** | **Now Serving Display** | `/display` | 1920×1080 Fullscreen TV | Hall Audience / Students waiting | `orders` (Preparing & Ready tokens) |
| **6** | **Owner Menu Manager** | `/admin` | Desktop (1024px+) & Tablet | Canteen Manager / Owner | `orders` (metrics), `menu_items` |

---

## 1. Student Menu (`/`)

### 1.1 Purpose & Viewport (390px Mobile Standard)
- **Primary Viewport:** Mobile phone handheld browsing (iPhone 12/13/14 baseline at **390px width**).
- **Responsive Scaling:** 1 column on 390px mobile, 2 columns on 640px tablet, 3-4 columns on 1024px+ desktop.
- **Touch Target Standard:** All interactive buttons and stepper controls have touch targets $\ge 44\text{px}$.
- **Bottom Clearance:** Menu container includes a `pb-28` bottom cushion to prevent the sticky floating cart summary from obscuring the lowest food items.

### 1.2 Layout & UI Anatomy
1. **Header & Brand Bar:**
   - Canteen branding (*"Campus Canteen Queue"*), operating hours indicator badge (*"Open • Orders accepted till 4:45 PM"*), and quick navigation link to `/cart` with an active item count badge.
2. **Operational Notice Banner:**
   - Real-time notice dynamically displayed if virtual/canteen time is $\ge$ 4:45 PM (*"Kitchen is closing. Orders accepted until 4:45 PM"*).
3. **Search & Category Filter Bar:**
   - Instant search input with clear icon.
   - Horizontal touch-scroll category pill tabs (**All**, **Snacks**, **Meals**, **Beverages**, **Desserts**) with hidden scrollbars for clean mobile presentation.
   - Veg / Non-Veg toggle pill filter (Show All, Pure Veg, Non-Veg).
4. **Food Card Component:**
   - **Visual Image with SVG Fallback:** High-resolution food photo with graceful SVG fallback illustration if image fails to load or device is offline.
   - **Dietary Indicator:** Official green square/circle (Vegetarian) or red triangle/square (Non-Vegetarian) badge.
   - **Details:** Bold item title, category chip, description, and price in Indian Rupees (`₹40`).
   - **Stock & Stepper:**
     - *In Stock:* Touch-friendly "+ Add" button ($\ge 44\text{px}$). Once added, transforms into an inline stepper: `[ - ] [ count ] [ + ]` (capped at 10 max).
     - *Sold Out:* Image desaturated (grayscale 60%), card overlaid with an amber-red *"Sold Out"* badge, and action button disabled.
5. **Sticky Bottom Cart Floating Summary Bar:**
   - Dynamically slides up from the viewport bottom when cart item count $> 0$.
   - Displays: Total items count, running subtotal in ₹, and a prominent orange CTA: *"View Cart →"*.

---

## 2. Shopping Cart (`/cart`)

### 2.1 Purpose & Viewport
Review selected items, adjust quantities, reconcile real-time stock availability, input student credentials, and place the order. Fully responsive on 390px mobile screens.

### 2.2 Layout & UI Anatomy
1. **Header:** Back navigation link (`← Back to Menu`) and page title: *"Your Order Cart"*.
2. **Cart Items Table / List:**
   - 64×64px food thumbnail with SVG fallback.
   - Item name, category, unit price in ₹.
   - Touch-friendly stepper `[ - ] [ Qty ] [ + ]` (bounds: 1 to 10 units per item).
   - Trash / Remove icon button with generous tap padding.
3. **Real-Time Stock Reconciler:**
   - If an item in the cart is marked "Sold Out" in the Admin panel or database while the student is on `/cart`, an instant toast notification warns: *"[Item Name] has just sold out and was removed from your cart."* The item is automatically removed and the total recalculated.
4. **Student Identification Form:**
   - **Student Full Name:** Text input with real-time validation (Required, min 2 characters).
   - **College Roll Number:** Alphanumeric input (e.g., `IT-2026-042`) (Required, min 3 characters).
5. **Bill Breakdown Card:**
   - Item Subtotal (₹).
   - Packaging / Taxes (₹0 — Transparent college pricing).
   - Grand Total (₹) formatted in bold high-contrast text.
6. **Action CTA:**
   - Large touch button ($\ge 48\text{px}$ height): **"Place Order • ₹[Total]"**.
   - Disabled with explanatory tooltip if:
     - Cart is empty.
     - Student Name or Roll Number are missing.
     - Current time is past 4:45 PM.
     - Order submission is in flight (shows loading spinner).

---

## 3. Order Status Screen (`/order/:id`)

### 3.1 Purpose & Viewport
The customer's live tracking receipt. Accessible immediately after placing an order. Receives real-time WebSocket updates (or local BroadcastChannel events) across separate browser windows without manual page refresh.

### 3.2 Layout & UI Anatomy
1. **Prominent Token Header:**
   - Massive, high-visibility Token Badge: e.g., **Token #042**.
   - Accentuated in primary orange (`#F97316`) on a warm card with subtle elevation.
2. **3-Stage Visual Progress Stepper:**
   - **Step 1: Placed** (Order received by system, queued for kitchen).
   - **Step 2: Preparing** (Kitchen chef has started cooking/packaging).
   - **Step 3: Ready for Pickup** (Food is waiting at the counter).
   - Step indicator connects through animated progress bars with checkmarks and pulse animations on the active step.
3. **Queue Wait-Time Estimator:**
   - Dynamic card displaying:
     - Orders Ahead: *"There are 3 orders ahead of you."*
     - Estimated Wait: *"~15 mins"* ($\approx 5\text{ min per order ahead}$).
     - Automatically recalculates in real time as preceding orders move forward.
4. **Collection Alert Banner:**
   - When order reaches **Ready** status:
     - Card background turns radiant green with a celebration burst (confetti animation).
     - Bold headline: *"Your order is Ready for Collection!"*
     - Prompt: *"Please proceed to Counter 1 with Token #042."*
5. **Order Summary Card:**
   - Student Name & Roll Number.
   - Timestamp of order placement.
   - List of items, quantities, and total amount paid/due.
6. **Footer Navigation:** Link: *"Place Another Order"* navigating back to `/`.

---

## 4. Kitchen Board (`/kitchen`)

### 4.1 Purpose & Viewport
Operations console for canteen kitchen staff. Tablet (768px+) and desktop optimized. Features a 3-column Kanban board with real-time multi-window order intake and alert indicators.

### 4.2 Layout & UI Anatomy
1. **Kitchen Operations Header:**
   - Active orders counter: *"12 Active Tickets"*.
   - Audio alert toggle button (chime on new incoming ticket).
   - Live digital clock and operational status indicator.
2. **3-Column Kanban Board:**
   - **Column 1: New / Placed (Orange Theme)**
     - Incoming tickets awaiting kitchen pickup.
     - Action: One-tap button **"Start Preparing →"**.
   - **Column 2: Preparing (Blue / Amber Theme)**
     - Tickets currently cooking on stoves / prep tables.
     - Action: One-tap button **"Mark Ready for Pickup →"**.
   - **Column 3: Ready (Emerald Green Theme)**
     - Food ready at counter waiting for student token pickup.
     - Action: One-tap button **"Mark Collected ✓"**. (Transitions to archived/collected).
3. **Kitchen Ticket Card Anatomy:**
   - **Header:** Token Number (`#042`), Student Name, Roll No.
   - **Elapsed Timer:** Running stopwatch (`04:15 ago`).
   - **15-Minute Overdue Warning:** If an order remains unfulfilled for $> 15$ minutes, the card flashes an amber-red badge: *"⚠️ Overdue (>15m)"* to ensure priority handling.
   - **Item Checklist:** Clean list of items with large quantity pills (e.g., `[ 2x ] Masala Dosa`, `[ 1x ] Filter Coffee`).
   - **Action Button:** Large touch-friendly button at card footer.
4. **Strict Progression Guardrail:**
   - Cards can only move forward: $\text{New} \to \text{Preparing} \to \text{Ready} \to \text{Collected}$.
   - No backward drag or reverse clicks are permitted.

---

## 5. Now Serving Display (`/display`)

### 5.1 Purpose & Viewport
Designed exclusively for overhead cafeteria displays and TV monitors. Formatted specifically for **1920×1080 resolution** in widescreen landscape.

### 5.2 Layout & UI Anatomy
1. **Background & Atmosphere:**
   - High-contrast, dark mode surface (`#0F172A` / `#020617`).
   - Glare-free, readable from 15–20 feet across the canteen hall.
2. **Header Bar:**
   - Campus Canteen Logo and Live Digital Clock (HH:MM:SS AM/PM).
   - Subtitle: *"Live Order Status Board"*.
3. **Dual-Zone Split Layout:**
   - **Left Zone — PREPARING (In Kitchen):**
     - Section Header: Amber/Gold theme (`#F59E0B`) with an animated chef/flame icon.
     - Grid of large token badges currently in *Preparing* status.
     - Typography: Extra bold, 48px–64px token numbers (e.g., `#041`, `#043`, `#044`).
   - **Right Zone — READY TO COLLECT (Pick Up at Counter):**
     - Section Header: Radiant Emerald theme (`#10B981`) with a bell/star icon.
     - Grid of high-visibility token badges currently in *Ready* status.
     - Typography: Massive 64px–80px token numbers with glowing borders.
4. **5-Second Blinking Animation for Newly Ready Tokens:**
   - When an order transitions from *Preparing* to *Ready*, its token card enters the Ready zone with a pulsing glow and blink animation for exactly 5 seconds to catch student attention.
5. **Footer Ticker:** Running marquee: *"Please have your token ready at Counter 1. Canteen closes at 5:00 PM."*

---

## 6. Owner Menu Manager (`/admin`)

### 6.1 Purpose & Viewport
Administrative dashboard for the canteen manager to monitor business health, maintain menu items, adjust prices, and toggle out-of-stock items in real time.

### 6.2 Layout & UI Anatomy
1. **Daily Business Metrics Bar (4 KPI Cards):**
   - **Today's Total Orders:** Count of orders placed since 00:00 today.
   - **Today's Gross Sales:** Total revenue in ₹ for today's orders.
   - **Total Items Prepared:** Aggregate unit count of dishes prepared.
   - **Top-Selling Item:** Item name with highest sold count today (e.g., *"Masala Dosa (48 sold)"*).
2. **Menu Management Section:**
   - Search bar and category filter.
   - Action Button: **"+ Add New Food Item"** (triggers creation modal).
3. **Menu Item Data Table / Card View:**
   - Columns: Image, Food Name, Category, Price (₹), Veg/Non-Veg tag, Stock Toggle, Actions (Edit / Delete).
   - **Sold-Out Toggle Switch:** Interactive toggle switch. When turned off, instantly marks item as sold out in the database, automatically updating the Student Menu and warning active cart owners.
   - **Quick Price Edit:** Inline or modal editing to modify menu prices.
4. **Add / Edit Item Modal Form:**
   - Item Name, Category, Price in ₹, Dietary Type, Description, Image URL with preset food options and validation.

---

## 7. Development-Only Demo Controls (`/dev` or floating bar)

### 7.1 Architecture & Production Guard
- **Strict Environment Isolation:** Visible and active ONLY when `import.meta.env.DEV === true`. Completely omitted and inert in production builds.
- **Virtual Time Simulation:** Allows developer/evaluator to test:
  1. *Normal Operating Hours* (e.g. 12:30 PM).
  2. *Cutoff Warning Time* (4:46 PM — triggers closed banner & disables order placement).
  3. *Overdue Order Generator* (Injects a test order placed 16 minutes ago to verify the Kitchen Board overdue alert).
- **Zero Clock Mutation:** Never modifies the host machine's system time or `window.Date`. Operates strictly via a virtual offset in `SimulationContext`.
