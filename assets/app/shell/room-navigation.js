import { $, $$, esc } from "../core/dom.js";
import { createLifetime } from "../core/lifecycle.js";
export function createRoomNavigation({
  modal,
  dj,
  commerce,
  publicSections,
  accountRoute,
  getWorld,
  mode,
  appState,
  cinema,
  community,
  store,
}) {
  const lifetime = createLifetime();

  function showDJEntrance() {
    modal(
      '<section class="dj-room-entrance"><span class="eyebrow">THE DJ BOOTH / WEST WING</span><h2>The DJ booth.</h2><button class="primary" id="enter-dj-room">Enter</button></section>',
    );
    lifetime.handler($("#enter-dj-room"), "onclick", () => {
      $("#modal").close();
      go(1, { entered: true });
    });
  }
  function showDJFallback() {
    modal(
      '<section class="dj-room-fallback"><span class="eyebrow">INSIDE THE DJ BOOTH / WEST WING</span><h2>You’re in the booth.</h2><p>Select the turntables to open the mixer.</p><button class="primary" id="fallback-turntables">Select the turntables ↗</button><button class="secondary" id="fallback-bump">Shop Bumpboxx ↗</button></section>',
    );
    lifetime.handler($("#fallback-turntables"), "onclick", dj.open);
    lifetime.handler($("#fallback-bump"), "onclick", () =>
      commerce.bumpboxDisplay("Bumpboxx / gray display"),
    );
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
    if (getWorld()) mode.select("immersive");
    go(1);
    lifetime.frame(() =>
      $(".room-wrap").scrollIntoView({
        behavior: appState.calm ? "auto" : "smooth",
        block: "start",
      }),
    );
  }
  const names = [
    "Good music.<br>Deep roots.",
    "The DJ<br>booth.",
    "The city.<br>In motion.",
    "Every block.<br>A chapter.",
    "All heart.<br>All Houston.",
    "Wear the<br>truth.",
    "WABN<br>Radio.",
    "Studio<br>ABN.",
    "Reign’s<br>checkout.",
    "The purchase<br>side.",
  ];
  function go(i, { entered = false } = {}) {
    if (
      location.hash.startsWith("#record-shop/") ||
      ["radio", "studio", "account", "shop", ...publicSections].includes(
        location.hash.slice(1).split("/")[0],
      )
    ) {
      location.hash = "record-shop";
      accountRoute();
    }
    if (i === 1 && appState.station !== 1 && !entered) {
      showDJEntrance();
      return;
    }
    appState.station = i;
    document.body.dataset.storeRoom = String(i);
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
    if (i >= 6) {
      $(".room-label b").textContent = [
        "WABN RADIO",
        "STUDIO ABN",
        "REIGN / CHECKOUT",
        "THE PURCHASE SIDE",
      ][i - 6];
      $(".room-label small").textContent =
        i < 8
          ? "SECOND FLOOR / ABN RECORD STORE"
          : "GROUND FLOOR / ABN RECORD STORE";
    }
    $("#station-note").textContent = [
      "DRAG TO LOOK AROUND. PICK A SLEEVE TO DIG IN.",
      "Select a turntable to open the mixer. Lower pitch to slow the record; cut between A and B to chop. Select a Bumpboxx to shop.",
      "THE SCREENING ROOM. ONE BIG SCREEN. PICK A VIDEO.",
      "Welcome to Truthston, Texas. Pick a Houston landmark or explore the years hanging above the street.",
      "COMMUNITY IS THE WHOLE POINT.",
      "CLICK THE APPAREL RACK TO ENTER THE MERCH STORE.",
      "SECOND FLOOR / OPEN THE WABN PLAYLISTS TO LISTEN FREE.",
      "SECOND FLOOR / CONTROL ROOM AND RECORDING BOOTH.",
      "MEET REIGN AT THE REGISTER. ALL CHECKOUT SELECTIONS ARE FREE FOR NOW.",
      "CHRONOLOGICAL RELEASES. CHOOSE YOUR RECORDS AND VISIT REIGN.",
    ][i];
    getWorld()?.travel(i);
    document.dispatchEvent(new CustomEvent("truth-station", { detail: i }));
    if (i === 5) {
      commerce.merch();
      return;
    }
    if (appState.mode !== "immersive") {
      if (i === 1) showDJFallback();
      if (i === 2) cinema.browse();
      if (i === 3) community.timeline();
      if (i === 4) community.giving();
      if (i === 5) commerce.merch();
      if (i >= 6)
        store.navigate(["radio", "studio", "checkout", "releases"][i - 6]);
    }
  }
  return {
    go,
    enterDJRoom,
    openTurntables() {
      if (appState.station === 1) dj.open();
      else enterDJRoom();
    },
    destroy() {
      lifetime.dispose();
    },
  };
}
