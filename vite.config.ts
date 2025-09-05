import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import legacy from "@vitejs/plugin-legacy";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode`
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    define: {
      'process.env.NODE_ENV': `"${mode}"`,
      ...Object.keys(env).reduce((acc: Record<string, string>, key) => {
        if (key.startsWith('VITE_')) {
          acc[`process.env.${key}`] = JSON.stringify(env[key]);
        }
        return acc;
      }, {}),
    },

       base: '/',

    plugins: [
      react({
        tsDecorators: true,
      }),

      legacy({
        targets: ['defaults', 'not IE 11'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
        modernPolyfills: true,
        renderLegacyChunks: true,
        polyfills: true,
      }),

      // ✅ Added Vite PWA Plugin
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Edumall Uganda',
          short_name: 'Edumall',
          description: 'Buy Laboratory materials and equipment and all other school requirements and tools.',
          theme_color: '#fffffff',
          background_color: '#ffffff',
          display: 'standalone',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/web-app-manifest-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/web-app-manifest-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/web-app-manifest-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          runtimeCaching: [
            {
              // Cache API requests
             urlPattern: /^https:\/\/edumall-main-khkttx\.laravel\.cloud\/api\//,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'edumall-api-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24, // 1 day
                },
              },
            },
            {
              // Cache images
              urlPattern: ({ request }) => request.destination === 'image',
              handler: 'CacheFirst',
              options: {
                cacheName: 'edumall-image-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
                },
              },
            },
          ],
        },
      }),
    ],

    build: {
      target: ['es2015', 'safari11'],
      rollupOptions: {
        output: {
          manualChunks: {
            'search-vendor': ['fuse.js'],
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
          entryFileNames: 'assets/[name]-[hash].js',
        },
      },
      chunkSizeWarningLimit: 1500,
      minify: 'terser',
      terserOptions: {
        format: {
          comments: false,
        },
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log'],
        },
        mangle: {
          safari10: true,
        },
      },
      sourcemap: false,
      assetsInlineLimit: 4096,
      emptyOutDir: true,
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
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 8080,
        overlay: true,
      },
    },

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ['fuse.js', 'react', 'react-dom'],
      mainFields: ['browser', 'module', 'main'],
    },

    optimizeDeps: {
      include: ['react', 'react-dom', '@radix-ui/react-tooltip'],
    },
  };
});
