/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0D47A1',
          light: '#1565C0',
          dark: '#0A3470',
        },
        secondary: '#1976D2',
        background: '#F5F7FA',
        surface: '#FFFFFF',
        'surface-variant': '#F0F4F8',
        'text-primary': '#1A1A2E',
        'text-secondary': '#6B7280',
        'text-hint': '#9CA3AF',
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
        urgent: '#FF6B35',
        border: '#E5E7EB',
        'border-light': '#F3F4F6',
        price: '#059669',
        badge: '#EF4444',
        online: '#10B981',
        offline: '#9CA3AF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};