import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { AI_BRIDGE_SCHEMA, AI_TOOL_CATALOG, AI_TOOL_OPERATIONS } from './src/lib/aiToolBridge';

/// <reference types="vitest" />

const aiBridgeStaticJsonPlugin = (): Plugin => {
  return {
    name: 'ai-bridge-static-json',
    apply: 'build',
    generateBundle() {
      const catalogPayload = JSON.stringify(
        {
          endpoint: '/ai-bridge/catalog',
          catalog: AI_TOOL_CATALOG,
          operations: AI_TOOL_OPERATIONS,
        },
        null,
        2,
      );

      const specPayload = JSON.stringify(
        {
          endpoint: '/ai-bridge/spec',
          schema: AI_BRIDGE_SCHEMA,
        },
        null,
        2,
      );

      this.emitFile({
        type: 'asset',
        fileName: 'ai-bridge/catalog.json',
        source: `${catalogPayload}\n`,
      });
      this.emitFile({
        type: 'asset',
        fileName: 'ai-bridge/spec.json',
        source: `${specPayload}\n`,
      });
    },
  };
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const base = process.env.GITHUB_ACTIONS ? '/dev-util-tools/' : '/';
  return {
    base,
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), aiBridgeStaticJsonPlugin()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-radix': [
              '@radix-ui/react-slot',
              '@radix-ui/react-switch',
              '@radix-ui/react-slider',
            ],
            'vendor-ui': [
              'lucide-react',
              'sonner',
              'class-variance-authority',
              'clsx',
              'tailwind-merge',
            ],
          },
        },
      },
    },
  };
});
