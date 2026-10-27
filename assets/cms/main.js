import { $, esc } from "../app/core/dom.js";
import { createCmsApi } from "./api.js";
import { createUploader } from "./uploads.js";
import { createRecordEditor } from "./editors/records.js";
import { blankRecord } from "./editors/defaults.js";
("use strict");

const sections = [
  ["dashboard", "Overview"],
  ["articles", "Newsroom"],
  ["events", "Current events"],
  ["photos", "Photo library"],
  ["projects", "Music projects"],
  ["products", "Merch store"],
  ["site", "Site copy"],
  ["history", "Activity log"],
];
const model = {
  state: null,
  csrf: "",
  section: "dashboard",
  record: null,
  query: "",
  filter: "All",
  saving: false,
  dirty: false,
};
const workspace = $("#workspace"),
  notice = $("#notice");
function say(text, error = false) {
  notice.textContent = text;
  notice.className = error ? "error" : "";
}
const api = createCmsApi({ getCsrf: () => model.csrf });
async function refresh() {
  const result = await api("content");
  model.state = result.state || result;
  model.dirty = false;
}
function nav() {
  $("#navigation").innerHTML = sections
    .map(
      ([id, title]) =>
        `<button data-section="${id}" ${model.section === id ? 'aria-current="page"' : ""}>${title}</button>`,
    )
    .join("");
  document.querySelectorAll("[data-section]").forEach(
    (b) =>
      (b.onclick = () => {
        if (!leave()) return;
        model.section = b.dataset.section;
        model.record = null;
        model.query = "";
        model.filter = "All";
        render();
      }),
  );
}
function leave() {
  return !model.dirty || confirm("Discard unsaved changes in this editor?");
}
function render() {
  nav();
  $("#heading").textContent =
    sections.find((s) => s[0] === model.section)?.[1] || "Publishing desk";
  say("");
  if (model.section === "dashboard") dashboard();
  else if (model.section === "site") siteEditor();
  else if (model.section === "history") history();
  else collection();
}
function dashboard() {
  workspace.innerHTML = `<div class="dashboard">${[
    "articles",
    "photos",
    "projects",
    "products",
    "events",
  ]
    .map((kind) => {
      const items = model.state[kind] || [];
      return `<button class="stat" data-open="${kind}"><span>${sections.find((s) => s[0] === kind)[1]}</span><strong>${items.length}</strong><small>${items.filter((x) => x.status === "published").length} PUBLISHED / ${items.filter((x) => x.status === "draft").length} DRAFTS</small></button>`;
    })
    .join(
      "",
    )}<div class="stat"><span>Publishing revision</span><strong>${model.state.revision}</strong><small>CHANGES SAVED TO DISK</small></div></div><div class="desk-note"><div class="eyebrow">A REAL PUBLISHING WORKFLOW</div><h2>Your archive, ready for its next chapter.</h2><p>Draft, preview and publish stories, photos, events, music projects and merchandise. Published changes appear on both local previews after a refresh. Drafts and uploaded audio stay outside the public website files.</p><p>Production staff sign-in, private cloud storage, paid memberships, inventory reservations and checkout require the Cloudflare and payment integrations. A product marked “Available” must link to an actual checkout. Public project playback works through this local server; member and purchase playback remain locked.</p></div>`;
  document.querySelectorAll("[data-open]").forEach(
    (b) =>
      (b.onclick = () => {
        model.section = b.dataset.open;
        render();
      }),
  );
}
function imageFor(r) {
  if (model.section === "photos") return r.src;
  return (
    r.image ||
    r.cover ||
    (model.state.photos || []).find((p) => p.id === r.imageId)?.src ||
    ""
  );
}
function collection() {
  workspace.innerHTML = `<div class="toolbar"><button class="primary" id="new-item">+ New ${model.section === "products" ? "product" : model.section === "photos" ? "photo" : model.section === "projects" ? "project" : model.section === "events" ? "event" : "article"}</button></div><div class="split"><div><div class="toolbar"><input id="search" type="search" placeholder="Search titles or dates…" aria-label="Search content" value="${esc(model.query)}"><select id="filter" aria-label="Publication status">${["All", "draft", "published", "scheduled"].map((v) => `<option ${model.filter === v ? "selected" : ""}>${v}</option>`).join("")}</select></div><div class="item-list" id="items"></div></div><div id="editor"></div></div>`;
  list();
  recordEditor.editor();
  $("#new-item").onclick = () => {
    if (!leave()) return;
    model.record = blank();
    model.dirty = false;
    recordEditor.editor();
    list();
  };
  $("#search").oninput = (e) => {
    model.query = e.target.value;
    list();
  };
  $("#filter").onchange = (e) => {
    model.filter = e.target.value;
    list();
  };
}
function list() {
  const items = (model.state[model.section] || []).filter(
    (r) =>
      (model.filter === "All" || r.status === model.filter) &&
      [r.title, r.date, r.startDate]
        .join(" ")
        .toLowerCase()
        .includes(model.query.toLowerCase()),
  );
  $("#items").innerHTML =
    items
      .slice(0, 150)
      .map(
        (r) =>
          `<button class="item" data-item="${esc(r.id)}" aria-current="${model.record?.id === r.id}">${imageFor(r) ? `<img src="${esc(imageFor(r))}" alt="" loading="lazy">` : ""}<span>${esc(r.title)}<small>${esc(r.status.toUpperCase())} / ${esc(r.date || r.startDate || r.category || "NO DATE")}</small></span></button>`,
      )
      .join("") || '<p class="empty">No matching items.</p>';
  document.querySelectorAll("[data-item]").forEach(
    (b) =>
      (b.onclick = () => {
        if (!leave()) return;
        model.record = structuredClone(
          model.state[model.section].find((r) => r.id === b.dataset.item),
        );
        model.dirty = false;
        recordEditor.editor();
        list();
      }),
  );
}
function blank() {
  return blankRecord(model.section);
}

