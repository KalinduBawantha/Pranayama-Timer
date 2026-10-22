/**
 * useSettings — Persistent user settings for BreatheFlow.
 * Stores in localStorage with validation and fallback defaults.
 */

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'breatheflow-settings';

export const DEFAULT_SETTINGS = {
  preset: 'custom',
  inhale: 5,
  holdInhale: 4,
  exhale: 6,
  holdExhale: 0,
  rounds: 10,
};

export const DEFAULT_SOUND_SETTINGS = {
  masterSound: true,
  tickSound: true,
  phaseChimes: true,
  volume: 0.7,
};

const PRESETS = {
  custom: {
    inhale: 5,
    holdInhale: 4,
    exhale: 6,
    holdExhale: 0,
    rounds: 10,
  },
  equal: {
    inhale: 4,
    holdInhale: 0,
    exhale: 4,
    holdExhale: 0,
    rounds: 10,
  },
  box: {
    inhale: 4,
    holdInhale: 4,
    exhale: 4,
    holdExhale: 4,
    rounds: 10,
  },
};

export { PRESETS };

/** Clamp a value between min and max */
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/** Validate and sanitize settings */
function validateSettings(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const preset = ['custom', 'equal', 'box'].includes(raw.preset) ? raw.preset : 'custom';

  const inhale = typeof raw.inhale === 'number' && !isNaN(raw.inhale)
    ? clamp(Math.round(raw.inhale), 1, 60)
    : DEFAULT_SETTINGS.inhale;

  const holdInhale = typeof raw.holdInhale === 'number' && !isNaN(raw.holdInhale)
    ? clamp(Math.round(raw.holdInhale), 0, 60)
    : DEFAULT_SETTINGS.holdInhale;

  const exhale = typeof raw.exhale === 'number' && !isNaN(raw.exhale)
    ? clamp(Math.round(raw.exhale), 1, 60)
    : DEFAULT_SETTINGS.exhale;

  const holdExhale = typeof raw.holdExhale === 'number' && !isNaN(raw.holdExhale)
    ? clamp(Math.round(raw.holdExhale), 0, 60)
    : DEFAULT_SETTINGS.holdExhale;

  const rounds = typeof raw.rounds === 'number' && !isNaN(raw.rounds)
    ? clamp(Math.round(raw.rounds), 1, 100)
    : DEFAULT_SETTINGS.rounds;

  return { preset, inhale, holdInhale, exhale, holdExhale, rounds };
}

/** Validate sound settings */
function validateSoundSettings(raw) {
  if (!raw || typeof raw !== 'object') return null;

  return {
    masterSound: typeof raw.masterSound === 'boolean' ? raw.masterSound : DEFAULT_SOUND_SETTINGS.masterSound,
    tickSound: typeof raw.tickSound === 'boolean' ? raw.tickSound : DEFAULT_SOUND_SETTINGS.tickSound,
    phaseChimes: typeof raw.phaseChimes === 'boolean' ? raw.phaseChimes : DEFAULT_SOUND_SETTINGS.phaseChimes,
    volume: typeof raw.volume === 'number' && !isNaN(raw.volume)
      ? clamp(raw.volume, 0, 1)
      : DEFAULT_SOUND_SETTINGS.volume,
  };
}

/** Load from localStorage */
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Save to localStorage */
function saveToStorage(settings, soundSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings, soundSettings }));
  } catch {
    // Storage unavailable — silent failure
  }
}

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    const stored = loadFromStorage();
    return validateSettings(stored?.settings) || { ...DEFAULT_SETTINGS };
  });

  const [soundSettings, setSoundSettings] = useState(() => {
    const stored = loadFromStorage();
    return validateSoundSettings(stored?.soundSettings) || { ...DEFAULT_SOUND_SETTINGS };
  });

  // Persist on change
  useEffect(() => {
    saveToStorage(settings, soundSettings);
  }, [settings, soundSettings]);

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateSoundSetting = useCallback((key, value) => {
    setSoundSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const applyPreset = useCallback((presetName) => {
    const preset = PRESETS[presetName];
    if (preset) {
      setSettings((prev) => ({
        ...prev,
        ...preset,
        preset: presetName,
      }));
    }
  }, []);

  /** Validate settings for starting a session. Returns error string or null. */
  const validateForStart = useCallback(() => {
    if (settings.inhale < 1) return 'Inhale duration must be at least 1 second.';
    if (settings.exhale < 1) return 'Exhale duration must be at least 1 second.';
    if (settings.rounds < 1) return 'At least 1 round is required.';
    if (settings.holdInhale < 0) return 'Hold Inhale cannot be negative.';
    if (settings.holdExhale < 0) return 'Hold after Exhale cannot be negative.';
    return null;
  }, [settings]);

  /** Calculate estimated session duration in seconds */
  const estimatedDuration = (() => {
    const roundSec = settings.inhale
      + settings.holdInhale
      + settings.exhale
      + settings.holdExhale;
    return roundSec * settings.rounds;
  })();

  return {
    settings,
    soundSettings,
    updateSetting,
    updateSoundSetting,
    applyPreset,
    validateForStart,
    estimatedDuration,
  };
}
