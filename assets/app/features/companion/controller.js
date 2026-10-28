import { createCompanionPromotions } from "./promotions.js";
import { createCompanionChat } from "./chat.js";
import { $, $$, esc } from "../../core/dom.js";
import { createLifetime } from "../../core/lifecycle.js";
import { buildCompanionIllustration } from "./illustration.js";
import { createCompanionJourney } from "./journey.js";
import { createCompanionVoice } from "./voice.js";
import { createCompanionKnowledge } from "./knowledge.js";
export function createCompanion({
  releases,
  getWorld,
  ensureWorld,
  commerce,
  enterDJRoom,
  release,
  accountRoute,
  go,
  setMode,
  appState,
  cinema,
  screeningVideos,
}) {
  const lifetime = createLifetime();
  const state = {
    homeDocked: true,
    rig: null,
    quiet: false,
    hidden: false,
    frame: 0,
    projectIndex: 0,
    activeProject: releases[0],
    cycle: 0,
    ticks: 0,
    busy: false,
    remoteAvailable: true,
    chatHistory: [],
    drag: null,
    dragged: false,
    pending: [],
    lastSpark: 0,
    poseLockUntil: 0,
    typing: false,
    voiceMode: false,
    recognition: null,
    voiceSpeaking: false,
    lastPointer: { x: 0, y: 0 },
    portalPhase: "arriving",
    inWorld: false,
    portalToken: 0,
    worldSeat: false,
  };
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

  const character = $("#companion-character");
  try {
    state.hidden = localStorage.getItem("truth-companion-hidden") === "true";
  } catch {}
  root.hidden = state.hidden;
  restore.hidden = !state.hidden;
  document.body.classList.toggle("companion-dismissed", state.hidden);
  function putAway() {
    state.hidden = true;
    state.portalToken++;
    cancelSequence();
    voice.stopVoice();
    chat.hidden = true;
    $("#companion-bubble").hidden = true;
    state.inWorld = false;
    state.worldSeat = false;
    getWorld()?.setGuideVisible?.(false);
    worldTools.hidden = true;
    root.hidden = true;
    restore.hidden = false;
    home.classList.remove("door-open", "door-present");
    journey.setPortalState("resting");
    document.body.classList.add("companion-dismissed");
    try {
      localStorage.setItem("truth-companion-hidden", "true");
    } catch {}
    attach();
    restore.focus({ preventScroll: true });
  }
  function restoreCompanion() {
    state.hidden = false;
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
    state.inWorld = false;
    state.worldSeat = false;
    journey.setPortalState("outside");
    try {
      localStorage.setItem("truth-companion-hidden", "false");
    } catch {}
    dockHome();
    attach();
    pose(0);
    status();
    journey.emerge();
    character.focus({ preventScroll: true });
  }
  $("#companion-putaway").onclick = putAway;
  restore.onclick = restoreCompanion;
  lifetime.observe(
    new ResizeObserver(constrainThought),
    root.querySelector(".companion-actions"),
  );
  const actions = {
    chat: ["Chat", () => chatController.openChat()],
    boom: [
      "Shop Bumpboxx",
      () => commerce.bumpboxDisplay("Bumpboxx / ABN red display"),
    ],
    dj: ["Enter the DJ booth", enterDJRoom],
    record: ["Open this project", () => release(state.activeProject)],
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
        go(0);
        $(".room-wrap").scrollIntoView({ block: "start" });
      },
    ],
    giving: ["Visit the giving wing", () => go(4)],
  };
  const promotions = createCompanionPromotions({
    state,
    lifetime,
    actions,
    constrainThought: (...args) => constrainThought(...args),
    cancelSequence,
    pose: (...args) => pose(...args),
    later: (...args) => later(...args),
    still,
    releases,
    root,
  });
  const chatController = createCompanionChat({
    state,
    lifetime,
    actions,
    act: (...args) => promotions.act(...args),
    chat,
    root,
    getVoice: () => voice,
    character,
    getKnowledge: () => knowledge,
  });
  function still() {
    return appState.calm || document.hidden || state.hidden;
  }
  function status() {
    root.classList.toggle("companion-still", still());
    $("#companion-status").textContent = document.hidden
      ? "Companion away"
      : state.busy
        ? "Companion answering"
        : state.voiceMode
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
    const anchor = state.inWorld
      ? state.worldAnchor
      : { x: r.left + r.width / 2, y: r.top + 20 };
    if (
      state.hidden ||
      !anchor ||
      root.style.visibility === "hidden" ||
      anchor.x < 0 ||
      anchor.x > innerWidth ||
      anchor.y < 0 ||
      anchor.y > innerHeight ||
      (!state.inWorld && (r.bottom < 0 || r.top > innerHeight))
    ) {
      el.hidden = true;
      return;
    }
    // Stay attached to Trae's head. Never clamp an offscreen character's cloud into view.
    const left = Math.max(8, Math.min(innerWidth - w - 8, anchor.x - w * 0.7));
    const top =
      anchor.y >= h + 8
        ? anchor.y - h + 12
        : Math.min(innerHeight - h - 8, anchor.y + 18);
    el.style.left = left + "px";
    el.style.top = top + "px";
    const tail = Math.max(6, Math.min(250, ((anchor.x - left) / w) * 280));
    const dots = el.querySelectorAll("circle");
    dots[0]?.setAttribute("cx", String(tail + 13));
    dots[0]?.setAttribute("cy", "153");
    dots[1]?.setAttribute("cx", String(tail));
    dots[1]?.setAttribute("cy", "172");
  }
  function place(x, y) {
    if (state.homeDocked) {
      state.homeDocked = false;
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
    state.frame = n;
    root.dataset.pose = String(n);
    root.style.setProperty("--pose-x", ((n % 4) * 100) / 3 + "%");
    root.style.setProperty("--pose-y", (n > 3 ? 100 : 0) + "%");
    $(".companion-record").src = state.activeProject.cover;
    state.rig?.pose(n);
    if (animate && n !== 4 && n !== 7) state.rig?.spin();
  }
  function later(fn, ms) {
    state.pending.push(
      lifetime.timeout(() => {
        if (!document.hidden) fn();
      }, ms),
    );
  }
  function cancelSequence() {
    state.pending.forEach(clearTimeout);
    state.pending = [];
  }

  character.onpointerdown = (e) => {
    if (e.button !== 0) return;
    const r = root.getBoundingClientRect();
    state.drag = {
      id: e.pointerId,
      dx: e.clientX - r.left,
      dy: e.clientY - r.top,
      x: e.clientX,
      y: e.clientY,
    };
    state.dragged = false;
    character.setPointerCapture(e.pointerId);
  };
  character.onpointermove = (e) => {
    if (!state.drag) return;
    if (Math.hypot(e.clientX - state.drag.x, e.clientY - state.drag.y) > 5)
      state.dragged = true;
    if (state.dragged) {
      $("#companion-bubble").hidden = true;
      place(e.clientX - state.drag.dx, e.clientY - state.drag.dy);
      state.rig?.walk(true);
      root.classList.add("companion-walking");
    }
  };
  character.onpointerup = (e) => {
    if (!state.drag) return;
    state.drag = null;
    state.rig?.walk(false);
    root.classList.remove("companion-walking");
    if (character.hasPointerCapture(e.pointerId))
      character.releasePointerCapture(e.pointerId);
    if (state.dragged) {
      savePosition();
      lifetime.timeout(() => (state.dragged = false), 0);
    }
  };
  character.onpointercancel = () => {
    state.drag = null;
    state.rig?.walk(false);
    root.classList.remove("companion-walking");
  };
  character.onclick = () => {
    if (!state.dragged) {
      root.classList.toggle("companion-near");
      character.setAttribute(
        "aria-expanded",
        String(root.classList.contains("companion-near")),
      );
    }
  };
  character.ondblclick = () =>
    promotions.perform(
      ["boom", "record", "merch", "member"][state.cycle++ % 4],
    );
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
      state.rig?.walk(false);
      savePosition();
    }
    if (e.key === "Escape") root.classList.remove("companion-near");
  };
  lifetime.listen(document, "pointermove", (e) => {
    state.lastPointer = { x: e.clientX, y: e.clientY };
    const r = root.getBoundingClientRect(),
      dx = e.clientX - r.left - r.width / 2,
      dy = e.clientY - r.top - r.height / 2,
      near = Math.hypot(dx, dy) < 145;
    state.rig?.pointer(
      Math.max(-1, Math.min(1, dx / 300)),
      Math.max(-1, Math.min(1, dy / 300)),
      near,
    );
    if (!state.drag) root.classList.toggle("companion-near", near);
  });
  lifetime.listen(root, "focusin", () => root.classList.add("companion-near"));
  lifetime.listen(root, "keydown", (e) => {
    if (e.key === "Escape") {
      root.classList.remove("companion-near");
      $("#companion-bubble").hidden = true;
    }
  });
  $("#companion-open-chat").onclick = () => chatController.openChat();
  $("#companion-open-store").onclick = () => promotions.act("merch");
  $(".companion-bubble-close").onclick = () =>
    ($("#companion-bubble").hidden = true);
  function dockHome() {
    root.style.visibility = "visible";
    const home = $("#companion-home");
    home.append(root);
    root.style.position = "absolute";
    root.style.left =
      Math.max(0, (home.clientWidth - (root.offsetWidth || 132)) / 2) + "px";
    root.style.top = "var(--companion-home-top, 0px)";
    root.style.bottom = "auto";
    state.homeDocked = true;
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
    if (state.inWorld) {
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
    } else if (
      state.homeDocked &&
      document.body.classList.contains("account-view")
    ) {
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
    } else if (state.homeDocked) {
      dockHome();
    } else if (root.parentNode !== document.body) {
      const r = root.getBoundingClientRect();
      document.body.append(root);
      place(r.left, r.top);
    }
  }
  lifetime.listen(document, "fullscreenchange", attach);
  lifetime.listen(document, "webkitfullscreenchange", attach);
  lifetime.observe(
    new MutationObserver(() => {
      attach();
      status();
    }),
    $(".room-wrap"),
    { attributes: true, attributeFilter: ["class"] },
  );
  lifetime.observe(
    new MutationObserver(() => {
      attach();
      status();
    }),
    document.body,
    { attributes: true, attributeFilter: ["class"] },
  );
  lifetime.listen(window, "resize", () => {
    const full =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      $(".room-wrap").classList.contains("fullscreen-fallback");
    if (state.homeDocked && !full) dockHome();
    else if (state.homeDocked) attach();
    else {
      const r = root.getBoundingClientRect();
      place(r.left, r.top);
    }
  });
  lifetime.listen(
    window,
    "scroll",
    () => {
      if (state.homeDocked) constrainThought();
    },
    { passive: true },
  );
  lifetime.listen(document, "visibilitychange", () => {
    if (document.hidden) {
      cancelSequence();
      voice.stopVoice();
      $("#companion-bubble").hidden = true;
    }
    status();
  });

  $("#companion-chat-close").onclick = chatController.closeChat;
  lifetime.listen(chat, "keydown", (e) => {
    if (e.key === "Escape") chatController.closeChat();
  });
  $("#companion-question").oninput = () => {
    state.typing = true;
    state.rig?.typing(true);
  };
  $("#companion-question").onfocus = () => state.rig?.typing(true);
  $("#companion-question").onblur = () => {
    state.typing = false;
    state.rig?.typing(false);
  };

  $("#companion-open-voice").onclick = () => {
    chatController.openChat();
    if (state.voiceMode) {
      voice.stopVoice();
      voice.voiceStatus("Voice chat stopped.");
    } else {
      state.voiceMode = true;
      $("#companion-stop-voice").hidden = false;
      $("#companion-open-voice").setAttribute("aria-pressed", "true");
      voice.listen();
    }
  };
  $("#companion-stop-voice").onclick = () => {
    voice.stopVoice();
    voice.voiceStatus("Voice chat stopped.");
  };

  $("#companion-chat-form").onsubmit = (e) => {
    e.preventDefault();
    const q = $("#companion-question").value;
    $("#companion-question").value = "";
    chatController.ask(q);
  };
  // The doorway is a reversible bridge between the page companion and its in-room counterpart.

  const home = $("#companion-home");
  home.innerHTML = `<div class="companion-doorway" aria-hidden="true"><div class="companion-door-depth"></div><div class="companion-door-leaf"><span>ABN</span><i></i></div><div class="companion-door-lintel"></div></div><button id="companion-portal-marker" class="companion-portal-marker" aria-label="Companion doorway. Choose where to meet him." aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M7 20V4l10-2v18M4 20h16M13 10v3"/></svg><span>THE WAY IN</span></button><div class="companion-portal-menu" id="companion-portal-menu" hidden><small>MEET ME INSIDE.</small><button data-guide-destination="0">The record shop ↘</button><button data-guide-destination="1">The DJ booth ↘</button><button data-guide-destination="2">The screening room ↘</button></div>`;
  const worldTools = document.createElement("div");
  worldTools.className = "world-guide-tools";
  worldTools.hidden = true;
  worldTools.innerHTML =
    '<button id="companion-world-ask">✦ Ask the companion</button><button id="companion-world-home">↥ Back upstairs</button><button id="companion-world-putaway">Put companion away</button>';
  $(".room-wrap").append(worldTools);
  $("#companion-world-putaway").onclick = putAway;
  const journey = createCompanionJourney({
    state,
    lifetime,
    get root() {
      return root;
    },
    get home() {
      return home;
    },
    portalWait: (...args) => portalWait(...args),
    pose: (...args) => pose(...args),
    get appState() {
      return appState;
    },
    getWorld: (...args) => getWorld(...args),
    ensureWorld,
    setMode: (...args) => setMode(...args),
    showThought: (...args) => promotions.showThought(...args),
    cancelSequence: (...args) => cancelSequence(...args),
    closeChat: (...args) => chatController.closeChat(...args),
    get worldTools() {
      return worldTools;
    },
    dockHome: (...args) => dockHome(...args),
    attach: (...args) => attach(...args),
    get character() {
      return character;
    },
    go: (...args) => go(...args),
    get cinema() {
      return cinema;
    },
    constrainThought: (...args) => constrainThought(...args),
  });
  const voice = createCompanionVoice({
    state,
    lifetime,
    status: (...args) => status(...args),
    ask: (...args) => chatController.ask(...args),
  });
  const knowledge = createCompanionKnowledge({
    state,
    lifetime,
    get releases() {
      return releases;
    },
  });

  const portalWait = (ms) =>
    new Promise((resolve) => lifetime.timeout(resolve, appState.calm ? 0 : ms));

  lifetime.listen(home, "keydown", (e) => {
    if (e.key === "Escape") {
      $("#companion-portal-menu").hidden = true;
      $("#companion-portal-marker").setAttribute("aria-expanded", "false");
      $("#companion-portal-marker").focus();
    }
  });
  $("#companion-portal-marker").onclick = () => {
    if (!state.inWorld) {
      restoreCompanion();
      return;
    }
    if (state.inWorld) {
      journey.returnFromWorld();
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
    (b) => (b.onclick = () => journey.enterPortal(+b.dataset.guideDestination)),
  );
  $("#companion-world-ask").onclick = chatController.openChat;
  $("#companion-world-home").onclick = journey.returnFromWorld;
  lifetime.listen(document, "truth-station", (e) => {
    if (state.inWorld) {
      state.worldSeat = false;
      state.rig?.cinema?.(false, false);
      getWorld()?.guideTravel?.(e.detail);
      worldTools.hidden = e.detail === 3;
    }
  });
  lifetime.listen(document, "truth-cinema", (e) => {
    state.rig?.cinema?.(state.worldSeat, Boolean(e.detail.playing));
    if (e.detail.ended && state.inWorld && state.worldSeat) {
      state.rig?.cinema?.(true, false, true);
      const next = (cinema.state.selected + 1) % screeningVideos.length;
      promotions.showThought(
        "One more? Try " + screeningVideos[next].title + ".",
        "screens",
      );
      $("#companion-cta small").textContent = "Play next video ↗";
      $("#companion-cta").onclick = () => {
        $("#companion-bubble").hidden = true;
        cinema.open(next);
      };
    }
  });
  lifetime.listen(document, "truth-guide-screening", () => {
    if (state.hidden) return;
    if (state.inWorld) {
      if (appState.station !== 2) go(2);
      else if (!state.worldSeat) getWorld()?.guideTravel?.(2);
    } else if (state.portalPhase === "outside") journey.enterPortal(2);
  });
  const savedPointerUp = character.onpointerup;
  character.onpointerup = (e) => {
    const wasDragged = state.dragged;
    savedPointerUp(e);
    if (wasDragged) {
      const r = $("#companion-portal-marker").getBoundingClientRect();
      if (
        e.clientX >= r.left - 22 &&
        e.clientX <= r.right + 22 &&
        e.clientY >= r.top - 24 &&
        e.clientY <= r.bottom + 24
      )
        journey.enterPortal(appState.station === 2 ? 2 : 0);
    }
  };
  function connectRoomGuide() {
    try {
      getWorld()?.installGuide?.({
        canvas: $("#companion-model"),
        onSelect: chatController.openChat,
        onPosition: journey.guidePosition,
        onArrive: journey.guideArrived,
      });
    } catch (error) {
      console.warn(
        "Room guide unavailable; page companion remains active.",
        error,
      );
    }
  }
  lifetime.listen(document, "truth-room-ready", connectRoomGuide, {
    once: true,
  });
  if (getWorld()) connectRoomGuide();
  dockHome();
  pose(0);
  status();
  attach();
  let entranceStarted = false;
  function startEntrance() {
    if (entranceStarted) return;
    entranceStarted = true;
    if (!state.hidden) journey.emerge();
    else {
      root.classList.remove("portal-born");
      journey.setPortalState("resting");
    }
  }
  // The CSS atlas remains a usable portrait if decoding/canvas setup is delayed.
  const entranceDeadline = lifetime.timeout(startEntrance, 3000);
  buildCompanionIllustration($("#companion-model"), {
    still,
    hidden: () => state.hidden,
    cover: () => state.activeProject.cover,
    ready: () => root.classList.add("companion-animated"),
  })
    .then((model) => {
      if (lifetime.disposed) {
        model?.destroy();
        return;
      }
      state.rig = model;
      state.rig?.pose(state.frame);
      lifetime.clearTimeout(entranceDeadline);
      startEntrance();
    })
    .catch((error) => {
      console.warn(
        "Animated guide unavailable; using the illustrated guide.",
        error,
      );
      lifetime.clearTimeout(entranceDeadline);
      startEntrance();
    });
  lifetime.interval(() => {
    status();
    if (
      still() ||
      state.drag ||
      state.inWorld ||
      state.portalPhase !== "outside" ||
      !chat.hidden ||
      document.querySelector("dialog[open]")
    )
      return;
    state.ticks++;
    if (performance.now() > state.poseLockUntil) {
      const phase = state.ticks % 22;
      if (phase === 3) pose(1);
      if (phase === 6) pose(2);
      if (phase === 9) pose(0);
      if (phase === 14) pose(3);
      if (phase === 17) pose(0);
      if (state.ticks % 45 === 0)
        promotions.perform(
          ["boom", "record", "merch", "member"][state.cycle++ % 4],
        );
    }
    if (state.ticks - state.lastSpark >= 23) {
      state.lastSpark = state.ticks;
      root.classList.remove("companion-twinkle");
      void root.offsetWidth;
      root.classList.add("companion-twinkle");
      lifetime.timeout(() => root.classList.remove("companion-twinkle"), 2000);
    }
  }, 1000);
  return {
    state,
    show: restoreCompanion,
    hide: putAway,
    openChat: chatController.openChat,
    destroy() {
      state.portalToken++;
      cancelSequence();
      voice.stopVoice();
      state.rig?.destroy();
      lifetime.dispose();
      getWorld()?.setGuideVisible?.(false);
      root.remove();
      chat.remove();
      restore.remove();
      $("#companion-bubble")?.remove();
      worldTools.remove();
      home.replaceChildren();
      document.body.classList.remove("companion-dismissed");
    },
  };
}
