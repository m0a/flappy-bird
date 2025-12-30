// Simple sound effects using Web Audio API
let audioContext: AudioContext | null = null;
let bgmGainNode: GainNode | null = null;
let bgmOscillators: OscillatorNode[] = [];
let isBgmPlaying = false;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

// Resume audio context (needed for mobile browsers)
export function resumeAudio() {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    ctx.resume();
  }
}

// Jump/flap sound - short upward blip
export function playJumpSound() {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  } catch (e) {
    // Ignore audio errors
  }
}

// Score point sound - cheerful ding
export function playScoreSound() {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  } catch (e) {
    // Ignore audio errors
  }
}

// Game over sound - descending tone
export function playGameOverSound() {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  } catch (e) {
    // Ignore audio errors
  }
}

// Original 8-bit style BGM - "Sky Adventure"
// Section 1: Uplifting theme
const MELODY_1 = [
  { note: 440, duration: 0.2 },   // A4
  { note: 494, duration: 0.2 },   // B4
  { note: 523, duration: 0.4 },   // C5
  { note: 587, duration: 0.2 },   // D5
  { note: 523, duration: 0.2 },   // C5
  { note: 494, duration: 0.4 },   // B4
  { note: 440, duration: 0.2 },   // A4
  { note: 392, duration: 0.2 },   // G4
  { note: 440, duration: 0.4 },   // A4
  { note: 0, duration: 0.2 },     // rest
];

// Section 2: Rising phrase
const MELODY_2 = [
  { note: 523, duration: 0.2 },   // C5
  { note: 587, duration: 0.2 },   // D5
  { note: 659, duration: 0.4 },   // E5
  { note: 587, duration: 0.2 },   // D5
  { note: 659, duration: 0.2 },   // E5
  { note: 698, duration: 0.4 },   // F5
  { note: 659, duration: 0.2 },   // E5
  { note: 587, duration: 0.2 },   // D5
  { note: 523, duration: 0.4 },   // C5
  { note: 0, duration: 0.2 },     // rest
];

// Section 3: Playful bounce
const MELODY_3 = [
  { note: 392, duration: 0.15 },  // G4
  { note: 440, duration: 0.15 },  // A4
  { note: 494, duration: 0.15 },  // B4
  { note: 523, duration: 0.3 },   // C5
  { note: 0, duration: 0.15 },    // rest
  { note: 494, duration: 0.15 },  // B4
  { note: 523, duration: 0.15 },  // C5
  { note: 587, duration: 0.15 },  // D5
  { note: 659, duration: 0.3 },   // E5
  { note: 0, duration: 0.15 },    // rest
  { note: 587, duration: 0.2 },   // D5
  { note: 523, duration: 0.2 },   // C5
  { note: 494, duration: 0.4 },   // B4
];

// Section 4: Gentle descent
const MELODY_4 = [
  { note: 659, duration: 0.3 },   // E5
  { note: 587, duration: 0.3 },   // D5
  { note: 523, duration: 0.3 },   // C5
  { note: 494, duration: 0.3 },   // B4
  { note: 440, duration: 0.3 },   // A4
  { note: 392, duration: 0.3 },   // G4
  { note: 440, duration: 0.6 },   // A4
  { note: 0, duration: 0.3 },     // rest
];

const MELODIES = [MELODY_1, MELODY_2, MELODY_3, MELODY_4];

// Bass patterns
const BASS_1 = [
  { note: 147, duration: 0.4 },   // D3
  { note: 165, duration: 0.4 },   // E3
  { note: 175, duration: 0.4 },   // F3
  { note: 165, duration: 0.4 },   // E3
  { note: 147, duration: 0.4 },   // D3
  { note: 131, duration: 0.4 },   // C3
  { note: 147, duration: 0.4 },   // D3
];

const BASS_2 = [
  { note: 131, duration: 0.4 },   // C3
  { note: 147, duration: 0.4 },   // D3
  { note: 165, duration: 0.4 },   // E3
  { note: 175, duration: 0.4 },   // F3
  { note: 165, duration: 0.4 },   // E3
  { note: 147, duration: 0.4 },   // D3
  { note: 131, duration: 0.4 },   // C3
];

const BASS_3 = [
  { note: 196, duration: 0.3 },   // G3
  { note: 175, duration: 0.3 },   // F3
  { note: 165, duration: 0.3 },   // E3
  { note: 147, duration: 0.3 },   // D3
  { note: 131, duration: 0.3 },   // C3
  { note: 147, duration: 0.3 },   // D3
  { note: 165, duration: 0.3 },   // E3
  { note: 175, duration: 0.3 },   // F3
];

const BASS_4 = [
  { note: 110, duration: 0.5 },   // A2
  { note: 131, duration: 0.5 },   // C3
  { note: 147, duration: 0.5 },   // D3
  { note: 165, duration: 0.5 },   // E3
  { note: 147, duration: 0.5 },   // D3
  { note: 131, duration: 0.5 },   // C3
];

