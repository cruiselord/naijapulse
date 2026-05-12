import { Suspense } from 'react'
import HomePage from '@/components/home/HomePage'

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-navy-950" />}>
      <HomePage />
    </Suspense>
  )
}
