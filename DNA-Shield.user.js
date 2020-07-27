// ==UserScript==
// @name         DNA Shield
// @namespace    DNA Shield
// @description  Dominion With Domination
// @copyright    ©2020 - Yoga Budiman
// @version      4.1
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
}, !1);

let DNA_lazytags = ["src9","data-url","data-ks-lazyload","data-ks-lazyload-custom","data-lazy-load-src","data-lazyload","original","file","data-src","data-cover","data-original","data-thumb","real_src","src2","data-imageurl","data-defer-src","data-placeholder","origin-src","data-actualsrc","org_src","data-lazyload-src","src1","#src"];
let DNA_lazypics = [];
let DNA_inspics = [];
let DNA_wlist = [];
let DNA_prehref = document.location.href;

let DNA_nolazyload = function()
{
    try
    {
        if (document.location.href != DNA_prehref){
            DNA_prehref = document.location.href;
            DNA_lazypics = null;
            DNA_lazypics = [];
        }
        let hostn = document.location.hostname;

        for(let i=0; i<DNA_wlist.length; i++)
        {
            if(hostn.indexOf(DNA_wlist[i])>-1)
            {
                return;
            }
        }
        let imgs = document.images;

        for(let i=0;i<imgs.length;i++)
        {
            for(let j=0; j<DNA_lazytags.length; j++)
            {
                for(let k=0; k<imgs[i].attributes.length; k++)
                {
                    if(imgs[i].attributes[k].nodeName == DNA_lazytags[j])
                    {
                        if(imgs[i].attributes[k].nodeValue != imgs[i].src){
                            DNA_preload(imgs[i].attributes[k].nodeValue,DNA_lazytags[j], i);
                        }
                    }
                }
            }
        }
    }catch(e)
    {
        console.log("error"+e);
    }
}

let DNA_preload = function(url,tag,img)
{
    let loaded = false;
    for(let i = 0; i<DNA_lazypics.length;i++)
    {
        if(url == DNA_lazypics[i])
        {
            loaded = true;
            break;
        }
    }
    if(loaded)
    {
        return;
    }
    else
    {
        let a = new Image();
        a.href = url;
        url = a.href;
    }
}

let DNA_loading = function(url,tag,img)
{
    if(DNA_di_check())
    {
        document.images[img].src=url;
        document.images[img].removeAttribute(tag);
    }
    else
    {
        new Image().src = url;
    }
    DNA_lazypics.push(url)
}

let DNA_di_check = function()
{
    let hn = document.location.hostname;
    for(let i=0;i<DNA_inspics.length;i++)
    {
        if(hn.indexOf(DNA_inspics[i])>-1)
        {
            return true;
        }
    }
    return false;
}

let DNA_observer = new MutationObserver(function(mutations)
{
    DNA_nolazyload();
});

DNA_observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

( function(){
	function removeLazy (elm, attr) {
		if( elm.getAttribute(attr) && elm.src != elm.getAttribute(attr) )
		{
			elm.src = elm.getAttribute(attr);
			elm.removeAttribute(attr);
		}
	}

	function replaceLazyload(doc) {
		var img = doc.images;
		var i;
		if ( img != undefined )
		{
			for (i = 0; i < img.length; i++) {
				removeLazy(img[i], "data-lazy-src");
				removeLazy(img[i], "data-original");
			}
		}
	}

	function getEvent(evt){
		var node = evt.target;
		replaceLazyload(node);
	}

	replaceLazyload(document);

	document.body.addEventListener('AutoPagerize_DOMNodeInserted', getEvent, false);
}, !1);

document.getElementsByTagName("body")[0].addEventListener("wheel",function (event) {
    'use strict';
    if (event.target.classList.contains('ace_content')) {
        return;
    }

    event.stopPropagation();
}, !1);

document.addEventListener('keydown', function(e) { e.stopPropagation(); }, !1);
document.addEventListener('keyup', function(e) { e.stopPropagation(); }, !1);
document.addEventListener('mousedown', function(e) { e.stopPropagation(); }, !1);
document.addEventListener('mouseup', function(e) { e.stopPropagation(); }, !1);

(function() {
    'use strict';
    const node = document.getElementsByTagName('html');
    for (const elm of node) {
        const attr = elm.getAttribute('style') || '';
        elm.setAttribute('style', attr + ';opacity:1 !important;');
        elm.classList.remove('async-hide');
    }
}, !1);

(function() {
    'use strict';
    const node = document.getElementsByTagName('html');
    for (const elm of node) {
        const attr = elm.getAttribute('style') || '';
        elm.setAttribute('style', attr + ';transform: none !important;');
        elm.classList.remove('async-hide');
    }
}, !1);

(function() {
    'use strict';
    const node = document.getElementsByTagName('html');
    for (const elm of node) {
        const attr = elm.getAttribute('style') || '';
        elm.setAttribute('style', attr + 'transition: none !important;');
        elm.classList.remove('async-hide');
    }
}, !1);

(function(){
    let style = document.createElement('style');
    style.textContent = `*,*::before,*::after{
        /*animation-delay: 0.001ms !important;
        animation-duration: 0.001ms !important;*/
        animation-timing-function: step-start !important;

        /*transition-delay: 0.001ms !important;
        transition-duration: 0.001ms !important;*/
        transition-timing-function: step-start !important;

        scroll-behavior: auto !important;
    }`;

    try{
        if(document.head){
            document.head.appendChild(style);
        } else {
            document.documentElement.appendChild(style);
        }
    }catch(e){}
})();

(function(){
    window.addEventListener('load', function(){
        try{
            if(window.jQuery && window.jQuery.fx){
                window.jQuery.fx.off = true;
            } else if (window.wrappedJSObject && window.wrappedJSObject.jQuery && window.wrappedJSObject.jQuery.fx ){
                window.wrappedJSObject.jQuery.fx.off = true;
            }
        }catch(e){}
    });
})();

document.addEventListener('readystatechange', function() {
    var e = document.createElement("script");
    e.setAttribute("src", "https://cdn.jsdelivr.net/npm/turbolinks@5.3.0-beta.1/dist/turbolinks.min.js");
    document.getElementsByTagName("head").item(0).insertBefore(e, document.getElementById('hvt-script'));
}, !1);
