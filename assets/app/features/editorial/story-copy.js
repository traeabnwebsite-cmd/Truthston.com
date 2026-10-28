import { esc } from "../../core/dom.js";
export function storyParagraphs(article) {
  return String(article?.body || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
export function storyCopy(article, { limit } = {}) {
  const paragraphs = storyParagraphs(article);
  return paragraphs
    .slice(0, limit ?? paragraphs.length)
    .map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}
