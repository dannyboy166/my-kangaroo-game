/**
 * Game Configuration Constants
 * Central location for all game balance and configuration values
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
        SPEED_INCREASE_INTERVAL: 50, // Score points
        SPEED_INCREASE_AMOUNT: 5,
        GROUND_Y: 450
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

        // Base sizes for each obstacle type
        BASE_SIZES: {
            rock: 0.8,
            spider_rock: 0.75,
            cactus: 0.75,
            log: 0.5,
            snake_log: 0.78,
            emu: 0.8,
            croc: 0.55,
            camel: 1.0,
            koala: 0.8
        },

        // Score thresholds for unlocking new obstacles
        UNLOCK_SCORES: {
            koala: 1000,
            emu: 2000,
            camel: 3000,
            croc: 4000
        },

        // Weighted spawn chances for each obstacle type
        WEIGHTS: {
            rock: 25,
            log: 25,
            cactus: 25,
            magpie: 25,
            koala: 20,
            emu: 15,
            camel: 10,
            croc: 10
        },

        // Variant spawn chances (e.g., spider_rock vs rock)
        VARIANT_CHANCE: 0.6 // 60% chance for variant
    },

    // Coin spawning
    COINS: {
        MIN_SPAWN_DELAY: 1750,
        MAX_SPAWN_DELAY: 3150,
        MIN_Y: 200,
        MAX_Y_OFFSET: 50, // From ground
        SCALE: 0.3,
        VALUE: 5,
        SCORE_BONUS: 10
    },

    // Powerup system
    POWERUPS: {
        MIN_SPAWN_DELAY: 16000,
        MAX_SPAWN_DELAY: 25000,
        MIN_Y: 200,
        MAX_Y_OFFSET: 50, // From ground
        SCALE: 0.3,
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
                shield: { color: 0x00FF00, radius: 20 },
                magnet: { color: 0xFF00FF, radius: 18 },
                double: { color: 0x00FFFF, radius: 16 }
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
        X: 150,
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
        COIN_ICON_SCALE: 0.17,
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
