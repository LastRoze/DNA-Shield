/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://challenges.cloudflare.com/cdn-cgi/challenge-platform/h/b/turnstile/if/ov2/av0/rcv/abc/0x4AAA/auto/fbE/new/normal/auto/"}
 */
const fs = require("fs");
const path = require("path");

const scriptContent = fs.readFileSync(
  path.join(__dirname, "..", "DNA-Shield.user.js"),
  "utf8"
);

test("leaves zero footprint inside a verification document (challenges.cloudflare.com)", () => {
  HTMLScriptElement.supports = (type) => type === "speculationrules";

  eval(scriptContent);

  expect(window.DNAShield).toBeUndefined();
  expect(document.getElementById("__DNA_SHIELD__")).toBeNull();
  expect(document.getElementById("__DNA_SHIELD_RULES__")).toBeNull();
  expect(document.querySelectorAll("link")).toHaveLength(0);
});
