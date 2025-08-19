// Configuration globale
export const APP_CONFIG: any = {
    // Dimensions de la fenêtre principale
    WINDOW: {
        WIDTH: 1400,
        HEIGHT: 900
    },
    
    // Dimensions de la sidebar (panneau de contrôle)
    SIDEBAR: {
        WIDTH: 260
    },
    
    // Dimensions de la zone de rendu (canvas)
    CANVAS: {
        get WIDTH() { return APP_CONFIG.WINDOW.WIDTH - APP_CONFIG.SIDEBAR.WIDTH; },
        get HEIGHT() { return APP_CONFIG.WINDOW.HEIGHT; }
    },
    
    // Paramètres de rendu
    RENDER: {
        PIXEL_SIZE: 2,
        BACKGROUND_COLOR: [12, 12, 12]
    },
    
    // Paramètres d'interface
    UI: {
        TEXT_COLOR: [255, 255, 255],
        ACCENT_COLOR: [255, 255, 0],
        SECONDARY_COLOR: [200, 200, 200]
    }
};

// Rendre disponible globalement pour compatibilité
(window as any).APP_CONFIG = APP_CONFIG;
