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

// More complex melody (8-bit game style)
const MELODY_A = [
  { note: 659, duration: 0.15 },  // E5
  { note: 659, duration: 0.15 },  // E5
  { note: 0, duration: 0.15 },    // rest
  { note: 659, duration: 0.15 },  // E5
  { note: 0, duration: 0.15 },    // rest
  { note: 523, duration: 0.15 },  // C5
  { note: 659, duration: 0.3 },   // E5
  { note: 784, duration: 0.3 },   // G5
  { note: 0, duration: 0.3 },     // rest
  { note: 392, duration: 0.3 },   // G4
];

const MELODY_B = [
  { note: 523, duration: 0.3 },   // C5
  { note: 0, duration: 0.15 },    // rest
  { note: 392, duration: 0.3 },   // G4
  { note: 0, duration: 0.15 },    // rest
  { note: 330, duration: 0.3 },   // E4
  { note: 0, duration: 0.15 },    // rest
  { note: 440, duration: 0.2 },   // A4
  { note: 494, duration: 0.2 },   // B4
  { note: 466, duration: 0.15 },  // Bb4
  { note: 440, duration: 0.3 },   // A4
];

const BASS_A = [
  { note: 131, duration: 0.3 },   // C3
  { note: 165, duration: 0.3 },   // E3
  { note: 196, duration: 0.3 },   // G3
  { note: 165, duration: 0.3 },   // E3
  { note: 131, duration: 0.3 },   // C3
  { note: 196, duration: 0.3 },   // G3
];

const BASS_B = [
  { note: 110, duration: 0.3 },   // A2
  { note: 131, duration: 0.3 },   // C3
  { note: 165, duration: 0.3 },   // E3
  { note: 131, duration: 0.3 },   // C3
  { note: 147, duration: 0.3 },   // D3
  { note: 196, duration: 0.3 },   // G3
];

const ARPEGGIO = [
  { note: 523, duration: 0.1 },   // C5
  { note: 659, duration: 0.1 },   // E5
  { note: 784, duration: 0.1 },   // G5
  { note: 659, duration: 0.1 },   // E5
];

let melodySection = 0;
let bassSection = 0;
let bgmTimeoutIds: number[] = [];

// Start background music
export function startBgm() {
  if (isBgmPlaying) return;

  try {
    const ctx = getAudioContext();
    isBgmPlaying = true;
    melodySection = 0;
    bassSection = 0;

    bgmGainNode = ctx.createGain();
    bgmGainNode.gain.setValueAtTime(0.12, ctx.currentTime);
    bgmGainNode.connect(ctx.destination);

    // Play melody with alternating sections
    function playMelodyLoop() {
      if (!isBgmPlaying) return;

      const melody = melodySection % 2 === 0 ? MELODY_A : MELODY_B;
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

          gain.gain.setValueAtTime(0.25, time);
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

    // Play bass with alternating sections
    function playBassLoop() {
      if (!isBgmPlaying) return;

      const bass = bassSection % 2 === 0 ? BASS_A : BASS_B;
      bassSection++;

      let time = ctx.currentTime;

      bass.forEach(({ note, duration }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(bgmGainNode!);

        osc.type = "triangle";
        osc.frequency.setValueAtTime(note, time);

        gain.gain.setValueAtTime(0.3, time);
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

    // Play arpeggio for texture
    function playArpeggioLoop() {
      if (!isBgmPlaying) return;

      let time = ctx.currentTime;

      ARPEGGIO.forEach(({ note, duration }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(bgmGainNode!);

        osc.type = "sine";
        osc.frequency.setValueAtTime(note, time);

        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration - 0.01);

        osc.start(time);
        osc.stop(time + duration);

        bgmOscillators.push(osc);
        time += duration;
      });

      const loopDuration = ARPEGGIO.reduce((sum, n) => sum + n.duration, 0);
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
