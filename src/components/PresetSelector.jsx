export default function PresetSelector({ preset, onSelect }) {
  const presets = [
    { id: 'custom', label: 'Custom' },
    { id: 'equal', label: 'Equal' },
    { id: 'box', label: 'Box' },
  ];

  return (
    <div className="card">
      <h2 className="card-title">Breathing Pattern</h2>
      <div className="preset-selector" role="radiogroup" aria-label="Breathing pattern preset">
        {presets.map((p) => (
          <button
            key={p.id}
            id={`preset-${p.id}`}
            className={`preset-btn${preset === p.id ? ' active' : ''}`}
            onClick={() => onSelect(p.id)}
            role="radio"
            aria-checked={preset === p.id}
            type="button"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
