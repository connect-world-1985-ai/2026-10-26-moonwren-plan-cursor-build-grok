/** Original Moonwren synthesis. MIT License. No audio files. */

const BPM = 92;
const EIGHTH = 60 / BPM / 2;
const LOOKAHEAD = 0.2;
/** Two bars of D major pentatonic. 0 is a rest. */
const LEAD = [74, 71, 69, 71, 66, 69, 62, 0, 69, 66, 64, 66, 71, 69, 66, 62];
/** Music bus is 0.08 and the sfx bus is 1, so effects sit about 2.5× above the tune at the flap gain below. */
const MUSIC_BUS = 0.08;
const SFX_BUS = 1;

function midiToHz(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function createAudio() {
  let ctx = null;
  let master = null;
  let musicBus = null;
  let sfxBus = null;
  let started = false;
  let muted = false;
  let timer = 0;
  let nextNote = 0;
  let stepIndex = 0;

  function ensure() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    musicBus = ctx.createGain();
    sfxBus = ctx.createGain();
    musicBus.gain.value = MUSIC_BUS;
    sfxBus.gain.value = SFX_BUS;
    master.gain.value = muted ? 0 : 1;
    musicBus.connect(master);
    sfxBus.connect(master);
    master.connect(ctx.destination);
  }

  function envGain(bus, when, dur, amp) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(amp, when + Math.min(0.02, dur * 0.4));
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    g.connect(bus);
    return g;
  }

  function tone(bus, freq, when, dur, type, amp) {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);
    osc.connect(envGain(bus, when, dur, amp));
    osc.start(when);
    osc.stop(when + dur + 0.03);
  }

  function schedule() {
    if (!ctx || !started) return;
    while (nextNote < ctx.currentTime + LOOKAHEAD) {
      const midi = LEAD[stepIndex % LEAD.length];
      if (midi) tone(musicBus, midiToHz(midi), nextNote, EIGHTH * 0.92, "triangle", 0.55);
      if (stepIndex % 16 === 0) {
        tone(musicBus, midiToHz(50), nextNote, EIGHTH * 16 * 0.98, "sine", 0.22);
        tone(musicBus, midiToHz(57), nextNote, EIGHTH * 16 * 0.98, "sine", 0.14);
      }
      nextNote += EIGHTH;
      stepIndex += 1;
    }
  }

  function chirp(f0, f1, dur, type, amp, delay) {
    if (!ctx) return;
    const when = ctx.currentTime + (delay || 0);
    const osc = ctx.createOscillator();
    const g = envGain(sfxBus, when, dur, amp);
    osc.type = type;
    osc.frequency.setValueAtTime(f0, when);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, f1), when + dur);
    osc.connect(g);
    osc.start(when);
    osc.stop(when + dur + 0.03);
  }

  return {
    preferMuted(value) {
      muted = !!value;
      if (master && ctx) master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.02);
    },
    unlock() {
      ensure();
      if (ctx.state === "suspended") ctx.resume();
      if (!started) {
        started = true;
        nextNote = ctx.currentTime + 0.06;
        stepIndex = 0;
        schedule();
        timer = window.setInterval(schedule, 50);
      }
    },
    flap() {
      chirp(720, 340, 0.09, "sine", 0.2, 0);
    },
    point() {
      chirp(880, 880, 0.06, "sine", 0.12, 0);
      chirp(1320, 1320, 0.08, "triangle", 0.1, 0.06);
    },
    hit() {
      if (!ctx) return;
      const dur = 0.28;
      const n = Math.floor(ctx.sampleRate * dur);
      const buf = ctx.createBuffer(1, n, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < n; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 900;
      const g = ctx.createGain();
      g.gain.value = 0.25;
      src.connect(filter);
      filter.connect(g);
      g.connect(sfxBus);
      src.start(ctx.currentTime);
      chirp(200, 55, 0.32, "square", 0.12, 0);
    },
    ui() {
      chirp(660, 660, 0.045, "sine", 0.08, 0);
    },
    stop() {
      if (timer) window.clearInterval(timer);
      timer = 0;
    },
  };
}
