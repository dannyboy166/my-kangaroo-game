import { GAME_CONFIG } from '../config/GameConfig.js';
import GameDataManager from '../managers/GameDataManager.js';
import StoreManager from '../managers/StoreManager.js';
import ObstacleManager from '../managers/ObstacleManager.js';
import PowerupManager from '../managers/PowerupManager.js';
import CollectibleManager from '../managers/CollectibleManager.js';
import EnvironmentManager from '../managers/EnvironmentManager.js';
import UIManager from '../managers/UIManager.js';

/**
 * GameScene
 * Main gameplay scene - now streamlined with manager-based architecture
 */
export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });

        // Core game state
        this.score = 0;
        this.gameSpeed = GAME_CONFIG.DIFFICULTY.INITIAL_SPEED;
        this.isGameOver = false;
        this.lastSpeedIncrease = false;

        // Player state
        this.kangaroo = null;
        this.helmetEquipped = false;
        this.collisionCooldown = false;

        // Managers
        this.gameDataManager = GameDataManager.getInstance();
        this.storeManager = null;
        this.audioManager = null;
        this.obstacleManager = null;
        this.powerupManager = null;
        this.collectibleManager = null;
        this.environmentManager = null;
        this.uiManager = null;

        // Physics
        this.groundBody = null;
        this.cursors = null;
        this.spaceKey = null;
        this.key1 = null;
        this.key2 = null;
        this.key3 = null;
    }

    /**
     * Create the game scene
     * @param {Object} data - Data passed from previous scene
     */
    create(data) {
        console.log('🎮 GameScene: Initializing with manager-based architecture');

        // Store audio manager from menu scene
        this.audioManager = data.audioManager;

        // Initialize managers
        this.initializeManagers();

        // Check for helmet equipment
        this.checkHelmetEquipment();

        // Reset game state
        this.resetGameState();

        // Create environment (background, ground, decorations)
        this.environmentManager.create();

        // Create player
        this.createPlayer();

        // Create physics ground
        this.createPhysicsGround();

        // Create UI
        this.uiManager.create();

        // Setup input
        this.setupInput();

        // Start game systems
        this.startGameSystems();

        // Setup collision detection
        this.setupCollisions();

        console.log('✅ GameScene: Initialization complete');
    }

    /**
     * Initialize all manager systems
     */
    initializeManagers() {
        this.storeManager = new StoreManager();
        this.obstacleManager = new ObstacleManager(this);
        this.powerupManager = new PowerupManager(this, this.storeManager);
        this.collectibleManager = new CollectibleManager(this, this.gameDataManager);
        this.environmentManager = new EnvironmentManager(this);
        this.uiManager = new UIManager(this, this.gameDataManager, this.storeManager);
    }

    /**
     * Check if player has helmet equipped
     */
    checkHelmetEquipment() {
        const helmetCount = this.storeManager.getPowerUpCount('helmet');
        this.helmetEquipped = helmetCount > 0;
        console.log(`🪖 Helmet: ${this.helmetEquipped ? 'Equipped' : 'Not equipped'}`);
    }

    /**
     * Reset all game state
     */
    resetGameState() {
        this.isGameOver = false;
        this.score = 0;
        this.gameSpeed = GAME_CONFIG.DIFFICULTY.INITIAL_SPEED;
        this.collisionCooldown = false;
        this.lastSpeedIncrease = false;
    }

    /**
     * Create player kangaroo sprite
     */
    createPlayer() {
        // Create kangaroo animations if they don't exist
        this.createKangarooAnimations();

        // Choose sprite based on helmet equipment
        const spriteKey = this.helmetEquipped ? 'kangaroo_helmet' : 'kangaroo';
        const runAnimKey = this.helmetEquipped ? 'kangaroo_helmet_run' : 'kangaroo_run';

        // Create kangaroo sprite
        const config = GAME_CONFIG.KANGAROO;
        this.kangaroo = this.physics.add.sprite(
            config.X,
            GAME_CONFIG.DIFFICULTY.GROUND_Y,
            spriteKey
        );

        this.kangaroo.setScale(config.SCALE);
        this.kangaroo.setCollideWorldBounds(true);
        this.kangaroo.body.setSize(config.BODY_WIDTH, config.BODY_HEIGHT);
        this.kangaroo.body.setOffset(config.BODY_OFFSET_X, config.BODY_OFFSET_Y);
        this.kangaroo.body.setGravityY(GAME_CONFIG.PHYSICS.KANGAROO_GRAVITY);
        this.kangaroo.setOrigin(0.5, 1);
        this.kangaroo.setDepth(100); // Ensure kangaroo is always in front of everything
        this.kangaroo.play(runAnimKey);
    }

    /**
     * Create kangaroo animations
     */
    createKangarooAnimations() {
        // Regular kangaroo animations
        if (!this.anims.exists('kangaroo_run')) {
            this.anims.create({
                key: 'kangaroo_run',
                frames: this.anims.generateFrameNumbers('kangaroo', { start: 0, end: 11 }),
                frameRate: 15,
                repeat: -1
            });
            this.anims.create({
                key: 'kangaroo_jump',
                frames: [{ key: 'kangaroo', frame: 2 }],
                frameRate: 1
            });
        }

        // Helmet kangaroo animations
        if (!this.anims.exists('kangaroo_helmet_run')) {
            this.anims.create({
                key: 'kangaroo_helmet_run',
                frames: this.anims.generateFrameNumbers('kangaroo_helmet', { start: 0, end: 11 }),
                frameRate: 15,
                repeat: -1
            });
            this.anims.create({
                key: 'kangaroo_helmet_jump',
                frames: [{ key: 'kangaroo_helmet', frame: 2 }],
                frameRate: 1
            });
        }

        // Emu animations
        if (!this.anims.exists('emu_run')) {
            this.anims.create({
                key: 'emu_run',
                frames: this.anims.generateFrameNumbers('emu', { start: 0, end: 3 }),
                frameRate: 6,
                repeat: -1
            });
        }

        // Magpie animations
        if (!this.anims.exists('magpie_fly')) {
            this.anims.create({
                key: 'magpie_fly',
                frames: this.anims.generateFrameNumbers('magpie', { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
        }

        // Pixel Adventure obstacle animations (corrected frame counts)
        if (!this.anims.exists('bee_fly')) {
            this.anims.create({
                key: 'bee_fly',
                frames: this.anims.generateFrameNumbers('bee', { start: 0, end: 5 }), // 6 frames
                frameRate: 10,
                repeat: -1
            });
        }
        if (!this.anims.exists('plant_idle')) {
            this.anims.create({
                key: 'plant_idle',
                frames: this.anims.generateFrameNumbers('plant', { start: 0, end: 10 }), // 11 frames
                frameRate: 8,
                repeat: -1
            });
        }
        if (!this.anims.exists('snail_walk')) {
            this.anims.create({
                key: 'snail_walk',
                frames: this.anims.generateFrameNumbers('snail', { start: 0, end: 13 }), // 14 frames
                frameRate: 6,
                repeat: -1
            });
        }
        if (!this.anims.exists('mushroom_idle')) {
            this.anims.create({
                key: 'mushroom_idle',
                frames: this.anims.generateFrameNumbers('mushroom', { start: 0, end: 13 }), // 14 frames (FIXED)
                frameRate: 8,
                repeat: -1
            });
        }
        if (!this.anims.exists('trunk_walk')) {
            this.anims.create({
                key: 'trunk_walk',
                frames: this.anims.generateFrameNumbers('trunk', { start: 0, end: 13 }), // 14 frames (FIXED)
                frameRate: 10,
                repeat: -1
            });
        }
    }

    /**
     * Create invisible physics ground
     */
    createPhysicsGround() {
        const GROUND_Y = GAME_CONFIG.DIFFICULTY.GROUND_Y; // 520
        this.groundBody = this.physics.add.staticGroup();
        const groundCollider = this.groundBody.create(400, GROUND_Y + 1, null);
        groundCollider.setSize(2000, 2);
        groundCollider.setVisible(false);
    }

    /**
     * Setup input controls
     */
    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
        this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
        this.input.on('pointerdown', this.jump, this);
    }

    /**
     * Start all game systems
     */
    startGameSystems() {
        this.obstacleManager.create();
        this.powerupManager.create();
        this.collectibleManager.create();
    }

    /**
     * Setup collision detection
     */
    setupCollisions() {
        // Kangaroo collides with ground
        this.physics.add.collider(this.kangaroo, this.groundBody);

        // Obstacles collide with ground
        this.physics.add.collider(this.obstacleManager.getObstacles(), this.groundBody);

        // Kangaroo overlaps with obstacles
        this.physics.add.overlap(
            this.kangaroo,
            this.obstacleManager.getObstacles(),
            this.handleObstacleCollision,
            null,
            this
        );

        // Kangaroo overlaps with coins
        this.physics.add.overlap(
            this.kangaroo,
            this.collectibleManager.getCoins(),
            this.handleCoinCollection,
            null,
            this
        );

        // Kangaroo overlaps with powerups
        this.physics.add.overlap(
            this.kangaroo,
            this.powerupManager.getPowerups(),
            this.handlePowerupCollection,
            null,
            this
        );
    }

    /**
     * Main update loop
     * @param {number} time - Total elapsed time
     * @param {number} delta - Time since last frame
     */
    update(time, delta) {
        if (this.isGameOver) return;

        // Update managers
        this.obstacleManager.update(delta);
        this.powerupManager.update(delta);
        this.collectibleManager.update(delta, this.powerupManager.hasMagnet());
        this.environmentManager.update(delta);

        // Handle input
        this.handleInput();

        // Update player animation
        this.updatePlayerAnimation();

        // Update score and difficulty
        this.updateScore(delta);

        // Update UI
        this.uiManager.updateScore(this.score);
        this.uiManager.updatePowerupDisplay(this.powerupManager.getActivePowerups());
    }

    /**
     * Handle player input
     */
    handleInput() {
        // Jump input
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
            Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.jump();
        }

        // Powerup activation inputs
        if (Phaser.Input.Keyboard.JustDown(this.key1)) {
            const activated = this.powerupManager.activatePurchasedPowerup('shield', this.audioManager);
            if (activated) this.uiManager.updateInventoryDisplay();
        }
        if (Phaser.Input.Keyboard.JustDown(this.key2)) {
            const activated = this.powerupManager.activatePurchasedPowerup('magnet', this.audioManager);
            if (activated) this.uiManager.updateInventoryDisplay();
        }
        if (Phaser.Input.Keyboard.JustDown(this.key3)) {
            const activated = this.powerupManager.activatePurchasedPowerup('double', this.audioManager);
            if (activated) this.uiManager.updateInventoryDisplay();
        }
    }

    /**
     * Handle player jump
     */
    jump() {
        const isOnGround = this.kangaroo.body.blocked.down || this.kangaroo.body.touching.down;

        if (isOnGround) {
            // Normal jump
            this.kangaroo.setVelocityY(GAME_CONFIG.PHYSICS.JUMP_VELOCITY);
            this.audioManager?.playJump();
            this.powerupManager.enableDoubleJump();
        } else if (this.powerupManager.canDoubleJump()) {
            // Double jump
            this.kangaroo.setVelocityY(GAME_CONFIG.PHYSICS.DOUBLE_JUMP_VELOCITY);
            this.audioManager?.playDoubleJump();
            this.powerupManager.useDoubleJump();
        }
    }

    /**
     * Update player animation based on state
     */
    updatePlayerAnimation() {
        // Only check blocked.down for more reliable ground detection
        const isOnGround = this.kangaroo.body.blocked.down;
        const currentAnim = this.kangaroo.anims.currentAnim?.key;

        const runAnimKey = this.helmetEquipped ? 'kangaroo_helmet_run' : 'kangaroo_run';
        const jumpAnimKey = this.helmetEquipped ? 'kangaroo_helmet_jump' : 'kangaroo_jump';

        if (isOnGround) {
            if (currentAnim !== runAnimKey) {
                this.kangaroo.play(runAnimKey);
                this.powerupManager.resetDoubleJump();
            }
        } else {
            if (currentAnim !== jumpAnimKey) {
                this.kangaroo.play(jumpAnimKey);
            }
        }
    }

    /**
     * Update score and difficulty progression
     * @param {number} delta - Time since last frame
     */
    updateScore(delta) {
        // Increase score
        this.score += 0.5;

        // Increase game speed every 50 points
        const config = GAME_CONFIG.DIFFICULTY;
        const flooredScore = Math.floor(this.score);

        if (flooredScore % config.SPEED_INCREASE_INTERVAL === 0 && !this.lastSpeedIncrease) {
            this.gameSpeed += config.SPEED_INCREASE_AMOUNT;
            this.lastSpeedIncrease = true;

            // Update all managers with new speed
            this.obstacleManager.setGameSpeed(this.gameSpeed);
            this.powerupManager.setGameSpeed(this.gameSpeed);
            this.collectibleManager.setGameSpeed(this.gameSpeed);
            this.environmentManager.setGameSpeed(this.gameSpeed);

        } else if (flooredScore % config.SPEED_INCREASE_INTERVAL !== 0) {
            this.lastSpeedIncrease = false;
        }

        // Update managers with current score
        this.obstacleManager.setScore(this.score);
    }

    /**
     * Handle collision with obstacle
     * @param {Phaser.GameObjects.Sprite} kangaroo - Kangaroo sprite
     * @param {Phaser.GameObjects.Sprite} obstacle - Obstacle sprite
     */
    handleObstacleCollision(kangaroo, obstacle) {
        if (this.collisionCooldown || this.isGameOver) return;

        // Helmet protection against magpies
        if (this.helmetEquipped && obstacle.texture?.key === 'magpie') {
            console.log('🪖 Helmet protected from magpie!');
            this.audioManager?.playCollision();

            // Visual feedback
            this.kangaroo.setTint(0x00FFFF);
            this.time.delayedCall(200, () => this.kangaroo.clearTint());

            obstacle.destroy();
            this.collisionCooldown = true;
            this.time.delayedCall(300, () => this.collisionCooldown = false);
            return;
        }

        // Shield protection
        if (this.powerupManager.hasShield()) {
            this.collisionCooldown = true;
            this.audioManager?.playCollision();

            // Deactivate shield
            this.powerupManager.deactivateShield();

            // Visual feedback
            this.kangaroo.setTint(0x00FF00);
            this.time.delayedCall(200, () => this.kangaroo.clearTint());

            obstacle.destroy();
            this.time.delayedCall(500, () => this.collisionCooldown = false);
            return;
        }

        // Game over
        this.triggerGameOver(obstacle);
    }

    /**
     * Handle coin collection
     * @param {Phaser.GameObjects.Sprite} kangaroo - Kangaroo sprite
     * @param {Phaser.GameObjects.Image} coin - Coin image
     */
    handleCoinCollection(kangaroo, coin) {
        const result = this.collectibleManager.collectCoin(coin, this.audioManager);
        if (result) {
            this.score += result.scoreBonus;
            this.uiManager.updateCoins();
        }
    }

    /**
     * Handle powerup collection
     * @param {Phaser.GameObjects.Sprite} kangaroo - Kangaroo sprite
     * @param {Phaser.GameObjects.Image} powerup - Powerup image
     */
    handlePowerupCollection(kangaroo, powerup) {
        this.powerupManager.collectPowerup(powerup, this.audioManager);
    }

    /**
     * Trigger game over sequence
     * @param {Phaser.GameObjects.Sprite} obstacle - The obstacle that caused game over
     */
    triggerGameOver(obstacle) {
        this.collisionCooldown = true;
        this.isGameOver = true;

        // Play game over sound
        this.time.delayedCall(50, () => this.audioManager?.playGameOver());

        // Stop inputs
        this.input.off('pointerdown', this.jump, this);
        this.spaceKey.enabled = false;
        this.cursors.up.enabled = false;

        // Stop kangaroo
        this.kangaroo.setVelocity(0, 0);
        this.kangaroo.setTint(0xff6666);
        this.kangaroo.anims.stop();
        this.kangaroo.setFrame(2);
        this.kangaroo.setDepth(10);

        // Set all managers to game over
        this.obstacleManager.setGameOver(true);
        this.powerupManager.setGameOver(true);
        this.collectibleManager.setGameOver(true);
        this.environmentManager.setGameOver(true);

        // Crash animation
        this.tweens.add({
            targets: this.kangaroo,
            angle: 90,
            duration: 500,
            ease: 'Power2'
        });

        // Transition to game over scene
        this.time.delayedCall(1000, () => {
            const obstacleType = obstacle.texture ? obstacle.texture.key : 'rock';

            // Reset helmet if equipped
            if (this.helmetEquipped) {
                this.storeManager.helmetCount = 0;
                this.storeManager.saveData();
                console.log('🪖 Helmet used up');
            }

            this.scene.start('GameOverScene', {
                score: this.score,
                audioManager: this.audioManager,
                obstacleType: obstacleType
            });
        });
    }

    /**
     * Clean up when scene shuts down
     */
    shutdown() {
        console.log('🧹 GameScene: Cleaning up');

        // Cleanup managers
        this.obstacleManager?.cleanup();
        this.powerupManager?.cleanup();
        this.collectibleManager?.cleanup();
        this.environmentManager?.cleanup();

        // Remove input listeners
        this.input.off('pointerdown', this.jump, this);

        // Clear tweens
        this.tweens.killAll();

        // Reset state
        this.isGameOver = false;
        this.collisionCooldown = false;
    }
}
