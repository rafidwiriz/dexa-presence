# Data Model

Two databases:

1. **Main DB** (`dexa_presence`) — operational data.
2. **Audit log DB** (`dexa_audit`) — profile-change log, written via RabbitMQ consumer.

## Main DB — `dexa_presence`

### `employees`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | varchar(120) | Nama |
| company_email | varchar(160) | unique; login credential |
| password_hash | varchar(255) | bcrypt (implemented) |
| position | varchar(120) | Posisi |
| phone | varchar(30) | Nomor Handphone |
| photo_url | varchar(255) | Foto Karyawan (uploaded file) |
| role | enum | Postgres enum: `employee` \| `admin` |
| is_active | boolean | default true |
| created_at / updated_at | timestamptz | |

### `attendance`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| employee_id | uuid | FK → employees.id |
| check_type | enum | `in` \| `out` (English per D-012; frontend translates to Masuk/Pulang) |
| check_at | timestamptz | tanggal + waktu (clock-in/out time, server-stamped) |
| created_at | timestamptz | |

Summary (per spec) = rows of **Tanggal | Masuk | Pulang**, i.e. group `attendance`
by day in the user's timezone (`check_at AT TIME ZONE :tz`, D-011) for a given
employee and date range.

## Audit log DB — `dexa_audit`

### `profile_changes`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| employee_id | uuid | employee whose profile changed |
| changed_by | uuid | employee id (self-service) |
| fields | jsonb | changed field → old/new value |
| occurred_at | timestamptz | event time |
| source | varchar(40) | e.g. `rabbitmq` |

Written only by the ProfileAudit consumer (separate DB connection).

## Conventions

- Timestamps `timestamptz`, IDs `uuid` (app-generated).
- Indexes: `employees(company_email)` unique (from column constraint).
  `attendance(employee_id, check_at)` is planned but **not yet implemented** — tracked
  in the hardening backlog.
- Env-driven connection strings — never hard-coded (see `docs/conventions.md`).