import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  root: '.',
  base: '/',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    headers: {
      'Content-Security-Policy': "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https: http://localhost:3001; " +
        "font-src 'self' data:; " +
        "connect-src 'self' http://localhost:3001 https://api.promorang.co https://dnysosmscoceplvcejkv.supabase.co;"
    }
  },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, './src')
      },
      {
        find: '@/react-app',
        replacement: resolve(__dirname, './src/react-app')
      },
      {
        find: '@/shared',
        replacement: resolve(__dirname, './src/shared')
      }
    ],
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
    preserveSymlinks: false
  },
  optimizeDeps: {
    entries: ["src/react-app/**/*.{ts,tsx}"],
    // Exclude backup files from optimization
    exclude: [], // Temporarily removed problematic patterns
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-dom/client',
      'react-is',
      'recharts',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      'framer-motion',
      '@supabase/supabase-js',
      '@supabase/auth-helpers-react'
    ],
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
        '.ts': 'ts',
        '.tsx': 'tsx'
      },
      // Ensure React is properly handled
      treeShaking: true,
      define: {
        global: 'globalThis',
      },
      target: 'es2020',
      jsx: 'automatic',
      jsxDev: false,
      jsxImportSource: 'react'
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV !== 'production',
    manifest: true,
    target: 'es2020',
    minify: 'terser',
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules\/recharts/, /node_modules/],
      ignoreDynamicRequires: true,
      dynamicRequireTargets: [],
      esmExternals: true,
      strictRequires: true
    },
    modulePreload: {
      polyfill: true
    },
    rollupOptions: {
      // Don't externalize React - we want it bundled
      // external: ['react', 'react-dom'],
      output: {
        format: 'esm',
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`
      }
    },
    terserOptions: {
      compress: {
        drop_console: false,
        ecma: 2020,
        keep_fnames: false,
        module: true,
        toplevel: true,
        unsafe: false,
        unsafe_arrows: false,
        unsafe_methods: false,
        unsafe_proto: false,
        unsafe_undefined: true,
      },
      format: {
        comments: false,
        ecma: 2020,
      },
      mangle: {
        module: true,
        toplevel: true,
      },
    },
  },
  plugins: [
    react({
      jsxImportSource: 'react',
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', {
            runtime: 'automatic',
            importSource: 'react'
          }]
        ]
      }
    })
  ]
});
