import React from 'react';
import { CollapsibleSection } from './CollapsibleSection';

export function AdjustmentsSection({ settings, onUpdate }) {
  const handleChange = (field, value) => {
    onUpdate({ ...settings, [field]: value });
  };

  return (
    <CollapsibleSection title="Adjustments" defaultOpen={true}>
      <div className="control-group">
        <label>
          Brightness:
          <input
            type="range"
            min="-128"
            max="128"
            step="1"
            value={settings.brightness}
            onChange={(e) => handleChange('brightness', parseInt(e.target.value))}
          />
          <span className="value">{settings.brightness}</span>
        </label>
      </div>
      
      <div className="control-group">
        <label>
          Contrast:
          <input
            type="range"
            min="-128"
            max="128"
            step="1"
            value={settings.contrast}
            onChange={(e) => handleChange('contrast', parseInt(e.target.value))}
          />
          <span className="value">{settings.contrast}</span>
        </label>
      </div>
      
      <div className="control-group">
        <label>
          Gamma:
          <input
            type="range"
            min="-10"
            max="10"
            step="0.1"
            value={settings.gamma}
            onChange={(e) => handleChange('gamma', parseFloat(e.target.value))}
          />
          <span className="value">{settings.gamma.toFixed(1)}</span>
        </label>
      </div>
    </CollapsibleSection>
  );
} 