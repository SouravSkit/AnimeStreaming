import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        deep: '#030014',
        'deep-alt': '#0a0520',
        'deep-card': 'rgba(15, 10, 30, 0.85)',
        neon: {
          blue: '#00d4ff',
          purple: '#a855f7',
          crimson: '#ef4444',
          gold: '#f59e0b',
          orange: '#f97316',
          cyan: '#22d3ee',
        },
        energy: {
          purple: '#7c3aed',
          pink: '#ec4899',
        },
        glass: {
          bg: 'rgba(10, 5, 25, 0.6)',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        surface: {
          1: 'rgba(255, 255, 255, 0.03)',
          2: 'rgba(255, 255, 255, 0.06)',
          3: 'rgba(255, 255, 255, 0.1)',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-cinematic': 'linear-gradient(135deg, #030014, #0a0520, #1a0533, #030014)',
        'gradient-energy': 'linear-gradient(135deg, #a855f7, #6366f1, #00d4ff)',
        'gradient-fire': 'linear-gradient(135deg, #ef4444, #f97316, #f59e0b)',
        'gradient-void': 'linear-gradient(180deg, #030014, #0a0520, #030014)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'gradient': 'gradient-shift 8s ease infinite',
        'slide-up': 'slide-up 0.6s ease-out forwards',
        'scale-in': 'scale-in 0.5s ease-out forwards',
        'cinematic-reveal': 'cinematic-reveal 1.2s ease-out forwards',
        'text-glow': 'text-glow-pulse 3s ease-in-out infinite',
        'morph': 'morph-bg 8s ease-in-out infinite',
        'rotate-slow': 'rotate-slow 20s linear infinite',
        'hero-pan': 'hero-pan 20s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'energy-wave': 'energy-wave 2s ease-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      boxShadow: {
        'neon-blue': '0 0 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(0, 212, 255, 0.1)',
        'neon-purple': '0 0 20px rgba(168, 85, 247, 0.3), 0 0 40px rgba(168, 85, 247, 0.1)',
        'neon-crimson': '0 0 20px rgba(239, 68, 68, 0.3), 0 0 40px rgba(239, 68, 68, 0.1)',
        'neon-gold': '0 0 20px rgba(245, 158, 11, 0.3), 0 0 40px rgba(245, 158, 11, 0.1)',
        'cinematic': '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(168, 85, 247, 0.15)',
        'card-hover': '0 15px 50px rgba(168, 85, 247, 0.25), 0 0 20px rgba(0, 212, 255, 0.15)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      screens: {
        'xs': '475px',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(168, 85, 247, 0.3), 0 0 40px rgba(0, 212, 255, 0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(168, 85, 247, 0.6), 0 0 80px rgba(0, 212, 255, 0.3)' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'cinematic-reveal': {
          from: { clipPath: 'inset(0 100% 0 0)', opacity: '0' },
          to: { clipPath: 'inset(0 0% 0 0)', opacity: '1' },
        },
        'text-glow-pulse': {
          '0%, 100%': { textShadow: '0 0 10px rgba(168, 85, 247, 0.5), 0 0 20px rgba(0, 212, 255, 0.3)' },
          '50%': { textShadow: '0 0 20px rgba(168, 85, 247, 0.8), 0 0 40px rgba(0, 212, 255, 0.5)' },
        },
        'morph-bg': {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
        },
        'rotate-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'hero-pan': {
          '0%': { transform: 'scale(1.1) translate(0, 0)' },
          '25%': { transform: 'scale(1.15) translate(-1%, -0.5%)' },
          '50%': { transform: 'scale(1.1) translate(-0.5%, -1%)' },
          '75%': { transform: 'scale(1.15) translate(0.5%, -0.5%)' },
          '100%': { transform: 'scale(1.1) translate(0, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'energy-wave': {
          '0%': { transform: 'scale(0)', opacity: '0.8' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
