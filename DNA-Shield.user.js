// ==UserScript==
// @name		DNA Shield
// @namespace	DNA Shield
// @version		11.0
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

(function() {
'use strict';

// ========== Advanced Site Intelligence ==========
const analyzeCurrentSite = () => {
    const hostname = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    const userAgent = navigator.userAgent.toLowerCase();

    return {
        // Site categories
        isEcommerce: /tokopedia|shopee|lazada|bukalapak|blibli|amazon|ebay|aliexpress|walmart|target/.test(hostname),
        isVideo: /youtube|vimeo|dailymotion|twitch|netflix|hulu|disney/.test(hostname),
        isSocial: /facebook|twitter|instagram|linkedin|tiktok|reddit|snapchat/.test(hostname),
        isNews: /detik|kompas|cnn|bbc|reuters|tempo|guardian|nytimes/.test(hostname),
        isBanking: /bca|mandiri|bni|bri|cimb|danamon|bank|paypal|stripe/.test(hostname),
        isGaming: /steam|epic|origin|battle\.net|riot|roblox|minecraft/.test(hostname),
        isStreaming: /spotify|soundcloud|pandora|deezer/.test(hostname),
        isProductivity: /trello|asana|slack|teams|notion|airtable/.test(hostname),

        // Performance characteristics
        isReactApp: /react/i.test(document.documentElement.innerHTML) || window.React,
        isVueApp: window.Vue || document.querySelector('[data-vue]'),
        isAngularApp: window.angular || document.querySelector('[ng-app]'),
        isSPA: history.pushState && !window.location.hash,

        // Device characteristics
        isMobile: /mobile|android|iphone|ipad/.test(userAgent),
        isTablet: /tablet|ipad/.test(userAgent),
        isDesktop: !/mobile|tablet|android|iphone|ipad/.test(userAgent),

        // Browser capabilities
        supportsWebGL: !!window.WebGLRenderingContext,
        supportsWorkers: !!window.Worker,
        supportsIntersectionObserver: !!window.IntersectionObserver,

        // Performance hints
        hasHeavyAnimations: document.querySelectorAll('[class*="animate"], [class*="transition"]').length > 10,
        hasVideoContent: document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]').length > 0,
        hasLazyLoading: document.querySelectorAll('[loading="lazy"], [data-lazy]').length > 0
    };
};

const siteProfile = analyzeCurrentSite();

// Skip on critical sites completely
if (siteProfile.isBanking || siteProfile.isProductivity) {
    return;
}

// ========== Ultra-Safe Execution Framework ==========
const SafeExecution = {
    errors: 0,
    maxErrors: 3,

    execute(fn, context = 'Unknown', fallback = () => false) {
        if (this.errors >= this.maxErrors) {
            return fallback();
        }

        try {
            return fn();
        } catch (e) {
            this.errors++;
            if (this.errors >= this.maxErrors) {
                console.warn('DNA Shield: Too many errors, entering safe mode');
            }
            return fallback();
        }
    },

    defineProperty(obj, prop, descriptor) {
        return this.execute(() => {
            if (!obj || typeof obj !== 'object' || !prop) return false;

            const existing = Object.getOwnPropertyDescriptor(obj, prop);
            if (existing && !existing.configurable) return false;

            Object.defineProperty(obj, prop, {
                ...descriptor,
                configurable: true
            });
            return true;
        }, `defineProperty:${prop}`);
    },

    patchFunction(obj, methodName, newImpl, context = '') {
        return this.execute(() => {
            if (!obj || !obj[methodName] || typeof obj[methodName] !== 'function') return false;

            const original = obj[methodName].bind(obj);
            obj[methodName] = function(...args) {
                try {
                    return newImpl.call(this, original, ...args);
                } catch (e) {
                    return original.apply(this, args);
                }
            };
            return true;
        }, `patchFunction:${methodName}${context}`);
    }
};

// ========== Hyper-Aggressive CSS Performance ==========
const createHyperPerformanceCSS = () => {
    let aggressiveness = 1; // Base level

    // Increase aggressiveness based on site characteristics
    if (siteProfile.isEcommerce) aggressiveness = 2;
    if (siteProfile.isNews) aggressiveness = 3;
    if (siteProfile.isSPA && !siteProfile.hasVideoContent) aggressiveness = 4;
    if (siteProfile.isDesktop && !siteProfile.hasHeavyAnimations) aggressiveness = 5;

    const baseDuration = Math.max(0.01, 0.2 / aggressiveness);
    const hoverDuration = Math.max(0.005, 0.1 / aggressiveness);

    let css = `
    /* HYPER-PERFORMANCE MODE - LEVEL ${aggressiveness} */
    *, *::before, *::after {
        /* Ultra-fast animations */
        -webkit-animation-duration: ${baseDuration}s !important;
        -moz-animation-duration: ${baseDuration}s !important;
        -ms-animation-duration: ${baseDuration}s !important;
        -o-animation-duration: ${baseDuration}s !important;
        animation-duration: ${baseDuration}s !important;

        /* Ultra-fast transitions */
        -webkit-transition-duration: ${baseDuration}s !important;
        -moz-transition-duration: ${baseDuration}s !important;
        -ms-transition-duration: ${baseDuration}s !important;
        -o-transition-duration: ${baseDuration}s !important;
        transition-duration: ${baseDuration}s !important;

        /* Zero delays */
        -webkit-animation-delay: 0s !important;
        -moz-animation-delay: 0s !important;
        -ms-animation-delay: 0s !important;
        -o-animation-delay: 0s !important;
        animation-delay: 0s !important;

        -webkit-transition-delay: 0s !important;
        -moz-transition-delay: 0s !important;
        -ms-transition-delay: 0s !important;
        -o-transition-delay: 0s !important;
        transition-delay: 0s !important;

        /* Performance optimizations */
        will-change: auto !important;
        contain: layout style paint !important;
        scroll-behavior: auto !important;

        /* GPU acceleration control */
        -webkit-transform: translateZ(0) !important;
        transform: translateZ(0) !important;

        /* Text rendering optimization */
        text-rendering: optimizeSpeed !important;
        -webkit-font-smoothing: subpixel-antialiased !important;

        /* Remove expensive effects */
        ${aggressiveness >= 3 ? `
        filter: none !important;
        backdrop-filter: none !important;
        box-shadow: none !important;
        text-shadow: none !important;
        ` : ''}

        /* Disable transform-style for performance */
        -webkit-transform-style: flat !important;
        -moz-transform-style: flat !important;
        -ms-transform-style: flat !important;
        transform-style: flat !important;
    }

    /* Hyper-fast interactive states */
    :hover, :focus, :active {
        -webkit-transition-duration: ${hoverDuration}s !important;
        -moz-transition-duration: ${hoverDuration}s !important;
        -ms-transition-duration: ${hoverDuration}s !important;
        -o-transition-duration: ${hoverDuration}s !important;
        transition-duration: ${hoverDuration}s !important;
    }

    /* Optimize common UI elements */
    button, input, select, textarea, a {
        transition-duration: ${hoverDuration}s !important;
    }

    /* Scroll optimization */
    html, body {
        scroll-behavior: auto !important;
        -webkit-overflow-scrolling: auto !important;
    }

    /* Image optimization */
    img {
        image-rendering: optimizeSpeed !important;
        ${aggressiveness >= 4 ? 'image-rendering: pixelated !important;' : ''}
    }
    `;

    // Site-specific ultra-optimizations
    if (siteProfile.isEcommerce) {
        css += `
        /* E-commerce hyper-optimizations */
        .product-card, .item-card, .listing-item {
            transition-duration: 0.01s !important;
            contain: strict !important;
        }

        .carousel, .slider, .banner {
            animation-duration: 0.05s !important;
        }

        /* Product image optimization */
        .product-image, .item-image {
            image-rendering: optimizeSpeed !important;
            transition: none !important;
        }
        `;
    }

    if (siteProfile.isNews) {
        css += `
        /* News site optimizations */
        .article-item, .news-card, .post-preview {
            transition: none !important;
            animation: none !important;
        }

        /* Reading optimization */
        p, article, .content {
            text-rendering: optimizeSpeed !important;
        }
        `;
    }

    if (siteProfile.isSocial) {
        css += `
        /* Social media optimizations */
        .feed-item, .post, .tweet, .story {
            animation-duration: 0.01s !important;
            transition-duration: 0.01s !important;
        }

        .like-animation, .reaction-animation {
            animation-duration: 0.02s !important;
        }
        `;
    }

    return css;
};

// ========== Advanced Animation System Override ==========
const hyperOptimizeAnimations = () => {
    // Override CSS animations at the engine level
    SafeExecution.execute(() => {
        const styleSheet = document.createElement('style');
        styleSheet.textContent = createHyperPerformanceCSS();
        (document.head || document.documentElement).appendChild(styleSheet);
    }, 'injectHyperCSS');

    // Override getComputedStyle for animation properties
    if (window.getComputedStyle && !siteProfile.isVideo && !siteProfile.isGaming) {
        SafeExecution.patchFunction(window, 'getComputedStyle', (original, element, pseudoElt) => {
            const computedStyle = original(element, pseudoElt);
            const hyperSpeed = siteProfile.isDesktop ? '0.01s' : '0.05s';

            // Create a proxy to override animation-related properties
            return new Proxy(computedStyle, {
                get(target, prop) {
                    if (prop === 'animationDuration' || prop === 'transitionDuration') {
                        return hyperSpeed;
                    }
                    if (prop === 'animationDelay' || prop === 'transitionDelay') {
                        return '0s';
                    }
                    return target[prop];
                }
            });
        }, ':getComputedStyle');
    }
};

// ========== Hyper-Aggressive jQuery Optimization ==========
const hyperOptimizeJQuery = () => {
    const optimizeJQueryInstance = (jq) => {
        if (!jq || !jq.fn) return;

        // Override animation methods
        const hyperSpeed = siteProfile.isDesktop ? 10 : 50;

        SafeExecution.execute(() => {
            // Speed settings
            if (jq.fx) {
                jq.fx.speeds = { slow: hyperSpeed * 2, fast: hyperSpeed / 2, _default: hyperSpeed };
                if (!siteProfile.hasVideoContent && !siteProfile.isGaming) {
                    jq.fx.off = true;
                }
            }

            // Override animate function
            if (jq.fn.animate) {
                const originalAnimate = jq.fn.animate;
                jq.fn.animate = function(prop, speed, easing, callback) {
                    // Preserve callbacks but hyper-speed animations
                    const hyperCallback = () => {
                        if (typeof callback === 'function') callback.call(this);
                        else if (typeof easing === 'function') easing.call(this);
                        else if (typeof speed === 'function') speed.call(this);
                    };

                    if (siteProfile.isVideo || siteProfile.isGaming) {
                        return originalAnimate.call(this, prop, Math.min(speed || 400, 100), easing, callback);
                    }

                    // Apply properties instantly but trigger callback
                    this.css(prop);
                    setTimeout(hyperCallback, 1);
                    return this;
                };
            }

            // Override other animation methods
            ['fadeIn', 'fadeOut', 'slideUp', 'slideDown', 'show', 'hide'].forEach(method => {
                if (jq.fn[method]) {
                    const originalMethod = jq.fn[method];
                    jq.fn[method] = function(speed, callback) {
                        if (siteProfile.isVideo || siteProfile.isGaming) {
                            return originalMethod.call(this, hyperSpeed, callback);
                        }

                        // Instant execution with callback preservation
                        const element = this;
                        setTimeout(() => {
                            if (method.includes('fade')) {
                                element.css('opacity', method === 'fadeIn' ? 1 : 0);
                            } else if (method.includes('slide')) {
                                element.css('height', method === 'slideDown' ? 'auto' : 0);
                            } else {
                                element.css('display', method === 'show' ? 'block' : 'none');
                            }

                            if (typeof speed === 'function') speed.call(this);
                            else if (typeof callback === 'function') callback.call(this);
                        }, 1);

                        return this;
                    };
                }
            });
        }, 'optimizeJQuery');
    };

    // Apply to all jQuery instances
    const checkAndOptimize = () => {
        [window.jQuery, window.$, unsafeWindow?.jQuery, unsafeWindow?.$, window.wrappedJSObject?.jQuery].forEach(jq => {
            if (jq) optimizeJQueryInstance(jq);
        });
    };

    checkAndOptimize();
    window.addEventListener('load', checkAndOptimize, { once: true });

    // Watch for jQuery loading
    let jqueryCheckCount = 0;
    const jqueryWatcher = setInterval(() => {
        checkAndOptimize();
        jqueryCheckCount++;
        if (jqueryCheckCount > 20) clearInterval(jqueryWatcher); // Stop after 10 seconds
    }, 500);
};

// ========== Hyper requestAnimationFrame System ==========
const hyperOptimizeRAF = () => {
    if (siteProfile.isVideo || siteProfile.isGaming) return; // Preserve for media sites

    SafeExecution.patchFunction(window, 'requestAnimationFrame', (original, callback) => {
        if (typeof callback !== 'function') return original(callback);

        // Hyper-fast execution based on device capability
        const delay = siteProfile.isDesktop ? 4 : 8; // 250fps or 125fps
        return setTimeout(callback, delay);
    }, ':RAF');

    // Also optimize cancelAnimationFrame
    SafeExecution.patchFunction(window, 'cancelAnimationFrame', (original, id) => {
        clearTimeout(id);
        return original(id);
    }, ':cancelRAF');
};

// ========== Intelligent Timer Optimization ==========
const hyperOptimizeTimers = () => {
    let timerStats = { fast: 0, medium: 0, slow: 0, optimized: 0 };

    SafeExecution.patchFunction(window, 'setTimeout', (original, fn, delay, ...args) => {
        if (typeof fn !== 'function') return original(fn, delay, ...args);

        // Analyze timer patterns
        if (delay <= 16) timerStats.fast++;
        else if (delay <= 100) timerStats.medium++;
        else timerStats.slow++;

        let optimizedDelay = delay;

        // Intelligent optimization based on site profile
        if (siteProfile.isEcommerce && delay < 50) {
            optimizedDelay = Math.max(delay, 8); // Minimum for smooth UX
            timerStats.optimized++;
        } else if (siteProfile.isNews && delay < 100) {
            optimizedDelay = Math.max(delay, 4); // Ultra-fast for reading sites
            timerStats.optimized++;
        } else if (!siteProfile.hasVideoContent && delay < 4) {
            optimizedDelay = 4; // Prevent excessive micro-delays
            timerStats.optimized++;
        }

        return original(fn, optimizedDelay, ...args);
    }, ':setTimeout');

    SafeExecution.patchFunction(window, 'setInterval', (original, fn, delay, ...args) => {
        if (typeof fn !== 'function') return original(fn, delay, ...args);

        let optimizedDelay = delay;

        // Optimize intervals more aggressively
        if (!siteProfile.hasVideoContent && !siteProfile.isGaming) {
            if (delay < 16) optimizedDelay = 16; // 60fps max
            else if (delay < 100) optimizedDelay = Math.min(delay * 1.5, 100); // Slow down excessive intervals
        }

        return original(fn, optimizedDelay, ...args);
    }, ':setInterval');

    // Log optimization stats after 30 seconds
    setTimeout(() => {
        if (timerStats.optimized > 0) {
            console.debug('DNA Shield: Timer optimizations:', timerStats);
        }
    }, 30000);
};

// ========== Advanced Event System Optimization ==========
const hyperOptimizeEvents = () => {
    const eventOptimizations = new Map();

    // Event throttling for performance-heavy events
    const createThrottledHandler = (originalHandler, throttleMs) => {
        let throttled = false;
        let lastArgs = null;

        return function(...args) {
            lastArgs = args;
            if (!throttled) {
                throttled = true;
                setTimeout(() => {
                    throttled = false;
                    if (lastArgs) {
                        originalHandler.apply(this, lastArgs);
                        lastArgs = null;
                    }
                }, throttleMs);
            }
        };
    };

    // Override addEventListener for performance events
    SafeExecution.patchFunction(EventTarget.prototype, 'addEventListener', (original, type, listener, options) => {
        if (typeof listener !== 'function') return original(type, listener, options);

        let optimizedListener = listener;
        const throttleMs = siteProfile.isDesktop ? 8 : 16;

        // Throttle performance-heavy events
        if (['scroll', 'resize', 'mousemove', 'pointermove', 'touchmove'].includes(type)) {
            optimizedListener = createThrottledHandler(listener, throttleMs);
            eventOptimizations.set(listener, optimizedListener);
        }

        // Passive events for better performance
        if (['scroll', 'wheel', 'touchstart', 'touchmove'].includes(type)) {
            if (typeof options === 'object') {
                options.passive = true;
            } else {
                options = { passive: true, capture: !!options };
            }
        }

        return original(type, optimizedListener, options);
    }, ':addEventListener');

    // Handle removeEventListener
    SafeExecution.patchFunction(EventTarget.prototype, 'removeEventListener', (original, type, listener, options) => {
        const optimizedListener = eventOptimizations.get(listener) || listener;
        eventOptimizations.delete(listener);
        return original(type, optimizedListener, options);
    }, ':removeEventListener');
};

// ========== Advanced Focus and Visibility Management ==========
const hyperOptimizeFocus = () => {
    // Aggressive visibility optimization (safe for most sites)
    if (!siteProfile.hasVideoContent) {
        SafeExecution.defineProperty(document, 'hidden', {
            get: () => false,
            enumerable: true
        });

        SafeExecution.defineProperty(document, 'visibilityState', {
            get: () => 'visible',
            enumerable: true
        });

        // Block visibility change events
        SafeExecution.execute(() => {
            ['visibilitychange', 'webkitvisibilitychange', 'blur', 'pagehide'].forEach(eventType => {
                document.addEventListener(eventType, (e) => {
                    e.stopImmediatePropagation();
                }, true);
            });
        }, 'blockVisibilityEvents');
    }

    // Optimize hasFocus
    SafeExecution.defineProperty(document, 'hasFocus', {
        value: () => true,
        writable: false
    });
};

// ========== Performance Monitoring and Auto-Tuning ==========
const setupPerformanceMonitoring = () => {
    let performanceMetrics = {
        cssOptimized: true,
        jqueryOptimized: true,
        rafOptimized: !siteProfile.isVideo && !siteProfile.isGaming,
        timersOptimized: true,
        eventsOptimized: true,
        focusOptimized: !siteProfile.hasVideoContent,
        aggressivenessLevel: siteProfile.isDesktop ? (siteProfile.isNews ? 5 : 3) : 2
    };

    // Auto-tune performance based on site behavior
    let frameCount = 0;
    let lastFrameTime = performance.now();

    const monitorPerformance = () => {
        frameCount++;
        const currentTime = performance.now();
        const deltaTime = currentTime - lastFrameTime;

        if (frameCount % 60 === 0) { // Check every 60 frames
            const fps = 1000 / (deltaTime / 60);

            if (fps < 30 && performanceMetrics.aggressivenessLevel < 5) {
                // Increase aggressiveness if performance is poor
                performanceMetrics.aggressivenessLevel++;
                console.debug('DNA Shield: Increasing performance aggressiveness to level', performanceMetrics.aggressivenessLevel);
            }
        }

        lastFrameTime = currentTime;
        if (frameCount < 600) requestAnimationFrame(monitorPerformance); // Monitor for 10 seconds
    };

    if (!siteProfile.isVideo && !siteProfile.isGaming) {
        requestAnimationFrame(monitorPerformance);
    }

    // Log final performance report
    setTimeout(() => {
        console.info('DNA Shield Turbo: Performance profile active', {
            site: {
                type: siteProfile.isEcommerce ? 'E-commerce' :
                      siteProfile.isNews ? 'News' :
                      siteProfile.isSocial ? 'Social' : 'General',
                framework: siteProfile.isReactApp ? 'React' :
                          siteProfile.isVueApp ? 'Vue' :
                          siteProfile.isAngularApp ? 'Angular' : 'Vanilla',
                device: siteProfile.isDesktop ? 'Desktop' : siteProfile.isTablet ? 'Tablet' : 'Mobile'
            },
            optimizations: performanceMetrics
        });
    }, 5000);
};

// ========== Initialization System ==========
const initializeHyperPerformance = () => {
    const initSteps = [
        () => hyperOptimizeAnimations(),
        () => hyperOptimizeJQuery(),
        () => hyperOptimizeRAF(),
        () => hyperOptimizeTimers(),
        () => hyperOptimizeEvents(),
        () => hyperOptimizeFocus(),
        () => setupPerformanceMonitoring()
    ];

    // Execute immediately for maximum performance
    initSteps.forEach((step, index) => {
        setTimeout(step, index * 10); // Stagger by 10ms each
    });

    // Additional optimization after DOM is ready
    const domReadyOptimizations = () => {
        // Re-apply CSS optimizations for dynamic content
        SafeExecution.execute(() => {
            const newStyle = document.createElement('style');
            newStyle.textContent = createHyperPerformanceCSS();
            document.head.appendChild(newStyle);
        }, 'reapplyCSS');
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', domReadyOptimizations, { once: true });
    } else {
        domReadyOptimizations();
    }
};

// ========== Safety and Cleanup ==========
const setupSafetyNet = () => {
    // Monitor for conflicts
    let conflictCount = 0;
    const originalConsoleError = console.error;

    console.error = function(...args) {
        const message = args.join(' ');
        if (message.includes('DNA Shield') || message.includes('animation') || message.includes('transition')) {
            conflictCount++;
            if (conflictCount > 5) {
                console.warn('DNA Shield: Potential conflicts detected, entering ultra-safe mode');
                SafeExecution.maxErrors = 1; // Become more conservative
            }
        }
        return originalConsoleError.apply(console, args);
    };

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        SafeExecution.execute(() => {
            document.querySelectorAll('style[id*="dna-shield"]').forEach(style => style.remove());
        }, 'cleanup');
    }, { once: true });

    // Emergency shutdown if too many errors
    if (SafeExecution.errors >= SafeExecution.maxErrors) {
        console.warn('DNA Shield: Emergency safe mode activated');
        return;
    }
};

// ========== Main Execution ==========
setupSafetyNet();
initializeHyperPerformance();

})();
// ========== DNA Shield End ==========
