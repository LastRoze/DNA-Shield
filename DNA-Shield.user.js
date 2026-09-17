// ==UserScript==
// @name         DNA Shield
// @namespace    DNA Shield
// @version      2.1
// @author       Last Roze
// @description  Dominion With Domination — Universal Zero-Grant Instant UI Engine (event-safe)
// @copyright    ©2020-2026 Yoga Budiman
// @homepage     https://github.com/LastRoze/
// @homepageURL  https://github.com/LastRoze/
// @website      https://lastroze.github.io/
// @source       https://github.com/LastRoze/DNA-Shield
// @icon         https://github.com/LastRoze/DNA-Shield/blob/master/DNA.jpg?raw=true
// @iconURL      https://github.com/LastRoze/DNA-Shield/blob/master/DNA.jpg?raw=true
// @updateURL    https://github.com/LastRoze/DNA-Shield/raw/master/DNA-Shield.meta.js
// @downloadURL  https://github.com/LastRoze/DNA-Shield/raw/master/DNA-Shield.user.js
// @supportURL   https://lastroze.github.io/
// @match        *://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function DNA_SHIELD() {

    'use strict';
    const VERSION = '2.4';
    const STYLE_ID = '__DNA_SHIELD_2.1__';

    /* ==========================================================
     * CONFIGURATION
     * ========================================================== */

    const CONFIG = {

        /*
         * Playback multiplier for INFINITE animations (spinners,
         * pulses, marquees). 1 = leave them exactly as authored.
         * Try 4 if you want them visibly faster. Values above ~10
         * can generate a lot of animationiteration events.
         */
        loopSpeed: 1,

        /*
         * Finite animations/transitions longer than this many
         * milliseconds are finished immediately. 0 = all of them.
         */
        minDurationMs: 0,

        /* Collapse animation-delay / transition-delay to zero. */
        zeroDelays: true,

        /* Disable smooth scrolling. */
        instantScroll: true,

        /*
         * Also fast-forward animations created in JavaScript via
         * element.animate(). These fire no animationstart event, so
         * catching them needs a light periodic sweep. Off by default.
         */
        accelerateScriptedAnimations: false,

        /* Sweep interval (ms) used only when the option above is on. */
        sweepIntervalMs: 400,

        /*
         * Hosts where DNA Shield stays completely out of the way.
         * Subdomains are matched automatically.
         */
        disabledHosts: [
            // 'meet.google.com',
            // 'figma.com'
        ]

    };

    /* ==========================================================
     * PER-SITE KILL SWITCH
     * ==========================================================
     *
     * localStorage flag, so it survives reloads without any @grant.
     * Toggle at runtime with Ctrl+Alt+Shift+D, or from the console:
     *
     *      DNAShield.disableHere()
     *      DNAShield.enableHere()
     *
     * ========================================================== */

    const OFF_KEY = '__DNA_SHIELD_OFF__';

    function hostDisabled() {
        try {
            const h = location.hostname;
            return CONFIG.disabledHosts.some(function (d) {
                return h === d || h.endsWith('.' + d);
            });
        } catch (_) {
            return false;
        }
    }

    function userDisabled() {
        try {
            return localStorage.getItem(OFF_KEY) === '1';
        } catch (_) {
            return false;
        }
    }

    function setDisabled(v) {
        try {
            if (v) {
                localStorage.setItem(OFF_KEY, '1');
            } else {
                localStorage.removeItem(OFF_KEY);
            }
            location.reload();
        } catch (_) {}
    }

    const ACTIVE = !hostDisabled() && !userDisabled();

    /* ==========================================================
     * PUBLIC STATE
     * ========================================================== */

    try {
        window.__DNA_SHIELD__ = true;
        window.__DNA_SHIELD_VERSION__ = VERSION;
        window.__DNA_SHIELD_SAFE__ = true;
        /*
         * NOTE: `window.seconds = -1` from older versions was removed.
         * It polluted a very common global name and could break
         * countdown / timer scripts on unrelated pages.
         */
    } catch (_) {}

    /* ==========================================================
     * CSS — EVENT-NEUTRAL PARTS ONLY
     * ==========================================================
     *
     * Zeroing a DELAY is safe: the transition or animation still
     * runs and still fires its full event sequence, it just starts
     * immediately. Zeroing a DURATION is what suppresses the events,
     * so durations are handled in JavaScript instead.
     *
     * ========================================================== */

    let CSS = '';

    if (CONFIG.zeroDelays) {
        CSS += `
html *,
html *::before,
html *::after {
    animation-delay: 0s !important;
    transition-delay: 0s !important;
    -webkit-animation-delay: 0s !important;
    -webkit-transition-delay: 0s !important;
}
`;
    }

    if (CONFIG.instantScroll) {
        CSS += `
html,
body {
    scroll-behavior: auto !important;
}
`;
    }

    /*
     * Legacy fallback only. On engines without the Web Animations
     * API we cannot fast-forward anything, so we shorten durations
     * instead — but to 1ms, never 0s, so the events still fire.
     */
    const WAAPI =
        typeof Element !== 'undefined' &&
        typeof Element.prototype.getAnimations === 'function';

    if (!WAAPI) {
        CSS += `
html *,
html *::before,
html *::after {
    animation-duration: 1ms !important;
    transition-duration: 1ms !important;
    -webkit-animation-duration: 1ms !important;
    -webkit-transition-duration: 1ms !important;
}
`;
    }

    /* ==========================================================
     * STYLE INSTALLATION
     * ========================================================== */

    let styleEl = null;

    function install() {
        if (!ACTIVE || !CSS) {
            return;
        }
        try {
            if (styleEl && styleEl.isConnected) {
                return;
            }
            if (!styleEl) {
                const existing = document.getElementById(STYLE_ID);
                if (existing) {
                    styleEl = existing;
                } else {
                    styleEl = document.createElement('style');
                    styleEl.id = STYLE_ID;
                    styleEl.textContent = CSS;
                }
            }
            const parent = document.head || document.documentElement;
            if (parent) {
                parent.appendChild(styleEl);
            }
        } catch (_) {
            /* Fail silently. The page must keep working. */
        }
    }

    install();

    /* ==========================================================
     * ANIMATION ACCELERATION (the actual engine)
     * ========================================================== */

    const seen =
        typeof WeakSet === 'function' ? new WeakSet() : null;

    function accelerate(anim) {

        if (!anim) {
            return;
        }

        try {
            if (seen) {
                if (seen.has(anim)) {
                    return;
                }
                seen.add(anim);
            }
        } catch (_) {
            return;
        }

        let timing = null;

        try {
            if (anim.effect && typeof anim.effect.getComputedTiming === 'function') {
                timing = anim.effect.getComputedTiming();
            }
        } catch (_) {
            return;
        }

        if (!timing) {
            return;
        }

        try {

            const endTime = Number(timing.endTime);

            const infinite =
                timing.iterations === Infinity ||
                !isFinite(endTime) ||
                !isFinite(Number(timing.activeDuration));

            /*
             * Looping animation: it never blocks anything, so it is
             * never finished — that would freeze the spinner and could
             * fire an unexpected animationend. Only the playback rate
             * is touched, and only if asked for.
             */
            if (infinite) {
                if (CONFIG.loopSpeed > 1) {
                    if (typeof anim.updatePlaybackRate === 'function') {
                        anim.updatePlaybackRate(CONFIG.loopSpeed);
                    } else {
                        anim.playbackRate = CONFIG.loopSpeed;
                    }
                }
                return;
            }

            /*
             * Paused / idle animations belong to the application's own
             * state machine (scrubbed progress bars, gesture-driven
             * drawers). Finishing them would change behaviour, not just
             * timing, so they are left alone.
             */
            const state = anim.playState;
            if (state !== 'running') {
                return;
            }

            if (endTime <= CONFIG.minDurationMs) {
                return;
            }

            /*
             * finish() completes the animation AND dispatches
             * transitionend / animationend. This is the whole point:
             * the visual time disappears, the event contract survives.
             */
            anim.finish();

        } catch (_) {
            /*
             * finish() throws for a few exotic effects. Nothing to do —
             * the animation simply plays normally.
             */
        }
    }

    function accelerateTarget(target) {
        if (!target || typeof target.getAnimations !== 'function') {
            return;
        }
        let list;
        try {
            list = target.getAnimations();
        } catch (_) {
            return;
        }
        for (let i = 0; i < list.length; i++) {
            accelerate(list[i]);
        }
    }

    function onAnimationEvent(e) {
        accelerateTarget(e.target);
    }

    /*
     * transitionrun fires before the delay elapses, animationstart at
     * the first frame. Catching these means we only ever touch elements
     * that genuinely animate — no cost on pages that do not.
     */
    function hookEvents() {
        if (!ACTIVE || !WAAPI) {
            return;
        }
        const types = [
            'animationstart',
            'transitionrun',
            'transitionstart'
        ];
        for (let i = 0; i < types.length; i++) {
            try {
                document.addEventListener(
                    types[i],
                    onAnimationEvent,
                    { capture: true, passive: true }
                );
            } catch (_) {}
        }
    }

    hookEvents();

    /*
     * One-shot sweeps, in case the script was injected late or an
     * animation started inside a shadow root whose events did not
     * reach us.
     */
    function sweep() {
        if (!ACTIVE || !WAAPI) {
            return;
        }
        try {
            if (typeof document.getAnimations === 'function') {
                const list = document.getAnimations();
                for (let i = 0; i < list.length; i++) {
                    accelerate(list[i]);
                }
            }
        } catch (_) {}
    }

    /* ==========================================================
     * STYLESHEET RECOVERY
     * ==========================================================
     *
     * Some frameworks rebuild <head>. The old version observed the
     * whole document with subtree:true and ran a getElementById on
     * every single mutation — that is real CPU cost inside a heavy
     * editor. We now watch only the two nodes that can actually drop
     * our stylesheet, without subtree, and test isConnected.
     *
     * ========================================================== */

    function startObserver() {

        if (!ACTIVE || !CSS) {
            return;
        }

        if (typeof MutationObserver !== 'function') {
            return;
        }

        try {

            const observer = new MutationObserver(function () {
                if (!styleEl || !styleEl.isConnected) {
                    install();
                }
            });

            if (document.documentElement) {
                observer.observe(document.documentElement, { childList: true });
            }
            if (document.head) {
                observer.observe(document.head, { childList: true });
            }

        } catch (_) {}
    }

    function onReady() {
        install();
        startObserver();
        sweep();
    }

    try {
        if (document.readyState === 'loading') {
            document.addEventListener(
                'DOMContentLoaded',
                onReady,
                { once: true, passive: true }
            );
        } else {
            onReady();
        }
    } catch (_) {}

    try {
        window.addEventListener(
            'load',
            function () {
                install();
                sweep();
            },
            { once: true, passive: true }
        );
    } catch (_) {}

    /* ==========================================================
     * OPTIONAL SWEEP FOR SCRIPTED (element.animate) ANIMATIONS
     * ========================================================== */

    let sweepTimer = null;

    if (ACTIVE && WAAPI && CONFIG.accelerateScriptedAnimations) {
        try {
            sweepTimer = setInterval(function () {
                if (document.visibilityState === 'hidden') {
                    return;
                }
                sweep();
            }, CONFIG.sweepIntervalMs);
        } catch (_) {}
    }

    /* ==========================================================
     * HOTKEY: Ctrl + Alt + Shift + D
     * ========================================================== */

    try {
        window.addEventListener('keydown', function (e) {
            if (e.ctrlKey && e.altKey && e.shiftKey &&
                (e.key === 'D' || e.key === 'd')) {
                setDisabled(ACTIVE);
            }
        }, { capture: true, passive: true });
    } catch (_) {}

    /* ==========================================================
     * PUBLIC API
     * ========================================================== */

    try {

        window.DNAShield = {

            version: VERSION,
            enabled: ACTIVE,
            mode: 'waapi-fast-forward',

            zeroGrant: true,
            applicationSafe: true,

            patchesBrowserAPIs: false,
            patchesTimers: false,
            patchesNetwork: false,
            patchesEvents: false,
            patchesFrameworks: false,
            patchesForms: false,

            config: CONFIG,

            /* Manually fast-forward everything currently animating. */
            sweep: sweep,

            /* Fast-forward one element's animations. */
            accelerate: accelerateTarget,

            disableHere: function () { setDisabled(true); },
            enableHere:  function () { setDisabled(false); },

            stopSweep: function () {
                if (sweepTimer) {
                    clearInterval(sweepTimer);
                    sweepTimer = null;
                }
            }

        };

    } catch (_) {}

})();
