import assert from "node:assert/strict";
import {
  WORLD, difficulty, spawnEvery, stepBird, clampCeiling, circleHitsRect,
  circleHitsEllipse, lanternEllipses, gateRects, hitsWorld, randomGapTop, takeScore, floorY,
} from "../js/physics.js";

const flapped = stepBird({ y: 100, vy: 400 }, 0.5, true);
assert.equal(flapped.vy, WORLD.FLAP_VY);

const fallen = stepBird({ y: 280, vy: 0 }, 0.5, false);
assert.equal(fallen.vy, WORLD.MAX_FALL);
assert.ok(fallen.y > 280);

let bird = { y: 280, vy: 0 };
let peak = bird.y;
for (let i = 0; i < 60; i += 1) {
  bird = stepBird(bird, 1 / 60, i === 0);
  if (bird.y < peak) peak = bird.y;
}
assert.ok(peak < 280 - 40);
assert.ok(bird.y > 280);

const capped = clampCeiling({ y: 2, vy: -100 });
assert.equal(capped.y, WORLD.BIRD_R);
assert.equal(capped.vy, 0);
assert.deepEqual(clampCeiling({ y: 40, vy: 10 }), { y: 40, vy: 10 });

assert.equal(circleHitsRect(10, 10, 5, 0, 0, 20, 20), true);
assert.equal(circleHitsRect(100, 100, 5, 0, 0, 10, 10), false);
assert.equal(circleHitsRect(10, 10, 5, 0, 0, 0, 10), false);

const open = difficulty(0);
assert.equal(open.speed, 156);
assert.equal(open.gap, 196);
const mid = difficulty(4);
assert.equal(mid.speed, 166);
assert.equal(mid.gap, 192);
const hard = difficulty(100);
assert.equal(hard.speed, WORLD.SPEED_MAX);
assert.equal(hard.gap, WORLD.GAP_MIN);
assert.ok(spawnEvery(open.speed) > 0.5);

const floor = floorY();
for (let score = 0; score <= 60; score += 1) {
  const diff = difficulty(score);
  const low = randomGapTop(diff.gap, floor, () => 0);
  const high = randomGapTop(diff.gap, floor, () => 0.999);
  assert.ok(low >= WORLD.MARGIN - 0.001);
  assert.ok(high <= floor - diff.gap - WORLD.MARGIN + 1);
}

const gates = [
  { x: WORLD.BIRD_X - WORLD.GATE_W - 2, gapTop: 100, gapH: 180, scored: false },
  { x: 400, gapTop: 100, gapH: 180, scored: false },
];
assert.equal(takeScore(WORLD.BIRD_X, gates), 1);
assert.equal(gates[0].scored, true);
assert.equal(takeScore(WORLD.BIRD_X, gates), 0);

const hitGate = [{ x: WORLD.BIRD_X - 10, gapTop: 40, gapH: 80, scored: false }];
assert.equal(hitsWorld({ y: 20, vy: 0 }, hitGate, floor), "lantern");
assert.equal(hitsWorld({ y: floor - 4, vy: 0 }, [], floor), "ground");
assert.equal(hitsWorld({ y: 300, vy: 0 }, [{ x: 400, gapTop: 200, gapH: 196, scored: false }], floor), "");


// --- Lantern hitbox matches the drawn ellipse (not the full column) ---
assert.equal(circleHitsEllipse(0, 0, 5, 0, 0, 10, 10), true);
assert.equal(circleHitsEllipse(30, 0, 5, 0, 0, 10, 10), false);

// A typical mid-run gate: gap from y=200 to y=396 (gapH 196)
const gate = { x: WORLD.BIRD_X - WORLD.GATE_W / 2, gapTop: 200, gapH: 196, scored: false };
const [topE, botE] = lanternEllipses(gate, floor);
const cols = gateRects(gate, floor);

// Empty sky in the top column, well above the drawn lantern body: old rect would hit, ellipse must miss.
const skyY = 20; // near the top of the column
assert.equal(circleHitsRect(WORLD.BIRD_X, skyY, WORLD.BIRD_R, cols[0].x, cols[0].y, cols[0].w, cols[0].h), true,
  "sanity: sky point sits inside the old full-column rect");
assert.equal(hitsWorld({ y: skyY, vy: 0 }, [gate], floor), "",
  "near-miss in empty sky above the top lantern must NOT collide");

// Empty air in the bottom column, below the drawn lantern body toward the eaves.
const airY = botE.ey + botE.ry + WORLD.BIRD_R + 8;
assert.ok(airY + WORLD.BIRD_R < floor, "air point is still above the floor");
assert.equal(circleHitsRect(WORLD.BIRD_X, airY, WORLD.BIRD_R, cols[1].x, cols[1].y, cols[1].w, cols[1].h), true,
  "sanity: air point sits inside the old full-column rect");
assert.equal(hitsWorld({ y: airY, vy: 0 }, [gate], floor), "",
  "near-miss in empty air below the bottom lantern must NOT collide");

// Through the glowing gap: clear.
assert.equal(hitsWorld({ y: gate.gapTop + gate.gapH / 2, vy: 0 }, [gate], floor), "");

// Visual overlap with the top lantern body centre: must collide.
assert.equal(hitsWorld({ y: topE.ey, vy: 0 }, [gate], floor), "lantern",
  "overlap with the drawn top lantern must collide");
// Visual overlap with the bottom lantern body centre: must collide.
assert.equal(hitsWorld({ y: botE.ey, vy: 0 }, [gate], floor), "lantern",
  "overlap with the drawn bottom lantern must collide");


console.log("physics.test.js PASS");
