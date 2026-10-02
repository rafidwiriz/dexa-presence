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
| docker compose | ✅ file written | `docker/compose.yml` (postgres 16, rabbitmq 3.13); containers not started yet |
| DB schema | 🟡 entities only | `synchronize: true` (dev); no migrations yet; audit DB not created |
| Auth | ✅ | JWT login (`POST /auth/login`), password change (`PATCH /auth/password`), bcrypt |
| Employees CRUD | ✅ | list/get/create/update/delete; self vs admin guards (D-010) |
| Attendance | ✅ | employee check in/out + tz-aware summary; admin read-only view (all employees, filters) |
| Photo upload | ⬜ not started | `POST /employees/:id/photo` *(planned)* |
| Notifications | ⬜ not started | SSE/Firebase — D-004 pending |
| Profile audit | ⬜ not started | RabbitMQ → audit DB (D-006) |
| Frontends | ⬜ not started | absensi (profil, absen, summary) + monitoring (CRUD, read-only absensi) |

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