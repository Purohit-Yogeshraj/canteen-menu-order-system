# PROMPT HISTORY
## Canteen Menu & Order Queue System

**Project:** Canteen Menu & Order Queue System  
**Academic Context:** MSc IT Vibe Coding Lab Project  
**Author:** Purohit Yogeshraj Bhanwarlal (Enrollment No.: 202612091)  
**Development Tool:** Google Antigravity  
**Framework:** React 18 + Vite  
**Styling:** Tailwind CSS  
**Database:** Supabase (PostgreSQL + Realtime) with Local BroadcastChannel Mock Adapter  
**Version Control:** Git & GitHub  
**Deployment Platform:** Vercel  

This document records the exact prompts executed during the planning, architecture refinement, documentation audit, implementation, and verification stages in strict chronological order.

---

## Prompt 1: Initial Project Analysis and Documentation

I asked Google Antigravity to act as a senior software developer, UI/UX designer, and software testing engineer to analyze the Canteen Menu & Order Queue System requirements.

The agent was instructed to:
- Understand all assignment requirements.
- Inspect the existing repository.
- Create `AGENTS.md`.
- Create `docs/01-brief.md`.
- Create `docs/02-screens.md`.
- Create `docs/03-flows-rules.md`.
- Prepare the project architecture and implementation roadmap.
- Initialize Git version control.
- Avoid generating application code before documentation approval.

**Outcome:** The agent analyzed the project, initialized Git, created the four required planning documents, and committed them to the repository without generating application code.

---

## Prompt 2: Architecture Review & Safety Guardrails Mandate

I reviewed the initial planning documents and approved the architecture direction (dual-mode data layer, simulation controls, and food images with SVG fallbacks), but specified eight strict safety conditions that had to be addressed before coding could begin:
- Mock mode and Supabase mode must follow the exact same business rules.
- Production mode must never silently fall back to mock data.
- Demo controls must not modify the host system clock or bypass business rules.
- Demo controls must be disabled in production by default.
- Real-time updates must work across separate browser windows.
- Daily token generation must be safe against concurrent order submissions.
- All Supabase credentials must be handled securely with Row Level Security (RLS).
- The application layout must be guaranteed usable on a 390px mobile screen.

**Outcome:** The agent incorporated all eight safety invariants into `AGENTS.md`, `docs/01-brief.md`, `docs/02-screens.md`, `docs/03-flows-rules.md`, and the `project_plan_and_architecture.md` artifact, and committed the updates to Git.

---

## Prompt 3: Full Application Implementation Authorization

I authorized Google Antigravity to proceed with building the entire application without stopping for permission between stages.

The agent was instructed to:
- Implement all six application screens (`/`, `/cart`, `/order/:id`, `/kitchen`, `/display`, `/admin`).
- Implement the database schema (`supabase/schema.sql` and `supabase/rls_policies.sql`).
- Implement the dual-mode data layer (`mockAdapter.js` using the Web `BroadcastChannel` API and `supabaseAdapter.js`).
- Implement state contexts and custom hooks (`useCanteenHours.js`, `CartContext`, `MenuContext`, `OrderContext`, `SimulationContext`).
- Implement all business rules: forward-only status flow, max 10 units, 4:45 PM cutoff, and dynamic wait times.
- Test the application and verify the production build.

**Outcome:** The agent generated all application components, pages, and services, confirmed that `npm run build` compiled with zero errors, executed an automated verification runner, and committed the codebase to Git.

---

## Prompt 4: Running the Application Locally

I instructed Google Antigravity to start and run the application.

**Outcome:** The agent started the Vite development server in daemon mode on `http://localhost:3000/`. A browser subagent was dispatched to preview the application; the subagent logged that Chrome remote debugging was not active, and the agent reported the active localhost URL for manual browser interaction.

---

## Prompt 5: Documentation Audit Against 9 Quality Criteria

I instructed Google Antigravity to read `AGENTS.md` and all three files in `docs/` and review them against nine specific criteria:
1. All six screens included.
2. Every screen has URL, purpose, and functionality.
3. All button actions explained.
4. Mobile and desktop layouts specified.
5. All order status transitions correct.
6. Token generation rules clear.
7. Sold-out and canteen-closed cases covered.
8. Test checklist has at least 8–12 tests.
9. No conflicting requirements.

