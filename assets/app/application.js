import { createLifetime } from "./core/lifecycle.js";
import { createTwinRegistry } from "./core/twins.js";
import { createFeedback } from "./shell/feedback.js";
import { createHomeSummary } from "./shell/home.js";
import { createCommunityPages } from "./shell/community.js";
import { createExperienceMode } from "./shell/mode.js";
import { createFullscreen } from "./shell/fullscreen.js";
import { createRoomNavigation } from "./shell/room-navigation.js";
import { createChrome } from "./shell/chrome.js";
import { createLazyFeature } from "./core/lazy-feature.js";
import { createCompanion } from "./features/companion/controller.js";
import { createScreeningCatalog } from "./features/theater/catalog.js";
import { createCinemaController } from "./features/theater/controller.js";
import { createAudioEngine } from "./features/audio/engine.js";
import { createPlayerDock } from "./features/audio/dock.js";
import { createDJMixer } from "./features/dj/mixer.js";
import { loadGalleryCuration } from "./features/editorial/gallery.js";
import { createCatalogPage } from "./features/catalog/page.js";
import { createDailyChallenge } from "./features/catalog/daily-challenge.js";
import { createAccountPage } from "./features/account/page.js";
import { createEditorialPage } from "./features/editorial/page.js";
import { createCommercePage } from "./features/commerce/page.js";
import { $, $$, esc } from "./core/dom.js";
import { createRandom } from "./core/random.js";
import { createAppState } from "./core/app-state.js";
import { createRouter, publicSections } from "./core/router.js";
import { createCoverArt } from "./data/cover-art.js";
import { embeddedVault } from "./data/fallback-catalog.js";
import { sample } from "./data/sample-catalog.js";
import { prepareCatalog } from "./data/catalog.js";
import {
  loadPublicContent,
  loadOptionalCatalog,
} from "./data/content-client.js";

