//const SCANLINES_DATA = require("./globals");

class ImageProcessor {
    constructor() {
        this.originalImage = null;
        this.base64Image = null;
        this.processedPixels = []; // fully rendered pixels
        this.pixelsColors = []; // only basic avg color pixel without effect (for color limited palette deduction)
        this.currentPalette = [];
        this.settings = this.getDefaultSettings();
        this.scanlineGfx = null;
        this.nbPixelsX = 0;
        this.nbPixelsY = 0;
    }
    
    getDefaultSettings() {
        // TODO : Put these defaults values in config.js (?)
        return {
            pixelSize: 4,
            outputPixelSize: 1,
            brightness: 0,
            contrast: 0,
            gamma: 0,
            grayscale: false,
            colorLimit: false,
            colors: 8,
            customPalette: false,
            paletteType: 'Gameboy',
            dithering: false,
            ditheringType: 'Bayer 2x2',
            ditheringNoise: 0,
            scanlines: false,
            scanlineMode: 0,
            scanlineType: 0,
            scanlineColor: "#000000",
            scanlineOpacity: 20,
            overlayMode: 0,
            overlayColor: [255, 0, 255],
            overlayOpacity: 50
        };
    }
    
    setImage(img) {
        this.originalImage = img;

        this.updateNbPixels();
        this.updateAvgPixels();
        this.processImage();

        // == Recalculate color limited palette with average color of the new pic and reprocess it
        if (this.settings.colorLimit) {
            this.updatePalette();
            this.processImage();
        }
    }
    
    updateSettings(newSettings) {
        // == Update palette only if palette related settings are changed
        const bUpdatePalette = (
               newSettings.grayscale != this.settings.grayscale
            || newSettings.colorLimit != this.settings.colorLimit
            || newSettings.colors != this.settings.colors
            || newSettings.customPalette != this.settings.customPalette
            || newSettings.paletteType != this.settings.paletteType
        );

        // == Only recalculate average pixels colors if pixelsize change
        const bUpdatePixelSize = (newSettings.pixelSize != this.settings.pixelSize);

        // == Check if scanline data change
        const bUpdateScanline = (
            newSettings.scanlineType != this.settings.scanlineType
            || newSettings.scanlineMode != this.settings.scanlineMode
            || newSettings.scanlineColor != this.settings.scanlineColor
        );

        // == Update all settings
        Object.assign(this.settings, newSettings);
        
        // == Update average pixels colors
        if (bUpdatePixelSize) {
            this.updateNbPixels();
            this.updateAvgPixels();
        }

        // == Update palette if necessary (with the new settings)
        if (bUpdatePalette)
            this.updatePalette();

        // == Update scanline gfx
        if (bUpdateScanline || bUpdatePixelSize)
            this.updateScanlineGfx();

        // == Update rendered image
        this.processImage();
    }

    updateNbPixels() {
        this.nbPixelsX = Math.floor(this.originalImage.width / this.settings.pixelSize);
        this.nbPixelsY = Math.floor(this.originalImage.height / this.settings.pixelSize);
    }
    
