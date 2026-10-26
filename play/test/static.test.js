import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const banned = /flappy|nintendo|dong nguyen/i;

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}

const files = walk(root, []);
assert.ok(files.some((path) => path.endsWith("index.html")));
assert.ok(files.some((path) => path.endsWith(".nojekyll")));
assert.ok(files.some((path) => path.endsWith("favicon.svg")));

for (const path of files) {
  if (path.includes("/test/")) continue;
  if (!/\.(html|css|js|svg)$/.test(path)) continue;
  const text = readFileSync(path, "utf8");
  const withoutNamespace = text.replaceAll('xmlns="http://www.w3.org/2000/svg"', "");
  assert.equal(banned.test(text), false, path);
  assert.equal(/https?:\/\//.test(withoutNamespace), false, path);
  assert.equal(/@font-face/.test(text), false, path);
  assert.equal(/fonts\.google/.test(text), false, path);
}

console.log("static.test.js PASS");
