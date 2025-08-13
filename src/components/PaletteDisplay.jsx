import React from 'react';

export function PaletteDisplay({ palette, settings }) {
  const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  if (!(settings.colorLimit || settings.customPalette) || palette.length === 0) {
    return null;
  }

  return (
    <div className="palette-display">
      <div className="palette-title">Current Palette:</div>
      <div className="palette-colors">
        {palette.map((colorRgb, index) => {
          const colorHex = rgbToHex(colorRgb[0], colorRgb[1], colorRgb[2]);
          return (
            <div
              key={index}
              className="palette-color"
              style={{ backgroundColor: colorHex }}
              title={colorHex}
            />
          );
        })}
      </div>
    </div>
  );
} 