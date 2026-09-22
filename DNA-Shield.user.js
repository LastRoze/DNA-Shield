// ==UserScript==
// @name         DNA Shield
// @namespace    DNA Shield
// @version      1.1
// @author       Last Roze
// @description  Dominion With Domination
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

    /* ==========================================================
     * CONFIGURATION
     * ========================================================== */

    var CONFIG = {

        /*
         * Maximum CSS transition duration in ms. Transitions are
         * clamped to at most this long. 10 ms is far below the
         * 0.1 s "near instant" bar while still letting
         * transitionrun/start/end events fire normally, so
         * framework state machines keep working.
         */
        durationMs: 10,

        /* Zero out all animation and transition delays. */
        zeroDelays: true,

        /*
         * CSS animations are NOT clamped by default - clamping
         * animation-duration froze loading spinners after one
         * rotation and made pages look stuck. Instead, finite
         * animations are fast-forwarded through the Web Animations
         * API (finish queue below), which respects iteration counts
         * and fires the correct events. Set clampAnimations to true
         * to additionally force animation-duration in CSS; ambient
         * loops will then stop after one pass, which some people
         * prefer but heavy apps (Gmail, Drive) find stark.
         */
        clampAnimations: false,

        /*
         * With clampAnimations enabled, also force
         * animation-iteration-count to 1 so clamped infinite loops
         * cannot strobe (photosensitivity safety).
         */
        singleIteration: true,

        /* Kill smooth scrolling. */
        instantScroll: true,

        /*
         * Fast-forward finite animations created with
         * element.animate() during sweeps. CSS animations are always
         * accelerated through animationstart events.
         */
        accelerateScriptedAnimations: true,

        /*
         * Navigation acceleration.
         *
         * On Chromium, Speculation Rules prerender/prefetch links on
         * hover (declarative, zero JS cost). Everywhere else, DNA
         * Shield prefetches same-origin links itself after a short
         * hover-intent delay, and on pointerdown with no delay.
         * Cross-origin links only get a preconnect.
         */
        speculationRules: true,
        speculationEagerness: 'moderate',
        prefetch: true,
        prefetchHoverDelayMs: 65,
        maxHintsPerPage: 120,

        /* Preconnect to cross-origin link targets on interaction. */
        preconnect: true,

        /*
         * After load, preconnect to the most-referenced resource
         * origins found in the DOM so lazy loads start instantly.
         */
        preconnectScan: true,
        maxPreconnects: 6,

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

    var OFF_KEY = '__DNA_SHIELD_OFF__';
    var listeners = [];

    /**
     * Check whether the current host is on the disabled list.
     *
     * @returns {boolean} True when DNA Shield must not run here.
     */
    function hostDisabled() {
        try {
            var h = location.hostname;
            for (var i = 0; i < CONFIG.disabledHosts.length; i++) {
                var d = CONFIG.disabledHosts[i];
                if (h === d || h.endsWith('.' + d)) {
                    return true;
                }
            }
        } catch (_) {}
        return false;
    }

    /**
     * Check the per-site localStorage kill switch.
     *
     * @returns {boolean} True when the user disabled DNA Shield here.
     */
    function userDisabled() {
        try {
            return localStorage.getItem(OFF_KEY) === '1';
        } catch (_) {
            return false;
        }
    }

    /**
     * Toggle or set the kill switch, then reload so every module
     * starts from a clean state.
     *
     * @param {boolean} v True to disable DNA Shield on this site.
     * @returns {void}
     */
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

    var ACTIVE = !hostDisabled() && !userDisabled();

    /**
     * Add an event listener that stop() can remove again.
     *
     * @param {EventTarget} target Object to listen on.
     * @param {string} type Event type.
     * @param {Function} fn Handler.
     * @param {Object} [opts] addEventListener options.
     * @returns {void}
     */
    function listen(target, type, fn, opts) {
        try {
            target.addEventListener(type, fn, opts);
            listeners.push([target, type, fn, opts]);
        } catch (_) {}
    }

    /* ==========================================================
     * CSS ACCELERATOR
     * ==========================================================
     *
     * Transitions are clamped in CSS (they are one-shot UI feedback
     * - 0.01 s reads as snappy, and the events still fire). CSS
     * animations are deliberately left alone: clamping their
     * duration froze loading spinners and looked broken. Finite CSS
     * animations are fast-forwarded by the WAAPI finish queue
     * instead, which is iteration-aware. Everything ships as ONE
     * universal rule block to keep style-recalc pressure low.
     * ========================================================== */

    var STYLE_ID = '__DNA_SHIELD__';
    var styleEl = null;
    var styleSheet = null;
    var styleObserver = null;

    /**
     * Build the acceleration stylesheet from the config.
     *
     * @returns {string} CSS text.
     */
    function buildCSS() {
        var css = '';

        if (CONFIG.instantScroll) {
            css += 'html{scroll-behavior:auto !important}';
        }

        var rules = [];

        /*
         * Durations are only forced for a finite numeric config.
         * Anything else (null, undefined) means "leave durations to
         * the site" - never an accidental 0s, which would suppress
         * transition events and hang framework state machines.
         */
        var dur = null;
        if (
            typeof CONFIG.durationMs === 'number' &&
            isFinite(CONFIG.durationMs) &&
            CONFIG.durationMs >= 0
        ) {
            var ms = CONFIG.durationMs;
            if (ms > 1000) {
                ms = 1000;
            }
            dur = (ms / 1000) + 's';
        }

        if (dur !== null) {
            rules.push('transition-duration:' + dur + ' !important');
            if (CONFIG.clampAnimations) {
                rules.push('animation-duration:' + dur + ' !important');
            }
        }

        if (CONFIG.zeroDelays) {
            rules.push('animation-delay:0s !important');
            rules.push('transition-delay:0s !important');
        }

        if (CONFIG.clampAnimations && CONFIG.singleIteration) {
            rules.push('animation-iteration-count:1 !important');
        }

        if (rules.length) {
            css += '*,*::before,*::after{' + rules.join(';') + '}';
        }

        return css;
    }

    /**
     * Install the stylesheet, preferring constructed stylesheets
     * (immune to strict CSP) and falling back to a style element.
     *
     * @returns {void}
     */
    function install() {
        if (!ACTIVE) {
            return;
        }

        var css = buildCSS();
        if (!css) {
            return;
        }

        /* Constructed stylesheet path (Chromium, Safari 16.4+, FF 101+). */
        try {
            if (
                !styleSheet &&
                typeof CSSStyleSheet === 'function' &&
                document.adoptedStyleSheets
            ) {
                styleSheet = new CSSStyleSheet();
                styleSheet.replaceSync(css);
                var sheets = document.adoptedStyleSheets.slice();
                sheets.push(styleSheet);
                document.adoptedStyleSheets = sheets;
            }
            if (styleSheet) {
                return;
            }
        } catch (_) {
            styleSheet = null;
        }

        /* Style element path. */
        try {
            if (styleEl && styleEl.isConnected) {
                return;
            }

            if (!styleEl) {
                styleEl = document.getElementById(STYLE_ID) ||
                    document.createElement('style');
                styleEl.id = STYLE_ID;
                styleEl.textContent = css;
            }

            var parent = document.head || document.documentElement;
            if (parent && !styleEl.isConnected) {
                parent.appendChild(styleEl);
            }
        } catch (_) {}
    }

    /**
     * True when the stylesheet is live in the document.
     *
     * @returns {boolean} Installation state.
     */
    function isInstalled() {
        try {
            if (styleSheet) {
                var sheets = document.adoptedStyleSheets;
                if (sheets && sheets.indexOf(styleSheet) !== -1) {
                    return true;
                }
                return false;
            }
            if (styleEl) {
                return !!styleEl.isConnected;
            }
        } catch (_) {}
        return false;
    }

    /**
     * Observe DOM changes so a page removing the stylesheet gets it
     * reinstalled. Subtree childList is required - removals from
     * <head> are not direct children of <html>.
     *
     * @returns {void}
     */
    function startObserver() {
        if (!ACTIVE || styleObserver || typeof MutationObserver !== 'function') {
            return;
        }

        try {
            styleObserver = new MutationObserver(function () {
                if (!isInstalled()) {
                    install();
                }
            });

            if (document.documentElement) {
                styleObserver.observe(document.documentElement, {
                    childList: true,
                    subtree: true
                });
            }
        } catch (_) {}
    }

    /* ==========================================================
     * ANIMATION FAST-FORWARD (Web Animations API)
     * ==========================================================
     *
     * animationstart handlers never call finish() synchronously.
     * Work is queued and spread across animation frames so page
     * state machines are never re-entered mid-event.
     * ========================================================== */

    var handled = typeof WeakSet === 'function' ? new WeakSet() : null;
    var queued = typeof WeakSet === 'function' ? new WeakSet() : null;
    var finishQueue = [];
    var finishFrame = 0;
    var MAX_FINISHES_PER_FRAME = 16;

    /**
     * True when the animation object is a CSS animation.
     *
     * @param {Animation} anim Candidate animation.
     * @returns {boolean} Detection result.
     */
    function isCSSAnimation(anim) {
        try {
            return !!anim && typeof anim.animationName === 'string';
        } catch (_) {
            return false;
        }
    }

    /**
     * True when the animation object is a CSS transition.
     *
     * @param {Animation} anim Candidate animation.
     * @returns {boolean} Detection result.
     */
    function isTransition(anim) {
        try {
            return !!anim && typeof anim.transitionProperty === 'string';
        } catch (_) {
            return false;
        }
    }

    /**
     * Queue an animation for finishing on the next animation frame.
     *
     * @param {Animation} anim Animation to fast-forward.
     * @returns {void}
     */
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

            if (!finishFrame && typeof requestAnimationFrame === 'function') {
                finishFrame = requestAnimationFrame(flushFinishQueue);
            }
        } catch (_) {}
    }

    /**
     * Finish queued animations, limited per frame to keep the main
     * thread responsive under animation bursts.
     *
     * @returns {void}
     */
    function flushFinishQueue() {
        finishFrame = 0;

        if (!ACTIVE) {
            finishQueue.length = 0;
            return;
        }

        var processed = 0;

        while (finishQueue.length && processed < MAX_FINISHES_PER_FRAME) {
            var anim = finishQueue.shift();

            try {
                if (queued) {
                    queued.delete(anim);
                }
            } catch (_) {}

            try {
                /* Re-read state: the page may have cancelled/paused it. */
                if (!anim || anim.playState !== 'running') {
                    continue;
                }

                var timing = null;
                if (
                    anim.effect &&
                    typeof anim.effect.getComputedTiming === 'function'
                ) {
                    timing = anim.effect.getComputedTiming();
                }
                if (!timing) {
                    continue;
                }

                var endTime = Number(timing.endTime);
                var activeDuration = Number(timing.activeDuration);
                var infinite =
                    timing.iterations === Infinity ||
                    !isFinite(endTime) ||
                    !isFinite(activeDuration);

                /* Infinite animations are left to CSS clamping. */
                if (infinite || endTime <= 0) {
                    continue;
                }

                anim.finish();
                processed++;
            } catch (_) {}
        }

        if (finishQueue.length && typeof requestAnimationFrame === 'function') {
            finishFrame = requestAnimationFrame(flushFinishQueue);
        }
    }

    /**
     * Decide what to do with one animation: skip transitions and
     * infinite ones, queue finite ones.
     *
     * @param {Animation} anim Animation to consider.
     * @param {boolean} allowScripted True to also accelerate
     *        script-created (element.animate) animations.
     * @returns {void}
     */
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
                return;
            }

            if (!isCSSAnimation(anim) && !CONFIG.accelerateScriptedAnimations) {
                return;
            }
            if (!isCSSAnimation(anim) && !allowScripted) {
                return;
            }

            var timing = null;
            if (
                anim.effect &&
                typeof anim.effect.getComputedTiming === 'function'
            ) {
                timing = anim.effect.getComputedTiming();
            }
            if (!timing) {
                return;
            }

            var endTime = Number(timing.endTime);
            var infinite =
                timing.iterations === Infinity ||
                !isFinite(endTime) ||
                !isFinite(Number(timing.activeDuration));

            if (infinite || endTime <= 0) {
                return;
            }

            if (anim.playState !== 'running') {
                return;
            }

            scheduleFinish(anim);
        } catch (_) {}
    }

    /**
     * Accelerate every animation on one element, optionally only the
     * one matching a CSS animation name.
     *
     * @param {Element} target Element holding animations.
     * @param {string} [animationName] Filter by animation name.
     * @param {boolean} [allowScripted] Include scripted animations.
     * @returns {void}
     */
    function accelerateTarget(target, animationName, allowScripted) {
        if (!target || typeof target.getAnimations !== 'function') {
            return;
        }

        var list;
        try {
            list = target.getAnimations();
        } catch (_) {
            return;
        }

        for (var i = 0; i < list.length; i++) {
            var anim = list[i];
            try {
                if (
                    animationName &&
                    isCSSAnimation(anim) &&
                    anim.animationName !== animationName
                ) {
                    continue;
                }
            } catch (_) {}
            accelerate(anim, allowScripted);
        }
    }

    /**
     * animationstart handler: fast-forward the starting CSS animation.
     *
     * @param {AnimationEvent} e Event with target and animationName.
     * @returns {void}
     */
    function onAnimationStart(e) {
        if (!e || !e.target) {
            return;
        }
        accelerateTarget(e.target, e.animationName || '', false);
    }

    /**
     * Sweep the whole document and queue every finite animation.
     * Catches scripted (element.animate) animations and anything that
     * started before the listeners were attached.
     *
     * @returns {void}
     */
    function sweep() {
        if (!ACTIVE) {
            return;
        }

        try {
            if (typeof document.getAnimations !== 'function') {
                return;
            }
            var list = document.getAnimations();
            for (var i = 0; i < list.length; i++) {
                accelerate(list[i], true);
            }
        } catch (_) {}
    }

    /* ==========================================================
     * NAVIGATION ACCELERATOR
     * ==========================================================
     *
     * Chromium: inject Speculation Rules (prerender + prefetch on
     * hover, managed entirely by the browser). Other engines: manual
     * same-origin prefetch on hover/pointerdown, preconnect for
     * cross-origin links.
     * ========================================================== */

    var RULES_ID = '__DNA_SHIELD_RULES__';
    var hinted = typeof Set === 'function' ? new Set() : [];
    var hintCount = 0;
    var pendingTimer = 0;
    var pendingHref = '';

    /*
     * Trusted Types: sites like Gmail enforce
     * require-trusted-types-for 'script', so script text must come
     * from a policy - and those sites usually allow only their own
     * policy names. If policy creation is blocked, injecting the
     * rules would spam CSP violations for zero benefit, so DNA
     * Shield skips script injection there entirely.
     */
    var ttPolicy = null;
    var ttUnavailable = false;

    /**
     * Return a Trusted Types policy for script text, or null when
     * injection must be skipped.
     *
     * @returns {?Object} Policy wrapper or null.
     */
    function scriptPolicy() {
        if (ttPolicy) {
            return ttPolicy;
        }
        if (ttUnavailable) {
            return null;
        }

        try {
            var tt = window.trustedTypes;
            if (tt && typeof tt.createPolicy === 'function') {
                ttPolicy = tt.createPolicy('__dna_shield__', {
                    createScript: function (s) { return s; }
                });
                return ttPolicy;
            }
            /* No Trusted Types API at all: plain assignment is fine. */
            return null;
        } catch (_) {
            ttUnavailable = true;
            return null;
        }
    }

    /**
     * True when the Speculation Rules API is available.
     *
     * @returns {boolean} API support.
     */
    function supportsSpeculation() {
        try {
            return (
                typeof HTMLScriptElement === 'function' &&
                typeof HTMLScriptElement.supports === 'function' &&
                HTMLScriptElement.supports('speculationrules')
            );
        } catch (_) {
            return false;
        }
    }

    /**
     * Inject declarative prerender/prefetch document rules. Ignored
     * by browsers without support, so it is safe everywhere.
     *
     * @returns {void}
     */
    function injectSpeculationRules() {
        if (!ACTIVE || !CONFIG.speculationRules || !supportsSpeculation()) {
            return;
        }

        try {
            if (document.getElementById(RULES_ID)) {
                return;
            }

            var EXCLUDE = '[download], [rel~="nofollow"], [rel~="noprefetch"], ' +
                '[href*="logout"], [href*="signout"], [href*="logoff"]';

            var rules = {
                prefetch: [{
                    source: 'document',
                    where: {
                        and: [{
                            href_matches: '/*'
                        }, {
                            not: { selector_matches: EXCLUDE }
                        }]
                    },
                    eagerness: CONFIG.speculationEagerness
                }],
                prerender: [{
                    source: 'document',
                    where: {
                        and: [{
                            href_matches: '/*'
                        }, {
                            not: { selector_matches: EXCLUDE }
                        }]
                    },
                    eagerness: CONFIG.speculationEagerness
                }]
            };

            var script = document.createElement('script');
            script.id = RULES_ID;
            script.type = 'application/speculationrules';

            var json = JSON.stringify(rules);
            var policy = scriptPolicy();
            if (policy) {
                script.text = policy.createScript(json);
            } else if (ttUnavailable) {
                /* Trusted Types enforcement without an allowed policy:
                   skip instead of spamming CSP violations. */
                return;
            } else {
                script.textContent = json;
            }

            var parent = document.head || document.documentElement;
            if (parent) {
                parent.appendChild(script);
            }
        } catch (_) {}
    }

    /**
     * True when the visitor is on a constrained connection and
     * prefetching would cost more than it saves.
     *
     * @returns {boolean} True to skip prefetching.
     */
    function connectionConstrained() {
        try {
            var c = navigator.connection;
            if (!c) {
                return false;
            }
            if (c.saveData) {
                return true;
            }
            var t = String(c.effectiveType || '');
            return t === 'slow-2g' || t === '2g';
        } catch (_) {
            return false;
        }
    }

    /**
     * Mark a URL as already hinted.
     *
     * @param {string} key Dedupe key.
     * @returns {void}
     */
    function markHinted(key) {
        hintCount++;
        if (hinted.add) {
            hinted.add(key);
        } else {
            hinted.push(key);
        }
    }

    /**
     * True when this URL was already hinted.
     *
     * @param {string} key Dedupe key.
     * @returns {boolean} Seen before.
     */
    function isHinted(key) {
        if (hinted.indexOf) {
            return hinted.indexOf(key) !== -1;
        }
        return hinted.has(key);
    }

    /**
     * Append a <link> hint to the document.
     *
     * @param {string} rel Link relation (prefetch/preconnect).
     * @param {string} href Target URL or origin.
     * @returns {void}
     */
    function appendHint(rel, href) {
        try {
            var link = document.createElement('link');
            link.rel = rel;
            link.href = href;
            var parent = document.head || document.documentElement;
            if (parent) {
                parent.appendChild(link);
            }
        } catch (_) {}
    }

    /**
     * Large media downloads never belong in a hover prefetch.
     *
     * @param {URL} url Parsed target.
     * @returns {boolean} True when the path looks like heavy media.
     */
    function isHeavyMedia(url) {
        return /\.(zip|rar|7z|tar|gz|tgz|bz2|xz|dmg|exe|msi|apk|iso|img|mp4|mkv|avi|mov|webm|mp3|flac|ogg|wav|pdf|epub)([?#]|$)/i.test(url.pathname);
    }

    /**
     * Validate an anchor and return what kind of hint it deserves.
     *
     * @param {HTMLAnchorElement} a Anchor being hovered/pressed.
     * @returns {{kind: string, url: URL}|null} Hint plan or null.
     */
    function planHint(a) {
        if (!a || !a.href || a.hasAttribute('download')) {
            return null;
        }

        var rel = ' ' + String(a.rel || '') + ' ';
        if (rel.indexOf(' nofollow ') !== -1 || rel.indexOf(' noprefetch ') !== -1) {
            return null;
        }

        var url;
        try {
            url = new URL(a.href, location.href);
        } catch (_) {
            return null;
        }

        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return null;
        }

        /*
         * State-changing GET links (logout endpoints) must never be
         * prefetched or prerendered - fetching them would act.
         */
        if (/logout|signout|sign-out|logoff|log-off|log_out/i.test(
            url.pathname + url.search
        )) {
            return null;
        }

        /* Same page (only a hash difference) is already instant. */
        if (
            url.pathname === location.pathname &&
            url.search === location.search
        ) {
            return null;
        }

        var sameOrigin = url.origin === location.origin;
        if (!sameOrigin && !CONFIG.preconnect) {
            return null;
        }

        if (sameOrigin) {
            if (!CONFIG.prefetch || isHeavyMedia(url)) {
                return null;
            }
            return { kind: 'prefetch', url: url };
        }

        return { kind: 'preconnect', url: url };
    }

    /**
     * Run a hint plan immediately: dedupe, cap, append the link.
     *
     * @param {{kind: string, url: URL}} plan Hint plan.
     * @returns {void}
     */
    function applyHint(plan) {
        try {
            var key = plan.kind === 'preconnect'
                ? plan.url.origin
                : plan.url.href;

            if (isHinted(key)) {
                return;
            }
            if (hintCount >= CONFIG.maxHintsPerPage) {
                return;
            }

            markHinted(key);
            appendHint(
                plan.kind,
                plan.kind === 'preconnect' ? plan.url.origin : plan.url.href
            );
        } catch (_) {}
    }

    /**
     * pointerover handler: remember the link, start the hover-intent
     * timer. Mobile taps skip this path via pointerdown.
     *
     * @param {PointerEvent} e Pointer event.
     * @returns {void}
     */
    function onPointerOver(e) {
        if (!ACTIVE || !CONFIG.prefetch || connectionConstrained()) {
            return;
        }

        var a = null;
        try {
            a = e.target && typeof e.target.closest === 'function'
                ? e.target.closest('a[href]')
                : null;
        } catch (_) {}

        var plan = planHint(a);
        if (!plan) {
            return;
        }

        var key = plan.kind === 'preconnect' ? plan.url.origin : plan.url.href;
        if (isHinted(key)) {
            return;
        }

        if (pendingHref === key) {
            return;
        }
        cancelPending();

        pendingHref = key;
        pendingTimer = setTimeout(function () {
            pendingTimer = 0;
            pendingHref = '';
            /* Re-plan at fire time: the DOM may have changed. */
            var later = planHint(a);
            if (later) {
                applyHint(later);
            }
        }, Math.max(0, Number(CONFIG.prefetchHoverDelayMs) || 0));
    }

    /**
     * pointerout handler: the pointer left the link, cancel the
     * intent timer. Movement between children of the same link also
     * fires pointerout - keep the timer when the pointer is still
     * inside an anchor.
     *
     * @param {PointerEvent} e Pointer event.
     * @returns {void}
     */
    function onPointerOut(e) {
        try {
            var to = e && e.relatedTarget;
            if (
                to &&
                typeof to.closest === 'function' &&
                to.closest('a[href]')
            ) {
                return;
            }
        } catch (_) {}
        cancelPending();
    }

    /**
     * Cancel a pending hover-intent timer.
     *
     * @returns {void}
     */
    function cancelPending() {
        if (pendingTimer) {
            clearTimeout(pendingTimer);
            pendingTimer = 0;
        }
        pendingHref = '';
    }

    /**
     * pointerdown handler: no delay on touch/press - the click fires
     * roughly 100 ms later, so prefetch right now.
     *
     * @param {PointerEvent} e Pointer event.
     * @returns {void}
     */
    function onPointerDown(e) {
        if (!ACTIVE || !CONFIG.prefetch || connectionConstrained()) {
            return;
        }

        var a = null;
        try {
            a = e.target && typeof e.target.closest === 'function'
                ? e.target.closest('a[href]')
                : null;
        } catch (_) {}

        var plan = planHint(a);
        if (plan) {
            cancelPending();
            applyHint(plan);
        }
    }

    /**
     * Scan the DOM after load and preconnect to the most referenced
     * resource origins so lazy-loaded assets start instantly.
     *
     * @returns {void}
     */
    function scanOrigins() {
        if (!ACTIVE || !CONFIG.preconnectScan) {
            return;
        }

        try {
            var nodes = document.querySelectorAll(
                'a[href], img[src], script[src], link[href]'
            );
            var counts = {};
            var order = [];

            for (var i = 0; i < nodes.length; i++) {
                var raw = nodes[i].getAttribute('href') ||
                    nodes[i].getAttribute('src');
                if (!raw) {
                    continue;
                }

                var url;
                try {
                    url = new URL(raw, location.href);
                } catch (_) {
                    continue;
                }

                if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                    continue;
                }
                if (url.origin === location.origin) {
                    continue;
                }
                if (isHinted(url.origin)) {
                    continue;
                }

                var key = url.origin;
                if (!counts[key]) {
                    counts[key] = 0;
                    order.push(key);
                }
                counts[key]++;
            }

            order.sort(function (a, b) {
                return counts[b] - counts[a];
            });

            var added = 0;
            for (var j = 0; j < order.length && added < CONFIG.maxPreconnects; j++) {
                if (hintCount >= CONFIG.maxHintsPerPage) {
                    break;
                }
                markHinted(order[j]);
                appendHint('preconnect', order[j]);
                added++;
            }
        } catch (_) {}
    }

    /**
     * Public manual prefetch for one URL.
     *
     * @param {string} href Absolute or relative URL.
     * @returns {void}
     */
    function prefetch(href) {
        try {
            var url = new URL(href, location.href);
            if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                return;
            }
            applyHint({ kind: 'prefetch', url: url });
        } catch (_) {}
    }

    /**
     * focusin handler: keyboard users tab to a link - warm it too.
     *
     * @param {FocusEvent} e Focus event.
     * @returns {void}
     */
    function onFocusIn(e) {
        if (!ACTIVE || !CONFIG.prefetch || connectionConstrained()) {
            return;
        }

        try {
            var t = e.target;
            var a = t && typeof t.matches === 'function' && t.matches('a[href]')
                ? t
                : (typeof t.closest === 'function' ? t.closest('a[href]') : null);
            var plan = planHint(a);
            if (plan) {
                cancelPending();
                applyHint(plan);
            }
        } catch (_) {}
    }

    /**
     * pageshow handler: a back/forward-cache restore replays running
     * animations with the stylesheet possibly gone - reinstall and
     * re-sweep so restored pages are instant too.
     *
     * @param {PageTransitionEvent} e Pageshow event.
     * @returns {void}
     */
    function onPageShow(e) {
        if (!ACTIVE) {
            return;
        }
        try {
            if (e && e.persisted) {
                install();
                injectSpeculationRules();
                sweep();
            }
        } catch (_) {}
    }

    /* ==========================================================
     * WIRING
     * ========================================================== */

    /**
     * Remove the stylesheet hint script and every listener, and
     * disconnect observers. Used by the public API.
     *
     * @returns {void}
     */
    function stop() {
        cancelPending();

        try {
            if (styleObserver) {
                styleObserver.disconnect();
                styleObserver = null;
            }
        } catch (_) {}

        try {
            if (styleEl && styleEl.isConnected) {
                styleEl.parentNode.removeChild(styleEl);
            }
            if (styleSheet) {
                var sheets = document.adoptedStyleSheets;
                if (sheets) {
                    var idx = sheets.indexOf(styleSheet);
                    if (idx !== -1) {
                        sheets.splice(idx, 1);
                        document.adoptedStyleSheets = sheets;
                    }
                }
            }
        } catch (_) {}

        for (var i = 0; i < listeners.length; i++) {
            try {
                listeners[i][0].removeEventListener(
                    listeners[i][1],
                    listeners[i][2],
                    listeners[i][3]
                );
            } catch (_) {}
        }
        listeners.length = 0;
        finishQueue.length = 0;

        try {
            var rules = document.getElementById(RULES_ID);
            if (rules && rules.parentNode) {
                rules.parentNode.removeChild(rules);
            }
        } catch (_) {}
    }

    /**
     * DOMContentLoaded work: late installs and the first sweep.
     *
     * @returns {void}
     */
    function onReady() {
        install();
        injectSpeculationRules();
        startObserver();
        sweep();
    }

    if (ACTIVE) {
        install();
        injectSpeculationRules();

        listen(document, 'animationstart', onAnimationStart, {
            capture: true, passive: true
        });

        /*
         * Pointer Events are the primary input path. Browsers old
         * enough to lack them get the classic mouse events instead,
         * so prefetching works everywhere Tampermonkey runs.
         */
        var pointerType =
            typeof window.PointerEvent === 'function' ? 'pointer' : 'mouse';
        listen(document, pointerType + 'over', onPointerOver, {
            capture: true, passive: true
        });
        listen(document, pointerType + 'out', onPointerOut, {
            capture: true, passive: true
        });
        listen(document, pointerType + 'down', onPointerDown, {
            capture: true, passive: true
        });

        /* Keyboard focus warms links too. */
        listen(document, 'focusin', onFocusIn, {
            capture: true, passive: true
        });

        /* Back/forward-cache restores. */
        listen(window, 'pageshow', onPageShow, { passive: true });

        try {
            if (document.readyState === 'loading') {
                listen(document, 'DOMContentLoaded', onReady, { once: true });
            } else {
                onReady();
            }
        } catch (_) {}

        listen(window, 'load', function () {
            install();
            sweep();
            setTimeout(scanOrigins, 1500);
        }, { once: true });
    }

    /* Hotkey: Ctrl + Alt + Shift + D toggles DNA Shield on this site. */
    listen(window, 'keydown', function (e) {
        try {
            if (
                e.ctrlKey &&
                e.altKey &&
                e.shiftKey &&
                (e.key === 'D' || e.key === 'd')
            ) {
                setDisabled(ACTIVE);
            }
        } catch (_) {}
    }, { capture: true, passive: true });

    /* ==========================================================
     * PUBLIC API
     * ========================================================== */

        try {
            window.DNAShield = {
                enabled: ACTIVE,
                mode: 'waapi-finish + transition-clamp + prerender/prefetch',

            /* What DNA Shield does NOT touch. */
            patchesNativeAPIs: false,
            patchesTimers: false,
            patchesNetwork: false,
            patchesEvents: false,
            patchesFrameworks: false,

            config: CONFIG,

            /* Fast-forward every finite animation right now. */
            sweep: sweep,

            /* Manually prefetch one URL. */
            prefetch: prefetch,

            /* Tear everything down on this page. */
            stop: stop,

            disableHere: function () {
                setDisabled(true);
            },

            enableHere: function () {
                setDisabled(false);
            }
        };
    } catch (_) {}

})();
