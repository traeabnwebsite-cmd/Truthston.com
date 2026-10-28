export function createAppState({ selected, prefersReducedMotion = false }) {
  return {
    mode: "immersive",
    calm: prefersReducedMotion,
    score: 0,
    stamps: 0,
    station: 0,
    selected,
  };
}
