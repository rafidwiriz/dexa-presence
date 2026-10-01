# Decision Log

ADR-style. Format: date · decision · context · consequence.

## D-001 · Monorepo layout `apps/api` + `apps/web`
- **2026-10-01**
- One repo with NestJS API and React/Vite web, mirroring the test's two-app/one-API
  requirement.
- Single version control, shared conventions; frontends share one codebase with two
  route trees.

## D-002 · Database: PostgreSQL
- **2026-10-01**
- Spec says choose one of MySQL/Oracle/MongoDB/SQL Server/PostgreSQL. Chose PostgreSQL
  for local dockerized dev, JSONB support, and TypeORM maturity.
- Easy to swap; connection string is env-driven.

## D-003 · Queue: RabbitMQ
- **2026-10-01**
- Spec requires a stream/queue to a separate audit DB. Chose RabbitMQ (dockerized,
  no cloud account), over Kafka (heavier) and AWS SQS/GCP Pub-Sub (cloud accounts).

## D-004 · Notification: SSE (DEFERRED — pending user preference)
- **2026-10-01** (opened); **deferred 2026-10-01** — user unfamiliar with SSE; PDF names
  Firebase. No change to D-004 until user picks between SSE and Firebase.
- Spec allows any technology for the admin-page alert on profile change ("bisa
  menggunakan Firebase atau yang lainnya").
- Candidate A — **SSE**: browser-native `EventSource`, zero external dependency, ~10
  lines in NestJS (`@Sse()` route). Enough for "a profile change happened" alert.
- Candidate B — **Firebase** (Realtime DB or FCM): the tech the PDF names; more
  powerful, but needs a Firebase project + API keys in `.env` (external account).
- **Open question:** pick A or B when we reach the notification feature. Deferred so
  backend work is not blocked. Also considered: WebSocket (bidirectional, overkill).

## D-005 · Microservices = NestJS modules behind one REST gateway
- **2026-10-01**
- Spec: "create API with microservices concept (REST API)". Implemented as NestJS
  modules (auth, employee, attendance, notifications, profile-audit) in one process
  exposing a single REST API, each with a clear service boundary.
- Avoids premature process split within the 3–4 day budget; boundary preserved so a
  future split (separate services + gateway) is mechanical.

## D-006 · Two separate databases
- **2026-10-01**
- Spec: log profile changes to a **separate** database via queue. Main DB `dexa_presence`
  + audit DB `dexa_audit`, separate TypeORM connections.

## D-007 · Role model `employee` / `admin`
- **2026-10-01**
- Attendance app is employee-facing; monitoring app is admin/HRD. JWT carries role;
  guards scope access.

## D-008 · Accept npm audit findings on Nest 10 scaffold
- **2026-10-01**
- `npm audit` on the Nest 10 scaffold reports 24 vulns (4 low, 13 moderate, 7 high).
  `npm audit fix` clears nothing; `--force` requires major upgrade to Nest 12
  (breaking: `@nestjs/config@3`/`@nestjs/typeorm@10` compatibility, CLI pins).
- Classification: the 7 high + most moderate are **dev dependencies**
  (`@nestjs/cli`, webpack, tmp, ajv, inquirer) — build-time only, not shipped.
  Runtime advisories (`@nestjs/core` injection via platform-express, body-parser DoS,
  qs DoS, uuid) are **moderate/low** and only patchable via Nest 12.
- Consequence: keep Nest 10 for the test; re-evaluate on any real deployment. If a
  clean audit is required later, migrate to Nest 12 **before** writing app code.

## D-009 · Employee update: PATCH only (no PUT)
- **2026-10-01**
- Employee edits are inherently partial (name, position, phone, role) — PATCH covers
  them; PUT (full replace) has no use case in this app. Kept PATCH only to avoid a
  dead route + full-replace DTO (YAGNI).
- Contract `docs/api-contracts.md` updated to drop the `PUT /employees/:id` row.

## D-010 · Profile edit authorization (self vs admin)
- **2026-10-01**
- Per PDF: an employee may update **only** their own photo, phone number, and password.
  All other employee fields (name, position, role, company_email) are **admin-only**.
- Rules:
  - `PATCH /employees/:id` — admin: any field, any employee. Employee (self): only
    `phone` and `photo_url`; other fields → 403.
  - `PATCH /employees/:id/password` — self (or admin reset).
  - `POST` / `DELETE /employees/:id` — admin only.
  - `GET /employees` (list) — admin only. `GET /employees/:id` — self or admin.
- Implemented via `JwtAuthGuard` (all routes) + `RolesGuard`/`@Roles(ADMIN)` (admin
  routes) + field-level allowlist for self-update.

## Open decisions (to be made during implementation)
- CSS framework for the frontends (Tailwind recommended, to record here).
- Photo storage: local upload dir vs object storage (local for the test).
- NestJS layout: single app with modules vs monorepo `apps/`+`libs/`.
