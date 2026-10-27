import { createLazyFeature } from "./core/lazy-feature.js";
import { createCompanion } from "./features/companion/controller.js";
import { createScreeningCatalog } from "./features/theater/catalog.js";
import { createCinemaController } from "./features/theater/controller.js";
import { createAudioEngine } from "./features/audio/engine.js";
import { createPlayerDock } from "./features/audio/dock.js";
import { createDJMixer } from "./features/dj/mixer.js";
import { loadGalleryCuration } from "./features/editorial/gallery.js";
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
let sceneAPI, worldLoader;
const audio = createAudioEngine({
  initialVolume: +$("#volume").value,
  toast,
  earn,
  recordActivity: (...args) => account.recordEvent(...args),
});
const dj = createDJMixer({ audio, appState, modal });
const playerDock = createPlayerDock({
  audio,
  appState,
  earn,
  updateDJ: dj.update,
});

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

const galleryCuration = await loadGalleryCuration();
const editorial = createEditorialPage({
  galleryCuration,
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
  if (audio.playing && !document.hidden) account.tickListening();
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
  play: (...args) => audio.play(...args),
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

const screeningVideos = createScreeningCatalog(data);
const cinema = createCinemaController({
  screeningVideos,
  appState,
  getWorld: () => sceneAPI,
  setMode,
  go,
  pauseRoomForVideo,
  earn,
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
  $("#fallback-turntables").onclick = dj.open;
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
  if (!audio.playing) return;
  audio.stopDeck(0);
  audio.stopDeck(1);
  audio.stopAutoChop();
  audio.syncAudioLabels();
}

screeningVideos.forEach((v, i) =>
  twin("Watch video: " + v.title, () => cinema.open(i)),
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
twin("DJ booth turntables and mixer", dj.open);
twin("Enter the screening room", () => go(2));
twin("Return to the record shop", () => go(0));
twin("Back door to Houston street", () => go(3));
// One supplied record, two transport heads. Both decks share a single decoded AudioBuffer.

$("#deck").onclick = enterDJRoom;
$("#open-dj-mixer").onclick = dj.open;
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
  if (m === "immersive") {
    if (sceneAPI) sceneAPI.resume();
    else {
      document.body.classList.add("flat");
      worldLoader?.load();
    }
  } else sceneAPI?.suspend();
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
    if (i === 2) cinema.open(0);
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

cinema.mount();
const companion = createCompanion({
  releases,
  getWorld: () => sceneAPI,
  commerce,
  enterDJRoom,
  release,
  accountRoute,
  go,
  setMode,
  appState,
  cinema,
  screeningVideos,
});

worldLoader = createLazyFeature({
  load: async () => {
    const { createWorld } = await import("./world/controller.js");
    return createWorld({
      releases,
      release,
      dj,
      go,
      twin,
      rand,
      commerce,
      cinema,
      today,
      timeline,
      modal,
      giving,
      data,
      audio,
      appState,
      playerDock,
      setMode,
      autoStart: false,
    });
  },
  onReady(world) {
    sceneAPI = world;
    document.dispatchEvent(new Event("truth-room-ready"));
    world.travel(appState.station);
    for (let i = 0; i < 4; i++)
      if (appState.score >= (i + 1) * 25) world.unlock(i);
    if (appState.mode === "immersive") {
      document.body.classList.remove("flat");
      world.resume();
    }
  },
  onError(error) {
    console.warn("Room fallback:", error);
    $("#loading")?.remove();
    if (appState.mode === "immersive") {
      setMode("standard");
      toast("3D is unavailable. The full archive is open in Standard mode.");
    }
  },
});
if (appState.calm) setMode("reduced");
else if (innerWidth < 650) setMode("standard");
else if (appState.mode === "immersive") worldLoader.load();
// The companion is an illustrated site guide, not a direct chat with Trae. All destinations are allowlisted.
// Retain the approved illustrated character. Canvas layers provide light limb/head motion without a card flip.

const deepLink = location.hash.match(/^#release=(\d+)$/);
if (deepLink && releases[+deepLink[1]]) release(releases[+deepLink[1]]);
