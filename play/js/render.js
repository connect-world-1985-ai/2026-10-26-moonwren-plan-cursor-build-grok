/** Original Moonwren drawing. MIT License. Shapes only, no image files. */

import { WORLD } from "./physics.js";

const LANTERNS = ["#f0a040", "#e25b45", "#3ec6b6", "#e7d36b"];
const FONT = '"PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Noto Sans SC", "Microsoft YaHei", "Source Han Sans SC", "WenQuanYi Micro Hei", "Noto Serif CJK SC", sans-serif';

function mulberry32(seed) {
  let a = seed >>> 0;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeBackdrop() {
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = WORLD.W * scale;
  canvas.height = WORLD.H * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  const sky = ctx.createLinearGradient(0, 0, 0, WORLD.H);
  sky.addColorStop(0, "#140e22");
  sky.addColorStop(0.55, "#3a2260");
  sky.addColorStop(1, "#1c3a58");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WORLD.W, WORLD.H);
  ctx.fillStyle = "#f3e2b8";
  ctx.beginPath();
  ctx.arc(368, 118, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3a2260";
  ctx.beginPath();
  ctx.arc(386, 108, 38, 0, Math.PI * 2);
  ctx.fill();
  const rand = mulberry32(20261026);
  for (let i = 0; i < 48; i += 1) {
    const x = rand() * WORLD.W;
    const y = rand() * (WORLD.H - WORLD.GROUND_H - 20);
    const r = 0.6 + rand() * 1.5;
    ctx.fillStyle = "rgba(247, 243, 232, 0.9)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  return canvas;
}

function ridge(ctx, color, base, amp, scroll) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, WORLD.H);
  for (let x = 0; x <= WORLD.W; x += 8) {
    const y = base + Math.sin((x + scroll) * 0.02) * amp + Math.sin((x + scroll) * 0.008) * amp * 0.4;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(WORLD.W, WORLD.H);
  ctx.closePath();
  ctx.fill();
}

function lantern(ctx, x, y, w, h, color) {
  const cx = x + w / 2;
  ctx.strokeStyle = "#3a2418";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, Math.min(y, y + 6));
  ctx.lineTo(cx, y + h * 0.22);
  ctx.stroke();
  ctx.fillStyle = "#3a2418";
  ctx.fillRect(cx - w * 0.16, y + h * 0.18, w * 0.32, 7);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.5, w * 0.4, Math.max(8, h * 0.28), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 236, 196, 0.5)";
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.48, w * 0.16, Math.max(4, h * 0.12), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx, y + h * 0.76);
  ctx.lineTo(cx, y + h * 0.96);
  ctx.stroke();
}

export function drawWorld(ctx, model) {
  ctx.clearRect(0, 0, WORLD.W, WORLD.H);
  ctx.drawImage(model.backdrop, 0, 0, WORLD.W, WORLD.H);
  ridge(ctx, "#241833", WORLD.H - 150, 18, model.distance * 0.25);
  ridge(ctx, "#1a2438", WORLD.H - 120, 12, model.distance * 0.45);
  const floor = WORLD.H - WORLD.GROUND_H;
  for (const gate of model.gates) {
    const color = LANTERNS[gate.hue % LANTERNS.length];
    const topH = Math.max(24, gate.gapTop);
    lantern(ctx, gate.x, topH - topH * 0.72, WORLD.GATE_W, topH * 0.72, color);
    const botY = gate.gapTop + gate.gapH;
    const botH = Math.max(24, floor - botY);
    lantern(ctx, gate.x, botY, WORLD.GATE_W, botH * 0.7, color);
    ctx.fillStyle = "rgba(243, 226, 184, 0.08)";
    ctx.fillRect(gate.x + 8, gate.gapTop, WORLD.GATE_W - 16, gate.gapH);
  }
  ctx.fillStyle = "#2a1b22";
  ctx.fillRect(0, floor, WORLD.W, WORLD.GROUND_H);
  ctx.fillStyle = "#f0b45a";
  ctx.fillRect(0, floor, WORLD.W, 4);
  for (let x = -((model.distance * 0.8) % 28); x < WORLD.W; x += 28) {
    ctx.fillStyle = "#3d2832";
    ctx.fillRect(x, floor + 14, 18, 10);
    ctx.fillRect(x + 8, floor + 32, 18, 10);
    ctx.fillRect(x, floor + 50, 18, 10);
  }
  for (const speck of model.feathers) {
    if (!speck.alive) continue;
    ctx.fillStyle = "rgba(244, 215, 161, 0.85)";
    ctx.fillRect(speck.x, speck.y, 3, 2);
  }
  drawBird(ctx, model.drawY, model.bird.vy, model.flapPhase);
}

function drawBird(ctx, y, vy, flapPhase) {
  ctx.save();
  ctx.translate(WORLD.BIRD_X, y);
  ctx.rotate(Math.max(-0.5, Math.min(1.05, vy / 720)));
  ctx.fillStyle = "#8a6239";
  ctx.beginPath();
  ctx.moveTo(-14, 1);
  ctx.lineTo(-26, -7);
  ctx.lineTo(-22, 7);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#f4d7a1";
  ctx.beginPath();
  ctx.ellipse(0, 0, WORLD.VISUAL_R, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff6e4";
  ctx.beginPath();
  ctx.ellipse(3, 4, 8, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.rotate(Math.sin(flapPhase) * 0.7);
  ctx.fillStyle = "#5b4a8a";
  ctx.beginPath();
  ctx.ellipse(-2, 3, 9, 5, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = "#e07a3d";
  ctx.beginPath();
  ctx.moveTo(12, -1);
  ctx.lineTo(22, 3);
  ctx.lineTo(12, 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#1a1028";
  ctx.beginPath();
  ctx.arc(6, -3, 2.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(6.7, -3.6, 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export { FONT };
