# Site companion

Current design approved October 26, 2026: the generated eight-pose character with a plain black T-shirt, diamond chain/ABN pendant, earrings, watch, bracelet and grill. Red hoodie is a promotional outfit. Original illustrated likeness is retained; the attempted procedural 3D redesign was explicitly rejected and removed.

## Controls and behavior

- Drag the character anywhere in the viewport. He starts in the dedicated home chamber between the headline and ABN stamp on every page load. Dragging releases him from the chamber for the current visit. Focus and use arrow keys (Shift moves farther) for keyboard movement.
- Hover nearby or focus to expand the small bar directly below the shoes: chat, voice, merch store.
- Chat opens a compact composer at the bottom; replies and site shortcuts appear above it.
- Voice requests microphone access only when the voice icon is pressed. Browser SpeechRecognition/webkitSpeechRecognition handles input; speechSynthesis uses the normal device voice, not a Trae voice clone. Unsupported/denied input offers typed chat. Stop voice or close the composer to stop. Actual microphone capture was not exercised in automated verification.
- Periodic head turns/expressions and promotional moments: Bumpboxx, project sleeve from backpack, ABN apparel, membership/Stamp Book. Double-click previews the next moment. No unconfigured sales, subscriptions or live giveaways are invented.
- The thought cloud is a small shaded SVG with a soft shadow and thought dots; its link opens the matching site destination.
- Gentle two-point diamond sparkle occurs periodically, not continuously. Calm/Reduced disable automatic movement and sparkle; interactions remain usable.
- The approved art is drawn as intact canvas poses. The segmented leg and head motion was removed after the user reported wrist/leg seams. Dragging is smooth with no limb cuts; cursor proximity uses the waving pose. Turning cycles illustrated orientations without the rejected flat scale-to-zero flip. It is not a full rigged 3D character. A production-quality continuous 360-degree character would require a professionally rigged model matching the approved art.
- Companion/chat are reparented into the room for fullscreen and rendering pauses in hidden tabs. Phone CSS reduces its footprint. All three actions have labels.

## Chat: what works and what is not connected

The local Python preview uses an explicitly labeled catalog guide with intent matching, release lookup, and allowlisted buttons. It is not a live language model. Chat history is kept only in memory. The only persisted companion data is position; no microphone recordings are saved by the site.

A real Workers AI endpoint is implemented at POST /api/companion in cloudflare/companion.mjs. It uses a trusted server-side catalog snapshot, bounded same-origin JSON requests, a rate-limit binding, plain-text output and no payment/award tools. It never claims to be Trae personally. Four additional tests cover fallback, origin/method checks, malformed/oversized input, history filtering and rate limiting; eight Worker tests total pass.

Default wrangler.jsonc keeps AI unconfigured. Optional wrangler.companion.jsonc adds Workers AI and a 6 requests/60s rate limiter. No live inference or cloud deployment has been performed.

To connect after configuring the user's Cloudflare account:

```sh
npm ci
npm run check
npm run prepare:assets
npx wrangler deploy --dry-run --config wrangler.companion.jsonc
# After account/resource review, deploy this same config to activate its bindings.
```

Do not put an API key in index.html. Revisit catalog facts, privacy/voice-browser behavior and rate limits before a public launch. Public endpoints need operational monitoring and abuse review. Current model is @cf/meta/llama-3.1-8b-instruct-fp8, documented at https://developers.cloudflare.com/workers-ai/models/llama-3.1-8b-instruct-fp8/ . Bindings reference: https://developers.cloudflare.com/workers-ai/configuration/bindings/ .

Generated artwork: assets/companion/trae-companion-atlas.png. UI and motion: buildCompanionIllustration and initCompanion in index.html. No new front-end dependencies or build step.

Latest refinement: a dedicated, softly framed home chamber sits between the hero headline and ABN stamp. Each load starts here regardless of previously saved drag coordinates. The collapsed bar is directly beneath the shoes. Thought cloud is smaller with a cream gradient and soft shadow.
