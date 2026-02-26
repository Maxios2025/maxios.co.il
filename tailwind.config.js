/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './*.{tsx,ts}',
    './components/**/*.{tsx,ts}',
    './pages/**/*.{tsx,ts}',
    './lib/**/*.{tsx,ts}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        arabic: ['Cairo', 'Tajawal', 'Noto Sans Arabic', 'sans-serif'],
        hebrew: ['IBM Plex Sans Hebrew', 'Arial Hebrew', 'sans-serif'],
      },
      animation: {
        'hero-bounce': 'hero-bounce 1.5s ease-in-out infinite',
      },
      keyframes: {
        'hero-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(10px)' },
        },
      },
    },
  },
  plugins: [],
};