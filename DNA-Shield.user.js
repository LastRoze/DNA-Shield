// ==UserScript==
// @name                DNA Shield
// @namespace           DNA Shield
// @version             1.1
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
  const IDLE = window.requestIdleCallback || function fallbackIdle(fn) {
    return window.setTimeout(() => fn({ didTimeout: false, timeRemaining: () => 50 }), 1);
  };
  const CANCEL_IDLE = window.cancelIdleCallback || function fallbackCancel(id) {
    window.clearTimeout(id);
  };
  const KEEPALIVE_INTERVAL = 45000;
  const MOTION_STYLE_ID = "dna-shield-motion";

  let scheduledScanToken = null;
  let keepAliveTimer = 0;
  let navigationHooksInstalled = false;

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
      * {
        animation-duration: 0.001s !important;
        animation-delay: 0s !important;
        transition-duration: 0.001s !important;
        transition-delay: 0s !important;
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function tuneImage(img) {
    if (!img.isConnected) return;

    if (!img.hasAttribute("decoding")) {
      img.setAttribute("decoding", "async");
    }

    if (!img.hasAttribute("loading") && shouldLazy(img)) {
      img.setAttribute("loading", "lazy");
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
      if (document.visibilityState === "hidden") {
        return;
      }
      const target = buildKeepAliveURL();
      
      if (typeof navigator.sendBeacon === "function") {
        try {
          const payload = typeof Blob === "function" ? new Blob([""], { type: "text/plain" }) : "";
          navigator.sendBeacon(target, payload);
          return;
        } catch (error) {
          // Fallback to fetch when sendBeacon fails.
        }
      }

      if (typeof window.fetch === "function") {
        try {
          window.fetch(target, {
            method: "GET",
            mode: "no-cors",
            cache: "no-store",
            keepalive: true,
          }).catch(() => {});
        } catch (error) {
          // Swallow errors silently to remain non-intrusive.
        }
      }
    };

    sendKeepAlive();
    keepAliveTimer = window.setInterval(sendKeepAlive, KEEPALIVE_INTERVAL);

    const teardown = () => {
      if (keepAliveTimer) {
        window.clearInterval(keepAliveTimer);
        keepAliveTimer = 0;
      }
    };

    window.addEventListener("pagehide", teardown, { once: true });
    window.addEventListener("beforeunload", teardown, { once: true });
  }

  function buildKeepAliveURL() {
    if (typeof URL !== "function") {
      return window.location.href;
    }
    const url = new URL(window.location.href);
    url.searchParams.set("dna-shield-keepalive", Date.now().toString(36));
    return url.toString();
  }

  function tuneIframe(iframe) {
    if (!iframe.isConnected) return;

    if (!iframe.hasAttribute("loading") && shouldLazy(iframe)) {
      iframe.setAttribute("loading", "lazy");
    }
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
    const verticalThreshold = viewportHeight * 1.2 + 200;
    const horizontalThreshold = viewportWidth * 1.2 + 200;

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
})();
