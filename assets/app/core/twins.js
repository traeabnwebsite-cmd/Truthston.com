export function createTwinRegistry(container) {
  const buttons = new Set();
  let disposed = false;
  return {
    register(label, action) {
      if (disposed) return () => {};
      const button = document.createElement("button");
      button.textContent = label;
      button.onclick = action;
      container.append(button);
      buttons.add(button);
      return () => {
        button.remove();
        buttons.delete(button);
      };
    },
    destroy() {
      disposed = true;
      for (const button of buttons) button.remove();
      buttons.clear();
    },
  };
}
