import { $, $$, esc } from "../../core/dom.js";
import { createLifetime } from "../../core/lifecycle.js";
export async function createAccountPage({
  stampArtwork,
  toast,
  modal,
  releases,
  release,
  setMode,
  merch,
}) {
  const lifetime = createLifetime();
  const bookKey = "abn-stamp-book-v1";
  let book = {
    name: "",
    awards: {},
    events: { dig: [], city: [], cut: [], listen: [] },
    ledger: [],
    redemptions: [],
  };
  try {
    const v = JSON.parse(localStorage.getItem(bookKey) || "null");
    if (
      v &&
      v.awards &&
      v.events &&
      Array.isArray(v.ledger) &&
      Array.isArray(v.redemptions)
    )
      book = v;
  } catch {}
  let bookTab = "stamps",
    heardSeconds = Math.min(60, book.events.listen?.length || 0);
  const fallbackStampDefs = [
    {
      id: "abn",
      name: "ABN Approved",
      rule: "An official award from an authorized ABN account. Personal approval cannot be earned automatically.",
      credits: 0,
      official: true,
    },
    {
      id: "truth",
      name: "The Truth",
      rule: "Listen to 60 seconds of the preview record while this page is visible.",
      kind: "listen",
      need: 60,
      credits: 40,
    },
    {
      id: "maab",
      name: "Guerilla Maab",
      rule: "Reserved for a verified affiliate award or an announced member event.",
      credits: 0,
      official: true,
    },
    {
      id: "street",
      name: "Street Certified",
      rule: "Explore four different Houston landmark viewpoints.",
      kind: "city",
      need: 4,
      credits: 30,
    },
    {
      id: "crate",
      name: "Crate Digger",
      rule: "Open five different releases from the record shelves or archive.",
      kind: "dig",
      need: 5,
      credits: 50,
    },
    {
      id: "chop",
      name: "Chopped In",
      rule: "Play the record and make four manual cuts with the DJ crossfader.",
      kind: "cut",
      need: 4,
      credits: 25,
    },
    {
      id: "project",
      name: "Project Collector",
      rule: "Download an eligible full project when member downloads launch. Each project gets its own stamp.",
      credits: 0,
    },
  ];
  const fallbackRewardDefs = [
    {
      id: "tee",
      name: "ABN Tee reservation",
      cost: 100,
      description:
        "A sample reward for a future member apparel drop. No product is reserved or shipped in this preview.",
    },
    {
      id: "merch",
      name: "Merch credit",
      cost: 75,
      description:
        "Try redeeming credits toward future merch. Preview credits have no cash value.",
    },
    {
      id: "drop",
      name: "Members-only drop",
      cost: 150,
      description:
        "A sample access reward for a future limited collection. Final rewards and terms will be set before launch.",
    },
  ];
  let membershipPolicy = null;
  try {
    const response = await fetch("assets/config/membership-policy.json", {
      signal: AbortSignal.timeout(1500),
    });
    if (response.ok) membershipPolicy = await response.json();
  } catch {}
  const artistStampDefs = [
    ["trae", "Trae tha Truth"],
    ["6-tre-g", "6 Tre G"],
    ["dougie-d", "Dougie D"],
    ["roc", "Roc"],
  ].map(([id, name]) => ({
    id,
    name,
    official: true,
    displayOnly: true,
    credits: 0,
    rule:
      "An individual " +
      name +
      " collectible. Reserved for a verified artist or authorized affiliate award when official member issuance launches. Not awarded in this preview.",
  }));
  let collectionStampDefs = artistStampDefs;
  try {
    const res = await fetch("assets/config/collectible-stamps.json", {
      signal: AbortSignal.timeout(1500),
    });
    if (res.ok) {
      const extra = await res.json();
      if (Array.isArray(extra.stamps))
        collectionStampDefs = extra.stamps
          .filter(
            (d) => d && typeof d.id === "string" && typeof d.name === "string",
          )
          .map((d) => ({
            ...d,
            credits: 0,
            kind: undefined,
            need: undefined,
            displayOnly: true,
          }));
    }
  } catch {}
  const stampDefs = [
    ...(membershipPolicy?.stamps?.map((d) => ({
      ...d,
      productionRule: d.rule,
      rule: d.previewRule || d.rule,
    })) || fallbackStampDefs),
    ...collectionStampDefs,
  ];
  const rewardDefs = membershipPolicy?.rewards || fallbackRewardDefs;
  const memberPlans = membershipPolicy?.plans || [
    {
      id: "free",
      name: "The Family",
      priceCents: 0,
      features: ["Your Stamp Book", "Public previews and community challenges"],
    },
    {
      id: "vault",
      name: "The ABN Vault",
      priceCents: null,
      features: [
        "Authorized premium catalog",
        "Eligible project downloads",
        "Announced member drops",
      ],
    },
  ];
  const accountTabs = [
    ["overview", "01 / My account"],
    ["stamps", "02 / Stamp Book"],
    ["membership", "03 / Membership"],
    ["library", "04 / My library"],
    ["rewards", "05 / Rewards"],
    ["community", "06 / Community"],
    ["settings", "07 / Settings"],
  ];
  function accountLink(tab) {
    location.hash = "account/" + (tab === "stamps" ? "stamp-book" : tab);
  }

  function saveBook() {
    try {
      localStorage.setItem(bookKey, JSON.stringify(book));
    } catch {
      toast("This browser could not save your Stamp Book.");
    }
  }
  function bookBalance() {
    return book.ledger.reduce((n, v) => n + v.amount, 0);
  }
  function bookEvent(kind, key) {
    if (!book.events[kind]) book.events[kind] = [];
    const list = book.events[kind];
    if (list.includes(key)) return;
    list.push(key);
    if (list.length > 200) list.splice(0, list.length - 200);
    saveBook();
    if (book.name) checkBookAwards();
  }
  function checkBookAwards() {
    for (const d of stampDefs) {
      if (
        d.kind &&
        !book.awards[d.id] &&
        (book.events[d.kind]?.length || 0) >= d.need
      ) {
        const date = new Date().toISOString();
        book.awards[d.id] = date;
        book.ledger.push({
          id: "award:" + d.id,
          amount: d.credits,
          label: d.name,
          date,
        });
        saveBook();
        toast(d.name + " stamped. +" + d.credits + " preview credits.");
        if (document.body.classList.contains("account-view")) renderBook();
      }
    }
  }
  function redeemReward(id) {
    const r = rewardDefs.find((v) => v.id === id);
    if (
      !r ||
      !book.name ||
      book.redemptions.some((v) => v.id === id) ||
      bookBalance() < r.cost
    )
      return;
    const date = new Date().toISOString();
    book.ledger.push({
      id: "redeem:" + id,
      amount: -r.cost,
      label: r.name,
      date,
    });
    book.redemptions.push({ id, date, name: r.name });
    saveBook();
    renderBook();
    $("#book-status").textContent =
      "Demo redemption recorded. Your collectible stamps stay in your book. No order has been placed.";
  }
  function renderBook() {
    const page = $("#account-page"),
      earned = Object.keys(book.awards).length,
      balance = bookBalance();
    const headings = {
      overview: ["YOUR PLACE. IN THE FAMILY.", "YOUR ABN", "ACCOUNT."],
      stamps: ["YOUR STORY. IN INK.", "THE STAMP", "BOOK."],
      membership: ["MORE THAN A LISTENER.", "PART OF", "THE FAMILY."],
      library: ["EVERY PROJECT. A CONNECTION.", "YOUR", "CRATE."],
      rewards: ["COLLECT THE MOMENTS.", "MAKE IT", "COUNT."],
      community: ["HOUSTON REACHES EVERYWHERE.", "IN GOOD", "COMPANY."],
      settings: ["MAKE YOURSELF AT HOME.", "YOUR", "DETAILS."],
    };
    const h = headings[bookTab] || headings.overview;
    page.innerHTML = `<div class="book-nav"><button class="text-button" id="book-back">← Back to the record shop</button><span class="eyebrow">TRUTHSTON / MEMBER HOUSE</span></div><div class="book-hero"><div><span class="eyebrow">${h[0]}</span><h1>${h[1]}<br><span>${h[2]}</span></h1><p>Join the site. Get stamped. Get approved.<br>Build your collection with Trae tha Truth, Guerilla Maab and the ABN family.</p></div><div class="member-card"><span class="eyebrow">${book.name ? "THE FAMILY / PREVIEW MEMBER" : "YOUR PLACE IS WAITING"}</span><b>${book.name ? esc(book.name) : "COME THROUGH."}</b>${book.name ? `<p>${earned} COLLECTIBLE STAMPS</p><div class="book-balance">${balance} STAMP CREDITS</div><small>Device-local preview · no paid membership</small>` : `<form id="book-join"><label for="member-name">CHOOSE A DISPLAY NAME</label><input id="member-name" maxlength="32" autocomplete="nickname" required placeholder="Your name"><button class="primary">Start my preview book ↗</button></form>`}</div></div><div class="book-notice">ACCOUNT DESIGN PREVIEW · Saved on this device. Sign-in, billing, premium downloads and real rewards are not connected.</div><nav class="book-tabs" aria-label="Account pages">${accountTabs.map(([id, label]) => `<button data-book-tab="${id}" aria-current="${bookTab === id ? "page" : "false"}" aria-selected="${bookTab === id}">${label}</button>`).join("")}</nav><div id="book-content"></div><p id="book-status" role="status"></p>`;
    $("#book-back").onclick = () => {
      location.hash = "";
    };
    $$("[data-book-tab]").forEach(
      (b) => (b.onclick = () => accountLink(b.dataset.bookTab)),
    );
    if ($("#book-join"))
      $("#book-join").onsubmit = (e) => {
        e.preventDefault();
        const name = $("#member-name").value.trim();
        if (!name) return;
        book.name = name;
        saveBook();
        checkBookAwards();
        renderBook();
      };
    const content = $("#book-content");
    if (bookTab === "overview") {
      const next = stampDefs.find((d) => d.kind && !book.awards[d.id]),
        n = next ? Math.min(next.need, book.events[next.kind]?.length || 0) : 0;
      content.innerHTML = `<section class="member-welcome"><div><span class="eyebrow">YOU BELONG HERE.</span><h2>${book.name ? "What’s good, " + esc(book.name) + "?" : "Step inside the family."}</h2><p>Keep your collection, find your next stamp and see what’s coming.</p></div><span class="member-ticket">ABN<br><small>MEMBER HOUSE / HOUSTON</small></span></section><div class="member-stat-grid"><article><span>IN YOUR BOOK</span><b>${earned}</b><small>permanent collectible stamps</small></article><article><span>READY TO REDEEM</span><b>${balance}</b><small>preview Stamp Credits</small></article><article><span>YOUR MEMBERSHIP</span><b class="stat-word">${book.name ? "The Family" : "Visitor"}</b><small>${book.name ? "free member design preview" : "start a local preview above"}</small></article></div><div class="member-two-col"><article class="member-panel"><span class="eyebrow">YOUR NEXT IMPRESSION</span><h3>${next ? esc(next.name) : "Every activity stamp collected."}</h3><p>${next ? esc(next.rule) : "Watch for announced challenges and verified affiliate awards."}</p>${next ? `<progress max="${next.need}" value="${n}" aria-label="Next stamp progress"></progress><small>${n} / ${next.need} · ${next.credits} preview credits</small>` : ""}<button class="secondary" data-account-destination="stamps">Open the Stamp Book ↗</button></article><article class="member-panel dark"><span class="eyebrow">THE NEXT CHAPTER</span><h3>Keys to the Vault.</h3><p>Artist-authorized music. Exclusive screenings. Eligible project downloads. A deeper connection with the ABN family.</p><small>PROPOSED MEMBERSHIP / NOT ON SALE</small><button class="secondary" data-account-destination="membership">Explore membership ↗</button></article></div><h2 class="member-section-title">Your latest moves.</h2><div class="book-ledger">${
        book.ledger.length
          ? book.ledger
              .slice(-4)
              .reverse()
              .map(
                (v) =>
                  `<div class="ledger-row"><span>${esc(v.label)}<br><small>${new Date(v.date).toLocaleDateString()}</small></span><b>${v.amount > 0 ? "+" : ""}${v.amount} credits</b></div>`,
              )
              .join("")
          : "<p>Your first earned stamp will start your story here.</p>"
      }</div>`;
    } else if (bookTab === "stamps") {
      const stampCard = (d) => {
        const date = book.awards[d.id],
          n = Math.min(d.need || 0, book.events[d.kind]?.length || 0);
        return `<article data-stamp="${d.id}" class="stamp-leaf ${date ? "earned" : "locked"}"><div class="ink-impression">${stampArtwork ? stampArtwork(d.id, { scope: "book", name: d.name, artLines: d.artLines, years: d.years }) : `<b>${esc(d.name)}</b>`}</div><div class="stamp-status">${date ? "STAMPED " + new Date(date).toLocaleDateString() : d.official ? "VERIFIED AWARD REQUIRED" : "COLLECT YOUR STORY"}</div><h3>${esc(d.name)}</h3><p>${esc(d.rule)}</p>${
          d.venue
            ? `<div class="stamp-venue-info"><b>${esc(d.eventType)}</b><p>${esc(d.location)}<br>Documented editions: ${d.years.map(esc).join(" · ")}</p><details><summary>Venue history & sources</summary><p>${esc(d.historyNote)}</p>${d.sources
                .filter((v) => /^https:\/\//.test(v.url))
                .map(
                  (v) =>
                    `<a href="${esc(v.url)}" target="_blank" rel="noopener noreferrer">${esc(v.label)} ↗</a>`,
                )
                .join("")}</details></div>`
            : ""
        }${d.kind ? `<progress max="${d.need}" value="${n}" aria-label="${esc(d.name)} progress"></progress><p>${n} / ${d.need} · +${d.credits} preview credits</p>` : ""}${d.productionRule && d.productionRule !== d.rule ? `<details><summary>Planned member earning rule</summary><p>${esc(d.productionRule)}</p></details>` : ""}<small class="stamp-frequency">${d.displayOnly ? "COLLECTION PREVIEW · ISSUANCE NOT LIVE" : d.official ? "OFFICIAL AWARD" : d.repeat === "per-project" ? "ONE STAMP PER ELIGIBLE PROJECT" : "EARN ONCE · KEEP FOREVER"}</small></article>`;
      };
      const groups = [
        ["Official marks", ["abn", "maab", "angel-by-nature"]],
        [
          "Guerilla Maab · Artist series",
          ["trae", "6-tre-g", "dougie-d", "roc"],
        ],
        [
          "From the projects",
          [
            "project",
            "losing-control",
            "king-streets",
            "tha-truth-project",
            "restless",
          ],
        ],
        ["Screwed & chopped", ["chop", "dj-screw", "slabbed"]],
        ["Street & crate", ["truth", "street", "crate"]],
        ["Affiliations", ["rap-a-lot", "hustle-gang"]],
        [
          "Trae Day · Venue collection",
          stampDefs.filter((d) => d.family === "events").map((d) => d.id),
        ],
        [
          "Relief Gang · For the people",
          ["relief-gang", "relief-gang-service"],
        ],
        ["The Vault", ["abn-vault"]],
      ];
      content.innerHTML = `<div class="member-two-col earning-note"><p>Stamps are permanent collectibles. Stamp Credits are the separate balance used for rewards. A redemption keeps every stamp in your book.</p><p>Related collections share their shape and ink color. Official and campaign designs remain locked until verified issuance is available.</p></div>${groups
        .map(
          ([title, ids]) =>
            `<section class="stamp-collection"><h2 class="stamp-collection-heading">${esc(title)}</h2><div class="stamp-grid">${ids
              .map((id) => stampDefs.find((d) => d.id === id))
              .filter(Boolean)
              .map(stampCard)
              .join("")}</div></section>`,
        )
        .join("")}`;
    } else if (bookTab === "membership") {
      content.innerHTML = `<div class="membership-plans">${memberPlans.map((plan) => `<article class="plan-card ${plan.id === "vault" ? "vault" : ""}"><span class="eyebrow">${plan.id === "free" ? "A PLACE FOR EVERYBODY" : "GO A LITTLE DEEPER"}</span><h2>${esc(plan.name)}</h2><div class="plan-price">${plan.id === "free" ? "Free" : "Coming soon"}<small>${plan.id === "free" ? "No subscription required" : "Price and launch catalog to be announced"}</small></div><ul>${plan.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul><button class="${plan.id === "free" ? "secondary" : "primary"}" data-plan-preview="${plan.id}">${plan.id === "free" ? (book.name ? "Your preview membership" : "Start a free preview") : "Preview the Vault experience ↗"}</button><p class="tiny">${plan.id === "vault" ? "No payment is collected. Benefits depend on the final authorized catalog." : "This prototype uses a display name. Secure sign-in arrives at launch."}</p></article>`).join("")}</div><div class="member-two-col"><article class="member-panel"><h3>Your music. Your session.</h3><p>The planned Vault lets different members listen independently. The DJ booth uses two decks within your own playback session.</p></article><article class="member-panel"><h3>Approval is earned.</h3><p>A paid plan does not purchase ABN or affiliate approval. Your stamps stay in the book if a paid membership ends.</p></article></div><div class="member-panel billing-preview"><span class="eyebrow">BILLING & RECEIPTS</span><h3>No active subscription.</h3><p>When memberships launch, manage your payment method, invoices and cancellation here. You have not been charged.</p><button class="secondary" disabled>Billing portal · not connected</button></div>`;
      $$("[data-plan-preview]").forEach(
        (b) =>
          (b.onclick = () => {
            if (b.dataset.planPreview === "free") {
              if (!book.name) $("#member-name").focus();
              else
                $("#book-status").textContent =
                  "The Family is your free, device-local preview membership.";
            } else
              modal(
                `<span class="eyebrow">THE ABN VAULT / MEMBERSHIP DESIGN</span><h2>Your pass to the next chapter.</h2><p>One member account for authorized music, private screenings, eligible downloads and announced drops.</p><p>Pricing, launch dates and the included catalog are not final. No subscription is created in this preview.</p><button class="primary" id="vault-book">Keep building my Stamp Book ↗</button>`,
              );
            if ($("#vault-book"))
              $("#vault-book").onclick = () => {
                $("#modal").close();
                accountLink("stamps");
              };
          }),
      );
    } else if (bookTab === "library") {
      const dug = releases.filter((r) =>
        (book.events.dig || []).includes(String(r.title) + ":" + r.year),
      );
      const favorites = book.favorites || [];
      content.innerHTML = `<div class="member-panel library-owned"><span class="eyebrow">OWNED & INCLUDED PROJECTS</span><h3>Your collection starts here.</h3><p>Purchased projects and eligible member downloads will appear here. Browsing a sleeve does not add a purchase or unlock a paid download.</p><small>NO PURCHASES / NO PREMIUM DOWNLOADS IN THIS PREVIEW</small></div><h2 class="member-section-title">Recently dug.</h2><p class="book-note">Save a favorite or reopen a sleeve. Every release currently uses the same Boss Ballin preview.</p><div class="member-library">${
        dug.length
          ? dug
              .map((r) => {
                const i = releases.indexOf(r),
                  key = r.title + ":" + r.year;
                return `<article><button data-library-open="${i}" aria-label="Open ${esc(r.title)}"><img src="${esc(r.cover)}" alt="${esc(r.title)} cover" loading="lazy"><h3>${esc(r.title)}</h3></button><small>${r.year} / RECENTLY BROWSED</small><button class="secondary" data-library-save="${i}" aria-pressed="${favorites.includes(key)}">${favorites.includes(key) ? "✓ Saved favorite" : "Save favorite +"}</button></article>`;
              })
              .join("")
          : '<div class="member-panel"><p>Dig into the record shelves to bring releases into this view.</p><button class="secondary" id="library-browse">Visit the record shelves ↗</button></div>'
      }</div>`;
      $$("[data-library-open]").forEach(
        (b) => (b.onclick = () => release(releases[+b.dataset.libraryOpen])),
      );
      $$("[data-library-save]").forEach(
        (b) =>
          (b.onclick = () => {
            const r = releases[+b.dataset.librarySave],
              key = r.title + ":" + r.year;
            book.favorites = book.favorites || [];
            book.favorites = book.favorites.includes(key)
              ? book.favorites.filter((v) => v !== key)
              : [...book.favorites, key];
            saveBook();
            renderBook();
          }),
      );
      if ($("#library-browse"))
        $("#library-browse").onclick = () => {
          location.hash = "";
          setMode("standard");
        };
    } else if (bookTab === "rewards") {
      content.innerHTML = `<p class="book-note">${balance} available preview credits. Stamps stay in your collection when you redeem. These sample rewards demonstrate the experience; there are no live offers or orders.</p><div class="rewards-grid">${rewardDefs
        .map((r) => {
          const used = book.redemptions.some((v) => v.id === r.id);
          return `<article class="reward-card"><span class="eyebrow">DEMO REWARD</span><h3>${esc(r.name)}</h3><strong>${r.cost}</strong> STAMP CREDITS<p>${esc(r.description)}</p><button class="primary" data-reward="${r.id}" ${!book.name || used || balance < r.cost ? "disabled" : ""}>${used ? "✓ Demo redeemed" : !book.name ? "Start a book first" : balance < r.cost ? "Keep collecting" : "Redeem demo reward"}</button></article>`;
        })
        .join(
          "",
        )}</div><h2 class="member-section-title">In your ledger.</h2><div class="book-ledger">${
        book.ledger.length
          ? book.ledger
              .slice()
              .reverse()
              .map(
                (v) =>
                  `<div class="ledger-row"><span>${esc(v.label)}<br><small>${new Date(v.date).toLocaleDateString()}</small></span><b>${v.amount > 0 ? "+" : ""}${v.amount} credits</b></div>`,
              )
              .join("")
          : "<p>No credits earned or spent yet.</p>"
      }</div><p class="book-note">Giveaways and awards have separate eligibility, dates and entry terms. None are active. Preview credits have no cash value.</p><button class="secondary" id="book-merch">Explore the merch concepts ↗</button>`;
      $$("[data-reward]").forEach(
        (b) => (b.onclick = () => redeemReward(b.dataset.reward)),
      );
      $("#book-merch").onclick = merch;
    } else if (bookTab === "settings") {
      const preferences = book.preferences || {};
      content.innerHTML = `<div class="member-two-col"><form class="member-panel member-settings" id="member-settings"><span class="eyebrow">PROFILE / LOCAL PREVIEW</span><h3>Make it yours.</h3><label for="profile-name">DISPLAY NAME</label><input id="profile-name" maxlength="32" autocomplete="nickname" required value="${esc(book.name)}" placeholder="Your name"><label class="check-line"><input id="profile-public" type="checkbox" ${preferences.publicBook ? "checked" : ""}> Show my Stamp Book publicly at launch</label><label class="check-line"><input id="profile-updates" type="checkbox" ${preferences.updates ? "checked" : ""}> I’d like member drop announcements</label><p>These preferences stay on this device. Your book is not published and no email is collected or sent.</p><button class="primary">Save preview preferences</button></form><article class="member-panel"><span class="eyebrow">ACCOUNT & SECURITY</span><h3>Your identity stays yours.</h3><p>Secure sign-in, email verification, session management and account export or deletion belong here when real accounts launch.</p><div class="member-setting-row"><span>Email & sign-in</span><b>Not connected</b></div><div class="member-setting-row"><span>Active devices</span><b>This preview only</b></div><div class="member-setting-row"><span>Public Stamp Book</span><b>Not published</b></div><button class="secondary" disabled>Manage sign-in · coming at launch</button></article></div>`;
      $("#member-settings").onsubmit = (e) => {
        e.preventDefault();
        const name = $("#profile-name").value.trim();
        if (!name) return;
        book.name = name;
        book.preferences = {
          publicBook: $("#profile-public").checked,
          updates: $("#profile-updates").checked,
        };
        saveBook();
        checkBookAwards();
        renderBook();
        $("#book-status").textContent =
          "Preview preferences saved on this device. Nothing has been published or sent.";
      };
    } else {
      content.innerHTML = `<span class="eyebrow">THE NEXT CHAPTER / PROPOSED MEMBER FEATURES</span><div class="community-grid">${[
        [
          "Crate hunts",
          "Trade clues on weekly liner-note hunts. Earn a stamp for an eligible completed challenge.",
        ],
        [
          "Chop sessions",
          "Join moderated DJ challenges using authorized music. Public mix uploads require additional approval.",
        ],
        [
          "Listening rooms",
          "Scheduled listening sessions with reactions, polls and a shared room goal.",
        ],
        [
          "Public Stamp Books",
          "Opt in to show your collection and follow other collectors. Personal details stay private.",
        ],
        [
          "Show up for Houston",
          "Verified event check-ins can unlock a community-service stamp. No credits for donations.",
        ],
        [
          "Member drops",
          "Vote on merch designs, join announced giveaways and unlock collective milestones.",
        ],
      ]
        .map(
          ([a, b]) =>
            `<article><h3>${a}</h3><p>${b}</p><small>PLANNED / NOT LIVE</small></article>`,
        )
        .join("")}</div>`;
    }
    $$("[data-account-destination]").forEach(
      (b) => (b.onclick = () => accountLink(b.dataset.accountDestination)),
    );
  }
  function open(path) {
    bookTab =
      path === "stamp-book"
        ? "stamps"
        : accountTabs.some(([key]) => key === path)
          ? path
          : "overview";
    renderBook();
  }
  function tickListening() {
    heardSeconds++;
    if (heardSeconds <= 60) {
      bookEvent("listen", String(heardSeconds));
      const progress = document.querySelector('[data-stamp="truth"] progress');
      if (progress) {
        progress.value = heardSeconds;
        progress.nextElementSibling.textContent =
          heardSeconds + " / 60 · +40 credits";
      }
    }
  }
  return {
    open,
    render: renderBook,
    navigate: accountLink,
    recordEvent: bookEvent,
    tickListening,
    destroy() {
      lifetime.dispose();
      $("#account-page").replaceChildren();
    },
  };
}
