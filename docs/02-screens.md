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
- **Purpose:** Primary digital menu catalog allowing students and staff to browse freshly prepared Indian canteen food, filter by category and dietary preference, search dishes, and add items to an active order tray.
- **Mobile Viewport (390px):** Single-column stacked food cards, touch targets $\ge 44\text{px}$, sticky bottom floating cart summary with `pb-28` page padding so cards are never obscured.
- **Desktop Viewport (1024px+):** 3-4 column grid, sticky top navbar with active operational hours badge and direct cart link.

### 1.2 Layout & UI Anatomy
1. **Header & Brand Bar:**
   - Canteen branding (*"Campus Canteen Queue"*), operating hours indicator badge (*"Open • Orders accepted till 4:45 PM"*), and quick navigation link to `/cart` with an active item count badge.
2. **Operational Notice Banner:**
   - Real-time notice dynamically displayed if virtual/canteen time is $\ge$ 4:45 PM (*"Orders for today are closed (Cutoff 4:45 PM). Canteen closes at 5:00 PM."*).
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

### 1.3 Button Actions & Interaction State Table
| Button / Control | Trigger Condition | Action Executed | Disabled State / Guards | Feedback & Visual State |
| :--- | :--- | :--- | :--- | :--- |
| **"+ Add"** | Cart qty = 0 and item available | Adds 1 unit of product to cart; transforms button into inline stepper `[ - ] [ 1 ] [ + ]`. | Disabled if `is_available === false` (shows "Unavailable") or if past 4:45 PM cutoff (shows "Orders Closed"). | Active scale bounce (95%), cart badge increments. |
| **Stepper "[ + ]"** | Cart qty $\ge 1$ | Increments item quantity by 1 in cart and recalculates subtotal. | Disabled when item quantity reaches **10 units** (max limit). | Opacity 50%, cursor not-allowed at 10. |
| **Stepper "[ - ]"** | Cart qty $\ge 1$ | Decrements item quantity by 1. If decremented from 1, removes item and reverts to "+ Add". | None (always active if qty $\ge 1$). | Active scale bounce (90%), instant count update. |
| **Category Pill Tabs** | User taps category | Filters visible food cards to selected category (*All*, *Snacks*, *Meals*, etc.). | None. | Solid orange background (`bg-canteen-500`), white text, subtle elevation. |
| **Veg / Non-Veg Filter** | User taps preference | Filters catalog by `is_veg` flag (*All*, *Pure Veg*, *Non-Veg*). | None. | Border highlight and solid pill fill. |
| **Search Clear "[ X ]"** | Search input has text | Clears search input and restores full category view. | Hidden when search input is empty. | Instant input reset. |
| **"View Cart →" (Sticky Bar)** | Cart items $> 0$ | Navigates customer to `/cart` review screen. | Hidden when cart item count is 0. | Slide-up animation from bottom; active scale 95%. |
| **Header Cart Icon** | Always visible in navbar | Navigates to `/cart`. | None. | Displays badge with count of items. |

---

## 2. Shopping Cart (`/cart`)

### 2.1 Purpose & Viewport
- **Purpose:** Review selected items, adjust quantities, reconcile real-time stock availability, input student credentials (Name and Roll Number), and place the order generating an atomic daily sequential token.
- **Mobile Viewport (390px):** Single-column stacked item rows, full-width touch form fields ($\ge 44\text{px}$ height), prominent sticky/bottom-anchored checkout CTA button.
- **Desktop Viewport (1024px+):** Centered max-3xl layout with generous whitespace, clear two-column credentials grid, and explicit bill breakdown.

### 2.2 Layout & UI Anatomy
1. **Header:** Back navigation link (`← Back to Menu`), page title: *"Review Your Order"*, and *"Clear Entire Tray"* action button.
2. **Cart Items List:**
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

