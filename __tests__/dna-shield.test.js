
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
 * Build a mock Animation object covering the surface DNA Shield reads:
 * animationName / transitionProperty detection, playState, computed
 * timing, and the finish/playbackRate controls.
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
    animationName: has("animationName") ? options.animationName : "fade-in",
    transitionProperty: has("transitionProperty") ? options.transitionProperty : undefined,
    playState: options.playState || "running",
    playbackRate: 1,
    updatePlaybackRate: jest.fn(),
    finish: jest.fn(),
    effect: {
      getComputedTiming: () => timing
    }
  };
}

/** Wait long enough for jsdom's timer-driven requestAnimationFrame to fire. */
function nextFrame() {
  return new Promise((resolve) => setTimeout(resolve, 50));
}

describe("DNA Shield userscript", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    document.body.innerHTML = "";
    localStorage.clear();
    delete window.DNAShield;
    delete window.__DNA_SHIELD__;
    delete window.__DNA_SHIELD_VERSION__;
    delete window.__DNA_SHIELD_SAFE__;
  });

  test("exposes public state and API", () => {
    runScript();

    expect(window.__DNA_SHIELD__).toBe(true);
    expect(window.__DNA_SHIELD_VERSION__).toBe("2.3");
    expect(window.DNAShield).toBeDefined();
    expect(window.DNAShield.version).toBe("2.3");
    expect(window.DNAShield.enabled).toBe(true);
    expect(window.DNAShield.config.zeroAnimationDelays).toBe(true);
    expect(window.DNAShield.config.accelerateTransitions).toBe(false);
    expect(typeof window.DNAShield.sweep).toBe("function");
    expect(typeof window.DNAShield.accelerate).toBe("function");
    expect(typeof window.DNAShield.stopSweep).toBe("function");
  });

  test("installs its scoped stylesheet immediately", () => {
    runScript();

    const style = document.getElementById(
      `__DNA_SHIELD_${window.__DNA_SHIELD_VERSION__}__`
    );
    expect(style).not.toBeNull();
    expect(style.textContent).toEqual(
      expect.stringContaining("animation-delay: 0s !important;")
    );
    expect(style.textContent).toEqual(
      expect.stringContaining("scroll-behavior: auto !important;")
    );
  });

  test("injects no transition or universal-selector overrides", () => {
    runScript();

    const style = document.getElementById(
      `__DNA_SHIELD_${window.__DNA_SHIELD_VERSION__}__`
    );
    expect(style).not.toBeNull();
    expect(style.textContent).not.toEqual(
      expect.stringContaining("transition-duration")
    );
    expect(style.textContent).not.toEqual(
      expect.stringContaining("::before")
    );
    expect(style.textContent).not.toEqual(
      expect.stringContaining("async-hide")
    );
  });

  test("stays disabled when the per-site kill switch is set", () => {
    localStorage.setItem("__DNA_SHIELD_OFF__", "1");

    runScript();

    expect(window.DNAShield.enabled).toBe(false);
    expect(
      document.querySelector('style[id^="__DNA_SHIELD_"]')
    ).toBeNull();
  });

  test("fast-forwards finite CSS animations on the next frame", async () => {
    runScript();

    const anim = makeAnim();
    window.DNAShield.accelerate({ getAnimations: () => [anim] });
    expect(anim.finish).not.toHaveBeenCalled();

    await nextFrame();

    expect(anim.finish).toHaveBeenCalledTimes(1);
  });

  test("leaves infinite animations and transitions alone", async () => {
    runScript();

    const infinite = makeAnim({ timing: { iterations: Infinity, endTime: Infinity, activeDuration: Infinity } });
    const transition = makeAnim({ animationName: undefined, transitionProperty: "opacity" });

    window.DNAShield.accelerate({
      getAnimations: () => [infinite, transition]
    });

    await nextFrame();

    expect(infinite.finish).not.toHaveBeenCalled();
    expect(transition.finish).not.toHaveBeenCalled();
    expect(infinite.updatePlaybackRate).not.toHaveBeenCalled();
  });

  test("only accelerates animations matching the given name", async () => {
    runScript();

    const fade = makeAnim({ animationName: "fade-in" });
    const spin = makeAnim({ animationName: "spin" });

    window.DNAShield.accelerate(
      { getAnimations: () => [fade, spin] },
      "fade-in"
    );

    await nextFrame();

    expect(fade.finish).toHaveBeenCalledTimes(1);
    expect(spin.finish).not.toHaveBeenCalled();
  });

  test("sweep fast-forwards script-created animations", async () => {
    runScript();

    const scripted = makeAnim({ animationName: undefined, transitionProperty: undefined });
    const original = document.getAnimations;
    document.getAnimations = () => [scripted];

    try {
      window.DNAShield.sweep();
    } finally {
      if (original === undefined) {
        delete document.getAnimations;
      } else {
        document.getAnimations = original;
      }
    }

    await nextFrame();

    expect(scripted.finish).toHaveBeenCalledTimes(1);
  });

  test("event-driven acceleration ignores script-created animations", async () => {
    runScript();

    const scripted = makeAnim({ animationName: undefined, transitionProperty: undefined });

    window.DNAShield.accelerate({ getAnimations: () => [scripted] });

    await nextFrame();

    expect(scripted.finish).not.toHaveBeenCalled();
  });
});
