// =================================================================
// == SCANLINES
const SCANLINES_DATA = {
    //const blendModes = [BLEND, ADD, MULTIPLY, OVERLAY, SCREEN];
    //blendModes ['source-over', 'lighter', 'multiply', 'overlay', 'screen']
    
    MODES: {
        SCANLINES_MODE_DARKEN_HARD      : {
            "id": 0,
            "name": "Darken hard",
            "description": "Contraste fort",
            "blend": 'multiply',
            "opacity": 20
        },
        SCANLINES_MODE_DARKEN_SOFT      : {
            "id": 1,
            "name": "Darken soft",
            "description": "Effet doux",
            "blend": 'overlay',
            "opacity": 15
        },
        SCANLINES_MODE_COLORIZE_VIVID   : {
            "id": 2,
            "name": "Colorize vivid",
            "description": "Lumineux sur zones sombres",
            "blend": 'overlay',
            "opacity": 12
        },
        SCANLINES_MODE_COLORIZE_SUBTLE  : {
            "id": 3,
            "name": "Colorize subtle",
            "description": "Doux sur zones claires",
            "blend": 'multiply',
            "opacity": 10
        },
        SCANLINES_MODE_FADE_STRIPE      : {
            "id": 4,
            "name": "Fade stripe",
            "description": "Effet diffus, peu contrasté",
            "blend": 'screen',
            "opacity": 6
        },
        SCANLINES_MODE_GLOW_STRIPE      : {
            "id": 5,
            "name": "Glow stripe",
            "description": "Effet néon / synthwave",
            "blend": 'lighter',
            "opacity": 8
        },
        SCANLINES_MODE_NOISE_STRIPE     : {
            "id": 6,
            "name": "Noise stripe",
            "description": "Opacité aléatoire",
            "blend": 'overlay',
            "opacity": 10
        }
    },
    TYPES: {
        SCANLINES_TYPE_HORIZ_HALF       : {
            "id": 0,
            "name": "Horizontal",
            "description": "2 lignes sur 4 horizontales",
            "matrix": [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [1, 1, 1, 1]
            ]
        },
        SCANLINES_TYPE_HORIZ_HALF_SOFT  : {
            "id": 1,
            "name": "Horizontal soft",
            "description": "2 lignes horizontales, opacité dégressive",
            "matrix": [
                [0, 0, 0, 0],
                [0.2, 0.2, 0.2, 0.2],
                [0.6, 0.6, 0.6, 0.6],
                [1, 1, 1, 1]
            ]
        },
        SCANLINES_TYPE_VERT_HALF        : {
            "id": 2,
            "name": "Vertical",
            "description": "2 lignes sur 4 verticales",
            "matrix": [
                [0, 0, 1, 1],
                [0, 0, 1, 1],
                [0, 0, 1, 1],
                [0, 0, 1, 1]
            ]
        },
        SCANLINES_TYPE_VERT_HALF_SOFT   : {
            "id": 3,
            "name": "Vertical soft",
            "description": "2 lignes verticales, opacité dégressive",
            "matrix": [
                [0, 0.2, 0.6, 1],
                [0, 0.2, 0.6, 1],
                [0, 0.2, 0.6, 1],
                [0, 0.2, 0.6, 1]
            ]
        },
        SCANLINES_TYPE_CROSS_HALF       : {
            "id": 4,
            "name": "Cross",
            "description": "Croisement horizontal + vertical",
            "matrix": [
                [1, 1, 1, 1],
                [1, 0, 0, 1],
                [1, 0, 0, 1],
                [1, 1, 1, 1]
            ]
        },
        SCANLINES_TYPE_CHECKERS         : {
            "id": 5,
            "name": "Checkers",
            "description": "Motif damier (1 sur 2 en X et Y)",
            "matrix": [
                [0, 0, 1, 1],
                [0, 0, 1, 1],
                [1, 1, 0, 0],
                [1, 1, 0, 0]
            ]
        }
    },
    COLORS: {
        SCANLINES_COLOR_RED             : {
            "id": 0,
            "name": "Red",
            "color": "#ff0000"
        },
        SCANLINES_COLOR_GREEN           : {
            "id": 1,
            "name": "Green",
            "color": "#00ff00"
        },
        SCANLINES_COLOR_BLUE            : {
            "id": 2,
            "name": "Blue",
            "color": "#0000ff"
        },
        SCANLINES_COLOR_CYAN            : {
            "id": 3,
            "name": "Cyan",
            "color": "#00ffff"
        },
        SCANLINES_COLOR_YELLOW          : {
            "id": 4,
            "name": "Yellow",
            "color": "#ffff00"
        },
        SCANLINES_COLOR_PINK            : {
            "id": 5,
            "name": "Pink",
            "color": "#ff00ff"
        }
    }
};

