// ==UserScript==
// @name         DNA Shield
// @namespace    DNA Shield
// @version      2.2
// @author       Last Roze
// @description  Dominion With Domination — Low-overhead instant UI accelerator
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

    const VERSION = '2.3';
    const STYLE_ID = '__DNA_SHIELD_' + VERSION + '__';

    /* ==========================================================
     * CONFIGURATION
     * ========================================================== */

    const CONFIG = {

        /*
         * Playback multiplier for infinite CSS animations.
         * 1 = leave them exactly as authored.
         */
        loopSpeed: 1,

        /*
         * Finite CSS animations longer than this threshold are
         * fast-forwarded. 0 = fast-forward every finite animation.
         */
        minDurationMs: 0,

        /*
         * Zero CSS animation delays only.
         *
         * IMPORTANT:
         * Transition delays are intentionally NOT modified by default.
         * Transition timing is frequently part of a framework's UI
         * state machine and changing it globally can break interactions.
         */
        zeroAnimationDelays: true,

        /*
         * Fast-forward CSS transitions.
         *
         * Disabled by default because transitions are commonly tied to
         * hover/focus/open/close state changes in React/Vue/etc.
         */
        accelerateTransitions: false,

        /*
         * Disable smooth scrolling.
         *
         * Kept opt-in because some applications deliberately depend on
         * smooth scrolling behaviour.
         */
        instantScroll: true,

        /*
         * Catch animations created with element.animate().
         * Off by default. Enabling it periodically scans the document.
         */
        accelerateScriptedAnimations: false,

        /*
         * Periodic scan interval when scripted animation acceleration
         * is enabled.
         */
        sweepIntervalMs: 1000,

        /*
         * Maximum number of animation.finish() calls performed in one
         * animation frame. Work is spread across frames to prevent a
         * burst of animation events from freezing the main thread.
         */
        maxFinishesPerFrame: 16,

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
    } catch (_) {}

    /* ==========================================================
     * CSS — MINIMAL SCOPE
     * ==========================================================
     *
     * The previous version applied both animation and transition
     * delay rules to every element and pseudo-element. That creates
     * avoidable style matching/recalculation pressure on large DOMs.
     *
     * This version only touches animation-delay when requested.
     * Transition-delay is left alone.
     *
     * No duration override is used as a browser fallback because
     * 1ms !important transitions are just as capable of breaking
     * application interaction state as finish().
     * ========================================================== */

    let CSS = '';

    if (CONFIG.zeroAnimationDelays) {
        CSS += `
html * {
    animation-delay: 0s !important;
    -webkit-animation-delay: 0s !important;
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

    /* ==========================================================
     * STYLE INSTALLATION
     * ========================================================== */

    let styleEl = null;
    let styleObserver = null;

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

            if (parent && !styleEl.isConnected) {
                parent.appendChild(styleEl);
            }
        } catch (_) {
            /* Fail silently. The page must keep working. */
        }
    }

    install();

    /* ==========================================================
     * ANIMATION ACCELERATION
     * ==========================================================
     *
     * Critical difference from 2.1:
     *
     * 1. Animation events NEVER call finish() synchronously.
     * 2. CSS transitions are ignored unless explicitly enabled.
     * 3. Animation work is queued and spread across animation frames.
     * 4. We do not call document.getAnimations() for normal operation.
     *
     * This prevents re-entrant animationend/transitionend callbacks
     * from running in the middle of click/focus/state-change handlers.
     * ========================================================== */

    const handled =
        typeof WeakSet === 'function' ? new WeakSet() : null;

    const queued =
        typeof WeakSet === 'function' ? new WeakSet() : null;

    const finishQueue = [];
    let finishFrame = 0;

    function isCSSAnimation(anim) {
        try {
            /*
             * CSSAnimation instances expose animationName.
             * CSS transitions generally expose transitionProperty instead.
             */
            return !!anim && typeof anim.animationName === 'string';
        } catch (_) {
            return false;
        }
    }

    function isTransition(anim) {
        try {
            return !!anim && typeof anim.transitionProperty === 'string';
        } catch (_) {
            return false;
        }
    }

    function scheduleFinish(anim) {
        if (!anim) {
            return;
        }

        try {
            if (queued) {
                if (queued.has(anim)) {
                    return;
                }
                queued.add(anim);
            }

            finishQueue.push(anim);

            if (!finishFrame) {
                finishFrame = requestAnimationFrame(flushFinishQueue);
            }
        } catch (_) {}
    }

    function flushFinishQueue() {
        finishFrame = 0;

        if (!ACTIVE) {
            finishQueue.length = 0;
            return;
        }

        let processed = 0;
        const limit = Math.max(
            1,
            Number(CONFIG.maxFinishesPerFrame) || 1
        );

        while (finishQueue.length && processed < limit) {
            const anim = finishQueue.shift();

            try {
                if (queued) {
                    queued.delete(anim);
                }
            } catch (_) {}

            try {
                /*
                 * Re-read state immediately before finishing. The page
                 * may have cancelled/paused the animation since it was
                 * queued.
                 */
                if (!anim || anim.playState !== 'running') {
                    continue;
                }

                let timing = null;

                if (
                    anim.effect &&
                    typeof anim.effect.getComputedTiming === 'function'
                ) {
                    timing = anim.effect.getComputedTiming();
                }

                if (!timing) {
                    continue;
                }

                const endTime = Number(timing.endTime);
                const activeDuration = Number(timing.activeDuration);
                const infinite =
                    timing.iterations === Infinity ||
                    !isFinite(endTime) ||
                    !isFinite(activeDuration);

                if (infinite) {
                    continue;
                }

                if (endTime <= Number(CONFIG.minDurationMs) || endTime <= 0) {
                    continue;
                }

                /*
                 * finish() is now outside the original animationstart
                 * event stack, which avoids re-entrant application state
                 * changes during pointer/click/focus processing.
                 */
                anim.finish();
                processed++;
            } catch (_) {
                /* Exotic effects are left alone. */
            }
        }

        if (finishQueue.length) {
            finishFrame = requestAnimationFrame(flushFinishQueue);
        }
    }

    function accelerate(anim, allowScripted) {
        if (!anim) {
            return;
        }

        try {
            if (handled) {
                if (handled.has(anim)) {
                    return;
                }
                handled.add(anim);
            }
        } catch (_) {
            return;
        }

        try {
            if (isTransition(anim)) {
                if (!CONFIG.accelerateTransitions) {
                    return;
                }

                /*
                 * Even when explicitly enabled, transitions are queued
                 * rather than finished synchronously.
                 */
                if (anim.playState === 'running') {
                    scheduleFinish(anim);
                }

                return;
            }

            if (!isCSSAnimation(anim) && allowScripted !== true) {
                /*
                 * Script-created Animation objects are intentionally not
                 * touched by event handling. Only the optional sweep
                 * (accelerateScriptedAnimations) passes allowScripted.
                 */
                return;
            }

            let timing = null;

            if (
                anim.effect &&
                typeof anim.effect.getComputedTiming === 'function'
            ) {
                timing = anim.effect.getComputedTiming();
            }

            if (!timing) {
                return;
            }

            const infinite =
                timing.iterations === Infinity ||
                !isFinite(Number(timing.endTime)) ||
                !isFinite(Number(timing.activeDuration));

            if (infinite) {
                if (CONFIG.loopSpeed > 1) {
                    try {
                        if (typeof anim.updatePlaybackRate === 'function') {
                            anim.updatePlaybackRate(CONFIG.loopSpeed);
                        } else {
                            anim.playbackRate = CONFIG.loopSpeed;
                        }
                    } catch (_) {}
                }
                return;
            }

            if (anim.playState !== 'running') {
                return;
            }

            const endTime = Number(timing.endTime);

            if (
                !isFinite(endTime) ||
                endTime <= Number(CONFIG.minDurationMs) ||
                endTime <= 0
            ) {
                return;
            }

            scheduleFinish(anim);
        } catch (_) {}
    }

    function accelerateTarget(target, animationName) {
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
            const anim = list[i];

            try {
                if (
                    animationName &&
                    isCSSAnimation(anim) &&
                    anim.animationName !== animationName
                ) {
                    continue;
                }
            } catch (_) {}

            accelerate(anim);
        }
    }

    function onAnimationEvent(e) {
        /*
         * Only process actual CSS animation starts by default.
         * Transition events are deliberately not observed unless the
         * user explicitly enables accelerateTransitions.
         */
        if (!e || !e.target) {
            return;
        }

        accelerateTarget(e.target, e.animationName || '');
    }

    function onTransitionEvent(e) {
        if (!CONFIG.accelerateTransitions || !e || !e.target) {
            return;
        }

        accelerateTarget(e.target);
    }

    function hookEvents() {
        if (!ACTIVE || typeof document.addEventListener !== 'function') {
            return;
        }

        try {
            document.addEventListener(
                'animationstart',
                onAnimationEvent,
                { capture: true, passive: true }
            );
        } catch (_) {}

        if (CONFIG.accelerateTransitions) {
            const types = ['transitionrun', 'transitionstart'];

            for (let i = 0; i < types.length; i++) {
                try {
                    document.addEventListener(
                        types[i],
                        onTransitionEvent,
                        { capture: true, passive: true }
                    );
                } catch (_) {}
            }
        }
    }

    hookEvents();

    /* ==========================================================
     * MANUAL / OPTIONAL SWEEP
     * ========================================================== */

    function sweep() {
        if (!ACTIVE) {
            return;
        }

        try {
            if (typeof document.getAnimations !== 'function') {
                return;
            }

            const list = document.getAnimations();

            /*
             * Queue only. Never finish the entire page synchronously.
             * The sweep is the only caller allowed to accelerate
             * script-created (element.animate) animations.
             */
            for (let i = 0; i < list.length; i++) {
                accelerate(list[i], true);
            }
        } catch (_) {}
    }

    /* ==========================================================
     * STYLESHEET RECOVERY
     * ==========================================================
     *
     * Only observe direct child changes on the document element.
     * The previous implementation attached observers to both
     * <html> and <head>, causing duplicate mutation callbacks.
     * ========================================================== */

    function startObserver() {
        if (!ACTIVE || !CSS || typeof MutationObserver !== 'function') {
            return;
        }

        try {
            if (styleObserver) {
                return;
            }

            styleObserver = new MutationObserver(function () {
                if (!styleEl || !styleEl.isConnected) {
                    install();
                }
            });

            if (document.documentElement) {
                styleObserver.observe(document.documentElement, {
                    childList: true
                });
            }
        } catch (_) {}
    }

    function onReady() {
        install();
        startObserver();
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
            },
            { once: true, passive: true }
        );
    } catch (_) {}

    /* ==========================================================
     * OPTIONAL SWEEP FOR SCRIPTED (element.animate) ANIMATIONS
     * ========================================================== */

    let sweepTimer = null;

    if (
        ACTIVE &&
        typeof document.getAnimations === 'function' &&
        CONFIG.accelerateScriptedAnimations
    ) {
        try {
            sweepTimer = setInterval(function () {
                if (document.visibilityState === 'hidden') {
                    return;
                }
                sweep();
            }, Math.max(250, Number(CONFIG.sweepIntervalMs) || 1000));
        } catch (_) {}
    }

    /* ==========================================================
     * HOTKEY: Ctrl + Alt + Shift + D
     * ========================================================== */

    try {
        window.addEventListener(
            'keydown',
            function (e) {
                if (
                    e.ctrlKey &&
                    e.altKey &&
                    e.shiftKey &&
                    (e.key === 'D' || e.key === 'd')
                ) {
                    setDisabled(ACTIVE);
                }
            },
            { capture: true, passive: true }
        );
    } catch (_) {}

    /* ==========================================================
     * PUBLIC API
     * ========================================================== */

    try {
        window.DNAShield = {

            version: VERSION,
            enabled: ACTIVE,
            mode: 'queued-css-animation-fast-forward',

            zeroGrant: true,
            applicationSafe: true,

            patchesBrowserAPIs: false,
            patchesTimers: false,
            patchesNetwork: false,
            patchesEvents: false,
            patchesFrameworks: false,
            patchesForms: false,

            config: CONFIG,

            /* Manually fast-forward currently animating CSS animations. */
            sweep: sweep,

            /* Queue acceleration for one element's animations. */
            accelerate: accelerateTarget,

            disableHere: function () {
                setDisabled(true);
            },

            enableHere: function () {
                setDisabled(false);
            },

            stopSweep: function () {
                if (sweepTimer) {
                    clearInterval(sweepTimer);
                    sweepTimer = null;
                }

                if (finishFrame) {
                    cancelAnimationFrame(finishFrame);
                    finishFrame = 0;
                }

                finishQueue.length = 0;
            }

        };
    } catch (_) {}

})();
