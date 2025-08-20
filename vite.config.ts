import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    define: {
      // Prevent environment variables from being included in the bundle
      'process.env.NODE_ENV': `"${mode}"`,
      // Only include public env vars (VITE_ prefixed)
      ...Object.keys(env).reduce((acc: Record<string, string>, key) => {
        if (key.startsWith('VITE_')) {
          acc[`process.env.${key}`] = JSON.stringify(env[key]);
        }
        return acc;
      }, {}),
    },
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'ui-vendor': [
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            'framer-motion'
          ],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'form-vendor': ['@hookform/resolvers', 'react-hook-form', 'zod'],
          'utils-vendor': ['date-fns', 'axios', 'lodash'],
          'ai-vendor': ['@google/generative-ai', '@huggingface/inference'],
          'maps-vendor': ['@react-google-maps/api', '@googlemaps/js-api-loader']
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    },
    chunkSizeWarningLimit: 1500,
    minify: 'terser',
    terserOptions: {
      format: {
        comments: false
      },
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log']
      },
      mangle: {
        safari10: true,
      }
    },
    target: 'esnext',
    sourcemap: false,
    // Ensure environment variables are correctly handled in production
    assetsInlineLimit: 4096,
    emptyOutDir: true
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
    host: "localhost",
    port: 8080,
    // Ensure HMR works correctly
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 8080,
      overlay: true,
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add React optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', '@radix-ui/react-tooltip'],
  }
  };
});
