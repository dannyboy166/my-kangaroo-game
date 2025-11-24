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
        name: 'Outback',
        layers: [
            // Outback sky - lighter cyan gradient (game_background_2)
            {
                key: 'outback_sky',
                type: 'image',
                scrollFactor: 0,
                depth: -100,
                scaleMode: 'fit',
                y: 300 // Center of canvas
            },
            // Outback clouds - scrolling parallax layer (furthest = slowest)
            {
                key: 'outback_cloud',
                type: 'tileSprite',
                scrollSpeed: 0.1,
                depth: -85,
                tileScaleX: 0.4,
                tileScaleY: 0.4,
                y: 300 // Upper portion
            },
            // Distant trees - far background layer (closer than clouds)
            {
                key: 'parallax_distant_trees',
                type: 'tileSprite',
                scrollSpeed: 0.15,
                depth: -60,
                tileScaleX: 0.4,
                tileScaleY: 0.4,
                y: 250 // Moved up slightly
            },
            // Outback land as ground
            {
                key: 'outback_land',
                type: 'tileSprite',
                scrollSpeed: 1.0, // Scrolls at camera speed to match obstacles
                depth: -50,
                tileScaleX: 0.4,
                tileScaleY: 0.6, // Taller to reach bottom of screen
                y: 300 // Ground positioning
            }
        ]
    },

    beach: {
        id: 'beach',
        name: 'Beach',
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
                scrollSpeed: 0.1, // Furthest = slowest
                depth: -85,
                tileScaleX: 0.4,
                tileScaleY: 0.4,
                y: 300 // Upper portion
            },
            {
                key: 'beach_sea',
                type: 'tileSprite',
                scrollSpeed: 0.2, // Mid-distance
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
                tileScaleY: 0.6, // Same as outback - taller to reach bottom
                y: 300 // Same as outback positioning
            }
        ]
    }
};

// Default theme
export const DEFAULT_THEME = 'outback';
