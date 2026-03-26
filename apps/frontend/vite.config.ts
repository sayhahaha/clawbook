import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// GitHub Pages 部署时 base 路径为仓库名 /clawbook
// 本地开发和内网部署时 base 为 /
const base = process.env.VITE_BASE_URL || '/';

export default defineConfig({
  plugins: [react()],
  base,
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          antd: ['antd'],
        },
      },
    },
  },
});
