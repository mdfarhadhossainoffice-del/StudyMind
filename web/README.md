# Lumo web application

## Supabase connection
The Lumo Supabase project is already created and its database migrations are applied.

1. Copy `.env.example` to `.env.local` in this directory.
2. Keep the supplied project URL and publishable key, or retrieve the current publishable key from Supabase project settings.
3. Never place a Supabase service-role/secret key in browser code or commit it.

## Run locally
Requirements: Node.js 20.19+ or 22.12+ and npm.

```bash
cp .env.example .env.local
npm install
npm run dev
```

## First administrator setup
1. Create your personal account through the app.
2. In Supabase Dashboard → Authentication → Users, verify the account and copy its user UUID.
3. In SQL Editor, run the following, replacing the placeholder with that verified UUID:

```sql
update public.profiles
set role = 'admin'
where id = 'PASTE_VERIFIED_USER_UUID_HERE';
```

Never promote an account based only on an email address supplied by an unverified person.

## Current functionality
- Email/password signup and login
- Role-aware student and administrator navigation
- Published course catalog
- Student enrollments
- Administrator course creation as draft
- Administrator publish/unpublish controls
- Paid enrollment remains disabled until a verified payment integration is implemented

## Database
The schema is maintained in `../supabase/migrations`. All core learning tables have Row Level Security enabled. Quiz answer keys are isolated from student-readable question data. Admin access is an explicit operator action.

## Cost and security
The project was created on the Free plan with a $0/month project quote. No paid upgrade or add-on was enabled. Do not enable paid services without explicit cost review and approval.
