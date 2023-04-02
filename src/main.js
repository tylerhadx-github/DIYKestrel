import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import router from './router'
import VueCryptojs from 'vue-cryptojs'
import './registerServiceWorker'


loadFonts()

createApp(App).use(router)
  .use(vuetify)
  .use(VueCryptojs)
  .mount('#app')
