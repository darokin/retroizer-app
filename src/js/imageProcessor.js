class ImageProcessor {
    constructor() {
        this.originalImage = null;
        this.base64Image = null;
        this.processedPixels = [];
        this.currentPalette = [];
        this.settings = this.getDefaultSettings();
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
            scanlineType: 0,
            scanlineOpacity: 50,
            overlayMode: 0,
            overlayColor: [255, 0, 255],
            overlayOpacity: 50
        };
    }
    
    setImage(img) {
        this.originalImage = img;
        if (img && img.loadPixels) {
            img.loadPixels(); // <-- Ajoute ceci
        }
        this.processImage();
    }
    
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        if (this.originalImage) {
            this.processImage();
        }
    }
    
    processImage() {
        if (!this.originalImage) return;
        
        // Ensure the current palette reflects the latest selection when using a custom palette
        // so that quantization uses the newly selected palette immediately
        if (this.settings.customPalette) {
            this.currentPalette = getPalette(this.settings.paletteType) || [];
        }
        
        // == Calculate size
        const pixelWidth = Math.floor(this.originalImage.width / this.settings.pixelSize);
        const pixelHeight = Math.floor(this.originalImage.height / this.settings.pixelSize);
        
        this.processedPixels = [];
        
        if (this.originalImage.loadPixels) {
            this.originalImage.loadPixels();
        }

        // == Pixel by pixel color deduction
        for (let y = 0; y < pixelHeight; y++) {
            for (let x = 0; x < pixelWidth; x++) {
                const pixelColor = this.getAverageColor(x, y, this.settings.pixelSize);
                const processedColor = this.applyEffects(pixelColor, x, y);
                this.processedPixels.push({x: x, y: y, color: processedColor});
            }
        }
        
        if (this.settings.colorLimit || this.settings.customPalette)
            this.updatePalette();
    }
    
    getAverageColor(pixelX, pixelY, size) {
        const img = this.originalImage;
        let r = 0, g = 0, b = 0, count = 0;
        
        const startX = pixelX * size;
        const startY = pixelY * size;
        
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
            // == Little tweak so that the processedPixels are from the originalImage
            // == Otherwise we could be limitating a custom palette....
            this.settings.colorLimit = false;
            this.processImage();
            this.settings.colorLimit = true;
            const pixelColors = this.processedPixels.map(p => p.color);
            this.currentPalette = kMeansQuantize(pixelColors, this.settings.colors);
        } else if (this.settings.customPalette) {
            this.currentPalette = getPalette(this.settings.paletteType) || [];
        } else {
            this.currentPalette = [];
        }
    }
    
    getProcessedDimensions() {
        if (!this.originalImage) return { width: 0, height: 0 };
        
        const { pixelSize } = this.settings;
        return {
            width: Math.floor(this.originalImage.width / pixelSize),
            height: Math.floor(this.originalImage.height / pixelSize)
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

    updateRenderGraphics(gfx, renderPixelSize = 8) {

        if (!this.processedPixels.length) return;

        gfx.noStroke();
        gfx.background(0);
       
        // == Pixels processing
        for (let pixel of this.processedPixels) {
            gfx.fill(pixel.color);
            gfx.rect(
                pixel.x * renderPixelSize, 
                pixel.y * renderPixelSize, 
                renderPixelSize, 
                renderPixelSize
            );
            
            // == Scanlines
            if (this.settings.scanlines)
                this.applyScanlines(gfx, pixel, renderPixelSize);
        }
        
        // == Overlay
        if (this.settings.overlayMode > 0)
            this.applyOverlay(gfx, gfx.width, gfx.height);
    }
    
    applyScanlines(gfx, pixel, renderPixelSize) {
        const { scanlineType, scanlineOpacity } = this.settings;
        const alpha = this.map(scanlineOpacity, 0, 100, 0, 255);
        
        switch (scanlineType) {
            case 0: // Black horizontal
                gfx.fill(0, alpha);
                break;
            case 1: // Cyan horizontal
                gfx.fill(0, 255, 255, alpha);
                break;
            case 2: // Green horizontal
                gfx.fill(0, 255, 0, alpha);
                break;
            case 3: // Red horizaontal
                gfx.fill(255, 0, 0, alpha);
                break;
        }
        
        gfx.rect(
            pixel.x * renderPixelSize,
            pixel.y * renderPixelSize + renderPixelSize / 2,
            renderPixelSize,
            renderPixelSize / 2
        );
    }
    
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
        
        // Créer un Gfx temporaire pour l'export
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
    
    // == UTILS
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
}