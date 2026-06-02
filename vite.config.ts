import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  build: {
    minify: false,
    sourcemap: true,
    // Контроль имен файлов
    rollupOptions: {
      output: {
        // Формат имен файлов
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    },
    // Путь для сборки
    outDir: 'dist',
    // Очистка output директории
    emptyOutDir: true,
  }
})
