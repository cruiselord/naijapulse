create table if not exists public.story_clusters (
  id              uuid primary key default uuid_generate_v4(),
  headline        text not null,
  summary         text,
  summary_left    text,
  summary_center  text,
  summary_right   text,
  category        text,
  article_count   integer default 0,
  source_count    integer default 0,
  
  left_count      integer default 0,
  center_count    integer default 0,
  right_count     integer default 0,
  has_left        boolean default false,
  has_center      boolean default false,
  has_right       boolean default false,
  
  is_blindspot    boolean default false,
  blindspot_lean  text,
  
  ng_relevance    numeric default 0,
  
  first_seen_at   timestamptz default now(),
  last_updated_at timestamptz default now()
);

alter table if exists public.articles
  add constraint fk_articles_cluster
  foreign key (cluster_id) references public.story_clusters(id) on delete set null;

create index if not exists idx_clusters_is_blindspot on public.story_clusters(is_blindspot);
create index if not exists idx_clusters_ng_relevance on public.story_clusters(ng_relevance desc);
create index if not exists idx_clusters_last_updated on public.story_clusters(last_updated_at desc);
create index if not exists idx_clusters_category on public.story_clusters(category);
