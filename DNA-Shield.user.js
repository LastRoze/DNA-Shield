// ==UserScript==
// @name                DNA Shield
// @namespace           DNA Shield
// @version             1.7
// @author              Last Roze
// @description         Dominion With Domination
// @copyright           ©2021 - 2025 // Yoga Budiman
// @homepage            https://github.com/LastRoze/
// @homepageURL         https://github.com/LastRoze/
// @website             https://lastroze.github.io/
// @source              https://github.com/LastRoze/DNA-Shield
// @icon                https://github.com/LastRoze/DNA-Shield/blob/master/DNA.jpg?raw=true
// @iconURL             https://github.com/LastRoze/DNA-Shield/blob/master/DNA.jpg?raw=true
// @defaulticon         https://github.com/LastRoze/DNA-Shield/blob/master/DNA.jpg?raw=true
// @icon64              https://github.com/LastRoze/DNA-Shield/blob/master/DNA.jpg?raw=true
// @icon64URL           https://github.com/LastRoze/DNA-Shield/blob/master/DNA.jpg?raw=true
// @updateURL           https://github.com/LastRoze/DNA-Shield/raw/master/DNA-Shield.meta.js
// @downloadURL         https://github.com/LastRoze/DNA-Shield/raw/master/DNA-Shield.user.js
// @supportURL          https://lastroze.github.io/
// @match               *://*/*
// @connect             *
// @run-at              document-start
// @grant               none
// ==/UserScript==

