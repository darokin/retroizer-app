import React from 'react';
import { CollapsibleSection } from './CollapsibleSection';

/*
const DITHERING_NAMES = [
  'Floyd-Steinberg',
  'Jarvis-Judice-Ninke',
  'Stucki',
  'Burkes',
  'Sierra',
  'Sierra Lite',
  'Atkinson',
  'Random',
  'Ordered'
];
*/
const DITHERING_NAMES = [
    'Bayer 2x2',
    'Bayer 4x4',
    'Bayer 8x8'
];
  

export function DitheringSection({ settings, onUpdate }) {
  const handleChange = (field, value) => {
    onUpdate({ ...settings, [field]: value });
  };

  return (
    <CollapsibleSection title="Dithering" defaultOpen={true}>
      <div className="control-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.dithering}
            onChange={(e) => handleChange('dithering', e.target.checked)}
          />
          Enable Dithering
        </label>
      </div>
      
      {settings.dithering && (
        <>
          <div className="control-group">
            <label>
              Dithering Type:
              <select
                value={settings.ditheringType}
                onChange={(e) => handleChange('ditheringType', e.target.value)}
              >
                {DITHERING_NAMES.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </label>
          </div>
          
          <div className="control-group">
            <label>
              Noise Level:
              <input
                type="range"
                min="0"
                max="50"
                step="0.1"
                value={settings.ditheringNoise}
                onChange={(e) => handleChange('ditheringNoise', parseFloat(e.target.value))}
              />
              <span className="value">{settings.ditheringNoise.toFixed(1)}</span>
            </label>
          </div>
        </>
      )}
    </CollapsibleSection>
  );
} 