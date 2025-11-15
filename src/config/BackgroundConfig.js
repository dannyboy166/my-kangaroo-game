/**
 * Background Theme Configuration
 * Defines different background themes that players can choose
 */

export const BACKGROUND_THEMES = {
    outback: {
        id: 'outback',
        name: 'Australian Outback',
        layers: [
            {
                key: 'parallax_background',
                type: 'image',
                scrollFactor: 0,
                depth: -100,
                scaleMode: 'fit' // Fill canvas
            },
            {
                key: 'parallax_distant_clouds',
                type: 'tileSprite',
                scrollSpeed: 0.1,
                depth: -90,
                tileScaleX: 0.5,
                tileScaleY: 0.5
            },
            {
                key: 'parallax_distant_clouds1',
                type: 'tileSprite',
                scrollSpeed: 0.15,
                depth: -85,
                tileScaleX: 0.5,
                tileScaleY: 0.5
            },
            {
                key: 'parallax_clouds',
                type: 'tileSprite',
                scrollSpeed: 0.25,
                depth: -80,
                tileScaleX: 0.5,
                tileScaleY: 0.5
            },
            {
                key: 'parallax_trees_bushes',
                type: 'tileSprite',
                scrollSpeed: 0.6,
                depth: -50,
                tileScaleX: 0.4,
                tileScaleY: 0.4
            }
        ]
    },

    beach: {
        id: 'beach',
        name: 'Beach Paradise',
        layers: [
            {
                key: 'beach_sky',
                type: 'image',
                scrollFactor: 0,
                depth: -100,
                scaleMode: 'fit',
                y: 300 // Center of canvas
            },
            {
                key: 'beach_cloud',
                type: 'tileSprite',
                scrollSpeed: 0.15,
                depth: -85,
                tileScaleX: 0.4,
                tileScaleY: 0.4,
                y: 200 // Upper portion
            },
            {
                key: 'beach_sea',
                type: 'tileSprite',
                scrollSpeed: 0.3,
                depth: -70,
                tileScaleX: 0.4,
                tileScaleY: 0.4,
                y: 400 // Move higher so ocean doesn't cover ground
            },
            {
                key: 'beach_land',
                type: 'tileSprite',
                scrollSpeed: 1.0, // Move at camera speed to match obstacles
                depth: -50,
                tileScaleX: 0.4,
                tileScaleY: 0.4,
                y: 475 // Position higher so sandy part aligns with ground at y=450
            }
        ]
    }
};

// Default theme
export const DEFAULT_THEME = 'outback';
