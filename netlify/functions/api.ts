import type { IncomingMessage } from 'node:http'
import serverless from 'serverless-http'
import { createApp } from '../../server/src/app.js'

/**
 * Весь REST API одной функцией: netlify.toml перенаправляет сюда /api/*,
 * а внутри работает то же приложение Express, что и локально.
 */
export const handler = serverless(createApp(), {
  // Netlify зовёт функцию по адресу /.netlify/functions/api/... — этот префикс Express не нужен
  basePath: '/.netlify/functions/api',
  request(request: IncomingMessage) {
    // после срезания префикса остаётся «/menu», а роуты объявлены как «/api/menu»
    if (request.url && !request.url.startsWith('/api')) {
      request.url = `/api${request.url === '/' ? '' : request.url}`
    }
  },
})
