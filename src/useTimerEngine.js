/**
 * useTimerEngine — Core session state machine and timing logic for BreatheFlow.
 *
 * States: idle | preparing | running | paused | completed | stopped
 *
 * Uses performance.now() for drift-resistant timing. Interface refresh happens
 * via requestAnimationFrame; the actual phase progression is calculated from
 * elapsed timestamps, not from counting setInterval ticks.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  initAudio,
  setMasterVolume,
  playTick,
  playPhaseChime,
  playCompletionBell,
} from './audioEngine';

// ── Helpers ──────────────────────────────────────────────────────

/** Build ordered phase list from settings */
function buildPhaseList(settings) {
  const phases = [];
  phases.push({ name: 'inhale', duration: settings.inhale, label: 'Inhale' });
  if (settings.holdInhale > 0) {
    phases.push({ name: 'holdInhale', duration: settings.holdInhale, label: 'Hold' });
  }
  phases.push({ name: 'exhale', duration: settings.exhale, label: 'Exhale' });
  if (settings.holdExhale > 0) {
    phases.push({ name: 'holdExhale', duration: settings.holdExhale, label: 'Hold' });
  }
  return phases;
}

/** Total duration of one round in seconds */
function roundDuration(phases) {
  return phases.reduce((sum, p) => sum + p.duration, 0);
}

