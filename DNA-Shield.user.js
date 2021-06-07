// ==UserScript==
// @name		DNA Shield
// @namespace	DNA Shield
// @version		7.6
// @author		Last Roze
// @description	Dominion With Domination
// @copyright	©2021 - Yoga Budiman
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
// @include		*
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

(function() {
    window.seconds = -1;
})();

(function(){
    if(window.jQuery && window.jQuery.fx){
        window.jQuery.fx.off = true;
    } else if (window.wrappedJSObject && window.wrappedJSObject.jQuery && window.wrappedJSObject.jQuery.fx ){
        window.wrappedJSObject.jQuery.fx.off = true;
    }
})();

(function() {
    const node = document.getElementsByTagName('html');
    for (const elm of node) {
        const attr = elm.getAttribute('style') || '';
        elm.setAttribute('style', attr + ' -webkit-animation-timing-function: step-end !important;');
        elm.classList.remove('async-hide');
    }
})();

(function() {
    const node = document.getElementsByTagName('html');
    for (const elm of node) {
        const attr = elm.getAttribute('style') || '';
        elm.setAttribute('style', attr + 'animation-delay: -1ms !important;');
        elm.classList.remove('async-hide');
    }
})();

(function() {
    const node = document.getElementsByTagName('html');
    for (const elm of node) {
        const attr = elm.getAttribute('style') || '';
        elm.setAttribute('style', attr + 'animation-duration: -1ms !important;');
        elm.classList.remove('async-hide');
    }
})();

(function() {
    const node = document.getElementsByTagName('html');
    for (const elm of node) {
        const attr = elm.getAttribute('style') || '';
        elm.setAttribute('style', attr + 'animation-timing-function: step-end !important;');
        elm.classList.remove('async-hide');
    }
})();

(function() {
    const node = document.getElementsByTagName('html');
    for (const elm of node) {
        const attr = elm.getAttribute('style') || '';
        elm.setAttribute('style', attr + 'scroll-behavior: auto !important;');
        elm.classList.remove('async-hide');
    }
})();

(function() {
    const node = document.getElementsByTagName('html');
    for (const elm of node) {
        const attr = elm.getAttribute('style') || '';
        elm.setAttribute('style', attr + 'transition-delay: -1ms !important;');
        elm.classList.remove('async-hide');
    }
})();

(function() {
    const node = document.getElementsByTagName('html');
    for (const elm of node) {
        const attr = elm.getAttribute('style') || '';
        elm.setAttribute('style', attr + 'transition-duration: -1ms !important;');
        elm.classList.remove('async-hide');
    }
})();

(function() {
    const node = document.getElementsByTagName('html');
    for (const elm of node) {
        const attr = elm.getAttribute('style') || '';
        elm.setAttribute('style', attr + 'transition-timing-function: step-end !important;;');
        elm.classList.remove('async-hide');
    }
})();

(function(){
	let style = document.createElement('style');
    style.textContent = `*,*::before,*::after{
		-webkit-animation-timing-function: step-end !important;
        animation-delay: -1ms !important;
        animation-duration: -1ms !important;
        animation-timing-function: step-end !important;
        scroll-behavior: auto !important;
        transition-delay: -1ms !important;
        transition-duration: -1ms !important;
        transition-timing-function: step-end !important;
    }`;

    if(document.head){
        document.head.appendChild(style);
    } else {
        document.documentElement.appendChild(style);
    }
})();
