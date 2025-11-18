/**
 * Background Theme Configuration
 * Defines different background themes that players can choose
 *
 * How the parallax system works:
 * - Each layer is a TileSprite that repeats infinitely
 * - scrollSpeed determines parallax effect (0 = fixed, 1.0 = moves with camera)
 * - Lower scrollSpeed = appears further away (slower movement)
 * - scrollSpeed 1.0 = foreground layer (matches obstacle/ground movement)
 * - depth controls layering (lower = further back)
 * - Y positions are aligned to GROUND_Y (520px from GameConfig.js)
 */

export const BACKGROUND_THEMES = {
    outback: {
        id: 'outback',
        name: 'Australian Outback',
        layers: [
            // Beach sky - gradient background
            {
                key: 'beach_sky',
                type: 'image',
                scrollFactor: 0,
                depth: -100,
                scaleMode: 'fit',
                y: 300 // Center of canvas
            },
            // Beach clouds - scrolling parallax layer
            {
                key: 'beach_cloud',
                type: 'tileSprite',
                scrollSpeed: 0.15,
                depth: -85,
                tileScaleX: 0.4,
                tileScaleY: 0.4,
                y: 300 // Upper portion
            },
            // Beach land as ground - scaled up to fill bottom
            {
                key: 'beach_land',
                type: 'tileSprite',
                scrollSpeed: 1.0, // Scrolls at camera speed to match obstacles
                depth: -50,
                tileScaleX: 0.4,
                tileScaleY: 0.6, // Taller to reach bottom of screen
                y: 300 // Moved down to fill more vertical space
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
                y: 300 // Upper portion
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
                scrollSpeed: 1.0, // Scrolls at camera speed to match obstacles
                depth: -50,
                tileScaleX: 0.4,
                tileScaleY: 0.4,
                y: 440 // Moved up 40px to match kangaroo (was 480)
            }
        ]
    }
};

// Default theme
export const DEFAULT_THEME = 'outback';
