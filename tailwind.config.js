/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Tight"', 'Inter', 'sans-serif'],
      },
      colors: {
        'accent-button': 'var(--color-accent-button)',
        'accent-graphic': 'var(--color-accent-graphic)',
        'bg-light': 'var(--color-bg-light)',
        'bg-dark': 'var(--color-bg-dark)',
        'text-main': 'var(--color-text-main)',
        'neutral-850': '#222222',
        'neutral-750': '#333333',
        'neutral-450': '#A3A3A3',
        'neutral-350': '#D4D4D4',
      },
    },
  },
  plugins: [],
}
