const CACHE_NAME = 'synapse-game-v1.0.0';
const urlsToCache = [
  './',
  './index.html',
  './Icon.png',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Creepster&family=VT323&family=Space+Mono&family=Courier+Prime&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache installation failed:', error);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // If both cache and network fail, return offline page for navigation requests
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Claim all clients for immediate activation
  self.clients.claim();
});

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sync game data or progress when back online
      syncGameData()
    );
  }
});

// Push notifications for game updates or reminders
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'SYNAPSE - Something lurks in the shadows...',
      icon: './Icon.png',
      badge: './Icon.png',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || './'
      },
      actions: [
        {
          action: 'play',
          title: 'Continue Game',
          icon: './Icon.png'
        },
        {
          action: 'close',
          title: 'Dismiss'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'SYNAPSE', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'play') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || './')
    );
  }
});

// Background sync helper function
async function syncGameData() {
  try {
    // This could sync game progress, settings, etc.
    console.log('Background sync: Game data synchronized');
    return Promise.resolve();
  } catch (error) {
    console.log('Background sync failed:', error);
    return Promise.reject(error);
  }
}
