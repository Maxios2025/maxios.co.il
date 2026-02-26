import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3001',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [react()],
    // SECURITY: Gemini API key is accessed via import.meta.env.VITE_GEMINI_API_KEY at runtime
    // DO NOT bundle API keys into client JS via define
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      // Target modern browsers for smaller bundles
      target: 'es2020',
      // Enable CSS code splitting — each lazy route gets its own CSS
      cssCodeSplit: true,
      // Minify with esbuild (faster than terser, good enough compression)
      minify: 'esbuild' as const,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-framer': ['framer-motion'],
            'vendor-firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          }
        }
      },
      chunkSizeWarningLimit: 600
    }
  };
});
