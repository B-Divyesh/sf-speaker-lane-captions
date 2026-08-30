import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        app: resolve(__dirname, 'index.html'),
        privacy: resolve(__dirname, 'privacy/index.html'),
        terms: resolve(__dirname, 'terms/index.html'),
        offline: resolve(__dirname, 'offline.html'),
        notFound: resolve(__dirname, '404.html')
      }
    }
  },
  test: { environment: 'jsdom', include: ['tests/unit/**/*.test.ts'] }
});
