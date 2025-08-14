class ImageProcessor {
    constructor() {
        this.originalImage = null;
        this.base64Image = null;
        this.processedPixels = [];
        this.currentPalette = [];
        this.settings = this.getDefaultSettings();
    }
    
    getDefaultSettings() {
        return {
            pixelSize: 1,
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
        
        const { pixelSize } = this.settings;

        // Ensure the current palette reflects the latest selection when using a custom palette
        // so that quantization uses the newly selected palette immediately
        if (this.settings.customPalette) {
            this.currentPalette = getPalette(this.settings.paletteType) || [];
        }
        const img = this.originalImage;
        
        // Calculer les dimensions en pixels
        const pixelWidth = Math.floor(img.width / pixelSize);
        const pixelHeight = Math.floor(img.height / pixelSize);
        
        this.processedPixels = [];
        
        if (this.originalImage.loadPixels) {
            this.originalImage.loadPixels();
        }

        // Traitement par blocs de pixels
        for (let y = 0; y < pixelHeight; y++) {
            for (let x = 0; x < pixelWidth; x++) {
                const pixelColor = this.getAverageColor(x, y, pixelSize);
                const processedColor = this.applyEffects(pixelColor, x, y);
                this.processedPixels.push({x: x, y: y, color: processedColor});
            }
        }
        
        // Mettre à jour la palette si nécessaire
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
        
        // Luminosité
        if (this.settings.brightness !== 0) {
            r = this.constrain(r + this.settings.brightness, 0, 255);
            g = this.constrain(g + this.settings.brightness, 0, 255);
            b = this.constrain(b + this.settings.brightness, 0, 255);
        }
        
        // Contraste
        if (this.settings.contrast !== 0) {
            const factor = (259 * (this.settings.contrast + 255)) / (255 * (259 - this.settings.contrast));
            r = this.constrain(factor * (r - 128) + 128, 0, 255);
            g = this.constrain(factor * (g - 128) + 128, 0, 255);
            b = this.constrain(factor * (b - 128) + 128, 0, 255);
        }
        
        // Correction gamma
        if (this.settings.gamma !== 0) {
            const gammaCorrection = 1.0 / this.map(this.settings.gamma, -10, 10, 0.01, 1.99);
            r = Math.floor(255 * Math.pow(r / 255, gammaCorrection));
            g = Math.floor(255 * Math.pow(g / 255, gammaCorrection));
            b = Math.floor(255 * Math.pow(b / 255, gammaCorrection));
        }
        
        // Niveaux de gris
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
            // Dithering avec palette de couleurs
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
        
        // Application de la palette
        if ((this.settings.colorLimit || this.settings.customPalette) && this.currentPalette.length > 0) {
            finalColor = findNearestColor(finalColor, this.currentPalette);
        }
        
        return finalColor;
    }
    
    updatePalette() {
        if (this.settings.colorLimit) {
            // Génération automatique de palette avec K-means
            const pixelColors = this.processedPixels.map(p => p.color);
            this.currentPalette = kMeansQuantize(pixelColors, this.settings.colors);
        } else if (this.settings.customPalette) {
            // Utilisation d'une palette prédéfinie
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

    /*
    getCanvasDimensions() {
        if (!this.originalImage) return { width: 0, height: 0 };
        return {
            width: width,
            height: height
        };
         // == calculer dimensions optimales
        const renderWidth = windowWidth;// - 260; // Fixed sidebar width
        const renderHeight = windowHeight;
        const ratioW = renderWidth / this.originalImage.width;//settings.imageWidth;
        const ratioH = renderHeight / this.originalImage.height;
        let maxRatio;
        if (ratioW > ratioH)
            maxRatio = ratioH;
        else
            maxRatio = ratioW;
        console.log("windowWidth [" + windowWidth + "] windowHeight [" + windowHeight + "] renderZone  [" + renderWidth + " , " + renderHeight + "]  render image [" + this.originalImage.width + " , " + this.originalImage.height + "]  ratioW='"+ratioW+"' ratioH'"+ratioH+"'");
        //renderImgWidth = floor(maxRatio * renderImage.width);
        //renderImgHeight = floor(maxRatio * renderImage.height);
        return {
            width: floor(maxRatio * this.originalImage.width),
            height: floor(maxRatio * this.originalImage.height)
        };
    }
    */
    getRenderCanvasPositionAndSize() {
        if (!this.originalImage) return { width: 0, height: 0 };

         // == calculer dimensions optimales
         const ratioW = width / this.originalImage.width;//settings.imageWidth;
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
         //console.log("windowWidth [" + width + "] windowHeight [" + height + "] render image [" + this.originalImage.width + " , " + this.originalImage.height + "]  ratioW='"+ratioW+"' ratioH'"+ratioH+"'");
         //renderImgWidth = floor(maxRatio * renderImage.width);
         //renderImgHeight = floor(maxRatio * renderImage.height);
         return {
            x: _x,
            y: _y,
            width: _w,
            height: _h 
         };

    }
    

    renderToCanvas(canvas, renderPixelSize = 8) {

        if (!this.processedPixels.length) return;
        
        const dimensions = this.getProcessedDimensions();
        const canvasWidth = dimensions.width * renderPixelSize;
        const canvasHeight = dimensions.height * renderPixelSize;
        
        canvas.noStroke();
        canvas.background(0);
        
        /*
        //const offset = window.getSidebarOffset ? window.getSidebarOffset() : 260;
        //document.getElementById('p5-container').style.left = offset + 'px';
        resizeCanvas(windowWidth - offset, windowHeight);
        */

        /*
        //const dimensions = this.getCanvasDimensions();
        const canvasWidth = canvas.width;//dimensions.width;// * renderPixelSize;
        const canvasHeight = canvas.height;//dimensions.height;// * renderPixelSize;
        
        // const offset = window.getSidebarOffset ? window.getSidebarOffset() : 260;
        // document.getElementById('p5-container').style.left = offset + 'px';
        // resizeCanvas(canvasWidth, canvasHeight);

        
        
        console.log('render to pgraphics. GO [' + canvasWidth + ', ' + canvasHeight + '] in canvas [' + canvas.width + ', ' + canvas.height + '] global widht and height [' + width + ', ' + height + ']');

        // Debug 
        canvas.fill(255, 0, 0);
        canvas.rect(0, 0, canvasWidth, canvasHeight);
        canvas.fill(0, 255, 0);
        canvas.rect(40, 40, canvasWidth-80, canvasHeight-80);
        */
        // Rendu des pixels
        for (let pixel of this.processedPixels) {
            canvas.fill(pixel.color);
            //console.log('FILL [' + (pixel.x * renderPixelSize) + ', ' + (pixel.y * renderPixelSize) + '] whit ' + pixel.color);
            canvas.rect(
                pixel.x * renderPixelSize, 
                pixel.y * renderPixelSize, 
                renderPixelSize, 
                renderPixelSize
            );
            
            // Scanlines
            if (this.settings.scanlines) {
                this.applyScanlines(canvas, pixel, renderPixelSize);
            }
        }
        
        drawRenderCanvas()
        // Overlay
        if (this.settings.overlayMode > 0) {
            this.applyOverlay(canvas, canvasWidth, canvasHeight);
        }
    }
    
    applyScanlines(canvas, pixel, renderPixelSize) {
        const { scanlineType, scanlineOpacity } = this.settings;
        const alpha = this.map(scanlineOpacity, 0, 100, 0, 255);
        
        switch (scanlineType) {
            case 0: // Black horizontal
                canvas.fill(0, alpha);
                break;
            case 1: // Cyan horizontal
                canvas.fill(0, 255, 255, alpha);
                break;
            case 2: // Green horizontal
                canvas.fill(0, 255, 0, alpha);
                break;
        }
        
        canvas.rect(
            pixel.x * renderPixelSize,
            pixel.y * renderPixelSize + renderPixelSize / 2,
            renderPixelSize,
            renderPixelSize / 2
        );
    }
    
    applyOverlay(canvas, width, height) {
        const { overlayMode, overlayColor, overlayOpacity } = this.settings;
        
        // Modes de mélange p5.js
        const blendModes = [null, ADD, MULTIPLY, OVERLAY, SCREEN];
        
        if (overlayMode > 0 && overlayMode < blendModes.length) {
            canvas.blendMode(blendModes[overlayMode]);
            canvas.fill(overlayColor[0], overlayColor[1], overlayColor[2], overlayOpacity);
            canvas.rect(0, 0, width, height);
            canvas.blendMode(BLEND);
        }
    }
    
    exportImage() {
        if (!this.processedPixels.length) return null;
        
        const dimensions = this.getProcessedDimensions();
        const pixelSize = Math.max(1, this.settings.outputPixelSize);
        const finalPixelSize = pixelSize * (this.settings.scanlines ? 2 : 1);
        
        // Créer un canvas temporaire pour l'export
        const exportCanvas = createGraphics(
            dimensions.width * finalPixelSize,
            dimensions.height * finalPixelSize
        );
        
        exportCanvas.noStroke();
        exportCanvas.background(0);
        
        // Rendu des pixels
        for (let pixel of this.processedPixels) {
            exportCanvas.fill(pixel.color);
            exportCanvas.rect(
                pixel.x * finalPixelSize,
                pixel.y * finalPixelSize,
                finalPixelSize,
                finalPixelSize
            );
            
            // Scanlines pour l'export
            if (this.settings.scanlines) {
                this.applyScanlines(exportCanvas, pixel, finalPixelSize);
            }
        }
        
        // Overlay pour l'export
        if (this.settings.overlayMode > 0) {
            this.applyOverlay(
                exportCanvas, 
                dimensions.width * finalPixelSize,
                dimensions.height * finalPixelSize
            );
        }
        
        // Créer une copie de l'image avant de supprimer le canvas
        const imageData = exportCanvas.elt.toDataURL('image/png');
        
        // Supprimer le canvas temporaire
        exportCanvas.remove();
        
        return imageData;
    }
    
    // Fonctions utilitaires
    constrain(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    
    map(value, start1, stop1, start2, stop2) {
        return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
    }
    
    getCurrentPalette() {
        return this.currentPalette;
    }
    
    getProcessedPixelsCount() {
        return this.processedPixels.length;
    }
}