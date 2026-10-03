# Conventions

## Stack (pinned)

| Layer | Choice | Version | Notes |
|---|---|---|---|
| Runtime | Node | 22 LTS | via `.nvmrc` in each app |
| API framework | NestJS | 10 | TypeScript strict |
| ORM | TypeORM | 0.3 | `@nestjs/typeorm@10`; entities + migrations |
| Frontend | React + Vite | React 18, Vite 5 | TypeScript |
| CSS | Tailwind | v4 via `@tailwindcss/vite` (D-016) | CSS-first, no config file |
| DB | PostgreSQL | 16 | main DB |
| Audit DB | PostgreSQL | 16 | separate database (`dexa_audit`) |
| Queue | RabbitMQ | 3.13 | dockerized |
| Notification | SSE or Firebase | — | **pending D-004** |

Pin exact versions in `package.json` / `docker/compose.yml`; record any bump in
`docs/decision-log.md`.

## Ports

| Service | Port |
|---|---|
| API (NestJS) | 3000 |
| Web (Vite dev) | 5173 |
| PostgreSQL | 5432 |
| RabbitMQ mgmt | 15672 |
| RabbitMQ AMQP | 5672 |

## Environment & secrets

- Everything via env vars; per-app `.env` from `.env.example` — never committed.
- API uses discrete vars (see `apps/api/.env.example`): `DATABASE_HOST`,
  `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`,
  `PORT`, `JWT_SECRET`. Audit DB + RabbitMQ vars added when those features land
  (`AUDIT_DATABASE_*`, `RABBITMQ_URL`).
- No secrets in source, images, or this repo.

## API style

- REST, JSON, `/api` prefix. Auth via `Authorization: Bearer`.
- Validation via class-validator DTOs; global `ValidationPipe`.
- Role guard: `employee` vs `admin`.

## Layout

- `apps/api` — NestJS monorepo (`apps/` + `libs/` or single app with service modules —
  decided in decision-log). Microservice boundary = module (REST).
- `apps/web` — Vite; two route trees (`/absensi/*`, `/monitoring/*`).

## Branching / commits

- Trunk-based on `main`; small logical commits. No history rewriting.