# prompts.md — Chronological Record of User Prompts
**Project:** Canteen Menu & Order Queue System (MSc IT Vibe Coding Lab Project)

This document records the exact user prompts executed during the planning, architecture refinement, documentation audit, and complete implementation stages in strict chronological order.

---

### Prompt 1: Initial Discovery & Planning Mandate
**Date/Time:** 2026-11-24 21:41:39 IST  
**Prompt:**
```text
This first prompt is deliberately designed to make the agent understand the assignment, create the four required planning documents, and wait before coding.
```
**Outcome:**
The agent inspected the repository, retrieved project requirements, created `AGENTS.md`, `docs/01-brief.md`, `docs/02-screens.md`, and `docs/03-flows-rules.md`, and paused without generating application code.

---

### Prompt 2: Formal Assignment Specification Submission
**Date/Time:** 2026-11-24 21:48:27 IST  
**Prompt:**
```text
# PROJECT: CANTEEN MENU & ORDER QUEUE SYSTEM

You are my senior full-stack developer, UI/UX designer, and software testing engineer.

I am building a college MSc IT Vibe Coding Lab project. The project is a Canteen Menu & Order Queue System.

Your responsibility is to help me build a complete, professional, attractive, responsive, and fully functional web application that follows my assignment requirements exactly.

## 1. First understand the assignment
... [Full assignment specification detailing 6 screens, tech stack, design requirements, functional requirements, business rules, documentation requirements, quality requirements, and phased working procedure] ...
```
**Outcome:**
Git repository was initialized, the planning documents were committed to Git, and a comprehensive `project_plan_and_architecture.md` artifact was authored. The agent paused to await user approval.

---

### Prompt 3: Architecture Approval with 8 Non-Negotiable Safety Conditions
**Date/Time:** 2026-11-24 21:51:49 IST  
**Prompt:**
```text
Thank you for completing the documentation and initial Git setup.

I approve the overall proposed architecture direction, including:

1. Dual-mode data layer (local mock + Supabase).
2. Demo time and overdue-order simulation.
3. Food images with SVG fallbacks.

However, before proceeding to Stage 1, please address these conditions:

- Ensure mock mode and Supabase mode follow exactly the same business rules.
- Ensure production mode never silently falls back to mock data.
- Demo controls must not modify the actual system clock or bypass business rules.
- Demo controls should be disabled in production by default.
- Ensure real-time updates work across separate browser windows.
- Ensure daily token generation is safe against concurrent order submissions.
- Ensure all Supabase credentials are handled securely.
- Ensure the application remains usable on a 390px mobile screen.

Do not generate application code yet.

Please wait for my final approval after the planning documents and project_plan_and_architecture.md have been reviewed.
```
**Outcome:**
All 8 safety conditions were incorporated across all 4 planning documents and the architecture artifact:
- Defined strict parity contract (`dataAdapter.js`).
- Implemented Fail-Fast production guard.
- Designed isolated `SimulationContext` (no clock mutation).
- Added Web `BroadcastChannel` API for multi-window real-time synchronization in mock mode.
- Designed transactional row locking in PostgreSQL (`SELECT ... FOR UPDATE` on `daily_sequences`).
- Validated mobile-first 390px viewport constraints.
Committed changes to Git and paused for final approval.

---

### Prompt 4: Full Authorization to Build Application
**Date/Time:** 2026-11-24 21:57:34 IST  
**Prompt:**
```text
approved now  make a whole project not wait for any permission of me
```
**Outcome:**
The entire application was built end-to-end:
- Initialized React 18, Vite 5, Tailwind CSS, Lucide React, and React Router DOM.
- Created `supabase/schema.sql` (tables, atomic `create_canteen_order` RPC, RLS policies, 16 seed Indian canteen items).
- Implemented `client.js`, `mockAdapter.js` (with BroadcastChannel and localStorage), `supabaseAdapter.js`, `menuService.js`, and `orderService.js`.
- Implemented all contexts: `CartContext`, `MenuContext`, `OrderContext`, `SimulationContext`.
- Implemented all 6 screens (`StudentMenu`, `ShoppingCart`, `OrderStatus`, `KitchenBoard`, `NowServing`, `AdminManager`).
- Verified `npm run build` with zero errors.
- Created automated test suite `scripts/verify-all.js` (36 assertions, 14 test checklist items, all passing).
- Committed the complete project to Git.

---

### Prompt 5: Run Project Command
**Date/Time:** 2026-11-24 22:59:36 IST  
**Prompt:**
```text
run the project
```
**Outcome:**
Launched the Vite development server in daemon mode on `http://localhost:3000/`. Confirmed active status and provided direct URL access. Attempted browser preview via browser subagent (logged remote debugging port notice).

---

### Prompt 6: Documentation Audit Against 9 Review Checkpoints
**Date/Time:** 2026-11-24 23:02:30 IST  
**Prompt:**
```text
Read AGENTS.md and all three files inside docs/.

Review them against the assignment requirements.

Check:
1. All six screens are included.
2. Every screen has its URL, purpose and functionality.
3. All button actions are explained.
4. Mobile and desktop layouts are specified.
5. All order status transitions are correct.
6. Token generation rules are clear.
7. Sold-out and canteen-closed cases are covered.
8. The test checklist has at least 8-12 tests.
9. There are no conflicting requirements.

Identify missing or unclear requirements and correct the documents.

Do not write application code yet.

Show me a summary of the final documents.
```
**Outcome:**
Read all 4 files. Enhanced [docs/02-screens.md](docs/02-screens.md) with comprehensive "Button Actions & Interaction State Tables" for all 6 screens detailing triggers, disabled states, and visual feedback. Fixed checklist reference in [AGENTS.md](AGENTS.md) to match the 14-test matrix. Unified the wait-time formula. Re-verified all 14 tests passing. Committed updates to Git (`master 0abd9eb`).

---

### Prompt 7: Complete Project Implementation Master Prompt
**Date/Time:** 2026-11-24 23:06:19 IST  
**Prompt:**
```text
# COMPLETE PROJECT IMPLEMENTATION — CANTEEN MENU & ORDER QUEUE SYSTEM

Act as a senior full-stack developer, UI/UX designer, database architect, and QA engineer.

I have already completed the project analysis, initialized Git, and created the following documentation:

- AGENTS.md
- docs/01-brief.md
- docs/02-screens.md
- docs/03-flows-rules.md
- project_plan_and_architecture.md

Your task is to IMPLEMENT THE ENTIRE APPLICATION, not just create a plan or scaffold.

I have limited time, so work independently and complete all implementation stages in this task. Do not stop after creating the frontend or ask me for approval between individual stages.
... [Full master prompt with 11 exhaustive implementation, database, business rule, UI/UX, routing, testing, documentation, Git, and deployment sections] ...
```
**Outcome:**
Executed all master prompt mandates:
- Verified strict Asia/Kolkata timezone support across `useCanteenHours.js`, `mockAdapter.js`, and `formatters.js`.
- Added `vercel.json` for seamless client-side SPA routing on Vercel deployment.
- Enhanced test runner `scripts/verify-all.js` to explicitly validate all 20 test points specified in Section 7.
- Authored `prompts.md` recording all user prompts chronologically.
- Updated `README.md` with complete documentation, live demo guidelines, and Supabase integration instructions.
- Verified production build (`npm run build`).
- Committed all files to Git with descriptive commits.
