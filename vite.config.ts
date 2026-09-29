import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // (o el plugin que estés usando)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
})
