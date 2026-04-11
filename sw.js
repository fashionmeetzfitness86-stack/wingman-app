
self.addEventListener('install', event => {
  console.log('Service worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service worker activating...');
});

self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : { title: 'WINGMAN', body: 'You have a new notification.' };
  
  const title = data.title || 'WINGMAN';
  const options = {
    body: data.body,
    icon: 'https://picsum.photos/seed/logo/192/192', // Placeholder icon
    badge: 'https://picsum.photos/seed/badge/96/96' // Placeholder badge
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');
  event.notification.close();
  // This looks for an open window matching the URL and focuses it.
  // If no window is found, it opens a new one.
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});
