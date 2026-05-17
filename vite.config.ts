import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const githubRepository = (
  globalThis as typeof globalThis & {
    process?: { env?: { GITHUB_REPOSITORY?: string } };
  }
).process?.env?.GITHUB_REPOSITORY;

export default defineConfig({
  plugins: [react()],
  base: githubRepository ? `/${githubRepository.split('/')[1]}/` : '/',
  server: {
    host: '0.0.0.0',
  },
});
