<div align="center">

<img src="DNA.jpg" alt="DNA Shield Logo" width="120">

# DNA Shield

**Dominion With Domination** — a Tampermonkey userscript that makes the web feel instant.

[![Version](https://img.shields.io/badge/version-1.7-7c3aed?style=for-the-badge)](DNA-Shield.meta.js)
[![Install](https://img.shields.io/badge/install-Tampermonkey-00485b?style=for-the-badge&logo=tampermonkey&logoColor=white)](https://github.com/LastRoze/DNA-Shield/raw/master/DNA-Shield.user.js)
[![License](https://img.shields.io/badge/license-MIT-16a34a?style=for-the-badge)](LICENSE)

[![Dependencies](https://img.shields.io/badge/runtime%20dependencies-0-0ea5e9?style=flat-square)](DNA-Shield.user.js)
[![Grant](https://img.shields.io/badge/%40grant-none-0ea5e9?style=flat-square)](DNA-Shield.meta.js)
[![Site Agnostic](https://img.shields.io/badge/site--specific%20code-none-0ea5e9?style=flat-square)](#site-agnostic-by-design)
[![Tests](https://img.shields.io/badge/tests-Jest%20%2B%20jsdom-c21325?style=flat-square&logo=jest&logoColor=white)](__tests__)

[![Chrome](https://img.shields.io/badge/Chrome-supported-4285F4?style=flat-square&logo=googlechrome&logoColor=white)](#browser-and-device-support)
[![Edge](https://img.shields.io/badge/Edge-supported-0078D7?style=flat-square)](#browser-and-device-support)
[![Firefox](https://img.shields.io/badge/Firefox-supported-FF7139?style=flat-square&logo=firefoxbrowser&logoColor=white)](#browser-and-device-support)
[![Safari](https://img.shields.io/badge/Safari-supported-006CFF?style=flat-square&logo=safari&logoColor=white)](#browser-and-device-support)
[![Opera](https://img.shields.io/badge/Opera-supported-FF1B2D?style=flat-square&logo=opera&logoColor=white)](#browser-and-device-support)
[![Brave](https://img.shields.io/badge/Brave-supported-FB542B?style=flat-square&logo=brave&logoColor=white)](#browser-and-device-support)

</div>

---

## Contents

- [At A Glance](#at-a-glance)
- [Install](#install)
- [What It Does](#what-it-does)
- [What It Never Touches](#what-it-never-touches)
- [CAPTCHAs Are Untouchable](#captchas-are-untouchable)
- [Site Agnostic By Design](#site-agnostic-by-design)
- [Browser And Device Support](#browser-and-device-support)
- [Controls](#controls)
- [Configuration](#configuration)
- [Known Trade-Offs](#known-trade-offs)
- [Development](#development)
- [Versioning](#versioning)
- [License](#license)

## At A Glance

| | |
| --- | --- |
| **Transitions** | Every transition a site authored lands in its final state in the frame it starts. Elements without their own transitions are never touched. |
| **Animations** | Finite CSS and script animations are fast-forwarded to their end state. Spinners and loops keep running. |
| **Delays** | Animation delays are zeroed, so entrance animations begin immediately. |
| **Scrolling** | Smooth scrolling is disabled on every scroll container. |
| **Navigation** | Links are fetched on hover and prerendered on intent, so the next page is often already open when you click. |
| **Footprint** | One file, zero dependencies, `@grant none`, no native APIs patched. |

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser.
2. Open **[DNA-Shield.user.js](https://github.com/LastRoze/DNA-Shield/raw/master/DNA-Shield.user.js)** and confirm the installation.
3. Browse. Updates arrive automatically through `DNA-Shield.meta.js`.

## What It Does

### Transitions: Finished, Not Clamped

When a site's own CSS starts a transition, the browser fires `transitionrun`. DNA Shield queues that one transition and finishes it through the Web Animations API (`animation.finish()`). Browsers dispatch animation events before running frame callbacks in the same rendering update, so the transition normally reaches its end state before it is ever painted. Any `transition-delay` is skipped with it, and `transitionstart` / `transitionend` still fire, so framework state machines (React, Vue, Bootstrap and the like) keep working.

Earlier versions clamped `transition-duration` with a universal CSS rule. That rule turns the browser default of `all 0s` into a real transition on **every** element, including ones the site never meant to animate. Measured in Chrome, an element with no transition of its own then gets transitions whenever a script moves it: the move lags, measuring the element straight away returns the old position, and stray transition events fire. That hurts dragging, sliders, carousels, maps and sticky headers. Finishing only authored transitions removes all of that.

Why not `0s` or a negative duration? CSS rejects negative durations, so the rule would be discarded. A `0s` transition never starts, so its events never fire and menus or modals that wait for them can hang.

### Animations

- Finite CSS animations are caught the moment they start (`animationstart`), including animations on `::before` / `::after` pseudo-elements.
- Finite script animations (`element.animate()`) are finished by sweeps on `DOMContentLoaded`, `load` and back/forward-cache restores.
- Infinite animations are left running: finishing them would freeze spinners that communicate loading state.
- Finishing happens in two batched passes (read every state, then finish every survivor), so a theme switch that transitions a thousand elements settles in one frame instead of forcing one style recalculation per element.
- `animation-delay` is zeroed so entrance animations start now. Durations are never clamped in CSS by default.

### Navigation

- **Chromium browsers** get declarative [Speculation Rules](https://developer.chrome.com/docs/web-platform/prerender-pages): the HTML of a same-origin link is prefetched after a 10 ms hover (`eager`) and the page is fully prerendered after 200 ms or on `pointerdown` (`moderate`), reusing the prefetch. The browser owns this, so there is no JavaScript cost and no double downloading.
- **Other browsers** prefetch same-origin links after a 65 ms hover and immediately on `pointerdown`, so mobile taps get the full head start. Keyboard focus warms links too.
- Cross-origin links get a `preconnect` on interaction. After load, the most-referenced resource origins that have **not** been contacted yet are preconnected, so lazy-loaded images and scripts start instantly without opening sockets that are never used.
- On sites that enforce Trusted Types, the rules are written through the site's own default policy, a DNA Shield policy where creating one is allowed, or skipped silently. No console noise either way.

### Never Prefetched

One shared list covers both engines, matched case-insensitively:

- **Action links** whose GET request would act: log-out, sign-out and log-off in every common spelling, `delete`, `destroy`, `remove`, `unsubscribe`, add-to-cart variants, `cart/add` and `action=`.
- **Large downloads**: archives, installers, disk images, video, audio, PDF and EPUB.
- Links marked `download`, `rel="nofollow"` or `rel="noprefetch"`, and links to the page you are already on.
- Everything, when the connection reports `Save-Data` or 2G.

## What It Never Touches

No `setTimeout`, `fetch`, `XMLHttpRequest`, event default, framework or other native API is patched. Patching those breaks sites, and a script that breaks sites is slower than any animation. The speedup comes only from finishing authored motion, zeroing delays and warming navigation. The public `window.DNAShield` object is non-enumerable, so scripts that list window properties do not see an extra global.

## CAPTCHAs Are Untouchable

Human verification is a permanent exclusion zone, on three layers:

1. **Challenge frames.** DNA Shield never runs inside a verification provider's own document: the Cloudflare Turnstile iframe (`challenges.cloudflare.com`), any `/cdn-cgi/challenge-platform/` page, and hCaptcha, reCAPTCHA, Arkose/FunCaptcha and GeeTest frames. Those documents score their environment for tampering, so any stylesheet, script or global there fails the challenge. They are excluded by `@exclude` metadata and by a guard that exits before the script touches anything. Cloudflare "Just a moment…" interstitials, served on a site's own URL, are recognized by the challenge type Cloudflare declares on them (`_cf_chl_opt.cType`) and DNA Shield shuts down there. Ordinary pages on Cloudflare-protected sites carry the same object without a challenge type and are accelerated normally.
2. **Motion inside widgets.** Animations and transitions owned by a captcha element (including its shadow tree) are never finished.
3. **Stylesheet suspension.** While a rendered captcha widget is on the page, the stylesheet drops to instant scrolling only, because slider puzzles are commonly driven by negative `animation-delay` techniques. Only widgets a visitor actually faces count: loader and bot-detection scripts, the reCAPTCHA v3 badge and its hidden challenge frame appear on every page of many sites and never switch acceleration off. A Turnstile widget hidden in a closed shadow root is detected through its `cf-turnstile-response` field. Detection inspects only newly added elements, and the one full scan runs in idle time.

## Site Agnostic By Design

There is no per-site code. Every behavior keys off web platform signals (events, computed timing, link attributes, connection hints) that work the same on any page. The only hostnames in the script are the verification providers' own challenge domains in layer 1 above, which exist to keep DNA Shield out of them, and `CONFIG.disabledHosts`, which ships empty.

## Browser And Device Support

DNA Shield runs wherever Tampermonkey runs: Chrome, Edge, Firefox, Safari, Opera, Brave, Vivaldi and other Chromium browsers, on desktop and on the mobile browsers that can install Tampermonkey.

- The code is plain ES5-style JavaScript with no build step.
- Every modern API is feature-detected and degrades to doing nothing, never to an error: constructed stylesheets fall back to a `<style>` element, Speculation Rules fall back to manual prefetch, Pointer Events fall back to mouse events, `requestIdleCallback` falls back to a timer.
- Touch devices get prefetch on `pointerdown`; keyboard users get it on focus.

## Controls

| Control | Effect |
| --- | --- |
| <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd> | Toggle DNA Shield on the current site (reloads the page). |
| `localStorage.__DNA_SHIELD_OFF__ = '1'` | The same per-site switch, set manually. |
| `CONFIG.disabledHosts` | Hosts, subdomains included, where DNA Shield never runs. |
| `window.DNAShield` | `enabled`, `config`, `sweep()`, `prefetch(url)`, `stop()`, `disableHere()`, `enableHere()`. |

## Configuration

Edit `CONFIG` at the top of the script. The defaults are the recommended settings.

| Option | Default | Purpose |
| --- | --- | --- |
| `accelerateTransitions` | `true` | Finish authored transitions the frame they start. |
| `zeroDelays` | `true` | Zero `animation-delay`. |
| `clampAnimations` | `false` | Also force `animation-duration` to `durationMs`; loops stop after one pass. |
| `durationMs` | `10` | Duration used by `clampAnimations` (1–1000 ms). |
| `singleIteration` | `true` | With `clampAnimations`, force one iteration so loops cannot strobe. |
| `instantScroll` | `true` | Disable smooth scrolling. |
| `accelerateScriptedAnimations` | `true` | Finish finite `element.animate()` animations during sweeps. |
| `speculationRules` | `true` | Use Speculation Rules where supported. |
| `prefetchEagerness` / `prerenderEagerness` | `eager` / `moderate` | Speculation Rules timing. |
| `prefetch` / `prefetchHoverDelayMs` | `true` / `65` | Manual prefetch on other browsers. |
| `maxHintsPerPage` | `120` | Cap on prefetch and preconnect hints per page. |
| `preconnect` / `preconnectScan` / `maxPreconnects` | `true` / `true` / `6` | Cross-origin warm-up. |
| `protectCaptchas` | `true` | The captcha exclusion zone. |
| `disabledHosts` | `[]` | Hosts to leave alone. |

## Known Trade-Offs

- Zeroing `animation-delay` makes staggered loaders (three bouncing dots) move in unison, and resets animations a site positions with negative delays. Set `zeroDelays: false` if that matters to you.
- Long transitions used as timers, such as a progress bar that fills over 30 seconds, jump to their end.
- Speculation Rules prefetch uses some extra bandwidth on hover. Chrome caps it at two pages at a time, and DNA Shield skips it entirely on `Save-Data` or 2G connections.
- A userscript cannot speed up a slow server or heavy site JavaScript. DNA Shield removes waiting that is under the browser's control.

## Development

```bash
npm install
npm test
```

The Jest + jsdom suite evaluates the real userscript and covers the stylesheet contents, transition and animation finishing (including pseudo-elements, bursts and paused animations), the kill switch, stylesheet recovery, the captcha exclusion zone (challenge frames, Cloudflare interstitials, shadow-rooted widgets, false positives), Speculation Rules and every prefetch exclusion.

## Versioning

Simple major.minor progression: `1.0` → `1.9`, then `2.0` → `2.9`, then `3.0`, and so on. The version lives in the Tampermonkey metadata of `DNA-Shield.user.js` and `DNA-Shield.meta.js` (the two headers are identical); `package.json` mirrors it as `major.minor.0`.

## License

[MIT](LICENSE) © Yoga Budiman
