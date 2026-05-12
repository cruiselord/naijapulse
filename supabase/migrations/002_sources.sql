create table if not exists public.sources (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  domain          text unique not null,
  rss_url         text,
  country         text default 'NG',
  region          text,
  bias_label      text,
  bias_score      numeric default 0,
  factuality      text,
  factuality_score integer default 0,
  mbfc_rated      boolean default false,
  ai_rated        boolean default false,
  ownership       text,
  description     text,
  logo_url        text,
  is_active       boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_sources_domain on public.sources(domain);
create index if not exists idx_sources_bias_label on public.sources(bias_label);
create index if not exists idx_sources_is_active on public.sources(is_active);
