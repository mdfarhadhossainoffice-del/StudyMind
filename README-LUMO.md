# Lumo MVP

Lumo is an early-stage learning platform for Bangladesh, with two learning paths:
- Future Skills Academy
- Language Academy (starting with IELTS preparation)

## Current release

This branch contains a static, responsive landing page in `index.html`.
It is a visual MVP only. Authentication, database storage, course delivery, payments,
AI generation, mock exams, and certificates are not connected yet.

The early-access form is intentionally a demo and does not transmit or store personal data.

## Preview / deployment

The site can be previewed with GitHub Pages from the `lumo-mvp` branch and the
repository root. In GitHub, open Settings → Pages → Build and deployment,
choose Deploy from a branch, select `lumo-mvp` and `/ (root)`, then Save.
GitHub will show the published URL when deployment finishes.

## Next development milestones

1. Connect a fresh, active Supabase project.
2. Implement secure learner registration and login.
3. Build course, module, lesson and enrollment tables.
4. Add admin course publishing and learner progress.
5. Add quiz engine and certificates.
6. Build IELTS practice flows with properly licensed content.
7. Integrate payments only after pricing, legal and refund policies are ready.

## Content and exam integrity

Do not upload or reproduce copyrighted Cambridge IELTS books or paid course materials
without permission. Build original practice content and use properly licensed resources.
