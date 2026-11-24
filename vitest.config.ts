import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/services/**', 'src/domain/**', 'src/components/**', 'src/app/**'],
      exclude: [
        'src/test/**',
        'src/app/layout.tsx',
        'src/domain/types.ts',
        '**/*.d.ts',
      ],
      thresholds: {
        lines: 95,
        branches: 85,
        functions: 95,
        statements: 95,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
