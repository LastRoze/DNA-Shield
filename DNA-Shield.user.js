// ==UserScript==
// @name		DNA Shield
// @namespace	DNA Shield
// @version		11.1
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

(() => {
'use strict';

// ========== BULLETPROOF SAFETY CORE ==========
const BULLETPROOF = {
    // Ultra-safe execution - never throws
    safe(fn, fallback = () => {}) {
        try { return fn() || fallback(); } catch { return fallback(); }
    },

    // Check if property can be modified
    canSet(obj, prop) {
        return this.safe(() => {
            if (!obj || typeof obj !== 'object') return false;
            const desc = Object.getOwnPropertyDescriptor(obj, prop);
            return !desc || desc.writable !== false || desc.set || desc.configurable !== false;
        });
    },

    // Safe property override
    set(obj, prop, value) {
        return this.safe(() => {
            if (!this.canSet(obj, prop)) return false;
            obj[prop] = value;
            return true;
        });
    },

    // Safe function patching
    patch(obj, method, impl) {
        return this.safe(() => {
            if (!obj[method] || typeof obj[method] !== 'function') return false;
            if (!this.canSet(obj, method)) return false;

            const original = obj[method];
            obj[method] = function(...args) {
                try { return impl.call(this, original.bind(this), ...args); }
                catch { return original.apply(this, args); }
            };
            return true;
        });
    }
};

// ========== INSANE SPEED CSS INJECTION ==========
const HYPER_CSS = `
/* INSANE SPEED MODE - ZERO COMPROMISE */
*,*::before,*::after,*:hover,*:focus,*:active {
    animation-duration: 0.001s !important;
    animation-delay: 0s !important;
    transition-duration: 0.001s !important;
    transition-delay: 0s !important;
    animation-fill-mode: forwards !important;
    animation-play-state: running !important;
}

/* MAXIMUM PERFORMANCE OPTIMIZATIONS */
* {
    scroll-behavior: auto !important;
}

/* ULTRA-FAST INTERACTIONS */
button,input,select,textarea,a,[onclick],[role="button"] {
    animation-duration: 0.001s !important;
    transition-duration: 0.001s !important;
}

/* REMOVE ALL EXPENSIVE EFFECTS */
* {
    background-attachment: scroll !important;
}

/* HYPER-SPEED TEXT RENDERING */
* {
    text-rendering: optimizeSpeed !important;
    -webkit-font-smoothing: subpixel-antialiased !important;
    -moz-osx-font-smoothing: auto !important;
    font-smooth: never !important;
}

/* INSTANT SCROLL */
html,body {
    scroll-behavior: auto !important;
    -webkit-overflow-scrolling: auto !important;
    overflow-anchor: none !important;
}

/* DISABLE SMOOTH SCROLLING EVERYWHERE */
[style*="scroll-behavior"],[style*="smooth"] {
    scroll-behavior: auto !important;
}

/* MAXIMUM IMAGE PERFORMANCE */
img,picture,video,canvas,svg {
    image-rendering: optimizeSpeed !important;
    image-rendering: pixelated !important;
    image-rendering: -moz-crisp-edges !important;
    image-rendering: -webkit-optimize-contrast !important;
}

/* INSTANT HOVER STATES */
:hover {
    transition: none !important;
    animation: none !important;
}

/* REMOVE SELECTION DELAYS */
* {
    -webkit-touch-callout: none !important;
    -webkit-user-select: auto !important;
    -moz-user-select: auto !important;
    -ms-user-select: auto !important;
    user-select: auto !important;
}
`;

// ========== INSTANT CSS INJECTION (MULTIPLE METHODS) ==========
const INSTANT_CSS = {
    inject() {
        // Method 1: GM_addStyle (fastest for userscripts)
        BULLETPROOF.safe(() => {
            if (typeof GM_addStyle === 'function') GM_addStyle(HYPER_CSS);
        });

        // Method 2: Direct style injection
        BULLETPROOF.safe(() => {
            const style = document.createElement('style');
            style.id = 'dna-insane-speed';
            style.textContent = HYPER_CSS;
            (document.head || document.documentElement || document.body)?.appendChild(style);
        });

        // Method 3: Observer for early DOM
        BULLETPROOF.safe(() => {
            if (!document.head && !document.documentElement) {
                const observer = new MutationObserver(() => {
                    if (document.head || document.documentElement) {
                        const style = document.createElement('style');
                        style.textContent = HYPER_CSS;
                        (document.head || document.documentElement).appendChild(style);
                        observer.disconnect();
                    }
                });
                observer.observe(document, { childList: true, subtree: true });
            }
        });
    }
};

// ========== INSANE ANIMATION SYSTEM OVERRIDE ==========
const INSANE_ANIMATIONS = {
    apply() {
        // Override requestAnimationFrame to hyper-speed
        BULLETPROOF.patch(window, 'requestAnimationFrame', (original, callback) => {
            if (typeof callback !== 'function') return original(callback);
            // 500fps - INSANE speed
            return setTimeout(callback, 2);
        });

        // Update cancelAnimationFrame
        BULLETPROOF.set(window, 'cancelAnimationFrame', (id) => clearTimeout(id));

        // Override setTimeout for micro-optimizations
        BULLETPROOF.patch(window, 'setTimeout', (original, fn, delay, ...args) => {
            if (typeof fn !== 'function') return original(fn, delay, ...args);
            // Minimum 1ms delay - MAXIMUM SPEED
            return original(fn, Math.max(delay || 0, 1), ...args);
        });

        // Override setInterval for performance
        BULLETPROOF.patch(window, 'setInterval', (original, fn, delay, ...args) => {
            if (typeof fn !== 'function') return original(fn, delay, ...args);
            // Minimum 4ms interval for stability
            return original(fn, Math.max(delay || 100, 4), ...args);
        });

        // Override Date.now for consistent timing
        const startTime = Date.now();
        let fakeTime = startTime;
        BULLETPROOF.patch(Date, 'now', (original) => {
            fakeTime += 16; // Simulate 60fps
            return fakeTime;
        });

        // Override performance.now for ultra-smooth animations
        if (window.performance && window.performance.now) {
            let perfTime = performance.now();
            BULLETPROOF.patch(window.performance, 'now', (original) => {
                perfTime += 2; // 500fps simulation
                return perfTime;
            });
        }
    }
};

// ========== INSANE JQUERY SPEED BOOST ==========
const INSANE_JQUERY = {
    optimize(jq) {
        if (!jq?.fn) return;

        BULLETPROOF.safe(() => {
            // Ultra-fast jQuery settings
            if (jq.fx) {
                jq.fx.speeds = { slow: 1, fast: 1, _default: 1 };
                jq.fx.interval = 1;
                jq.fx.off = false; // Keep animations but make them instant
            }

            // Override all animation methods for INSTANT execution
            const animMethods = ['animate', 'fadeIn', 'fadeOut', 'fadeToggle', 'fadeTo',
                               'slideUp', 'slideDown', 'slideToggle', 'show', 'hide', 'toggle'];

            animMethods.forEach(method => {
                if (jq.fn[method]) {
                    BULLETPROOF.patch(jq.fn, method, (original, ...args) => {
                        // Extract callback from any position
                        let callback = null;
                        for (let arg of args) {
                            if (typeof arg === 'function') {
                                callback = arg;
                                break;
                            }
                        }

                        // Apply changes instantly
                        if (method === 'animate' && args[0]) {
                            this.css(args[0]);
                        } else if (method.includes('fade')) {
                            this.css('opacity', method === 'fadeIn' ? 1 : 0);
                        } else if (method.includes('slide')) {
                            this.css('height', method === 'slideDown' ? 'auto' : 0);
                        } else if (method === 'show') {
                            this.css('display', 'block');
                        } else if (method === 'hide') {
                            this.css('display', 'none');
                        }

                        // Fire callback immediately
                        if (callback) {
                            setTimeout(() => callback.call(this[0] || this), 0);
                        }

                        return this;
                    });
                }
            });

            // Override jQuery's internal timer
            if (jq.timers) {
                jq.timers.length = 0; // Clear all timers
            }
        });
    },

    monitor() {
        // Immediate check
        [window.$, window.jQuery, unsafeWindow?.$, unsafeWindow?.jQuery].forEach(jq => {
            if (jq) this.optimize(jq);
        });

        // Continuous monitoring for jQuery
        let checks = 0;
        const interval = setInterval(() => {
            [window.$, window.jQuery, unsafeWindow?.$, unsafeWindow?.jQuery].forEach(jq => {
                if (jq) this.optimize(jq);
            });

            if (++checks > 50) clearInterval(interval); // Stop after 5 seconds
        }, 100);
    }
};

// ========== INSANE EVENT SYSTEM OPTIMIZATION ==========
const INSANE_EVENTS = {
    apply() {
        // Make ALL events passive for maximum performance
        if (EventTarget?.prototype?.addEventListener) {
            BULLETPROOF.patch(EventTarget.prototype, 'addEventListener', (original, type, listener, options) => {
                if (typeof listener !== 'function') return original.call(this, type, listener, options);

                // Force passive for performance events
                const forcePassive = ['scroll', 'wheel', 'touchstart', 'touchmove', 'touchend', 'mousemove', 'pointermove'];

                if (forcePassive.includes(type)) {
                    const passiveOptions = typeof options === 'object' ?
                        { ...options, passive: true } :
                        { passive: true, capture: !!options };
                    return original.call(this, type, listener, passiveOptions);
                }

                return original.call(this, type, listener, options);
            });
        }

        // Override scroll events for instant response
        BULLETPROOF.patch(window, 'addEventListener', (original, type, listener, options) => {
            if (type === 'scroll' && typeof listener === 'function') {
                // Throttle scroll events to 500fps
                let lastCall = 0;
                const throttledListener = (e) => {
                    const now = performance.now();
                    if (now - lastCall > 2) {
                        lastCall = now;
                        listener(e);
                    }
                };
                return original.call(this, type, throttledListener, options);
            }
            return original.call(this, type, listener, options);
        });
    }
};

// ========== INSANE VISIBILITY OVERRIDE ==========
const INSANE_VISIBILITY = {
    apply() {
        // Force page to always be "visible" for maximum performance
        BULLETPROOF.set(document, 'hidden', false);
        BULLETPROOF.set(document, 'visibilityState', 'visible');

        // Override hasFocus
        if ('hasFocus' in document) {
            BULLETPROOF.set(document, 'hasFocus', () => true);
        }

        // Block visibility events
        const blockEvents = ['visibilitychange', 'webkitvisibilitychange', 'mozvisibilitychange', 'blur', 'focus'];
        blockEvents.forEach(eventType => {
            BULLETPROOF.safe(() => {
                document.addEventListener(eventType, (e) => {
                    e.stopImmediatePropagation();
                }, { capture: true, passive: false });
            });
        });

        // Force window focus
        BULLETPROOF.set(window, 'document', new Proxy(document, {
            get(target, prop) {
                if (prop === 'hidden') return false;
                if (prop === 'visibilityState') return 'visible';
                if (prop === 'hasFocus') return () => true;
                return target[prop];
            }
        }));
    }
};

// ========== INSANE CSS ANIMATIONS OVERRIDE ==========
const INSANE_CSS_OVERRIDE = {
    apply() {
        // Override getComputedStyle for animation properties
        if (window.getComputedStyle) {
            BULLETPROOF.patch(window, 'getComputedStyle', (original, element, pseudoElt) => {
                const style = original(element, pseudoElt);

                return new Proxy(style, {
                    get(target, prop) {
                        // Force ultra-fast animations
                        if (prop === 'animationDuration' || prop === 'transitionDuration') {
                            return '0.001s';
                        }
                        if (prop === 'animationDelay' || prop === 'transitionDelay') {
                            return '0s';
                        }
                        return target[prop];
                    }
                });
            });
        }

        // Override CSS.supports to disable expensive features
        if (window.CSS && window.CSS.supports) {
            BULLETPROOF.patch(window.CSS, 'supports', (original, ...args) => {
                const property = args[0];
                // Disable expensive CSS features
                if (typeof property === 'string') {
                    if (property.includes('filter') ||
                        property.includes('backdrop-filter') ||
                        property.includes('box-shadow') ||
                        property.includes('text-shadow')) {
                        return false;
                    }
                }
                return original(...args);
            });
        }
    }
};

// ========== INSANE WEB APIS OVERRIDE ==========
const INSANE_APIS = {
    apply() {
        // Override Intersection Observer for instant callbacks
        if (window.IntersectionObserver) {
            BULLETPROOF.patch(window, 'IntersectionObserver', (original, callback, options) => {
                const fastCallback = (entries, observer) => {
                    // Fire callback immediately
                    setTimeout(() => callback(entries, observer), 0);
                };
                return new original(fastCallback, { ...options, rootMargin: '1000px' });
            });
        }

        // Override MutationObserver for instant DOM monitoring
        if (window.MutationObserver) {
            BULLETPROOF.patch(window, 'MutationObserver', (original, callback) => {
                const fastCallback = (mutations, observer) => {
                    setTimeout(() => callback(mutations, observer), 0);
                };
                return new original(fastCallback);
            });
        }

        // Override ResizeObserver for instant resize handling
        if (window.ResizeObserver) {
            BULLETPROOF.patch(window, 'ResizeObserver', (original, callback) => {
                const fastCallback = (entries, observer) => {
                    setTimeout(() => callback(entries, observer), 0);
                };
                return new original(fastCallback);
            });
        }
    }
};

// ========== INSTANT EXECUTION SYSTEM ==========
const INSANE_INIT = {
    run() {
        // Phase 1: Instant CSS (0ms)
        INSTANT_CSS.inject();

        // Phase 2: Core overrides (immediate)
        INSANE_ANIMATIONS.apply();
        INSANE_VISIBILITY.apply();
        INSANE_CSS_OVERRIDE.apply();
        INSANE_EVENTS.apply();
        INSANE_APIS.apply();

        // Phase 3: jQuery monitoring (immediate)
        INSANE_JQUERY.monitor();

        // Phase 4: Continuous optimization
        const continuousOpt = () => {
            INSTANT_CSS.inject(); // Re-inject CSS
            INSANE_JQUERY.monitor(); // Re-check jQuery
        };

        // Run optimizations every 100ms for 2 seconds
        let optCount = 0;
        const optInterval = setInterval(() => {
            continuousOpt();
            if (++optCount > 20) clearInterval(optInterval);
        }, 100);

        // Final report
        setTimeout(() => {
            console.info('🚀💨 DNA SHIELD: INSANE SPEED MODE ACTIVE - ZERO COMPROMISE');
        }, 500);

        // Cleanup
        BULLETPROOF.safe(() => {
            window.addEventListener('beforeunload', () => {
                document.getElementById('dna-insane-speed')?.remove();
            }, { once: true, passive: true });
        });
    }
};

// ========== EXECUTE IMMEDIATELY ==========
INSANE_INIT.run();

})();
