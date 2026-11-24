-- Lumo Phase 02: learning platform foundation
-- Apply only after the target Supabase project is active and verified.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  role text not null default 'student' check (role in ('student','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  category text not null,
  academy text not null check (academy in ('skills','language')),
  level text not null default 'beginner' check (level in ('beginner','intermediate','advanced')),
  price_bdt integer not null default 0 check (price_bdt >= 0),
  thumbnail_url text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique(course_id, sort_order)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.course_modules(id) on delete cascade,
  title text not null,
  content text not null default '',
  video_url text,
  resource_url text,
  duration_minutes integer not null default 0 check (duration_minutes >= 0),
  sort_order integer not null default 0,
  is_preview boolean not null default false,
  created_at timestamptz not null default now(),
  unique(module_id, sort_order)
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status text not null default 'active' check (status in ('active','completed','cancelled')),
  enrolled_at timestamptz not null default now(),
  unique(student_id, course_id)
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(student_id, lesson_id)
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text not null default '',
  pass_mark integer not null default 60 check (pass_mark between 0 and 100),
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  prompt text not null,
  options jsonb not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  check (jsonb_typeof(options) = 'array')
);

-- Correct answers are isolated from student-readable question options.
create table if not exists public.quiz_answer_keys (
  question_id uuid primary key references public.quiz_questions(id) on delete cascade,
  correct_option integer not null check (correct_option >= 0),
  explanation text not null default ''
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  score numeric(5,2),
  passed boolean,
  submitted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  certificate_code text not null unique default encode(gen_random_bytes(8), 'hex'),
  issued_at timestamptz not null default now(),
  unique(student_id, course_id)
);

create index if not exists course_modules_course_order_idx on public.course_modules(course_id, sort_order);
create index if not exists lessons_module_order_idx on public.lessons(module_id, sort_order);
create index if not exists enrollments_student_idx on public.enrollments(student_id);
create index if not exists lesson_progress_student_idx on public.lesson_progress(student_id);
create index if not exists quizzes_course_idx on public.quizzes(course_id);
create index if not exists quiz_questions_quiz_order_idx on public.quiz_questions(quiz_id, sort_order);
create index if not exists quiz_attempts_student_idx on public.quiz_attempts(student_id);

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_answer_keys enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.certificates enable row level security;

-- Profile role is deliberately not writable by authenticated users.
revoke update on public.profiles from authenticated;
grant update (display_name, avatar_url) on public.profiles to authenticated;

drop policy if exists "profile read own or admin" on public.profiles;
create policy "profile read own or admin" on public.profiles
for select to authenticated using (id = (select auth.uid()) or public.is_admin());
drop policy if exists "profile update own or admin" on public.profiles;
create policy "profile update own or admin" on public.profiles
for update to authenticated using (id = (select auth.uid()) or public.is_admin())
with check (id = (select auth.uid()) or public.is_admin());

drop policy if exists "published courses readable" on public.courses;
create policy "published courses readable" on public.courses
for select to anon, authenticated using (status = 'published' or public.is_admin());
drop policy if exists "admins manage courses" on public.courses;
create policy "admins manage courses" on public.courses
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "modules follow course visibility" on public.course_modules;
create policy "modules follow course visibility" on public.course_modules
for select to anon, authenticated using (
  public.is_admin() or exists (
    select 1 from public.courses c where c.id = course_id and c.status = 'published'
  )
);
drop policy if exists "admins manage modules" on public.course_modules;
create policy "admins manage modules" on public.course_modules
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "lessons follow course visibility" on public.lessons;
create policy "lessons follow course visibility" on public.lessons
for select to anon, authenticated using (
  public.is_admin() or is_preview or exists (
    select 1 from public.course_modules m join public.courses c on c.id = m.course_id
    where m.id = module_id and c.status = 'published'
  )
);
drop policy if exists "admins manage lessons" on public.lessons;
create policy "admins manage lessons" on public.lessons
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "students read own enrollments" on public.enrollments;
create policy "students read own enrollments" on public.enrollments
for select to authenticated using (student_id = (select auth.uid()) or public.is_admin());
drop policy if exists "students create own enrollments" on public.enrollments;
create policy "students create own enrollments" on public.enrollments
for insert to authenticated with check (student_id = (select auth.uid()));
drop policy if exists "admins manage enrollments" on public.enrollments;
create policy "admins manage enrollments" on public.enrollments
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "students manage own progress" on public.lesson_progress;
create policy "students manage own progress" on public.lesson_progress
for all to authenticated using (student_id = (select auth.uid()) or public.is_admin())
with check (student_id = (select auth.uid()) or public.is_admin());

drop policy if exists "published course quizzes readable" on public.quizzes;
create policy "published course quizzes readable" on public.quizzes
for select to anon, authenticated using (
  public.is_admin() or exists (
    select 1 from public.courses c where c.id = course_id and c.status = 'published'
  )
);
drop policy if exists "admins manage quizzes" on public.quizzes;
create policy "admins manage quizzes" on public.quizzes
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "published quiz questions readable" on public.quiz_questions;
create policy "published quiz questions readable" on public.quiz_questions
for select to anon, authenticated using (
  public.is_admin() or exists (
    select 1 from public.quizzes q join public.courses c on c.id = q.course_id
    where q.id = quiz_id and c.status = 'published'
  )
);
drop policy if exists "admins manage quiz questions" on public.quiz_questions;
create policy "admins manage quiz questions" on public.quiz_questions
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "only admins access answer keys" on public.quiz_answer_keys;
create policy "only admins access answer keys" on public.quiz_answer_keys
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "students read own attempts" on public.quiz_attempts;
create policy "students read own attempts" on public.quiz_attempts
for select to authenticated using (student_id = (select auth.uid()) or public.is_admin());
drop policy if exists "students create own attempts" on public.quiz_attempts;
create policy "students create own attempts" on public.quiz_attempts
for insert to authenticated with check (student_id = (select auth.uid()));
drop policy if exists "admins manage attempts" on public.quiz_attempts;
create policy "admins manage attempts" on public.quiz_attempts
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "students read own certificates" on public.certificates;
create policy "students read own certificates" on public.certificates
for select to authenticated using (student_id = (select auth.uid()) or public.is_admin());
drop policy if exists "admins issue certificates" on public.certificates;
create policy "admins issue certificates" on public.certificates
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Admin bootstrap is an explicit operator action, never based on signup metadata.
-- After the first owner signs up, set their role from the Supabase SQL editor:
-- update public.profiles set role = 'admin' where id = '<verified-auth-user-uuid>';
