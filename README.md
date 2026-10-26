# Moonwren (月鹪)

An original night-market flight game. Guide the wren through the lantern gates.

Play: open `play/` (relative to wherever this folder is hosted). Website: open `index.html` at the root.
Every link is relative, so the folder works from any host and under any base path.

## What is where

| Path | What it is |
| --- | --- |
| `/index.html` | The launch website. It has a full-bleed cinematic trailer hero, posters, stills gallery, gameplay trailer and screenshots, features, how to play, and a final Play now / 立即游玩 band, in English and 中文. Self-contained (inline CSS and JS, relative paths only, no external requests). |
| `/play/` | The full game. Every file in `play/` is byte-for-byte the source from the build plan. `play/SHA256SUMS` lists their hashes, and `play/test/run.sh` runs the logic checks. |
| `/media/cinematic-trailer.mp4` | Cinematic launch trailer. 43.2 s, 1280x720 30 fps H.264 + AAC 48 kHz, faststart. It has 21 shots on the game's 92 BPM grid, with bilingual title cards and an end card (logo plus Play now / 立即游玩). No voiceover and no URL. Opened by "Watch the trailer" (with sound). |
| `/media/cinematic-trailer-poster.jpg` | Poster frame for the cinematic trailer (its end card). |
| `/media/launch/trailer-cinematic-loop.mp4` | The same cut with no text (title cards replaced by stills, no end-card logo or button), used as the muted autoplay hero loop behind the HTML overlay. |
| `/media/launch/logo-*.svg`, `mark.svg`, `og-image.jpg` | Logos (combo lockup, EN, 中文, mark; outlined SVG, no fonts needed) and the 1200x630 share image (from still 05). |
| `/media/posters/` | Three 1200x1800 posters (`.webp` plus `.jpg` fallback): key art, the wren, now playing. |
| `/media/stills/` | Seven 1920x1080 key-art stills (`.webp` plus `.jpg`) for the gallery, the hero poster frame and the final band. |
| `/media/hero-en.jpg`, `/media/hero-zh.jpg` (+ `@2x`) | Matched EN / 中文 game frames (same run, same frame), swapped by language. |
| `/media/screens/*-en.jpg`, `*-zh.jpg` | Paired EN / 中文 screenshots (paused, phone, game over), swapped by language. |
| `/media/trailer.mp4`, `/media/poster.jpg` | Gameplay trailer: 44.8 s of real recorded play with burned-in EN / 中文 captions and the game's own audio, plus its poster. |
| `/media/screenshot-*.jpg` | Phase-1 screenshots. No longer referenced by the site, kept on purpose. |
| `/fonts/` | Display web fonts: `fraunces-latin.woff2`, `fraunces-italic-latin.woff2`, `zcoolxiaowei-moonwren-subset.woff2`, with `OFL-fraunces.txt` and `OFL-zcoolxiaowei.txt`. |
| `/LICENSE` | MIT License (a copy is also in `play/LICENSE`). |

## Licence

The code, the drawings and the synthesized sound in this repository are original works by the copyright holder named in LICENSE. They are covered by the MIT License. The launch art (stills, posters, logos) is original, made for this project.

Fonts: the website downloads two bundled display fonts, used for headlines only. Body text still uses the viewer's system fonts. Both are under the SIL Open Font License 1.1, and the licence files are shipped next to them:

- Fraunces (© 2018 The Fraunces Project Authors), `fonts/OFL-fraunces.txt`. This is the Latin subset, upright and italic, variable.
- ZCOOL XiaoWei 站酷小薇 (© 2018 The ZCOOL XiaoWei Project Authors), `fonts/OFL-zcoolxiaowei.txt`. This subset holds only the characters the site's 中文 headlines use, 237 glyphs. Re-subset it when new 中文 headline text is added:

  `pyftsubset ZCOOLXiaoWei-Regular.ttf --text-file=chars.txt --flavor=woff2 --output-file=fonts/zcoolxiaowei-moonwren-subset.woff2`

The subsets are Modified Versions under the OFL (subsetting only). They are not sold on their own and keep their copyright and licence. The cinematic trailer's text was rendered with Fraunces (a static italic instance), ZCOOL XiaoWei and Noto Sans CJK SC (OFL). These fonts are baked into the video and are not shipped as files.

Music source: both trailers use only the game's own code-generated audio. The gameplay trailer records it from the page. The cinematic trailer's score is rendered offline in Chrome's `OfflineAudioContext`, using the same oscillator code as `play/js/audio.js` (copied into a render script; the game was not edited). Its parts are:

- the 92 BPM D-major-pentatonic LEAD (triangle), with a low-pass sweep, an eighth-note echo and an octave-up double in the climax;
- the MIDI 50 + 57 sine drone, sustained and doubled an octave down in the climax with a per-beat duck;
- `flap()` chirps as a rising shaker;
- `point()` chimes on the title cards and the Play now button;
- the real flap / point / hit events of the recorded gameplay, re-synthesised at their exact moments.

There are no samples and no third-party audio. The mix is about -14 LUFS with peaks at -1 dBFS.

## Play

- Tap, click, or press Space or ArrowUp to flap, to start, or to perch again after a miss.
- Press P or Escape to pause and to resume. The tune keeps playing.
- Press M, or use the sound button, to mute or unmute the tune and the effects together.
- Use the language button to switch English and 中文. The first visit follows the browser language and falls back to English.

`localStorage` keys: `moonwren.best`, `moonwren.lang`, `moonwren.muted`. The website uses the same `moonwren.lang` key, so the game opens in the language chosen on the website.

Add `?debug=1` to the game URL (`play/?debug=1`) to show the average frame time in milliseconds.

