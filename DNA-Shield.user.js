// ==UserScript==
// @name		DNA Shield
// @namespace	DNA Shield
// @version		12.1
// @author		Last Roze
// @description	Dominion With Domination
// @copyright	©2021 - 2025 // Yoga Budiman
// @homepage	https://github.com/LastRoze/
// @homepageURL	https://github.com/LastRoze/
// @website		https://lastroze.github.io/
// @source		https://github.com/LastRoze/DNA-Shield
// @icon		https://github.com/LastRoze/DNA-Shield/blob/master/DNA.jpg?raw=true
// @iconURL		https://github.com/LastRoze/DNA-Shield/blob/master/DNA.jpg?raw=true
// @defaulticon	https://github.com/LastRoze/DNA-Shield/blob/master/DNA.jpg?raw=true
// @icon64		https://github.com/LastRoze/DNA-Shield/blob/master/DNA.jpg?raw=true
// @icon64URL	https://github.com/LastRoze/DNA-Shield/blob/master/DNA.jpg?raw=true
// @updateURL	https://github.com/LastRoze/DNA-Shield/raw/master/DNA-Shield.meta.js
// @downloadURL	https://github.com/LastRoze/DNA-Shield/raw/master/DNA-Shield.user.js
// @supportURL	https://lastroze.github.io/
// @match		*://*/*
// @connect		*
// @run-at		document-start
// @grant		GM_addStyle
// @grant		GM_deleteValue
// @grant		GM_download
// @grant		GM_getResourceText
// @grant		GM_getResourceURL
// @grant		GM_getValue
// @grant		GM_listValues
// @grant		GM_notification
// @grant		GM_openInTab
// @grant		GM_registerMenuCommand
// @grant		GM_setClipboard
// @grant		GM_setValue
// @grant		GM_unregisterMenuCommand
// @grant		GM_xmlhttpRequest
// @grant		unsafeWindow
// @grant		window.close
// @grant		window.focus
// @grant		window.onurlchange
// ==/UserScript==
/* global $, jQuery */

