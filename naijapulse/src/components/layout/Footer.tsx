import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-navy-800 bg-navy-950 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-0.5 mb-3">
              <span className="font-serif font-black text-gold-500 text-lg">Naija</span>
              <span className="font-serif font-black text-white text-lg">Pulse</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              See every side of every story. Nigeria's only news aggregator that shows you media bias, 
              blindspots, and multi-perspective coverage.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="text-gray-600 hover:text-gold-500 transition-colors text-sm">
                𝕏 Twitter
              </a>
              <span className="text-navy-700">·</span>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="text-gray-600 hover:text-gold-500 transition-colors text-sm">
                Instagram
              </a>
            </div>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Navigate</h4>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Top Stories' },
                { href: '/blindspots', label: 'Blindspots' },
                { href: '/sources', label: 'Sources' },
                { href: '/?cat=politics', label: 'Politics' },
                { href: '/?cat=business', label: 'Business' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-500 hover:text-gold-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">About</h4>
            <ul className="space-y-2">
              {[
                { href: '/about', label: 'About NaijaPulse' },
                { href: '/methodology', label: 'Our Methodology' },
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms of Use' },
                { href: '/contact', label: 'Contact Us' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-500 hover:text-gold-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-navy-900 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-700">
            © {new Date().getFullYear()} NaijaPulse. Built for a more informed Nigeria.
          </p>
          <p className="text-[10px] text-gray-800">
            Bias ratings powered by MBFC · AI by Ollama (Llama 3.1)
          </p>
        </div>
      </div>
    </footer>
  )
}