**Outcome:** The agent audited all documentation files, added comprehensive "Button Actions & Interaction State Tables" to `docs/02-screens.md` for all six screens, unified the wait-time formula across files, aligned the QA checklist count to 14 tests, and committed the changes to Git.

---

## Prompt 6: Master Specification Implementation & Verification

I submitted the master project prompt detailing all requirements, invariants, database architecture, timezone rules (`Asia/Kolkata`), testing requirements (20 verification points), and deployment guidelines.

The agent was instructed to:
- Enforce strict `Asia/Kolkata` timezone across operating hours and token resets.
- Add `vercel.json` for client-side SPA routing.
- Implement an automated 20-point test runner (`scripts/verify-all.js`).
- Author `prompts.md` and update `README.md`.
- Verify production compilation (`npm run build`).
- Commit all changes to Git.

**Outcome:** The agent implemented strict `Asia/Kolkata` time formatting in `useCanteenHours.js` and `mockAdapter.js`, added `vercel.json`, expanded `scripts/verify-all.js` (29 assertions, all passing), updated `README.md`, verified production build, and committed to Git.

---

## Prompt 7: Final Documentation Review and Consistency Check

I instructed Google Antigravity to review `README.md`, `prompts.md`, and `reflection.md` for formatting, spelling, and consistency with existing documentation, preserve the original planning documents, avoid inventing URLs or experiences, and commit all completed documentation to Git.

**Outcome:** The agent audited all three files, verified spelling and markdown formatting, cross-referenced with `AGENTS.md` and `docs/`, ensured proper author attribution and Git inclusion, and committed the documentation.

---

## Prompt 8: Staff and Admin Password Protection & Dynamic Navigation

I instructed Google Antigravity to implement password protection for kitchen staff and admin screens so that students and unauthorized visitors cannot access or alter internal views, and to dynamically display staff links (`Kitchen Board` and `Now Serving TV`) when logged in as staff, and admin links (`Menu Manager`, `Kitchen Board`, and `Now Serving TV`) when logged in as admin.

The agent was instructed to:
- Protect `/kitchen`, `/admin`, and `/display` with role-based passwords.
- Provide a clean authentication context (`AuthContext.jsx`) and protected route wrapper (`ProtectedRoute.jsx`).
- Update `Navbar.jsx` so students see only `Menu` and `Cart`, while authenticated staff and admins see their respective operational links.
- Provide demo passwords (`staff123` and `admin123`) for seamless academic evaluation.
- Add login and logout controls across desktop and mobile navigation.

**Outcome:** The agent implemented `AuthContext.jsx`, `ProtectedRoute.jsx`, `LoginModal.jsx`, and dynamic navigation in `Navbar.jsx`, verified compilation and QA tests (all 29 passing), and committed the updates to Git.

---

## Failed Prompts, Unexpected Behaviors, and Corrections

| # | Stage | Issue / Challenge Encountered | Correction Applied |
|---|---|---|---|
| **1** | Architecture Planning | Initial architecture relied on a standard mock store that did not synchronize across separate browser windows without manual refresh. | User mandated cross-window synchronization; agent implemented the Web `BroadcastChannel` API (`canteen_realtime_bus`) backed by `window.storage` events. |
| **2** | Production Safety | Risk of production silently falling back to mock data if cloud credentials were misconfigured. | User mandated fail-fast invariant; agent implemented `ConfigErrorBanner` in `client.js` to immediately halt execution in production if keys are missing. |
| **3** | Browser Preview | Browser subagent reported `ENOENT` on `DevToolsActivePort` because Chrome remote debugging was not enabled on the host machine. | Agent recognized the headless browser constraint, confirmed the Vite server was running on `http://localhost:3000/`, and provided direct manual testing instructions. |
| **4** | Documentation Parity | QA checklist count was referenced as 12 tests in `AGENTS.md` while `docs/03-flows-rules.md` contained 14 tests. | Agent harmonized `AGENTS.md` and test scripts to explicitly reference the complete 14-test matrix. |
| **5** | Operating Hours Evaluation | Testing at night triggered the 5:00 PM closing rule, rendering items as "Orders Closed". | Agent added automatic daytime 12:30 PM simulation when real time is outside operating hours, along with one-click evaluator controls. |
| **6** | Route Access Control | Staff and admin screens were directly accessible by any user through the navigation bar without authentication. | Agent implemented role-based password protection (`AuthContext`, `ProtectedRoute`, `LoginModal`) restricting access and dynamically showing staff/admin links only upon authentication. |
