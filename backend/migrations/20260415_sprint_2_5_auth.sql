create extension if not exists pgcrypto;

alter table public.users
  add column if not exists email text;

create unique index if not exists idx_users_email_unique
  on public.users (email);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  fallback_name text;
begin
  fallback_name := split_part(new.email, '@', 1);

  insert into public.users (id, email, name, created_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', fallback_name),
    now()
  )
  on conflict (id) do update
  set
    email = excluded.email,
    name = coalesce(public.users.name, excluded.name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into public.users (id, email, name, created_at)
select
  au.id,
  au.email,
  coalesce(au.raw_user_meta_data ->> 'name', split_part(au.email, '@', 1)),
  now()
from auth.users au
left join public.users pu on pu.id = au.id
where pu.id is null;

alter table public.users enable row level security;
alter table public.tasks enable row level security;
alter table public.daily_scores enable row level security;
alter table public.score_details enable row level security;
alter table public.habit_patterns enable row level security;

drop policy if exists "users_select_own" on public.users;
create policy "users_select_own"
on public.users
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own"
on public.users
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own"
on public.tasks
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "tasks_insert_own" on public.tasks;
create policy "tasks_insert_own"
on public.tasks
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "tasks_update_own" on public.tasks;
create policy "tasks_update_own"
on public.tasks
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own"
on public.tasks
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "daily_scores_select_own" on public.daily_scores;
create policy "daily_scores_select_own"
on public.daily_scores
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "daily_scores_insert_own" on public.daily_scores;
create policy "daily_scores_insert_own"
on public.daily_scores
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "daily_scores_update_own" on public.daily_scores;
create policy "daily_scores_update_own"
on public.daily_scores
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "habit_patterns_select_own" on public.habit_patterns;
create policy "habit_patterns_select_own"
on public.habit_patterns
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "habit_patterns_insert_own" on public.habit_patterns;
create policy "habit_patterns_insert_own"
on public.habit_patterns
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "habit_patterns_update_own" on public.habit_patterns;
create policy "habit_patterns_update_own"
on public.habit_patterns
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "score_details_select_own" on public.score_details;
create policy "score_details_select_own"
on public.score_details
for select
to authenticated
using (
  exists (
    select 1
    from public.daily_scores ds
    where ds.id = score_details.daily_score_id
      and ds.user_id = auth.uid()
  )
);

drop policy if exists "score_details_insert_own" on public.score_details;
create policy "score_details_insert_own"
on public.score_details
for insert
to authenticated
with check (
  exists (
    select 1
    from public.daily_scores ds
    where ds.id = score_details.daily_score_id
      and ds.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.tasks t
    where t.id = score_details.task_id
      and t.user_id = auth.uid()
  )
);

drop policy if exists "score_details_delete_own" on public.score_details;
create policy "score_details_delete_own"
on public.score_details
for delete
to authenticated
using (
  exists (
    select 1
    from public.daily_scores ds
    where ds.id = score_details.daily_score_id
      and ds.user_id = auth.uid()
  )
);
