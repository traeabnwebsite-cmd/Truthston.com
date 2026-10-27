import { $, $$, esc } from "../../core/dom.js";
export function createCompanionKnowledge({ state, lifetime, releases }) {
  function localAnswer(q) {
    const t = q.toLowerCase();
    if (/bump|boom.?box|personali[sz]/.test(t))
      return {
        answer:
          "Click a Bumpboxx in the DJ room to open its merch page. Shop Bumpboxx takes you to the official store for available models and colors. Customization depends on the current official options.",
        actions: ["boom", "dj"],
      };
    if (
      /giveaway|discount|subscription|subscrib|member|join|sign.?up|account/.test(
        t,
      )
    )
      return {
        answer:
          "Start your preview Stamp Book with a display name under Account. Paid subscriptions, project discounts and giveaways are planned; there are no active offers or paid sign-ups in this prototype.",
        actions: ["member"],
      };
    if (/stamp|reward|credit/.test(t))
      return {
        answer:
          "Open five different releases for Crate Digger, explore four landmark views for Street Certified, listen for 60 seconds for The Truth, or make four manual DJ cuts for Chopped In. Stamps stay in your book; separate credits can be spent on demo rewards. Official approval stamps need verified awards.",
        actions: ["member", "crate", "dj"],
      };
    if (/shirt|hood|apparel|merch|clothes|sweater/.test(t))
      return {
        answer:
          "The apparel rack in the record shop opens the ABN merch concepts. Choose a size and save favorites. Apparel checkout and final products are not live yet.",
        actions: ["merch"],
      };
    if (/scratch|chop|screw|turntable|pitch|cross.?fad|djay|\bdj\b/.test(t))
      return {
        answer:
          "Enter the DJ room, then select a turntable to open the mixer. Both decks play Boss Ballin; B starts one beat ahead. Lower the linked pitch for the screwed sound, cut A/B to chop, and drag a platter forward or backward to scratch.",
        actions: ["dj"],
      };
    if (/video|youtube|screen/.test(t))
      return {
        answer:
          "The screening room opens a projector-view theater with an in-room YouTube screen, film strip above the screen and dimmed lights. The companion joins you in a seat with popcorn. Choose a video in the carousel; use Fullscreen to expand the whole theater.",
        actions: ["screens"],
      };
    if (/street|city|houston|stadium|reliant|astrodome|transco|roof/.test(t))
      return {
        answer:
          "Go through the back door to explore Houston. The landmark buttons reach the skyline, Be Someone bridge, Transco, Reliant, Astrodome, ballpark and Rockets arena. Reliant and the ballpark have roof controls.",
        actions: ["street"],
      };
    if (/relief|giving|charity|trae day/.test(t))
      return {
        answer:
          "Visit the Giving wing for the Relief Gang, Angel By Nature and Trae Day map pins. The ledger is a demonstration, not live fundraising totals.",
        actions: ["giving"],
      };
    if (/are you trae|real trae|personally/.test(t))
      return {
        answer:
          "I’m the illustrated site companion, not Trae personally. I can help you navigate this prototype.",
        actions: ["chat"],
      };
    const tokens = t
      .replace(/[^a-z0-9 ]/g, " ")
      .split(/\s+/)
      .filter(
        (v) =>
          v.length > 2 &&
          ![
            "the",
            "tha",
            "what",
            "when",
            "tell",
            "about",
            "music",
            "record",
            "release",
            "project",
            "album",
            "year",
          ].includes(v),
      );
    const found = releases
      .map((r) => ({
        r,
        n: tokens.filter((v) => r.title.toLowerCase().includes(v)).length,
      }))
      .filter((v) => v.n > 0)
      .sort((a, b) => b.n - a.n)[0];
    if (found) {
      state.activeProject = found.r;
      return {
        answer:
          state.activeProject.title +
          " is listed in the local catalog as " +
          state.activeProject.year +
          " / " +
          (state.activeProject.type || "release") +
          ". Open the sleeve to see its available tracklist. Boss Ballin is the playback preview for all releases right now.",
        actions: ["record", "crate"],
      };
    }
    return {
      answer:
        "I can help with the release catalog, DJ controls, videos, Houston landmarks, Bumpboxx, apparel or stamps. Ask about one of those and I’ll point you there.",
      actions: ["crate", "dj", "member"],
    };
  }
  return { localAnswer };
}
