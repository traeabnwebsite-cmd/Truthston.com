export const publicSections = [
  "newsroom",
  "article",
  "gallery",
  "events",
  "merch",
];
export function routeIntent(hash) {
  const section = hash.slice(1).split("/")[0];
  return {
    section,
    account: hash.startsWith("#account"),
    shopping: hash.startsWith("#shop/bumpboxx"),
    editorial: publicSections.includes(section),
    store:
      ["radio", "studio"].includes(section) || hash.startsWith("#record-shop/"),
    storePath: ["radio", "studio"].includes(section)
      ? section
      : hash.split("/")[1] || "listen",
    accountPath: hash.split("/")[1] || "overview",
  };
}
export function createRouter({
  query,
  queryAll,
  account,
  commerce,
  editorial,
  store,
  win = window,
  doc = document,
  onRoute = () => {},
}) {
  let started = false;
  const panelAnchors = new Map();
  function placePanels(inside) {
    const stage = query(".world-stage");
    for (const selector of [
      "#account-page",
      "#bump-shop",
      "#editorial-page",
      "#record-store-page",
    ]) {
      const panel = query(selector);
      if (!panel?.parentNode || !stage) continue;
      if (inside) {
        if (!panelAnchors.has(panel)) {
          const anchor = doc.createComment("fullscreen page return point");
          panel.before(anchor);
          panelAnchors.set(panel, anchor);
        }
        if (panel.parentNode !== stage) stage.append(panel);
      } else {
        const anchor = panelAnchors.get(panel);
        if (anchor?.parentNode && panel.parentNode !== anchor.parentNode)
          anchor.after(panel);
      }
    }
  }
  async function route() {
    const intent = routeIntent(win.location.hash),
      {
        section,
        account: open,
        shopping,
        editorial: news,
        store: storeOpen,
      } = intent;
    const room = query(".room-wrap");
    const fullscreen = doc.fullscreenElement || doc.webkitFullscreenElement;
    const inRoomFullscreen = Boolean(
      room &&
        (fullscreen === room ||
          room.classList?.contains("fullscreen-fallback")),
    );
    const panelOpen = Boolean(open || shopping || news || storeOpen);
    placePanels(inRoomFullscreen);
    doc.body.classList.toggle("account-view", panelOpen && !inRoomFullscreen);
    doc.body.classList.toggle("room-panel-view", panelOpen && inRoomFullscreen);
    query("#account-page").hidden = !open;
    query("#bump-shop").hidden = !shopping;
    query("#editorial-page").hidden = !news;
    const storePage = query("#record-store-page");
    if (storePage) storePage.hidden = !storeOpen;
    queryAll(".site-links a").forEach((a) => {
      if (a.getAttribute("href") === "#" + section)
        a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    if (news) {
      editorial.open(section);
      if (!inRoomFullscreen) win.scrollTo(0, 0);
    }
    if (shopping) {
      commerce.open();
      if (!inRoomFullscreen) win.scrollTo(0, 0);
      query("#bump-room-back").focus({ preventScroll: true });
    }
    if (open) {
      account.open(intent.accountPath);
      if (!inRoomFullscreen) win.scrollTo(0, 0);
      query("#book-back").focus({ preventScroll: true });
    }
    if (storeOpen) {
      store?.open(intent.storePath);
      if (!inRoomFullscreen) win.scrollTo(0, 0);
    }
    onRoute(intent);
  }
  return {
    route,
    start() {
      if (!started) {
        win.addEventListener("hashchange", route);
        doc.addEventListener?.("fullscreenchange", route);
        doc.addEventListener?.("webkitfullscreenchange", route);
        doc.addEventListener?.("truth-fullscreen-change", route);
        started = true;
      }
    },
    destroy() {
      win.removeEventListener("hashchange", route);
      doc.removeEventListener?.("fullscreenchange", route);
      doc.removeEventListener?.("webkitfullscreenchange", route);
      doc.removeEventListener?.("truth-fullscreen-change", route);
      placePanels(false);
      for (const anchor of panelAnchors.values()) anchor.remove();
      panelAnchors.clear();
      started = false;
    },
  };
}
