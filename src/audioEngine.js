/**
 * AudioEngine — Web Audio API-based sound generation for BreatheFlow.
 * Generates tick sounds, phase-change chimes, and completion bells
 * without requiring external audio files.
 */

let audioCtx = null;
let masterGainNode = null;

/**
 * Initialize or resume the AudioContext. Must be called from a user gesture.
 */
export function initAudio() {
  try {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return false;
      audioCtx = new AudioContext();
      masterGainNode = audioCtx.createGain();
      masterGainNode.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return true;
  } catch (e) {
    console.warn('Audio initialization failed:', e);
    return false;
  }
}

/**
 * Check if audio is available and running.
 */
export function isAudioAvailable() {
  return audioCtx && audioCtx.state === 'running';
}

/**
 * Set the master volume (0.0 – 1.0).
 */
export function setMasterVolume(volume) {
  if (masterGainNode && audioCtx) {
    masterGainNode.gain.setValueAtTime(
      Math.max(0, Math.min(1, volume)),
      audioCtx.currentTime
    );
  }
}

/**
 * Play a short, soft tick sound.
 */
export function playTick(volume = 0.15) {
  if (!audioCtx || audioCtx.state !== 'running') return;

  try {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.04);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(masterGainNode);

    osc.start(now);
    osc.stop(now + 0.07);

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  } catch (e) {
    // Audio failure should not crash the app
  }
}

/**
 * Play a gentle chime for phase transitions.
 * Different frequencies for different phases.
 */
export function playPhaseChime(phase, volume = 0.2) {
  if (!audioCtx || audioCtx.state !== 'running') return;

  const frequencies = {
    inhale: [523.25, 659.25],      // C5, E5 — uplifting
    holdInhale: [440, 523.25],     // A4, C5 — stable
    exhale: [392, 329.63],         // G4, E4 — descending
    holdExhale: [349.23, 293.66],  // F4, D4 — grounding
  };

  const freqs = frequencies[phase] || frequencies.inhale;

  try {
    const now = audioCtx.currentTime;

    freqs.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const startTime = now + i * 0.1;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(masterGainNode);

      osc.start(startTime);
      osc.stop(startTime + 0.4);

      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    });
  } catch (e) {
    // Silent failure
  }
}

/**
 * Play a gentle completion bell — a warm, resonant chord.
 */
export function playCompletionBell(volume = 0.25) {
  if (!audioCtx || audioCtx.state !== 'running') return;

  try {
    const now = audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 — major chord

    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const startTime = now + i * 0.12;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.03);
      gain.gain.setValueAtTime(volume, startTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);

      osc.connect(gain);
      gain.connect(masterGainNode);

      osc.start(startTime);
      osc.stop(startTime + 1.3);

      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    });
  } catch (e) {
    // Silent failure
  }
}

/**
 * Cleanup the audio context.
 */
export function destroyAudio() {
  if (audioCtx) {
    try {
      audioCtx.close();
    } catch (e) {
      // ignore
    }
    audioCtx = null;
    masterGainNode = null;
  }
}
