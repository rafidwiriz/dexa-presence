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
| Docs scaffold | ✅ | plan, requirements, architecture, data-model, api-contracts, conventions, decision-log |
| apps/api | ⬜ not started | |
| apps/web | ⬜ not started | |
| docker compose | ⬜ not started | postgres 16, rabbitmq 3.13 |
| DB schema | ⬜ not started | `dexa_presence` + `dexa_audit` |
| Auth | ⬜ not started | JWT, company_email + password |
| Attendance | ⬜ not started | check masuk/pulang, summary + date filter |
| Notifications | ⬜ not started | SSE stream |
| Profile audit | ⬜ not started | RabbitMQ → audit DB |
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