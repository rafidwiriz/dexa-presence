# Dexa Presence — Fullstack Web Technical Test

WFH attendance + HRD monitoring web apps backed by NestJS microservices.

## Status

| Phase | Status |
|---|---|
| 0 — Requirements & docs | ✅ Structure + docs scaffolded |
| 1 — Scaffold | ✅ apps/api (NestJS) + apps/web (React/Vite) |
| 2 — Infra | ✅ docker compose: postgres 16 + rabbitmq 3.13 (running) |
| 3 — Database schema | 🟡 Entities only — `synchronize: true` dev-mode (migrations deferred, D-023) |
| 4 — API microservices | ✅ Auth + employees + photo + attendance + profile-audit (RabbitMQ) + notifications (SSE) built & verified |
| 5 — Frontend apps | ✅ Absensi (login, profil+edit, absen, summary) + monitoring (employees CRUD, read-only attendance, SSE toasts) |
| 6 — Hardening | ✅ Done (password_hash excluded, CORS allowlist, exact pins, index, seeder + runbook) |

## Documents

| Document | Purpose |
|---|---|
| [`AGENTS.md`](AGENTS.md) | Working rules and conventions for contributors/agents |
| [`docs/requirements.md`](docs/requirements.md) | Extracted test spec (source: PDF in `docs/`) |
| [`docs/plan.md`](docs/plan.md) | Master plan: phases, goals, definition of done, risks |
| [`docs/architecture.md`](docs/architecture.md) | Microservices topology and data flow |
| [`docs/data-model.md`](docs/data-model.md) | Database structure (main DB + audit log DB) |
| [`docs/api-contracts.md`](docs/api-contracts.md) | REST endpoints for both apps |
| [`docs/conventions.md`](docs/conventions.md) | Stack versions, ports, env/secrets, API style |
| [`docs/nestjs-flask-guide.md`](docs/nestjs-flask-guide.md) | NestJS concepts mapped to Flask (for contributors) |
| [`docs/decision-log.md`](docs/decision-log.md) | ADR-style log of decisions and why |
| [`docs/repo-inventory.md`](docs/repo-inventory.md) | Registry of what exists — the source of truth |

## Quick start (for agents)

1. Read [`AGENTS.md`](AGENTS.md).
2. Read [`docs/requirements.md`](docs/requirements.md) — the spec.
3. Follow [`docs/plan.md`](docs/plan.md); record facts and decisions in
   `docs/repo-inventory.md` and `docs/decision-log.md`.
4. Use the `Makefile` for setup/build/test commands.

## Run from scratch

**Prerequisites:** Node 22, Docker, `make`.

```bash
# 1. Runtime config (never committed) — demo creds live here, not in source
cp apps/api/.env.example apps/api/.env

# 2. Install dependencies (api + web)
make install

# 3. Start infra: PostgreSQL 16.15 + RabbitMQ 3.13.7
make db

# 4. Run the API (terminal 1) → http://localhost:3000/api
#    (first boot creates the schema via TypeORM `synchronize`; wait for
#     "Nest application successfully started")
make api

# 5. Seed demo users (admin + employee; idempotent) — requires the API to have
#    booted once so the `employees` table exists
make seed

# 6. Run the frontend (terminal 2) → http://localhost:5173
make web
```

**Demo logins:**

| App | URL | Credentials |
|---|---|---|
| Monitoring (HRD) | http://localhost:5173/monitoring | `admin@dexa.co` / `admin123` |
| Absensi (employee) | http://localhost:5173/absensi | `budi@dexa.co` / `budi123` |

(The passwords are the `SEED_*` values in `apps/api/.env` — change them there, not in code.)

**Quality gates:** `make lint` · `make test` · `make build`.

**API testing:** import `docs/insomnia/dexa-presence.insomnia.json` into Insomnia, or
follow `docs/api-contracts.md`. Watch the admin notification live: keep
`GET /api/notifications/stream` open, then edit an employee profile — a
`profile.updated` event arrives (also logged to the separate `dexa_audit` DB via
RabbitMQ).

## Stack

- Backend: TypeScript, **NestJS** (microservices)
- Frontend: **React** (Vite) + **Tailwind CSS** (D-016)
- Database: **PostgreSQL** (choose-one per spec)
- Queue for profile-change audit log → separate DB: **RabbitMQ**
- Admin notification on profile edit: **SSE** (D-004)