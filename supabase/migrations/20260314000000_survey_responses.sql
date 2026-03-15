-- 20260314000000_survey_responses.sql

create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  email text,
  age_range text,
  family_conversation_frequency text,
  family_conversation_frequency_other text,
  preservation_importance int,
  has_documented text,
  capture_methods text[],
  capture_methods_other text,
  difficulties text[],
  difficulties_other text,
  preferred_formats text[],
  preferred_formats_other text,
  purchase_intent text,
  anything_else text,
  early_access_info text,
  created_at timestamptz not null default now()
);

alter table public.survey_responses enable row level security;

-- Anyone (unauthenticated) can submit a response
create policy "survey_responses_insert_public"
on public.survey_responses for insert
with check (true);

-- Only admins can read responses
create policy "survey_responses_select_admin"
on public.survey_responses for select
using (public.is_admin());
