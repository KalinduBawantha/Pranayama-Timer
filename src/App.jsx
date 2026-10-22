import { useState, useCallback } from 'react';
import { useTimerEngine } from './useTimerEngine';
import { useSettings } from './useSettings';
import SetupScreen from './components/SetupScreen';
import BreathingSession from './components/BreathingSession';
import SessionSummary from './components/SessionSummary';

export default function App() {
  const {
    settings,
    soundSettings,
    updateSetting,
    updateSoundSetting,
    applyPreset,
    validateForStart,
    estimatedDuration,
  } = useSettings();

  const {
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
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    resetToIdle,
    updateSoundSettings,
  } = useTimerEngine();

  const [validationError, setValidationError] = useState(null);

  // ── Handlers ────────────────────────────────────────────────

  const handleStart = useCallback(() => {
    const error = validateForStart();
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);
    startSession(settings, soundSettings);
  }, [validateForStart, startSession, settings, soundSettings]);

  const handlePresetSelect = useCallback((presetName) => {
    applyPreset(presetName);
    setValidationError(null);
  }, [applyPreset]);

  const handleToggleSound = useCallback(() => {
    const newVal = !soundSettings.masterSound;
    updateSoundSetting('masterSound', newVal);
    updateSoundSettings({ ...soundSettings, masterSound: newVal });
  }, [soundSettings, updateSoundSetting, updateSoundSettings]);

  const handleSoundSettingUpdate = useCallback((key, value) => {
    updateSoundSetting(key, value);
    const newSettings = { ...soundSettings, [key]: value };
    updateSoundSettings(newSettings);
  }, [soundSettings, updateSoundSetting, updateSoundSettings]);

  const handlePracticeAgain = useCallback(() => {
    resetToIdle();
  }, [resetToIdle]);

  const handleBackToSetup = useCallback(() => {
    resetToIdle();
  }, [resetToIdle]);

  // ── Render ──────────────────────────────────────────────────

  const isActive = ['preparing', 'running', 'paused'].includes(sessionState);
  const isSummary = ['completed', 'stopped'].includes(sessionState);

  return (
    <div className="app">
      <div className="app-container">
        {isSummary && (
          <SessionSummary
            summaryData={summaryData}
            onPracticeAgain={handlePracticeAgain}
            onBackToSetup={handleBackToSetup}
          />
        )}

        {isActive && (
          <BreathingSession
            sessionState={sessionState}
            prepCountdown={prepCountdown}
            currentPhase={currentPhase}
            phaseRemaining={phaseRemaining}
            currentRound={currentRound}
            totalRounds={totalRounds}
            elapsedTime={elapsedTime}
            circleProgress={circleProgress}
            sessionProgress={sessionProgress}
            onPause={pauseSession}
            onResume={resumeSession}
            onStop={stopSession}
            masterSound={soundSettings.masterSound}
            onToggleSound={handleToggleSound}
          />
        )}

        {sessionState === 'idle' && (
          <SetupScreen
            settings={settings}
            soundSettings={soundSettings}
            onUpdateSetting={updateSetting}
            onUpdateSoundSetting={handleSoundSettingUpdate}
            onApplyPreset={handlePresetSelect}
            onStart={handleStart}
            estimatedDuration={estimatedDuration}
            validationError={validationError}
          />
        )}
      </div>
    </div>
  );
}
