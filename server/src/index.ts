import { createApp } from './app.js'
import { env } from './env.js'

/** Локальный сервер разработки. В проде на Netlify то же приложение поднимает функция. */
createApp().listen(env.port, () => {
  console.log(`[api] «Снова в СССР» — REST API на http://localhost:${env.port}/api`)
})
