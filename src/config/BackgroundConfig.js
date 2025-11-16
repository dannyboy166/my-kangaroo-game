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
                tileScaleX: 1.0,    // No scaling! 1024x512 POT
                tileScaleY: 1.0,
                y: 400  // Moved down
            },
            {
                key: 'parallax_distant_clouds1',
                type: 'tileSprite',
                scrollSpeed: 0.15,
                depth: -85,
                tileScaleX: 1.0,    // No scaling! 1024x512 POT
                tileScaleY: 1.0,
                y: 350  // Moved down
            },
            {
                key: 'parallax_clouds',
                type: 'tileSprite',
                scrollSpeed: 0.25,
                depth: -80,
                tileScaleX: 1.0,    // No scaling! 1024x512 POT
                tileScaleY: 1.0,
                y: 300  // Moved down
            },
            {
                key: 'parallax_trees_bushes',
                type: 'tileSprite',
                scrollSpeed: 0.6,
                depth: -50,
                tileScaleX: 1.0,    // No scaling! 1024x512 POT
                tileScaleY: 1.0,
                y: 400  // Middle-ground (trees sit above ground)
            },
            {
                key: 'parallax_ground',
                type: 'tileSprite',
                scrollSpeed: 1.0, // Matches camera scroll rate for perfect obstacle alignment
                depth: -20,
                tileScaleX: 1.0,  // No scaling! 1024x512 POT
                tileScaleY: 1.0,
                y: 480 // Moved up from 520
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
                y: 480 // Aligns with GROUND_Y (480px from GameConfig)
            }
        ]
    }
};

// Default theme
export const DEFAULT_THEME = 'outback';
