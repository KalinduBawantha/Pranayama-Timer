import { Pause, Play, Square, Volume2, VolumeX } from 'lucide-react';

export default function SessionControls({
  isPaused,
  onPause,
  onResume,
  onStop,
  masterSound,
  onToggleSound,
}) {
  return (
    <div className="session-controls">
      <button
        id="session-sound-btn"
        className={`session-sound-btn${masterSound ? '' : ' muted'}`}
        onClick={onToggleSound}
        type="button"
        aria-label={masterSound ? 'Mute sound' : 'Unmute sound'}
      >
        {masterSound ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>

      {isPaused ? (
        <button
          id="session-resume-btn"
          className="control-btn control-btn-primary"
          onClick={onResume}
          type="button"
        >
          <Play size={18} />
          Resume
        </button>
      ) : (
        <button
          id="session-pause-btn"
          className="control-btn control-btn-primary"
          onClick={onPause}
          type="button"
        >
          <Pause size={18} />
          Pause
        </button>
      )}

      <button
        id="session-stop-btn"
        className="control-btn control-btn-danger"
        onClick={onStop}
        type="button"
      >
        <Square size={16} />
        Stop
      </button>
    </div>
  );
}
