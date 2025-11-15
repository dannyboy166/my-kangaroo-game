import { GAME_CONFIG } from '../config/GameConfig.js';

/**
 * ObstacleManager
 * Handles all obstacle spawning, movement, and behavior logic
 */
export default class ObstacleManager {
    /**
     * @param {Phaser.Scene} scene - The game scene
     */
    constructor(scene) {
        this.scene = scene;
        this.obstacles = null;
        this.obstacleTimer = null;
        this.gameSpeed = GAME_CONFIG.DIFFICULTY.INITIAL_SPEED;
        this.score = 0;
        this.isGameOver = false;
        this.groundY = GAME_CONFIG.DIFFICULTY.GROUND_Y;
    }

    /**
     * Initialize the obstacle physics group
     */
    create() {
        this.obstacles = this.scene.physics.add.group();
        this.scheduleNextObstacle();
    }

    /**
     * Update obstacle positions and behaviors
     * @param {number} delta - Time elapsed since last frame
     */
    update(delta) {
        if (this.isGameOver) return;

        const kangaroo = this.scene.kangaroo;
        if (!kangaroo) return;

        // Debug logging every 180 frames
        if (!this.debugCounter) this.debugCounter = 0;
        this.debugCounter++;
        if (this.debugCounter % 180 === 0) {
            console.log('🚧 Obstacle Manager Status:', {
                activeObstacles: this.obstacles.children.entries.length,
                score: this.score.toFixed(0),
                memoryNote: 'Using Phaser Groups for object pooling - efficient!'
            });
        }

        this.obstacles.children.entries.slice().forEach((obstacle) => {
            if (!obstacle || !obstacle.active) return;

            // Special handling for magpie swooping behavior
            if (obstacle.texture.key === 'magpie') {
                this.updateMagpieBehavior(obstacle, delta);
            } else if (obstacle.isFlyingBee) {
                // Bee movement: faster horizontal + sine wave vertical
                this.updateBeeBehavior(obstacle, delta);
            }
            // Note: Obstacles are stationary in world, no velocity needed
            // Camera movement creates illusion of obstacles moving

            // Clean up obstacles that are off-screen (behind camera view)
            const camera = this.scene.cameras.main;
            const cameraLeftEdge = camera.scrollX;
            if (obstacle.x < cameraLeftEdge - 100) {
                if (Math.random() < 0.1) { // Log 10% of deletions to avoid spam
                    console.log('🗑️ Obstacle deleted (off-screen):', obstacle.texture.key);
                }
                obstacle.destroy();
            }
        });
    }

    /**
     * Schedule the next obstacle spawn
     */
    scheduleNextObstacle() {
        if (this.isGameOver) return;

        const config = GAME_CONFIG.OBSTACLES;
        const isHardMode = this.score >= 1000;
        const minDelay = isHardMode ? config.MIN_SPAWN_DELAY_HARD : config.MIN_SPAWN_DELAY;
        const maxDelay = isHardMode ? config.MAX_SPAWN_DELAY_HARD : config.MAX_SPAWN_DELAY;

        const delay = Phaser.Math.Between(minDelay, maxDelay);

        this.obstacleTimer = this.scene.time.delayedCall(delay, () => {
            if (!this.isGameOver && this.scene.scene.isActive()) {
                // 40% chance to spawn a gap instead of single obstacle (only after score 1500)
                if (this.score >= config.GAP_SCORE_THRESHOLD && Math.random() < config.GAP_CHANCE) {
                    this.spawnGap();
                } else {
                    this.spawnObstacle();
                }
                this.scheduleNextObstacle();
            }
        });
    }

