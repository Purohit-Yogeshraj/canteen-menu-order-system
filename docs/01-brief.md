# 01. Project Brief & Specifications
**Project Name:** Canteen Menu & Order Queue System  
**Academic Level:** MSc IT Vibe Coding Lab Project  
**Author/Lead:** Senior Full-Stack Developer & UI/UX Engineer  
**Date:** November 2026  

---

## 1. Executive Summary

Campus and workplace canteens face severe physical bottlenecks during peak meal hours (12:30 PM – 2:00 PM and short tea/snack intervals). Students and faculty members frequently spend up to 70% of their available break standing in cramped, disorderly physical queues just to place an order, make payment, and wait for food preparation. This inefficiency leads to lost break time, food wastage, kitchen operational chaos, and order tracking errors.

The **Canteen Menu & Order Queue System** replaces physical counter queues with a sleek, real-time digital pre-ordering and virtual queue management system. Students browse live menus, place food orders with student credentials, and receive a dedicated daily sequential token number with an accurate live wait-time estimate. Canteen kitchen staff operate a streamlined, 3-stage kitchen board, while an overhead widescreen display keeps the canteen hall informed of orders currently being prepared and orders ready for pickup.

---

## 2. Problem Statement & Value Proposition

### 2.1 The Problem
- **Crowded Counters:** Physical crowding around canteen counters prevents fast customer throughput and frustrates both students and canteen staff.
- **Order Blindness:** Students standing in line cannot anticipate whether their order will take 5 minutes or 30 minutes, leading to missed lectures or cancelled orders.
- **Kitchen Disorder:** Traditional paper slips or shouted orders result in lost tickets, incorrect preparation order, and zero visibility into overdue tickets.
- **Static Menu Inflexibility:** When ingredients run out mid-day, kitchen staff cannot quickly alert waiting customers, leading to disputes at the collection point.

### 2.2 The Solution
- **Transparent Virtual Queue:** Customers track their exact position in line with automated time estimation ($\approx 5\text{ min per preceding order}$).
- **Three-Way Real-Time Synchronization:** Orders placed on student mobile phones immediately appear on the kitchen staff dashboard and overhead canteen monitors via Supabase real-time websockets ($<5\text{s latency}$).
- **Enforced Business Guardrails:** Built-in safeguards prevent stale orders after the 4:45 PM cutoff, enforce strict forward status progression, and limit individual item quantities.
- **Dynamic Menu Management:** The canteen manager can instantly toggle out-of-stock items, adjust prices, and inspect daily sales statistics from a dedicated administrative console.

---

## 3. User Personas & Core Journeys

### Persona A: College Student (Aarav, 21 — MSc IT Student)
- **Context:** Has a 30-minute break between laboratory sessions.
- **Goal:** Order a Hot Samosa and Filter Coffee, check the queue wait time, sit comfortably with classmates, and walk to the counter only when token #042 is called.
- **Key Journey:**
  1. Opens Student Menu (`/`) on mobile phone.
  2. Filters by "Snacks" or "Vegetarian".
  3. Adds items to cart, enters Name and Roll Number.
  4. Places order, receives Token #042 on Order Status screen (`/order/:id`).
  5. Watches status transition from *Placed* to *Preparing* to *Ready*.
  6. Collects food at the pickup window.

### Persona B: Kitchen Chef / Counter Staff (Ramesh, 45 — Head Cook)
- **Context:** Operates in a hot, fast-paced kitchen handling dozens of simultaneous tickets.
- **Goal:** Clear incoming tickets sequentially, quickly identify tickets waiting over 15 minutes, and call ready tokens with a single tap.
- **Key Journey:**
  1. Views Kitchen Board (`/kitchen`) mounted on a tablet near the prep station.
  2. Sees new orders appear in the **New** column with an audible alert.
  3. Taps "Start Preparing" to shift the ticket to the **Preparing** column.
  4. Finishes cooking and taps "Mark Ready" to alert the customer and the overhead screen.
  5. Hands the tray to the student and marks "Collected".

