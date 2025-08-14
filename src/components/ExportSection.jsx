import React from 'react';
import { CollapsibleSection } from './CollapsibleSection';

export function ExportSection({ settings, onUpdate, onSaveImage}) {
  const handleChange = (field, value) => {
    onUpdate({ ...settings, [field]: value}, false);
  };

  return (
    <CollapsibleSection title="Export" defaultOpen={true}>
    <div className="control-group">
        <label>
        Output Pixel Size:
        <input
            type="range"
            min="0"
            max="20"
            step="1"
            value={settings.outputPixelSize}
            onChange={(e) => handleChange('outputPixelSize', parseInt(e.target.value))}
        />
        <span className="value">{settings.outputPixelSize}</span>
        </label>
    </div>
    <div className="control-group">
        <button 
            className="btn btn-success" 
            onClick={onSaveImage}
        >
            Save Image
        </button>
    </div>
    </CollapsibleSection>
  );
} 