// ==UserScript==
// @name		DNA Shield
// @namespace	DNA Shield
// @version		9.6
// @author		Last Roze
// @description	Dominion With Domination
// @copyright	©2021 - 2025 // Yoga Budiman
// @homepage	https://github.com/LastRoze/
// @homepageURL	https://github.com/LastRoze/
// @website		https://lastroze.github.io/
// @source		https://github.com/LastRoze/DNA-Shiel5
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

try {
    if (unsafeWindow && typeof unsafeWindow.onblur !== 'undefined') {unsafeWindow.onblur = null;}
    if (unsafeWindow && typeof unsafeWindow.blurred !== 'undefined') {unsafeWindow.blurred = false;}
    if (unsafeWindow && unsafeWindow.document && typeof unsafeWindow.document.hasFocus === 'function') {unsafeWindow.document.hasFocus = function() {return true;};}
    if (unsafeWindow && typeof unsafeWindow.window !== 'undefined') {unsafeWindow.window.onFocus = function() {return true;};}
    if (typeof Object.defineProperty === 'function') {var hiddenProps = ['hidden', 'mozHidden', 'msHidden', 'webkitHidden', 'visibilityState'];hiddenProps.forEach(function(prop) {
            if (typeof document !== 'undefined') {Object.defineProperty(document, prop, { value: false, writable: false });}});}
    if (unsafeWindow && unsafeWindow.document && typeof unsafeWindow.document.onvisibilitychange !== 'undefined') {unsafeWindow.document.onvisibilitychange = null;}
} catch (e) {}

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
    animation-delay: 0.1 !important;
    animation-duration: 0.1 !important;
    animation-timing-function: step-end !important;
    scroll-behavior: auto !important;
    transition-delay: 0.1 !important;
    transition-duration: 0.1 !important;
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
    animation-delay: 0.1 !important;
    animation-duration: 0.1 !important;
    animation-timing-function: step-end !important;
    scroll-behavior: auto !important;
    transition-delay: 0.1 !important;
    transition-duration: 0.1 !important;
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
