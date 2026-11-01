postMessage({
  isolated: self.crossOriginIsolated,
  sab: typeof SharedArrayBuffer,
  worker: typeof Worker
});