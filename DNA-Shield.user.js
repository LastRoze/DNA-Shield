// ==UserScript==
// @name                DNA Shield
// @namespace           DNA Shield
// @version             1.8
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
    accelerateDocumentVisibility();
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
      attributeFilter: ["src", "data-src", "preload", "poster"],
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

  /**
   * Applies decoding optimizations to images.
   * @param {HTMLImageElement} img - Target image element.
   * @returns {void}
   */
  function tuneImage(img) {
    if (!img.isConnected) return;

    if (!img.hasAttribute("decoding")) {
      img.setAttribute("decoding", "async");
    }
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
   * Preserves iframe loading behavior while allowing future tuning when enabled.
   * @param {HTMLIFrameElement} iframe - Target iframe element.
   * @returns {void}
   */
  function tuneIframe(iframe) {
    if (!iframe.isConnected) return;
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
      applyPriorityHints,
      getKeepAliveInterval,
      restartKeepAliveTimer,
      stopKeepAliveTimer,
      isOnline,
    };
  }
})();
