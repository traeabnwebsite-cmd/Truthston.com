import test from "node:test";
import assert from "node:assert/strict";
import { createCinemaController } from "../assets/app/features/theater/controller.js";
import { screenTransform } from "../assets/app/features/theater/projection.js";
function harness() {
  const events = [],
    classes = new Set(),
    elements = new Map();
  let callbacks;
  const element = () => ({
    hidden: false,
    textContent: "",
    dataset: {},
    style: {},
    children: [],
    classList: {
      add(...v) {
        v.forEach((k) => classes.add(k));
      },
      remove(...v) {
        v.forEach((k) => classes.delete(k));
      },
    },
    setAttribute(k, v) {
      this[k] = v;
    },
    replaceChildren(...v) {
      this.children = v;
    },
    append(...v) {
      this.children.push(...v);
    },
    innerHTML: "",
  });
  for (const id of [
    "#room-cinema",
    "#cinema-now",
    "#cinema-external",
    "#modal",
    ".room-wrap",
  ])
    elements.set(id, element());
  const state = { active: false, playing: false, selected: -1, player: null },
    stats = { paused: 0, views: 0, dim: [], destroyed: 0 };
  const ctx = {
    console,
    Promise,
    AbortSignal,
    URL,
    location: { origin: "https://test.local" },
    cinemaState: state,
    screeningVideos: [
      { id: "J8fztJ29L7E", title: "Strapped Up" },
      { id: "QgZD5Uyg6t4", title: "Hit" },
    ],
    station: 2,
    mode: "immersive",
    appState: { station: 2, mode: "immersive" },
    sceneAPI: {
      setCinemaLights(v) {
        stats.dim.push(v);
      },
      theaterView() {
        stats.views++;
      },
    },
    $: (s) => elements.get(s),
    $$: () => [],
    setMode() {},
    go() {},
    pauseRoomForVideo() {
      stats.paused++;
    },
    earn() {},
    document: {
      body: element(),
      createElement: element,
      head: element(),
      dispatchEvent: (e) => events.push(e),
    },
    CustomEvent: class {
      constructor(type, v) {
        this.type = type;
        this.detail = v?.detail;
      }
    },
    Event: class {
      constructor(type) {
        this.type = type;
      }
    },
    window: {
      YT: {
        Player: class {
          constructor(iframe, options) {
            callbacks = options.events;
            this.iframe = iframe;
          }
          destroy() {
            stats.destroyed++;
          }
          playVideo() {}
        },
      },
    },
  };
  const controller = createCinemaController({
    screeningVideos: ctx.screeningVideos,
    appState: ctx.appState,
    getWorld: () => ctx.sceneAPI,
    setMode: ctx.setMode,
    go: ctx.go,
    pauseRoomForVideo: ctx.pauseRoomForVideo,
    earn: ctx.earn,
    environment: ctx,
  });
  Object.assign(state, controller.state);
  ctx.video = controller.open;
  ctx.stopCinema = controller.stop;
  return {
    ctx,
    state: controller.state,
    stats,
    events,
    elements,
    classes,
    callbacks: () => callbacks,
  };
}
test("theater selection embeds on the room screen and responds to real player states", async () => {
  const h = harness();
  await h.ctx.video(0);
  assert.equal(h.state.active, true);
  assert.equal(h.state.selected, 0);
  assert.equal(h.elements.get("#room-cinema").dataset.video, "J8fztJ29L7E");
  const iframe = h.elements.get("#room-cinema").children[0];
  assert.ok(
    iframe.src.startsWith("https://www.youtube-nocookie.com/embed/J8fztJ29L7E"),
  );
  assert.ok(iframe.src.includes("fs=0"));
  assert.deepEqual(h.stats.dim, [true]);
  h.callbacks().onStateChange({ data: 1 });
  assert.equal(h.state.playing, true);
  h.callbacks().onStateChange({ data: 2 });
  assert.equal(h.state.playing, false);
  h.callbacks().onStateChange({ data: 0 });
  assert.ok(h.events.some((e) => e.type === "truth-cinema" && e.detail.ended));
});
test("switching videos destroys the old player; lights-up stops playback and clears the screen", async () => {
  const h = harness();
  await h.ctx.video(0);
  await h.ctx.video(1);
  assert.equal(h.stats.destroyed, 1);
  assert.equal(h.state.selected, 1);
  h.ctx.stopCinema();
  assert.equal(h.state.active, false);
  assert.equal(h.state.player, null);
  assert.equal(h.elements.get("#room-cinema").hidden, true);
  assert.equal(h.stats.dim.at(-1), false);
  assert.equal(h.classes.has("cinema-playing"), false);
});
test("screen projection maps all four corners without reversing the image", () => {
  const p = [
    { x: 120, y: 75 },
    { x: 1180, y: 110 },
    { x: 1090, y: 690 },
    { x: 145, y: 650 },
  ];
  const m = screenTransform(p).slice(9, -1).split(",").map(Number);
  for (const [i, [x, y]] of [
    [0, [0, 0]],
    [1, [960, 0]],
    [2, [960, 540]],
    [3, [0, 540]],
  ]) {
    const divisor = m[3] * x + m[7] * y + m[15],
      px = (m[0] * x + m[4] * y + m[12]) / divisor,
      py = (m[1] * x + m[5] * y + m[13]) / divisor;
    assert.ok(Math.abs(px - p[i].x) < 0.01);
    assert.ok(Math.abs(py - p[i].y) < 0.01);
  }
  assert.equal(screenTransform([]), null);
});
test("late callbacks from a previous video cannot change the active selection", async () => {
  const h = harness();
  await h.ctx.video(0);
  const first = h.callbacks();
  await h.ctx.video(1);
  first.onStateChange({ data: 1 });
  assert.equal(h.state.playing, false);
  h.callbacks().onError();
  assert.match(h.elements.get("#cinema-now").textContent, /unavailable/);
  h.ctx.stopCinema();
});
