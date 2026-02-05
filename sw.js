// Service Worker for automatic caching
const CACHE_NAME = 'pandjico-v2';
const CACHE_VERSION = '2';

// Assets to cache on install - use relative paths for GitHub Pages compatibility
// Will be dynamically adjusted based on service worker scope
const STATIC_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './src/js/script.js',
    './data/projects.json',
    './components/sidebar.html'
];

// Cache strategy: cache-first for static assets, network-first for dynamic content
const CACHE_FIRST_PATTERNS = [
    /\.css$/,
    /\.js$/,
    /\.(png|jpg|jpeg|gif|svg|webp)$/,
    /components\//,
    /styles\.css/
];

// Install event - cache static assets
self.addEventListener('install', function(event) {
    console.log('[SW] Installing service worker...');
    event.waitUntil(
        caches.open(CACHE_NAME + '-' + CACHE_VERSION).then(function(cache) {
            console.log('[SW] Caching static assets');
            // Convert relative paths to absolute based on service worker location
            const swLocation = self.location.pathname;
            const swBase = swLocation.substring(0, swLocation.lastIndexOf('/') + 1);
            
            const absoluteAssets = STATIC_ASSETS.map(function(url) {
                // If URL starts with ./, make it relative to service worker location
                if (url.startsWith('./')) {
                    return swBase + url.substring(2);
                }
                // If URL starts with /, keep it absolute
                if (url.startsWith('/')) {
                    return url;
                }
                // Otherwise, prepend swBase
                return swBase + url;
            });
            
            return cache.addAll(absoluteAssets.map(function(url) {
                return new Request(url, { cache: 'reload' });
            })).catch(function(error) {
                console.warn('[SW] Failed to cache some assets:', error);
            });
        })
    );
    self.skipWaiting(); // Activate immediately
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
    console.log('[SW] Activating service worker...');
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME + '-' + CACHE_VERSION) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim(); // Take control immediately
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', function(event) {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    const url = new URL(event.request.url);
    
    // Skip cross-origin requests (fonts, external APIs) - let browser handle them
    if (url.origin !== self.location.origin && !url.href.includes('fonts.googleapis.com') && !url.href.includes('fonts.gstatic.com')) {
        return;
    }
    
    // Check if this is a cache-first asset
    const isCacheFirst = CACHE_FIRST_PATTERNS.some(function(pattern) {
        return pattern.test(url.pathname);
    });
    
    if (isCacheFirst) {
        // Cache-first strategy for static assets
        event.respondWith(
            caches.match(event.request).then(function(response) {
                if (response) {
                    console.log('[SW] Serving from cache (cache-first):', url.pathname);
                    // Also update cache in background
                    fetch(event.request).then(function(networkResponse) {
                        if (networkResponse && networkResponse.status === 200) {
                            caches.open(CACHE_NAME + '-' + CACHE_VERSION).then(function(cache) {
                                cache.put(event.request, networkResponse.clone());
                            });
                        }
                    }).catch(function() {
                        // Ignore network errors for background update
                    });
                    return response;
                }
                
                // Not in cache, fetch from network
                return fetch(event.request).then(function(networkResponse) {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME + '-' + CACHE_VERSION).then(function(cache) {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return networkResponse;
                });
            })
        );
    } else {
        // Network-first strategy for dynamic content (like projects.json)
        event.respondWith(
            fetch(event.request).then(function(networkResponse) {
                // Cache successful responses
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME + '-' + CACHE_VERSION).then(function(cache) {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(function(error) {
                // Network failed, try cache
                console.log('[SW] Network failed, trying cache:', url.pathname);
                return caches.match(event.request).then(function(cachedResponse) {
                    if (cachedResponse) {
                        console.log('[SW] Serving from cache (network-first fallback):', url.pathname);
                        return cachedResponse;
                    }
                    // No cache, return error
                    throw error;
                });
            })
        );
    }
});