(function dnaShieldUniversal() {
  "use strict";

  const LAZY_TAGS = new Set(["IMG", "IFRAME"]);
  const PRIORITY_COMPAT_ATTRIBUTE = "importance";
  const IDLE = window.requestIdleCallback || function fallbackIdle(fn) {
    return window.setTimeout(() => fn({ didTimeout: false, timeRemaining: () => 50 }), 1);
  };
  const CANCEL_IDLE = window.cancelIdleCallback || function fallbackCancel(id) {
    window.clearTimeout(id);
  };
  const RAF = window.requestAnimationFrame || function fallbackFrame(fn) {
    return window.setTimeout(() => fn(Date.now()), 16);
  };
  const KEEPALIVE_INTERVAL_ACTIVE = 35000;
  const KEEPALIVE_INTERVAL_BACKGROUND = 75000;
  const MOTION_STYLE_ID = "dna-shield-motion";
  const MAX_TRANSITION_DURATION = 140;
  const MAX_ANIMATION_DURATION = 180;
  const MAX_MOTION_DELAY = 0;
  const GLOBAL_MOTION_DELAY = 0;
  const MOTION_TIMING_FUNCTION = "linear";
  const MOTION_OPT_OUT_ATTRIBUTE = "DNA-Shield";
  const ROOT_STYLE_OVERRIDES = [
    ["scroll-behavior", "auto"],
    ["animation-duration", `${MAX_ANIMATION_DURATION}ms`],
    ["-webkit-animation-duration", `${MAX_ANIMATION_DURATION}ms`],
    ["animation-delay", `${GLOBAL_MOTION_DELAY}ms`],
    ["-webkit-animation-delay", `${GLOBAL_MOTION_DELAY}ms`],
    ["animation-timing-function", MOTION_TIMING_FUNCTION],
    ["-webkit-animation-timing-function", MOTION_TIMING_FUNCTION],
    ["transition-duration", `${MAX_TRANSITION_DURATION}ms`],
    ["-webkit-transition-duration", `${MAX_TRANSITION_DURATION}ms`],
    ["transition-delay", `${GLOBAL_MOTION_DELAY}ms`],
    ["-webkit-transition-delay", `${GLOBAL_MOTION_DELAY}ms`],
    ["transition-timing-function", MOTION_TIMING_FUNCTION],
    ["-webkit-transition-timing-function", MOTION_TIMING_FUNCTION],
  ];

  let scheduledScanToken = null;
  let keepAliveTimer = 0;
  let navigationHooksInstalled = false;
  let keepAliveInFlight = false;
  const pendingLazyEvaluations = new WeakSet();
  const lazyEvaluationAttempts = new WeakMap();
  const managedLazyAttributes = new WeakSet();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
  } else {
    bootstrap();
  }

  function bootstrap() {
    installMotionDampener();
    enforceRootStyles();
    accelerateDocumentVisibility();
    disableJQueryAnimations();
    accelerateWebAnimations();
    optimizeSubtree(document.documentElement);
    observeMutations();
    observeNavigation();
    setupKeepAlive();
    IDLE(() => scanForLateResources());
    window.addEventListener("load", scheduleScan, { once: true });
  }

  function observeMutations() {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          for (const node of mutation.addedNodes) {
            optimizeNode(node);
          }
        } else if (mutation.type === "attributes") {
          optimizeElement(mutation.target);
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src", "data-src", "loading", "preload", "poster"],
    });
  }

  function scanForLateResources() {
    const selector = "img, iframe, video, audio";
    const elements = document.querySelectorAll(selector);
    for (const el of elements) {
      optimizeElement(el);
    }
  }

  function scheduleScan() {
    if (scheduledScanToken !== null) {
      CANCEL_IDLE(scheduledScanToken);
    }
    scheduledScanToken = IDLE(() => {
      scheduledScanToken = null;
      scanForLateResources();
    });
  }

  function optimizeSubtree(root) {
    if (!root || root.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    optimizeElement(root);
    const selector = "img, iframe, video, audio";
    const descendants = root.querySelectorAll(selector);
    for (const el of descendants) {
      optimizeElement(el);
    }
  }

  function optimizeNode(node) {
    if (!node) return;
    if (node.nodeType === Node.ELEMENT_NODE) {
      optimizeSubtree(node);
    }
  }

  function optimizeElement(el) {
    switch (el.tagName) {
      case "IMG":
        tuneImage(el);
        break;
      case "IFRAME":
        tuneIframe(el);
        break;
      case "VIDEO":
        tuneVideo(el);
        break;
      case "AUDIO":
        tuneAudio(el);
        break;
      default:
        break;
    }
  }

  function installMotionDampener() {
    if (document.getElementById(MOTION_STYLE_ID)) {
      return;
    }
    const style = document.createElement("style");
    style.id = MOTION_STYLE_ID;
    const animationDuration = formatTime(MAX_ANIMATION_DURATION);
    const transitionDuration = formatTime(MAX_TRANSITION_DURATION);
    const motionDelay = formatTime(GLOBAL_MOTION_DELAY);
    const optOutSelector = `[${MOTION_OPT_OUT_ATTRIBUTE}]`;
    style.textContent = `
      :root {
        scroll-behavior: auto !important;
      }

      :root :where(*:not(${optOutSelector})),
      :root :where(*:not(${optOutSelector}))::before,
      :root :where(*:not(${optOutSelector}))::after {
        animation-duration: ${animationDuration} !important;
        -webkit-animation-duration: ${animationDuration} !important;
        animation-delay: ${motionDelay} !important;
        -webkit-animation-delay: ${motionDelay} !important;
        animation-timing-function: ${MOTION_TIMING_FUNCTION} !important;
        -webkit-animation-timing-function: ${MOTION_TIMING_FUNCTION} !important;
        transition-duration: ${transitionDuration} !important;
        -webkit-transition-duration: ${transitionDuration} !important;
        transition-delay: ${motionDelay} !important;
        -webkit-transition-delay: ${motionDelay} !important;
        transition-timing-function: ${MOTION_TIMING_FUNCTION} !important;
        -webkit-transition-timing-function: ${MOTION_TIMING_FUNCTION} !important;
        scroll-behavior: auto !important;
      }

      ${optOutSelector},
      ${optOutSelector}::before,
      ${optOutSelector}::after,
      ${optOutSelector} :where(*),
      ${optOutSelector} :where(*)::before,
      ${optOutSelector} :where(*)::after {
        animation-duration: revert !important;
        -webkit-animation-duration: revert !important;
        animation-delay: revert !important;
        -webkit-animation-delay: revert !important;
        animation-timing-function: revert !important;
        -webkit-animation-timing-function: revert !important;
        transition-duration: revert !important;
        -webkit-transition-duration: revert !important;
        transition-delay: revert !important;
        -webkit-transition-delay: revert !important;
        transition-timing-function: revert !important;
        -webkit-transition-timing-function: revert !important;
      }
    `;
    (document.head || document.documentElement).appendChild(style);

    document.addEventListener("animationstart", handleAnimationStart, true);
    document.addEventListener("transitionrun", handleTransitionRun, true);
  }

  function disableJQueryAnimations() {
    const MAX_ATTEMPTS = 8;
    let attempts = 0;

    const attemptDisable = () => {
      const jq = resolveJQuery();
      if (jq && jq.fx) {
        try {
          jq.fx.off = true;
        } catch (error) {
          // Silently ignore errors from locked down environments.
        }
        return;
      }

      if (attempts < MAX_ATTEMPTS) {
        attempts += 1;
        IDLE(attemptDisable);
      }
    };

    attemptDisable();
  }

  function resolveJQuery() {
    if (typeof window === "undefined") {
      return null;
    }

    if (window.jQuery && typeof window.jQuery === "function") {
      return window.jQuery;
    }

    if (typeof window.wrappedJSObject !== "undefined" && window.wrappedJSObject && window.wrappedJSObject.jQuery) {
      return window.wrappedJSObject.jQuery;
    }

    return null;
  }

  function enforceRootStyles() {
    const root = document.documentElement;
    if (!root) {
      return;
    }

    applyRootStyles(root);

    if (typeof MutationObserver !== "function") {
      return;
    }

    const observer = new MutationObserver(() => {
      applyRootStyles(root);
    });

    observer.observe(root, { attributes: true, attributeFilter: ["style"] });
  }

  function applyRootStyles(root) {
    if (!root || !root.style) {
      return;
    }

    for (const [property, value] of ROOT_STYLE_OVERRIDES) {
      try {
        const currentValue = root.style.getPropertyValue(property);
        const currentPriority = root.style.getPropertyPriority(property);
        if (currentValue !== value || currentPriority !== "important") {
          root.style.setProperty(property, value, "important");
        }
      } catch (error) {
        // Silently ignore style access issues.
      }
    }
  }

  function accelerateDocumentVisibility() {
    const root = document.documentElement;
    if (!root) {
      return;
    }

    neutralizeAsyncHide(root);
    if (document.body) {
      neutralizeAsyncHide(document.body);
    }

    try {
      const hiddenNodes = root.querySelectorAll(".async-hide");
      for (const node of hiddenNodes) {
        neutralizeAsyncHide(node);
      }
    } catch (error) {
      // Ignore selector errors in restricted environments.
    }

    if (typeof MutationObserver !== "function") {
      return;
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          neutralizeAsyncHide(mutation.target);
        } else if (mutation.type === "childList") {
          for (const added of mutation.addedNodes) {
            if (!added || added.nodeType !== Node.ELEMENT_NODE) {
              continue;
            }

            neutralizeAsyncHide(added);

            if (typeof added.querySelectorAll === "function") {
              try {
                const descendants = added.querySelectorAll(".async-hide");
                for (const descendant of descendants) {
                  neutralizeAsyncHide(descendant);
                }
              } catch (error) {
                // Continue even if the selector fails.
              }
            }
          }
        }
      }
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  function neutralizeAsyncHide(target) {
    if (!target) {
      return;
    }

    let removed = false;

    if (target.classList && target.classList.contains("async-hide")) {
      try {
        target.classList.remove("async-hide");
        removed = true;
      } catch (error) {
        // Ignore failures when classList is read-only.
      }
    }

    if (typeof target.hasAttribute === "function" && target.hasAttribute("data-async-hide")) {
      try {
        target.removeAttribute("data-async-hide");
        removed = true;
      } catch (error) {
        // Ignore attribute removal errors.
      }
    }

    if (removed && target.style) {
      tryRemoveAsyncHideStyles(target);
    }
  }

  function tryRemoveAsyncHideStyles(target) {
    try {
      if (
        target.style.getPropertyPriority("opacity") === "important" &&
        target.style.getPropertyValue("opacity") === "0"
      ) {
        target.style.removeProperty("opacity");
      }
    } catch (error) {
      // Ignore style access errors for opacity.
    }

    try {
      if (
        target.style.getPropertyPriority("visibility") === "important" &&
        target.style.getPropertyValue("visibility") === "hidden"
      ) {
        target.style.removeProperty("visibility");
      }
    } catch (error) {
      // Ignore style access errors for visibility.
    }
  }

  function accelerateWebAnimations() {
    if (typeof Element === "undefined") {
      return;
    }

    const proto = Element.prototype;
    if (!proto || typeof proto.animate !== "function") {
      return;
    }

    if (proto.animate && proto.animate.__dnaShieldPatched) {
      return;
    }

    const originalAnimate = proto.animate;

    const patchedAnimate = function patchedAnimate(keyframes, options) {
      const normalizedOptions = normalizeAnimationOptions(options);
      const animation = originalAnimate.apply(this, [keyframes, normalizedOptions]);
      tightenAnimationTiming(animation);
      return animation;
    };

    patchedAnimate.__dnaShieldPatched = true;

    try {
      Object.defineProperty(proto, "animate", {
        value: patchedAnimate,
        writable: true,
        configurable: true,
      });
    } catch (error) {
      try {
        proto.animate = patchedAnimate;
      } catch (assignmentError) {
        // Ignore assignment failures silently.
      }
    }
  }

  function normalizeAnimationOptions(input) {
    if (typeof input === "number") {
      return Math.min(input, MAX_ANIMATION_DURATION);
    }

    if (!input || typeof input !== "object") {
      return input;
    }

    if (
      typeof window !== "undefined" &&
      typeof window.KeyframeEffect === "function" &&
      input instanceof window.KeyframeEffect
    ) {
      tightenKeyframeTiming(input);
      return input;
    }

    const clone = Array.isArray(input) ? input.slice() : { ...input };

    if ("duration" in clone && Number.isFinite(clone.duration) && clone.duration > MAX_ANIMATION_DURATION) {
      clone.duration = MAX_ANIMATION_DURATION;
    }

    if ("delay" in clone && Number.isFinite(clone.delay) && clone.delay > MAX_MOTION_DELAY) {
      clone.delay = MAX_MOTION_DELAY;
    }

    if ("endDelay" in clone && Number.isFinite(clone.endDelay) && clone.endDelay > MAX_MOTION_DELAY) {
      clone.endDelay = MAX_MOTION_DELAY;
    }

    return clone;
  }

  function tightenAnimationTiming(animation) {
    if (!animation || typeof animation !== "object") {
      return;
    }

    const effect = animation.effect;
    if (!effect || typeof effect.getTiming !== "function" || typeof effect.updateTiming !== "function") {
      return;
    }

    let timing;
    try {
      timing = effect.getTiming();
    } catch (error) {
      return;
    }

    if (!timing || typeof timing !== "object") {
      return;
    }

    const nextTiming = { ...timing };
    let changed = false;

    if (
      Number.isFinite(nextTiming.duration) &&
      nextTiming.duration > MAX_ANIMATION_DURATION &&
      (!Number.isFinite(nextTiming.iterations) || nextTiming.iterations <= 1)
    ) {
      nextTiming.duration = MAX_ANIMATION_DURATION;
      changed = true;
    }

    if (Number.isFinite(nextTiming.delay) && nextTiming.delay > MAX_MOTION_DELAY) {
      nextTiming.delay = MAX_MOTION_DELAY;
      changed = true;
    }

    if (Number.isFinite(nextTiming.endDelay) && nextTiming.endDelay > MAX_MOTION_DELAY) {
      nextTiming.endDelay = MAX_MOTION_DELAY;
      changed = true;
    }

    if (changed) {
      try {
        effect.updateTiming(nextTiming);
      } catch (error) {
        // Ignore timing update failures.
      }
    }
  }

  function tightenKeyframeTiming(effect) {
    if (!effect || typeof effect.getTiming !== "function" || typeof effect.updateTiming !== "function") {
      return;
    }

    let timing;
    try {
      timing = effect.getTiming();
    } catch (error) {
      return;
    }

    if (!timing || typeof timing !== "object") {
      return;
    }

    const nextTiming = { ...timing };
    let changed = false;

    if (
      Number.isFinite(nextTiming.duration) &&
      nextTiming.duration > MAX_ANIMATION_DURATION &&
      (!Number.isFinite(nextTiming.iterations) || nextTiming.iterations <= 1)
    ) {
      nextTiming.duration = MAX_ANIMATION_DURATION;
      changed = true;
    }

    if (Number.isFinite(nextTiming.delay) && nextTiming.delay > MAX_MOTION_DELAY) {
      nextTiming.delay = MAX_MOTION_DELAY;
      changed = true;
    }

    if (Number.isFinite(nextTiming.endDelay) && nextTiming.endDelay > MAX_MOTION_DELAY) {
      nextTiming.endDelay = MAX_MOTION_DELAY;
      changed = true;
    }

    if (changed) {
      try {
        effect.updateTiming(nextTiming);
      } catch (error) {
        // Ignore timing update failures.
      }
    }
  }

  function handleAnimationStart(event) {
    const target = event.target;
    if (!target || !target.isConnected) {
      return;
    }

    if (typeof target.closest === "function" && target.closest(`[${MOTION_OPT_OUT_ATTRIBUTE}]`)) {
      return;
    }

    const style = window.getComputedStyle(target);
    const durations = parseTimeList(style.animationDuration);
    const delays = parseTimeList(style.animationDelay);
    const iterations = parseIterationList(style.animationIterationCount);

    const adjustedDurations = clampAnimationDurations(durations, iterations);
    const adjustedDelays = clampDelays(delays);

    if (adjustedDurations.changed) {
      target.style.animationDuration = formatTimeList(adjustedDurations.values);
    }
    if (adjustedDelays.changed) {
      target.style.animationDelay = formatTimeList(adjustedDelays.values);
    }
  }

  function handleTransitionRun(event) {
    const target = event.target;
    if (!target || !target.isConnected) {
      return;
    }

    if (typeof target.closest === "function" && target.closest(`[${MOTION_OPT_OUT_ATTRIBUTE}]`)) {
      return;
    }

    const style = window.getComputedStyle(target);
    const durations = parseTimeList(style.transitionDuration);
    const delays = parseTimeList(style.transitionDelay);

    const adjustedDurations = clampDurations(durations, MAX_TRANSITION_DURATION);
    const adjustedDelays = clampDelays(delays);

    if (adjustedDurations.changed) {
      target.style.transitionDuration = formatTimeList(adjustedDurations.values);
    }
    if (adjustedDelays.changed) {
      target.style.transitionDelay = formatTimeList(adjustedDelays.values);
    }
  }

  /**
   * Converts a comma-separated list of CSS time values into an array of millisecond durations.
   * @param {string} value - Raw CSS time expression to parse.
   * @returns {number[]} Array of normalized millisecond values.
   */
  function parseTimeList(value) {
    if (!value) {
      return [];
    }
    return value.split(",").map((part) => parseTime(part.trim()));
  }

  /**
   * Normalizes a CSS time token into milliseconds.
   * @param {string} value - Raw time token such as `250ms` or `0.2s`.
   * @returns {number} Millisecond representation of the provided token.
   */
  function parseTime(value) {
    if (!value) {
      return 0;
    }
    if (value.endsWith("ms")) {
      return Number.parseFloat(value.slice(0, -2)) || 0;
    }
    if (value.endsWith("s")) {
      return (Number.parseFloat(value.slice(0, -1)) || 0) * 1000;
    }
    return Number.parseFloat(value) || 0;
  }

  /**
   * Parses iteration counts from CSS animation definitions.
   * @param {string} value - Comma-separated iteration list.
   * @returns {number[]} Normalized iteration counts where `infinite` becomes `Infinity`.
   */
  function parseIterationList(value) {
    if (!value) {
      return [];
    }
    return value.split(",").map((part) => {
      const trimmed = part.trim();
      if (trimmed === "infinite") {
        return Infinity;
      }
      const parsed = Number.parseFloat(trimmed);
      return Number.isFinite(parsed) ? parsed : 1;
    });
  }

  /**
   * Clamps animation durations while respecting repeated or infinite animations.
   * @param {number[]} durations - Millisecond durations for each animation.
   * @param {number[]} iterations - Associated iteration counts for each animation.
   * @returns {{values: number[], changed: boolean}} Clamped durations alongside a change flag.
   */
  function clampAnimationDurations(durations, iterations) {
    let changed = false;
    const values = durations.map((duration, index) => {
      const iteration = iterations[index] ?? iterations[iterations.length - 1] ?? 1;
      if (!Number.isFinite(duration) || duration <= 0) {
        return duration;
      }
      if (!Number.isFinite(iteration) || iteration > 1) {
        return duration;
      }
      if (duration > MAX_ANIMATION_DURATION) {
        changed = true;
        return MAX_ANIMATION_DURATION;
      }
      return duration;
    });
    return { values, changed };
  }

  /**
   * Restricts durations to a maximum threshold.
   * @param {number[]} durations - Millisecond durations for transitions or animations.
   * @param {number} max - Maximum allowed duration.
   * @returns {{values: number[], changed: boolean}} Clamped durations alongside a change flag.
   */
  function clampDurations(durations, max) {
    let changed = false;
    const values = durations.map((duration) => {
      if (!Number.isFinite(duration) || duration <= 0) {
        return duration;
      }
      if (duration > max) {
        changed = true;
        return max;
      }
      return duration;
    });
    return { values, changed };
  }

  /**
   * Limits delay values so motion starts promptly.
   * @param {number[]} delays - Millisecond delay values.
   * @returns {{values: number[], changed: boolean}} Normalized delays with a change indicator.
   */
  function clampDelays(delays) {
    let changed = false;
    const values = delays.map((delay) => {
      if (!Number.isFinite(delay) || delay <= 0) {
        return delay;
      }
      if (delay > MAX_MOTION_DELAY) {
        changed = true;
        return MAX_MOTION_DELAY;
      }
      return delay;
    });
    return { values, changed };
  }

  /**
   * Formats numeric millisecond values into a CSS-ready string list.
   * @param {number[]} values - Millisecond values to stringify.
   * @returns {string} CSS-compatible time list.
   */
  function formatTimeList(values) {
    return values
      .map((value) => formatTime(value))
      .join(", ");
  }

  /**
   * Formats a millisecond duration into a CSS time token.
   * @param {number} value - Duration in milliseconds.
   * @returns {string} CSS time string, clamped to non-negative numbers.
   */
  function formatTime(value) {
    const safe = Number.isFinite(value) ? Math.max(0, value) : 0;
    if (Number.isInteger(safe)) {
      return `${safe}ms`;
    }
    return `${safe.toFixed(2)}ms`;
  }

  /**
   * Applies decoding, lazy-loading, and priority hints to images.
   * @param {HTMLImageElement} img - Target image element.
   * @returns {void}
   */
  function tuneImage(img) {
    if (!img.isConnected) return;

    if (!img.hasAttribute("decoding")) {
      img.setAttribute("decoding", "async");
    }

    applyLazyStrategy(img);
  }

  function observeNavigation() {
    if (navigationHooksInstalled) {
      return;
    }
    navigationHooksInstalled = true;

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    function hookNavigation(fn) {
      return function patchedState() {
        if (typeof fn === "function") {
          const outcome = fn.apply(this, arguments);
          scheduleScan();
          return outcome;
        }
        scheduleScan();
        return undefined;
      };
    }

    if (typeof originalPushState === "function") {
      history.pushState = hookNavigation(originalPushState);
    }
    if (typeof originalReplaceState === "function") {
      history.replaceState = hookNavigation(originalReplaceState);
    }

    window.addEventListener("popstate", scheduleScan);
    window.addEventListener("pageshow", scheduleScan);
  }

  function setupKeepAlive() {
    const canPing = typeof navigator !== "undefined" && (typeof navigator.sendBeacon === "function" || typeof window.fetch === "function");
    if (!canPing) {
      return;
    }

    const sendKeepAlive = () => {
      if (keepAliveInFlight) {
        return;
      }

      if (!isOnline()) {
        return;
      }

      const target = buildKeepAliveURL();
      keepAliveInFlight = true;

      const finalize = () => {
        keepAliveInFlight = false;
      };

      if (typeof navigator.sendBeacon === "function") {
        try {
          const payload = typeof Blob === "function" ? new Blob([""], { type: "text/plain" }) : "";
          if (navigator.sendBeacon(target, payload)) {
            finalize();
            return;
          }
        } catch (error) {
          // Fallback to fetch when sendBeacon fails.
        }
      }

      if (typeof window.fetch === "function") {
        try {
          const requestInit = {
            method: "GET",
            cache: "no-store",
            credentials: "include",
            keepalive: true,
          };

          let timeoutId = 0;
          if (typeof AbortController === "function") {
            const controller = new AbortController();
            requestInit.signal = controller.signal;
            timeoutId = window.setTimeout(() => {
              try {
                controller.abort();
              } catch (abortError) {
                // Silently ignore abort errors.
              }
            }, 4000);
          }

          const finalizeFetch = () => {
            if (timeoutId) {
              window.clearTimeout(timeoutId);
            }
            finalize();
          };

          const request = window.fetch(target, requestInit);
          if (request && typeof request.then === "function") {
            request.then(finalizeFetch, finalizeFetch);
            return;
          }

          finalizeFetch();
          return;
        } catch (error) {
          // Swallow errors silently to remain non-intrusive.
        }
      }

      if (typeof XMLHttpRequest === "function") {
        try {
          const xhr = new XMLHttpRequest();
          xhr.open("GET", target, true);
          xhr.timeout = 4000;
          xhr.withCredentials = true;
          xhr.addEventListener("loadend", finalize);
          xhr.addEventListener("error", finalize);
          xhr.addEventListener("timeout", finalize);
          xhr.send();
          return;
        } catch (error) {
          // Last resort fallback intentionally silent.
        }
      }

      finalize();
    };

    const immediateKeepAlive = () => {
      if (!isOnline()) {
        return;
      }
      sendKeepAlive();
      restartKeepAliveTimer(sendKeepAlive);
    };

    sendKeepAlive();
    keepAliveTimer = window.setInterval(sendKeepAlive, getKeepAliveInterval());

    const teardown = () => {
      stopKeepAliveTimer();
    };

    window.addEventListener("pagehide", teardown, { once: true });
    window.addEventListener("beforeunload", teardown, { once: true });
    document.addEventListener("visibilitychange", immediateKeepAlive);
    window.addEventListener("focus", immediateKeepAlive);
    window.addEventListener("pageshow", immediateKeepAlive);
    window.addEventListener("online", immediateKeepAlive);
    window.addEventListener("offline", stopKeepAliveTimer);
  }

  function buildKeepAliveURL() {
    if (typeof URL !== "function") {
      return window.location.href;
    }
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("dna-shield-keepalive", Date.now().toString(36));
      return url.toString();
    } catch (error) {
      return window.location.href;
    }
  }

  /**
   * Applies lazy-loading and priority hints to iframes.
   * @param {HTMLIFrameElement} iframe - Target iframe element.
   * @returns {void}
   */
  function tuneIframe(iframe) {
    if (!iframe.isConnected) return;

    applyLazyStrategy(iframe);
  }

  /**
   * Tunes video elements to avoid heavy eager loading while caching poster art.
   * @param {HTMLVideoElement} video - Target video element.
   * @returns {void}
   */
  function tuneVideo(video) {
    if (!video.isConnected) return;

    if (!video.hasAttribute("preload") && !video.autoplay && !video.hasAttribute("data-dna-keep-preload")) {
      video.setAttribute("preload", "metadata");
    }

    if (video.hasAttribute("poster")) {
      const poster = video.getAttribute("poster");
      if (poster && !video.dataset.dnaPosterHint) {
        video.dataset.dnaPosterHint = "1";
        const img = new Image();
        img.decoding = "async";
        img.src = poster;
      }
    }
  }

  /**
   * Tunes audio elements to limit preload overhead unless explicitly required.
   * @param {HTMLAudioElement} audio - Target audio element.
   * @returns {void}
   */
  function tuneAudio(audio) {
    if (!audio.isConnected) return;

    if (!audio.hasAttribute("preload") && !audio.autoplay && !audio.hasAttribute("data-dna-keep-preload")) {
      audio.setAttribute("preload", "metadata");
    }
  }

  /**
   * Applies lazy-loading preferences with retry support for uncertain layout states.
   * @param {Element} el - Target media element.
   * @returns {void}
   */
  function applyLazyStrategy(el) {
    if (!el || !LAZY_TAGS.has(el.tagName)) {
      return;
    }

    const decision = computeLazyDecision(el);

    if (decision === "lazy") {
      lazyEvaluationAttempts.delete(el);
      if (!el.hasAttribute("loading")) {
        try {
          el.setAttribute("loading", "lazy");
          managedLazyAttributes.add(el);
        } catch (error) {
          // Ignore attribute assignment issues to remain resilient.
        }
      }
      applyPriorityHints(el, "low");
      return;
    }

    if (decision === "eager") {
      lazyEvaluationAttempts.delete(el);
      if (managedLazyAttributes.has(el)) {
        try {
          if (el.getAttribute("loading") === "lazy") {
            el.removeAttribute("loading");
          }
        } catch (error) {
          // Silently ignore removal failures caused by locked attributes.
        }
        managedLazyAttributes.delete(el);
      }
      applyPriorityHints(el, "high");
      return;
    }

    const attempts = lazyEvaluationAttempts.get(el) || 0;
    if (attempts >= 2) {
      lazyEvaluationAttempts.delete(el);
      if (managedLazyAttributes.has(el)) {
        try {
          if (el.getAttribute("loading") === "lazy") {
            el.removeAttribute("loading");
          }
        } catch (error) {
          // Ignore failures and continue with eager hints.
        }
        managedLazyAttributes.delete(el);
      }
      applyPriorityHints(el, "high");
      return;
    }

    lazyEvaluationAttempts.set(el, attempts + 1);
    scheduleLazyEvaluation(el);
  }

  /**
   * Calculates the ideal lazy-loading decision for a media element.
   * @param {Element} el - Element to inspect.
   * @returns {"lazy"|"eager"|"defer"} Lazy-loading state decision.
   */
  function computeLazyDecision(el) {
    if (!el || !LAZY_TAGS.has(el.tagName)) {
      return "eager";
    }

    if (el.hasAttribute("loading")) {
      return el.getAttribute("loading") === "lazy" ? "lazy" : "eager";
    }

    if (!el.isConnected) {
      return "lazy";
    }

    if (!hasUsableLayout(el)) {
      return isEffectivelyHidden(el) ? "lazy" : "defer";
    }

    let rect;
    try {
      rect = el.getBoundingClientRect();
    } catch (error) {
      return "defer";
    }

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    const verticalThreshold = viewportHeight * 1.1 + 160;
    const horizontalThreshold = viewportWidth * 1.1 + 160;

    const verticallyCritical = rect.top < verticalThreshold && rect.bottom > -200;
    const horizontallyCritical = rect.left < horizontalThreshold && rect.right > -200;

    return verticallyCritical && horizontallyCritical ? "eager" : "lazy";
  }

  /**
   * Defers a lazy-loading evaluation until the next animation frame.
   * @param {Element} el - Element scheduled for reevaluation.
   * @returns {void}
   */
  function scheduleLazyEvaluation(el) {
    if (!el || pendingLazyEvaluations.has(el)) {
      return;
    }

    pendingLazyEvaluations.add(el);
    RAF(() => {
      pendingLazyEvaluations.delete(el);
      if (!el.isConnected) {
        lazyEvaluationAttempts.delete(el);
        managedLazyAttributes.delete(el);
        return;
      }
      applyLazyStrategy(el);
    });
  }

  /**
   * Determines whether an element currently exposes usable layout metrics.
   * @param {Element} el - Element to evaluate.
   * @returns {boolean} True when measurable layout boxes exist.
   */
  function hasUsableLayout(el) {
    if (!el || typeof el.getClientRects !== "function") {
      return false;
    }

    let rects;
    try {
      rects = el.getClientRects();
    } catch (error) {
      return false;
    }

    if (!rects || rects.length === 0) {
      return false;
    }

    for (let index = 0; index < rects.length; index += 1) {
      const rect = rects[index];
      if (rect && rect.width > 0 && rect.height > 0) {
        return true;
      }
    }

    return false;
  }

  /**
   * Checks if an element appears hidden via CSS styles.
   * @param {Element} el - Element to check for visibility overrides.
   * @returns {boolean} True when the element is intentionally hidden.
   */
  function isEffectivelyHidden(el) {
    if (!el || typeof window === "undefined" || typeof window.getComputedStyle !== "function") {
      return false;
    }

    let style;
    try {
      style = window.getComputedStyle(el);
    } catch (error) {
      return false;
    }

    if (!style) {
      return false;
    }

    return style.display === "none" || style.visibility === "hidden";
  }

  /**
   * Determines whether an element should be lazily loaded based on viewport heuristics.
   * @param {Element} el - Element to evaluate for lazy loading.
   * @returns {boolean} True when the element can be safely deferred.
   */
  function shouldLazy(el) {
    return computeLazyDecision(el) === "lazy";
  }

  /**
   * Applies modern and legacy priority hints to a media element.
   * @param {Element} el - Target media element.
   * @param {string} priority - Desired priority (`high`, `low`, or `auto`).
   * @returns {void}
   */
  function applyPriorityHints(el, priority) {
    if (!el || typeof priority !== "string") {
      return;
    }

    if (typeof el.fetchPriority !== "undefined") {
      try {
        if (el.fetchPriority !== priority) {
          el.fetchPriority = priority;
        }
      } catch (error) {
        // Ignore assignment failures and fall back to attributes.
      }
    }

    if (!el.hasAttribute("fetchpriority")) {
      try {
        el.setAttribute("fetchpriority", priority);
      } catch (error) {
        // Ignore attribute assignment failures to remain non-intrusive.
      }
    }

    const compatValue = priority === "high" ? "high" : priority === "low" ? "low" : "auto";
    if (compatValue !== "auto" && !el.hasAttribute(PRIORITY_COMPAT_ATTRIBUTE)) {
      try {
        el.setAttribute(PRIORITY_COMPAT_ATTRIBUTE, compatValue);
      } catch (error) {
        // Silently ignore.
      }
    }
  }

  /**
   * Resolves the keep-alive interval based on page visibility state.
   * @returns {number} Interval duration in milliseconds.
   */
  function getKeepAliveInterval() {
    if (typeof document === "undefined") {
      return KEEPALIVE_INTERVAL_ACTIVE;
    }
    return document.visibilityState === "hidden" ? KEEPALIVE_INTERVAL_BACKGROUND : KEEPALIVE_INTERVAL_ACTIVE;
  }

  /**
   * Restarts the keep-alive timer with the provided sender callback.
   * @param {() => void} sender - Callback responsible for dispatching keep-alive pings.
   * @returns {void}
   */
  function restartKeepAliveTimer(sender) {
    stopKeepAliveTimer();
    keepAliveTimer = window.setInterval(sender, getKeepAliveInterval());
  }

  /**
   * Stops the active keep-alive timer if it exists.
   * @returns {void}
   */
  function stopKeepAliveTimer() {
    if (keepAliveTimer) {
      window.clearInterval(keepAliveTimer);
      keepAliveTimer = 0;
    }
  }

  /**
   * Determines whether the browser currently reports an online connection.
   * @returns {boolean} True when the browser is online or cannot report state.
   */
  function isOnline() {
    if (typeof navigator === "undefined" || typeof navigator.onLine !== "boolean") {
      return true;
    }
    return navigator.onLine;
  }

  if (typeof window !== "undefined") {
    const existingInternals = window.__DNA_SHIELD_INTERNALS__ || {};
    window.__DNA_SHIELD_INTERNALS__ = {
      ...existingInternals,
      parseTimeList,
      parseIterationList,
      clampAnimationDurations,
      clampDurations,
      clampDelays,
      formatTimeList,
      formatTime,
      computeLazyDecision,
      shouldLazy,
      applyPriorityHints,
      getKeepAliveInterval,
      restartKeepAliveTimer,
      stopKeepAliveTimer,
      isOnline,
    };
  }
})();
