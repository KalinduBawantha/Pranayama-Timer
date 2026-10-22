import { Volume2, VolumeX } from 'lucide-react';

export default function SoundSettings({ soundSettings, onUpdate }) {
  return (
    <div className="card">
      <h2 className="card-title">Sound</h2>
      <div className="sound-settings">
        {/* Master sound toggle */}
        <div className="sound-row">
          <span className="sound-label">
            {soundSettings.masterSound ? (
              <Volume2 size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            ) : (
              <VolumeX size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            )}
            Sound
          </span>
          <label className="toggle" htmlFor="toggle-master-sound">
            <input
              id="toggle-master-sound"
              type="checkbox"
              checked={soundSettings.masterSound}
              onChange={(e) => onUpdate('masterSound', e.target.checked)}
            />
            <span className="toggle-track" />
            <span className="sr-only">Toggle master sound</span>
          </label>
        </div>

        {soundSettings.masterSound && (
          <>
            {/* Volume slider */}
            <div className="sound-row volume-row">
              <span className="sound-label">Volume</span>
              <div className="volume-slider-container">
                <input
                  id="volume-slider"
                  type="range"
                  className="volume-slider"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundSettings.volume}
                  onChange={(e) => onUpdate('volume', parseFloat(e.target.value))}
                  aria-label="Volume"
                />
                <span className="volume-value">{Math.round(soundSettings.volume * 100)}%</span>
              </div>
            </div>

            {/* Sub-settings */}
            <div className="sound-sub-settings">
              <div className="sound-row">
                <span className="sound-label">Tick sounds</span>
                <label className="toggle" htmlFor="toggle-tick">
                  <input
                    id="toggle-tick"
                    type="checkbox"
                    checked={soundSettings.tickSound}
                    onChange={(e) => onUpdate('tickSound', e.target.checked)}
                  />
                  <span className="toggle-track" />
                  <span className="sr-only">Toggle tick sounds</span>
                </label>
              </div>
              <div className="sound-row">
                <span className="sound-label">Phase chimes</span>
                <label className="toggle" htmlFor="toggle-chimes">
                  <input
                    id="toggle-chimes"
                    type="checkbox"
                    checked={soundSettings.phaseChimes}
                    onChange={(e) => onUpdate('phaseChimes', e.target.checked)}
                  />
                  <span className="toggle-track" />
                  <span className="sr-only">Toggle phase change chimes</span>
                </label>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
