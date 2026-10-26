/** Original Moonwren rules and loop. MIT License. */

import { WORLD, difficulty, spawnEvery, stepBird, clampCeiling, hitsWorld, randomGapTop, takeScore, floorY } from "./physics.js";
import { STRINGS, fill } from "./i18n.js";
import { drawWorld } from "./render.js";

const STEP_MS = 1000 / 60;
const DPR_CAP = 2;

export function createGame(env) {
  const canvas = env.canvas;
  const ctx = canvas.getContext("2d");
  const audio = env.audio;
  const reduce = env.reduceMotion;
  let lang = env.lang;
  let state = "ready";
  let bird = { y: 300, vy: 0 };
  let gates = [];
  let score = 0;
  let best = env.bestScore;
  let bestAtRun = best;
  let freshBest = false;
  let spawnAcc = 0.35;
  let distance = 0;
  let flapPhase = 0;
  let hoverT = 0;
  let last = 0;
  let acc = 0;
  const frameTimes = [];
  const feathers = Array.from({ length: 16 }, () => ({ alive: false, x: 0, y: 0, vx: 0, vy: 0, life: 0 }));
  const backdrop = env.backdrop;

  function hoverOffset() {
    if (reduce || state !== "ready") return 0;
    return Math.sin(hoverT * 2.2) * 6;
  }

  function spawnFeathers() {
    if (reduce) return;
    let left = 4;
    for (const speck of feathers) {
      if (speck.alive) continue;
      speck.alive = true;
      speck.x = WORLD.BIRD_X - 12;
      speck.y = bird.y;
      speck.vx = -50 - Math.random() * 70;
      speck.vy = (Math.random() - 0.5) * 90;
      speck.life = 0.4;
      left -= 1;
      if (!left) break;
    }
  }

  function updateFeathers(dt) {
    for (const speck of feathers) {
      if (!speck.alive) continue;
      speck.life -= dt;
      speck.x += speck.vx * dt;
      speck.y += speck.vy * dt;
      if (speck.life <= 0) speck.alive = false;
    }
  }

  function say(text) {
    if (env.live.textContent !== text) env.live.textContent = text;
  }

  function paintChrome() {
    const t = STRINGS[lang];
    env.score.textContent = String(score);
    env.bestNode.textContent = String(best);
    env.pauseBtn.disabled = state === "ready" || state === "gameover";
    env.pauseBtn.textContent = state === "paused" ? t.resume : t.pause;
    env.pauseBtn.setAttribute("aria-label", state === "paused" ? t.ariaResume : t.ariaPause);
    const muted = env.isMuted();
    env.muteBtn.textContent = muted ? t.unmute : t.mute;
    env.muteBtn.setAttribute("aria-label", muted ? t.ariaUnmute : t.ariaMute);
    env.langBtn.textContent = t.switchTo;
    env.langBtn.setAttribute("aria-label", t.ariaLang);
    canvas.setAttribute("aria-label", t.ariaCanvas);
    const show = state !== "playing";
    env.overlay.hidden = !show;
    if (state === "ready") {
      env.overlayTitle.textContent = t.readyTitle;
      env.overlayBody.textContent = t.readyBody;
      env.primary.textContent = t.play;
      say(t.liveReady);
    } else if (state === "playing") {
      say(fill(t.livePlaying, score));
    } else if (state === "paused") {
      env.overlayTitle.textContent = t.pausedTitle;
      env.overlayBody.textContent = t.pausedBody;
      env.primary.textContent = t.resume;
      say(t.livePaused);
    } else if (state === "gameover") {
      env.overlayTitle.textContent = t.overTitle;
      env.overlayBody.textContent = freshBest ? t.overBest : t.overBody;
      env.primary.textContent = t.retry;
      say(fill(t.liveOver, score));
    }
  }

  function flap() {
    bird.vy = WORLD.FLAP_VY;
    audio.flap();
    spawnFeathers();
  }

  function rememberBest() {
    if (score > best) {
      best = score;
      env.saveBest(best);
    }
  }

  function die() {
    if (state !== "playing") return;
    state = "gameover";
    freshBest = score > bestAtRun;
    rememberBest();
    audio.hit();
    paintChrome();
  }

  function update(dt) {
    bird = clampCeiling(stepBird(bird, dt, false));
    const diff = difficulty(score);
    distance += diff.speed * dt;
    for (const gate of gates) gate.x -= diff.speed * dt;
    spawnAcc += dt;
    const every = spawnEvery(diff.speed);
    const floor = floorY();
    while (spawnAcc >= every) {
      spawnAcc -= every;
      gates.push({
        x: WORLD.W + 8,
        gapTop: randomGapTop(diff.gap, floor, Math.random),
        gapH: diff.gap,
        scored: false,
        hue: Math.floor(Math.random() * 4),
      });
    }
    gates = gates.filter((gate) => gate.x + WORLD.GATE_W > -40);
    const gained = takeScore(WORLD.BIRD_X, gates);
    if (gained) {
      score += gained;
      audio.point();
      rememberBest();
      paintChrome();
    }
    updateFeathers(dt);
    flapPhase += dt * (bird.vy < 0 ? 16 : 7);
    if (hitsWorld(bird, gates, floor)) die();
  }

  function draw(deltaMs) {
    const cssW = canvas.clientWidth || 1;
    const cssH = canvas.clientHeight || 1;
    const dpr = Math.min(env.devicePixelRatio || 1, DPR_CAP);
    const bw = Math.max(1, Math.round(cssW * dpr));
    const bh = Math.max(1, Math.round(cssH * dpr));
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
    }
    ctx.setTransform(bw / WORLD.W, 0, 0, bh / WORLD.H, 0, 0);
    drawWorld(ctx, {
      backdrop,
      gates,
      bird,
      drawY: bird.y + hoverOffset(),
      flapPhase,
      feathers,
      distance,
    });
    if (env.debug) {
      frameTimes.push(deltaMs);
      if (frameTimes.length > 300) frameTimes.shift();
      const avg = frameTimes.reduce((sum, n) => sum + n, 0) / frameTimes.length;
      env.debugOut.hidden = false;
      env.debugOut.textContent = "avg " + avg.toFixed(2) + " ms / " + String(frameTimes.length);
    }
  }

  function frame(now) {
    env.requestFrame(frame);
    if (!last) last = now;
    const delta = Math.min(100, now - last);
    last = now;
    if (state === "playing") {
      acc += delta;
      let steps = 0;
      while (acc >= STEP_MS && steps < 5 && state === "playing") {
        update(STEP_MS / 1000);
        acc -= STEP_MS;
        steps += 1;
      }
    } else {
      acc = 0;
      hoverT += delta / 1000;
      updateFeathers(delta / 1000);
    }
    draw(delta);
  }

  function primary() {
    audio.unlock();
    if (state === "ready") {
      bird.y += hoverOffset();
      hoverT = 0;
      state = "playing";
      bestAtRun = best;
      freshBest = false;
      flap();
      paintChrome();
      return;
    }
    if (state === "playing") {
      flap();
      return;
    }
    if (state === "paused") {
      state = "playing";
      last = 0;
      paintChrome();
      return;
    }
    state = "ready";
    bird = { y: 300, vy: 0 };
    gates = [];
    score = 0;
    spawnAcc = 0.35;
    freshBest = false;
    for (const speck of feathers) speck.alive = false;
    paintChrome();
  }

  function togglePause() {
    if (state === "playing") {
      state = "paused";
      paintChrome();
      return true;
    }
    if (state === "paused") {
      state = "playing";
      last = 0;
      paintChrome();
      return true;
    }
    return false;
  }

  function onHidden() {
    if (state === "playing") {
      state = "paused";
      paintChrome();
    }
  }

  function setLang(next) {
    lang = next;
    paintChrome();
  }

  paintChrome();
  env.requestFrame(frame);

  return { primary, togglePause, onHidden, setLang, paintChrome };
}