SCANLINES_DATA.SCANLINES_MODES = Object.values(SCANLINES_DATA.MODES);
SCANLINES_DATA.SCANLINES_TYPES = Object.values(SCANLINES_DATA.TYPES);
SCANLINES_DATA.SCANLINES_COLORS = Object.values(SCANLINES_DATA.COLORS);

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SCANLINES_DATA;
}

// Exposer en global pour les scripts non-modules
// if (typeof window !== 'undefined') {
//     window.SCANLINES_DATA = SCANLINES_DATA;
// }

// ┌────────────────────────────┬────────────────────────────────────────────┐
// │ TYPE                       │ DESCRIPTION                                │
// ├────────────────────────────┼────────────────────────────────────────────┤
// │ 1:2 Horizontal             │ 2 lignes sur 4 horizontales                │
// │ 1:2 Horizontal Soft        │ 2 lignes horizontales, opacité dégressive  │
// │ 1:2 Vertical               │ 2 lignes sur 4 verticales                  │
// │ 1:2 Vertical Soft          │ 2 lignes verticales, opacité dégressive    │
// │ 1:3 Horizontal Fade        │ 1 ligne sur 3 avec dégradé (pixels 6x6)    │
// │ Full Horizontal Band       │ Bande pleine horizontale                   │
// │ Full Vertical Band         │ Bande pleine verticale                     │
// │ Grid Cross                 │ Croisement horizontal + vertical           │
// │ Diagonal Slash             │ Scanlines en diagonale                     │
// │ Checkerboard               │ Motif damier (1 sur 2 en X et Y)           │
// └────────────────────────────┴────────────────────────────────────────────┘

// ┌─────────────────────┬────────────┬─────────┬──────────────────────────────┬──────────────┐
// │ MODE                │ BLEND      │ COULEUR │ DESCRIPTION                  │ OPACITÉ PAR D│
// ├─────────────────────┼────────────┼─────────┼──────────────────────────────┼──────────────┤
// │ DARKEN HARD         │ Multiply   │ Noir    │ Contraste fort               │ 20%          │
// │ DARKEN SOFT         │ Overlay    │ Noir    │ Effet doux                   │ 15%          │
// │ COLORIZE VIVID      │ Overlay    │ Couleur │ Lumineux sur zones sombres   │ 12%          │
// │ COLORIZE SUBTLE     │ Multiply   │ Couleur │ Doux sur zones claires       │ 10%          │
// │ GLOW STRIPE         │ Add        │ Couleur │ Effet néon / synthwave       │ 8%           │
// │ FADE STRIPE         │ Screen     │ Couleur │ Effet diffus, peu contrasté  │ 6%           │
// │ NOISE STRIPE        │ Overlay    │ Couleur │ Opacité aléatoire            │ 10% ±5%      │
// │ STATIC STRIPE       │ Blend      │ Noir    │ Scanline simple              │ 10%          │
// └─────────────────────┴────────────┴─────────┴──────────────────────────────┴──────────────┘
