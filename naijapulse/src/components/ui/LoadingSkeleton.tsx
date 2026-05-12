import { cn } from '@/lib/utils'

interface SkeletonProps { className?: string }

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('rounded-lg animate-shimmer', className)}
      style={{
        background: 'linear-gradient(90deg, #0F2040 25%, #162B56 50%, #0F2040 75%)',
        backgroundSize: '200% 100%',
      }}
    />
  )
}

export function StoryCardSkeleton() {
  return (
    <div className="rounded-2xl bg-navy-900 border border-navy-800 p-5 space-y-3">
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-28" />
      </div>
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-3/4" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-2.5 w-full rounded-full" />
    </div>
  )
}

export function SourceCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-navy-900 border border-navy-800">
      <Skeleton className="h-9 w-9 rounded-lg" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}
