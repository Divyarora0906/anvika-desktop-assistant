import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT PART 👇
export default defineConfig({
  base: './',
  plugins: [react()]
})
