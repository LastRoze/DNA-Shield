// ==UserScript==
// @name                DNA Shield
// @namespace           DNA Shield
// @version             1.4
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
  const KEEPALIVE_INTERVAL_ACTIVE = 35000;
  const KEEPALIVE_INTERVAL_BACKGROUND = 75000;
  const MOTION_STYLE_ID = "dna-shield-motion";
  const MAX_TRANSITION_DURATION = 260;
  const MAX_ANIMATION_DURATION = 420;
  const MAX_MOTION_DELAY = 120;

  let scheduledScanToken = null;
  let keepAliveTimer = 0;
  let navigationHooksInstalled = false;
  let keepAliveInFlight = false;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
  } else {
    bootstrap();
  }

  function bootstrap() {
    installMotionDampener();
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
    style.textContent = `
      :root {
        scroll-behavior: auto !important;
      }
    `;
    (document.head || document.documentElement).appendChild(style);

    document.addEventListener("animationstart", handleAnimationStart, true);
    document.addEventListener("transitionrun", handleTransitionRun, true);
  }

  function handleAnimationStart(event) {
    const target = event.target;
    if (!target || !target.isConnected) {
      return;
    }

    if (typeof target.closest === "function" && target.closest("[data-dna-keep-motion]")) {
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

    if (typeof target.closest === "function" && target.closest("[data-dna-keep-motion]")) {
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

  function parseTimeList(value) {
    if (!value) {
      return [];
    }
    return value.split(",").map((part) => parseTime(part.trim()));
  }

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

  function formatTimeList(values) {
    return values
      .map((value) => formatTime(value))
      .join(", ");
  }

  function formatTime(value) {
    const safe = Number.isFinite(value) ? Math.max(0, value) : 0;
    if (Number.isInteger(safe)) {
      return `${safe}ms`;
    }
    return `${safe.toFixed(2)}ms`;
  }

  function tuneImage(img) {
    if (!img.isConnected) return;

    if (!img.hasAttribute("decoding")) {
      img.setAttribute("decoding", "async");
    }

    const shouldDelay = shouldLazy(img);
    if (!img.hasAttribute("loading") && shouldDelay) {
      img.setAttribute("loading", "lazy");
    }

    applyPriorityHints(img, shouldDelay ? "low" : "high");
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

  function tuneIframe(iframe) {
    if (!iframe.isConnected) return;

    const shouldDelay = shouldLazy(iframe);

    if (!iframe.hasAttribute("loading") && shouldDelay) {
      iframe.setAttribute("loading", "lazy");
    }

    applyPriorityHints(iframe, shouldDelay ? "low" : "high");
  }

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

  function tuneAudio(audio) {
    if (!audio.isConnected) return;

    if (!audio.hasAttribute("preload") && !audio.autoplay && !audio.hasAttribute("data-dna-keep-preload")) {
      audio.setAttribute("preload", "metadata");
    }
  }

  function shouldLazy(el) {
    if (!LAZY_TAGS.has(el.tagName)) {
      return false;
    }

    if (el.hasAttribute("loading")) {
      return el.getAttribute("loading") === "lazy";
    }

    if (!isConnectedAndVisible(el)) {
      return true;
    }

    const rect = el.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    const verticalThreshold = viewportHeight * 1.1 + 160;
    const horizontalThreshold = viewportWidth * 1.1 + 160;

    const verticallyCritical = rect.top < verticalThreshold && rect.bottom > -200;
    const horizontallyCritical = rect.left < horizontalThreshold && rect.right > -200;

    return !(verticallyCritical && horizontallyCritical);
  }

  function isConnectedAndVisible(el) {
    if (!el.isConnected) return false;
    if (typeof el.getClientRects !== "function") return false;
    const rects = el.getClientRects();
    return rects.length > 0;
  }

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

  function getKeepAliveInterval() {
    if (typeof document === "undefined") {
      return KEEPALIVE_INTERVAL_ACTIVE;
    }
    return document.visibilityState === "hidden" ? KEEPALIVE_INTERVAL_BACKGROUND : KEEPALIVE_INTERVAL_ACTIVE;
  }

  function restartKeepAliveTimer(sender) {
    stopKeepAliveTimer();
    keepAliveTimer = window.setInterval(sender, getKeepAliveInterval());
  }

  function stopKeepAliveTimer() {
    if (keepAliveTimer) {
      window.clearInterval(keepAliveTimer);
      keepAliveTimer = 0;
    }
  }

  function isOnline() {
    if (typeof navigator === "undefined" || typeof navigator.onLine !== "boolean") {
      return true;
    }
    return navigator.onLine;
  }
})();
