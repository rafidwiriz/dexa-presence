# Dexa Presence — Fullstack Web Technical Test

WFH attendance + HRD monitoring web apps backed by NestJS microservices.

## Status

| Phase | Status |
|---|---|
| 0 — Requirements & docs | ✅ Structure + docs scaffolded |
| 1 — Scaffold | ✅ apps/api (NestJS) + apps/web (React/Vite) |
| 2 — Infra | ✅ docker compose: postgres 16 + rabbitmq 3.13 (running) |
| 3 — Database schema | 🟡 Entities only (`synchronize` dev-mode); migrations pending |
| 4 — API microservices | ✅ Auth + employees + photo + attendance + profile-audit (RabbitMQ) + notifications (SSE) built & verified |
| 5 — Frontend apps | 🟡 Absensi done (login, profil+edit, absen, summary); monitoring pending |
| 6 — Hardening | ⬜ Not started |

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

## Stack

- Backend: TypeScript, **NestJS** (microservices)
- Frontend: **React** (Vite) + **Tailwind CSS** (D-016)
- Database: **PostgreSQL** (choose-one per spec)
- Queue for profile-change audit log → separate DB: **RabbitMQ**
- Admin notification on profile edit: **SSE** (D-004)