/** Format seconds to MM:SS */
export function formatTime(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// ── Hook ──────────────────────────────────────────────────────────

export function useTimerEngine() {
  // ── Public state (drives UI) ──────────────────────────────────
  const [sessionState, setSessionState] = useState('idle');
  // 'idle' | 'preparing' | 'running' | 'paused' | 'completed' | 'stopped'

  const [prepCountdown, setPrepCountdown] = useState(3);
  const [currentPhase, setCurrentPhase] = useState(null); // { name, label, duration }
  const [phaseRemaining, setPhaseRemaining] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(10);
  const [elapsedTime, setElapsedTime] = useState(0); // active session seconds
  const [circleProgress, setCircleProgress] = useState(0); // 0–1, for animation
  const [sessionProgress, setSessionProgress] = useState(0); // overall 0–1

  // Summary data
  const [summaryData, setSummaryData] = useState(null);

  // ── Internal refs (not rendered directly) ─────────────────────
  const stateRef = useRef('idle');
  const rafRef = useRef(null);
  const prepTimerRef = useRef(null);
  const settingsRef = useRef(null);
  const soundSettingsRef = useRef(null);
  const phasesRef = useRef([]);

  // Timing anchors
  const phaseStartTimeRef = useRef(0);       // performance.now() when current phase started
  const phaseDurationMsRef = useRef(0);       // current phase length in ms
  const sessionStartTimeRef = useRef(0);     // active session start (excl. prep & pauses)
  const totalPausedMsRef = useRef(0);        // accumulated pause duration
  const pauseStartTimeRef = useRef(0);       // when the current pause started

  // Phase tracking
  const currentPhaseIndexRef = useRef(0);
  const currentRoundRef = useRef(1);
  const totalRoundsRef = useRef(10);
  const lastTickSecondRef = useRef(-1);      // prevent duplicate ticks
  const completionPlayedRef = useRef(false);
  const startLockRef = useRef(false);        // prevent double-start

  // ── Update state ref whenever React state changes ─────────────
  const updateState = useCallback((newState) => {
    stateRef.current = newState;
    setSessionState(newState);
  }, []);

  // ── Cleanup function ──────────────────────────────────────────
  const cleanup = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (prepTimerRef.current) {
      clearTimeout(prepTimerRef.current);
      prepTimerRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  // ── Calculate active elapsed time ─────────────────────────────
  const getElapsedMs = useCallback(() => {
    if (stateRef.current === 'idle' || stateRef.current === 'preparing') return 0;
    const now = performance.now();
    let pauseOffset = totalPausedMsRef.current;
    if (stateRef.current === 'paused') {
      pauseOffset += now - pauseStartTimeRef.current;
    }
    return now - sessionStartTimeRef.current - pauseOffset;
  }, []);

  // ── Get current position within phases ────────────────────────
  const getPhaseElapsedMs = useCallback(() => {
    if (stateRef.current === 'paused') {
      // Return the frozen position
      return pauseStartTimeRef.current - phaseStartTimeRef.current;
    }
    return performance.now() - phaseStartTimeRef.current;
  }, []);

  // ── Play sounds based on settings ─────────────────────────────
  const shouldPlaySound = useCallback(() => {
    const ss = soundSettingsRef.current;
    return ss && ss.masterSound;
  }, []);

  const doPlayTick = useCallback(() => {
    const ss = soundSettingsRef.current;
    if (ss && ss.masterSound && ss.tickSound) {
      playTick(ss.volume * 0.2);
    }
  }, []);

  const doPlayPhaseChime = useCallback((phaseName) => {
    const ss = soundSettingsRef.current;
    if (ss && ss.masterSound && ss.phaseChimes) {
      playPhaseChime(phaseName, ss.volume * 0.3);
    }
  }, []);

  const doPlayCompletion = useCallback(() => {
    const ss = soundSettingsRef.current;
    if (ss && ss.masterSound && ss.phaseChimes && !completionPlayedRef.current) {
      completionPlayedRef.current = true;
      playCompletionBell(ss.volume * 0.35);
    }
  }, []);

  // ── Advance to next phase / round ────────────────────────────
  const advancePhase = useCallback(() => {
    const phases = phasesRef.current;
    let phaseIdx = currentPhaseIndexRef.current + 1;
    let round = currentRoundRef.current;

    if (phaseIdx >= phases.length) {
      // End of round
      round += 1;
      phaseIdx = 0;

      if (round > totalRoundsRef.current) {
        // Session complete
        const elapsed = getElapsedMs() / 1000;
        updateState('completed');
        cleanup();

        const completedRounds = totalRoundsRef.current;
        setCurrentRound(completedRounds);
        setElapsedTime(elapsed);
        setSessionProgress(1);

        doPlayCompletion();

        setSummaryData({
          completed: true,
          roundsCompleted: completedRounds,
          totalRounds: totalRoundsRef.current,
          elapsedTime: elapsed,
          settings: settingsRef.current,
        });
        return;
      }
    }

    currentPhaseIndexRef.current = phaseIdx;
    currentRoundRef.current = round;

    const phase = phases[phaseIdx];
    phaseStartTimeRef.current = performance.now();
    phaseDurationMsRef.current = phase.duration * 1000;
    lastTickSecondRef.current = -1;

    setCurrentPhase(phase);
    setCurrentRound(round);

    // Play phase chime
    doPlayPhaseChime(phase.name);
  }, [getElapsedMs, updateState, cleanup, doPlayPhaseChime, doPlayCompletion]);

  // ── Animation frame loop ──────────────────────────────────────
  const tick = useCallback(() => {
    if (stateRef.current !== 'running') return;

    const phases = phasesRef.current;
    const phase = phases[currentPhaseIndexRef.current];
    if (!phase) return;

    const phaseElapsedMs = performance.now() - phaseStartTimeRef.current;
    const phaseDurationMs = phaseDurationMsRef.current;

    // Check if phase is complete
    if (phaseElapsedMs >= phaseDurationMs) {
      advancePhase();
      // If session completed, advancePhase sets state and returns
      if (stateRef.current !== 'running') return;
      // Schedule next frame
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const remainingSec = Math.ceil((phaseDurationMs - phaseElapsedMs) / 1000);
    const phaseProgress = Math.min(1, phaseElapsedMs / phaseDurationMs);

    // Tick sound on second boundaries
    if (remainingSec !== lastTickSecondRef.current && remainingSec >= 1) {
      lastTickSecondRef.current = remainingSec;
      doPlayTick();
    }

    // Update UI state
    setPhaseRemaining(remainingSec);

    // Circle progress: 0 = start of phase, 1 = end of phase
    setCircleProgress(phaseProgress);

    // Overall session progress
    const rDur = roundDuration(phases);
    const totalSessionSec = rDur * totalRoundsRef.current;
    // Completed seconds = completed rounds + current round progress
    const completedRoundsSec = (currentRoundRef.current - 1) * rDur;
    // Sum durations of completed phases in current round
    let completedPhasesSec = 0;
    for (let i = 0; i < currentPhaseIndexRef.current; i++) {
      completedPhasesSec += phases[i].duration;
    }
    const currentPhaseSec = phase.duration * phaseProgress;
    const overallProgress = (completedRoundsSec + completedPhasesSec + currentPhaseSec) / totalSessionSec;
    setSessionProgress(Math.min(1, overallProgress));

    // Active elapsed time
    const elapsedMs = getElapsedMs();
    setElapsedTime(elapsedMs / 1000);

    rafRef.current = requestAnimationFrame(tick);
  }, [advancePhase, doPlayTick, getElapsedMs]);

  // ── Start Session ─────────────────────────────────────────────
  const startSession = useCallback((settings, soundSettings) => {
    if (startLockRef.current) return;
    startLockRef.current = true;

    // Cleanup any previous session
    cleanup();

    // Store settings
    settingsRef.current = settings;
    soundSettingsRef.current = { ...soundSettings };
    const phases = buildPhaseList(settings);
    phasesRef.current = phases;
    totalRoundsRef.current = settings.rounds;

    // Reset state
    currentPhaseIndexRef.current = 0;
    currentRoundRef.current = 1;
    lastTickSecondRef.current = -1;
    completionPlayedRef.current = false;
    totalPausedMsRef.current = 0;

    setTotalRounds(settings.rounds);
    setCurrentRound(1);
    setElapsedTime(0);
    setSessionProgress(0);
    setSummaryData(null);

    // Initialize audio
    initAudio();
    setMasterVolume(soundSettings.volume);

    // Start preparation countdown
    updateState('preparing');
    setPrepCountdown(3);

    let count = 3;
    const countdownStep = () => {
      if (stateRef.current !== 'preparing') {
        startLockRef.current = false;
        return;
      }
      count -= 1;
      if (count > 0) {
        setPrepCountdown(count);
        prepTimerRef.current = setTimeout(countdownStep, 1000);
      } else {
        // Preparation done — start first phase
        setPrepCountdown(0);

        const firstPhase = phases[0];
        setCurrentPhase(firstPhase);
        setPhaseRemaining(firstPhase.duration);
        setCircleProgress(0);

        // Set timing anchors
        const now = performance.now();
        sessionStartTimeRef.current = now;
        phaseStartTimeRef.current = now;
        phaseDurationMsRef.current = firstPhase.duration * 1000;

        updateState('running');
        startLockRef.current = false;

        // Play first phase chime
        doPlayPhaseChime(firstPhase.name);

        // Start animation loop
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    prepTimerRef.current = setTimeout(countdownStep, 1000);
  }, [cleanup, updateState, tick, doPlayPhaseChime]);

  // ── Pause ─────────────────────────────────────────────────────
  const pauseSession = useCallback(() => {
    if (stateRef.current !== 'running') return;
    pauseStartTimeRef.current = performance.now();
    cleanup();
    updateState('paused');
  }, [cleanup, updateState]);

  // ── Resume ────────────────────────────────────────────────────
  const resumeSession = useCallback(() => {
    if (stateRef.current !== 'paused') return;

    const pausedDuration = performance.now() - pauseStartTimeRef.current;
    totalPausedMsRef.current += pausedDuration;

    // Adjust phase start time to account for pause
    phaseStartTimeRef.current += pausedDuration;

    lastTickSecondRef.current = -1; // allow next tick sound

    updateState('running');
    rafRef.current = requestAnimationFrame(tick);
  }, [updateState, tick]);

  // ── Stop (after user confirms) ────────────────────────────────
  const stopSession = useCallback(() => {
    const elapsed = getElapsedMs() / 1000;
    const roundsCompleted = Math.max(0, currentRoundRef.current - 1);

    cleanup();
    updateState('stopped');

    setSummaryData({
      completed: false,
      roundsCompleted,
      totalRounds: totalRoundsRef.current,
      elapsedTime: elapsed,
      settings: settingsRef.current,
    });
  }, [cleanup, updateState, getElapsedMs]);

  // ── Reset to idle ─────────────────────────────────────────────
  const resetToIdle = useCallback(() => {
    cleanup();
    updateState('idle');
    setCurrentPhase(null);
    setPhaseRemaining(0);
    setCurrentRound(1);
    setElapsedTime(0);
    setCircleProgress(0);
    setSessionProgress(0);
    setSummaryData(null);
    startLockRef.current = false;
  }, [cleanup, updateState]);

  // ── Update sound settings live ────────────────────────────────
  const updateSoundSettings = useCallback((newSettings) => {
    soundSettingsRef.current = { ...newSettings };
    setMasterVolume(newSettings.volume);
  }, []);

  return {
    // State
    sessionState,
    prepCountdown,
    currentPhase,
    phaseRemaining,
    currentRound,
    totalRounds,
    elapsedTime,
    circleProgress,
    sessionProgress,
    summaryData,

    // Actions
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    resetToIdle,
    updateSoundSettings,
  };
}
