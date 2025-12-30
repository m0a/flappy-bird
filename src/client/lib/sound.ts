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

// Simple melody notes (frequencies in Hz)
const MELODY = [
  { note: 523, duration: 0.2 },  // C5
  { note: 587, duration: 0.2 },  // D5
  { note: 659, duration: 0.2 },  // E5
  { note: 523, duration: 0.2 },  // C5
  { note: 659, duration: 0.2 },  // E5
  { note: 784, duration: 0.4 },  // G5
  { note: 784, duration: 0.4 },  // G5
  { note: 0, duration: 0.2 },    // rest
];

const BASS = [
  { note: 262, duration: 0.4 },  // C4
  { note: 196, duration: 0.4 },  // G3
  { note: 220, duration: 0.4 },  // A3
  { note: 196, duration: 0.4 },  // G3
];

// Start background music
export function startBgm() {
  if (isBgmPlaying) return;

  try {
    const ctx = getAudioContext();
    isBgmPlaying = true;

    bgmGainNode = ctx.createGain();
    bgmGainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    bgmGainNode.connect(ctx.destination);

    // Play looping melody
    function playMelodyLoop() {
      if (!isBgmPlaying) return;

      let time = ctx.currentTime;

      MELODY.forEach(({ note, duration }) => {
        if (note > 0) {
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
        }
        time += duration;
      });

      // Schedule next loop
      const loopDuration = MELODY.reduce((sum, n) => sum + n.duration, 0);
      setTimeout(playMelodyLoop, loopDuration * 1000);
    }

    // Play looping bass
    function playBassLoop() {
      if (!isBgmPlaying) return;

      let time = ctx.currentTime;

      BASS.forEach(({ note, duration }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(bgmGainNode!);

        osc.type = "sine";
        osc.frequency.setValueAtTime(note, time);

        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration - 0.02);

        osc.start(time);
        osc.stop(time + duration);

        bgmOscillators.push(osc);
        time += duration;
      });

      // Schedule next loop
      const loopDuration = BASS.reduce((sum, n) => sum + n.duration, 0);
      setTimeout(playBassLoop, loopDuration * 1000);
    }

    playMelodyLoop();
    playBassLoop();
  } catch (e) {
    // Ignore audio errors
  }
}

// Stop background music
export function stopBgm() {
  isBgmPlaying = false;

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
