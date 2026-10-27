// A feature owns every persistent subscription it creates.
export function createLifetime() {
  const disposers = [];
  let disposed = false;
  return {
    listen(target, type, listener, options) {
      target.addEventListener(type, listener, options);
      disposers.push(() => target.removeEventListener(type, listener, options));
      return listener;
    },
    interval(callback, ms) {
      const id = setInterval(callback, ms);
      disposers.push(() => clearInterval(id));
      return id;
    },
    add(dispose) {
      if (disposed) dispose();
      else disposers.push(dispose);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const dispose of disposers.splice(0).reverse()) dispose();
    },
  };
}
