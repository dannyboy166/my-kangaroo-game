/**
 * Game Configuration Constants
 * Central location for all game balance and configuration values
 *
 * ===== COORDINATE SYSTEM REFERENCE =====
 * Canvas: 800px wide x 600px tall
 * Ground Level (GROUND_Y): 500px (where kangaroo and obstacles stand)
 * Origin: Top-left corner (0, 0)
 * Y increases downward (standard canvas coordinates)
 *
 * ===== HOW THE SCROLLING WORKS =====
 * This game uses "infinite runner" camera-based scrolling:
 * 1. Kangaroo moves forward in world space (increasing X position)
 * 2. Camera follows kangaroo smoothly
 * 3. Obstacles spawn ahead in world space at fixed positions
 * 4. Everything moves relative to the camera, creating the illusion of running
 * 5. Background layers use parallax scrolling (slower = appears further away)
 *
 * This is the industry-standard approach used by games like:
 * - Temple Run, Subway Surfers, Jetpack Joyride, etc.
 */

export const GAME_CONFIG = {
    // Canvas dimensions
    CANVAS: {
        WIDTH: 800,
        HEIGHT: 600
    },

    // Game physics
    PHYSICS: {
        GRAVITY: 800,
        KANGAROO_GRAVITY: 900,
        JUMP_VELOCITY: -950,
        DOUBLE_JUMP_VELOCITY: -750
    },

    // Game speed and difficulty
    DIFFICULTY: {
        INITIAL_SPEED: 300,
        SPEED_INCREASE_INTERVAL: 50, // Every 50 score points
        SPEED_INCREASE_AMOUNT: 10,   // +10 speed increase
        MAX_SPEED: 1000,             // Max speed cap
        GROUND_Y: 500                // Ground level
    },

    // Obstacle spawning
    OBSTACLES: {
        MIN_SPAWN_DELAY: 1500,
        MAX_SPAWN_DELAY: 3500,
        MIN_SPAWN_DELAY_HARD: 1500, // After score 1000
        MAX_SPAWN_DELAY_HARD: 2500,
        GAP_CHANCE: 0.4, // 40% chance for gap obstacles
        GAP_SCORE_THRESHOLD: 1500,
        GAP_MIN_DELAY: 300,
        GAP_MAX_DELAY: 400,
        GAP_MIN_DELAY_HARD: 250, // After score 3000
        GAP_MAX_DELAY_HARD: 500,
        SIZE_VARIATION: 0.20, // ±20% size variation

        // TESTING: Using simple black box obstacles
        // All obstacle configuration simplified for testing phase
    },

    // Coin spawning
    COINS: {
        MIN_SPAWN_DELAY: 5000,  // Reduced frequency - most coins spawn with obstacles now
        MAX_SPAWN_DELAY: 8000,
        MIN_Y: 200,
        MAX_Y_OFFSET: 50, // From ground
        SCALE: 1,      // Increased from 0.3 for new 64x64 coin sprite
        VALUE: 5,
        SCORE_BONUS: 10
    },

    // Powerup system
    POWERUPS: {
        MIN_SPAWN_DELAY: 5000,   // Spawn every 5-20 seconds
        MAX_SPAWN_DELAY: 20000,
        MIN_Y: 200,
        MAX_Y_OFFSET: 50, // From ground
        SCALE: 2.0,      // TESTING: Increased to 2.0 for better visibility (32x32 sprites)
        DURATION: 10000, // 10 seconds

        // Powerup orb configuration
        ORBS: {
            COUNT: 3,
            RADIUS: 60,
            ROTATION_SPEED: 200, // degrees per second
            OFFSET_X: 10,
            OFFSET_Y: -50,

            // Orb properties by type
            PROPERTIES: {
                shield: { color: 0xFF69B4, radius: 20 },  // Pink to match heart
                magnet: { color: 0x00BFFF, radius: 18 },  // Blue (deep sky blue)
                double: { color: 0x00FF00, radius: 16 }   // Green (lime green)
            },

            // Starting angles for each powerup type
            START_ANGLES: {
                shield: 0,
                magnet: 120,
                double: 240
            }
        },

        // Magnet attraction
        MAGNET: {
            RANGE: 400,
            FORCE: 1000
        }
    },

    // Kangaroo configuration
    KANGAROO: {
        X: 50, // Start further left, runs to ~30% of screen before camera follows
        SCALE: 1.2,
        BODY_WIDTH: 70,
        BODY_HEIGHT: 48,
        BODY_OFFSET_X: 40,
        BODY_OFFSET_Y: 70
    },

    // Ground decoration
    GROUND: {
        WEED_MIN_DELAY: 800,
        WEED_MAX_DELAY: 1500,
        WEED_MIN_SCALE: 0.3,
        WEED_MAX_SCALE: 0.8,
        WEED_ALPHA_MIN: 0.6,
        WEED_ALPHA_MAX: 0.8,
        TEXTURE_DOTS: 20,
        GROUND_TEXTURE_SPAWN_CHANCE: 0.02
    },

    // Magpie AI behavior
    MAGPIE: {
        MIN_Y: 50,
        MAX_Y: 150,
        SCALE: 0.8,
        SWOOP_CHANCE_THRESHOLD: 1000, // Score before swooping enabled
        SWOOP_CHANCE: 0.5, // 50% chance to swoop
        BASE_SWOOP_DISTANCE: 150,
        SWOOP_SPEED_MULTIPLIER: 0.7,
        CLIMB_SPEED_MULTIPLIER: 0.7,
        MIN_DOWN_TIME: 100,
        DOWN_TIME_FACTOR: 500
    },

    // Running Emu behavior
    EMU: {
        SPEED_MULTIPLIER: 1.3, // 30% faster than normal obstacles
        SPAWN_X: 1350
    },

    // UI configuration
    UI: {
        SCORE_X: 20,
        SCORE_Y: 60,
        COIN_ICON_X: 30,
        COIN_ICON_Y: 30,
        COIN_ICON_SCALE: 0.5, // Increased from 0.17 for new 64x64 coin sprite
        COIN_TEXT_X: 70,
        INVENTORY_START_Y: 120,
        INVENTORY_SPACING: 40,
        POWERUP_BAR_X: 200,
        POWERUP_BAR_START_Y: 15,
        POWERUP_BAR_SPACING: 15
    },

    // Colors
    COLORS: {
        SKY_TOP: 0x39cef9,
        SKY_BOTTOM: 0x7dd9fc,
        GROUND: 0xfc8d15,
        SUN: 0xFFD700,
        CLOUD: 0xFFFFFF
    },

    // Asset spawn positions
    SPAWN: {
        OBSTACLE_X: 1200,
        COIN_X: 850,
        POWERUP_X: 850
    }
};
