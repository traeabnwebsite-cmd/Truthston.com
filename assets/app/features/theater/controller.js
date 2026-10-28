import { $ as query, $$ as queryAll, esc } from "../../core/dom.js";
import { createLifetime } from "../../core/lifecycle.js";
import { createYouTubeProvider } from "./youtube.js";
export function createCinemaController({
  screeningVideos,
  appState,
  getWorld = () => null,
  setMode,
  go,
  pauseRoomForVideo,
  earn,
  environment = {},
}) {
  const {
    $ = query,
    $$ = queryAll,
    document = globalThis.document,
    window = globalThis.window,
    location = globalThis.location,
    Event = globalThis.Event,
    CustomEvent = globalThis.CustomEvent,
  } = environment;
  const lifetime = createLifetime(),
    provider = createYouTubeProvider({ window, document });
  let mounted = false;
  const cinemaState = {
    active: false,
    playing: false,
    selected: -1,
    player: null,
  };
  function setupCinema() {
    if (mounted) return;
    mounted = true;
    const room = $(".room-wrap"),
      host = document.createElement("div");
    host.id = "room-cinema";
    host.hidden = true;
    host.setAttribute("aria-label", "Theater screen");
    (room.querySelector?.(".world-stage") || room).append(host);
    const browse = document.createElement("div");
    browse.id = "cinema-browse-zone";
    browse.innerHTML =
      '<button id="cinema-browse-toggle" aria-expanded="true" aria-controls="cinema-carousel">Browse films <span>⌄</span></button>';
    (room.querySelector?.(".world-stage") || room).append(browse);
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
    lifetime.add(() => clearTimeout(hideMenu));
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
    (room.querySelector?.(".world-stage") || room).append(controls);
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
    lifetime.listen(document, "truth-station", (e) => {
      document.body.classList.toggle("theater-mode", e.detail === 2);
      document.body.classList.toggle("in-screening-room", e.detail === 2);
      if (e.detail === 2) {
        menu(!cinemaState.active);
        document.dispatchEvent(new Event("truth-guide-screening"));
        room.scrollIntoView({ block: "start" });
      } else stopCinema();
    });
  }
  let cinemaSerial = 0;
  const loadYouTubeAPI = provider.load;
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
    getWorld()?.setCinemaLights?.(false);
    document.body.classList.remove("cinema-playing");
    $(".room-wrap")._cinemaMenu?.(true);
    $("#cinema-now") &&
      ($("#cinema-now").textContent = "Choose a video from the carousel.");
  }
  async function video(i = 0) {
    if (!screeningVideos.length) return;
    if ($("#modal").open) $("#modal").close();
    if (getWorld() && appState.mode !== "immersive") setMode("immersive");
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
    getWorld()?.setCinemaLights?.(true);
    getWorld()?.theaterView?.();
    document.dispatchEvent(new Event("truth-guide-screening"));
    $$("[data-cinema-video]").forEach((b) =>
      b.setAttribute("aria-current", String(+b.dataset.cinemaVideo === i)),
    );
    $("#cinema-now").textContent = "LOADING / " + selected.title;
    $("#cinema-external").hidden = false;
    $("#cinema-external").href =
      "https://www.youtube.com/watch?v=" + selected.id;
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
  return {
    state: cinemaState,
    mount: setupCinema,
    open: video,
    stop: stopCinema,
    destroy() {
      stopCinema();
      provider.destroy();
      lifetime.dispose();
      ["#room-cinema", "#cinema-browse-zone", "#cinema-controls"].forEach((s) =>
        $(s)?.remove(),
      );
      delete $(".room-wrap")._cinemaMenu;
      document.body.classList.remove("theater-mode", "in-screening-room");
      mounted = false;
    },
  };
}
