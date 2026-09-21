import process from 'node:process'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// 127.0.0.1 rather than "localhost": on Node 17+ localhost can resolve to the
// IPv6 loopback first, which makes proxy failures harder to reason about.
const API_TARGET = process.env.VITE_API_PROXY ?? 'http://127.0.0.1:4000'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
        // Dev-only. The technical detail goes to the terminal where a developer
        // can act on it; the response body stays neutral, because it can reach
        // the browser of someone who is not a developer.
        configure: (proxy) => {
          proxy.on('error', (error, req, res) => {
            const reason =
              error.code === 'ECONNREFUSED'
                ? `nothing is listening on ${API_TARGET}`
                : `the connection to ${API_TARGET} failed (${error.code ?? error.message})`

            console.error(
              `[api proxy] ${req.method} ${req.url} — ${reason}. Start the API with "npm run dev" in backend/.`,
            )

            if (res.headersSent || typeof res.writeHead !== 'function') return

            res.writeHead(502, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'The service is temporarily unavailable.' }))
          })
        },
      },
    },
  },
})
