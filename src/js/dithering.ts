// Déclarations globales pour p5.js
declare function color(r: number, g: number, b: number): any;
declare function red(c: any): number;
declare function green(c: any): number;
declare function blue(c: any): number;
declare function findNearestColor(color: any, palette: any[]): any;

// Matrices de Bayer pour le dithering ordonné
const BAYER_MATRICES = {
    'Bayer 2x2': [
        [0, 2],
        [3, 1]
    ],
    'Bayer 4x4': [
        [0, 8, 2, 10],
        [12, 4, 14, 6],
        [3, 11, 1, 9],
        [15, 7, 13, 5]
    ],
    'Bayer 8x8': [
        [0, 32, 8, 40, 2, 34, 10, 42],
        [48, 16, 56, 24, 50, 18, 58, 26],
        [12, 44, 4, 36, 14, 46, 6, 38],
        [60, 28, 52, 20, 62, 30, 54, 22],
        [3, 35, 11, 43, 1, 33, 9, 41],
        [51, 19, 59, 27, 49, 17, 57, 25],
        [15, 47, 7, 39, 13, 45, 5, 37],
        [63, 31, 55, 23, 61, 29, 53, 21]
    ]
};

const DITHERING_NAMES = Object.keys(BAYER_MATRICES);

// Fonction pour obtenir la valeur de Bayer à une position donnée
function getBayerValue(matrixName, x, y) {
    const matrix = BAYER_MATRICES[matrixName];
    if (!matrix) return 0;
    
    const size = matrix.length;

    return (matrix[y % size][x % size] / (size * size)) * 32;
}

// Application du dithering de Bayer
function applyBayerDithering(colorValue, matrixName, x, y) {
    const threshold = getBayerValue(matrixName, x, y);
    return colorValue + threshold;
}

// Dithering Floyd-Steinberg (diffusion d'erreur)
function applyFloydSteinbergDithering(imageData, width, height, palette) {
    const pixels = [...imageData];
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            
            const oldR = pixels[index];
            const oldG = pixels[index + 1];
            const oldB = pixels[index + 2];
            
            // Trouver la couleur la plus proche dans la palette
            const nearestColor = findNearestColor(color(oldR, oldG, oldB), palette);
            const newR = red(nearestColor);
            const newG = green(nearestColor);
            const newB = blue(nearestColor);
            
            pixels[index] = newR;
            pixels[index + 1] = newG;
            pixels[index + 2] = newB;
            
            // Calculer l'erreur
            const errorR = oldR - newR;
            const errorG = oldG - newG;
            const errorB = oldB - newB;
            
            // Diffuser l'erreur aux pixels voisins
            const neighbors = [
                [x + 1, y, 7/16],     // droite
                [x - 1, y + 1, 3/16], // bas-gauche
                [x, y + 1, 5/16],     // bas
                [x + 1, y + 1, 1/16]  // bas-droite
            ];
            
            for (let [nx, ny, weight] of neighbors) {
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    const nIndex = (ny * width + nx) * 4;
                    pixels[nIndex] = Math.max(0, Math.min(255, pixels[nIndex] + errorR * weight));
                    pixels[nIndex + 1] = Math.max(0, Math.min(255, pixels[nIndex + 1] + errorG * weight));
                    pixels[nIndex + 2] = Math.max(0, Math.min(255, pixels[nIndex + 2] + errorB * weight));
                }
            }
        }
    }
    
    return pixels;
}

// Conversion en niveaux de gris avec pondération
function toGrayscale(r, g, b) {
    return 0.299 * r + 0.587 * g + 0.114 * b;
}

// Application du dithering sur une couleur pour le mode grayscale
function applyGrayscaleDithering(grayValue, matrixName, x, y, noiseLevel = 0) {
    let value = grayValue;
    
    // Ajout de bruit si spécifié
    if (noiseLevel > 0) {
        value += (Math.random() - 0.5) * noiseLevel;
    }
    
    // Application du dithering Bayer
    if (matrixName) {
        value += getBayerValue(matrixName, x, y);
    }
    
    // Seuillage binaire pour le noir et blanc
    return value > 128 ? 255 : 0;
}

// Exporter les fonctions pour utilisation dans d'autres modules
export { getBayerValue, applyBayerDithering, applyFloydSteinbergDithering, toGrayscale, applyGrayscaleDithering };

// Exposer globalement pour compatibilité
(window as any).getBayerValue = getBayerValue;
(window as any).applyBayerDithering = applyBayerDithering;
(window as any).applyFloydSteinbergDithering = applyFloydSteinbergDithering;
(window as any).toGrayscale = toGrayscale;
(window as any).applyGrayscaleDithering = applyGrayscaleDithering;