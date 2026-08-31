import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// La build Android (Capacitor) se fait avec CAPACITOR=1 : on y désactive le
// service worker, car son cache continuerait de servir l'ancienne version
// après une mise à jour de l'APK. Le site web, lui, garde la PWA.
const pourAndroid = process.env.CAPACITOR === '1'

const pwa = VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['icone-192.png', 'icone-512.png', 'icone-maskable-512.png'],
  manifest: {
    name: 'Skull King — Livre de bord',
    short_name: 'Skull King',
    description: 'Compteur de points pour le jeu de cartes Skull King.',
    lang: 'fr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0b0908',
    theme_color: '#0b0908',
    icons: [
      { src: 'icone-192.png', sizes: '192x192', type: 'image/png' },
      { src: 'icone-512.png', sizes: '512x512', type: 'image/png' },
      {
        src: 'icone-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  },
  workbox: {
    // Les polices sont désormais embarquées (@fontsource) : plus rien à aller
    // chercher sur le réseau, tout est précaché avec le reste de l'appli.
    globPatterns: ['**/*.{js,css,html,jpg,png,svg,woff,woff2}'],
  },
})

export default defineConfig({
  plugins: [react(), ...(pourAndroid ? [] : [pwa])],
})
