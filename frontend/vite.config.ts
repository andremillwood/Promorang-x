import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// https://vitejs.dev/config/
// This configuration ensures proper React deduplication and optimization
// to prevent multiple React instances in production
export default defineConfig({
  plugins: [react()],
  root: '.',
  base: '/',
  // React and dependency configuration
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('scheduler') || id.includes('react-dom')) {
              return 'vendor';
            }
            if (id.includes('react-router') || id.includes('@remix-run/router') || id.includes('history')) {
              return 'router';
            }
            if (id.includes('@radix-ui') || id.includes('lucide-react') || id.includes('framer-motion')) {
              return 'ui';
            }
            if (id.includes('date-fns') || id.includes('zod') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'utils';
            }
            return 'vendor-other';
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const assetName = assetInfo.name || '';
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(assetName)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/\.(woff|woff2|eot|ttf|otf)$/i.test(assetName)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    target: 'esnext',
    modulePreload: {
      polyfill: false
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [
      {
        find: 'react',
        replacement: 'react'
      },
      {
        find: 'react-dom',
        replacement: 'react-dom'
      },
      {
        find: '@',
        replacement: resolve(dirname(fileURLToPath(import.meta.url)), 'src')
      },
      {
        find: '@/react-app',
        replacement: resolve(dirname(fileURLToPath(import.meta.url)), 'src/react-app')
      },
      {
        find: '@/shared',
        replacement: resolve(dirname(fileURLToPath(import.meta.url)), 'src/shared')
      }
    ]
  },
  optimizeDeps: {
    force: true,
    include: ['react', 'react-dom', 'react/jsx-runtime']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      extensions: ['.js', '.cjs'],
      transformMixedEsModules: true
    }
  },
});
