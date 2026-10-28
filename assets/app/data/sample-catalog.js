const titles = [
  "Hometown Truth",
  "Southside Stories",
  "Streetlight Sermons",
  "Still Standing",
  "City of Slabs",
  "The Long Way Home",
  "Concrete Roots",
  "Late Night Radio",
  "Heavy Is the Crown",
  "For the People",
  "No Shortcuts",
  "Bayou Blues",
  "Keep It Moving",
  "Block by Block",
  "After the Rain",
  "Tape Never Lies",
  "Homegrown",
  "The Giving Side",
  "Third Coast Heart",
  "Against the Grain",
  "Day One",
  "Corner Store Dreams",
  "True to the City",
  "Open Doors",
  "Slow Lane",
  "From the Ground",
  "All Heart",
  "On My Block",
  "Night Shift",
  "Houston Forever",
];
export const sample = {
  releases: titles.map((title, i) => ({
    title,
    year: 1998 + (i % 27),
    type: i % 3 ? "Mixtape" : "Album",
    tracks: [
      "Side A — Arrival",
      "Side A — In the room",
      "Side B — Houston after dark",
      "Side B — Home again",
    ],
  })),
  timeline: Array.from({ length: 12 }, (_, i) => ({
    date: `${1998 + i * 2}-${String(i + 1).padStart(2, "0")}-15`,
    title:
      ["First chapter", "A city in motion", "For the neighborhood"][i % 3] +
      " · sample moment",
  })),
  giving: Array.from({ length: 8 }, (_, i) => ({
    name: ["Relief Gang", "Angel By Nature", "Trae Day"][i % 3],
    description:
      "Concept pin: community support, neighborhood care and a city showing up for its own.",
    x: 15 + ((i * 23) % 70),
    y: 15 + ((i * 17) % 65),
  })),
};
