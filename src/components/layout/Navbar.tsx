'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/',              label: 'Top Stories' },
  { href: '/blindspots',    label: 'Blindspots' },
  { href: '/?cat=politics', label: 'Politics' },
  { href: '/?cat=business', label: 'Business' },
  { href: '/?cat=security', label: 'Security' },
  { href: '/?cat=tech',     label: 'Tech' },
  { href: '/sources',       label: 'Sources' },
]

export function Navbar() {
  const [scrolled, setScrolled]       = useState(false)
  const [menuOpen, setMenuOpen]       = useState(false)
  const pathname                       = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 inset-x-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-navy-950/95 backdrop-blur-md border-b border-navy-800 shadow-xl'
            : 'bg-navy-950 border-b border-navy-900'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14 gap-6">
            <Link href="/" className="flex-shrink-0 flex items-center gap-0.5">
              <span className="font-serif font-black text-gold-500 text-xl tracking-tight leading-none">
                Naija
              </span>
              <span className="font-serif font-black text-white text-xl tracking-tight leading-none">
                Pulse
              </span>
              <span className="ml-1.5 text-[8px] font-bold text-navy-600 bg-navy-800 px-1.5 py-0.5 rounded uppercase tracking-widest">
                Beta
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-0.5 flex-1 overflow-x-auto" aria-label="Main navigation">
              {NAV_LINKS.map(link => {
                const isActive = link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href.split('?')[0]) && link.href !== '/'

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150',
                      isActive
                        ? 'text-gold-400 bg-gold-500/10'
                        : 'text-gray-400 hover:text-white hover:bg-navy-800'
                    )}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            <div className="flex items-center gap-2 ml-auto">
              <button
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-navy-800 transition-colors"
                aria-label="Search"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </button>

              <Link
                href="/"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 text-xs font-medium text-gray-300 hover:bg-navy-700 transition-colors"
                title="Nigerian Lens filter"
              >
                🇳🇬 <span className="text-gold-400 font-bold">Lens</span>
              </Link>

              <Link
                href="/auth"
                className="px-3 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-bold transition-colors"
              >
                Sign In
              </Link>

              <button
                className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-navy-800 transition-colors"
                onClick={() => setMenuOpen(m => !m)}
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {menuOpen
                    ? <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>
                    : <><path d="M4 6h16M4 12h16M4 18h16"/></>
                  }
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <nav
            className="absolute top-14 inset-x-0 bg-navy-900 border-b border-navy-800 py-3 px-4 animate-slide-down"
            onClick={e => e.stopPropagation()}
          >
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-3 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-navy-800 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
