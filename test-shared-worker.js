self.onconnect = event => {
  event.ports[0].postMessage({
    isolated: self.crossOriginIsolated,
    sab: typeof SharedArrayBuffer
  });
};