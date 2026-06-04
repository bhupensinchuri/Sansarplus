/* eslint-disable no-restricted-globals */

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
// for the list of available Workbox modules, or add any other
// code you'd like.
// You can also remove this file if you'd prefer not to use a
// service worker, and the Workbox build step will be skipped.

const CACHE_NAME = 'sansarplus-cache-v1';
const IMAGES_CACHE_NAME = 'sansarplus-images-v1';

const urlsToCache = [
  '/',
  '/index.html',
  // Add other static assets here if known, otherwise the runtime cache handles them
];

// Install a service worker
self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Cache and return requests
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // 1. Handle Image Caching (Picsum)
  if (requestUrl.hostname.includes('picsum.photos')) {
    event.respondWith(
      caches.open(IMAGES_CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          // Return cached response if found
          if (response) return response;
          
          // Otherwise fetch from network
          return fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }).catch(() => {
             // If offline and image not cached, return nothing or a placeholder
             // For now, we just let it fail gracefully
             return new Response('', { status: 404, statusText: 'Not Found' }); 
          });
        });
      })
    );
    return;
  }

  // 2. Handle App Shell (HTML, JS, CSS) - Network First, then Cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // If network request fails, try to get it from the cache
        return caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                // If the request is for a navigation (HTML), return index.html
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
            });
      })
  );
});

// Update a service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME, IMAGES_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});