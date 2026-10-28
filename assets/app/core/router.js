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
    accountPath: hash.split("/")[1] || "overview",
  };
}
export function createRouter({
  query,
  queryAll,
  account,
  commerce,
  editorial,
  win = window,
  doc = document,
  onRoute = () => {},
}) {
  let started = false;
  async function route() {
    const intent = routeIntent(win.location.hash),
      { section, account: open, shopping, editorial: news } = intent;
    if ((open || shopping || news) && doc.fullscreenElement)
      await doc.exitFullscreen().catch(() => {});
    doc.body.classList.toggle("account-view", open || shopping || news);
    query("#account-page").hidden = !open;
    query("#bump-shop").hidden = !shopping;
    query("#editorial-page").hidden = !news;
    queryAll(".site-links a").forEach((a) => {
      if (a.getAttribute("href") === "#" + section)
        a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    if (news) {
      editorial.open(section);
      win.scrollTo(0, 0);
    }
    if (shopping) {
      commerce.open();
      win.scrollTo(0, 0);
      query("#bump-room-back").focus({ preventScroll: true });
    }
    if (open) {
      account.open(intent.accountPath);
      win.scrollTo(0, 0);
      query("#book-back").focus({ preventScroll: true });
    }
    onRoute(intent);
  }
  return {
    route,
    start() {
      if (!started) {
        win.addEventListener("hashchange", route);
        started = true;
      }
    },
    destroy() {
      win.removeEventListener("hashchange", route);
      started = false;
    },
  };
}
