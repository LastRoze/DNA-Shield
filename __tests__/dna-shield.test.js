
const fs = require("fs");
const path = require("path");

const scriptPath = path.join(__dirname, "..", "DNA-Shield.user.js");
const scriptContent = fs.readFileSync(scriptPath, "utf8");

function runScript() {
  // The userscript is an IIFE evaluated against the jsdom globals.
  eval(scriptContent);
}

/**
 * Build a mock Animation object covering the surface DNA Shield
 * reads: animationName / transitionProperty detection, playState,
 * computed timing, and the finish control.
 */
function makeAnim(options = {}) {
  const timing = {
    iterations: 1,
    endTime: 500,
    activeDuration: 500,
    ...(options.timing || {})
  };

  const has = (key) => Object.prototype.hasOwnProperty.call(options, key);

  return {
    animationName: has("animationName") ? options.animationName : undefined,
    transitionProperty: has("transitionProperty")
      ? options.transitionProperty
      : undefined,
    playState: options.playState || "running",
    finish: jest.fn(),
    effect: {
      target: options.target || null,
      pseudoElement: options.pseudoElement || null,
      getComputedTiming: () => timing
    }
  };
}

/** Wait long enough for jsdom timers and MutationObservers. */
function wait(ms = 60) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Dispatch a bubbling DOM event, with extra properties attached. */
function fire(target, type, props = {}) {
  const event = new window.Event(type, { bubbles: true, composed: true });
  Object.assign(event, props);
  target.dispatchEvent(event);
}