    /**
     * Get available obstacle types based on current score
     * @returns {Array} Array of obstacle types with weights
     */
    getObstacleTypes() {
        const config = GAME_CONFIG.OBSTACLES;
        const obstacles = [
            { type: 'rock', weight: config.WEIGHTS.rock },
            { type: 'log', weight: config.WEIGHTS.log },
            { type: 'cactus', weight: config.WEIGHTS.cactus },
            { type: 'magpie', weight: config.WEIGHTS.magpie }
        ];

        // Add new obstacles based on score
        if (this.score >= config.UNLOCK_SCORES.koala) {
            obstacles.push({ type: 'koala', weight: config.WEIGHTS.koala });
        }
        if (this.score >= config.UNLOCK_SCORES.emu) {
            obstacles.push({ type: 'emu', weight: config.WEIGHTS.emu });
        }
        if (this.score >= config.UNLOCK_SCORES.camel) {
            obstacles.push({ type: 'camel', weight: config.WEIGHTS.camel });
        }
        if (this.score >= config.UNLOCK_SCORES.croc) {
            obstacles.push({ type: 'croc', weight: config.WEIGHTS.croc });
        }

        // Add Pixel Adventure obstacles based on score
        if (this.score >= config.UNLOCK_SCORES.bee) {
            obstacles.push({ type: 'bee', weight: config.WEIGHTS.bee });
        }
        if (this.score >= config.UNLOCK_SCORES.plant) {
            obstacles.push({ type: 'plant', weight: config.WEIGHTS.plant });
        }
        if (this.score >= config.UNLOCK_SCORES.snail) {
            obstacles.push({ type: 'snail', weight: config.WEIGHTS.snail });
        }
        if (this.score >= config.UNLOCK_SCORES.mushroom) {
            obstacles.push({ type: 'mushroom', weight: config.WEIGHTS.mushroom });
        }
        if (this.score >= config.UNLOCK_SCORES.trunk) {
            obstacles.push({ type: 'trunk', weight: config.WEIGHTS.trunk });
        }

        return obstacles;
    }

    /**
     * Select random obstacle type based on weighted probability
     * @param {Array} obstacleTypes - Available obstacle types
     * @returns {string} Selected obstacle type
     */
    selectRandomObstacle(obstacleTypes) {
        const totalWeight = obstacleTypes.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;
        let selectedType = null;

        for (let i = 0; i < obstacleTypes.length; i++) {
            random -= obstacleTypes[i].weight;
            if (random <= 0) {
                selectedType = obstacleTypes[i].type;
                break;
            }
        }

        if (!selectedType) {
            selectedType = obstacleTypes[0].type;
        }

        // Apply variant logic: 60% chance for variants
        const config = GAME_CONFIG.OBSTACLES;
        if (selectedType === 'rock') {
            return Math.random() < config.VARIANT_CHANCE ? 'spider_rock' : 'rock';
        } else if (selectedType === 'log') {
            return Math.random() < config.VARIANT_CHANCE ? 'snake_log' : 'log';
        }

        return selectedType;
    }

    /**
     * Spawn a single obstacle
     */
    spawnObstacle() {
        if (this.isGameOver) return;

        const obstacleTypes = this.getObstacleTypes();
        const randomType = this.selectRandomObstacle(obstacleTypes);

        if (randomType === 'magpie') {
            this.spawnMagpie();
        } else if (randomType === 'bee') {
            this.spawnBee();
        } else if (randomType === 'emu') {
            this.spawnRunningEmu();
        } else {
            this.spawnGroundObstacle(randomType);
        }
    }

    /**
     * Spawn a ground-based obstacle
     * @param {string} type - Obstacle type
     */
    spawnGroundObstacle(type) {
        const config = GAME_CONFIG.OBSTACLES;
        const kangaroo = this.scene.kangaroo;

        // Spawn ahead of kangaroo's current world position
        const spawnX = kangaroo ? kangaroo.x + 1000 : GAME_CONFIG.SPAWN.OBSTACLE_X;

        const obstacle = this.scene.physics.add.sprite(
            spawnX,
            this.groundY,
            type
        );

        // Calculate random size
        const baseSize = config.BASE_SIZES[type] || 0.5;
        const variation = config.SIZE_VARIATION;
        const randomMultiplier = 1 + (Math.random() * 2 - 1) * variation;
        const finalSize = baseSize * randomMultiplier;

        obstacle.setScale(finalSize);
        obstacle.setOrigin(0.5, 1);
        obstacle.body.setImmovable(true);
        obstacle.body.setGravityY(0);

        // Set collision boxes based on obstacle type
        this.setCollisionBox(obstacle, type);

        // Play animation for animated obstacles
        this.playObstacleAnimation(obstacle, type);

        this.obstacles.add(obstacle);
    }

