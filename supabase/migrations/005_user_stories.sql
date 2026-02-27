-- 005_user_stories.sql
-- Stores written (text) stories for user prompts.
-- One story per user per prompt (unique constraint allows upsert).
-- Voice recordings will use the existing recordings table once
-- the transcription API is integrated.

create table public.user_stories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  prompt_id  uuid not null references public.user_prompts(id) on delete cascade,
  content    text not null,
  language   text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, prompt_id)
);

drop trigger if exists trg_user_stories_updated_at on public.user_stories;
create trigger trg_user_stories_updated_at
before update on public.user_stories
for each row execute function public.set_updated_at();

create index idx_user_stories_user_id   on public.user_stories(user_id);
create index idx_user_stories_prompt_id on public.user_stories(prompt_id);

alter table public.user_stories enable row level security;

drop policy if exists "user_stories_select_own" on public.user_stories;
create policy "user_stories_select_own" on public.user_stories for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "user_stories_insert_own" on public.user_stories;
create policy "user_stories_insert_own" on public.user_stories for insert
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "user_stories_update_own" on public.user_stories;
create policy "user_stories_update_own" on public.user_stories for update
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "user_stories_delete_own" on public.user_stories;
create policy "user_stories_delete_own" on public.user_stories for delete
  using (user_id = auth.uid() or public.is_admin());
