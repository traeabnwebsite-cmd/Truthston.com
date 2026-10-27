import { $, $$ } from "../../core/dom.js";
import { createLifetime } from "../../core/lifecycle.js";
export const stationPosition = (i) =>
  [
    [-4, 0, -3],
    [-5, 0, -1],
    [4, 0, -3],
    [3, 0, -5],
    [-3, 0, -2],
    [4, 0, -1],
  ][i] || [0, 0, 0];
export function createPlayerDock({ audio, appState, earn, updateDJ }) {
  const lifetime = createLifetime();
  const cassette = false;
  let spin = 0,
    spinSpeed = 0,
    acc = 0,
    last = performance.now();
  function syncLabels() {
    const title = audio.providedTrack
      ? audio.previewTrack.title
      : "Original room beat";
    $("#track-title").textContent = title;
    $("#track-subtitle").textContent = audio.previewBusy
      ? "LOADING YOUR PREVIEW RECORD…"
      : audio.providedTrack
        ? "PREVIEW RECORD / BOTH DECKS LOADED"
        : "GENERATED BEAT / AUDIO FILE UNAVAILABLE";
    $("#play").textContent = audio.previewBusy
      ? "…"
      : audio.playing
        ? "Ⅱ"
        : "▶";
    $("#play").setAttribute(
      "aria-label",
      audio.previewBusy
        ? "Loading preview track"
        : audio.playing
          ? "Pause"
          : "Press play",
    );
    $("#fullscreen-play").textContent = audio.previewBusy
      ? "Loading…"
      : audio.playing
        ? "Ⅱ Pause"
        : "▶ Press play";
    for (const el of [$("#play"), $("#fullscreen-play")])
      el.disabled = audio.previewBusy;
    for (let i = 0; i < 2; i++) {
      const el = $("#deck-" + i + "-transport");
      if (el) {
        el.textContent = audio.decks[i].running ? "Ⅱ Pause" : "▶ Start";
        el.setAttribute("aria-pressed", String(audio.decks[i].running));
      }
    }
    $("#time").textContent =
      audio.clockText(audio.position()) +
      " / " +
      audio.clockText(audio.audioDuration());
    $(".dock").dataset.audioStatus = audio.previewBusy
      ? "loading"
      : audio.playing
        ? "playing"
        : "paused";
    $(".dock").dataset.track = title;
    $(".dock").dataset.bpm = String(audio.previewTrack.bpm);

    for (let i = 0; i < 2; i++) {
      const d = audio.decks[i];
      const slider = $("#pitch-" + i),
        read = $("#pitch-read-" + i);
      if (slider) slider.value = Math.round(d.pitch * 100);
      if (read)
        read.textContent =
          (d.pitch >= 1 ? "+" : "") + Math.round((d.pitch - 1) * 100) + "%";
      const speedRead = $("#deck-" + i + "-speed");
      if (speedRead)
        speedRead.textContent =
          (audio.previewTrack.bpm * d.pitch).toFixed(1) + " BPM";
    }
    const fader = $("#crossfader");
    if (fader) fader.value = audio.crossfade;
    const read = $("#crossfade-read");
    if (read)
      read.textContent =
        audio.crossfade < -0.95
          ? "A ONLY"
          : audio.crossfade > 0.95
            ? "B ONLY"
            : audio.crossfade < -0.15
              ? "A " + Math.round(((1 - audio.crossfade) / 2) * 100) + "%"
              : audio.crossfade > 0.15
                ? "B " + Math.round(((audio.crossfade + 1) / 2) * 100) + "%"
                : "CENTER MIX";
    $(".dock").dataset.crossfader = String(audio.crossfade);

    const b = $("#auto-chop");
    if (b) {
      b.textContent = audio.chopTimer ? "Stop chop" : "Auto chop";
      b.setAttribute("aria-pressed", String(!!audio.chopTimer));
    }
  }
  $("#play").onclick = () => audio.play();
  $("#fullscreen-play").onclick = () => audio.play();
  $("#fullscreen-volume").oninput = (e) => {
    $("#volume").value = e.target.value;
    audio.setVolume(+e.target.value);
  };
  $("#volume").oninput = (e) => {
    $("#fullscreen-volume").value = e.target.value;
    audio.gain?.gain.setTargetAtTime(
      +e.target.value,
      audio.ctx.currentTime,
      0.03,
    );
  };
  $("#seek").oninput = (e) => {
    if (!audio.buffer) return;
    const p = (+e.target.value / 100) * audio.audioDuration(),
      was = audio.playing;
    if (was) {
      audio.stopDeck(0);
      audio.stopDeck(1);
      const when = audio.ctx.currentTime + 0.025;
      audio.startDeck(0, p, when);
      audio.startDeck(1, p + 60 / audio.previewTrack.bpm, when);
    } else {
      audio.decks[0].offset = p;
      audio.decks[1].offset = audio.wrapPosition(
        p + 60 / audio.previewTrack.bpm,
      );
    }
    audio.syncAudioLabels();
  };
  $("#headphones").onclick = () => {
    audio.headphones = !audio.headphones;
    $("#headphones").setAttribute("aria-pressed", audio.headphones);
    audio.route();
    audio.setSpatialPosition(stationPosition(appState.station));
  };

  lifetime.add(audio.subscribe(syncLabels));
  lifetime.interval(() => {
    const now = performance.now(),
      dt = Math.min(0.25, (now - last) / 1000);
    last = now;
    if (document.hidden) return;
    updateDJ(dt);
    spinSpeed +=
      (audio.playing ? audio.rate - spinSpeed : -spinSpeed) *
      Math.min(1, dt * 4);
    spin += spinSpeed * dt * 160;
    const plat = $("#platter");
    if (plat && !appState.calm) {
      if (cassette)
        $$(".reel").forEach((r) => (r.style.transform = `rotate(${spin}deg)`));
      else plat.style.transform = `rotate(${spin}deg)`;
    }
    if (audio.playing) {
      const p = audio.position();
      $("#seek").value = (p / audio.audioDuration()) * 100;
      $("#time").textContent =
        audio.clockText(p) + " / " + audio.clockText(audio.audioDuration());
      acc += dt;
      if (acc >= 6) {
        earn(2);
        acc = 0;
      }
    }
  }, 50);
  syncLabels();
  return {
    get spinSpeed() {
      return spinSpeed;
    },
    destroy() {
      lifetime.dispose();
      [
        "#play",
        "#fullscreen-play",
        "#volume",
        "#fullscreen-volume",
        "#seek",
        "#headphones",
      ].forEach((s) => {
        const el = $(s);
        el.onclick = null;
        el.oninput = null;
      });
    },
  };
}
