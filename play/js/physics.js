/** Original Moonwren physics. MIT License. No third-party code. */

export const WORLD = Object.freeze({
  W: 480,
  H: 720,
  GROUND_H: 84,
  BIRD_X: 128,
  BIRD_R: 13,
  VISUAL_R: 16,
  GRAVITY: 1700,
  FLAP_VY: -455,
  MAX_FALL: 760,
  GATE_W: 74,
  GAP0: 196,
  GAP_MIN: 150,
  GAP_STEP: 4,
  SPEED0: 156,
  SPEED_MAX: 252,
  SPEED_STEP: 10,
  EVERY: 4,
  SPAWN_CLEAR: 196,
  MARGIN: 78,
});

export function difficulty(score) {
  const steps = Math.floor(Math.max(0, score) / WORLD.EVERY);
  return {
    speed: Math.min(WORLD.SPEED_MAX, WORLD.SPEED0 + steps * WORLD.SPEED_STEP),
    gap: Math.max(WORLD.GAP_MIN, WORLD.GAP0 - steps * WORLD.GAP_STEP),
  };
}

export function spawnEvery(speed) {
  return (WORLD.GATE_W + WORLD.SPAWN_CLEAR) / speed;
}

/** Semi-implicit Euler. A flap replaces vertical speed after gravity for that step. */
export function stepBird(bird, dt, flap) {
  let vy = bird.vy + WORLD.GRAVITY * dt;
  if (flap) vy = WORLD.FLAP_VY;
  if (vy > WORLD.MAX_FALL) vy = WORLD.MAX_FALL;
  return { y: bird.y + vy * dt, vy };
}

/** The eaves kill. The top of the sky only stops the bird. */
export function clampCeiling(bird) {
  if (bird.y < WORLD.BIRD_R) return { y: WORLD.BIRD_R, vy: 0 };
  return { y: bird.y, vy: bird.vy };
}

export function circleHitsRect(cx, cy, r, x, y, w, h) {
  if (w <= 0 || h <= 0) return false;
  const nx = Math.max(x, Math.min(cx, x + w));
  const ny = Math.max(y, Math.min(cy, y + h));
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy < r * r;
}

/** Axis-aligned ellipse vs circle (same formula as a scaled circle test). */
export function circleHitsEllipse(cx, cy, r, ex, ey, rx, ry) {
  if (rx <= 0 || ry <= 0) return false;
  const dx = cx - ex;
  const dy = cy - ey;
  const R = r; // expand ellipse by bird radius via Minkowski: approx by growing rx,ry
  const RX = rx + R;
  const RY = ry + R;
  return (dx * dx) / (RX * RX) + (dy * dy) / (RY * RY) < 1;
}

/**
 * Lantern hit shapes match render.js draw call:
 *   top:  lantern(gate.x, topH - topH*0.72, GATE_W, topH*0.72)
 *   bot:  lantern(gate.x, botY, GATE_W, botH*0.7)
 * where the body is an ellipse at (cx, y+h*0.5) with radii (w*0.4, max(8, h*0.28)).
 * Empty sky above the top lantern and empty air below the bottom lantern are no longer fatal.
 */
export function lanternEllipses(gate, groundY) {
  const topH = Math.max(24, gate.gapTop);
  const topY = topH - topH * 0.72;
  const topBodyH = topH * 0.72;
  const botY = gate.gapTop + gate.gapH;
  const botH = Math.max(24, groundY - botY);
  const botBodyH = botH * 0.7;
  const cx = gate.x + WORLD.GATE_W / 2;
  return [
    {
      ex: cx,
      ey: topY + topBodyH * 0.5,
      rx: WORLD.GATE_W * 0.4,
      ry: Math.max(8, topBodyH * 0.28),
    },
    {
      ex: cx,
      ey: botY + botBodyH * 0.5,
      rx: WORLD.GATE_W * 0.4,
      ry: Math.max(8, botBodyH * 0.28),
    },
  ];
}

/** Kept for callers that still want the old full-column boxes (tests / debug). */
export function gateRects(gate, groundY) {
  return [
    { x: gate.x, y: 0, w: WORLD.GATE_W, h: gate.gapTop },
    {
      x: gate.x,
      y: gate.gapTop + gate.gapH,
      w: WORLD.GATE_W,
      h: groundY - (gate.gapTop + gate.gapH),
    },
  ];
}

export function hitsWorld(bird, gates, floorY) {
  if (bird.y + WORLD.BIRD_R >= floorY) return "ground";
  for (const gate of gates) {
    for (const e of lanternEllipses(gate, floorY)) {
      if (circleHitsEllipse(WORLD.BIRD_X, bird.y, WORLD.BIRD_R, e.ex, e.ey, e.rx, e.ry)) {
        return "lantern";
      }
    }
  }
  return "";
}

export function randomGapTop(gapH, floorY, rand) {
  const min = WORLD.MARGIN;
  const max = floorY - gapH - WORLD.MARGIN;
  if (max <= min) return min;
  return min + rand() * (max - min);
}

export function takeScore(birdX, gates) {
  let add = 0;
  for (const gate of gates) {
    if (!gate.scored && gate.x + WORLD.GATE_W < birdX) {
      gate.scored = true;
      add += 1;
    }
  }
  return add;
}

export function floorY() {
  return WORLD.H - WORLD.GROUND_H;
}
