import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'SF Pro Text',
          'Inter',
          'Segoe UI',
          'sans-serif',
        ],
      },
      boxShadow: {
        glass: '0 24px 60px rgba(24, 36, 52, 0.13), inset 0 1px 0 rgba(255,255,255,0.72)',
        'glass-dark': '0 28px 80px rgba(0,0,0,0.36), inset 0 1px 0 rgba(255,255,255,0.18)',
        blue: '0 12px 38px rgba(58,130,247,0.28)',
      },
      keyframes: {
        'page-in': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'soft-breathe': {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 16px 44px rgba(58,130,247,0.25)' },
          '50%': { transform: 'scale(1.015)', boxShadow: '0 18px 56px rgba(58,130,247,0.36)' },
        },
        'bar-flow': {
          '0%': { transform: 'translateX(-18%) rotate(-2deg)' },
          '50%': { transform: 'translateX(6%) rotate(1deg)' },
          '100%': { transform: 'translateX(-18%) rotate(-2deg)' },
        },
        'ring-orbit': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'water-rise': {
          '0%': { transform: 'translateY(16px)' },
          '100%': { transform: 'translateY(0)' },
        },
        'drawer-in': {
          '0%': { transform: 'translateY(104%) scale(0.98)' },
          '100%': { transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'page-in': 'page-in 520ms cubic-bezier(.2,.8,.2,1) both',
        'soft-breathe': 'soft-breathe 3.6s ease-in-out infinite',
        'bar-flow': 'bar-flow 8s ease-in-out infinite',
        'ring-orbit': 'ring-orbit 9s linear infinite',
        'water-rise': 'water-rise 720ms cubic-bezier(.2,.8,.2,1) both',
        'drawer-in': 'drawer-in 560ms cubic-bezier(.18,1.16,.25,1) both',
      },
    },
  },
  plugins: [],
} satisfies Config;
