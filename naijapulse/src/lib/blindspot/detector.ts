interface ClusterCoverage {
  has_left:   boolean
  has_center: boolean
  has_right:  boolean
}

export function detectBlindspot(cluster: ClusterCoverage): {
  is_blindspot:   boolean
  blindspot_lean: 'left' | 'center' | 'right' | null
} {
  const covered = [cluster.has_left, cluster.has_center, cluster.has_right].filter(Boolean).length
  if (covered < 2) return { is_blindspot: false, blindspot_lean: null }
  if (!cluster.has_left)   return { is_blindspot: true, blindspot_lean: 'left' }
  if (!cluster.has_right)  return { is_blindspot: true, blindspot_lean: 'right' }
  if (!cluster.has_center) return { is_blindspot: true, blindspot_lean: 'center' }
  return { is_blindspot: false, blindspot_lean: null }
}
