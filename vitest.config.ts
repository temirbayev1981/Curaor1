import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/lib/**', 'src/domain/**'],
      exclude: [
        '**/register-consumers.ts',
        '**/contract-pdf.service.ts',
        '**/ai-content.service.ts',
        '**/tenant.schema.ts',
        '**/locales/**',
        '**/city-content.ts',
        '**/i18n/server.ts',
        '**/i18n/booking-status.ts',
        '**/lib/supabase/client.ts',
        '**/lib/supabase/server.ts',
        '**/resolve-tenant.ts',
      ],
      thresholds: {
        lines: 50,
        functions: 50,
        branches: 40,
        statements: 50,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
