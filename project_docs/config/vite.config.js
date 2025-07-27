import { defineConfig } from 'vite'

export default defineConfig({
  root: 'app/static',
  build: {
    outDir: '../../../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'css/style.css',
        components: 'css/components/index.css'
      },
      output: {
        assetFileNames: 'assets/[name]-[hash].[ext]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    }
  },
  css: {
    postcss: {
      plugins: [
        require('autoprefixer')
      ]
    }
  },
  server: {
    watch: {
      usePolling: true
    }
  }
})