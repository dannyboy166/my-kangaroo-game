import { GAME_CONFIG } from '../config/GameConfig.js';

/**
 * ObstacleManager - Static World Approach
 *
 * Obstacles are placed at fixed positions in world space.
 * They don't move - the camera moving past them creates the scrolling illusion.
 * This is the industry-standard infinite runner approach (Temple Run, Subway Surfers, etc.)
 */
export default class ObstacleManager {
    constructor(scene) {
        this.scene = scene;
        this.obstacles = null;
        this.obstacleTimer = null;
        this.gameSpeed = GAME_CONFIG.DIFFICULTY.INITIAL_SPEED;
        this.score = 0;
        this.isGameOver = false;
        this.groundY = GAME_CONFIG.DIFFICULTY.GROUND_Y;
    }

    create() {
        this.obstacles = this.scene.physics.add.group();

        // Start obstacle spawning
        this.scheduleNextObstacle();
    }

    update(delta) {
        if (this.isGameOver) return;

        const camera = this.scene.cameras.main;
        const cameraLeftEdge = camera.scrollX;

        // Clean up off-screen obstacles (behind camera view)
        // Use killAndHide() instead of destroy() for object pooling
        this.obstacles.children.entries.forEach((obstacle) => {
            if (!obstacle || !obstacle.active) return;

            if (obstacle.x < cameraLeftEdge - 100) {
                obstacle.setActive(false);
                obstacle.setVisible(false);
            }
        });
    }

    scheduleNextObstacle() {
        if (this.isGameOver) return;

        const config = GAME_CONFIG.OBSTACLES;

        // Make obstacles spawn faster as score increases
        let minDelay, maxDelay;
        if (this.score > 1000) {
            // After score 1000: spawn much faster
            minDelay = 1000;
            maxDelay = 2000;
        } else if (this.score > 500) {
            // After score 500: spawn faster
            minDelay = 1200;
            maxDelay = 2500;
        } else {
            // Starting rate
            minDelay = config.MIN_SPAWN_DELAY;
            maxDelay = config.MAX_SPAWN_DELAY;
        }

        const delay = Phaser.Math.Between(minDelay, maxDelay);

        this.obstacleTimer = this.scene.time.delayedCall(delay, () => {
            if (!this.isGameOver && this.scene.scene.isActive()) {
                this.spawnObstacle();
                this.scheduleNextObstacle();
            }
        });
    }

    spawnObstacle() {
        if (this.isGameOver) return;

        // Get current theme from GameDataManager
        const currentTheme = this.scene.gameDataManager.getBackgroundTheme();

        // Different obstacles for different themes
        let groundObstacles;
        if (currentTheme === 'beach') {
            groundObstacles = [
                'rock', 'spider_rock',  // Rocks (universal)
                'log', 'snake_log',     // Logs (universal)
                'emu',                  // Emu (universal)
                'croc'                  // Crocodile (beach/water)
            ];
        } else {
            // Outback theme
            groundObstacles = [
                'rock', 'spider_rock',  // Rocks (universal)
                'log', 'snake_log',     // Logs (universal)
                'emu',                  // Outback emu
                'camel',                // Desert camel
                'koala'                 // Australian koala
            ];
        }

        // Randomly choose between ground obstacle or flying magpie
        const spawnMagpie = Math.random() < 0.15; // 15% chance for magpie

        if (spawnMagpie) {
            this.spawnFlyingObstacle('magpie');
        } else {
            const type = Phaser.Utils.Array.GetRandom(groundObstacles);
            this.spawnGroundObstacle(type);
        }
    }

    spawnGroundObstacle(type) {
        const kangaroo = this.scene.kangaroo;
        if (!kangaroo) return;

        // Spawn 800px ahead of kangaroo in world coordinates
        const spawnX = kangaroo.x + 800;

        // Store spawn position for coin placement
        const obstacleSpawnInfo = { x: spawnX, type: type, isFlying: false };

        // Use object pooling - get inactive object or create new one
        let obstacle = this.obstacles.getFirstDead(false);

        if (obstacle) {
            // Reuse existing obstacle

            // CRITICAL: Stop any playing animations before changing texture
            if (obstacle.anims) {
                obstacle.anims.stop();
            }

            obstacle.setTexture(type);
            obstacle.setOrigin(0.5, 1); // Bottom-center anchor (sits on ground)
            obstacle.setPosition(spawnX, this.groundY);
            obstacle.setActive(true);
            obstacle.setVisible(true);

            // Update collision box for the new texture
            this.setCollisionBox(obstacle, type);
        } else {
            // Create new obstacle only if pool is empty
            obstacle = this.obstacles.create(spawnX, this.groundY, type);

            // Setup visual properties (only needed for new objects)
            obstacle.setOrigin(0.5, 1); // Bottom-center anchor (sits on ground)
            obstacle.setDepth(10); // Above ground layer (ground is at -20)
            obstacle.setScrollFactor(1); // Move with camera (same as default, but explicit)

            // Physics setup - STATIC in world space (only for new objects)
            obstacle.body.setAllowGravity(false);
            obstacle.body.setImmovable(true);

            // Set collision box based on obstacle type
            this.setCollisionBox(obstacle, type);
        }

        // Always reset velocity (pooled objects might have old velocity)
        obstacle.setVelocityX(0);
        obstacle.setVelocityY(0);

        // Spawn coins around this obstacle (50% chance)
        if (Math.random() < 0.5) {
            this.spawnCoinsAroundObstacle(obstacleSpawnInfo);
        }
    }

