const fs = require("fs");
const path = require("path");

describe("DNA Shield internals", () => {
  let internals;
  let originalSetInterval;
  let originalClearInterval;
  let originalVisibilityDescriptor;

  beforeAll(() => {
    originalSetInterval = window.setInterval;
    originalClearInterval = window.clearInterval;
    window.setInterval = jest.fn(() => 1);
    window.clearInterval = jest.fn();
    navigator.sendBeacon = jest.fn(() => true);

    const scriptContent = fs.readFileSync(path.join(__dirname, "..", "DNA-Shield.user.js"), "utf8");
    // Evaluate the userscript inside the jsdom environment.
    eval(scriptContent);
    internals = window.__DNA_SHIELD_INTERNALS__;
  });

  afterAll(() => {
    internals.stopKeepAliveTimer();
    window.setInterval = originalSetInterval;
    window.clearInterval = originalClearInterval;
    if (originalVisibilityDescriptor) {
      Object.defineProperty(document, "visibilityState", originalVisibilityDescriptor);
    }
  });

  test("exposes expected helper surface", () => {
    expect(internals).toMatchObject({
      parseTimeList: expect.any(Function),
      clampAnimationDurations: expect.any(Function),
      applyPriorityHints: expect.any(Function),
      getKeepAliveInterval: expect.any(Function),
      isOnline: expect.any(Function),
    });
  });

  test("parseTimeList normalizes CSS time tokens", () => {
    expect(internals.parseTimeList("1s, 250ms, 2.5")).toEqual([1000, 250, 2.5]);
  });

  test("clampAnimationDurations respects repeated animations", () => {
    const result = internals.clampAnimationDurations([500, 200, 5000], [1, 2, 1]);
    expect(result.values).toEqual([180, 200, 180]);
    expect(result.changed).toBe(true);
  });

  test("clampDurations enforces maximum threshold", () => {
    const result = internals.clampDurations([50, 400, 0], 140);
    expect(result.values).toEqual([50, 140, 0]);
    expect(result.changed).toBe(true);
  });

  test("clampDelays enforces motion delay limit", () => {
    const result = internals.clampDelays([0, 10, 1000]);
    expect(result.values).toEqual([0, 0, 0]);
    expect(result.changed).toBe(true);
  });

  test("formatTimeList produces CSS-compatible values", () => {
    expect(internals.formatTimeList([100, 10.5])).toBe("100ms, 10.50ms");
  });

  test("applyPriorityHints sets attribute fallbacks", () => {
    const element = document.createElement("img");
    Object.defineProperty(element, "fetchPriority", {
      configurable: true,
      get() {
        return this._priority || "auto";
      },
      set(value) {
        this._priority = value;
      },
    });

    internals.applyPriorityHints(element, "high");

    expect(element.fetchPriority).toBe("high");
    expect(element.getAttribute("fetchpriority")).toBe("high");
    expect(element.getAttribute("importance")).toBe("high");
  });

  test("getKeepAliveInterval reacts to visibility state", () => {
    originalVisibilityDescriptor = Object.getOwnPropertyDescriptor(document, "visibilityState");
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "hidden",
    });

    expect(internals.getKeepAliveInterval()).toBe(75000);
  });

  test("restartKeepAliveTimer wires up timers and stop clears them", () => {
    const sender = jest.fn();
    internals.restartKeepAliveTimer(sender);

    expect(window.setInterval).toHaveBeenCalledWith(sender, expect.any(Number));

    internals.stopKeepAliveTimer();
    expect(window.clearInterval).toHaveBeenCalledWith(1);
  });

  test("isOnline defers to navigator state", () => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: false,
    });
    expect(internals.isOnline()).toBe(false);

    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: true,
    });
    expect(internals.isOnline()).toBe(true);
  });
});
