// ==UserScript==
// @name         DNA Shield
// @namespace    DNA Shield
// @description  Dominion With Domination
// @copyright    ©2020 - Yoga Budiman
// @version      2.2
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

document.addEventListener('readystatechange', function() {
    var e = document.createElement("script");
    e.setAttribute("src", "https://cdn.jsdelivr.net/npm/turbolinks@5.3.0-beta.1/dist/turbolinks.min.js");
    document.getElementsByTagName("head").item(0).insertBefore(e, document.getElementById('hvt-script'));
}, !1);

document.addEventListener("turbolinks:load", function() {
    location.reload(false);
}, !1);

(function() {
    'use strict';
    window.seconds = -1;
})();
