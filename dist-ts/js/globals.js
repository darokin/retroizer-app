// =================================================================
// == SCANLINES
export const SCANLINES_DATA = {
    MODES: {
        SCANLINES_MODE_DARKEN_HARD: "Darken hard",
        SCANLINES_MODE_DARKEN_SOFT: "Darken soft",
        SCANLINES_MODE_COLORIZE_VIVID: "Colorize vivid",
        SCANLINES_MODE_COLORIZE_SUBTLE: "Colorize subtle",
        SCANLINES_MODE_GLOW_STRIPE: "Glow stripe",
        SCANLINES_MODE_FADE_STRIPE: "Fade stripe",
        SCANLINES_MODE_NOISE_STRIPE: "Noise stripe"
    },
    TYPES: {
        SCANLINES_TYPE_HORIZ_HALF: "Horizontal",
        SCANLINES_TYPE_HORIZ_HALF_SOFT: "Horizontal soft",
        //SCANLINES_TYPE_HORIZ_FADE       : "1:3 Horizontal Fade",
        SCANLINES_TYPE_VERT_HALF: "Vertical",
        SCANLINES_TYPE_VERT_HALF_SOFT: "Vertical soft",
        //SCANLINES_TYPE_VERT_FADE        : "1:3 Vertical Fade",
        SCANLINES_TYPE_CROSS_HALF: "Cross",
        SCANLINES_TYPE_CHECKERS: "Checkers"
    },
    COLORS: {
        SCANLINES_COLOR_RED: "Red",
        SCANLINES_COLOR_GREEN: "Green",
        SCANLINES_COLOR_BLUE: "Blue",
        SCANLINES_COLOR_CYAN: "Cyan",
        SCANLINES_COLOR_YELLOW: "Yellow",
        SCANLINES_COLOR_PINK: "Pink"
    }
};
SCANLINES_DATA.SCANLINES_MODES = Object.values(SCANLINES_DATA.MODES);
SCANLINES_DATA.SCANLINES_TYPES = Object.values(SCANLINES_DATA.TYPES);
SCANLINES_DATA.SCANLINES_COLORS = Object.values(SCANLINES_DATA.COLORS);
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
//# sourceMappingURL=globals.js.map