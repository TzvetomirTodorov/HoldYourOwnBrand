/**
 * Vitest Configuration for HYOW E-Commerce
 * 
 * This configures Vitest to work with:
 * - React components (via @vitejs/plugin-react)
 * - jsdom for DOM testing
 * - Path aliases matching your Vite config
 * - Coverage reporting
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom for DOM testing (simulates browser environment)
    environment: 'jsdom',
    
    // Global test setup file
    setupFiles: ['./src/test/setup.js'],
    
    // Enable global test functions (describe, it, expect) without imports
    globals: true,
    
    // CSS handling - don't process CSS in tests
    css: false,
    
    // Include patterns for test files
    include: [
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    ],
    
    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
    ],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.js',
      ],
      // Thresholds - adjust these as your test coverage grows
      // thresholds: {
      //   lines: 50,
      //   functions: 50,
      //   branches: 50,
      //   statements: 50,
      // },
    },
    
    // Reporter options
    reporters: ['default'],
    
    // Timeout for each test (ms)
    testTimeout: 10000,
    
    // Watch mode exclude patterns
    watchExclude: ['node_modules', 'dist'],
  },
  
  // Path aliases (should match your vite.config.js)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@store': path.resolve(__dirname, './src/store'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
    },
  },
});
