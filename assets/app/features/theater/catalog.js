export function createScreeningCatalog(data) {
  const embeddedVideos = [
    {
      id: "QgZD5Uyg6t4",
      title: "Hit",
      date: "2024-09-03",
      duration: 152,
      thumb: "assets/videos/QgZD5Uyg6t4.jpg",
    },
    {
      id: "r700E994Obk",
      title: "Rain",
      date: "2023-12-18",
      duration: 184,
      thumb: "assets/videos/r700E994Obk.jpg",
    },
    {
      id: "xv2_XGzG5jw",
      title: "Rearview",
      date: "2023-12-18",
      duration: 244,
      thumb: "assets/videos/xv2_XGzG5jw.jpg",
    },
    {
      id: "UN9kx9RPRyA",
      title: "Slumz",
      date: "2023-12-18",
      duration: 176,
      thumb: "assets/videos/UN9kx9RPRyA.jpg",
    },
    {
      id: "enIxvD1HmWw",
      title: "Im Here",
      date: "2023-11-13",
      duration: 136,
      thumb: "assets/videos/enIxvD1HmWw.jpg",
    },
    {
      id: "JIMVaq_mQzA",
      title: "Reconsider",
      date: "2023-10-20",
      duration: 166,
      thumb: "assets/videos/JIMVaq_mQzA.jpg",
    },
    {
      id: "E_7e_egADjs",
      title: "Feel Like Tha Water",
      date: "2023-01-27",
      duration: 143,
      thumb: "assets/videos/E_7e_egADjs.jpg",
    },
    {
      id: "2cwbqwZS7So",
      title: "Shake Em Off",
      date: "2022-04-28",
      duration: 184,
      thumb: "assets/videos/2cwbqwZS7So.jpg",
    },
    {
      id: "AlZ0WSB8GdE",
      title: "Hope It Don't Change You",
      date: "2022-04-08",
      duration: 295,
      thumb: "assets/videos/AlZ0WSB8GdE.jpg",
    },
    {
      id: "9RRyy47Pg70",
      title: "Sky Scraper",
      date: "2022-02-07",
      duration: 222,
      thumb: "assets/videos/9RRyy47Pg70.jpg",
    },
    {
      id: "M_DoO5BmA9g",
      title: "Clutch",
      date: "2022-01-28",
      duration: 151,
      thumb: "assets/videos/M_DoO5BmA9g.jpg",
    },
    {
      id: "_kzuxBIPSYs",
      title: "Freestyle",
      date: "2021-07-01",
      duration: 174,
      thumb: "assets/videos/_kzuxBIPSYs.jpg",
    },
  ];
  const screeningVideos = (
    Array.isArray(data.videos) && data.videos.length
      ? data.videos
      : embeddedVideos
  ).filter((v) => /^[A-Za-z0-9_-]{11}$/.test(v.id));
  if (!screeningVideos.some((v) => v.id === "J8fztJ29L7E"))
    screeningVideos.unshift({
      id: "J8fztJ29L7E",
      title: "Strapped Up",
      date: "2011",
      duration: 0,
      thumb: "assets/videos/J8fztJ29L7E.jpg",
    });
  return screeningVideos;
}
