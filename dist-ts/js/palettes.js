// Définition des palettes de couleurs
const PALETTES = {
    'CMYK': [
        [85, 255, 255], // bright CYAN
        [255, 85, 255], // bright MAGENTA
        [255, 255, 255], // WHITE
        [255, 255, 0], // YELLOW
        [0, 0, 0] // BLACK
    ],
    'CGA 4': [
        [252, 84, 252], // magenta
        [84, 252, 252], // cyan
        [255, 255, 255], // white
        [0, 0, 0] // black
    ],
    'CGA 16': [
        [0, 0, 0], [0, 0, 170], [0, 170, 0], [0, 170, 170],
        [170, 0, 0], [170, 0, 170], [170, 85, 0], [170, 170, 170],
        [85, 85, 85], [85, 85, 255], [85, 255, 85], [85, 255, 255],
        [255, 85, 85], [255, 85, 255], [255, 255, 85], [255, 255, 255]
    ],
    'Gameboy': [
        [15, 56, 15],
        [48, 98, 48],
        [139, 172, 15],
        [155, 188, 15]
    ],
    'Gameboy Light': [
        [40, 40, 40],
        [96, 96, 96],
        [160, 160, 160],
        [224, 224, 224]
    ],
    'Gameboy Pocket': [
        [33, 33, 33],
        [85, 85, 85],
        [153, 153, 153],
        [221, 221, 221]
    ],
    'NES': [
        [0, 0, 0], [252, 252, 252], [248, 248, 248], [188, 188, 188],
        [124, 124, 124], [164, 228, 252], [60, 188, 252], [0, 120, 248],
        [0, 0, 252], [184, 184, 248], [104, 136, 252], [0, 88, 248],
        [0, 0, 188], [216, 184, 248], [152, 120, 248], [104, 68, 252],
        [68, 40, 188], [248, 184, 248], [248, 120, 248], [216, 0, 204],
        [148, 0, 132], [248, 164, 192], [248, 88, 152], [228, 0, 88],
        [168, 0, 32], [240, 208, 176], [248, 120, 88], [248, 56, 0],
        [168, 16, 0], [252, 216, 120], [252, 184, 0], [172, 124, 0],
        [80, 48, 0], [216, 248, 120], [184, 248, 24], [0, 184, 0],
        [0, 120, 0], [184, 248, 184], [88, 216, 84], [0, 168, 68],
        [0, 104, 0], [184, 248, 216], [88, 248, 152], [0, 168, 68],
        [0, 88, 0], [0, 252, 252], [0, 232, 216], [0, 136, 136],
        [0, 64, 88], [248, 216, 248], [120, 120, 120]
    ],
    'C64': [
        [0, 0, 0], [255, 255, 255], [136, 0, 0], [170, 255, 238],
        [204, 68, 204], [0, 204, 85], [0, 0, 170], [238, 238, 119],
        [221, 136, 85], [102, 68, 0], [255, 119, 119], [51, 51, 51],
        [119, 119, 119], [170, 255, 102], [0, 136, 255], [187, 187, 187]
    ],
    'ZX Spectrum': [
        [0, 0, 0], [0, 0, 215], [215, 0, 0], [215, 0, 215],
        [0, 215, 0], [0, 215, 215], [215, 215, 0], [215, 215, 215],
        [0, 0, 255], [255, 0, 0], [255, 0, 255], [0, 255, 0],
        [0, 255, 255], [255, 255, 0], [255, 255, 255]
    ],
    'Grayscale 2': [
        [255, 255, 255], [0, 0, 0]
    ],
    'Grayscale 4': [
        [255, 255, 255], [170, 170, 170], [85, 85, 85], [0, 0, 0]
    ],
    'Grayscale 8': [
        [255, 255, 255], [221, 221, 221], [187, 187, 187], [153, 153, 153],
        [119, 119, 119], [85, 85, 85], [51, 51, 51], [0, 0, 0]
    ],
    'Grayscale 16': [
        [255, 255, 255], [239, 239, 239], [223, 223, 223], [207, 207, 207],
        [191, 191, 191], [175, 175, 175], [159, 159, 159], [143, 143, 143],
        [127, 127, 127], [111, 111, 111], [95, 95, 95], [79, 79, 79],
        [63, 63, 63], [47, 47, 47], [31, 31, 31], [0, 0, 0]
    ]
};
// Noms des palettes pour l'interface utilisateur
const PALETTE_NAMES = Object.keys(PALETTES);
// Fonction pour obtenir une palette par son nom
function getPalette(name) {
    return PALETTES[name] || null;
}
// Fonction pour convertir une couleur RGB en objet p5.js
function rgbToColor(rgb) {
    return color(rgb[0], rgb[1], rgb[2]);
}
// Fonction pour trouver la couleur la plus proche dans une palette
function findNearestColor(targetColor, palette) {
    let bestDistance = Infinity;
    let bestColor = palette[0];
    const tr = red(targetColor);
    const tg = green(targetColor);
    const tb = blue(targetColor);
    for (let i = 0; i < palette.length; i++) {
        const pr = palette[i][0];
        const pg = palette[i][1];
        const pb = palette[i][2];
        const distance = Math.sqrt(Math.pow(tr - pr, 2) +
            Math.pow(tg - pg, 2) +
            Math.pow(tb - pb, 2));
        if (distance < bestDistance) {
            bestDistance = distance;
            bestColor = palette[i];
        }
    }
    return color(bestColor[0], bestColor[1], bestColor[2]);
}
// Algorithme K-means pour quantification des couleurs
function kMeansQuantize(pixels, k, maxIterations = 16) {
    if (pixels.length === 0)
        return [];
    // Initialisation aléatoire des centres
    let centers = [];
    for (let i = 0; i < k; i++) {
        const randomPixel = pixels[Math.floor(Math.random() * pixels.length)];
        centers.push([red(randomPixel), green(randomPixel), blue(randomPixel)]);
    }
    for (let iter = 0; iter < maxIterations; iter++) {
        // Création des clusters
        let clusters = Array.from({ length: k }, () => []);
        // Assignation des pixels aux clusters
        for (let pixel of pixels) {
            let bestDistance = Infinity;
            let bestCluster = 0;
            const pr = red(pixel);
            const pg = green(pixel);
            const pb = blue(pixel);
            for (let i = 0; i < k; i++) {
                const distance = Math.sqrt(Math.pow(pr - centers[i][0], 2) +
                    Math.pow(pg - centers[i][1], 2) +
                    Math.pow(pb - centers[i][2], 2));
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestCluster = i;
                }
            }
            clusters[bestCluster].push([pr, pg, pb]);
        }
        // Mise à jour des centres
        let changed = false;
        for (let i = 0; i < k; i++) {
            if (clusters[i].length > 0) {
                let sumR = 0, sumG = 0, sumB = 0;
                for (let pixel of clusters[i]) {
                    sumR += pixel[0];
                    sumG += pixel[1];
                    sumB += pixel[2];
                }
                const newCenter = [
                    Math.round(sumR / clusters[i].length),
                    Math.round(sumG / clusters[i].length),
                    Math.round(sumB / clusters[i].length)
                ];
                if (centers[i][0] !== newCenter[0] ||
                    centers[i][1] !== newCenter[1] ||
                    centers[i][2] !== newCenter[2]) {
                    centers[i] = newCenter;
                    changed = true;
                }
            }
        }
        if (!changed)
            break;
    }
    return centers;
}
//# sourceMappingURL=palettes.js.map