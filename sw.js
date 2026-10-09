/* Speakaboo service worker: works offline after the first visit. Bump VERSION to ship an update. */
const VERSION = 'speakaboo-v18';
const SHELL = ['./', './index.html', './config.js', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url), same = url.origin === location.origin;
  const cacheable = same || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com' || (url.hostname === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/'));
  // Accounts, cloud saves, billing and AI calls always go straight to the network.
  if (!cacheable) return;
  // App page and settings file: network first so updates arrive, cache as fallback for offline.
  if (req.mode === 'navigate' || (same && /config\.js$/.test(url.pathname))) {
    const key = req.mode === 'navigate' ? './index.html' : req;
    e.respondWith(fetch(req.url, { cache: 'no-cache' }).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put(key, c)); return r; }).catch(() => caches.match(key))); return;
  }
  // Everything else (icons, fonts, Firebase SDK): cache first, then network.
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === 'opaque') { const c = r.clone(); caches.open(VERSION).then(x => x.put(req, c)); } return r; })));
});
