// ==UserScript==
// @name		DNA Shield
// @namespace	DNA Shield
// @version		9.2
// @author		Last Roze
// @description	Dominion With Domination
// @copyright	©2021 - 2023 // Yoga Budiman
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
// @exclude		https://docs.google.com/*
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

// ========== DNA Native Start ==========
function fakeForward() {}
unsafeWindow.history.forward = fakeForward;

(function () {
  window.seconds = -1;
})();

unsafeWindow.onblur = null;
unsafeWindow.blurred = false;

unsafeWindow.document.hasFocus = function () {
  return true;
};

unsafeWindow.window.onFocus = function () {
  return true;
};

Object.defineProperty(document, "hidden", { value: false });
Object.defineProperty(document, "mozHidden", { value: false });
Object.defineProperty(document, "msHidden", { value: false });
Object.defineProperty(document, "webkitHidden", { value: false });
Object.defineProperty(document, "visibilityState", {
  get: function () {
    return "visible";
  },
});

unsafeWindow.document.onvisibilitychange = undefined;

function stopPropagation(event) {
  event.stopImmediatePropagation();
}

["visibilitychange", "webkitvisibilitychange", "blur", "mozvisibilitychange", "msvisibilitychange"].forEach(function(event_name) {
  window.addEventListener(event_name, stopPropagation, true);
});

document.addEventListener('readystatechange', function() {
    var e = document.createElement("script");
    e.setAttribute("src", "https://cdn.jsdelivr.net/npm/turbojs@1.0.2/turbo.min.js");
    document.getElementsByTagName("head").item(0).insertBefore(e, document.getElementById('hvt-script'));
}, false);

(function () {
  if (window.jQuery && window.jQuery.fx) {
    window.jQuery.fx.off = true;
  } else if (window.wrappedJSObject && window.wrappedJSObject.jQuery && window.wrappedJSObject.jQuery.fx) {
    window.wrappedJSObject.jQuery.fx.off = true;
  }
})();

window.addEventListener("load", function () {
  try {
    if (window.jQuery && window.jQuery.fx) {
      window.jQuery.fx.off = true;
    } else if (window.wrappedJSObject && window.wrappedJSObject.jQuery && window.wrappedJSObject.jQuery.fx) {
      window.wrappedJSObject.jQuery.fx.off = true;
    }
  } catch (e) {}
});

var style = document.createElement("style");
style.textContent = `
  *,
  *::before,
  *::after {
    -moz-transition-property: 0.1 !important;
    -ms-transition-property: 0.1 !important;
    -o-transition-property: 0.1 !important;
    -webkit-animation-timing-function: step-end !important;
    -webkit-transition-property: 0.1 !important;
    animation-delay: -1ms !important;
    animation-duration: -1ms !important;
    animation-timing-function: step-end !important;
    scroll-behavior: auto !important;
    transition-delay: -1ms !important;
    transition-duration: -1ms !important;
    transition-property: 0.1 !important;
    transition-timing-function: step-end !important;
    transition: 0.1 !important;
  }

  * {
    -moz-transition-property: 0.1 !important;
    -ms-transition-property: 0.1 !important;
    -o-transition-property: 0.1 !important;
    -webkit-animation-timing-function: step-end !important;
    -webkit-transition-property: 0.1 !important;
    animation-delay: -1ms !important;
    animation-duration: -1ms !important;
    animation-timing-function: step-end !important;
    scroll-behavior: auto !important;
    transition-delay: -1ms !important;
    transition-duration: -1ms !important;
    transition-property: 0.1 !important;
    transition-timing-function: step-end !important;
    transition: 0.1 !important;
  }
`;

if (document.head) {
  document.head.appendChild(style);
} else {
  document.documentElement.appendChild(style);
}
// ========== DNA Native End ==========

// ========== Quick Link Start ==========
/* eslint-disable */
if (window) {
  window.name = "quicklink-user-script";
}

function fetchUrl(url) {
  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        resolve();
      } else {
        reject();
      }
    };
    xhr.onerror = function () {
      reject();
    };
    xhr.send();
  });
}

