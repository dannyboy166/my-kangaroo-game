import { GAME_CONFIG } from '../config/GameConfig.js';

/**
 * EnvironmentManager
 * Handles background rendering with TileSprite for infinite parallax scrolling
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
    }

    /**
     * Create all environment elements
     */
    create() {
        this.createSimpleBackground();
    }

    /**
     * Create multi-layer parallax background
     */
    createSimpleBackground() {
        const CANVAS_WIDTH = GAME_CONFIG.CANVAS.WIDTH; // 800
        const CANVAS_HEIGHT = GAME_CONFIG.CANVAS.HEIGHT; // 600

        // Create sky background image (fixed, no scrolling)
        const sky = this.scene.add.image(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 'parallax_background');
        sky.setDisplaySize(CANVAS_WIDTH, CANVAS_HEIGHT);
        sky.setDepth(-100);
        sky.setScrollFactor(0); // Fixed to camera

        // Layer 1: Distant clouds (slowest - 10% speed)
        this.addParallaxLayer('parallax_distant_clouds', 0.1, -90, 0.5, 0.5);

        // Layer 2: Distant clouds 1 (slow - 15% speed)
        this.addParallaxLayer('parallax_distant_clouds1', 0.15, -85, 0.5, 0.5);

        // Layer 3: Regular clouds (medium-slow - 25% speed)
        this.addParallaxLayer('parallax_clouds', 0.25, -80, 0.5, 0.5);

        // Layer 4: Trees/bushes (faster - 60% speed)
        this.addParallaxLayer('parallax_trees_bushes', 0.6, -50, 0.4, 0.4);

        console.log('🎨 Multi-layer parallax background created with', this.parallaxLayers.length, 'layers');
    }

    /**
     * Add a parallax scrolling layer
     * @param {string} texture - Texture key
     * @param {number} scrollSpeed - Parallax speed factor (0-1)
     * @param {number} depth - Z-depth
     * @param {number} scaleX - Horizontal tile scale
     * @param {number} scaleY - Vertical tile scale
     */
    addParallaxLayer(texture, scrollSpeed, depth, scaleX, scaleY) {
        const CANVAS_WIDTH = GAME_CONFIG.CANVAS.WIDTH;
        const CANVAS_HEIGHT = GAME_CONFIG.CANVAS.HEIGHT;

        const layer = this.scene.add.tileSprite(
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT / 2,
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
