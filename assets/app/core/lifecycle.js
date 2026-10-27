// A feature owns subscriptions, observers and pending work, and can dispose once.
export function createLifetime() {
  const disposers = [],
    timeouts = new Set(),
    frames = new Set();
  let disposed = false;
  const add = (dispose) => {
    if (disposed) dispose();
    else disposers.push(dispose);
  };
  return {
    get disposed() {
      return disposed;
    },
    add,
    listen(target, type, listener, options) {
      if (disposed) return listener;
      target.addEventListener(type, listener, options);
      add(() => target.removeEventListener(type, listener, options));
      return listener;
    },
    interval(callback, ms) {
      if (disposed) return null;
      const id = setInterval(callback, ms);
      add(() => clearInterval(id));
      return id;
    },
    timeout(callback, ms) {
      if (disposed) return null;
      const id = setTimeout(() => {
        timeouts.delete(id);
        if (!disposed) callback();
      }, ms);
      timeouts.add(id);
      return id;
    },
    frame(callback) {
      if (disposed) return null;
      const id = requestAnimationFrame((time) => {
        frames.delete(id);
        if (!disposed) callback(time);
      });
      frames.add(id);
      return id;
    },
    observe(observer, target, options) {
      if (disposed) {
        observer.disconnect();
        return observer;
      }
      observer.observe(target, options);
      add(() => observer.disconnect());
      return observer;
    },
    clearTimeout(id) { clearTimeout(id); timeouts.delete(id); },
    cancelFrame(id) { cancelAnimationFrame(id); frames.delete(id); },
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const id of timeouts) clearTimeout(id);
      timeouts.clear();
      for (const id of frames) cancelAnimationFrame(id);
      frames.clear();
      for (const dispose of disposers.splice(0).reverse()) dispose();
    },
  };
}
