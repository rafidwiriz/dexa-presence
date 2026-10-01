# AGENTS.md

Working rules for this project. Read this before making changes.

## Mission

Build the **Fullstack Web Technical Test** for Dexa Group: two responsive web
applications (WFH attendance + HRD monitoring) sharing a set of NestJS
microservices (REST API), per the spec in `docs/requirements.md`. Deliver within
**3–4 days (max 5)**.

## Current state

Scaffolding complete (structure + docs). Code not yet written. See status table in
`README.md` and the source of truth `docs/repo-inventory.md`.

## Non-negotiables

1. **Fullstack stack as specified.** Backend TypeScript on **NestJS**, frontend
   **React** (Vite). Microservices concept for the API.
2. **Never bake secrets or environment-specific values into source or images.**
   `.env`, DB credentials, queue URLs are provided at runtime.
3. **Pin everything.** Node, NestJS, React, PostgreSQL, RabbitMQ versions — pinned
   and recorded in `docs/conventions.md`.
4. **Docs before solutions.** For each phase: plan → implement → record in
   `docs/repo-inventory.md` and `docs/decision-log.md`.
5. **Two apps, one API.** The monitoring (HRD) app and the attendance app consume
   the same REST API. No duplicate endpoint logic.

## Repo layout

```
dexa-presence/
├── apps/
│   ├── api/     # NestJS microservices (auth, employee, attendance, profile-audit)
│   └── web/     # React/Vite frontends (absensi + monitoring)
├── docker/      # compose: postgres, rabbitmq, services
├── docs/        # planning & contracts (source of truth)
└── Makefile     # root orchestration
```

## Working rules

- **Scoping:** stay inside `dexa-presence/`. Do not modify anything outside this root.
- **Docs are source of truth.** Stack, ports, DB schema, and API contracts are
  recorded in `docs/`; ambiguous decisions go to `docs/decision-log.md`.
- **Sequencing:** phase N complete before phase N+1. Reuse patterns, not code.
- **No git history rewriting or restructuring** unless explicitly requested.

<!-- lean-ctx -->
## lean-ctx

lean-ctx is active — the MCP tools replace native equivalents.
Full rules: LEAN-CTX.md (open on demand — do not auto-load).
<!-- /lean-ctx -->
