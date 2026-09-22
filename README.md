# DNA-Shield

Dominion With Domination

A Tampermonkey userscript that makes the web feel instant. One file, zero dependencies, runs on every browser and device Tampermonkey supports.

## The 0.1 second bar

Everything DNA Shield does targets one bar: **near instant means 0.1 seconds or less.** Most actions finish in 0.01 seconds.

## What it does

### UI animation (CSS)

- Forces every animation and transition to run at most `0.01s` — durations are clamped, not removed, so `transitionrun`/`transitionstart`/`transitionend` and `animationstart`/`animationend` events still fire and framework state machines (React, Vue, etc.) keep working.
- Zeroes every animation and transition delay — no more waiting before the animation starts.
- Clamps `animation-iteration-count` to 1 — clamped infinite loops cannot strobe (photosensitivity-safe) and stop burning CPU forever.
- Kills smooth scrolling (`scroll-behavior: auto`).
- Stylesheet is injected at `document-start`, prefers CSP-immune constructed stylesheets (`adoptedStyleSheets`), and reinstalls itself automatically if a page removes it.

### JavaScript animation

- Fast-forwards finite animations created with `element.animate()` through the Web Animations API (`animation.finish()`).
- CSS animations are caught the moment they start (`animationstart`), scripted ones via sweeps on `DOMContentLoaded` and `load`.
- Finishes are queued and spread across animation frames (max 16 per frame) — never executed synchronously inside page event handlers, so page logic is never re-entered mid-interaction.

### Navigation

- On Chromium: injects declarative **Speculation Rules** — the browser itself prerenders and prefetches links on hover. Navigating feels like the page was already open, because it was (the next page's JS is already loaded and running before you click — that is what "near instant" really means).
- Everywhere else (Firefox, Safari): same-origin links are prefetched after a 65 ms hover-intent delay, and immediately on `pointerdown` (mobile taps get the full head start). Cross-origin links get a preconnect.
- Keyboard users count too: focusing a link (`focusin`) warms it exactly like hovering.
- Browsers without Pointer Events fall back to classic `mouseover`/`mousedown` — prefetching works everywhere Tampermonkey runs.
- After load, the most-referenced resource origins in the DOM get preconnected so lazy-loaded assets start instantly.
- Back/forward-cache restores re-install the stylesheet and re-sweep animations, so going "back" is instant as well.
- Never prefetches: logout/signout links (state-changing GETs act on fetch), `download` links, `nofollow`/`noprefetch` links, large media (zip, exe, mp4, pdf, ...), the same page you are on.

### JavaScript loading and processing

The Web Animations fast-forward and the CSS clamp both remove animation work from the main thread, which hands that time back to the page's own JavaScript — that is the honest, safe lever a userscript has. Cross-page JS loading is eliminated entirely by prerendering. DNA Shield deliberately does **not** patch `setTimeout`, `fetch`, `XHR`, or script loading: doing so breaks sites, and a script that breaks sites is slower than any animation.

### What it deliberately does not touch

No native APIs are patched, no timers, no `fetch`/XHR, no event defaults, no frameworks. The speedup comes from clamping, finishing, warming, and prerendering — not from monkey-patching the browser. This is what keeps it safe on every site.

## Works everywhere

- Browsers: Chrome, Edge, Firefox, Safari, Opera, Vivaldi, Brave, and anything else that runs Tampermonkey.
- The script uses only widely-supported APIs (`adoptedStyleSheets` and Speculation Rules degrade gracefully where missing).
- Respects `Save-Data` and 2G connections: prefetching turns itself off so it never costs data the visitor did not agree to spend.

## Controls

- Hotkey `Ctrl + Alt + Shift + D` — toggle DNA Shield on the current site.
- `localStorage.__DNA_SHIELD_OFF__ = '1'` — the same switch, set manually.
- `CONFIG.disabledHosts` — hosts (subdomains included) where DNA Shield never runs.
- Public API on `window.DNAShield`: `enabled`, `config`, `sweep()`, `prefetch(url)`, `stop()`, `disableHere()`, `enableHere()`.

## Usage

1. Install `DNA-Shield.user.js` in Tampermonkey.
2. Browse. The web is instant now.

## Development

```bash
npm install
npm test
```

The Jest + jsdom suite evaluates the real userscript and covers the CSS clamp, the kill switch, style recovery, the animation finish queue, speculation rules injection, and every prefetch edge case (logout, downloads, heavy media, dedupe, Save-Data).

## Versioning

Simple major.minor progression: `1.0` → `1.9`, then `2.0` → `2.9`, then `3.0`, and so on. The version lives only in the Tampermonkey metadata.
