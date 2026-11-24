-- Keep the auth trigger function trigger-only; users must not invoke it through PostgREST RPC.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- RLS policies call this predicate for public course visibility and signed-in admin checks.
revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Index referencing columns used for joins and deletes.
create index if not exists certificates_course_id_idx on public.certificates(course_id);
create index if not exists courses_created_by_idx on public.courses(created_by);
create index if not exists enrollments_course_id_idx on public.enrollments(course_id);
create index if not exists lesson_progress_lesson_id_idx on public.lesson_progress(lesson_id);
create index if not exists quiz_attempts_quiz_id_idx on public.quiz_attempts(quiz_id);
