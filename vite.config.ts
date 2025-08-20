import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      devTools: true,
      // This adds react refresh
      refresh: true,
    })
  ],
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
    target: 'esnext',
    sourcemap: false
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
});
