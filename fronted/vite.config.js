import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import { resolveApiBase } from './src/lib/apiConfig.js'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === 'build' && mode === 'production') {
    const env = loadEnv(mode, process.cwd(), 'VITE_')
    const apiUrl = process.env.VITE_API_URL ?? env.VITE_API_URL
    resolveApiBase(apiUrl, true)
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': { target: 'http://localhost:4000', changeOrigin: true },
        '/socket.io': { target: 'http://localhost:4000', ws: true },
      },
    },
  }
})
