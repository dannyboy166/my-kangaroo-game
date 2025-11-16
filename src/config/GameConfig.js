/**
 * Game Configuration Constants
 * Central location for all game balance and configuration values
 *
 * ===== COORDINATE SYSTEM REFERENCE =====
 * Canvas: 800px wide x 600px tall
 * Ground Level (GROUND_Y): 520px (where kangaroo and obstacles stand)
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
        SPEED_INCREASE_INTERVAL: 30, // Score points (was 50 - now faster!)
        SPEED_INCREASE_AMOUNT: 10,   // Speed increase (was 5 - now doubles!)
        MAX_SPEED: 500,              // Speed cap to keep game playable
        GROUND_Y: 520
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
            koala: 0.8,
            // Pixel Adventure obstacles (increased sizes)
            bee: 2.0,
            plant: 2.0,
            snail: 2.0,
            mushroom: 2.0,
            trunk: 1.5
        },

        // Collision box customization for each obstacle type
        // Format: { width: number, height: number, offsetX: number, offsetY: number }
        // These are sized to match ~80% of visible sprite content (fair hitboxes)
        // Sprite dimensions: rock(128x128), cactus(100x154), log(256x140), emu(128x128)
        //                    croc(256x128), camel(128x128), koala(128x256), magpie(128x128)
        // offsetX/offsetY are relative to sprite origin (0.5, 1) = bottom-center
        COLLISION_BOXES: {
            // rock: 128x128 @ scale 0.8 = 102x102 actual size
            rock: { width: 85, height: 85, offsetX: 20, offsetY: 2 },
            spider_rock: { width: 100, height: 80, offsetX: 10, offsetY: 40 },

            // cactus: 100x154 @ scale 0.75 = 75x115 actual size
            cactus: { width: 60, height: 100, offsetX: 20, offsetY: 0 },

            // log: 256x140 @ scale 0.5 = 128x70 actual size
            log: { width: 210, height: 100, offsetX: 9, offsetY: 15 },
            snake_log: { width: 190, height: 80, offsetX: 25, offsetY: 35 },

            // emu: 128x128 @ scale 0.8 = 102x102 actual size
            emu: { width: 80, height: 100, offsetX: 20, offsetY: 2 },

            // croc: 256x128 @ scale 0.55 = 141x70 actual size
            croc: { width: 240, height: 85, offsetX: 10, offsetY: 20 },

            // camel: 128x128 @ scale 1.0 = 128x128 actual size
            camel: { width: 100, height: 110, offsetX: 14, offsetY: 2 },

            // koala: 128x256 @ scale 0.8 = 102x205 actual size (tall sprite)
            koala: { width: 80, height: 200, offsetX: 30, offsetY: 40 },

            // magpie: 128x128 @ scale 0.8 = 102x102 actual size
            magpie: { width: 80, height: 70, offsetX: 11, offsetY: 10 },

            // Pixel Adventure obstacles @ scale 2.0 (large sprites)
            bee: { width: 100, height: 90, offsetX: 14, offsetY: 10 },
            plant: { width: 90, height: 120, offsetX: 19, offsetY: 5 },
            snail: { width: 110, height: 90, offsetX: 9, offsetY: 10 },
            mushroom: { width: 100, height: 100, offsetX: 14, offsetY: 4 },
            trunk: { width: 95, height: 110, offsetX: 16, offsetY: 2 }
        },

        // Score thresholds for unlocking new obstacles
        UNLOCK_SCORES: {
            koala: 1000,
            emu: 2000,
            camel: 3000,
            croc: 4000,
            // Pixel Adventure obstacles (TESTING - unlock early)
            bee: 0,        // Available from start
            plant: 0,      // Available from start
            snail: 0,      // Available from start
            mushroom: 0,   // Available from start
            trunk: 0       // Available from start
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
            croc: 10,
            // Pixel Adventure obstacles (DISABLED - not Australian themed)
            bee: 0,
            plant: 0,
            snail: 0,
            mushroom: 0,
            trunk: 0
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
