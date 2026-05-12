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
          400: '#F5C842',
          500: '#E8B800',
          600: '#CC9F00',
        },
        bias: {
          left: '#3B82F6',
          'center-left': '#60A5FA',
          center: '#6B7280',
          'center-right': '#F97316',
          right: '#EF4444',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      animation: {
        'bias-fill': 'biasFill 0.8s ease-out forwards',
        'fade-up': 'fadeUp 0.4s ease-out forwards',
        'slide-in': 'slideIn 0.3s ease-out forwards',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        biasFill: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--fill-width)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(232, 184, 0, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(232, 184, 0, 0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
