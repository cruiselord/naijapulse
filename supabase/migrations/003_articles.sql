create table if not exists public.articles (
  id              uuid primary key default uuid_generate_v4(),
  source_id       uuid references public.sources(id) on delete cascade,
  cluster_id      uuid,
  url             text unique not null,
  url_hash        text unique not null,
  title           text not null,
  description     text,
  raw_content     text,
  image_url       text,
  author          text,
  published_at    timestamptz,
  status          text default 'pending',
  
  summary         text,
  category        text,
  sentiment       text,
  bias_score      numeric,
  bias_signals    text[],
  ng_relevance    numeric default 0,
  ng_relevance_reason text,
  embedding       vector(768),
  
  enriched_at     timestamptz,
  created_at      timestamptz default now()
);

create index if not exists idx_articles_source_id on public.articles(source_id);
create index if not exists idx_articles_status on public.articles(status);
create index if not exists idx_articles_published_at on public.articles(published_at desc);
create index if not exists idx_articles_cluster_id on public.articles(cluster_id);
create index if not exists idx_articles_url_hash on public.articles(url_hash);
