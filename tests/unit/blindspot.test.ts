import { describe, it, expect } from 'vitest';
import { detectBlindspot } from '@/lib/blindspot/detector';

describe('detectBlindspot', () => {
  it('detects missing left coverage', () => {
    const result = detectBlindspot({ has_left: false, has_center: true, has_right: true });
    expect(result.is_blindspot).toBe(true);
    expect(result.blindspot_lean).toBe('left');
  });

  it('detects missing right coverage', () => {
    const result = detectBlindspot({ has_left: true, has_center: true, has_right: false });
    expect(result.is_blindspot).toBe(true);
    expect(result.blindspot_lean).toBe('right');
  });

  it('does not flag blindspot when only 1 lean covered', () => {
    const result = detectBlindspot({ has_left: false, has_center: true, has_right: false });
    expect(result.is_blindspot).toBe(false);
  });

  it('does not flag blindspot when all leans covered', () => {
    const result = detectBlindspot({ has_left: true, has_center: true, has_right: true });
    expect(result.is_blindspot).toBe(false);
    expect(result.blindspot_lean).toBeNull();
  });
});
