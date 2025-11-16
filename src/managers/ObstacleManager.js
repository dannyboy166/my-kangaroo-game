import { GAME_CONFIG } from '../config/GameConfig.js';

/**
 * ObstacleManager - DEAD SIMPLE
 *
 * Obstacles sit in world space. Don't move. Camera moves past them.
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
        this.scheduleNextObstacle();
    }

    update(delta) {
        if (this.isGameOver) return;

        const camera = this.scene.cameras.main;
        const cameraLeftEdge = camera.scrollX;
        const kangaroo = this.scene.kangaroo;

        // Debug every 60 frames
        if (!this.debugCounter) this.debugCounter = 0;
        this.debugCounter++;
        if (this.debugCounter % 60 === 0 && this.obstacles.children.entries.length > 0) {
            const firstObstacle = this.obstacles.children.entries.find(o => o.active);
            console.log('🎯 Speed Check:', {
                kangarooVelX: kangaroo ? kangaroo.body.velocity.x.toFixed(0) : 'N/A',
                obstacleVelX: firstObstacle ? firstObstacle.body.velocity.x.toFixed(0) : 'N/A',
                gameSpeed: this.gameSpeed.toFixed(0),
                cameraScrollX: camera.scrollX.toFixed(0)
            });
        }

        // Clean up off-screen obstacles
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
        const delay = Phaser.Math.Between(config.MIN_SPAWN_DELAY, config.MAX_SPAWN_DELAY);

        console.log(`⏰ Next obstacle scheduled in ${delay}ms`);

        this.obstacleTimer = this.scene.time.delayedCall(delay, () => {
            if (!this.isGameOver && this.scene.scene.isActive()) {
                console.log('⏰ Timer fired, spawning obstacle...');
                this.spawnObstacle();
                this.scheduleNextObstacle();
            } else {
                console.log('⏰ Timer fired but game is over or scene inactive');
            }
        });
    }

    spawnObstacle() {
        if (this.isGameOver) return;

        const types = ['rock', 'cactus', 'log'];
        const type = Phaser.Utils.Array.GetRandom(types);
        this.spawnGroundObstacle(type);
    }

    spawnGroundObstacle(type) {
        const kangaroo = this.scene.kangaroo;
        if (!kangaroo) return;

        // Spawn 800px ahead of kangaroo in world coordinates
        const spawnX = kangaroo.x + 800;

        const obstacle = this.scene.physics.add.sprite(spawnX, this.groundY, type);

        // Setup
        const baseSize = GAME_CONFIG.OBSTACLES.BASE_SIZES[type] || 0.5;
        obstacle.setScale(baseSize);
        obstacle.setOrigin(0.5, 1);

        // Add to group FIRST
        this.obstacles.add(obstacle);

        // THEN set physics (after adding to group)
        obstacle.body.setAllowGravity(false);
        obstacle.body.setImmovable(false);

        // Set velocity LAST
        obstacle.setVelocityX(-this.gameSpeed);

        console.log(`🚧 Spawned ${type} at X:${spawnX.toFixed(0)}, velocity: ${obstacle.body.velocity.x}`);
    }

    setGameSpeed(speed) {
        this.gameSpeed = speed;

        // Update all active obstacles to match new speed
        this.obstacles.children.entries.forEach((obstacle) => {
            if (!obstacle || !obstacle.active) return;
            obstacle.setVelocityX(-speed);
        });
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
