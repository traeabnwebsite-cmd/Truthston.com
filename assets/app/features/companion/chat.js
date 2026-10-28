import { $, $$, esc } from "../../core/dom.js";
export function createCompanionChat({
  state,
  lifetime,
  actions,
  act,
  chat,
  root,
  getVoice,
  character,
  getKnowledge,
}) {
  function addMessage(text, who = "guide", keys = []) {
    $("#companion-messages").hidden = false;
    const el = document.createElement("div");
    el.className = "companion-message " + who;
    const label = document.createElement("small");
    label.textContent = who === "user" ? "YOU" : "SITE COMPANION";
    el.append(label, document.createTextNode(text));
    if (keys.length) {
      const row = document.createElement("div");
      row.className = "companion-message-actions";
      keys
        .filter((k) => actions[k])
        .forEach((k) => {
          const b = document.createElement("button");
          b.textContent = actions[k][0] + " ↗";
          b.onclick = () => {
            closeChat();
            act(k);
          };
          row.append(b);
        });
      el.append(row);
    }
    $("#companion-messages").append(el);
    while ($("#companion-messages").children.length > 30)
      $("#companion-messages").firstElementChild.remove();
    el.scrollIntoView({ block: "nearest" });
    return el;
  }
  function openChat() {
    chat.hidden = false;
    $("#companion-bubble").hidden = true;
    root.classList.remove("companion-near");
    $("#companion-question").focus();
    state.rig?.typing(true);
  }
  function closeChat() {
    chat.hidden = true;
    state.typing = false;
    state.rig?.typing(false);
    getVoice().stopVoice();
    character.focus();
  }
  async function ask(question) {
    if (state.busy) return;
    const q = question.trim().slice(0, 800);
    if (!q) return;
    state.busy = true;
    $("#companion-send").disabled = true;
    addMessage(q, "user");
    const thinking = addMessage("Checking the room…");
    let result = getKnowledge().localAnswer(q),
      live = false;
    try {
      if (state.remoteAvailable) {
        const response = await fetch("/api/companion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: q,
            history: state.chatHistory.slice(-6),
          }),
          signal: AbortSignal.timeout(12000),
        });
        if (
          response.ok &&
          response.headers.get("content-type")?.includes("application/json")
        ) {
          const v = await response.json();
          if (typeof v.answer === "string" && v.answer.trim()) {
            result = {
              answer: v.answer.slice(0, 3000),
              actions: result.actions,
            };
            live = true;
          }
        } else state.remoteAvailable = false;
      }
    } catch {
      state.remoteAvailable = false;
    } finally {
      if (lifetime.disposed) return;
      thinking.remove();
      addMessage(result.answer, "guide", result.actions);
      state.chatHistory.push(
        { role: "user", content: q },
        { role: "assistant", content: result.answer },
      );
      state.chatHistory = state.chatHistory.slice(-6);
      $("#companion-engine").textContent = live
        ? "SITE GUIDE / AI CONNECTED"
        : "SITE GUIDE / LOCAL PREVIEW";
      $("#companion-engine").textContent = live
        ? "AI SITE GUIDE · NOT TRAE PERSONALLY"
        : "LOCAL CATALOG GUIDE · AI NOT CONNECTED";
      state.busy = false;
      $("#companion-send").disabled = false;
      $("#companion-question").focus();
      getVoice().speakReply(result.answer);
    }
  }
  return { addMessage, openChat, closeChat, ask };
}
