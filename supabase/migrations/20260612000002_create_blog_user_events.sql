-- Blog user events table
-- Used by: TrafficTab.tsx, AdminBlogOverview.tsx, AdminBlogEngagement.tsx
-- Tracks reader behaviour: views, scroll depth, read time, CTA clicks, shares

create table if not exists public.blog_user_events (
  id            uuid primary key default gen_random_uuid(),
  article_id    uuid references public.blog_posts(id) on delete cascade,
  user_id       uuid references auth.users(id) on delete set null,
  event_type    text not null,       -- 'article_view' | 'page_view' | 'scroll_depth' | 'reading_time' | 'cta_click' | 'share_click'
  metadata      jsonb,               -- event-specific payload (e.g. {depth: 80}, {time_spent_seconds: 120})
  referrer      text,
  device        text,               -- 'mobile' | 'tablet' | 'desktop'
  created_at    timestamptz not null default now()
);

-- Indexes for the queries used in the admin panel
create index if not exists blog_user_events_article_id_idx on public.blog_user_events (article_id);
create index if not exists blog_user_events_event_type_idx on public.blog_user_events (event_type);
create index if not exists blog_user_events_created_at_idx on public.blog_user_events (created_at desc);

-- RLS: read allowed to authenticated admins, insert allowed to public (anonymous tracking)
alter table public.blog_user_events enable row level security;

create policy "Admins can read blog_user_events"
  on public.blog_user_events for select
  using (auth.role() = 'authenticated');

create policy "Anyone can insert blog_user_events"
  on public.blog_user_events for insert
  with check (true);
