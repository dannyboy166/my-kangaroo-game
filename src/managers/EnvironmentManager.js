import { GAME_CONFIG } from '../config/GameConfig.js';

/**
 * EnvironmentManager
 * Handles simple background - just plain colors
 */
export default class EnvironmentManager {
    /**
     * @param {Phaser.Scene} scene - The game scene
     */
    constructor(scene) {
        this.scene = scene;
        this.isGameOver = false;
        this.gameSpeed = GAME_CONFIG.DIFFICULTY.INITIAL_SPEED;
    }

    /**
     * Create all environment elements
     */
    create() {
        // Simple gradient background
        this.createSimpleBackground();

        // Simple ground line
        this.createGroundLine();
    }

    /**
     * Create simple gradient sky background
     */
    createSimpleBackground() {
        const graphics = this.scene.add.graphics();

        // Sky gradient (light blue)
        graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xE0F6FF, 0xE0F6FF, 1);
        graphics.fillRect(0, 0, GAME_CONFIG.CANVAS.WIDTH, GAME_CONFIG.DIFFICULTY.GROUND_Y);
        graphics.setDepth(-100);
    }

    /**
     * Create simple ground line
     */
    createGroundLine() {
        const GROUND_Y = GAME_CONFIG.DIFFICULTY.GROUND_Y; // 450
        const graphics = this.scene.add.graphics();

        // Ground area (brown)
        graphics.fillStyle(0x8B4513, 1);
        graphics.fillRect(0, GROUND_Y, GAME_CONFIG.CANVAS.WIDTH, GAME_CONFIG.CANVAS.HEIGHT - GROUND_Y);

        // Ground line (darker brown)
        graphics.lineStyle(3, 0x654321);
        graphics.moveTo(0, GROUND_Y);
        graphics.lineTo(GAME_CONFIG.CANVAS.WIDTH, GROUND_Y);
        graphics.stroke();

        graphics.setDepth(-50);
    }

    /**
     * Update environment elements
     * @param {number} delta - Time elapsed since last frame
     */
    update(delta) {
        // Nothing to update - static background
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
     * Clean up timers and decorations
     */
    cleanup() {
        // Nothing to clean up
    }
}
