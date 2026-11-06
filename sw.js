/* GabBoo service worker: works offline after the first visit. Bump VERSION to ship an update. */
const VERSION = 'gabboo-v129';
const SHELL = ['./', './index.html', './config.js', './app.js', './styles.css', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url), same = url.origin === location.origin;
  const cacheable = same || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com' || (url.hostname === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/'));
  // Accounts, cloud saves, billing and AI calls always go straight to the network.
  if (!cacheable) return;
  // App page and settings file: network first so updates arrive, cache as fallback for offline.
  if (req.mode === 'navigate' || (same && /\.(js|css)$/.test(url.pathname))) {
    const key = req.mode === 'navigate' ? './index.html' : req;
    e.respondWith(fetch(req.url, { cache: 'no-cache' }).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put(key, c)); return r; }).catch(() => caches.match(key))); return;
  }
  // Everything else (icons, fonts, Firebase SDK): cache first, then network.
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === 'opaque') { const c = r.clone(); caches.open(VERSION).then(x => x.put(req, c)); } return r; })));
});

/* Daily reminder while the app is closed (Chrome on Android, app installed): runs now and then in the background. */
async function gabbooRemind() {
  try {
    const c = await caches.open('gabboo-state'), r = await c.match('state'); if (!r) return;
    const s = await r.json(); if (!s.remind) return;
    const now = new Date(), [h, m] = String(s.time || '19:00').split(':').map(Number), at = new Date(); at.setHours(h, m, 0, 0);
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (now < at || s.lastDay === key || s.notified === key) return;
    await self.registration.showNotification('Time to speak!', { body: s.streak > 0 ? `Keep your ${s.streak}-day streak alive. Boo is waiting!` : 'A two-minute lesson makes Boo happy.', icon: 'icon-192.png', badge: 'icon-192.png', tag: 'gabboo-remind', data: { url: './' } });
    s.notified = key; await c.put('state', new Response(JSON.stringify(s)));
  } catch (e) { /* ignore */ }
}
self.addEventListener('periodicsync', e => { if (e.tag === 'gabboo-remind') e.waitUntil(gabbooRemind()); });
self.addEventListener('notificationclick', e => { e.notification.close(); e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(l => (l.length ? l[0].focus() : self.clients.openWindow('./')))); });
