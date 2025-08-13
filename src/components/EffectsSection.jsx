import React from 'react';
import { CollapsibleSection } from './CollapsibleSection';

export function EffectsSection({ settings, onUpdate }) {
  const handleChange = (field, value) => {
    onUpdate({ ...settings, [field]: value });
  };

  const handleColorChange = (index, value) => {
    const newColor = [...settings.overlayColor];
    newColor[index] = parseInt(value);
    handleChange('overlayColor', newColor);
  };

  return (
    <CollapsibleSection title="Effects" defaultOpen={true}>
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
              Scanline Type:
              <select
                value={settings.scanlineType}
                onChange={(e) => handleChange('scanlineType', parseInt(e.target.value))}
              >
                <option value={0}>Black</option>
                <option value={1}>Cyan</option>
                <option value={2}>Green</option>
              </select>
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
      
      <div className="control-group">
        <label>
          Overlay Mode:
          <select
            value={settings.overlayMode}
            onChange={(e) => handleChange('overlayMode', parseInt(e.target.value))}
          >
            <option value={0}>None</option>
            <option value={1}>Add</option>
            <option value={2}>Multiply</option>
            <option value={3}>Overlay</option>
            <option value={4}>Screen</option>
          </select>
        </label>
      </div>
      
      {settings.overlayMode > 0 && (
        <>
          <div className="control-group">
            <label>Overlay Color (RGB):</label>
            <div className="color-inputs">
              <input
                type="number"
                min="0"
                max="255"
                value={settings.overlayColor[0]}
                onChange={(e) => handleColorChange(0, e.target.value)}
                placeholder="R"
              />
              <input
                type="number"
                min="0"
                max="255"
                value={settings.overlayColor[1]}
                onChange={(e) => handleColorChange(1, e.target.value)}
                placeholder="G"
              />
              <input
                type="number"
                min="0"
                max="255"
                value={settings.overlayColor[2]}
                onChange={(e) => handleColorChange(2, e.target.value)}
                placeholder="B"
              />
            </div>
          </div>
          
          <div className="control-group">
            <label>
              Overlay Opacity:
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={settings.overlayOpacity}
                onChange={(e) => handleChange('overlayOpacity', parseInt(e.target.value))}
              />
              <span className="value">{settings.overlayOpacity}%</span>
            </label>
          </div>
        </>
      )}
    </CollapsibleSection>
  );
} 