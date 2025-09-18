# DNA-Shield

Dominion With Domination

## Features

- Automatically hints browsers to decode images asynchronously and lazily load offscreen media for faster first paint.
- Applies native lazy-loading to newly added images and iframes while respecting critical above-the-fold content.
- Dampens excessive animations and transitions by clamping their run time while allowing critical or repeated motion to continue normally. Developers can opt a subtree out by adding a `data-dna-keep-motion` attribute.
- Light-touch media tuning that limits video and audio preloading to metadata unless explicitly required by the site.
- Keeps optimizations active across navigation events and single-page-app route changes without configuration.
- Sends low-overhead keepalive pings so sites treat the session as active without simulating user movement.
- Runs on every site without menus, overlays, or per-domain configuration so the acceleration feels native.

## Usage

1. Install `DNA-Shield.user.js` in Tampermonkey.
2. Browse normally—the optimizations apply automatically on every page.

## Versioning

DNA Shield follows a simple major.minor progression that starts at `1.0`, increments the minor portion through `1.9`, then advances to the next major release (for example `2.0`).
