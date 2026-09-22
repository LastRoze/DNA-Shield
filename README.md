# DNA-Shield

Dominion With Domination

A Tampermonkey userscript that makes the web feel instant. One file, zero dependencies, runs on every browser and device Tampermonkey supports.

## The 0.1 second bar

Everything DNA Shield does targets one bar: **near instant means 0.1 seconds or less.** Most actions finish in 0.01 seconds.

## What it does

### UI animation (CSS + Web Animations API)

- Clamps every CSS **transition** to at most `0.01s` — transitions are one-shot UI feedback, so this reads as snappy, and `transitionrun`/`transitionstart`/`transitionend` still fire so framework state machines (React, Vue, etc.) keep working.
- Zeroes every animation and transition delay — no more waiting before the animation starts.
- **Does not clamp CSS animations by default.** Clamping `animation-duration` froze loading spinners mid-rotation and made pages look stuck; instead, finite animations are fast-forwarded through the Web Animations API (`animation.finish()`), which is iteration-aware and fires the correct `animationstart`/`animationend` events — so spinners keep spinning, menus still land, and finite animations still end near-instantly. Set `CONFIG.clampAnimations = true` if you want the maximally stark variant that also kills ambient loops.
- Kills smooth scrolling (`scroll-behavior: auto`).
- All rules ship as one universal selector block to keep style-recalc pressure low on huge DOMs.
- Stylesheet is injected at `document-start`, prefers CSP-immune constructed stylesheets (`adoptedStyleSheets`), and reinstalls itself automatically if a page removes it.

### JavaScript animation

- Fast-forwards finite animations created with `element.animate()` **and** finite CSS animations through the Web Animations API (`animation.finish()`).
- CSS animations are caught the moment they start (`animationstart`), scripted ones via sweeps on `DOMContentLoaded`, `load`, and back/forward-cache restores.
- Finishes are queued and spread across animation frames (max 16 per frame) — never executed synchronously inside page event handlers, so page logic is never re-entered mid-interaction.
- Infinite animations (spinners, ambient loops) are left running — they communicate loading state and cannot be fast-forwarded without freezing or strobing.

### Navigation

- On Chromium: injects declarative **Speculation Rules** — the browser itself prerenders and prefetches links on hover. Navigating feels like the page was already open, because it was (the next page's JS is already loaded and running before you click — that is what "near instant" really means). Sites that enforce Trusted Types with a locked policy list (Gmail, other Google apps) are detected and skipped silently — no CSP violation spam.
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
