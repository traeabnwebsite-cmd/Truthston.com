// Shared road crossings and archive spans prevent signs from entering a deck.
export const ARCHIVE_CROSSINGS = Object.freeze({
  katy: Object.freeze({ z: -40, width: 14, y: 5.3 }),
  railway: Object.freeze({ z: -57, width: 4.4, y: 7.3 }),
});
export const archiveYearRows = Object.freeze([
  -22, -29, -50, -65, -75, -85, -95, -105,
]);
export function archiveClearance(z) {
  return Math.min(
    ...Object.values(ARCHIVE_CROSSINGS).map(
      (c) => Math.abs(z - c.z) - c.width / 2,
    ),
  );
}
