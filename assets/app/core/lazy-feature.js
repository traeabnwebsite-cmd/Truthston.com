// Concurrent callers share one load; late results after disposal are never mounted.
export function createLazyFeature({
  load,
  onReady = () => {},
  onError = () => {},
}) {
  let value = null,
    pending = null,
    disposed = false;
  return {
    get value() {
      return value;
    },
    async load() {
      if (disposed) return null;
      if (value) return value;
      if (pending) return pending;
      pending = Promise.resolve()
        .then(load)
        .then((result) => {
          if (disposed) {
            result?.destroy?.();
            return null;
          }
          if (!result) return null;
          value = result;
          onReady(result);
          return result;
        })
        .catch((error) => {
          value?.destroy?.();
          value = null;
          if (!disposed) onError(error);
          return null;
        })
        .finally(() => {
          pending = null;
        });
      return pending;
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      value?.destroy?.();
      value = null;
    },
  };
}
