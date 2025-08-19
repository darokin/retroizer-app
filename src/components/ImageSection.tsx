import React from 'react';
import { CollapsibleSection } from './CollapsibleSection';

export function ImageSection({ settings, onUpdate, onLoadImage }) {
  const handleChange = (field, value) => {
    onUpdate({ ...settings, [field]: value });
  };

  return (
    <CollapsibleSection title="Image" defaultOpen={true}>
      <div className="control-group">
        <button 
          className="btn btn-primary" 
          onClick={onLoadImage}
        >
          Load Image
        </button>
      </div>
      
      <div className="control-group">
        <label>
          Pixel Size:
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={settings.pixelSize}
            onChange={(e) => handleChange('pixelSize', parseInt(e.target.value))}
          />
          <span className="value">{settings.pixelSize}</span>
        </label>
      </div>
    </CollapsibleSection>
  );
} 