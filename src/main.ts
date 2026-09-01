import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import { vParallax } from './directives/parallax'
import { vReveal } from './directives/reveal'
import { vTilt } from './directives/tilt'

import './styles/tokens.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/motion.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

/* анимационные директивы доступны во всех компонентах без импорта */
app.directive('reveal', vReveal)
app.directive('tilt', vTilt)
app.directive('parallax', vParallax)

app.mount('#app')
