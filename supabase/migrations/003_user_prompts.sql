-- 003_user_prompts.sql
-- Adds preferred_language to users and a user_prompts table.

alter table public.users
  add column if not exists preferred_language text;

-- =========
-- USER PROMPTS
-- Stores both selected suggested prompts and custom user-typed prompts.
-- We store the prompt text directly so the record is self-contained
-- even if the source prompt is later removed from the prompts table.
-- =========
create table public.user_prompts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  custom_text text not null,
  created_at  timestamptz not null default now()
);

create index idx_user_prompts_user_id on public.user_prompts(user_id);

alter table public.user_prompts enable row level security;

drop policy if exists "user_prompts_select_own" on public.user_prompts;
create policy "user_prompts_select_own" on public.user_prompts for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "user_prompts_insert_own" on public.user_prompts;
create policy "user_prompts_insert_own" on public.user_prompts for insert
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "user_prompts_delete_own" on public.user_prompts;
create policy "user_prompts_delete_own" on public.user_prompts for delete
  using (user_id = auth.uid() or public.is_admin());
