import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/private-fitness-coach-pwa/' : '/',
  server: {
    host: '0.0.0.0',
  },
}));
