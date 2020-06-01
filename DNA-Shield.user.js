// ==UserScript==
// @name         DNA Shield
// @namespace    DNA Shield
// @description  Dominion With Domination
// @copyright    ©2020 - Yoga Budiman
// @version      2.4
// @author       Last Roze
// @homepageURL  https://github.com/LastRoze/
// @supportURL   https://linkedin.com/in/lastroze
// @updateURL    https://github.com/LastRoze/DNA-Shield/raw/master/DNA-Shield.meta.js
// @downloadURL  https://github.com/LastRoze/DNA-Shield/raw/master/DNA-Shield.user.js
// @icon         https://github.com/LastRoze/DNA-Shield/blob/master/DNA.jpg?raw=true
// @require
// @run-at       document-start
// @include      *
// @include      http://*
// @include      https://*
// @match        *://*/*
// @connect      *
// @grant        GM_addStyle
// @grant        GM_deleteValue
// @grant        GM_getResourceURL
// @grant        GM_getValue
// @grant        GM_openInTab
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        GM.deleteValue
// @grant        GM.getResourceUrl
// @grant        GM.getValue
// @grant        GM.openInTab
// @grant        GM.xmlHttpRequest
// @grant        unsafeWindow
// @noframes
// ==/UserScript==

(function() {
    'use strict';
    window.seconds = -1;
})();

(function() {
    'use strict';
    const node = document.getElementsByTagName('html');
    for (const elm of node) {
        const attr = elm.getAttribute('style') || '';
        elm.setAttribute('style', attr + ';opacity:1 !important;');
        elm.classList.remove('async-hide');
    }
})();

document.addEventListener('readystatechange', function() {
    var e = document.createElement("script");
    e.setAttribute("src", "https://cdnjs.cloudflare.com/ajax/libs/jquery.turbolinks/2.1.0/jquery.turbolinks.min.js");
    document.getElementsByTagName("head").item(0).insertBefore(e, document.getElementById('hvt-script'));
}, !1);
