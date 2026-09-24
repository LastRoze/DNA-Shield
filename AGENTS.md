# DNA Shield Agent Guide

## Project

- `DNA-Shield.user.js` is the whole product: one Tampermonkey userscript, plain ES5-style JavaScript, no build step, `@grant none`.
- `DNA-Shield.meta.js` is the update-check header Tampermonkey polls. It must stay byte-identical to the metadata block at the top of `DNA-Shield.user.js`.
- `__tests__/` holds the Jest + jsdom suites that evaluate the real userscript.
- Releases ship by pushing to `master`; the `@updateURL` / `@downloadURL` point at the raw files there.

## Code Rules

- Apply JSDoc-style block comments (`/** ... */`) for any new or modified JavaScript functions.
- Prefer small, focused helper functions and keep changes backwards compatible with the userscript runtime.
- Feature-detect every modern API and degrade to doing nothing, never to an error.
- Stay site agnostic: no per-site code. The only hostnames allowed are verification providers' challenge domains (to stay out of them) and the user-editable `CONFIG.disabledHosts`, which ships empty.
- Never patch native APIs (timers, `fetch`, XHR, events, frameworks).
- Never clamp `transition-duration` in CSS: the default `all 0s` would become a real transition on every element. Authored transitions are finished via `transitionrun` instead.
- Never run inside CAPTCHA challenge documents, and never finish motion owned by a captcha widget.

## Tests

- When adding tests, use Jest with the jsdom environment and expose internal helpers through a guarded global for test access when necessary.
- Always run `npm test` before completing work.

## Versioning

DNA Shield follows a simple major.minor progression that starts at `1.0`, increments the minor portion through `1.9`, then advances to the next major release (for example `2.0`). Bump the version in both metadata headers and in `package.json` (as `major.minor.0`), and in the README version badge.
