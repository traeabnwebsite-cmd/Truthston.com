// One provider per theater. Restores the host callback and cancels outstanding loads.
export function createYouTubeProvider({ window, document, timeout = 15000 }) {
  let pending = null,
    script,
    timer,
    old,
    callback,
    rejectLoad;
  function cleanup() {
    clearTimeout(timer);
    if (window.onYouTubeIframeAPIReady === callback)
      window.onYouTubeIframeAPIReady = old;
    script?.remove();
    script = null;
  }
  function load() {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (pending) return pending;
    pending = new Promise((resolve, reject) => {
      rejectLoad = reject;
      old = window.onYouTubeIframeAPIReady;
      callback = () => {
        old?.();
        cleanup();
        resolve(window.YT);
      };
      window.onYouTubeIframeAPIReady = callback;
      script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.onerror = () => {
        cleanup();
        pending = null;
        reject(new Error("Video API unavailable"));
      };
      document.head.append(script);
      timer = setTimeout(() => {
        cleanup();
        pending = null;
        reject(new Error("Video API timed out"));
      }, timeout);
    });
    return pending;
  }
  return {
    load,
    destroy() {
      cleanup();
      rejectLoad?.(new Error("Theater disposed"));
      pending = null;
    },
  };
}
