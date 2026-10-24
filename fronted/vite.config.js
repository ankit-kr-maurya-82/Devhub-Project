import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === 'build' && mode === 'production') {
    const env = loadEnv(mode, process.cwd(), 'VITE_')
    const apiUrl = process.env.VITE_API_URL ?? env.VITE_API_URL
    let parsedApiUrl
    try { parsedApiUrl = new URL(apiUrl) } catch {
      throw new Error('Production builds require VITE_API_URL as an absolute HTTP(S) API root ending in /api/v1.')
    }
    if (!['http:', 'https:'].includes(parsedApiUrl.protocol) || parsedApiUrl.pathname.replace(/\/$/, '') !== '/api/v1' || parsedApiUrl.search || parsedApiUrl.hash || parsedApiUrl.username || parsedApiUrl.password) {
      throw new Error('Production builds require VITE_API_URL as an absolute HTTP(S) API root ending in /api/v1.')
    }
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
