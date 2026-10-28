import { $, esc } from "../../app/core/dom.js";
export function createRecordEditor({
  model,
  imageFor,
  preview,
  save,
  upload,
  say,
}) {
  function input(
    name,
    label,
    {
      type = "text",
      value = model.record?.[name] ?? "",
      help = "",
      required = false,
    } = {},
  ) {
    return `<label>${label}<input name="${name}" type="${type}" ${type === "number" ? 'step="any" min="0"' : ""} value="${esc(value)}" ${required ? "required" : ""}>${help ? `<span class="help">${help}</span>` : ""}</label>`;
  }
  function area(name, label) {
    return `<label>${label}<textarea name="${name}">${esc(model.record[name] || "")}</textarea></label>`;
  }
  function select(name, label, options) {
    return `<label>${label}<select name="${name}">${options
      .map((v) => {
        const [key, text] = Array.isArray(v) ? v : [v, v];
        return `<option value="${esc(key)}" ${String(model.record[name]) === String(key) ? "selected" : ""}>${esc(text)}</option>`;
      })
      .join("")}</select></label>`;
  }
  function check(name, label) {
    return `<label class="check"><input type="checkbox" name="${name}" ${model.record[name] ? "checked" : ""}>${label}</label>`;
  }
  function photoSelect() {
    return select("imageId", "PHOTO FROM THE LIBRARY", [
      ["", "No library photo"],
      ...(model.state.photos || [])
        .filter((p) => p.status === "published")
        .map((p) => [p.id, p.title]),
    ]);
  }
  function uploadField(id, label, multiple = false, audio = false) {
    return `<label class="upload">${label}<input type="file" id="${id}" ${multiple ? "multiple" : ""} accept="${audio ? "audio/mpeg,.mp3" : "image/jpeg,image/png,image/webp"}"><span class="help">${audio ? "MP3 / up to 300 MB each. Audio remains private until access is configured." : "JPEG, PNG or WebP / up to 30 MB each."}</span></label>`;
  }
  function editor() {
    const host = $("#editor");
    if (!model.record) {
      host.innerHTML =
        '<div class="editor"><div class="eyebrow">THE PUBLISHING DESK</div><h2 style="margin-top:16px">Select a piece.<br>Make it yours.</h2><p>Choose an item on the left, or start something new. Existing drafts remain private until you publish them.</p></div>';
      return;
    }
    let fields = input("title", "TITLE", { required: true });
    const precision = () =>
      select("precision", "DATE PRECISION", [
        "day",
        "month",
        "year",
        "approx",
        "unknown",
      ]);
    if (model.section === "articles")
      fields += `<div class="two">${input("date", "ORIGINAL PUBLICATION DATE", { help: "YYYY-MM-DD, YYYY-MM or YYYY; match precision." })}${precision()}</div><div class="two">${select("section", "SECTION", ["Music", "Community", "Houston"])}${select("kind", "ARTICLE TYPE", ["Original", "News desk report", "News brief", "Archive brief"])}</div>${input("byline", "BYLINE")}${area("summary", "SUMMARY / FRONT-PAGE DECK")}${area("body", "ARTICLE BODY / PLAIN TEXT, BLANK LINE BETWEEN PARAGRAPHS")}${photoSelect()}<div class="two">${input("sourceName", "SOURCE OUTLET")}${input("sourceUrl", "ORIGINAL SOURCE LINK", { type: "url" })}</div>${input("sourceDate", "SOURCE PUBLICATION DATE")}${check("verified", "Editorial facts verified")}${check("featured", "Feature on the newsroom front page")}`;
    if (model.section === "events")
      fields += `<div class="two">${input("startDate", "START DATE", { type: "date" })}${input("endDate", "END DATE", { type: "date" })}</div><div class="two">${input("category", "CATEGORY")}${input("venue", "LOCATION / VENUE")}</div>${area("description", "EVENT DETAILS")}${photoSelect()}${input("sourceName", "ANNOUNCEMENT SOURCE")}${input("sourceUrl", "EVENT / TICKET LINK", { type: "url" })}${input("linkLabel", "LINK LABEL")}`;
    if (model.section === "photos")
      fields += `${imageFor(model.record) ? `<img class="image-preview" src="${esc(imageFor(model.record))}" alt="Current photograph">` : ""}${uploadField("photo-upload", "UPLOAD / REPLACE PHOTO")}${area("caption", "CAPTION")}${input("alt", "DESCRIPTIVE ALT TEXT", { help: "Required to publish. Describe what is visible." })}<div class="two">${input("date", "PHOTO DATE", { help: "Leave empty if unknown." })}${precision()}</div>${input("collection", "COLLECTION")}${input("credit", "PHOTOGRAPHER / CREDIT")}${input("license", "RIGHTS / CREDIT NOTES")}${input("sourceUrl", "PHOTO SOURCE LINK", { type: "url" })}${check("featured", "Featured photograph")}`;
    if (model.section === "products")
      fields += `${imageFor(model.record) ? `<img class="image-preview" src="${esc(imageFor(model.record))}" alt="Current product photo">` : ""}${uploadField("product-upload", "UPLOAD PRODUCT IMAGE")}${photoSelect()}${area("description", "PRODUCT DESCRIPTION")}<div class="two">${input("category", "CATEGORY")}${select("kind", "PLACEHOLDER SHAPE", ["tee", "hoodie", "cap", "tote", "speaker"])}</div><div class="two">${input("price", "PRICE / USD", { type: "number", value: model.record.priceCents === null ? "" : (model.record.priceCents / 100).toFixed(2), help: "Leave empty for price to be announced." })}${input("stock", "STOCK COUNT", { type: "number", help: "Leave empty if managed by the checkout provider." })}</div>${input("sizes", "SIZES / OPTIONS", { value: (model.record.sizes || []).join(", "), help: "Comma-separated, e.g. S, M, L, XL." })}<div class="two">${select("availability", "AVAILABILITY", ["coming-soon", "available", "sold-out"])}${input("color", "PLACEHOLDER COLOR", { type: "color", value: model.record.color || "#202622" })}</div>${input("checkoutUrl", "CHECKOUT / OFFICIAL PRODUCT URL", { type: "url", help: "Required for available products. This console does not process payments." })}${check("featured", "Featured product")}`;
    if (model.section === "projects")
      fields += `${model.record.cover ? `<img class="image-preview" src="${esc(model.record.cover)}" alt="Current cover">` : ""}${uploadField("cover-upload", "UPLOAD COVER ART")}<div class="two">${input("date", "RELEASE DATE", { help: "YYYY-MM-DD or YYYY." })}${select("type", "PROJECT TYPE", ["Album", "Mixtape", "EP", "Single", "Compilation", "Release"])}</div>${area("description", "PROJECT NOTES")}${select(
        "access",
        "LISTENING ACCESS",
        [
          ["member", "Members only / production setup required"],
          ["purchase", "Purchased / production setup required"],
          ["public", "Public preview / plays on this local server"],
        ],
      )}${check("djEligible", "Eligible for DJ booth / future catalog integration")}${uploadField("tracks-upload", "ADD MP3 TRACKS / MULTIPLE FILES", true, true)}<div id="tracks"></div><p class="help">Use arrows to set track order. Publishing requires cover art, a date and an MP3 for every listed track. Member files remain gated until production accounts and entitlements are connected.</p>`;
    host.innerHTML = `<form class="editor" id="edit-form"><div class="eyebrow">${esc(model.record.status.toUpperCase())} / ${model.record.id ? "REVISION " + model.record.version : "NEW ITEM"}</div>${fields}<label>SCHEDULED PUBLISH TIME / OPTIONAL<input name="publishAt" type="datetime-local" value="${model.record.publishAt ? esc(localTime(model.record.publishAt)) : ""}"></label><p class="help">Scheduling is evaluated by the local content API. Production scheduling requires a deployed publisher.</p><div class="actions"><button type="button" id="save-draft">Save draft</button><button type="button" id="save-schedule">Schedule</button><button class="primary" type="submit">Publish to local previews ↗</button></div><div class="preview" id="preview"></div></form>`;
    $("#edit-form").oninput = () => {
      model.dirty = true;
      preview();
    };
    $("#edit-form").onsubmit = (e) => {
      e.preventDefault();
      save("published");
    };
    $("#save-draft").onclick = () => save("draft");
    $("#save-schedule").onclick = () => save("scheduled");
    for (const [id, field] of [
      ["photo-upload", "fileId"],
      ["product-upload", "imageFileId"],
      ["cover-upload", "coverFileId"],
    ])
      if ($("#" + id))
        $("#" + id).onchange = async (e) => {
          if (!e.target.files[0]) return;
          readForm();
          try {
            const info = await upload(e.target.files[0], "photo");
            model.record[field] = info.id;
            const url = "/api/cms/assets/" + info.id;
            if (field === "fileId")
              model.record.src = model.record.fullSrc = url;
            if (field === "imageFileId") model.record.image = url;
            if (field === "coverFileId") model.record.cover = url;
            model.dirty = true;
            editor();
          } catch (err) {
            say(err.message, true);
          }
        };
    if ($("#tracks-upload"))
      $("#tracks-upload").onchange = async (e) => {
        const files = [...e.target.files].sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { numeric: true }),
        );
        readForm();
        try {
          for (const file of files) {
            const info = await upload(file, "audio"),
              existing = model.record.tracks.find((t) => !t.fileId);
            if (existing) existing.fileId = info.id;
            else
              model.record.tracks.push({
                id: "track-" + crypto.randomUUID().slice(0, 8),
                title: file.name
                  .replace(/\.mp3$/i, "")
                  .replace(/^\d+[\s._-]+/, ""),
                fileId: info.id,
                bpm: null,
              });
          }
          model.dirty = true;
          renderTracks();
          say(
            "MP3 files uploaded privately. Check titles and order, then save.",
          );
        } catch (err) {
          say(err.message, true);
        }
      };
    if (model.section === "projects") renderTracks();
    preview();
  }
  function localTime(value) {
    const d = new Date(value);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  }
  function readForm() {
    const form = $("#edit-form");
    if (!form) return;
    const data = new FormData(form);
    for (const [key, value] of data) {
      if (["price", "stock", "sizes", "publishAt"].includes(key)) continue;
      if (model.record[key] !== undefined) model.record[key] = String(value);
    }
    for (const name of ["featured", "verified", "djEligible"])
      if (form.elements[name]) model.record[name] = form.elements[name].checked;
    if (model.section === "products") {
      const price = data.get("price"),
        stock = data.get("stock");
      model.record.priceCents =
        price === "" ? null : Math.round(Number(price) * 100);
      model.record.stock = stock === "" ? null : Number(stock);
      model.record.sizes = String(data.get("sizes") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    const at = data.get("publishAt");
    model.record.publishAt = at ? new Date(at).toISOString() : null;
  }
  function renderTracks() {
    const host = $("#tracks");
    if (!host) return;
    host.innerHTML = model.record.tracks
      .map(
        (t, i) =>
          `<div class="track"><div class="track-row"><small>${String(i + 1).padStart(2, "0")}</small><input data-track-title="${i}" value="${esc(t.title)}" aria-label="Track ${i + 1} title"><input class="bpm" type="number" min="30" max="240" step=".1" placeholder="BPM" data-track-bpm="${i}" value="${t.bpm ?? ""}" aria-label="Track ${i + 1} BPM"><button type="button" data-up="${i}" aria-label="Move track ${i + 1} up">↑</button><button type="button" data-down="${i}" aria-label="Move track ${i + 1} down">↓</button><button type="button" data-remove="${i}" aria-label="Remove track ${i + 1}">×</button></div>${t.fileId ? `<audio controls preload="none" src="/api/cms/assets/${esc(t.fileId)}"></audio>` : "<small>MP3 not attached / upload files above</small>"}</div>`,
      )
      .join("");
    host.querySelectorAll("[data-track-title]").forEach(
      (el) =>
        (el.oninput = () => {
          model.record.tracks[+el.dataset.trackTitle].title = el.value;
          model.dirty = true;
        }),
    );
    host.querySelectorAll("[data-track-bpm]").forEach(
      (el) =>
        (el.oninput = () => {
          model.record.tracks[+el.dataset.trackBpm].bpm =
            el.value === "" ? null : Number(el.value);
          model.dirty = true;
        }),
    );
    for (const action of ["up", "down", "remove"])
      host.querySelectorAll("[data-" + action + "]").forEach(
        (b) =>
          (b.onclick = () => {
            readForm();
            const i = +b.dataset[action],
              j = action === "up" ? i - 1 : i + 1;
            if (action === "remove") model.record.tracks.splice(i, 1);
            else if (j >= 0 && j < model.record.tracks.length)
              [model.record.tracks[i], model.record.tracks[j]] = [
                model.record.tracks[j],
                model.record.tracks[i],
              ];
            model.dirty = true;
            renderTracks();
          }),
      );
  }
  return { editor, readForm, renderTracks };
}
