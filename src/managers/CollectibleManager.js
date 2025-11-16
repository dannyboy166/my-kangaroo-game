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
        this.coinTimer = null;
        this.coinCollectionCooldown = new Set();
        this.isGameOver = false;
    }

    /**
     * Initialize coin systems
     */
    create() {
        this.coins = this.scene.physics.add.group();

        // Create coin animation if it doesn't exist (already created in MenuScene)
        if (!this.scene.anims.exists('coin_spin')) {
            this.scene.anims.create({
                key: 'coin_spin',
                frames: this.scene.anims.generateFrameNumbers('coin', { start: 0, end: 24 }),
                frameRate: 20, // 20 FPS for smooth rotation
                repeat: -1 // Loop forever
            });
        }

        this.scheduleNextCoin();
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

        // Debug logging every 180 frames
        if (!this.debugCounter) this.debugCounter = 0;
        this.debugCounter++;
        if (this.debugCounter % 180 === 0) {
            console.log('🪙 Collectible Manager Status:', {
                activeCoins: this.coins.children.entries.length,
                magnetActive: magnetActive,
                memoryNote: 'Coins auto-pooled by Phaser Groups'
            });
        }

        this.coins.children.entries.slice().forEach((coin) => {
            if (!coin || !coin.active) return;

            // Magnet effect - use velocity for smooth attraction
            if (magnetActive) {
                const distanceToKangaroo = Phaser.Math.Distance.Between(
                    coin.x, coin.y, kangaroo.x, kangaroo.y
                );

                const config = GAME_CONFIG.POWERUPS.MAGNET;
                if (distanceToKangaroo < config.RANGE) {
                    // Calculate angle from coin to kangaroo
                    const angle = Phaser.Math.Angle.Between(
                        coin.x, coin.y, kangaroo.x, kangaroo.y
                    );
                    // Use physics velocity for smoother movement
                    coin.body.setVelocity(
                        Math.cos(angle) * config.FORCE,
                        Math.sin(angle) * config.FORCE
                    );
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
     * Schedule next coin spawn
     */
    scheduleNextCoin() {
        if (this.isGameOver) return;

        const config = GAME_CONFIG.COINS;
        const delay = Phaser.Math.Between(config.MIN_SPAWN_DELAY, config.MAX_SPAWN_DELAY);

        this.coinTimer = this.scene.time.delayedCall(delay, () => {
            if (!this.isGameOver && this.scene.scene.isActive()) {
                this.spawnCoin();
                this.scheduleNextCoin();
            }
        });
    }

    /**
     * Spawn a coin at a random position ahead of kangaroo
     */
    spawnCoin() {
        if (this.isGameOver) return;

        const config = GAME_CONFIG.COINS;
        const kangaroo = this.scene.kangaroo;
        const spawnX = kangaroo ? kangaroo.x + 900 : GAME_CONFIG.SPAWN.COIN_X;

        // Check if there's an obstacle nearby at this spawn position
        const obstacleManager = this.scene.obstacleManager;
        if (obstacleManager) {
            const obstacles = obstacleManager.getObstacles();
            const tooCloseToObstacle = obstacles.children.entries.some(obstacle => {
                if (!obstacle.active) return false;

                // Check if obstacle is within 200px horizontally
                const horizontalDistance = Math.abs(obstacle.x - spawnX);
                return horizontalDistance < 200;
            });

            // Skip coin spawn if too close to obstacle
            if (tooCloseToObstacle) {
                console.log('💰 Skipped coin spawn - too close to obstacle');
                return;
            }
        }

        const coinY = Phaser.Math.Between(
            config.MIN_Y,
            GAME_CONFIG.DIFFICULTY.GROUND_Y - config.MAX_Y_OFFSET
        );

        // Create using the group's create method with first frame
        const coin = this.coins.create(spawnX, coinY, 'coin', 0);

        // Visual setup
        coin.setScale(config.SCALE);
        coin.setOrigin(0.5);
        coin.setScrollFactor(1); // Move with camera like obstacles

        // Play spinning animation
        coin.play('coin_spin');

        // Physics setup - STATIC in world space
        // CRITICAL: Set these AFTER create() to prevent group from overriding
        coin.body.setAllowGravity(false);
        coin.body.setImmovable(true);
        coin.body.pushable = false;
        coin.body.setVelocity(0, 0); // No movement

        console.log(`💰 Spawned coin at Y:${coinY.toFixed(0)}, velY:${coin.body.velocity.y}`);
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
     * Clean up timers and coins
     */
    cleanup() {
        if (this.coinTimer) {
            this.coinTimer.destroy();
            this.coinTimer = null;
        }

        this.coinCollectionCooldown.clear();

        if (this.coins) {
            this.coins.clear(true, true);
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
