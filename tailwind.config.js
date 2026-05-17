/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        card: '0 18px 45px rgba(26, 26, 26, 0.08)',
        soft: '0 10px 30px rgba(46, 139, 87, 0.08)',
        ink: '0 20px 55px rgba(26, 26, 26, 0.14)',
      },
      colors: {
        ink: '#1A1A1A',
        deepink: '#333333',
        muted: '#666666',
        lightink: '#999999',
        line: '#E8E1D8',
        coach: '#2E8B57',
        mountain: '#2E8B57',
        seal: '#C41E3A',
        gold: '#D4AF37',
        paper: '#F8F5F0',
        surface: '#F8F5F0',
        rice: '#FAF0E6',
        ivory: '#FFFFF0',
        inkwash: '#F1ECE4',
        night: '#1F2937',
      },
    },
  },
  plugins: [],
};
