# Requirements — Fullstack Web Technical Test (Dexa Group)

Extracted from `docs/(51) Dexa Group - Fullstack Web Technical Test.pdf` (the source
of truth). This is a plain-text rendering for reference.

## Mandatory stack

- **Backend:** JavaScript/TypeScript, framework **NestJS**.
- **Database:** choose one — MySQL / Oracle / MongoDB / SQL Server / PostgreSQL.
- **Frontend:** **React.js**.
- **Architecture:** microservices concept, **REST API**.
- **Timeline:** complete in **3–4 days (max 5 days)**.

## Objective

**Background**
- Able to create proper database structure.
- Able to connect to any database.
- Able to create API with microservices concept.
- Able to manipulate data (create, read, update, delete) with API.

**Frontend**
- Able to create page/screen.
- Able to implement a CSS Framework.
- Able to call API from/to backend.
- Able to create custom component.

## Use case

### 1. Aplikasi Absensi WFH Karyawan (employee-facing, responsive)

Responsive web app, opens in any browser or mobile. Employee logs in with **company
email + password**. Main menu has **3 menus**:

- **a. Profil Karyawan** — shows profile of the logged-in employee: Nama, Email
  Perusahaan, Foto Karyawan, Posisi, Nomor Handphone. Employee may edit Foto, Nomor
  Handphone, and password.
  - On any profile data change, add these features (free choice of technology):
    1. Popup/alert notification on the **admin page** (e.g. Firebase or other).
    2. Data stream / message queue to **log into a separate database** (e.g. Kafka,
       RabbitMQ, AWS SQS, GCP Pub/Sub).
- **b. Absen** — employee checks in/out of the office. Captured data: tanggal, waktu,
  and status: **masuk** (in) or **pulang** (out).
- **c. Summary Absen** — attendance summary. Default: start of current month → today.
  Filterable by date range. Example display:
  - Filter Tanggal (From – To)
  - Table: **Tanggal | Masuk | Pulang**
  - Row sample: `2022-11-22 08:00` | `2022-11-22 17:00`

### 2. Aplikasi Monitoring Karyawan (HRD admin)

Web app specifically for **HRD admin**:
- **a.** Menu to make changes / update **employee data**.
- **b.** Menu to view **all absensi submitted by all employees** (Read Only).

Built with the **microservices concept (REST API)**, consumable by **both**
applications.

## Non-functional

- Both apps consume the **same REST API**; no duplicated endpoint logic.
- Responsive on desktop and mobile.
- Delivery within 3–4 days, max 5.