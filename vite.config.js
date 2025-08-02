import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
  css: {
    postcss: './postcss.config.js'
  },
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html',
        analysis: 'analysis.html',
        graphVisualizer: 'graphVisualizer.html'
      }
    }
  }
}) 