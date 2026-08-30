import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url);
const htmlFiles = ['index.html', 'privacy/index.html', 'terms/index.html', 'offline.html', '404.html'];
const shell = new Set(['/', '/demo', '/?v=2&source=installed', '/offline.html', '/privacy/', '/terms/', '/manifest.webmanifest', '/favicon.svg', '/favicon.ico']);

for (const file of htmlFiles) {
  const html = await readFile(new URL(file, dist), 'utf8');
  for (const match of html.matchAll(/(?:src|href)="(\/[^"#]+)"/g)) {
    if (!match[1].startsWith('//')) shell.add(match[1]);
  }
}

const files = [...shell].sort();
const revisionHash = createHash('sha256');
for (const url of files) {
  const pathname = url.split('?')[0];
  const file = pathname === '/' || pathname === '/demo' ? 'index.html' : pathname.endsWith('/') ? `${pathname.slice(1)}index.html` : pathname.slice(1);
  revisionHash.update(url).update(await readFile(new URL(file, dist)));
}
const revision = revisionHash.digest('hex').slice(0, 12);
const source = `const CACHE = ${JSON.stringify(`caption-lanes-${revision}`)};
const SHELL = ${JSON.stringify(files)};

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('caption-lanes-') && key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(request, copy));
      return response;
    }).catch(async () => (await caches.match(request)) || (await caches.match('/offline.html'))));
    return;
  }
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(request, copy));
    }
    return response;
  })));
});
`;

await writeFile(join(dist.pathname, 'sw.js'), source);
