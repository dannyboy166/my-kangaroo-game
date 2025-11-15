import { GAME_CONFIG } from '../config/GameConfig.js';
import { BACKGROUND_THEMES } from '../config/BackgroundConfig.js';
import GameDataManager from './GameDataManager.js';

/**
 * EnvironmentManager
 * Handles background rendering with TileSprite for infinite parallax scrolling
 * Supports multiple background themes
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

        const layer = this.scene.add.tileSprite(
            CANVAS_WIDTH / 2,
            y,
            CANVAS_WIDTH,
            CANVAS_HEIGHT,
            texture
        );
        layer.setOrigin(0.5, 0.5);
        layer.setDepth(depth);
        layer.setScrollFactor(0); // Fixed to camera, we'll manually scroll
        layer.setTileScale(scaleX, scaleY);

        this.parallaxLayers.push({
            sprite: layer,
            scrollSpeed: scrollSpeed
        });
    }

    /**
     * Update all parallax layers based on camera position
     * @param {number} delta - Time elapsed since last frame
     */
    update(delta) {
        if (this.isGameOver) return;

        const camera = this.scene.cameras.main;

        // Update each parallax layer
        this.parallaxLayers.forEach(layer => {
            layer.sprite.tilePositionX = camera.scrollX * layer.scrollSpeed;
        });

        // Debug logging every 180 frames (~3 seconds)
        if (!this.debugCounter) this.debugCounter = 0;
        this.debugCounter++;
        if (this.debugCounter % 180 === 0) {
            console.log('🎨 Environment Manager Status:', {
                parallaxLayers: this.parallaxLayers.length,
                allLayersActive: this.parallaxLayers.every(l => l.sprite.active),
                cameraScrollX: camera.scrollX.toFixed(0),
                gameOver: this.isGameOver,
                memoryNote: 'TileSprites reuse same texture - no spawning/deleting needed!'
            });
        }
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
