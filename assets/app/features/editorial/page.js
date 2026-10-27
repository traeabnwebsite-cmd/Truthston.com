import { createEventCalendar } from "../events/calendar.js";
import { uniqueGalleryPhotos } from "./gallery.js";
import { $, $$, esc } from "../../core/dom.js";
import { createLifetime } from "../../core/lifecycle.js";
export function createEditorialPage({
  siteContent,
  galleryCuration,
  getWishlist,
  renderGarment,
  toast,
  modal,
}) {
  const lifetime = createLifetime();
  const eventCalendar = createEventCalendar({
    events: siteContent.events || [],
    title: siteContent.site?.eventsTitle || "Mark the date.",
    intro:
      siteContent.site?.eventsIntro ||
      "Shows, community days, releases and moments to be there for.",
  });
  let editorialFilter = "All",
    editorialQuery = "",
    editorialLimit = 12,
    gallerySelection = [];

  const editorialDate = (value, precision = "day") => {
    if (!value) return "Date not recorded";
    if (precision === "year") return String(value).slice(0, 4);
    const d = new Date(
      String(value).slice(0, 10) +
        (String(value).length === 7 ? "-15" : "") +
        "T12:00:00",
    );
    if (!Number.isFinite(d.getTime())) return String(value);
    return (
      new Intl.DateTimeFormat(
        "en-US",
        precision === "month" || precision === "approx"
          ? { month: "long", year: "numeric" }
          : { month: "short", day: "numeric", year: "numeric" },
      ).format(d) + (precision === "approx" ? " (approx.)" : "")
    );
  };
  const contentPhoto = (id) =>
    (siteContent.photos || []).find((p) => p.id === id);
  function sourceLink(a) {
    return a.sourceUrl
      ? `<a class="journal-source" href="${esc(a.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(a.sourceName || "Original source")} ↗</a>`
      : "";
  }
  function storyMeta(a) {
    return `<div class="journal-meta"><time>${esc(editorialDate(a.date, a.precision))}</time><span>${esc(a.kind || "ABN Journal")}</span></div>`;
  }
  function photoImage(p, { lead = false } = {}) {
    return p
      ? `<img src="${esc(lead ? p.fullSrc || p.src : p.src)}" alt="${esc(p.alt || p.title)}" ${lead ? 'fetchpriority="high"' : 'loading="lazy"'}>`
      : "";
  }
  function storyCard(a) {
    const photo = contentPhoto(a.imageId);
    return `<article class="journal-card"><button class="journal-story-button" data-story="${esc(a.id)}">${photoImage(photo)}<span class="journal-kicker">${esc(a.section)}</span><h3>${esc(a.title)}</h3></button>${storyMeta(a)}<p>${esc(a.summary)}</p>${sourceLink(a)}</article>`;
  }
  function editorialChrome(section) {
    const d = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date());
    return `<div class="journal-edition"><span>TRUTHSTON, TEXAS / ANGEL BY NATURE</span><span>${esc(d)}</span><span>${section === "newsroom" ? "THE RECORD OF A LIFE." : "ABN / " + section.toUpperCase()}</span></div>`;
  }
  function editorialFooter() {
    return `<footer class="editorial-footer"><span>TRUTHSTON.COM / THE ABN JOURNAL</span><span>FROM HOUSTON. FOR THE PEOPLE.</span><a href="cms.html">Team publishing console ↗</a></footer>`;
  }
  function articleView(a) {
    if (!a)
      return `<div class="editorial-empty">That article is not published. <a href="#newsroom">Back to the newsroom</a></div>`;
    const photo = contentPhoto(a.imageId),
      related = (siteContent.articles || [])
        .filter((v) => v.id !== a.id && v.section === a.section)
        .slice(0, 4);
    return `${editorialChrome("newsroom")}<div class="article-layout"><article class="article-main"><a class="journal-source" href="#newsroom">← The ABN Journal</a><div style="margin-top:24px" class="journal-kicker">${esc(a.section)} / ${esc(a.kind || "ABN Journal")}</div><h1>${esc(a.title)}</h1>${storyMeta(a)}<p class="article-deck">${esc(a.summary)}</p><p class="journal-caption">${esc(a.byline || "ABN Journal")}</p>${photo ? `<figure>${photoImage(photo, { lead: true })}<figcaption class="journal-caption">${esc(photo.caption || photo.title)} · ${esc(photo.credit)}${photo.date ? " · PHOTO ARCHIVE / " + esc(editorialDate(photo.date, photo.precision)) : ""}</figcaption></figure>` : ""}<div class="article-body">${String(
      a.body || a.summary,
    )
      .split(/\n\s*\n/)
      .filter(Boolean)
      .map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`)
      .join(
        "",
      )}</div><div class="article-attribution">${a.sourceUrl ? `This ${esc((a.kind || "brief").toLowerCase())} draws on the linked reporting or research record. Original publication: ${esc(editorialDate(a.sourceDate || a.date, a.precision))}.<br>${sourceLink(a)}` : "Original ABN editorial."}</div></article><aside class="article-aside"><span class="eyebrow">IN THIS EDITION</span><h3>More from ${esc(a.section)}.</h3>${related.map((r) => `<button data-story="${esc(r.id)}">${esc(r.title)}</button>`).join("")}<p class="journal-caption">Archive dates remain attached to their stories. New announcements are posted when confirmed.</p></aside></div>${editorialFooter()}`;
  }
  function renderEditorial() {
    const page = $("#editorial-page"),
      section = location.hash.slice(1).split("/")[0],
      articles = [...(siteContent.articles || [])].sort((a, b) =>
        String(b.date).localeCompare(String(a.date)),
      ),
      photos = uniqueGalleryPhotos(siteContent.photos || [], galleryCuration);
    if (section === "article") {
      page.innerHTML = articleView(
        articles.find(
          (a) => a.id === decodeURIComponent(location.hash.split("/")[1] || ""),
        ),
      );
      bindEditorial();
      return;
    }
    let content = "";
    if (section === "newsroom") {
      const eligible = articles.filter(
          (a) =>
            (editorialFilter === "All" || a.section === editorialFilter) &&
            (!editorialQuery ||
              [a.title, a.summary, a.sourceName, a.date]
                .join(" ")
                .toLowerCase()
                .includes(editorialQuery.toLowerCase())),
        ),
        lead = eligible.find((a) => a.featured) || eligible[0],
        side = eligible.filter((a) => a !== lead).slice(0, 3),
        rest = eligible.filter((a) => a !== lead && !side.includes(a));
      content = `${editorialChrome(section)}<div class="journal-masthead"><h1>${esc(siteContent.site?.newsroomName || "The ABN Journal")}</h1><p>${esc(siteContent.site?.newsroomTagline || "The music. The city. The mission.")}</p></div><div class="journal-toolbar"><div class="journal-filters" role="group" aria-label="News sections">${["All", "Music", "Community", "Houston"].map((v) => `<button data-editorial-filter="${v}" aria-pressed="${editorialFilter === v}">${v === "All" ? "Front page" : v}</button>`).join("")}</div><label class="journal-search">SEARCH THE PAPER<input id="editorial-search" value="${esc(editorialQuery)}" placeholder="Story, year or source…" type="search"></label></div>${lead ? `<div class="journal-front"><article class="journal-lead"><button data-story="${esc(lead.id)}"><span class="journal-kicker">${esc(lead.section)} / ${lead.featured ? "THE LEAD STORY" : "FROM THE ARCHIVE"}</span><h2>${esc(lead.title)}</h2>${photoImage(contentPhoto(lead.imageId), { lead: true })}</button>${contentPhoto(lead.imageId) ? `<div class="journal-caption">PHOTO / ${esc(contentPhoto(lead.imageId).credit)} · ${esc(contentPhoto(lead.imageId).caption || "ABN archive")}</div>` : ""}${storyMeta(lead)}<p>${esc(lead.summary)}</p>${sourceLink(lead)}</article><aside class="journal-sidebar"><span class="eyebrow">ON THE WIRE / DATED DISPATCHES</span>${side.map((a) => `<article><button class="journal-story-button" data-story="${esc(a.id)}"><span class="journal-kicker">${esc(a.section)}</span><h3>${esc(a.title)}</h3></button>${storyMeta(a)}<p>${esc(a.summary)}</p>${sourceLink(a)}</article>`).join("")}<div class="paper-note"><span class="eyebrow">THE PEOPLE BEHIND THE PAGES</span><h3>A city in every story.</h3><p>Music, community and moments from the research archive. Every sourced brief keeps its original date and a link to the reporting.</p><a class="journal-source" href="#gallery">Open the photo archive ↗</a></div></aside></div><div class="journal-section-heading"><h2>From the archive.</h2><small>${eligible.length} DATED STORIES</small></div><div class="journal-grid">${rest.slice(0, editorialLimit).map(storyCard).join("")}</div>${rest.length > editorialLimit ? '<button class="journal-load" id="editorial-more">More from the archive ↓</button>' : ""}` : '<div class="editorial-empty">No stories match that search. Try another year or section.</div>'}`;
    } else if (section === "gallery") {
      const selected = photos.filter(
          (p) =>
            (editorialFilter === "All" || p.collection === editorialFilter) &&
            (!editorialQuery ||
              [p.title, p.caption, p.credit, p.date]
                .join(" ")
                .toLowerCase()
                .includes(editorialQuery.toLowerCase())),
        ),
        collections = [
          "All",
          ...new Set(photos.map((p) => p.collection).filter(Boolean)),
        ];
      gallerySelection = selected;
      content = `${editorialChrome(section)}<div class="editorial-hero"><div><span class="journal-kicker">THE PHOTO ARCHIVE / IN GOOD COMPANY</span><h1>${esc(siteContent.site?.galleryTitle || "A life in the frame.")}</h1><p>${esc(siteContent.site?.galleryIntro || "On stage. In the city. With the people.")}</p></div><div class="editorial-issue">${photos.length}<small>PHOTOGRAPHS FROM THE ARCHIVE</small></div></div><div class="journal-toolbar"><div class="journal-filters" role="group" aria-label="Photo collections">${collections.map((v) => `<button data-editorial-filter="${esc(v)}" aria-pressed="${editorialFilter === v}">${esc(v)}</button>`).join("")}</div><label class="journal-search">FIND A FRAME<input id="editorial-search" type="search" value="${esc(editorialQuery)}" placeholder="Moment, year or credit…"></label></div><div class="photo-grid">${selected
        .slice(0, editorialLimit * 2)
        .map(
          (p, i) =>
            `<button class="photo-card" data-photo="${i}" aria-label="Open photo: ${esc(p.title)}"><figure style="margin:0">${photoImage(p)}<figcaption><span>FRAME ${String(i + 1).padStart(3, "0")} / ${esc(p.collection)}</span><b>${esc(p.title)}</b><span>${esc(p.date ? editorialDate(p.date, p.precision) : "DATE NOT RECORDED")} · ${esc(p.credit)}</span></figcaption></figure></button>`,
        )
        .join(
          "",
        )}</div>${selected.length > editorialLimit * 2 ? '<button class="journal-load" id="editorial-more">More frames ↓</button>' : ""}${!selected.length ? '<div class="editorial-empty">No photos match that search.</div>' : ""}`;
    } else if (section === "events") {
      content = editorialChrome(section) + eventCalendar.render();
    } else if (section === "merch") {
      const products = siteContent.products || [];
      const selected = products
        .filter(
          (p) => editorialFilter === "All" || p.category === editorialFilter,
        )
        .sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
      content = `${editorialChrome(section)}<div class="editorial-hero"><div><span class="journal-kicker">ABN / THE MERCH STORE</span><h1>Wear the truth.<br>Bring the sound.</h1><p>Apparel, everyday essentials and Bumpboxx. Made for the family.</p></div><div class="editorial-issue">ABN<small>ANGEL BY NATURE / HOUSTON MADE</small></div></div><div class="journal-toolbar"><div class="journal-filters" role="group" aria-label="Merch categories">${["All", ...new Set(products.map((p) => p.category))].map((v) => `<button data-editorial-filter="${esc(v)}" aria-pressed="${editorialFilter === v}">${esc(v)}</button>`).join("")}</div><span class="journal-caption">Wishlist saved on this device · checkout through each listed store</span></div><div class="editorial-products">${selected
        .map((p) => {
          const image = p.image || contentPhoto(p.imageId)?.src,
            saved = getWishlist().some((w) => w.id === p.id),
            buy =
              p.availability === "available" && p.checkoutUrl && p.stock !== 0;
          return `<article class="editorial-product"><div class="editorial-product-art">${image ? `<img src="${esc(image)}" alt="${esc(p.title)}" loading="lazy">` : renderGarment({ ...p, name: p.title })}</div><span class="journal-kicker">${esc(p.category)}</span><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><div class="product-price">${p.priceCents == null ? (p.availability === "coming-soon" ? "PRICE TO BE ANNOUNCED" : "SEE OFFICIAL STORE") : new Intl.NumberFormat("en-US", { style: "currency", currency: p.currency || "USD" }).format(p.priceCents / 100)}</div><label>SIZE / OPTION<select id="merch-size-${esc(p.id)}" aria-label="${esc(p.title)} size">${(p.sizes?.length ? p.sizes : ["One size"]).map((size) => `<option>${esc(size)}</option>`).join("")}</select></label><div class="product-actions">${buy ? `<a class="primary" href="${esc(p.checkoutUrl)}" target="_blank" rel="noopener noreferrer">${p.category === "Bumpboxx" ? "Shop Bumpboxx" : "Shop this item"} ↗</a>` : `<button class="primary" disabled>${p.availability === "sold-out" || p.stock === 0 ? "Sold out" : "Coming soon"}</button>`}<button class="secondary" data-merch-wishlist="${esc(p.id)}" aria-pressed="${saved}">${saved ? "✓ Saved" : "Save favorite +"}</button></div></article>`;
        })
        .join(
          "",
        )}</div>${!selected.length ? '<div class="editorial-empty">This collection is being prepared.</div>' : ""}`;
    }
    page.innerHTML = content + editorialFooter();
    bindEditorial();
    if (section === "events") eventCalendar.bind(renderEditorial);
  }
  function bindEditorial() {
    $$("[data-story]").forEach(
      (b) =>
        (b.onclick = () => {
          location.hash = "article/" + encodeURIComponent(b.dataset.story);
        }),
    );
    $$("[data-editorial-filter]").forEach(
      (b) =>
        (b.onclick = () => {
          editorialFilter = b.dataset.editorialFilter;
          editorialLimit = 12;
          renderEditorial();
        }),
    );
    if ($("#editorial-search"))
      $("#editorial-search").oninput = (e) => {
        const focus = e.target.selectionStart;
        editorialQuery = e.target.value;
        editorialLimit = 12;
        renderEditorial();
        const field = $("#editorial-search");
        field.focus();
        field.setSelectionRange(focus, focus);
      };
    if ($("#editorial-more"))
      $("#editorial-more").onclick = () => {
        const y = scrollY;
        editorialLimit += 12;
        renderEditorial();
        window.scrollTo(0, y);
      };
    $$("[data-photo]").forEach(
      (b) => (b.onclick = () => openGalleryPhoto(+b.dataset.photo)),
    );
    $$("[data-merch-wishlist]").forEach(
      (b) =>
        (b.onclick = () => {
          const id = b.dataset.getWishlist(),
            i = getWishlist().findIndex((v) => v.id === id);
          if (i >= 0) getWishlist().splice(i, 1);
          else getWishlist().push({ id, size: $("#merch-size-" + id).value });
          try {
            localStorage.setItem(
              "truth-merch-wishlist",
              JSON.stringify(getWishlist()),
            );
          } catch {}
          b.setAttribute("aria-pressed", String(i < 0));
          b.textContent = i < 0 ? "✓ Saved" : "Save favorite +";
          toast(
            i < 0
              ? "Saved to your device wishlist."
              : "Removed from your device wishlist.",
          );
        }),
    );
  }
  function openGalleryPhoto(index) {
    const p =
      gallerySelection[
        (index + gallerySelection.length) % gallerySelection.length
      ];
    if (!p) return;
    const i = gallerySelection.indexOf(p);
    modal(
      `<section class="gallery-modal">${photoImage(p, { lead: true })}<div class="photo-information"><div><span class="journal-kicker">FRAME ${String(i + 1).padStart(3, "0")} / ${esc(p.collection)}</span><h2>${esc(p.title)}</h2><p>${esc(p.caption)}<br>${esc(p.credit)}${p.date ? " · " + esc(editorialDate(p.date, p.precision)) : ""}${p.license ? " · " + esc(p.license) : ""}</p>${p.sourceUrl ? `<a class="journal-source" href="${esc(p.sourceUrl)}" target="_blank" rel="noopener noreferrer">Photo source & credit ↗</a>` : ""}</div><div class="photo-arrows"><button id="photo-prev" aria-label="Previous photograph">←</button><button id="photo-next" aria-label="Next photograph">→</button></div></div></section>`,
    );
    $("#modal").dataset.gallery = String(i);
    $("#photo-prev").onclick = () => openGalleryPhoto(i - 1);
    $("#photo-next").onclick = () => openGalleryPhoto(i + 1);
  }
  lifetime.listen($("#modal"), "keydown", (e) => {
    if ($("#modal").dataset.gallery === undefined) return;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      openGalleryPhoto(
        +$("#modal").dataset.gallery + (e.key === "ArrowRight" ? 1 : -1),
      );
    }
  });
  let lastSection = "";
  function open(section) {
    if (section !== lastSection) {
      editorialFilter = "All";
      editorialQuery = "";
      editorialLimit = 12;
    }
    lastSection = section;
    renderEditorial();
  }
  return {
    open,
    render: renderEditorial,
    photo: contentPhoto,
    destroy() {
      lifetime.dispose();
      eventCalendar.destroy();
      $("#editorial-page").replaceChildren();
    },
  };
}
