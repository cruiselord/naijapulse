import type { StoryCluster } from '@/types';

export function detectBlindspot(cluster: Pick<StoryCluster, 'has_left' | 'has_center' | 'has_right'>): {
  is_blindspot: boolean;
  blindspot_lean: 'left' | 'center' | 'right' | null;
} {
  // Only flag as blindspot if at least 2 leans are present (enough coverage to compare)
  const covered = [cluster.has_left, cluster.has_center, cluster.has_right].filter(Boolean).length;
  
  if (covered < 2) {
    return { is_blindspot: false, blindspot_lean: null };
  }

  if (!cluster.has_left) return { is_blindspot: true, blindspot_lean: 'left' };
  if (!cluster.has_right) return { is_blindspot: true, blindspot_lean: 'right' };
  if (!cluster.has_center) return { is_blindspot: true, blindspot_lean: 'center' };

  return { is_blindspot: false, blindspot_lean: null };
}
