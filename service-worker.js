const CACHE_NAME = "offline-app-v1";

// تثبيت الـ Service Worker
self.addEventListener("install", (event) => {
    self.skipWaiting();
});

// تفعيله
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

// تخزين جميع الملفات تلقائياً
self.addEventListener("fetch", (event) => {

    if (event.request.method !== "GET") return;

    event.respondWith(

        caches.match(event.request).then((cachedResponse) => {

            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request)
                .then((networkResponse) => {

                    if (
                        networkResponse &&
                        networkResponse.status === 200 &&
                        networkResponse.type === "basic"
                    ) {

                        const responseClone = networkResponse.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseClone);
                            });
                    }

                    return networkResponse;
                });

        })

    );

});