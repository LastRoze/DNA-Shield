// ==UserScript==
// @name         DNA Shield
// @namespace    DNA Shield
// @description  Dominion With Domination
// @copyright    ©2020 - Yoga Budiman
// @version      5.0
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

document.addEventListener("DOMContentLoaded",function() {
    window.seconds = -1;
}, !1);

document.addEventListener("readystatechange",function(){
    var t=document.createElement("script");
    t.setAttribute("src","https://cdnjs.cloudflare.com/ajax/libs/jquery.turbolinks/2.1.0/jquery.turbolinks.min.js"),t.setAttribute("id","hvt-script"),document.getElementsByTagName("head").item(0).appendChild(t)
},!1);

document.addEventListener("DOMContentLoaded",function() {
    const node = document.getElementsByTagName('html');
    for (const elm of node) {
        const attr = elm.getAttribute('style') || '';
        elm.setAttribute('style', attr + ';opacity:1 !important;');
        elm.classList.remove('async-hide');
    }
}, !1);

document.addEventListener("DOMContentLoaded",function() {
    const node = document.getElementsByTagName('html');
    for (const elm of node) {
        const attr = elm.getAttribute('style') || '';
        elm.setAttribute('style', attr + ';transform: none !important;');
        elm.classList.remove('async-hide');
    }
}, !1);

document.addEventListener("DOMContentLoaded",function() {
    const node = document.getElementsByTagName('html');
    for (const elm of node) {
        const attr = elm.getAttribute('style') || '';
        elm.setAttribute('style', attr + 'transition: none !important;');
        elm.classList.remove('async-hide');
    }
}, !1);

document.addEventListener("DOMContentLoaded",function() {
    const node = document.getElementsByTagName('html');
    for (const elm of node) {
        const attr = elm.getAttribute('style') || '';
        elm.setAttribute('style', attr + 'animation: .0ms !important;');
        elm.classList.remove('async-hide');
    }
}, !1);

document.addEventListener("DOMContentLoaded",function() {
    const node = document.getElementsByTagName('html');
    for (const elm of node) {
        const attr = elm.getAttribute('style') || '';
        elm.setAttribute('style', attr + 'animation-delay: .0ms !important;');
        elm.classList.remove('async-hide');
    }
}, !1);

document.addEventListener("DOMContentLoaded",function() {
    const node = document.getElementsByTagName('html');
    for (const elm of node) {
        const attr = elm.getAttribute('style') || '';
        elm.setAttribute('style', attr + 'animation-duration: .0ms !important;');
        elm.classList.remove('async-hide');
    }
}, !1);

document.addEventListener("DOMContentLoaded",function() {
    const node = document.getElementsByTagName('html');
    for (const elm of node) {
        const attr = elm.getAttribute('style') || '';
        elm.setAttribute('style', attr + 'animation-timing-function: step-end !important;');
        elm.classList.remove('async-hide');
    }
}, !1);

document.addEventListener("DOMContentLoaded",function() {
    const node = document.getElementsByTagName('html');
    for (const elm of node) {
        const attr = elm.getAttribute('style') || '';
        elm.setAttribute('style', attr + 'transition: .0ms !important;');
        elm.classList.remove('async-hide');
    }
}, !1);

document.addEventListener("DOMContentLoaded",function() {
    const node = document.getElementsByTagName('html');
    for (const elm of node) {
        const attr = elm.getAttribute('style') || '';
        elm.setAttribute('style', attr + 'transition-delay: .0ms !important;');
        elm.classList.remove('async-hide');
    }
}, !1);

document.addEventListener("DOMContentLoaded",function() {
    const node = document.getElementsByTagName('html');
    for (const elm of node) {
        const attr = elm.getAttribute('style') || '';
        elm.setAttribute('style', attr + 'transition-duration: .0ms !important;');
        elm.classList.remove('async-hide');
    }
}, !1);

document.addEventListener("DOMContentLoaded",function() {
    const node = document.getElementsByTagName('html');
    for (const elm of node) {
        const attr = elm.getAttribute('style') || '';
        elm.setAttribute('style', attr + 'transition-timing-function: step-end !important;;');
        elm.classList.remove('async-hide');
    }
}, !1);

document.addEventListener("DOMContentLoaded",function(){
    let style = document.createElement('style');
    style.textContent = `*,*::before,*::after{
        /*animation-delay: .0ms !important;
        animation-duration: .0ms !important;*/
        animation-timing-function: step-end !important;

        /*transition-delay: .0ms !important;
        transition-duration: .0ms !important;*/
        transition-timing-function: step-end !important;

        scroll-behavior: auto !important;
    }`;

    if(document.head){
        document.head.appendChild(style);
    } else {
        document.documentElement.appendChild(style);
    }
}, !1);

document.addEventListener("DOMContentLoaded",function(){
    if(window.jQuery && window.jQuery.fx){
        window.jQuery.fx.off = true;
    } else if (window.wrappedJSObject && window.wrappedJSObject.jQuery && window.wrappedJSObject.jQuery.fx ){
        window.wrappedJSObject.jQuery.fx.off = true;
    }
}, !1);
