/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        soc: {
          bg: {
            light: '#F8FAFC',
            dark: '#0B0F19',
          },
          card: {
            light: '#FFFFFF',
            dark: '#111827',
          },
          panel: {
            light: '#F1F5F9',
            dark: '#1F2937',
          },
          border: {
            light: '#E2E8F0',
            dark: '#1F2937',
          },
          accent: '#2563EB',
          'accent-hover': '#1D4ED8',
          success: '#059669',
          warning: '#D97706',
          critical: '#DC2626',
          info: '#2563EB',
          text: {
            main: '#0F172A',
            dark: '#F9FAFB',
            muted: '#64748B',
            'dark-muted': '#9CA3AF',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'soc-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'soc-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'soc-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'soc-card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'soc': '0.75rem', // 12px
      }
    },
  },
  plugins: [],
}
