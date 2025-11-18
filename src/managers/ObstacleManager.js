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

        // All Australian obstacles available from start (testing phase)
        const groundObstacles = [
            'rock', 'spider_rock',  // Rocks (universal)
            'cactus',               // Outback cactus
            'log', 'snake_log',     // Logs (universal)
            'emu',                  // Outback emu
            'croc',                 // Crocodile (both themes)
            'camel',                // Desert camel
            'koala'                 // Australian koala
        ];

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
    }

    /**
     * Set collision box and scale for obstacle based on type
     * @param {Phaser.GameObjects.Sprite} obstacle - The obstacle sprite
     * @param {string} type - Obstacle type
     */
    setCollisionBox(obstacle, type) {
        // Scale and collision box settings for each obstacle type (50% bigger than before)
        const settings = {
            'rock': { scale: 0.75, width: 75, height: 75 },
            'spider_rock': { scale: 0.75, width: 75, height: 75 },
            'cactus': { scale: 0.75, width: 60, height: 90 },
            'log': { scale: 0.45, width: 90, height: 45 },
            'snake_log': { scale: 0.9, width: 180, height: 90 },
            'emu': { scale: 0.75, width: 75, height: 75 },
            'croc': { scale: 0.75, width: 112, height: 60 },
            'camel': { scale: 1.05, width: 105, height: 126 },
            'koala': { scale: 0.75, width: 60, height: 75 }
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
        const spawnY = Phaser.Math.Between(100, 200); // Fly high only (can't reach with single jump)

        // Use object pooling - get inactive object or create new one
        let obstacle = this.obstacles.getFirstDead(false);

        if (obstacle) {
            // Reuse existing obstacle
            obstacle.setTexture(type);
            obstacle.setOrigin(0.5, 0.5); // Center anchor for flying
            obstacle.setScale(0.6); // Scale down magpie
            obstacle.setPosition(spawnX, spawnY);
            obstacle.setActive(true);
            obstacle.setVisible(true);

            // Update collision box
            obstacle.body.setSize(75, 60);
            obstacle.body.setOffset(10, 18);

            // Play animation if it exists
            if (obstacle.anims && this.scene.anims.exists('magpie_fly')) {
                obstacle.play('magpie_fly');
            }
        } else {
            // Create new obstacle only if pool is empty
            obstacle = this.obstacles.create(spawnX, spawnY, type);

            // Setup visual properties (only for new objects)
            obstacle.setOrigin(0.5, 0.5); // Center anchor for flying
            obstacle.setScale(0.6); // Scale down magpie
            obstacle.setDepth(10);
            obstacle.setScrollFactor(1);

            // Physics setup - STATIC in world space (only for new objects)
            obstacle.body.setAllowGravity(false);
            obstacle.body.setImmovable(true);

            // Collision box for magpie
            obstacle.body.setSize(75, 60);
            obstacle.body.setOffset(10, 18);

            // Play animation
            if (this.scene.anims.exists('magpie_fly')) {
                obstacle.play('magpie_fly');
            }
        }

        // Always reset velocity (pooled objects might have old velocity)
        obstacle.setVelocityX(0);
        obstacle.setVelocityY(0);
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
