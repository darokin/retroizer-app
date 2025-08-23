// UIBridge is exposed globally, no need to import
// import UIBridge from './UIBridge';

// == Global variables
let imageProcessor;
let renderGfx;
let logoImage;

function preload() {
    // logoImage = loadImage('assets/logo.png');
}

function setup() {
    
    // == Canvas init 
    //  We don't use windowWidth and windowHeight to create the canvasbecause p5js is initialized BEFORE the window 
    const canvasWidth = APP_CONFIG.WINDOW.WIDTH - APP_CONFIG.SIDEBAR.WIDTH;
    const canvasHeight = APP_CONFIG.WINDOW.HEIGHT;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('p5-container');
    background(...APP_CONFIG.RENDER.BACKGROUND_COLOR);
    noStroke();
    
    // == Image processor init
    imageProcessor = new ImageProcessor();
    
    // == GUI init
    if (window.initPixertUI) {
        window.initPixertUI(imageProcessor, updateRender);
    }

    // == Drag & Drop setup
    setupDragAndDrop();

    displayWelcomeMessage();
}


function draw() {
    // == Rendering done via updateRender() (can still use draw to animate things)
}

function updateRender() {
    background(...APP_CONFIG.RENDER.BACKGROUND_COLOR);

    if (imageProcessor.originalImage && imageProcessor.processedPixels.length > 0) {

        const dimensions = imageProcessor.getProcessedDimensions();
        const renderWidth = dimensions.width * APP_CONFIG.RENDER.PIXEL_SIZE;
        const renderHeight = dimensions.height * APP_CONFIG.RENDER.PIXEL_SIZE;

        // == Destroy old GFX if size changes (loading new image)
        if (renderGfx && (renderGfx.width !== renderWidth || renderGfx.height !== renderHeight)) {
          renderGfx.remove();
          renderGfx = null;
        }

        // == Build GFX for rendering
        if (!renderGfx) 
            renderGfx = createGraphics(renderWidth, renderHeight);

        imageProcessor.updateRenderGraphics(renderGfx, APP_CONFIG.RENDER.PIXEL_SIZE);

        drawGfxToCanvas();
        displayImageInfo(dimensions, 5, 5);
    } else {
        displayWelcomeMessage();
    }

    if (logoImage) {
        image(logoImage, width - logoImage.width - 20, height - logoImage.height - 20);
    }
}

function drawGfxToCanvas() {
    const dimensions = imageProcessor.getRenderCanvasPositionAndSize();
    image(renderGfx, dimensions.x, dimensions.y, dimensions.width, dimensions.height);
}

function displayWelcomeMessage() {
    fill(...APP_CONFIG.UI.TEXT_COLOR, 180);
    textAlign(CENTER, CENTER);
    textSize(28);
    text('RETROIZER - Image Processing Tool', width/2, height/2 - 60);
    
    textSize(18);
    fill(...APP_CONFIG.UI.ACCENT_COLOR, 255);
    text('Click "Load Image" or drag & drop an image to start processing', width/2, height/2 - 20);
    
    textSize(14);
    fill(...APP_CONFIG.UI.SECONDARY_COLOR, 255);
    text('Features: Pixelization • Dithering • Color Palettes • Effects', width/2, height/2 + 20);
}

function displayImageInfo(dimensions, x, y) {
    fill(255, 255, 255, 200);
    textAlign(LEFT, TOP);
    textSize(12);
    
    const settings = imageProcessor.settings;
    const info = [
        `Resolution: ${dimensions.width} × ${dimensions.height} pixels`,
        `Pixel size: ${settings.pixelSize}x`,
        `Mode: ${getProcessingMode()}`,
        `Effects: ${getActiveEffects()}`
    ];
    
    for (let i = 0; i < info.length; i++) {
        text(info[i], x, y + (i * 15));
    }
}

function getProcessingMode() {
    const settings = imageProcessor.settings;
    if (settings.grayscale) return 'Grayscale';
    if (settings.colorLimit) return `Limited Colors (${settings.colors})`;
    if (settings.customPalette) return `${settings.paletteType} Palette`;
    return 'Full Color';
}

function getActiveEffects() {
    const settings = imageProcessor.settings;
    const effects = [];
    
    if (settings.dithering) effects.push(`${settings.ditheringType} Dithering`);
    if (settings.scanlines) effects.push('Scanlines');
    if (settings.overlayMode > 0) effects.push('Overlay');
    if (settings.brightness !== 0) effects.push('Brightness');
    if (settings.contrast !== 0) effects.push('Contrast');
    if (settings.gamma !== 0) effects.push('Gamma');
    
    return effects.length > 0 ? effects.join(', ') : 'None';
}

