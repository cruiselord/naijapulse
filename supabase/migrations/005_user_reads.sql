create table if not exists public.user_reads (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references auth.users(id) on delete cascade,
  article_id      uuid references public.articles(id) on delete cascade,
  cluster_id      uuid references public.story_clusters(id) on delete cascade,
  source_bias     text,
  read_at         timestamptz default now(),
  unique(user_id, article_id)
);

create index if not exists idx_user_reads_user_id on public.user_reads(user_id);
