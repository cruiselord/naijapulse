import Parser from 'rss-parser';
import crypto from 'crypto';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'NaijaPulse/1.0 (news aggregator; contact@naijapulse.com)',
  },
});

export interface RawArticle {
  url: string;
  url_hash: string;
  title: string;
  description: string | null;
  raw_content: string | null;
  image_url: string | null;
  author: string | null;
  published_at: Date;
  source_id: string;
}

export async function fetchRssFeed(
  rssUrl: string,
  sourceId: string,
  maxItems: number = 50
): Promise<RawArticle[]> {
  const feed = await parser.parseURL(rssUrl);
  const items = feed.items.slice(0, maxItems);

  return items
    .filter(item => item.link && item.title)
    .map(item => {
      const url = item.link!;
      return {
        url,
        url_hash: crypto.createHash('sha256').update(url).digest('hex'),
        title: item.title!.trim(),
        description: item.contentSnippet || item.summary || null,
        raw_content: item.content || item['content:encoded'] || item.contentSnippet || null,
        image_url: item.enclosure?.url || null,
        author: item.creator || item.author || null,
        published_at: item.pubDate ? new Date(item.pubDate) : new Date(),
        source_id: sourceId,
      };
    });
}

export function hashUrl(url: string): string {
  return crypto.createHash('sha256').update(url).digest('hex');
}
