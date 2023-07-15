self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open('focus-cache').then(function (cache) {
      return cache.addAll([
        '/coffee.svg',
        '/favicon.svg',
<<<<<<< HEAD
        //'/src/scripts/main.js',
        //'/src/styles/style.css',
=======
        '/assets/scripts/main.js',
        '/assets/styles/style.css',
>>>>>>> 168f52b374c2bf2ddf6e8e4a3af8070f15d9b011
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
