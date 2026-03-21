import type { ControlValues, CharacterRamp } from '../types';

interface ControlsPanelProps {
  controls: ControlValues;
  onChange: (controls: ControlValues) => void;
  disabled: boolean;
}

export function ControlsPanel({ controls, onChange, disabled }: ControlsPanelProps) {
  const update = (partial: Partial<ControlValues>) => {
    onChange({ ...controls, ...partial });
  };

  return (
    <div className="controls-panel">
      <h3 className="controls-title">Controls</h3>

      <div className="control-group">
        <label className="control-label">
          Output Width
          <span className="control-value">{controls.outputWidth} cols</span>
        </label>
        <input
          type="range"
          min="40"
          max="200"
          value={controls.outputWidth}
          onChange={(e) => update({ outputWidth: parseInt(e.target.value) })}
          disabled={disabled}
          className="control-slider"
        />
      </div>

      <div className="control-group">
        <label className="control-label">
          Animation Speed
          <span className="control-value">{controls.animationSpeed} lines/s</span>
        </label>
        <input
          type="range"
          min="5"
          max="120"
          value={controls.animationSpeed}
          onChange={(e) => update({ animationSpeed: parseInt(e.target.value) })}
          disabled={disabled}
          className="control-slider"
        />
      </div>

      <div className="control-group">
        <label className="control-label">Character Ramp</label>
        <div className="ramp-options">
          {(['standard', 'blocks', 'minimal'] as CharacterRamp[]).map((ramp) => (
            <button
              key={ramp}
              className={`ramp-btn ${controls.charRamp === ramp ? 'active' : ''}`}
              onClick={() => update({ charRamp: ramp })}
              disabled={disabled}
            >
              {ramp}
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <label className="control-label control-checkbox">
          <input
            type="checkbox"
            checked={controls.edgeEnhance}
            onChange={(e) => update({ edgeEnhance: e.target.checked })}
            disabled={disabled}
          />
          Edge Enhancement
        </label>
      </div>

      <div className="control-group">
        <label className="control-label">Seed (optional)</label>
        <input
          type="text"
          value={controls.seed}
          onChange={(e) => update({ seed: e.target.value })}
          placeholder="Random"
          className="control-text-input"
          disabled={disabled}
        />
      </div>

      <div className="control-group">
        <label className="control-label control-checkbox">
          <input
            type="checkbox"
            checked={controls.forceFallback}
            onChange={(e) => update({ forceFallback: e.target.checked })}
            disabled={disabled}
          />
          Force Procedural Fallback
        </label>
      </div>
    </div>
  );
}