    /**
     * Play animation for obstacle if it has one
     * @param {Phaser.GameObjects.Sprite} obstacle - The obstacle sprite
     * @param {string} type - Obstacle type
     */
    playObstacleAnimation(obstacle, type) {
        const animationMap = {
            bee: 'bee_fly',
            plant: 'plant_idle',
            snail: 'snail_walk',
            mushroom: 'mushroom_idle',
            trunk: 'trunk_walk'
        };

        if (animationMap[type]) {
            obstacle.play(animationMap[type]);
        }
    }

    /**
     * Set collision box for obstacle based on type
     * @param {Phaser.GameObjects.Sprite} obstacle - The obstacle sprite
     * @param {string} type - Obstacle type
     */
    setCollisionBox(obstacle, type) {
        switch(type) {
            case 'camel':
                obstacle.body.setSize(obstacle.width * 0.8, obstacle.height * 0.7);
                obstacle.body.setOffset(obstacle.width * 0.1, obstacle.height * 0.25);
                break;
            case 'koala':
                obstacle.body.setSize(obstacle.width * 0.3, obstacle.height * 0.7);
                obstacle.body.setOffset(obstacle.width * 0.35, obstacle.height * 0.23);
                break;
            case 'spider_rock':
                obstacle.body.setSize(obstacle.width * 0.8, obstacle.height * 0.6);
                obstacle.body.setOffset(obstacle.width * 0.1, obstacle.height * 0.35);
                break;
            case 'cactus':
                obstacle.body.setSize(obstacle.width * 0.8, obstacle.height * 0.8);
                obstacle.body.setOffset(obstacle.width * 0.1, obstacle.height * 0.2);
                break;
            case 'snake_log':
                obstacle.body.setSize(obstacle.width * 0.7, obstacle.height * 0.6);
                obstacle.body.setOffset(obstacle.width * 0.15, obstacle.height * 0.35);
                break;
            default:
                obstacle.body.setSize(obstacle.width * 0.8, obstacle.height * 0.8);
        }
    }

    /**
     * Spawn a flying magpie obstacle
     */
    spawnMagpie() {
        if (this.isGameOver) return;

        const config = GAME_CONFIG.MAGPIE;
        const kangaroo = this.scene.kangaroo;
        const spawnX = kangaroo ? kangaroo.x + 1000 : GAME_CONFIG.SPAWN.OBSTACLE_X;
        const startY = Phaser.Math.Between(config.MIN_Y, config.MAX_Y);
        const magpie = this.scene.physics.add.sprite(
            spawnX,
            startY,
            'magpie'
        );

        magpie.setScale(config.SCALE);
        magpie.setOrigin(0.5, 0.5);
        magpie.body.setImmovable(true);
        magpie.setVelocityY(0);
        magpie.body.pushable = false;
        magpie.body.setSize(magpie.width * 0.7, magpie.height * 0.5);

        // Start flying animation
        magpie.play('magpie_fly');

        // AI behavior properties
        magpie.swoopStarted = false;
        magpie.willSwoop = this.score >= config.SWOOP_CHANCE_THRESHOLD ?
            Math.random() < config.SWOOP_CHANCE : false;
        magpie.straightenTime = 0;
        magpie.isClimbingBack = false;
        magpie.swoopSpeed = this.gameSpeed * config.SWOOP_SPEED_MULTIPLIER;
        magpie.climbSpeed = this.gameSpeed * config.CLIMB_SPEED_MULTIPLIER;
        magpie.downTime = Math.max(
            config.MIN_DOWN_TIME,
            config.DOWN_TIME_FACTOR - (this.gameSpeed * 0.5)
        );

        this.obstacles.add(magpie);

        // Disable gravity
        this.scene.time.delayedCall(0, () => {
            if (magpie.body) {
                magpie.body.setAllowGravity(false);
                magpie.body.setVelocityY(0);
                magpie.body.setGravity(0, 0);
                magpie.body.setBounce(0);
            }
        });
    }

