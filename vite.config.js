import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),
     VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'LSGH APP',
        short_name: 'LSGH App',
        description: 'A hospital queue and appointment system for Living-Soul General Hospital',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
   src: 'pwa-maskable-512x512.png',
    sizes: '512x512',
    type: 'image/png',
    purpose: 'maskable'
          },
        ]
      },
      devOptions: {
        enabled: true // Allows testing PWA features in development
      }
    })
  ]
});

