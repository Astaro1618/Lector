/* Lector · service worker
   - Guarda o app no aparelho para abrir sem internet.
   - index.html: busca a versão nova quando há internet; sem internet, usa a guardada.
   - Bibliotecas e ícones: usa a cópia guardada.
   - Fontes do Google: usa a guardada e atualiza em segundo plano.
   Ao mudar arquivos do app, aumente VERSAO para os celulares pegarem a atualização. */
const VERSAO = 'lector-v51';
// No computador (servidor de teste, sw.js?dev=1) não guarda nada: serve só para os avisos.
const DEV = new URL(self.location.href).searchParams.has('dev');

/* ---------- Avisos (o banco manda; aqui mostra e, ao tocar, abre o app) ---------- */
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { texto: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.titulo || 'Lector', {
    body: d.texto || '', tag: d.tag || undefined, renotify: !!d.tag,
    icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', lang: 'pt-BR',
    data: { abre: d.abre || null }
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const abre = e.notification.data && e.notification.data.abre;
  const alvo = new URL(abre ? './?livro=' + encodeURIComponent(abre) : './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    const c = cs.find(x => x.url.startsWith(self.registration.scope));
    if (c) { if (abre) c.postMessage({ lectorAbre: abre }); return c.focus(); }
    return self.clients.openWindow(alvo);
  }));
});
const APP = ['./', 'index.html', 'manifest.webmanifest', 'vendor/jszip.min.js', 'vendor/pdf.min.js', 'vendor/pdf.worker.min.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png'];

self.addEventListener('install', e => {
  if (DEV) { self.skipWaiting(); return; }
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(APP)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== VERSAO && k !== VERSAO + '-fontes').map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (DEV || req.method !== 'GET') return;
  const url = new URL(req.url);

  // Página do app: rede primeiro, cópia guardada se estiver offline
  if (req.mode === 'navigate' && url.origin === location.origin) {
    e.respondWith(fetch(req.url, { cache: 'no-store' }).then(r => {
      const copy = r.clone(); caches.open(VERSAO).then(c => c.put('index.html', copy)); return r;
    }).catch(() => caches.match('index.html')));
    return;
  }

  // Arquivos do próprio app: cópia guardada primeiro
  if (url.origin === location.origin) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
    return;
  }

  // Fontes do Google: guardada + atualização em segundo plano
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(VERSAO + '-fontes').then(async c => {
      const hit = await c.match(req);
      const net = fetch(req).then(r => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
  }
  // Todo o resto (tradução do Google etc.) vai direto para a internet
});
