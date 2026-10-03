# Architecture

## Topology

```
                 ┌──────────────────────────────┐
                 │  apps/web  (React + Vite)    │
                 │  ┌───────────┐ ┌───────────┐ │
                 │  │ absensi   │ │ monitoring│ │  (two frontends, one codebase)
                 │  │ (employee)│ │ (HRD)     │ │
                 │  └─────┬─────┘ └─────┬─────┘ │
                 └────────┼────────────┼────────┘
                          │  REST + SSE            │
                          │   (D-004)              │
                 ┌────────▼────────────▼────────┐
                 │      apps/api  (NestJS)       │
                 │  ┌──────────────────────────┐ │
                 │  │ Auth       (JWT)         │ │
                 │  │ Employee   (CRUD, upload)│ │
                 │  │ Attendance (check in/out)│ │
                 │  │ Notifications(SSE hub)   │ │
                 │  │ ProfileAudit(consumer)   │ │
                 │  └────────────┬─────────────┘ │
                 └──────┬───────┼────────┬───────┘
                        │       │        │
               ┌────────▼──┐ ┌──▼───────▼─┐ ┌──────────┐
               │ PostgreSQL│ │ RabbitMQ   │ │ Postgres │
               │ (main DB) │ │ (exchange) │ │ (audit   │
               │ employees │ │ profile.chg│ │  log DB) │
               │ attendance│ └────────────┘ └──────────┘
               └───────────┘
```

## Components

- **Auth service** — login (email company + password), JWT issuance, password change.
- **Employee service** — profile read/update, admin CRUD, photo upload, phone/password
  update. Publishes a `profile.updated` event to RabbitMQ on change.
- **Attendance service** — check-in/check-out; summary with date-range filter.
- **Notifications service** — pushes a popup/alert to the monitoring app whenever a
  profile-change event is consumed. Transport: SSE (**D-004**).
- **ProfileAudit service** — consumes `profile.updated` events from RabbitMQ and
  inserts rows into the **separate audit database**.

## Data flow — profile change

1. Employee (absensi app) PATCHes own profile → Employee service.
2. Employee service updates main DB, publishes `profile.updated` to RabbitMQ.
3a. `NotificationsConsumer` (RabbitMQ `profile.updated`) → `NotificationsService`
    → SSE event to monitoring app → admin sees popup/alert.
3b. ProfileAudit service subscribes → inserts audit row into the separate log DB.

## Two apps, one API

Both frontends share the same REST API (see `docs/api-contracts.md`). Auth guards scope
data by role: `employee` vs `admin`.

## Key decisions

- Microservices as **NestJS modules/HTTP services** within one process (per
  `docs/decision-log.md`), sharing one REST gateway — satisfies the "microservices
  concept (REST API)" requirement without premature process split.
- Notification via **SSE** (D-004).
- Queue via **RabbitMQ** (local, dockerized).