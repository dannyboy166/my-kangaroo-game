import { GAME_CONFIG } from '../config/GameConfig.js';

/**
 * EnvironmentManager
 * Handles parallax background layers using professional asset pack
 * All layers properly aligned to GROUND_Y (450)
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
     * Create parallax background with proper alignment to GROUND_Y
     */
    createParallaxBackground() {
        const GROUND_Y = GAME_CONFIG.DIFFICULTY.GROUND_Y; // 450
        const CANVAS_WIDTH = GAME_CONFIG.CANVAS.WIDTH; // 800
        const CANVAS_HEIGHT = GAME_CONFIG.CANVAS.HEIGHT; // 600

        // All parallax images are 2048px wide, scale to fit canvas width
        const imageWidth = 2048;
        const scale = CANVAS_WIDTH / imageWidth;

        // Layer 1: Static sky background (no scrolling)
        const sky = this.scene.add.image(0, 0, 'parallax_background');
        sky.setOrigin(0, 0);
        sky.setDisplaySize(CANVAS_WIDTH, CANVAS_HEIGHT);
        sky.setDepth(-100);

        // Layer 2: Distant clouds (slowest parallax)
        this.addScrollingLayer('parallax_distant_clouds', scale, 0.05, -90, 0);

        // Layer 3: Clouds (slow parallax)
        this.addScrollingLayer('parallax_clouds', scale, 0.1, -80, 0);

        // Layer 4: Hill 2 (medium-slow parallax)
        this.addScrollingLayer('parallax_hill2', scale, 0.3, -60, 0);

        // Layer 5: Hill 1 (medium parallax)
        this.addScrollingLayer('parallax_hill1', scale, 0.4, -50, 0);

        // Layer 6: Distant trees (medium-fast parallax)
        this.addScrollingLayer('parallax_distant_trees', scale, 0.5, -40, 0);

        // Layer 7: Trees and bushes (faster parallax)
        this.addScrollingLayer('parallax_trees_bushes', scale, 0.6, -30, 0);

        // Layer 8: Simple solid ground
        const groundGraphics = this.scene.add.graphics();
        groundGraphics.fillStyle(0x8B4513, 1); // Brown ground
        groundGraphics.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

        // Ground line (darker brown)
        groundGraphics.lineStyle(3, 0x654321);
        groundGraphics.moveTo(0, GROUND_Y);
        groundGraphics.lineTo(CANVAS_WIDTH, GROUND_Y);
        groundGraphics.stroke();
        groundGraphics.setDepth(-10);
    }

    /**
     * Add a scrolling parallax layer
     * @param {string} texture - Texture key
     * @param {number} scale - Scale factor
     * @param {number} scrollSpeed - Speed multiplier (0-1)
     * @param {number} depth - Z-depth
     * @param {number} y - Y position (0 = top, or GROUND_Y for ground layer)
     * @param {boolean} alignToGround - If true, use origin(0,1) for ground alignment
     */
    addScrollingLayer(texture, scale, scrollSpeed, depth, y = 0, alignToGround = false) {
        const CANVAS_WIDTH = GAME_CONFIG.CANVAS.WIDTH;

        // Create two copies for seamless scrolling
        const sprite1 = this.scene.add.image(0, y, texture);
        const sprite2 = this.scene.add.image(CANVAS_WIDTH, y, texture);

        // Set origin based on whether it's a ground layer
        if (alignToGround) {
            sprite1.setOrigin(0, 1); // Bottom-left for ground
            sprite2.setOrigin(0, 1);
        } else {
            sprite1.setOrigin(0, 0); // Top-left for sky layers
            sprite2.setOrigin(0, 0);
        }

        sprite1.setScale(scale);
        sprite2.setScale(scale);
        sprite1.setDepth(depth);
        sprite2.setDepth(depth);

        this.parallaxLayers.push({
            sprites: [sprite1, sprite2],
            speed: scrollSpeed,
            width: CANVAS_WIDTH
        });
    }

    /**
     * Add scrolling ground layer with proper cropping
     * @param {string} texture - Texture key
     * @param {number} scale - Scale factor
     * @param {number} scrollSpeed - Speed multiplier
     * @param {number} depth - Z-depth
     * @param {number} groundY - Ground Y position (450)
     */
    addScrollingGroundLayer(texture, scale, scrollSpeed, depth, groundY) {
        const CANVAS_WIDTH = GAME_CONFIG.CANVAS.WIDTH;
        const CANVAS_HEIGHT = GAME_CONFIG.CANVAS.HEIGHT;

        // Create two copies for seamless scrolling
        // Position at top of canvas and let it extend down
        const sprite1 = this.scene.add.image(0, groundY, texture);
        const sprite2 = this.scene.add.image(CANVAS_WIDTH, groundY, texture);

        // Set origin to show the sandy part of the ground image at groundY
        // The image is very tall (1546px), sandy part is near the top
        sprite1.setOrigin(0, 0.15); // Show sandy top portion at groundY
        sprite2.setOrigin(0, 0.15);

        sprite1.setScale(scale);
        sprite2.setScale(scale);
        sprite1.setDepth(depth);
        sprite2.setDepth(depth);

        this.parallaxLayers.push({
            sprites: [sprite1, sprite2],
            speed: scrollSpeed,
            width: CANVAS_WIDTH
        });
    }

    /**
     * Update parallax scrolling
     * @param {number} delta - Time elapsed since last frame
     */
    update(delta) {
        if (this.isGameOver) return;

        // Update all scrolling layers
        this.parallaxLayers.forEach(layer => {
            layer.sprites.forEach(sprite => {
                // Move sprite based on game speed and layer speed
                sprite.x -= this.gameSpeed * layer.speed * delta / 1000;

                // Wrap around when sprite goes off-screen (add 2px overlap to prevent gaps)
                if (sprite.x + layer.width <= 0) {
                    sprite.x = layer.width - 2;
                }
            });
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
        // Phaser automatically handles sprite cleanup
        this.parallaxLayers = [];
    }
}