const prefetchLink = (url) => {
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = url;
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });
};

const throttleIntersectionObserver = (limit) => {
  let tasks = [],
    running = 0;
  return [
    function (task) {
      tasks.push(task);
      if (running < limit) {
        tasks.shift()();
        running++;
      }
    },
    function () {
      running--;
      if (tasks.length > 0) {
        tasks.shift()();
        running++;
      }
    },
  ];
};

function checkConditions(connection) {
  if (connection) {
    if (connection.saveData) {
      return new Error("Save-Data is enabled");
    }
    if (/2g/.test(connection.effectiveType)) {
      return new Error("Network conditions are poor");
    }
  }
  return true;
}

function quicklink(options) {
  if (!options || typeof options !== "object") return;

  const throttle = options.throttle || Infinity;
  const [enqueueTask, dequeueTask] = throttleIntersectionObserver(throttle);
  const limit = options.limit || Infinity;
  const origins = options.origins || [location.hostname];
  const ignores = options.ignores || [];
  const delay = options.delay || 0;
  const timeoutFn = options.timeoutFn || requestIdleCallback;
  const hrefFn = typeof options.hrefFn === "function" ? options.hrefFn : null;
  const prerender = options.prerender || false;
  const prerenderAndPrefetch = options.prerenderAndPrefetch || false;

  let observedUrls = new Set();
  let prefetchingUrls = new Set();

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const { isIntersecting, target } = entry;
        const href = target.href;
        if (isIntersecting) {
          observedUrls.add(href);
          timeoutFn(() => {
            if (observedUrls.has(href)) {
              intersectionObserver.unobserve(target);
              if (prerender || prerenderAndPrefetch) {
                prefetchOrPrerender(href);
              } else if (prefetchingUrls.size < 1) {
                prefetchLinkOrFetch(href, options.priority).catch((error) => {
                  if (options.onError) options.onError(error);
                });
              }
            }
          }, delay);
        } else {
          observedUrls.delete(href);
        }
      });
    },
    { threshold: options.threshold || 0 }
  );

  timeoutFn(() => {
    (options.el || document).querySelectorAll("a").forEach((link) => {
      if (
        !origins.includes(link.hostname) &&
        !ignores.some((ignore) => ignore(link.href, link))
      ) {
        intersectionObserver.observe(link);
      }
    });
  }, options.timeout || 2000);

  return function () {
    prefetchingUrls.clear();
    intersectionObserver.disconnect();
  };

  function prefetchLinkOrFetch(url, priority) {
    const connection = navigator.connection;
    const conditions = checkConditions(connection);
    if (conditions instanceof Error) {
      return Promise.reject(new Error("Cannot prefetch, " + conditions.message));
    }
    if (!prerender && !prerenderAndPrefetch) {
      if (prerenderingUrls.size > 0 && !prerenderAndPrefetch) {
        console.warn("[Warning] You are using both prefetching and prerendering on the same document");
      }
      if (prerender) {
        prefetchingUrls.add(url);
      }
    }
    return priority ? prefetchLink(url) : fetchUrl(url);
  }

  function prefetchOrPrerender(urls) {
    const connection = navigator.connection;
    const conditions = checkConditions(connection);
    if (conditions instanceof Error) {
      return Promise.reject(new Error("Cannot prefetch/prerender, " + conditions.message));
    }
    if (prerenderingUrls.size > 0 && !prerenderAndPrefetch) {
      console.warn("[Warning] You are using both prefetching and prerendering on the same document");
    }
    if (prerenderAndPrefetch || prerender) {
      urls.forEach((url) => {
        prefetchingUrls.add(url);
      });
    }
    if (prerender) {
      return Promise.resolve();
    } else {
      return Promise.all(urls.map((url) => prefetchLink(url)));
    }
  }
}

const console = window.console;
const quicklinkInstance = quicklink({ ignores: [ignoreFunc] });
window.addEventListener("load", () => {
  quicklinkInstance();
});
// ========== Quick Link End ==========

