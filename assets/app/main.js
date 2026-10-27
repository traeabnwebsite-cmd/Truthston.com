import { createCatalogPage } from "./features/catalog/page.js";
import { createDailyChallenge } from "./features/catalog/daily-challenge.js";
import { createAccountPage } from "./features/account/page.js";
import { createEditorialPage } from "./features/editorial/page.js";
import { createCommercePage } from "./features/commerce/page.js";
import { $, $$, esc } from "./core/dom.js";
import { createRandom } from "./core/random.js";
import { createAppState } from "./core/app-state.js";
import { createRouter, publicSections } from "./core/router.js";
import { createCoverArt } from "./data/cover-art.js";
import { embeddedVault } from "./data/fallback-catalog.js";
import { sample } from "./data/sample-catalog.js";
import { prepareCatalog } from "./data/catalog.js";
import {
  loadPublicContent,
  loadOptionalCatalog,
} from "./data/content-client.js";
("use strict");

let stampArtwork = null;
try {
  stampArtwork = (await import("../stamps.mjs")).renderStamp;
  $("#stamp-invite").innerHTML = stampArtwork("abn", { scope: "home" });
} catch (error) {
  console.warn("Stamp artwork unavailable; readable labels remain.", error);
}
const rand = createRandom(71);
const cover = createCoverArt({ random: rand });

await loadOptionalCatalog();

const siteContent = await loadPublicContent();

if (siteContent.site?.homeIntro) {
  const p = $(".subline p");
  p.replaceChildren(
    document.createTextNode(siteContent.site.homeIntro),
    document.createElement("br"),
    document.createTextNode(
      siteContent.site.homeInvitation || "Come inside. Dig a little deeper.",
    ),
  );
}
const supplied = window.RELEASE_DATA || window.releaseData || embeddedVault;
const { data, releases } = prepareCatalog({
  supplied,
  embeddedVault,
  siteContent,
  sample,
  cover,
});
const appState = createAppState({
  selected: releases[0],
  prefersReducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
});
let playing = false,
  ctx,
  source,
  analyser,
  gain,
  panner,
  bypass,
  buffer,
  started = 0,
  offset = 0,
  rate = 1,
  headphones = false,
  cassette = false,
  spin = 0,
  spinSpeed = 0,
  sceneAPI;
const today = new Date();
const dailyChallenge = createDailyChallenge({
  today,
  releases,
  appState,
  earn,
  toast,
});

$("#current-year").textContent = today.getFullYear();
$("#release-count").textContent = releases.length;
const mmdd =
  String(today.getMonth() + 1).padStart(2, "0") +
  "-" +
  String(today.getDate()).padStart(2, "0");
const matches = data.timeline.filter(
  (t) => String(t.date).slice(5, 10) === mmdd,
);
const moment =
  matches[0] || data.timeline[Math.floor(rand() * data.timeline.length)];
$("#day-label").textContent = matches.length
  ? "03 / On this day"
  : "03 / From the archive";
$("#day-title").textContent = moment?.title || "The story keeps going.";
$("#day-text").textContent = moment
  ? `${moment.date} / ${matches.length ? "Today in the archive." : "An archive date, selected for this visit."}`
  : "Add dated moments to release-data.js.";
function toast(t) {
  $("#toast").textContent = t;
  $("#toast").style.display = "block";
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => ($("#toast").style.display = "none"), 3500);
}
function earn(n) {
  const old = appState.score;
  appState.score = Math.min(100, appState.score + n);
  $("#meter").style.width = appState.score + "%";
  $("#percent").textContent = appState.score + "%";
  $(".meter").setAttribute("aria-valuenow", appState.score);
  const labels = [
    "The back door is open.",
    "Amber lights are on.",
    "The giving wing glows green.",
    "The vault is lit. Houston forever.",
  ];
  for (let i = 0; i < 4; i++)
    if (old < (i + 1) * 25 && appState.score >= (i + 1) * 25) {
      $("#unlock").textContent = labels[i];
      toast(labels[i]);
      sceneAPI?.unlock(i);
    }
}
function modal(html) {
  delete $("#modal").dataset.gallery;
  $("#modal-body").innerHTML = html;
  if (!$("#modal").open) $("#modal").showModal();
}
$(".close").onclick = () => $("#modal").close();
$("#modal").addEventListener("click", (e) => {
  if (e.target === $("#modal")) $("#modal").close();
});

// Account and rewards preview: device-local only. Replace these events with verified API awards in production.
const account = await createAccountPage({
  stampArtwork,
  toast,
  modal,
  releases,
  release: (r) => release(r),
  setMode: (m) => setMode(m),
  merch: () => commerce.merch(),
});

const editorial = createEditorialPage({
  siteContent,
  getWishlist: () => commerce.wishlist,
  renderGarment: (p) => commerce.renderGarment(p),
  toast,
  modal,
});

const router = createRouter({
  query: $,
  queryAll: $$,
  editorial: { open: (section) => editorial.open(section) },
  commerce: { open: () => commerce.render() },
  account: { open: (path) => account.open(path) },
});
function accountRoute() {
  return router.route();
}

$("#account-open").onclick = () => {
  account.navigate("overview");
  accountRoute();
};
$("#stamp-invite").onclick = $("#book-bottom").onclick = () => {
  account.navigate("stamps");
  accountRoute();
};
router.start();
setInterval(() => {
  if (playing && !document.hidden) account.tickListening();
}, 1000);

const catalog = createCatalogPage({
  appState,
  releases,
  sourceLabel: !!supplied,
  challenge: dailyChallenge,
  recordActivity: (...args) => account.recordEvent(...args),
  earn,
  toast,
  modal,
  play: (...args) => play(...args),
  pauseRoomForVideo: () => pauseRoomForVideo(),
  enterDJRoom: () => enterDJRoom(),
  registerTwin: (...args) => twin(...args),
});
function release(r) {
  return catalog.openRelease(r);
}

function twin(label, fn) {
  const b = document.createElement("button");
  b.textContent = label;
  b.onclick = fn;
  $("#twins").append(b);
}

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
const commerce = createCommercePage({
  siteContent,
  getPhoto: (id) => editorial.photo(id),
  enterDJRoom: () => enterDJRoom(),
  navigate: () => accountRoute(),
});
accountRoute();
function showDJFallback() {
  modal(
    '<section class="dj-room-fallback"><span class="eyebrow">THE DJ BOOTH / WEST WING</span><h2>Step into the booth.</h2><p>Select the turntables to open the mixer.</p><button class="primary" id="fallback-turntables">Select the turntables ↗</button><button class="secondary" id="fallback-bump">Shop Bumpboxx ↗</button></section>',
  );
  $("#fallback-turntables").onclick = deck;
  $("#fallback-bump").onclick = () =>
    commerce.bumpboxDisplay("Bumpboxx / gray display");
}
function enterDJRoom() {
  if ($("#modal").open) $("#modal").close();
  if (
    location.hash.startsWith("#account") ||
    location.hash.startsWith("#shop") ||
    publicSections.includes(location.hash.slice(1).split("/")[0])
  ) {
    location.hash = "";
    accountRoute();
  }
  if (sceneAPI) setMode("immersive");
  go(1);
  requestAnimationFrame(() =>
    $(".room-wrap").scrollIntoView({
      behavior: appState.calm ? "auto" : "smooth",
      block: "start",
    }),
  );
}

function pauseRoomForVideo() {
  if (!playing) return;
  stopDeck(0);
  stopDeck(1);
  stopAutoChop();
  syncAudioLabels();
}
function setupCinema() {
  const room = $(".room-wrap"),
    host = document.createElement("div");
  host.id = "room-cinema";
  host.hidden = true;
  host.setAttribute("aria-label", "Theater screen");
  room.append(host);
  const browse = document.createElement("div");
  browse.id = "cinema-browse-zone";
  browse.innerHTML =
    '<button id="cinema-browse-toggle" aria-expanded="true" aria-controls="cinema-carousel">Browse films <span>⌄</span></button>';
  room.append(browse);
  const rail = document.createElement("aside");
  rail.id = "cinema-carousel";
  rail.setAttribute("aria-label", "Theater film strip");
  rail.innerHTML = `<button id="cinema-rail-up" aria-label="Previous videos">‹</button><div id="cinema-rail-scroll">${screeningVideos.map((v, i) => `<button class="cinema-pick" data-cinema-video="${i}" aria-current="false"><img loading="lazy" src="${esc(v.thumb)}" alt=""><span><b>${esc(v.title)}</b></span></button>`).join("")}</div><button id="cinema-rail-down" aria-label="More videos">›</button>`;
  browse.append(rail);
  function menu(open) {
    room.classList.toggle("cinema-menu-open", open);
    $("#cinema-browse-toggle").setAttribute("aria-expanded", String(open));
    rail.setAttribute("aria-hidden", String(!open));
    if (open) rail.removeAttribute("inert");
    else rail.setAttribute("inert", "");
  }
  room._cinemaMenu = menu;
  let hideMenu;
  const closeSoon = () => {
    clearTimeout(hideMenu);
    hideMenu = setTimeout(() => {
      if (cinemaState.active && !browse.matches(":focus-within")) menu(false);
    }, 450);
  };
  browse.addEventListener("pointerenter", () => {
    clearTimeout(hideMenu);
    menu(true);
  });
  browse.addEventListener("pointerleave", closeSoon);
  browse.addEventListener("focusin", () => menu(true));
  browse.addEventListener("focusout", closeSoon);
  $("#cinema-browse-toggle").onclick = () => menu(true);
  browse.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      $("#cinema-browse-toggle").focus();
      menu(false);
    }
  });
  const controls = document.createElement("div");
  controls.id = "cinema-controls";
  controls.innerHTML =
    '<span id="cinema-now" role="status">Choose a video from the carousel.</span><button id="cinema-stop">Lights up</button><button id="cinema-leave">Back to the shop</button><a id="cinema-external" target="_blank" rel="noopener noreferrer" hidden>Open on YouTube ↗</a>';
  room.append(controls);
  $$("[data-cinema-video]").forEach(
    (b) => (b.onclick = () => video(+b.dataset.cinemaVideo)),
  );
  $("#cinema-rail-up").onclick = () =>
    $("#cinema-rail-scroll").scrollBy({
      left: -360,
      behavior: appState.calm ? "auto" : "smooth",
    });
  $("#cinema-rail-down").onclick = () =>
    $("#cinema-rail-scroll").scrollBy({
      left: 360,
      behavior: appState.calm ? "auto" : "smooth",
    });
  $("#cinema-stop").onclick = stopCinema;
  $("#cinema-leave").onclick = () => go(0);
  document.addEventListener("truth-station", (e) => {
    document.body.classList.toggle("theater-mode", e.detail === 2);
    document.body.classList.toggle("in-screening-room", e.detail === 2);
    if (e.detail === 2) {
      menu(!cinemaState.active);
      document.dispatchEvent(new Event("truth-guide-screening"));
      room.scrollIntoView({ block: "start" });
    } else stopCinema();
  });
}
let youtubeReady = null,
  cinemaSerial = 0;
function loadYouTubeAPI() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeReady) return youtubeReady;
  youtubeReady = new Promise((resolve, reject) => {
    const old = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      old?.();
      resolve(window.YT);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.onerror = () => reject(new Error("Video API unavailable"));
    document.head.append(script);
    setTimeout(() => {
      if (!window.YT?.Player) reject(new Error("Video API timed out"));
    }, 15000);
  });
  return youtubeReady;
}
function cinemaPlaying(value, ended = false) {
  cinemaState.playing = value;
  if (ended) $(".room-wrap")._cinemaMenu?.(true);
  document.dispatchEvent(
    new CustomEvent("truth-cinema", { detail: { playing: value, ended } }),
  );
  if (cinemaState.selected >= 0)
    $("#cinema-now").textContent =
      (ended ? "FINISHED / " : value ? "NOW PLAYING / " : "ON SCREEN / ") +
      screeningVideos[cinemaState.selected].title;
}
function stopCinema() {
  cinemaSerial++;
  cinemaState.active = false;
  cinemaPlaying(false);
  try {
    cinemaState.player?.destroy();
  } catch {}
  cinemaState.player = null;
  const host = $("#room-cinema");
  if (host) {
    host.innerHTML = "";
    host.hidden = true;
  }
  sceneAPI?.setCinemaLights?.(false);
  document.body.classList.remove("cinema-playing");
  $(".room-wrap")._cinemaMenu?.(true);
  $("#cinema-now") &&
    ($("#cinema-now").textContent = "Choose a video from the carousel.");
}
async function video(i = 0) {
  if (!screeningVideos.length) return;
  if ($("#modal").open) $("#modal").close();
  if (sceneAPI && appState.mode !== "immersive") setMode("immersive");
  if (appState.station !== 2) go(2);
  i = Math.max(0, Math.min(screeningVideos.length - 1, i));
  const selected = screeningVideos[i],
    serial = ++cinemaSerial;
  pauseRoomForVideo();
  try {
    cinemaState.player?.destroy();
  } catch {}
  cinemaState.player = null;
  cinemaState.active = true;
  cinemaState.selected = i;
  cinemaPlaying(false);
  document.body.classList.add(
    "theater-mode",
    "in-screening-room",
    "cinema-playing",
  );
  sceneAPI?.setCinemaLights?.(true);
  sceneAPI?.theaterView?.();
  document.dispatchEvent(new Event("truth-guide-screening"));
  $$("[data-cinema-video]").forEach((b) =>
    b.setAttribute("aria-current", String(+b.dataset.cinemaVideo === i)),
  );
  $("#cinema-now").textContent = "LOADING / " + selected.title;
  $("#cinema-external").hidden = false;
  $("#cinema-external").href = "https://www.youtube.com/watch?v=" + selected.id;
  const host = $("#room-cinema");
  host.hidden = false;
  const iframe = document.createElement("iframe");
  iframe.id = "cinema-youtube";
  iframe.title = "Trae Tha Truth — " + selected.title;
  iframe.width = "960";
  iframe.height = "540";
  iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  iframe.src =
    "https://www.youtube-nocookie.com/embed/" +
    selected.id +
    "?enablejsapi=1&playsinline=1&rel=0&fs=0&autoplay=1&origin=" +
    encodeURIComponent(location.origin);
  host.replaceChildren(iframe);
  host.dataset.video = selected.id;
  $(".room-wrap")._cinemaMenu?.(false);
  document.activeElement?.blur();
  try {
    const YT = await loadYouTubeAPI();
    if (serial !== cinemaSerial) return;
    cinemaState.player = new YT.Player(iframe, {
      events: {
        onReady: (e) => {
          if (serial === cinemaSerial) {
            $("#cinema-now").textContent = "ON SCREEN / " + selected.title;
            e.target.playVideo();
          }
        },
        onStateChange: (e) => {
          if (serial !== cinemaSerial) return;
          if (e.data === 1) cinemaPlaying(true);
          else if ([0, 2, 5].includes(e.data))
            cinemaPlaying(false, e.data === 0);
        },
        onAutoplayBlocked: () => {
          if (serial === cinemaSerial)
            $("#cinema-now").textContent =
              "Press play on the theater screen / " + selected.title;
        },
        onError: () => {
          if (serial !== cinemaSerial) return;
          cinemaPlaying(false);
          $("#cinema-now").textContent =
            "This upload is unavailable here. Choose another video or open YouTube.";
        },
      },
    });
  } catch {
    if (serial === cinemaSerial)
      $("#cinema-now").textContent =
        "Use the play button on the screen. If unavailable, choose another video.";
  }
}

screeningVideos.forEach((v, i) =>
  twin("Watch video: " + v.title, () => video(i)),
);
$("#modal").addEventListener("close", () => {
  const frame = $("#youtube-player");
  if (frame) frame.src = "about:blank";
});

function timeline(year) {
  const items = data.timeline.filter(
    (t) =>
      Number(String(t.date).slice(0, 4)) === year || Number(t.year) === year,
  );
  modal(
    `<span class="eyebrow">THE BACK DOOR / TRUTHSTON, TEXAS</span><h2>${year || "Every year. A chapter."}</h2>${year ? `<p>${items.length ? items.map((t) => esc(t.title)).join("<br>") : "No archive entries for this year yet."}</p>` : ""}<div class="year-grid">${Array.from({ length: today.getFullYear() - 1979 }, (_, i) => `<button data-year="${1980 + i}">${1980 + i}</button>`).join("")}</div>`,
  );
  $$("[data-year]").forEach(
    (b) => (b.onclick = () => timeline(+b.dataset.year)),
  );
}
for (let y = 1980; y <= today.getFullYear(); y++)
  twin("Houston street year " + y, () => timeline(y));
function giving(i) {
  modal(
    `<span class="eyebrow">THE GIVING WING / COMMUNITY FIRST</span><h2>${i === undefined ? "More than music." : esc(data.giving[i].name)}</h2><p>${i === undefined ? "A city is only as strong as the people who show up for it." : esc(data.giving[i].description)}</p><div class="map" aria-label="Stylised Houston map">${data.giving.map((p, k) => `<button class="pin" style="left:${Number(p.x) || 15 + k * 8}%;top:${Number(p.y) || 20 + k * 6}%" data-pin="${k}" aria-label="${esc(p.name)}">${k + 1}</button>`).join("")}</div><p>COMMUNITY LEDGER · DEMONSTRATION<br>${data.giving.length} map pins / 3 community initiatives / No live totals</p>`,
  );
  $$("[data-pin]").forEach((b) => (b.onclick = () => giving(+b.dataset.pin)));
}
data.giving.forEach((p, i) =>
  twin(p.name + " community pin " + (i + 1), () => giving(i)),
);
twin("Community ledger", () => giving());
twin("DJ booth turntables and mixer", deck);
twin("Enter the screening room", () => go(2));
twin("Return to the record shop", () => go(0));
twin("Back door to Houston street", () => go(3));
// One supplied record, two transport heads. Both decks share a single decoded AudioBuffer.
const previewTrack = {
  title: "Boss Ballin",
  url: "assets/audio/boss-ballin.mp3",
  bpm: 64.6,
};
let mixer,
  limiter,
  previewLoad,
  previewBusy = false,
  providedTrack = false,
  crossfade = -1,
  pitchLinked = true,
  chopTimer = null,
  chopSide = false,
  lastTap = 0,
  tapIntervals = [];
const decks = [
  {
    node: null,
    out: null,
    offset: 0,
    anchor: 0,
    speed: 1,
    pitch: 1,
    running: false,
    holding: false,
    scratchVoice: null,
    spin: 0,
  },
  {
    node: null,
    out: null,
    offset: 60 / previewTrack.bpm,
    anchor: 0,
    speed: 1,
    pitch: 1,
    running: false,
    holding: false,
    scratchVoice: null,
    spin: 0,
  },
];
const audioDuration = () => buffer?.duration || 318.093;
const wrapPosition = (n) =>
  ((n % audioDuration()) + audioDuration()) % audioDuration();
const clockText = (n) =>
  Math.floor(Math.max(0, n) / 60) +
  ":" +
  String(Math.floor(Math.max(0, n) % 60)).padStart(2, "0");
function initAudio() {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  gain = ctx.createGain();
  gain.gain.value = +$("#volume").value;
  mixer = ctx.createGain();
  limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -4;
  limiter.knee.value = 12;
  limiter.ratio.value = 5;
  limiter.attack.value = 0.003;
  limiter.release.value = 0.1;
  panner = ctx.createPanner();
  panner.panningModel = "HRTF";
  panner.distanceModel = "inverse";
  panner.refDistance = 5;
  decks.forEach((d) => {
    d.out = ctx.createGain();
    d.out.connect(mixer);
  });
  analyser.connect(limiter);
  limiter.connect(gain);
  gain.connect(ctx.destination);
  route();
  setCrossfade(crossfade);
}
function route() {
  if (!mixer) return;
  mixer.disconnect();
  panner.disconnect();
  if (headphones) {
    mixer.connect(panner);
    panner.connect(analyser);
  } else mixer.connect(analyser);
}
function syncAudioLabels() {
  const title = providedTrack ? previewTrack.title : "Original room beat";
  $("#track-title").textContent = title;
  $("#track-subtitle").textContent = previewBusy
    ? "LOADING YOUR PREVIEW RECORD…"
    : providedTrack
      ? "PREVIEW RECORD / BOTH DECKS LOADED"
      : "GENERATED BEAT / AUDIO FILE UNAVAILABLE";
  $("#play").textContent = previewBusy ? "…" : playing ? "Ⅱ" : "▶";
  $("#play").setAttribute(
    "aria-label",
    previewBusy ? "Loading preview track" : playing ? "Pause" : "Press play",
  );
  $("#fullscreen-play").textContent = previewBusy
    ? "Loading…"
    : playing
      ? "Ⅱ Pause"
      : "▶ Press play";
  for (const el of [$("#play"), $("#fullscreen-play")])
    el.disabled = previewBusy;
  for (let i = 0; i < 2; i++) {
    const el = $("#deck-" + i + "-transport");
    if (el) {
      el.textContent = decks[i].running ? "Ⅱ Pause" : "▶ Start";
      el.setAttribute("aria-pressed", String(decks[i].running));
    }
  }
  $("#time").textContent =
    clockText(position()) + " / " + clockText(audioDuration());
  $(".dock").dataset.audioStatus = previewBusy
    ? "loading"
    : playing
      ? "playing"
      : "paused";
  $(".dock").dataset.track = title;
  $(".dock").dataset.bpm = String(previewTrack.bpm);
}
async function loadPreviewRecord() {
  if (previewLoad) return previewLoad;
  previewLoad = (async () => {
    previewBusy = true;
    syncAudioLabels();
    try {
      const res = await fetch(previewTrack.url);
      if (!res.ok) throw new Error("Preview record unavailable");
      buffer = await ctx.decodeAudioData(await res.arrayBuffer());
      providedTrack = true;
    } catch {
      buffer = ctx.createBuffer(1, ctx.sampleRate * 12, ctx.sampleRate);
      const a = buffer.getChannelData(0),
        sr = ctx.sampleRate;
      for (let j = 0; j < a.length; j++) {
        const t = j / sr,
          k = t % 0.75,
          h = t % 0.1875;
        a[j] = Math.tanh(
          (Math.sin(2 * Math.PI * (45 * k + 6 * (1 - Math.exp(-k * 30)))) *
            Math.exp(-k * 18) +
            (Math.random() * 2 - 1) * Math.exp(-h * 100) * 0.1 +
            Math.sin(2 * Math.PI * 55 * t) * 0.16) *
            0.6,
        );
      }
      providedTrack = false;
      toast(
        "The supplied MP3 could not load. The original room beat is available.",
      );
    } finally {
      previewBusy = false;
      decks[1].offset = 60 / previewTrack.bpm;
      syncAudioLabels();
    }
  })();
  return previewLoad;
}
function deckPosition(i) {
  const d = decks[i];
  return wrapPosition(
    d.offset +
      (d.running && !d.holding
        ? Math.max(0, (ctx?.currentTime || 0) - d.anchor) * d.speed
        : 0),
  );
}
function position() {
  return buffer ? deckPosition(crossfade > 0.1 ? 1 : 0) : 0;
}
function stopDeck(i) {
  const d = decks[i];
  if (d.running) d.offset = deckPosition(i);
  if (d.node) {
    try {
      d.node.stop();
    } catch {}
    d.node.disconnect();
    d.node = null;
  }
  d.running = false;
  d.holding = false;
  playing = decks.some((d) => d.running);
  source = decks[0].node;
}
function startDeck(i, pos, when) {
  const d = decks[i];
  if (d.node) {
    try {
      d.node.stop();
    } catch {}
    d.node.disconnect();
  }
  const node = ctx.createBufferSource();
  node.buffer = buffer;
  node.loop = true;
  node.playbackRate.value = d.pitch;
  node.connect(d.out);
  d.node = node;
  d.offset = wrapPosition(pos);
  d.anchor = when ?? ctx.currentTime;
  d.speed = d.pitch;
  d.running = true;
  d.holding = false;
  node.start(d.anchor, d.offset);
  playing = true;
  source = decks[0].node;
  rate = decks[0].pitch;
}
async function play(force) {
  try {
    initAudio();
    await ctx.resume();
    if (previewBusy) return;
    await loadPreviewRecord();
    if (force && playing) return;
    if (playing) {
      stopDeck(0);
      stopDeck(1);
      stopAutoChop();
    } else {
      const when = ctx.currentTime + 0.04,
        pos = decks[0].offset;
      startDeck(0, pos, when);
      startDeck(1, pos + 60 / previewTrack.bpm, when);
      earn(6);
    }
    syncAudioLabels();
  } catch (e) {
    previewBusy = false;
    syncAudioLabels();
    toast("Audio could not start. Press play to try again.");
  }
}
async function toggleDeck(i) {
  initAudio();
  await ctx.resume();
  await loadPreviewRecord();
  const d = decks[i];
  if (d.running) stopDeck(i);
  else startDeck(i, d.offset);
  syncAudioLabels();
}
function setDeckPitch(i, multiplier) {
  const d = decks[i],
    p = deckPosition(i);
  d.offset = p;
  d.anchor = ctx?.currentTime || 0;
  d.pitch = Math.max(0.5, Math.min(1.16, multiplier));
  d.speed = d.pitch;
  if (d.node && !d.holding)
    d.node.playbackRate.setTargetAtTime(d.pitch, ctx.currentTime, 0.018);
  rate = decks[0].pitch;
  const slider = $("#pitch-" + i),
    read = $("#pitch-read-" + i);
  if (slider) slider.value = Math.round(d.pitch * 100);
  if (read)
    read.textContent =
      (d.pitch >= 1 ? "+" : "") + Math.round((d.pitch - 1) * 100) + "%";
  const speedRead = $("#deck-" + i + "-speed");
  if (speedRead)
    speedRead.textContent = (previewTrack.bpm * d.pitch).toFixed(1) + " BPM";
}
function setCrossfade(v, manual = false) {
  crossfade = Math.max(-1, Math.min(1, v));
  if (manual) {
    stopAutoChop();
    if (playing && Math.abs(v) > 0.8)
      account.recordEvent("cut", String(Date.now()));
  }
  if (ctx && decks[0].out) {
    const u = (crossfade + 1) / 2;
    decks[0].out.gain.setTargetAtTime(
      Math.cos((u * Math.PI) / 2),
      ctx.currentTime,
      0.003,
    );
    decks[1].out.gain.setTargetAtTime(
      Math.sin((u * Math.PI) / 2),
      ctx.currentTime,
      0.003,
    );
  }
  const fader = $("#crossfader");
  if (fader) fader.value = crossfade;
  const read = $("#crossfade-read");
  if (read)
    read.textContent =
      crossfade < -0.95
        ? "A ONLY"
        : crossfade > 0.95
          ? "B ONLY"
          : crossfade < -0.15
            ? "A " + Math.round(((1 - crossfade) / 2) * 100) + "%"
            : crossfade > 0.15
              ? "B " + Math.round(((crossfade + 1) / 2) * 100) + "%"
              : "CENTER MIX";
  $(".dock").dataset.crossfader = String(crossfade);
}
function syncDecks() {
  if (!ctx || !buffer) return;
  const pos = deckPosition(0),
    running = playing;
  if (running) {
    const when = ctx.currentTime + 0.025;
    startDeck(0, pos, when);
    startDeck(1, pos + 60 / previewTrack.bpm, when);
  } else {
    decks[0].offset = pos;
    decks[1].offset = wrapPosition(pos + 60 / previewTrack.bpm);
  }
  syncAudioLabels();
  toast("Deck B is one beat ahead of Deck A.");
}
function stopAutoChop() {
  if (chopTimer) {
    clearInterval(chopTimer);
    chopTimer = null;
  }
  const b = $("#auto-chop");
  if (b) {
    b.textContent = "Auto chop";
    b.setAttribute("aria-pressed", "false");
  }
}
async function autoChop() {
  if (chopTimer) {
    stopAutoChop();
    return;
  }
  await play(true);
  if (!playing) return;
  let next = ctx.currentTime;
  chopSide = false;
  chopTimer = setInterval(() => {
    if (!playing) return;
    const step = 60 / previewTrack.bpm / Math.max(0.5, decks[0].pitch) / 2;
    if (ctx.currentTime >= next) {
      chopSide = !chopSide;
      setCrossfade(chopSide ? 1 : -1);
      next += step;
    }
  }, 12);
  $("#auto-chop").textContent = "Stop chop";
  $("#auto-chop").setAttribute("aria-pressed", "true");
}
function scratchVoice(i, pos, velocity) {
  if (!ctx || !buffer) return;
  const d = decks[i];
  if (d.scratchVoice) {
    try {
      d.scratchVoice.stop();
    } catch {}
  }
  const voice = ctx.createBufferSource(),
    envelope = ctx.createGain(),
    now = ctx.currentTime,
    speed = Math.max(0.16, Math.min(4, Math.abs(velocity)));
  if (velocity < 0) {
    const length = Math.ceil(buffer.sampleRate * 0.22),
      slice = ctx.createBuffer(
        buffer.numberOfChannels,
        length,
        buffer.sampleRate,
      ),
      sample = Math.floor(wrapPosition(pos) * buffer.sampleRate);
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      const input = buffer.getChannelData(ch),
        output = slice.getChannelData(ch);
      for (let j = 0; j < length; j++)
        output[j] =
          input[(((sample - j) % input.length) + input.length) % input.length];
    }
    voice.buffer = slice;
    voice.playbackRate.value = speed;
    voice.start(now);
  } else {
    voice.buffer = buffer;
    voice.loop = true;
    voice.playbackRate.value = speed;
    voice.start(now, wrapPosition(pos));
  }
  envelope.gain.setValueAtTime(0.001, now);
  envelope.gain.linearRampToValueAtTime(0.9, now + 0.005);
  envelope.gain.setValueAtTime(0.9, now + 0.09);
  envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
  voice.connect(envelope);
  envelope.connect(d.out);
  voice.stop(now + 0.17);
  d.scratchVoice = voice;
}
// Compatibility hook for the platter's keyboard nudge and the room disc animation.
function scratch(r) {
  if (!ctx) return;
  setDeckPitch(0, Math.max(0.5, Math.min(1.16, r)));
  if (pitchLinked) setDeckPitch(1, decks[0].pitch);
}
$("#play").onclick = () => play();
$("#fullscreen-play").onclick = () => play();
$("#fullscreen-volume").oninput = (e) => {
  $("#volume").value = e.target.value;
  gain?.gain.setTargetAtTime(+e.target.value, ctx.currentTime, 0.03);
};
$("#volume").oninput = (e) => {
  $("#fullscreen-volume").value = e.target.value;
  gain?.gain.setTargetAtTime(+e.target.value, ctx.currentTime, 0.03);
};
$("#seek").oninput = (e) => {
  if (!buffer) return;
  const p = (+e.target.value / 100) * audioDuration(),
    was = playing;
  if (was) {
    stopDeck(0);
    stopDeck(1);
    const when = ctx.currentTime + 0.025;
    startDeck(0, p, when);
    startDeck(1, p + 60 / previewTrack.bpm, when);
  } else {
    decks[0].offset = p;
    decks[1].offset = wrapPosition(p + 60 / previewTrack.bpm);
  }
  syncAudioLabels();
};
$("#headphones").onclick = () => {
  headphones = !headphones;
  $("#headphones").setAttribute("aria-pressed", headphones);
  route();
  sceneAPI?.audioPosition();
};

function deckMarkup(i) {
  return `<section class="dj-turntable" aria-label="Deck ${i ? "B" : "A"}"><div class="dj-model">DIRECT DRIVE <b>${i ? "B / +1 BEAT" : "A / MASTER"}</b></div><div class="dj-hardware"><div class="dj-arm"><i></i></div><div class="dj-vinyl" id="platter-${i}" role="slider" tabindex="0" aria-label="Deck ${i ? "B" : "A"} scratch. Drag in circles; left and right arrows scratch backward and forward." aria-valuemin="0" aria-valuemax="318" aria-valuenow="0"><div class="dj-record-label"><small>ABN / PREVIEW RECORD</small><b>BOSS<br>BALLIN</b><span>33⅓ / SIDE ${i ? "B" : "A"}</span></div></div><label class="dj-pitch">PITCH<input type="range" id="pitch-${i}" aria-label="Deck ${i ? "B" : "A"} pitch" min="50" max="116" step="1" value="${Math.round(decks[i].pitch * 100)}"><output id="pitch-read-${i}">${Math.round((decks[i].pitch - 1) * 100)}%</output></label></div><div class="dj-bottom"><button class="dj-start" id="deck-${i}-transport" aria-pressed="${decks[i].running}">${decks[i].running ? "Ⅱ Pause" : "▶ Start"}</button><span class="dj-strobe">● 33⅓</span><output id="deck-${i}-speed">${(previewTrack.bpm * decks[i].pitch).toFixed(1)} BPM</output></div><div class="dj-readout"><output id="deck-${i}-time">0:00.0</output><span id="deck-${i}-state">READY</span></div></section>`;
}
function deck() {
  modal(
    `<div class="dj-console"><span class="eyebrow">THE DJ BOOTH / TWO COPIES. ONE RECORD.</span><h2>Slow it down.<br>Chop it up.</h2><p class="dj-intro">Boss Ballin on both decks. B runs one beat ahead. Cut between A and B to repeat the phrase. Pitch changes speed and tone together.</p><div class="dj-rig">${deckMarkup(0)}<section class="dj-mixer" aria-label="DJ mixer"><div class="dj-mixer-brand">THE TRUTH<br><small>HOUSTON / TWO-DECK MIXER</small></div><button class="primary" id="dj-both">${playing ? "Ⅱ Pause both" : "▶ Play both"}</button><label class="dj-link"><input type="checkbox" id="link-pitch" ${pitchLinked ? "checked" : ""}> Link pitch</label><div class="dj-presets"><button data-dj-preset="1">Original</button><button data-dj-preset=".75">Screw 75%</button><button data-dj-preset=".65">Deep 65%</button></div><label class="dj-tempo">RECORD TEMPO<input id="dj-bpm" aria-label="Record tempo in beats per minute" type="number" min="40" max="180" step=".1" value="${previewTrack.bpm}"></label><small class="dj-hint">Estimated tempo. Adjust or tap to match the beat.</small><button class="secondary" id="dj-tap">Tap tempo</button><button class="secondary" id="dj-sync">B + one beat</button><div class="dj-fader"><div><b>A</b><output id="crossfade-read">A ONLY</output><b>B</b></div><input id="crossfader" aria-label="Crossfader, left Deck A, right Deck B" type="range" min="-1" max="1" step=".01" value="${crossfade}"><div class="dj-cuts"><button id="cut-a">Cut A [1]</button><button id="cut-b">Cut B [2]</button></div></div><button class="secondary" id="auto-chop" aria-pressed="${!!chopTimer}">${chopTimer ? "Stop chop" : "Auto chop"}</button></section>${deckMarkup(1)}</div><p class="dj-footnote">Drag either record to scratch forward or backward. Release to resume at its pitch setting. Keyboard: focus a record and use ← / →. The fader also works with arrow keys.</p></div>`,
  );
  for (let i = 0; i < 2; i++) {
    const p = $("#platter-" + i),
      d = decks[i];
    $("#deck-" + i + "-transport").onclick = () => toggleDeck(i);
    $("#pitch-" + i).oninput = (e) => {
      setDeckPitch(i, +e.target.value / 100);
      if (pitchLinked) setDeckPitch(1 - i, decks[i].pitch);
    };
    let angleLast = 0,
      timeLast = 0,
      wasRunning = false;
    function hold() {
      wasRunning = d.running;
      d.offset = deckPosition(i);
      d.holding = true;
      if (d.node) {
        try {
          d.node.stop();
        } catch {}
        d.node.disconnect();
        d.node = null;
      }
      $("#deck-" + i + "-state").textContent = "HELD";
      p.classList.add("held");
    }
    function releaseHold() {
      if (!d.holding) return;
      const pos = d.offset;
      d.holding = false;
      if (d.scratchVoice) {
        try {
          d.scratchVoice.stop();
        } catch {}
      }
      if (wasRunning) startDeck(i, pos);
      else d.running = false;
      p.classList.remove("held");
      playing = decks.some((x) => x.running);
      syncAudioLabels();
    }
    p.onpointerdown = async (e) => {
      e.preventDefault();
      p.setPointerCapture(e.pointerId);
      const rect = p.getBoundingClientRect();
      angleLast = Math.atan2(
        e.clientY - rect.top - rect.height / 2,
        e.clientX - rect.left - rect.width / 2,
      );
      timeLast = performance.now();
      initAudio();
      await ctx.resume();
      await loadPreviewRecord();
      if (p.hasPointerCapture(e.pointerId)) hold();
    };
    p.onpointermove = (e) => {
      if (!p.hasPointerCapture(e.pointerId) || !d.holding) return;
      const rect = p.getBoundingClientRect(),
        a = Math.atan2(
          e.clientY - rect.top - rect.height / 2,
          e.clientX - rect.left - rect.width / 2,
        ),
        now = performance.now();
      let delta = a - angleLast;
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      const seconds = (delta / (Math.PI * 2)) * 1.8,
        velocity = seconds / Math.max(0.008, (now - timeLast) / 1000);
      d.offset = wrapPosition(d.offset + seconds);
      d.spin += (delta * 180) / Math.PI;
      scratchVoice(i, d.offset, velocity);
      p.style.transform = `rotate(${d.spin}deg)`;
      $("#deck-" + i + "-state").textContent =
        velocity < 0 ? "◀ BACKSPIN" : "▶ FORWARD";
      p.dataset.scratchDirection = velocity < 0 ? "reverse" : "forward";
      angleLast = a;
      timeLast = now;
    };
    p.onpointerup = p.onpointercancel = p.onlostpointercapture = releaseHold;
    p.onkeydown = async (e) => {
      if (!["ArrowLeft", "ArrowRight", " "].includes(e.key)) return;
      e.preventDefault();
      if (e.key === " ") {
        await toggleDeck(i);
        return;
      }
      initAudio();
      await ctx.resume();
      await loadPreviewRecord();
      if (!d.holding) hold();
      const direction = e.key === "ArrowLeft" ? -1 : 1;
      d.offset = wrapPosition(d.offset + direction * 0.085);
      d.spin += direction * 17;
      scratchVoice(i, d.offset, direction * 1.2);
      p.style.transform = `rotate(${d.spin}deg)`;
      p.dataset.scratchDirection = direction < 0 ? "reverse" : "forward";
      $("#deck-" + i + "-state").textContent =
        direction < 0 ? "◀ BACKSPIN" : "▶ FORWARD";
    };
    p.onkeyup = (e) => {
      if (["ArrowLeft", "ArrowRight"].includes(e.key)) releaseHold();
    };
    p.onblur = releaseHold;
    p._releaseScratch = releaseHold;
  }
  $("#dj-both").onclick = async () => {
    await play();
    $("#dj-both").textContent = playing ? "Ⅱ Pause both" : "▶ Play both";
  };
  $("#link-pitch").onchange = (e) => {
    pitchLinked = e.target.checked;
    if (pitchLinked) setDeckPitch(1, decks[0].pitch);
  };
  $$("[data-dj-preset]").forEach(
    (b) =>
      (b.onclick = () => {
        setDeckPitch(0, +b.dataset.djPreset);
        setDeckPitch(1, +b.dataset.djPreset);
        syncDecks();
      }),
  );
  $("#crossfader").oninput = (e) => setCrossfade(+e.target.value, true);
  $("#cut-a").onclick = () => setCrossfade(-1, true);
  $("#cut-b").onclick = () => setCrossfade(1, true);
  $("#dj-sync").onclick = syncDecks;
  $("#auto-chop").onclick = autoChop;
  function tempo(v) {
    if (!Number.isFinite(v)) return;
    previewTrack.bpm = Math.max(40, Math.min(180, v));
    $("#dj-bpm").value = previewTrack.bpm.toFixed(1);
    setDeckPitch(0, decks[0].pitch);
    setDeckPitch(1, decks[1].pitch);
    syncDecks();
  }
  $("#dj-bpm").onchange = (e) => tempo(+e.target.value);
  $("#dj-tap").onclick = () => {
    const now = performance.now();
    if (lastTap && now - lastTap < 2000) {
      tapIntervals.push(now - lastTap);
      tapIntervals = tapIntervals.slice(-6);
      if (tapIntervals.length > 1)
        tempo(
          60000 /
            (tapIntervals.reduce((a, b) => a + b, 0) / tapIntervals.length),
        );
    } else tapIntervals = [];
    lastTap = now;
  };
  $("#modal-body").onkeydown = (e) => {
    if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.key === "1" || e.key === "2") {
      e.preventDefault();
      setCrossfade(e.key === "1" ? -1 : 1, true);
    }
  };
  setCrossfade(crossfade);
  for (let i = 0; i < 2; i++) setDeckPitch(i, decks[i].pitch);
  syncAudioLabels();
}
function updateDJ(dt) {
  for (let i = 0; i < 2; i++) {
    const d = decks[i],
      p = $("#platter-" + i),
      pos = buffer ? deckPosition(i) : 0;
    if (p) {
      if (d.running && !d.holding && !appState.calm)
        d.spin += dt * d.pitch * 200;
      p.style.transform = `rotate(${d.spin}deg)`;
      p.setAttribute("aria-valuenow", pos.toFixed(2));
      $("#deck-" + i + "-time").textContent =
        clockText(pos) + "." + Math.floor((pos % 1) * 10);
      if (!d.holding)
        $("#deck-" + i + "-state").textContent = d.running
          ? "PLAYING"
          : "PAUSED";
    }
  }
  if (ctx && buffer) {
    $(".dock").dataset.deckOffset = String(
      wrapPosition(deckPosition(1) - deckPosition(0)),
    );
    $(".dock").dataset.pitch = String(decks[0].pitch);
  }
}
$("#deck").onclick = enterDJRoom;
$("#open-dj-mixer").onclick = deck;
$("#dj-back-store").onclick = () => go(0);
$("#modal").addEventListener("close", () => {
  $$(".project-audio audio").forEach((a) => a.pause());
  $$('[id^="platter-"]').forEach((p) => p._releaseScratch?.());
  $("#modal-body").onkeydown = null;
});

function setMode(m) {
  appState.mode = m;
  document.body.classList.toggle("flat", m !== "immersive");
  $$("[data-mode]").forEach((b) =>
    b.classList.toggle("active", b.dataset.mode === m),
  );
  if (m === "reduced") setCalm(true);
  if (m === "immersive" && !sceneAPI) {
    document.body.classList.add("flat");
    toast("3D is unavailable. The full archive is open in Standard mode.");
    appState.mode = "standard";
    $$("[data-mode]").forEach((b) =>
      b.classList.toggle("active", b.dataset.mode === appState.mode),
    );
  }
}
function setCalm(v) {
  appState.calm = v;
  document.body.classList.toggle("calm", v);
  $("#calm").setAttribute("aria-pressed", v);
}
setCalm(appState.calm);
$$("[data-mode]").forEach((b) => (b.onclick = () => setMode(b.dataset.mode)));
$("#calm").onclick = () => setCalm(!appState.calm);
matchMedia("(prefers-reduced-motion: reduce)").addEventListener(
  "change",
  (e) => {
    if (e.matches) {
      setCalm(true);
      setMode("reduced");
    }
  },
);
$("#ballpark-roof").onclick = () => sceneAPI?.toggleBallparkRoof();
$("#roof-toggle").onclick = () => sceneAPI?.toggleRoof();
$$("[data-stadium-view]").forEach(
  (b) => (b.onclick = () => sceneAPI?.stadiumView(b.dataset.stadiumView)),
);
$$("[data-city]").forEach(
  (b) =>
    (b.onclick = () => {
      account.recordEvent("city", b.dataset.city);
      sceneAPI?.cityView(b.dataset.city);
    }),
);
$$("[data-uptown]").forEach(
  (b) => (b.onclick = () => sceneAPI?.cityView(b.dataset.uptown)),
);
$("#help").onclick = () =>
  modal(
    '<span class="eyebrow">WELCOME TO THE ROOM</span><h2>Make yourself at home.</h2><p>Drag left or right to orbit all the way around. Pick a station below to travel. Hover a sleeve, then click to pull it from the crate.<br><br>Press play to hear Boss Ballin, the supplied preview record. Open the DJ booth to scratch, change pitch and chop with the crossfader. Calm removes reactive light and motion. Standard opens the fast catalog. Reduced opens a still catalog.<br><br>Keyboard: Focus the room canvas and use arrows to orbit; +/- zoom. Tab to every control and the complete room-object list; Enter to open; Escape to close. Platter arrow keys change playback speed.</p>',
  );
$("#timeline-btn").onclick = () => timeline();
$("#challenge-btn").onclick = () => {
  setMode("standard");
  $("#grid button").focus();
};
// Fullscreen keeps controls, keyboard equivalents and object dialogs in its active subtree.
const roomElement = $(".room-wrap"),
  fullscreenButton = $("#fullscreen"),
  fullscreenExit = $("#fullscreen-exit"),
  fullscreenBar = $(".fullscreen-exit-bar");
let fullscreenScroll = { x: 0, y: 0 },
  fullscreenOverflow = "",
  fullscreenReturnFocus = null,
  fullscreenWasActive = false,
  fullscreenBusy = false;
const fullscreenOverlays = [
  $("#modal"),
  $("#toast"),
  $(".accessible"),
  $(".room-caption"),
].map((node) => {
  const anchor = document.createComment("fullscreen return point");
  node.before(anchor);
  return { node, anchor };
});
const nativeFullscreenElement = () =>
  document.fullscreenElement || document.webkitFullscreenElement || null;
const fullscreenActive = () =>
  nativeFullscreenElement() === roomElement ||
  roomElement.classList.contains("fullscreen-fallback");
function placeFullscreenOverlays(active) {
  for (const { node, anchor } of fullscreenOverlays) {
    const destination = active ? roomElement : anchor.parentNode;
    if (node.parentNode === destination) continue;
    const open = node.tagName === "DIALOG" && node.open,
      focus = document.activeElement;
    if (open) node.close();
    if (active) destination.append(node);
    else anchor.after(node);
    if (open) {
      node.showModal();
      if (focus && node.contains(focus)) focus.focus({ preventScroll: true });
    }
  }
}
function syncFullscreen() {
  const active = fullscreenActive();
  roomElement.classList.toggle("fullscreen-active", active);
  fullscreenButton.setAttribute("aria-pressed", String(active));
  fullscreenButton.setAttribute(
    "aria-label",
    active ? "Exit record store fullscreen" : "Enter record store fullscreen",
  );
  fullscreenButton.textContent = active ? "⛶ Exit fullscreen" : "⛶ Fullscreen";
  fullscreenBar.hidden = !active;
  placeFullscreenOverlays(active);
  if (!active && fullscreenWasActive) {
    document.body.style.overflow = fullscreenOverflow;
    window.scrollTo(fullscreenScroll.x, fullscreenScroll.y);
    requestAnimationFrame(() => {
      if (!$("#modal").open) {
        const focus = fullscreenReturnFocus?.isConnected
          ? fullscreenReturnFocus
          : fullscreenButton;
        focus.focus({ preventScroll: true });
      }
    });
  }
  fullscreenWasActive = active;
}
async function leaveFullscreen() {
  if (fullscreenBusy) return;
  fullscreenBusy = true;
  try {
    if (nativeFullscreenElement() === roomElement) {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) await exit.call(document);
    }
    roomElement.classList.remove("fullscreen-fallback");
    syncFullscreen();
  } catch {
    toast("Use Escape or your browser fullscreen control to return.");
    syncFullscreen();
  } finally {
    fullscreenBusy = false;
  }
}
async function enterFullscreen() {
  if (fullscreenBusy) return;
  fullscreenBusy = true;
  fullscreenScroll = { x: window.scrollX, y: window.scrollY };
  fullscreenOverflow = document.body.style.overflow;
  fullscreenReturnFocus = document.activeElement;
  try {
    const request =
      roomElement.requestFullscreen || roomElement.webkitRequestFullscreen;
    if (!request) throw new Error("Fullscreen unavailable");
    await request.call(roomElement);
  } catch {
    roomElement.classList.add("fullscreen-fallback");
    document.body.style.overflow = "hidden";
  } finally {
    syncFullscreen();
    fullscreenBusy = false;
  }
}
fullscreenButton.onclick = () =>
  fullscreenActive() ? leaveFullscreen() : enterFullscreen();
fullscreenExit.onclick = leaveFullscreen;
document.addEventListener("fullscreenchange", syncFullscreen);
document.addEventListener("webkitfullscreenchange", syncFullscreen);
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape" || !fullscreenActive() || $("#modal").open) return;
  e.preventDefault();
  leaveFullscreen();
});
syncFullscreen();
// Keep keyboard focus within CSS fullscreen; dialogs retain their native focus handling.
document.addEventListener("keydown", (e) => {
  if (
    e.key !== "Tab" ||
    !roomElement.classList.contains("fullscreen-fallback") ||
    $("#modal").open
  )
    return;
  const buttons = [
    ...roomElement.querySelectorAll(
      "button,a[href],input,select,textarea,[tabindex]",
    ),
  ].filter(
    (el) => !el.disabled && el.tabIndex >= 0 && el.getClientRects().length,
  );
  if (!buttons.length) return;
  const first = buttons[0],
    last = buttons[buttons.length - 1];
  if (
    e.shiftKey &&
    (document.activeElement === first ||
      !roomElement.contains(document.activeElement))
  ) {
    e.preventDefault();
    last.focus();
  } else if (
    !e.shiftKey &&
    (document.activeElement === last ||
      !roomElement.contains(document.activeElement))
  ) {
    e.preventDefault();
    first.focus();
  }
});
const names = [
  "Good music.<br>Deep roots.",
  "The DJ<br>booth.",
  "The city.<br>In motion.",
  "Every block.<br>A chapter.",
  "All heart.<br>All Houston.",
  "Wear the<br>truth.",
];
function go(i) {
  appState.station = i;
  document.body.classList.remove("at-stadium", "at-ballpark", "at-uptown");
  $(".room-label b").textContent =
    i === 1
      ? "THE DJ BOOTH"
      : i === 2
        ? "THE SCREENING ROOM"
        : i === 3
          ? "TRUTHSTON, TEXAS"
          : i === 5
            ? "THE ABN MERCH STORE"
            : "ABN RECORDS, CDs AND TAPES";
  $(".room-label small").textContent =
    i === 3 ? "THE CITY / THIRD COAST" : "THE RECORD ROOM / VOL. 001";
  document.body.classList.toggle("on-street", i === 3);
  document.body.classList.toggle("in-dj-room", i === 1);
  $(".room-label small").textContent =
    i === 1
      ? "THE DJ BOOTH / WEST WING"
      : i === 3
        ? "THE CITY / THIRD COAST"
        : "THE RECORD ROOM / VOL. 001";
  $$("[data-city]").forEach((b) =>
    b.classList.toggle("active", b.dataset.city === "downtown"),
  );
  $$("[data-station]").forEach((b) =>
    b.classList.toggle("active", +b.dataset.station === i),
  );
  $("#station-title").innerHTML = names[i];
  $("#station-note").textContent = [
    "DRAG TO LOOK AROUND. PICK A SLEEVE TO DIG IN.",
    "Select a turntable to open the mixer. Lower pitch to slow the record; cut between A and B to chop. Select a Bumpboxx to shop.",
    "THE SCREENING ROOM. ONE BIG SCREEN. PICK A VIDEO.",
    "Welcome to Truthston, Texas. Pick a Houston landmark or explore the years hanging above the street.",
    "COMMUNITY IS THE WHOLE POINT.",
    "CLICK THE APPAREL RACK TO ENTER THE MERCH STORE.",
  ][i];
  sceneAPI?.travel(i);
  document.dispatchEvent(new CustomEvent("truth-station", { detail: i }));
  if (appState.mode !== "immersive") {
    if (i === 1) showDJFallback();
    if (i === 2) video(0);
    if (i === 3) timeline();
    if (i === 4) giving();
    if (i === 5) commerce.merch();
  }
}
$$("[data-station]").forEach(
  (b) =>
    (b.onclick = () =>
      +b.dataset.station === 1 ? enterDJRoom() : go(+b.dataset.station)),
);
try {
  const T = await import(
    "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.1/three.module.min.js"
  );
  const canvas = $("#scene");
  const renderer = new T.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  const scene = new T.Scene();
  scene.background = new T.Color("#25251d");
  scene.fog = new T.FogExp2("#25251d", 0.025);
  const camera = new T.PerspectiveCamera(43, 1, 0.25, 1600);
  const world = new T.Group();
  scene.add(world);
  const interact = [],
    sleeves = [],
    ghosts = [],
    crts = [];
  const ray = new T.Raycaster();
  const pointer = new T.Vector2();
  let hovering = null,
    angle = 0.23,
    elevation = 6.7,
    radius = 15.5,
    target = new T.Vector3(0, 2, 0),
    targetGoal = target.clone(),
    angleGoal = angle,
    radiusGoal = radius,
    elevationGoal = elevation,
    lastFrame = 0,
    frames = 0,
    frameTotal = 0,
    lastGlitch = -10;
  const warm = new T.PointLight("#ffaf5c", 70, 25, 2);
  warm.position.set(-3, 7, 3);
  const roomAmbient = new T.HemisphereLight("#eed6a4", "#303a27", 2.6);
  scene.add(warm, roomAmbient);
  const sun = new T.DirectionalLight("#f1bb7a", 3);
  sun.position.set(-5, 10, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -12;
  sun.shadow.camera.right = 12;
  sun.shadow.camera.top = 12;
  sun.shadow.camera.bottom = -12;
  scene.add(sun);
  const greenLight = new T.PointLight("#4a9668", 0, 14);
  greenLight.position.set(5, 4, 0);
  scene.add(greenLight);
  const vaultLight = new T.PointLight("#ffbc51", 0, 18);
  vaultLight.position.set(0, 4, -5);
  scene.add(vaultLight);
  const venueMarks = {};
  function loadVenueMark(name, draw) {
    const image = new Image();
    image.onload = () => {
      draw(image);
      venueMarks[name] = "loaded";
      canvas.dataset.venueLogos = JSON.stringify(venueMarks);
    };
    image.onerror = () => {
      venueMarks[name] = "unavailable";
      canvas.dataset.venueLogos = JSON.stringify(venueMarks);
    };
    image.src = "assets/branding/" + name + ".svg";
  }
  function mat(c, extra = {}) {
    return new T.MeshStandardMaterial({ color: c, roughness: 0.85, ...extra });
  }
  const wood = mat("#57402a"),
    dark = mat("#242820"),
    paper = mat("#c4ac79"),
    red = mat("#9e3524");
  function box(w, h, d, m, x, y, z) {
    const o = new T.Mesh(new T.BoxGeometry(w, h, d), m);
    o.position.set(x, y, z);
    o.castShadow = true;
    o.receiveShadow = true;
    world.add(o);
    return o;
  }
  function label(
    text,
    w,
    h,
    x,
    y,
    z,
    color = "#e1d1aa",
    bg = "#263026",
    size = 80,
  ) {
    const c = document.createElement("canvas");
    c.width = Math.min(4096, Math.max(1024, Math.ceil(w * 220)));
    c.height = Math.max(128, Math.round((c.width * h) / w));
    const a = c.getContext("2d"),
      pad = Math.max(10, c.height * 0.08);
    a.fillStyle = bg;
    a.fillRect(0, 0, c.width, c.height);
    a.strokeStyle = color;
    a.lineWidth = Math.max(2, c.height * 0.013);
    a.strokeRect(pad, pad, c.width - pad * 2, c.height - pad * 2);
    a.fillStyle = color;
    a.textAlign = "center";
    a.textBaseline = "middle";
    a.font = `900 ${Math.floor(c.height * 0.57)}px Impact, Arial, sans-serif`;
    if (text === "BE SOMEONE") {
      const tw = a.measureText(text).width;
      a.save();
      a.translate(c.width / 2, c.height * 0.53);
      a.scale((c.width - pad * 4) / tw, 1);
      a.fillText(text, 0, 0);
      a.restore();
    } else a.fillText(text, c.width / 2, c.height * 0.53, c.width - pad * 3);
    const tex = new T.CanvasTexture(c);
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = Math.min(16, renderer.capabilities.getMaxAnisotropy());
    const o = new T.Mesh(
      new T.PlaneGeometry(w, h),
      new T.MeshStandardMaterial({
        map: tex,
        emissiveMap: tex,
        emissive: "#ffffff",
        emissiveIntensity: 0.3,
        roughness: 0.85,
      }),
    );
    o.position.set(x, y, z);
    world.add(o);
    return o;
  }
  function hit(o, text, fn) {
    o.userData = { ...o.userData, text, fn };
    interact.push(o);
    return o;
  }
  // The open-front room is a cutaway: all stations can be reached from the orbit.
  box(17, 0.3, 13, wood, 0, -0.2, 0);
  for (let i = 0; i < 22; i++)
    box(0.025, 0.012, 13, dark, -8.2 + i * 0.78, -0.035, 0);
  box(13.8, 7, 0.28, mat("#5d5540"), -1.6, 3.35, -6);
  box(1, 7, 0.28, mat("#5d5540"), 8, 3.35, -6);
  box(2.2, 3, 0.28, mat("#5d5540"), 6.4, 5.35, -6);
  box(0.25, 7, 7.3, mat("#484935"), -8.5, 3.35, -2.35);
  box(0.25, 7, 2.1, mat("#484935"), -8.5, 3.35, 4.95);
  box(0.25, 3.1, 2.6, mat("#484935"), -8.5, 5.3, 2.6);
  box(0.25, 7, 2.7, mat("#51472f"), 8.5, 3.35, -4.65);
  box(0.25, 7, 0.7, mat("#51472f"), 8.5, 3.35, -0.35);
  box(0.25, 3.2, 2.6, mat("#51472f"), 8.5, 5, -2);
  for (let y = 0; y < 11; y++)
    for (let x = 0; x < 28; x++) {
      if (x > 21 && x < 26 && y < 7) continue;
      const b = box(
        0.57,
        0.025,
        0.02,
        mat("#312d22"),
        -8.15 + x * 0.61 + (y % 2) * 0.3,
        0.3 + y * 0.6,
        -5.84,
      );
      b.castShadow = false;
    }
  const abnTexture = new T.TextureLoader().load(
    "assets/branding/abn-angel-by-nature-official.png",
  );
  abnTexture.colorSpace = T.SRGBColorSpace;
  abnTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  function abnMark(w, x, y, z) {
    const logo = new T.Mesh(
      new T.PlaneGeometry(w, (w * 281) / 512),
      new T.MeshBasicMaterial({ map: abnTexture }),
    );
    logo.position.set(x, y, z);
    world.add(logo);
    return logo;
  }
  abnMark(2.4, -5.1, 5.7, -5.72);
  label("ABN RECORDS", 4.1, 0.95, -1.4, 5.8, -5.72, "#ebd5a7", "#893222", 140);
  label(
    "CDs & TAPES / HOUSTON, TX",
    6.2,
    0.5,
    -2.2,
    4.9,
    -5.72,
    "#cfbc91",
    "#23291e",
    46,
  );
  label(
    "INDEPENDENT SPIRIT. HOUSTON SOUL.",
    4.2,
    0.45,
    -2.2,
    0.45,
    -5.7,
    "#c0a879",
    "#292b20",
    40,
  );
  const texLoader = new T.TextureLoader();
  const textures = releases.map((r) => {
    const t = texLoader.load(r.cover, undefined, undefined, () => {
      const fallback = texLoader.load(r.art);
      fallback.colorSpace = T.SRGBColorSpace;
      sleeves
        .filter((s) => s.userData.release === r)
        .forEach((s) => {
          s.material.map = fallback;
          s.material.needsUpdate = true;
        });
    });
    t.colorSpace = T.SRGBColorSpace;
    return t;
  });
  function sleeveAt(idx, x, y, z, size, ry = 0) {
    const r = releases[idx];
    if (!r) return null;
    const m = new T.MeshStandardMaterial({
      map: textures[idx],
      roughness: 0.72,
      emissive: "#d9902b",
      emissiveIntensity: 0,
      side: T.DoubleSide,
    });
    const s = new T.Mesh(new T.PlaneGeometry(size, size), m);
    s.position.set(x, y, z);
    s.rotation.y = ry;
    s.userData = {
      release: r,
      base: s.position.clone(),
      normal: new T.Vector3(Math.sin(ry), 0, Math.cos(ry)),
      sleeve: true,
    };
    world.add(s);
    sleeves.push(s);
    hit(s, r.title + " / " + r.year, () => release(r));
    return s;
  }
  // 64 full-face sleeves across the back wall; every displayed artwork is different.
  for (let row = 0; row < 4; row++) {
    box(11.8, 0.14, 0.65, wood, -1.7, 1.05 + row * 0.91, -5.25);
    for (let col = 0; col < 16; col++)
      sleeveAt(
        row * 16 + col,
        -7.35 + col * 0.73,
        1.49 + row * 0.91,
        -5.15,
        0.68,
      );
  }
  for (let i = 0; i < 6; i++)
    box(0.1, 3.85, 0.68, wood, -7.65 + i * 2.38, 2.6, -5.25);
  // The archive continues around the left wall and the front-right wall instead of repeating covers.
  for (let row = 0; row < 4; row++) {
    box(0.55, 0.12, 6.7, wood, -8.15, 1.0 + row * 0.95, -2.05);
    box(0.55, 0.12, 1.3, wood, -8.15, 1.0 + row * 0.95, 4.5);
    for (let col = 0; col < 8; col++) {
      const idx = 64 + row * 8 + col;
      if (col === 5 || col === 6)
        sleeveAt(
          idx,
          -20.58,
          1.5 + row * 0.95,
          -4.2 + (col - 5) * 1.3,
          0.84,
          Math.PI / 2,
        );
      else
        sleeveAt(
          idx,
          -8.15,
          1.5 + row * 0.95,
          -4.55 + col * 1.28,
          0.84,
          Math.PI / 2,
        );
    }
  }
  for (let row = 0; row < 4; row++) {
    box(0.55, 0.12, 5.5, wood, 8.15, 1.02 + row * 0.95, 2.65);
    for (let col = 0; col < 6; col++)
      sleeveAt(
        96 + row * 6 + col,
        8.12,
        1.49 + row * 0.95,
        0.48 + col * 0.86,
        0.74,
        -Math.PI / 2,
      );
  }
  // The final 18 distinct releases sit in the three foreground bins.
  for (let crate = 0; crate < 3; crate++) {
    const x = -4.9 + crate * 2.2,
      z = -0.4;
    box(1.9, 1.35, 1.5, wood, x, 0.65, z);
    box(1.76, 0.09, 1.3, dark, x, 1.36, z);
    label(
      ["HOUSTON", "MIXTAPES", "DEEP CUTS"][crate],
      1.55,
      0.38,
      x,
      0.8,
      z + 0.76,
      "#25271e",
      "#c4b28d",
      95,
    );
    for (let j = 0; j < 6; j++) {
      const s = sleeveAt(120 + crate * 6 + j, x, 1.7, -0.9 + j * 0.21, 1.3);
      if (s) s.rotation.x = -0.12;
    }
  }
  canvas.dataset.shelfAudit = JSON.stringify({
    displayed: sleeves.length,
    distinctArtwork: new Set(sleeves.map((s) => s.userData.release.cover)).size,
  });

  // The two-deck console is moved intact into a dedicated DJ room.
  const djEquipmentStart = world.children.length;
  box(6.2, 0.22, 2.8, wood, 4, 1.45, 1.5);
  for (const x of [1.2, 6.8])
    for (const z of [0.3, 2.7]) box(0.15, 1.45, 0.15, dark, x, 0.7, z);
  const table = box(6.1, 0.09, 2.7, paper, 4, 1.6, 1.5);
  hit(table, "DJ booth — open turntable", deck);
  const disc = new T.Mesh(
    new T.CylinderGeometry(0.6, 0.6, 0.05, 64),
    mat("#111711", { metalness: 0.2 }),
  );
  disc.position.set(3.08, 1.84, 1.6);
  world.add(disc);
  hit(disc, "Drag the platter in the DJ booth", deck);
  const discLabel = new T.Mesh(new T.CylinderGeometry(0.2, 0.2, 0.06, 32), red);
  discLabel.position.copy(disc.position);
  discLabel.position.y += 0.02;
  world.add(discLabel);
  const silverDeck = mat("#a7aea5", { metalness: 0.5, roughness: 0.44 });
  for (const x of [3.08, 4.92]) {
    box(1.4, 0.14, 1.62, silverDeck, x, 1.72, 1.6);
    box(0.05, 0.04, 0.73, dark, x + 0.53, 1.84, 1.55);
    box(0.06, 0.04, 0.18, paper, x + 0.53, 1.87, 1.55);
    box(0.08, 0.05, 0.85, silverDeck, x + 0.38, 1.91, 1.4);
  }
  const discB = disc.clone(),
    discLabelB = discLabel.clone();
  discB.position.x = 4.92;
  discLabelB.position.x = 4.92;
  world.add(discB, discLabelB);
  hit(discB, "Deck B — open DJ mixer", deck);
  const mixerBody = box(0.36, 0.22, 1.25, dark, 4, 1.82, 1.6);
  hit(mixerBody, "Crossfader and pitch controls", deck);
  box(0.27, 0.025, 0.035, paper, 4, 1.95, 1.96);
  box(0.05, 0.035, 0.08, red, 3.9, 1.98, 1.96);
  label("THE DJ BOOTH", 4.3, 0.5, 4, 1, 2.96, "#dbc79c", "#2d3928", 68);
  for (const x of [1.45, 6.55]) {
    box(0.65, 1.1, 0.6, dark, x, 2.15, 1);
    for (const y of [1.9, 2.35]) {
      const o = new T.Mesh(
        new T.CylinderGeometry(0.18, 0.18, 0.05, 24),
        mat("#857556"),
      );
      o.rotation.x = Math.PI / 2;
      o.position.set(x, y, 1.34);
      world.add(o);
    }
  }
  const djEquipment = new T.Group();
  world.children.slice(djEquipmentStart).forEach((o) => djEquipment.add(o));
  world.add(djEquipment);
  djEquipment.position.set(-18.5, 0, -2);
  // Dedicated west-wing DJ room, reached through the shop's left wall.
  const djWall = mat("#282c2c"),
    djFrame = mat("#454e49", { metalness: 0.35, roughness: 0.6 });
  box(12.4, 0.24, 12.3, mat("#35372f"), -14.75, -0.12, 0.15);
  box(0.24, 6.7, 12.3, djWall, -21, 3.25, 0.15);
  box(12.5, 6.7, 0.24, djWall, -14.75, 3.25, -6);
  box(12.5, 6.7, 0.24, djWall, -14.75, 3.25, 6.3);
  box(12.5, 0.2, 12.3, djWall, -14.75, 6.6, 0.15);
  const foamCanvas = document.createElement("canvas");
  foamCanvas.width = foamCanvas.height = 256;
  const fq = foamCanvas.getContext("2d");
  fq.fillStyle = "#343a38";
  fq.fillRect(0, 0, 256, 256);
  fq.strokeStyle = "#464d4922";
  for (let j = 0; j < 256; j += 3) {
    fq.beginPath();
    fq.moveTo(j, 0);
    fq.lineTo(j, 256);
    fq.stroke();
    fq.beginPath();
    fq.moveTo(0, j);
    fq.lineTo(256, j);
    fq.stroke();
  }
  const foamTexture = new T.CanvasTexture(foamCanvas);
  foamTexture.colorSpace = T.SRGBColorSpace;
  const foam = mat("#b1bbb3", { map: foamTexture, roughness: 1 });
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 9; col++) {
      const x = -20.1 + col * 1.35;
      box(1.15, 1.65, 0.2, foam, x, 1.1 + row * 1.9, -5.74);
      for (let rib = 0; rib < 4; rib++)
        box(
          0.04,
          1.65,
          0.08,
          djWall,
          x - 0.4 + rib * 0.27,
          1.1 + row * 1.9,
          -5.58,
        );
    }
    for (const side of [-1, 1])
      for (let col = 0; col < 6; col++) {
        const z = -4.7 + col * 1.9;
        if (side > 0 && z > 1.3 && z < 3.9) continue;
        box(
          0.2,
          1.65,
          1.65,
          foam,
          side < 0 ? -20.76 : -8.72,
          1.1 + row * 1.9,
          z,
        );
      }
  }
  for (const z of [-5.5, 5.85])
    box(
      11.6,
      0.035,
      0.035,
      new T.MeshBasicMaterial({ color: "#ba8c48" }),
      -14.75,
      0.14,
      z,
    );
  box(6.8, 0.018, 4.2, mat("#71392e"), -14.5, 0.02, -0.05);
  const djGlow = new T.PointLight("#f4c38e", 65, 18, 2);
  djGlow.position.set(-14.4, 5.8, 2);
  scene.add(djGlow);
  for (const z of [1.18, 4.02]) box(0.26, 3.95, 0.16, djFrame, -8.42, 1.97, z);
  box(0.26, 0.16, 3, djFrame, -8.42, 3.95, 2.6);
  const djEntry = label(
    "DJ BOOTH",
    2.7,
    0.58,
    -8.27,
    4.43,
    2.6,
    "#eee0bf",
    "#81392d",
    95,
  );
  djEntry.rotation.y = Math.PI / 2;
  hit(djEntry, "Enter the DJ booth", () => go(1));
  const djBack = label(
    "BACK TO THE RECORD SHOP",
    2.7,
    0.45,
    -8.75,
    4.43,
    2.6,
    "#e7d4aa",
    "#2e493b",
    70,
  );
  djBack.rotation.y = -Math.PI / 2;
  hit(djBack, "Return to the record shop", () => go(0));
  twin("Enter the DJ booth", () => go(1));
  const djMark = abnMark(2.3, -14.5, 4.6, -5.53);
  label("THE DJ BOOTH", 4, 0.65, -14.5, 5.62, -5.5, "#eddbc0", "#7d3729", 95);
  function productPoster(path, x, w = 2.4) {
    const texture = new T.TextureLoader().load(path);
    texture.colorSpace = T.SRGBColorSpace;
    const image = new T.Mesh(
      new T.PlaneGeometry(w, w * 0.79),
      new T.MeshBasicMaterial({ map: texture }),
    );
    image.position.set(x, 4.4, -5.5);
    world.add(image);
  }
  productPoster("assets/branding/bumpboxx-blue-camo.jpeg", -10.7);
  function makeBumpbox(title, x, y, z, scale, color, style, photo) {
    const start = world.children.length;
    let bodyMat = mat(color, { roughness: 0.6 });
    if (style === "camo") {
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      const q = c.getContext("2d");
      q.fillStyle = "#6b7479";
      q.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 35; i++) {
        q.fillStyle = ["#28a7d0", "#444e58", "#9ca8b0"][i % 3];
        q.beginPath();
        const a = rand() * 256,
          b = rand() * 256;
        q.moveTo(a, b);
        q.lineTo(a + 20 + rand() * 40, b - 8);
        q.lineTo(a + 35, b + 28);
        q.lineTo(a - 15, b + 42);
        q.closePath();
        q.fill();
      }
      const tx = new T.CanvasTexture(c);
      tx.colorSpace = T.SRGBColorSpace;
      bodyMat = mat("#ffffff", { map: tx, roughness: 0.7 });
    }
    const body = box(3.5, 1.8, 0.7, bodyMat, 0, 0.9, 0);
    const edge = mat("#1d2626"),
      ring = mat(style === "camo" ? "#249ec8" : "#576361", {
        metalness: 0.4,
        roughness: 0.6,
      });
    for (const side of [-1, 1]) {
      box(0.12, 1.9, 0.8, edge, side * 1.72, 0.9, 0);
      box(0.1, 0.35, 0.1, djFrame, side * 1.22, 2.05, 0);
    }
    box(
      2.7,
      0.12,
      0.15,
      style === "camo" ? edge : mat("#bdc7c5", { metalness: 0.65 }),
      0,
      2.23,
      0,
    );
    const spots =
      style === "red"
        ? [
            [-0.83, 0.53, 0.4],
            [0.83, 0.53, 0.4],
            [-0.83, 1.33, 0.4],
            [0.83, 1.33, 0.4],
          ]
        : [
            [-1, 0.78, 0.56],
            [1, 0.78, 0.56],
            [0, 0.45, 0.22],
          ];
    for (const [xx, yy, r] of spots) {
      const outer = new T.Mesh(new T.CylinderGeometry(r, r, 0.06, 40), ring);
      outer.rotation.x = Math.PI / 2;
      outer.position.set(xx, yy, 0.39);
      world.add(outer);
      const inner = new T.Mesh(
        new T.CylinderGeometry(r * 0.82, r * 0.82, 0.07, 40),
        edge,
      );
      inner.rotation.x = Math.PI / 2;
      inner.position.set(xx, yy, 0.44);
      world.add(inner);
      const hub = new T.Mesh(
        new T.SphereGeometry(r * 0.27, 16, 10),
        mat("#3b4847"),
      );
      hub.scale.z = 0.25;
      hub.position.set(xx, yy, 0.49);
      world.add(hub);
    }
    label(
      "b",
      0.45,
      0.62,
      0,
      1.1,
      0.39,
      "#20a4dd",
      style === "red" ? "#a62c2a" : "#273236",
      140,
    );
    label(
      "bumpboxx",
      1.6,
      0.22,
      0,
      1.62,
      0.39,
      "#ecede4",
      style === "red" ? "#a62c2a" : "#273236",
      80,
    );
    hit(body, title, () => commerce.bumpboxDisplay(title, photo));
    twin(title, () => commerce.bumpboxDisplay(title, photo));
    const group = new T.Group();
    world.children.slice(start).forEach((o) => group.add(o));
    group.position.set(x, y, z);
    group.scale.setScalar(scale);
    world.add(group);
    return group;
  }
  for (const x of [-18.3, -14.5, -10.7]) {
    box(3.1, 1.05, 1.2, wood, x, 0.52, -4.8);
    box(2.95, 0.1, 1.1, djFrame, x, 1.09, -4.8);
  }
  makeBumpbox(
    "Bumpboxx / ABN red display",
    -18.3,
    1.16,
    -4.8,
    0.7,
    "#ae2a2e",
    "red",
    null,
  );
  makeBumpbox(
    "Bumpboxx / gray display",
    -14.5,
    1.16,
    -4.8,
    0.75,
    "#404b4e",
    "gray",
    "assets/branding/bumpboxx-flare.jpeg",
  );
  makeBumpbox(
    "Bumpboxx / blue camo display",
    -10.7,
    1.16,
    -4.8,
    0.7,
    "#627686",
    "camo",
    "assets/branding/bumpboxx-blue-camo.jpeg",
  );
  // Apparel and accessory fixtures replace the old booth in the record shop.
  const rackSteel = mat("#b1bbb7", { metalness: 0.65, roughness: 0.4 });
  for (const x of [2.7, 5.7]) {
    box(0.07, 2.8, 0.07, rackSteel, x, 1.4, 1.55);
    box(0.65, 0.07, 1.5, rackSteel, x, 0.12, 1.55);
    for (const z of [0.88, 2.22]) {
      const wheel = new T.Mesh(new T.SphereGeometry(0.09, 10, 8), dark);
      wheel.position.set(x, 0.08, z);
      world.add(wheel);
    }
  }
  box(3.1, 0.07, 0.07, rackSteel, 4.2, 2.8, 1.55);
  function hangingTee(x, z, color, yaw) {
    const shape = new T.Shape();
    shape.moveTo(-0.16, 0.49);
    shape.lineTo(-0.4, 0.4);
    shape.lineTo(-0.54, 0.12);
    shape.lineTo(-0.33, 0.02);
    shape.lineTo(-0.23, 0.22);
    shape.lineTo(-0.23, -0.55);
    shape.lineTo(0.23, -0.55);
    shape.lineTo(0.23, 0.22);
    shape.lineTo(0.33, 0.02);
    shape.lineTo(0.54, 0.12);
    shape.lineTo(0.4, 0.4);
    shape.lineTo(0.16, 0.49);
    shape.quadraticCurveTo(0, 0.3, -0.16, 0.49);
    const shirt = new T.Mesh(
      new T.ExtrudeGeometry(shape, {
        depth: 0.045,
        bevelEnabled: true,
        bevelSize: 0.015,
        bevelThickness: 0.015,
        bevelSegments: 1,
        steps: 1,
      }),
      mat(color, { roughness: 1 }),
    );
    shirt.position.set(x, 2.05, z);
    shirt.rotation.y = yaw;
    world.add(shirt);
    hit(shirt, "Browse ABN apparel", commerce.merch);
    const logo = new T.Mesh(
      new T.PlaneGeometry(0.33, 0.18),
      new T.MeshBasicMaterial({ map: abnTexture }),
    );
    logo.position.set(x, 2.15, z + 0.065);
    world.add(logo);
    for (const side of [-1, 1]) {
      const h = box(0.32, 0.025, 0.025, rackSteel, x + side * 0.12, 2.56, z);
      h.rotation.z = side * 0.42;
    }
    box(0.025, 0.16, 0.025, rackSteel, x, 2.72, z);
  }
  ["#24332d", "#b34934", "#d5c7a6", "#2b3130", "#315d48"].forEach((color, i) =>
    hangingTee(2.9 + i * 0.64, 1.55 + (i % 2) * 0.13, color, (i - 2) * 0.035),
  );
  const merchSign = label(
    "APPAREL / THE MERCH STORE",
    3.6,
    0.45,
    4.2,
    3.33,
    1.55,
    "#efdfbd",
    "#843c2b",
    90,
  );
  hit(merchSign, "Enter the merch store", commerce.merch);
  const merchPick = new T.Mesh(
    new T.BoxGeometry(3.8, 3.5, 1.9),
    new T.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  );
  merchPick.position.set(4.2, 1.75, 1.5);
  world.add(merchPick);
  hit(merchPick, "Enter the ABN merch store", commerce.merch);
  twin("Enter the ABN merch store", commerce.merch);
  box(3.8, 1.1, 0.9, wood, 4.4, 0.55, -0.5);
  for (let i = 0; i < 5; i++)
    box(
      0.65,
      0.07,
      0.55,
      mat(i % 2 ? "#2b4435" : "#d4c7a7"),
      2.9 + i * 0.72,
      1.14,
      -0.5,
    );
  for (const x of [3, 4.4, 5.8]) {
    const cap = new T.Mesh(
      new T.SphereGeometry(0.27, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      mat(x === 4.4 ? "#ae412f" : "#2c503d"),
    );
    cap.position.set(x, 1.25, -0.5);
    world.add(cap);
    const bill = box(0.42, 0.04, 0.38, mat("#2e4837"), x, 1.26, -0.2);
    hit(bill, "Browse ABN caps and accessories", commerce.merch);
  }
  label(
    "CAPS / TEES / EVERYDAY GOODS",
    3.6,
    0.38,
    4.4,
    0.65,
    -0.01,
    "#ead9b4",
    "#2d4c3c",
    80,
  );

  // A separate, enclosed screening lounge beyond the shop's east wall.
  const theaterScreen = { width: 9, height: 5.0625, y: 4.05, z: -0.8 };
  const theaterMeshStart = world.children.length;
  const theaterSeats = [];
  const theatreWall = mat("#292c29"),
    velvet = mat("#643629"),
    chairMat = mat("#5c382a");
  box(10.5, 0.25, 12, mat("#242b25"), 13.75, -0.15, 0);
  box(10.5, 6.7, 0.24, theatreWall, 13.75, 3.25, -6);
  box(10.5, 6.7, 0.24, theatreWall, 13.75, 3.25, 6);
  box(0.24, 1.52, 12, theatreWall, 19, 0.76, 0);
  box(0.24, 0.16, 12, theatreWall, 19, 6.66, 0);
  box(0.24, 5.07, 0.7, theatreWall, 19, 4.05, -5.65);
  box(0.24, 5.07, 2.3, theatreWall, 19, 4.05, 4.85);
  box(0.24, 6.7, 6, theatreWall, 8.5, 3.25, 3);
  box(10.5, 0.16, 12, mat("#20251f"), 13.75, 6.65, 0);
  box(0.45, 0.06, 2.6, paper, 8.5, 0.015, -2);
  for (const z of [-3.35, -0.65]) box(0.4, 3.8, 0.12, wood, 8.5, 1.9, z);
  box(0.4, 0.14, 2.8, wood, 8.5, 3.85, -2);
  const entranceSign = label(
    "SCREENING ROOM",
    2.55,
    0.5,
    8.32,
    4.25,
    -2,
    "#f0d6a1",
    "#753b2c",
    95,
  );
  entranceSign.rotation.y = -Math.PI / 2;
  hit(entranceSign, "Enter the separate screening room", () => go(2));
  const entrance = new T.Mesh(
    new T.PlaneGeometry(2.55, 3.65),
    new T.MeshBasicMaterial({
      color: "#d9902b",
      transparent: true,
      opacity: 0.045,
      side: T.DoubleSide,
      depthWrite: false,
    }),
  );
  entrance.rotation.y = -Math.PI / 2;
  entrance.position.set(8.32, 1.85, -2);
  world.add(entrance);
  hit(entrance, "Enter the screening room", () => go(2));
  const returnSign = label(
    "BACK TO THE RECORD SHOP",
    2.55,
    0.45,
    8.72,
    4.25,
    -2,
    "#d9bd8a",
    "#263d30",
    60,
  );
  returnSign.rotation.y = Math.PI / 2;
  hit(returnSign, "Return to the record shop", () => go(0));
  // Burgundy acoustic panels, aisle lighting and two rows of low lounge seats.
  for (const z of [-5.83, 5.83])
    for (let i = 0; i < 6; i++)
      box(0.85, 4, 0.1, i % 2 ? velvet : mat("#3c3c30"), 9.5 + i * 1.6, 2.6, z);
  for (const x of [12.5, 15])
    for (const z of [-3.5, -1.3, 1.3, 3.5]) {
      const upholstery = mat("#572d2a", { roughness: 0.95 }),
        trim = mat("#171c1a");
      box(1.18, 0.3, 1.26, upholstery, x, 0.54, z);
      box(0.24, 1.1, 1.26, upholstery, x - 0.49, 1.12, z);
      box(0.12, 0.85, 1.12, velvet, x - 0.345, 1.16, z);
      for (const dz of [-0.7, 0.7]) {
        box(1.22, 0.25, 0.18, trim, x, 0.82, z + dz);
        box(0.95, 0.09, 0.2, upholstery, x + 0.05, 0.965, z + dz);
        const cup = new T.Mesh(new T.TorusGeometry(0.075, 0.015, 6, 16), trim);
        cup.rotation.x = Math.PI / 2;
        cup.position.set(x + 0.33, 1.015, z + dz);
        world.add(cup);
      }
      box(0.7, 0.26, 0.94, trim, x, 0.2, z);
      box(0.42, 0.08, 1.02, trim, x + 0.75, 0.12, z);
      theaterSeats.push({
        x,
        z,
        seatTop: 0.69,
        anchor: new T.Vector3(x - 0.18, 0, z),
        spriteCenterY: 1.18,
      });
    }
  const companionSeat = theaterSeats.find((s) => s.x === 15 && s.z === -1.3);

  const theatreLights = [];
  for (const z of [-5.5, 5.5]) {
    box(
      9.3,
      0.035,
      0.035,
      new T.MeshBasicMaterial({ color: "#b77e36" }),
      13.75,
      0.12,
      z,
    );
    const glow = new T.PointLight("#e8a861", 16, 12, 2);
    glow.position.set(13.5, 4.8, z);
    scene.add(glow);
    theatreLights.push(glow);
  }
  const screenLight = new T.PointLight("#93aaa0", 22, 12, 2);
  screenLight.position.set(17.5, 4, 0);
  scene.add(screenLight);
  // A clean, recessed movie screen. No legacy CRT labels or wall-mounted video menu.
  const screenFrame = mat("#101714", { metalness: 0.32, roughness: 0.46 });
  for (const y of [
    theaterScreen.y - theaterScreen.height / 2 - 0.06,
    theaterScreen.y + theaterScreen.height / 2 + 0.06,
  ])
    box(
      0.3,
      0.12,
      theaterScreen.width + 0.24,
      screenFrame,
      18.45,
      y,
      theaterScreen.z,
    );
  for (const z of [
    theaterScreen.z - theaterScreen.width / 2 - 0.06,
    theaterScreen.z + theaterScreen.width / 2 + 0.06,
  ])
    box(
      0.3,
      theaterScreen.height,
      0.12,
      screenFrame,
      18.45,
      theaterScreen.y,
      z,
    );
  const screen = new T.Mesh(
    new T.PlaneGeometry(theaterScreen.width, theaterScreen.height),
    new T.MeshBasicMaterial({ color: "#111b17" }),
  );
  screen.position.set(18.21, theaterScreen.y, theaterScreen.z);
  screen.rotation.y = -Math.PI / 2;
  world.add(screen);
  hit(screen, "Choose a film from the theater menu", () => video(0));
  world.children
    .slice(theaterMeshStart)
    .forEach((o) => o.traverse((child) => child.layers.enable(1)));
  theatreLights.forEach((l) => l.layers.enable(1));
  screenLight.layers.enable(1);
  roomAmbient.layers.enable(1);
  sun.layers.enable(1);
  // An actual opening in the back wall leads into the night street.
  const streetCenter = 6.65;
  box(0.16, 4, 0.35, wood, 5.43, 2, -5.85);
  box(0.16, 4, 0.35, wood, 7.78, 2, -5.85);
  box(2.5, 0.18, 0.35, wood, 6.6, 4, -5.85);
  box(2.25, 0.08, 0.65, paper, 6.6, 0.02, -5.85);
  const doorPivot = new T.Group();
  doorPivot.position.set(5.5, 0, -5.65);
  world.add(doorPivot);
  const door = new T.Mesh(new T.BoxGeometry(2.16, 3.8, 0.14), mat("#334b35"));
  door.position.set(1.08, 1.9, 0);
  doorPivot.add(door);
  hit(door, "Step outside — Houston street", () => go(3));
  const handle = new T.Mesh(
    new T.SphereGeometry(0.065, 12, 8),
    mat("#d9902b", { metalness: 0.75, roughness: 0.3 }),
  );
  handle.position.set(1.93, 1.85, 0.13);
  doorPivot.add(handle);
  const doorSign = label(
    "STEP OUTSIDE / TRUTHSTON",
    2.4,
    0.42,
    6.6,
    4.35,
    -5.5,
    "#f4d19b",
    "#243d32",
    65,
  );
  hit(doorSign, "Step outside — Houston street", () => go(3));
  // Houston city set: landmark silhouettes based on real architecture; distances are compressed for a cinematic prototype.
  const skyCanvas = document.createElement("canvas");
  skyCanvas.width = 2048;
  skyCanvas.height = 1024;
  const sx = skyCanvas.getContext("2d"),
    sg = sx.createLinearGradient(0, 0, 0, 1024);
  sg.addColorStop(0, "#071e50");
  sg.addColorStop(0.48, "#124e8b");
  sg.addColorStop(0.75, "#326f95");
  sg.addColorStop(0.91, "#ae8a7b");
  sg.addColorStop(1, "#d4a06f");
  sx.fillStyle = sg;
  sx.fillRect(0, 0, 2048, 1024);
  for (let i = 0; i < 85; i++) {
    const x = rand() * 2048,
      y = 100 + rand() * 650,
      rx = 70 + rand() * 180,
      ry = 4 + rand() * 14;
    const cloud = sx.createRadialGradient(x, y, 0, x, y, rx);
    cloud.addColorStop(0, "rgba(219,183,177,.055)");
    cloud.addColorStop(1, "rgba(164,182,200,0)");
    sx.save();
    sx.translate(x, y);
    sx.scale(1, ry / rx);
    sx.fillStyle = cloud;
    sx.fillRect(-rx, -rx, rx * 2, rx * 2);
    sx.restore();
  }
  const streetSky = new T.CanvasTexture(skyCanvas);
  streetSky.colorSpace = T.SRGBColorSpace;
  const asphaltCanvas = document.createElement("canvas");
  asphaltCanvas.width = asphaltCanvas.height = 512;
  const ax = asphaltCanvas.getContext("2d");
  ax.fillStyle = "#303538";
  ax.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 30000; i++) {
    ax.fillStyle = rand() > 0.5 ? "#7d817d" : "#10191b";
    ax.globalAlpha = rand() * 0.2;
    ax.fillRect(rand() * 512, rand() * 512, 1.5, 1.5);
  }
  ax.globalAlpha = 0.3;
  ax.strokeStyle = "#101817";
  for (let i = 0; i < 14; i++) {
    ax.beginPath();
    let x = rand() * 512,
      y = rand() * 512;
    ax.moveTo(x, y);
    for (let j = 0; j < 6; j++) {
      x += (rand() - 0.5) * 30;
      y += rand() * 20;
      ax.lineTo(x, y);
    }
    ax.stroke();
  }
  const roadTex = new T.CanvasTexture(asphaltCanvas);
  roadTex.wrapS = roadTex.wrapT = T.RepeatWrapping;
  roadTex.repeat.set(3, 13);
  roadTex.colorSpace = T.SRGBColorSpace;
  box(1500, 0.12, 1500, mat("#34433f"), -80, -0.28, -220);
  const asphalt = mat("#767f7f", {
      map: roadTex,
      roughness: 0.55,
      metalness: 0.16,
    }),
    concrete = mat("#797971");
  box(21, 0.15, 97, asphalt, 6.65, -0.12, -56.5);
  box(95, 0.15, 16, asphalt, 6.65, -0.13, -41);
  for (const x of [-4.9, 18.2]) {
    box(2.1, 0.25, 97, concrete, x, 0.015, -56.5);
    box(0.18, 0.32, 97, mat("#aca58a"), x + (x < 6 ? 1 : -1), 0.03, -56.5);
    for (let i = 0; i < 37; i++)
      box(2.1, 0.007, 0.018, dark, x, 0.145, -9 - i * 2.6);
  }
  for (const x of [6.5, 6.8])
    box(0.08, 0.012, 34, mat("#c8a353"), x, -0.035, -26);
  for (const x of [1.7, 11.6])
    for (let i = 0; i < 26; i++) {
      if (i > 6 && i < 10) continue;
      box(0.1, 0.014, 1.8, paper, x, -0.035, -12 - i * 4);
    }
  for (const z of [-31.5])
    for (let i = 0; i < 13; i++)
      box(0.9, 0.015, 0.45, paper, -2.5 + i * 1.55, -0.025, z);
  for (const x of [-1.3, 14.5])
    for (let i = 0; i < 12; i++)
      box(2, 0.012, 0.055, mat("#9c9e8e"), x, -0.02, -15 - i * 7);
  const streetGlow = new T.HemisphereLight("#8daccb", "#242b2c", 1);
  scene.add(streetGlow);
  function glowMat(c, intensity = 0.6) {
    return mat(c, {
      emissive: c,
      emissiveIntensity: intensity,
      roughness: 0.5,
    });
  }
  function beam(a, b, r, m) {
    const v = new T.Vector3().subVectors(b, a);
    const mesh = new T.Mesh(new T.CylinderGeometry(r, r, v.length(), 8), m);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), v.normalize());
    world.add(mesh);
    return mesh;
  }
  // Truthston city gateway. Supports sit on the sidewalk shoulders, clear of traffic.
  const gatewaySteel = mat("#9aa6a6", { metalness: 0.65, roughness: 0.42 });
  for (const x of [-4.6, 17.9]) {
    box(0.25, 9.8, 0.25, gatewaySteel, x, 4.9, -24.5);
    box(0.8, 0.18, 0.8, concrete, x, 0.15, -24.5);
  }
  box(22.5, 0.2, 0.22, gatewaySteel, 6.65, 9.4, -24.5);
  const welcomeCanvas = document.createElement("canvas");
  welcomeCanvas.width = 2048;
  welcomeCanvas.height = 320;
  const wx = welcomeCanvas.getContext("2d");
  wx.fillStyle = "#214f43";
  wx.fillRect(0, 0, 2048, 320);
  wx.strokeStyle = "#e9ddbb";
  wx.lineWidth = 6;
  wx.strokeRect(14, 14, 2020, 292);
  wx.fillStyle = "#e9ddbb";
  wx.textAlign = "center";
  wx.font = "bold 44px Arial";
  wx.fillText("WELCOME TO", 1024, 76);
  wx.font = "900 130px Impact, Arial, sans-serif";
  wx.fillText("TRUTHSTON, TEXAS", 1024, 230);
  const welcomeTexture = new T.CanvasTexture(welcomeCanvas);
  welcomeTexture.colorSpace = T.SRGBColorSpace;
  const welcomeSign = new T.Mesh(
    new T.PlaneGeometry(16, 2.5),
    new T.MeshBasicMaterial({ map: welcomeTexture, side: T.DoubleSide }),
  );
  welcomeSign.position.set(6.65, 8.35, -24.34);
  welcomeSign.userData.truthstonWelcome = true;
  world.add(welcomeSign);
  canvas.dataset.cityWelcome = "Welcome to Truthston, Texas";
  // Low commercial strips, service alleys, brickwork and street-level windows.
  for (let side = 0; side < 2; side++)
    for (let i = 0; i < 6; i++) {
      const x = side ? 23.5 : -10.2,
        z = -16 - i * 12;
      if (i === 2 || (!side && (i === 0 || i === 4)) || (side && i === 3))
        continue;
      const h = 3.3 + rand() * 2.7,
        w = 7 + rand() * 2;
      box(w, h, 8, mat(["#715747", "#5c5d50", "#504c43"][i % 3]), x, h / 2, z);
      const face = side ? 19.65 : -6.3;
      for (let c = 0; c < 5; c++) {
        box(
          0.045,
          1.7,
          0.8,
          mat("#172b30", {
            metalness: 0.6,
            roughness: 0.3,
            emissive: "#706445",
            emissiveIntensity: 0.22,
          }),
          face,
          1.45,
          z - 3 + c * 1.45,
        );
        box(0.1, 0.12, 1.1, paper, face, 2.35, z - 3 + c * 1.45);
      }
      for (let row = 0; row < 9; row++)
        box(0.04, 0.025, 7.9, mat("#403b32"), face, row * 0.38 + 0.15, z);
      const aw = box(
        1.1,
        0.1,
        7.8,
        mat(i % 2 ? "#345246" : "#793d29"),
        side ? 19.2 : -5.9,
        2.7,
        z,
      );
      aw.rotation.z = side ? -0.09 : 0.09;
      const shop = label(
        [
          "HOUSTON MADE",
          "OPEN LATE",
          "THIRD COAST",
          "CORNER STORE",
          "ALL HEART",
          "BAYOU CITY",
        ][i],
        6,
        0.65,
        face + (side ? -0.1 : 0.1),
        h - 0.5,
        z,
        "#ddc8a2",
        "#273d34",
        72,
      );
      shop.rotation.y = side ? -Math.PI / 2 : Math.PI / 2;
      box(1.6, 0.6, 1.6, mat("#65716b"), x, h + 0.3, z);
      for (let j = 0; j < 8; j++)
        box(0.04, 0.05, 1.5, dark, x - 0.6 + j * 0.17, h + 0.62, z);
    }
  // Horizontal signal heads and green street-name signs at the cross street.
  for (const x of [-4.5, 17.8]) {
    box(0.13, 7, 0.13, dark, x, 3.5, -32);
    const direction = x < 6 ? 1 : -1;
    box(8, 0.12, 0.12, dark, x + direction * 3.9, 6.9, -32);
    for (const off of [2.2, 5.4]) {
      const xx = x + direction * off;
      box(1.25, 0.44, 0.3, mat("#ac882f"), xx, 6.65, -32);
      for (let k = 0; k < 3; k++) {
        const lamp = new T.Mesh(
          new T.CircleGeometry(0.12, 16),
          new T.MeshBasicMaterial({ color: k === 2 ? "#70d5a2" : "#332a22" }),
        );
        lamp.position.set(xx - 0.39 + k * 0.39, 6.65, -31.83);
        world.add(lamp);
      }
    }
    const st = label(
      x < 6 ? "TRAVIS ST" : "TEXAS AVE",
      3.3,
      0.55,
      x + direction * 1.6,
      5.7,
      -31.8,
      "#e2e9d5",
      "#235847",
      75,
    );
  }
  // Weathered utility poles and overhead lines along the sidewalks.
  for (const x of [-5.6, 18.9])
    for (let i = 0; i < 7; i++) {
      const z = -12 - i * 13;
      box(0.15, 7.8, 0.15, wood, x, 3.9, z);
      box(2, 0.1, 0.12, wood, x, 7.25, z);
      if (i < 6)
        for (const dx of [-0.65, 0, 0.65]) {
          const curve = new T.QuadraticBezierCurve3(
            new T.Vector3(x + dx, 7.3, z),
            new T.Vector3(x + dx, 6.7, z - 6.5),
            new T.Vector3(x + dx, 7.3, z - 13),
          );
          world.add(
            new T.Line(
              new T.BufferGeometry().setFromPoints(curve.getPoints(12)),
              new T.LineBasicMaterial({ color: "#242a2b" }),
            ),
          );
        }
    }
  // Amber light pools and restrained wet-road highlights, no flashing.
  for (let i = 0; i < 7; i++)
    for (const side of [-1, 1]) {
      const x = 6.65 + side * 10.7,
        z = -15 - i * 14;
      box(0.09, 6, 0.09, dark, x, 3, z);
      beam(
        new T.Vector3(x, 6, z),
        new T.Vector3(x - side * 1.1, 6.15, z),
        0.06,
        dark,
      );
      box(
        0.6,
        0.1,
        0.3,
        new T.MeshBasicMaterial({ color: "#ffd495" }),
        x - side * 1.2,
        6.1,
        z,
      );
      if (i < 3) {
        const light = new T.PointLight("#ffc17c", 23, 16, 2);
        light.position.set(x - side * 1.2, 5.7, z);
        scene.add(light);
      }
      const pool = new T.Mesh(
        new T.PlaneGeometry(2.4, 7),
        new T.MeshBasicMaterial({
          color: "#c8965e",
          transparent: true,
          opacity: 0.045,
          depthWrite: false,
        }),
      );
      pool.rotation.x = -Math.PI / 2;
      pool.position.set(x - side * 1.7, -0.025, z);
      world.add(pool);
    }
  // Small Houston street details: live-oak silhouettes, curbside bins, hydrants.
  for (const x of [-5.3, 18.6])
    for (const z of [-23, -56, -83]) {
      box(0.24, 2.4, 0.24, wood, x, 1.2, z);
      for (let i = 0; i < 3; i++) {
        const crown = new T.Mesh(
          new T.IcosahedronGeometry(1.4, 1),
          mat("#2d4838"),
        );
        crown.scale.set(1.4, 0.65, 1);
        crown.position.set(x + (i - 1) * 0.6, 2.6 + rand() * 0.5, z);
        world.add(crown);
      }
      box(0.45, 0.8, 0.45, dark, x, 0.4, z + 2);
    }
  for (const z of [-27, -62]) {
    box(0.2, 0.65, 0.2, red, -4.2, 0.45, z);
    box(0.5, 0.16, 0.2, red, -4.2, 0.6, z);
  }
  // Parked sedans with long, low proportions and chrome wheels; no logos or copyrighted vehicle meshes.
  function car(x, z, color, flip = false) {
    const g = new T.Group();
    function part(w, h, d, m, xx, yy, zz) {
      const o = new T.Mesh(new T.BoxGeometry(w, h, d), m);
      o.position.set(xx, yy, zz);
      g.add(o);
      return o;
    }
    const paint = mat(color, { metalness: 0.55, roughness: 0.32 });
    part(1.85, 0.48, 4.4, paint, 0, 0.65, 0);
    part(
      1.65,
      0.5,
      2.1,
      mat("#253d45", { metalness: 0.75, roughness: 0.2 }),
      0,
      1.08,
      0.1,
    );
    part(1.7, 0.08, 2, paint, 0, 1.36, 0.1);
    part(
      1.92,
      0.13,
      0.12,
      mat("#b1b3a7", { metalness: 0.8, roughness: 0.2 }),
      0,
      0.48,
      2.2,
    );
    for (const xx of [-0.9, 0.9])
      for (const zz of [-1.35, 1.35]) {
        const tire = new T.Mesh(
          new T.CylinderGeometry(0.33, 0.33, 0.23, 16),
          dark,
        );
        tire.rotation.z = Math.PI / 2;
        tire.position.set(xx, 0.37, zz);
        g.add(tire);
        const hub = new T.Mesh(
          new T.CylinderGeometry(0.21, 0.21, 0.25, 12),
          mat("#b4b8b0", { metalness: 0.9, roughness: 0.2 }),
        );
        hub.rotation.z = Math.PI / 2;
        hub.position.copy(tire.position);
        g.add(hub);
      }
    for (const xx of [-0.62, 0.62]) {
      part(
        0.36,
        0.14,
        0.04,
        new T.MeshBasicMaterial({ color: "#fff1c4" }),
        xx,
        0.7,
        -2.23,
      );
      part(
        0.4,
        0.12,
        0.04,
        new T.MeshBasicMaterial({ color: "#b63325" }),
        xx,
        0.7,
        2.23,
      );
    }
    g.position.set(x, 0, z);
    if (flip) g.rotation.y = Math.PI;
    world.add(g);
  }
  // Three commissioned vehicles in a marked service lot directly behind the record shop.
  function customVehicle(kind, x, z, yaw) {
    const g = new T.Group(),
      black = mat("#0b1016", { metalness: 0.55, roughness: 0.25 }),
      glass = mat("#122d3b", { metalness: 0.8, roughness: 0.16 }),
      chrome = mat("#8d9da7", { metalness: 0.9, roughness: 0.2 }),
      rubber = mat("#12171b", { roughness: 0.95 }),
      white = mat("#f1f0e8", { metalness: 0.4, roughness: 0.3 }),
      burgundy = mat("#76273f", {
        metalness: 0.32,
        roughness: 0.38,
        emissive: "#64172f",
        emissiveIntensity: 0.14,
      }),
      amber = mat("#e8a62a", { metalness: 0.6, roughness: 0.25 }),
      led = new T.MeshBasicMaterial({ color: "#d9f3ff" }),
      tail = new T.MeshBasicMaterial({ color: "#df343e" });
    function part(w, h, d, m, xx, yy, zz) {
      const o = new T.Mesh(new T.BoxGeometry(w, h, d), m);
      o.position.set(xx, yy, zz);
      o.castShadow = o.receiveShadow = true;
      g.add(o);
      return o;
    }
    function poly(points, m) {
      const geo = new T.BufferGeometry();
      const vv = [];
      for (let i = 1; i < points.length - 1; i++)
        vv.push(...points[0], ...points[i], ...points[i + 1]);
      geo.setAttribute("position", new T.Float32BufferAttribute(vv, 3));
      geo.computeVertexNormals();
      const o = new T.Mesh(geo, m);
      o.material.side = T.DoubleSide;
      g.add(o);
      return o;
    }
    function prism(outline, width, m) {
      for (const side of [-1, 1])
        poly(
          outline.map(([z, y]) => [(side * width) / 2, y, z]),
          m,
        );
      for (let i = 0; i < outline.length; i++) {
        const a = outline[i],
          b = outline[(i + 1) % outline.length];
        poly(
          [
            [-width / 2, a[1], a[0]],
            [width / 2, a[1], a[0]],
            [width / 2, b[1], b[0]],
            [-width / 2, b[1], b[0]],
          ],
          m,
        );
      }
    }
    function wheels(axle, r, track, hubStyle) {
      for (const xx of [-track, track])
        for (const zz of [-axle, axle]) {
          const tire = new T.Mesh(
            new T.CylinderGeometry(r, r, 0.28, 20),
            rubber,
          );
          tire.rotation.z = Math.PI / 2;
          tire.position.set(xx, r + 0.03, zz);
          g.add(tire);
          const hub = new T.Mesh(
            new T.CylinderGeometry(
              r * 0.69,
              r * 0.69,
              0.3,
              hubStyle === 0 ? 7 : 20,
            ),
            hubStyle === 0 ? black : chrome,
          );
          hub.rotation.z = Math.PI / 2;
          hub.position.copy(tire.position);
          g.add(hub);
          for (let j = 0; j < 6; j++) {
            const a = (j / 6) * Math.PI * 2;
            const spoke = part(
              0.315,
              0.055,
              r * 1.1,
              black,
              xx,
              r + 0.03 + Math.sin(a) * r * 0.22,
              zz + Math.cos(a) * r * 0.22,
            );
            spoke.rotation.x = a;
          }
        }
    }
    if (kind === "cyber") {
      prism(
        [
          [-2.85, 0.67],
          [-2.85, 1.14],
          [-2.35, 1.34],
          [2.65, 1.34],
          [2.85, 1.08],
          [2.85, 0.67],
        ],
        2.17,
        burgundy,
      );
      prism(
        [
          [-2.8, 1.14],
          [-2.35, 1.34],
          [-0.7, 2.12],
          [2.68, 1.38],
          [2.82, 1.13],
        ],
        2.15,
        white,
      );
      poly(
        [
          [-1.015, 1.38, -2.27],
          [1.015, 1.38, -2.27],
          [1.015, 2.1, -0.7],
          [-1.015, 2.1, -0.7],
        ],
        glass,
      );
      for (const side of [-1, 1]) {
        poly(
          [
            [side * 1.087, 1.4, -2.13],
            [side * 1.087, 2.04, -0.7],
            [side * 1.087, 1.71, 0.85],
            [side * 1.087, 1.4, 0.85],
          ],
          glass,
        );
        part(0.04, 0.43, 0.055, white, side * 1.1, 1.63, -0.34);
        part(0.035, 0.04, 0.48, black, side * 1.1, 1.4, 0.24);
        for (const zz of [-1.7, 1.7]) {
          const arch = part(0.11, 0.63, 1.3, black, side * 1.09, 0.77, zz);
          arch.rotation.z = side * 0.05;
        }
        part(0.18, 0.14, 0.4, black, side * 1.23, 1.53, -1.1);
      }
      part(1.9, 0.07, 0.05, led, 0, 1.22, -2.84);
      part(1.9, 0.07, 0.05, tail, 0, 1.22, 2.85);
      part(1.8, 0.06, 1.65, black, 0, 1.39, 1.8);
      for (let j = 0; j < 14; j++)
        part(1.8, 0.025, 0.015, chrome, 0, 1.43, 1 + j * 0.12);
      wheels(1.72, 0.49, 1.04, 0);
    } else if (kind === "silverado") {
      part(2.12, 0.63, 5.95, black, 0, 1.02, 0);
      part(1.98, 0.4, 1.8, black, 0, 1.5, -2.05);
      part(1.97, 0.82, 2.8, black, 0, 1.73, -0.1);
      part(1.93, 0.12, 2.85, black, 0, 2.2, -0.1);
      const wind = part(1.76, 0.69, 0.055, glass, 0, 1.82, -1.52);
      wind.rotation.x = -0.19;
      part(1.8, 0.66, 0.05, glass, 0, 1.82, 1.34);
      for (const side of [-1, 1]) {
        for (const dz of [-0.83, 0.56])
          part(0.04, 0.65, 1.18, glass, side * 1.002, 1.82, dz);
        part(0.06, 0.78, 0.12, black, side * 1.02, 1.82, -0.13);
        part(0.1, 0.08, 0.25, chrome, side * 1.08, 1.47, -0.55);
        part(0.1, 0.08, 0.25, chrome, side * 1.08, 1.47, 0.83);
        part(0.23, 0.19, 0.37, black, side * 1.21, 1.75, -1.11);
        part(0.08, 0.09, 4.1, chrome, side * 1.06, 0.65, 0.25);
      }
      part(1.85, 0.12, 1.5, rubber, 0, 1.32, 2.13);
      for (const xx of [-1.02, 1.02])
        part(0.16, 0.51, 1.65, black, xx, 1.5, 2.1);
      part(2.11, 0.53, 0.15, black, 0, 1.49, 2.93);
      part(1.72, 0.53, 0.05, rubber, 0, 1.24, -3.01);
      for (let j = 0; j < 5; j++)
        part(1.7, 0.035, 0.06, chrome, 0, 1.03 + j * 0.1, -3.05);
      part(2.09, 0.16, 0.2, black, 0, 0.82, -2.98);
      for (const side of [-1, 1]) {
        part(0.38, 0.055, 0.07, led, side * 0.82, 1.56, -3.08);
        part(0.055, 0.39, 0.07, led, side * 1, 1.39, -3.08);
        part(0.25, 0.23, 0.07, led, side * 0.82, 1.2, -3.08);
        part(0.12, 0.44, 0.045, tail, side * 0.91, 1.42, 3.02);
      }
      // Small embossed bowtie in the grille, matching the requested Chevrolet identity.
      part(0.42, 0.1, 0.03, chrome, 0, 1.3, -3.1);
      part(0.21, 0.23, 0.035, chrome, 0, 1.3, -3.12);
      wheels(1.92, 0.51, 1.02, 1);
    } else {
      prism(
        [
          [-2.5, 0.38],
          [-2.45, 0.65],
          [-0.85, 0.94],
          [1.8, 0.91],
          [2.45, 0.67],
          [2.45, 0.38],
        ],
        2.03,
        amber,
      );
      prism(
        [
          [-1.05, 0.89],
          [-0.22, 1.34],
          [1.12, 1.31],
          [1.65, 0.89],
        ],
        1.65,
        glass,
      );
      part(1.3, 0.055, 1.15, amber, 0, 1.36, 0.45);
      for (const side of [-1, 1]) {
        poly(
          [
            [side * 1.03, 0.61, -0.8],
            [side * 0.88, 0.87, -0.25],
            [side * 0.92, 0.87, 1.3],
            [side * 1.04, 0.5, 1.48],
          ],
          black,
        );
        part(0.14, 0.04, 0.75, black, side * 1.025, 0.89, 0.5);
        const lamp = part(0.56, 0.045, 0.19, led, side * 0.65, 0.68, -2.37);
        lamp.rotation.y = side * 0.22;
        part(0.15, 0.14, 0.32, amber, side * 1.12, 1.02, -0.2);
        part(0.66, 0.07, 0.04, tail, side * 0.6, 0.76, 2.45);
      }
      for (let j = 0; j < 7; j++)
        part(1.15, 0.025, 0.07, black, 0, 0.98, 1.1 + j * 0.12);
      part(1.8, 0.05, 0.36, black, 0, 0.49, -2.51);
      part(1.8, 0.07, 0.27, black, 0, 0.43, 2.44);
      wheels(1.48, 0.35, 0.99, 1);
    }
    g.position.set(x, 0, z);
    g.rotation.y = yaw;
    world.add(g);
    const names = {
      cyber: "Cybertruck / burgundy lower body, white upper body",
      silverado: "2026 Chevrolet Silverado / black",
      lambo: "Lamborghini / amber",
    };
    const pickBox = new T.Mesh(
      new T.BoxGeometry(2.7, 2.4, 6.2),
      new T.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    pickBox.position.y = 1.1;
    g.add(pickBox);
    hit(pickBox, names[kind], () => sceneAPI?.cityView("cars"));
    twin(names[kind], () => {
      go(3);
      sceneAPI?.cityView("cars");
    });
    return g;
  }
  // A continuous paved service apron connects the parked lineup to the street.
  box(17, 0.12, 14, asphalt, -12.5, -0.04, -15);
  box(8, 0.1, 4, asphalt, -3.5, -0.035, -10);
  for (let i = 0; i < 4; i++)
    box(0.06, 0.015, 7, mat("#b5bcb2"), -19.6 + i * 4.6, 0.035, -15.5);
  customVehicle("cyber", -17.2, -15.5, 0.12);
  customVehicle("silverado", -12.6, -15.5, 0.12);
  customVehicle("lambo", -8, -15.5, 0.12);
  const lotLight = new T.PointLight("#ffe5ce", 45, 21, 2);
  lotLight.position.set(-12.5, 6, -14);
  scene.add(lotLight);
  car(-2.2, -59, "#b4aa90");
  car(15.6, -74, "#42594b", true);

  // Archive years hang over the street on continuous catenary cables, with short vertical hangers.
  const yearRows = [-22, -29, -38, -47, -68, -78, -88, -98];
  for (let row = 0; row < yearRows.length; row++) {
    const z = yearRows[row],
      y = 6.2;
    for (const x of [-5.5, 18.8]) {
      box(0.08, y, 0.08, dark, x, y / 2, z);
      box(0.18, 0.12, 0.18, concrete, x, y, z);
    }
    const curve = new T.QuadraticBezierCurve3(
      new T.Vector3(-5.5, y, z),
      new T.Vector3(6.65, y - 1.35, z),
      new T.Vector3(18.8, y, z),
    );
    world.add(
      new T.Line(
        new T.BufferGeometry().setFromPoints(curve.getPoints(32)),
        new T.LineBasicMaterial({ color: "#7d8989" }),
      ),
    );
    for (let j = 0; j < 6; j++) {
      const year = 1980 + row * 6 + j;
      if (year > today.getFullYear()) break;
      const u = (j + 0.5) / 6,
        pt = curve.getPoint(u),
        sign = label(
          String(year),
          1.55,
          0.72,
          pt.x,
          pt.y - 0.58,
          z,
          "#eee1bc",
          row % 2 ? "#335c51" : "#314b54",
          120,
        );
      for (const dx of [-0.51, 0.51])
        beam(
          new T.Vector3(pt.x + dx, pt.y, z),
          new T.Vector3(pt.x + dx, pt.y - 0.3, z),
          0.014,
          dark,
        );
      hit(sign, "Houston / " + year, () => timeline(year));
    }
  }
  const bridgeStart = world.children.length;
  // BE SOMEONE railway bridge: steel plate girder, ballast, rails and rivets over the road.
  const bridgeZ = -57;
  box(36, 0.65, 4.4, mat("#4b4537"), 6.65, 7.3, bridgeZ);
  box(36, 1.35, 0.3, mat("#47493a"), 6.65, 8.05, bridgeZ + 2.2);
  box(36, 0.7, 0.2, mat("#353d34"), 6.65, 7.9, bridgeZ - 2.2);
  for (const x of [-9, 22.3]) {
    box(1.35, 7, 3.8, mat("#858175"), x, 3.5, bridgeZ);
    box(3, 0.6, 4.8, concrete, x, 6.9, bridgeZ);
  }
  for (let i = 0; i < 30; i++) {
    box(0.09, 0.9, 0.1, mat("#797965"), -10.8 + i * 1.2, 8.05, bridgeZ + 2.39);
    box(0.26, 0.09, 4, wood, -10.8 + i * 1.2, 7.7, bridgeZ);
  }
  for (const z of [bridgeZ - 0.8, bridgeZ + 0.8])
    box(35, 0.14, 0.13, mat("#8a8d83", { metalness: 0.7 }), 6.65, 7.85, z);
  const be = label(
    "BE SOMEONE",
    17.5,
    1.25,
    6.65,
    8.05,
    bridgeZ + 2.48,
    "#77d2c1",
    "#454c3c",
    150,
  );
  be.material.emissive = new T.Color("#62a494");
  be.material.emissiveIntensity = 0.23;
  // Railway approaches connect both ends of the lettered span to a complete elevated corridor.
  const railSteel = mat("#808c90", { metalness: 0.7, roughness: 0.52 }),
    ballast = mat("#585e5a"),
    railConcrete = mat("#87928f");
  for (const [left, right] of [
    [-154, -11.35],
    [24.65, 160],
  ]) {
    const len = right - left,
      cx = (left + right) / 2;
    box(len, 0.62, 4.4, railConcrete, cx, 7.3, bridgeZ);
    box(len, 0.12, 3.9, ballast, cx, 7.67, bridgeZ);
    for (const z of [bridgeZ - 0.8, bridgeZ + 0.8])
      box(len, 0.14, 0.13, railSteel, cx, 7.85, z);
    for (const z of [bridgeZ - 2.12, bridgeZ + 2.12]) {
      box(len, 0.55, 0.14, railConcrete, cx, 7.92, z);
      box(len, 0.055, 0.055, railSteel, cx, 8.35, z);
    }
    for (let x = left + 0.65; x < right; x += 1.2)
      box(0.25, 0.08, 3.3, wood, x, 7.75, bridgeZ);
    for (let x = left + 4; x < right - 3; x += 14) {
      for (const dz of [-1.5, 1.5])
        box(0.85, 6.9, 0.9, railConcrete, x, 3.45, bridgeZ + dz);
      box(2.4, 0.5, 5.2, railConcrete, x, 6.85, bridgeZ);
      for (const dz of [-2.12, 2.12])
        box(0.055, 0.5, 0.055, railSteel, x, 8.15, bridgeZ + dz);
    }
  }
  // Long railway embankments descend continuously from the raised bridge to grade.
  const railEmbankment = mat("#48574b");
  for (const side of [-1, 1]) {
    const start = side < 0 ? -154 : 160;
    for (let i = 0; i < 20; i++) {
      const x = start + side * (i * 5 + 2.5),
        y = 11.7 - (i + 0.5) * 0.57;
      box(5, Math.max(0.3, y), 5.2, railEmbankment, x, y / 2 - 4.4, bridgeZ);
      const deck = box(5.06, 0.24, 4.2, ballast, x, y + 0.1 - 4.4, bridgeZ);
      deck.rotation.z = -side * Math.atan(0.114);
      for (const dz of [-0.8, 0.8]) {
        const rail = box(
          5.06,
          0.14,
          0.13,
          railSteel,
          x,
          y + 0.28 - 4.4,
          bridgeZ + dz,
        );
        rail.rotation.z = -side * Math.atan(0.114);
      }
    }
  }
  const bridgeGroup = new T.Group();
  world.children.slice(bridgeStart).forEach((o) => bridgeGroup.add(o));
  world.add(bridgeGroup);
  bridgeGroup.position.y = 4.4;
  for (const x of [-9, 22.3])
    box(1.35, 4.4, 3.8, railConcrete, x, 2.2, bridgeZ);
  for (const [left, right] of [
    [-154, -11.35],
    [24.65, 160],
  ])
    for (let x = left + 4; x < right - 3; x += 14)
      for (const dz of [-1.5, 1.5])
        box(0.85, 4.4, 0.9, railConcrete, x, 2.2, bridgeZ + dz);
  // Green freeway direction board, deliberately separated from the bridge lettering.
  for (const x of [-4, 17.3]) box(0.13, 6.3, 0.13, dark, x, 3.15, -78);
  box(21.3, 0.16, 0.15, dark, 6.65, 6.3, -78);
  label(
    "I-45 SOUTH   /   DOWNTOWN  ↓",
    9,
    1.2,
    6.65,
    5.8,
    -77.85,
    "#e1e8cf",
    "#23594b",
    85,
  );
  // Window maps supply hundreds of lit offices without hundreds of draw calls.
  // Blue-hour facades retain their masonry/glass colors. Only occupied windows emit light.
  function towerMaterial(base, lit = "#ffd08b", options = {}) {
    const c = document.createElement("canvas"),
      ec = document.createElement("canvas");
    c.width = ec.width = 512;
    c.height = ec.height = 2048;
    const q = c.getContext("2d"),
      eq = ec.getContext("2d");
    q.fillStyle = base;
    q.fillRect(0, 0, 512, 2048);
    eq.fillStyle = "#000";
    eq.fillRect(0, 0, 512, 2048);
    for (let row = 0; row < 92; row++) {
      const floorGlow = rand() > 0.48;
      for (let col = 0; col < 26; col++) {
        const x = col * 19.7 + 3,
          y = row * 22.25 + 4,
          occupied = rand() > (floorGlow ? 0.42 : 0.84);
        q.fillStyle = occupied ? "#bdaf8c" : options.unlit || "#294657";
        q.globalAlpha = occupied ? 0.48 : 0.32;
        q.fillRect(x, y, 13, 12);
        if (occupied) {
          eq.fillStyle = (row + col) % 11 === 0 ? "#e2d8bf" : lit;
          eq.globalAlpha = 0.5 + rand() * 0.4;
          eq.fillRect(x, y, 13, 12);
        }
      }
    }
    q.globalAlpha = 0.25;
    q.fillStyle = options.mullion || "#8295a1";
    for (let x = 0; x < 512; x += 19.7) q.fillRect(x, 0, 1, 2048);
    for (let y = 0; y < 2048; y += 22.25) q.fillRect(0, y, 512, 1);
    q.globalAlpha = eq.globalAlpha = 1;
    const t = new T.CanvasTexture(c),
      et = new T.CanvasTexture(ec);
    for (const map of [t, et]) {
      map.colorSpace = T.SRGBColorSpace;
      map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    }
    return mat("#ffffff", {
      map: t,
      emissiveMap: et,
      emissive: "#ffd39a",
      emissiveIntensity: 0.7,
      metalness: options.metalness ?? 0.32,
      roughness: 0.35,
    });
  }
  const blueGlass = towerMaterial("#163f48", "#ffdda0", {
      mullion: "#6f8da7",
      metalness: 0.4,
    }),
    grayGlass = towerMaterial("#465a6a", "#fff0c6", {
      mullion: "#b3bbc0",
      unlit: "#2a3d4c",
    }),
    bronzeGlass = towerMaterial("#3b3739", "#f7d394", {
      mullion: "#7f7068",
      unlit: "#302c31",
    }),
    heritageGlass = towerMaterial("#354d60", "#ffe6b1", { mullion: "#8394a1" }),
    roseGlass = towerMaterial("#796a65", "#ffe4b2", {
      mullion: "#b19b8c",
      unlit: "#453d43",
      metalness: 0.18,
    }),
    transcoGlass = towerMaterial("#3a5265", "#ffebc4", {
      mullion: "#bdc7cf",
      unlit: "#273c4b",
    }),
    granite = mat("#b2b5b5", { roughness: 0.9 }),
    transcoSilver = mat("#adb8c0", { metalness: 0.32, roughness: 0.5 });
  function tower(w, h, d, m, x, z) {
    return box(w, h, d, m, x, h / 2, z);
  }
  // Downtown landmarks: Chase Tower's chamfered footprint, the curved glass tower,
  // Heritage Plaza's stepped crown, TC Energy Center's gables and Pennzoil's sloped twins.
  const { skylinePosition } = await import("../skyline-layout.mjs");
  const primarySkyline = [];
  let skylineStart = world.children.length;
  function captureSkyline(name, x, z) {
    const ref = skylinePosition(name),
      group = new T.Group();
    group.name = name;
    world.children.slice(skylineStart).forEach((o) => group.add(o));
    group.position.set(ref.x - x, 0, ref.z - z);
    world.add(group);
    primarySkyline.push({ ...ref, skyline: true });
    skylineStart = world.children.length;
  }
  const chaseSkin = towerMaterial("#71838a", "#f3d9aa", {
    mullion: "#aeb8bb",
    unlit: "#304653",
  });
  const chaseShape = new T.Shape();
  chaseShape.moveTo(-4, -3);
  chaseShape.lineTo(2, -3);
  chaseShape.lineTo(4, -1);
  chaseShape.lineTo(4, 3);
  chaseShape.lineTo(-4, 3);
  chaseShape.closePath();
  const chase = new T.Mesh(
    new T.ExtrudeGeometry(chaseShape, { depth: 45, bevelEnabled: false }),
    [granite, chaseSkin],
  );
  const chasePos = chase.geometry.attributes.position,
    chaseUV = chase.geometry.attributes.uv,
    chaseNormal = chase.geometry.attributes.normal;
  for (let i = 0; i < chasePos.count; i++)
    chaseUV.setXY(
      i,
      Math.abs(chaseNormal.getX(i)) > 0.5
        ? (chasePos.getY(i) + 3) / 6
        : (chasePos.getX(i) + 4) / 8,
      chasePos.getZ(i) / 45,
    );
  chaseUV.needsUpdate = true;
  chase.rotation.x = -Math.PI / 2;
  chase.position.set(5, 0, -123);
  world.add(chase);
  for (let i = 0; i < 9; i++)
    box(0.075, 45, 0.04, granite, 1.2 + i * 0.87, 22.5, -119.96);
  captureSkyline("JPMorgan Chase Tower", 5, -123);
  const wells = new T.Mesh(new T.CylinderGeometry(4.7, 4.7, 43.8, 48), [
    blueGlass,
    mat("#698a8e", { metalness: 0.6, roughness: 0.35 }),
    dark,
  ]);
  wells.scale.z = 0.7;
  wells.position.set(-7, 21.9, -127);
  world.add(wells); // Curved tower bands follow the actual facade instead of floating across its curved face.
  const glassBand = mat("#8195a5", { metalness: 0.45, roughness: 0.48 });
  for (let i = 0; i < 25; i++) {
    const band = new T.Mesh(
      new T.CylinderGeometry(4.715, 4.715, 0.045, 32, 1, true),
      glassBand,
    );
    band.scale.z = 0.7;
    band.position.set(-7, 1 + i * 1.7, -127);
    world.add(band);
  }
  captureSkyline("Wells Fargo Plaza", -7, -127);
  tower(8.6, 29, 7, heritageGlass, -20, -113);
  // Heritage Plaza: each light strip sits on its own recessed tier's front fascia.
  // Keep the strip below the top edge and move it BACK with the receding crown.
  const crownStone = mat("#99928b", { roughness: 0.94 }),
    crownTrim = glowMat("#eed7a6", 0.44);
  for (let i = 0; i < 6; i++) {
    const width = 8.8 - i * 1.14,
      depth = 7 - i * 0.8,
      centerY = 29.3 + i * 0.75;
    box(width, 0.75, depth, crownStone, -20, centerY, -113);
    box(
      width - 0.16,
      0.045,
      0.028,
      crownTrim,
      -20,
      centerY + 0.28,
      -113 + depth / 2 + 0.017,
    );
  }
  box(2.95, 0.12, 2.9, crownStone, -20, 33.48, -113);
  captureSkyline("Heritage Plaza", -20, -113);
  tower(8, 28, 6, roseGlass, 21, -121);
  const gable = new T.Shape();
  gable.moveTo(-4, 28);
  gable.lineTo(4, 28);
  gable.lineTo(4, 30);
  gable.lineTo(3, 30);
  gable.lineTo(3, 31.5);
  gable.lineTo(2, 31.5);
  gable.lineTo(2, 33);
  gable.lineTo(0, 36);
  gable.lineTo(-2, 33);
  gable.lineTo(-2, 31.5);
  gable.lineTo(-3, 31.5);
  gable.lineTo(-3, 30);
  gable.lineTo(-4, 30);
  gable.closePath();
  const gabledCrown = new T.Mesh(
    new T.ExtrudeGeometry(gable, { depth: 6, bevelEnabled: false }),
    mat("#a38c81", { roughness: 0.88 }),
  );
  gabledCrown.position.set(21, 0, -124);
  world.add(gabledCrown);
  captureSkyline("TC Energy Center", 21, -121);
  for (let i = 0; i < 2; i++) {
    const shape = new T.Shape();
    shape.moveTo(-3, 0);
    shape.lineTo(3, 0);
    shape.lineTo(3, 18);
    shape.lineTo(-3, 24);
    shape.closePath();
    const tw = new T.Mesh(
      new T.ExtrudeGeometry(shape, { depth: 4, bevelEnabled: false }),
      bronzeGlass,
    );
    const tp = tw.geometry.attributes.position,
      tu = tw.geometry.attributes.uv;
    for (let j = 0; j < tp.count; j++)
      tu.setXY(j, (tp.getX(j) + 3) / 6, tp.getY(j) / 24);
    tu.needsUpdate = true;
    tw.position.set(32 + i * 6.6, 0, -122 - i * 4);
    world.add(tw);
  }

  captureSkyline("Pennzoil Place", 35.3, -124);
  // Named completion pass against the owner's west-facing skyline reference.
  // Coordinates preserve the compressed downtown parcels, not surveyed real-world distances.
  const skylineTowerFootprints = [...primarySkyline],
    skylineInventory = [...primarySkyline];
  function namedSkyline(name, x, z, w, d, build) {
    const first = world.children.length;
    build();
    const group = new T.Group();
    group.name = name;
    world.children.slice(first).forEach((o) => group.add(o));
    const ref = skylinePosition(name);
    group.position.set(ref.x - x, 0, ref.z - z);
    world.add(group);
    skylineTowerFootprints.push({ ...ref, skyline: true });
    skylineInventory.push({ ...ref });
    return group;
  }
  const paleOffice = towerMaterial("#9b9d93", "#ffe1a4", {
      mullion: "#ddd7be",
      unlit: "#4b5860",
      metalness: 0.15,
    }),
    champagneOffice = towerMaterial("#766e56", "#ffe2a5", {
      mullion: "#b8a98c",
      unlit: "#3f4547",
      metalness: 0.18,
    }),
    inkOffice = towerMaterial("#25323b", "#e4c784", {
      mullion: "#79888f",
      unlit: "#1c303e",
    }),
    freshGlass = towerMaterial("#31586b", "#dfd9b9", {
      mullion: "#a4bdc6",
      unlit: "#27495e",
      metalness: 0.5,
    });
  namedSkyline("One Shell Plaza", -6, -112, 8, 7, () => {
    tower(8, 32, 7, paleOffice, -6, -112);
    for (let i = 0; i < 16; i++)
      box(0.09, 32, 0.04, granite, -9.8 + i * 0.51, 16, -108.48);
    box(7.6, 0.55, 6.6, granite, -6, 32.27, -112);
    box(3.1, 0.8, 2.8, dark, -6, 32.9, -112);
  });
  namedSkyline("CenterPoint Energy Plaza", -41.5, -126, 6, 7, () => {
    tower(6, 25, 7, inkOffice, -41.5, -126);
    box(5.4, 1.8, 6.4, mat("#88989d"), -41.5, 25.9, -126);
    for (const dx of [-2.1, 2.1]) {
      box(0.28, 4, 0.28, granite, -41.5 + dx, 28, -126);
      box(0.75, 0.15, 0.75, glowMat("#ffe4b4", 0.3), -41.5 + dx, 30.1, -126);
    }
  });
  namedSkyline("1600 Smith Street", -25, -138.9, 8, 3.6, () => {
    tower(8, 26, 3.6, bronzeGlass, -25, -138.9);
    for (let j = 0; j < 3; j++)
      box(
        7.6 - j * 1.3,
        0.7,
        3.3 - j * 0.45,
        mat("#8c776a"),
        -25,
        26.35 + j * 0.7,
        -138.9,
      );
    box(3.3, 0.15, 1.8, glowMat("#e8d8bb", 0.25), -25, 28.15, -138.9);
  });
  namedSkyline("Enterprise Plaza / 1100 Louisiana", 21, -111, 8, 6, () => {
    tower(8, 31, 6, roseGlass, 21, -111);
    for (let level = 0; level < 4; level++)
      box(
        7.6 - level * 0.9,
        0.8,
        5.7 - level * 0.55,
        roseGlass,
        21,
        31.4 + level * 0.8,
        -111,
      );
    for (const side of [-1, 1])
      box(0.14, 31, 0.14, mat("#ac9690"), 21 + side * 3.75, 15.5, -107.99);
  });
  namedSkyline("609 Main at Texas", 55, -122, 7, 8, () => {
    tower(7, 30, 8, freshGlass, 55, -122);
    const shape = new T.Shape();
    shape.moveTo(-3.5, 30);
    shape.lineTo(3.5, 30);
    shape.lineTo(3.5, 35);
    shape.lineTo(-3.5, 32);
    shape.closePath();
    const crown = new T.Mesh(
      new T.ExtrudeGeometry(shape, { depth: 8, bevelEnabled: false }),
      freshGlass,
    );
    crown.position.set(55, 0, -126);
    world.add(crown);
    for (const side of [-1, 1])
      box(0.1, 30, 0.05, transcoSilver, 55 + side * 3.4, 15, -117.98);
  });
  namedSkyline("Texas Tower", 7, -146, 6, 8, () => {
    tower(6, 31.5, 8, freshGlass, 7, -146);
    box(5.4, 1.2, 7.4, grayGlass, 7, 32.1, -146);
    box(5.6, 0.15, 7.6, transcoSilver, 7, 32.78, -146);
    for (let j = 0; j < 10; j++)
      box(0.045, 31, 0.035, transcoSilver, 4.2 + j * 0.62, 15.5, -141.98);
  });
  namedSkyline("1500 Louisiana", 39, -111, 9, 8, () => {
    const curved = new T.Mesh(new T.CylinderGeometry(4.5, 4.5, 26.5, 48), [
      grayGlass,
      granite,
      dark,
    ]);
    curved.scale.z = 8 / 9;
    curved.position.set(39, 13.25, -111);
    world.add(curved);
    for (let j = 0; j < 22; j++) {
      const band = new T.Mesh(
        new T.CylinderGeometry(4.51, 4.51, 0.1, 48, 1, true),
        transcoSilver,
      );
      band.scale.z = 8 / 9;
      band.position.set(39, 1 + j * 1.18, -111);
      world.add(band);
    }
    box(5.5, 0.6, 5.8, granite, 39, 26.8, -111);
  });
  namedSkyline("1400 Smith Street", 55, -145, 7, 9, () => {
    tower(7, 23, 9, inkOffice, 55, -145);
    for (let j = 0; j < 4; j++)
      box(
        6.8 - j * 0.8,
        0.7,
        8.8 - j * 0.8,
        inkOffice,
        55,
        23.35 + j * 0.7,
        -145,
      );
    for (const x of [52, 58])
      box(0.09, 24, 0.06, mat("#78878a"), x, 12, -140.47);
  });
  canvas.dataset.skylineInventory = JSON.stringify(skylineInventory);
  twin("Downtown skyline building guide", () =>
    modal(
      '<span class="eyebrow">TRUTHSTON / HOUSTON SKYLINE</span><h2>The city, accounted for.</h2><p>Named landmark interpretations in the compressed downtown model.</p><ol>' +
        skylineInventory.map((v) => "<li>" + esc(v.name) + "</li>").join("") +
        "</ol>",
    ),
  );

  // Downtown buildings now use geographic reference placements rather than anonymous rows.
  // The curved glass crown has a restrained perimeter light, rather than floating rectangular bands.
  const wellsCrown = new T.Mesh(
    new T.TorusGeometry(4.68, 0.045, 6, 64),
    glowMat("#e8e8ce", 0.45),
  );
  wellsCrown.rotation.x = Math.PI / 2;
  wellsCrown.scale.y = 0.7;
  wellsCrown.position.set(-7, 43.84, -127);
  world.add(wellsCrown);
  const wellsRef = skylinePosition("Wells Fargo Plaza");
  wellsCrown.position.x += wellsRef.x + 7;
  wellsCrown.position.z += wellsRef.z + 127;
  // Transco / Williams Tower stands apart in the Uptown vignette, with setbacks and a beacon crown.
  const transcoStart = world.children.length;
  const transcoX = -45,
    transcoZ = -91;
  // The reference tower has dense silver mullions, blue glass and a few warm offices.
  // Its narrow vertical recesses continue through the setbacks; the crown is a low hipped roof.
  const tcCanvas = document.createElement("canvas"),
    tcEmission = document.createElement("canvas");
  tcCanvas.width = tcEmission.width = 1024;
  tcCanvas.height = tcEmission.height = 2048;
  const tc = tcCanvas.getContext("2d"),
    te = tcEmission.getContext("2d"),
    tcGradient = tc.createLinearGradient(0, 0, 1024, 1900);
  tcGradient.addColorStop(0, "#456b7c");
  tcGradient.addColorStop(0.35, "#345666");
  tcGradient.addColorStop(0.65, "#203f4d");
  tcGradient.addColorStop(1, "#132f3b");
  tc.fillStyle = tcGradient;
  tc.fillRect(0, 0, 1024, 2048);
  te.fillStyle = "#000";
  te.fillRect(0, 0, 1024, 2048);
  for (let row = 0; row < 64; row++)
    for (let col = 0; col < 28; col++) {
      const x = (col * 1024) / 28,
        y = row * 32;
      tc.fillStyle = (col + row) % 7 === 0 ? "#7897a0" : "#426775";
      tc.globalAlpha = 0.25;
      tc.fillRect(x + 3, y + 2, 31, 27);
      if (rand() > 0.965) {
        te.fillStyle = "#f7d8a1";
        te.fillRect(x + 4, y + 4, 28, 23);
      }
    }
  tc.globalAlpha = 1;
  tc.strokeStyle = "#a6b8bb";
  tc.lineWidth = 2.5;
  for (let col = 0; col <= 28; col++) {
    const x = (col * 1024) / 28;
    tc.beginPath();
    tc.moveTo(x, 0);
    tc.lineTo(x, 2048);
    tc.stroke();
  }
  tc.strokeStyle = "#8fa8b2";
  tc.lineWidth = 1.5;
  for (let row = 0; row <= 64; row++) {
    tc.beginPath();
    tc.moveTo(0, row * 32);
    tc.lineTo(1024, row * 32);
    tc.stroke();
  }
  te.globalCompositeOperation = "screen";
  te.globalAlpha = 0.65;
  te.drawImage(tcCanvas, 0, 0);
  te.globalAlpha = 1;
  te.globalCompositeOperation = "source-over";
  const tcMap = new T.CanvasTexture(tcCanvas),
    tcEmit = new T.CanvasTexture(tcEmission);
  for (const t of [tcMap, tcEmit]) {
    t.colorSpace = T.SRGBColorSpace;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  }
  const tcSkin = mat("#dae5e9", {
      map: tcMap,
      emissiveMap: tcEmit,
      emissive: "#9cb9cb",
      emissiveIntensity: 0.24,
      metalness: 0.32,
      roughness: 0.38,
    }),
    tcRecess = mat("#143039", { metalness: 0.45, roughness: 0.35 }),
    tcTrim = mat("#97adb5", { metalness: 0.5, roughness: 0.35 });
  box(10, 0.55, 9, tcTrim, transcoX, 0.3, transcoZ);
  box(7.8, 39.5, 6.9, tcSkin, transcoX, 20.3, transcoZ);
  box(6.85, 43.1, 6.1, tcSkin, transcoX, 22.1, transcoZ);
  box(5.75, 47.1, 5.2, tcSkin, transcoX, 24.1, transcoZ);
  box(4.85, 48.8, 4.5, tcSkin, transcoX, 24.95, transcoZ);
  // Recessed dark slots establish the tower's recognisable narrow fluted silhouette.
  for (const side of [-1, 1])
    for (const [bottom, top, width, depth] of [
      [0.8, 40.05, 7.8, 6.9],
      [40.05, 43.65, 6.85, 6.1],
      [43.65, 47.65, 5.75, 5.2],
      [47.65, 49.35, 4.85, 4.5],
    ]) {
      for (const [dx, limit] of [
        [-2.95, 37.8],
        [-2.3, 42],
        [-1.65, 47.6],
        [-0.98, 48.4],
        [0, 48.4],
        [0.98, 48.4],
        [1.65, 47.6],
        [2.3, 42],
        [2.95, 37.8],
      ]) {
        const end = Math.min(top, limit),
          h = end - bottom;
        if (h <= 0 || Math.abs(dx) > width / 2 - 0.2) continue;
        box(
          0.2,
          h,
          0.045,
          tcRecess,
          transcoX + dx,
          bottom + h / 2,
          transcoZ + side * (depth / 2 + 0.035),
        );
        box(
          0.04,
          h,
          0.055,
          tcTrim,
          transcoX + dx + 0.14,
          bottom + h / 2,
          transcoZ + side * (depth / 2 + 0.045),
        );
      }
      for (const [dz, limit] of [
        [-2.45, 37.8],
        [-1.7, 42],
        [-0.9, 47.6],
        [0, 48.4],
        [0.9, 47.6],
        [1.7, 42],
        [2.45, 37.8],
      ]) {
        const end = Math.min(top, limit),
          h = end - bottom;
        if (h <= 0 || Math.abs(dz) > depth / 2 - 0.2) continue;
        box(
          0.045,
          h,
          0.2,
          tcRecess,
          transcoX + side * (width / 2 + 0.035),
          bottom + h / 2,
          transcoZ + dz,
        );
        box(
          0.055,
          h,
          0.04,
          tcTrim,
          transcoX + side * (width / 2 + 0.045),
          bottom + h / 2,
          transcoZ + dz + 0.14,
        );
      }
    }
  // Dark beacon lantern and a shallow four-sided crown, rather than stacked cone tiers.
  box(4.25, 1.05, 3.95, tcTrim, transcoX, 49.85, transcoZ);
  for (const side of [-1, 1]) {
    for (let j = 0; j < 4; j++) {
      box(
        0.68,
        0.6,
        0.045,
        tcRecess,
        transcoX - 1.43 + j * 0.95,
        49.9,
        transcoZ + side * 2.0,
      );
      box(
        0.045,
        0.6,
        0.62,
        tcRecess,
        transcoX + side * 2.15,
        49.9,
        transcoZ - 1.28 + j * 0.85,
      );
    }
  }
  const tcRoof = new T.Mesh(
    new T.ConeGeometry(3.13, 0.95, 4),
    mat("#7b8e96", { metalness: 0.36, roughness: 0.5 }),
  );
  tcRoof.rotation.y = Math.PI / 4;
  tcRoof.scale.z = 0.94;
  tcRoof.position.set(transcoX, 50.85, transcoZ);
  world.add(tcRoof);
  box(0.045, 0.3, 0.045, tcTrim, transcoX, 51.45, transcoZ);
  const beacon = new T.Mesh(
    new T.SphereGeometry(0.08, 8, 6),
    new T.MeshBasicMaterial({ color: "#e8e2b8" }),
  );
  beacon.position.set(transcoX, 51.62, transcoZ);
  world.add(beacon);
  // Stone entry pavilion and podium give the tower a grounded base at street level.
  box(10.8, 0.16, 9.5, mat("#a5aca6"), transcoX, 0.02, transcoZ);
  for (const side of [-1, 1]) {
    box(4, 0.16, 1.8, tcTrim, transcoX, 0.8, transcoZ + side * 4.2);
    for (let j = 0; j < 6; j++)
      box(
        0.55,
        0.65,
        0.05,
        tcRecess,
        transcoX - 1.65 + j * 0.66,
        0.65,
        transcoZ + side * 3.53,
      );
    for (const dx of [-2, 2])
      box(0.11, 0.8, 0.11, tcTrim, transcoX + dx, 0.4, transcoZ + side * 4.4);
  }

  const transcoDistrict = new T.Group();
  world.children.slice(transcoStart).forEach((o) => transcoDistrict.add(o));
  world.add(transcoDistrict);
  transcoDistrict.position.set(-250, 0, -276);
  transcoDistrict.scale.z = -1;
  // Architectural materials are drawn locally; reference photographs guide geometry, not pasted billboard facades.
  function masonryMaterial(color) {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const q = c.getContext("2d");
    q.fillStyle = "#6c665e";
    q.fillRect(0, 0, 256, 256);
    const base = new T.Color(color);
    for (let row = 0; row < 24; row++)
      for (let col = -1; col < 11; col++) {
        const tint = base.clone().multiplyScalar(0.84 + rand() * 0.28);
        q.fillStyle = "#" + tint.getHexString();
        q.fillRect(col * 26 + (row % 2) * 13, row * 11, 25, 10);
      }
    const t = new T.CanvasTexture(c);
    t.colorSpace = T.SRGBColorSpace;
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.repeat.set(3, 2);
    return mat("#ffffff", { map: t, roughness: 0.94 });
  }
  const architecturalBrick = masonryMaterial("#8f5140"),
    limestone = mat("#c6bba2"),
    copperGreen = mat("#497a71", { metalness: 0.42, roughness: 0.62 }),
    venueGlass = mat("#254c53", {
      metalness: 0.7,
      roughness: 0.2,
      emissive: "#a0b4a1",
      emissiveIntensity: 0.08,
    });
  function venueArch(width, height, x, y, z, m, ry = 0) {
    const sh = new T.Shape();
    sh.moveTo(-width / 2, 0);
    sh.lineTo(width / 2, 0);
    sh.lineTo(width / 2, height - width / 2);
    sh.absarc(0, height - width / 2, width / 2, 0, Math.PI, false);
    sh.lineTo(-width / 2, 0);
    const mesh = new T.Mesh(new T.ShapeGeometry(sh, 20), m);
    mesh.position.set(x, y, z);
    mesh.rotation.y = ry;
    world.add(mesh);
    return mesh;
  }
  function venueSphere(r, yScale, m, x, y, z) {
    const o = new T.Mesh(
      new T.SphereGeometry(r, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2),
      m,
    );
    o.scale.y = yScale;
    o.position.set(x, y, z);
    world.add(o);
    return o;
  }

  const stadiumDistrictStart = world.children.length;
  // Reliant Park district. North is +Z after district placement; campus arrangement references Kirby/Fannin access and the adjacent Astrodome.
  // Building dimensions and street distances are compressed for this animated prototype.
  const stadiumX = -95,
    stadiumZ = 66;
  const stadiumConcrete = mat("#b1b6b9"),
    stadiumCore = mat("#d1cabc"),
    stadiumGlass = mat("#2c5559", {
      metalness: 0.42,
      roughness: 0.3,
      emissive: "#9fc6d2",
      emissiveIntensity: 0.12,
    });
  const roofWhite = mat("#e2e7e9", {
      roughness: 0.74,
      metalness: 0.08,
      side: T.DoubleSide,
    }),
    roofSteel = mat("#c7d0d5", { metalness: 0.55, roughness: 0.45 }),
    seatBlue = mat("#27495f"),
    seatRed = mat("#753c40");
  box(93, 0.16, 105, mat("#68716b"), -89, -0.16, 68);
  // Kirby to the west, Fannin to the east, McNee to the north, and the South Loop beyond the south lots.
  const campusRoadFootprints = [];
  function campusRoad(x, z, w, d, name) {
    campusRoadFootprints.push({
      x: x - 15,
      z: -334 - z,
      w,
      d,
      name,
      legacy: true,
    });
    box(w, 0.09, d, asphalt, x, -0.055, z);
    const along = d > w;
    for (let i = 0; i < (along ? d : w) / 5; i++) {
      box(
        along ? 0.075 : 2,
        0.012,
        along ? 2 : 0.075,
        paper,
        along ? x : x - w / 2 + 2 + i * 5,
        0.005,
        along ? z - d / 2 + 2 + i * 5 : z,
      );
    }
    if (name) {
      const sx = x + (along ? w / 2 + 1.3 : 0),
        sz = z + (along ? 0 : d / 2 + 1.3);
      label(name, 6, 0.65, sx, 3.3, sz, "#e3e8d8", "#285b49", 85);
      box(0.07, 3.3, 0.07, dark, sx, 1.65, sz);
    }
  }
  campusRoad(-128, 67, 8, 118, "KIRBY DR");
  campusRoad(-44, 67, 8, 118, "FANNIN ST");
  campusRoad(-86, 11, 92, 7, "MCNEE RD");
  campusRoad(-86, 123, 110, 12, "SOUTH LOOP / I-610");
  campusRoad(-155, 110, 54, 5, "WESTRIDGE ST");
  campusRoad(-90, 34.5, 77, 4, "N STADIUM DR");
  campusRoad(-91, 98, 77, 5, "RELIANT PARKWAY");
  // Connections to the rest of the model: frontage streets and continuous access pavement.

  for (const x of [-122.8, -49.2]) box(2, 0.1, 110, concrete, x, 0.02, 67);
  function parkingLot(x, z, w, d, color) {
    box(w, 0.08, d, asphalt, x, -0.045, z);
    for (let row = 0; row < Math.floor(d / 7); row++)
      for (let col = 0; col < Math.floor(w / 2.2); col++) {
        const xx = x - w / 2 + 1 + col * 2.2,
          zz = z - d / 2 + 2 + row * 7;
        box(0.035, 0.012, 4.3, mat("#bbb9a9"), xx, 0.01, zz);
        if ((col + row * 3) % 7 === 0) {
          const parked = box(
            1.35,
            0.45,
            3.2,
            mat(["#35444a", "#9b9d95", "#4f3e3f", "#717963"][(row + col) % 4], {
              metalness: 0.3,
            }),
            xx + 1,
            0.35,
            zz,
          );
          box(1.05, 0.28, 1.5, mat("#21343d"), xx + 1, 0.7, zz);
        }
      }
    label(
      color + " LOT",
      5,
      0.6,
      x,
      2.8,
      z + d / 2,
      "#eee8d5",
      color === "BLUE" ? "#315973" : "#6b383a",
      90,
    );
    box(0.08, 2.8, 0.08, dark, x, 1.4, z + d / 2);
  }
  parkingLot(-113, 67, 16, 61, "BLUE");
  parkingLot(-91, 89, 25, 14, "BLUE");
  parkingLot(-94, 40, 30, 7, "RED");
  parkingLot(-58, 85, 19, 18, "ORANGE");
  // Nearby streets, crosswalks, an east-side rail stop, and low neighborhood blocks ground the campus.
  for (const x of [-128, -44])
    for (const z of [11, 98, 123]) {
      for (const dz of [-6, 6])
        for (let j = 0; j < 6; j++)
          box(0.65, 0.015, 1.4, mat("#c7cbc1"), x - 3 + j * 1.2, 0.025, z + dz);
      box(0.12, 5.8, 0.12, roofSteel, x + 5, 2.9, z - 5);
      box(5, 0.12, 0.12, roofSteel, x + 2.6, 5.8, z - 5);
      box(1, 0.35, 0.28, mat("#9f863c"), x + 1.1, 5.5, z - 5);
      for (let j = 0; j < 3; j++)
        box(
          0.16,
          0.16,
          0.02,
          new T.MeshBasicMaterial({ color: j === 2 ? "#70ba8e" : "#3a3830" }),
          x + 0.8 + j * 0.28,
          5.5,
          z - 4.85,
        );
    }
  // Fannin rail alignment and the Stadium Park / Astrodome stop (simplified, no agency marks).
  box(4, 0.08, 110, mat("#6c7878"), -37, 0.01, 66);
  for (const x of [-38.4, -37.6, -36.4, -35.6])
    box(0.055, 0.04, 110, roofSteel, x, 0.08, 66);
  box(1.6, 0.4, 14, concrete, -37, 0.2, 69);
  box(2.6, 0.12, 15, roofSteel, -37, 2.8, 69);
  for (const z of [63, 69, 75]) box(0.09, 2.6, 0.09, roofSteel, -37, 1.5, z);
  label(
    "STADIUM PARK / ASTRODOME",
    10,
    0.7,
    -36.8,
    3,
    77,
    "#eef2ed",
    "#365967",
    82,
  );
  // Extend the local street network around broad parking grounds; surrounding buildings stay subordinate.
  campusRoad(-149, 68, 7, 140, "S MAIN ST");
  campusRoad(-126, 140, 140, 7, "");
  campusRoad(-18, 67, 7, 140, "");
  for (const [x, z, w, d, h] of [
    [-139, 24, 8, 10, 4],
    [-139, 51, 8, 13, 5],
    [-139, 85, 8, 11, 4],
    [-139, 98, 8, 10, 4],
    [-28, 25, 8, 17, 6],
    [-28, 52, 8, 12, 4],
    [-28, 88, 8, 17, 5],
    [-78, 148, 23, 6, 4],
  ]) {
    box(w, h, d, mat("#8e938e"), x, h / 2, z);
    box(w + 0.25, 0.2, d + 0.25, mat("#aeb8b6"), x, h + 0.1, z);
    for (let j = 0; j < Math.floor(w / 2); j++)
      box(
        1.1,
        h * 0.45,
        0.03,
        stadiumGlass,
        x - w / 2 + 1 + j * 2,
        h * 0.6,
        z + d / 2 + 0.02,
      );
    box(2, 0.7, 2, mat("#738586"), x, h + 0.55, z);
  }
  for (const x of [-134, -30])
    for (let z = 16; z < 122; z += 9) {
      box(0.13, 2, 0.13, wood, x, 1, z);
      const tree = new T.Mesh(
        new T.IcosahedronGeometry(1.35, 1),
        mat("#3c5e4c"),
      );
      tree.scale.set(1.4, 0.8, 1.1);
      tree.position.set(x, 2.7, z);
      world.add(tree);
    }
  // NRG Center north of the stadium, arena toward the southeast, historic Astrodome immediately east.
  box(39, 3.2, 15, mat("#9caaa9"), -77, 1.6, 23);
  box(40, 0.25, 15.6, roofWhite, -77, 3.3, 23);
  for (let i = 0; i < 14; i++)
    box(0.12, 0.1, 15.5, roofSteel, -96 + i * 2.9, 3.48, 23);
  label("RELIANT CENTER", 17, 0.75, -77, 2.6, 30.58, "#dee4e2", "#344c59", 95);
  box(23, 3.5, 13, mat("#8c999a"), -64, 1.75, 108.5);
  box(24, 0.35, 14, roofWhite, -64, 3.65, 108.5);
  const domeX = -66,
    domeZ = 66;
  const domeSkin = mat("#8b9d9b", { metalness: 0.22, roughness: 0.78 }),
    domeStone = mat("#b5bcb4"),
    domeDark = mat("#263f42", { metalness: 0.45, roughness: 0.35 });
  const domeBase = new T.Mesh(
    new T.CylinderGeometry(10.2, 10.45, 4.8, 96),
    domeSkin,
  );
  domeBase.position.set(domeX, 2.4, domeZ);
  world.add(domeBase);
  for (const y of [0.35, 1, 4.35, 4.8]) {
    const ring = new T.Mesh(new T.TorusGeometry(10.28, 0.08, 6, 96), domeStone);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(domeX, y, domeZ);
    world.add(ring);
  }
  // Continuous high glazing band, concrete ribs, and four cylindrical circulation towers.
  const domeWindows = new T.Mesh(
    new T.CylinderGeometry(10.25, 10.25, 1.05, 96, 1, true),
    domeDark,
  );
  domeWindows.position.set(domeX, 4.1, domeZ);
  world.add(domeWindows);
  for (let j = 0; j < 96; j++) {
    const a = (j / 96) * Math.PI * 2,
      x = domeX + Math.cos(a) * 10.3,
      z = domeZ + Math.sin(a) * 10.3;
    const rib = box(0.105, 4.45, 0.13, domeStone, x, 2.5, z);
    rib.rotation.y = -a;
  }
  for (let j = 0; j < 4; j++) {
    const a = Math.PI / 4 + (j * Math.PI) / 2,
      x = domeX + Math.cos(a) * 10.75,
      z = domeZ + Math.sin(a) * 10.75,
      tower = new T.Mesh(new T.CylinderGeometry(1.2, 1.2, 5.4, 32), domeStone);
    tower.position.set(x, 2.7, z);
    world.add(tower);
    const roofRing = new T.Mesh(
      new T.TorusGeometry(1.15, 0.1, 6, 32),
      domeStone,
    );
    roofRing.rotation.x = Math.PI / 2;
    roofRing.position.set(x, 5.43, z);
    world.add(roofRing);
    const darkTop = new T.Mesh(new T.CircleGeometry(1.05, 32), domeDark);
    darkTop.rotation.x = -Math.PI / 2;
    darkTop.position.set(x, 5.41, z);
    world.add(darkTop);
    for (let k = 0; k < 5; k++) {
      const window = box(0.6, 0.28, 0.03, domeDark, x, 1 + k * 0.75, z + 1.203);
    }
  }
  const domeRoofCanvas = document.createElement("canvas");
  domeRoofCanvas.width = 1024;
  domeRoofCanvas.height = 512;
  const dr = domeRoofCanvas.getContext("2d");
  dr.fillStyle = "#bbc8c3";
  dr.fillRect(0, 0, 1024, 512);
  for (let row = 0; row < 24; row++)
    for (let col = 0; col < 96; col++) {
      dr.fillStyle =
        row > 18 ? "#a7b5b2" : (row + col) % 3 ? "#b0cac6" : "#91b4b2";
      dr.fillRect(
        (col * 1024) / 96 + 1,
        (row * 512) / 24 + 1,
        1024 / 96 - 2,
        512 / 24 - 2,
      );
    }
  dr.fillStyle = "#b7bfba";
  dr.fillRect(0, 410, 1024, 102);
  for (let j = 0; j < 96; j++) {
    dr.fillStyle = j % 12 === 0 ? "#e0e3dc" : "#c7d2cb";
    dr.fillRect((j * 1024) / 96, 0, j % 12 === 0 ? 3 : 1, 512);
  }
  const domeRoofTexture = new T.CanvasTexture(domeRoofCanvas);
  domeRoofTexture.colorSpace = T.SRGBColorSpace;
  const domeRoof = venueSphere(
    10.35,
    0.31,
    mat("#ffffff", { map: domeRoofTexture, metalness: 0.18, roughness: 0.65 }),
    domeX,
    4.8,
    domeZ,
  );
  const cupola = new T.Mesh(
    new T.CylinderGeometry(0.8, 1, 0.22, 48),
    domeStone,
  );
  cupola.position.set(domeX, 8.04, domeZ);
  world.add(cupola);
  box(0.07, 0.6, 0.07, roofSteel, domeX, 8.45, domeZ);
  // Broad entries, stairs and pedestrian ring sit between the towers, as in the aerial reference.
  for (const side of [-1, 1]) {
    box(5, 0.14, 2.4, stadiumConcrete, domeX, 0.07, domeZ + side * 11.1);
    box(3.5, 1.1, 0.22, domeDark, domeX, 0.7, domeZ + side * 10.27);
    for (let j = 0; j < 5; j++)
      box(
        0.08,
        1.1,
        0.25,
        domeStone,
        domeX - 1.6 + j * 0.8,
        0.7,
        domeZ + side * 10.3,
      );
    box(4, 0.18, 1.5, domeStone, domeX, 1.5, domeZ + side * 10.8);
  }
  label(
    "ASTRODOME",
    6.8,
    0.55,
    domeX,
    3,
    domeZ + 10.32,
    "#e0e6dd",
    "#385353",
    90,
  );

  // Soft contact shadows keep the large structures attached to their plazas.
  const contactCanvas = document.createElement("canvas");
  contactCanvas.width = contactCanvas.height = 128;
  const contactInk = contactCanvas.getContext("2d"),
    contactGradient = contactInk.createRadialGradient(64, 64, 15, 64, 64, 64);
  contactGradient.addColorStop(0, "rgba(0,9,17,.65)");
  contactGradient.addColorStop(0.65, "rgba(0,9,17,.33)");
  contactGradient.addColorStop(1, "rgba(0,9,17,0)");
  contactInk.fillStyle = contactGradient;
  contactInk.fillRect(0, 0, 128, 128);
  const contactTexture = new T.CanvasTexture(contactCanvas);
  for (const [x, z, w, d] of [
    [stadiumX, stadiumZ, 39, 52],
    [domeX, domeZ, 27, 27],
  ]) {
    const shadow = new T.Mesh(
      new T.PlaneGeometry(w, d),
      new T.MeshBasicMaterial({
        map: contactTexture,
        transparent: true,
        depthWrite: false,
      }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(x, 0.01, z);
    world.add(shadow);
  }
  // Rounded podium and separate corner cores give the stadium its broad, unmistakable profile.
  function roundedRect(shape, x, y, w, h, r) {
    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);
  }
  function ringMesh(w, d, iw, id, r, y, h, m) {
    const sh = new T.Shape();
    roundedRect(sh, -w / 2, -d / 2, w, d, r);
    const hole = new T.Path();
    roundedRect(hole, -iw / 2, -id / 2, iw, id, Math.min(r, iw / 3));
    sh.holes.push(hole);
    const o = new T.Mesh(
      new T.ExtrudeGeometry(sh, {
        depth: h,
        bevelEnabled: false,
        curveSegments: 16,
      }),
      m,
    );
    o.rotation.x = -Math.PI / 2;
    o.position.set(stadiumX, y, stadiumZ);
    o.receiveShadow = true;
    world.add(o);
    return o;
  }
  ringMesh(29, 42, 22, 34, 4, 0.1, 0.7, stadiumConcrete);
  ringMesh(27.4, 40, 23, 35, 4, 0.8, 5.6, stadiumConcrete);
  // Silver horizontal cladding and blue-gray glazed concourses.
  for (const side of [-1, 1]) {
    box(0.18, 5.1, 28, stadiumGlass, stadiumX + side * 13.74, 3.6, stadiumZ);
    for (let j = 0; j < 9; j++)
      box(
        0.24,
        0.065,
        29,
        roofSteel,
        stadiumX + side * 13.85,
        1.2 + j * 0.57,
        stadiumZ,
      );
    for (let j = 0; j < 19; j++)
      box(
        0.24,
        5.2,
        0.05,
        roofSteel,
        stadiumX + side * 13.85,
        3.6,
        stadiumZ - 13.5 + j * 1.5,
      );
  }
  for (const side of [-1, 1]) {
    box(21, 5.9, 0.16, stadiumGlass, stadiumX, 3.7, stadiumZ + side * 20.03);
    for (let j = 0; j < 11; j++)
      box(
        21,
        0.055,
        0.2,
        roofSteel,
        stadiumX,
        0.9 + j * 0.55,
        stadiumZ + side * 20.14,
      );
    for (let j = 0; j < 17; j++)
      box(
        0.055,
        6,
        0.2,
        roofSteel,
        stadiumX - 10 + j * 1.25,
        3.7,
        stadiumZ + side * 20.14,
      );
    for (const dx of [-11.7, 11.7]) {
      box(3.3, 8, 4.4, stadiumCore, stadiumX + dx, 4, stadiumZ + side * 16.6);
      for (let j = 0; j < 6; j++)
        box(
          1,
          0.28,
          0.025,
          dark,
          stadiumX + dx,
          1.4 + j * 0.8,
          stadiumZ + side * 18.82,
        );
    }
  }
  // Main entrances: recessed paired doors, glazing mullions, broad canopy, stairs and an accessible approach.
  for (const side of [-1, 1]) {
    const z = stadiumZ + side * 20.45;
    for (const y of [1.9, 3.4, 4.9])
      box(20.7, 0.15, 0.32, stadiumConcrete, stadiumX, y, z);
    box(5.5, 0.28, 2.5, roofWhite, stadiumX, 2.55, stadiumZ + side * 21.2);
    for (const dx of [-2.4, 2.4])
      box(
        0.12,
        2.4,
        0.12,
        roofSteel,
        stadiumX + dx,
        1.2,
        stadiumZ + side * 22.1,
      );
    for (let j = 0; j < 4; j++) {
      box(
        0.96,
        2,
        0.07,
        stadiumGlass,
        stadiumX - 1.5 + j,
        1.1,
        stadiumZ + side * 20.7,
      );
      box(
        0.06,
        2.1,
        0.12,
        roofSteel,
        stadiumX - 2 + j,
        1.1,
        stadiumZ + side * 20.75,
      );
      box(
        0.045,
        0.4,
        0.08,
        roofWhite,
        stadiumX - 1.25 + j,
        1.1,
        stadiumZ + side * 20.79,
      );
    }
    for (let step = 0; step < 4; step++)
      box(
        7,
        0.1,
        1.4,
        stadiumConcrete,
        stadiumX,
        0.05 + step * 0.1,
        stadiumZ + side * (22.7 - step * 0.27),
      );
    for (const dx of [-3.6, 3.6])
      beam(
        new T.Vector3(stadiumX + dx, 0.7, stadiumZ + side * 23.2),
        new T.Vector3(stadiumX + dx, 1.1, stadiumZ + side * 21.8),
        0.025,
        roofSteel,
      );
    for (let j = 0; j < 7; j++)
      box(
        0.07,
        0.65,
        0.07,
        roofSteel,
        stadiumX - 4.2 + j * 1.4,
        0.33,
        stadiumZ + side * 23.8,
      );
  }
  // Tiered blue seating wraps all four sides; narrow cream circulation aisles break up the bowl.
  for (let j = 0; j < 20; j++) {
    const u = j / 19,
      iw = 10.8 + u * 10.6,
      id = 23 + u * 9.7,
      y = 0.85 + u * 5.3;
    ringMesh(
      iw + 0.43,
      id + 0.43,
      iw,
      id,
      2.9,
      y,
      0.3,
      j === 8 || j === 14 ? stadiumConcrete : seatBlue,
    );
  }
  for (const z of [-1, 1])
    box(15, 0.55, 0.7, seatRed, stadiumX, 4.3, stadiumZ + z * 15.7);
  for (const side of [-1, 1])
    for (const z of [-10, 0, 10]) {
      const aisle = box(
        5.6,
        0.055,
        0.24,
        stadiumConcrete,
        stadiumX + side * 8.1,
        3.5,
        stadiumZ + z,
      );
      aisle.rotation.z = side * 0.46;
    }
  // Field texture: yard lines, hash marks, numbers, end zones and midfield lettering.
  const fieldCanvas = document.createElement("canvas");
  fieldCanvas.width = 768;
  fieldCanvas.height = 1536;
  const fc = fieldCanvas.getContext("2d");
  fc.fillStyle = "#2d693f";
  fc.fillRect(0, 0, 768, 1536);
  for (let j = 0; j < 24; j++) {
    fc.fillStyle = j % 2 ? "#37784b" : "#326e43";
    fc.fillRect(0, j * 64, 768, 64);
  }
  fc.fillStyle = "#15394c";
  fc.fillRect(0, 0, 768, 128);
  fc.fillRect(0, 1408, 768, 128);
  fc.strokeStyle = "#f1eee3";
  fc.lineWidth = 3;
  fc.strokeRect(26, 18, 716, 1500);
  fc.textAlign = "center";
  fc.textBaseline = "middle";
  fc.fillStyle = "#f1eee3";
  fc.font = "700 56px sans-serif";
  fc.fillText("HOUSTON", 384, 66);
  fc.save();
  fc.translate(384, 1470);
  fc.rotate(Math.PI);
  fc.fillText("HOUSTON", 0, 0);
  fc.restore();
  for (let j = 0; j <= 20; j++) {
    const y = 128 + j * 64;
    fc.beginPath();
    fc.moveTo(26, y);
    fc.lineTo(742, y);
    fc.stroke();
    if (j % 2 === 0 && j > 0 && j < 20) {
      fc.font = "bold 26px sans-serif";
      const n = j <= 10 ? j * 5 : (20 - j) * 5;
      fc.fillText(String(n), 104, y - 12);
      fc.fillText(String(n), 664, y - 12);
    }
    for (let k = 1; k < 5; k++)
      for (const x of [300, 468]) fc.fillRect(x, y + k * 12, 15, 3);
  }
  fc.font = "900 48px sans-serif";
  const ft = new T.CanvasTexture(fieldCanvas);
  ft.colorSpace = T.SRGBColorSpace;
  const field = new T.Mesh(
    new T.PlaneGeometry(10.5, 24),
    mat("#ffffff", { map: ft, roughness: 1 }),
  );
  field.scale.x = -1;
  field.rotation.x = -Math.PI / 2;
  field.position.set(stadiumX, 0.72, stadiumZ);
  world.add(field);
  loadVenueMark("texans", (im) => {
    fc.save();
    fc.shadowColor = "#ffffff";
    fc.shadowBlur = 4;
    fc.drawImage(im, 248, 630, 272, 272);
    fc.restore();
    ft.needsUpdate = true;
  });
  for (const dz of [-12.2, 12.2]) {
    const yellow = mat("#e7c748");
    box(0.07, 2.3, 0.07, yellow, stadiumX, 1.85, stadiumZ + dz);
    box(2.5, 0.07, 0.07, yellow, stadiumX, 3, stadiumZ + dz);
    for (const dx of [-1.25, 1.25])
      box(0.055, 2.4, 0.055, yellow, stadiumX + dx, 4.2, stadiumZ + dz);
  }
  // Continuous supertrusses run north/south, above the sidelines. Diagonals stay joined to their chords.
  for (const side of [-1, 1]) {
    const x = stadiumX + side * 12.9;
    for (const y of [7.8, 10.2])
      beam(
        new T.Vector3(x, y, stadiumZ - 23),
        new T.Vector3(x, y, stadiumZ + 23),
        0.12,
        roofSteel,
      );
    for (let j = 0; j < 23; j++) {
      const z = stadiumZ - 23 + j * 2;
      beam(
        new T.Vector3(x, 7.8, z),
        new T.Vector3(x, 10.2, z + 1),
        0.07,
        roofSteel,
      );
      beam(
        new T.Vector3(x, 10.2, z + 1),
        new T.Vector3(x, 7.8, z + 2),
        0.07,
        roofSteel,
      );
    }
    for (const z of [-17, 17]) {
      beam(
        new T.Vector3(x, 7.8, stadiumZ + z),
        new T.Vector3(x + side * 1.9, 0.5, stadiumZ + z),
        0.2,
        stadiumConcrete,
      );
    }
    box(0.22, 0.18, 46, mat("#8b989f", { metalness: 0.7 }), x, 10.34, stadiumZ);
  }
  // Two white fabric panels split at midfield and slide toward the end zones, as the real mechanism does.
  const roofPanels = [];
  let roofOpen = 0,
    roofTarget = 0;
  function curvedRoof(width, depth) {
    const g = new T.PlaneGeometry(width, depth, 36, 12);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i),
        z = -pos.getY(i);
      const rise = 1.2 * Math.sqrt(Math.max(0, 1 - (x / (width / 2)) ** 2));
      pos.setXYZ(i, x, 10.45 + rise + 0.035 * Math.cos(z * 2.5), z);
    }
    g.computeVertexNormals();
    const roof = new T.Mesh(g, roofWhite);
    roof.castShadow = true;
    roof.receiveShadow = true;
    const vertices = [];
    for (const end of [-1, 1])
      for (let j = 0; j < 36; j++) {
        const a = -width / 2 + (j * width) / 36,
          b = a + width / 36,
          ya = 10.45 + 1.2 * Math.sqrt(Math.max(0, 1 - (a / (width / 2)) ** 2)),
          yb = 10.45 + 1.2 * Math.sqrt(Math.max(0, 1 - (b / (width / 2)) ** 2)),
          z = (end * depth) / 2;
        vertices.push(
          a,
          ya,
          z,
          b,
          yb,
          z,
          a,
          ya - 0.48,
          z,
          b,
          yb,
          z,
          b,
          yb - 0.48,
          z,
          a,
          ya - 0.48,
          z,
        );
      }
    const fasciaGeometry = new T.BufferGeometry();
    fasciaGeometry.setAttribute(
      "position",
      new T.Float32BufferAttribute(vertices, 3),
    );
    fasciaGeometry.computeVertexNormals();
    roof.add(new T.Mesh(fasciaGeometry, roofWhite));
    return roof;
  }
  for (const side of [-1, 1]) {
    const group = new T.Group();
    group.position.set(stadiumX, 0, stadiumZ + side * 6.05);
    const panel = curvedRoof(26, 12.08);
    group.add(panel);
    for (let j = 0; j < 7; j++) {
      const z = -6 + j * 2;
      const pts = [];
      for (let k = 0; k <= 24; k++) {
        const x = -13 + (k * 26) / 24;
        pts.push(
          new T.Vector3(
            x,
            10.47 + 1.2 * Math.sqrt(Math.max(0, 1 - (x / 13) ** 2)),
            z,
          ),
        );
      }
      group.add(
        new T.Line(
          new T.BufferGeometry().setFromPoints(pts),
          new T.LineBasicMaterial({ color: "#bbc6cc" }),
        ),
      );
    }
    for (const dx of [-12.9, 12.9]) {
      const rail = new T.Mesh(new T.BoxGeometry(0.3, 0.35, 12), roofSteel);
      rail.position.set(dx, 10.22, 0);
      group.add(rail);
    }
    world.add(group);
    roofPanels.push({ group, side });
  }
  // Stationary roof skirts and end decks receive the retracted panels.
  for (const side of [-1, 1]) {
    box(3, 0.3, 44, roofWhite, stadiumX + side * 14.2, 9.7, stadiumZ);
    const fixed = curvedRoof(26, 10.4);
    fixed.position.set(stadiumX, -0.25, stadiumZ + side * 17.3);
    world.add(fixed);
  }
  // Front sign follows the supplied Reliant-Stadium_3.jpg: white lowercase letters and colored square emblem.
  const signCanvas = document.createElement("canvas");
  signCanvas.width = 2048;
  signCanvas.height = 288;
  const signInk = signCanvas.getContext("2d");
  signInk.font = "600 192px Arial, sans-serif";
  signInk.textBaseline = "middle";
  const leftWord = "reliant",
    rightWord = "stadium",
    leftWidth = signInk.measureText(leftWord).width,
    rightWidth = signInk.measureText(rightWord).width,
    emblemWidth = 170,
    totalWidth = leftWidth + rightWidth + emblemWidth + 40,
    startSign = (2048 - totalWidth) / 2;
  signInk.shadowColor = "#1a2528";
  signInk.shadowOffsetX = 5;
  signInk.shadowOffsetY = 7;
  signInk.shadowBlur = 4;
  signInk.fillStyle = "#fcfcf7";
  signInk.fillText(leftWord, startSign, 161);
  signInk.fillText(rightWord, startSign + leftWidth + emblemWidth + 40, 161);
  const emblemX = startSign + leftWidth + 20,
    emblemY = 43,
    tile = 29;
  const emblemTiles = [
    [2, 0, "#d61886"],
    [1, 1, "#ad1c83"],
    [2, 1, "#662276"],
    [0, 2, "#5e277d"],
    [1, 2, "#196c9c"],
    [2, 2, "#c32489"],
    [3, 2, "#a2c83a"],
    [1, 3, "#54a63c"],
    [2, 3, "#00a7bb"],
    [3, 3, "#759e28"],
    [4, 3, "#e3d527"],
    [2, 4, "#0099c1"],
    [3, 4, "#345586"],
    [4, 4, "#edcf26"],
  ];
  for (const [x, y, color] of emblemTiles) {
    signInk.fillStyle = color;
    signInk.fillRect(
      emblemX + x * tile,
      emblemY + y * tile,
      tile - 4,
      tile - 4,
    );
  }
  const signTexture = new T.CanvasTexture(signCanvas);
  signTexture.colorSpace = T.SRGBColorSpace;
  const signMaterial = new T.MeshStandardMaterial({
    map: signTexture,
    transparent: true,
    alphaTest: 0.08,
    roughness: 0.6,
    emissive: "#ffffff",
    emissiveMap: signTexture,
    emissiveIntensity: 0.24,
  });
  for (const side of [-1, 1]) {
    box(
      22,
      1.75,
      0.24,
      mat("#8d9c9e", { metalness: 0.38, roughness: 0.55 }),
      stadiumX,
      7.05,
      stadiumZ + side * 20.22,
    );
    const board = new T.Mesh(new T.PlaneGeometry(20, 2.81), signMaterial);
    board.scale.x = -1;
    board.position.set(stadiumX, 7.1, stadiumZ + side * 20.37);
    if (side < 0) board.rotation.y = Math.PI;
    world.add(board);
    const screen = label(
      "HOUSTON / HOME FIELD",
      14,
      1.45,
      stadiumX,
      6.3,
      stadiumZ + side * 16.3,
      "#e2e8ed",
      "#203e54",
      90,
    );
    screen.scale.x = -1;
    if (side > 0) screen.rotation.y = Math.PI;
    screen.material.emissive = new T.Color("#93b8c9");
    screen.material.emissiveIntensity = 0.5;
  }
  // Individual blue seats use two instanced draws for the complete bowl.
  const seatPlacements = [];
  for (let row = 0; row < 20; row++) {
    const u = row / 19,
      hx = (10.8 + u * 10.6) / 2 + 0.2,
      hz = (23 + u * 9.7) / 2 + 0.2,
      r = 2.9,
      y = 1.22 + u * 5.3;
    for (const side of [-1, 1]) {
      for (let z = -hz + r; z < hz - r; z += 0.38)
        seatPlacements.push([side * hx, y, z, (side * Math.PI) / 2]);
      for (let x = -hx + r; x < hx - r; x += 0.38)
        seatPlacements.push([x, y, side * hz, side > 0 ? 0 : Math.PI]);
    }
    for (const xs of [-1, 1])
      for (const zs of [-1, 1])
        for (let j = 0; j < 12; j++) {
          const a = ((j / 12) * Math.PI) / 2,
            x = xs * (hx - r + r * Math.cos(a)),
            z = zs * (hz - r + r * Math.sin(a));
          seatPlacements.push([
            x,
            y,
            z,
            Math.atan2(x - xs * (hx - r), z - zs * (hz - r)),
          ]);
        }
  }
  const seatCushions = new T.InstancedMesh(
      new T.BoxGeometry(0.27, 0.075, 0.24),
      seatBlue,
      seatPlacements.length,
    ),
    seatBacks = new T.InstancedMesh(
      new T.BoxGeometry(0.27, 0.22, 0.065),
      seatBlue,
      seatPlacements.length,
    ),
    seatDummy = new T.Object3D();
  seatPlacements.forEach(([x, y, z, a], i) => {
    seatDummy.position.set(stadiumX + x, y, stadiumZ + z);
    seatDummy.rotation.set(0, a, 0);
    seatDummy.updateMatrix();
    seatCushions.setMatrixAt(i, seatDummy.matrix);
    seatDummy.position.y += 0.12;
    seatDummy.position.x += Math.sin(a) * 0.1;
    seatDummy.position.z += Math.cos(a) * 0.1;
    seatDummy.updateMatrix();
    seatBacks.setMatrixAt(i, seatDummy.matrix);
    const c = new T.Color(
      i % 13 === 0 ? "#426d85" : i % 5 === 0 ? "#375b72" : "#23445d",
    );
    seatCushions.setColorAt(i, c);
    seatBacks.setColorAt(i, c);
  });
  world.add(seatCushions, seatBacks);
  const fieldFill = new T.PointLight("#d4e7ff", 35, 36, 2);
  fieldFill.position.set(stadiumX, 15, stadiumZ);
  scene.add(fieldFill);
  // Tree-lined plazas, pedestrian paths, tall parking lights and perimeter fencing.
  for (const z of [stadiumZ - 23, stadiumZ + 23]) {
    box(31, 0.12, 3, concrete, stadiumX, 0.02, z);
    for (const dx of [-13, -8, 8, 13]) {
      box(0.12, 2, 0.12, wood, stadiumX + dx, 1, z);
      const crown = new T.Mesh(new T.IcosahedronGeometry(1, 1), mat("#365a42"));
      crown.scale.set(1.3, 0.7, 1);
      crown.position.set(stadiumX + dx, 2.2, z);
      world.add(crown);
    }
  }
  for (const x of [-119, -52])
    for (const z of [38, 64, 91]) {
      box(0.12, 12, 0.12, roofSteel, x, 6, z);
      box(
        1.3,
        0.2,
        1.3,
        new T.MeshBasicMaterial({ color: "#cfdef1" }),
        x,
        12,
        z,
      );
    }

  const stadiumDistrict = new T.Group();
  world.children
    .slice(stadiumDistrictStart)
    .forEach((o) => stadiumDistrict.add(o));
  stadiumDistrict.add(fieldFill);
  world.add(stadiumDistrict);
  stadiumDistrict.position.set(-15, 0, -334);
  stadiumDistrict.scale.z = -1;
  const ballparkStart = world.children.length;
  // Daikin Park / Union Station: brick-and-limestone perimeter, copper roofs, clock tower and three arched roof sections.
  const parkX = 41,
    parkZ = -76,
    parkSteel = mat("#53897f", { metalness: 0.45, roughness: 0.5 }),
    parkSeats = mat("#284c43"),
    parkRoofMat = mat("#dddcc9", { roughness: 0.8, side: T.DoubleSide });
  box(29, 0.18, 29, concrete, parkX, 0.02, parkZ);
  for (const side of [-1, 1]) {
    box(1.6, 5.4, 25, architecturalBrick, parkX + side * 12.6, 2.7, parkZ);
    box(1.72, 0.22, 25.1, limestone, parkX + side * 12.6, 1.3, parkZ);
    box(1.72, 0.24, 25.1, limestone, parkX + side * 12.6, 3.7, parkZ);
    box(2.4, 0.2, 25.3, copperGreen, parkX + side * 12.6, 5.5, parkZ);
    for (let j = 0; j < 11; j++) {
      const z = parkZ - 10.8 + j * 2.15;
      venueArch(
        1.3,
        2.2,
        parkX + side * 13.42,
        0.55,
        z,
        venueGlass,
        side > 0 ? Math.PI / 2 : -Math.PI / 2,
      );
      box(0.18, 1.6, 0.8, limestone, parkX + side * 13.45, 4.35, z);
    }
  }
  for (const side of [-1, 1]) {
    box(24, 4.5, 1.5, architecturalBrick, parkX, 2.25, parkZ + side * 12.4);
    for (const y of [1.2, 3.6])
      box(24, 0.18, 1.6, limestone, parkX, y, parkZ + side * 12.4);
    for (let j = 0; j < 12; j++) {
      venueArch(
        1.3,
        2.4,
        parkX - 11 + j * 2,
        0.4,
        parkZ + side * 13.18,
        venueGlass,
        side < 0 ? Math.PI : 0,
      );
    }
  }
  // Square corner towers with copper cornices; the southwest tower carries a real clock face.
  for (const side of [-1, 1])
    for (const end of [-1, 1]) {
      const x = parkX + side * 11.7,
        z = parkZ + end * 11.7,
        h = side < 0 && end < 0 ? 8.1 : 6.5;
      box(2.4, h, 2.4, architecturalBrick, x, h / 2, z);
      for (const y of [1.4, 3.5, h - 0.4])
        box(2.55, 0.25, 2.55, limestone, x, y, z);
      box(2.9, 0.25, 2.9, copperGreen, x, h + 0.2, z);
      const clockCanvas = document.createElement("canvas");
      clockCanvas.width = clockCanvas.height = 128;
      const ck = clockCanvas.getContext("2d");
      ck.fillStyle = "#c3c8b4";
      ck.beginPath();
      ck.arc(64, 64, 59, 0, Math.PI * 2);
      ck.fill();
      ck.strokeStyle = "#365b50";
      ck.lineWidth = 8;
      ck.stroke();
      for (let k = 0; k < 12; k++) {
        const a = (k * Math.PI) / 6;
        ck.lineWidth = 3;
        ck.beginPath();
        ck.moveTo(64 + Math.sin(a) * 45, 64 + Math.cos(a) * 45);
        ck.lineTo(64 + Math.sin(a) * 51, 64 + Math.cos(a) * 51);
        ck.stroke();
      }
      ck.lineWidth = 5;
      ck.beginPath();
      ck.moveTo(64, 29);
      ck.lineTo(64, 64);
      ck.lineTo(88, 77);
      ck.stroke();
      const texture = new T.CanvasTexture(clockCanvas);
      texture.colorSpace = T.SRGBColorSpace;
      const clock = new T.Mesh(
        new T.PlaneGeometry(1.5, 1.5),
        new T.MeshStandardMaterial({ map: texture, transparent: true }),
      );
      clock.position.set(x, h - 1.3, z + end * 1.22);
      if (end < 0) clock.rotation.y = Math.PI;
      world.add(clock);
    }
  // Union Station is the lower limestone frontage on Crawford, on the west side.
  box(2, 2.7, 17, limestone, parkX - 13.6, 1.35, parkZ - 2);
  for (let j = 0; j < 7; j++)
    venueArch(
      1.55,
      2.15,
      parkX - 14.62,
      0.2,
      parkZ - 9 + j * 2.3,
      venueGlass,
      -Math.PI / 2,
    );
  for (const z of [-7, 4]) {
    const awning = box(1.6, 0.15, 3, copperGreen, parkX - 14.5, 2.8, parkZ + z);
    awning.rotation.z = -0.15;
    for (const dz of [-1.2, 1.2])
      box(0.07, 2.7, 0.07, parkSteel, parkX - 14.8, 1.35, parkZ + z + dz);
  }
  // Proper baseball diamond, infield arc, mound, bases, batter boxes and striped outfield.
  const baseballCanvas = document.createElement("canvas");
  baseballCanvas.width = baseballCanvas.height = 1024;
  const bc = baseballCanvas.getContext("2d");
  bc.fillStyle = "#315c3e";
  bc.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 26; i++) {
    bc.fillStyle = i % 2 ? "#438348" : "#397644";
    bc.fillRect(i * 40, 0, 40, 1024);
  }
  bc.fillStyle = "#ae7951";
  bc.beginPath();
  bc.moveTo(512, 870);
  bc.arc(512, 870, 390, -Math.PI * 0.76, -Math.PI * 0.24);
  bc.closePath();
  bc.fill();
  bc.beginPath();
  bc.moveTo(512, 870);
  bc.lineTo(724, 658);
  bc.lineTo(512, 446);
  bc.lineTo(300, 658);
  bc.closePath();
  bc.lineWidth = 28;
  bc.strokeStyle = "#b68053";
  bc.stroke();
  bc.fillStyle = "#3f7d45";
  bc.fill();
  bc.fillStyle = "#b98254";
  bc.beginPath();
  bc.arc(512, 659, 30, 0, Math.PI * 2);
  bc.fill();
  bc.beginPath();
  bc.arc(512, 870, 48, 0, Math.PI * 2);
  bc.fill();
  bc.fillStyle = "#f0e7cc";
  for (const [x, y] of [
    [512, 870],
    [724, 658],
    [512, 446],
    [300, 658],
  ]) {
    bc.save();
    bc.translate(x, y);
    bc.rotate(Math.PI / 4);
    bc.fillRect(-7, -7, 14, 14);
    bc.restore();
  }
  bc.fillRect(502, 654, 20, 5);
  bc.strokeStyle = "#ece7d6";
  bc.lineWidth = 3;
  bc.beginPath();
  bc.moveTo(80, 440);
  bc.lineTo(512, 870);
  bc.lineTo(944, 440);
  bc.stroke();
  bc.strokeRect(479, 852, 17, 38);
  bc.strokeRect(529, 852, 17, 38);
  bc.font = "700 35px Arial";
  bc.textAlign = "center";
  bc.fillStyle = "#e0d8bd";
  bc.fillText("HOUSTON", 512, 120);
  const baseballTexture = new T.CanvasTexture(baseballCanvas);
  baseballTexture.colorSpace = T.SRGBColorSpace;
  const baseballField = new T.Mesh(
    new T.PlaneGeometry(19, 21),
    mat("#ffffff", { map: baseballTexture, roughness: 1 }),
  );
  baseballField.rotation.set(-Math.PI / 2, 0, Math.PI);
  baseballField.position.set(parkX, 0.35, parkZ);
  world.add(baseballField);
  loadVenueMark("astros", (im) => {
    bc.drawImage(im, 422, 210, 180, 180);
    baseballTexture.needsUpdate = true;
  });
  // U-shaped seating tiers face home plate; the outfield stays an open lawn and high green wall.
  for (let row = 0; row < 14; row++) {
    const u = row / 13,
      h = 0.65 + u * 3.3,
      rx = 9 + u * 2.4,
      rz = 9 + u * 2;
    const pts = [
      new T.Vector3(parkX - rx, h, parkZ + 6),
      new T.Vector3(parkX - rx, h, parkZ - 5),
      new T.Vector3(parkX - rx * 0.7, h, parkZ - rz),
      new T.Vector3(parkX + rx * 0.7, h, parkZ - rz),
      new T.Vector3(parkX + rx, h, parkZ - 5),
      new T.Vector3(parkX + rx, h, parkZ + 6),
    ];
    const path = new T.CatmullRomCurve3(pts);
    const strip = new T.Mesh(
      new T.TubeGeometry(path, 96, 0.14, 4, false),
      row === 8 ? limestone : parkSeats,
    );
    world.add(strip);
  }
  box(21, 2.3, 0.25, parkSeats, parkX, 1.35, parkZ + 10.5);
  for (let j = 0; j < 5; j++)
    box(3.3, 0.3, 3.4, parkSeats, parkX - 9.3, 1.3 + j * 0.46, parkZ + 7.4);
  label(
    "CRAWFORD BOXES",
    5,
    0.45,
    parkX - 8,
    3.6,
    parkZ + 9.5,
    "#ede3c9",
    "#254d41",
    65,
  );
  const score = label(
    "HOUSTON  /  HOME FIELD",
    9,
    2.4,
    parkX + 4,
    4.8,
    parkZ + 10.6,
    "#f6d897",
    "#183b36",
    83,
  );
  score.rotation.y = Math.PI;
  score.material.emissive = new T.Color("#e1bd73");
  score.material.emissiveIntensity = 0.35;
  // The train and its track, an unmistakable ballpark detail, sit high along the outfield wall.
  box(10, 0.18, 0.5, parkSteel, parkX - 4, 4.3, parkZ + 11.2);
  box(1.7, 0.65, 0.7, mat("#383a35"), parkX - 6, 4.7, parkZ + 11.2);
  box(0.7, 0.9, 0.8, architecturalBrick, parkX - 5, 4.9, parkZ + 11.2);
  box(0.18, 0.8, 0.18, dark, parkX - 6.5, 5.2, parkZ + 11.2);
  for (const x of [-6.5, -5.6, -4.8]) {
    const wheel = new T.Mesh(
      new T.CylinderGeometry(0.22, 0.22, 0.85, 12),
      dark,
    );
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(parkX + x, 4.45, parkZ + 11.2);
    world.add(wheel);
  }
  box(1.5, 0.65, 0.8, mat("#b77832"), parkX - 3.5, 4.75, parkZ + 11.2);
  // Three cream fabric barrel roofs and mint-green latticed arch trusses telescope over the outfield.
  const ballparkPanels = [];
  let ballparkOpen = 1,
    ballparkTarget = 1;
  const daikinCanvas = document.createElement("canvas");
  daikinCanvas.width = 2048;
  daikinCanvas.height = 672;
  const dk = daikinCanvas.getContext("2d");
  dk.fillStyle = "#e6e5d9";
  dk.fillRect(0, 0, 2048, 672);
  dk.strokeStyle = "#b8c0bb";
  dk.lineWidth = 2;
  for (let x = 0; x < 2048; x += 64) {
    dk.beginPath();
    dk.moveTo(x, 0);
    dk.lineTo(x, 672);
    dk.stroke();
  }
  dk.save();
  dk.translate(170, 180);
  dk.fillStyle = "#00a1de";
  dk.beginPath();
  dk.moveTo(0, 0);
  dk.lineTo(350, 0);
  dk.lineTo(0, 260);
  dk.closePath();
  dk.fill();
  dk.fillStyle = "#152e45";
  dk.beginPath();
  dk.moveTo(0, 0);
  dk.lineTo(130, 0);
  dk.lineTo(0, 97);
  dk.closePath();
  dk.fill();
  dk.restore();
  dk.fillStyle = "#008ac4";
  dk.textAlign = "left";
  dk.textBaseline = "middle";
  dk.font = "italic 900 250px Arial, sans-serif";
  dk.fillText("DAIKIN", 490, 285, 1380);
  dk.font = "700 112px Arial, sans-serif";
  dk.fillStyle = "#263f4d";
  dk.fillText("P A R K", 510, 455, 1280);
  const daikinTexture = new T.CanvasTexture(daikinCanvas);
  daikinTexture.colorSpace = T.SRGBColorSpace;
  daikinTexture.anisotropy = Math.min(
    8,
    renderer.capabilities.getMaxAnisotropy(),
  );
  const daikinRoofMat = mat("#ffffff", {
    map: daikinTexture,
    roughness: 0.78,
    side: T.DoubleSide,
  });

  for (let panel = 0; panel < 3; panel++) {
    const group = new T.Group(),
      width = 25.5,
      depth = 8.4,
      base = 7.8 + panel * 0.75;
    const geo = new T.PlaneGeometry(width, depth, 48, 8),
      pa = geo.attributes.position;
    for (let i = 0; i < pa.count; i++) {
      const x = pa.getX(i),
        z = -pa.getY(i);
      pa.setXYZ(
        i,
        x,
        base + 3.2 * Math.sqrt(Math.max(0, 1 - (x / (width / 2)) ** 2)),
        z,
      );
    }
    geo.computeVertexNormals();
    group.add(new T.Mesh(geo, panel === 1 ? daikinRoofMat : parkRoofMat));
    for (const end of [-1, 1]) {
      const top = [],
        bottom = [];
      for (let j = 0; j <= 24; j++) {
        const x = -width / 2 + (j * width) / 24,
          y = base + 3.2 * Math.sqrt(Math.max(0, 1 - (x / (width / 2)) ** 2));
        top.push(new T.Vector3(x, y, (end * depth) / 2));
        bottom.push(new T.Vector3(x, y - 1.1, (end * depth) / 2));
      }
      for (const points of [top, bottom])
        group.add(
          new T.Mesh(
            new T.TubeGeometry(
              new T.CatmullRomCurve3(points),
              48,
              0.055,
              5,
              false,
            ),
            parkSteel,
          ),
        );
      for (let j = 0; j < 24; j++) {
        const a = top[j],
          b = bottom[j + 1],
          v = b.clone().sub(a),
          beamMesh = new T.Mesh(
            new T.CylinderGeometry(0.035, 0.035, v.length(), 5),
            parkSteel,
          );
        beamMesh.position.copy(a).add(b).multiplyScalar(0.5);
        beamMesh.quaternion.setFromUnitVectors(
          new T.Vector3(0, 1, 0),
          v.normalize(),
        );
        group.add(beamMesh);
      }
    }
    group.position.set(parkX, 0, parkZ + 8.8 + panel * 0.35);
    world.add(group);
    ballparkPanels.push({ group, panel });
  }
  for (const side of [-1, 1]) {
    box(0.25, 0.18, 27, parkSteel, parkX + side * 12.8, 7.6, parkZ);
    for (let j = 0; j < 10; j++)
      box(
        0.15,
        3,
        0.15,
        parkSteel,
        parkX + side * 12.8,
        6.1,
        parkZ - 11.5 + j * 2.55,
      );
  }
  const parkSign = label(
    "DAIKIN PARK",
    11,
    0.9,
    parkX - 14.66,
    4.2,
    parkZ,
    "#e3e9dc",
    "#315d55",
    95,
  );
  parkSign.rotation.y = -Math.PI / 2;

  const ballparkDistrict = new T.Group();
  world.children.slice(ballparkStart).forEach((o) => ballparkDistrict.add(o));
  world.add(ballparkDistrict);
  ballparkDistrict.position.set(39, 0, -49);
  const arenaStart = world.children.length;
  // Toyota Center: broad limestone podium, red steel/glass corner atrium and flat silver elliptical roof.
  const arenaX = 34,
    arenaZ = -32,
    arenaStone = mat("#baad94"),
    arenaRed = mat("#9e4b3f"),
    arenaMetal = mat("#aeb6b7", { metalness: 0.5, roughness: 0.5 });
  box(27, 0.15, 25, concrete, arenaX, 0.02, arenaZ);
  box(24, 0.38, 20, arenaStone, arenaX, 0.22, arenaZ);
  for (const side of [-1, 1]) {
    box(24, 4.5, 0.45, arenaStone, arenaX, 2.25, arenaZ + side * 9.8);
    box(0.45, 4.5, 20, arenaStone, arenaX + side * 11.8, 2.25, arenaZ);
  }
  for (const side of [-1, 1]) {
    box(24, 0.3, 0.18, arenaRed, arenaX, 1.1, arenaZ + side * 10.05);
    box(24, 0.22, 0.18, arenaRed, arenaX, 3.8, arenaZ + side * 10.05);
    for (let j = 0; j < 14; j++)
      box(
        0.7,
        0.9,
        0.045,
        venueGlass,
        arenaX - 10.6 + j * 1.63,
        3.1,
        arenaZ + side * 10.17,
      );
  }
  // Recessed, glowing main entrance wraps around the front-west corner in the supplied aerial.
  box(14, 2.65, 0.22, venueGlass, arenaX - 3, 1.55, arenaZ + 10.2);
  box(0.22, 2.65, 8, venueGlass, arenaX - 12.2, 1.55, arenaZ + 5.9);
  for (let j = 0; j < 17; j++)
    box(
      0.07,
      2.75,
      0.28,
      arenaRed,
      arenaX - 9.8 + j * 0.82,
      1.55,
      arenaZ + 10.32,
    );
  for (let j = 0; j < 9; j++)
    box(0.28, 2.75, 0.07, arenaRed, arenaX - 12.32, 1.55, arenaZ + 2 + j * 0.9);
  for (const y of [0.55, 1.55, 2.75]) {
    box(14, 0.09, 0.28, arenaRed, arenaX - 3, y, arenaZ + 10.33);
    box(0.28, 0.09, 8, arenaRed, arenaX - 12.33, y, arenaZ + 5.9);
  }
  box(15, 0.15, 2.2, arenaMetal, arenaX - 3, 3.1, arenaZ + 10.6);
  for (const x of [-9, -5, -1, 3]) {
    box(1.5, 1.9, 0.06, venueGlass, arenaX + x, 1.15, arenaZ + 10.47);
    box(0.06, 1.9, 0.09, arenaMetal, arenaX + x, 1.15, arenaZ + 10.52);
    box(0.07, 0.3, 0.06, limestone, arenaX + x + 0.3, 1.1, arenaZ + 10.6);
  }
  // Stadium roof graphic follows the real red roof wordmark and emblem, on its silver metal plane.
  const arenaCanvas = document.createElement("canvas");
  arenaCanvas.width = arenaCanvas.height = 1024;
  const ac = arenaCanvas.getContext("2d");
  ac.fillStyle = "#b9c0bf";
  ac.fillRect(0, 0, 1024, 1024);
  ac.strokeStyle = "#8b9698";
  ac.lineWidth = 1;
  for (let j = 0; j < 80; j++) {
    const a = (j / 80) * Math.PI * 2;
    ac.beginPath();
    ac.moveTo(512, 512);
    ac.lineTo(512 + Math.cos(a) * 720, 512 + Math.sin(a) * 720);
    ac.stroke();
  }
  ac.strokeStyle = "#aa4038";
  ac.lineWidth = 9;
  ac.beginPath();
  ac.ellipse(512, 318, 90, 54, 0, 0, Math.PI * 2);
  ac.stroke();
  ac.beginPath();
  ac.ellipse(512, 318, 30, 54, 0, 0, Math.PI * 2);
  ac.stroke();
  ac.beginPath();
  ac.ellipse(512, 306, 68, 23, 0, 0, Math.PI * 2);
  ac.stroke();
  ac.fillStyle = "#ab4039";
  ac.textAlign = "center";
  ac.font = "600 87px Arial";
  ac.fillText("TOYOTA", 512, 458);
  ac.font = "500 73px Arial";
  ac.fillText("CENTER", 512, 547);
  const arTex = new T.CanvasTexture(arenaCanvas);
  arTex.colorSpace = T.SRGBColorSpace;
  const roofTop = mat("#ffffff", {
    map: arTex,
    metalness: 0.35,
    roughness: 0.58,
  });
  const arenaRoof = new T.Group();
  arenaRoof.name = "Toyota Center complete exterior roof";
  arenaRoof.position.set(arenaX, 5.05, arenaZ);
  world.add(arenaRoof);
  // Solid podium deck closes the corners; the broad oval above it is a shallow curved metal shell.
  const arenaDeck = new T.Mesh(new T.BoxGeometry(24, 0.24, 20), arenaMetal);
  arenaDeck.position.y = -0.43;
  arenaDeck.castShadow = arenaDeck.receiveShadow = true;
  arenaRoof.add(arenaDeck);
  const roofPositions = [],
    roofUvs = [],
    roofIndices = [],
    roofRings = 12,
    roofSegments = 96;
  for (let ring = 0; ring <= roofRings; ring++) {
    const r = ring / roofRings;
    for (let segment = 0; segment <= roofSegments; segment++) {
      const t = (segment / roofSegments) * Math.PI * 2,
        x = Math.cos(t) * 11.6 * r,
        z = Math.sin(t) * 9.2 * r;
      roofPositions.push(x, 0.58 * (1 - r * r), z);
      roofUvs.push(0.5 + x / 23.2, 0.5 - z / 18.4);
    }
  }
  for (let ring = 0; ring < roofRings; ring++)
    for (let segment = 0; segment < roofSegments; segment++) {
      const a = ring * (roofSegments + 1) + segment,
        b = a + roofSegments + 1;
      roofIndices.push(a, a + 1, b, b, a + 1, b + 1);
    }
  const roofGeometry = new T.BufferGeometry();
  roofGeometry.setAttribute(
    "position",
    new T.Float32BufferAttribute(roofPositions, 3),
  );
  roofGeometry.setAttribute("uv", new T.Float32BufferAttribute(roofUvs, 2));
  roofGeometry.setIndex(roofIndices);
  roofGeometry.computeVertexNormals();
  roofTop.side = T.DoubleSide;
  const arenaShell = new T.Mesh(roofGeometry, roofTop);
  arenaShell.castShadow = arenaShell.receiveShadow = true;
  arenaRoof.add(arenaShell);
  const arenaFascia = new T.Mesh(
    new T.CylinderGeometry(11.6, 11.6, 0.48, 96, 1, true),
    arenaMetal,
  );
  arenaFascia.scale.z = 9.2 / 11.6;
  arenaFascia.position.y = -0.24;
  arenaRoof.add(arenaFascia);
  const lip = new T.Mesh(new T.TorusGeometry(11.6, 0.085, 8, 96), arenaMetal);
  lip.rotation.x = Math.PI / 2;
  lip.scale.y = 9.2 / 11.6;
  lip.position.y = 0.025;
  arenaRoof.add(lip);
  canvas.dataset.arenaRoof = "closed";

  for (const side of [-1, 1])
    for (let j = 0; j < 5; j++)
      box(
        0.8,
        0.45,
        1.1,
        arenaMetal,
        arenaX + side * 11,
        4.76,
        arenaZ - 7 + j * 3.3,
      );
  label(
    "TOYOTA CENTER",
    10,
    0.7,
    arenaX - 3,
    3.55,
    arenaZ + 10.45,
    "#eee3ce",
    "#8d4236",
    100,
  );
  // Pedestrian plaza, broad front steps, bollards and an attached parking mass on the southeast block.
  for (let j = 0; j < 3; j++)
    box(
      14,
      0.1,
      1.4,
      limestone,
      arenaX - 3,
      0.05 + j * 0.1,
      arenaZ + 11 + j * 0.3,
    );
  for (let j = 0; j < 9; j++)
    box(
      0.08,
      0.55,
      0.08,
      arenaMetal,
      arenaX - 10 + j * 1.8,
      0.3,
      arenaZ + 12.1,
    );

  // Hardwood court and team marks are visible through an architectural cutaway view.
  const courtCanvas = document.createElement("canvas");
  courtCanvas.width = 1536;
  courtCanvas.height = 820;
  const cq = courtCanvas.getContext("2d");
  cq.fillStyle = "#c89960";
  cq.fillRect(0, 0, 1536, 820);
  for (let row = 0; row < 42; row++) {
    cq.fillStyle =
      row % 3 === 0 ? "#d3aa75" : row % 3 === 1 ? "#c99e69" : "#dbb37d";
    cq.fillRect(0, row * 20, 1536, 19);
    cq.strokeStyle = "#a57c4855";
    cq.lineWidth = 1;
    for (let x = (row % 2) * 110; x < 1536; x += 220)
      cq.strokeRect(x, row * 20, 220, 20);
  }
  cq.fillStyle = "#b62032";
  for (const x of [35, 1250]) cq.fillRect(x, 260, 250, 300);
  cq.strokeStyle = "#f6e5bf";
  cq.lineWidth = 4;
  cq.strokeRect(35, 35, 1466, 750);
  cq.beginPath();
  cq.moveTo(768, 35);
  cq.lineTo(768, 785);
  cq.stroke();
  for (const side of [-1, 1]) {
    const x = side < 0 ? 35 : 1501,
      freeX = side < 0 ? 285 : 1251;
    cq.strokeRect(side < 0 ? 35 : 1251, 260, 250, 300);
    cq.beginPath();
    cq.arc(freeX, 410, 100, 0, Math.PI * 2);
    cq.stroke();
    cq.beginPath();
    cq.arc(
      x,
      410,
      310,
      side < 0 ? -Math.PI / 2 : Math.PI / 2,
      side < 0 ? Math.PI / 2 : Math.PI * 1.5,
    );
    cq.stroke();
  }
  cq.fillStyle = "#b62032";
  cq.beginPath();
  cq.arc(768, 410, 155, 0, Math.PI * 2);
  cq.fill();
  cq.strokeStyle = "#f6e5bf";
  cq.lineWidth = 3;
  cq.stroke();
  cq.save();
  cq.translate(82, 410);
  cq.rotate(-Math.PI / 2);
  cq.fillStyle = "#f5e8c8";
  cq.textAlign = "center";
  cq.font = "900 45px Arial";
  cq.fillText("HOUSTON", 0, 0);
  cq.restore();
  cq.save();
  cq.translate(1454, 410);
  cq.rotate(Math.PI / 2);
  cq.fillStyle = "#f5e8c8";
  cq.textAlign = "center";
  cq.font = "900 45px Arial";
  cq.fillText("ROCKETS", 0, 0);
  cq.restore();
  const courtTexture = new T.CanvasTexture(courtCanvas);
  courtTexture.colorSpace = T.SRGBColorSpace;
  courtTexture.anisotropy = Math.min(
    8,
    renderer.capabilities.getMaxAnisotropy(),
  );
  const courtMesh = new T.Mesh(
    new T.PlaneGeometry(18, 9.6),
    mat("#ffffff", { map: courtTexture, roughness: 0.55 }),
  );
  courtMesh.rotation.x = -Math.PI / 2;
  courtMesh.position.set(arenaX, 0.58, arenaZ);
  world.add(courtMesh);
  // Red seating tiers and two backboards frame the hardwood.
  for (let row = 0; row < 7; row++) {
    const h = 0.65 + row * 0.43;
    for (const side of [-1, 1]) {
      box(
        20,
        0.12,
        0.35,
        arenaRed,
        arenaX,
        h,
        arenaZ + side * (5.4 + row * 0.49),
      );
      box(
        0.35,
        0.12,
        9,
        arenaRed,
        arenaX + side * (9.7 + row * 0.27),
        h,
        arenaZ,
      );
    }
  }
  for (const side of [-1, 1]) {
    const x = arenaX + side * 8.6;
    box(0.08, 1.9, 0.08, arenaMetal, x, 1.5, arenaZ);
    box(
      0.08,
      0.9,
      1.5,
      mat("#c7d9db", { transparent: true, opacity: 0.55 }),
      x,
      2.45,
      arenaZ,
    );
    const hoop = new T.Mesh(
      new T.TorusGeometry(0.22, 0.025, 6, 20),
      mat("#dd5b2a"),
    );
    hoop.rotation.x = Math.PI / 2;
    hoop.position.set(x - side * 0.3, 2.18, arenaZ);
    world.add(hoop);
  }
  const rocketBannerCanvas = document.createElement("canvas");
  rocketBannerCanvas.width = 512;
  rocketBannerCanvas.height = 768;
  const rb = rocketBannerCanvas.getContext("2d");
  rb.fillStyle = "#a9142c";
  rb.fillRect(0, 0, 512, 768);
  const rocketBannerTexture = new T.CanvasTexture(rocketBannerCanvas);
  rocketBannerTexture.colorSpace = T.SRGBColorSpace;
  const rocketBannerMat = new T.MeshBasicMaterial({ map: rocketBannerTexture });
  for (const side of [-1, 1]) {
    const banner = new T.Mesh(new T.PlaneGeometry(1.35, 2.05), rocketBannerMat);
    banner.position.set(arenaX + side * 9, 2.9, arenaZ + 10.5);
    world.add(banner);
  }
  loadVenueMark("rockets", (im) => {
    cq.drawImage(im, 638, 280, 260, 260);
    courtTexture.needsUpdate = true;
    rb.drawImage(im, 45, 100, 422, 422);
    rb.fillStyle = "#fff";
    rb.font = "900 53px Arial";
    rb.textAlign = "center";
    rb.fillText("ROCKETS", 256, 630);
    rocketBannerTexture.needsUpdate = true;
  });

  const arenaDistrict = new T.Group();
  world.children.slice(arenaStart).forEach((o) => arenaDistrict.add(o));
  world.add(arenaDistrict);
  arenaDistrict.position.set(41, 0, -143);
  // One continuous city plan. +Z is north, +X east. District distances are compressed, relative positions retained.
  // References: Reliant Park campus map; MLB park directions; Toyota Center directions; Hines Williams Tower location.
  const planRoads = [...campusRoadFootprints],
    planBuildings = [],
    planCurves = [],
    urbanBatches = new Map(),
    urbanDummy = new T.Object3D();
  const urbanAmber = glowMat("#e4c691", 0.5);
  const urbanContact = new T.MeshBasicMaterial({
    map: contactTexture,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
  });
  const unitCityBox = new T.BoxGeometry(1, 1, 1),
    cityCurb = mat("#8b9694"),
    cityPaint = mat("#d5d4c4"),
    cityYellow = mat("#d4b760"),
    cityRoof = mat("#7e898d", { roughness: 0.9 }),
    cityBark = mat("#45433c"),
    cityLeaves = mat("#294f40"),
    cityPaving = mat("#525c5b"),
    cityBlack = mat("#19252b");
  function cityBox(w, h, d, m, x, y, z, ry = 0) {
    let b = urbanBatches.get(m);
    if (!b) {
      b = [];
      urbanBatches.set(m, b);
    }
    urbanDummy.position.set(x, y, z);
    urbanDummy.rotation.set(0, ry, 0);
    urbanDummy.scale.set(w, h, d);
    urbanDummy.updateMatrix();
    b.push(urbanDummy.matrix.clone());
  }
  function rectIntersects(a, b, margin = 0) {
    return (
      Math.abs(a.x - b.x) < (a.w + b.w) / 2 + margin &&
      Math.abs(a.z - b.z) < (a.d + b.d) / 2 + margin
    );
  }
  const sxMin =
      Math.min(...skylineTowerFootprints.map((b) => b.x - b.w / 2)) - 8,
    sxMax = Math.max(...skylineTowerFootprints.map((b) => b.x + b.w / 2)) + 8,
    szMin = Math.min(...skylineTowerFootprints.map((b) => b.z - b.d / 2)) - 8,
    szMax = Math.max(...skylineTowerFootprints.map((b) => b.z + b.d / 2)) + 8;
  const skylineBounds = {
    x: (sxMin + sxMax) / 2,
    z: (szMin + szMax) / 2,
    w: sxMax - sxMin,
    d: szMax - szMin,
  };
  const protectedBlocks = [
    skylineBounds,
    { x: -106, z: -403, w: 160, d: 168 },
    { x: -296, z: -187, w: 29, d: 50 },
    { x: -346, z: -184, w: 42, d: 48 },
    { x: -310, z: -146, w: 70, d: 18 },
    { x: 80, z: -125, w: 33, d: 32 },
    { x: 75, z: -175, w: 29, d: 27 },
    { x: 5, z: -44, w: 55, d: 104 },
  ];
  const existingFootprints = [
    { x: 80, z: -125, w: 23, d: 21 },
    { x: 75, z: -175, w: 24, d: 20 },
    { x: -295, z: -185, w: 9, d: 8 },
  ];
  for (const f of [...existingFootprints, ...skylineTowerFootprints])
    planBuildings.push(f);
  // Every ground street records its footprint before any surrounding parcel is populated.
  function cityStreet(
    x1,
    z1,
    x2,
    z2,
    width = 5,
    name = "",
    sidewalk = true,
    parcelClipped = false,
  ) {
    const dx = x2 - x1,
      dz = z2 - z1,
      len = Math.hypot(dx, dz),
      along = Math.abs(dz) > Math.abs(dx),
      cx = (x1 + x2) / 2,
      cz = (z1 + z2) / 2,
      a = Math.atan2(dx, dz);
    if (!parcelClipped) {
      let cuts = [
        [
          along ? Math.min(z1, z2) : Math.min(x1, x2),
          along ? Math.max(z1, z2) : Math.max(x1, x2),
        ],
      ];
      const fixed = along ? cx : cz;
      let changed = false;
      for (const b of [...skylineTowerFootprints, ...existingFootprints]) {
        if (
          Math.abs(fixed - (along ? b.x : b.z)) >=
          (width + (along ? b.w : b.d)) / 2 + 1.2
        )
          continue;
        const lo = (along ? b.z : b.x) - (along ? b.d : b.w) / 2 - 1.2,
          hi = (along ? b.z : b.x) + (along ? b.d : b.w) / 2 + 1.2;
        cuts = cuts.flatMap(([a, c]) => {
          if (hi <= a || lo >= c) return [[a, c]];
          changed = true;
          const out = [];
          if (lo > a) out.push([a, lo]);
          if (hi < c) out.push([hi, c]);
          return out;
        });
      }
      if (changed) {
        for (const [a, b] of cuts)
          if (b - a > 2)
            along
              ? cityStreet(fixed, a, fixed, b, width, name, sidewalk, true)
              : cityStreet(a, fixed, b, fixed, width, name, sidewalk, true);
        return;
      }
    }
    if (len < 1) return;
    const r = {
      x: cx,
      z: cz,
      w: along ? width : len,
      d: along ? len : width,
      name,
      x1,
      z1,
      x2,
      z2,
      width,
      sidewalk,
    };
    planRoads.push(r);
    cityBox(width, 0.09, len, asphalt, cx, -0.045, cz, a);
    if (name) {
      const sx = x1 + dx * 0.17 + Math.cos(a) * (width / 2 + 1),
        sz = z1 + dz * 0.17 - Math.sin(a) * (width / 2 + 1);
      cityBox(0.065, 3, 0.065, cityBlack, sx, 1.5, sz);
      const sign = label(name, 4.4, 0.5, sx, 3.1, sz, "#e6e8d8", "#285748", 70);
      sign.rotation.y = a;
    }
  }
  // Ground grid clips at complete landmark blocks instead of running through buildings.
  function gridStreet(fixed, lo, hi, along) {
    let cuts = [[lo, hi]];
    for (const b of protectedBlocks) {
      const cross = along ? b.x : b.z,
        span = along ? b.w : b.d,
        center = along ? b.z : b.x,
        extent = along ? b.d : b.w;
      if (Math.abs(fixed - cross) > span / 2 + 3) continue;
      const start = center - extent / 2 - 3,
        end = center + extent / 2 + 3;
      cuts = cuts.flatMap(([a, c]) => {
        if (end <= a || start >= c) return [[a, c]];
        const out = [];
        if (start > a) out.push([a, start]);
        if (end < c) out.push([end, c]);
        return out;
      });
    }
    for (const [a, b] of cuts)
      if (b - a > 4)
        along
          ? cityStreet(fixed, a, fixed, b, 5)
          : cityStreet(a, fixed, b, fixed, 5);
  }
  const gridX = [
      -410, -380, -350, -324, -280, -250, -220, -190, -164, -143, -115, -87,
      -59, -29, -5, 25, 62, 98, 130, 160,
    ],
    gridZ = [
      -540, -510, -490, -460, -435, -410, -385, -360, -334, -308, -282, -256,
      -230, -207, -191, -159, -144, -106, -80, -40, 10, 40,
    ];
  for (const x of gridX) gridStreet(x, -555, 60, true);
  for (const z of gridZ) gridStreet(z, -430, 180, false);
  // Downtown blocks and connected venue perimeter streets.
  for (let x = Math.floor(sxMin / 20) * 20; x <= sxMax + 8; x += 20)
    cityStreet(x, szMin - 5, x, szMax + 5, 4);
  for (let z = Math.floor(szMin / 20) * 20; z <= szMax + 8; z += 20)
    cityStreet(sxMin - 5, z, sxMax + 5, z, 4);
  cityStreet(62, -159, 62, -101, 5, "CRAWFORD ST");
  cityStreet(98, -159, 98, -101, 5, "HAMILTON ST");
  cityStreet(60, -106, 100, -106, 5, "PRESTON ST");
  cityStreet(60, -144, 100, -144, 5, "TEXAS AVE");
  cityStreet(58, -210, 58, -155, 5, "LA BRANCH ST");
  cityStreet(98, -210, 98, -155, 5, "JACKSON ST");
  cityStreet(49, -159, 100, -159, 5, "POLK ST");
  cityStreet(49, -191, 100, -191, 5, "BELL ST");
  cityStreet(49, -207, 100, -207, 5, "LEELAND ST");
  // Reliant Park perimeter and routes extending into the Medical Center and the South Loop.
  for (const x of [-190, -22]) cityStreet(x, -490, x, -316, 6);
  for (const z of [-316, -490])
    cityStreet(
      -190,
      z,
      -22,
      z,
      6,
      z === -316 ? "OLD SPANISH TRAIL" : "SOUTH LOOP FRONTAGE",
    );
  for (const [x, a, b] of [
    [-143, -342, -316],
    [-143, -490, -460],
    [-59, -342, -316],
    [-59, -490, -460],
    [-164, -331, -316],
    [-164, -490, -471],
  ])
    cityStreet(
      x,
      a,
      x,
      b,
      8,
      x === -143 ? "KIRBY DR" : x === -59 ? "FANNIN ST" : "S MAIN ST",
    );
  cityStreet(-143, -316, -143, -230, 8, "KIRBY DR");
  cityStreet(-59, -316, -59, -230, 8, "FANNIN ST");
  // Uptown: tower, Waterwall park, Galleria to the west, Post Oak and Sage on either side.
  cityStreet(-324, -230, -324, -132, 7, "SAGE RD");
  cityStreet(-280, -230, -280, -132, 8, "POST OAK BLVD");
  cityStreet(-380, -132, -250, -132, 8, "WESTHEIMER RD");
  cityStreet(-380, -159, -250, -159, 7, "WEST ALABAMA ST");
  cityStreet(-380, -217, -250, -217, 6, "HIDALGO ST");
  cityStreet(-410, -230, 60, -230, 8, "RICHMOND AVE");
  cityStreet(-29, 12, 25, 12, 6, "RECORD SHOP");
  // Preserve the complete archive-street approach, its cross street, and the shop service lot.
  planRoads.push(
    { x: 0, z: -57, w: 520, d: 7, rail: true },
    { x: 6.65, z: -56.5, w: 21, d: 97 },
    { x: 6.65, z: -41, w: 95, d: 16 },
  );
  planBuildings.push(
    { x: 0, z: 22, w: 29, d: 25 },
    { x: -12.5, z: -15, w: 18, d: 15 },
    { x: 0, z: 0, w: 18, d: 13 },
    { x: 14, z: 0, w: 12, d: 13 },
  );
  for (let side = 0; side < 2; side++)
    for (let i = 0; i < 6; i++) {
      if (i === 2 || (!side && (i === 0 || i === 4)) || (side && i === 3))
        continue;
      planBuildings.push({
        x: side ? 23.5 : -10.2,
        z: -16 - i * 12,
        w: 9.1,
        d: 8,
      });
    }
  // Broad, joined freeway surfaces: multi-lane decks, concrete barriers, shoulders, piers and entrance ramps.
  function freeway(points, width, name, lanes = 3) {
    const curve = new T.CatmullRomCurve3(
        points.map((p) => new T.Vector3(...p)),
        false,
        "centripetal",
      ),
      samples = curve.getPoints(
        Math.max(80, Math.ceil(curve.getLength() / 2.5)),
      ),
      verts = [],
      uv = [],
      indices = [];
    for (let i = 0; i < samples.length; i++) {
      const p = samples[i],
        t = curve.getTangent(i / (samples.length - 1)),
        n = new T.Vector3(-t.z, 0, t.x).normalize();
      for (const side of [-1, 1]) {
        const q = p.clone().addScaledVector(n, (side * width) / 2);
        verts.push(q.x, q.y, q.z);
        uv.push((side + 1) / 2, i / 7);
      }
      if (i < samples.length - 1) {
        const j = i * 2;
        indices.push(j, j + 2, j + 1, j + 1, j + 2, j + 3);
      }
      if (i > 0) planCurves.push({ a: samples[i - 1], b: p, width: width + 3 });
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.Float32BufferAttribute(verts, 3));
    geo.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    const m = asphalt.clone();
    m.side = T.DoubleSide;
    const road = new T.Mesh(geo, m);
    road.receiveShadow = true;
    world.add(road);
    for (let i = 1; i < samples.length; i++) {
      const p = samples[i - 1],
        q = samples[i],
        t = q.clone().sub(p),
        len = t.length(),
        n = new T.Vector3(-t.z, 0, t.x).normalize(),
        yaw = Math.atan2(t.x, t.z),
        mid = p.clone().add(q).multiplyScalar(0.5);
      const archiveMerge =
        mid.y < 1 && mid.x > -6 && mid.x < 19 && mid.z < -40 && mid.z > -92;
      for (const side of [-1, 1])
        if (!archiveMerge)
          cityBox(
            0.25,
            0.7,
            len + 0.08,
            cityCurb,
            mid.x + n.x * side * (width / 2 - 0.15),
            mid.y + 0.32,
            mid.z + n.z * side * (width / 2 - 0.15),
            yaw,
          );
      if (!archiveMerge)
        cityBox(
          0.22,
          0.55,
          len + 0.08,
          cityCurb,
          mid.x,
          mid.y + 0.26,
          mid.z,
          yaw,
        );
      if (i % 2 === 0)
        for (const side of [-1, 1])
          for (let lane = 1; lane < lanes; lane++) {
            const offset = side * ((width / 2 / lanes) * lane);
            cityBox(
              0.065,
              0.014,
              1.8,
              cityPaint,
              mid.x + n.x * offset,
              mid.y + 0.025,
              mid.z + n.z * offset,
              yaw,
            );
          }
      if (i % 10 === 0 && mid.y > 1.5) {
        for (const side of [-1, 1]) {
          const xx = mid.x + n.x * side * (width / 2 - 1),
            zz = mid.z + n.z * side * (width / 2 - 1);
          if (
            !planRoads.some((r) =>
              rectIntersects({ x: xx, z: zz, w: 1.5, d: 1.5 }, r, 0.6),
            ) &&
            !planBuildings.some((b) =>
              rectIntersects({ x: xx, z: zz, w: 1.5, d: 1.5 }, b, 0.5),
            )
          )
            cityBox(0.8, mid.y, 1.1, cityCurb, xx, mid.y / 2, zz, yaw);
        }
      }
      if (i % 13 === 0) {
        cityBox(0.09, 5, 0.09, cityCurb, mid.x, mid.y + 2.7, mid.z);
        cityBox(2.1, 0.08, 0.08, cityCurb, mid.x, mid.y + 5.2, mid.z);
        for (const side of [-1, 1])
          cityBox(
            0.55,
            0.07,
            0.3,
            urbanAmber,
            mid.x + side * 0.8,
            mid.y + 5.18,
            mid.z,
          );
      }
    }
    if (name) {
      const p = curve.getPoint(0.55);
      label(name, 12, 1.35, p.x, p.y + 4.1, p.z, "#eef1db", "#225948", 85);
    }
    return curve;
  }
  freeway(
    [
      [-440, 5.3, -40],
      [-300, 5.3, -40],
      [-150, 5.3, -40],
      [0, 5.3, -40],
      [190, 5.3, -40],
    ],
    14,
    "I-10 / KATY FREEWAY",
  );
  freeway(
    [
      [65, 0.13, 70],
      [52, 0.13, 5],
      [36, 0.13, -28],
      [6.65, 0.13, -46],
      [6.65, 0.13, -72],
      [-92, 0.13, -110],
      [-105, 0.13, -175],
      [-98, 0.13, -235],
      [-35, 0.13, -265],
      [43, 0.13, -285],
      [180, 0.13, -340],
    ],
    16,
    "I-45 / GULF FREEWAY",
  );
  freeway(
    [
      [112, 4.3, 40],
      [112, 4.3, -100],
      [112, 4.3, -195],
      [85, 4.3, -268],
      [-60, 4.3, -285],
      [-230, 4.3, -285],
      [-325, 4.3, -278],
      [-440, 4.3, -350],
    ],
    16,
    "I-69 / US 59 / SOUTHWEST FREEWAY",
  );
  freeway(
    [
      [-370, 3.1, 90],
      [-370, 3.1, -160],
      [-370, 3.1, -390],
      [-340, 3.1, -500],
      [-200, 3.1, -510],
      [-40, 3.1, -510],
      [100, 3.1, -490],
      [165, 3.1, -400],
      [165, 3.1, -220],
      [165, 3.1, 90],
      [-100, 3.1, 90],
      [-370, 3.1, 90],
    ],
    16,
    "I-610 / SOUTH LOOP",
  );
  freeway(
    [
      [18, 0.12, -242],
      [0, 0.12, -310],
      [0, 0.12, -420],
      [0, 0.12, -560],
    ],
    13,
    "SH 288 / SOUTH FREEWAY",
  );
  // Ramps change height gradually and meet the through lanes rather than ending in midair.
  freeway(
    [
      [65, 0.13, -8],
      [57, 1, -20],
      [43, 3.2, -34],
      [8, 5.3, -40],
      [-30, 5.3, -40],
    ],
    4.2,
    "",
    1,
  );
  freeway(
    [
      [-105, 0.13, -191],
      [-94, 1.5, -226],
      [-70, 4.3, -270],
      [-25, 4.3, -285],
    ],
    4.2,
    "",
    1,
  );
  freeway(
    [
      [-143, 0.08, -480],
      [-150, 1.5, -498],
      [-180, 3.1, -510],
      [-220, 3.1, -510],
    ],
    4.2,
    "",
    1,
  );
  freeway(
    [
      [-59, 0.08, -480],
      [-51, 1.3, -496],
      [-24, 3.1, -510],
      [12, 3.1, -510],
    ],
    4.2,
    "",
    1,
  );
  // Finish the junctions: sidewalks stop at cross streets, and lane dashes leave intersections clear.
  for (const r of planRoads) {
    if (r.x1 === undefined) continue;
    const dx = r.x2 - r.x1,
      dz = r.z2 - r.z1,
      len = Math.hypot(dx, dz),
      a = Math.atan2(dx, dz),
      nx = Math.cos(a),
      nz = -Math.sin(a);
    function covered(x, z) {
      return planRoads.some(
        (other) =>
          other !== r &&
          !other.rail &&
          rectIntersects({ x, z, w: 0.9, d: 0.9 }, other, 0.12),
      );
    }
    if (r.sidewalk)
      for (let t = 0.6; t < len; t += 1.2) {
        const u = t / len;
        for (const side of [-1, 1]) {
          const x = r.x1 + dx * u + nx * side * (r.width / 2 + 0.7),
            z = r.z1 + dz * u + nz * side * (r.width / 2 + 0.7);
          if (!covered(x, z))
            cityBox(1.4, 0.13, 1.2, cityCurb, x, -0.005, z, a);
        }
      }
    for (let t = 2; t < len - 1; t += 5) {
      const u = t / len,
        x = r.x1 + dx * u,
        z = r.z1 + dz * u;
      const crossing = planRoads.some(
        (o) =>
          o !== r &&
          !o.rail &&
          o.d > o.w !== r.d > r.w &&
          rectIntersects({ x, z, w: 0.4, d: 0.4 }, o, 1.4),
      );
      if (!crossing) cityBox(0.075, 0.012, 2, cityPaint, x, 0.016, z, a);
    }
  }
  // The Waterwall's lawn is an intentional park rather than empty terrain.
  cityBox(23, 0.08, 26, mat("#385b48"), -295, -0.02, -200);
  cityBox(3, 0.09, 22, cityCurb, -295, 0.015, -200);
  // Immediate Transco neighbors: the Waterwall, Galleria complex and Post Oak street arches.
  // Relative placement follows Hines / Uptown / Simon references; distances remain compressed.
  const uptownStone = mat("#b9b5a5", { roughness: 0.9 }),
    uptownSilver = mat("#c4d0d4", { metalness: 0.7, roughness: 0.3 });
  // Hines Waterwall: north-facing semicircle, dark cascade, limestone piers and shallow reflecting basin.
  const wwX = -295,
    wwZ = -204.5,
    wwR = 4.2,
    wwH = 3.7;
  const wc = document.createElement("canvas");
  wc.width = 512;
  wc.height = 1024;
  const wq = wc.getContext("2d");
  wq.fillStyle = "#344d52";
  wq.fillRect(0, 0, 512, 1024);
  for (let i = 0; i < 2600; i++) {
    wq.fillStyle = i % 3 ? "#adc2bc66" : "#ecf0db77";
    wq.fillRect(
      rand() * 512,
      rand() * 1024,
      0.4 + rand() * 1.6,
      4 + rand() * 50,
    );
  }
  const waterTexture = new T.CanvasTexture(wc);
  waterTexture.colorSpace = T.SRGBColorSpace;
  waterTexture.wrapT = T.RepeatWrapping;
  waterTexture.repeat.y = 2;
  const cascadeMat = mat("#bdcccc", {
    map: waterTexture,
    metalness: 0.2,
    roughness: 0.4,
    side: T.DoubleSide,
    emissive: "#829d9e",
    emissiveIntensity: 0.15,
  });
  for (const [radius, material] of [
    [wwR, uptownStone],
    [wwR - 0.13, cascadeMat],
  ]) {
    const wall = new T.Mesh(
      new T.CylinderGeometry(
        radius,
        radius,
        wwH,
        64,
        1,
        true,
        Math.PI / 2,
        Math.PI,
      ),
      material,
    );
    wall.position.set(wwX, wwH / 2, wwZ);
    world.add(wall);
  }
  for (const y of [0.15, wwH]) {
    const rim = new T.Mesh(
      new T.TorusGeometry(wwR, 0.13, 8, 64, Math.PI),
      uptownStone,
    );
    rim.rotation.x = -Math.PI / 2;
    rim.position.set(wwX, y, wwZ);
    world.add(rim);
  }
  for (const side of [-1, 1]) {
    box(
      0.55,
      wwH + 0.2,
      0.65,
      uptownStone,
      wwX + side * wwR,
      (wwH + 0.2) / 2,
      wwZ,
    );
    box(0.8, 0.16, 0.9, uptownStone, wwX + side * wwR, wwH + 0.2, wwZ);
  }
  const basin = new T.Mesh(
    new T.CircleGeometry(4.05, 64),
    mat("#688d91", { metalness: 0.45, roughness: 0.25 }),
  );
  basin.rotation.x = -Math.PI / 2;
  basin.position.set(wwX, 0.08, wwZ - 0.8);
  basin.scale.y = 0.65;
  world.add(basin);
  box(9.6, 0.1, 6, uptownStone, wwX, -0.02, wwZ);
  box(8.8, 0.04, 5.4, mat("#607f80"), wwX, 0.045, wwZ);
  // The park's twin oak allées and pale walking paths run from the tower to the fountain.
  for (const x of [-304, -286])
    cityBox(1.1, 0.06, 22, cityPaving, x, 0.03, -200);
  for (const z of [-191, -211])
    cityBox(19, 0.06, 1.1, cityPaving, -295, 0.03, z);
  const oakLocations = [];
  for (let row = 0; row < 2; row++)
    for (const side of [-1, 1])
      for (let j = 0; j < 7; j++) {
        const x = -295 + side * (6.4 + row * 2),
          z = -192 - j * 2.7;
        cityBox(0.16, 1.4, 0.16, cityBark, x, 0.7, z);
        oakLocations.push([x, z]);
      }
  const oakCrowns = new T.InstancedMesh(
    new T.IcosahedronGeometry(1, 2),
    mat("#315a44", { roughness: 1 }),
    oakLocations.length,
  );
  oakLocations.forEach(([x, z], i) => {
    urbanDummy.position.set(x, 1.95, z);
    urbanDummy.scale.set(1.35, 0.85, 1.3);
    urbanDummy.rotation.set(0, i * 0.73, 0);
    urbanDummy.updateMatrix();
    oakCrowns.setMatrixAt(i, urbanDummy.matrix);
  });
  world.add(oakCrowns);
  for (const side of [-1, 1])
    for (const z of [-194, -200, -207]) {
      cityBox(1.5, 0.15, 0.45, wood, -295 + side * 4.7, 0.5, z);
      for (const dx of [-0.5, 0.5])
        cityBox(0.08, 0.45, 0.3, cityBlack, -295 + side * 4.7 + dx, 0.22, z);
    }
  // Two stainless arches span Post Oak near the West Alabama approach, with slender curved streetlights.
  const archZ = -151,
    archX = -280;
  for (const offset of [-0.38, 0.38]) {
    const path = new T.QuadraticBezierCurve3(
      new T.Vector3(archX - 6.2, 0.15, archZ + offset),
      new T.Vector3(archX, 11.1, archZ + offset),
      new T.Vector3(archX + 6.2, 0.15, archZ + offset),
    );
    world.add(
      new T.Mesh(new T.TubeGeometry(path, 64, 0.105, 10, false), uptownSilver),
    );
    for (const side of [-1, 1])
      box(
        0.6,
        0.18,
        0.7,
        uptownStone,
        archX + side * 6.2,
        0.07,
        archZ + offset,
      );
  }
  for (const z of [-138, -169]) {
    const x = archX + 5.4;
    box(0.07, 8.2, 0.07, uptownSilver, x, 4.1, z);
    const arm = new T.QuadraticBezierCurve3(
      new T.Vector3(x, 5.8, z),
      new T.Vector3(x - 1, 8.7, z),
      new T.Vector3(x - 6, 8.4, z),
    );
    world.add(
      new T.Mesh(new T.TubeGeometry(arm, 24, 0.07, 8, false), uptownSilver),
    );
    box(0.9, 0.06, 0.3, urbanAmber, x - 6, 8.4, z);
  }
  // Galleria frontage west of the tower and the two immediate towers across West Alabama.
  cityBox(32, 6, 12, uptownStone, -346, 3, -170);
  cityBox(28, 0.2, 6, cityRoof, -346, 6.12, -170);
  for (let j = 0; j < 12; j++)
    cityBox(1.6, 2.6, 0.12, venueGlass, -359 + j * 2.35, 2.6, -163.94);
  label("THE GALLERIA", 19, 1, -346, 4.9, -163.8, "#303b3f", "#e1d9c4", 100);
  function uptownNeighbor(x, z, w, d, h, name) {
    planBuildings.push({ x, z, w, d });
    cityBox(w, h, d, uptownStone, x, h / 2, z);
    for (const side of [-1, 1]) {
      for (let j = 0; j < Math.floor(w / 1.05); j++)
        cityBox(
          0.65,
          h - 1.2,
          0.05,
          venueGlass,
          x - w / 2 + 0.6 + j * 1.05,
          h / 2,
          z + side * (d / 2 + 0.04),
        );
      for (let floor = 1; floor < h; floor += 0.85)
        cityBox(
          w,
          0.09,
          0.08,
          uptownStone,
          x,
          floor,
          z + side * (d / 2 + 0.08),
        );
    }
    cityBox(w + 0.25, 0.3, d + 0.25, cityRoof, x, h + 0.15, z);
    const sign = label(
      name,
      w - 0.5,
      0.7,
      x,
      1.2,
      z - d / 2 - 0.13,
      "#eee9d9",
      "#364648",
      80,
    );
    sign.rotation.y = Math.PI;
  }
  uptownNeighbor(-338, -146, 12, 13, 19, "WESTIN GALLERIA");
  uptownNeighbor(-296, -146, 10, 13, 18, "GALLERIA TOWER I");

  // Shared shop facades: masonry, lit display windows, recessed doors, own-label shop signs and upper floors.
  const shopMaterials = [];
  for (let theme = 0; theme < 8; theme++) {
    const c = document.createElement("canvas"),
      e = document.createElement("canvas");
    c.width = e.width = 512;
    c.height = e.height = 512;
    const q = c.getContext("2d"),
      eq = e.getContext("2d");
    q.fillStyle = [
      "#865d4d",
      "#a69a85",
      "#6e7d80",
      "#8f795c",
      "#6e6662",
      "#88665d",
      "#84918e",
      "#616d78",
    ][theme];
    q.fillRect(0, 0, 512, 512);
    eq.fillStyle = "#000";
    eq.fillRect(0, 0, 512, 512);
    q.strokeStyle = "#28353b55";
    q.lineWidth = 2;
    for (let y = 0; y < 512; y += 18) {
      q.beginPath();
      q.moveTo(0, y);
      q.lineTo(512, y);
      q.stroke();
      for (let x = ((y / 18) % 2) * 20; x < 512; x += 40)
        q.strokeRect(x, y, 40, 18);
    }
    for (let row = 0; row < 4; row++)
      for (let col = 0; col < 5; col++) {
        const x = 15 + col * 101,
          y = 20 + row * 104;
        q.fillStyle = "#203943";
        q.fillRect(x, y, 75, 76);
        q.fillStyle = "#a2b5b6";
        q.fillRect(x + 36, y, 3, 76);
        q.fillRect(x, y + 36, 75, 3);
        if ((row + col + theme) % 3 !== 0) {
          eq.fillStyle = (row + col) % 3 ? "#a5733b" : "#d8b77f";
          eq.fillRect(x + 3, y + 3, 68, 70);
        }
      }
    q.fillStyle = "#1c393c";
    q.fillRect(0, 416, 512, 96);
    eq.fillStyle = "#a68b52";
    eq.fillRect(10, 445, 490, 58);
    q.fillStyle = ["#a14c37", "#35584b", "#284d60"][theme % 3];
    q.fillRect(0, 418, 512, 30);
    q.fillStyle = "#f1e6cf";
    q.font = "bold 21px Arial";
    q.textAlign = "center";
    q.fillText(
      [
        "HOUSTON MADE",
        "CORNER MARKET",
        "RECORDS & TAPES",
        "COFFEE / OPEN LATE",
        "THIRD COAST",
        "BARBER SHOP",
        "BAYOU GOODS",
        "HOUSTON SUPPLY",
      ][theme],
      256,
      440,
    );
    for (let j = 0; j < 5; j++) {
      q.fillStyle = "#142e33";
      q.fillRect(16 + j * 100, 454, 78, 53);
      q.fillStyle = "#d3bd81";
      q.fillRect(24 + j * 100, 462, 9, 40);
    }
    const t = new T.CanvasTexture(c),
      et = new T.CanvasTexture(e);
    t.colorSpace = et.colorSpace = T.SRGBColorSpace;
    t.anisotropy = et.anisotropy = Math.min(
      4,
      renderer.capabilities.getMaxAnisotropy(),
    );
    shopMaterials.push(
      mat("#ddd8cf", {
        map: t,
        emissiveMap: et,
        emissive: "#ffd198",
        emissiveIntensity: 0.45,
        roughness: 0.8,
      }),
    );
  }
  function distanceSegment(x, z, a, b) {
    const dx = b.x - a.x,
      dz = b.z - a.z,
      u = Math.max(
        0,
        Math.min(
          1,
          ((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz || 1),
        ),
      );
    return Math.hypot(x - a.x - dx * u, z - a.z - dz * u);
  }
  function parcelClear(r, allowDowntown = false) {
    if (
      protectedBlocks.some(
        (b) =>
          !(allowDowntown && b === skylineBounds) && rectIntersects(r, b, 1),
      )
    )
      return false;
    if (planRoads.some((b) => rectIntersects(r, b, 1.8))) return false;
    if (planBuildings.some((b) => rectIntersects(r, b, 1.2))) return false;
    const rad = Math.hypot(r.w, r.d) / 2;
    return !planCurves.some(
      (c) => distanceSegment(r.x, r.z, c.a, c.b) < c.width / 2 + rad + 1,
    );
  }
  function cityBuilding(x, z, w, d, h, theme, allowDowntown = false) {
    const r = { x, z, w, d, generated: true };
    if (!parcelClear(r, allowDowntown)) return false;
    planBuildings.push(r);
    cityBox(w + 3, 0.015, d + 3, urbanContact, x, 0.049, z);
    cityBox(w + 1, 0.12, d + 1, cityPaving, x, -0.02, z);
    cityBox(w, h, d, shopMaterials[theme % 8], x, h / 2, z);
    cityBox(w + 0.15, 0.18, d + 0.15, cityRoof, x, h + 0.09, z);
    cityBox(w - 0.5, 0.22, 0.14, cityCurb, x, h + 0.25, z + d / 2 - 0.15);
    cityBox(1.3, 0.45, 1.4, cityBlack, x + 0.5, h + 0.42, z);
    return true;
  }
  let downtownInfill = 0;
  for (let x = sxMin + 6; x < sxMax - 6; x += 12)
    for (let z = szMin + 6; z < szMax - 6; z += 13) {
      if (
        cityBuilding(
          x,
          z,
          5.8,
          6.6,
          3.5 + rand() * 3.5,
          (downtownInfill + 2) % 8,
          true,
        )
      )
        downtownInfill++;
    }

  // Dense parcels fill each street block. Rejected plots become setback space, never road obstructions.
  for (let ix = 0; ix < gridX.length - 1; ix++)
    for (let iz = 0; iz < gridZ.length - 1; iz++) {
      const xa = gridX[ix] + 5,
        xb = gridX[ix + 1] - 5,
        za = gridZ[iz] + 5,
        zb = gridZ[iz + 1] - 5;
      if (xb - xa < 7 || zb - za < 7) continue;
      const nx = Math.max(1, Math.floor((xb - xa) / 12)),
        nz = Math.max(1, Math.floor((zb - za) / 12));
      for (let a = 0; a < nx; a++)
        for (let b = 0; b < nz; b++) {
          const dx = (xb - xa) / nx,
            dz = (zb - za) / nz,
            x = xa + dx * (a + 0.5),
            z = za + dz * (b + 0.5),
            downtown = x > -60 && x < 55 && z < -100 && z > -165;
          cityBuilding(
            x,
            z,
            Math.min(11, dx - 2),
            Math.min(12, dz - 2),
            downtown ? 12 + rand() * 14 : 3 + rand() * 7,
            (ix + iz + a + b) % 8,
          );
        }
    }
  // Small street-facing shops close the leftover perimeter slots immediately beside each venue.
  for (const [x, z, w, d, h] of [
    [50, -120, 8, 10, 6],
    [50, -145, 8, 9, 5],
    [109, -126, 8, 10, 7],
    [77, -153, 9, 6, 5],
    [48, -176, 8, 11, 7],
    [103, -175, 8, 11, 6],
    [75, -201, 10, 8, 6],
    [-264, -185, 10, 12, 8],
    [-310, -227, 12, 8, 5],
    [-308, -148, 10, 9, 5],
    [-173, -351, 8, 10, 4],
    [-173, -378, 8, 10, 5],
    [-173, -421, 8, 12, 5],
    [-173, -450, 8, 10, 4],
    [-12, -356, 8, 12, 5],
    [-12, -391, 8, 12, 5],
    [-12, -430, 8, 12, 4],
  ])
    cityBuilding(x, z, w, d, h, Math.floor(rand() * 8));
  // A low Galleria mass west of the Waterwall establishes the actual Uptown relationship.
  for (const [x, z, w, d, h] of [
    [-346, -187, 32, 31, 6],
    [-345, -178, 22, 15, 8],
  ]) {
    cityBox(w, h, d, shopMaterials[1], x, h / 2, z);
    cityBox(w + 0.3, 0.24, d + 0.3, cityRoof, x, h + 0.12, z);
  }
  // Vacant freeway-edge parcels become marked parking courts rather than blank terrain.
  const parkingBody = mat("#45535a", { metalness: 0.25, roughness: 0.6 }),
    parkingWindow = mat("#1f353e");
  let surfaceLots = 0;
  for (let ix = 0; ix < gridX.length - 1; ix++)
    for (let iz = 0; iz < gridZ.length - 1; iz++) {
      const xa = gridX[ix] + 5,
        xb = gridX[ix + 1] - 5,
        za = gridZ[iz] + 5,
        zb = gridZ[iz + 1] - 5;
      for (let x = xa + 4; x < xb - 3; x += 9)
        for (let z = za + 5; z < zb - 4; z += 11) {
          const r = { x, z, w: 7.5, d: 9 };
          if (
            protectedBlocks.some((b) => rectIntersects(r, b, 0.7)) ||
            planRoads.some((b) => rectIntersects(r, b, 1)) ||
            planBuildings.some((b) => rectIntersects(r, b, 1))
          )
            continue;
          if (
            planCurves.some(
              (c) =>
                c.a.y < 1.4 &&
                distanceSegment(x, z, c.a, c.b) < c.width / 2 + 6,
            )
          )
            continue;
          cityBox(7.5, 0.05, 9, asphalt, x, -0.035, z);
          for (let j = 0; j < 4; j++) {
            cityBox(0.045, 0.012, 4, cityPaint, x - 3 + j * 2, 0.008, z - 1.8);
            if ((ix + iz + j) % 4 === 0) {
              cityBox(
                1.35,
                0.5,
                3.2,
                parkingBody,
                x - 2 + j * 2,
                0.35,
                z - 1.8,
              );
              cityBox(
                1.05,
                0.3,
                1.45,
                parkingWindow,
                x - 2 + j * 2,
                0.75,
                z - 1.6,
              );
            }
          }
          surfaceLots++;
        }
    }
  // Trees, lamp standards, stop bars and parked cars belong on the sidewalks and setbacks.
  const treePositions = [];
  for (const r of planRoads) {
    if (r.d > r.w) {
      for (let z = r.z - r.d / 2 + 5; z < r.z + r.d / 2 - 4; z += 16)
        for (const side of [-1, 1]) {
          const x = r.x + side * (r.w / 2 + 2.3);
          if (
            !planBuildings.some((b) =>
              rectIntersects({ x, z, w: 3, d: 3 }, b, 0.2),
            )
          )
            treePositions.push([x, z]);
        }
    }
  }
  const leavesGeo = new T.IcosahedronGeometry(1, 1),
    treeCrowns = new T.InstancedMesh(
      leavesGeo,
      cityLeaves,
      treePositions.length,
    );
  treePositions.forEach(([x, z], i) => {
    cityBox(0.18, 2.2, 0.18, cityBark, x, 1.1, z);
    urbanDummy.position.set(x, 2.7, z);
    urbanDummy.rotation.set(0, i, 0);
    urbanDummy.scale.set(1.55, 0.8, 1.25);
    urbanDummy.updateMatrix();
    treeCrowns.setMatrixAt(i, urbanDummy.matrix);
  });
  world.add(treeCrowns);
  for (const r of planRoads.filter((r) => r.d > 25 && r.w < 12)) {
    for (let z = r.z - r.d / 2 + 8; z < r.z + r.d / 2 - 6; z += 28) {
      const x = r.x + r.w / 2 + 0.65;
      cityBox(0.07, 5, 0.07, cityBlack, x, 2.5, z);
      cityBox(1, 0.07, 0.1, cityBlack, x - 0.45, 5, z);
      cityBox(0.55, 0.06, 0.25, urbanAmber, x - 0.8, 5, z);
    }
  }
  // Flush repeated geometry into instanced draws; background density does not create thousands of draw calls.
  for (const [material, matrices] of urbanBatches) {
    const mesh = new T.InstancedMesh(unitCityBox, material, matrices.length);
    matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.receiveShadow = true;
    mesh.computeBoundingSphere();
    world.add(mesh);
  }
  const campusBuildings = [
    [-95, 66, 31.4, 46],
    [-77, 23, 40, 15.6],
    [-64, 108.5, 24, 14],
    [-66, 66, 24, 24],
    [-139, 24, 8, 10],
    [-139, 51, 8, 13],
    [-139, 85, 8, 11],
    [-139, 98, 8, 10],
    [-28, 25, 8, 17],
    [-28, 52, 8, 12],
    [-28, 88, 8, 17],
    [-78, 148, 23, 6],
  ].map(([x, z, w, d]) => ({ x: x - 15, z: -334 - z, w, d }));
  const campusConflicts = campusBuildings.filter((b) =>
    planRoads.some((r) => rectIntersects(b, r, 0.02)),
  ).length;
  const conflicts = planBuildings.filter(
    (b) => b.generated && planRoads.some((r) => rectIntersects(b, r, 0.05)),
  ).length;
  canvas.dataset.cityAudit = JSON.stringify({
    parcels: planBuildings.length,
    streets: planRoads.length,
    parkingCourts: surfaceLots,
    generatedRoadConflicts: conflicts,
    campusRoadConflicts: campusConflicts,
    skylineRoadConflicts: skylineTowerFootprints.filter((b) =>
      planRoads.some((r) => rectIntersects(b, r, 0.05)),
    ).length,
    namedSkylineBuildings: skylineInventory.length,
    downtownInfill,
    skylineFreewayConflictNames: skylineTowerFootprints
      .filter((b) =>
        planCurves.some(
          (c) =>
            distanceSegment(b.x, b.z, c.a, c.b) <
            c.width / 2 + Math.hypot(b.w, b.d) / 2,
        ),
      )
      .map((b) => b.name),
    skylineFreewayConflicts: skylineTowerFootprints.filter((b) =>
      planCurves.some(
        (c) =>
          distanceSegment(b.x, b.z, c.a, c.b) <
          c.width / 2 + Math.hypot(b.w, b.d) / 2,
      ),
    ).length,
  });
  console.info(
    "Houston city plan: " +
      planBuildings.length +
      " building parcels, " +
      planRoads.length +
      " connected street segments; " +
      conflicts +
      " generated building / road conflicts.",
  );

  // The room is a cutaway indoors. Outside, the same footprint has a complete street-facing shop front.
  const shopExteriorStart = world.children.length;
  box(29, 0.08, 18, concrete, 0, -0.03, 25);
  for (let i = 0; i < 7; i++)
    box(0.05, 0.012, 4.8, limestone, -12 + i * 4, 0.025, 22);
  box(18, 0.35, 14, mat("#6a6b5e"), 0, 6.9, 0);
  box(18, 1.1, 0.45, architecturalBrick, 0, 6.12, 6.65);
  for (const x of [-8.7, 8.7]) {
    box(0.5, 6.1, 13.5, architecturalBrick, x, 3, 0);
    box(0.7, 0.2, 13.8, limestone, x, 6.15, 0);
  }
  for (const x of [-7.2, 7.2])
    box(3, 5.8, 0.45, architecturalBrick, x, 2.9, 6.7);
  box(11.8, 1.7, 0.4, architecturalBrick, 0, 4.95, 6.7);
  box(11.7, 0.22, 0.5, limestone, 0, 4.05, 6.7);
  const storefrontGlass = mat("#274b4e", {
    metalness: 0.4,
    roughness: 0.25,
    transparent: true,
    opacity: 0.7,
    emissive: "#af9156",
    emissiveIntensity: 0.15,
  });
  for (const x of [-4.2, 4.2]) {
    box(4.6, 3.1, 0.08, storefrontGlass, x, 2.05, 6.92);
    for (const y of [0.5, 2, 3.55])
      box(4.7, 0.055, 0.12, roofSteel, x, y, 6.98);
    for (const dx of [-2.3, 0, 2.3])
      box(0.055, 3.15, 0.12, roofSteel, x + dx, 2.05, 6.98);
  }
  for (const x of [-0.72, 0.72]) {
    const entry = box(1.35, 3.25, 0.1, storefrontGlass, x, 1.75, 6.96);
    hit(entry, "Enter ABN Records, CDs and Tapes", () => go(0));
    box(0.07, 3.3, 0.14, roofSteel, x - 0.69, 1.75, 7.01);
    box(0.04, 0.55, 0.11, limestone, x + (x < 0 ? 0.45 : -0.45), 1.65, 7.05);
  }
  box(3, 0.1, 0.2, roofSteel, 0, 3.43, 6.98);
  const shopAwning = box(12, 0.12, 2.2, mat("#8b3e2e"), 0, 4.04, 7.35);
  shopAwning.rotation.x = 0.08;
  abnMark(2.1, -6.2, 5.08, 6.98);
  label(
    "ABN RECORDS, CDs AND TAPES",
    11.5,
    1.05,
    1.2,
    5.08,
    6.96,
    "#f0ddbc",
    "#843528",
    75,
  );
  label(
    "THA TRUTH & NOTHING BUT THA TRUTH",
    11.8,
    0.45,
    0,
    3.78,
    8.45,
    "#ead9b5",
    "#314f42",
    48,
  );
  box(19, 0.18, 3, concrete, 0, -0.01, 8.4);
  for (let j = 0; j < 9; j++)
    box(0.018, 0.014, 2.7, mat("#6e7770"), -8 + j * 2, 0.09, 8.4);
  for (const x of [-7.8, 7.8]) {
    box(0.08, 2, 0.08, roofSteel, x, 1, 7.4);
    box(1.1, 0.08, 0.8, glowMat("#edc68d", 0.6), x, 2.03, 7.4);
  }
  // Brick rear elevation and a lit back door identify the shop when returning from the city.
  for (const x of [-2, 8.3])
    box(x < 0 ? 12 : 0.9, 5.5, 0.16, architecturalBrick, x, 2.75, -6.25);
  label(
    "RECORD SHOP / BACK DOOR",
    4,
    0.6,
    5.7,
    4.65,
    -6.38,
    "#e4c896",
    "#304b3c",
    74,
  ).rotation.y = Math.PI;
  const shopExterior = new T.Group();
  world.children.slice(shopExteriorStart).forEach((o) => shopExterior.add(o));
  world.add(shopExterior);
  shopExterior.visible = false;
  twin("Record shop front entrance", () => go(0));

  // Functional city viewpoints keep the geographically separated landmarks easy to find.
  const cityViews = {
    skyline: { a: -Math.PI / 2 - 0.12, r: 165, e: 31, t: [-5, 20, -177] },
    downtown: { a: 0, r: 22, e: 3.4, t: [6.65, 6, -33] },
    bridge: { a: 0, r: 32, e: 18, t: [6.65, 8, -57] },
    transco: { a: Math.PI - 0.55, r: 88, e: 32, t: [-295, 26, -185] },
    waterwall: { a: 0.08, r: 12, e: 8, t: [-295, 1.8, -204] },
    galleria: { a: Math.PI - 0.45, r: 57, e: 32, t: [-329, 3, -167] },
    arches: { a: 0.1, r: 76, e: 3.5, t: [-284, 18, -185] },
    stadium: { a: Math.PI - 0.45, r: 68, e: 36, t: [-110, 4, -400] },
    dome: { a: Math.PI - 0.55, r: 34, e: 18, t: [-81, 3, -400] },
    ballpark: { a: Math.PI + 0.55, r: 45, e: 29, t: [80, 3, -125] },
    arena: { a: 0.6, r: 42, e: 24, t: [75, 2.5, -175] },
    court: { a: 0.4, r: 17, e: 23, t: [75, 1, -175] },
    shop: { a: 0.12, r: 25, e: 10, t: [0, 2.2, 4] },
    cars: { a: 2, r: 18, e: 10, t: [-12.4, 1, -15.5] },
    map: { a: Math.PI - 0.1, r: 260, e: 790, t: [-125, 0, -250] },
  };

  // Giving table: stylised map and eight warm pin lights.
  box(3.2, 0.2, 2.3, wood, -5.8, 1.45, 3.5);
  for (const x of [-7, -4.6]) box(0.16, 1.5, 0.16, dark, x, 0.7, 3.5);
  const mapCanvas = document.createElement("canvas");
  mapCanvas.width = 512;
  mapCanvas.height = 384;
  const mx = mapCanvas.getContext("2d");
  mx.fillStyle = "#a99e72";
  mx.fillRect(0, 0, 512, 384);
  mx.strokeStyle = "#d4c69f";
  mx.lineWidth = 8;
  for (let i = 0; i < 12; i++) {
    mx.beginPath();
    mx.moveTo(i * 55 - 120, 0);
    mx.lineTo(i * 55 + 80, 384);
    mx.stroke();
    mx.beginPath();
    mx.moveTo(0, i * 45);
    mx.lineTo(512, i * 45 - 150);
    mx.stroke();
  }
  mx.strokeStyle = "#2c5a46";
  mx.lineWidth = 13;
  mx.beginPath();
  mx.moveTo(0, 160);
  mx.bezierCurveTo(200, 0, 200, 380, 512, 200);
  mx.stroke();
  const mp = new T.Mesh(
    new T.PlaneGeometry(2.9, 2.05),
    new T.MeshStandardMaterial({ map: new T.CanvasTexture(mapCanvas) }),
  );
  mp.rotation.x = -Math.PI / 2;
  mp.position.set(-5.8, 1.56, 3.5);
  world.add(mp);
  hit(mp, "Houston giving map and community ledger", () => giving());
  data.giving.forEach((p, i) => {
    const pin = new T.Mesh(
      new T.SphereGeometry(0.075, 12, 8),
      new T.MeshStandardMaterial({
        color: "#ffc469",
        emissive: "#d9902b",
        emissiveIntensity: 1,
      }),
    );
    pin.position.set(
      -7 + ((Number(p.x) || i * 10) / 100) * 2.5,
      1.68,
      2.5 + ((Number(p.y) || i * 10) / 100) * 2,
    );
    world.add(pin);
    hit(pin, p.name, () => giving(i));
  });
  label(
    "ALL HEART. ALL HOUSTON.",
    3.1,
    0.4,
    -5.8,
    1,
    4.68,
    "#ded0a9",
    "#31513a",
    72,
  );
  // Lamps, rug, poster and doorway accents.
  box(7, 0.025, 3.7, mat("#753e2c"), -0.7, 0.005, 3.8);
  for (let i = 0; i < 10; i++)
    box(6.7, 0.008, 0.025, paper, -0.7, 0.025, 2.1 + i * 0.36);
  for (const x of [-5, 1, 6]) {
    box(0.025, 1.1, 0.025, dark, x, 6.6, -2.3);
    const lamp = new T.Mesh(
      new T.ConeGeometry(0.44, 0.25, 24, 1, true),
      mat("#b58339", { side: T.DoubleSide }),
    );
    lamp.position.set(x, 5.95, -2.3);
    world.add(lamp);
    const bulb = new T.Mesh(
      new T.SphereGeometry(0.13, 12, 8),
      new T.MeshBasicMaterial({ color: "#ffcf7b" }),
    );
    bulb.position.set(x, 5.8, -2.3);
    world.add(bulb);
  }
  const poster = label(
    "FOR THE PEOPLE",
    2,
    0.9,
    -8.32,
    5.65,
    0,
    "#d6c49a",
    "#9c3c29",
    90,
  );
  poster.rotation.y = Math.PI / 2;
  label("THE VAULT", 2, 0.5, 0, 4.6, -5.5, "#a59470", "#20251b", 100);
  const ghostMat = new T.MeshStandardMaterial({
    color: "#bfb38b",
    transparent: true,
    opacity: 0.1,
    depthWrite: false,
    roughness: 1,
  });
  for (let i = 0; i < 8; i++) {
    const group = new T.Group();
    const body = new T.Mesh(new T.CapsuleGeometry(0.2, 0.65, 4, 8), ghostMat);
    body.position.y = 0.9;
    const head = new T.Mesh(new T.SphereGeometry(0.15, 12, 8), ghostMat);
    head.position.y = 1.6;
    group.add(body, head);
    group.position.set(-6 + rand() * 12, 0, rand() * 5);
    group.userData = {
      x: group.position.x,
      z: group.position.z,
      phase: rand() * 7,
    };
    world.add(group);
    ghosts.push(group);
  }
  const positions = [
    { a: 0.23, r: 15.5, e: 6.7, t: [0, 2, 0] },
    { a: 0, r: 5.5, e: 4.6, t: [-14.5, 2.7, 0] },
    { a: -Math.PI / 2, r: 9.2, e: 3.1, t: [18.2, 3.05, -0.8] },
    { a: 0, r: 22, e: 3.4, t: [6.65, 6, -33] },
    { a: 0.5, r: 7.4, e: 5.7, t: [-5.5, 1.2, 3.4] },
    { a: 0.2, r: 7, e: 4.9, t: [4.4, 1.5, 1] },
  ];
  function audioPosition() {
    if (!panner || !ctx) return;
    const p = [
      [-4, 0, -3],
      [-5, 0, -1],
      [4, 0, -3],
      [3, 0, -5],
      [-3, 0, -2],
      [4, 0, -1],
    ][appState.station];
    panner.positionX.setTargetAtTime(p[0], ctx.currentTime, 0.1);
    panner.positionY.setTargetAtTime(p[1], ctx.currentTime, 0.1);
    panner.positionZ.setTargetAtTime(p[2], ctx.currentTime, 0.1);
  }
  let streetJourney = null;
  sceneAPI = {
    toggleBallparkRoof() {
      ballparkTarget = ballparkTarget > 0.5 ? 0 : 1;
      $("#ballpark-roof").textContent = ballparkTarget
        ? "Close ballpark roof"
        : "Open ballpark roof";
      $("#ballpark-roof").setAttribute("aria-pressed", String(!ballparkTarget));
      if (appState.calm) ballparkOpen = ballparkTarget;
    },
    toggleRoof() {
      roofTarget = roofTarget > 0.5 ? 0 : 1;
      $("#roof-toggle").textContent = roofTarget
        ? "Close roof"
        : "Retract roof";
      $("#roof-toggle").setAttribute("aria-pressed", Boolean(roofTarget));
      if (appState.calm) roofOpen = roofTarget;
    },
    stadiumView(view) {
      $$("[data-stadium-view]").forEach((b) =>
        b.classList.toggle("active", b.dataset.stadiumView === view),
      );
      const v = {
        exterior: { a: Math.PI - 0.45, r: 68, e: 36, t: [-110, 4, -400] },
        front: { a: Math.PI - 0.03, r: 18, e: 9, t: [-110, 5.5, -420] },
        field: { a: Math.PI - 0.06, r: 32, e: 38, t: [-110, 3, -400] },
        campus: { a: Math.PI - 0.18, r: 116, e: 81, t: [-102, 0, -400] },
      }[view];
      if (!v) return;
      streetJourney = null;
      angleGoal = v.a;
      radiusGoal = v.r;
      elevationGoal = v.e;
      targetGoal.set(...v.t);
    },
    cityView(id) {
      camera.layers.set(0);
      const p = cityViews[id];
      if (!p) return;
      arenaRoof.visible = lip.visible = id !== "court";
      canvas.dataset.arenaRoof = id === "court" ? "court-cutaway" : "closed";
      document.body.classList.toggle(
        "at-uptown",
        ["transco", "waterwall", "galleria", "arches"].includes(id),
      );
      document.body.classList.toggle("at-stadium", id === "stadium");
      document.body.classList.toggle("at-ballpark", id === "ballpark");
      $(".room-label b").textContent =
        id === "shop" ? "ABN RECORDS, CDs AND TAPES" : "TRUTHSTON, TEXAS";
      $(".room-label small").textContent =
        id === "shop" ? "THE RECORD SHOP / HOUSTON" : "THE CITY / THIRD COAST";
      scene.fog.density = id === "map" ? 0.00045 : 0.00125;
      const cityLabels = {
        skyline: [
          "Houston.<br>In full view.",
          "DOWNTOWN SKYLINE / 13 NAMED BUILDING COMPLEXES",
        ],
        downtown: [
          "Houston.<br>After hours.",
          "A STYLIZED HOUSTON CITYSCAPE / PICK A LANDMARK",
        ],
        bridge: ["Be someone.", "THE I-45 RAILWAY BRIDGE / A HOUSTON LANDMARK"],
        transco: [
          "Transco.<br>Still iconic.",
          "WILLIAMS TOWER / UPTOWN HOUSTON",
        ],
        waterwall: ["The Waterwall.", "GERALD D. HINES WATERWALL PARK"],
        galleria: [
          "Around the<br>corner.",
          "THE GALLERIA / WESTIN GALLERIA / GALLERIA TOWER I",
        ],
        arches: ["Post Oak.", "THE SILVER ARCHES / TRANSCO APPROACH"],
        stadium: ["Home field.<br>Houston.", "RELIANT / NRG STADIUM"],
        dome: ["The Eighth<br>Wonder.", "THE ASTRODOME / RELIANT PARK"],
        ballpark: [
          "For the<br>home team.",
          "DAIKIN PARK / THE ASTROS’ BALLPARK",
        ],
        arena: ["Clutch city.", "TOYOTA CENTER / HOME OF THE ROCKETS"],
        court: ["Home court.", "HOUSTON ROCKETS / TOYOTA CENTER CUTAWAY"],
        shop: ["The front door.", "THA TRUTH & NOTHING BUT THA TRUTH"],
        cars: ["The shop lot.", "CYBERTRUCK / SILVERADO / LAMBORGHINI"],
        map: [
          "One city.",
          "CONNECTED HOUSTON DISTRICTS / NORTH ↑ / DISTANCES COMPRESSED",
        ],
      };
      $("#station-title").innerHTML = cityLabels[id][0];
      $("#station-note").textContent = cityLabels[id][1];
      streetJourney = null;
      angleGoal = p.a;
      radiusGoal = p.r;
      elevationGoal = p.e;
      targetGoal.set(...p.t);
      $$("[data-city]").forEach((b) =>
        b.classList.toggle("active", b.dataset.city === id),
      );
    },
    travel(i) {
      arenaRoof.visible = lip.visible = true;
      canvas.dataset.arenaRoof = "closed";
      streetJourney = null;
      shopExterior.visible = i === 3;
      if (i === 3) {
        doorPivot.rotation.y = -1.5;
        if (!appState.calm)
          streetJourney = {
            start: performance.now(),
            from: camera.position.clone(),
            look: target.clone(),
          };
      }
      if (i === 1 && !appState.calm)
        streetJourney = {
          start: performance.now(),
          from: camera.position.clone(),
          look: target.clone(),
          points: [
            camera.position.clone(),
            new T.Vector3(-6.9, 2.3, 2.6),
            new T.Vector3(-10.3, 2.6, 2.6),
            new T.Vector3(-14.5, 4.6, 5.5),
          ],
          endLook: new T.Vector3(-14.5, 2.7, 0),
        };
      if (i === 2 && !appState.calm)
        streetJourney = {
          start: performance.now(),
          from: camera.position.clone(),
          look: target.clone(),
          points: [
            camera.position.clone(),
            new T.Vector3(7, 2.3, -2),
            new T.Vector3(10.3, 2.5, -2),
            new T.Vector3(9.3, 4.8, 0),
          ],
          endLook: new T.Vector3(18.2, 2, 0),
        };
      camera.layers.set(i === 2 ? 1 : 0);
      sun.castShadow = i !== 2;
      camera.fov = i === 3 ? 50 : i === 1 ? 52 : i === 2 ? 45 : 43;
      camera.updateProjectionMatrix();
      sun.intensity = i === 3 ? 1.65 : 3;
      sun.color.set(i === 3 ? "#f8d7b3" : "#f1bb7a");
      roomAmbient.intensity = i === 3 ? 0.45 : 2.6;
      roomAmbient.color.set(i === 3 ? "#b1c5dd" : "#eed6a4");
      roomAmbient.groundColor.set(i === 3 ? "#253241" : "#303a27");
      streetGlow.intensity = i === 3 ? 1.5 : 1;
      streetGlow.color.set(i === 3 ? "#b6ccdf" : "#8daccb");
      streetGlow.groundColor.set(i === 3 ? "#26323d" : "#242b2c");
      scene.background =
        i === 3 ? streetSky : new T.Color(i === 2 ? "#20251f" : "#25251d");
      scene.fog.color.set(
        i === 3 ? "#345a83" : i === 2 ? "#20251f" : "#25251d",
      );
      scene.fog.density = i === 3 ? 0.00125 : 0.025;
      const p = positions[i];
      angleGoal = p.a;
      radiusGoal = p.r;
      elevationGoal = p.e;
      targetGoal.set(...p.t);
      audioPosition();
    },
    audioPosition,
    unlock(i) {
      if (i === 0) doorPivot.rotation.y = -1.1;
      if (i === 1) warm.color.set("#ffc275");
      if (i === 2) greenLight.intensity = 22;
      if (i === 3) vaultLight.intensity = 35;
    },
  };
  canvas.addEventListener("keydown", (e) => {
    if (
      [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "+",
        "=",
        "-",
        "_",
      ].includes(e.key)
    ) {
      e.preventDefault();
      streetJourney = null;
      if (e.key === "ArrowLeft") angleGoal += Math.PI / 12;
      if (e.key === "ArrowRight") angleGoal -= Math.PI / 12;
      if (e.key === "ArrowUp")
        elevationGoal = Math.min(
          appState.station === 3 ? 850 : 12,
          elevationGoal + 2,
        );
      if (e.key === "ArrowDown") elevationGoal = Math.max(2, elevationGoal - 2);
      if (e.key === "+" || e.key === "=")
        radiusGoal = Math.max(5, radiusGoal * 0.88);
      if (e.key === "-" || e.key === "_")
        radiusGoal = Math.min(650, radiusGoal * 1.12);
    }
  });
  let down = false,
    dragged = false,
    px = 0,
    py = 0;
  function pick(e) {
    const r = canvas.getBoundingClientRect();
    pointer.set(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      (-(e.clientY - r.top) / r.height) * 2 + 1,
    );
    ray.setFromCamera(pointer, camera);
    return ray.intersectObjects(interact, false)[0]?.object;
  }
  canvas.addEventListener("pointerdown", (e) => {
    down = true;
    dragged = false;
    px = e.clientX;
    py = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (down) {
      const dx = e.clientX - px,
        dy = e.clientY - py;
      if (Math.abs(dx) + Math.abs(dy) > 3) dragged = true;
      streetJourney = null;
      angleGoal -= dx * 0.008;
      elevationGoal = Math.max(
        2,
        Math.min(
          appState.station === 3 ? 650 : 12,
          elevationGoal + dy * (appState.station === 3 ? 0.12 : 0.02),
        ),
      );
      px = e.clientX;
      py = e.clientY;
      $("#tip").style.display = "none";
      return;
    }
    hovering = pick(e);
    canvas.style.cursor = hovering ? "pointer" : "grab";
    const tip = $("#tip");
    tip.style.display = hovering ? "block" : "none";
    if (hovering) {
      tip.textContent = hovering.userData.text;
      const r = canvas.getBoundingClientRect();
      tip.style.left = Math.min(e.clientX - r.left + 12, r.width - 245) + "px";
      tip.style.top = Math.max(55, e.clientY - r.top - 40) + "px";
    }
  });
  canvas.addEventListener("pointerup", (e) => {
    down = false;
    if (!dragged) pick(e)?.userData.fn?.();
  });
  canvas.addEventListener("pointercancel", () => (down = false));
  canvas.addEventListener("pointerleave", () => {
    hovering = null;
    $("#tip").style.display = "none";
  });
  const ink = $("#ink"),
    ix = ink.getContext("2d"),
    drops = [];
  $(".room-wrap").addEventListener("pointermove", (e) => {
    if (appState.calm || appState.mode !== "immersive") return;
    const r = ink.getBoundingClientRect();
    drops.push({
      x: e.clientX - r.left,
      y: e.clientY - r.top,
      life: 1,
      vx: (rand() - 0.5) * 2,
      vy: (rand() - 0.5) * 2,
    });
    if (drops.length > 80) drops.shift();
  });
  function resize() {
    const r = canvas.parentElement.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
    ink.width = r.width;
    ink.height = r.height;
  }
  new ResizeObserver(resize).observe(canvas.parentElement);
  resize();
  // The approved illustrated companion is a depth-tested billboard inside the actual room.
  let roomGuide = null;
  const guideRoutes = {
    0: [
      [-8.2, 0, 2.6],
      [-6.1, 0, 2.6],
      [-1.1, 0, 2.6],
    ],
    1: [
      [-8.9, 0, 2.6],
      [-10.2, 0, 2.0],
      [-10.2, 0, -2.8],
      [-14.5, 0, -2.8],
    ],
    2: [
      [8.85, 0, -2],
      [10.3, 0, -2],
      [10.9, 0, 0],
      [15.0, 0, 0],
      companionSeat.anchor.toArray(),
    ],
    4: [
      [-8.2, 0, 2.6],
      [-6, 0, 2.4],
      [-4.5, 0, 2.2],
    ],
    5: [
      [-8.2, 0, 2.6],
      [-2, 0, 3.4],
      [2.5, 0, 2.8],
    ],
  };
  sceneAPI.installGuide = (options) => {
    const texture = new T.CanvasTexture(options.canvas);
    texture.colorSpace = T.SRGBColorSpace;
    texture.minFilter = T.LinearFilter;
    texture.generateMipmaps = false;
    const guide = new T.Mesh(
      new T.PlaneGeometry(1.72, 2.3),
      new T.MeshBasicMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.06,
        side: T.DoubleSide,
        depthWrite: false,
        toneMapped: false,
      }),
    );
    guide.visible = false;
    guide.layers.enable(1);
    scene.add(guide);
    hit(guide, "Talk to the companion", options.onSelect);
    twin("Talk to the companion in the room", options.onSelect);
    roomGuide = {
      mesh: guide,
      texture,
      options,
      visible: false,
      route: [],
      start: 0,
      seated: false,
      station: 0,
    };
  };
  sceneAPI.setGuideVisible = (value) => {
    if (roomGuide) {
      roomGuide.visible = value;
      roomGuide.mesh.visible = value;
    }
  };
  sceneAPI.guideTravel = (i) => {
    if (!roomGuide) return;
    const points = guideRoutes[i];
    roomGuide.station = i;
    if (!points) {
      roomGuide.visible = false;
      roomGuide.mesh.visible = false;
      roomGuide.options.onPosition(0, 0, false);
      return;
    }
    roomGuide.visible = true;
    roomGuide.mesh.visible = true;
    roomGuide.seated = false;
    roomGuide.route = points.map((p) => new T.Vector3(...p));
    roomGuide.start = performance.now();
    roomGuide.mesh.scale.set(1, 1, 1);
    roomGuide.options.onArrive(false);
  };
  function updateRoomGuide(ts) {
    if (!roomGuide || !roomGuide.visible) return;
    const g = roomGuide,
      m = g.mesh;
    g.texture.needsUpdate = true;
    if (g.route.length) {
      const duration = g.station === 2 ? 6000 : 3500,
        u = appState.calm
          ? 1
          : Math.max(0, Math.min(1, (ts - g.start) / duration)),
        segment = Math.min(
          g.route.length - 2,
          Math.floor(u * (g.route.length - 1)),
        ),
        f = Math.min(1, u * (g.route.length - 1) - segment),
        point = new T.Vector3().lerpVectors(
          g.route[segment],
          g.route[segment + 1],
          f,
        );
      m.position.copy(point);
      m.position.y =
        1.15 +
        (u < 1 && !appState.calm ? Math.abs(Math.sin(ts * 0.007)) * 0.025 : 0);
      if (u === 1) {
        g.route = [];
        if (g.station === 2) {
          g.seated = true;
          m.scale.set(0.86, 0.9, 1);
          m.position.copy(companionSeat.anchor);
          m.position.y = companionSeat.spriteCenterY;
          g.options.onArrive(true);
        } else g.options.onArrive(false);
      }
    }
    m.quaternion.copy(camera.quaternion);
    const foot = m.position.clone();
    foot.y -= g.seated ? 1.0 : 1.08;
    const projected = foot.project(camera),
      rect = canvas.getBoundingClientRect(),
      visible =
        projected.z > -1 &&
        projected.z < 1 &&
        Math.abs(projected.x) < 1.04 &&
        Math.abs(projected.y) < 1.1 &&
        appState.station !== 3 &&
        appState.mode === "immersive";
    g.options.onPosition(
      rect.left + ((projected.x + 1) * rect.width) / 2,
      rect.top + ((1 - projected.y) * rect.height) / 2,
      visible,
    );
  }

  // Project the live YouTube iframe onto the four corners of the actual theater screen.
  const cinemaDepthMask = new T.Mesh(
    screen.geometry,
    new T.MeshBasicMaterial({
      colorWrite: false,
      depthWrite: true,
      side: T.DoubleSide,
    }),
  );
  cinemaDepthMask.position.copy(screen.position);
  cinemaDepthMask.position.x -= 0.02;
  cinemaDepthMask.quaternion.copy(screen.quaternion);
  cinemaDepthMask.renderOrder = -1000;
  cinemaDepthMask.visible = false;
  cinemaDepthMask.layers.set(1);
  scene.add(cinemaDepthMask);
  let theaterLightsLevel = 0,
    theaterDim = false;
  sceneAPI.setCinemaLights = (value) => {
    theaterDim = value;
    screen.visible = !value;
    cinemaDepthMask.visible = value;
    if (value) {
      scene.background = null;
      renderer.setClearColor("#0b120e", 0);
    } else {
      renderer.setClearColor("#0b120e", 1);
      if (appState.station === 2) scene.background = new T.Color("#20251f");
    }
  };
  sceneAPI.theaterView = () => {
    streetJourney = null;
    camera.fov = 45;
    camera.updateProjectionMatrix();
    angleGoal = -Math.PI / 2;
    radiusGoal = 9.2;
    elevationGoal = 4.15;
    targetGoal.set(18.2, 3.65, -0.8);
  };
  function updateTheater(dt) {
    const desired = theaterDim && appState.station === 2 ? 1 : 0;
    theaterLightsLevel +=
      (desired - theaterLightsLevel) *
      (appState.calm ? 1 : Math.min(1, dt * 1.6));
    if (appState.station === 2) {
      sun.intensity = 3 * (1 - theaterLightsLevel) + 0.1 * theaterLightsLevel;
      roomAmbient.intensity =
        2.6 * (1 - theaterLightsLevel) + 0.2 * theaterLightsLevel;
      theatreLights.forEach(
        (l) =>
          (l.intensity =
            16 * (1 - theaterLightsLevel) + 0.65 * theaterLightsLevel),
      );
      screenLight.intensity =
        22 * (1 - theaterLightsLevel) + 11 * theaterLightsLevel;
      screenLight.color.set(theaterLightsLevel > 0.3 ? "#adc9f1" : "#93aaa0");
    }
    const host = $("#room-cinema");
    if (
      !host ||
      host.hidden ||
      appState.station !== 2 ||
      appState.mode !== "immersive"
    )
      return;
    const { width: w, height: h } = screen.geometry.parameters;
    const points = [
      [-w / 2, h / 2],
      [w / 2, h / 2],
      [w / 2, -h / 2],
      [-w / 2, -h / 2],
    ].map(([x, y]) =>
      new T.Vector3(x, y, 0).applyMatrix4(screen.matrixWorld).project(camera),
    );
    if (points.some((p) => p.z <= -1 || p.z >= 1) || camera.position.x > 18.2) {
      host.style.visibility = "hidden";
      return;
    }
    host.style.visibility = "visible";
    const rect = canvas.getBoundingClientRect(),
      p = points.map((v) => ({
        x: ((v.x + 1) * rect.width) / 2,
        y: ((1 - v.y) * rect.height) / 2,
      }));
    let dx1 = p[1].x - p[2].x,
      dx2 = p[3].x - p[2].x,
      dx3 = p[0].x - p[1].x + p[2].x - p[3].x,
      dy1 = p[1].y - p[2].y,
      dy2 = p[3].y - p[2].y,
      dy3 = p[0].y - p[1].y + p[2].y - p[3].y,
      g = 0,
      j = 0,
      den = dx1 * dy2 - dx2 * dy1;
    if (Math.abs(den) > 0.001) {
      g = (dx3 * dy2 - dx2 * dy3) / den;
      j = (dx1 * dy3 - dx3 * dy1) / den;
    }
    const a = p[1].x - p[0].x + g * p[1].x,
      b = p[3].x - p[0].x + j * p[3].x,
      c = p[0].x,
      d = p[1].y - p[0].y + g * p[1].y,
      e = p[3].y - p[0].y + j * p[3].y,
      f = p[0].y;
    host.style.transform = `matrix3d(${a / 960},${d / 960},0,${g / 960},${b / 540},${e / 540},0,${j / 540},0,0,1,0,${c},${f},0,1)`;
    host.dataset.screenAttached = "true";
  }

  const bins = new Uint8Array(1024);
  let bass = 0,
    mid = 0,
    treble = 0,
    acc = 0,
    visitorTime = 0,
    glow = 0;
  function bands() {
    if (!playing || !analyser) {
      bass = mid = treble = 0;
      return;
    }
    analyser.getByteFrequencyData(bins);
    const avg = (a, b) => {
      let sum = 0;
      for (let i = a; i < b; i++) sum += bins[i];
      return sum / (b - a) / 255;
    };
    const hz = ctx.sampleRate / 2048;
    bass = avg(1, Math.ceil(250 / hz));
    mid = avg(Math.ceil(250 / hz), Math.ceil(2500 / hz));
    treble = avg(Math.ceil(2500 / hz), Math.min(1024, Math.ceil(10000 / hz)));
  }
  let raf,
    lastSceneDraw = 0;
  function render(ts) {
    if (document.hidden) return;
    raf = requestAnimationFrame(render);
    if (appState.station === 2 && ts - lastSceneDraw < 42) return;
    lastSceneDraw = ts;
    const dt = Math.min((ts - lastFrame) / 1000 || 0.016, 0.08);
    lastFrame = ts;
    const t = ts / 1000;
    updateDJ(dt);
    spinSpeed +=
      (playing ? rate - spinSpeed : -spinSpeed) * Math.min(1, dt * 4);
    spin += spinSpeed * dt * 160;
    const plat = $("#platter");
    if (plat && !appState.calm) {
      if (cassette)
        $$(".reel").forEach((r) => (r.style.transform = `rotate(${spin}deg)`));
      else plat.style.transform = `rotate(${spin}deg)`;
    }
    if (playing) {
      const p = position();
      $("#seek").value = (p / audioDuration()) * 100;
      $("#time").textContent =
        clockText(p) + " / " + clockText(audioDuration());
      acc += dt;
      if (acc >= 6) {
        earn(2);
        acc = 0;
      }
    }
    if (
      appState.mode !== "immersive" ||
      document.body.classList.contains("account-view")
    )
      return;
    const ballparkStep = appState.calm ? 1 : dt / 24;
    ballparkOpen +=
      Math.sign(ballparkTarget - ballparkOpen) *
      Math.min(Math.abs(ballparkTarget - ballparkOpen), ballparkStep);
    const parkEase = ballparkOpen * ballparkOpen * (3 - 2 * ballparkOpen);
    ballparkPanels.forEach(
      ({ group, panel }) =>
        (group.position.z =
          parkZ +
          (-8.4 + panel * 8.4) * (1 - parkEase) +
          (8.8 + panel * 0.35) * parkEase),
    );
    const parkState =
      ballparkOpen === 1
        ? "BALLPARK ROOF OPEN"
        : ballparkOpen === 0
          ? "BALLPARK ROOF CLOSED"
          : ballparkTarget
            ? "OPENING BALLPARK ROOF"
            : "CLOSING BALLPARK ROOF";
    $("#ballpark-roof").dataset.progress = ballparkOpen.toFixed(3);
    if ($("#ballpark-roof-status").textContent !== parkState)
      $("#ballpark-roof-status").textContent = parkState;
    const roofStep = appState.calm ? 1 : dt / 6;
    if (Math.abs(roofTarget - roofOpen) <= roofStep) roofOpen = roofTarget;
    else roofOpen += Math.sign(roofTarget - roofOpen) * roofStep;
    const roofEase = roofOpen * roofOpen * (3 - 2 * roofOpen);
    roofPanels.forEach(
      (p) =>
        (p.group.position.z = stadiumZ + p.side * (6.05 + roofEase * 10.3)),
    );
    const roofState =
      roofOpen === 0
        ? "ROOF CLOSED"
        : roofOpen === 1
          ? "ROOF OPEN"
          : roofTarget
            ? "OPENING ROOF"
            : "CLOSING ROOF";
    if ($("#roof-status").textContent !== roofState)
      $("#roof-status").textContent = roofState;
    bands();
    if (appState.station === 2) {
      angleGoal = -Math.PI / 2;
      radiusGoal = 9.2;
      elevationGoal = 4.15;
      targetGoal.set(18.2, 3.65, -0.8);
    }
    if (appState.station === 1) {
      radiusGoal = Math.max(3.5, Math.min(5.5, radiusGoal));
      elevationGoal = Math.max(2.2, Math.min(5.6, elevationGoal));
    }
    const smoothing = appState.calm ? 1 : Math.min(1, dt * 4);
    angle += (angleGoal - angle) * smoothing;
    radius += (radiusGoal - radius) * smoothing;
    elevation += (elevationGoal - elevation) * smoothing;
    target.lerp(targetGoal, smoothing);
    camera.position.set(
      target.x + Math.sin(angle) * radius,
      elevation,
      target.z + Math.cos(angle) * radius,
    );
    camera.lookAt(target);
    if (appState.calm) streetJourney = null;
    if (streetJourney) {
      const elapsed = Math.max(0, (ts - streetJourney.start) / 1000);
      const points = streetJourney.points || [
        streetJourney.from,
        new T.Vector3(6.65, 2.25, -3),
        new T.Vector3(6.65, 2.25, -8.2),
        new T.Vector3(6.65, 3.4, -11),
      ];
      const segment = Math.min(2, Math.floor(elapsed / 1.05));
      let u = Math.min(1, (elapsed - segment * 1.05) / 1.05);
      u = u * u * (3 - 2 * u);
      camera.position.lerpVectors(points[segment], points[segment + 1], u);
      const look = streetJourney.look
        .clone()
        .lerp(
          streetJourney.endLook || new T.Vector3(6.65, 6, -33),
          Math.min(1, elapsed / 0.9),
        );
      camera.lookAt(look);
      if (elapsed >= 3.15) {
        streetJourney = null;
        angle = angleGoal;
        radius = radiusGoal;
        elevation = elevationGoal;
        target.copy(targetGoal);
      }
    }
    sleeves.forEach((s) => {
      const lift = hovering === s && !appState.calm ? 0.18 : 0;
      s.position.y += (s.userData.base.y + lift - s.position.y) * 0.15;
      const normal = s.userData.normal || { x: 0, z: 1 },
        out = hovering === s ? 0.3 : 0;
      s.position.x +=
        (s.userData.base.x + normal.x * out - s.position.x) * 0.15;
      s.position.z +=
        (s.userData.base.z + normal.z * out - s.position.z) * 0.15;
      s.material.emissiveIntensity = appState.calm ? 0.07 : 0.07 + glow;
    });
    if (!appState.calm && t - lastGlitch > 0.5) {
      glow = Math.min(0.07, bass * 0.07);
      warm.intensity = 70 + bass * 8;
      warm.color.setHSL(0.09 + mid * 0.015, 0.65, 0.68);
      lastGlitch = t;
    }
    if (appState.calm) warm.intensity = 70;
    crts.forEach((s) => {
      s.material.uniforms.time.value = t;
      s.material.uniforms.hover.value = hovering === s ? 1 : 0;
      s.material.uniforms.calm.value = appState.calm ? 1 : 0;
    });
    if (!appState.calm) {
      waterTexture.offset.y = -t * 0.1;
      ghosts.forEach((g) => {
        g.position.x =
          g.userData.x + Math.sin(t * 0.14 + g.userData.phase) * 0.65;
        g.position.z =
          g.userData.z + Math.cos(t * 0.12 + g.userData.phase) * 0.4;
      });
      disc.rotation.y += dt * spinSpeed * 3;
      discLabel.rotation.y = disc.rotation.y;
      if (decks[1].running && !decks[1].holding) {
        discB.rotation.y += dt * decks[1].pitch * 3;
        discLabelB.rotation.y = discB.rotation.y;
      }
      visitorTime += dt;
      if (visitorTime > 40) {
        const count = 5 + Math.floor(rand() * 4);
        ghosts.forEach((g, i) => (g.visible = i < count));
        $("#people").textContent = count;
        visitorTime = 0;
      }
    }
    ix.clearRect(0, 0, ink.width, ink.height);
    if (!appState.calm) {
      drops.forEach((d) => {
        d.life -= dt * 0.55;
        d.x += d.vx + Math.sin(t * 2 + d.y * 0.01) * bass;
        d.y += d.vy;
        const size = (1 - d.life) * 35 + 8;
        ix.strokeStyle = `rgba(217,144,43,${Math.max(0, d.life) * 0.45})`;
        ix.lineWidth = 1 + treble * 2;
        ix.beginPath();
        ix.arc(d.x, d.y, size, 0, Math.PI * 1.6);
        ix.stroke();
      });
      while (drops.length && drops[0].life < 0) drops.shift();
    }
    updateRoomGuide(ts);
    updateTheater(dt);
    renderer.render(scene, camera);
    frames++;
    frameTotal += dt;
    if (frames >= 180) {
      if (
        appState.station !== 2 &&
        frames / frameTotal < 40 &&
        renderer.getPixelRatio() > 0.75
      )
        renderer.setPixelRatio(Math.max(0.75, renderer.getPixelRatio() * 0.75));
      frames = 0;
      frameTotal = 0;
    }
  }
  raf = requestAnimationFrame(render);
  document.addEventListener("visibilitychange", () => {
    cancelAnimationFrame(raf);
    if (!document.hidden) {
      lastFrame = performance.now();
      raf = requestAnimationFrame(render);
    }
  });
  $("#loading").remove();
  if (appState.calm) setMode("reduced");
  else if (innerWidth < 650) setMode("standard");
} catch (e) {
  console.warn("Room fallback:", e);
  $("#loading")?.remove();
  setMode("standard");
  // Keep the dock functional even if WebGL or its CDN is unavailable.
  setInterval(() => {
    if (!document.hidden) {
      updateDJ(0.25);
      if (playing) {
        $("#seek").value = (position() / audioDuration()) * 100;
        $("#time").textContent =
          clockText(position()) + " / " + clockText(audioDuration());
      }
    }
  }, 250);
}
// The companion is an illustrated site guide, not a direct chat with Trae. All destinations are allowlisted.
// Retain the approved illustrated character. Canvas layers provide light limb/head motion without a card flip.
async function buildCompanionIllustration(canvas, options) {
  const source = new Image();
  source.src = "assets/companion/trae-companion-atlas.png";
  try {
    await source.decode();
  } catch {
    return null;
  }
  canvas.width = 384;
  canvas.height = 512;
  const q = canvas.getContext("2d");
  const cinemaArt = new Image();
  cinemaArt.src = "assets/companion/trae-cinema-atlas.png";
  let seated = false,
    eating = false,
    lookingBack = false;
  let pose = 0,
    near = false,
    typing = false,
    dragging = false,
    until = 0,
    phase = 0,
    last = 0,
    lastDraw = 0,
    raf,
    turnStart = -10000,
    turning = false,
    coverImage = new Image(),
    lastCover = "";
  function spin() {
    if (!options.still()) {
      turnStart = performance.now();
      turning = true;
    }
  }
  function setPose(n) {
    pose = n;
    if (n === 4 || n === 7) spin();
    const cover = options.cover();
    if (n === 6 && lastCover !== cover) {
      lastCover = cover;
      coverImage.src = cover;
    }
  }
  // Anchors use the approved atlas cell coordinates; glints follow the actual rendered pose.
  const jewelryGlints = [
    [
      [203, 214],
      [326, 341],
      [143, 122],
    ],
    [
      [204, 214],
      [312, 341],
      [139, 135],
    ],
    [
      [203, 213],
      [309, 341],
      [135, 135],
    ],
    [
      [174, 214],
      [303, 196],
      [117, 110],
    ],
    [
      [267, 296],
      [149, 97],
    ],
    [
      [185, 179],
      [129, 98],
    ],
    [
      [190, 204],
      [118, 243],
      [155, 101],
    ],
    [
      [191, 186],
      [303, 207],
      [136, 97],
    ],
  ];
  const smileGlints = { 3: [185, 124], 5: [194, 106], 7: [204, 117] };
  let sparkleTime = 0,
    smileTime = 0,
    previousPose = -1;
  function glint(x, y, t, size = 18) {
    if (t < 0 || t > 1.15) return;
    const glow = Math.sin((Math.PI * t) / 1.15);
    q.save();
    q.translate(x, y);
    q.rotate(t * 0.55);
    q.globalAlpha = glow;
    q.shadowColor = "#bde8ff";
    q.shadowBlur = 12 * glow;
    q.fillStyle = "#fff";
    const r = size * (0.4 + 0.6 * glow);
    q.beginPath();
    q.moveTo(0, -r);
    q.lineTo(r * 0.16, -r * 0.16);
    q.lineTo(r, 0);
    q.lineTo(r * 0.16, r * 0.16);
    q.lineTo(0, r);
    q.lineTo(-r * 0.16, r * 0.16);
    q.lineTo(-r, 0);
    q.lineTo(-r * 0.16, -r * 0.16);
    q.closePath();
    q.fill();
    q.restore();
  }
  function part(n, x, y, w, h, dx = x, dy = y) {
    q.drawImage(
      source,
      (n % 4) * 384 + x,
      (n > 3 ? 512 : 0) + y,
      w,
      h,
      dx,
      dy,
      w,
      h,
    );
  }
  function draw(ts) {
    if (document.hidden) return;
    raf = requestAnimationFrame(draw);
    if (options.hidden?.()) return;
    if (ts - lastDraw < 33) return;
    const dt = Math.min(0.06, (ts - last) / 1000 || 0.03);
    last = ts;
    lastDraw = ts;
    const moving = dragging || ts < until,
      still = options.still();
    phase += dt * (moving ? 17 : 2);
    let n = pose;
    if (near && n < 4 && !typing) n = 3;
    if (typing && n < 4) n = 0;
    if (turning) {
      const u = Math.max(0, (ts - turnStart) / 800);
      if (u >= 1) turning = false;
      else n = [0, 2, 4, 1, pose][Math.min(4, Math.floor(u * 5))];
    }
    q.clearRect(0, 0, 384, 512);
    q.save();
    if (!still)
      q.translate(
        0,
        moving ? Math.abs(Math.sin(phase)) * -5 : Math.sin(ts * 0.0015) * -2,
      );
    // Keep each approved pose intact. No segmented limbs or head crops while dragging/typing.
    if (seated && cinemaArt.complete && cinemaArt.naturalWidth) {
      const cellW = cinemaArt.naturalWidth / 2,
        cellH = cinemaArt.naturalHeight / 2,
        k = lookingBack ? 2 : eating && !still ? Math.floor(ts / 850) % 2 : 0;
      const bounds = [
          [224, 18, 624, 598],
          [133, 20, 565, 598],
          [228, 0, 634, 561],
          [167, 0, 565, 562],
        ][k],
        sw = bounds[2] - bounds[0],
        sh = bounds[3] - bounds[1],
        scale = 470 / sh,
        dw = sw * scale;
      q.drawImage(
        cinemaArt,
        (k % 2) * cellW + bounds[0],
        Math.floor(k / 2) * cellH + bounds[1],
        sw,
        sh,
        (384 - dw) / 2,
        30,
        dw,
        470,
      );
    } else part(n, 0, 0, 384, 512);
    if (!still && !seated) {
      sparkleTime += dt;
      if (n !== previousPose) smileTime = 0;
      smileTime += dt;
      const beat = sparkleTime % 6.5;
      jewelryGlints[n].forEach(([x, y], i) =>
        glint(x, y, beat - 0.7 - i * 0.65),
      );
      const smile = smileGlints[n];
      if (smile) glint(...smile, (smileTime % 4.5) - 0.25, 15);
    }
    previousPose = n;

    if (n === 6 && coverImage.complete && coverImage.naturalWidth) {
      q.save();
      q.translate(281, 226);
      q.rotate(0.39);
      q.drawImage(coverImage, -35, -35, 70, 70);
      q.restore();
    }
    q.restore();
  }
  raf = requestAnimationFrame(draw);
  document.addEventListener("visibilitychange", () => {
    cancelAnimationFrame(raf);
    if (!document.hidden) {
      last = performance.now();
      raf = requestAnimationFrame(draw);
    }
  });
  options.ready();
  return {
    cinema(s, p, back = false) {
      seated = s;
      eating = p;
      lookingBack = back;
    },
    pose: setPose,
    spin,
    pointer(x, y, value) {
      near = value;
    },
    walk(value) {
      dragging = value;
      until = performance.now() + 180;
    },
    typing(value) {
      typing = value;
    },
  };
}

const cinemaState = {
  active: false,
  playing: false,
  selected: -1,
  player: null,
};
setupCinema();
function initCompanion() {
  const root = document.createElement("aside");
  root.id = "truth-companion";
  root.className = "companion-v2 companion-idle portal-born";
  root.setAttribute("aria-label", "Trae-inspired site companion");
  const icon = {
      chat: '<path d="M5 16l-1 5 5-2h9a3 3 0 003-3V6a3 3 0 00-3-3H6a3 3 0 00-3 3v8"/><path d="M8 8h8M8 12h5"/>',
      voice: '<path d="M4 10v4m4-8v12m4-15v18m4-15v12m4-8v4"/>',
      store:
        '<path d="M4 9l2-6h12l2 6v3a3 3 0 01-4 0 3 3 0 01-4 0 3 3 0 01-4 0 3 3 0 01-4 0V9zM5 14v7h14v-7M10 21v-6h4v6"/>',
    },
    svg = (k) =>
      `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icon[k]}</svg>`;
  root.innerHTML = `<div class="companion-thought" id="companion-bubble" hidden><svg viewBox="0 0 280 180" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="thought-cream" x1="0" y1="0" x2=".25" y2="1"><stop offset="0" stop-color="#fffef8"/><stop offset=".62" stop-color="#fff6e4"/><stop offset="1" stop-color="#ded0b3"/></linearGradient></defs><path d="M44 133C15 135 8 110 25 94C3 70 20 45 43 46C40 20 70 9 91 24C104 3 138 5 149 22C169 7 201 18 203 37C233 25 256 43 250 65C278 69 282 99 261 112C271 139 242 157 221 147C209 169 179 169 165 154C145 171 119 164 113 151C86 166 60 156 59 138Z" fill="url(#thought-cream)" stroke="#c9baa0" stroke-width="1.5"/><circle cx="66" cy="162" r="6" fill="#fff8e8" stroke="#b2a185"/><circle cx="52" cy="175" r="3" fill="#fff8e8" stroke="#b2a185"/></svg><button class="companion-bubble-close" aria-label="Dismiss companion thought">×</button><button class="companion-thought-message" id="companion-cta"><span></span><small></small></button></div><button id="companion-character" aria-label="Site companion. Drag to move; arrow keys also move. Hover nearby for chat, voice and store." aria-expanded="false"><canvas id="companion-model" width="150" height="200" aria-hidden="true"></canvas><span class="companion-sprite"></span><img class="companion-record" alt=""><i class="companion-spark"></i><i class="companion-spark"></i></button><div class="companion-actions" role="group" aria-label="Companion actions"><button id="companion-open-chat" aria-label="Chat with site companion" title="Chat">${svg("chat")}</button><button id="companion-open-voice" aria-label="Voice chat with site companion" title="Voice chat">${svg("voice")}</button><button id="companion-open-store" aria-label="Open merch store" title="Merch store">${svg("store")}</button></div><button class="companion-putaway" id="companion-putaway" aria-label="Put companion away" title="Put companion away">×</button><span class="accessible" id="companion-status" role="status">Companion active</span>`;
  root
    .querySelector(".companion-actions")
    .append(root.querySelector("#companion-putaway"));
  const chat = document.createElement("section");
  chat.id = "companion-chat";
  chat.className = "companion-chat-v2";
  chat.hidden = true;
  chat.setAttribute("aria-label", "Companion conversation");
  chat.innerHTML = `<div class="companion-messages" id="companion-messages" role="log" aria-live="polite" aria-relevant="additions" hidden></div><div class="companion-voice-state" id="companion-voice-state" role="status" hidden></div><form class="companion-chat-form" id="companion-chat-form"><button type="button" class="companion-chat-dismiss" id="companion-chat-close" aria-label="Close companion chat">×</button><input id="companion-question" aria-label="Question about the site" maxlength="800" placeholder="Start a chat…" required autocomplete="off"><button type="submit" id="companion-send" aria-label="Send message">↑</button></form><div class="companion-chat-foot"><span id="companion-engine">SITE GUIDE / LOCAL PREVIEW</span><button type="button" id="companion-stop-voice" hidden>Stop voice</button></div>`;
  document.body.append(root, chat);
  document.body.append($("#companion-bubble"));
  const restore = document.createElement("button");
  restore.id = "companion-restore";
  restore.textContent = "Show companion";
  restore.hidden = true;
  $(".site-links").insertBefore(restore, $(".site-links").children[1]);
  let homeDocked = true;
  let rig = null,
    quiet = false,
    hidden = false,
    frame = 0,
    projectIndex = 0,
    activeProject = releases[0],
    cycle = 0,
    ticks = 0,
    busy = false,
    remoteAvailable = true,
    chatHistory = [],
    drag = null,
    dragged = false,
    pending = [],
    lastSpark = 0,
    poseLockUntil = 0,
    typing = false,
    voiceMode = false,
    recognition = null,
    voiceSpeaking = false,
    lastPointer = { x: 0, y: 0 };
  const character = $("#companion-character");
  try {
    hidden = localStorage.getItem("truth-companion-hidden") === "true";
  } catch {}
  root.hidden = hidden;
  restore.hidden = !hidden;
  document.body.classList.toggle("companion-dismissed", hidden);
  function putAway() {
    hidden = true;
    portalToken++;
    cancelSequence();
    stopVoice();
    chat.hidden = true;
    $("#companion-bubble").hidden = true;
    inWorld = false;
    worldSeat = false;
    sceneAPI?.setGuideVisible?.(false);
    worldTools.hidden = true;
    root.hidden = true;
    restore.hidden = false;
    document.body.classList.add("companion-dismissed");
    try {
      localStorage.setItem("truth-companion-hidden", "true");
    } catch {}
    attach();
    restore.focus({ preventScroll: true });
  }
  function restoreCompanion() {
    hidden = false;
    root.hidden = false;
    restore.hidden = true;
    document.body.classList.remove("companion-dismissed");
    home.classList.remove("door-present", "door-open");
    root.classList.remove(
      "companion-in-world",
      "portal-entering",
      "portal-born",
    );
    character.removeAttribute("aria-hidden");
    character.tabIndex = 0;
    inWorld = false;
    worldSeat = false;
    setPortalState("outside");
    try {
      localStorage.setItem("truth-companion-hidden", "false");
    } catch {}
    dockHome();
    attach();
    pose(0);
    status();
    character.focus({ preventScroll: true });
  }
  $("#companion-putaway").onclick = putAway;
  restore.onclick = restoreCompanion;
  new ResizeObserver(constrainThought).observe(
    root.querySelector(".companion-actions"),
  );
  const actions = {
    chat: ["Chat", () => openChat()],
    boom: [
      "Shop Bumpboxx",
      () => commerce.bumpboxDisplay("Bumpboxx / ABN red display"),
    ],
    dj: ["Enter the DJ booth", enterDJRoom],
    record: ["Open this project", () => release(activeProject)],
    merch: ["Visit the merch shop", commerce.merch],
    member: [
      "Open your Stamp Book",
      () => {
        location.hash = "account/stamp-book";
        accountRoute();
      },
    ],
    screens: [
      "Visit the screening room",
      () => {
        go(2);
        $(".room-wrap").scrollIntoView({ block: "start" });
      },
    ],
    street: [
      "Explore Houston",
      () => {
        go(3);
        $(".room-wrap").scrollIntoView({ block: "start" });
      },
    ],
    crate: [
      "Dig through releases",
      () => {
        setMode("standard");
        go(0);
        $(".room-wrap").scrollIntoView({ block: "start" });
      },
    ],
    giving: ["Visit the giving wing", () => go(4)],
  };
  function still() {
    return appState.calm || document.hidden || hidden;
  }
  function status() {
    root.classList.toggle("companion-still", still());
    $("#companion-status").textContent = document.hidden
      ? "Companion away"
      : busy
        ? "Companion answering"
        : voiceMode
          ? "Companion voice chat active"
          : "Companion active";
  }
  function constrainThought() {
    const bar = root.querySelector(".companion-actions"),
      rr = root.getBoundingClientRect(),
      bw = bar.offsetWidth;
    bar.style.left =
      Math.max(
        8,
        Math.min(innerWidth - bw - 8, rr.left + (rr.width - bw) / 2),
      ) -
      rr.left +
      "px";
    bar.style.transform = "none";
    const el = $("#companion-bubble");
    if (el.hidden) return;
    const r = root.getBoundingClientRect(),
      w = el.offsetWidth,
      h = el.offsetHeight;
    // Prefer the viewer's right; keep the cloud body and its copy on screen.
    const left = Math.max(8, Math.min(innerWidth - w - 8, r.right - 4));
    const top = Math.max(8, Math.min(innerHeight - h - 8, r.top - 160));
    el.style.left = left + "px";
    el.style.top = top + "px";
    const anchor = Math.max(
      6,
      Math.min(66, ((r.left + r.width * 0.78 - left) / w) * 280),
    );
    const dots = el.querySelectorAll("circle");
    dots[0]?.setAttribute("cx", String(anchor + 13));
    dots[0]?.setAttribute("cy", "153");
    dots[1]?.setAttribute("cx", String(anchor));
    dots[1]?.setAttribute("cy", "172");
  }
  function place(x, y) {
    if (homeDocked) {
      homeDocked = false;
      document.body.append(root);
    }
    root.style.position = "fixed";
    const w = root.offsetWidth || 124,
      h = root.offsetHeight || 192;
    root.style.left = Math.max(5, Math.min(innerWidth - w - 5, x)) + "px";
    root.style.top = Math.max(5, Math.min(innerHeight - h - 5, y)) + "px";
    root.style.bottom = "auto";
    constrainThought();
  }
  function savePosition() {
    const r = root.getBoundingClientRect();
    try {
      localStorage.setItem(
        "truth-companion-position",
        JSON.stringify({ x: r.left, y: r.top }),
      );
    } catch {}
  }
  function pose(n, animate = false) {
    frame = n;
    root.dataset.pose = String(n);
    root.style.setProperty("--pose-x", ((n % 4) * 100) / 3 + "%");
    root.style.setProperty("--pose-y", (n > 3 ? 100 : 0) + "%");
    $(".companion-record").src = activeProject.cover;
    rig?.pose(n);
    if (animate && n !== 4 && n !== 7) rig?.spin();
  }
  function later(fn, ms) {
    pending.push(
      setTimeout(() => {
        if (!document.hidden) fn();
      }, ms),
    );
  }
  function cancelSequence() {
    pending.forEach(clearTimeout);
    pending = [];
  }
  function showThought(text, action) {
    if (hidden) return;
    $("#companion-cta span").textContent = text;
    $("#companion-cta").setAttribute(
      "aria-label",
      text + " " + actions[action][0],
    );
    $("#companion-cta small").textContent = actions[action][0] + " ↗";
    $("#companion-cta").onclick = () => act(action);
    $("#companion-bubble").hidden = false;
    constrainThought();
    clearTimeout(showThought.timer);
    showThought.timer = setTimeout(
      () => ($("#companion-bubble").hidden = true),
      12000,
    );
  }
  function perform(kind) {
    cancelSequence();
    poseLockUntil = performance.now() + 14500;
    $("#companion-bubble").hidden = true;
    if (kind === "boom") {
      pose(4, true);
      later(
        () => {
          pose(5);
          showThought(
            "Bring your own Bumpboxx. Find yours in the DJ booth.",
            "boom",
          );
        },
        still() ? 0 : 1200,
      );
      later(() => pose(4), 11000);
      later(() => pose(0), 13500);
    } else if (kind === "record") {
      activeProject = releases[(projectIndex++ * 7) % releases.length];
      pose(6);
      showThought(
        "From the backpack: " + activeProject.title + ". Dig into the project.",
        "record",
      );
      later(() => pose(0), 13000);
    } else if (kind === "merch") {
      pose(7, true);
      showThought(
        "Wear the truth. Explore the ABN collection in the merch shop.",
        "merch",
      );
      later(() => pose(3), 13000);
    } else {
      pose(7);
      showThought(
        "Join the site. Build your Stamp Book and keep up with future member drops.",
        "member",
      );
      later(() => pose(0), 13000);
    }
  }
  function act(key) {
    if (!actions[key]) return;
    $("#companion-bubble").hidden = true;
    root.classList.remove("companion-near");
    actions[key][1]();
  }
  character.onpointerdown = (e) => {
    if (e.button !== 0) return;
    const r = root.getBoundingClientRect();
    drag = {
      id: e.pointerId,
      dx: e.clientX - r.left,
      dy: e.clientY - r.top,
      x: e.clientX,
      y: e.clientY,
    };
    dragged = false;
    character.setPointerCapture(e.pointerId);
  };
  character.onpointermove = (e) => {
    if (!drag) return;
    if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 5) dragged = true;
    if (dragged) {
      $("#companion-bubble").hidden = true;
      place(e.clientX - drag.dx, e.clientY - drag.dy);
      rig?.walk(true);
      root.classList.add("companion-walking");
    }
  };
  character.onpointerup = (e) => {
    if (!drag) return;
    drag = null;
    rig?.walk(false);
    root.classList.remove("companion-walking");
    if (character.hasPointerCapture(e.pointerId))
      character.releasePointerCapture(e.pointerId);
    if (dragged) {
      savePosition();
      setTimeout(() => (dragged = false), 0);
    }
  };
  character.onpointercancel = () => {
    drag = null;
    rig?.walk(false);
    root.classList.remove("companion-walking");
  };
  character.onclick = () => {
    if (!dragged) {
      root.classList.toggle("companion-near");
      character.setAttribute(
        "aria-expanded",
        String(root.classList.contains("companion-near")),
      );
    }
  };
  character.ondblclick = () =>
    perform(["boom", "record", "merch", "member"][cycle++ % 4]);
  character.title = "Drag to move · double-click for a companion moment";
  character.onkeydown = (e) => {
    const dirs = {
      ArrowLeft: [-12, 0],
      ArrowRight: [12, 0],
      ArrowUp: [0, -12],
      ArrowDown: [0, 12],
    };
    if (dirs[e.key]) {
      e.preventDefault();
      const r = root.getBoundingClientRect(),
        d = dirs[e.key];
      place(
        r.left + d[0] * (e.shiftKey ? 3 : 1),
        r.top + d[1] * (e.shiftKey ? 3 : 1),
      );
      rig?.walk(false);
      savePosition();
    }
    if (e.key === "Escape") root.classList.remove("companion-near");
  };
  document.addEventListener("pointermove", (e) => {
    lastPointer = { x: e.clientX, y: e.clientY };
    const r = root.getBoundingClientRect(),
      dx = e.clientX - r.left - r.width / 2,
      dy = e.clientY - r.top - r.height / 2,
      near = Math.hypot(dx, dy) < 145;
    rig?.pointer(
      Math.max(-1, Math.min(1, dx / 300)),
      Math.max(-1, Math.min(1, dy / 300)),
      near,
    );
    if (!drag) root.classList.toggle("companion-near", near);
  });
  root.addEventListener("focusin", () => root.classList.add("companion-near"));
  root.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      root.classList.remove("companion-near");
      $("#companion-bubble").hidden = true;
    }
  });
  $("#companion-open-chat").onclick = () => openChat();
  $("#companion-open-store").onclick = () => act("merch");
  $(".companion-bubble-close").onclick = () =>
    ($("#companion-bubble").hidden = true);
  function dockHome() {
    root.style.visibility = "visible";
    const home = $("#companion-home");
    home.append(root);
    root.style.position = "absolute";
    root.style.left =
      Math.max(0, (home.clientWidth - (root.offsetWidth || 132)) / 2) + "px";
    root.style.top = "0px";
    root.style.bottom = "auto";
    homeDocked = true;
    constrainThought();
  }
  function attach() {
    const full =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      ($(".room-wrap").classList.contains("fullscreen-fallback")
        ? $(".room-wrap")
        : null);
    const parent = full || document.body;
    if ($("#companion-bubble").parentNode !== parent)
      parent.append($("#companion-bubble"));
    const restoreParent = full || $(".site-links");
    if (restore.parentNode !== restoreParent) {
      if (full) restoreParent.append(restore);
      else restoreParent.insertBefore(restore, restoreParent.children[1]);
    }
    restore.classList.toggle("companion-restore-floating", !!full);
    if (chat.parentNode !== parent) parent.append(chat);
    if (inWorld) {
      if (root.parentNode !== parent) parent.append(root);
      return;
    }
    if (full) {
      if (root.parentNode !== full) {
        const r = root.getBoundingClientRect();
        full.append(root);
        root.style.position = "fixed";
        root.style.left =
          Math.max(10, Math.min(innerWidth - 145, r.left)) + "px";
        root.style.top =
          Math.max(10, Math.min(innerHeight - 225, r.top)) + "px";
      }
    } else if (homeDocked && document.body.classList.contains("account-view")) {
      if (root.parentNode !== document.body) {
        document.body.append(root);
        root.style.position = "fixed";
        root.style.left =
          Math.max(10, innerWidth - root.offsetWidth - 14) + "px";
        root.style.top =
          Math.max(
            15,
            innerHeight - $(".dock").offsetHeight - root.offsetHeight - 18,
          ) + "px";
        root.style.bottom = "auto";
      }
    } else if (homeDocked) {
      dockHome();
    } else if (root.parentNode !== document.body) {
      const r = root.getBoundingClientRect();
      document.body.append(root);
      place(r.left, r.top);
    }
  }
  document.addEventListener("fullscreenchange", attach);
  document.addEventListener("webkitfullscreenchange", attach);
  new MutationObserver(() => {
    attach();
    status();
  }).observe($(".room-wrap"), { attributes: true, attributeFilter: ["class"] });
  new MutationObserver(() => {
    attach();
    status();
  }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  window.addEventListener("resize", () => {
    const full =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      $(".room-wrap").classList.contains("fullscreen-fallback");
    if (homeDocked && !full) dockHome();
    else if (homeDocked) attach();
    else {
      const r = root.getBoundingClientRect();
      place(r.left, r.top);
    }
  });
  window.addEventListener(
    "scroll",
    () => {
      if (homeDocked) constrainThought();
    },
    { passive: true },
  );
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelSequence();
      stopVoice();
      $("#companion-bubble").hidden = true;
    }
    status();
  });
  function addMessage(text, who = "guide", keys = []) {
    $("#companion-messages").hidden = false;
    const el = document.createElement("div");
    el.className = "companion-message " + who;
    const label = document.createElement("small");
    label.textContent = who === "user" ? "YOU" : "SITE COMPANION";
    el.append(label, document.createTextNode(text));
    if (keys.length) {
      const row = document.createElement("div");
      row.className = "companion-message-actions";
      keys
        .filter((k) => actions[k])
        .forEach((k) => {
          const b = document.createElement("button");
          b.textContent = actions[k][0] + " ↗";
          b.onclick = () => {
            closeChat();
            act(k);
          };
          row.append(b);
        });
      el.append(row);
    }
    $("#companion-messages").append(el);
    while ($("#companion-messages").children.length > 30)
      $("#companion-messages").firstElementChild.remove();
    el.scrollIntoView({ block: "nearest" });
    return el;
  }
  function openChat() {
    chat.hidden = false;
    $("#companion-bubble").hidden = true;
    root.classList.remove("companion-near");
    $("#companion-question").focus();
    rig?.typing(true);
  }
  function closeChat() {
    chat.hidden = true;
    typing = false;
    rig?.typing(false);
    stopVoice();
    character.focus();
  }
  $("#companion-chat-close").onclick = closeChat;
  chat.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeChat();
  });
  $("#companion-question").oninput = () => {
    typing = true;
    rig?.typing(true);
  };
  $("#companion-question").onfocus = () => rig?.typing(true);
  $("#companion-question").onblur = () => {
    typing = false;
    rig?.typing(false);
  };
  function voiceStatus(text) {
    $("#companion-voice-state").hidden = false;
    $("#companion-voice-state").textContent = text;
  }
  function stopVoice() {
    voiceMode = false;
    recognition?.abort();
    recognition = null;
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    $("#companion-stop-voice").hidden = true;
    $("#companion-open-voice").setAttribute("aria-pressed", "false");
    status();
  }
  function listen() {
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Speech) {
      voiceStatus(
        "Voice input is unavailable in this browser. You can type below.",
      );
      voiceMode = false;
      return;
    }
    recognition = new Speech();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onstart = () => voiceStatus("Listening… speak your question.");
    recognition.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++)
        text += e.results[i][0].transcript;
      if (e.results[e.results.length - 1].isFinal) {
        $("#companion-question").value = "";
        ask(text);
      } else $("#companion-question").value = text;
    };
    recognition.onerror = (e) => {
      voiceStatus(
        e.error === "not-allowed"
          ? "Microphone permission was not granted. You can type below."
          : "Voice input stopped. Press the voice icon to try again.",
      );
      voiceMode = false;
      $("#companion-stop-voice").hidden = true;
    };
    recognition.onend = () => {
      if (voiceMode && !busy && !voiceSpeaking)
        voiceStatus("Tap the voice icon to speak again.");
    };
    try {
      recognition.start();
    } catch {
      voiceStatus("Voice input could not start. You can type below.");
      voiceMode = false;
    }
  }
  function speakReply(text) {
    if (!voiceMode || !("speechSynthesis" in window)) return;
    voiceSpeaking = true;
    recognition?.abort();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.98;
    utterance.onend = () => {
      voiceSpeaking = false;
      if (voiceMode) {
        voiceStatus("Ready. Tap the voice icon for your next question.");
      }
    };
    utterance.onerror = () => {
      voiceSpeaking = false;
      voiceStatus("The reply is available in the chat.");
    };
    voiceStatus("Speaking · standard device voice");
    speechSynthesis.speak(utterance);
  }
  $("#companion-open-voice").onclick = () => {
    openChat();
    if (voiceMode) {
      stopVoice();
      voiceStatus("Voice chat stopped.");
    } else {
      voiceMode = true;
      $("#companion-stop-voice").hidden = false;
      $("#companion-open-voice").setAttribute("aria-pressed", "true");
      listen();
    }
  };
  $("#companion-stop-voice").onclick = () => {
    stopVoice();
    voiceStatus("Voice chat stopped.");
  };
  function localAnswer(q) {
    const t = q.toLowerCase();
    if (/bump|boom.?box|personali[sz]/.test(t))
      return {
        answer:
          "Click a Bumpboxx in the DJ room to open its merch page. Shop Bumpboxx takes you to the official store for available models and colors. Customization depends on the current official options.",
        actions: ["boom", "dj"],
      };
    if (
      /giveaway|discount|subscription|subscrib|member|join|sign.?up|account/.test(
        t,
      )
    )
      return {
        answer:
          "Start your preview Stamp Book with a display name under Account. Paid subscriptions, project discounts and giveaways are planned; there are no active offers or paid sign-ups in this prototype.",
        actions: ["member"],
      };
    if (/stamp|reward|credit/.test(t))
      return {
        answer:
          "Open five different releases for Crate Digger, explore four landmark views for Street Certified, listen for 60 seconds for The Truth, or make four manual DJ cuts for Chopped In. Stamps stay in your book; separate credits can be spent on demo rewards. Official approval stamps need verified awards.",
        actions: ["member", "crate", "dj"],
      };
    if (/shirt|hood|apparel|merch|clothes|sweater/.test(t))
      return {
        answer:
          "The apparel rack in the record shop opens the ABN merch concepts. Choose a size and save favorites. Apparel checkout and final products are not live yet.",
        actions: ["merch"],
      };
    if (/scratch|chop|screw|turntable|pitch|cross.?fad|djay|\bdj\b/.test(t))
      return {
        answer:
          "Enter the DJ room, then select a turntable to open the mixer. Both decks play Boss Ballin; B starts one beat ahead. Lower the linked pitch for the screwed sound, cut A/B to chop, and drag a platter forward or backward to scratch.",
        actions: ["dj"],
      };
    if (/video|youtube|screen/.test(t))
      return {
        answer:
          "The screening room opens a projector-view theater with an in-room YouTube screen, film strip above the screen and dimmed lights. The companion joins you in a seat with popcorn. Choose a video in the carousel; use Fullscreen to expand the whole theater.",
        actions: ["screens"],
      };
    if (/street|city|houston|stadium|reliant|astrodome|transco|roof/.test(t))
      return {
        answer:
          "Go through the back door to explore Houston. The landmark buttons reach the skyline, Be Someone bridge, Transco, Reliant, Astrodome, ballpark and Rockets arena. Reliant and the ballpark have roof controls.",
        actions: ["street"],
      };
    if (/relief|giving|charity|trae day/.test(t))
      return {
        answer:
          "Visit the Giving wing for the Relief Gang, Angel By Nature and Trae Day map pins. The ledger is a demonstration, not live fundraising totals.",
        actions: ["giving"],
      };
    if (/are you trae|real trae|personally/.test(t))
      return {
        answer:
          "I’m the illustrated site companion, not Trae personally. I can help you navigate this prototype.",
        actions: ["chat"],
      };
    const tokens = t
      .replace(/[^a-z0-9 ]/g, " ")
      .split(/\s+/)
      .filter(
        (v) =>
          v.length > 2 &&
          ![
            "the",
            "tha",
            "what",
            "when",
            "tell",
            "about",
            "music",
            "record",
            "release",
            "project",
            "album",
            "year",
          ].includes(v),
      );
    const found = releases
      .map((r) => ({
        r,
        n: tokens.filter((v) => r.title.toLowerCase().includes(v)).length,
      }))
      .filter((v) => v.n > 0)
      .sort((a, b) => b.n - a.n)[0];
    if (found) {
      activeProject = found.r;
      return {
        answer:
          activeProject.title +
          " is listed in the local catalog as " +
          activeProject.year +
          " / " +
          (activeProject.type || "release") +
          ". Open the sleeve to see its available tracklist. Boss Ballin is the playback preview for all releases right now.",
        actions: ["record", "crate"],
      };
    }
    return {
      answer:
        "I can help with the release catalog, DJ controls, videos, Houston landmarks, Bumpboxx, apparel or stamps. Ask about one of those and I’ll point you there.",
      actions: ["crate", "dj", "member"],
    };
  }
  async function ask(question) {
    if (busy) return;
    const q = question.trim().slice(0, 800);
    if (!q) return;
    busy = true;
    $("#companion-send").disabled = true;
    addMessage(q, "user");
    const thinking = addMessage("Checking the room…");
    let result = localAnswer(q),
      live = false;
    try {
      if (remoteAvailable) {
        const response = await fetch("/api/companion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: q, history: chatHistory.slice(-6) }),
          signal: AbortSignal.timeout(12000),
        });
        if (
          response.ok &&
          response.headers.get("content-type")?.includes("application/json")
        ) {
          const v = await response.json();
          if (typeof v.answer === "string" && v.answer.trim()) {
            result = {
              answer: v.answer.slice(0, 3000),
              actions: result.actions,
            };
            live = true;
          }
        } else remoteAvailable = false;
      }
    } catch {
      remoteAvailable = false;
    } finally {
      thinking.remove();
      addMessage(result.answer, "guide", result.actions);
      chatHistory.push(
        { role: "user", content: q },
        { role: "assistant", content: result.answer },
      );
      chatHistory = chatHistory.slice(-6);
      $("#companion-engine").textContent = live
        ? "SITE GUIDE / AI CONNECTED"
        : "SITE GUIDE / LOCAL PREVIEW";
      $("#companion-engine").textContent = live
        ? "AI SITE GUIDE · NOT TRAE PERSONALLY"
        : "LOCAL CATALOG GUIDE · AI NOT CONNECTED";
      busy = false;
      $("#companion-send").disabled = false;
      $("#companion-question").focus();
      speakReply(result.answer);
    }
  }

  $("#companion-chat-form").onsubmit = (e) => {
    e.preventDefault();
    const q = $("#companion-question").value;
    $("#companion-question").value = "";
    ask(q);
  };
  // The doorway is a reversible bridge between the page companion and its in-room counterpart.
  let portalPhase = "arriving",
    inWorld = false,
    portalToken = 0,
    worldSeat = false;
  const home = $("#companion-home");
  home.innerHTML = `<div class="companion-doorway" aria-hidden="true"><div class="companion-door-depth"></div><div class="companion-door-leaf"><span>ABN</span><i></i></div><div class="companion-door-lintel"></div></div><button id="companion-portal-marker" class="companion-portal-marker" aria-label="Companion doorway. Choose where to meet him." aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M7 20V4l10-2v18M4 20h16M13 10v3"/></svg><span>THE WAY IN</span></button><div class="companion-portal-menu" id="companion-portal-menu" hidden><small>MEET ME INSIDE.</small><button data-guide-destination="0">The record shop ↘</button><button data-guide-destination="1">The DJ booth ↘</button><button data-guide-destination="2">The screening room ↘</button></div>`;
  const worldTools = document.createElement("div");
  worldTools.className = "world-guide-tools";
  worldTools.hidden = true;
  worldTools.innerHTML =
    '<button id="companion-world-ask">✦ Ask the companion</button><button id="companion-world-home">↥ Back upstairs</button><button id="companion-world-putaway">Put companion away</button>';
  $(".room-wrap").append(worldTools);
  $("#companion-world-putaway").onclick = putAway;
  function setPortalState(state) {
    portalPhase = state;
    root.dataset.journey = state;
    home.dataset.journey = state;
    if (state !== "outside")
      $("#companion-portal-marker").setAttribute("aria-expanded", "false");
    $("#companion-portal-marker").setAttribute(
      "aria-label",
      inWorld
        ? "Call the companion back upstairs"
        : "Companion doorway. Choose where to meet him.",
    );
    $("#companion-portal-marker span").textContent = inWorld
      ? "CALL HIM BACK"
      : "THE WAY IN";
  }
  const portalWait = (ms) =>
    new Promise((resolve) => setTimeout(resolve, appState.calm ? 0 : ms));
  async function emerge() {
    const token = ++portalToken;
    setPortalState("arriving");
    root.classList.add("portal-born");
    home.classList.add("door-present");
    await portalWait(250);
    if (token !== portalToken) return;
    home.classList.add("door-open");
    await portalWait(700);
    if (token !== portalToken) return;
    root.classList.remove("portal-born");
    root.classList.add("portal-emerging");
    pose(0);
    await portalWait(1150);
    if (token !== portalToken) return;
    home.classList.remove("door-open");
    pose(3);
    await portalWait(700);
    if (token !== portalToken) return;
    home.classList.remove("door-present");
    root.classList.remove("portal-emerging");
    setPortalState("outside");
    pose(0);
    if (appState.station === 2 && !inWorld) enterPortal(2);
  }
  async function enterPortal(destination = 0) {
    if (hidden) return;
    if (["entering", "arriving"].includes(portalPhase)) return;
    if (!sceneAPI) {
      setMode("standard");
      showThought(
        "The room is in Standard mode. You can still chat and explore the archive.",
        "crate",
      );
      return;
    }
    const token = ++portalToken;
    cancelSequence();
    closeChat();
    $("#companion-portal-menu").hidden = true;
    $("#companion-bubble").hidden = true;
    inWorld = false;
    sceneAPI.setGuideVisible?.(false);
    root.classList.remove("companion-in-world");
    worldTools.hidden = true;
    dockHome();
    home.classList.add("door-present", "door-open");
    setPortalState("entering");
    pose(4);
    await portalWait(650);
    if (token !== portalToken) return;
    root.classList.add("portal-entering");
    await portalWait(800);
    if (token !== portalToken) return;
    home.classList.remove("door-open");
    await portalWait(550);
    if (token !== portalToken) return;
    home.classList.remove("door-present");
    root.classList.remove("portal-entering");
    inWorld = true;
    homeDocked = false;
    setPortalState("inside");
    root.classList.add("companion-in-world");
    attach();
    character.setAttribute("aria-hidden", "true");
    character.tabIndex = -1;
    setMode("immersive");
    go(destination);
    sceneAPI.guideTravel?.(destination);
    worldTools.hidden = false;
    $(".room-wrap").scrollIntoView({
      behavior: appState.calm ? "auto" : "smooth",
      block: "start",
    });
  }
  async function returnFromWorld() {
    if (portalPhase === "entering") return;
    portalToken++;
    inWorld = false;
    if (appState.station === 2) go(0);
    worldSeat = false;
    rig?.cinema?.(false, false);
    sceneAPI?.setGuideVisible?.(false);
    root.classList.remove("companion-in-world", "portal-entering");
    character.removeAttribute("aria-hidden");
    character.tabIndex = 0;
    worldTools.hidden = true;
    dockHome();
    $(".intro").scrollIntoView({
      behavior: appState.calm ? "auto" : "smooth",
      block: "start",
    });
    emerge();
  }
  function guideArrived(seated) {
    worldSeat = seated;
    rig?.cinema?.(seated, Boolean(cinemaState?.playing));
    if (!seated) pose(3);
  }
  function guidePosition(x, y, visible) {
    if (!inWorld) return;
    root.style.position = "fixed";
    root.style.left = x - 66 + "px";
    root.style.top = y - 176 + "px";
    root.style.bottom = "auto";
    root.style.visibility = visible ? "visible" : "hidden";
    constrainThought();
  }
  home.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      $("#companion-portal-menu").hidden = true;
      $("#companion-portal-marker").setAttribute("aria-expanded", "false");
      $("#companion-portal-marker").focus();
    }
  });
  $("#companion-portal-marker").onclick = () => {
    if (inWorld) {
      returnFromWorld();
      return;
    }
    const menu = $("#companion-portal-menu");
    menu.hidden = !menu.hidden;
    $("#companion-portal-marker").setAttribute(
      "aria-expanded",
      String(!menu.hidden),
    );
  };
  $$("[data-guide-destination]").forEach(
    (b) => (b.onclick = () => enterPortal(+b.dataset.guideDestination)),
  );
  $("#companion-world-ask").onclick = openChat;
  $("#companion-world-home").onclick = returnFromWorld;
  document.addEventListener("truth-station", (e) => {
    if (inWorld) {
      worldSeat = false;
      rig?.cinema?.(false, false);
      sceneAPI?.guideTravel?.(e.detail);
      worldTools.hidden = e.detail === 3;
    }
  });
  document.addEventListener("truth-cinema", (e) => {
    rig?.cinema?.(worldSeat, Boolean(e.detail.playing));
    if (e.detail.ended && inWorld && worldSeat) {
      rig?.cinema?.(true, false, true);
      const next = (cinemaState.selected + 1) % screeningVideos.length;
      showThought(
        "One more? Try " + screeningVideos[next].title + ".",
        "screens",
      );
      $("#companion-cta small").textContent = "Play next video ↗";
      $("#companion-cta").onclick = () => {
        $("#companion-bubble").hidden = true;
        video(next);
      };
    }
  });
  document.addEventListener("truth-guide-screening", () => {
    if (hidden) return;
    if (inWorld) {
      if (appState.station !== 2) go(2);
      else if (!worldSeat) sceneAPI?.guideTravel?.(2);
    } else if (portalPhase === "outside") enterPortal(2);
  });
  const savedPointerUp = character.onpointerup;
  character.onpointerup = (e) => {
    const wasDragged = dragged;
    savedPointerUp(e);
    if (wasDragged) {
      const r = $("#companion-portal-marker").getBoundingClientRect();
      if (
        e.clientX >= r.left - 22 &&
        e.clientX <= r.right + 22 &&
        e.clientY >= r.top - 24 &&
        e.clientY <= r.bottom + 24
      )
        enterPortal(appState.station === 2 ? 2 : 0);
    }
  };
  sceneAPI?.installGuide?.({
    canvas: $("#companion-model"),
    onSelect: openChat,
    onPosition: guidePosition,
    onArrive: guideArrived,
  });
  dockHome();
  pose(0);
  status();
  attach();
  buildCompanionIllustration($("#companion-model"), {
    still,
    hidden: () => hidden,
    cover: () => activeProject.cover,
    ready: () => root.classList.add("companion-animated"),
  }).then((model) => {
    rig = model;
    rig?.pose(frame);
    if (!hidden) emerge();
    else {
      root.classList.remove("portal-born");
      setPortalState("outside");
    }
  });
  setInterval(() => {
    status();
    if (
      still() ||
      drag ||
      inWorld ||
      portalPhase !== "outside" ||
      !chat.hidden ||
      document.querySelector("dialog[open]")
    )
      return;
    ticks++;
    if (performance.now() > poseLockUntil) {
      const phase = ticks % 22;
      if (phase === 3) pose(1);
      if (phase === 6) pose(2);
      if (phase === 9) pose(0);
      if (phase === 14) pose(3);
      if (phase === 17) pose(0);
      if (ticks % 45 === 0)
        perform(["boom", "record", "merch", "member"][cycle++ % 4]);
    }
    if (ticks - lastSpark >= 23) {
      lastSpark = ticks;
      root.classList.remove("companion-twinkle");
      void root.offsetWidth;
      root.classList.add("companion-twinkle");
      setTimeout(() => root.classList.remove("companion-twinkle"), 2000);
    }
  }, 1000);
}
initCompanion();

const deepLink = location.hash.match(/^#release=(\d+)$/);
if (deepLink && releases[+deepLink[1]]) release(releases[+deepLink[1]]);
