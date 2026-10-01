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
| PATCH | `/api/employees/:id` | partial `{ name, phone, photo_url, position }` | `employee` | publishes `profile.updated` |
| PATCH | `/api/employees/:id/password` | `{ current, new }` | `{ ok }` | publish audit event too |
| GET | `/api/employees` | — | `employee[]` | admin only (list) |
| POST | `/api/employees` | `{ name, company_email, password, position, phone, role }` | `employee` | admin only (create) |
| PATCH | `/api/employees/:id` | partial `{ name, phone, photo_url, position }` | `employee` | publishes `profile.updated` |
| POST | `/api/employees/:id/photo` | multipart file | `{ photo_url }` | upload photo |

## Attendance

| Method | Path | Body | Returns | Notes |
|---|---|---|---|---|
| POST | `/api/attendance/check` | `{ check_type: "masuk" \| "pulang" }` | `attendance` | server stamps `check_at` |
| GET | `/api/attendance/summary?from=YYYY-MM-DD&to=YYYY-MM-DD` | — | `[{ date, masuk, pulang }]` | own records; default month-start → today |
| GET | `/api/attendance?employeeId=&from=&to=` | — | `attendance[]` | admin only, read-only all employees |

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