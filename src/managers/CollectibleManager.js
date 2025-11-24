import { GAME_CONFIG } from '../config/GameConfig.js';

/**
 * CollectibleManager
 * Handles coin spawning and collection
 *
 * Coins are placed at fixed positions in world space (like obstacles).
 * Camera movement creates the scrolling illusion - no velocity needed!
 * Magnet powerup uses manual position updates for attraction effect.
 */
export default class CollectibleManager {
    /**
     * @param {Phaser.Scene} scene - The game scene
     * @param {GameDataManager} gameDataManager - Game data manager
     */
    constructor(scene, gameDataManager) {
        this.scene = scene;
        this.gameDataManager = gameDataManager;
        this.coins = null;
        this.coinCollectionCooldown = new Set();
        this.isGameOver = false;
        this.magnetLines = null; // Graphics object for magnet attraction lines
    }

    /**
     * Initialize coin systems
     */
    create() {
        this.coins = this.scene.physics.add.group();

        // Create graphics object for magnet attraction lines
        this.magnetLines = this.scene.add.graphics();
        this.magnetLines.setDepth(5); // Above coins but below UI

        // Create coin animation if it doesn't exist (already created in MenuScene)
        if (!this.scene.anims.exists('coin_spin')) {
            this.scene.anims.create({
                key: 'coin_spin',
                frames: this.scene.anims.generateFrameNumbers('coin', { start: 0, end: 24 }),
                frameRate: 20, // 20 FPS for smooth rotation
                repeat: -1 // Loop forever
            });
        }

        // Random coin spawning DISABLED - coins now spawn strategically with obstacles
        // this.scheduleNextCoin();
    }

    /**
     * Update coin positions and magnet attraction
     * @param {number} delta - Time elapsed since last frame
     * @param {boolean} magnetActive - Whether magnet powerup is active
     */
    update(delta, magnetActive = false) {
        if (this.isGameOver) return;

        const kangaroo = this.scene.kangaroo;
        if (!kangaroo) return;

        // Clear previous magnet lines
        this.magnetLines.clear();

        this.coins.children.entries.slice().forEach((coin) => {
            if (!coin || !coin.active) return;

            // Magnet effect - use velocity for smooth attraction
            if (magnetActive) {
                // Attract to a point slightly ahead of kangaroo (front of body)
                const magnetTargetX = kangaroo.x + 40; // 40px ahead (forward)
                const magnetTargetY = kangaroo.y - 30; // Slightly up (chest level)

                const distanceToKangaroo = Phaser.Math.Distance.Between(
                    coin.x, coin.y, magnetTargetX, magnetTargetY
                );

                const config = GAME_CONFIG.POWERUPS.MAGNET;
                if (distanceToKangaroo < config.RANGE) {
                    // Calculate angle from coin to magnet target point
                    const angle = Phaser.Math.Angle.Between(
                        coin.x, coin.y, magnetTargetX, magnetTargetY
                    );
                    // Use physics velocity for smoother movement
                    coin.body.setVelocity(
                        Math.cos(angle) * config.FORCE,
                        Math.sin(angle) * config.FORCE
                    );

                    // Draw attraction line from coin to magnet target
                    this.drawAttractionLine(coin.x, coin.y, magnetTargetX, magnetTargetY);
                } else {
                    // Reset velocity when out of range
                    coin.body.setVelocity(0, 0);
                }
            } else {
                // Ensure coins stay static when no magnet
                if (coin.body.velocity.x !== 0 || coin.body.velocity.y !== 0) {
                    coin.body.setVelocity(0, 0);
                }
            }

            // Note: Coins don't move on their own - they're static in world space
            // Camera movement creates the scrolling illusion

            // Clean up coins that are off-screen (behind camera view)
            const camera = this.scene.cameras.main;
            const cameraLeftEdge = camera.scrollX;
            if (coin.x < cameraLeftEdge - 100) {
                this.coinCollectionCooldown.delete(coin);
                coin.destroy();
            }
        });
    }

