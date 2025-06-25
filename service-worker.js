const CACHE_NAME = 'riyaazz-cache-v1';
const APP_SHELL_URLS = [
    '/',
    '/index.html',
    '/player.html',
    '/tracks.json',
    '/templates/header.html',
    '/templates/footer.html',
    '/templates/disclaimers.html',
    '/static/logo.png',
    '/static/icons.svg',
    '/static/favicon.ico',
    // If you have built JS/CSS files, add them here, e.g. '/assets/app.js'
    '/assets/index-ea2Ft1aR.js',
    '/assets/index-Cvny4KXv.js',
    '/assets/index-Cja-oDbr.css'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache and caching app shell');
                return cache.addAll(APP_SHELL_URLS);
            })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // For audio files, use a cache-first strategy
    if (event.request.url.includes('/audio/')) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((response) => {
                    // If we have it in cache, serve it.
                    if (response) {
                        return response;
                    }
                    // Otherwise, fetch from network, cache it, and then return it.
                    return fetch(event.request).then((networkResponse) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
        return;
    }

    // For all other requests, use a network-first strategy
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