function windowResized() {
    // console.log("windowResized() start");

    // // Vérifier que les dimensions de la fenêtre sont valides
    // if (windowWidth <= 0 || windowHeight <= 0) {
    //     console.log("windowResized() called with invalid dimensions:", windowWidth, 'x', windowHeight);
    //     return;
    // }

    // if (imageProcessor == null) {
    //     console.log("windowResized() call finalSetup(", APP_CONFIG.WINDOW.WIDTH, ',', APP_CONFIG.WINDOW.HEIGHT);
    //     finalSetup(APP_CONFIG.WINDOW.WIDTH, APP_CONFIG.WINDOW.HEIGHT);
    //     return;
    // }

    // console.log("windowResized() call resizeCanvas(", (windowWidth - APP_CONFIG.SIDEBAR.WIDTH), ',', windowHeight);

    // // Redimensionner le canvas principal à la taille de la zone disponible
    resizeCanvas(windowWidth - APP_CONFIG.SIDEBAR.WIDTH, windowHeight);
    
    updateRender();
}

// Raccourcis clavier
function keyPressed() {
    switch (key) {
        case 's':
        case 'S':
            // Sauvegarder l'image
            if (imageProcessor.originalImage) {
                gui.saveImage();
            }
            break;
            
        case 'r':
        case 'R':
            // Recharger/rafraîchir
            updateRender();
            break;
            
        case 'g':
        case 'G':
            // Toggle grayscale
            imageProcessor.settings.grayscale = !imageProcessor.settings.grayscale;
            if (imageProcessor.settings.grayscale) {
                imageProcessor.settings.colorLimit = false;
                imageProcessor.settings.customPalette = false;
            }
            gui.refreshGUI();
            gui.updateProcessor();
            break;
            
        case 'd':
        case 'D':
            // Toggle dithering
            imageProcessor.settings.dithering = !imageProcessor.settings.dithering;
            gui.refreshGUI();
            gui.updateProcessor();
            break;
            
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
            // Changer la taille des pixels
            const pixelSize = parseInt(key);
            imageProcessor.settings.pixelSize = pixelSize;
            gui.refreshGUI();
            gui.updateProcessor();
            break;
            
        case 'h':
        case 'H':
            // Afficher/cacher l'aide
            showHelpDialog();
            break;
    }
}

function showHelpDialog() {
    const helpText = [
        'Pixert - Keyboard Shortcuts:',
        '',
        'S - Save image',
        'R - Refresh render',
        'G - Toggle grayscale',
        'D - Toggle dithering',
        '1-5 - Set pixel size',
        'H - Show this help',
        '',
        'Use the GUI panel on the left to access all features:'
        , '• Image loading and pixel size adjustment',
        '• Brightness, contrast, and gamma correction',
        '• Color limiting and palette selection',
        '• Dithering algorithms (Bayer matrices)',
        '• Visual effects (scanlines, overlays)',
        '• Export options'
    ].join('\n');
    
    alert(helpText);
}

// == ERROR handling
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Global error:', {
        message: msg,
        source: url,
        line: lineNo,
        column: columnNo,
        error: error
    });

    if (gui)
        gui.updateStatus('ERROR : ', msg);
    
    return false;
};

// Closing cleanup
window.addEventListener('beforeunload', function() {
    if (gui)
        gui.destroy();
});

// == Drag & Drop functionality
function setupDragAndDrop() {
    const canvas = document.querySelector('#p5-container canvas');
    if (!canvas) return;

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        canvas.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        canvas.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        canvas.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    canvas.addEventListener('drop', handleDrop, false);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    const canvas = document.querySelector('#p5-container canvas');
    if (canvas) {
        canvas.style.transition = 'all 0.3s ease';
        canvas.style.margin = '20px';
        canvas.style.borderRadius = '10px';
        canvas.style.border = '32px dashed rgb(238, 255, 0)';
        canvas.style.backgroundColor = 'rgba(76, 175, 80, 0.2)';
        canvas.style.boxShadow = '0 0 20px rgba(238, 255, 0, 0.5)';
    }
}

function unhighlight(e) {
    const canvas = document.querySelector('#p5-container canvas');
    if (canvas) {
        canvas.style.border = '';
        canvas.style.borderRadius = '';
        canvas.style.margin = '';
        canvas.style.backgroundColor = '';
        canvas.style.boxShadow = '';
        canvas.style.transition = '';
    }
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
        const file = files[0];
    
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
    
          reader.onload = function(event) {
            const imageData = event.target.result;
            UIBridge.call('processLoadedImage', imageData, file.name);
          };
    
          reader.onerror = function() {
            UIBridge.call('updateStatus', 'Error reading file');
            console.error('Error reading file');
          };
          reader.readAsDataURL(file);
        } else {
          UIBridge.call('updateStatus', `Unsupported file type: ${file.type}`);
        }
    }
}