### 2.3 Button Actions & Interaction State Table
| Button / Control | Trigger Condition | Action Executed | Disabled State / Guards | Feedback & Visual State |
| :--- | :--- | :--- | :--- | :--- |
| **"← Back to Menu"** | User taps link | Navigates back to `/`. | None. | Smooth route transition. |
| **"Clear Entire Tray"** | User taps action | Empties all items from the cart and resets subtotal to ₹0. | Hidden or inactive if cart already empty. | Immediately displays the Empty Cart view. |
| **Cart Stepper "[ + ]"** | Item in cart | Increases quantity by 1. | Disabled when item quantity reaches **10 units**. | Button turns gray/opacity 50% at 10 units. |
| **Cart Stepper "[ - ]"** | Item in cart | Decreases quantity by 1. If at 1, removes the item entirely. | None. | Instant subtotal recalculation. |
| **Trash Icon "[ 🗑️ ]"** | Item in cart | Immediately removes item from cart. | None. | Item row fades out; subtotal updates. |
| **"Place Order • ₹Total"** | Student clicks submit | Validates inputs, atomically generates sequential token, inserts order to Supabase/Mock, clears cart, and navigates to `/order/:id`. | Disabled if: cart is empty, student name $<2$ chars, roll number $<3$ chars, past 4:45 PM cutoff, or submission in-flight. | Shows spinner + *"Generating Token..."* while processing; active scale 99%. |

---

## 3. Order Status Screen (`/order/:id`)

### 3.1 Purpose & Viewport
- **Purpose:** Customer's real-time digital ticket and queue tracking receipt. Displays daily token number, 3-stage kitchen progress, dynamic queue wait-time estimation, and pickup alerts.
- **Mobile Viewport (390px):** Large centralized token badge, vertical/horizontal animated progress stepper, dynamic wait boxes.
- **Desktop Viewport (1024px+):** Centered max-xl receipt card with full order breakdown.

### 3.2 Layout & UI Anatomy
1. **Prominent Token Header:**
   - Massive, high-visibility Token Badge: e.g., **Token #042** in primary orange (`#F97316`).
2. **3-Stage Visual Progress Stepper:**
   - **Step 1: Placed** (Order received by system, queued for kitchen).
   - **Step 2: Preparing** (Kitchen chef has started cooking/packaging).
   - **Step 3: Ready for Pickup** (Food is waiting at the counter).
   - Stepper connects through animated progress bars with checkmarks and pulse animations on active step.
3. **Queue Wait-Time Estimator:**
   - Dynamic card displaying:
     - Orders Ahead: *"There are 3 orders ahead of you."*
     - Estimated Wait: *"~15 mins"* ($\approx 5\text{ min per order ahead}$).
     - Automatically recalculates in real time as preceding orders move forward.
4. **Collection Alert Banner:**
   - When order reaches **Ready** status:
     - Radiant emerald gradient banner with celebration burst (confetti animation).
     - Headline: *"Your order is Ready for Collection!"*
     - Prompt: *"Please proceed to Counter 1 with Token #042."*
5. **Order Summary Card:**
   - Student Name & Roll Number, order timestamp, item checklist, and total paid/due in ₹.
6. **Footer Navigation:** Link: *"Order Another Item"* navigating back to `/`.

### 3.3 Button Actions & Interaction State Table
| Button / Control | Trigger Condition | Action Executed | Disabled State / Guards | Feedback & Visual State |
| :--- | :--- | :--- | :--- | :--- |
| **"Order Another Item"** | User taps link | Navigates back to Student Menu (`/`) allowing another order to be built. | None. | Navigates to `/` preserving previous order in history. |
| **Live WebSocket Listener** | Real-time event received | Automatically advances stepper from *Placed* $\to$ *Preparing* $\to$ *Ready* $\to$ *Collected*. | Passive real-time driver. | Confetti burst triggers on transition to *Ready*; wait time counts down. |

---

## 4. Kitchen Board (`/kitchen`)