(() => {
  'use strict';
  if (window.__dnaShieldPatched) return; // idempotent
  window.__dnaShieldPatched = true;

  /* ---------------------------------------------------------
   * 1) CSS — aggressive but safe + UI acceleration
   * --------------------------------------------------------- */
  const CSS = `
    :root {
      --dna-tran: 0.1ms;
      --dna-anim: 0.1ms;
      --dna-scroll: auto;
      --dna-hover: 0.1ms;
      --dna-tooltip: 0.1ms;
    }
    html { scroll-behavior: var(--dna-scroll) !important; }

    /* Rendering tweaks (conservative) */
    html, body { text-rendering: optimizeSpeed !important; }
    body { -webkit-font-smoothing: antialiased !important; }

    /* Short transitions everywhere (safe set of properties) */
    * {
      transition-duration: var(--dna-tran) !important;
      transition-delay: 0ms !important;
      transition-property: color, background-color, opacity, transform,
                           height, width, left, top, right, bottom, box-shadow, border-color !important;
    }

    /* Fast hover effects */
    *:hover, *:focus, *:active {
      transition-duration: var(--dna-hover) !important;
    }

    /* Shortened animations on common interactive elements */
    button, a, [role="button"], input, select, textarea,
    [data-anim], .anim, .transition, [class*="anim"], [class*="transition"],
    .tooltip, [data-tooltip], [title], .popover, .dropdown, .modal {
      animation-duration: var(--dna-anim) !important;
      animation-delay: 0ms !important;
      transition-duration: var(--dna-hover) !important;
    }

    /* Common tooltip/popover classes */
    .tooltip, [data-tooltip], [data-bs-toggle="tooltip"], [data-toggle="tooltip"],
    .popover, [data-popover], [data-bs-toggle="popover"], [data-toggle="popover"],
    .tippy-tooltip, .ui-tooltip, .hint--top, .hint--bottom, .hint--left, .hint--right {
      transition-duration: var(--dna-tooltip) !important;
      animation-duration: var(--dna-tooltip) !important;
    }

    /* Dropdown menus */
    .dropdown-menu, .select2-dropdown, .ui-menu, .context-menu,
    [role="menu"], [role="listbox"], [class*="dropdown"], [class*="menu"] {
      transition-duration: var(--dna-hover) !important;
      animation-duration: var(--dna-hover) !important;
    }

    /* Modal/dialog acceleration */
    .modal, .dialog, [role="dialog"], .overlay, .backdrop,
    .ui-dialog, .fancybox, .lightbox, [class*="modal"], [class*="dialog"] {
      transition-duration: 100ms !important;
      animation-duration: 100ms !important;
    }

    /* Faster rendering only for lazy/offscreen images (avoid visible pixelation up top) */
    img[loading="lazy"][decoding="async"] { image-rendering: optimizeSpeed !important; }

    /* Accordion/collapsible elements */
    .accordion, .collapse, .collapsible, [data-toggle="collapse"],
    [class*="accordion"], [class*="collapse"], [class*="expand"] {
      transition-duration: 120ms !important;
    }

    /* Progress bars and sliders */
    .progress, .slider, input[type="range"], .ui-slider, .noui-slider,
    [role="progressbar"], [role="slider"] {
      transition-duration: var(--dna-hover) !important;
    }
  `;

  if (typeof GM_addStyle === 'function') {
    GM_addStyle(CSS);
  } else {
    const s = document.createElement('style');
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  /* ---------------------------------------------------------
   * 2) JS — safe acceleration rules
   * --------------------------------------------------------- */
  const SCALE = 0.2;
  const MIN_AFTER_SCALE = 4;
  const MAX_AFTER_SCALE = 150;
  const LONG_TIMER_GUARD = 30000;

  function fastDelay(original) {
    const d = Number(original);
    if (!isFinite(d)) return original;
    if (d <= 4) return d;
    if (d >= LONG_TIMER_GUARD) return d;
    const scaled = Math.max(MIN_AFTER_SCALE, d * SCALE);
    return Math.min(scaled, MAX_AFTER_SCALE);
  }

  // Patch setTimeout safely
  const _setTimeout = window.setTimeout;
  Object.defineProperty(window, 'setTimeout', {
    configurable: true,
    writable: true,
    value: function(fn, delay, ...args) {
      if (typeof fn !== 'function') return _setTimeout(fn, delay, ...args);
      return _setTimeout(fn, fastDelay(delay), ...args);
    }
  });

  // Patch setInterval safely
  const _setInterval = window.setInterval;
  Object.defineProperty(window, 'setInterval', {
    configurable: true,
    writable: true,
    value: function(fn, delay, ...args) {
      if (typeof fn !== 'function') return _setInterval(fn, delay, ...args);
      return _setInterval(fn, fastDelay(delay), ...args);
    }
  });

  /* ---------------------------------------------------------
   * 3) jQuery acceleration — safe patching
   * --------------------------------------------------------- */
  function patchJQuery() {
    // Check if jQuery exists
    const $ = window.jQuery || window.$;
    if (!$ || typeof $.fn !== 'object') return;

    // Patch jQuery.fx.speeds (global animation speeds)
    if ($.fx && $.fx.speeds) {
      $.fx.speeds.slow = 1;
      $.fx.speeds.normal = 1;
      $.fx.speeds.fast = 1;
      $.fx.speeds._default = 1;
    }

    // Patch individual animation methods if they exist
    const animMethods = ['animate', 'fadeIn', 'fadeOut', 'fadeToggle', 'slideUp', 'slideDown', 'slideToggle', 'show', 'hide', 'toggle'];

    animMethods.forEach(method => {
      if (typeof $.fn[method] === 'function') {
        const original = $.fn[method];
        $.fn[method] = function(speed, easing, callback) {
          // Handle different argument patterns
          let newSpeed = speed;

          if (typeof speed === 'number') {
            newSpeed = fastDelay(speed);
          } else if (typeof speed === 'string') {
            // Map string speeds to fast values
            const speedMap = {
              'slow': 1,
              'normal': 1,
              'fast': 1
            };
            newSpeed = speedMap[speed] || 1;
          }

          return original.call(this, newSpeed, easing, callback);
        };
      }
    });

    // Patch jQuery UI if present
    if ($.ui) {
      // Speed up jQuery UI effects
      if ($.ui.effect && $.ui.effect.speeds) {
        $.ui.effect.speeds.slow = 1;
        $.ui.effect.speeds.normal = 1;
        $.ui.effect.speeds.fast = 1;
        $.ui.effect.speeds._default = 1;
      }

      // Speed up common jQuery UI widgets
      const uiDefaults = {
        'tooltip': { show: { duration: 1 }, hide: { duration: 1 } },
        'dialog': { show: { duration: 1 }, hide: { duration: 1 } },
        'accordion': { animate: 1 },
        'tabs': { show: { duration: 10 }, hide: { duration: 1 } },
        'menu': { delay: 1 },
        'autocomplete': { delay: 1 }
      };

      Object.keys(uiDefaults).forEach(widget => {
        if ($.ui[widget] && $.ui[widget].prototype && $.ui[widget].prototype.options) {
          Object.assign($.ui[widget].prototype.options, uiDefaults[widget]);
        }
      });
    }
  }

  /* ---------------------------------------------------------
   * 4) Web Animations API — shorten durations/delays
   * --------------------------------------------------------- */
  const E = Element;
  if (E && E.prototype && typeof E.prototype.animate === 'function') {
    const _animate = E.prototype.animate;
    Object.defineProperty(E.prototype, 'animate', {
      configurable: true,
      writable: true,
      value: function(keyframes, options) {
        try {
          let opts = options;
          if (typeof opts === 'number') opts = { duration: opts };
          else if (opts && typeof opts === 'object') opts = Object.assign({}, opts);

          if (opts) {
            if ('duration' in opts) {
              const d = Number(opts.duration);
              if (isFinite(d) && d > 0) {
                opts.duration = Math.min(1, Math.max(1, d * SCALE));
              }
            }
            if ('delay' in opts) {
              const dl = Number(opts.delay);
              if (isFinite(dl) && dl > 0) {
                opts.delay = Math.min(1, Math.max(0, dl * SCALE));
              }
            }
          }
          return _animate.call(this, keyframes, opts ?? options);
        } catch {
          return _animate.call(this, keyframes, options);
        }
      }
    });
  }

  /* ---------------------------------------------------------
   * 5) Tooltip libraries acceleration
   * --------------------------------------------------------- */
  function patchTooltipLibraries() {
    // Tippy.js
    if (window.tippy && window.tippy.setDefaultProps) {
      window.tippy.setDefaultProps({
        duration: [1, 1],
        delay: [1, 1]
      });
    }

    // Popper.js based tooltips
    if (window.Popper) {
      const originalCreate = window.Popper.createPopper || window.Popper;
      if (typeof originalCreate === 'function') {
        window.Popper.createPopper = function(...args) {
          const result = originalCreate.apply(this, args);
          if (result && result.setOptions) {
            result.setOptions({
              modifiers: [{
                name: 'computeStyles',
                options: { gpuAcceleration: true }
              }]
            });
          }
          return result;
        };
      }
    }

    // Bootstrap tooltips/popovers
    if (window.bootstrap) {
      ['Tooltip', 'Popover'].forEach(component => {
        if (window.bootstrap[component]) {
          const DefaultConfig = window.bootstrap[component].Default;
          if (DefaultConfig) {
            DefaultConfig.delay = { show: 1, hide: 1 };
            DefaultConfig.animation = true;
          }
        }
      });
    }
  }

  /* ---------------------------------------------------------
   * 6) Media loading hints — safe, standards-based
   * --------------------------------------------------------- */
  function applyMediaHints(root) {
    const scope = root || document;

    // Images
    const imgs = scope.querySelectorAll && scope.querySelectorAll('img');
    if (imgs && imgs.length) {
      imgs.forEach(img => {
        if (!img.hasAttribute('loading')) {
          let top = 100000;
          try { top = img.getBoundingClientRect().top; } catch {}
          img.loading = (top < 800) ? 'eager' : 'lazy';
        }
        if (!img.hasAttribute('decoding')) {
          img.decoding = 'async';
        }
        if (!img.hasAttribute('fetchpriority')) {
          let top = 100000;
          try { top = img.getBoundingClientRect().top; } catch {}
          if (top < 400) img.fetchPriority = 'high';
        }
      });
    }

    // Iframes
    const ifr = scope.querySelectorAll && scope.querySelectorAll('iframe');
    if (ifr && ifr.length) {
      ifr.forEach(f => {
        if (!f.hasAttribute('loading')) {
          let top = 100000;
          try { top = f.getBoundingClientRect().top; } catch {}
          f.loading = (top < 800) ? 'eager' : 'lazy';
        }
      });
    }
  }

  /* ---------------------------------------------------------
   * 7) Initialize everything
   * --------------------------------------------------------- */

  // Patch jQuery immediately if available
  patchJQuery();

  // Patch tooltip libraries
  patchTooltipLibraries();

  // First pass for media hints
  applyMediaHints(document);

  // Wait for jQuery and other libraries to load
  function checkAndPatch() {
    patchJQuery();
    patchTooltipLibraries();
  }

  // Multiple timing strategies to catch libraries
  setTimeout(checkAndPatch, 50);
  setTimeout(checkAndPatch, 200);
  setTimeout(checkAndPatch, 1000);

  // DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndPatch, { once: true });
  }

  // Window load
  window.addEventListener('load', () => {
    checkAndPatch();
    applyMediaHints(document);
  }, { once: true, passive: true });

  // Observe incoming nodes
  try {
    const mo = new MutationObserver(muts => {
      for (const m of muts) {
        const nodes = m.addedNodes;
        if (!nodes) continue;
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          if (node && node.nodeType === 1) {
            if (node.tagName === 'IMG' || node.tagName === 'IFRAME') {
              applyMediaHints(node.parentNode || node);
            } else if (typeof node.querySelectorAll === 'function') {
              applyMediaHints(node);

              // Check for dynamically loaded libraries
              if (node.tagName === 'SCRIPT') {
                setTimeout(checkAndPatch, 100);
              }
            }
          }
        }
      }
    });
    mo.observe(document.documentElement || document, { childList: true, subtree: true });
  } catch {}

  // Catch libraries loaded via module systems
  const originalDefine = window.define;
  if (typeof originalDefine === 'function') {
    window.define = function(...args) {
      const result = originalDefine.apply(this, args);
      setTimeout(checkAndPatch, 50);
      return result;
    };
    Object.assign(window.define, originalDefine);
  }

  // Patch requestAnimationFrame for smoother animations
  const _raf = window.requestAnimationFrame;
  if (_raf) {
    window.requestAnimationFrame = function(callback) {
      return _raf.call(this, function(timestamp) {
        try {
          return callback(timestamp);
        } catch (e) {
          console.warn('DNA Shield: RAF callback error:', e);
        }
      });
    };
  }

})();
