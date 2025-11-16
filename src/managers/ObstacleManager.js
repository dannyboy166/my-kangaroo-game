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

        // Debug: Check obstacle velocities every 60 frames
        if (!this.debugCounter) this.debugCounter = 0;
        this.debugCounter++;
        if (this.debugCounter % 60 === 0) {
            const firstObstacle = this.obstacles.children.entries.find(o => o.active);
            if (firstObstacle) {
                console.log('🔍 Obstacle Debug:', {
                    obstacleX: firstObstacle.x.toFixed(0),
                    velocityX: firstObstacle.body.velocity.x.toFixed(2),
                    velocityY: firstObstacle.body.velocity.y.toFixed(2),
                    scrollFactor: firstObstacle.scrollFactorX,
                    cameraScrollX: camera.scrollX.toFixed(0)
                });
            }
        }

        // Clean up off-screen obstacles (behind camera view)
        this.obstacles.children.entries.slice().forEach((obstacle) => {
            if (!obstacle || !obstacle.active) return;

            if (obstacle.x < cameraLeftEdge - 100) {
                obstacle.destroy();
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

        console.log(`⏰ Next obstacle in ${delay}ms (score: ${Math.floor(this.score)})`);

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

        const obstacle = this.scene.physics.add.sprite(spawnX, this.groundY, type);

        // Setup visual properties
        const baseSize = GAME_CONFIG.OBSTACLES.BASE_SIZES[type] || 0.5;
        obstacle.setScale(baseSize);
        obstacle.setOrigin(0.5, 1); // Bottom-center anchor (sits on ground)
        obstacle.setDepth(10); // Above ground layer (ground is at -20)
        obstacle.setScrollFactor(1); // Move with camera (same as default, but explicit)

        // Add to group
        this.obstacles.add(obstacle);

        // Physics setup - STATIC in world space
        obstacle.body.setAllowGravity(false);
        obstacle.body.setImmovable(true);
        obstacle.setVelocityX(0); // No movement - stays in world space
        obstacle.setVelocityY(0);

        // Apply custom collision box from config
        this.setCollisionBox(obstacle, type);

        console.log(`🚧 Spawned ${type} at world X: ${spawnX.toFixed(0)} (scrollFactor=1, velocity=0)`);
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

        const obstacle = this.scene.physics.add.sprite(spawnX, spawnY, type);

        // Setup visual properties
        const baseSize = GAME_CONFIG.MAGPIE?.SCALE || 0.8;
        obstacle.setScale(baseSize);
        obstacle.setOrigin(0.5, 0.5); // Center anchor for flying
        obstacle.setDepth(10);
        obstacle.setScrollFactor(1);

        // Play flying animation if it exists
        if (this.scene.anims.exists('magpie_fly')) {
            obstacle.play('magpie_fly');
        }

        // Add to group
        this.obstacles.add(obstacle);

        // Physics setup - STATIC in world space (like ground obstacles)
        obstacle.body.setAllowGravity(false);
        obstacle.body.setImmovable(true);
        obstacle.setVelocityX(0);
        obstacle.setVelocityY(0);

        // Apply custom collision box
        this.setCollisionBox(obstacle, type);

        console.log(`🦅 Spawned ${type} at world X: ${spawnX.toFixed(0)}, Y: ${spawnY} (flying)`);
    }

    /**
     * Apply custom collision box to obstacle based on type
     * Reads collision box settings from GAME_CONFIG.OBSTACLES.COLLISION_BOXES
     * @param {Phaser.GameObjects.Sprite} obstacle - The obstacle sprite
     * @param {string} type - Obstacle type key
     */
    setCollisionBox(obstacle, type) {
        const collisionBoxes = GAME_CONFIG.OBSTACLES.COLLISION_BOXES;

        // Check if custom collision box exists for this type
        if (collisionBoxes && collisionBoxes[type]) {
            const box = collisionBoxes[type];
            obstacle.body.setSize(box.width, box.height);
            obstacle.body.setOffset(box.offsetX, box.offsetY);
            console.log(`  → Custom collision box applied: ${box.width}x${box.height} at offset (${box.offsetX}, ${box.offsetY})`);
        } else {
            // Use default collision box (full sprite size)
            console.log(`  → Using default collision box (full sprite)`);
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
