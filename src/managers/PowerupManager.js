import { GAME_CONFIG } from '../config/GameConfig.js';

/**
 * PowerupManager
 * Handles powerup spawning, collection, activation, and visual effects (orbs)
 *
 * Powerups are placed at fixed positions in world space (like obstacles/coins).
 * Camera movement creates the scrolling illusion - no velocity needed!
 */
export default class PowerupManager {
    /**
     * @param {Phaser.Scene} scene - The game scene
     * @param {StoreManager} storeManager - Store manager for purchased powerups
     */
    constructor(scene, storeManager) {
        this.scene = scene;
        this.storeManager = storeManager;
        this.powerups = null;
        this.powerupTimer = null;
        this.isGameOver = false;

        // Active powerup state
        this.activePowerups = {
            shield: { active: false, timeLeft: 0 },
            magnet: { active: false, timeLeft: 0 },
            double: { active: false, timeLeft: 0, jumpsLeft: 0 }
        };

        // Powerup orbs (visual indicators)
        this.powerupOrbs = {
            shield: [],
            magnet: [],
            double: []
        };
    }

    /**
     * Initialize powerup systems
     */
    create() {
        this.powerups = this.scene.physics.add.group();
        this.scheduleNextPowerup();
    }

    /**
     * Update powerup positions and timers
     * @param {number} delta - Time elapsed since last frame
     */
    update(delta) {
        if (this.isGameOver) return;

        // Debug logging every 180 frames
        if (!this.debugCounter) this.debugCounter = 0;
        this.debugCounter++;
        if (this.debugCounter % 180 === 0) {
            console.log('⚡ Powerup Manager Status:', {
                activePowerups: this.powerups.children.entries.length,
                activeEffects: Object.keys(this.activePowerups).filter(k => this.activePowerups[k].active).length,
                memoryNote: 'Visual effects cleaned up on deactivation'
            });
        }

        // Update powerup timers
        this.updatePowerupTimers(delta);

        const kangaroo = this.scene.kangaroo;
        if (!kangaroo) return;

        // Clean up powerups that are off-screen (behind camera view)
        const camera = this.scene.cameras.main;
        const cameraLeftEdge = camera.scrollX;
        this.powerups.children.entries.slice().forEach((powerup) => {
            if (!powerup || !powerup.active) return;

            if (powerup.x < cameraLeftEdge - 100) {
                powerup.destroy();
            }
        });

        // Update powerup orb positions
        this.updatePowerupOrbs(delta);
    }

    /**
     * Schedule next powerup spawn
     */
    scheduleNextPowerup() {
        if (this.isGameOver) return;

        const config = GAME_CONFIG.POWERUPS;
        const delay = Phaser.Math.Between(config.MIN_SPAWN_DELAY, config.MAX_SPAWN_DELAY);

        this.powerupTimer = this.scene.time.delayedCall(delay, () => {
            if (!this.isGameOver && this.scene.scene.isActive()) {
                this.spawnPowerup();
                this.scheduleNextPowerup();
            }
        });
    }

