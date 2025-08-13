import React from 'react';
//import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { PixertUI } from './components/PixertUI';

// Global variables to communicate with p5.js
window.pixertUI = null;

// Initialize React UI
function initPixertUI(imageProcessor, onUpdate) {
  const container = document.getElementById('pixert-ui');
  if (!container) return;
  const root = createRoot(container);
  window.pixertUI = root;
  root.render(
    <PixertUI 
      imageProcessor={imageProcessor} 
      onUpdate={onUpdate}
    />
  );
}

// Export for use in sketch.js
window.initPixertUI = initPixertUI; 