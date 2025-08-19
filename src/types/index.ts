// Types de base pour la migration TypeScript

export interface AppConfig {
  WINDOW: {
    WIDTH: number;
    HEIGHT: number;
  };
  SIDEBAR: {
    WIDTH: number;
  };
  CANVAS: {
    WIDTH: number;
    HEIGHT: number;
  };
  RENDER: {
    PIXEL_SIZE: number;
    BACKGROUND_COLOR: [number, number, number];
  };
  UI: {
    TEXT_COLOR: [number, number, number];
    ACCENT_COLOR: [number, number, number];
    SECONDARY_COLOR: [number, number, number];
  };
}

export interface ImageProcessorSettings {
  pixelSize: number;
  outputPixelSize: number;
  brightness: number;
  contrast: number;
  gamma: number;
  grayscale: boolean;
  colorLimit: boolean;
  colors: number;
  customPalette: boolean;
  paletteType: string;
  dithering: boolean;
  ditheringType: string;
  ditheringNoise: number;
  scanlines: boolean;
  scanlineMode: number;
  scanlineColor: number;
  scanlineOpacity: number;
  overlayMode: number;
  overlayColor: [number, number, number];
  overlayOpacity: number;
}

export interface ProcessedPixel {
  x: number;
  y: number;
  color: any; // p5.Color - sera typé plus tard
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface RenderDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Types pour p5.js (basiques)
declare global {
  interface Window {
    initPixertUI?: (imageProcessor: any, updateRender: () => void) => void;
  }
}

// Extension pour p5.js (optionnel pour l'instant)
// declare module 'p5' {
//   interface p5 {
//     Color: any;
//   }
// }
