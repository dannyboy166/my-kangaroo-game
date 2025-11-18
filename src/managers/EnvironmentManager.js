import { GAME_CONFIG } from '../config/GameConfig.js';
import { BACKGROUND_THEMES } from '../config/BackgroundConfig.js';
import GameDataManager from './GameDataManager.js';

/**
 * EnvironmentManager
 * Handles background rendering with TileSprite for infinite parallax scrolling
 * Supports multiple background themes (Outback, Beach)
 *
 * ===== HOW PARALLAX SCROLLING WORKS =====
 * Each background layer is a TileSprite that repeats infinitely.
 * The layer's scrollSpeed controls how fast it moves relative to the camera:
 *   - scrollSpeed 0.0  = Fixed (doesn't move, like distant sky)
 *   - scrollSpeed 0.1  = Very slow (far distant clouds)
 *   - scrollSpeed 0.3  = Slow (middle distance elements)
 *   - scrollSpeed 0.6  = Medium (trees/bushes)
 *   - scrollSpeed 1.0  = Full speed (foreground ground, moves with camera)
 *
 * Lower scrollSpeed = appears further away (parallax effect)
 * This creates depth perception and makes the world feel 3D!
 *
 * ===== STATIC WORLD APPROACH =====
 * Ground layer is a TileSprite with scrollFactor = 1 (moves with camera naturally)
 * NO PHYSICS, NO VELOCITY - the camera movement creates the scrolling illusion!
 */
export default class EnvironmentManager {
    /**
     * @param {Phaser.Scene} scene - The game scene
     */
    constructor(scene) {
        this.scene = scene;
        this.isGameOver = false;
        this.parallaxLayers = []; // Store all parallax layers (including ground)
        this.gameDataManager = GameDataManager.getInstance();
    }

    /**
     * Create all environment elements using selected theme
     */
    create() {
        const themeId = this.gameDataManager.getBackgroundTheme();
        const theme = BACKGROUND_THEMES[themeId];

        if (!theme) {
            console.error(`Theme ${themeId} not found, using default`);
            this.createBackgroundFromTheme(BACKGROUND_THEMES.outback);
        } else {
            this.createBackgroundFromTheme(theme);
        }
    }

    /**
     * Create background from theme configuration
     * @param {Object} theme - Theme configuration from BackgroundConfig
     */
    createBackgroundFromTheme(theme) {
        const CANVAS_WIDTH = GAME_CONFIG.CANVAS.WIDTH;
        const CANVAS_HEIGHT = GAME_CONFIG.CANVAS.HEIGHT;

        theme.layers.forEach(layerConfig => {
            const yPos = layerConfig.y !== undefined ? layerConfig.y : CANVAS_HEIGHT / 2;

            if (layerConfig.type === 'color') {
                // Simple colored rectangle (for testing - no images)
                const height = layerConfig.height !== undefined ? layerConfig.height : CANVAS_HEIGHT;
                const graphics = this.scene.add.graphics();
                graphics.fillStyle(layerConfig.color, 1);
                graphics.fillRect(0, yPos, CANVAS_WIDTH, height);
                graphics.setDepth(layerConfig.depth);
                graphics.setScrollFactor(0); // Fixed to camera
            } else if (layerConfig.type === 'image') {
                // Fixed background image (no scrolling)
                const img = this.scene.add.image(CANVAS_WIDTH / 2, yPos, layerConfig.key);
                img.setDisplaySize(CANVAS_WIDTH, CANVAS_HEIGHT);
                img.setDepth(layerConfig.depth);
                img.setScrollFactor(layerConfig.scrollFactor);
            } else if (layerConfig.type === 'tileSprite') {
                // Scrolling parallax layer with custom Y position
                this.addParallaxLayer(
                    layerConfig.key,
                    layerConfig.scrollSpeed,
                    layerConfig.depth,
                    layerConfig.tileScaleX,
                    layerConfig.tileScaleY,
                    yPos
                );
            }
        });
    }

    /**
     * Add a parallax scrolling layer (including ground)
     * @param {string} texture - Texture key
     * @param {number} scrollSpeed - Parallax speed factor (0-1)
     * @param {number} depth - Z-depth
     * @param {number} scaleX - Horizontal tile scale
     * @param {number} scaleY - Vertical tile scale
     * @param {number} yPos - Y position (default: canvas center)
     */
    addParallaxLayer(texture, scrollSpeed, depth, scaleX, scaleY, yPos = null) {
        const CANVAS_WIDTH = GAME_CONFIG.CANVAS.WIDTH;
        const CANVAS_HEIGHT = GAME_CONFIG.CANVAS.HEIGHT;
        const y = yPos !== null ? yPos : CANVAS_HEIGHT / 2;

        // ALL layers (including ground) are camera-fixed TileSprites
        // They use tilePositionX to create infinite scrolling illusion
        const layer = this.scene.add.tileSprite(
            CANVAS_WIDTH / 2,
            y,
            CANVAS_WIDTH,
            CANVAS_HEIGHT,
            texture
        );
        layer.setOrigin(0.5, 0.5);
        layer.setDepth(depth);
        layer.setTileScale(scaleX, scaleY);
        layer.setScrollFactor(0); // ALL layers fixed to camera

        this.parallaxLayers.push({
            sprite: layer,
            scrollSpeed: scrollSpeed,
            tileScaleX: scaleX  // Store for scroll compensation
        });
    }

    /**
     * Update all parallax layers (including ground)
     * All layers use tilePositionX for infinite repeating pattern
     * @param {number} delta - Time elapsed since last frame
     */
    update(delta) {
        if (this.isGameOver) return;

        const camera = this.scene.cameras.main;

        // CRITICAL FIX: Force camera scroll to whole pixels to prevent TileSprite shivering
        // Phaser camera produces sub-pixel positions (e.g., 300.5px) which causes
        // irregular jumps when combined with tileScale division
        const roundedCameraX = Math.floor(camera.scrollX);

        // Update ALL layers (including ground) with tilePositionX
        // This shifts the repeating tile pattern, creating infinite scrolling
        this.parallaxLayers.forEach((layer) => {
            // CRITICAL: TileSprite scroll position is affected by tileScale!
            // When tiles are scaled, we need to compensate the scroll speed
            // Formula: tilePositionX = roundedCameraX * scrollSpeed / tileScaleX
            const scaleCompensation = layer.tileScaleX || 1.0;

            // Calculate scroll position and FORCE to whole pixels
            // Double-rounding ensures no sub-pixel rendering at any scale
            const scrollPosition = (roundedCameraX * layer.scrollSpeed) / scaleCompensation;
            const finalPosition = Math.floor(scrollPosition);

            layer.sprite.tilePositionX = finalPosition;
        });
    }

    /**
     * Set game over state
     * @param {boolean} value - Game over state
     */
    setGameOver(value) {
        this.isGameOver = value;
    }

    /**
     * Clean up all parallax layers
     */
    cleanup() {
        this.parallaxLayers.forEach(layer => layer.sprite.destroy());
        this.parallaxLayers = [];
    }
}
