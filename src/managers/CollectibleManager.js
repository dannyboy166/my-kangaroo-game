import { GAME_CONFIG } from '../config/GameConfig.js';

/**
 * CollectibleManager
 * Handles coin spawning, movement, and collection
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
        this.gameSpeed = GAME_CONFIG.DIFFICULTY.INITIAL_SPEED;
    }

    /**
     * Initialize coin systems
     */
    create() {
        this.coins = this.scene.physics.add.group();
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

            // Magnet effect
            if (magnetActive) {
                const distanceToKangaroo = Phaser.Math.Distance.Between(
                    coin.x, coin.y, kangaroo.x, kangaroo.y
                );

                const config = GAME_CONFIG.POWERUPS.MAGNET;
                if (distanceToKangaroo < config.RANGE) {
                    const angle = Phaser.Math.Angle.Between(
                        coin.x, coin.y, kangaroo.x, kangaroo.y
                    );
                    coin.x += Math.cos(angle) * config.FORCE * delta / 1000;
                    coin.y += Math.sin(angle) * config.FORCE * delta / 1000;
                }
            }

            // No normal movement - coins are stationary in world (camera creates movement illusion)

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
     * Spawn a coin
     */
    spawnCoin() {
        if (this.isGameOver) return;

        const config = GAME_CONFIG.COINS;
        const kangaroo = this.scene.kangaroo;
        const spawnX = kangaroo ? kangaroo.x + 900 : GAME_CONFIG.SPAWN.COIN_X;
        const coinY = Phaser.Math.Between(
            config.MIN_Y,
            GAME_CONFIG.DIFFICULTY.GROUND_Y - config.MAX_Y_OFFSET
        );

        const coin = this.scene.physics.add.image(
            spawnX,
            coinY,
            'coin'
        );

        coin.setScale(config.SCALE);
        coin.setOrigin(0.5);
        coin.setImmovable(true);
        coin.setVelocityY(0);
        coin.body.pushable = false;

        this.coins.add(coin);

        // Disable gravity
        this.scene.time.delayedCall(0, () => {
            if (coin.body) {
                coin.body.setAllowGravity(false);
                coin.body.setVelocityY(0);
                coin.body.setGravity(0, 0);
                coin.body.setBounce(0);
            }
        });
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

        // Simple collection effect
        const effectCoin = this.scene.add.image(coin.x, coin.y, 'coin');
        effectCoin.setScale(config.SCALE);

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
