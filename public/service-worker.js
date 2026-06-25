importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

if (workbox) {
  console.log('⚡ Workbox loaded successfully in Service Worker');

  // Opt-in to immediate activation
  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));

  // Cache static assets (JS, CSS, HTML, Fonts) - Stale-While-Revalidate
  workbox.routing.registerRoute(
    ({ request }) => 
      request.destination === 'document' ||
      request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'font',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'redemption-static-cache',
    })
  );

  // Intercept API calls - serve from cache when offline, fetch from network when online (Network First)
  // ONLY cache JSON responses. Exclude image assets.
  workbox.routing.registerRoute(
    ({ url, request }) => {
      const isApi = url.pathname.includes('/api/maps') || 
                    url.pathname.includes('/api/zones') || 
                    url.pathname.includes('/api/density') ||
                    url.pathname.includes('/api/sync');
      const isJson = request.headers.get('accept')?.includes('json') || 
                     url.pathname.endsWith('.json') ||
                     isApi;
      
      // Explicitly reject images and media from the API/offline cache
      const isMedia = request.destination === 'image' || 
                      url.pathname.match(/\.(png|jpe?g|gif|webp|svg|mp4)$/i);
      
      return isApi && isJson && !isMedia;
    },
    new workbox.strategies.NetworkFirst({
      cacheName: 'redemption-offline-api-cache',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 Days
        }),
      ],
    })
  );

  // Workbox Background Sync for Queuing Outgoing Incident Reports
  const queue = new workbox.backgroundSync.Queue('incident-reports-queue', {
    onSync: async ({ queue }) => {
      let entry;
      while ((entry = await queue.shiftRequest())) {
        try {
          console.log(`[ServiceWorker] Background Sync retrying request: ${entry.request.url}`);
          const response = await fetch(entry.request.clone());
          console.log('[ServiceWorker] Background Sync successfully processed request');
          
          // Notify clients that sync succeeded
          const clientsList = await self.clients.matchAll();
          clientsList.forEach(client => {
            client.postMessage({ type: 'SYNC_COMPLETED', url: entry.request.url });
          });
        } catch (error) {
          console.error('[ServiceWorker] Background Sync request failed, re-queueing', error);
          await queue.unshiftRequest(entry);
          throw error;
        }
      }
    }
  });

  self.addEventListener('fetch', (event) => {
    // Intercept incident report submissions when offline and queue them
    const url = new URL(event.request.url);
    if (url.pathname.includes('/api/incidents') && event.request.method === 'POST') {
      if (!self.navigator.onLine) {
        event.respondWith(
          (async () => {
            console.log('[ServiceWorker] Browser offline. Queueing incident report in background sync queue.');
            await queue.pushRequest(event.request.clone());
            
            // Return a mock accepted response
            return new Response(JSON.stringify({ 
              success: true, 
              queued: true,
              message: "Offline. Incident queued for auto-sync." 
            }), {
              status: 202,
              headers: { 'Content-Type': 'application/json' }
            });
          })()
        );
      }
    }
  });
} else {
  console.error('❌ Workbox failed to load in Service Worker');
}
