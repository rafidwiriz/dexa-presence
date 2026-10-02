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

## D-004 · Notification: SSE (DECIDED 2026-10-02)
- **2026-10-01** (opened, deferred); **decided 2026-10-02** — user chose **SSE**.
- Spec allows any technology for the admin-page alert on profile change ("bisa
  menggunakan Firebase atau yang lainnya").
- Chosen: **SSE** — browser-native `EventSource`, zero external dependency, no account
  or API keys (keeps the "no secrets in source" rule), fits NestJS (`@Sse()`).
  Enough for a one-way "profile change happened" alert on the monitoring app.
- Alternatives compared: Firebase (free tier, but Google account + project + keys +
  SDK on both sides); WebSocket (bidirectional — overkill for one-way alerts);
  polling (simplest but laggy/wasteful); Pusher/Ably (hosted, same friction as
  Firebase).
- Consequence: monitoring frontend subscribes to `GET /api/notifications/stream` via
  `EventSource`; backend publishes SSE events when `profile.updated` is consumed.

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

## D-011 · Time handling: UTC storage, client-local display, tz-aware summary
- **2026-10-02**
- `check_at` is server-stamped as `timestamptz` (UTC) — employees cannot fake times.
- API returns ISO 8601 UTC (`...Z`); the frontend formats to browser-local time for
  display (no server clock needed client-side).
- Summary day-grouping is **timezone-aware**: client sends `tz` (IANA name, e.g.
  `Asia/Jakarta`) as a query param; the service groups `check_at AT TIME ZONE :tz`
  so days align with the user's local day boundary, not UTC.

## D-012 · Language: English in backend code/API, Indonesian on frontend
- **2026-10-02**
- Backend (entities, variables, DTOs, API values) uses English: `CheckType.IN = 'in'`,
  `CheckType.OUT = 'out'`; summary returns `check_in`/`check_out`. Indonesian
  ("Masuk"/"Pulang") is a **frontend translation concern**.
- API contract in `docs/api-contracts.md` updated to English values.
- Future: optional i18n layer (English mode) on the frontend — deferred, not designed yet.

## D-013 · Profile audit: RabbitMQ producer/consumer in one hybrid Nest app
- **2026-10-02**
- Spec: log profile changes to a **separate** database via queue. Implemented with
  RabbitMQ: `EmployeesService` emits `profile.updated` (RMQ `ClientProxy` +
  `lastValueFrom`), a `ProfileAuditConsumer` (`@EventPattern`) writes to the
  `dexa_audit` DB via a second TypeORM connection named `audit`.
- Both producer and consumer run in the **same Nest process** (hybrid app:
  `app.connectMicroservice` + `startAllMicroservices`). Keeps the microservice
  boundary (queue decoupling) without a second process within the test budget.
- Queue is **durable** (`profile_updated`, `durable: true`) → messages survive broker
  restarts. Consumer uses at-least-once semantics: on write failure it does **not**
  ack, so RabbitMQ redelivers.
- **Publish failure is swallowed** (logged) — a queue outage never fails the HTTP
  PATCH request. Trade-off: audit event can be lost if the broker is down at publish
  time; acceptable for the test.
- Producer diff-only: `update()` compares before/after and emits only changed fields
  (`name`, `position`, `phone`, `photo_url`); no-op PATCH emits nothing.

## D-014 · Audit DB provisioning via Postgres init script
- **2026-10-02**
- `dexa_audit` is a separate database. Compose only creates `dexa_presence` via
  `POSTGRES_DB`. Added `docker/postgres/init/01-create-audit-db.sql` mounted into
  `/docker-entrypoint-initdb.d` so `dexa_audit` is created automatically on **fresh**
  Postgres volume.
- Caveat: init scripts run only on a fresh volume. If the `postgres_data` volume
  already exists, drop it (`docker compose down -v`) or create `dexa_audit` manually.

## Open decisions (to be made during implementation)
- CSS framework for the frontends (Tailwind recommended, to record here).
- Photo storage: local upload dir vs object storage (local for the test).
- NestJS layout: single app with modules vs monorepo `apps/`+`libs/`.
