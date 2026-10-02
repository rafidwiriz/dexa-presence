# API Contracts

Base URL: `http://localhost:3000/api` (dev). JSON bodies, `Authorization: Bearer <jwt>`.

## Auth

| Method | Path | Body | Returns | Notes |
|---|---|---|---|---|
| POST | `/api/auth/login` | `{ company_email, password }` | `{ accessToken, employee }` | issue JWT |
| GET | `/api/auth/me` | — | `employee` | current user |

## Employee

| Method | Path | Body | Returns | Notes |
|---|---|---|---|---|
| GET | `/api/employees/:id` | — | `employee` | own profile (self) or admin-visible |
| PATCH | `/api/employees/:id` | partial `{ name, phone, photo_url, position }` | `employee` | self: phone+photo only; admin: all. Publishes `profile.updated` |
| GET | `/api/employees` | — | `employee[]` | admin only (list) |
| POST | `/api/employees` | `{ name, company_email, password, position, phone, role }` | `employee` | admin only (create) |
| POST | `/api/employees/:id/photo` | multipart file | `{ photo_url }` | upload photo |

| PATCH | `/api/auth/password` | `{ current_password, new_password }` | `{ ok }` | self-service, verifies current |

## Attendance

> **Language:** API values are English (D-012). The frontend translates for display:
> `check_type: "in"` → "Masuk", `"out"` → "Pulang"; summary keys `check_in`/`check_out`
> → columns "Masuk"/"Pulang".

| Method | Path | Body | Returns | Notes |
|---|---|---|---|---|
| POST | `/api/attendance/check` | `{ check_type: "in" \| "out" }` | `attendance` | server stamps `check_at` (UTC) |
| GET | `/api/attendance/summary?from=YYYY-MM-DD&to=YYYY-MM-DD&tz=Asia/Jakarta` | — | `[{ date, check_in, check_out }]` | own records; day-grouped in `tz`; default month-start → today |
| GET | `/api/attendance?employeeId=&from=&to=&tz=` | — | `attendance[]` | admin only, read-only all employees |

## Notifications (SSE)

| Method | Path | Returns | Notes |
|---|---|---|---|
| GET | `/api/notifications/stream` | `text/event-stream` | monitoring app subscribes; event `profile.updated` with payload |

## Error format

`{ "statusCode": 4xx, "message": "...", "error": "..." }` (Nest default). Auth errors:
401. Forbidden (role): 403. Not found: 404.

## Event — `profile.updated` (RabbitMQ)

Payload:
```json
{ "employeeId": "uuid", "changedBy": "uuid", "fields": { "phone": { "old": "...", "new": "..." } }, "occurredAt": "ISO" }
```