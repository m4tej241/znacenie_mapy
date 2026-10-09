import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Úvodná stránka na koreni, mapová appka na /app/ (cesty sú voči koreňu projektu)
      input: {
        main: 'index.html',
        app: 'app/index.html',
      },
    },
  },
})
