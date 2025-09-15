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
    'Bayer 8x8',
    'Bayer 16x16'
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
          
          {!settings.grayscale && (
          <div className="control-group">
            <label>
              Dithering Factor:
              <input
                type="range"
                min="8"
                max="256"
                step="8"
                value={settings.ditheringFactor}
                onChange={(e) => handleChange('ditheringFactor', parseInt(e.target.value))}
              />
              <span className="value">{settings.ditheringFactor}</span>
            </label>
          </div>
          )}

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