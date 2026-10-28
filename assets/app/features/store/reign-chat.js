import { answerReign } from "./reign-knowledge.js";
import { createLifetime } from "../../core/lifecycle.js";
import { esc } from "../../core/dom.js";
export function createReignChat({ releases, setPose }) {
  const lifetime = createLifetime();
  let database = null,
    loading = null,
    disposed = false;
  const history = [
    {
      role: "reign",
      text: "Hey, I’m Reign. Welcome to ABN. Ask me about a release, a tracklist, or what’s on the shelves.",
      records: [],
    },
  ];
  const sourceLink = (record) => {
    try {
      const url = new URL(record.sourceUrl);
      return url.protocol === "https:" ? url.href : null;
    } catch {
      return null;
    }
  };
  const markup = () =>
    `<section class="reign-chat" aria-label="Chat with Reign"><div class="reign-chat-heading"><div><span class="eyebrow">YOUR ABN RECORD SPECIALIST</span><h2>Ask Reign.</h2></div><small>CATALOG DATABASE / LOCAL GUIDE</small></div><div class="reign-chat-messages" id="reign-messages" role="log" aria-live="polite">${history.map((message) => `<article class="reign-message ${message.role}"><b>${message.role === "reign" ? "REIGN" : "YOU"}</b><p>${esc(message.text)}</p>${message.records?.length ? `<ul>${message.records.map((record) => `<li><strong>${esc(record.title)}</strong> · ${esc(record.artist)} · ${esc(record.date || "Date unavailable")}${sourceLink(record) ? ` <a href="${esc(sourceLink(record))}" target="_blank" rel="noopener noreferrer">Source ↗</a>` : ""}</li>`).join("")}</ul>` : ""}</article>`).join("")}</div><div class="reign-prompts"><button data-reign-prompt="Tell me about Losing Composure">Losing Composure</button><button data-reign-prompt="Guerilla Maab releases">Guerilla Maab</button><button data-reign-prompt="6 Tre G releases">6 Tre G</button><button data-reign-prompt="Dougie D releases">Dougie D</button><button data-reign-prompt="ABN releases">ABN</button></div><form id="reign-chat-form"><label class="accessible" for="reign-question">Ask Reign about music</label><input id="reign-question" maxlength="500" autocomplete="off" placeholder="Ask about an artist, release or tracklist…" required><button class="primary" type="submit">Ask Reign ↗</button></form><p class="reign-chat-note">Answers come from sourced catalog records. Dates may describe editions or reissues. No live chat with the artists.</p></section>`;
  function render() {
    const mount = document.querySelector("#reign-chat-mount");
    if (mount) {
      mount.innerHTML = markup();
      const log = mount.querySelector("#reign-messages");
      log.scrollTop = log.scrollHeight;
    }
  }
  async function ask(question) {
    if (loading || !question.trim()) return;
    history.push({ role: "you", text: question, records: [] });
    setPose("listening");
    render();
    loading = true;
    try {
      await (async () => {
        try {
          if (!database) {
            const response = await fetch("assets/content/reign-catalog.json");
            if (!response.ok) throw Error("Catalog unavailable");
            database = await response.json();
          }
          if (disposed) return;
          history.push({
            role: "reign",
            ...answerReign(question, database, releases),
          });
        } catch {
          if (!disposed)
            history.push({
              role: "reign",
              text: "My catalog database couldn’t load just now. You can still browse the shelves and use the checkout. Try again in a moment.",
              records: [],
            });
        } finally {
          loading = null;
          if (!disposed) {
            if (history.length > 18) history.splice(1, 2);
            setPose("answering");
            render();
            lifetime.timeout(() => setPose("welcome"), 7000);
          }
        }
      })();
    } finally {
      loading = null;
    }
  }
  lifetime.listen(document, "submit", (event) => {
    if (event.target.id !== "reign-chat-form") return;
    event.preventDefault();
    const question = event.target.querySelector("input").value.trim();
    void ask(question);
  });
  lifetime.listen(document, "click", (event) => {
    const button = event.target.closest("[data-reign-prompt]");
    if (button) void ask(button.dataset.reignPrompt);
  });
  lifetime.listen(document, "focusin", (event) => {
    if (event.target.id === "reign-question") setPose("listening");
  });
  return {
    mount: render,
    destroy() {
      disposed = true;
      lifetime.dispose();
    },
  };
}
