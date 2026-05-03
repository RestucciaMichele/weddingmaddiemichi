const CACHE_NAME = 'weddingmaddiemichi-static-v1'

const CACHEABLE_EXTENSIONS = [
  '.js',
  '.css',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.svg',
  '.mp4',
  '.webm',
  '.woff',
  '.woff2',
]

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
      await self.clients.claim()
    })()
  )
})

function isCacheableRequest(request) {
  if (request.method !== 'GET') return false

  const url = new URL(request.url)

  if (request.destination === 'script') return true
  if (request.destination === 'style') return true
  if (request.destination === 'image') return true
  if (request.destination === 'font') return true
  if (request.destination === 'video') return true

  return CACHEABLE_EXTENSIONS.some((extension) => url.pathname.endsWith(extension))
}

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (!isCacheableRequest(request)) {
    return
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      const cachedResponse = await cache.match(request)
      if (cachedResponse) {
        return cachedResponse
      }

      try {
        const networkResponse = await fetch(request)
        if (networkResponse && networkResponse.ok) {
          cache.put(request, networkResponse.clone())
        }
        return networkResponse
      } catch (error) {
        return cachedResponse || Response.error()
      }
    })()
  )
})