/** Original Moonwren entry. MIT License. */

import { LANG_KEY, BEST_KEY, MUTE_KEY, detectLanguage, applyStatic } from "./i18n.js";
import { createAudio } from "./audio.js";
import { makeBackdrop } from "./render.js";
import { createGame } from "./game.js";

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (_err) {
    return null;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (_err) {
    /* Private mode or a full store. The game keeps running. */
  }
}

const storedLang = safeGet(LANG_KEY);
const languages = navigator.languages && navigator.languages.length
  ? navigator.languages
  : [navigator.language || "en"];
let lang = detectLanguage(languages, storedLang);
const audio = createAudio();
const muted = safeGet(MUTE_KEY) === "1";
audio.preferMuted(muted);

const root = document.getElementById("app");
applyStatic(lang, root, document);

const canvas = document.getElementById("game");
const stage = document.getElementById("stage");
const overlay = document.getElementById("overlay");
const live = document.getElementById("live");
const pauseBtn = document.getElementById("btn-pause");
const muteBtn = document.getElementById("btn-mute");
const langBtn = document.getElementById("btn-lang");
const primary = document.getElementById("btn-primary");
const debug = new URLSearchParams(location.search).has("debug");

function fit() {
  const rect = stage.getBoundingClientRect();
  const ratio = 480 / 720;
  let height = rect.height;
  let width = height * ratio;
  if (width > rect.width) {
    width = rect.width;
    height = width / ratio;
  }
  canvas.style.width = Math.max(1, Math.floor(width)) + "px";
  canvas.style.height = Math.max(1, Math.floor(height)) + "px";
}

const bestRaw = Number(safeGet(BEST_KEY));
fit();
const game = createGame({
  canvas,
  audio,
  lang,
  bestScore: Number.isFinite(bestRaw) && bestRaw > 0 ? Math.floor(bestRaw) : 0,
  reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  backdrop: makeBackdrop(),
  requestFrame: (fn) => requestAnimationFrame(fn),
  devicePixelRatio: window.devicePixelRatio,
  debug,
  live,
  score: document.getElementById("score"),
  bestNode: document.getElementById("best"),
  pauseBtn,
  muteBtn,
  langBtn,
  overlay,
  overlayTitle: document.getElementById("overlay-title"),
  overlayBody: document.getElementById("overlay-body"),
  primary,
  debugOut: document.getElementById("debug"),
  isMuted: () => safeGet(MUTE_KEY) === "1",
  saveBest: (n) => safeSet(BEST_KEY, String(n)),
});

function unlockFromGesture(event) {
  if (event.type === "keydown" && event.repeat) return;
  audio.unlock();
}

document.addEventListener("pointerdown", unlockFromGesture);
document.addEventListener("keydown", unlockFromGesture);

stage.addEventListener("pointerdown", (event) => {
  if (!event.isPrimary) return;
  const button = event.target.closest("button");
  if (button && button !== primary) return;
  event.preventDefault();
  game.primary();
});

function pauseFromButton() {
  audio.unlock();
  if (game.togglePause()) audio.ui();
}

pauseBtn.addEventListener("pointerdown", (event) => {
  if (!event.isPrimary) return;
  event.preventDefault();
  event.stopPropagation();
  pauseFromButton();
});

function toggleMute() {
  audio.unlock();
  const next = safeGet(MUTE_KEY) === "1" ? "0" : "1";
  safeSet(MUTE_KEY, next);
  audio.preferMuted(next === "1");
  audio.ui();
  game.paintChrome();
}

muteBtn.addEventListener("pointerdown", (event) => {
  if (!event.isPrimary) return;
  event.preventDefault();
  event.stopPropagation();
  toggleMute();
});

function toggleLang() {
  audio.unlock();
  lang = lang === "en" ? "zh" : "en";
  safeSet(LANG_KEY, lang);
  applyStatic(lang, root, document);
  audio.ui();
  game.setLang(lang);
}

langBtn.addEventListener("pointerdown", (event) => {
  if (!event.isPrimary) return;
  event.preventDefault();
  event.stopPropagation();
  toggleLang();
});

function onKeyboardClick(button, action) {
  button.addEventListener("click", (event) => {
    if (event.detail !== 0) return;
    action();
  });
}

onKeyboardClick(primary, () => game.primary());
onKeyboardClick(pauseBtn, pauseFromButton);
onKeyboardClick(muteBtn, toggleMute);
onKeyboardClick(langBtn, toggleLang);

document.addEventListener("keydown", (event) => {
  const chrome = document.activeElement && document.activeElement.closest
    && document.activeElement.closest("#btn-lang, #btn-mute, #btn-pause");
  if (event.key === " " || event.key === "ArrowUp") {
    if (chrome && event.key === " ") return;
    event.preventDefault();
    if (event.repeat) return;
    game.primary();
  } else if (event.key === "p" || event.key === "P" || event.key === "Escape") {
    event.preventDefault();
    pauseFromButton();
  } else if (event.key === "m" || event.key === "M") {
    event.preventDefault();
    toggleMute();
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) game.onHidden();
});

window.addEventListener("resize", fit);
window.addEventListener("load", fit);
