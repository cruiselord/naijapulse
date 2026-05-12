import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MarketsTicker } from '@/components/widgets/MarketsTicker'

export const metadata: Metadata = {
  title: {
    default: 'NaijaPulse — See Every Side of Every Story',
    template: '%s | NaijaPulse',
  },
  description: 'Nigeria\'s bias-aware news aggregator. Compare left, center, and right-leaning coverage of Nigerian and global stories.',
  keywords: ['Nigeria news', 'media bias', 'news aggregator', 'Nigerian journalism'],
  openGraph: {
    title: 'NaijaPulse',
    description: 'See every side of every story — Nigeria\'s bias-aware news aggregator.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-navy-950 text-white antialiased">
        <Navbar />
        <MarketsTicker />
        <div className="pt-[92px]">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
