const { channel } = require("diagnostics_channel");

const CACHE_NAME = 'kwetucode-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/ChatGPT Image 6 oct. 2025, 13_10_05.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});


// Stratégie Cache First avec mise à jour en arrière-plan
self.addEventListener('fetch', (event) => {
  // Ne pas mettre en cache les requêtes de type 'navigate' (pages) pour éviter les problèmes de navigation
  if (event.request.mode === 'navigate') {
    return event.respondWith(fetchAndCache(event.request));
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retourne la réponse du cache si disponible, sinon va chercher sur le réseau
      return response || fetchAndCache(event.request);
    })
  );

  // Mise à jour du cache en arrière-plan pour les prochaines visites
  if (event.request.method === 'GET') {
    event.waitUntil(
      fetchAndCache(event.request, false)
    );
  }
});

// Fonction utilitaire pour mettre en cache et retourner la réponse
function fetchAndCache(request, useCache = true) {
  return fetch(request).then(response => {
    // Ne mettre en cache que les réponses valides
    if (!response || response.status !== 200 || response.type !== 'basic') {
      return response;
    }

    // Cloner la réponse car elle peut être utilisée qu'une seule fois
    const responseToCache = response.clone();

    caches.open(CACHE_NAME).then(cache => {
      cache.put(request, responseToCache);
    });

    return response;
  }).catch(error => {
    // En cas d'erreur de réseau, retourner une réponse personnalisée si nécessaire
    console.error('Erreur de récupération:', error);
    if (useCache) {
      return caches.match('/offline.html'); // Créez une page offline.html pour une meilleure UX
    }
    throw error;
  });
}

// t
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
});