function preview() {
  if (!$("#preview")) return;
  const form = $("#edit-form"),
    title = form.elements.title?.value || model.record.title,
    body =
      form.elements.body?.value ||
      form.elements.description?.value ||
      form.elements.caption?.value ||
      "";
  $("#preview").innerHTML =
    `<div class="eyebrow">CONTENT PREVIEW / UNSAVED</div><h2>${esc(title || "Your title goes here.")}</h2><p>${esc(body || "Your copy will appear here.")}</p>`;
}

const upload = createUploader({ api, say });
const recordEditor = createRecordEditor({
  model,
  imageFor,
  preview,
  save,
  upload,
  say,
});
async function save(status) {
  if (model.saving) return;
  model.saving = true;
  document
    .querySelectorAll(".actions button")
    .forEach((b) => (b.disabled = true));
  try {
    recordEditor.readForm();
    model.record.status = status;
    const saved = await api("record", {
      collection: model.section,
      record: model.record,
      expectedVersion: model.record.version || 0,
    });
    model.record = saved.record || saved;
    await refresh();
    model.record = structuredClone(
      model.state[model.section].find((r) => r.id === model.record.id),
    );
    recordEditor.editor();
    list();
    say(
      status === "draft"
        ? "Draft saved privately."
        : status === "scheduled"
          ? "Publication scheduled."
          : "Published. Refresh the website preview to see this update.",
    );
  } catch (err) {
    say(err.message, true);
  } finally {
    model.saving = false;
    document
      .querySelectorAll(".actions button")
      .forEach((b) => (b.disabled = false));
  }
}
function siteEditor() {
  workspace.innerHTML = `<form class="editor" id="site-form"><div class="eyebrow">PUBLIC SITE COPY / REVISION ${model.state.revision}</div>${Object.entries(
    model.state.site,
  )
    .map(
      ([key, value]) =>
        `<label>${esc(key.replace(/([A-Z])/g, " $1").toUpperCase())}<textarea name="${esc(key)}">${esc(value)}</textarea></label>`,
    )
    .join(
      "",
    )}<div class="actions"><button class="primary">Save site copy</button></div></form>`;
  $("#site-form").oninput = () => (model.dirty = true);
  $("#site-form").onsubmit = async (e) => {
    e.preventDefault();
    try {
      await api("site", {
        site: Object.fromEntries(new FormData(e.target)),
        expectedRevision: model.state.revision,
      });
      await refresh();
      siteEditor();
      say("Site copy saved to both local previews.");
    } catch (err) {
      say(err.message, true);
    }
  };
}
function history() {
  workspace.innerHTML = `<table class="history"><thead><tr><th>WHEN</th><th>ACTION</th><th>ITEM</th><th>EDITOR</th></tr></thead><tbody>${
    [...(model.state.audit || [])]
      .reverse()
      .slice(0, 100)
      .map(
        (a) =>
          `<tr><td>${esc(new Date(a.at).toLocaleString())}</td><td>${esc(a.action)}</td><td>${esc(a.detail?.title || "Site copy")}</td><td>${esc(a.actor)}</td></tr>`,
      )
      .join("") || '<tr><td colspan="4">No publishing actions yet.</td></tr>'
  }</tbody></table>`;
}
$("#reload").onclick = async () => {
  if (!leave()) return;
  try {
    await refresh();
    model.record = null;
    render();
    say("Latest content loaded.");
  } catch (err) {
    say(err.message, true);
  }
};
window.addEventListener("beforeunload", (e) => {
  if (model.dirty) {
    e.preventDefault();
    e.returnValue = "";
  }
});
(async () => {
  try {
    const session = await api("session");
    model.csrf = session.csrf;
    await refresh();
    $("#connection").innerHTML =
      "<strong>LOCAL TEAM EDITING</strong> · Changes save to this computer. Production staff authentication and cloud publishing are not connected.";
    render();
  } catch (err) {
    $("#connection").textContent =
      "Publishing console locked / service not connected.";
    workspace.innerHTML = `<div class="locked"><div class="eyebrow">TEAM ACCESS</div><h2>Connect the publishing desk.</h2><p>${esc(err.message)}</p><p>For local editing, open <strong>Launch Preview.command</strong> in the Trae Website folder. The public Cloudflare preview does not expose local drafts or accept anonymous editing. Production requires verified staff sign-in and cloud storage.</p><a href="index.html">Back to the website ↗</a></div>`;
    $("#reload").hidden = true;
  }
})();
