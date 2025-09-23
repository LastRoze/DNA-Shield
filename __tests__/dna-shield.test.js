
const fs = require("fs");
const path = require("path");

const scriptPath = path.join(__dirname, "..", "DNA-Shield.user.js");

function runScript() {
  const scriptContent = fs.readFileSync(scriptPath, "utf8");
  eval(scriptContent);
}

describe("DNA Shield userscript", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("style");
    document.documentElement.className = "";
    document.head.innerHTML = "";
    document.body.innerHTML = "";
    delete window.seconds;
    delete window.jQuery;
    delete window.wrappedJSObject;
  });

  test("sets a negative seconds flag and strips async-hide", () => {
    document.documentElement.classList.add("async-hide");
    document.documentElement.setAttribute("style", "color: red;");

    runScript();

    expect(window.seconds).toBe(-1);
    expect(document.documentElement.classList.contains("async-hide")).toBe(false);

    const htmlStyle = document.documentElement.getAttribute("style");
    expect(htmlStyle).toEqual(expect.stringContaining("-webkit-animation-timing-function: step-end !important;"));
    expect(htmlStyle).toEqual(expect.stringContaining("animation-delay: -1ms !important;"));
    expect(htmlStyle).toEqual(expect.stringContaining("animation-duration: -1ms !important;"));
    expect(htmlStyle).toEqual(expect.stringContaining("animation-timing-function: step-end !important;"));
    expect(htmlStyle).toEqual(expect.stringContaining("scroll-behavior: auto !important;"));
    expect(htmlStyle).toEqual(expect.stringContaining("transition-delay: -1ms !important;"));
    expect(htmlStyle).toEqual(expect.stringContaining("transition-duration: -1ms !important;"));
    expect(htmlStyle).toEqual(expect.stringContaining("transition-timing-function: step-end !important;"));
  });

  test("disables jQuery animations when present", () => {
    window.jQuery = { fx: { off: false } };

    runScript();

    expect(window.jQuery.fx.off).toBe(true);
  });

  test("disables wrapped jQuery animations when only wrappedJSObject is defined", () => {
    window.wrappedJSObject = { jQuery: { fx: { off: false } } };

    runScript();

    expect(window.wrappedJSObject.jQuery.fx.off).toBe(true);
  });

  test("injects global style overrides", () => {
    runScript();

    const styles = Array.from(document.head.querySelectorAll("style"));
    const style = styles.find((el) => el.textContent.includes("*,*::before,*::after"));

    expect(style).toBeDefined();
    expect(style.textContent).toEqual(expect.stringContaining("-webkit-animation-timing-function: step-end !important;"));
    expect(style.textContent).toEqual(expect.stringContaining("transition-timing-function: step-end !important;"));
  });
});
