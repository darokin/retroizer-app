// Variables globales
let imageProcessor;
let renderCanvas;
let logoImage;

// Paramètres de rendu
const RENDER_PIXEL_SIZE = 2;//8;

function preload() {
    // Vous pouvez charger des logos ou images de démarrage ici
    // logoImage = loadImage('assets/logo.png');
}

function setup() {
    // Nettoyer les canvas cachés existants
    //cleanupHiddenCanvases();
    
    // Créer le canvas principal avec la taille de la zone disponible
    const canvas = createCanvas(windowWidth - 260, windowHeight);
    canvas.parent('p5-container');
    
    // Initialiser le processeur d'images
    imageProcessor = new ImageProcessor();
    
    // Initialiser l'interface React
    if (window.initPixertUI) {
        window.initPixertUI(imageProcessor, updateRender);
    }
    
    // Configuration initiale
    background(12, 12, 12);
    noStroke();
    
    // Afficher le message de démarrage
    displayWelcomeMessage();
    
    console.log('Pixert initialized successfully');
    
    // Nettoyer les canvas cachés périodiquement
    //setInterval(cleanupHiddenCanvases, 5000); // Toutes les 5 secondes
}

function draw() {
    // Le rendu se fait principalement via updateRender()
    // draw() reste disponible pour d'autres animations si nécessaire
}

function updateRender() {
    background(12, 12, 12);

    if (imageProcessor.originalImage && imageProcessor.processedPixels.length > 0) {
        const dimensions = imageProcessor.getProcessedDimensions();
        const renderWidth = dimensions.width * RENDER_PIXEL_SIZE;
        const renderHeight = dimensions.height * RENDER_PIXEL_SIZE;

        // Détruire l'ancien canvas si la taille change
        if (renderCanvas && (renderCanvas.width !== renderWidth || renderCanvas.height !== renderHeight)) {
            renderCanvas.remove(); // Supprime l'ancien canvas p5
            renderCanvas = null;
        }

        // Créer un nouveau canvas si nécessaire
        if (!renderCanvas) {
            renderCanvas = createGraphics(renderWidth, renderHeight);
            console.log('New render canvas...');
        }

        imageProcessor.renderToCanvas(renderCanvas, RENDER_PIXEL_SIZE);
        drawRenderCanvas();

        displayImageInfo(dimensions, 5, 5);
    } else {
        displayWelcomeMessage();
    }

    if (logoImage) {
        image(logoImage, width - logoImage.width - 20, height - logoImage.height - 20);
    }
}

function drawRenderCanvas() {
    //console.log('drawRenderCanvas()');
    if (!renderCanvas) return;

    const dimensions = imageProcessor.getRenderCanvasPositionAndSize();

    //console.log('drawRenderCanvas dimensions [' + dimensions.width + ', ' + dimensions.height + ']');
    image(renderCanvas, dimensions.x, dimensions.y, dimensions.width, dimensions.height);
}

function displayWelcomeMessage() {
    fill(255, 255, 255, 180);
    textAlign(CENTER, CENTER);
    textSize(24);
    text('Pixert - Image Processing Tool', width/2, height/2 - 40);
    
    textSize(16);
    fill(255, 255, 0);
    text('Click "Load Image" to start processing', width/2, height/2);
    
    textSize(12);
    fill(255, 255, 255, 120);
    text('Features: Pixelization • Dithering • Color Palettes • Effects', width/2, height/2 + 30);
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
    // Redimensionner le canvas principal à la taille de la zone disponible
    resizeCanvas(windowWidth - 260, windowHeight);
    
    // Nettoyer les canvas cachés avant de mettre à jour
    //cleanupHiddenCanvases();
    
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

// Gestion des erreurs globales
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Global error:', {
        message: msg,
        source: url,
        line: lineNo,
        column: columnNo,
        error: error
    });
    
    // Afficher un message d'erreur à l'utilisateur
    if (gui) {
        gui.updateStatus('An error occurred. Check console for details.');
    }
    
    return false;
};

// Fonction pour nettoyer les canvas cachés
// function cleanupHiddenCanvases() {
//     // Trouver tous les canvas avec display: none
//     const hiddenCanvases = document.querySelectorAll('canvas[style*="display: none"]');
    
//     console.log(`Nettoyage de ${hiddenCanvases.length} canvas cachés`);
    
//     // Supprimer chaque canvas caché
//     hiddenCanvases.forEach(canvas => {
//         if (canvas.parentNode) {
//             canvas.parentNode.removeChild(canvas);
//         }
//     });
// }

// Nettoyage à la fermeture
window.addEventListener('beforeunload', function() {
    if (gui) {
        gui.destroy();
    }
    
    // Nettoyer les canvas cachés avant de fermer
    //cleanupHiddenCanvases();
});