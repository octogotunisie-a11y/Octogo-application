import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                // IMPORTANT : 127.0.0.1 et NON localhost.
                // Sur Node 17+, "localhost" se résout en IPv6 (::1) en premier ; si le
                // backend écoute en IPv4, le proxy tente ::1 -> ECONNREFUSED / ECONNRESET
                // (erreur "internalConnectMultiple"). Forcer 127.0.0.1 règle le problème.
                target: 'http://127.0.0.1:5000',
                changeOrigin: true,
            },
            // Les fichiers uploadés (PDF des devis) passent aussi par le backend.
            '/uploads': {
                target: 'http://127.0.0.1:5000',
                changeOrigin: true,
            },
        },
    },
})