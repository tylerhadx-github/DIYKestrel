// Plugins
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { VitePWA } from 'vite-plugin-pwa'


import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'


// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    vue(),
    // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
    vuetify({
      autoImport: true,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['brand-logo.png'],
      workbox: {
        // Precache fonts too so the app renders fully offline.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
      manifest: {
        name: 'DIY Kestrel - offline weather meter',
        short_name: 'DIY Kestrel',
        description: 'Open-source handheld weather meter in a 3D-printed case. Readings (temp, pressure, humidity, altitude) over Bluetooth, anywhere, no signal required.',
        theme_color: "#0b0b10",
        background_color: "#0b0b10",
        display: "standalone",
        icons: [
          {
            src: 'brand-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: "any"
          },
          {
            src: 'brand-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: "maskable"
          }
        ]
      }
    })
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  }
  /* remove the need to specify .vue files https://vitejs.dev/config/#resolve-extensions
  resolve: {
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ]
  },
  */
})