    updateScanlineGfx() {
        if (!this.scanlineGfx) {
            this.scanlineGfx = createGraphics(this.nbPixelsX * APP_CONFIG.RENDER.PIXEL_SIZE, this.nbPixelsY * APP_CONFIG.RENDER.PIXEL_SIZE);
            this.scanlineGfx.noStroke();
        }

        this.scanlineGfx.clear();

        const type = SCANLINES_DATA.SCANLINES_TYPES[this.settings.scanlineType];
        
        let yStep = 0;
        let xStep = 0;
        let ySize = 0;
        let xSize = 0;
        switch (type) {
            case SCANLINES_DATA.TYPES.SCANLINE_TYPE_HORIZONTAL_1_1:
                yStep = APP_CONFIG.RENDER.PIXEL_SIZE;
                ySize = APP_CONFIG.RENDER.PIXEL_SIZE;
                break;
            case SCANLINES_DATA.TYPES.SCANLINE_TYPE_HORIZONTAL_1_2:
                yStep = APP_CONFIG.RENDER.PIXEL_SIZE;
                ySize = APP_CONFIG.RENDER.PIXEL_SIZE / 2;
                break;
            case SCANLINES_DATA.TYPES.SCANLINE_TYPE_VERTICAL_1_1:
                xStep = APP_CONFIG.RENDER.PIXEL_SIZE;
                xSize = APP_CONFIG.RENDER.PIXEL_SIZE;
                break;
            case SCANLINES_DATA.TYPES.SCANLINE_TYPE_VERTICAL_1_2:
                xStep = APP_CONFIG.RENDER.PIXEL_SIZE;
                xSize = APP_CONFIG.RENDER.PIXEL_SIZE / 2;
                break;
        }

        if (yStep > 0) {
            for (let y = 0; y < this.nbPixelsY * this.settings.pixelSize; y+=yStep) {
                this.scanlineGfx.rect(0, y, this.scanlineGfx.width, ySize);
            }
        } else if (xStep > 0) {
            for (let x = 0; x < this.nbPixelsX * this.settings.pixelSize; x+=xStep) {
                this.scanlineGfx.rect(x, 0, xSize, this.scanlineGfx.height);
            }
        }
    }

    updateAvgPixels() {
        if (!this.originalImage) return;
        
        this.pixelsColors = [];
        
        if (this.originalImage.loadPixels) {
            this.originalImage.loadPixels();
        }

        // == Pixel by pixel color deduction
        for (let y = 0; y < this.nbPixelsY; y++) {
            for (let x = 0; x < this.nbPixelsX; x++) {
                const pixelColor = this.getAverageColor(x, y, this.settings.pixelSize);
                this.pixelsColors.push(pixelColor);
            }
        }
    }

    processImage() {
        if (!this.originalImage) return;
        
        this.processedPixels = [];

        // == Pixel by pixel processing
        for (let y = 0; y < this.nbPixelsY; y++) {
            for (let x = 0; x < this.nbPixelsX; x++) {
                const pixelColor = this.pixelsColors[y * this.nbPixelsX + x];
                const processedColor = this.applyEffects(pixelColor, x, y);
                this.processedPixels.push({x: x, y: y, color: processedColor});
            }
        }
    }
    
    getAverageColor(pixelX, pixelY, size) {
        const img = this.originalImage;
        let r = 0, g = 0, b = 0, count = 0;

        const startX = pixelX * size;
        const startY = pixelY * size;

        // TODO : Is it really a necessary optimization?
        // if (size === 1) {
        //     const index = (startY * img.width + startX) * 4;
        //     return color(img.pixels[index], img.pixels[index + 1], img.pixels[index + 2]);
        // }

        for (let y = startY; y < Math.min(startY + size, img.height); y++) {
            for (let x = startX; x < Math.min(startX + size, img.width); x++) {
                const index = (y * img.width + x) * 4;
                r += img.pixels[index];
                g += img.pixels[index + 1];
                b += img.pixels[index + 2];
                count++;
            }
        }
        
        if (count === 0) return color(0, 0, 0);
        
        return color(
            Math.floor(r / count),
            Math.floor(g / count),
            Math.floor(b / count)
        );
    }
    
