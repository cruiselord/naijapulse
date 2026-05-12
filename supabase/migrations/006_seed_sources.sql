-- Nigerian Sources (manually verified + MBFC cross-referenced)
insert into public.sources (name, domain, rss_url, country, region, bias_label, bias_score, factuality, factuality_score, mbfc_rated) values
  ('Punch Nigeria',       'punchng.com',          'https://punchng.com/feed/',                        'NG', 'nigeria',  'center',       0.0,  'high',      75, true),
  ('Premium Times',       'premiumtimesng.com',   'https://www.premiumtimesng.com/feed',              'NG', 'nigeria',  'center',       0.0,  'high',      80, true),
  ('The Guardian Nigeria','guardian.ng',           'https://guardian.ng/feed/',                        'NG', 'nigeria',  'center',       0.0,  'high',      78, true),
  ('Vanguard Nigeria',    'vanguardngr.com',       'https://www.vanguardngr.com/feed/',               'NG', 'nigeria',  'center',       0.1,  'mixed',     60, true),
  ('ThisDay Live',        'thisdaylive.com',       'https://www.thisdaylive.com/index.php/feed/',     'NG', 'nigeria',  'center-right', 0.5,  'high',      72, true),
  ('Daily Trust',         'dailytrust.com',        'https://dailytrust.com/feed/',                    'NG', 'nigeria',  'center',       0.0,  'high',      76, true),
  ('BusinessDay NG',      'businessday.ng',        'https://businessday.ng/feed/',                    'NG', 'nigeria',  'center',      -0.1,  'high',      82, true),
  ('Sahara Reporters',    'saharareporters.com',   'https://saharareporters.com/rss.xml',             'NG', 'nigeria',  'left',        -1.0,  'mixed',     55, true),
  ('Channels TV',         'channelstv.com',        'https://www.channelstv.com/feed/',                'NG', 'nigeria',  'center',       0.0,  'high',      80, true),
  ('NAN Nigeria',         'nan.ng',                'https://nan.ng/feed/',                            'NG', 'nigeria',  'center-right', 0.6,  'mixed',     58, true),
  ('The Cable',           'thecable.ng',           'https://www.thecable.ng/feed',                   'NG', 'nigeria',  'center',      -0.1,  'high',      77, true),
  ('Nairaland Forum',     'nairaland.com',         null,                                              'NG', 'nigeria',  'unknown',      0.0,  'mixed',     40, false),
  ('Nairametrics',        'nairametrics.com',      'https://nairametrics.com/feed/',                  'NG', 'nigeria',  'center',       0.0,  'high',      75, true),
  ('TechCabal',           'techcabal.com',         'https://techcabal.com/feed/',                    'NG', 'nigeria',  'center',       0.0,  'high',      80, true),
  ('Stears',              'stears.co',             null,                                              'NG', 'nigeria',  'center',       0.0,  'high',      78, false),
  ('BBC News',            'bbc.com',               'https://feeds.bbci.co.uk/news/world/africa/rss.xml', 'GB', 'global', 'center',  -0.2, 'very-high', 90, true),
  ('Reuters',             'reuters.com',           'https://feeds.reuters.com/reuters/africaNews',   'GB', 'global',  'center',      -0.1,  'very-high', 92, true),
  ('Al Jazeera',          'aljazeera.com',         'https://www.aljazeera.com/xml/rss/all.xml',      'QA', 'global',  'center-left', -0.5,  'high',      82, true),
  ('CNN',                 'cnn.com',               'https://rss.cnn.com/rss/edition_africa.rss',     'US', 'global',  'center-left', -0.8,  'high',      78, true),
  ('The Guardian UK',     'theguardian.com',       'https://www.theguardian.com/world/africa/rss',   'GB', 'global',  'left',        -1.2,  'high',      82, true)
on conflict (domain) do nothing;
