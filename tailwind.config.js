/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0faf1',
          100: '#d9f3db',
          200: '#b3e6b8',
          300: '#7dd487',
          400: '#51c464',
          500: '#34b84a',
          600: '#27a03b',
          700: '#1f7d2e',
          800: '#1a6325',
          900: '#155120',
        },
        fin: {
          green: '#34b84a',
          'green-dark': '#27a03b',
          red: '#ef4444',
          'red-light': '#fef2f2',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #51c464 0%, #27a03b 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, #f0faf1 0%, #d9f3db 100%)',
      },
    },
  },
  plugins: [],
}
