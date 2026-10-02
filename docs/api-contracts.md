# API Contracts

Base URL: `http://localhost:3000/api` (dev). JSON bodies, `Authorization: Bearer <jwt>`.

## Auth

| Method | Path | Body | Returns | Notes |
|---|---|---|---|---|
| POST | `/api/auth/login` | `{ company_email, password }` | `{ accessToken, employee }` | issue JWT |
| PATCH | `/api/auth/password` | `{ current_password, new_password }` | `{ ok }` | self-service, verifies current |

## Employee

| Method | Path | Body | Returns | Notes |
|---|---|---|---|---|
| GET | `/api/employees/:id` | — | `employee` | own profile (self) or admin-visible |
| PATCH | `/api/employees/:id` | partial `{ name, phone, photo_url, position }` | `employee` | self: phone+photo only; admin: all. Publishes `profile.updated` (RMQ) |
| GET | `/api/employees` | — | `employee[]` | admin only (list) |
| POST | `/api/employees` | `{ name, company_email, password, position, phone, role }` | `employee` | admin only (create) |
| DELETE | `/api/employees/:id` | — | `204` | admin only |
| POST | `/api/employees/:id/photo` | multipart field `photo` (≤2MB) | `employee` (updated, incl. `photo_url`) | self or admin; random filename |

## Attendance

> **Language:** API values are English (D-012). The frontend translates for display:
> `check_type: "in"` → "Masuk", `"out"` → "Pulang"; summary keys `check_in`/`check_out`
> → columns "Masuk"/"Pulang".

| Method | Path | Body | Returns | Notes |
|---|---|---|---|---|
| POST | `/api/attendance/check` | `{ check_type: "in" \| "out" }` | `attendance` | server stamps `check_at` (UTC) |
| GET | `/api/attendance/summary?from=YYYY-MM-DD&to=YYYY-MM-DD&tz=Asia/Jakarta` | — | `[{ date, check_in, check_out }]` | own records; day-grouped in `tz`; default month-start → today |
| GET | `/api/attendance?employeeId=&from=&to=` | — | `attendance[]` | admin only, read-only all employees (raw records + employee) |

## Notifications (SSE — D-004 pending)

| Method | Path | Returns | Notes |
|---|---|---|---|
| GET | `/api/notifications/stream` | `text/event-stream` | *(planned)* monitoring app subscribes; event `profile.updated` with payload |

> Choice between SSE and Firebase is deferred (D-004); this route documents the SSE option.

## Error format

`{ "statusCode": 4xx, "message": "...", "error": "..." }` (Nest default). Auth errors:
401. Forbidden (role): 403. Not found: 404.

## Event — `profile.updated` (RabbitMQ)

Published by `EmployeesService` on employee update (only changed fields among
name/position/phone/photo_url). Consumed by `ProfileAuditConsumer` → writes a row to
`dexa_audit.profile_changes`. Queue `profile_updated` (durable), at-least-once.

Payload:
```json
{ "employeeId": "uuid", "changedBy": "uuid", "fields": { "phone": { "old": "...", "new": "..." } }, "occurredAt": "ISO" }
```