## Checks

```sh
cd play
sha256sum -c SHA256SUMS
sh test/run.sh
```

## Build notes

Deviations from the build plan:

1. The plan puts the game at the repository root. Here the game is in `play/` and the root holds the website, as the project owner asked. The 17 plan files are unchanged inside `play/`, so `play/SHA256SUMS` still verifies and `play/test/run.sh` still prints `CHECKS_PASS`.
2. The build folder was a date-prefixed folder in the builder's workspace instead of `$HOME/src`.
3. This README keeps the plan's text, with the Play link pointing at `play/`, plus the sections about the website, the trailer and these notes.
4. The plan's desktop and phone checklists were run with automated headless Chrome (Playwright): desktop keyboard and mouse, and Chrome phone emulation (Pixel 7 and iPhone 13 with touch) instead of a physical phone.
5. The website, the trailers, the posters, the stills, the logos and the screenshots are additions beyond the plan.
6. No game code was changed. `DPR_CAP` stays at 2: the frame-time check measured 16.67 ms at a 1x pixel ratio.
7. The plan's only process stop (step 7) kills by recorded PID, so no change was needed there.

## Gap log

Places where the plan was ambiguous, wrong or incomplete, and what the builder filled in.

| # | Plan location | Issue | Filled in | Severity |
| --- | --- | --- | --- | --- |
| 1 | Step 3, collision and `render.js` | Hit boxes are the full lantern columns (sky top to gap, gap to floor), but each lantern is drawn on only part of its column, so empty-looking sky above the top lantern and below the bottom lantern is fatal. | Kept as written; the owner accepted the plan as written. | Moderate |
| 2 | Steps 7 and 11 | The checklists need a person (listening, OS settings, network panel, a real phone) and give no automated method. | Playwright harness: audio graph hooks, pixel-based autopilot, CDP multi-touch, emulated tab hiding, Chrome phone emulation. | Moderate |
| 3 | Step 7, frame time | The pass line (average of 16.7 ms or less) sits on the 60 Hz vsync floor, so normal timer jitter can fail it (16.72 ms seen once at a 2x pixel ratio). A test harness that reads pixels each frame pushes it to 16.9 ms. | Measured without the harness at a 1x desktop ratio: 16.67 ms, so it passed. `DPR_CAP` kept. | Moderate |
| 4 | Step 7, the Tune row | "Quieter than a flap" is not measurable as written. | Checked the gains: tune 0.08 x 0.55 at most, flap 0.2. | Minor |
| 5 | Step 2 | Uses `$HOME/src`; the builder's rules require the workspace folder. | Used the date-prefixed workspace folder. | Minor |
| 6 | Steps 6, 8, 9 | Assumes the game sits at the root and lists only those files in `git add`. | Game moved to `play/`; `git add` covers the website and `media/` too. | Minor |
| 7 | Step 11 | "Browser closed and reopened" cannot be done literally in emulation. | Closed the tab and opened a new one in the same browser profile. | Minor |
| 8 | `test/static.test.js` | It skips every path that contains `/test/`, so a project folder under such a path would skip all files silently. | Not triggered here; noted only. | Minor |

## Phase 2 (launch relaunch) notes

Deviations from the launch-art notes (`ART.md`, `WEBSITE.md`):

1. Trailer file names follow the project brief: `media/cinematic-trailer.mp4` and `media/cinematic-trailer-poster.jpg` instead of `media/launch/trailer-cinematic.mp4`. Posters are in `media/posters/` and stills in `media/stills/` instead of `media/launch/`.
2. `WEBSITE.md` asks for no text on the hero video while `ART.md` and the brief ask for bilingual title cards. Both are met: the hero plays a text-free loop of the same cut, and "Watch the trailer" opens the full trailer with its title cards and sound.
3. The Chinese call to action is 立即游玩 everywhere: the trailer end card and the site buttons. There are no URLs anywhere: the end card says "Free in your browser · 浏览器里免费玩" instead of the site address, and the site is meant to be self-hosted.
4. Shot 19 shows the crash on the canvas only. The "Gate closed" overlay is page text, not canvas, so a canvas-only capture cannot show it without one language.
5. Shot 17 shows three gate passes in 2.6 s at the top recorded speed (score 23 to 25). Shot 2's "per-lantern brightness pop" is a global brightness pulse on each lead eighth note. Shot 12's motion blur is a horizontal blur that fades in over the shot.
6. The ZCOOL XiaoWei subset was regenerated from the pack's full font with the pack's character list plus 剧照· for the new 剧照 (Stills) heading.
7. A Stills gallery (seven key-art stills with a lightbox) was added next to the posters. The phone-style hero card is shown at 1100 px and wider.

Gaps:

| # | Where | Issue | Filled in |
| --- | --- | --- | --- |
| 1 | `ART.md` section 6 | 21 shots on a 92 BPM grid do not land on whole frames. | Boundaries rounded to the nearest 1/30 s; total 43.233 s. |
| 2 | `ART.md` section 7 | The game's drone note decays over two bars, so it disappears under a trailer. | The drone uses the same notes and gains with a sustained envelope. |
| 3 | `WEBSITE.md` | `og:image` needs an absolute URL for most link previews, but the site rule is relative paths only. | Relative path kept. Make it absolute when the final address is known. |
| 4 | Posters | The pack's first export of `poster-03-now-playing` printed the old hosting address under its button. | The posters are being re-exported without it under the same names and must be recopied into `media/posters/` before publishing. |

Rough share invented by the builder: game code 0% (all copied from the plan), about 5% of the build and test decisions. The website and trailer were not in the plan.