    /**
     * Spawn a flying bee obstacle
     */
    spawnBee() {
        if (this.isGameOver) return;

        const config = GAME_CONFIG.OBSTACLES;
        const baseSize = config.BASE_SIZES.bee || 2.0;
        const startY = Phaser.Math.Between(100, 250); // Fly at mid-height

        const bee = this.scene.physics.add.sprite(
            GAME_CONFIG.SPAWN.OBSTACLE_X,
            startY,
            'bee'
        );

        bee.setScale(baseSize);
        bee.setOrigin(0.5, 0.5);
        bee.body.setImmovable(true);
        bee.setVelocityY(0);
        bee.body.pushable = false;
        bee.body.setSize(bee.width * 0.6, bee.height * 0.6);

        // Start flying animation
        bee.play('bee_fly');

        // Mark as flying bee for special movement
        bee.isFlyingBee = true;
        bee.beeStartY = startY;
        bee.beeTime = 0;

        this.obstacles.add(bee);

        // Disable gravity
        this.scene.time.delayedCall(0, () => {
            if (bee.body) {
                bee.body.setAllowGravity(false);
                bee.body.setVelocityY(0);
                bee.body.setGravity(0, 0);
                bee.body.setBounce(0);
            }
        });
    }

    /**
     * Update magpie swooping behavior
     * @param {Phaser.GameObjects.Sprite} magpie - The magpie sprite
     * @param {number} delta - Time elapsed
     */
    updateMagpieBehavior(magpie, delta) {
        const config = GAME_CONFIG.MAGPIE;

        // No horizontal movement - magpie is stationary in world (camera creates illusion of movement)
        // Get kangaroo reference from scene
        const kangaroo = this.scene.kangaroo;
        if (!kangaroo) return;

        const distanceToKangaroo = magpie.x - kangaroo.x;
        const magpieHeight = magpie.y;
        const heightFromGround = this.groundY - magpieHeight;
        const swoopDistance = config.BASE_SWOOP_DISTANCE + heightFromGround;

        if (!magpie.swoopStarted && distanceToKangaroo <= swoopDistance && magpie.willSwoop) {
            magpie.swoopStarted = true;
        }

        if (magpie.swoopStarted && !magpie.isClimbingBack) {
            const targetY = this.groundY - 20;
            if (magpie.y < targetY) {
                magpie.y += magpie.swoopSpeed * delta / 1000;
                magpie.rotation = -Math.PI / 4; // Dive rotation
            } else {
                magpie.rotation = 0;
                magpie.straightenTime += delta;
                if (magpie.straightenTime >= magpie.downTime) {
                    magpie.isClimbingBack = true;
                }
            }
        }

        if (magpie.isClimbingBack) {
            const originalY = Phaser.Math.Between(config.MIN_Y, config.MAX_Y);
            if (magpie.y > originalY) {
                magpie.y -= magpie.climbSpeed * delta / 1000;
                magpie.rotation = Math.PI / 6; // Climb rotation
            } else {
                magpie.rotation = 0;
            }
        }
    }

