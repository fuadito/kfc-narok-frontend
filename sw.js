// sw.js — MotoBite Service Worker
// Handles background push notifications on Android Chrome.
// new Notification() is blocked when the tab is in the background on Android —
// ServiceWorker.showNotification() works in all cases.

const CACHE_NAME = 'motobite-v1';

// ── Install — skip waiting so the SW activates immediately ───────────────────
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// ── Notification click — bring the app tab to focus ──────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clients => {
        // If the app is already open in a tab, focus it
        const appClient = clients.find(c => c.url.includes(self.location.origin));
        if(appClient){
          appClient.focus();
          // Tell the app to invoke the stored click callback
          appClient.postMessage({ type: 'NOTIF_CLICK' });
        } else {
          // App not open — open it
          self.clients.openWindow('/');
        }
      })
  );
});

// ── Message from app — relay notification click callback ─────────────────────
self.addEventListener('message', event => {
  if(event.data?.type === 'NOTIF_CLICK_CB'){
    // Nothing needed here — callback is stored in window._notifClickCb on the client
  }
});