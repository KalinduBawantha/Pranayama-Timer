import { Minus, Plus } from 'lucide-react';

function Stepper({ id, label, subLabel, value, min, max, onChange, disabled = false }) {
  const decrement = () => {
    if (value > min) onChange(value - 1);
  };

  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className={`setting-row${disabled ? ' setting-disabled' : ''}`}>
      <label htmlFor={id} className="setting-label">
        {label}
        {subLabel && <span className="setting-label-sub">{subLabel}</span>}
      </label>
      <div className="stepper" role="group" aria-label={label}>
        <button
          type="button"
          className="stepper-btn"
          onClick={decrement}
          disabled={disabled || value <= min}
          aria-label={`Decrease ${label}`}
        >
          <Minus size={16} />
        </button>
        <span
          id={id}
          className="stepper-value"
          role="spinbutton"
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-label={`${label}: ${value}${label.includes('Round') ? '' : ' seconds'}`}
        >
          {value}{label.includes('Round') ? '' : 's'}
        </span>
        <button
          type="button"
          className="stepper-btn"
          onClick={increment}
          disabled={disabled || value >= max}
          aria-label={`Increase ${label}`}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

export default function BreathingSettings({ settings, onUpdate, estimatedDuration }) {
  const isEqual = settings.preset === 'equal';
  const isBox = settings.preset === 'box';

  const handleEqualChange = (val) => {
    onUpdate('inhale', val);
    onUpdate('exhale', val);
  };

  const handleBoxChange = (val) => {
    onUpdate('inhale', val);
    onUpdate('holdInhale', val);
    onUpdate('exhale', val);
    onUpdate('holdExhale', val);
  };

  const formatEstimate = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="card">
      <h2 className="card-title">Timing Settings</h2>
      <div className="settings-grid">
        {isEqual ? (
          <Stepper
            id="setting-equal-duration"
            label="Breath Duration"
            subLabel="Inhale & Exhale"
            value={settings.inhale}
            min={1}
            max={60}
            onChange={handleEqualChange}
          />
        ) : isBox ? (
          <Stepper
            id="setting-box-duration"
            label="Phase Duration"
            subLabel="All 4 phases"
            value={settings.inhale}
            min={1}
            max={60}
            onChange={handleBoxChange}
          />
        ) : (
          <>
            <Stepper
              id="setting-inhale"
              label="Inhale"
              value={settings.inhale}
              min={1}
              max={60}
              onChange={(v) => onUpdate('inhale', v)}
            />
            <Stepper
              id="setting-hold-inhale"
              label="Hold Inhale"
              subLabel="Set to 0 to disable"
              value={settings.holdInhale}
              min={0}
              max={60}
              onChange={(v) => onUpdate('holdInhale', v)}
            />
            <Stepper
              id="setting-exhale"
              label="Exhale"
              value={settings.exhale}
              min={1}
              max={60}
              onChange={(v) => onUpdate('exhale', v)}
            />
            <Stepper
              id="setting-hold-exhale"
              label="Hold after Exhale"
              subLabel="Set to 0 to disable"
              value={settings.holdExhale}
              min={0}
              max={60}
              onChange={(v) => onUpdate('holdExhale', v)}
            />
          </>
        )}

        <Stepper
          id="setting-rounds"
          label="Rounds"
          value={settings.rounds}
          min={1}
          max={100}
          onChange={(v) => onUpdate('rounds', v)}
        />

        <div className="estimated-duration" aria-live="polite">
          <div className="estimated-duration-label">Estimated Session</div>
          <div className="estimated-duration-value">{formatEstimate(estimatedDuration)}</div>
        </div>
      </div>
    </div>
  );
}
