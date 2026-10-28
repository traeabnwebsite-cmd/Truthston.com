// Audio transport owns its graph, sources and timing; it has no DOM or WebGL dependency.
export function createAudioEngine({
  toast = () => {},
  earn = () => {},
  recordActivity = () => {},
  initialVolume = 0.7,
  contextFactory = () =>
    new (window.AudioContext || window.webkitAudioContext)(),
  fetchAudio = fetch,
} = {}) {
  let playing = false,
    ctx,
    source,
    analyser,
    gain,
    panner,
    buffer,
    rate = 1,
    headphones = false;
  const listeners = new Set();
  const abort = new AbortController();
  let disposed = false;
  const previewTrack = {
    title: "Boss Ballin",
    url: "assets/audio/boss-ballin-preview.m4a",
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
    chopSide = false;
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
    if (disposed) throw new Error("Audio engine disposed");
    if (ctx) return;
    ctx = contextFactory();
    analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    gain = ctx.createGain();
    gain.gain.value = initialVolume;
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
    for (const listener of listeners) listener();
  }
  async function loadPreviewRecord() {
    if (previewLoad) return previewLoad;
    previewLoad = (async () => {
      previewBusy = true;
      syncAudioLabels();
      try {
        const res = await fetchAudio(previewTrack.url, {
          signal: abort.signal,
        });
        if (!res.ok) throw new Error("Preview record unavailable");
        buffer = await ctx.decodeAudioData(await res.arrayBuffer());
        if (disposed) return;
        providedTrack = true;
      } catch {
        if (disposed) return;
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
      if (disposed) return;
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
      if (disposed) return;
      previewBusy = false;
      syncAudioLabels();
      toast("Audio could not start. Press play to try again.");
    }
  }
  async function toggleDeck(i) {
    initAudio();
    await ctx.resume();
    await loadPreviewRecord();
    if (disposed) return;
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
    syncAudioLabels();
  }
  function setCrossfade(v, manual = false) {
    crossfade = Math.max(-1, Math.min(1, v));
    if (manual) {
      stopAutoChop();
      if (playing && Math.abs(v) > 0.8)
        recordActivity("cut", String(Date.now()));
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
    syncAudioLabels();
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
    syncAudioLabels();
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
    syncAudioLabels();
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
            input[
              (((sample - j) % input.length) + input.length) % input.length
            ];
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
  return {
    audioDuration,
    wrapPosition,
    initAudio,
    route,
    syncAudioLabels,
    loadPreviewRecord,
    deckPosition,
    position,
    stopDeck,
    startDeck,
    play,
    toggleDeck,
    setDeckPitch,
    setCrossfade,
    syncDecks,
    stopAutoChop,
    autoChop,
    scratchVoice,
    scratch,
    get playing() {
      return playing;
    },
    get ctx() {
      return ctx;
    },
    get source() {
      return source;
    },
    get analyser() {
      return analyser;
    },
    get gain() {
      return gain;
    },
    get panner() {
      return panner;
    },
    get buffer() {
      return buffer;
    },
    get rate() {
      return rate;
    },
    get headphones() {
      return headphones;
    },
    get previewTrack() {
      return previewTrack;
    },
    get previewBusy() {
      return previewBusy;
    },
    get providedTrack() {
      return providedTrack;
    },
    get crossfade() {
      return crossfade;
    },
    get pitchLinked() {
      return pitchLinked;
    },
    get chopTimer() {
      return chopTimer;
    },
    get decks() {
      return decks;
    },
    get clockText() {
      return clockText;
    },
    set headphones(value) {
      headphones = value;
      route();
      syncAudioLabels();
    },
    set pitchLinked(value) {
      pitchLinked = value;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setVolume(v) {
      gain?.gain.setTargetAtTime(v, ctx.currentTime, 0.03);
    },
    setSpatialPosition(p) {
      if (!ctx || !panner) return;
      ["X", "Y", "Z"].forEach((axis, i) =>
        panner["position" + axis].setTargetAtTime(p[i], ctx.currentTime, 0.1),
      );
    },
    pause() {
      if (!playing) return;
      stopDeck(0);
      stopDeck(1);
      stopAutoChop();
      syncAudioLabels();
    },
    async destroy() {
      if (disposed) return;
      disposed = true;
      abort.abort();
      stopAutoChop();
      decks.forEach((d, i) => {
        stopDeck(i);
        try {
          d.scratchVoice?.stop();
        } catch {}
      });
      listeners.clear();
      await ctx?.close();
    },
  };
}
