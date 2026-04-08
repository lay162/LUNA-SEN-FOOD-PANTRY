import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth']
        }
      }
    }
  },

  // Development server
  server: {
    port: 3000,
    host: true,
    open: true
  },

  // Preview server
  preview: {
    port: 4173,
    host: true
  },

  // Environment variables
  define: {
    __DEV__: JSON.stringify(mode === 'development'),
  },

  // Asset handling
  assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.ico'],

  // CSS configuration
  css: {
    postcss: './postcss.config.js'
  }
}))
