/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#0A0A14',
          card: '#12121F',
          elevated: '#1A1A2E',
          border: '#2A2A45',
        },
        brand: {
          purple: '#7C6FF7',
          'purple-light': '#A09AF7',
          'purple-dim': '#3D3878',
          pink: '#F06292',
          teal: '#26C6DA',
          green: '#66BB6A',
          orange: '#FFA726',
          red: '#EF5350',
        },
        meta: {
          blue: '#1877F2',
          'blue-light': '#4A9CF7',
        },
        google: {
          blue: '#4285F4',
          red: '#EA4335',
          yellow: '#FBBC04',
          green: '#34A853',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
