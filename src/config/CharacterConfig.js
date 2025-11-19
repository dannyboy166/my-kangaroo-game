/**
 * Character Animation Configuration
 *
 * This file defines the configuration for all animated characters in the game.
 * Use this as a template when adding new animals from the same asset creator.
 *
 * FOLDER STRUCTURE FOR NEW ANIMALS:
 * assets/characters/
 *   └── [animal-name]/
 *       ├── brown/  (or other color variant)
 *       │   ├── __[prefix]_idle_000.png
 *       │   ├── __[prefix]_idle_001.png
 *       │   ├── __[prefix]_moving_000.png
 *       │   └── ... (all animation frames)
 *       └── grey/   (optional second color)
 *
 * HOW TO ADD A NEW ANIMAL:
 * 1. Create folder: assets/characters/[animal-name]/
 * 2. Copy animation frames into color subfolders (brown, grey, etc.)
 * 3. Add configuration below following the kangaroo template
 * 4. Load in MenuScene.preload() using loadCharacterFrames()
 * 5. Create animations in MenuScene.create() using createCharacterAnimations()
 */

export const CHARACTER_CONFIGS = {
    /**
     * KANGAROO (Player Character)
     * Professional animated character from asset pack
     */
    kangaroo: {
        // Character metadata
        name: 'Kangaroo',
        type: 'player', // 'player' or 'obstacle'

        // Available color variants
        colors: ['brown', 'grey'],
        defaultColor: 'brown',

        // Base path to character frames
        basePath: 'assets/characters/kangaroo',

        // Animation configurations
        animations: {
            // Idle/standing animation
            idle: {
                prefix: '__red_kangaroo_no_joey_idle',
                frameCount: 20,
                frameRate: 12,
                repeat: -1 // Loop forever
            },

            // Running/moving animation (main gameplay animation)
            moving: {
                prefix: '__red_kangaroo_no_joey_moving',
                frameCount: 16,
                frameRate: 20,
                repeat: -1
            },

            // Jump animation
            jump: {
                prefix: '__red_kangaroo_no_joey_jump_from_idle',
                frameCount: 10,
                frameRate: 15,
                repeat: 0 // Play once
            },

            // Death animation
            die: {
                prefix: '__red_kangaroo_no_joey_die',
                frameCount: 5,
                frameRate: 10,
                repeat: 0
            }
        },

        // Sprite dimensions (original asset size before scaling)
        spriteWidth: 937,
        spriteHeight: 1083,

        // Physics body settings
        physics: {
            // Display size (1.2x bigger: 128 * 1.2 = 153.6)
            displayWidth: 154,
            displayHeight: 178, // Maintains aspect ratio (148 * 1.2)

            // Collision box (in scaled sprite coordinates)
            // Origin is (0.5, 1) = bottom-center anchor
            bodyWidth: 72,      // Tight hitbox width (60 * 1.2)
            bodyHeight: 75,     // Shorter box for forgiving gameplay (70 * 1.2)
            bodyOffsetX: 60,    // Center horizontally: (154 - 72) / 2
            bodyOffsetY: 65     // Position higher on sprite (45 * 1.2)
        }
    }

    /**
     * EMU (Actually Ostrich - looks similar!)
     * Professional animated obstacle
     */
    ,
    emu: {
        name: 'Emu',
        type: 'obstacle',
        colors: ['brown'],
        defaultColor: 'brown',
        basePath: 'assets/characters/emu',

        spriteWidth: 937,
        spriteHeight: 1083,

        animations: {
            idle: {
                prefix: '__ostrich_idle',
                frameCount: 20,
                frameRate: 12,
                repeat: -1
            },
            moving: {
                prefix: '__ostrich_run_neck_up',
                frameCount: 10,
                frameRate: 20,
                repeat: -1
            }
        },
        physics: {
            // Display size (1.5x bigger: 128 * 1.5 = 192)
            displayWidth: 192,
            displayHeight: 222, // Maintains aspect ratio (148 * 1.5)
            // Emu/Ostrich - tall bird with long neck
            bodyWidth: 135,     // Wide hitbox covers body (90 * 1.5)
            bodyHeight: 105,    // Tall hitbox covers neck and body (70 * 1.5)
            bodyOffsetX: 29,    // Center: (192 - 135) / 2
            bodyOffsetY: 21,    // Start from top of visible bird (14 * 1.5)
            groundOffset: 20    // Push down 30px to align feet with ground
        }
    }

    /**
     * CAMEL
     * Professional animated obstacle
     */
    ,
    camel: {
        name: 'Camel',
        type: 'obstacle',
        colors: ['brown'],
        defaultColor: 'brown',
        basePath: 'assets/characters/camel',

        spriteWidth: 937,
        spriteHeight: 1083,

        animations: {
            idle: {
                prefix: '__camel_one_hump_no_cover_idle',
                frameCount: 20,
                frameRate: 12,
                repeat: -1
            },
            moving: {
                prefix: '__camel_one_hump_no_cover_run',
                frameCount: 16,
                frameRate: 20,
                repeat: -1
            }
        },
        physics: {
            // Display size (1.5x bigger: 128 * 1.5 = 192)
            displayWidth: 192,
            displayHeight: 222, // Maintains aspect ratio (148 * 1.5)
            // Camel - large body with hump
            bodyWidth: 150,     // Wide hitbox covers full body (100 * 1.5)
            bodyHeight: 135,    // Covers hump to legs (90 * 1.5)
            bodyOffsetX: 21,    // Center: (192 - 150) / 2
            bodyOffsetY: 30,    // Start from top of hump (20 * 1.5)
            groundOffset: 25    // Push down 25px to align feet with ground
        }
    }

    /**
     * CROCODILE
     * Professional animated obstacle (uses sprite sheets, not individual frames)
     */
    ,
    croc: {
        name: 'Crocodile',
        type: 'obstacle',
        colors: ['green'],
        defaultColor: 'green',
        basePath: 'assets/characters/croc',
        useSpriteSheet: true,

        spriteWidth: 511,   // Crocodile uses different base dimensions
        spriteHeight: 1048,

        animations: {
            idle: {
                spriteSheet: '__standing_crocodile_bright_green_idle',
                frameWidth: 511,
                frameHeight: 1048,
                frameCount: 5,
                frameRate: 8,
                repeat: -1
            },
            moving: {
                spriteSheet: '__standing_crocodile_bright_green_walk_snapping_slow',
                frameWidth: 511,
                frameHeight: 262,
                frameCount: 15,
                frameRate: 12,
                repeat: -1
            }
        },
        physics: {
            // Display size (1.5x bigger: 128 * 1.5 = 192)
            displayWidth: 192,
            displayHeight: 222, // Maintains aspect ratio (148 * 1.5)
            // Crocodile - long low body (standing upright in this game)
            bodyWidth: 165,     // Very wide hitbox (110 * 1.5)
            bodyHeight: 45,     // Tall enough to cover head to tail (30 * 1.5)
            bodyOffsetX: 14,    // Center: (192 - 165) / 2
            bodyOffsetY: 45,    // Position on visible body (30 * 1.5)
            groundOffset: 10    // Push down 20px to align feet with ground
        }
    }
};