    /**
     * Update bee flight behavior
     * @param {Phaser.GameObjects.Sprite} bee - The bee sprite
     * @param {number} delta - Time elapsed
     */
    updateBeeBehavior(bee, delta) {
        // Move bee horizontally faster than normal obstacles (1.3x game speed)
        bee.x -= this.gameSpeed * 1.3 * delta / 1000;

        // Increment bee animation time
        bee.beeTime += delta / 1000;

        // Apply sine wave vertical movement
        // Period: 2 seconds, amplitude: 30 pixels
        const verticalOffset = Math.sin(bee.beeTime * Math.PI) * 30;
        bee.y = bee.beeStartY + verticalOffset;
    }

    /**
     * Spawn a running emu obstacle
     */
    spawnRunningEmu() {
        if (this.isGameOver) return;

        const config = GAME_CONFIG.EMU;
        const obstacleConfig = GAME_CONFIG.OBSTACLES;
        const kangaroo = this.scene.kangaroo;
        const spawnX = kangaroo ? kangaroo.x + 1200 : config.SPAWN_X;

        const finalEmuSpeed = this.gameSpeed * config.SPEED_MULTIPLIER;
        const emu = this.scene.physics.add.sprite(spawnX, this.groundY, 'emu');

        const baseSize = obstacleConfig.BASE_SIZES.emu || 0.8;
        const variation = obstacleConfig.SIZE_VARIATION;
        const randomMultiplier = 1 + (Math.random() * 2 - 1) * variation;
        const finalSize = baseSize * randomMultiplier;

        emu.setScale(finalSize);
        emu.setOrigin(0.5, 1);
        emu.body.setImmovable(true);
        emu.body.setGravityY(0);
        emu.body.setSize(emu.width * 0.6, emu.height * 0.8);
        emu.body.setOffset(0, emu.height * 0.2);

        emu.play('emu_run');
        emu.isRunningEmu = true;
        emu.runSpeed = finalEmuSpeed;

        this.obstacles.add(emu);
    }

    /**
     * Spawn a gap of two obstacles close together
     */
    spawnGap() {
        if (this.isGameOver) return;

        // Spawn first obstacle
        this.spawnGapObstacle();

        // Schedule second obstacle
        const config = GAME_CONFIG.OBSTACLES;
        const isHardMode = this.score >= 3000;
        const minDelay = isHardMode ? config.GAP_MIN_DELAY_HARD : config.GAP_MIN_DELAY;
        const maxDelay = isHardMode ? config.GAP_MAX_DELAY_HARD : config.GAP_MAX_DELAY;
        const gapDelay = Phaser.Math.Between(minDelay, maxDelay);

        this.scene.time.delayedCall(gapDelay, () => {
            if (!this.isGameOver && this.scene.scene.isActive()) {
                this.spawnGapObstacle();
            }
        });
    }

    /**
     * Spawn an obstacle for gap pattern (excludes emus)
     */
    spawnGapObstacle() {
        if (this.isGameOver) return;

        const obstacleTypes = this.getObstacleTypes().filter(type => type.type !== 'emu');
        const randomType = this.selectRandomObstacle(obstacleTypes);

        if (randomType === 'magpie') {
            this.spawnMagpie();
        } else {
            this.spawnGroundObstacle(randomType);
        }
    }

    /**
     * Update game speed
     * @param {number} speed - New game speed
     */
    setGameSpeed(speed) {
        this.gameSpeed = speed;
    }

    /**
     * Update current score
     * @param {number} score - New score
     */
    setScore(score) {
        this.score = score;
    }

    /**
     * Set game over state
     * @param {boolean} value - Game over state
     */
    setGameOver(value) {
        this.isGameOver = value;
    }

    /**
     * Clean up timers and obstacles
     */
    cleanup() {
        if (this.obstacleTimer) {
            this.obstacleTimer.destroy();
            this.obstacleTimer = null;
        }
        if (this.obstacles) {
            this.obstacles.clear(true, true);
        }
    }

    /**
     * Get obstacles group
     * @returns {Phaser.Physics.Arcade.Group}
     */
    getObstacles() {
        return this.obstacles;
    }
}
