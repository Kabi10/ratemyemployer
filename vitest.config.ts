import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/types/',
      ],
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    maxConcurrency: 1,
    maxWorkers: 1,
    minWorkers: 1,
    silent: true,
    sequence: {
      shuffle: false,
    },
    reporters: ['basic'],
    onConsoleLog: (log, _type) => {
      if (log.includes('node_modules')) return false;
      return true;
    },
  },
});