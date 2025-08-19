import React, { useState, useEffect } from 'react';
import { ImageSection } from './ImageSection';
import { AdjustmentsSection } from './AdjustmentsSection';
import { ColorsSection } from './ColorsSection';
import { DitheringSection } from './DitheringSection';
import { ScanlinesSection } from './ScanlinesSection';
import { OverlaySection } from './OverlaySection';
import { ExportSection } from './ExportSection';
import { StatusBar } from './StatusBar';
import { PaletteDisplay } from './PaletteDisplay';
import { OriginalImageSection } from './OriginalImageSection';

// Déclarations globales
declare function loadImage(src: string, successCallback: (img: any) => void, errorCallback: (error: any) => void): void;

export function PixertUI({ imageProcessor, onUpdate }) {
  const [settings, setSettings] = useState(imageProcessor.settings);
  const [status, setStatus] = useState('Select an image to start processing');
  const [palette, setPalette] = useState([]);

  useEffect(() => {
    // Update palette display when settings change
    updatePaletteDisplay();
  }, [settings]);

  const updateSettings = (newSettings, needVisualUpdate = true) => {
    setSettings({ ...newSettings });
    imageProcessor.updateSettings(newSettings);
    if (needVisualUpdate)
        onUpdate();
  };

  const updateStatus = (message) => {
    setStatus(message);
    console.log('Status:', message);
  };

  const updatePaletteDisplay = () => {
    const currentPalette = imageProcessor.getCurrentPalette();
    setPalette(currentPalette);
  };

  const handleLoadImage = async () => {
    try {
      if (!(window as any).electronAPI) {
        updateStatus('Electron API not available');
        return;
      }
      
      const result = await (window as any).electronAPI.invoke('open-file-dialog');
      
      if (result) {
        updateStatus('Loading image...');

        // Load image with p5.js
        loadImage(result.data, (img) => {
            imageProcessor.setImage(img);
            imageProcessor.base64Image = result.data;
            updateStatus(`Image loaded: ${result.path.split('/').pop()} (${img.width}x${img.height})`);
            updatePaletteDisplay();
            onUpdate();
        }, (error) => {
            updateStatus('Error loading image');
            console.error('Error loading image:', error);
        });
      }
    } catch (error) {
      console.error('Error opening file dialog:', error);
      updateStatus('Error opening file dialog');
    }
  };

  const handleSaveImage = async () => {
    try {
      const imageData = imageProcessor.exportImage();
      if (!imageData) {
        updateStatus('No image to export');
        return;
      }
      
      if (!(window as any).electronAPI) {
        updateStatus('Electron API not available');
        return;
      }
      
      const result = await (window as any).electronAPI.invoke('save-image', imageData);
      
      if (result) {
        updateStatus(`Image saved: ${result.split('/').pop()}`);
      } else {
        updateStatus('Save cancelled');
      }
    } catch (error) {
      console.error('Error saving image:', error);
      updateStatus('Error saving image');
    }
  };

//   const showDebugInfo = () => {
//     const pixelsCount = imageProcessor.getProcessedPixelsCount();
//     const dimensions = imageProcessor.getProcessedDimensions();
    
//     const info = [
//       `Processed pixels: ${pixelsCount}`,
//       `Dimensions: ${dimensions.width}x${dimensions.height}`,
//       `Pixel size: ${settings.pixelSize}`,
//       `Grayscale: ${settings.grayscale}`,
//       `Color limit: ${settings.colorLimit} (${settings.colors} colors)`,
//       `Custom palette: ${settings.customPalette} (${settings.paletteType})`,
//       `Dithering: ${settings.dithering} (${settings.ditheringType})`,
//       `Current palette colors: ${palette.length}`
//     ].join('\n');
    
//     alert('Debug Info:\n\n' + info);
//     updateStatus('Debug info displayed');
//   };

  return (
    <div className="pixert-ui">
      <div className="ui-container">
        <ImageSection 
          settings={settings} 
          onUpdate={updateSettings}
          onLoadImage={handleLoadImage}
        />
        
        {imageProcessor.base64Image && (
            <OriginalImageSection 
                img={imageProcessor.base64Image}
            /> 
        )} 

        <AdjustmentsSection 
          settings={settings} 
          onUpdate={updateSettings}
        />
        
        <ColorsSection 
          settings={settings} 
          onUpdate={updateSettings}
        />
        
        <DitheringSection 
          settings={settings} 
          onUpdate={updateSettings}
        />
        
        <ScanlinesSection 
          settings={settings} 
          onUpdate={updateSettings}
        />

        <OverlaySection 
          settings={settings} 
          onUpdate={updateSettings}
        />
        
        <ExportSection 
          settings={settings}
          onUpdate={updateSettings}
          onSaveImage={handleSaveImage}
          //onDebugInfo={showDebugInfo}
        />
        
        <PaletteDisplay palette={palette} settings={settings} />
      </div>
      
      <StatusBar message={status} />
    </div>
  );
} 