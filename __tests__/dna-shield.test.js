
const fs = require("fs");
const path = require("path");

const scriptPath = path.join(__dirname, "..", "DNA-Shield.user.js");
const scriptContent = fs.readFileSync(scriptPath, "utf8");

function runScript() {
  // The userscript is an IIFE evaluated against the jsdom globals.
  // eslint-disable-next-line no-eval
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

  test("clamps transitions and delays to 0.01s/0s without freezing animations", () => {
    runScript();

    const style = document.getElementById("__DNA_SHIELD__");
    expect(style).not.toBeNull();
    expect(style.textContent).toEqual(
      expect.stringContaining("transition-duration:0.01s !important")
    );
    expect(style.textContent).toEqual(
      expect.stringContaining("animation-delay:0s !important")
    );
    expect(style.textContent).toEqual(
      expect.stringContaining("transition-delay:0s !important")
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

  test("ignores transitions so state machines stay in control", async () => {
    runScript();

    const el = document.createElement("div");
    document.body.appendChild(el);
    const transition = makeAnim({ transitionProperty: "opacity" });
    el.getAnimations = () => [transition];

    fire(el, "animationstart", { animationName: "" });
    window.DNAShield.sweep();
    await wait();

    expect(transition.finish).not.toHaveBeenCalled();
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
    expect(parsed.prefetch[0].where.and[1].not.selector_matches).toEqual(
      expect.stringContaining("logout")
    );

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
