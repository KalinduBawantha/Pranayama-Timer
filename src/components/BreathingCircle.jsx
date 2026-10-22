import { useMemo } from 'react';

/**
 * BreathingCircle — Main visual element during active sessions.
 *
 * Props:
 * - phase: { name, label, duration } | null
 * - phaseRemaining: number (seconds remaining)
 * - circleProgress: 0–1 (progress within current phase)
 * - sessionProgress: 0–1 (overall session progress)
 * - isPaused: boolean
 * - isPreparing: boolean
 * - prepCountdown: number
 */
export default function BreathingCircle({
  phase,
  phaseRemaining,
  circleProgress,
  sessionProgress,
  isPaused,
  isPreparing,
  prepCountdown,
}) {
  // Calculate circle scale based on phase and progress
  const scale = useMemo(() => {
    if (isPreparing) return 0.65;

    if (!phase) return 0.65;

    const minScale = 0.65;
    const maxScale = 1.0;

    switch (phase.name) {
      case 'inhale':
        // Expand from min to max
        return minScale + (maxScale - minScale) * circleProgress;
      case 'holdInhale':
        // Stay at max
        return maxScale;
      case 'exhale':
        // Contract from max to min
        return maxScale - (maxScale - minScale) * circleProgress;
      case 'holdExhale':
        // Stay at min
        return minScale;
      default:
        return minScale;
    }
  }, [phase, circleProgress, isPreparing]);

  // Progress ring SVG calculations
  const ringRadius = 126;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - sessionProgress);

  // Display values
  const displayNumber = isPreparing ? prepCountdown : phaseRemaining;
  const displayLabel = isPreparing ? 'Get Ready' : (phase?.label || '');

  // Determine if reduced motion is preferred
  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const circleStyle = prefersReducedMotion
    ? {} // No transform animation for reduced motion
    : { transform: `scale(${scale})` };

  const circleClass = [
    'breathing-circle',
    isPreparing ? 'prep' : '',
    isPaused ? 'paused' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className="breathing-circle-container"
      role="img"
      aria-label={
        isPreparing
          ? `Preparing: ${prepCountdown} seconds`
          : `${displayLabel}: ${phaseRemaining} seconds remaining`
      }
    >
      {/* Progress ring (overall session) */}
      {!isPreparing && (
        <svg className="progress-ring" viewBox="0 0 260 260" aria-hidden="true">
          <circle
            className="progress-ring-bg"
            cx="130"
            cy="130"
            r={ringRadius}
          />
          <circle
            className="progress-ring-fill"
            cx="130"
            cy="130"
            r={ringRadius}
            strokeDasharray={ringCircumference}
            strokeDashoffset={ringOffset}
          />
        </svg>
      )}

      {/* Outer reference circle */}
      <div className="breathing-circle-outer" aria-hidden="true" />

      {/* Animated breathing circle */}
      <div className={circleClass} style={circleStyle}>
        <span className="breathing-circle-countdown" aria-live="off">
          {displayNumber}
        </span>
        <span className="breathing-circle-label">
          {displayLabel}
        </span>
      </div>
    </div>
  );
}
