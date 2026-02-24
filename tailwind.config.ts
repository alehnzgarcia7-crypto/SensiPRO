import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    './packages/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#050810',
          card: '#0a0f1e',
          elevated: '#111a30',
          hover: '#162040',
        },
        fire: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#ff6a00',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        ice: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#00c8ff',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        success: '#22c55e',
        warning: '#eab308',
        danger: '#ef4444',
        info: '#3b82f6',
        tier: {
          free: '#94a3b8',
          premium: '#f59e0b',
          vip: '#a855f7',
        },
        style: {
          aggressive: '#ef4444',
          balanced: '#3b82f6',
          sniper: '#22c55e',
        },
        neon: {
          pink: '#ff006e',
          green: '#39ff14',
          blue: '#00f0ff',
          purple: '#bf00ff',
          yellow: '#ffe600',
        },
      },
      fontFamily: {
        body: ['Chakra Petch', 'sans-serif'],
        display: ['Exo 2', 'sans-serif'],
        ui: ['Rajdhani', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'gaming': '12px',
      },
      boxShadow: {
        'glow-fire': '0 0 20px rgba(255, 106, 0, 0.3)',
        'glow-ice': '0 0 20px rgba(0, 200, 255, 0.3)',
        'glow-premium': '0 0 20px rgba(245, 158, 11, 0.3)',
        'glow-vip': '0 0 20px rgba(168, 85, 247, 0.3)',
        'glow-success': '0 0 20px rgba(34, 197, 94, 0.3)',
        'glow-danger': '0 0 20px rgba(239, 68, 68, 0.3)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.6)',
      },
      backgroundImage: {
        'gradient-fire': 'linear-gradient(135deg, #ff6a00, #ee0979)',
        'gradient-ice': 'linear-gradient(135deg, #00c8ff, #0072ff)',
        'gradient-fire-ice': 'linear-gradient(90deg, #ff6a00, #00c8ff)',
        'gradient-premium': 'linear-gradient(135deg, #f59e0b, #ef4444)',
        'gradient-vip': 'linear-gradient(135deg, #a855f7, #6366f1)',
        'gradient-dark': 'linear-gradient(135deg, #0a0f1e, #111a30)',
        'gradient-card': 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-fire': 'pulseFire 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'count-up': 'countUp 1s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { textShadow: '0 0 5px rgba(255, 106, 0, 0.5)' },
          '100%': { textShadow: '0 0 20px rgba(255, 106, 0, 0.8), 0 0 40px rgba(255, 106, 0, 0.3)' },
        },
        pulseFire: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(255, 106, 0, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(255, 106, 0, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      screens: {
        'xs': '375px',
        'gaming': '1440px',
      },
    },
  },
  plugins: [],
};

export default config;
