import React from 'react';
import { CollapsibleSection } from './CollapsibleSection';

export function ScanlinesSection({ settings, onUpdate }) {
  const handleChange = (field, value) => {
    onUpdate({ ...settings, [field]: value });
  };

  return (
    <CollapsibleSection title="Scanlines" defaultOpen={true}>
      <div className="control-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.scanlines}
            onChange={(e) => handleChange('scanlines', e.target.checked)}
          />
          Scanlines
        </label>
      </div>
      
      {settings.scanlines && (
        <>
          <div className="control-group">
            <label>
              Mode:
              <select
                value={settings.scanlineMode}
                onChange={(e) => handleChange('scanlineMode', parseInt(e.target.value))}
              >
                {SCANLINES_DATA.SCANLINES_MODES.map((mode) => (
                  <option key={mode.id} value={mode.id}>{mode.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="control-group">
            <label>
              Color:
              <input
                type="color"
                value={settings.scanlineColor}
                onChange={(e) => handleChange('scanlineColor', e.target.value)}
              />
            </label>
          </div>

          <div className="control-group">
            <label>
              Scanline Opacity:
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={settings.scanlineOpacity}
                onChange={(e) => handleChange('scanlineOpacity', parseInt(e.target.value))}
              />
              <span className="value">{settings.scanlineOpacity}%</span>
            </label>
          </div>
        </>
      )}
    </CollapsibleSection>
  );
}
