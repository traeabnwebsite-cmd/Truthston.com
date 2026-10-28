import { $, $$, esc } from "../../core/dom.js";
import { createLifetime } from "../../core/lifecycle.js";
export function createCommercePage({
  siteContent,
  getPhoto,
  enterDJRoom,
  navigate,
}) {
  const lifetime = createLifetime();
  const merchItems = [
    {
      id: "abn-tee",
      name: "ABN Everyday Tee",
      kind: "tee",
      color: "#272e2b",
      sizes: ["S", "M", "L", "XL", "2XL"],
    },
    {
      id: "truth-tee",
      name: "Tha Truth Tee",
      kind: "tee",
      color: "#a33a2c",
      sizes: ["S", "M", "L", "XL", "2XL"],
    },
    {
      id: "abn-hoodie",
      name: "ABN Heavyweight Hoodie",
      kind: "hoodie",
      color: "#d5c9aa",
      sizes: ["S", "M", "L", "XL", "2XL"],
    },
    {
      id: "houston-cap",
      name: "Houston Cap",
      kind: "cap",
      color: "#2c5a46",
      sizes: ["Adjustable"],
    },
    {
      id: "crate-tote",
      name: "Crate Digger Tote",
      kind: "tote",
      color: "#dfd1af",
      sizes: ["One size"],
    },
  ];
  let merchWishlist = [];
  try {
    merchWishlist = JSON.parse(
      localStorage.getItem("truth-merch-wishlist") || "[]",
    );
    if (!Array.isArray(merchWishlist)) merchWishlist = [];
  } catch {}
  function garmentSVG(item) {
    let path =
      item.kind === "cap"
        ? '<path d="M55 150 Q55 55 150 55 Q240 55 240 150 L275 185 Q170 220 35 185 Z"/>'
        : item.kind === "tote"
          ? '<path fill="none" stroke="currentColor" stroke-width="15" d="M105 95V65Q150 5 195 65V95"/><path d="M65 90H235L255 265H45Z"/>'
          : '<path d="M105 60L66 73L24 140L70 165L92 127V270H208V127L230 165L276 140L234 73L195 60Q150 93 105 60Z"/>' +
            (item.kind === "hoodie"
              ? '<path d="M105 64Q94 4 150 10Q206 4 195 64L175 92H125Z"/>'
              : "");
    return `<svg viewBox="0 0 300 300" role="img" aria-label="${esc(item.name)} concept" style="color:${item.color}"><g fill="currentColor" stroke="#17251d" stroke-width="2">${path}</g><image href="assets/branding/abn-angel-by-nature-official.png" x="112" y="${item.kind === "cap" ? 105 : 125}" width="76" height="42"/></svg>`;
  }
  function merch() {
    if ($("#modal").open) $("#modal").close();
    location.hash = "merch";
    navigate();
  }
  function bumpboxDisplay(title, photo) {
    bumpSelection = title.includes("camo")
      ? "camo"
      : title.includes("red")
        ? "red"
        : "flare";
    if ($("#modal").open) $("#modal").close();
    location.hash = "shop/bumpboxx";
    navigate();
  }
  let bumpSelection = "flare";
  function renderBumpShop() {
    const product = (siteContent.products || []).find(
      (p) => p.id === "bumpboxx-" + bumpSelection,
    );
    const red = bumpSelection === "red",
      camo = bumpSelection === "camo",
      name =
        product?.title ||
        (red
          ? "ABN red display"
          : camo
            ? "Blue camo display"
            : "Flare boombox"),
      photo =
        product?.image ||
        getPhoto(product?.imageId)?.src ||
        (camo
          ? "assets/branding/bumpboxx-blue-camo.jpeg"
          : "assets/branding/bumpboxx-flare.jpeg");
    $("#bump-shop").innerHTML =
      `<div class="book-nav"><button class="text-button" id="bump-room-back">← Back to the DJ room</button><span class="eyebrow">ABN MERCH STORE / BUMPBOXX</span></div><div class="bump-shop-layout"><div class="bump-shop-image">${
        red
          ? `<svg viewBox="0 0 600 450" role="img" aria-label="Red ABN room display"><defs><radialGradient id="woofer"><stop stop-color="#131b20"/><stop offset=".45" stop-color="#333c40"/><stop offset=".5" stop-color="#11181c"/><stop offset=".9" stop-color="#2a3134"/><stop offset="1" stop-color="#101619"/></radialGradient></defs><rect x="110" y="68" width="380" height="18" rx="8" fill="#909d9e"/><path d="M140 85v35m320-35v35" stroke="#4f5c5d" stroke-width="12"/><rect x="60" y="120" width="480" height="270" rx="9" fill="#aa2732" stroke="#242d2e" stroke-width="10"/>${[
              [190, 205],
              [410, 205],
              [190, 320],
              [410, 320],
            ]
              .map(
                ([x, y]) =>
                  `<circle cx="${x}" cy="${y}" r="52" fill="url(#woofer)" stroke="#10191c" stroke-width="5"/>`,
              )
              .join(
                "",
              )}<text x="300" y="271" text-anchor="middle" fill="#51b4d1" font-family="Arial" font-weight="bold" font-size="38">b</text><text x="300" y="414" text-anchor="middle" fill="#655c48" font-family="monospace" font-size="11">ABN ROOM DISPLAY / CONCEPT COLORWAY</text></svg>`
          : `<img src="${photo}" alt="${esc(name)} supplied product reference">`
      }</div><div class="bump-shop-copy"><span class="eyebrow">SOUND WITH STYLE / BUMPBOXX</span><h1>BRING THE<br><span>BOOM.</span></h1><h2>${esc(name)}</h2><p>${esc(product?.description || "From the DJ room to your room. Explore the Bumpboxx collection and find your sound.")}</p><div class="bump-variants" role="group" aria-label="Bumpboxx room displays">${[
        ["red", "ABN red"],
        ["flare", "Flare"],
        ["camo", "Blue camo"],
      ]
        .map(
          ([id, label]) =>
            `<button class="secondary" data-bump-variant="${id}" aria-pressed="${id === bumpSelection}">${label}</button>`,
        )
        .join(
          "",
        )}</div>${red || (product?.availability === "available" && product?.checkoutUrl && product?.stock !== 0) ? `<a class="primary bump-buy" href="${esc(product?.checkoutUrl || "https://bumpboxx.com/collections/all")}" target="_blank" rel="noopener noreferrer">Shop Bumpboxx ↗</a>` : `<button class="primary bump-buy" disabled>${product?.availability === "sold-out" || product?.stock === 0 ? "Sold out" : "Not currently available"}</button>`}${product?.priceCents !== null && product?.priceCents !== undefined ? `<p>${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(product.priceCents / 100)}</p>` : ""}<p class="bump-shop-note">Purchase through the official Bumpboxx store. Choose from current models and available colors there. Room displays and supplied reference photos may show earlier or custom editions.</p><button class="text-button" id="bump-apparel">Explore ABN apparel ↗</button></div></div>`;
    $("#bump-room-back").onclick = enterDJRoom;
    $("#bump-apparel").onclick = merch;
    $$("[data-bump-variant]").forEach(
      (b) =>
        (b.onclick = () => {
          bumpSelection = b.dataset.bumpVariant;
          renderBumpShop();
        }),
    );
  }
  return {
    merch,
    bumpboxDisplay,
    render: renderBumpShop,
    renderGarment: garmentSVG,
    get wishlist() {
      return merchWishlist;
    },
    destroy() {
      lifetime.dispose();
      $("#bump-shop").replaceChildren();
    },
  };
}
