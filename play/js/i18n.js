/** Original Moonwren string table. MIT License. No third-party code. */

export const LANG_KEY = "moonwren.lang";
export const BEST_KEY = "moonwren.best";
export const MUTE_KEY = "moonwren.muted";

export const STRINGS = {
  en: {
    title: "Moonwren",
    tagline: "Slip the lantern gates",
    score: "Score",
    best: "Best",
    howTo: "Flap to hold the gap. Miss the lanterns and the eaves.",
    footer: "An original night-market game. Code, picture and sound were made for this page.",
    play: "Play",
    pause: "Pause",
    resume: "Resume",
    retry: "Play again",
    mute: "Mute",
    unmute: "Sound",
    switchTo: "中文",
    readyTitle: "Moonwren",
    readyBody: "Tap, click, or press Space.",
    pausedTitle: "Paused",
    pausedBody: "Press P or Resume. The tune keeps going.",
    overTitle: "Gate closed",
    overBody: "Tap or press Space to perch again.",
    overBest: "New best",
    ariaCanvas: "Moonwren playfield",
    ariaLang: "Switch language to Chinese",
    ariaMute: "Mute music and sound effects",
    ariaUnmute: "Turn music and sound effects on",
    ariaPause: "Pause",
    ariaResume: "Resume",
    liveReady: "Ready. Tap, click, or press Space.",
    livePlaying: "Score {n}",
    livePaused: "Paused",
    liveOver: "Gate closed. Score {n}.",
    noscript: "Moonwren needs JavaScript.",
  },
  zh: {
    title: "月鹪",
    tagline: "穿过灯笼门",
    score: "分数",
    best: "最高",
    howTo: "拍翅停在缺口里。别碰上灯笼，也别撞上屋檐。",
    footer: "原创夜市小游戏。画面、音效和曲子都是为本页做的。",
    play: "开始",
    pause: "暂停",
    resume: "继续",
    retry: "再来一次",
    mute: "静音",
    unmute: "开声音",
    switchTo: "EN",
    readyTitle: "月鹪",
    readyBody: "点按、点击，或按空格。",
    pausedTitle: "已暂停",
    pausedBody: "按 P 或“继续”。曲子不会停。",
    overTitle: "撞上了",
    overBody: "点按或按空格，再停回起点。",
    overBest: "新纪录",
    ariaCanvas: "月鹪游戏画面",
    ariaLang: "把语言换成英文",
    ariaMute: "关掉曲子和音效",
    ariaUnmute: "打开曲子和音效",
    ariaPause: "暂停",
    ariaResume: "继续",
    liveReady: "准备好了。点按、点击，或按空格。",
    livePlaying: "分数 {n}",
    livePaused: "已暂停",
    liveOver: "撞上了。分数 {n}。",
    noscript: "月鹪需要 JavaScript。",
  },
};

export function detectLanguage(languages, stored) {
  if (stored === "en" || stored === "zh") return stored;
  const list = Array.isArray(languages) && languages.length ? languages : ["en"];
  for (const tag of list) {
    if (String(tag || "").toLowerCase().startsWith("zh")) return "zh";
  }
  return "en";
}

export function fill(template, n) {
  return String(template).replace("{n}", String(n));
}

export function applyStatic(lang, root, doc) {
  const table = STRINGS[lang];
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    el.textContent = table[key];
  });
  doc.documentElement.lang = lang === "zh" ? "zh-Hans" : "en";
  doc.title = table.title;
}
