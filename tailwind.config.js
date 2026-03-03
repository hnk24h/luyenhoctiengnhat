/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary:  { DEFAULT: '#3D3A8C', hover: '#312E7A', light: '#EEEDF8' },
        accent:   { DEFAULT: '#C84B31', light: '#FDF0EE' },
        surface:  '#FFFFFF',
        base:     '#F7F6F2',
        muted:    '#EFEDE7',
        border:   '#E2E0D8',
        ink:      { primary: '#1C1B2E', secondary: '#5B5870', muted: '#9897A8' },
      },
      fontFamily: {
        sans:     ['var(--font-inter)', 'Noto Sans JP', 'sans-serif'],
        jp:       ['Noto Sans JP', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px', DEFAULT: '12px', lg: '16px', xl: '20px', '2xl': '24px',
      },
      boxShadow: {
        sm:  '0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)',
        DEFAULT: '0 4px 12px rgba(0,0,0,.07), 0 1px 3px rgba(0,0,0,.05)',
        lg:  '0 8px 24px rgba(0,0,0,.09), 0 2px 6px rgba(0,0,0,.05)',
        primary: '0 4px 14px rgba(61,58,140,.3)',
      },
      animation: {
        'fade-up': 'fadeUp 0.35s ease forwards',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
