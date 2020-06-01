// ==UserScript==
// @name         DNA Shield
// @namespace    DNA Shield
// @description  Dominion With Domination
// @copyright    ©2020 - Yoga Budiman
// @version      3.0
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

(async function() {
    'use strict';
    window.seconds = -1;
}, !1);

let nolz_lazytags = ["src9","data-url","data-ks-lazyload","data-ks-lazyload-custom","data-lazy-load-src","data-lazyload","original","file","data-src","data-cover","data-original","data-thumb","real_src","src2","data-imageurl","data-defer-src","data-placeholder","origin-src","data-actualsrc","org_src","data-lazyload-src","src1","#src"];
let nolz_lazypics = [];
let nolz_inspics = ["111.222.com","333.444.com"];
let nolz_wlist = ["search.taobao.com","list.tmall.com","s.taobao.com"];
let nolz_prehref = document.location.href;

let nolz_nolazyload = function()
{
    try
    {
        if (document.location.href != nolz_prehref){
            nolz_prehref = document.location.href;
            nolz_lazypics = null;
            nolz_lazypics = [];
        }
        let hostn = document.location.hostname;

        for(let i=0; i<nolz_wlist.length; i++)
        {
            if(hostn.indexOf(nolz_wlist[i])>-1)
            {
                return;
            }
        }
        let imgs = document.images;

        for(let i=0;i<imgs.length;i++)
        {
            for(let j=0; j<nolz_lazytags.length; j++)
            {
                for(let k=0; k<imgs[i].attributes.length; k++)
                {
                    if(imgs[i].attributes[k].nodeName == nolz_lazytags[j])
                    {
                        if(imgs[i].attributes[k].nodeValue != imgs[i].src){
                            nolz_preload(imgs[i].attributes[k].nodeValue,nolz_lazytags[j], i);
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

let nolz_preload = function(url,tag,img)
{
    let loaded = false;
    for(let i = 0; i<nolz_lazypics.length;i++)
    {
        if(url == nolz_lazypics[i])
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
        nolz_loading(url,tag,img);
    }

}

let nolz_loading = function(url,tag,img)
{
    if(nolz_di_check())
    {
        document.images[img].src=url;
        document.images[img].removeAttribute(tag);
    }
    else
    {
        new Image().src = url;
    }
    nolz_lazypics.push(url)
}

let nolz_di_check = function()
{
    let hn = document.location.hostname;
    for(let i=0;i<nolz_inspics.length;i++)
    {
        if(hn.indexOf(nolz_inspics[i])>-1)
        {
            return true;
        }
    }
    return false;
}

let nolz_observer = new MutationObserver(function(mutations)
{
    nolz_nolazyload();
});

nolz_observer.observe(document.documentElement, {
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


(async function() {
    'use strict';
    const node = document.getElementsByTagName('html');
    for (const elm of node) {
        const attr = elm.getAttribute('style') || '';
        elm.setAttribute('style', attr + ';opacity:1 !important;');
        elm.classList.remove('async-hide');
    }
}, !1);

(async function() {
	var default_style = '\
	* {\
		border-radius:none !important;\
		border-bottom-left-radius: 0 !important;\
		border-bottom-right-radius: 0 !important;\
		border-top-left-radius: 0 !important;\
		border-top-right-radius: 0 !important;\
		box-shadow: none !important;\
		opacity: 1 !important;\
		text-shadow: none !important;\
		transform: none !important;\
		transition: none !important;\
		}\
	.btn {\
		background-image:none;\
		}\
	.image-selector .file-input {\
		opacity: 0 !important;\
		}\
	';
	GM.addStyle(default_style);
	}, !1);

document.addEventListener('readystatechange', async function() {
    var e = document.createElement("script");
    e.setAttribute("src", "https://cdnjs.cloudflare.com/ajax/libs/jquery.turbolinks/2.1.0/jquery.turbolinks.min.js");
    document.getElementsByTagName("head").item(0).insertBefore(e, document.getElementById('hvt-script'));
}, !1);