    /**
     * Spawn a random powerup at a position ahead of kangaroo
     */
    spawnPowerup() {
        if (this.isGameOver) return;

        const config = GAME_CONFIG.POWERUPS;
        const kangaroo = this.scene.kangaroo;
        const spawnX = kangaroo ? kangaroo.x + 900 : GAME_CONFIG.SPAWN.POWERUP_X;
        const powerupTypes = ['shield', 'magnet', 'double'];
        const randomType = Phaser.Utils.Array.GetRandom(powerupTypes);

        const powerupY = Phaser.Math.Between(
            config.MIN_Y,
            GAME_CONFIG.DIFFICULTY.GROUND_Y - config.MAX_Y_OFFSET
        );

        // Map powerup types to animations
        const animMap = {
            'shield': 'powerup_heart',     // Heart for shield
            'magnet': 'powerup_gem',       // Gem/box for magnet
            'double': 'powerup_coin'       // Gold coin for double jump
        };

        // Create using the group's create method with first frame of sprite sheet
        const powerup = this.powerups.create(spawnX, powerupY, 'powerup_items', 0);

        // Play animation
        powerup.play(animMap[randomType]);

        // Visual setup
        powerup.setScale(config.SCALE);
        powerup.setOrigin(0.5);
        powerup.setScrollFactor(1); // Move with camera like obstacles
        powerup.powerupType = randomType;

        // Physics setup - STATIC in world space
        // CRITICAL: Set these AFTER create() to prevent group from overriding
        powerup.body.setAllowGravity(false);
        powerup.body.setImmovable(true);
        powerup.body.pushable = false;
        powerup.body.setVelocity(0, 0); // No movement

        // Add glow effect
        this.scene.tweens.add({
            targets: powerup,
            scaleX: config.SCALE + 0.1,
            scaleY: config.SCALE + 0.1,
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    /**
     * Collect a powerup (from gameplay)
     * @param {Phaser.GameObjects.Sprite} powerup - The powerup object
     * @param {Object} audioManager - Audio manager for playing sounds
     */
    collectPowerup(powerup, audioManager) {
        const type = powerup.powerupType;

        // Play powerup-specific sound
        this.playPowerupSound(type, audioManager);

        // Activate powerup
        this.activatePowerup(type);

        // Visual effect
        const effectPowerup = this.scene.add.image(powerup.x, powerup.y, type);
        effectPowerup.setScale(0.6);

        this.scene.tweens.add({
            targets: effectPowerup,
            scaleX: 1.2,
            scaleY: 1.2,
            alpha: 0,
            duration: 400,
            onComplete: () => {
                effectPowerup.destroy();
            }
        });

        // Remove powerup
        this.powerups.remove(powerup);
        powerup.destroy();

        // Create powerup orb
        this.createPowerupOrb(type);
    }

    /**
     * Activate a purchased powerup (from inventory)
     * @param {string} type - Powerup type (shield, magnet, double)
     * @param {Object} audioManager - Audio manager for playing sounds
     * @returns {boolean} True if successfully activated
     */
    activatePurchasedPowerup(type, audioManager) {
        // Check if powerup is already active
        if (this.activePowerups[type].active) {
            return false;
        }

        // Check if player has purchased this powerup
        const storeType = type === 'double' ? 'doubleJump' : type;
        const count = this.storeManager.getPowerUpCount(storeType);
        if (count <= 0) {
            return false;
        }

        // Use the powerup (deduct from store)
        if (this.storeManager.usePowerUp(storeType)) {
            // Play powerup-specific sound
            this.playPowerupSound(type, audioManager);

            // Activate powerup
            this.activatePowerup(type);

            // Create powerup orb
            this.createPowerupOrb(type);

            return true;
        }

        return false;
    }

    /**
     * Activate a powerup effect
     * @param {string} type - Powerup type
     */
    activatePowerup(type) {
        const config = GAME_CONFIG.POWERUPS;
        const kangaroo = this.scene.kangaroo;

        this.activePowerups[type].active = true;
        this.activePowerups[type].timeLeft = config.DURATION;

        if (type === 'double' && kangaroo) {
            // Check if kangaroo is in the air when activating double jump
            const isOnGround = kangaroo.body.blocked.down || kangaroo.body.touching.down;
            this.activePowerups[type].jumpsLeft = isOnGround ? 0 : 1;
        }
    }

    /**
     * Play powerup-specific sound
     * @param {string} type - Powerup type
     * @param {Object} audioManager - Audio manager
     */
    playPowerupSound(type, audioManager) {
        if (!audioManager) return;

        switch(type) {
            case 'shield':
                audioManager.playShieldActivate();
                break;
            case 'magnet':
                audioManager.playMagnetActivate();
                break;
            case 'double':
                audioManager.playDoubleJump();
                break;
        }
    }

    /**
     * Update powerup timers
     * @param {number} delta - Time elapsed
     */
    updatePowerupTimers(delta) {
        Object.keys(this.activePowerups).forEach(type => {
            const powerup = this.activePowerups[type];

            if (powerup.active) {
                powerup.timeLeft -= delta;

                if (powerup.timeLeft <= 0) {
                    powerup.active = false;
                    powerup.timeLeft = 0;
                    if (type === 'double') {
                        powerup.jumpsLeft = 0;
                    }
                    // Remove orb when powerup expires
                    this.removePowerupOrb(type);
                }
            }
        });
    }

    /**
     * Create visual orbs for active powerup
     * @param {string} type - Powerup type
     */
    createPowerupOrb(type) {
        // Remove existing orbs of this type first
        this.removePowerupOrb(type);

        const config = GAME_CONFIG.POWERUPS.ORBS;
        const orbConfig = config.PROPERTIES[type];

        // Create multiple orbs for this powerup
        for (let i = 0; i < config.COUNT; i++) {
            const orb = this.scene.add.graphics();
            orb.fillStyle(orbConfig.color, 0.7);
            orb.fillCircle(0, 0, orbConfig.radius);
            orb.lineStyle(2, orbConfig.color, 1);
            orb.strokeCircle(0, 0, orbConfig.radius);

            // Add glow effect
            orb.setBlendMode(Phaser.BlendModes.ADD);

            // Set initial position and rotation data
            orb.orbType = type;
            orb.orbRadius = config.RADIUS;
            orb.currentAngle = this.getOrbStartAngle(type, i);
            orb.orbIndex = i;

            this.powerupOrbs[type].push(orb);
        }
    }

    /**
     * Get starting angle for powerup orb
     * @param {string} type - Powerup type
     * @param {number} orbIndex - Orb index
     * @returns {number} Starting angle in degrees
     */
    getOrbStartAngle(type, orbIndex) {
        const config = GAME_CONFIG.POWERUPS.ORBS;
        const angleSpacing = 360 / config.COUNT;
        return (config.START_ANGLES[type] || 0) + (orbIndex * angleSpacing);
    }

    /**
     * Update powerup orb positions around kangaroo
     * @param {number} delta - Time elapsed
     */
    updatePowerupOrbs(delta) {
        const kangaroo = this.scene.kangaroo;
        if (!kangaroo) return;

        const config = GAME_CONFIG.POWERUPS.ORBS;

        Object.keys(this.powerupOrbs).forEach(type => {
            const orbs = this.powerupOrbs[type];
            if (orbs && this.activePowerups[type].active) {
                orbs.forEach(orb => {
                    if (orb) {
                        // Update rotation angle
                        orb.currentAngle += config.ROTATION_SPEED * delta / 1000;

                        // Calculate position around kangaroo
                        const angleRad = Phaser.Math.DegToRad(orb.currentAngle);
                        orb.x = kangaroo.x + config.OFFSET_X + Math.cos(angleRad) * orb.orbRadius;
                        orb.y = kangaroo.y + config.OFFSET_Y + Math.sin(angleRad) * orb.orbRadius;
                    }
                });
            }
        });
    }

    /**
     * Remove powerup orb visuals
     * @param {string} type - Powerup type
     */
    removePowerupOrb(type) {
        if (this.powerupOrbs[type]) {
            this.powerupOrbs[type].forEach(orb => {
                if (orb) orb.destroy();
            });
            this.powerupOrbs[type] = [];
        }
    }

    /**
     * Check if shield is active
     * @returns {boolean}
     */
    hasShield() {
        return this.activePowerups.shield.active;
    }

    /**
     * Deactivate shield (used on collision)
     */
    deactivateShield() {
        this.activePowerups.shield.active = false;
        this.activePowerups.shield.timeLeft = 0;
        this.removePowerupOrb('shield');
    }

    /**
     * Check if magnet is active
     * @returns {boolean}
     */
    hasMagnet() {
        return this.activePowerups.magnet.active;
    }

    /**
     * Check if double jump is active and available
     * @returns {boolean}
     */
    canDoubleJump() {
        return this.activePowerups.double.active && this.activePowerups.double.jumpsLeft > 0;
    }

    /**
     * Use a double jump
     */
    useDoubleJump() {
        if (this.activePowerups.double.jumpsLeft > 0) {
            this.activePowerups.double.jumpsLeft--;
        }
    }

    /**
     * Reset double jump count (when landing on ground)
     */
    resetDoubleJump() {
        if (this.activePowerups.double.active) {
            this.activePowerups.double.jumpsLeft = 0;
        }
    }

    /**
     * Enable double jump (when in air with powerup active)
     */
    enableDoubleJump() {
        if (this.activePowerups.double.active) {
            this.activePowerups.double.jumpsLeft = 1;
        }
    }

    /**
     * Get active powerup data (for UI)
     * @returns {Object} Active powerup states
     */
    getActivePowerups() {
        return this.activePowerups;
    }

    /**
     * Set game over state
     * @param {boolean} value - Game over state
     */
    setGameOver(value) {
        this.isGameOver = value;
    }

    /**
     * Clean up timers and powerups
     */
    cleanup() {
        if (this.powerupTimer) {
            this.powerupTimer.destroy();
            this.powerupTimer = null;
        }

        // Clean up powerup orbs
        Object.keys(this.powerupOrbs).forEach(type => {
            this.removePowerupOrb(type);
        });

        if (this.powerups) {
            this.powerups.clear(true, true);
        }
    }

    /**
     * Get powerups group
     * @returns {Phaser.Physics.Arcade.Group}
     */
    getPowerups() {
        return this.powerups;
    }
}
