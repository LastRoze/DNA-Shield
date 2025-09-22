# DNA-Shield

Dominion With Domination

## Features

- Automatically hints browsers to decode images asynchronously for faster first paint.
- Applies modern priority hints so above-the-fold images and iframes stream early without extra configuration.
- Dampens excessive animations and transitions by clamping their run time while allowing critical or repeated motion to continue normally. Developers can opt a subtree out by adding a `DNA-Shield` attribute.
- Light-touch media tuning that limits video and audio preloading to metadata unless explicitly required by the site.
- Keeps optimizations active across navigation events and single-page-app route changes without configuration.
- Sends low-overhead keepalive pings so sites treat the session as active without simulating user movement.
- Runs on every site without menus, overlays, or per-domain configuration so the acceleration feels native.

## Usage

1. Install `DNA-Shield.user.js` in Tampermonkey.
2. Browse normally—the optimizations apply automatically on every page.
