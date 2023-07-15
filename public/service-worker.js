self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open('focus-cache').then(function (cache) {
      return cache.addAll([
        '/coffee.svg',
        '/favicon.svg',
        //'/src/scripts/main.js',
        //'/src/styles/style.css',
      ]);
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== 'focus-cache') {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});


self.addEventListener('fetch', function (e) {
  e.respondWith(
    caches.match(e.request).then(function (response) {
      return response || fetch(e.request);
    })
  );
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();

  e.waitUntil(clients.openWindow('https://focus-x.vercel.app/'));
});

self.addEventListener('push', function (e) {
  const options = {
    body: e.data.text(),
    icon: '/coffee.svg',
    vibrate: [200, 100, 200],
  };

  e.waitUntil(self.registration.showNotification('Focus Timer', options));
});
