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
    for (const rect of gateRects(gate, floorY)) {
      if (circleHitsRect(WORLD.BIRD_X, bird.y, WORLD.BIRD_R, rect.x, rect.y, rect.w, rect.h)) {
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
