# Dexa Presence — Fullstack Web Technical Test

WFH attendance + HRD monitoring web apps backed by NestJS microservices.

## Status

| Phase | Status |
|---|---|
| 0 — Requirements & docs | ✅ Structure + docs scaffolded |
| 1 — Architecture & conventions | Documented (see `docs/`) |
| 2 — Database schema | Not started |
| 3 — API microservices | Not started |
| 4 — Frontend apps (absensi + monitoring) | Not started |
| 5 — Integration & notification/queue | Not started |

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
- Frontend: **React** (Vite)
- Database: **PostgreSQL** (choose-one per spec)
- Queue for profile-change audit log → separate DB: **RabbitMQ**
- Admin notification on profile edit: **SSE**