export async function createApplication({ initialMode } = {}) {
  let stampArtwork = null;
  try {
    stampArtwork = (await import("../stamps.mjs")).renderStamp;
    $("#stamp-invite").innerHTML = stampArtwork("abn", { scope: "home" });
  } catch (error) {
    console.warn("Stamp artwork unavailable; readable labels remain.", error);
  }
  const rand = createRandom(71);
  const cover = createCoverArt({ random: rand });

  await loadOptionalCatalog();

  const siteContent = await loadPublicContent();

  const supplied = window.RELEASE_DATA || window.releaseData || embeddedVault;
  const { data, releases } = prepareCatalog({
    supplied,
    embeddedVault,
    siteContent,
    sample,
    cover,
  });
  const appState = createAppState({
    selected: releases[0],
    prefersReducedMotion: matchMedia("(prefers-reduced-motion: reduce)")
      .matches,
  });
  if (initialMode && ["standard", "immersive", "reduced"].includes(initialMode))
    appState.mode = initialMode;
  let sceneAPI, worldLoader;
  const lifetime = createLifetime();
  const worldAbort = new AbortController();
  lifetime.add(() => worldAbort.abort());
  const twins = createTwinRegistry($("#twins"));
  const twin = twins.register;
  const feedback = createFeedback({ appState, getWorld: () => sceneAPI });
  const { toast, earn, modal } = feedback;
  const mode = createExperienceMode({
    appState,
    getWorld: () => sceneAPI,
    getWorldLoader: () => worldLoader,
    toast,
  });

  const audio = createAudioEngine({
    initialVolume: +$("#volume").value,
    toast,
    earn,
    recordActivity: (...args) => account.recordEvent(...args),
  });
  const dj = createDJMixer({ audio, appState, modal });
  const playerDock = createPlayerDock({
    audio,
    appState,
    earn,
    updateDJ: dj.update,
  });

  const today = new Date();
  const homeSummary = createHomeSummary({
    siteContent,
    releases,
    data,
    today,
    rand,
    modal,
  });
  const dailyChallenge = createDailyChallenge({
    today,
    releases,
    appState,
    earn,
    toast,
  });

  const account = await createAccountPage({
    stampArtwork,
    toast,
    modal,
    releases,
    release: (r) => release(r),
    setMode: (m) => mode.select(m),
    merch: () => commerce.merch(),
  });

  const galleryCuration = await loadGalleryCuration();
  const editorial = createEditorialPage({
    galleryCuration,
    siteContent,
    getWishlist: () => commerce.wishlist,
    renderGarment: (p) => commerce.renderGarment(p),
    toast,
    modal,
  });

  const router = createRouter({
    onRoute: () => mode.syncWorld(),
    query: $,
    queryAll: $$,
    editorial: { open: (section) => editorial.open(section) },
    commerce: { open: () => commerce.render() },
    account: { open: (path) => account.open(path) },
  });
  function accountRoute() {
    return router.route();
  }

  lifetime.interval(() => {
    if (audio.playing && !document.hidden) account.tickListening();
  }, 1000);

  const catalog = createCatalogPage({
    appState,
    releases,
    sourceLabel: !!supplied,
    challenge: dailyChallenge,
    recordActivity: (...args) => account.recordEvent(...args),
    earn,
    toast,
    modal,
    play: (...args) => audio.play(...args),
    pauseRoomForVideo: audio.pause,
    enterDJRoom: () => navigation.enterDJRoom(),
    registerTwin: (...args) => twin(...args),
  });
  function release(r) {
    return catalog.openRelease(r);
  }

  const screeningVideos = createScreeningCatalog(data);
  const cinema = createCinemaController({
    screeningVideos,
    appState,
    getWorld: () => sceneAPI,
    setMode: mode.select,
    go: (...a) => navigation.go(...a),
    pauseRoomForVideo: audio.pause,
    earn,
  });
  const commerce = createCommercePage({
    siteContent,
    getPhoto: (id) => editorial.photo(id),
    enterDJRoom: () => navigation.enterDJRoom(),
    navigate: () => accountRoute(),
  });
  const community = createCommunityPages({ data, today, twin, modal });
  const navigation = createRoomNavigation({
    modal,
    dj,
    commerce,
    publicSections,
    accountRoute,
    getWorld: () => sceneAPI,
    mode,
    appState,
    cinema,
    community,
  });
  const fullscreen = createFullscreen({ toast });
  const chrome = createChrome({
    account,
    accountRoute,
    screeningVideos,
    twin,
    cinema,
    dj,
    navigation,
    getWorld: () => sceneAPI,
    modal,
    community,
    mode,
  });

  // One supplied record, two transport heads. Both decks share a single decoded AudioBuffer.

  // Fullscreen keeps controls, keyboard equivalents and object dialogs in its active subtree.

  cinema.mount();
  const companion = createCompanion({
    releases,
    getWorld: () => sceneAPI,
    commerce,
    enterDJRoom: (...a) => navigation.enterDJRoom(...a),
    release,
    accountRoute,
    go: (...a) => navigation.go(...a),
    setMode: mode.select,
    appState,
    cinema,
    screeningVideos,
  });

  worldLoader = createLazyFeature({
    load: async () => {
      const { createWorld } = await import("./world/controller.js");
      if (lifetime.disposed) return null;
      return createWorld({
        releases,
        release,
        dj,
        go: (...a) => navigation.go(...a),
        twin,
        rand,
        commerce,
        cinema,
        today,
        timeline: community.timeline,
        modal,
        giving: community.giving,
        data,
        audio,
        appState,
        playerDock,
        setMode: mode.select,
        autoStart: false,
        signal: worldAbort.signal,
      });
    },
    onReady(world) {
      sceneAPI = world;
      document.dispatchEvent(new Event("truth-room-ready"));
      world.travel(appState.station);
      for (let i = 0; i < 4; i++)
        if (appState.score >= (i + 1) * 25) world.unlock(i);
      if (
        appState.mode === "immersive" &&
        !document.body.classList.contains("account-view")
      ) {
        document.body.classList.remove("flat");
        world.resume();
      }
    },
    onError(error) {
      console.warn("Room fallback:", error);
      $("#loading")?.remove();
      if (
        appState.mode === "immersive" &&
        !document.body.classList.contains("account-view")
      ) {
        mode.select("standard");
        toast("3D is unavailable. The full archive is open in Standard mode.");
      }
    },
  });
  if (appState.calm || appState.mode === "reduced") mode.select("reduced");
  else if (innerWidth < 650 || appState.mode === "standard")
    mode.select("standard");

  // The companion is an illustrated site guide, not a direct chat with Trae. All destinations are allowlisted.
  // Retain the approved illustrated character. Canvas layers provide light limb/head motion without a card flip.

  const deepLink = location.hash.match(/^#release=(\d+)$/);
  if (deepLink && releases[+deepLink[1]]) release(releases[+deepLink[1]]);

  router.start();
  accountRoute();

  let disposed = false;
  async function destroy() {
    if (disposed) return;
    disposed = true;
    lifetime.dispose();
    router.destroy();
    await fullscreen.leave();
    if ($("#modal").open) $("#modal").close();
    chrome.destroy();
    companion.destroy();
    cinema.destroy();
    worldLoader.destroy();
    sceneAPI = null;
    dj.destroy();
    playerDock.destroy();
    await audio.destroy();
    catalog.destroy();
    editorial.destroy();
    account.destroy();
    commerce.destroy();
    community.destroy();
    navigation.destroy();
    mode.destroy();
    fullscreen.destroy();
    homeSummary.destroy();
    feedback.destroy();
    twins.destroy();
    document.body.classList.remove(
      "account-view",
      "editorial-view",
      "bump-shop-view",
      "theater-mode",
      "in-screening-room",
      "cinema-playing",
      "on-street",
      "in-dj-room",
      "at-stadium",
      "at-ballpark",
      "at-uptown",
    );
  }
  lifetime.listen(window, "pagehide", (event) => {
    if (event.persisted) sceneAPI?.suspend();
    else void destroy();
  });
  lifetime.listen(window, "pageshow", () => {
    if (appState.mode === "immersive") sceneAPI?.resume();
  });
  return {
    state: appState,
    destroy,
    services: { audio, cinema, companion, world: worldLoader },
  };
}
