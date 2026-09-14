// ==UserScript==
// @name         DNA Shield
// @namespace    DNA Shield
// @version      2.0
// @author       Last Roze
// @description  Dominion With Domination — Universal Zero-Grant Instant UI Engine
// @copyright    ©2020-2026 Yoga Budiman
// @homepage     https://github.com/LastRoze/
// @homepageURL  https://github.com/LastRoze/
// @website      https://lastroze.github.io/
// @source       https://github.com/LastRoze/DNA-Shield
// @icon         https://github.com/LastRoze/DNA-Shield/blob/master/DNA.jpg?raw=true
// @iconURL      https://github.com/LastRoze/DNA-Shield/blob/master/DNA.jpg?raw=true
// @defaulticon  https://github.com/LastRoze/DNA-Shield/blob/master/DNA.jpg?raw=true
// @icon64       https://github.com/LastRoze/DNA-Shield/blob/master/DNA.jpg?raw=true
// @icon64URL    https://github.com/LastRoze/DNA-Shield/blob/master/DNA.jpg?raw=true
// @updateURL    https://github.com/LastRoze/DNA-Shield/raw/master/DNA-Shield.meta.js
// @downloadURL  https://github.com/LastRoze/DNA-Shield/raw/master/DNA-Shield.user.js
// @supportURL   https://lastroze.github.io/
// @match        *://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function DNA_SHIELD() {

    'use strict';

    /*
     * ==========================================================
     * DNA SHIELD 5.0
     * ==========================================================
     *
     * UNIVERSAL / ZERO-GRANT / SAFE-FIRST
     *
     * PRIMARY OBJECTIVE:
     *
     *      Remove artificial VISUAL TIME.
     *
     * SECONDARY OBJECTIVE:
     *
     *      Make the result as close to instantaneous as the
     *      browser/application itself permits.
     *
     * HARD COMPATIBILITY RULE:
     *
     *      NEVER interfere with application execution.
     *
     * Therefore this script DOES NOT replace or modify:
     *
     *      setTimeout
     *      setInterval
     *      requestAnimationFrame
     *      Promise
     *      fetch
     *      XMLHttpRequest
     *      WebSocket
     *      Worker
     *      ServiceWorker
     *      IndexedDB
     *      EventTarget
     *      addEventListener
     *      dispatchEvent
     *      click
     *      submit
     *      forms
     *      history
     *      Element.prototype.animate
     *      attachShadow
     *      framework internals
     *      React
     *      Vue
     *      Angular
     *
     * It also DOES NOT:
     *
     *      remove classes
     *      remove hidden attributes
     *      modify aria state
     *      modify application state
     *      force lazy loading
     *      alter network behavior
     *      alter server requests
     *
     * The entire optimization is deliberately concentrated
     * in CSS and CSS injection.
     *
     * ==========================================================
     */

    const VERSION = '5.0';
    const STYLE_ID = '__DNA_SHIELD_5__';

    /*
     * Preserve compatibility with the original script.
     */
    try {
        window.__DNA_SHIELD__ = true;
        window.__DNA_SHIELD_VERSION__ = VERSION;
        window.__DNA_SHIELD_SAFE__ = true;
        window.seconds = -1;
    } catch (_) {}

    /*
     * ==========================================================
     * MASTER CSS
     * ==========================================================
     *
     * This is the core of DNA Shield.
     *
     * No JavaScript application behavior is changed here.
     *
     * IMPORTANT:
     *
     * 0s is used instead of negative durations.
     * Negative animation/transition durations are not a valid
     * universal way to express zero duration.
     *
     * ==========================================================
     */

    const CSS = `
/* ==========================================================
   DNA SHIELD 5.0
   UNIVERSAL INSTANT VISUAL ENGINE
   ========================================================== */


/*
 * ----------------------------------------------------------
 * GLOBAL TRANSITION ELIMINATION
 * ----------------------------------------------------------
 *
 * !important is intentional.
 *
 * A site's own transition declarations should not be able
 * to reintroduce visual latency.
 */

html *,
html *::before,
html *::after {

    animation-delay: 0s !important;
    animation-duration: 0s !important;
    animation-timing-function: step-end !important;

    -webkit-animation-delay: 0s !important;
    -webkit-animation-duration: 0s !important;
    -webkit-animation-timing-function: step-end !important;

    transition-delay: 0s !important;
    transition-duration: 0s !important;
    transition-timing-function: step-end !important;

    -webkit-transition-delay: 0s !important;
    -webkit-transition-duration: 0s !important;
    -webkit-transition-timing-function: step-end !important;
}


/*
 * ----------------------------------------------------------
 * GLOBAL SCROLL SPEED
 * ----------------------------------------------------------
 *
 * Smooth scrolling is a visual interpolation mechanism.
 *
 * JavaScript scroll functions themselves remain untouched.
 */

html,
body {

    scroll-behavior: auto !important;
}


/*
 * ----------------------------------------------------------
 * COMMON FRAMEWORK TRANSITIONS
 * ----------------------------------------------------------
 *
 * We DO NOT remove these classes.
 *
 * Frameworks can use the classes as state.
 *
 * We only remove their visual duration.
 * ----------------------------------------------------------
 */


/* Vue */
.v-enter-active,
.v-leave-active,
.v-move,
.v-enter,
.v-leave-to,

/* Angular */
.ng-enter,
.ng-leave,
.ng-move,
.ng-enter-active,
.ng-leave-active,
.ng-move-active,

/* React / generic */
.fade,
.fade-in,
.fade-out,
.fadeIn,
.fadeOut,

.slide,
.slide-in,
.slide-out,
.slideIn,
.slideOut,

.zoom,
.zoom-in,
.zoom-out,
.zoomIn,
.zoomOut,

/* Generic router transitions */
.router-transition,
.router-transition-enter,
.router-transition-active,
.router-transition-leave,

/* Common UI transitions */
.modal,
.modal *,
.dialog,
.dialog *,
.drawer,
.drawer *,
.offcanvas,
.offcanvas * {

    animation-delay: 0s !important;
    animation-duration: 0s !important;
    transition-delay: 0s !important;
    transition-duration: 0s !important;
}


/*
 * ----------------------------------------------------------
 * COMMON VISUAL LOADING ANIMATIONS
 * ----------------------------------------------------------
 *
 * This does NOT hide or remove loaders.
 *
 * It merely prevents the loader from animating for seconds.
 */

.spinner,
.spinner *,
.loader-animation,
.loader-animation *,
.loading-animation,
.loading-animation *,
.progress-animation,
.progress-animation * {

    animation-delay: 0s !important;
    animation-duration: 0s !important;
}


/*
 * ----------------------------------------------------------
 * DIALOG / MODAL TRANSITIONS
 * ----------------------------------------------------------
 */

dialog,
[role="dialog"],
[aria-modal="true"] {

    animation-delay: 0s !important;
    animation-duration: 0s !important;

    transition-delay: 0s !important;
    transition-duration: 0s !important;
}


/*
 * ----------------------------------------------------------
 * CARET ANIMATION
 * ----------------------------------------------------------
 *
 * Only affects visual caret behavior.
 */

html * {

    caret-animation: manual !important;
}


/*
 * ----------------------------------------------------------
 * CSS VIEW TRANSITIONS API
 * ----------------------------------------------------------
 *
 * Modern browsers can animate entire document transitions.
 *
 * Disable their visual transition while leaving the API itself
 * untouched.
 */

::view-transition-old(*),
::view-transition-new(*) {

    animation-duration: 0s !important;
    animation-delay: 0s !important;
}


/*
 * ----------------------------------------------------------
 * REDUCED MOTION COMPATIBILITY
 * ----------------------------------------------------------
 */

@media (prefers-reduced-motion: reduce) {

    html *,
    html *::before,
    html *::after {

        animation: none !important;
        transition: none !important;
        scroll-behavior: auto !important;
    }
}


/*
 * ----------------------------------------------------------
 * DOCUMENT VIEW TRANSITION ROOT
 * ----------------------------------------------------------
 */

::view-transition-group(*),
::view-transition-image-pair(*),
::view-transition-old(*),
::view-transition-new(*) {

    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
}

`;

    /*
     * ==========================================================
     * INSTALL CSS
     * ==========================================================
     *
     * No GM_addStyle.
     * No privileged APIs.
     * No grants.
     *
     * ==========================================================
     */

    let installed = false;

    function install() {

        if (installed) {
            return;
        }

        try {

            /*
             * Prevent duplicate installation.
             */
            if (
                document.getElementById(
                    STYLE_ID
                )
            ) {
                installed = true;
                return;
            }

            const style =
                document.createElement(
                    'style'
                );

            style.id =
                STYLE_ID;

            style.type =
                'text/css';

            style.textContent =
                CSS;

            /*
             * At document-start <head> may not exist.
             *
             * The documentElement is already enough for the CSS
             * engine to process the stylesheet.
             */
            const parent =
                document.head ||
                document.documentElement;

            if (!parent) {
                return;
            }

            parent.appendChild(style);

            installed = true;

        } catch (_) {

            /*
             * DNA Shield must fail silently.
             *
             * If anything unexpected occurs, the website must
             * continue executing normally.
             */

        }

    }

    /*
     * ==========================================================
     * FIRST ACTION
     * ==========================================================
     */

    install();

    /*
     * ==========================================================
     * HEAD RECOVERY
     * ==========================================================
     *
     * Some frameworks rebuild <head>.
     *
     * We wait for the DOM to exist, then make sure our stylesheet
     * still exists.
     *
     * We do NOT continuously modify the entire document.
     * ==========================================================
     */

    function recover() {

        try {

            if (
                !document.getElementById(
                    STYLE_ID
                )
            ) {

                installed = false;

                install();
            }

        } catch (_) {}
    }

    /*
     * ==========================================================
     * MINIMAL DOM OBSERVER
     * ==========================================================
     *
     * Important:
     *
     * We observe ONLY childList.
     *
     * We do NOT monitor:
     *
     *      class
     *      style
     *      attributes
     *
     * because React/Vue/Angular can update thousands of those
     * per second. Observing them universally would itself add
     * performance overhead and can create feedback loops.
     *
     * ==========================================================
     */

    function startObserver() {

        if (
            typeof MutationObserver !==
            'function'
        ) {
            return;
        }

        try {

            const observer =
                new MutationObserver(
                    () => {

                        /*
                         * Do not perform a full DOM scan.
                         *
                         * Just make sure DNA's stylesheet still
                         * exists.
                         */
                        recover();

                    }
                );

            observer.observe(
                document.documentElement ||
                document,
                {
                    childList: true,
                    subtree: true
                }
            );

        } catch (_) {}

    }

    /*
     * ==========================================================
     * START OBSERVER AFTER BOOTSTRAP
     * ==========================================================
     *
     * Critical compatibility decision:
     *
     * CSS starts immediately.
     *
     * Observer waits until DOMContentLoaded.
     *
     * Therefore DNA Shield does not compete with application
     * bootstrap work.
     * ==========================================================
     */

    try {

        if (
            document.readyState ===
            'loading'
        ) {

            document.addEventListener(
                'DOMContentLoaded',
                startObserver,
                {
                    once: true,
                    passive: true
                }
            );

        } else {

            startObserver();

        }

    } catch (_) {}

    /*
     * ==========================================================
     * POST-LOAD RECOVERY
     * ==========================================================
     */

    try {

        window.addEventListener(
            'load',
            recover,
            {
                once: true,
                passive: true
            }
        );

    } catch (_) {}

    /*
     * ==========================================================
     * PUBLIC STATE
     * ==========================================================
     */

    try {

        window.DNAShield = {

            version: VERSION,

            enabled: true,

            mode:
                'universal-safe-instant-ui',

            zeroGrant: true,

            applicationSafe: true,

            patchesBrowserAPIs: false,

            patchesTimers: false,

            patchesNetwork: false,

            patchesEvents: false,

            patchesFrameworks: false,

            patchesForms: false

        };

    } catch (_) {}

})();