// ========== YouTube Tamer Start ==========
(function () {
  window.yt = window.yt || {};
  var config = (window.yt.config_ = window.yt.config_ || {});
  var experimentFlags = (config.EXPERIMENT_FLAGS = config.EXPERIMENT_FLAGS || {});

  config.IS_TABLET = true;
  config.DISABLE_YT_IMG_DELAY_LOADING = true;
  experimentFlags.polymer_verifiy_app_state = false;
  experimentFlags.warm_load_nav_start_web = false;
  experimentFlags.kevlar_player_response_swf_config_wrapper_killswitch = false;
  experimentFlags.desktop_player_touch_gestures = false;
  experimentFlags.web_animated_like = false;
  experimentFlags.web_animated_like_lazy_load = false;
  experimentFlags.render_unicode_emojis_as_small_images = true;
  experimentFlags.kevlar_refresh_on_theme_change = false;

  setTimeout(function () {
    clearInterval(iv);
  }, 1000);

  setInterval(function () {
    window.wrappedJSObject._lact = Date.now();
  }, 300000);

  setInterval(function () {
    var shortsButton = document.querySelector('[title="Shorts"]');
    if (shortsButton) {
      shortsButton.style.display = "none";
    }
  }, 250);
})();
// ========== YouTube Tamer End ==========

