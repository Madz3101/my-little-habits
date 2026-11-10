
/* MY LITTLE HABITS - OFFLINE SUPPORT */

const CACHE_NAME = "my-little-habits-v1";

const APP_FILES = [
    "./",
    "./index.html",
    "./calendar.html",
    "./stats.html",
    "./settings.html",
    "./style.css",
    "./script.js",
    "./calendar.js",
    "./stats.js",
    "./settings.js",
    "./manifest.json",
    "./icon-192.png",
    "./icon-512.png"
];

// Save app files when the service worker installs
self.addEventListener("install", function(event) {

    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(APP_FILES);
        })
    );

});

// Remove old caches when the app is updated
self.addEventListener("activate", function(event) {

    event.waitUntil(
        caches.keys().then(function(keys) {

            return Promise.all(
                keys
                    .filter(function(key) {
                        return key !== CACHE_NAME;
                    })
                    .map(function(key) {
                        return caches.delete(key);
                    })
            );

        })
    );

});

// Load cached files when offline
self.addEventListener("fetch", function(event) {

    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(

        fetch(event.request).catch(function() {
            return caches.match(event.request);
        })

    );

});
