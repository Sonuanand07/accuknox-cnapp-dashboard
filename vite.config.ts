import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// `base: './'` keeps asset URLs relative, so the same build works on GitHub Pages
// (served from /<repo>/), Netlify, Vercel or any static host without extra config.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? './',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: false,
  },
});
