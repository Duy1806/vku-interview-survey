const CACHE_NAME = 'vku-inspection-v1'

const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest'
]

// ================================
// INSTALL
// ================================

self.addEventListener('install', (event) => {

  console.log(
    '[Service Worker] Installing...'
  )

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then((cache) => {

        return cache.addAll(
          APP_SHELL
        )
      })
  )

  self.skipWaiting()
})

// ================================
// ACTIVATE
// ================================

self.addEventListener('activate', (event) => {

  console.log(
    '[Service Worker] Activated'
  )

  event.waitUntil(

    caches.keys()
      .then((cacheNames) => {

        return Promise.all(

          cacheNames
            .filter(
              (name) =>
                name !== CACHE_NAME
            )
            .map(
              (name) =>
                caches.delete(name)
            )
        )
      })
  )

  self.clients.claim()
})

// ================================
// FETCH
// ================================

self.addEventListener('fetch', (event) => {

  // Chỉ xử lý GET
  if (event.request.method !== 'GET') {
    return
  }

  event.respondWith(

    caches.match(event.request)
      .then((cachedResponse) => {

        // Cache-First
        if (cachedResponse) {

          return cachedResponse
        }

        // Không có trong cache
        // thì lấy từ network
        return fetch(event.request)
          .then((networkResponse) => {

            // Cache response để lần sau dùng offline
            if (
              networkResponse &&
              networkResponse.status === 200
            ) {

              const responseClone =
                networkResponse.clone()

              caches.open(CACHE_NAME)
                .then((cache) => {

                  cache.put(
                    event.request,
                    responseClone
                  )
                })
            }

            return networkResponse
          })
      })
      .catch(() => {

        // Nếu mất mạng và không có cache
        return caches.match(
          '/index.html'
        )
      })
  )
})