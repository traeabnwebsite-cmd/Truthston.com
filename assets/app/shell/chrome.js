import { $, $$, esc } from "../core/dom.js";
import { createLifetime } from "../core/lifecycle.js";
export function createChrome({
  account,
  accountRoute,
  screeningVideos,
  twin,
  cinema,
  dj,
  navigation,
  getWorld,
  modal,
  community,
  mode,
  fullscreen,
}) {
  const lifetime = createLifetime();

  $$("[data-home]").forEach((link) =>
    lifetime.handler(link, "onclick", async (event) => {
      event.preventDefault();
      await fullscreen.leave();
      if ($("#modal").open) $("#modal").close();
      location.hash = "";
      await accountRoute();
      navigation.go(0);
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }),
  );

  lifetime.handler($("#account-open"), "onclick", () => {
    account.navigate("overview");
    accountRoute();
  });
  lifetime.handler(
    $("#stamp-invite"),
    "onclick",
    lifetime.handler($("#book-bottom"), "onclick", () => {
      account.navigate("stamps");
      accountRoute();
    }),
  );
  screeningVideos.forEach((v, i) =>
    twin("Watch video: " + v.title, () => cinema.open(i)),
  );
  lifetime.listen($("#modal"), "close", () => {
    const frame = $("#youtube-player");
    if (frame) frame.src = "about:blank";
  });
  twin("DJ booth turntables and mixer", dj.open);
  twin("Enter the screening room", () => navigation.go(2));
  twin("Return to the record shop", () => navigation.go(0));
  twin("Back door to Houston street", () => navigation.go(3));
  lifetime.handler($("#deck"), "onclick", navigation.enterDJRoom);
  lifetime.handler($("#open-dj-mixer"), "onclick", dj.open);
  lifetime.handler($("#dj-back-store"), "onclick", () => navigation.go(0));
  lifetime.listen($("#modal"), "close", () => {
    $$(".project-audio audio").forEach((a) => a.pause());
    $$('[id^="platter-"]').forEach((p) => p._releaseScratch?.());
    lifetime.handler($("#modal-body"), "onkeydown", null);
  });
  lifetime.handler($("#ballpark-roof"), "onclick", () =>
    getWorld()?.toggleBallparkRoof(),
  );
  lifetime.handler($("#roof-toggle"), "onclick", () =>
    getWorld()?.toggleRoof(),
  );
  $$("[data-stadium-view]").forEach((b) =>
    lifetime.handler(b, "onclick", () =>
      getWorld()?.stadiumView(b.dataset.stadiumView),
    ),
  );
  $$("[data-city]").forEach((b) =>
    lifetime.handler(b, "onclick", () => {
      account.recordEvent("city", b.dataset.city);
      getWorld()?.cityView(b.dataset.city);
    }),
  );
  $$("[data-uptown]").forEach((b) =>
    lifetime.handler(b, "onclick", () =>
      getWorld()?.cityView(b.dataset.uptown),
    ),
  );
  lifetime.handler($("#help"), "onclick", () =>
    modal(
      '<span class="eyebrow">WELCOME TO THE ROOM</span><h2>Make yourself at home.</h2><p>Drag left or right to orbit all the way around. Pick a station below to travel. Hover a sleeve, then click to pull it from the crate.<br><br>Press play to hear Boss Ballin, the supplied preview record. Open the DJ booth to scratch, change pitch and chop with the crossfader. Calm removes reactive light and motion. Standard opens the fast catalog. Reduced opens a still catalog.<br><br>Keyboard: Focus the room canvas and use arrows to orbit; +/- zoom. Tab to every control and the complete room-object list; Enter to open; Escape to close. Platter arrow keys change playback speed.</p>',
    ),
  );
  lifetime.handler($("#timeline-btn"), "onclick", () => community.timeline());
  lifetime.handler($("#challenge-btn"), "onclick", () => {
    mode.select("standard");
    $("#grid button").focus();
  });
  $$("[data-station]").forEach((b) =>
    lifetime.handler(b, "onclick", () =>
      +b.dataset.station === 1
        ? navigation.enterDJRoom()
        : navigation.go(+b.dataset.station),
    ),
  );
  return {
    destroy() {
      lifetime.dispose();
    },
  };
}
