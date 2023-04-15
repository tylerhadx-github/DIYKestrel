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
      manifest:{
        name: 'LoraToArduino',
        short_name: 'Lora',
        description: 'offline messenger',
        theme_color: "#fff",
        background_color: "#fff",
        display: "standalone",
        icons:[
          {
            src:'img/logo.svg',
            size: '488x424',
            type: 'image/svg+xml',
            purpose: "any"

          },
          {
            src: 'img/lora.png',
            size: '512x512',
            type: 'image/png',
            purpose: "any"
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