### 4.1 Purpose & Viewport
- **Purpose:** Fast-paced operational Kanban console for kitchen prep cooks and counter staff to manage incoming tickets, advance preparation status forward, and spot overdue tickets.
- **Tablet (768px+) & Desktop:** 3-column Kanban layout (*New*, *Preparing*, *Ready*) showing active ticket counts and elapsed timers.
- **Mobile (390px):** Responsive vertically stacked Kanban columns with sticky column headers.

### 4.2 Layout & UI Anatomy
1. **Kitchen Operations Header:**
   - Active orders counter: *"12 Active Tickets"*.
   - Audio alert toggle button (chime on new incoming ticket).
   - Live digital clock and operational status indicator.
2. **3-Column Kanban Board:**
   - **Column 1: New / Placed (Orange Theme):** Incoming tickets awaiting cooking.
   - **Column 2: Preparing (Amber Theme):** Tickets currently on stoves/prep tables.
   - **Column 3: Ready (Emerald Green Theme):** Food ready at counter waiting for student token pickup.
3. **Kitchen Ticket Card Anatomy:**
   - Token Number (`#042`), Student Name, Roll No.
   - Running elapsed timer (`04m ago`).
   - 15-Minute Overdue Warning badge: flashes amber-red (`⚠️ Overdue (>15m)`) for unfulfilled orders $>15$ minutes old.
   - Item checklist with large quantity badges (`[ 2x ] Masala Dosa`).
4. **Strict Progression Guardrail:**
   - Cards move strictly forward: $\text{New} \to \text{Preparing} \to \text{Ready} \to \text{Collected}$.
   - Backward transitions are completely blocked.

### 4.3 Button Actions & Interaction State Table
| Button / Control | Trigger Condition | Action Executed | Disabled State / Guards | Feedback & Visual State |
| :--- | :--- | :--- | :--- | :--- |
| **"Start Preparing →"** | Ticket is in New column | Advances order status to `preparing`; shifts ticket to Preparing column; broadcasts WebSocket event to display and student. | Disabled while request is in flight (`isUpdating`). | Card shifts smoothly to column 2; button label changes to *"Updating..."*. |
| **"Mark Ready for Pickup →"** | Ticket is in Preparing column | Advances order status to `ready`; shifts ticket to Ready column; triggers 5-second pulse on TV display and confetti on student phone. | Disabled while request is in flight. | Card shifts to column 3; sound/event broadcast. |
| **"Mark Collected ✓"** | Ticket is in Ready column | Transitions status to `collected`; archives ticket from active Kanban board and TV display. | Disabled while request is in flight. | Ticket clears from board; metrics update. |
| **"Audio Chime Toggle"** | User taps toggle | Toggles audio notification ON/OFF for incoming tickets. | None. | Emerald badge when ON, muted stone badge when OFF. |

---

## 5. Now Serving Display (`/display`)

### 5.1 Purpose & Viewport (1920×1080 TV Standard)
- **Purpose:** High-visibility, overhead digital signage board for cafeteria TV monitors. Readable from 15–20 feet away.
- **Widescreen 1920×1080 Landscape:** Dark surface (`#0F172A` / `#020617`), extra-large high-contrast token numbers (48px–72px), dual split view (*Preparing in Kitchen* vs. *Ready for Pickup*).
- **Mobile/Responsive:** Gracefully scales to fit any screen resolution with responsive flexbox/grid.

### 5.2 Layout & UI Anatomy
1. **Header Bar:** Campus Canteen Queue branding, Live Digital Clock (HH:MM:SS AM/PM), and "Live Status" badge.
2. **Dual-Zone Split Layout:**
   - **Left Zone — PREPARING (In Kitchen):** Amber/Gold theme, grid of large token badges currently cooking.
   - **Right Zone — READY TO COLLECT (Counter 1):** Radiant emerald theme, large glowing token badges.
3. **5-Second Blinking Animation for Newly Ready Tokens:**
   - When an order transitions to `ready`, its card blinks and pulses with an emerald glow (`animate-ready-blink`) for exactly 5 seconds to catch student attention.
4. **Footer Ticker:** Running information marquee reminding students to have tokens ready at Counter 1.

