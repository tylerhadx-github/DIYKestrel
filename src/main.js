import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'

// Self-hosted fonts (bundled + precached so the PWA renders offline).
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/600.css'
import '@fontsource/space-grotesk/700.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'

// Brand theme layer
import './styles/theme.css'

const app = createApp(App)
  .use(router)
  .use(vuetify)

app.mount('#app')
