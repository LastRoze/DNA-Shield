# DNA-Shield Agent Guide

- Apply JSDoc-style block comments (`/** ... */`) for any new or modified JavaScript functions.
- Prefer small, focused helper functions and keep changes backwards compatible with the userscript runtime.
- When adding tests, use Jest with the jsdom environment and expose internal helpers through a guarded global for test access when necessary.
- Always run `npm test` before completing work.
