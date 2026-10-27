import { $, $$ } from "../../core/dom.js";
import { createLifetime } from "../../core/lifecycle.js";
export function createDJMixer({ audio, appState, modal }) {
  const lifetime = createLifetime();
  let lastTap = 0,
    tapIntervals = [];
  function deckMarkup(i) {
    return `<section class="dj-turntable" aria-label="Deck ${i ? "B" : "A"}"><div class="dj-model">DIRECT DRIVE <b>${i ? "B / +1 BEAT" : "A / MASTER"}</b></div><div class="dj-hardware"><div class="dj-arm"><i></i></div><div class="dj-vinyl" id="platter-${i}" role="slider" tabindex="0" aria-label="Deck ${i ? "B" : "A"} scratch. Drag in circles; left and right arrows scratch backward and forward." aria-valuemin="0" aria-valuemax="318" aria-valuenow="0"><div class="dj-record-label"><small>ABN / PREVIEW RECORD</small><b>BOSS<br>BALLIN</b><span>33⅓ / SIDE ${i ? "B" : "A"}</span></div></div><label class="dj-pitch">PITCH<input type="range" id="pitch-${i}" aria-label="Deck ${i ? "B" : "A"} pitch" min="50" max="116" step="1" value="${Math.round(audio.decks[i].pitch * 100)}"><output id="pitch-read-${i}">${Math.round((audio.decks[i].pitch - 1) * 100)}%</output></label></div><div class="dj-bottom"><button class="dj-start" id="deck-${i}-transport" aria-pressed="${audio.decks[i].running}">${audio.decks[i].running ? "Ⅱ Pause" : "▶ Start"}</button><span class="dj-strobe">● 33⅓</span><output id="deck-${i}-speed">${(audio.previewTrack.bpm * audio.decks[i].pitch).toFixed(1)} BPM</output></div><div class="dj-readout"><output id="deck-${i}-time">0:00.0</output><span id="deck-${i}-state">READY</span></div></section>`;
  }
  function deck() {
    modal(
      `<div class="dj-console"><span class="eyebrow">THE DJ BOOTH / TWO COPIES. ONE RECORD.</span><h2>Slow it down.<br>Chop it up.</h2><p class="dj-intro">Boss Ballin on both decks. B runs one beat ahead. Cut between A and B to repeat the phrase. Pitch changes speed and tone together.</p><div class="dj-rig">${deckMarkup(0)}<section class="dj-mixer" aria-label="DJ mixer"><div class="dj-mixer-brand">THE TRUTH<br><small>HOUSTON / TWO-DECK MIXER</small></div><button class="primary" id="dj-both">${audio.playing ? "Ⅱ Pause both" : "▶ Play both"}</button><label class="dj-link"><input type="checkbox" id="link-pitch" ${audio.pitchLinked ? "checked" : ""}> Link pitch</label><div class="dj-presets"><button data-dj-preset="1">Original</button><button data-dj-preset=".75">Screw 75%</button><button data-dj-preset=".65">Deep 65%</button></div><label class="dj-tempo">RECORD TEMPO<input id="dj-bpm" aria-label="Record tempo in beats per minute" type="number" min="40" max="180" step=".1" value="${audio.previewTrack.bpm}"></label><small class="dj-hint">Estimated tempo. Adjust or tap to match the beat.</small><button class="secondary" id="dj-tap">Tap tempo</button><button class="secondary" id="dj-sync">B + one beat</button><div class="dj-fader"><div><b>A</b><output id="crossfade-read">A ONLY</output><b>B</b></div><input id="crossfader" aria-label="Crossfader, left Deck A, right Deck B" type="range" min="-1" max="1" step=".01" value="${audio.crossfade}"><div class="dj-cuts"><button id="cut-a">Cut A [1]</button><button id="cut-b">Cut B [2]</button></div></div><button class="secondary" id="auto-chop" aria-pressed="${!!audio.chopTimer}">${audio.chopTimer ? "Stop chop" : "Auto chop"}</button></section>${deckMarkup(1)}</div><p class="dj-footnote">Drag either record to scratch forward or backward. Release to resume at its pitch setting. Keyboard: focus a record and use ← / →. The fader also works with arrow keys.</p></div>`,
    );
    for (let i = 0; i < 2; i++) {
      const p = $("#platter-" + i),
        d = audio.decks[i];
      $("#deck-" + i + "-transport").onclick = () => audio.toggleDeck(i);
      $("#pitch-" + i).oninput = (e) => {
        audio.setDeckPitch(i, +e.target.value / 100);
        if (audio.pitchLinked) audio.setDeckPitch(1 - i, audio.decks[i].pitch);
      };
      let angleLast = 0,
        timeLast = 0,
        wasRunning = false;
      function hold() {
        wasRunning = d.running;
        d.offset = audio.deckPosition(i);
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
        if (wasRunning) audio.startDeck(i, pos);
        else d.running = false;
        p.classList.remove("held");
        audio.playing = audio.decks.some((x) => x.running);
        audio.syncAudioLabels();
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
        audio.initAudio();
        await audio.ctx.resume();
        await audio.loadPreviewRecord();
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
        d.offset = audio.wrapPosition(d.offset + seconds);
        d.spin += (delta * 180) / Math.PI;
        audio.scratchVoice(i, d.offset, velocity);
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
          await audio.toggleDeck(i);
          return;
        }
        audio.initAudio();
        await audio.ctx.resume();
        await audio.loadPreviewRecord();
        if (!d.holding) hold();
        const direction = e.key === "ArrowLeft" ? -1 : 1;
        d.offset = audio.wrapPosition(d.offset + direction * 0.085);
        d.spin += direction * 17;
        audio.scratchVoice(i, d.offset, direction * 1.2);
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
      await audio.play();
      $("#dj-both").textContent = audio.playing
        ? "Ⅱ Pause both"
        : "▶ Play both";
    };
    $("#link-pitch").onchange = (e) => {
      audio.pitchLinked = e.target.checked;
      if (audio.pitchLinked) audio.setDeckPitch(1, audio.decks[0].pitch);
    };
    $$("[data-dj-preset]").forEach(
      (b) =>
        (b.onclick = () => {
          audio.setDeckPitch(0, +b.dataset.djPreset);
          audio.setDeckPitch(1, +b.dataset.djPreset);
          audio.syncDecks();
        }),
    );
    $("#crossfader").oninput = (e) => audio.setCrossfade(+e.target.value, true);
    $("#cut-a").onclick = () => audio.setCrossfade(-1, true);
    $("#cut-b").onclick = () => audio.setCrossfade(1, true);
    $("#dj-sync").onclick = audio.syncDecks;
    $("#auto-chop").onclick = audio.autoChop;
    function tempo(v) {
      if (!Number.isFinite(v)) return;
      audio.previewTrack.bpm = Math.max(40, Math.min(180, v));
      $("#dj-bpm").value = audio.previewTrack.bpm.toFixed(1);
      audio.setDeckPitch(0, audio.decks[0].pitch);
      audio.setDeckPitch(1, audio.decks[1].pitch);
      audio.syncDecks();
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
        audio.setCrossfade(e.key === "1" ? -1 : 1, true);
      }
    };
    audio.setCrossfade(audio.crossfade);
    for (let i = 0; i < 2; i++) audio.setDeckPitch(i, audio.decks[i].pitch);
    audio.syncAudioLabels();
  }
  function updateDJ(dt) {
    for (let i = 0; i < 2; i++) {
      const d = audio.decks[i],
        p = $("#platter-" + i),
        pos = audio.buffer ? audio.deckPosition(i) : 0;
      if (p) {
        if (d.running && !d.holding && !appState.calm)
          d.spin += dt * d.pitch * 200;
        p.style.transform = `rotate(${d.spin}deg)`;
        p.setAttribute("aria-valuenow", pos.toFixed(2));
        $("#deck-" + i + "-time").textContent =
          audio.clockText(pos) + "." + Math.floor((pos % 1) * 10);
        if (!d.holding)
          $("#deck-" + i + "-state").textContent = d.running
            ? "PLAYING"
            : "PAUSED";
      }
    }
    if (audio.ctx && audio.buffer) {
      $(".dock").dataset.deckOffset = String(
        audio.wrapPosition(audio.deckPosition(1) - audio.deckPosition(0)),
      );
      $(".dock").dataset.pitch = String(audio.decks[0].pitch);
    }
  }
  lifetime.listen(document.querySelector("#modal"), "close", () => {
    $$('[id^="platter-"]').forEach((p) => p._releaseScratch?.());
  });
  return {
    open: deck,
    update: updateDJ,
    destroy() {
      lifetime.dispose();
      $$('[id^="platter-"]').forEach((p) => p._releaseScratch?.());
    },
  };
}
