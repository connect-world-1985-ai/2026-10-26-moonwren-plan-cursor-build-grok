#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
node --check js/physics.js
node --check js/i18n.js
node --check js/audio.js
node --check js/render.js
node --check js/game.js
node --check js/main.js
node test/physics.test.js
node test/i18n.test.js
node test/static.test.js
echo CHECKS_PASS
