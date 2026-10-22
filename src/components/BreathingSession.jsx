import { useState } from 'react';
import BreathingCircle from './BreathingCircle';
import SessionControls from './SessionControls';
import StopConfirmationDialog from './StopConfirmationDialog';
import { formatTime } from '../useTimerEngine';

export default function BreathingSession({
  sessionState,
  prepCountdown,
  currentPhase,
  phaseRemaining,
  currentRound,
  totalRounds,
  elapsedTime,
  circleProgress,
  sessionProgress,
  onPause,
  onResume,
  onStop,
  masterSound,
  onToggleSound,
}) {
  const [showStopDialog, setShowStopDialog] = useState(false);

  const isPaused = sessionState === 'paused';
  const isPreparing = sessionState === 'preparing';

  const handleStopClick = () => {
    // Pause the session while showing dialog
    if (!isPaused && !isPreparing) {
      onPause();
    }
    setShowStopDialog(true);
  };

  const handleContinue = () => {
    setShowStopDialog(false);
    // Resume if it was running (not if it was already paused before dialog)
    if (sessionState === 'paused') {
      onResume();
    }
  };

  const handleConfirmStop = () => {
    setShowStopDialog(false);
    onStop();
  };

  // Phase display label
  const phaseLabel = isPreparing
    ? 'Preparing'
    : isPaused
      ? 'Paused'
      : currentPhase?.label || '';

  return (
    <div className="session-screen">
      {/* Phase name */}
      <div
        className={`session-phase-name${isPreparing ? ' preparing' : ''}`}
        aria-live="polite"
        aria-atomic="true"
      >
        {phaseLabel}
      </div>

      {/* Breathing circle */}
      <BreathingCircle
        phase={currentPhase}
        phaseRemaining={phaseRemaining}
        circleProgress={circleProgress}
        sessionProgress={sessionProgress}
        isPaused={isPaused}
        isPreparing={isPreparing}
        prepCountdown={prepCountdown}
      />

      {/* Session info */}
      {!isPreparing && (
        <div className="session-info">
          <div className="session-info-item">
            <span className="session-info-value">{currentRound} / {totalRounds}</span>
            <span className="session-info-label">Round</span>
          </div>
          <div className="session-info-item">
            <span className="session-info-value">{formatTime(elapsedTime)}</span>
            <span className="session-info-label">Elapsed</span>
          </div>
        </div>
      )}

      {/* Controls */}
      {!isPreparing && (
        <SessionControls
          isPaused={isPaused}
          onPause={onPause}
          onResume={onResume}
          onStop={handleStopClick}
          masterSound={masterSound}
          onToggleSound={onToggleSound}
        />
      )}

      {/* Stop confirmation dialog */}
      {showStopDialog && (
        <StopConfirmationDialog
          onContinue={handleContinue}
          onStop={handleConfirmStop}
        />
      )}
    </div>
  );
}
