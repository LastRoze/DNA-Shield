# DNA-Shield Agent Guide

- Apply JSDoc-style block comments (`/** ... */`) for any new or modified JavaScript functions.
- Prefer small, focused helper functions and keep changes backwards compatible with the userscript runtime.
- When adding tests, use Jest with the jsdom environment and expose internal helpers through a guarded global for test access when necessary.
- Always run `npm test` before completing work.

## Versioning

DNA Shield follows a simple major.minor progression that starts at `1.0`, increments the minor portion through `1.9`, then advances to the next major release (for example `2.0`).
