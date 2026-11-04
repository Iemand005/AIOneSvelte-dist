const CACHE_VERSION = "mw2mthmn";
const CACHE_PREFIX = "aione-";
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`;
const PRECACHE_URLS = ["./assets/aione-tauri-Bowk7E0S.js","./assets/dist-js-B3oX_EYh.js","./assets/index-BDD_E9yv.css","./assets/index-NEQ8hy2c.js","./build/Release-mt/AIOneWebMT.js","./build/Release-mt/AIOneWebMT.wasm","./build/Release/AIOneWeb.js","./build/Release/AIOneWeb.wasm","./favicon.svg","./icons.svg","./index.html","./manifest.webmanifest","./worker-runtime.js"];
const INDEX_URL = new URL("./index.html", self.location.href).href;

self.addEventListener("install", event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        const failed = [];

        for (const url of PRECACHE_URLS) {
            const request = new Request(new URL(url, self.location.href), {
                cache: "reload"
            });

            try {
                const response = await fetch(request);

                if (!response.ok || response.status === 206) {
                    throw new Error(`Unexpected response ${response.status}`);
                }

                await cache.put(request, response);
            } catch (error) {
                failed.push(request.url);
                console.warn("[sw] Failed to precache", request.url, error);
            }
        }

        if (failed.length > 0) {
            throw new Error(`[sw] Failed to precache ${failed.length} file(s)`);
        }

        await self.skipWaiting();
    })());
});

self.addEventListener("activate", event => {
    event.waitUntil((async () => {
        const keys = await caches.keys();

        await Promise.all(
            keys
                .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
                .map(key => caches.delete(key))
        );

        await self.clients.claim();
    })());
});

self.addEventListener("fetch", event => {
    const { request } = event;

    if (request.method !== "GET") return;

    const url = new URL(request.url);

    if (url.origin !== self.location.origin) return;
    if (url.pathname.endsWith("/sw.js")) return;

    if (request.mode === "navigate") {
        event.respondWith(handleNavigation(request));
        return;
    }

    event.respondWith(handleAsset(request));
});

async function handleNavigation(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(INDEX_URL, { ignoreSearch: true });

    if (cached) return cached;

    try {
        const response = await fetch(request);

        if (response.ok && response.status !== 206) {
            try {
                await cache.put(INDEX_URL, response.clone());
            } catch (error) {
                console.warn("[sw] Failed to cache navigation", error);
            }
        }

        return response;
    } catch {
        return new Response("Offline", {
            status: 503,
            headers: { "Content-Type": "text/plain" }
        });
    }
}

async function handleAsset(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, { ignoreSearch: true });

    if (cached) return cached;

    const response = await fetch(request);

    if (response.ok && response.status !== 206 && response.type === "basic") {
        try {
            await cache.put(request, response.clone());
        } catch (error) {
            console.warn("[sw] Failed to cache asset", request.url, error);
        }
    }

    return response;
}
