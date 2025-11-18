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

        // Clear previous magnet lines
        this.magnetLines.clear();

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

                    // Draw attraction line from coin to kangaroo
                    this.drawAttractionLine(coin.x, coin.y, kangaroo.x, kangaroo.y);
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
        this.magnetLines.lineStyle(2, 0x00BFFF, 0.6); // Blue color, semi-transparent

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
        // Spawn at same X position as obstacles (800px ahead) to ensure they're in range
        const spawnX = kangaroo ? kangaroo.x + 800 : GAME_CONFIG.SPAWN.COIN_X;

        // Generate initial random Y position
        let coinY = Phaser.Math.Between(
            config.MIN_Y,
            GAME_CONFIG.DIFFICULTY.GROUND_Y - config.MAX_Y_OFFSET
        );

        // Check if there's an obstacle at this spawn position (2D overlap check)
        const obstacleManager = this.scene.obstacleManager;
        if (obstacleManager) {
            const obstacles = obstacleManager.getObstacles();

            console.log(`[COIN SPAWN] Attempting spawn at X=${spawnX}, Y=${coinY}`);
            console.log(`[COIN SPAWN] Active obstacles:`, obstacles.children.entries.filter(o => o.active).map(o => ({
                texture: o.texture.key,
                x: o.x,
                y: o.y
            })));

            // Use multiple spawn attempts to find a clear position
            let attempts = 0;
            let finalSpawnX = spawnX;
            let finalSpawnY = coinY;

            // NORMAL MODE: Avoid spawning coins on obstacles
            while (attempts < 5) {
                const overlapsObstacle = obstacles.children.entries.some(obstacle => {
                    if (!obstacle.active) return false;

                    // Check both X and Y distance for actual 2D overlap
                    const horizontalDistance = Math.abs(obstacle.x - finalSpawnX);
                    const verticalDistance = Math.abs(obstacle.y - finalSpawnY);

                    console.log(`[COIN CHECK] Obstacle ${obstacle.texture.key} at (${obstacle.x}, ${obstacle.y}): hDist=${horizontalDistance.toFixed(0)}, vDist=${verticalDistance.toFixed(0)}`);

                    // Use buffer zone: 600px horizontal (large to account for spawn timing), 250px vertical
                    const overlaps = horizontalDistance < 600 && verticalDistance < 250;
                    if (overlaps) {
                        console.log(`[COIN OVERLAP] ⚠️ Too close to ${obstacle.texture.key}!`);
                    }
                    return overlaps;
                });

                if (!overlapsObstacle) {
                    console.log(`[COIN SPAWN] ✅ Clear position found at Y=${finalSpawnY} after ${attempts} attempts`);
                    break; // Found a clear spot
                }

                console.log(`[COIN SPAWN] ❌ Attempt ${attempts + 1} failed, trying new Y position...`);

                // Try a different Y position
                finalSpawnY = Phaser.Math.Between(
                    config.MIN_Y,
                    GAME_CONFIG.DIFFICULTY.GROUND_Y - config.MAX_Y_OFFSET
                );
                attempts++;
            }

            // Skip coin spawn if no clear position found after attempts
            if (attempts >= 5) {
                console.log(`[COIN SPAWN] ❌ SKIPPED - No clear position after 5 attempts`);
                return;
            }

            coinY = finalSpawnY; // Use the adjusted Y position
        }

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
