create table if not exists focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  session_type text not null check (session_type in ('work', 'break')),
  planned_minutes integer not null check (planned_minutes > 0),
  actual_minutes integer not null check (actual_minutes >= 0),
  completed boolean not null default true,
  created_at timestamptz default now()
);

create index if not exists idx_focus_sessions_user_started_at
  on public.focus_sessions(user_id, started_at desc);

create table if not exists ai_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  date date not null,
  summary text not null,
  recommendations jsonb not null default '[]'::jsonb,
  detected_patterns jsonb not null default '[]'::jsonb,
  scoring_breakdown jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- RLS
alter table public.focus_sessions enable row level security;
alter table public.ai_feedback enable row level security;

create policy "Users can view their own focus sessions"
  on public.focus_sessions for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own focus sessions"
  on public.focus_sessions for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own focus sessions"
  on public.focus_sessions for update
  using ( auth.uid() = user_id );

create policy "Users can view their own ai feedback"
  on public.ai_feedback for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own ai feedback"
  on public.ai_feedback for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own ai feedback"
  on public.ai_feedback for update
  using ( auth.uid() = user_id );
