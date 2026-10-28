import { createLifetime } from "../core/lifecycle.js";

// Standard on a phone is its own document layout, not a squeezed 3D viewport.
export function createMobileLayout({
  appState,
  openDJ,
  openCinema,
  openTimeline,
}) {
  const lifetime = createLifetime();
  const media = matchMedia(
    "(max-width: 760px), (pointer: coarse) and (max-width: 1100px)",
  );
  const header = document.querySelector("body > header");
  const links = document.querySelector(".site-links");
  const menu = document.createElement("button");
  menu.className = "mobile-site-menu";
  menu.type = "button";
  menu.setAttribute("aria-label", "Site menu");
  menu.setAttribute("aria-expanded", "false");
  menu.setAttribute("aria-controls", "site-navigation");
  links.id = "site-navigation";
  menu.innerHTML =
    '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';
  header.append(menu);
  const home = document.createElement("section");
  home.className = "mobile-standard-home";
  home.hidden = true;
  home.innerHTML = `<div class="mobile-home-hero"><span class="eyebrow">HOUSTON ROOTS. EVERY ERA.</span><h1>THE TRUTH.<span>ON THE RECORD.</span></h1><p>A life in the music. A city in every groove.</p><div class="mobile-signature"><div data-mobile-seal></div><p>Tha Truth &amp;<br>Nothing but Tha Truth.</p></div></div><nav class="mobile-home-doors" aria-label="Explore Truthston"><a href="#record-shop/listen">Music archive <span>↗</span></a><a href="#record-shop/releases">Buy releases <span>↗</span></a><button type="button" data-mobile-dj>DJ Booth <span>↗</span></button><button type="button" data-mobile-cinema>Screening Room <span>↗</span></button><a href="#merch">Merch Store <span>↗</span></a><a href="#radio">WABN Radio <span>↗</span></a><a href="#newsroom">Newsroom <span>↗</span></a><a href="#events">Calendar <span>↗</span></a><a href="#gallery">Photo gallery <span>↗</span></a><a href="#account/stamps">Stamp Book <span>↗</span></a><button type="button" data-mobile-timeline>Houston timeline <span>↗</span></button><a href="#studio">Studio ABN <span>↗</span></a></nav><div data-mobile-world-entry></div><section class="mobile-featured-records"><div class="mobile-section-title"><h2>FROM THE CRATES.</h2><a href="#record-shop/listen">View all ↗</a></div><div data-mobile-catalog></div></section><div data-mobile-panels></div><section class="mobile-guide-card"><span class="eyebrow">YOUR GUIDE / THE ABN FAMILY</span><div data-mobile-guide></div><p>Meet the companion. Open chat from his action bar, or put him away from the same menu.</p></section><div data-mobile-book></div><div data-mobile-footer></div>`;
  document.querySelector("main").prepend(home);
  const moves = [
    ["#stamp-invite", "[data-mobile-seal]"],
    [".catalog", "[data-mobile-catalog]"],
    [".mobile-world-entry", "[data-mobile-world-entry]"],
    [".panels", "[data-mobile-panels]"],
    ["#companion-home", "[data-mobile-guide]"],
    [".book-invite", "[data-mobile-book]"],
    ["main .footer", "[data-mobile-footer]"],
  ].map(([selector, target]) => {
    const node = document.querySelector(selector),
      anchor = document.createComment("mobile standard return");
    node.before(anchor);
    return { node, anchor, target: home.querySelector(target) };
  });
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const standalone = () =>
    navigator.standalone ||
    matchMedia("(display-mode: standalone), (display-mode: fullscreen)")
      .matches;
  if (ios && !standalone()) {
    const info = document.createElement("p");
    info.className = "mobile-app-help";
    info.textContent =
      "For a view without Safari’s address bar: Share → Add to Home Screen, then open Truthston from its icon.";
    home.querySelector("[data-mobile-world-entry]").append(info);
  }
  function closeMenu() {
    links.hidden = media.matches;
    menu.setAttribute("aria-expanded", "false");
  }
  function sync() {
    const mobile = media.matches,
      standard = mobile && appState.mode !== "immersive";
    document.body.classList.toggle("mobile-site", mobile);
    document.body.classList.toggle("mobile-standard", standard);
    home.hidden = !standard;
    for (const { node, anchor, target } of moves) {
      if (standard && node.parentNode !== target) target.append(node);
      if (!standard && node.parentNode !== anchor.parentNode)
        anchor.after(node);
    }
    if (!mobile) links.hidden = false;
    else if (menu.getAttribute("aria-expanded") !== "true") links.hidden = true;
    // Restore geometry-dependent guide placement without changing its journey.
    document.dispatchEvent(new Event("truth-mobile-layout"));
  }
  lifetime.listen(menu, "click", () => {
    links.hidden = !links.hidden;
    menu.setAttribute("aria-expanded", String(!links.hidden));
  });
  lifetime.listen(links, "click", (e) => {
    if (e.target.closest("a")) closeMenu();
  });
  lifetime.listen(home.querySelector("[data-mobile-dj]"), "click", openDJ);
  lifetime.listen(
    home.querySelector("[data-mobile-cinema]"),
    "click",
    openCinema,
  );
  lifetime.listen(
    home.querySelector("[data-mobile-timeline]"),
    "click",
    openTimeline,
  );
  lifetime.listen(media, "change", sync);
  lifetime.listen(document, "truth-mode", sync);
  lifetime.listen(window, "hashchange", () => {
    closeMenu();
    sync();
  });
  sync();
  return {
    sync,
    destroy() {
      lifetime.dispose();
      for (const { node, anchor } of moves) {
        anchor.after(node);
        anchor.remove();
      }
      home.remove();
      menu.remove();
      links.hidden = false;
      document.body.classList.remove("mobile-site", "mobile-standard");
    },
  };
}
