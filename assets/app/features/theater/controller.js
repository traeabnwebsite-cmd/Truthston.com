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
    const rail = document.createElement("aside");
    rail.id = "cinema-carousel";
    rail.setAttribute("aria-label", "Choose a film");
    rail.innerHTML = `<div class="cinema-rail-heading">ON SCREEN</div><button id="cinema-rail-up" aria-label="Previous videos">↑</button><div id="cinema-rail-scroll">${screeningVideos.map((v, i) => `<button class="cinema-pick" data-cinema-video="${i}" aria-current="false"><img loading="lazy" src="${esc(v.thumb)}" alt=""><span><b>${esc(v.title)}</b></span></button>`).join("")}</div><button id="cinema-rail-down" aria-label="More videos">↓</button>`;
    (room.querySelector?.(".world-stage") || room).append(rail);
    function menu(open) {
      room.classList.toggle("cinema-menu-open", open);
      rail.hidden = !open;
      rail.setAttribute("aria-hidden", String(!open));
      if (open) rail.removeAttribute("inert");
      else rail.setAttribute("inert", "");
    }
    room._cinemaMenu = menu;
    const controls = document.createElement("section");
    controls.id = "cinema-controls";
    controls.className = "world-menu-cinema";
    controls.innerHTML =
      '<h3>The screening room</h3><p id="cinema-now" role="status">Choose a video from the side rail.</p><div class="cinema-transport"><button id="cinema-rewind">↶ 10 seconds</button><button id="cinema-play-pause">Play / pause</button><button id="cinema-forward">10 seconds ↷</button></div><label>VIDEO POSITION<input type="range" id="cinema-seek" min="0" max="100" step=".1" value="0"></label><button id="cinema-stop">Lights up</button><button id="cinema-leave">Back to the shop</button><a id="cinema-external" target="_blank" rel="noopener noreferrer" hidden>Open on YouTube ↗</a>';
    (room.querySelector?.("#world-mobile-menu") || room).append(controls);
    $$("[data-cinema-video]").forEach(
      (b) => (b.onclick = () => video(+b.dataset.cinemaVideo)),
    );
    $("#cinema-rail-up").onclick = () =>
      $("#cinema-rail-scroll").scrollBy({
        top: -240,
        behavior: appState.calm ? "auto" : "smooth",
      });
    $("#cinema-rail-down").onclick = () =>
      $("#cinema-rail-scroll").scrollBy({
        top: 240,
        behavior: appState.calm ? "auto" : "smooth",
      });
    $("#cinema-stop").onclick = stopCinema;
    $("#cinema-leave").onclick = () => go(0);
    $("#cinema-play-pause").onclick = () => {
      if (cinemaState.playing) cinemaState.player?.pauseVideo?.();
      else cinemaState.player?.playVideo?.();
    };
    for (const [id, delta] of [
      ["#cinema-rewind", -10],
      ["#cinema-forward", 10],
    ])
      $(id).onclick = () => {
        const player = cinemaState.player;
        if (player?.getCurrentTime)
          player.seekTo(Math.max(0, player.getCurrentTime() + delta), true);
      };
    $("#cinema-seek").oninput = (event) => {
      const player = cinemaState.player;
      if (player?.getDuration)
        player.seekTo(
          (player.getDuration() * Number(event.target.value)) / 100,
          true,
        );
    };
    lifetime.interval(() => {
      const player = cinemaState.player,
        seek = $("#cinema-seek");
      if (player?.getDuration && seek && document.activeElement !== seek) {
        const duration = player.getDuration();
        seek.value = duration ? (player.getCurrentTime() / duration) * 100 : 0;
      }
    }, 1000);
    lifetime.listen(document, "truth-hud", (event) => {
      if (appState.station === 2) menu(event.detail.visible);
    });
    lifetime.listen(document, "truth-station", (e) => {
      document.body.classList.toggle("theater-mode", e.detail === 2);
      document.body.classList.toggle("in-screening-room", e.detail === 2);
      if (e.detail === 2) {
        menu(true);
        document.dispatchEvent(new Event("truth-guide-screening"));
        if (!room.classList.contains("fullscreen-active"))
          room.scrollIntoView({ block: "start" });
      } else stopCinema();
    });
  }
  let cinemaSerial = 0;
  const loadYouTubeAPI = provider.load;
  function cinemaPlaying(value, ended = false) {
    cinemaState.playing = value;

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
      ($("#cinema-now").textContent = "Choose a video from the side rail.");
  }
  async function video(i = 0) {
    if (!screeningVideos.length) return;
    if ($("#modal").open) $("#modal").close();
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
      "?enablejsapi=1&playsinline=1&rel=0&fs=0&controls=0&autoplay=1&origin=" +
      encodeURIComponent(location.origin);
    const touch = document.createElement("button");
    touch.className = "cinema-touch-surface";
    touch.setAttribute("aria-label", "Show theater menu and videos");
    touch.onclick = () =>
      document.dispatchEvent(new Event("truth-cinema-wake"));
    host.replaceChildren(iframe, touch);
    host.dataset.video = selected.id;
    $(".room-wrap")._cinemaMenu?.(false);
    document.activeElement?.blur();
    document.dispatchEvent(new Event("truth-cinema-selected"));
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
    browse() {
      if (appState.station !== 2) go(2);
      document.body.classList.add("theater-mode", "in-screening-room");
      $(".room-wrap")._cinemaMenu?.(true);
      if (!getWorld() && !cinemaState.active) {
        const host = $("#room-cinema");
        host.hidden = false;
        host.innerHTML =
          '<div class="cinema-welcome"><span>TRUTHSTON / SCREENING ROOM</span><h2>TAKE YOUR SEAT.</h2><p>Choose a film from the side rail.</p></div>';
      }
    },
    stop: stopCinema,
    destroy() {
      stopCinema();
      provider.destroy();
      lifetime.dispose();
      ["#room-cinema", "#cinema-carousel", "#cinema-controls"].forEach((s) =>
        $(s)?.remove(),
      );
      delete $(".room-wrap")._cinemaMenu;
      document.body.classList.remove("theater-mode", "in-screening-room");
      mounted = false;
    },
  };
}
