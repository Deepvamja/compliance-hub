-- ComplianceHub Database Schema
-- Run this SQL in your Supabase Dashboard → SQL Editor

-- 1. Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid());

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Employees table
create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  first_name text not null,
  last_name text not null,
  work_state text not null,
  state_code text not null,
  hire_date text not null,
  status text not null default 'active',
  created_at timestamptz default now()
);

alter table public.employees enable row level security;

create policy "Users can read own employees"
  on public.employees for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can insert own employees"
  on public.employees for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own employees"
  on public.employees for update
  to authenticated
  using (user_id = auth.uid());

create policy "Users can delete own employees"
  on public.employees for delete
  to authenticated
  using (user_id = auth.uid());

-- 3. Tasks table
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  employee_id uuid references public.employees(id) on delete cascade,
  employee_name text not null,
  state_code text not null,
  state_name text not null,
  title text not null,
  description text,
  due_date text not null,
  status text not null default 'pending',
  priority text not null default 'medium',
  estimated_penalty numeric default 0,
  completed_at timestamptz,
  category text,
  assigned_to text,
  created_at timestamptz default now()
);

alter table public.tasks enable row level security;

create policy "Users can read own tasks"
  on public.tasks for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can insert own tasks"
  on public.tasks for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own tasks"
  on public.tasks for update
  to authenticated
  using (user_id = auth.uid());

create policy "Users can delete own tasks"
  on public.tasks for delete
  to authenticated
  using (user_id = auth.uid());

-- 4. Activity Logs table
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  action text not null,
  entity_type text not null,
  entity_id text,
  description text,
  metadata jsonb,
  created_at timestamptz default now()
);

alter table public.activity_logs enable row level security;

create policy "Users can read own activity logs"
  on public.activity_logs for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can insert own activity logs"
  on public.activity_logs for insert
  to authenticated
  with check (user_id = auth.uid());

-- 5. Task Comments table
create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  task_id uuid references public.tasks(id) on delete cascade not null,
  author text not null,
  text text not null,
  created_at timestamptz default now()
);

alter table public.task_comments enable row level security;

create policy "Users can read own task comments"
  on public.task_comments for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can insert own task comments"
  on public.task_comments for insert
  to authenticated
  with check (user_id = auth.uid());

-- 6. State History table
create table if not exists public.state_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  employee_id uuid references public.employees(id) on delete cascade not null,
  employee_name text not null,
  previous_state text not null,
  previous_state_code text not null,
  new_state text not null,
  new_state_code text not null,
  effective_date text not null,
  reason text,
  created_at timestamptz default now()
);

alter table public.state_history enable row level security;

create policy "Users can read own state history"
  on public.state_history for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can insert own state history"
  on public.state_history for insert
  to authenticated
  with check (user_id = auth.uid());
