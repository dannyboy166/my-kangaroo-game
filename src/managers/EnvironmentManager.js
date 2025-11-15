import { GAME_CONFIG } from '../config/GameConfig.js';

/**
 * EnvironmentManager
 * Handles parallax background layers using TileSprite for seamless scrolling
 * Works with camera-based scrolling system
 */
export default class EnvironmentManager {
    /**
     * @param {Phaser.Scene} scene - The game scene
     */
    constructor(scene) {
        this.scene = scene;
        this.isGameOver = false;
        this.gameSpeed = GAME_CONFIG.DIFFICULTY.INITIAL_SPEED;
        this.parallaxLayers = [];
    }

    /**
     * Create all environment elements
     */
    create() {
        this.createParallaxBackground();
    }

    /**
     * Create parallax background using TileSprite for seamless infinite scrolling
     */
    createParallaxBackground() {
        const CANVAS_WIDTH = GAME_CONFIG.CANVAS.WIDTH; // 800
        const CANVAS_HEIGHT = GAME_CONFIG.CANVAS.HEIGHT; // 600

        // Layer 1: Static sky background (no scrolling, fixed to camera)
        const sky = this.scene.add.image(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 'parallax_background');
        sky.setDisplaySize(CANVAS_WIDTH, CANVAS_HEIGHT);
        sky.setDepth(-100);
        sky.setScrollFactor(0); // Fixed to camera

        // Layer 2: Distant clouds (slowest parallax, using TileSprite)
        this.addTileLayer('parallax_distant_clouds', 0.05, -90);

        // Layer 3: Clouds (slow parallax)
        this.addTileLayer('parallax_clouds', 0.1, -80);

        // Layer 4: Hill 2 (medium-slow parallax)
        this.addTileLayer('parallax_hill2', 0.3, -60);

        // Layer 5: Hill 1 (medium parallax)
        this.addTileLayer('parallax_hill1', 0.4, -50);

        // Layer 6: Distant trees (medium-fast parallax)
        this.addTileLayer('parallax_distant_trees', 0.5, -40);

        // Layer 7: Trees and bushes (faster parallax)
        this.addTileLayer('parallax_trees_bushes', 0.6, -30);

        // No visual ground - kangaroo runs on invisible physics platform
    }

    /**
     * Add a TileSprite layer with parallax scrolling
     * @param {string} texture - Texture key
     * @param {number} scrollFactor - Parallax scroll factor (0-1, where 1 = moves with world)
     * @param {number} depth - Z-depth
     */
    addTileLayer(texture, scrollFactor, depth) {
        const CANVAS_WIDTH = GAME_CONFIG.CANVAS.WIDTH;
        const CANVAS_HEIGHT = GAME_CONFIG.CANVAS.HEIGHT;

        // Get texture dimensions
        const textureObj = this.scene.textures.get(texture);
        const textureWidth = textureObj.getSourceImage().width;
        const textureHeight = textureObj.getSourceImage().height;

        // Create TileSprite that fills the screen
        const tileSprite = this.scene.add.tileSprite(
            0, 0,
            CANVAS_WIDTH * 3, // Make it wide enough for smooth scrolling
            CANVAS_HEIGHT,
            texture
        );

        tileSprite.setOrigin(0, 0);
        tileSprite.setDepth(depth);
        tileSprite.setScrollFactor(scrollFactor, 1); // Parallax effect

        this.parallaxLayers.push({
            tileSprite: tileSprite,
            scrollFactor: scrollFactor
        });
    }

    /**
     * Update parallax scrolling - TileSprites handle seamless scrolling automatically
     * @param {number} delta - Time elapsed since last frame
     */
    update(delta) {
        if (this.isGameOver) return;

        const camera = this.scene.cameras.main;

        // Update each parallax layer based on camera movement
        this.parallaxLayers.forEach(layer => {
            // TileSprite position follows camera with parallax offset
            const scrollX = camera.scrollX * layer.scrollFactor;
            layer.tileSprite.setPosition(-scrollX, 0);
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
        this.parallaxLayers.forEach(layer => {
            if (layer.tileSprite) {
                layer.tileSprite.destroy();
            }
        });
        this.parallaxLayers = [];
    }
}
