# Repo Inventory — source of truth

Updated as facts are learned and features land. Keep in sync with
`docs/decision-log.md`.

## Layout

```
dexa-presence/
├── apps/
│   ├── api/     # NestJS microservices (auth, employee, attendance, notifications, profile-audit)
│   └── web/     # React/Vite frontends (absensi + monitoring)
├── docker/      # compose: postgres, rabbitmq, services
├── docs/        # planning & contracts (this directory)
└── Makefile     # root orchestration
```

## Status

| Area | Status | Notes |
|---|---|---|
| Docs scaffold | ✅ | plan, requirements, architecture, data-model, api-contracts, conventions, decision-log, nestjs-flask-guide |
| apps/api | ✅ scaffolded | NestJS 10 + TypeORM 0.3, builds clean |
| apps/web | ⬜ not started | |
| docker compose | ✅ | postgres 16 + rabbitmq 3.13 + audit-DB init script; containers not started yet |
| DB schema | 🟡 entities only | `synchronize: true` (dev); no migrations yet; audit DB not created |
| Auth | ✅ | JWT login (`POST /auth/login`), password change (`PATCH /auth/password`), bcrypt |
| Employees CRUD | ✅ | list/get/create/update/delete; self vs admin guards (D-010) |
| Attendance | ✅ | employee check in/out + tz-aware summary; admin read-only view (all employees, filters) |
| Photo upload | ✅ | `POST /employees/:id/photo` → `uploads/`, served at `/api/uploads/*` |
| Notifications | ✅ | SSE `GET /notifications/stream`; `profile.updated` → RxJS Subject → subscribers |
| Profile audit | ✅ | RabbitMQ `profile.updated` → `dexa_audit.profile_changes` (separate connection) |
| Frontends | ⬜ not started | absensi (profil, absen, summary) + monitoring (CRUD, read-only absensi) |
| Backend runtime | ✅ verified 2026-10-02 | infra up (postgres 16 + rabbitmq 3.13), API boots clean, all routes smoke-tested end-to-end |

## Services / ports / versions

See `docs/conventions.md` (single source for ports + pinned versions).

## Commands

- `make db` — start postgres + rabbitmq.
- `make api` / `make web` / `make dev` — run in dev mode.
- `make lint` / `make test` / `make build` — quality gates.

## Facts learned

- Spec timeline: 3–4 days, max 5 (source: requirements.pdf).
- Default summary window: start of current month → today; filterable by date range.
- Profile-change features: admin notification + queue to separate DB.
- Monitoring app attendance view is read-only.
- NestJS scaffold uses Nest 10 (needs `@nestjs/config@3`, `@nestjs/typeorm@10`,
  `typeorm@0.3` — see D-008/D-009).
- `npm audit` on the scaffold reports 24 vulns; accepted for the test (D-008).
- **2026-10-02 smoke test:** backend verified running. `@nestjs/microservices`, `amqplib`,
  `amqp-connection-manager` were missing from `package.json` (RMQ code had never been
  compiled) — added via `npm install`.
- **2026-10-02 hardening findings (Phase 6):** (1) `password_hash` is returned in
  auth/employee responses — must be excluded from serialization; (2) admin attendance
  list returns `employee: null` — relation not loaded in `AttendanceService.findAll`.
- **2026-10-02 tooling:** Insomnia collection with test scripts added at
  `docs/insomnia/` (imports as v4; tokens handled via env vars, not chaining tags —
  those break on import in recent Insomnia versions).