    /**
     * Spawn coins in safe positions around an obstacle
     * @param {Object} obstacleInfo - Obstacle spawn information
     */
    spawnCoinsAroundObstacle(obstacleInfo) {
        const collectibleManager = this.scene.collectibleManager;
        if (!collectibleManager) return;

        if (obstacleInfo.isFlying) {
            // Flying obstacle (magpie) - spawn coins above or below it
            const offsetY = Math.random() < 0.5 ? -80 : 80; // Above or below
            const coinX = obstacleInfo.x + 100; // Slightly ahead
            const coinY = obstacleInfo.y + offsetY;
            collectibleManager.spawnCoinAtPosition(coinX, coinY);
        } else {
            // Ground obstacle - spawn coins high in the air
            const safeYPositions = [200, 250, 300, 350];
            const coinY = Phaser.Utils.Array.GetRandom(safeYPositions);
            const coinX = obstacleInfo.x + 100; // Slightly ahead
            collectibleManager.spawnCoinAtPosition(coinX, coinY);
        }
    }

    /**
     * Set collision box and scale for obstacle based on type
     * @param {Phaser.GameObjects.Sprite} obstacle - The obstacle sprite
     * @param {string} type - Obstacle type
     */
    setCollisionBox(obstacle, type) {
        // Visual scale stays the same, only collision boxes adjusted
        const settings = {
            'rock': { scale: 0.75, width: 75, height: 97.5 },  // Collider: 1.3x taller
            'spider_rock': { scale: 0.75, width: 75, height: 75 },
            'cactus': { scale: 0.75, width: 60, height: 90 },
            'log': { scale: 0.9, width: 160, height: 135 },  // 2x bigger (0.45 * 2 = 0.9)
            'snake_log': { scale: 0.9, width: 180, height: 72 },  // Collider: 0.8x taller
            'emu': { scale: 1.125, width: 75, height: 112.5 },  // Visual 1.5x bigger, collider same proportion
            'croc': { scale: 0.75, width: 168, height: 72 },  // Collider: 1.5x wide, 1.2x higher
            'camel': { scale: 1.26, width: 105, height: 100.8 },  // Visual 1.2x bigger (1.575 * 0.8), collider same proportion
            'koala': { scale: 1.2, width: 60, height: 150 }  // 1.6x bigger (0.75 * 1.6 = 1.2)
        };

        const setting = settings[type] || { scale: 0.75, width: 60, height: 60 };

        // Apply scale
        obstacle.setScale(setting.scale);

        // Set collision box
        obstacle.body.setSize(setting.width, setting.height);
        obstacle.body.setOffset(
            (obstacle.width - setting.width) / 2,
            obstacle.height - setting.height
        );
    }

    /**
     * Spawn a flying obstacle (magpie)
     * @param {string} type - Obstacle type (currently only 'magpie')
     */
    spawnFlyingObstacle(type) {
        const kangaroo = this.scene.kangaroo;
        if (!kangaroo) return;

        // Spawn 800px ahead of kangaroo in world coordinates
        const spawnX = kangaroo.x + 800;
        const spawnY = Phaser.Math.Between(150, 250); // Fly at medium-high height (requires double jump)

        // Store spawn position for coin placement
        const obstacleSpawnInfo = { x: spawnX, y: spawnY, type: type, isFlying: true };

        // Use object pooling - get inactive object or create new one
        let obstacle = this.obstacles.getFirstDead(false);

        if (obstacle) {
            // Reuse existing obstacle
            obstacle.setTexture(type);
            obstacle.setOrigin(0.5, 0.5); // Center anchor for flying
            obstacle.setScale(0.9); // 1.5x bigger (0.6 * 1.5 = 0.9)
            obstacle.setPosition(spawnX, spawnY);
            obstacle.setActive(true);
            obstacle.setVisible(true);

            // Update collision box (offset x-axis 10px to the right)
            obstacle.body.setSize(75, 60);
            obstacle.body.setOffset(20, 18);

            // Play animation if it exists
            if (obstacle.anims && this.scene.anims.exists('magpie_fly')) {
                obstacle.play('magpie_fly');
            }
        } else {
            // Create new obstacle only if pool is empty
            obstacle = this.obstacles.create(spawnX, spawnY, type);

            // Setup visual properties (only for new objects)
            obstacle.setOrigin(0.5, 0.5); // Center anchor for flying
            obstacle.setScale(0.9); // 1.5x bigger (0.6 * 1.5 = 0.9)
            obstacle.setDepth(10);
            obstacle.setScrollFactor(1);

            // Physics setup - STATIC in world space (only for new objects)
            obstacle.body.setAllowGravity(false);
            obstacle.body.setImmovable(true);

            // Collision box for magpie (offset x-axis 10px to the right)
            obstacle.body.setSize(75, 60);
            obstacle.body.setOffset(20, 18);

            // Play animation
            if (this.scene.anims.exists('magpie_fly')) {
                obstacle.play('magpie_fly');
            }
        }

        // Always reset velocity (pooled objects might have old velocity)
        obstacle.setVelocityX(0);
        obstacle.setVelocityY(0);

        // Spawn coins around this flying obstacle (50% chance)
        if (Math.random() < 0.5) {
            this.spawnCoinsAroundObstacle(obstacleSpawnInfo);
        }
    }

    setGameSpeed(speed) {
        this.gameSpeed = speed;
        // Note: Obstacles don't need velocity updates - they're static!
        // Game speed only affects kangaroo's forward velocity
    }

    setScore(score) {
        this.score = score;
    }

    setGameOver(value) {
        this.isGameOver = value;
    }

    cleanup() {
        if (this.obstacleTimer) {
            this.obstacleTimer.destroy();
            this.obstacleTimer = null;
        }
        if (this.obstacles) {
            this.obstacles.clear(true, true);
        }
    }

    getObstacles() {
        return this.obstacles;
    }
}
