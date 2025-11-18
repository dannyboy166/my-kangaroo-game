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

        // TESTING: Create obstacle textures once (not every spawn!)
        this.createObstacleTextures();

        // Start obstacle spawning
        this.scheduleNextObstacle();
    }

    /**
     * Create reusable obstacle textures (called once on initialization)
     */
    createObstacleTextures() {
        // Only create if they don't already exist
        if (!this.scene.textures.exists('obstacle_box')) {
            const graphics = this.scene.add.graphics();
            graphics.fillStyle(0x000000, 1);
            graphics.fillRect(0, 0, 50, 60);
            graphics.generateTexture('obstacle_box', 50, 60);
            graphics.destroy();
        }

        if (!this.scene.textures.exists('flying_box')) {
            const graphics = this.scene.add.graphics();
            graphics.fillStyle(0x000000, 1);
            graphics.fillRect(0, 0, 50, 50);
            graphics.generateTexture('flying_box', 50, 50);
            graphics.destroy();
        }
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

        // TESTING: Use pre-created texture (created once in create())
        const boxWidth = 50;
        const boxHeight = 60;

        // Use object pooling - get inactive object or create new one
        let obstacle = this.obstacles.getFirstDead(false);

        if (obstacle) {
            // Reuse existing obstacle
            obstacle.setTexture('obstacle_box');
            obstacle.setPosition(spawnX, this.groundY);
            obstacle.setActive(true);
            obstacle.setVisible(true);
        } else {
            // Create new obstacle only if pool is empty
            obstacle = this.obstacles.create(spawnX, this.groundY, 'obstacle_box');

            // Setup visual properties (only needed for new objects)
            obstacle.setOrigin(0.5, 1); // Bottom-center anchor (sits on ground)
            obstacle.setDepth(10); // Above ground layer (ground is at -20)
            obstacle.setScrollFactor(1); // Move with camera (same as default, but explicit)

            // Physics setup - STATIC in world space (only for new objects)
            obstacle.body.setAllowGravity(false);
            obstacle.body.setImmovable(true);

            // Simple collision box for the rectangle
            obstacle.body.setSize(boxWidth, boxHeight);
            obstacle.body.setOffset(0, 0);
        }

        // Always reset velocity (pooled objects might have old velocity)
        obstacle.setVelocityX(0);
        obstacle.setVelocityY(0);
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
        const spawnY = Phaser.Math.Between(150, 300); // Fly at varying heights

        // TESTING: Use pre-created texture (created once in create())
        const boxWidth = 50;
        const boxHeight = 50;

        // Use object pooling - get inactive object or create new one
        let obstacle = this.obstacles.getFirstDead(false);

        if (obstacle) {
            // Reuse existing obstacle
            obstacle.setTexture('flying_box');
            obstacle.setPosition(spawnX, spawnY);
            obstacle.setActive(true);
            obstacle.setVisible(true);
        } else {
            // Create new obstacle only if pool is empty
            obstacle = this.obstacles.create(spawnX, spawnY, 'flying_box');

            // Setup visual properties (only for new objects)
            obstacle.setOrigin(0.5, 0.5); // Center anchor for flying
            obstacle.setDepth(10);
            obstacle.setScrollFactor(1);

            // Physics setup - STATIC in world space (only for new objects)
            obstacle.body.setAllowGravity(false);
            obstacle.body.setImmovable(true);

            // Simple collision box for the flying rectangle
            obstacle.body.setSize(boxWidth, boxHeight);
            obstacle.body.setOffset(0, 0);
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