### 5.3 Button Actions & Interaction State Table
| Element / Control | Trigger Condition | Action Executed | Disabled State / Guards | Feedback & Visual State |
| :--- | :--- | :--- | :--- | :--- |
| **Passive TV Board** | Real-time WebSocket push | Token cards enter/exit Preparing and Ready zones automatically without human interaction. | Read-only screen (no buttons to click). | Large 5-second pulsing glow animation on newly ready tokens. |

---

## 6. Owner Menu Manager (`/admin`)

### 6.1 Purpose & Viewport
- **Purpose:** Comprehensive administrative console for the canteen manager to monitor daily sales metrics, maintain food items, adjust prices, and toggle out-of-stock items in real time.
- **Desktop (1024px+) & Tablet:** Full tabular management view with modal editing and 4 KPI overview cards.
- **Mobile (390px):** Responsive card list view with touch toggle switches.

### 6.2 Layout & UI Anatomy
1. **Daily Business Metrics Bar (4 KPI Cards):**
   - **Today's Total Orders:** Count of orders placed since 00:00 today.
   - **Today's Gross Sales:** Total revenue in ₹ for today's orders.
   - **Total Items Prepared:** Aggregate unit count of dishes prepared.
   - **Top-Selling Item:** Item name with highest sold count today (e.g., *"Masala Dosa (48 sold)"*).
2. **Menu Management Catalog Table:**
   - Columns: Image, Food Name, Category, Price in ₹, Veg/Non-Veg badge, Availability Switch, Actions (Edit / Delete).
3. **Add / Edit Food Item Modal:**
   - Fields: Item Name, Category (Snacks, Meals, Beverages, Desserts), Price (₹), Dietary Type (Veg/Non-Veg), Description, Image URL.

### 6.3 Button Actions & Interaction State Table
| Button / Control | Trigger Condition | Action Executed | Disabled State / Guards | Feedback & Visual State |
| :--- | :--- | :--- | :--- | :--- |
| **"+ Add New Food Item"** | Manager clicks button | Opens item creation modal with empty form fields. | None. | Modal slides in over dark backdrop. |
| **"Available / Sold Out" Toggle** | Manager clicks switch | Flips `is_available` boolean in database; broadcasts event to Student Menu (disabling card) and active carts (evicting item). | Disabled while toggle mutation in flight. | Emerald "Available" flips to Red "Sold Out"; instant visual indicator. |
| **Edit Icon "[ ✏️ ]"** | Manager clicks on row | Opens modal pre-populated with item details for editing price, category, name, or image. | None. | Pre-fills form fields in modal. |
| **Delete Icon "[ 🗑️ ]"** | Manager clicks on row | Confirms with manager (`window.confirm`) and deletes item from menu catalog. | None. | Row removes from catalog; broadcast event dispatched. |
| **Modal "Save / Update Item"** | Form submitted | Validates required fields, persists changes to database, closes modal, and refreshes catalog. | Disabled if name or price missing or while saving. | Spinner shown; modal closes on success. |
| **Modal "Cancel" / "[ X ]"** | Manager clicks cancel | Discards unsaved changes and closes modal. | None. | Modal closes immediately. |

---

## 7. Development-Only Demo Controls (`/dev` or top bar)

### 7.1 Architecture & Production Guard
- **Strict Environment Isolation:** Visible and active ONLY when `import.meta.env.DEV === true`. Completely omitted and inert in production builds.
- **Virtual Time Simulation:** Allows developer/evaluator to test:
  1. *Normal Operating Hours* (12:30 PM — open).
  2. *Cutoff Warning Time* (4:46 PM — triggers closed banner & disables order placement).
  3. *Closed Hours* (5:30 PM — closed).
  4. *Overdue Order Generator* (Injects a test order placed 16 minutes ago to verify the Kitchen Board overdue alert).
- **Zero Clock Mutation:** Never modifies the host machine's system time or `window.Date`. Operates strictly via a virtual offset in `SimulationContext`.
