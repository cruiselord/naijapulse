import { describe, it, expect } from 'vitest';
import { hashUrl } from '@/lib/ingestion/rss';

describe('hashUrl', () => {
  it('returns consistent hash for same url', () => {
    const url = 'https://punchng.com/article/123';
    expect(hashUrl(url)).toBe(hashUrl(url));
  });

  it('returns different hashes for different urls', () => {
    expect(hashUrl('https://a.com')).not.toBe(hashUrl('https://b.com'));
  });

  it('returns 64 character hex string (SHA-256)', () => {
    const hash = hashUrl('https://test.com/article');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