const BASSES = [BASS_1, BASS_2, BASS_3, BASS_4];

// Arpeggio patterns for texture
const ARPEGGIO_1 = [
  { note: 523, duration: 0.1 },   // C5
  { note: 659, duration: 0.1 },   // E5
  { note: 784, duration: 0.1 },   // G5
  { note: 659, duration: 0.1 },   // E5
  { note: 523, duration: 0.1 },   // C5
  { note: 392, duration: 0.1 },   // G4
];

const ARPEGGIO_2 = [
  { note: 587, duration: 0.1 },   // D5
  { note: 698, duration: 0.1 },   // F5
  { note: 880, duration: 0.1 },   // A5
  { note: 698, duration: 0.1 },   // F5
  { note: 587, duration: 0.1 },   // D5
  { note: 440, duration: 0.1 },   // A4
];

const ARPEGGIOS = [ARPEGGIO_1, ARPEGGIO_2];

let melodySection = 0;
let bassSection = 0;
let arpeggioSection = 0;
let bgmTimeoutIds: number[] = [];

// Start background music
export function startBgm() {
  if (isBgmPlaying) return;

  try {
    const ctx = getAudioContext();
    isBgmPlaying = true;
    melodySection = 0;
    bassSection = 0;
    arpeggioSection = 0;

    bgmGainNode = ctx.createGain();
    bgmGainNode.gain.setValueAtTime(0.12, ctx.currentTime);
    bgmGainNode.connect(ctx.destination);

    // Play melody cycling through all 4 sections
    function playMelodyLoop() {
      if (!isBgmPlaying) return;

      const melody = MELODIES[melodySection % MELODIES.length];
      melodySection++;

      let time = ctx.currentTime;

      melody.forEach(({ note, duration }) => {
        if (note > 0) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.connect(gain);
          gain.connect(bgmGainNode!);

          osc.type = "square";
          osc.frequency.setValueAtTime(note, time);

          gain.gain.setValueAtTime(0.2, time);
          gain.gain.exponentialRampToValueAtTime(0.01, time + duration - 0.02);

          osc.start(time);
          osc.stop(time + duration);

          bgmOscillators.push(osc);
        }
        time += duration;
      });

      const loopDuration = melody.reduce((sum, n) => sum + n.duration, 0);
      const timeoutId = window.setTimeout(playMelodyLoop, loopDuration * 1000);
      bgmTimeoutIds.push(timeoutId);
    }

    // Play bass cycling through all 4 sections
    function playBassLoop() {
      if (!isBgmPlaying) return;

      const bass = BASSES[bassSection % BASSES.length];
      bassSection++;

      let time = ctx.currentTime;

      bass.forEach(({ note, duration }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(bgmGainNode!);

        osc.type = "triangle";
        osc.frequency.setValueAtTime(note, time);

        gain.gain.setValueAtTime(0.25, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration - 0.02);

        osc.start(time);
        osc.stop(time + duration);

        bgmOscillators.push(osc);
        time += duration;
      });

      const loopDuration = bass.reduce((sum, n) => sum + n.duration, 0);
      const timeoutId = window.setTimeout(playBassLoop, loopDuration * 1000);
      bgmTimeoutIds.push(timeoutId);
    }

    // Play arpeggio alternating patterns
    function playArpeggioLoop() {
      if (!isBgmPlaying) return;

      const arpeggio = ARPEGGIOS[arpeggioSection % ARPEGGIOS.length];
      arpeggioSection++;

      let time = ctx.currentTime;

      arpeggio.forEach(({ note, duration }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(bgmGainNode!);

        osc.type = "sine";
        osc.frequency.setValueAtTime(note, time);

        gain.gain.setValueAtTime(0.06, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration - 0.01);

        osc.start(time);
        osc.stop(time + duration);

        bgmOscillators.push(osc);
        time += duration;
      });

      const loopDuration = arpeggio.reduce((sum, n) => sum + n.duration, 0);
      const timeoutId = window.setTimeout(playArpeggioLoop, loopDuration * 1000);
      bgmTimeoutIds.push(timeoutId);
    }

    playMelodyLoop();
    playBassLoop();
    playArpeggioLoop();
  } catch (e) {
    // Ignore audio errors
  }
}

// Stop background music
export function stopBgm() {
  isBgmPlaying = false;

  // Clear all scheduled timeouts
  bgmTimeoutIds.forEach(id => window.clearTimeout(id));
  bgmTimeoutIds = [];

  bgmOscillators.forEach(osc => {
    try {
      osc.stop();
    } catch (e) {
      // Already stopped
    }
  });
  bgmOscillators = [];

  if (bgmGainNode) {
    bgmGainNode.disconnect();
    bgmGainNode = null;
  }
}
