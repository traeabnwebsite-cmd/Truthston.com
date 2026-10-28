// Logical immersive session survives room changes and browser exits during rotation.
export function createFullscreenSession({
  now = () => performance.now(),
} = {}) {
  let wanted = false,
    native = false,
    pending = false,
    rotateUntil = -Infinity,
    lostAt = -Infinity;
  return {
    get active() {
      return wanted;
    },
    get native() {
      return native;
    },
    begin() {
      wanted = true;
      pending = true;
      lostAt = -Infinity;
    },
    fallback() {
      wanted = true;
      pending = false;
    },
    leave() {
      wanted = native = pending = false;
      lostAt = -Infinity;
    },
    rotate() {
      rotateUntil = now() + 1800;
      if (now() - lostAt < 1000) wanted = true;
    },
    sync(value) {
      if (value) {
        native = wanted = true;
        pending = false;
        return wanted;
      }
      if (native && !pending) {
        lostAt = now();
        if (now() > rotateUntil) wanted = false;
      }
      native = false;
      return wanted;
    },
  };
}
