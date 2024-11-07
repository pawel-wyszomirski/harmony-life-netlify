-- Drop existing tables if they exist
drop table if exists public.harmony_assessments;
drop table if exists public.user_preferences;

-- Create harmony_assessments table
create table public.harmony_assessments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  areas jsonb not null,
  order_sequence integer[] default array[]::integer[],
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint valid_areas check (jsonb_typeof(areas) = 'array')
);

-- Create user_preferences table
create table public.user_preferences (
  user_id uuid references auth.users primary key,
  theme_mode text default 'light' not null,
  last_assessment_id uuid references public.harmony_assessments(id),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint valid_theme_mode check (theme_mode in ('light', 'dark'))
);

-- Enable RLS
alter table public.harmony_assessments enable row level security;
alter table public.user_preferences enable row level security;

-- Create policies for harmony_assessments
create policy "Users can view own assessments"
  on public.harmony_assessments for select
  using (auth.uid() = user_id);

create policy "Users can insert own assessments"
  on public.harmony_assessments for insert
  with check (auth.uid() = user_id);

create policy "Users can update own assessments"
  on public.harmony_assessments for update
  using (auth.uid() = user_id);

create policy "Users can delete own assessments"
  on public.harmony_assessments for delete
  using (auth.uid() = user_id);

-- Create policies for user_preferences
create policy "Users can view own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id);

-- Create indexes for better performance
create index harmony_assessments_user_id_idx on public.harmony_assessments(user_id);
create index harmony_assessments_created_at_idx on public.harmony_assessments(created_at);
create index user_preferences_user_id_idx on public.user_preferences(user_id);

-- Create function to handle updated_at
create or replace function handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create triggers for updated_at
create trigger set_harmony_assessments_updated_at
  before update on public.harmony_assessments
  for each row
  execute function handle_updated_at();

create trigger set_user_preferences_updated_at
  before update on public.user_preferences
  for each row
  execute function handle_updated_at();

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on public.harmony_assessments to anon, authenticated;
grant all on public.user_preferences to anon, authenticated;
grant usage on sequence harmony_assessments_id_seq to anon, authenticated;