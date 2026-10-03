# Insomnia collection — Dexa Presence API

Import `dexa-presence.insomnia.json` into Insomnia (Application menu →
*Import/Export* → *Import Data*).

## Setup

1. Start infra + API (`make db`, then `make api`).
2. Open the collection → **Base Environment** (pencil icon) → confirm the seeded
   credentials are present (defaults match `docs/conventions.md` + seed data).
3. **Run the two Login requests first** — their after-response scripts store the JWT
   into `admin_token` / `employee_token`, and employee id into `employee_id`.
   They persist into the Base Environment (in *raw* mode; see known quirk below).

## Suggested flow (top to bottom)

1. **Auth** → Login (Admin), Login (Employee)
2. **Employees** → List (admin) → Get My Profile (self) → Create (admin, stores
   `created_employee_id`) → Update (admin) → Upload Photo (self, pick a file) →
   Delete (admin, cleanup)
3. **Attendance** → Check In → Check Out → Summary (self) → All Attendance (admin)
4. **Notifications** → send the SSE stream request, then in a second tab run the
   employee *PATCH* from Employees — the stream shows `event: profile.updated`

## Test assertions

Every request (except the SSE stream) has an after-response script with `insomnia.test`
assertions (status code, key body fields). Run the request, open the **Tests** tab to
see pass/fail, or use the **Collection Runner** to run the whole collection.

## Notes / known quirks

- **Token persistence:** `insomnia.environment.set()` from scripts writes to the
  selected environment. It only works in the debug tab / collection runner — the
  separate *Test* tab does not persist env values. Keep the Base Environment in raw
  (JSON) view when checking it.
- **Password change** updates the employee password to `employee_new_password`
  (default `budi456`). To re-login afterward, set `employee_password` to that value.
- **No request chaining tags (`{{ $... }}`)** — they break on import in recent
  Insomnia versions; tokens are handled via env vars instead.
- JWT is stateless: changing a password does not invalidate an existing `employee_token`.