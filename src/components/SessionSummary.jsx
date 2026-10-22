import { CheckCircle, XCircle, RotateCcw, ArrowLeft } from 'lucide-react';
import { formatTime } from '../useTimerEngine';

export default function SessionSummary({ summaryData, onPracticeAgain, onBackToSetup }) {
  if (!summaryData) return null;

  const { completed, roundsCompleted, totalRounds, elapsedTime, settings } = summaryData;

  // Build pattern label
  const patternLabel = (() => {
    if (!settings) return '';
    const parts = [settings.inhale];
    if (settings.holdInhale > 0) parts.push(settings.holdInhale);
    parts.push(settings.exhale);
    if (settings.holdExhale > 0) parts.push(settings.holdExhale);

    const presetName = settings.preset === 'equal'
      ? 'Equal'
      : settings.preset === 'box'
        ? 'Box'
        : 'Custom';

    return `${presetName} ${parts.join('–')}`;
  })();

  return (
    <div className="summary-screen">
      {/* Icon */}
      <div className={`summary-icon ${completed ? 'completed' : 'stopped'}`}>
        {completed ? <CheckCircle size={36} /> : <XCircle size={36} />}
      </div>

      {/* Heading */}
      <div className="summary-heading">
        <h1 className="summary-title">
          {completed ? 'Session Complete' : 'Session Stopped'}
        </h1>
        <p className="summary-message">
          {completed
            ? 'Beautiful work. You completed your breathing session.'
            : 'Your session was ended early. Every breath counts — great effort.'}
        </p>
      </div>

      {/* Stats */}
      <div className="summary-stats">
        <div className="summary-stat-row">
          <span className="summary-stat-label">Rounds completed</span>
          <span className="summary-stat-value">
            {roundsCompleted} / {totalRounds}
          </span>
        </div>
        <div className="summary-stat-row">
          <span className="summary-stat-label">Active session time</span>
          <span className="summary-stat-value">{formatTime(elapsedTime)}</span>
        </div>
        <div className="summary-stat-row">
          <span className="summary-stat-label">Breathing pattern</span>
          <span className="summary-stat-value">{patternLabel}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="summary-actions">
        <button
          id="practice-again-btn"
          className="control-btn control-btn-primary"
          onClick={onPracticeAgain}
          type="button"
        >
          <RotateCcw size={18} />
          Practice Again
        </button>
        <button
          id="back-to-setup-btn"
          className="control-btn control-btn-secondary"
          onClick={onBackToSetup}
          type="button"
        >
          <ArrowLeft size={18} />
          Back to Setup
        </button>
      </div>
    </div>
  );
}
