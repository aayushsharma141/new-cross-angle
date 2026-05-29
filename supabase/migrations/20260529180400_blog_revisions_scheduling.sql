-- Blog revision history & scheduled publishing

-- 1. Create blog_revisions table
create table if not exists public.blog_revisions (
  id uuid primary key default gen_random_uuid(),
  blog_post_id uuid not null references public.blog_posts(id) on delete cascade,
  title text not null,
  content text,
  excerpt text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_blog_revisions_post_id on public.blog_revisions(blog_post_id);

alter table public.blog_revisions enable row level security;

create policy "Authenticated users can view revisions"
  on public.blog_revisions for select
  to authenticated
  using (true);

create policy "Authenticated users can insert revisions"
  on public.blog_revisions for insert
  to authenticated
  with check (true);

-- 2. Add scheduled_at to blog_posts
alter table public.blog_posts
  add column if not exists scheduled_at timestamptz;

-- 3. Trigger to auto-save revision on blog_posts UPDATE
create or replace function public.fn_save_blog_revision()
returns trigger as $$
begin
  insert into public.blog_revisions (blog_post_id, title, content, excerpt, user_id)
  values (old.id, old.title, old.content::text, old.excerpt, auth.uid());
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_blog_revision_on_update on public.blog_posts;

create trigger trg_blog_revision_on_update
  before update on public.blog_posts
  for each row
  execute function public.fn_save_blog_revision();
