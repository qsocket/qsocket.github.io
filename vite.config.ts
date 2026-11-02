import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// `BASE_PATH` lets the same source tree build for a user/organisation page
// served from `/` (the qsocket.io custom domain) and for a project page served
// from `/<repo>/`. The build script sets it; it defaults to the custom domain.
const base = process.env.BASE_PATH ?? '/'

export default defineConfig({
  base,
  plugins: [tailwindcss()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
    // A single page with no routes gains nothing from chunking, and one
    // request beats three on a cold mobile connection.
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
