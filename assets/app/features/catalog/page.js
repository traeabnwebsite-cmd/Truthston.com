import { $, $$, esc } from "../../core/dom.js";
export function createCatalogPage({
  appState,
  releases,
  sourceLabel,
  challenge,
  recordActivity,
  earn,
  toast,
  modal,
  play,
  pauseRoomForVideo,
  enterDJRoom,
  registerTwin,
}) {
  function release(r) {
    recordActivity("dig", String(r.title) + ":" + r.year);
    appState.selected = r;
    earn(4);
    challenge.tryComplete(r);
    modal(
      `<div class="modal-layout"><img class="modal-cover" src="${esc(r.fullCover || r.cover)}" alt="${esc(r.title)} cover"><div><span class="eyebrow">RELEASE ROOM / ${esc(r.year)} / ${esc(r.type || "Release")}</span><h2>${esc(r.title)}</h2><p>${sourceLabel ? "From the research vault" : "Concept sleeve · sample release"}<br>${r.cmsProjectId ? "Uploaded project · " + esc(r.access) + " access" : "Boss Ballin is the preview record for every selection."}</p>${
        r.cmsProjectId
          ? `<div class="project-audio">${
              r.audioTracks
                .filter((t) => t.audioUrl)
                .map(
                  (t) =>
                    `<label>${esc(t.title)}<audio controls preload="none" src="${esc(t.audioUrl)}" style="width:100%;margin:10px 0"></audio></label>`,
                )
                .join("") ||
              "<p>Member playback will be available after membership services are connected.</p>"
            }</div>`
          : ""
      }<ol>${r.tracks.length ? r.tracks.map((t) => `<li>${esc(typeof t === "string" ? t : t.title || t.name)}</li>`).join("") : "<li>Tracklist not available in the vault.</li>"}</ol><div class="actions"><button class="primary" id="release-play">▶ Play</button><button class="secondary" id="release-deck">DJ Booth</button><button class="secondary" id="release-share">Share ↗</button></div></div></div>`,
    );
    const im = $(".modal-cover");
    im.onerror = () => (im.src = r.art);
    $("#release-play").hidden = !!r.cmsProjectId;
    $("#release-play").onclick = () => play(true);
    $$(".project-audio audio").forEach(
      (a) =>
        (a.onplay = () => {
          pauseRoomForVideo();
          $$(".project-audio audio").forEach((other) => {
            if (other !== a) other.pause();
          });
        }),
    );
    $("#release-deck").onclick = enterDJRoom;
    $("#release-share").onclick = () => share(r);
  }
  async function share(r) {
    const c = document.createElement("canvas");
    c.width = 1000;
    c.height = 1200;
    const x = c.getContext("2d");
    x.fillStyle = "#eee6d3";
    x.fillRect(0, 0, 1000, 1200);
    let im = new Image();
    im.crossOrigin = "anonymous";
    await new Promise((resolve) => {
      im.onload = resolve;
      im.onerror = () => {
        im.onload = resolve;
        im.src = r.art;
      };
      im.src = r.cover;
    });
    try {
      x.drawImage(im, 100, 100, 800, 800);
      c.toDataURL();
    } catch {
      im = new Image();
      await new Promise((resolve) => {
        im.onload = resolve;
        im.src = r.art;
      });
      x.drawImage(im, 100, 100, 800, 800);
    }
    x.fillStyle = "#c3321d";
    x.font = "900 60px Impact,sans-serif";
    x.fillText(r.title.toUpperCase(), 100, 980, 800);
    x.fillStyle = "#26251e";
    x.font = "22px monospace";
    x.fillText("TRAE THA TRUTH / ABN RECORDS, CDs AND TAPES", 100, 1060, 800);
    x.fillText(r.year + " / HOUSTON, TEXAS / CONCEPT EDITION", 100, 1110);
    const url = c.toDataURL("image/png");
    modal(
      `<span class="eyebrow">MOMENTS / TAKE A PIECE OF THE ROOM</span><h2>Keep this one.</h2><img class="share-image" src="${url}" alt="Share card for ${esc(r.title)}"><div class="actions"><a class="primary" download="the-truth-moment.png" href="${url}">Save card ↓</a><button class="secondary" id="copy">Copy link</button></div>`,
    );
    $("#copy").onclick = async () => {
      const u = new URL(location.href);
      u.hash = "release=" + releases.indexOf(r);
      try {
        await navigator.clipboard.writeText(u.href);
        toast("Link copied.");
      } catch {
        modal(
          `<h2>Your moment link</h2><input style="width:100%;padding:12px" aria-label="Copy this link" value="${esc(u.href)}"><p>Select and copy this link. Local file links require the same file on the recipient’s device.</p>`,
        );
      }
    };
  }
  $("#grid").innerHTML = releases
    .map(
      (r, i) =>
        `<button class="release" data-release="${i}"><img loading="lazy" src="${esc(r.cover)}" alt="${esc(r.title)} sleeve"><b>${esc(r.title)}</b><small>${esc(r.year)} / ${esc(r.type || "Release")}</small></button>`,
    )
    .join("");
  $$("[data-release]").forEach((b) => {
    b.onclick = () => release(releases[+b.dataset.release]);
    b.querySelector("img").onerror = () =>
      (b.querySelector("img").src = releases[+b.dataset.release].art);
  });
  for (let i = 0; i < releases.length; i++)
    registerTwin(
      `Release ${i + 1}: ${releases[i].title}, ${releases[i].year}`,
      () => release(releases[i]),
    );
  return {
    openRelease: release,
    share,
    destroy() {
      $("#grid").replaceChildren();
    },
  };
}
