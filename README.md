# DNA-Shield

Dominion With Domination

## Features

- Forces a zero-duration experience by clamping animation and transition delays, durations, and timing functions on the `<html>` element and all descendants.
- Removes `async-hide` classes from the document root so hidden content becomes visible immediately.
- Disables jQuery-powered animations by flipping the `fx.off` flag when jQuery is present (including on wrapped windows).
- Sets instant scroll behavior across the page to eliminate smooth scrolling effects.
- Injects a global stylesheet that applies the same constraints to every element, pseudo-element, and animation hook.

## Usage

1. Install `DNA-Shield.user.js` in Tampermonkey.
2. Browse normally—every page will open without animations, transitions, or smooth scrolling.
