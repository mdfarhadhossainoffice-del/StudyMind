# Lumo web application

## Requirements
- Node.js 20.19+ or 22.12+
- npm

## Run locally
1. Copy `.env.example` to `.env.local`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` using the Supabase project URL and publishable (or legacy anon) key.
3. From this directory run:

```bash
npm install
npm run dev
```

## Current functionality
- Email/password signup and login using Supabase Auth
- Role-aware student and admin navigation
- Published course catalog for students
- Student enrollments list
- Admin course creation as draft
- Admin publish/unpublish controls
- Paid enrollment is intentionally disabled until payment integration is implemented

## Important
The database migration in `../supabase/migrations` must be applied to an active Supabase project before the app can work. Do not expose a Supabase service-role key in browser code. Admin access must be granted manually to a verified user in the SQL editor.

The existing Supabase project was found paused. No project has been restored, created, or charged by this development step.
