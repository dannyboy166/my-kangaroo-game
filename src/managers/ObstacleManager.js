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

            // Magpie swooping AI behavior
            if (obstacle.texture.key === 'magpie') {
                this.updateMagpieBehavior(obstacle, delta);
            }

            if (obstacle.x < cameraLeftEdge - 100) {
                obstacle.setActive(false);
                obstacle.setVisible(false);
            }
        });
    }

    /**
     * AI behavior for swooping magpies
     * - Fly straight until close to kangaroo
     * - Swoop down in dive attack
     * - Stay low briefly
     * - Climb back up to original height
     */
    updateMagpieBehavior(magpie, delta) {
        const kangaroo = this.scene.kangaroo;
        if (!kangaroo) return;

        // Check if magpie is close enough to start swooping
        const distanceToKangaroo = magpie.x - kangaroo.x;

        // Calculate swoop distance using physics: distance = speed × time
        // Magpies swoop at CONSTANT speed (400px/sec)
        // Trigger distance scales with game speed automatically

        const CONSTANT_SWOOP_SPEED = 400; // Fixed swoop speed (px/sec)
        const STRAIGHTEN_TIME = 0.3; // Time magpie stays at ground (seconds)

        const magpieHeight = magpie.y;
        const targetY = this.groundY - 20; // Where magpie swoops to
        const verticalDistance = targetY - magpieHeight; // How far down (in pixels)

        // Time needed to swoop down (in seconds)
        const timeToSwoop = verticalDistance / CONSTANT_SWOOP_SPEED;

        // Total time before magpie is safe to hit
        const totalTime = timeToSwoop + STRAIGHTEN_TIME;

        // In that time, kangaroo travels this far (distance = speed × time)
        // At 300 speed: travels ~X px
        // At 600 speed: travels ~2X px (automatically doubles!)
        // At 900 speed: travels ~3X px (automatically triples!)
        const swoopDistance = this.gameSpeed * totalTime * 2; // 10% safety buffer

        const swoopStarted = magpie.getData('swoopStarted');
        const willSwoop = magpie.getData('willSwoop');
        const isClimbingBack = magpie.getData('isClimbingBack');
        // swoopSpeed already declared above for physics calculation
        const climbSpeed = magpie.getData('climbSpeed');
        const initialY = magpie.getData('initialY');

        if (!swoopStarted && distanceToKangaroo <= swoopDistance && willSwoop) {
            // Start swooping down
            magpie.setData('swoopStarted', true);
        }

        if (magpie.getData('swoopStarted') && !isClimbingBack) {
            // Swoop down towards ground level at CONSTANT speed
            const CONSTANT_SWOOP_SPEED = 400; // Same as trigger calculation
            const targetY = this.groundY - 20; // Slightly above ground
            const currentY = magpie.y;

            if (currentY < targetY) {
                // Dive down at constant speed
                magpie.y += CONSTANT_SWOOP_SPEED * delta / 1000;
                magpie.setRotation(-Math.PI / 4); // -45 degrees (diving tilt)
            } else {
                // Reached bottom, start straightening phase
                magpie.setRotation(0);
                const straightenTime = magpie.getData('straightenTime') || 0;
                magpie.setData('straightenTime', straightenTime + delta);

                // After 300ms of being straight, start climbing back up
                if (magpie.getData('straightenTime') >= 300) {
                    magpie.setData('isClimbingBack', true);
                }
            }
        }

        if (magpie.getData('isClimbingBack')) {
            // Climb back up to original height at CONSTANT speed
            const CONSTANT_CLIMB_SPEED = 300; // Constant climb speed (px/sec)
            if (magpie.y > initialY) {
                magpie.y -= CONSTANT_CLIMB_SPEED * delta / 1000;
                magpie.setRotation(Math.PI / 6); // +30 degrees (climbing tilt)
            } else {
                // Back to normal flying
                magpie.setRotation(0);
            }
        }
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
            // Reuse existing obstacle - RESET ALL STATE

            // CRITICAL: Stop any playing animations before changing texture
            if (obstacle.anims) {
                obstacle.anims.stop();
            }

            obstacle.setTexture(type);
            obstacle.setOrigin(0.5, 1); // Bottom-center anchor (sits on ground)
            obstacle.setPosition(spawnX, this.groundY);
            obstacle.setRotation(0); // Reset rotation from previous obstacle (e.g., tilted magpie)
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

        // Spawn collectibles around this obstacle
        const rand = Math.random();
        if (rand < 0.4) {
            // 40% chance: spawn coin
            this.spawnCoinsAroundObstacle(obstacleSpawnInfo);
        } else if (rand < 0.5) {
            // 10% chance: spawn powerup
            this.spawnPowerupAroundObstacle(obstacleSpawnInfo);
        }
        // 50% chance: spawn nothing
    }

    /**
     * Spawn coins in safe positions around an obstacle
     * @param {Object} obstacleInfo - Obstacle spawn information
     */
    spawnCoinsAroundObstacle(obstacleInfo) {
        const collectibleManager = this.scene.collectibleManager;
        if (!collectibleManager) return;

        let coinX, coinY;

        if (obstacleInfo.isFlying) {
            // Flying obstacle (magpie) - spawn coins above or below it
            const offsetY = Math.random() < 0.5 ? -80 : 80; // Above or below
            coinX = obstacleInfo.x + 100; // Slightly ahead
            coinY = obstacleInfo.y + offsetY;
        } else {
            // Ground obstacle - spawn coins high in the air
            const safeYPositions = [200, 250, 300, 350];
            coinY = Phaser.Utils.Array.GetRandom(safeYPositions);
            coinX = obstacleInfo.x + 100; // Slightly ahead
        }

        // Check if this position overlaps with ANY obstacle
        const overlapsObstacle = this.obstacles.children.entries.some(obstacle => {
            if (!obstacle.active) return false;

            const horizontalDistance = Math.abs(obstacle.x - coinX);
            const verticalDistance = Math.abs(obstacle.y - coinY);

            // Use buffer zone: 100px horizontal, 100px vertical
            return horizontalDistance < 100 && verticalDistance < 100;
        });

        // Only spawn if clear
        if (!overlapsObstacle) {
            collectibleManager.spawnCoinAtPosition(coinX, coinY);
        }
    }

    /**
     * Spawn powerup in safe positions around an obstacle
     * @param {Object} obstacleInfo - Obstacle spawn information
     */
    spawnPowerupAroundObstacle(obstacleInfo) {
        const powerupManager = this.scene.powerupManager;
        if (!powerupManager) return;

        let powerupX, powerupY;

        if (obstacleInfo.isFlying) {
            // Flying obstacle - spawn powerup above or below it
            const offsetY = Math.random() < 0.5 ? -100 : 100;
            powerupX = obstacleInfo.x + 120; // Slightly more ahead than coins
            powerupY = obstacleInfo.y + offsetY;
        } else {
            // Ground obstacle - spawn powerup high in air
            const safeYPositions = [180, 230, 280, 330];
            powerupY = Phaser.Utils.Array.GetRandom(safeYPositions);
            powerupX = obstacleInfo.x + 120; // Slightly more ahead than coins
        }

        // Check if this position overlaps with ANY obstacle
        const overlapsObstacle = this.obstacles.children.entries.some(obstacle => {
            if (!obstacle.active) return false;

            const horizontalDistance = Math.abs(obstacle.x - powerupX);
            const verticalDistance = Math.abs(obstacle.y - powerupY);

            // Use buffer zone: 120px horizontal, 120px vertical
            return horizontalDistance < 120 && verticalDistance < 120;
        });

        // Only spawn if clear
        if (!overlapsObstacle) {
            powerupManager.spawnPowerupAtPosition(powerupX, powerupY);
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
            'log': { scale: 0.6, width: 160, height: 135 },  // 2x bigger (0.45 * 2 = 0.9)
            'snake_log': { scale: 0.9, width: 180, height: 72 },  // Collider: 0.8x taller
            'emu': { scale: 1.125, width: 75, height: 112.5 },  // Visual 1.5x bigger, collider same proportion
            'croc': { scale: 0.75, width: 168, height: 72 },  // Collider: 1.5x wide, 1.2x higher
            'camel': { scale: 1.26, width: 105, height: 100.8 },  // Visual 1.2x bigger (1.575 * 0.8), collider same proportion
            'koala': { scale: 1, width: 60, height: 150 }  // 1.6x bigger (0.75 * 1.6 = 1.2)
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
            // Reuse existing obstacle - RESET ALL STATE
            obstacle.setTexture(type);
            obstacle.setOrigin(0.5, 0.5); // Center anchor for flying
            obstacle.setScale(0.75); // Between 0.6 and 0.9
            obstacle.setPosition(spawnX, spawnY);
            obstacle.setRotation(0); // Reset rotation from previous swoop!
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
            obstacle.setScale(0.75); // Between 0.6 and 0.9
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

        // Store swooping AI data on the magpie
        // Magpies swoop at CONSTANT speeds regardless of game speed
        // Physics calculations handle trigger distance automatically
        obstacle.setData('initialY', spawnY); // Remember starting height
        obstacle.setData('swoopStarted', false);
        obstacle.setData('willSwoop', Math.random() < 0.5); // 50% chance to swoop
        obstacle.setData('straightenTime', 0);
        obstacle.setData('isClimbingBack', false);

        // Always reset velocity (pooled objects might have old velocity)
        obstacle.setVelocityX(0);
        obstacle.setVelocityY(0);

        // Spawn collectibles around this flying obstacle
        const rand = Math.random();
        if (rand < 0.4) {
            // 40% chance: spawn coin
            this.spawnCoinsAroundObstacle(obstacleSpawnInfo);
        } else if (rand < 0.5) {
            // 10% chance: spawn powerup
            this.spawnPowerupAroundObstacle(obstacleSpawnInfo);
        }
        // 50% chance: spawn nothing
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
