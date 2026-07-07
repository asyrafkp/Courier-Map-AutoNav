const CACHE_NAME = 'kurier-cache-v1';
const URLS_TO_CACHE = [
  '.',
  'kurier-app_3.html',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){ return cache.addAll(URLS_TO_CACHE); })
  );
});

self.addEventListener('fetch', function(event){
  var url = event.request.url;
  // Cache-first for map tiles
  if(url.indexOf('tile.openstreetmap.org') !== -1){
    event.respondWith(
      caches.match(event.request).then(function(res){ return res || fetch(event.request).then(function(r){
        var clone = r.clone();
        caches.open(CACHE_NAME).then(function(c){ c.put(event.request, clone); });
        return r;
      });})
    );
    return;
  }
  // Network-first for API calls
  if(url.indexOf('router.project-osrm.org') !== -1 || url.indexOf('nominatim.openstreetmap.org') !== -1){
    event.respondWith(
      fetch(event.request).catch(function(){ return caches.match(event.request); })
    );
    return;
  }
  // Cache-first for everything else
  event.respondWith(
    caches.match(event.request).then(function(res){ return res || fetch(event.request); })
  );
});
