import React from 'react';
import { CollapsibleSection } from './CollapsibleSection';
// Palette names aligned with keys in src/js/palettes.js
const PALETTE_NAMES = [
    'CMYK',
    'CGA 4',
    'CGA 16',
    'Gameboy',
    'Gameboy Light',
    'Gameboy Pocket',
    'NES',
    'C64',
    'ZX Spectrum',
    'Grayscale 2',
    'Grayscale 4',
    'Grayscale 8',
    'Grayscale 16'
];
export function ColorsSection({ settings, onUpdate }) {
    const handleChange = (field, value) => {
        const newSettings = { ...settings, [field]: value };
        // Handle mutual exclusivity
        if (field === 'grayscale' && value) {
            newSettings.colorLimit = false;
            newSettings.customPalette = false;
        }
        else if (field === 'colorLimit' && value) {
            newSettings.grayscale = false;
            newSettings.customPalette = false;
        }
        else if (field === 'customPalette' && value) {
            newSettings.grayscale = false;
            newSettings.colorLimit = false;
            //settings.paletteType = paletteType
        }
        onUpdate(newSettings);
    };
    return (<CollapsibleSection title="Colors" defaultOpen={true}>
      <div className="control-group">
        <label className="checkbox-label">
          <input type="checkbox" checked={settings.grayscale} onChange={(e) => handleChange('grayscale', e.target.checked)}/>
          Grayscale
        </label>
      </div>
      
      <div className="control-group">
        <label className="checkbox-label">
          <input type="checkbox" checked={settings.colorLimit} onChange={(e) => handleChange('colorLimit', e.target.checked)}/>
          Color Limit
        </label>
      </div>
      
      {settings.colorLimit && (<div className="control-group">
          <label>
            Max Colors:
            <input type="range" min="2" max="32" step="1" value={settings.colors} onChange={(e) => handleChange('colors', parseInt(e.target.value))}/>
            <span className="value">{settings.colors}</span>
          </label>
        </div>)}
      
      <div className="control-group">
        <label className="checkbox-label">
          <input type="checkbox" checked={settings.customPalette} onChange={(e) => handleChange('customPalette', e.target.checked)}/>
          Custom Palette
        </label>
      </div>
      
      {settings.customPalette && (<div className="control-group">
          <label>
            Palette:
            <select value={settings.paletteType} onChange={(e) => handleChange('paletteType', e.target.value)}>
              {PALETTE_NAMES.map(name => (<option key={name} value={name}>{name}</option>))}
            </select>
          </label>
        </div>)}
    </CollapsibleSection>);
}
//# sourceMappingURL=ColorsSection.js.map