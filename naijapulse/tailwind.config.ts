import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#050D1A',
          900: '#0A1628',
          800: '#0F2040',
          700: '#162B56',
          600: '#1E3A6E',
          500: '#264880',
        },
        gold: {
          300: '#FFE066',
          400: '#F5C842',
          500: '#E8B800',
          600: '#CC9F00',
        },
        bias: {
          left:          '#3B82F6',
          'center-left': '#60A5FA',
          center:        '#6B7280',
          'center-right':'#F97316',
          right:         '#EF4444',
        },
        fact: {
          'very-high': '#10B981',
          high:        '#34D399',
          mixed:       '#F59E0B',
          low:         '#EF4444',
          'very-low':  '#7F1D1D',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans:  ['DM Sans', 'system-ui', 'sans-serif'],
        mono:  ['DM Mono', 'monospace'],
      },
      animation: {
        'fade-up':    'fadeUp 0.5s ease-out both',
        'fade-in':    'fadeIn 0.4s ease-out both',
        'slide-down': 'slideDown 0.35s ease-out both',
        'bias-fill':  'biasFill 0.7s ease-out both',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'ticker':     'tickerScroll 40s linear infinite',
        'shimmer':    'shimmer 1.8s infinite',
        'spin-slow':  'spin 3s linear infinite',
      },
      keyframes: {
        fadeUp:       { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:       { from: { opacity: '0' }, to: { opacity: '1' } },
        slideDown:    { from: { opacity: '0', transform: 'translateY(-16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        biasFill:     { from: { width: '0%', opacity: '0' }, to: { width: 'var(--fill-width, 100%)', opacity: '1' } },
        pulseGold:    { '0%, 100%': { boxShadow: '0 0 0 0 rgba(232,184,0,0.5)' }, '50%': { boxShadow: '0 0 0 10px rgba(232,184,0,0)' } },
        tickerScroll: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        shimmer:      { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      boxShadow: {
        'gold': '0 0 0 1px #E8B800, 0 8px 32px rgba(232,184,0,0.15)',
        'card': '0 4px 24px rgba(0,0,0,0.3)',
        'card-hover': '0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px #E8B800',
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
}

export default config
