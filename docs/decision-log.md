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

## Open decisions (to be made during implementation)
- CSS framework for the frontends (Tailwind recommended, to record here).
- Photo storage: local upload dir vs object storage (local for the test).
- NestJS layout: single app with modules vs monorepo `apps/`+`libs/`.
