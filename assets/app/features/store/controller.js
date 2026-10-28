import { $, esc } from "../../core/dom.js";
import {
  chronologicalReleases,
  releaseKind,
  releaseKey,
  priceForRelease,
  formatPrice,
  radioCollections,
} from "./catalog-policy.js";
import { createReignChat } from "./reign-chat.js";
import { createLifetime } from "../../core/lifecycle.js";

const cartStorage = "truthston-release-crate-v1";
export function createRecordStore({
  releases,
  openRelease,
  pauseAudio,
  modal,
  toast,
  visitRoom,
}) {
  const lifetime = createLifetime();
  const page = document.createElement("section");
  page.id = "record-store-page";
  page.hidden = true;
  page.setAttribute("aria-label", "Record store, checkout and WABN Radio");
  document.querySelector("main").before(page);
  const sorted = chronologicalReleases(releases);
  const collections = radioCollections(releases);
  let cart = [],
    section = "listen",
    filter = "all",
    search = "",
    collectionId = "rotation",
    queue = [],
    trackIndex = 0;
  try {
    const saved = JSON.parse(localStorage.getItem(cartStorage) || "[]");
    if (Array.isArray(saved))
      cart = [...new Set(saved)].filter((key) =>
        releases.some((r) => releaseKey(r) === key),
      );
  } catch {}
  const reignChat = createReignChat({
    releases,
    setPose: (pose) => {
      const character = page.querySelector(".reign-character");
      if (character) {
        character.src =
          pose === "welcome"
            ? "assets/branding/reign-companion-v1.png"
            : `assets/branding/reign-${pose}-v1.png`;
        character.dataset.pose = pose;
      }
    },
  });
  const radio = document.createElement("audio");
  radio.preload = "none";
  radio.setAttribute("aria-label", "WABN Radio player");
  const selected = () => sorted.filter((r) => cart.includes(releaseKey(r)));
  function persist() {
    try {
      localStorage.setItem(cartStorage, JSON.stringify(cart));
    } catch {
      toast("This browser could not save your release crate.");
    }
  }
  function navigate(next) {
    location.hash =
      next === "radio"
        ? "radio"
        : next === "studio"
          ? "studio"
          : `record-shop/${next}`;
  }
  function header() {
    return `<div class="store-masthead"><span class="eyebrow">ABN RECORDS, CDs AND TAPES / HOUSTON</span><span class="store-free">OPEN HOUSE · FREE FOR NOW</span></div><nav class="store-wayfinding" aria-label="Record store departments"><a href="#record-shop/listen" ${section === "listen" ? 'aria-current="page"' : ""}>01 / Streaming</a><a href="#record-shop/releases" ${section === "releases" ? 'aria-current="page"' : ""}>02 / Releases</a><a href="#record-shop/checkout" ${section === "checkout" ? 'aria-current="page"' : ""}>Reign’s checkout <span>${cart.length}</span></a><a href="#radio" ${section === "radio" ? 'aria-current="page"' : ""}>↑ WABN Radio</a><a href="#studio" ${section === "studio" ? 'aria-current="page"' : ""}>↑ Studio ABN</a></nav>`;
  }
  function releaseCard(r, buying = false) {
    const index = releases.indexOf(r),
      inCart = cart.includes(releaseKey(r));
    return `<article class="store-release"><button class="store-cover" data-store-release="${index}" aria-label="Explore ${esc(r.title)}"><img src="${esc(r.cover)}" alt="${esc(r.title)} cover" loading="lazy"></button><div class="store-release-meta"><small>${esc(r.date || r.year)} / ${esc(releaseKind(r))}</small><h3>${esc(r.title)}</h3>${buying ? `<span class="store-price">${formatPrice(priceForRelease(r))}<small>release price at paid launch</small></span><button class="${inCart ? "secondary" : "primary"}" data-store-add="${index}">${inCart ? "✓ In your crate" : "Add to purchase crate"}</button>` : `<button class="secondary" data-store-release="${index}">Explore & listen ↗</button>`}</div></article>`;
  }
  function catalog() {
    const buying = section === "releases";
    const visible = sorted.filter(
      (r) =>
        (filter === "all" || releaseKind(r) === filter) &&
        r.title.toLowerCase().includes(search.toLowerCase()),
    );
    return `<div class="store-heading"><div><span class="eyebrow">GROUND FLOOR / ${buying ? "THE PURCHASE SIDE" : "THE LISTENING SIDE"}</span><h1>${buying ? "Find it.<br>Keep it." : "Pull up.<br>Press play."}</h1><p>${buying ? "Choose your releases, then meet Reign at the register. No charges during the open-house preview." : "Browse the catalog from the beginning. Listening is free while memberships are being set up."}</p></div><div class="store-directory"><b>ONE STORE. TWO SIDES.</b><a href="#record-shop/listen">← Stream the archive</a><a href="#record-shop/releases">Browse releases →</a><a href="#record-shop/checkout">Meet Reign at checkout ↗</a></div></div><div class="store-toolbar"><label>FIND A RELEASE<input id="store-search" type="search" value="${esc(search)}" placeholder="Search the shelves"></label><label>FORMAT<select id="store-format"><option value="all">All releases</option>${["album", "mixtape", "ep", "single"].map((k) => `<option value="${k}" ${filter === k ? "selected" : ""}>${k === "ep" ? "EPs" : k + "s"}</option>`).join("")}</select></label><span>${visible.length} RELEASES / OLDEST → NEWEST</span></div><p class="store-audio-note">Connected audio plays free. Archive sleeves without connected tracks use the Boss Ballin preview; the full vault is still being connected.</p><div class="store-release-grid">${visible.map((r) => releaseCard(r, buying)).join("") || "<p>No releases match that search.</p>"}</div>`;
  }
  function checkout() {
    const items = selected(),
      total = items.reduce((sum, r) => sum + priceForRelease(r), 0);
    return `<div class="store-heading"><div><span class="eyebrow">GROUND FLOOR / THE REGISTER</span><h1>Reign’s<br>checkout.</h1><p>Pick your records. Reign will take it from here.</p></div><a class="secondary" href="#record-shop/releases">Back to the release shelves ↗</a></div><div class="reign-checkout"><div class="reign-counter-scene"><div class="reign-speech"><b>Hey, I’m Reign.</b><p>Welcome to ABN. Bring your release crate over here.</p></div><img class="reign-character" src="assets/branding/reign-companion-v1.png" alt="Reign, the ABN checkout companion, wearing an ABN tank top and leggings"><div class="reign-counter"><span>ABN RECORDS / CHECKOUT</span><div class="reign-register"><small>AMOUNT DUE</small><strong>$0.00</strong><i>OPEN HOUSE</i></div><b>REIGN</b></div></div><section class="store-receipt" aria-label="Your release crate"><span class="eyebrow">YOUR RELEASE CRATE</span><h2>On the counter.</h2>${items.length ? items.map((r) => `<div class="store-receipt-line"><div><b>${esc(r.title)}</b><small>${esc(r.year)} / ${esc(releaseKind(r))}</small></div><span>${formatPrice(priceForRelease(r))}</span><button data-store-remove="${releases.indexOf(r)}" aria-label="Remove ${esc(r.title)}">×</button></div>`).join("") : "<p>Your crate is empty. Choose a release from the purchase side first.</p>"}<div class="store-total"><span>Catalog value</span><b>${formatPrice(total)}</b></div><div class="store-total free"><span>Due today</span><b>$0.00</b></div><p>No payment is collected. A free preview selection saves your crate on this device; it does not grant a paid download or ownership entitlement.</p><button class="primary" id="store-confirm" ${items.length ? "" : "disabled"}>Confirm free preview selection</button><p id="store-confirmation" role="status"></p><div class="store-price-list"><span>ALBUM $15.99</span><span>MIXTAPE $5.99</span><span>EP $3.99</span><span>SINGLE $1.99</span></div></section></div><div id="reign-chat-mount"></div>`;
  }
  function radioPage() {
    const current =
      collections.find((c) => c.id === collectionId) || collections[0];
    return `<div class="store-heading radio-heading"><div><span class="eyebrow">SECOND FLOOR / THE BROADCAST ROOM</span><h1>WABN<br><em>Radio.</em></h1><p>Houston in the speakers. The ABN playlist station.</p></div><button class="secondary" data-store-room="6">Visit the upstairs radio room ↗</button></div><div class="wabn-console"><span class="wabn-onair">● WABN / FREE LISTENING</span><h2 id="wabn-now">${radio.src ? esc(queue[trackIndex]?.title || "WABN Radio") : "Your station. Your rotation."}</h2><p>Choose a collection. Play the connected tracks in sequence.</p><div class="wabn-transport"><button id="wabn-prev" class="secondary" aria-label="Previous radio track">← Previous</button><button id="wabn-play" class="primary">${radio.paused ? "▶ Play radio" : "Ⅱ Pause radio"}</button><button id="wabn-next" class="secondary" aria-label="Next radio track">Next →</button><label>VOLUME<input id="wabn-volume" aria-label="Radio volume" type="range" min="0" max="1" step=".01" value="${radio.volume}"></label></div><p id="wabn-status" role="status">${radio.src ? "Connected audio / free playback" : "Boss Ballin is connected now. More vault tracks will join these collections as they are uploaded."}</p></div><div class="wabn-collections">${collections.map((c) => `<button data-radio-collection="${c.id}" aria-pressed="${c.id === current.id}"><span class="eyebrow">PLAYLIST COLLECTION</span><h3>${esc(c.name)}</h3><p>${esc(c.note)}</p><small>${c.releases.length} RELEASES</small></button>`).join("")}</div><div class="store-heading small"><h2>${esc(current.name)}</h2><span>CHRONOLOGICAL / OLDEST → NEWEST</span></div><div class="store-release-grid">${current.releases.map((r) => releaseCard(r)).join("")}</div>`;
  }
  function studio() {
    return `<div class="store-heading"><div><span class="eyebrow">SECOND FLOOR / THE STUDIO</span><h1>Where the<br>next starts.</h1><p>A large-format control room, monitoring wall, outboard racks and a separate vocal booth behind studio glass.</p></div><button class="secondary" data-store-room="7">Enter Studio ABN ↗</button></div><div class="studio-preview"><div class="studio-window"><span>STUDIO ABN</span><div class="studio-mic" aria-hidden="true"><i></i></div><b>THE BOOTH</b></div><div class="studio-console-art" aria-hidden="true">${Array.from({ length: 12 }, () => "<i><span></span></i>").join("")}</div><p>CONTROL ROOM / RECORDING BOOTH</p></div><p class="store-audio-note">The room is open to explore. Recording, uploads, booking and live studio sessions will be defined with the team.</p><a class="secondary" href="#radio">Visit WABN Radio next door ↗</a>`;
  }
  function tracksForCollection() {
    const current =
      collections.find((c) => c.id === collectionId) || collections[0];
    const tracks = current.releases.flatMap((r) =>
      (r.audioTracks || [])
        .filter((t) => t.audioUrl && ["public", "free"].includes(r.access))
        .map((t) => ({ title: `${t.title} / ${r.title}`, url: t.audioUrl })),
    );
    return tracks.length
      ? tracks
      : [
          {
            title: "Boss Ballin / WABN preview rotation",
            url: "assets/audio/boss-ballin-preview.m4a",
          },
        ];
  }
  function updateRadio() {
    if (section !== "radio" || page.hidden) return;
    const now = page.querySelector("#wabn-now"),
      play = page.querySelector("#wabn-play");
    if (now)
      now.textContent =
        queue[trackIndex]?.title || "Your station. Your rotation.";
    if (play)
      play.textContent = radio.paused ? "▶ Play radio" : "Ⅱ Pause radio";
  }
  async function playTrack(index) {
    if (!queue.length) queue = tracksForCollection();
    trackIndex = (index + queue.length) % queue.length;
    radio.src = queue[trackIndex].url;
    pauseAudio();
    try {
      await radio.play();
    } catch {
      toast("Press Play radio to start listening.");
    }
    updateRadio();
  }
  lifetime.listen(radio, "ended", () => {
    void playTrack(trackIndex + 1);
  });
  lifetime.listen(radio, "error", () => {
    const status = page.querySelector("#wabn-status");
    if (status)
      status.textContent = "This track is unavailable. Try the next track.";
  });
  lifetime.listen(radio, "pause", updateRadio);
  lifetime.listen(radio, "play", updateRadio);
  function render() {
    page.innerHTML =
      header() +
      (section === "checkout"
        ? checkout()
        : section === "radio"
          ? radioPage()
          : section === "studio"
            ? studio()
            : catalog());
    if (section === "checkout") reignChat.mount();
  }
  lifetime.listen(page, "click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.storeRelease != null)
      openRelease(releases[+button.dataset.storeRelease]);
    if (button.dataset.storeAdd != null) {
      const key = releaseKey(releases[+button.dataset.storeAdd]);
      if (!cart.includes(key)) cart.push(key);
      persist();
      render();
      toast("Added to your release crate. Meet Reign at checkout.");
    }
    if (button.dataset.storeRemove != null) {
      cart = cart.filter(
        (k) => k !== releaseKey(releases[+button.dataset.storeRemove]),
      );
      persist();
      render();
    }
    if (button.id === "store-confirm") {
      persist();
      $("#store-confirmation").textContent =
        "Reign: You’re all set. Your preview crate is saved here. No charge today.";
    }
    if (button.dataset.storeRoom) {
      page.hidden = true;
      location.hash = "record-shop";
      visitRoom(+button.dataset.storeRoom);
    }
    if (button.dataset.radioCollection) {
      collectionId = button.dataset.radioCollection;
      radio.pause();
      radio.removeAttribute("src");
      queue = [];
      trackIndex = 0;
      render();
    }
    if (button.id === "wabn-play") {
      if (!radio.paused) radio.pause();
      else if (!radio.src) void playTrack(0);
      else {
        pauseAudio();
        void radio.play().catch(() => toast("Radio playback could not start."));
      }
    }
    if (button.id === "wabn-next") void playTrack(trackIndex + 1);
    if (button.id === "wabn-prev") void playTrack(trackIndex - 1);
  });
  lifetime.listen(page, "change", (event) => {
    if (event.target.id === "store-format") {
      filter = event.target.value;
      render();
    }
  });
  lifetime.listen(page, "input", (event) => {
    if (event.target.id === "wabn-volume")
      radio.volume = Number(event.target.value);
    if (event.target.id === "store-search") {
      const input = event.target,
        cursor = input.selectionStart;
      search = input.value;
      render();
      const next = page.querySelector("#store-search");
      next.focus();
      try {
        next.setSelectionRange(cursor, cursor);
      } catch {}
    }
  });
  const openElevator = () => {
    modal(
      '<span class="eyebrow">ABN / ELEVATOR</span><h2>Choose a floor.</h2><div class="elevator-floors"><button class="primary" id="elevator-ground">Ground floor · Record store</button><button class="secondary" id="elevator-upstairs">Second floor · Studio ABN & WABN Radio</button></div>',
    );
    document.querySelector("#elevator-ground").onclick = () => {
      document.querySelector("#modal").close();
      visitRoom(0);
    };
    document.querySelector("#elevator-upstairs").onclick = () => {
      document.querySelector("#modal").close();
      visitRoom(6);
    };
  };
  lifetime.listen(document, "click", (event) => {
    if (event.target.closest("#store-elevator")) openElevator();
  });
  return {
    open(path) {
      section = ["listen", "releases", "checkout", "radio", "studio"].includes(
        path,
      )
        ? path
        : "listen";
      page.hidden = false;
      render();
    },
    navigate,
    openElevator,
    selectRelease(release) {
      const key = releaseKey(release);
      if (!cart.includes(key)) cart.push(key);
      persist();
      navigate("checkout");
    },
    pause: () => radio.pause(),
    destroy() {
      lifetime.dispose();
      reignChat.destroy();
      radio.pause();
      radio.removeAttribute("src");
      radio.load();
      page.remove();
    },
  };
}
