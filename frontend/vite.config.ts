import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // An empty prefix loads every variable from .env, not only VITE_-prefixed ones.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss()],
    resolve: { alias: { '@': path.resolve(__dirname, './src') } },
    server: {
      port: Number(env.DEV_PORT) || 5173,
      proxy: { '/api': env.API_URL || 'http://127.0.0.1:8000' },
    },
  }
})
