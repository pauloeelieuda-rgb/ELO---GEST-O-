
const CACHE_NAME = 'elo-final-v2';

const arquivosPrincipais = [
  './index.html',
  './manifest.json'
];

const icones = [
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    // Arquivos principais
    await cache.addAll(arquivosPrincipais);

    // Ícones: tenta salvar sem impedir a instalação
    await Promise.all(
      icones.map(arquivo =>
        cache.add(arquivo).catch(erro => {
          console.log('Não foi possível carregar:', arquivo);
        })
      )
    );

    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const chaves = await caches.keys();

    await Promise.all(
      chaves
        .filter(chave => chave.startsWith('elo-') && chave !== CACHE_NAME)
        .map(chave => caches.delete(chave))
    );

    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith((async () => {
    const salvo = await caches.match(event.request);

    if (salvo) return salvo;

    return fetch(event.request);
  })());
});
