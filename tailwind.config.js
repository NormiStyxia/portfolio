/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        mist: '#f7fbff',
        shell: '#eef7ff',
        skyglass: '#d9ecfa',
        ink: '#27364b',
        muted: '#6d7f96',
        line: '#bed7eb',
        gold: '#d8b978',
      },
      boxShadow: {
        panel: '0 18px 55px rgba(82, 126, 168, 0.18)',
      },
      fontFamily: {
        title: ['var(--font-title)'],
        body: ['var(--font-body)'],
        ui: ['var(--font-ui)'],
      },
    },
  },
  plugins: [],
};
