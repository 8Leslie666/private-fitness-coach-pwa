/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        card: '0 18px 45px rgba(24, 35, 73, 0.08)',
        soft: '0 10px 30px rgba(37, 99, 235, 0.08)',
      },
      colors: {
        ink: '#182349',
        muted: '#697184',
        line: '#e8ecf4',
        coach: '#2563eb',
        surface: '#f7f8fb',
        wheat: '#f6c85f',
        night: '#1d3f8f',
      },
    },
  },
  plugins: [],
};
