# DNA-Shield

Dominion With Domination

A Tampermonkey userscript that makes the web feel instant — low-overhead, application-safe animation acceleration.

## Features

- Zeroes CSS `animation-delay` on every element so animations start immediately (`html * { animation-delay: 0s !important; }`).
- Forces instant scrolling (`scroll-behavior: auto`) across the page.
- Fast-forwards finite CSS animations by queuing `animation.finish()` calls and spreading them across animation frames — never finished synchronously inside event handlers, so application state machines (React/Vue/etc.) are not re-entered mid-interaction.
- Leaves infinite/looping animations and CSS transitions untouched by default; script-created `element.animate()` animations are only fast-forwarded when `CONFIG.accelerateScriptedAnimations` is enabled (periodic sweep).
- Re-installs its stylesheet automatically if a page removes it (MutationObserver recovery).
- Per-site kill switch: press `Ctrl + Alt + Shift + D` to toggle DNA Shield on the current site, or set `localStorage.__DNA_SHIELD_OFF__ = '1'`.
- Hosts listed in `CONFIG.disabledHosts` (subdomains included) are left completely alone.
- Public API on `window.DNAShield`: `version`, `enabled`, `config`, `sweep()`, `accelerate(el)`, `disableHere()`, `enableHere()`, `stopSweep()`.

## Usage

1. Install `DNA-Shield.user.js` in Tampermonkey.
2. Browse normally — CSS animations start instantly and finite ones are fast-forwarded, without breaking hover/focus/open/close transitions.

## Development

```bash
npm install
npm test
```

The test suite runs the userscript inside jsdom and covers the public API, stylesheet injection, the kill switch, and the animation fast-forward queue.