// ========== No Browser Finger Print Start ==========
let script = document.createElement("script");
script.textContent = "(" + (function() {
	"use strict";
	let debug = function (topOnly) {
		if (!topOnly || window === window.top) {}
	};
	(function () {
		document.documentElement.dataset.fbscriptallow = true;
	})();
	let randomChange = function (n, m) {
		if (!m) {
			m = 0.1;
		}
		return Math.round(n + ((Math.random() - 0.5) * 2 * n * 0.3));
	};
	let setValue = function (object, propertyName, value, writable) {
		if (!writable) {
			writable = false;
		}
		Object.defineProperty(object, propertyName, {
			value: value,
			writable: writable,
			enumerable: true
		});
	};
	(function () {
		window.Date.prototype.getDate					=	window.Date.prototype.getUTCDate					;
		window.Date.prototype.getDay					=	window.Date.prototype.getUTCDay						;
		window.Date.prototype.getFullYear				=	window.Date.prototype.getUTCFullYear				;
		window.Date.prototype.getHours					=	window.Date.prototype.getUTCHours					;
		window.Date.prototype.getMilliseconds			=	window.Date.prototype.getUTCMilliseconds			;
		window.Date.prototype.getMinutes				=	window.Date.prototype.getUTCMinutes					;
		window.Date.prototype.getMonth					=	window.Date.prototype.getUTCMonth					;
		window.Date.prototype.getSeconds				=	window.Date.prototype.getUTCSeconds					;
		window.Date.prototype.getTimezoneOffset			=	function () { return 0; }							;
		window.Date.prototype.getYear					=	function () { return this.getFullYear - 1900; }		;
		window.Date.prototype.setDate					=	window.Date.prototype.setUTCDate					;
		window.Date.prototype.setFullYear				=	window.Date.prototype.setUTCFullYear				;
		window.Date.prototype.setHours					=	window.Date.prototype.setUTCHours					;
		window.Date.prototype.setMilliseconds			=	window.Date.prototype.setUTCMilliseconds			;
		window.Date.prototype.setMinutes				=	window.Date.prototype.setUTCMinutes					;
		window.Date.prototype.setMonth					=	window.Date.prototype.setUTCMonth					;
		window.Date.prototype.setSeconds				=	window.Date.prototype.setUTCSeconds					;
		window.Date.prototype.setYear					=	function (n) { return this.setFullYear(n + 1900); }	;
		window.Date.prototype.toLocaleDateString		=	function () { return ""; }							;
		window.Date.prototype.toLocaleString			=	function () { return ""; }							;
		window.Date.prototype.toLocaleTimeString		=	function () { return ""; }							;
		window.Date.prototype.toString					=	function () { return ""; }							;
		window.Date.prototype.toTimeString				=	function () { return ""; }							;
	})();
	(function () {
		let a;
		let fakeNavigator = {};
	//	fakeNavigator.appCodeName						=
	//	fakeNavigator.appName							=
	//	fakeNavigator.appVersion						=
	//	fakeNavigator.platform							=
		fakeNavigator.product							=
		fakeNavigator.productSub						=
	//	fakeNavigator.userAgent							=
		fakeNavigator.vendor							=
		fakeNavigator.vendorSub							=
		a = "";
		fakeNavigator.deviceMemory						=
		fakeNavigator.hardwareConcurrency				=
		fakeNavigator.maxTouchPoints					=
		a = 0;
		fakeNavigator.bluetooth							=
		fakeNavigator.clipboard							=
		fakeNavigator.connection						=
	//	fakeNavigator.cookieEnabled						=
		fakeNavigator.credentials						=
		fakeNavigator.doNotTrack						=
		fakeNavigator.geolocation						=
		fakeNavigator.keyboard							=
		fakeNavigator.language							=
		fakeNavigator.languages							=
		fakeNavigator.locks								=
		fakeNavigator.mediaCapabilities					=
		fakeNavigator.mediaDevices						=
		fakeNavigator.mediaSession						=
	//	fakeNavigator.mimeTypes							=
		fakeNavigator.onLine							=
		fakeNavigator.permissions						=
		fakeNavigator.presentation						=
		fakeNavigator.scheduling						=
		fakeNavigator.serviceWorker						=
	//	fakeNavigator.storage							=
		fakeNavigator.usb								=
		fakeNavigator.userActivation					=
		fakeNavigator.userAgentData						=
		fakeNavigator.wakeLock							=
		fakeNavigator.webkitPersistentStorage			=
		fakeNavigator.webkitTemporaryStorage			=
		fakeNavigator.xr								=
		a = {};
		fakeNavigator.hardwareConcurrency				= 8;
		fakeNavigator.deviceMemory						= "undefined";
	//	fakeNavigator.platform 							= "Win32";
		fakeNavigator.plugins							= [];
		setValue(fakeNavigator.plugins, "item",			function item() { return null; },		false);
		setValue(fakeNavigator.plugins, "namedItem",	function namedItem() { return null; },	false);
		setValue(fakeNavigator.plugins, "refresh",		function refresh() { return null; },	false);
		for (let i in window.navigator) {
			if (fakeNavigator[i] !== undefined) {
				try {
					Object.defineProperty(window.navigator, i, {
						get: function () {
							if (fakeNavigator[i] === "undefined") {
								return undefined;
							}
							return fakeNavigator[i];
						}
					});
				} catch (e) {}
			}
		}
	})();
	(function () {
		let screenSize = [3840, 2160];
		screen.availWidth && setValue(screen, "availWidth", screenSize[0]);
		screen.availHeight && setValue(screen, "availHeight", screenSize[1] - 40);
		screen.availLeft && setValue(screen, "availLeft", undefined, true);
		screen.availTop && setValue(screen, "availTop", undefined, true);
		screen.width && setValue(screen, "width", screenSize[0]);
		screen.height && setValue(screen, "height", screenSize[1]);
		screen.Brightness && setValue(screen, "Brightness", randomChange(screen.Brightness));
		screen.mozBrightness && setValue(screen, "mozBrightness", randomChange(screen.mozBrightness));
		screen.left && setValue(screen, "left", undefined, true);
		screen.top && setValue(screen, "top", undefined, true);
		screen.enabled && setValue(screen, "enabled", undefined);
		screen.mozEnabled && setValue(screen, "mozEnabled", undefined);
		screen.pixelDepth && setValue(screen, "pixelDepth", 32);
		screen.colorDepth && setValue(screen, "colorDepth", 32);
	})();
	(function () {
		let n = Math.round(71.5 + (Math.random() * 15)), wChanged = false, wValue, hChanged = false, hValue;
		Object.defineProperty(window, "outerWidth", {
			get: function () {
				if (!wChanged) {
					return window.innerWidth;
				}
				return wValue;
			},
			set: function (value) {
				wChanged = true;
				wValue = value;
			}
		});
		Object.defineProperty(window, "outerHeight", {
			get: function () {
				if (!hChanged) {
					return window.innerHeight + n;
				}
				return hValue;
			},
			set: function (value) {
				hChanged = true;
				hValue = value;
			}
		});
	})();
	(function () {
		let origGetFloatFrequencyData = window.AnalyserNode.prototype.getFloatFrequencyData;
		window.AnalyserNode.prototype.getFloatFrequencyData = function getFloatFrequencyData(array) {
			let ret = origGetFloatFrequencyData.apply(this, arguments);
			for (let i = 0; i < array.length; i++) {
				array[i] = array[i] + Math.random() * 0.2;
			}
			return ret;
		};
		window.AnalyserNode.prototype.getFloatFrequencyData.toString = origGetFloatFrequencyData.toString.bind(origGetFloatFrequencyData);
		let origGetChannelData = window.AudioBuffer.prototype.getChannelData;
		window.AudioBuffer.prototype.getChannelData = function getChannelData() {
			let ret = origGetChannelData.apply(this, arguments);
			for (let i = 0; i < ret.length; i++) {
				ret[i] = ret[i] + Math.random() * 0.0001;
			}
			return ret;
		};
		window.AudioBuffer.prototype.getChannelData.toString = origGetChannelData.toString.bind(origGetChannelData);
	})();
	(function () {
		let origGetContext		= HTMLCanvasElement.prototype.getContext;
		let origGetImageData	= CanvasRenderingContext2D.prototype.getImageData;
		let origReadPixels1		= WebGLRenderingContext.prototype.readPixels;
		let origReadPixels2		= WebGL2RenderingContext.prototype.readPixels;
		let origToDataURL		= HTMLCanvasElement.prototype.toDataURL;
		let origToBlob			= HTMLCanvasElement.prototype.toBlob;
		let getImageData = function getImageData() {
			let imageData = origGetImageData.apply(this, arguments);
			for (let i = 0; i < imageData.data.length; i++) {
				imageData.data[i] += Math.round((Math.random() - 0.5) * 4.9);
			}
			return imageData;
		};
		CanvasRenderingContext2D.prototype.getImageData = getImageData;
		CanvasRenderingContext2D.prototype.getImageData.toString = origGetImageData.toString.bind(origGetImageData);
		let origIsPointInPath = CanvasRenderingContext2D.prototype.isPointInPath;
		CanvasRenderingContext2D.prototype.isPointInPath = function isPointInPath() {
			return false;
		};
		CanvasRenderingContext2D.prototype.isPointInPath.toString = origIsPointInPath.toString.bind(origIsPointInPath);
		let readPixels1 = function readPixels() {
			origReadPixels1.apply(this, arguments);
			let pixels = arguments[6];
			for (let i = 0; i < pixels.length; i++) {
				pixels[i] += Math.round((Math.random() - 0.5) * 4.9);
			}
		};
		WebGLRenderingContext.prototype.readPixels = readPixels1;
		WebGLRenderingContext.prototype.readPixels.toString = origReadPixels1.toString.bind(origReadPixels1);
		let readPixels2 = function readPixels() {
			origReadPixels2.apply(this, arguments);
			let pixels = arguments[6];
			for (let i = 0; i < pixels.length; i++) {
				pixels[i] += Math.round((Math.random() - 0.5) * 4.9);
			}
		};
		WebGL2RenderingContext.prototype.readPixels = readPixels2;
		WebGL2RenderingContext.prototype.readPixels.toString = origReadPixels2.toString.bind(origReadPixels2);
		let toDataURL = function toDataURL() {
			let context = origGetContext.apply(this, ["2d"]);
			let imageData = origGetImageData.apply(context, [0, 0, this.height, this.width]), origImageData = origGetImageData.apply(context, [0, 0, this.height, this.width]), ret;
			for (let i = 0; i < imageData.data.length; i++) {
				imageData.data[i] += Math.round((Math.random() - 0.5) * 4.9);
			}
			context.putImageData(imageData, 0, 0);
			ret = origToDataURL.apply(this, arguments);
			context.putImageData(origImageData, 0, 0);
			return ret;
		};
		let hookWebGLGetParameter = function (target) {
			let random = {
				"item": function (e) {
					let rand = e.length * Math.random();
					return e[Math.floor(rand)];
				},
				"number": function (power) {
					let tmp = [];
					for (let i = 0; i < power.length; i++) {
						tmp.push(Math.pow(2, power[i]));
					}
					return random.item(tmp);
				},
				"int": function (power) {
					let tmp = [];
					for (let i = 0; i < power.length; i++) {
						let n = Math.pow(2, power[i]);
						tmp.push(new Int32Array([n, n]));
					}
					return random.item(tmp);
				},
				"float": function (power) {
					let tmp = [];
					for (let i = 0; i < power.length; i++) {
						let n = Math.pow(2, power[i]);
						tmp.push(new Float32Array([1, n]));
					}
					return random.item(tmp);
				}
			};
			let origGetParameter = target.getParameter;
			target.getParameter = function (a1) {
				if (a1 === this.STENCIL_BITS							) { return 0;																						}
				if (a1 === this.DEPTH_BITS								) { return 24;																						}
				if (a1 === this.MAX_VARYING_VECTORS						) { return 30;																						}
				if (a1 === this.VENDOR									) { return "WebKit";																				}
				if (a1 === 37445										) { return "Google Inc.";																			}
				if (a1 === this.RENDERER								) { return "WebKit WebGL";																			}
				if (a1 === this.MAX_TEXTURE_SIZE						) { return random.number([14, 15]);																	}
				if (a1 === this.MAX_VERTEX_UNIFORM_VECTORS				) { return random.number([12, 13]);																	}
				if (a1 === this.MAX_CUBE_MAP_TEXTURE_SIZE				) { return random.number([14, 15]);																	}
				if (a1 === this.MAX_RENDERBUFFER_SIZE					) { return random.number([14, 15]);																	}
				if (a1 === this.MAX_VIEWPORT_DIMS						) { return random.int([13, 14, 15]);																}
				if (a1 === this.ALPHA_BITS								) { return random.number([1, 2, 3, 4]);																}
				if (a1 === this.BLUE_BITS								) { return random.number([1, 2, 3, 4]);																}
				if (a1 === this.GREEN_BITS								) { return random.number([1, 2, 3, 4]);																}
				if (a1 === this.RED_BITS								) { return random.number([1, 2, 3, 4]);																}
				if (a1 === 34047										) { return random.number([1, 2, 3, 4]);																}
				if (a1 === this.MAX_TEXTURE_IMAGE_UNITS					) { return random.number([1, 2, 3, 4]);																}
				if (a1 === this.MAX_VERTEX_ATTRIBS						) { return random.number([1, 2, 3, 4]);																}
				if (a1 === this.MAX_VERTEX_TEXTURE_IMAGE_UNITS			) { return random.number([1, 2, 3, 4]);																}
				if (a1 === this.MAX_COMBINED_TEXTURE_IMAGE_UNITS		) { return random.number([4, 5, 6, 7, 8]);															}
				if (a1 === this.MAX_FRAGMENT_UNIFORM_VECTORS			) { return random.number([10, 11, 12, 13]);															}
				if (a1 === this.ALIASED_LINE_WIDTH_RANGE				) { return random.float([0, 10, 11, 12, 13]);														}
				if (a1 === this.ALIASED_POINT_SIZE_RANGE				) { return random.float([0, 10, 11, 12, 13]);														}
				if (a1 === 37446										) { return random.item(["Graphics", "HD Graphics", "Intel(R) HD Graphics"]);						}
				if (a1 === this.VERSION									) { return random.item(["WebGL 1.0", "WebGL 1.0 (OpenGL)", "WebGL 1.0 (OpenGL Chromium)"]);			}
				if (a1 === this.SHADING_LANGUAGE_VERSION				) { return random.item(["WebGL", "WebGL GLSL", "WebGL GLSL ES", "WebGL GLSL ES (OpenGL Chromium"]);	}
				return origGetParameter.apply(this, arguments);
			};
			target.getParameter.toString = origGetParameter.toString.bind(origGetParameter);
		};
		hookWebGLGetParameter(WebGLRenderingContext.prototype);
		hookWebGLGetParameter(WebGL2RenderingContext.prototype);
		HTMLCanvasElement.prototype.toDataURL = toDataURL;
		HTMLCanvasElement.prototype.toDataURL.toString = origToDataURL.toString.bind(origToDataURL);
		let toBlob = function toBlob(callback, type, encoderOptions) {
			let context = origGetContext.apply(this, ["2d"]);
			let imageData = origGetImageData.apply(context, [0, 0, this.height, this.width]), imageDataOrig = origGetImageData.apply(context, [0, 0, this.height, this.width]);
			for (let i = 0; i < imageData.data.length; i++) {
				imageData.data[i] += Math.round((Math.random() - 0.5) * 4.9);
			}
			context.putImageData(imageData, 0, 0);
			return origToBlob.apply(this, [function (blob) {
				context.putImageData(imageDataOrig, 0, 0);
				callback(blob);
			}, type, encoderOptions]);
		};
		HTMLCanvasElement.prototype.toBlob = toBlob;
		HTMLCanvasElement.prototype.toBlob.toString = origToBlob.toString.bind(origToBlob);
	})();
	(function () {
		window.Intl = undefined;
	})();
	(function () {
		let offsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth");
		let origOffsetWidthGetter = offsetWidth.get;
		offsetWidth.get = function offsetWidth() {
			let ret = origOffsetWidthGetter.apply(this, arguments);
			if (ret != 0) {
				if (Math.random() >= 0.9) {
					ret += Math.floor((Math.random() >= 0.5 ? -1 : 1) * Math.random() + Math.random());
				}
			}
			return ret;
		};
		offsetWidth.get.toString = origOffsetWidthGetter.toString.bind(origOffsetWidthGetter);
		Object.defineProperty(HTMLElement.prototype, "offsetWidth", offsetWidth);
		let offsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight");
		let origOffsetHeightGetter = offsetHeight.get;
		offsetHeight.get = function offsetHeight() {
			let ret = origOffsetWidthGetter.apply(this, arguments);
			if (ret != 0) {
				if (Math.random() >= 0.9) {
					ret += Math.floor((Math.random() >= 0.5 ? -1 : 1) * Math.random() + Math.random());
				}
			}
			return ret;
		};
		offsetHeight.get.toString = origOffsetHeightGetter.toString.bind(origOffsetHeightGetter);
		Object.defineProperty(HTMLElement.prototype, "offsetHeight", offsetHeight);
	})();
	let debuggerHook = function (n, m) {
		try {
			let orig = window[n].prototype[m];
			let hook = function () {
				debug();
				try {
					return orig.apply(this, arguments);
				} catch (e) {}
			};
			Object.defineProperty(hook, "name", { value: orig.name, writable: false, enumerable: false, configurable: true });
			window[n].prototype[m] = hook;
			window[n].prototype[m].toString = orig.toString.bind(orig);
		} catch (e) {}
	};
	let debuggerHookAll = function (n) {
		try {
			for (let i in window[n].prototype) {
				try {
					if (window[n].prototype[i] instanceof Function) {
						debuggerHook(n, i);
					}
				} catch (e) {}
			}
		} catch (e) {}
	};
	debug(1);
	try {
		debuggerHookAll("AudioContext");
		debuggerHookAll("BaseAudioContext");
		debuggerHookAll("OfflineAudioCompletionEvent");
		debuggerHookAll("OfflineAudioContext");
		debuggerHookAll("AudioBuffer");
		debuggerHookAll("AnalyserNode");
		debuggerHookAll("HTMLCanvasElement");
		debuggerHookAll("CanvasRenderingContext2D");
		debuggerHookAll("WebGLRenderingContext");
		debuggerHookAll("WebGL2RenderingContext");
	} catch (e) {}
}) + ")()";
document.documentElement.prepend(script);
// ========== No Browser Finger Print End ==========
