self.addEventListener("securitypolicyviolation", e => {
    console.error("CSP BLOCKED:", e.violatedDirective, e.blockedURI);
});

console.log("Worker started");

const baseUrl = new URL("./", self.location.href).href;

importScripts(
    baseUrl + "AIOneWeb.js",
    baseUrl + "worker-runtime.js"
);

console.log("AIOneWeb loaded");