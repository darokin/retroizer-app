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
    ],
    'Bayer 16x16': [
        [0, 191, 48, 239, 12, 203, 60, 251, 3, 194, 51, 242, 15, 206, 63, 254],
        [127, 64, 175, 112, 139, 76, 187, 124, 130, 67, 178, 115, 142, 79, 190, 127],
        [32, 223, 16, 207, 44, 235, 28, 219, 35, 226, 19, 210, 47, 238, 31, 222],
        [159, 96, 143, 80, 171, 108, 155, 92, 162, 99, 146, 83, 174, 111, 158, 95],
        [8, 199, 56, 247, 4, 195, 52, 243, 11, 202, 59, 250, 7, 198, 55, 246],
        [135, 72, 183, 120, 131, 68, 179, 116, 138, 75, 186, 123, 134, 71, 182, 119],
        [40, 231, 24, 215, 36, 227, 20, 211, 43, 234, 27, 218, 39, 230, 23, 214],
        [167, 104, 151, 88, 163, 100, 147, 84, 170, 107, 154, 91, 166, 103, 150, 87],
        [2, 193, 50, 241, 14, 205, 62, 253, 1, 192, 49, 240, 13, 204, 61, 252],
        [129, 66, 177, 114, 141, 78, 189, 126, 128, 65, 176, 113, 140, 77, 188, 125],
        [34, 225, 18, 209, 46, 237, 30, 221, 33, 224, 17, 208, 45, 236, 29, 220],
        [161, 98, 145, 82, 173, 110, 157, 94, 160, 97, 144, 81, 172, 109, 156, 93],
        [10, 201, 58, 249, 6, 197, 54, 245, 9, 200, 57, 248, 5, 196, 53, 244],
        [137, 74, 185, 122, 133, 70, 181, 118, 136, 73, 184, 121, 132, 69, 180, 117],
        [42, 233, 26, 217, 38, 229, 22, 213, 41, 232, 25, 216, 37, 228, 21, 212],
        [169, 106, 153, 90, 165, 102, 149, 86, 168, 105, 152, 89, 164, 101, 148, 85]
    ]
};


const DITHERING_NAMES = Object.keys(BAYER_MATRICES);

// Fonction pour obtenir la valeur de Bayer à une position donnée
function getBayerValue(matrixName, x, y) {
    const matrix = BAYER_MATRICES[matrixName];
    if (!matrix) return 0;
    
    const size = matrix.length;

    return (matrix[y % size][x % size] / (size * size));
}

// Dithering Floyd-Steinberg (diffusion d'erreur)
/*
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
*/

// Conversion en niveaux de gris avec pondération
function toGrayscale(r, g, b) {
    return 0.299 * r + 0.587 * g + 0.114 * b;
}

// Application du dithering sur une couleur pour le mode grayscale
function applyGrayscaleDithering(grayValue, matrixName, x, y) {
    let value = grayValue;
    
    // Application du dithering Bayer
    if (matrixName) {
        value += (getBayerValue(matrixName, x, y) * 128);
    }
    
    // Seuillage binaire pour le noir et blanc
    return value > 128 ? 255 : 0;
}