### Persona C: Canteen Owner / Manager (Mrs. Sharma — Facility Manager)
- **Context:** Oversees daily inventory, menu pricing, and kitchen performance.
- **Goal:** Ensure smooth operations, prevent orders when ingredients run dry, and monitor daily revenue.
- **Key Journey:**
  1. Logs into Owner Menu Manager (`/admin`).
  2. Checks today’s total orders, total items sold, and top-selling food item.
  3. Toggles "Sold Out" on *Chicken Biryani* when supplies deplete.
  4. Adds a new seasonal dessert (*Gulab Jamun*) with price and category.

---

## 4. Scope, Boundaries & Exclusions

To ensure exceptional stability, zero external dependency failures, and a clean demonstration during lab evaluation, the system defines precise scope boundaries:

### In-Scope (Core Features)
- Responsive 6-screen web application (Mobile, Tablet, Desktop, 1080p TV Display).
- 15+ curated realistic Indian canteen food items with veg/non-veg indicators, categories, and real food photos.
- Cart management with quantity steppers (1–10 max cap), roll number validation, and order submission.
- Real-time order status tracking with daily sequential token numbering.
- Dynamic queue waiting time calculation.
- 3-column Kitchen Kanban with 15-minute overdue warning badges and forward-only status transitions.
- Fullscreen 1920×1080 high-contrast Now Serving TV display with 5-second pulse for ready tokens.
- Owner menu manager with CRUD, stock toggles, and daily sales metrics.
- Canteen operational hours (08:00–17:00) with strict 16:45 ordering cutoff.

### Out-of-Scope (Deliberate Non-Goals)
- **External Payment Gateways:** Razorpay/Stripe/UPI integration is excluded to avoid sandbox keys, payment failures, or bank network latency during academic grading.
- **Campus / Home Delivery:** Orders are collection-only at the canteen counter.
- **Complex Google OAuth / SMS OTP:** Replaced with lightweight, high-trust Student Name & College Roll Number entry.
- **User Reviews & Loyalty Points:** Omitted to preserve speed and avoid UI clutter.

---

## 5. Technology Stack & Deployment Architecture

```mermaid
flowchart TD
    subgraph Clients ["Client Layer (React 18 + Vite + Tailwind CSS)"]
        SM["Student Menu & Cart\n(/, /cart, /order/:id)\nMobile & Desktop"]
        KB["Kitchen Board\n(/kitchen)\nTablet & Desktop"]
        NSD["Now Serving Display\n(/display)\n1920x1080 TV Screen"]
        OMM["Owner Menu Manager\n(/admin)\nDesktop & Laptop"]
    end

    subgraph ServiceLayer ["Application Service Layer (Vite Frontend)"]
        RT["Supabase Realtime Client\n(WebSocket Subscriptions)"]
        API["Data Access Layer\n(menuService / orderService)"]
        STATE["React Context Providers\n(CartContext, OrderContext)"]
    end

    subgraph SupabaseDB ["Persistent Cloud Storage (Supabase PostgreSQL)"]
        T1[("menu_items Table")]
        T2[("orders Table")]
        T3[("order_items Table")]
        T4[("daily_metrics View / RPC")]
    end

    SM -->|Browse & Place Order| API
    OMM -->|CRUD & Stock Updates| API
    KB -->|Status Progression| API
    API -->|PostgreSQL Queries & RPC| SupabaseDB

    SupabaseDB -->|Postgres CDC Realtime Events| RT
    RT -->|WebSocket Push (< 5s)| STATE
    STATE --> SM
    STATE --> KB
    STATE --> NSD
    STATE --> OMM
```

### Stack Breakdown:
1. **Frontend Core:** React 18, Vite 5, Tailwind CSS 3.
2. **Routing:** React Router DOM v6.
3. **Icons & UI Utilities:** Lucide React, Canvas Confetti (for ready order celebration).
4. **Backend & Database:** Supabase PostgreSQL with built-in WebSocket Realtime channels for table changes (`INSERT`, `UPDATE`).
5. **Hosting:** Vercel edge deployment linked to GitHub repository.