describe("DNA Shield userscript", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    document.body.innerHTML = "";
    localStorage.clear();
    if (window.DNAShield) {
      window.DNAShield.stop();
    }
    delete window.DNAShield;
    delete window.trustedTypes;
    /* jsdom may lack PointerEvent; force the modern input path. */
    if (typeof window.PointerEvent !== "function") {
      window.PointerEvent = function PointerEventStub() {};
      window.PointerEvent._stub = true;
    }
    if ("supports" in HTMLScriptElement) {
      delete HTMLScriptElement.supports;
    }
  });

  afterEach(() => {
    if (window.DNAShield) {
      window.DNAShield.stop();
    }
    if (window.PointerEvent && window.PointerEvent._stub) {
      delete window.PointerEvent;
    }
  });

  test("exposes a public API with hard safety guarantees", () => {
    runScript();

    expect(window.DNAShield).toBeDefined();
    expect(window.DNAShield.enabled).toBe(true);
    expect(typeof window.DNAShield.sweep).toBe("function");
    expect(typeof window.DNAShield.prefetch).toBe("function");
    expect(typeof window.DNAShield.stop).toBe("function");
    expect(window.DNAShield.patchesNativeAPIs).toBe(false);
    expect(window.DNAShield.patchesTimers).toBe(false);
    expect(window.DNAShield.patchesNetwork).toBe(false);
  });

  test("never clamps transition durations in CSS, only zeroes animation delays", () => {
    runScript();

    const style = document.getElementById("__DNA_SHIELD__");
    expect(style).not.toBeNull();

    /* A transition-duration clamp turns the default `all 0s` into a
       real transition on every element; it must never ship. */
    expect(style.textContent).not.toEqual(expect.stringContaining("transition"));
    expect(style.textContent).toEqual(
      expect.stringContaining("animation-delay:0s !important")
    );
    expect(style.textContent).toEqual(
      expect.stringContaining("scroll-behavior:auto !important")
    );

    /* Spinners must keep spinning: no animation clamp by default. */
    expect(style.textContent).not.toEqual(
      expect.stringContaining("animation-duration")
    );
    expect(style.textContent).not.toEqual(
      expect.stringContaining("animation-iteration-count")
    );

    /* ONE universal block keeps style-recalc pressure low. */
    expect(style.textContent.match(/\*,\*::before,\*::after\{/g)).toHaveLength(1);
  });

  test("stays completely out of a disabled host or kill-switched site", () => {
    localStorage.setItem("__DNA_SHIELD_OFF__", "1");

    runScript();

    expect(window.DNAShield.enabled).toBe(false);
    expect(document.getElementById("__DNA_SHIELD__")).toBeNull();
  });

  test("reinstalls the stylesheet after a page removes it", async () => {
    runScript();

    const style = document.getElementById("__DNA_SHIELD__");
    expect(style).not.toBeNull();

    style.remove();
    await wait();

    expect(document.getElementById("__DNA_SHIELD__")).not.toBeNull();
  });

  test("fast-forwards CSS animations on animationstart", async () => {
    runScript();

    const el = document.createElement("div");
    document.body.appendChild(el);
    const anim = makeAnim({ animationName: "fade-in" });
    el.getAnimations = () => [anim];

    fire(el, "animationstart", { animationName: "fade-in" });
    await wait();

    expect(anim.finish).toHaveBeenCalledTimes(1);
  });

  test("sweep finishes finite scripted animations and skips infinite", async () => {
    runScript();

    const scripted = makeAnim();
    const infinite = makeAnim({ timing: { iterations: Infinity, endTime: Infinity, activeDuration: Infinity } });
    document.getAnimations = () => [scripted, infinite];

    try {
      window.DNAShield.sweep();
    } finally {
      delete document.getAnimations;
    }

    await wait();

    expect(scripted.finish).toHaveBeenCalledTimes(1);
    expect(infinite.finish).not.toHaveBeenCalled();
  });

  test("never accelerates animations inside CAPTCHA widgets", async () => {
    runScript();

    const dialog = document.createElement("div");
    dialog.className = "shopee-captcha-verify-slider";
    document.body.appendChild(dialog);

    const puzzle = document.createElement("div");
    dialog.appendChild(puzzle);
    const captchaAnim = makeAnim({ animationName: "slide-piece", target: puzzle });
    puzzle.getAnimations = () => [captchaAnim];

    /* Event path: animationstart inside the captcha is ignored. */
    fire(puzzle, "animationstart", { animationName: "slide-piece" });

    /* Sweep path: animations owned by captcha elements are ignored. */
    const outside = makeAnim();
    document.getAnimations = () => [outside];
    window.DNAShield.sweep();
    delete document.getAnimations;

    await wait();

    expect(captchaAnim.finish).not.toHaveBeenCalled();
    expect(outside.finish).toHaveBeenCalledTimes(1);
  });

  test("still accelerates animations outside captcha containers", async () => {
    runScript();

    const wrap = document.createElement("div");
    wrap.className = "some-app-shell";
    document.body.appendChild(wrap);

    const deep = document.createElement("div");
    wrap.appendChild(deep);
    const anim = makeAnim({ animationName: "move" });
    deep.getAnimations = () => [anim];

    fire(deep, "animationstart", { animationName: "move" });
    await wait();

    /* Not inside a captcha-matched container: still accelerated. */
    expect(anim.finish).toHaveBeenCalledTimes(1);
  });

  test("suspends the CSS clamp while a captcha is on screen, restores after", async () => {
    runScript();

    const style = document.getElementById("__DNA_SHIELD__");
    expect(style.textContent).toEqual(
      expect.stringContaining("animation-delay:0s !important")
    );

    const dialog = document.createElement("div");
    dialog.className = "slider-captcha";
    document.body.appendChild(dialog);

    /* Incremental detection: the next MutationObserver batch. */
    await wait();
    expect(style.textContent).not.toEqual(
      expect.stringContaining("animation-delay")
    );
    expect(style.textContent).toEqual(
      expect.stringContaining("scroll-behavior:auto !important")
    );

    dialog.remove();
    await wait();
    expect(style.textContent).toEqual(
      expect.stringContaining("animation-delay:0s !important")
    );
  });

  test("keeps accelerating when only captcha scripts or badges are present", async () => {
    runScript();

    const style = document.getElementById("__DNA_SHIELD__");

    /* Loader and bot-detection scripts ship on every page of many sites. */
    for (const src of [
      "https://challenges.cloudflare.com/turnstile/v0/api.js",
      "/cdn-cgi/challenge-platform/scripts/jsd/main.js",
      "https://www.google.com/recaptcha/api.js?render=key"
    ]) {
      const script = document.createElement("script");
      script.src = src;
      document.head.appendChild(script);
    }
    const config = document.createElement("script");
    config.id = "captcha-config";
    document.head.appendChild(config);

    /* reCAPTCHA v3 / invisible: badge plus hidden challenge frame. */
    const badge = document.createElement("div");
    badge.className = "grecaptcha-badge";
    badge.innerHTML =
      '<iframe src="https://www.google.com/recaptcha/api2/anchor?size=invisible"></iframe>' +
      '<textarea id="g-recaptcha-response" class="g-recaptcha-response"></textarea>';
    document.body.appendChild(badge);
    const bframe = document.createElement("iframe");
    bframe.src = "https://www.google.com/recaptcha/api2/bframe?k=key";
    document.body.appendChild(bframe);

    await wait();
    expect(style.textContent).toEqual(
      expect.stringContaining("animation-delay:0s !important")
    );
  });

  test("suspends the CSS clamp for a rendered Turnstile widget without its class", async () => {
    runScript();

    const style = document.getElementById("__DNA_SHIELD__");
    const container = document.createElement("div");
    container.className = "w-full";
    container.innerHTML =
      '<input type="hidden" name="cf-turnstile-response" id="cf-chl-widget-abc_response">';
    document.body.appendChild(container);

    await wait();
    expect(style.textContent).not.toEqual(
      expect.stringContaining("animation-delay")
    );

    container.remove();
    await wait();
    expect(style.textContent).toEqual(
      expect.stringContaining("animation-delay:0s !important")
    );
  });

  test("detects a captcha already in the page once the page is idle", async () => {
    document.body.innerHTML = '<div id="NEW_CAPTCHA"></div>';
    runScript();
    await wait();

    const style = document.getElementById("__DNA_SHIELD__");
    expect(style.textContent).not.toEqual(
      expect.stringContaining("animation-delay")
    );
  });

  test("never accelerates animations inside a captcha host's shadow tree", async () => {
    runScript();

    const host = document.createElement("div");
    host.className = "cf-turnstile";
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: "open" });
    const inner = document.createElement("div");
    shadow.appendChild(inner);

    const shadowAnim = makeAnim();
    shadowAnim.effect.target = inner;
    document.getAnimations = () => [shadowAnim];
    window.DNAShield.sweep();
    delete document.getAnimations;

    await wait();
    expect(shadowAnim.finish).not.toHaveBeenCalled();
  });

  test("shuts down completely on a Cloudflare interstitial challenge", async () => {
    HTMLScriptElement.supports = (type) => type === "speculationrules";
    window._cf_chl_opt = { cType: "managed" };
    try {
      runScript();

      expect(window.DNAShield.enabled).toBe(false);
      expect(document.getElementById("__DNA_SHIELD__")).toBeNull();
      expect(document.getElementById("__DNA_SHIELD_RULES__")).toBeNull();

      const anim = makeAnim({ animationName: "spin-once" });
      const el = document.createElement("div");
      el.getAnimations = () => [anim];
      document.body.appendChild(el);
      fire(el, "animationstart", { animationName: "spin-once" });
      await wait();
      expect(anim.finish).not.toHaveBeenCalled();
    } finally {
      delete window._cf_chl_opt;
    }
  });

  test("keeps running on normal pages of Cloudflare-protected sites", () => {
    /* Bot detection sets _cf_chl_opt on ordinary pages, without cType. */
    window._cf_chl_opt = { fDDOx7: "x", nFSze1: "y" };
    try {
      runScript();

      expect(window.DNAShield.enabled).toBe(true);
      expect(document.getElementById("__DNA_SHIELD__").textContent).toEqual(
        expect.stringContaining("animation-delay:0s !important")
      );
    } finally {
      delete window._cf_chl_opt;
    }
  });

  test("finishes an authored transition when it starts, matching its property only", async () => {
    runScript();

    const el = document.createElement("div");
    document.body.appendChild(el);
    const opacity = makeAnim({ transitionProperty: "opacity", target: el });
    const transform = makeAnim({ transitionProperty: "transform", target: el });
    const keyframes = makeAnim({ animationName: "pulse", target: el });
    el.getAnimations = () => [opacity, transform, keyframes];

    fire(el, "transitionrun", { propertyName: "opacity" });
    await wait();

    expect(opacity.finish).toHaveBeenCalledTimes(1);
    expect(transform.finish).not.toHaveBeenCalled();
    expect(keyframes.finish).not.toHaveBeenCalled();
  });

  test("never finishes transitions inside a captcha", async () => {
    runScript();

    const captcha = document.createElement("div");
    captcha.className = "slide-verify";
    const knob = document.createElement("div");
    captcha.appendChild(knob);
    document.body.appendChild(captcha);
    const move = makeAnim({ transitionProperty: "left", target: knob });
    knob.getAnimations = () => [move];

    fire(knob, "transitionrun", { propertyName: "left" });
    await wait();

    expect(move.finish).not.toHaveBeenCalled();
  });

  test("accelerates pseudo-element animations the element list omits", async () => {
    runScript();

    const el = document.createElement("div");
    document.body.appendChild(el);
    const own = makeAnim({ animationName: "fade", target: el });
    const before = makeAnim({
      animationName: "fade", target: el, pseudoElement: "::before"
    });
    el.getAnimations = (opts) =>
      opts && opts.subtree ? [own, before] : [own];

    fire(el, "animationstart", { animationName: "fade", pseudoElement: "::before" });
    await wait();

    expect(before.finish).toHaveBeenCalledTimes(1);
    expect(own.finish).not.toHaveBeenCalled();
  });

  test("finishes a burst of transitions in one frame", async () => {
    runScript();

    const els = [];
    for (let i = 0; i < 200; i++) {
      const el = document.createElement("div");
      const t = makeAnim({ transitionProperty: "color", target: el });
      el.getAnimations = () => [t];
      el._t = t;
      document.body.appendChild(el);
      els.push(el);
    }
    els.forEach((el) => fire(el, "transitionrun", { propertyName: "color" }));
    await wait(20);

    expect(els.every((el) => el._t.finish.mock.calls.length === 1)).toBe(true);
  });

  test("leaves a paused animation for later instead of forgetting it", async () => {
    runScript();

    const anim = makeAnim({ playState: "paused" });
    document.getAnimations = () => [anim];
    window.DNAShield.sweep();
    await wait();
    expect(anim.finish).not.toHaveBeenCalled();

    anim.playState = "running";
    window.DNAShield.sweep();
    await wait();
    expect(anim.finish).toHaveBeenCalledTimes(1);

    delete document.getAnimations;
  });

  test("injects Chromium speculation rules exactly once", () => {
    HTMLScriptElement.supports = () => true;

    runScript();

    const rules = document.querySelectorAll(
      'script[type="application/speculationrules"]'
    );
    expect(rules.length).toBe(1);
    const parsed = JSON.parse(rules[0].textContent);
    expect(parsed.prerender[0].source).toBe("document");
    expect(parsed.prerender[0].eagerness).toBe("moderate");
    /* Cheap HTML prefetch starts on a 10 ms hover, before prerender. */
    expect(parsed.prefetch[0].eagerness).toBe("eager");
    const excluded = parsed.prefetch[0].where.and[1].not.selector_matches;
    expect(excluded).toEqual(expect.stringContaining('[href*="logout" i]'));
    expect(excluded).toEqual(expect.stringContaining('[href*="sign-out" i]'));
    expect(excluded).toEqual(expect.stringContaining('[href*="unsubscribe" i]'));
    expect(excluded).toEqual(expect.stringContaining('[href$=".zip" i]'));
    expect(parsed.prerender[0].where.and[1].not.selector_matches).toBe(excluded);

    window.DNAShield.stop();
    runScript();

    expect(
      document.querySelectorAll('script[type="application/speculationrules"]').length
    ).toBe(1);
  });

  test("routes script text through the site's default policy when present", () => {
    HTMLScriptElement.supports = () => true;
    /* Sites like Outlook: default policy exists, creating new ones is blocked. */
    const createPolicy = jest.fn(() => {
      throw new TypeError("Policy creation is disallowed");
    });
    window.trustedTypes = {
      createPolicy,
      defaultPolicy: { createScript: (s) => s }
    };

    runScript();

    /* No console CSP violation: our own policy was never attempted. */
    expect(createPolicy).not.toHaveBeenCalled();
    expect(
      document.querySelectorAll('script[type="application/speculationrules"]').length
    ).toBe(1);
  });

  test("skips silently when the site's default policy rejects the text", () => {
    HTMLScriptElement.supports = () => true;
    window.trustedTypes = {
      createPolicy: () => {
        throw new TypeError("Policy creation is disallowed");
      },
      defaultPolicy: {
        createScript: () => {
          throw new TypeError("rejected by default policy");
        }
      }
    };

    expect(() => runScript()).not.toThrow();
    expect(
      document.querySelectorAll('script[type="application/speculationrules"]').length
    ).toBe(0);
    expect(window.DNAShield.enabled).toBe(true);
  });

  test("uses a Trusted Types policy when one can be created", () => {
    HTMLScriptElement.supports = () => true;
    window.trustedTypes = {
      createPolicy: () => ({ createScript: (s) => s })
    };

    runScript();

    expect(
      document.querySelectorAll('script[type="application/speculationrules"]').length
    ).toBe(1);
  });

  test("skips script injection silently under enforced Trusted Types", () => {
    HTMLScriptElement.supports = () => true;
    /* Sites like Gmail allow only their own policy names. */
    window.trustedTypes = {
      createPolicy: () => {
        throw new TypeError("Policy creation is disallowed");
      }
    };

    expect(() => runScript()).not.toThrow();
    expect(
      document.querySelectorAll('script[type="application/speculationrules"]').length
    ).toBe(0);
    expect(window.DNAShield.enabled).toBe(true);
  });

  test("skips speculation rules on engines without support", () => {
    runScript();

    expect(
      document.querySelectorAll('script[type="application/speculationrules"]').length
    ).toBe(0);
  });

  test("leaves prefetching to the browser when speculation rules are supported", async () => {
    HTMLScriptElement.supports = () => true;

    runScript();

    const a = document.createElement("a");
    a.href = "http://localhost/chromium-hover";
    document.body.appendChild(a);

    fire(a, "pointerover");
    await wait(120);
    fire(a, "pointerdown", { button: 0 });
    await wait(20);

    /* The browser's speculation rules own same-origin prefetch here;
       a manual second prefetcher would double-download. */
    expect(document.querySelectorAll('link[rel="prefetch"]')).toHaveLength(0);
    expect(
      document.querySelectorAll('script[type="application/speculationrules"]').length
    ).toBe(1);
  });

  test("still preconnects cross-origin links when speculation rules are supported", async () => {
    HTMLScriptElement.supports = () => true;

    runScript();

    const a = document.createElement("a");
    a.href = "https://partner.example.com/landing";
    document.body.appendChild(a);

    fire(a, "pointerdown", { button: 0 });
    await wait(20);

    expect(
      document.querySelectorAll('link[rel="preconnect"][href="https://partner.example.com"]')
    ).toHaveLength(1);
  });

  test("prefetches same-origin links after hover intent", async () => {
    runScript();

    const a = document.createElement("a");
    a.href = "http://localhost/next-page";
    document.body.appendChild(a);

    fire(a, "pointerover");
    await wait(30);
    expect(document.querySelectorAll('link[rel="prefetch"]')).toHaveLength(0);

    await wait(60);
    const links = document.querySelectorAll(
      'link[rel="prefetch"][href="http://localhost/next-page"]'
    );
    expect(links).toHaveLength(1);
  });

  test("cancels hover prefetch when the pointer leaves the link", async () => {
    runScript();

    const a = document.createElement("a");
    a.href = "http://localhost/next-page";
    document.body.appendChild(a);

    fire(a, "pointerover");
    fire(a, "pointerout", { relatedTarget: document.body });
    await wait(120);

    expect(document.querySelectorAll('link[rel="prefetch"]')).toHaveLength(0);
  });

  test("prefetches immediately on pointerdown for touch users", async () => {
    runScript();

    const a = document.createElement("a");
    a.href = "http://localhost/tap-target";
    document.body.appendChild(a);

    fire(a, "pointerdown", { button: 0 });
    await wait(20);

    expect(
      document.querySelectorAll('link[rel="prefetch"][href="http://localhost/tap-target"]')
    ).toHaveLength(1);
  });

  test("never prefetches logout links, downloads, or heavy media", async () => {
    runScript();

    const hrefs = [
      "http://localhost/logout",
      "http://localhost/users/signout",
      "http://localhost/files/archive.zip"
    ];
    for (const href of hrefs) {
      const a = document.createElement("a");
      a.href = href;
      document.body.appendChild(a);
      fire(a, "pointerdown", { button: 0 });
    }

    const download = document.createElement("a");
    download.href = "http://localhost/report";
    download.setAttribute("download", "report.pdf");
    document.body.appendChild(download);
    fire(download, "pointerdown", { button: 0 });

    await wait(30);

    expect(document.querySelectorAll('link[rel="prefetch"]')).toHaveLength(0);
  });

  test("preconnects cross-origin links instead of prefetching", async () => {
    runScript();

    const a = document.createElement("a");
    a.href = "https://partner.example.com/landing";
    document.body.appendChild(a);

    fire(a, "pointerdown", { button: 0 });
    await wait(20);

    expect(
      document.querySelectorAll('link[rel="preconnect"][href="https://partner.example.com"]')
    ).toHaveLength(1);
    expect(
      document.querySelectorAll('link[rel="prefetch"][href="https://partner.example.com/landing"]')
    ).toHaveLength(0);
  });

  test("deduplicates hints and stops prefetching on Save-Data", async () => {
    runScript();

    const a = document.createElement("a");
    a.href = "http://localhost/once-only";
    document.body.appendChild(a);
    fire(a, "pointerdown", { button: 0 });
    fire(a, "pointerdown", { button: 0 });
    await wait(20);
    expect(
      document.querySelectorAll('link[rel="prefetch"][href="http://localhost/once-only"]')
    ).toHaveLength(1);

    window.DNAShield.stop();

    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: { saveData: true }
    });
    const b = document.createElement("a");
    b.href = "http://localhost/save-data-page";
    document.body.appendChild(b);
    fire(b, "pointerdown", { button: 0 });
    await wait(20);
    expect(
      document.querySelectorAll('link[rel="prefetch"][href="http://localhost/save-data-page"]')
    ).toHaveLength(0);

    delete navigator.connection;
  });

  test("stop() removes the stylesheet and detaches acceleration", async () => {
    runScript();

    expect(document.getElementById("__DNA_SHIELD__")).not.toBeNull();
    window.DNAShield.stop();
    expect(document.getElementById("__DNA_SHIELD__")).toBeNull();

    const el = document.createElement("div");
    document.body.appendChild(el);
    const anim = makeAnim({ animationName: "fade-in" });
    el.getAnimations = () => [anim];
    fire(el, "animationstart", { animationName: "fade-in" });
    await wait();

    expect(anim.finish).not.toHaveBeenCalled();
  });

  test("falls back to mouse events when Pointer Events are missing", async () => {
    delete window.PointerEvent;

    runScript();

    const a = document.createElement("a");
    a.href = "http://localhost/legacy-browser";
    document.body.appendChild(a);

    fire(a, "mouseover");
    await wait(120);

    expect(
      document.querySelectorAll('link[rel="prefetch"][href="http://localhost/legacy-browser"]')
    ).toHaveLength(1);
  });

  test("prefetches when a link receives keyboard focus", async () => {
    runScript();

    const a = document.createElement("a");
    a.href = "http://localhost/keyboard-nav";
    a.tabIndex = 0;
    document.body.appendChild(a);

    fire(a, "focusin");
    await wait(20);

    expect(
      document.querySelectorAll('link[rel="prefetch"][href="http://localhost/keyboard-nav"]')
    ).toHaveLength(1);
  });

  test("reinstalls and re-sweeps after a back/forward-cache restore", async () => {
    runScript();

    const scripted = makeAnim();
    document.getAnimations = () => [scripted];

    const style = document.getElementById("__DNA_SHIELD__");
    style.remove();

    fire(window, "pageshow", { persisted: true });
    await wait();

    expect(document.getElementById("__DNA_SHIELD__")).not.toBeNull();
    expect(scripted.finish).toHaveBeenCalledTimes(1);

    delete document.getAnimations;
  });
});
