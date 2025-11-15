import { GAME_CONFIG } from '../config/GameConfig.js';

/**
 * EnvironmentManager
 * Handles background elements, ground decorations, and atmospheric effects
 */
export default class EnvironmentManager {
    /**
     * @param {Phaser.Scene} scene - The game scene
     */
    constructor(scene) {
        this.scene = scene;
        this.weeds = null;
        this.groundTextures = null;
        this.weedTimer = null;
        this.isGameOver = false;
        this.gameSpeed = GAME_CONFIG.DIFFICULTY.INITIAL_SPEED;
    }

    /**
     * Create all environment elements
     */
    create() {
        // Add background gradient
        this.createBackground();

        // Add atmospheric elements (sun and clouds)
        this.createBackgroundElements();

        // Create ground
        this.createGround();

        // Initialize groups for moving decorations
        this.weeds = this.scene.add.group();
        this.groundTextures = this.scene.add.group();

        // Add ground textures and start weed spawning
        this.addGroundTexture();
        this.scheduleNextWeed();
    }

    /**
     * Create background gradient
     */
    createBackground() {
        const graphics = this.scene.add.graphics();
        graphics.fillGradientStyle(
            GAME_CONFIG.COLORS.SKY_TOP,
            GAME_CONFIG.COLORS.SKY_TOP,
            GAME_CONFIG.COLORS.SKY_BOTTOM,
            GAME_CONFIG.COLORS.SKY_BOTTOM,
            1
        );
        graphics.fillRect(0, 0, GAME_CONFIG.CANVAS.WIDTH, GAME_CONFIG.CANVAS.HEIGHT);
    }

