# Lumo Phase 02 — Student + Admin Foundation

## Architecture
- Frontend: Vite + React (to be scaffolded in the next implementation step).
- Identity and data: Supabase Auth + Postgres.
- Deployment: GitHub Pages is suitable for the static preview; use a static host with SPA rewrite support for the authenticated application.
- Bangladesh-first: prices stored as integer BDT; payment gateway integration is deferred until enrollment and refund rules are approved.

## Database migration
`supabase/migrations/202611240001_initial_lumo_schema.sql` defines profiles, courses, modules, lessons, enrollments, progress, quizzes, question options, isolated answer keys, attempts and certificates.

### Security decisions
- Row Level Security is enabled on every application table.
- Student profile role cannot be changed through normal authenticated profile updates.
- Correct quiz answers live in a separate admin-only table.
- Signup metadata never grants admin access.
- The first administrator must be promoted manually in the SQL editor after verifying their Auth user UUID.

## Configuration
Copy `.env.example` to `.env.local` and set the Supabase project URL and publishable/anon key. Never expose the Supabase service-role key in browser code or commit secrets.

## Current infrastructure status
The only Supabase project visible in the connected account is `studymind pro` and it is paused/inactive. This repo contains the prepared migration, but it has NOT been applied. Do not restore or create a project until the owner has reviewed any cost implications and explicitly approved the action.

## Next steps
1. Confirm an active Supabase project and its free-tier status.
2. Apply and verify the migration; run Supabase security advisors.
3. Scaffold the Vite/React application with login, registration, role-aware routing and dashboards.
4. Connect course CRUD, enrollment and progress views.