/**
 * Helper function to generate frame paths for Phaser atlas
 * @param {string} characterKey - Key from CHARACTER_CONFIGS
 * @param {string} animationKey - Animation name (idle, moving, jump, die)
 * @param {string} color - Color variant (brown, grey, etc.)
 * @returns {Array} Array of frame file paths
 */
export function getCharacterFramePaths(characterKey, animationKey, color = null) {
    const config = CHARACTER_CONFIGS[characterKey];
    if (!config) {
        console.error(`Character config not found: ${characterKey}`);
        return [];
    }

    const selectedColor = color || config.defaultColor;
    const animation = config.animations[animationKey];

    if (!animation) {
        console.error(`Animation not found: ${animationKey} for ${characterKey}`);
        return [];
    }

    const frames = [];
    for (let i = 0; i < animation.frameCount; i++) {
        const frameNum = String(i).padStart(3, '0');
        const path = `${config.basePath}/${selectedColor}/${animation.prefix}_${frameNum}.png`;
        frames.push(path);
    }

    return frames;
}

/**
 * Helper to generate animation key name
 * @param {string} characterKey - Character name
 * @param {string} animationKey - Animation name
 * @param {string} color - Color variant
 * @returns {string} Full animation key for Phaser
 */
export function getAnimationKey(characterKey, animationKey, color = null) {
    const config = CHARACTER_CONFIGS[characterKey];
    const selectedColor = color || config.defaultColor;
    return `${characterKey}_${selectedColor}_${animationKey}`;
}

/**
 * Calculate physics body dimensions and offsets in original sprite coordinates
 * Phaser requires physics body values in the original (unscaled) sprite coordinate system
 *
 * @param {string} characterKey - Character name from CHARACTER_CONFIGS
 * @returns {Object} Physics body configuration in original sprite coordinates
 */
export function getPhysicsBodyConfig(characterKey) {
    const config = CHARACTER_CONFIGS[characterKey];
    if (!config) {
        console.error(`Character config not found: ${characterKey}`);
        return null;
    }

    // Calculate scale factor
    const scale = config.physics.displayWidth / config.spriteWidth;

    // Convert collision box dimensions from scaled to original sprite coordinates
    const bodyWidth = config.physics.bodyWidth / scale;
    const bodyHeight = config.physics.bodyHeight / scale;
    const bodyOffsetX = config.physics.bodyOffsetX / scale;
    const bodyOffsetY = config.physics.bodyOffsetY / scale;

    return {
        scale,
        bodyWidth,
        bodyHeight,
        bodyOffsetX,
        bodyOffsetY,
        displayWidth: config.physics.displayWidth,
        displayHeight: config.physics.displayHeight
    };
}

export default CHARACTER_CONFIGS;
