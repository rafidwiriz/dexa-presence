# Master Plan — Dexa Presence

Fullstack Web Technical Test for Dexa Group. Source spec: `docs/requirements.md`
(extracted from `docs/(51) Dexa Group - Fullstack Web Technical Test.pdf`).

## Goal

Two responsive web applications (WFH attendance for employees, monitoring for HRD
admins) sharing a NestJS microservices REST API. Completed in **3–4 days (max 5)**.

## Phases

| # | Phase | Deliverables | DoD |
|---|---|---|---|
| 0 | Requirements & docs | `docs/requirements.md`, `docs/architecture.md`, `docs/data-model.md`, `docs/api-contracts.md` | Spec extracted and contracts agreed |
| 1 | Scaffold | `apps/api` (NestJS monorepo), `apps/web` (React/Vite) | `npm run start:dev` runs; health route returns 200 |
| 2 | Infra | `docker/compose.yml` (postgres + rabbitmq) | `make db` starts both; healthchecks pass |
| 3 | DB schema | Entities + migrations (main DB + audit log DB) | Migrations apply cleanly from scratch |
| 4 | API microservices | auth, employee, attendance, profile-audit services + queue + SSE | CRUD verified via curl; audit events land in log DB; admin notified on profile edit |
| 5 | Frontend apps | absensi (login, profil, absen, summary) + monitoring (CRUD employee, read-only absensi) | All flows work against the API end-to-end in browser |
| 6 | Hardening | Auth guards, validation, env var wiring, README runbook | `make up` from clean state with zero manual steps |

## Definition of Done (project)

- [ ] Two frontends + one API, all consuming the same REST API (no duplicate endpoint logic).
- [ ] Employee: login → view/edit profile (photo, phone, password) → check-in/out → summary with date-range filter.
- [ ] Admin (HRD): add/update employee data; view all attendance (read-only).
- [ ] Profile change triggers: (1) notification on admin page (SSE — D-004),
  (2) RabbitMQ event logged to a **separate** database.
- [ ] Stack pinned (see `docs/conventions.md`); no secrets baked into source or images.
- [ ] Responsive on browser and mobile.

## Known risks

- Timebox (3–4 days): keep scope tight; reuse patterns, not code.
- Notification (SSE) + RabbitMQ add moving parts — implement after core CRUD works.
- Two databases (main + audit) — keep connection/queue config env-driven.

## Timeline

- Day 1: Phases 1–3 (scaffold + infra + schema).
- Day 2: Phase 4 (API + queue + SSE).
- Day 3: Phase 5 (frontends).
- Day 4: Phase 6 (hardening, polish, runbook). Buffer to Day 5 if needed.

## Deadline tracking

- **Deadline:** Oct 6, 2026, 08:00.
- Checkpoint (2026-10-02 16:55): backend ~90% done (auth, employees CRUD, photo,
  attendance, profile-audit/RabbitMQ). Remaining: notifications (SSE/Firebase),
  frontend apps, hardening. On track — ~87h left, ~55% done.

| Checkpoint | Elapsed | Remaining | Progress | Status |
|---|---|---|---|---|
| 2026-10-02 16:55 | ~2 days | ~3.6 days | ~55% | 🟢 on track |
| 2026-10-02 late | ~2 days | ~3.5 days | ~60% | 🟢 backend complete (auth, employees, photo, attendance, profile-audit, notifications/SSE); frontend is the big remaining block |
| 2026-10-02 23:45 | ~2 days | ~3.5 days | ~62% | 🟢 backend **verified running**: infra up (postgres+rabbitmq), API boots, seeded admin+employee, smoke-tested login/CRUD/attendance/SSE/RMQ→audit DB. Missing deps fixed (`@nestjs/microservices`, `amqplib`, `amqp-connection-manager`). Found hardening issues: `password_hash` leaked in responses, admin attendance list returns `employee:null` |
| 2026-10-03 11:37 | ~2 days | ~2.8 days | ~66% | 🟢 **absensi app done**: scaffold (Vite+React+Tailwind D-016), login, profil (view + edit phone/photo/password), absen, summary with date filter; CORS fixed (D-017), tz-aware summary fixed (D-018). Remaining (largest first): monitoring app (employees CRUD + read-only attendance), profile-update notification on admin page, hardening (password_hash leak, employee:null relation, CORS origin restrict, migrations, exact pinning, runbook) |
| 2026-10-03 16:28 | ~2 days | ~2.6 days | ~85% | 🟢 **both frontends done**: monitoring app (login + admin role-gate, employees CRUD with modal, read-only attendance, SSE profile-update toasts). Fixed attendance→employee relation (D-019, orphan `employeeId` column removed). Remaining: hardening (password_hash leak, CORS origin restrict, exact version pinning, migrations, index, runbook) + user frontend feedback |