import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { STRINGS, detectLanguage, fill } from "../js/i18n.js";

const enKeys = Object.keys(STRINGS.en).sort();
const zhKeys = Object.keys(STRINGS.zh).sort();
assert.deepEqual(enKeys, zhKeys);
for (const key of enKeys) {
  assert.ok(STRINGS.en[key].length > 0);
  assert.ok(STRINGS.zh[key].length > 0);
  assert.notEqual(STRINGS.en[key], STRINGS.zh[key]);
}
assert.equal(fill(STRINGS.en.livePlaying, 3), "Score 3");
assert.equal(fill(STRINGS.zh.livePlaying, 3), "分数 3");

assert.equal(detectLanguage(["en-US"], null), "en");
assert.equal(detectLanguage(["zh-CN", "en-US"], null), "zh");
assert.equal(detectLanguage(["zh-Hans"], null), "zh");
assert.equal(detectLanguage(["fr-FR"], "zh"), "zh");
assert.equal(detectLanguage(["zh-CN"], "en"), "en");
assert.equal(detectLanguage([], null), "en");
assert.equal(detectLanguage(undefined, ""), "en");

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
assert.ok(html.includes(STRINGS.en.noscript));
assert.ok(html.includes(STRINGS.zh.noscript));
const used = [...html.matchAll(/data-i18n="([^"]+)"/g)].map((match) => match[1]);
for (const key of used) assert.ok(enKeys.includes(key), key);

console.log("i18n.test.js PASS");
