/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://mortera.example/cdn-cgi/challenge-platform/h/g/orchestrate/chl_page/v1"}
 */
const fs = require("fs");
const path = require("path");

const scriptContent = fs.readFileSync(
  path.join(__dirname, "..", "DNA-Shield.user.js"),
  "utf8"
);

test("leaves zero footprint inside a verification document (cdn-cgi path)", () => {
  HTMLScriptElement.supports = (type) => type === "speculationrules";

  eval(scriptContent);

  expect(window.DNAShield).toBeUndefined();
  expect(document.getElementById("__DNA_SHIELD__")).toBeNull();
  expect(document.getElementById("__DNA_SHIELD_RULES__")).toBeNull();
  expect(document.querySelectorAll("link")).toHaveLength(0);
});