    applyEffects(inputColor, x, y) {
        let r = red(inputColor);
        let g = green(inputColor);
        let b = blue(inputColor);
        
        // == Brighness
        if (this.settings.brightness !== 0) {
            r = this.constrain(r + this.settings.brightness, 0, 255);
            g = this.constrain(g + this.settings.brightness, 0, 255);
            b = this.constrain(b + this.settings.brightness, 0, 255);
        }
        
        // == Contrast
        if (this.settings.contrast !== 0) {
            const factor = (259 * (this.settings.contrast + 255)) / (255 * (259 - this.settings.contrast));
            r = this.constrain(factor * (r - 128) + 128, 0, 255);
            g = this.constrain(factor * (g - 128) + 128, 0, 255);
            b = this.constrain(factor * (b - 128) + 128, 0, 255);
        }
        
        // == Gamma correction
        if (this.settings.gamma !== 0) {
            const gammaCorrection = 1.0 / this.map(this.settings.gamma, -10, 10, 0.01, 1.99);
            r = Math.floor(255 * Math.pow(r / 255, gammaCorrection));
            g = Math.floor(255 * Math.pow(g / 255, gammaCorrection));
            b = Math.floor(255 * Math.pow(b / 255, gammaCorrection));
        }
        
        // == Grayscale
        if (this.settings.grayscale) {
            let grayValue = toGrayscale(r, g, b);
            
            if (this.settings.dithering) {
                if (this.settings.ditheringNoise > 0) {
                    grayValue += (Math.random() - 0.5) * this.settings.ditheringNoise;
                }
                grayValue = applyGrayscaleDithering(grayValue, this.settings.ditheringType, x, y);
            }
            
            r = g = b = this.constrain(grayValue, 0, 255);

        } else if (this.settings.colorLimit || this.settings.customPalette) {

            if (this.settings.dithering) {
                const bayerValue = getBayerValue(this.settings.ditheringType, x, y);
                r += bayerValue;
                g += bayerValue;
                b += bayerValue;
                
                if (this.settings.ditheringNoise > 0) {
                    r += (Math.random() - 0.5) * this.settings.ditheringNoise;
                    g += (Math.random() - 0.5) * this.settings.ditheringNoise;
                    b += (Math.random() - 0.5) * this.settings.ditheringNoise;
                }
                
                r = this.constrain(r, 0, 255);
                g = this.constrain(g, 0, 255);
                b = this.constrain(b, 0, 255);
            }
        }
        
        let finalColor = color(r, g, b);
        
        // == Palette nearest color
        if ((this.settings.colorLimit || this.settings.customPalette) && this.currentPalette.length > 0) {
            finalColor = findNearestColor(finalColor, this.currentPalette);
        }
        
        return finalColor;
    }
    
    updatePalette() {
        if (this.settings.colorLimit) {
            this.currentPalette = kMeansQuantize(this.pixelsColors, this.settings.colors);
        } else if (this.settings.customPalette) {
            this.currentPalette = getPalette(this.settings.paletteType) || [];
        } else {
            this.currentPalette = [];
        }
    }
    
    getProcessedDimensions() {
        if (!this.originalImage) return { width: 0, height: 0 };
        
        return {
            width: Math.floor(this.originalImage.width / this.settings.pixelSize),
            height: Math.floor(this.originalImage.height / this.settings.pixelSize)
        };
    }

    getRenderCanvasPositionAndSize() {
        if (!this.originalImage) return { x:0, y:0, width: 0, height: 0 };

        const ratioW = width / this.originalImage.width;
        const ratioH = height / this.originalImage.height;
        let maxRatio, _x = 0, _y = 0, _w, _h;
        if (ratioW > ratioH) 
            maxRatio = ratioH;
        else
            maxRatio = ratioW;
        _w = floor(maxRatio * this.originalImage.width)
        _h = floor(maxRatio * this.originalImage.height)
        if (ratioW > ratioH) 
            _x = (width - _w) / 2;
        else 
            _y = (height - _h) / 2;
        return {
            x: _x,
            y: _y,
            width: _w,
            height: _h 
        };
    }

    updateRenderGraphics(gfx) {
        if (!this.processedPixels.length) return;

        gfx.noStroke();
        gfx.background(0);
       
        // == Pixels processing
        for (let pixel of this.processedPixels) {
            gfx.fill(pixel.color);
            gfx.rect(
                pixel.x * APP_CONFIG.RENDER.PIXEL_SIZE, 
                pixel.y * APP_CONFIG.RENDER.PIXEL_SIZE, 
                APP_CONFIG.RENDER.PIXEL_SIZE, 
                APP_CONFIG.RENDER.PIXEL_SIZE
            );
            
            // // == Scanlines
            // if (this.settings.scanlines)
            //     this.applyScanlines(gfx, pixel, APP_CONFIG.RENDER.PIXEL_SIZE);
        }
        
            // == Scanlines
        if (this.settings.scanlines)
            this.applyScanlines(gfx);

        // == Overlay
        if (this.settings.overlayMode > 0)
            this.applyOverlay(gfx, gfx.width, gfx.height);
    }

