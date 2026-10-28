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
}) {
  const lifetime = createLifetime();

  function showDJFallback() {
    modal(
      '<section class="dj-room-fallback"><span class="eyebrow">THE DJ BOOTH / WEST WING</span><h2>Step into the booth.</h2><p>Select the turntables to open the mixer.</p><button class="primary" id="fallback-turntables">Select the turntables ↗</button><button class="secondary" id="fallback-bump">Shop Bumpboxx ↗</button></section>',
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
    getWorld()?.travel(i);
    document.dispatchEvent(new CustomEvent("truth-station", { detail: i }));
    if (appState.mode !== "immersive") {
      if (i === 1) showDJFallback();
      if (i === 2) cinema.open(0);
      if (i === 3) community.timeline();
      if (i === 4) community.giving();
      if (i === 5) commerce.merch();
    }
  }
  return {
    go,
    enterDJRoom,
    destroy() {
      lifetime.dispose();
    },
  };
}