    /**
     * Draw attraction line from coin to kangaroo (magnet effect)
     * @param {number} coinX - Coin X position
     * @param {number} coinY - Coin Y position
     * @param {number} kangarooX - Kangaroo X position
     * @param {number} kangarooY - Kangaroo Y position
     */
    drawAttractionLine(coinX, coinY, kangarooX, kangarooY) {
        // Draw curved line with gradient effect
        this.magnetLines.lineStyle(2, 0xCC0000, 0.6); // Red color to match magnet icon

        // Target point: center of kangaroo (offset upward and forward)
        const targetX = kangarooX + 20; // 20px forward from kangaroo center
        const targetY = kangarooY - 50; // 50px up from kangaroo's feet

        // Create a curve from coin to kangaroo center
        const curve = new Phaser.Curves.QuadraticBezier(
            new Phaser.Math.Vector2(coinX, coinY),
            new Phaser.Math.Vector2((coinX + targetX) / 2, (coinY + targetY) / 2 - 30), // Control point (curve upward)
            new Phaser.Math.Vector2(targetX, targetY)
        );

        curve.draw(this.magnetLines, 32); // 32 points for smooth curve

        // Add particles/sparkles along the line
        const points = curve.getPoints(8);
        points.forEach((point, index) => {
            if (index % 2 === 0) { // Draw every other point
                this.magnetLines.fillStyle(0xFFFFFF, 0.8);
                this.magnetLines.fillCircle(point.x, point.y, 2);
            }
        });
    }

    /**
     * Spawn a coin at a specific position (called by ObstacleManager for coordinated spawning)
     * @param {number} x - X position in world space
     * @param {number} y - Y position
     */
    spawnCoinAtPosition(x, y) {
        const config = GAME_CONFIG.COINS;

        // Create coin at specified position
        const coin = this.coins.create(x, y, 'coin', 0);

        // Visual setup
        coin.setScale(config.SCALE);
        coin.setOrigin(0.5);
        coin.setScrollFactor(1);
        coin.play('coin_spin');

        // Physics setup - STATIC in world space
        coin.body.setAllowGravity(false);
        coin.body.setImmovable(true);
        coin.body.pushable = false;
        coin.body.setVelocity(0, 0);
    }

    /**
     * Collect a coin
     * @param {Phaser.GameObjects.Image} coin - The coin object
     * @param {Object} audioManager - Audio manager for playing sounds
     * @returns {Object} Collection result with coins added and score bonus
     */
    collectCoin(coin, audioManager) {
        if (this.coinCollectionCooldown.has(coin) || !coin.active) {
            return null;
        }

        this.coinCollectionCooldown.add(coin);

        // Play coin collection sound
        audioManager?.playCoinCollect();

        const config = GAME_CONFIG.COINS;

        // Add coins to persistent storage
        this.gameDataManager.addCoins(config.VALUE);

        // Immediately disable physics and remove from group
        coin.body.setEnable(false);
        this.coins.remove(coin);

        // Simple collection effect with animated coin
        const effectCoin = this.scene.add.sprite(coin.x, coin.y, 'coin', 0);
        effectCoin.setScale(config.SCALE);
        effectCoin.play('coin_spin');

        this.scene.tweens.add({
            targets: effectCoin,
            scaleX: config.SCALE * 5,
            scaleY: config.SCALE * 5,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                effectCoin.destroy();
            }
        });

        // Clean up original coin
        coin.destroy();
        this.coinCollectionCooldown.delete(coin);

        return {
            coinsAdded: config.VALUE,
            scoreBonus: config.SCORE_BONUS
        };
    }

    /**
     * Set game over state
     * @param {boolean} value - Game over state
     */
    setGameOver(value) {
        this.isGameOver = value;
    }

    /**
     * Clean up coins and graphics
     */
    cleanup() {
        this.coinCollectionCooldown.clear();

        if (this.coins) {
            this.coins.clear(true, true);
        }

        if (this.magnetLines) {
            this.magnetLines.destroy();
            this.magnetLines = null;
        }
    }

    /**
     * Get coins group
     * @returns {Phaser.Physics.Arcade.Group}
     */
    getCoins() {
        return this.coins;
    }
}
