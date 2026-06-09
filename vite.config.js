import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Para GitHub Pages, cambia '/porra-mundial-2026/' por el nombre exacto del repo.
  // Para Vercel, deja base: '/'.
  base: '/',
})