    /**
     * Create background elements (sun and clouds)
     */
    createBackgroundElements() {
        // Add a sun
        const sun = this.scene.add.graphics();
        sun.fillStyle(GAME_CONFIG.COLORS.SUN, 0.9);
        sun.fillCircle(0, 0, 30);
        sun.lineStyle(3, GAME_CONFIG.COLORS.SUN, 0.7);

        // Sun rays
        for (let i = 0; i < 8; i++) {
            const angle = (i * 45) * Math.PI / 180;
            const x1 = Math.cos(angle) * 35;
            const y1 = Math.sin(angle) * 35;
            const x2 = Math.cos(angle) * 45;
            const y2 = Math.sin(angle) * 45;
            sun.moveTo(x1, y1);
            sun.lineTo(x2, y2);
            sun.stroke();
        }
        sun.x = 700;
        sun.y = 70;

        // Add subtle rotation to sun
        this.scene.tweens.add({
            targets: sun,
            rotation: Math.PI * 2,
            duration: 20000,
            repeat: -1,
            ease: 'Linear'
        });

        // Generate random clouds
        const numClouds = Phaser.Math.Between(3, 6);

        for (let i = 0; i < numClouds; i++) {
            const cloud = this.scene.add.graphics();

            // Random cloud opacity and size
            const opacity = Phaser.Math.FloatBetween(0.5, 0.8);
            const baseSize = Phaser.Math.Between(15, 25);

            cloud.fillStyle(GAME_CONFIG.COLORS.CLOUD, opacity);

            // Create cloud with random bubble configuration
            const numBubbles = Phaser.Math.Between(3, 5);
            for (let j = 0; j < numBubbles; j++) {
                const bubbleX = Phaser.Math.Between(-baseSize, baseSize);
                const bubbleY = Phaser.Math.Between(-8, 8);
                const bubbleSize = Phaser.Math.Between(baseSize * 0.6, baseSize);
                cloud.fillCircle(bubbleX, bubbleY, bubbleSize);
            }

            // Random positioning
            cloud.x = Phaser.Math.Between(50, 750);
            cloud.y = Phaser.Math.Between(50, 200);

            // Add floating animation with random parameters
            this.scene.tweens.add({
                targets: cloud,
                x: cloud.x + Phaser.Math.Between(-30, 30),
                duration: Phaser.Math.Between(6000, 12000),
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
        }
    }

    /**
     * Create ground
     */
    createGround() {
        const ground = this.scene.add.graphics();
        ground.fillStyle(GAME_CONFIG.COLORS.GROUND);
        ground.fillRect(0, 500, GAME_CONFIG.CANVAS.WIDTH, 100);
    }

    /**
     * Add initial ground texture dots
     */
    addGroundTexture() {
        // Initial population across the screen
        for (let i = 0; i < GAME_CONFIG.GROUND.TEXTURE_DOTS; i++) {
            this.spawnGroundTextureDot();
        }

        // Add subtle horizontal lines for texture (these don't move)
        const textureGraphics = this.scene.add.graphics();
        textureGraphics.lineStyle(1, 0xD2691E, 0.3);
        for (let i = 0; i < 4; i++) {
            const y = 520 + (i * 20);
            textureGraphics.moveTo(0, y);
            textureGraphics.lineTo(GAME_CONFIG.CANVAS.WIDTH, y);
            textureGraphics.stroke();
        }
        textureGraphics.setDepth(2);
    }

    /**
     * Spawn a single ground texture dot
     */
    spawnGroundTextureDot() {
        const x = Phaser.Math.Between(0, GAME_CONFIG.CANVAS.WIDTH);
        const y = Phaser.Math.Between(510, 590);
        const size = Phaser.Math.FloatBetween(2, 6);
        const isDarkRock = Math.random() < 0.3;

        const dot = this.scene.add.graphics();
        if (isDarkRock) {
            dot.fillStyle(0x8B4513, 0.6);
        } else {
            dot.fillStyle(0xD2691E, 0.4);
        }
        dot.fillCircle(0, 0, size);
        dot.setPosition(x, y);
        dot.setDepth(2);

        this.groundTextures.add(dot);
    }

    /**
     * Schedule next weed spawn
     */
    scheduleNextWeed() {
        if (this.isGameOver) return;

        const config = GAME_CONFIG.GROUND;
        const delay = Phaser.Math.Between(config.WEED_MIN_DELAY, config.WEED_MAX_DELAY);

        this.weedTimer = this.scene.time.delayedCall(delay, () => {
            if (!this.isGameOver && this.scene.scene.isActive()) {
                this.spawnWeed();
                this.scheduleNextWeed();
            }
        });
    }

    /**
     * Spawn a weed decoration
     */
    spawnWeed() {
        if (this.isGameOver) return;

        const config = GAME_CONFIG.GROUND;
        const groundY = 500;
        const floorHeight = 100;
        const weedZoneHeight = floorHeight * 0.8;

        const x = 850; // Spawn off-screen right
        const y = Phaser.Math.Between(groundY, groundY + weedZoneHeight);
        const scale = Phaser.Math.FloatBetween(config.WEED_MIN_SCALE, config.WEED_MAX_SCALE);

        const weed = this.scene.add.image(x, y, 'weed');
        weed.setScale(scale);
        weed.setOrigin(0.5, 1);
        weed.setDepth(1);
        weed.setAlpha(Phaser.Math.FloatBetween(config.WEED_ALPHA_MIN, config.WEED_ALPHA_MAX));
        weed.setTint(0xB8860B); // Brownish tint

        this.weeds.add(weed);
    }

    /**
     * Update environment elements
     * @param {number} delta - Time elapsed since last frame
     */
    update(delta) {
        if (this.isGameOver) return;

        // Move weeds
        this.weeds.children.entries.slice().forEach((weed) => {
            if (!weed || !weed.active) return;

            weed.x -= (this.gameSpeed * 1) * delta / 1000;

            if (weed.x < -100) {
                this.weeds.remove(weed);
                weed.destroy();
            }
        });

        // Move ground texture dots
        this.groundTextures.children.entries.slice().forEach((dot) => {
            if (!dot || !dot.active) return;

            dot.x -= (this.gameSpeed * 1) * delta / 1000;

            if (dot.x < -50) {
                this.groundTextures.remove(dot);
                dot.destroy();
            }
        });

        // Spawn new ground texture dots from the right side
        if (Math.random() < GAME_CONFIG.GROUND.GROUND_TEXTURE_SPAWN_CHANCE) {
            const dot = this.scene.add.graphics();
            const y = Phaser.Math.Between(510, 590);
            const size = Phaser.Math.FloatBetween(2, 6);
            const isDarkRock = Math.random() < 0.3;

            if (isDarkRock) {
                dot.fillStyle(0x8B4513, 0.6);
            } else {
                dot.fillStyle(0xD2691E, 0.4);
            }
            dot.fillCircle(0, 0, size);
            dot.setPosition(850, y);
            dot.setDepth(2);

            this.groundTextures.add(dot);
        }
    }

    /**
     * Set game speed
     * @param {number} speed - New game speed
     */
    setGameSpeed(speed) {
        this.gameSpeed = speed;
    }

    /**
     * Set game over state
     * @param {boolean} value - Game over state
     */
    setGameOver(value) {
        this.isGameOver = value;
    }

    /**
     * Clean up timers and decorations
     */
    cleanup() {
        if (this.weedTimer) {
            this.weedTimer.destroy();
            this.weedTimer = null;
        }

        if (this.weeds) {
            this.weeds.clear(true, true);
        }

        if (this.groundTextures) {
            this.groundTextures.clear(true, true);
        }
    }
}
