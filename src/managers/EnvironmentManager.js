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
 *   - scrollSpeed 1.0  = Full speed (foreground ground, matches obstacles)
 *
 * Lower scrollSpeed = appears further away (parallax effect)
 * This creates depth perception and makes the world feel 3D!
 */
export default class EnvironmentManager {
    /**
     * @param {Phaser.Scene} scene - The game scene
     */
    constructor(scene) {
        this.scene = scene;
        this.isGameOver = false;
        this.gameSpeed = GAME_CONFIG.DIFFICULTY.INITIAL_SPEED;
        this.parallaxLayers = []; // Store all parallax layers
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

        console.log(`🎨 Creating background for theme: ${theme.name}`);

        theme.layers.forEach(layerConfig => {
            const yPos = layerConfig.y !== undefined ? layerConfig.y : CANVAS_HEIGHT / 2;

            if (layerConfig.type === 'image') {
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

        console.log(`✅ Background created with ${this.parallaxLayers.length} parallax layers`);
    }

    /**
     * Add a parallax scrolling layer
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

        // Ground layer (scrollSpeed 1.0) becomes a moving physics sprite
        // Other layers stay as camera-fixed parallax
        if (scrollSpeed >= 1.0) {
            this.createGroundSprite(texture, scaleX, scaleY, y);
            return; // Don't add to parallax layers
        }

        console.log(`📍 Adding parallax layer: ${texture}`, {
            x: CANVAS_WIDTH / 2,
            y: y,
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            depth: depth,
            scrollSpeed: scrollSpeed,
            scaleX: scaleX,
            scaleY: scaleY
        });

        const layer = this.scene.add.tileSprite(
            CANVAS_WIDTH / 2,
            y,
            CANVAS_WIDTH,
            CANVAS_HEIGHT,
            texture
        );
        layer.setOrigin(0.5, 0.5);
        layer.setDepth(depth);
        layer.setScrollFactor(0); // Fixed to camera
        layer.setTileScale(scaleX, scaleY);

        this.parallaxLayers.push({
            sprite: layer,
            scrollSpeed: scrollSpeed
        });
    }

    /**
     * Create ground as a moving sprite (like obstacles)
     */
    createGroundSprite(texture, scaleX, scaleY, y) {
        const kangaroo = this.scene.kangaroo;
        if (!kangaroo) {
            console.error('Cannot create ground - kangaroo not found');
            return;
        }

        // Create a HUGE ground sprite that moves at -300
        const groundWidth = 100000;
        const groundX = kangaroo.x + groundWidth / 2; // Center ahead of kangaroo

        const ground = this.scene.add.tileSprite(
            groundX,
            y,
            groundWidth,
            600,
            texture
        );
        ground.setOrigin(0.5, 0.5);
        ground.setDepth(-20);
        ground.setScrollFactor(1); // World space
        ground.setTileScale(scaleX, scaleY);

        // Add physics to make it move
        this.scene.physics.add.existing(ground);
        ground.body.setAllowGravity(false);
        ground.body.setVelocityX(-300); // SAME AS OBSTACLES!

        this.groundSprite = ground;

        console.log('✅ Ground sprite created - MOVES AT -300 (like obstacles)');
    }

    /**
     * Update parallax layers (clouds, trees, etc.)
     * Ground is now a physics sprite that moves automatically
     * @param {number} delta - Time elapsed since last frame
     */
    update(delta) {
        if (this.isGameOver) return;

        const camera = this.scene.cameras.main;

        // Only update parallax layers (clouds, trees)
        // Ground is a physics sprite that moves at -300
        this.parallaxLayers.forEach(layer => {
            layer.sprite.tilePositionX = camera.scrollX * layer.scrollSpeed;
        });
    }

    /**
     * Set game speed
     * @param {number} speed - New game speed
     */
    setGameSpeed(speed) {
        this.gameSpeed = speed;
    }

    /**
     * Set game over state
     * @param {boolean} value - Game over state
     */
    setGameOver(value) {
        this.isGameOver = value;
    }

    /**
     * Clean up
     */
    cleanup() {
        this.parallaxLayers.forEach(layer => layer.sprite.destroy());
        this.parallaxLayers = [];
    }
}
