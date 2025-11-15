/**
 * Performance Optimization Settings
 * Toggle these to improve game performance
 */

export const PERFORMANCE_CONFIG = {
    // Rendering optimizations
    RENDERING: {
        // Use WebGL for better performance (vs Canvas)
        USE_WEBGL: true,

        // Reduce render quality for better FPS (0.5 = half resolution, 1 = full)
        RENDER_SCALE: 1,

        // Limit frame rate (60 is standard, 30 for lower-end devices)
        TARGET_FPS: 60,

        // Enable anti-aliasing (looks better but slower)
        ANTIALIAS: true,

        // Round pixels for crisper graphics (slightly faster)
        ROUND_PIXELS: true
    },

    // Physics optimizations
    PHYSICS: {
        // Enable debug mode (TURN OFF FOR PRODUCTION - very slow!)
        DEBUG: false,

        // Physics simulation steps per frame (lower = faster, less accurate)
        STEPS_PER_FRAME: 1,

        // Enable collision box optimization
        USE_TREE: true
    },

    // Object pooling limits
    POOLING: {
        // Maximum active obstacles on screen
        MAX_OBSTACLES: 10,

        // Maximum active coins on screen
        MAX_COINS: 8,

        // Maximum active powerups on screen
        MAX_POWERUPS: 3,

        // Maximum ground decorations
        MAX_WEEDS: 15,
        MAX_GROUND_DOTS: 30
    },

    // Spawn rate throttling
    SPAWN_THROTTLING: {
        // Reduce particle effects
        REDUCE_PARTICLES: false,

        // Reduce ground decoration spawning
        REDUCE_DECORATIONS: false,

        // Simplify background (remove clouds/sun)
        SIMPLE_BACKGROUND: false
    },

    // Memory management
    MEMORY: {
        // Clear texture cache periodically
        CLEAR_TEXTURE_CACHE: false,

        // Destroy off-screen objects aggressively
        AGGRESSIVE_CLEANUP: true,

        // Clean up interval (milliseconds)
        CLEANUP_INTERVAL: 5000
    }
};

/**
 * Get recommended settings based on detected performance
 * @param {number} fps - Current FPS
 * @returns {Object} Recommended performance settings
 */
export function getOptimizedSettings(fps) {
    if (fps >= 50) {
        // High performance - use high quality settings
        return {
            renderScale: 1,
            antialias: true,
            maxObstacles: 10,
            maxCoins: 8,
            reduceEffects: false
        };
    } else if (fps >= 30) {
        // Medium performance - balanced settings
        return {
            renderScale: 1,
            antialias: false,
            maxObstacles: 8,
            maxCoins: 6,
            reduceEffects: false
        };
    } else {
        // Low performance - optimize for speed
        return {
            renderScale: 0.75,
            antialias: false,
            maxObstacles: 6,
            maxCoins: 4,
            reduceEffects: true
        };
    }
}
