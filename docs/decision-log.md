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

## D-015 · HTTP status codes: login 200, resource-creating POSTs 201
- **2026-10-03**
- NestJS returns 201 for every `@Post` by default. Kept 201 where a resource is
  actually created, forced 200 where none is:
  - `POST /api/auth/login` → **200** (`@HttpCode(200)` on `AuthController.login`):
    JWT auth creates no resource.
  - `POST /api/attendance/check` → **201**: inserts a new `attendance` row.
  - `POST /api/employees/:id/photo` → **201**: writes a new file to `uploads/`.
  - `POST /api/employees` → **201**: creates an employee (default).
- Insomnia collection assertions updated to match.

## D-016 · Frontend CSS: Tailwind CSS v4 (via `@tailwindcss/vite`)
- **2026-10-03**
- Chosen Tailwind for the frontends (recommended in conventions). Version **4** line,
  integrated through the `@tailwindcss/vite` plugin — no `tailwind.config.js` /
  PostCSS config files needed (v4 is CSS-first: one `@import "tailwindcss";` line).
- Rationale: utility classes in JSX keep styling close to markup (good for a
  non-design-focused contributor), and `md:`/`lg:` breakpoints give responsive
  mobile/desktop for free (requirement: responsive both apps).
- No Tailwind config file unless a future need forces one.

## D-017 · CORS enabled on the API (dev)
- **2026-10-03**
- Frontend on `:5173` calls API on `:3000` → preflight `OPTIONS` was rejected (Nest
  sends no CORS headers by default). Added `app.enableCors()` in `apps/api/src/main.ts`.
- Wide-open (all origins) for the test phase. Phase 6 hardening: restrict to the
  frontend origin(s) via env (e.g. `CORS_ORIGINS`), since this is a `VITE_API_BASE`/
  `RABBITMQ_URL`-style runtime value.

## D-018 · Summary date bounds are tz-aware (bug fix)
- **2026-10-03**
- `AttendanceService.summary` previously bound `check_at` with `new Date('YYYY-MM-DD')`
  → **UTC midnight**. A record stamped `2026-10-02T18:00Z` (which is 01:00 WIB on
  **Oct 3**) fell *before* the UTC-midnight "today" bound, so the day's own records
  were missing from the summary → frontend showed no check-in.
- Fixed: bounds computed as local start/end of day in the requested `tz` using
  `($3::date)::timestamp AT TIME ZONE $1` … `+ interval '1 day'`. Defaults (`from`/`to`
  omitted) now resolve to the current month start / today **in `tz`** via
  `Intl.DateTimeFormat('en-CA', { timeZone: tz })`.
- D-011 honored consistently: display + grouping + bounds all in the client's tz.

## D-019 · Attendance→employee relation fixed (`@JoinColumn`)
- **2026-10-03**
- `Attendance` had `@ManyToOne(() => Employee) employee` **without** `@JoinColumn`, plus a
  plain `@Column() employee_id`. TypeORM therefore created an implicit relation column
  `employeeId` (uuid, always null) while `employee_id` held the real value → admin
  attendance list returned `employee: null`.
- Fix: `@JoinColumn({ name: 'employee_id' })` on the relation + `@Column({ type: 'uuid' })`
  on `employee_id` (must match the uuid PK). DB cleanup: dropped the orphan `employeeId`
  column and recreated `attendance` via `synchronize`.
- Dev-data note: attendance rows reset in the process (test data, re-check-in as needed).

## D-020 · `password_hash` excluded from serialization
- **2026-10-03**
- Every auth/employee response leaked `password_hash`. Fixed with class-transformer:
  `@Exclude()` on `Employee.password_hash` + global `ClassSerializerInterceptor`
  (`app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))`
  in `main.ts`). Internal reads (bcrypt compare, audit) still use the raw entity.

## Open decisions (to be made during implementation)
- None currently open — layout resolved by D-005; photo storage resolved as local
  upload dir (implemented in `uploads/`).
