import SetupHeader from './SetupHeader';
import PresetSelector from './PresetSelector';
import BreathingSettings from './BreathingSettings';
import SoundSettings from './SoundSettings';

export default function SetupScreen({
  settings,
  soundSettings,
  onUpdateSetting,
  onUpdateSoundSetting,
  onApplyPreset,
  onStart,
  estimatedDuration,
  validationError,
}) {
  return (
    <div className="setup-screen">
      <SetupHeader />

      <PresetSelector
        preset={settings.preset}
        onSelect={onApplyPreset}
      />

      <BreathingSettings
        settings={settings}
        onUpdate={onUpdateSetting}
        estimatedDuration={estimatedDuration}
      />

      <SoundSettings
        soundSettings={soundSettings}
        onUpdate={onUpdateSoundSetting}
      />

      {validationError && (
        <div className="validation-error" role="alert" id="validation-error">
          {validationError}
        </div>
      )}

      <button
        id="start-session-btn"
        className="start-btn"
        onClick={onStart}
        type="button"
        aria-describedby={validationError ? 'validation-error' : undefined}
      >
        Start Session
      </button>
    </div>
  );
}