    applyScanlines(gfx) {
        const mode = SCANLINES_DATA.SCANLINES_MODES[this.settings.scanlineMode];
        gfx.blendMode(mode.blend); 
        gfx.tint(255, this.settings.scanlineOpacity);
        gfx.image(this.scanlineGfx, 0, 0);
        gfx.noTint();
        gfx.blendMode(BLEND);
    }

    /*
    applyScanlines(gfx, pixel, renderPixelSize) {
        const { scanlineType, scanlineColor, scanlineMode, scanlineOpacity } = this.settings;
        
        if (renderPixelSize % 4 !== 0) {
            renderPixelSize = 4;
        }

        const mode = SCANLINES_DATA.SCANLINES_MODES[scanlineMode];
        const type = SCANLINES_DATA.SCANLINES_TYPES[scanlineType];
        const alpha = this.map(scanlineOpacity, 0, 100, 0, 255);
        const matrix = type.matrix;

        // Convertir la couleur hex en RGB
        const { r, g, b } = this.getRGBFromHex(scanlineColor);
        
        gfx.blendMode(mode.blend); 
        gfx.noStroke();
        
        // Appliquer le pattern de scanlines
        const scanlinePixelSize = renderPixelSize / 4;
        
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                if (matrix[y][x] === 0) {
                    continue;
                }
                gfx.fill(r, g, b, alpha * matrix[y][x]);
                //gfx.rect(pixel.x * renderPixelSize + x * scanlinePixelSize, pixel.y * renderPixelSize + y * scanlinePixelSize, scanlinePixelSize, scanlinePixelSize);
                gfx.rect(pixel.x * renderPixelSize + x * scanlinePixelSize, pixel.y * renderPixelSize + y * scanlinePixelSize, scanlinePixelSize, scanlinePixelSize);
            }
        }
        
        gfx.blendMode(BLEND);
    }
    */

    applyOverlay(gfx, width, height) {
        const { overlayMode, overlayColor, overlayOpacity } = this.settings;
        
        const blendModes = [null, ADD, MULTIPLY, OVERLAY, SCREEN];
        
        if (overlayMode > 0 && overlayMode < blendModes.length) {
            gfx.blendMode(blendModes[overlayMode]);
            gfx.fill(overlayColor[0], overlayColor[1], overlayColor[2], overlayOpacity);
            gfx.rect(0, 0, width, height);
            gfx.blendMode(BLEND);
        }
    }
    
    exportImage() {
        if (!this.processedPixels.length) return null;
        
        const dimensions = this.getProcessedDimensions();
        const pixelSize = Math.max(1, this.settings.outputPixelSize);
        const finalPixelSize = pixelSize * (this.settings.scanlines ? 2 : 1);
        
        // == Temporary Gfx for export
        const exportGfx = createGraphics(
            dimensions.width * finalPixelSize,
            dimensions.height * finalPixelSize
        );
        
        exportGfx.noStroke();
        exportGfx.background(0);
        
        for (let pixel of this.processedPixels) {
          exportGfx.fill(pixel.color);
          exportGfx.rect(
                pixel.x * finalPixelSize,
                pixel.y * finalPixelSize,
                finalPixelSize,
                finalPixelSize
            );
            
            if (this.settings.scanlines) 
                this.applyScanlines(exportGfx, pixel, finalPixelSize);
        }

        if (this.settings.overlayMode > 0)
            this.applyOverlay(exportGfx, exportGfx.width, exportGfx.height);
        
        // == Save GFX data to return and kill useless Gfx
        const imageData = exportGfx.elt.toDataURL('image/png');
        exportGfx.remove();
        
        return imageData;
    }
    
    // == UTILS ===========================================================
    constrain(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    
    map(value, start1, stop1, start2, stop2) {
        return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
    }
    
    // == Accessors for UI component
    getCurrentPalette() {
        return this.currentPalette;
    }
    
    getProcessedPixelsCount() {
        return this.processedPixels.length;
    }

    getRGBFromHex(hex) {
        const r = parseInt(hex.substr(1, 2), 16);
        const g = parseInt(hex.substr(3, 2), 16);
        const b = parseInt(hex.substr(5, 2), 16);
        return { r, g, b };
    }
}