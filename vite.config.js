import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    base: process.env.NODE_ENV === 'production' ? '/kindle-clippings-reader/' : '/',
    server: {
        host: true,
        port: 5173,
        watch: {
            usePolling: true
        }
    }
})