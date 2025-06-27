import GameDataManager from '../managers/GameDataManager.js';
import StoreManager from '../managers/StoreManager.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.gameSpeed = 500;
        this.score = 0;
        this.isGameOver = false;
        this.groundY = 450;
        this.obstacles = null;
        this.coins = null;
        this.powerups = null;
        this.obstacleTimer = null;
        this.coinTimer = null;
        this.powerupTimer = null;
        this.weedTimer = null;
        this.lastSpeedIncrease = false;
        this.gameDataManager = GameDataManager.getInstance();
        this.audioManager = null;

        // HELMET SYSTEM
        this.helmetEquipped = false;
        this.storeManager = null;

        // POWERUP SYSTEM
        this.activePowerups = {
            shield: { active: false, timeLeft: 0 },
            magnet: { active: false, timeLeft: 0 },
            double: { active: false, timeLeft: 0, jumpsLeft: 0 }
        };

        // POWERUP ORBS SYSTEM
        this.powerupOrbs = {
            shield: [],
            magnet: [],
            double: []
        };
        this.orbRotationSpeed = 200; // degrees per second
        this.orbsPerPowerup = 3;

        // OBSTACLE SIZE CONFIGURATION
        this.obstacleSizeVariation = 0.20; // ±20% variation from base size
        this.obstacleBaseSizes = {
            rock: 0.8,
            spider_rock: 0.75,
            cactus: 0.75,
            log: 0.5,
            snake_log: 0.78,
            emu: 0.8,
            croc: 0.55,
            camel: 1.0,
            koala: 0.8
        };

        // COLLISION PROTECTION
        this.collisionCooldown = false;
        this.coinCollectionCooldown = new Set(); // Track coins that are being collected

        // AUDIO TRACKING
        this.wasOnGround = true; // Track if kangaroo was on ground for landing sound
    }

    create(data) {
        // Get audio manager from menu scene
        this.audioManager = data.audioManager;

        // Initialize store manager and check for helmet
        this.storeManager = new StoreManager();
        const helmetCount = this.storeManager.getPowerUpCount('helmet');
        console.log(`🪖 Helmet count at game start: ${helmetCount}`);
        if (helmetCount > 0) {
            this.helmetEquipped = true;
            console.log('🪖 Helmet equipped! Magpie protection active!');
        } else {
            this.helmetEquipped = false;
            console.log('🪖 No helmet available');
        }

        // Reset all game state
        this.isGameOver = false;
        this.score = 0;
        this.gameSpeed = 300;
        this.obstacleTimer = null;
        this.coinTimer = null;
        this.powerupTimer = null;
        this.weedTimer = null;
        this.collisionCooldown = false;
        this.coinCollectionCooldown.clear();
        this.wasOnGround = true;

        // Reset powerup state
        this.activePowerups = {
            shield: { active: false, timeLeft: 0 },
            magnet: { active: false, timeLeft: 0 },
            double: { active: false, timeLeft: 0, jumpsLeft: 0 }
        };

        // Clean up existing powerup orbs
        Object.keys(this.powerupOrbs).forEach(type => {
            this.powerupOrbs[type].forEach(orb => {
                if (orb) orb.destroy();
            });
            this.powerupOrbs[type] = [];
        });

        // Add background
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x39cef9, 0x39cef9, 0x7dd9fc, 0x7dd9fc, 1);
        graphics.fillRect(0, 0, 800, 600);

        // Add atmospheric elements (sun and clouds)
        this.createBackgroundElements();

        // Create ground with texture
        this.ground = this.add.graphics();
        this.ground.fillStyle(0xfc8d15);
        this.ground.fillRect(0, 500, 800, 100);

        // Create physics groups with debug tracking
        this.obstacles = this.physics.add.group();
        this.coins = this.physics.add.group();
        this.powerups = this.physics.add.group();
        this.weeds = this.add.group();
        this.groundTextures = this.add.group();

        // Add subtle ground texture
        this.addGroundTexture();

        // Add weeds for ground decoration
        this.addGroundWeeds();


        // Create kangaroo animations
        this.createKangarooAnimations();

        // Create emu animations
        this.createEmuAnimations();

        // Create magpie animations
        this.createMagpieAnimations();

        // Create kangaroo sprite (with or without helmet)
        const spriteKey = this.helmetEquipped ? 'kangaroo_helmet' : 'kangaroo';
        this.kangaroo = this.physics.add.sprite(150, this.groundY, spriteKey);
        this.kangaroo.setScale(1.2);
        this.kangaroo.setCollideWorldBounds(true);
        this.kangaroo.body.setSize(70, 48);
        this.kangaroo.body.setOffset(40, 70);
        this.kangaroo.body.setGravityY(900);
        this.kangaroo.setOrigin(0.5, 1);
        const runAnimKey = this.helmetEquipped ? 'kangaroo_helmet_run' : 'kangaroo_run';
        this.kangaroo.play(runAnimKey);

        // Create invisible ground for physics collision (extended for running emus)
        this.groundBody = this.physics.add.staticGroup();
        const groundCollider = this.groundBody.create(700, 550, null); // Moved center right
        groundCollider.setSize(2000, 100); // Extended width to cover emu spawn area
        groundCollider.setVisible(false);

        // Add collision between kangaroo and ground
        this.physics.add.collider(this.kangaroo, this.groundBody);
        this.physics.add.collider(this.obstacles, this.groundBody);

        this.createUI();


        // Input handling
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
        this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
        this.input.on('pointerdown', this.jump, this);


        // Start spawning obstacles, coins, and powerups
        this.startSpawning();

        // Add collision detection
        this.physics.add.overlap(this.kangaroo, this.obstacles, (kangaroo, obstacle) => {
            if (!this.collisionCooldown && !this.isGameOver) {
                this.hitObstacle(kangaroo, obstacle);
            }
        }, null, this);

        this.physics.add.overlap(this.kangaroo, this.coins, (kangaroo, coin) => {
            if (!this.coinCollectionCooldown.has(coin) && !this.isGameOver) {
                // Immediately disable coin physics to prevent separation
                coin.body.setEnable(false);
                this.collectCoin(kangaroo, coin);
            }
        }, null, this);

        this.physics.add.overlap(this.kangaroo, this.powerups, (kangaroo, powerup) => {
            if (!this.isGameOver) {
                this.collectPowerup(kangaroo, powerup);
            }
        }, null, this);

    }

    createUI() {
        // Score text (keep existing positioning)
        this.scoreText = this.add.text(20, 60, 'Score: 0', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        });

        // Coin UI (keep existing)
        const coinIcon = this.add.image(30, 30, 'coin');
        coinIcon.setScale(0.17);
        coinIcon.setOrigin(0, 0.5);

        this.coinText = this.add.text(70, 30, `${this.gameDataManager.getCoins()}`, {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.coinText.setOrigin(0, 0.5);

        // Create simplified powerup and inventory UI
        this.createSimpleInventoryUI();
        this.createSimplePowerupUI();
    }

    createSimpleInventoryUI() {
        // Simple inventory icons under the score
        const startY = 120;
        const spacing = 40;

        // Shield
        this.shieldIcon = this.add.image(30, startY, 'shield');
        this.shieldIcon.setScale(0.15);
        this.shieldIcon.setOrigin(0.1, 0.5);

        this.shieldCount = this.add.text(55, startY, '0', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#00FF00',
            stroke: '#000000',
            strokeThickness: 2,
            fontStyle: 'bold'
        });
        this.shieldCount.setOrigin(0, 0.5);

        // Magnet
        this.magnetIcon = this.add.image(30, startY + spacing, 'magnet');
        this.magnetIcon.setScale(0.12);
        this.magnetIcon.setOrigin(0, 0.5);

        this.magnetCount = this.add.text(55, startY + spacing, '0', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#FF00FF',
            stroke: '#000000',
            strokeThickness: 2,
            fontStyle: 'bold'
        });
        this.magnetCount.setOrigin(0, 0.5);

        // Double Jump
        this.doubleIcon = this.add.image(30, startY + (spacing * 2), 'double');
        this.doubleIcon.setScale(0.15);
        this.doubleIcon.setOrigin(0.1, 0.5);

        this.doubleCount = this.add.text(55, startY + (spacing * 2), '0', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#00FFFF',
            stroke: '#000000',
            strokeThickness: 2,
            fontStyle: 'bold'
        });
        this.doubleCount.setOrigin(0, 0.5);

        // Update initial counts
        this.updateSimpleInventoryUI();
    }

    createSimplePowerupUI() {
        // Create simple progress bars for active powerups (no container/panel)
        this.activeBars = {
            shield: this.createSimpleProgressBar(200, 15, '#00FF00'),
            magnet: this.createSimpleProgressBar(200, 30, '#FF00FF'),
            double: this.createSimpleProgressBar(200, 45, '#00FFFF')
        };

        // Initially hide all bars
        Object.values(this.activeBars).forEach(bar => {
            bar.container.setVisible(false);
        });
    }

    createSimpleProgressBar(x, y, color) {
        const container = this.add.container(x, y);

        // Background bar
        const bgBar = this.add.graphics();
        bgBar.fillStyle(0x333333, 0.8);
        bgBar.fillRoundedRect(0, 0, 120, 8, 4);
        container.add(bgBar);

        // Progress fill
        const fillBar = this.add.graphics();
        container.add(fillBar);

        // Time text
        const timeText = this.add.text(130, 4, '', {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: color,
            fontStyle: 'bold'
        });
        timeText.setOrigin(0, 0.5);
        container.add(timeText);

        return {
            container: container,
            bgBar: bgBar,
            fillBar: fillBar,
            timeText: timeText,
            color: color
        };
    }

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

            this.anims.create({
                key: 'kangaroo_idle',
                frames: [{ key: 'kangaroo', frame: 0 }],
                frameRate: 1
            });
        }

        // Helmet kangaroo animations (using same frame indices)
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

            this.anims.create({
                key: 'kangaroo_helmet_idle',
                frames: [{ key: 'kangaroo_helmet', frame: 0 }],
                frameRate: 1
            });
        }
    }

    createEmuAnimations() {
        if (this.anims.exists('emu_run')) return;

        // Check how many frames are available in the emu texture
        const emuTexture = this.textures.get('emu');
        const frameCount = emuTexture.frameTotal;
        console.log(`Emu texture has ${frameCount} frames`);

        if (frameCount >= 4) {
            // Use all 4 frames if available
            this.anims.create({
                key: 'emu_run',
                frames: this.anims.generateFrameNumbers('emu', { start: 0, end: 3 }),
                frameRate: 6,
                repeat: -1
            });
        } else {
            // Fallback to just the first frame if not enough frames
            this.anims.create({
                key: 'emu_run',
                frames: [{ key: 'emu', frame: 0 }],
                frameRate: 1,
                repeat: -1
            });
        }

        this.anims.create({
            key: 'emu_idle',
            frames: [{ key: 'emu', frame: 0 }],
            frameRate: 1
        });
    }

    createMagpieAnimations() {
        if (this.anims.exists('magpie_fly')) return;

        // Create flying animation using all 4 frames
        this.anims.create({
            key: 'magpie_fly',
            frames: this.anims.generateFrameNumbers('magpie', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'magpie_idle',
            frames: [{ key: 'magpie', frame: 0 }],
            frameRate: 1
        });
    }

    update(time, delta) {
        if (this.isGameOver) return;

        // Update powerup timers
        this.updatePowerups(delta);

        // Jump input
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
            Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.jump();
        }

        // Power-up activation inputs
        if (Phaser.Input.Keyboard.JustDown(this.key1)) {
            this.activatePurchasedPowerup('shield');
        }
        if (Phaser.Input.Keyboard.JustDown(this.key2)) {
            this.activatePurchasedPowerup('magnet');
        }
        if (Phaser.Input.Keyboard.JustDown(this.key3)) {
            this.activatePurchasedPowerup('double');
        }

        // Handle kangaroo animations and landing sound
        const isOnGround = this.kangaroo.body.blocked.down || this.kangaroo.body.touching.down;
        const currentAnim = this.kangaroo.anims.currentAnim?.key;

        // Get correct animation keys based on helmet status
        const runAnimKey = this.helmetEquipped ? 'kangaroo_helmet_run' : 'kangaroo_run';
        const jumpAnimKey = this.helmetEquipped ? 'kangaroo_helmet_jump' : 'kangaroo_jump';

        if (isOnGround) {
            if (currentAnim !== runAnimKey) {
                this.kangaroo.play(runAnimKey);
            }
        } else {
            if (currentAnim !== jumpAnimKey) {
                this.kangaroo.play(jumpAnimKey);
            }
        }

        // Update score
        this.score += 0.5;
        this.scoreText.setText('Score: ' + Math.floor(this.score));

        // Increase game speed every 50 points
        const flooredScore = Math.floor(this.score);
        if (flooredScore % 50 === 0 && !this.lastSpeedIncrease) {
            this.gameSpeed += 5;
            this.lastSpeedIncrease = true;
        } else if (flooredScore % 50 !== 0) {
            this.lastSpeedIncrease = false;
        }

        // Move obstacles and clean up off-screen ones
        this.obstacles.children.entries.slice().forEach((obstacle) => {
            if (!obstacle || !obstacle.active) {
                return;
            }

            // Special handling for magpie swooping behavior
            if (obstacle.texture.key === 'magpie') {
                this.updateMagpieBehavior(obstacle, delta);
            } else if (obstacle.isRunningEmu) {
                // Running emu uses custom speed
                obstacle.x -= obstacle.runSpeed * delta / 1000;
            } else {
                // Normal obstacle movement
                obstacle.x -= this.gameSpeed * delta / 1000;
            }

            if (obstacle.x < -100) {
                obstacle.destroy();
            }
        });

        // Move coins and clean up off-screen ones
        this.coins.children.entries.slice().forEach((coin) => {
            if (!coin || !coin.active) {
                return;
            }

            // Magnet effect
            if (this.activePowerups.magnet.active) {
                const distanceToKangaroo = Phaser.Math.Distance.Between(
                    coin.x, coin.y, this.kangaroo.x, this.kangaroo.y
                );

                if (distanceToKangaroo < 400) {
                    const attractionForce = 1000;
                    const angle = Phaser.Math.Angle.Between(
                        coin.x, coin.y, this.kangaroo.x, this.kangaroo.y
                    );
                    coin.x += Math.cos(angle) * attractionForce * delta / 1000;
                    coin.y += Math.sin(angle) * attractionForce * delta / 1000;
                }
            }

            coin.x -= this.gameSpeed * delta / 1000;

            if (coin.x < -100) {
                this.coinCollectionCooldown.delete(coin);
                coin.destroy();
            }
        });

        // Move powerups and clean up off-screen ones
        this.powerups.children.entries.slice().forEach((powerup) => {
            if (!powerup || !powerup.active) {
                return;
            }

            powerup.x -= this.gameSpeed * delta / 1000;

            if (powerup.x < -100) {
                powerup.destroy();
            }
        });

        // Move weeds and clean up off-screen ones
        this.weeds.children.entries.slice().forEach((weed) => {
            if (!weed || !weed.active) {
                return;
            }

            weed.x -= (this.gameSpeed * 1) * delta / 1000; // Faster foreground parallax movement

            if (weed.x < -100) {
                this.weeds.remove(weed);
                weed.destroy();
            }
        });

        // Move ground texture dots and clean up off-screen ones
        this.groundTextures.children.entries.slice().forEach((dot) => {
            if (!dot || !dot.active) {
                return;
            }

            dot.x -= (this.gameSpeed * 1) * delta / 1000; // Same speed as weeds

            if (dot.x < -50) {
                this.groundTextures.remove(dot);
                dot.destroy();
            }
        });

        // Spawn new ground texture dots from the right side
        if (Math.random() < 0.02) { // 2% chance per frame to spawn new dot
            const dot = this.add.graphics();
            const y = Phaser.Math.Between(510, 590);
            const size = Phaser.Math.FloatBetween(2, 6);
            const isDarkRock = Math.random() < 0.3;

            if (isDarkRock) {
                dot.fillStyle(0x8B4513, 0.6);
            } else {
                dot.fillStyle(0xD2691E, 0.4);
            }
            dot.fillCircle(0, 0, size);
            dot.setPosition(850, y); // Start off-screen to the right
            dot.setDepth(2);

            this.groundTextures.add(dot);
        }

    }

    updateMagpieBehavior(magpie, delta) {
        // Move magpie horizontally towards kangaroo (use game speed like other obstacles)
        magpie.x -= this.gameSpeed * delta / 1000;

        // Check if magpie is close enough to kangaroo to start swooping
        const distanceToKangaroo = magpie.x - this.kangaroo.x;

        // Calculate swoop distance based on height - higher magpies need more distance
        const magpieHeight = magpie.y;
        const heightFromGround = this.groundY - magpieHeight;
        const swoopDistance = 150 + (heightFromGround * 1); // Base 150px + 1px per pixel of height

        if (!magpie.swoopStarted && distanceToKangaroo <= swoopDistance && magpie.willSwoop) {
            // Start swooping down
            magpie.swoopStarted = true;
            console.log(`Magpie starting swoop attack! Height: ${Math.round(heightFromGround)}px, Distance: ${Math.round(swoopDistance)}px`);
        }

        if (magpie.swoopStarted && !magpie.isClimbingBack) {
            // Swoop down towards ground level
            const targetY = this.groundY - 20; // Slightly above ground
            const currentY = magpie.y;

            if (currentY < targetY) {
                // Dive down
                magpie.y += magpie.swoopSpeed * delta / 1000;
                // Rotate anticlockwise during swoop (negative rotation)
                magpie.rotation = -Math.PI / 4; // -45 degrees (anticlockwise tilt)
            } else {
                // Reached bottom, start straightening phase
                magpie.rotation = 0; // Straighten out
                magpie.straightenTime += delta;

                // After calculated down time, start climbing back up
                if (magpie.straightenTime >= magpie.downTime) {
                    magpie.isClimbingBack = true;
                    console.log('Magpie climbing back up!');
                }
            }
        }

        if (magpie.isClimbingBack) {
            // Climb back up to original height
            const originalY = Phaser.Math.Between(50, 150);
            if (magpie.y > originalY) {
                magpie.y -= magpie.climbSpeed * delta / 1000;
                magpie.rotation = Math.PI / 6; // +30 degrees (slight upward tilt)
            } else {
                // Back to normal flying
                magpie.rotation = 0;
            }
        }
    }

    jump() {
        const isOnGround = this.kangaroo.body.blocked.down || this.kangaroo.body.touching.down;

        if (isOnGround) {
            this.kangaroo.setVelocityY(-950);
            this.audioManager?.playJump();
            if (this.activePowerups.double.active) {
                this.activePowerups.double.jumpsLeft = 1;
            }
        } else if (this.activePowerups.double.active && this.activePowerups.double.jumpsLeft > 0) {
            // Double jump (less powerful)
            this.kangaroo.setVelocityY(-750);
            this.audioManager?.playDoubleJump();
            this.activePowerups.double.jumpsLeft--;
        }
    }

    startSpawning() {
        this.scheduleNextObstacle();
        this.scheduleNextCoin();
        this.scheduleNextPowerup();
    }

    scheduleNextObstacle() {
        if (this.isGameOver) {
            return;
        }

        // More frequent obstacles after score 1000
        let minDelay = 1500;
        let maxDelay = 3500;

        if (this.score >= 1000) {
            minDelay = 1500;
            maxDelay = 2500;
        }

        const delay = Phaser.Math.Between(minDelay, maxDelay);
        console.log(`🕐 SCHEDULING next obstacle in ${delay}ms (score: ${Math.floor(this.score)})`);
        this.obstacleTimer = this.time.delayedCall(delay, () => {
            if (!this.isGameOver && this.scene.isActive()) {
                // 40% chance to spawn a gap instead of single obstacle (only after score 1500)
                if (this.score >= 1500 && Math.random() < 0.4) {
                    console.log(`🔄 SPAWNING GAP (score: ${Math.floor(this.score)})`);
                    this.spawnGap();
                } else {
                    console.log(`⭐ SPAWNING SINGLE OBSTACLE (score: ${Math.floor(this.score)})`);
                    this.spawnObstacle();
                }
                this.scheduleNextObstacle();
            }
        });
    }

    scheduleNextCoin() {
        if (this.isGameOver) {
            return;
        }

        const delay = Phaser.Math.Between(2500, 4500);
        this.coinTimer = this.time.delayedCall(delay, () => {
            if (!this.isGameOver && this.scene.isActive()) {
                this.spawnCoin();
                this.scheduleNextCoin();
            }
        });
    }

    getObstacleTypes() {
        // Base obstacle types
        const obstacles = [
            { type: 'rock', weight: 25 },
            { type: 'log', weight: 25 },
            { type: 'cactus', weight: 25 },
            { type: 'magpie', weight: 25 }
        ];

        // Add new obstacles based on score
        if (this.score >= 1000) {
            obstacles.push({ type: 'koala', weight: 20 });
        }
        if (this.score >= 2000) {
            obstacles.push({ type: 'emu', weight: 15 });
        }
        if (this.score >= 3000) {
            obstacles.push({ type: 'camel', weight: 10 });
        }
        if (this.score >= 4000) {
            obstacles.push({ type: 'croc', weight: 10 });
        }

        return obstacles;
    }

    selectRandomObstacle(obstacleTypes) {
        // Calculate total weight
        const totalWeight = obstacleTypes.reduce((sum, item) => sum + item.weight, 0);

        // Generate random number between 0 and total weight
        let random = Math.random() * totalWeight;

        // Select obstacle based on weights
        let selectedType = null;
        for (let i = 0; i < obstacleTypes.length; i++) {
            random -= obstacleTypes[i].weight;
            if (random <= 0) {
                selectedType = obstacleTypes[i].type;
                break;
            }
        }

        // If no type selected, use fallback
        if (!selectedType) {
            selectedType = obstacleTypes[0].type;
        }

        // Apply variant logic: 60% chance for variants
        if (selectedType === 'rock') {
            return Math.random() < 0.6 ? 'spider_rock' : 'rock';
        } else if (selectedType === 'log') {
            return Math.random() < 0.6 ? 'snake_log' : 'log';
        }

        return selectedType;
    }

    spawnObstacle() {
        if (this.isGameOver) {
            return;
        }

        // Define obstacle types with proper distribution
        const obstacleTypes = this.getObstacleTypes();
        const randomType = this.selectRandomObstacle(obstacleTypes);
        console.log(`🎯 SPAWNING ${randomType} obstacle`);

        if (randomType === 'magpie') {
            this.spawnMagpie();
        } else if (randomType === 'emu') {
            this.spawnRunningEmu();
        } else {
            // Spawn regular ground obstacle
            console.log(`🏃 Spawning ground obstacle: ${randomType}`);
            const obstacle = this.physics.add.sprite(1200, this.groundY, randomType);

            // Calculate random size based on base size and variation
            const baseSize = this.obstacleBaseSizes[randomType] || 0.5;
            const variation = this.obstacleSizeVariation;
            const randomMultiplier = 1 + (Math.random() * 2 - 1) * variation;
            const finalSize = baseSize * randomMultiplier;

            obstacle.setScale(finalSize);

            // Start animations for animated obstacles
            if (randomType === 'emu') {
                obstacle.play('emu_run');
            }
            obstacle.setOrigin(0.5, 1);
            obstacle.body.setImmovable(true);
            obstacle.body.setGravityY(0);

            // Adjust collision box - special handling for different obstacle types
            if (randomType === 'camel') {
                obstacle.body.setSize(obstacle.width * 0.8, obstacle.height * 0.7);
                obstacle.body.setOffset(obstacle.width * 0.1, obstacle.height * 0.25);
            } else if (randomType === 'koala') {
                // Smaller collision box for koala tree - only the bottom trunk area
                obstacle.body.setSize(obstacle.width * 0.3, obstacle.height * 0.7);
                obstacle.body.setOffset(obstacle.width * 0.35, obstacle.height * 0.23);
            } else if (randomType === 'spider_rock') {
                // Shorter collision box for spider rock - bottom 60% only
                obstacle.body.setSize(obstacle.width * 0.8, obstacle.height * 0.6);
                obstacle.body.setOffset(obstacle.width * 0.1, obstacle.height * 0.35);
            } else if (randomType === 'cactus') {
                // Custom collision box for cactus
                obstacle.body.setSize(obstacle.width * 0.8, obstacle.height * 0.8);
                obstacle.body.setOffset(obstacle.width * 0.1, obstacle.height * 0.2);
            } else if (randomType === 'snake_log') {
                // Shorter collision box for snake log - bottom 60% height, 70% width
                obstacle.body.setSize(obstacle.width * 0.7, obstacle.height * 0.6);
                obstacle.body.setOffset(obstacle.width * 0.15, obstacle.height * 0.35);

            } else {
                obstacle.body.setSize(obstacle.width * 0.8, obstacle.height * 0.8);
            }

            this.obstacles.add(obstacle);
        }
    }

    spawnMagpie() {
        if (this.isGameOver) {
            return;
        }

        // Create magpie sprite starting high up in the sky
        const startY = Phaser.Math.Between(50, 150); // High in the sky
        const magpie = this.physics.add.sprite(1200, startY, 'magpie'); // Same x position as ground obstacles

        magpie.setScale(0.8);
        magpie.setOrigin(0.5, 0.5);
        magpie.body.setImmovable(true);
        magpie.setVelocityY(0); // 🔒 Freeze vertical movement
        magpie.body.pushable = false;
        magpie.body.setSize(magpie.width * 0.7, magpie.height * 0.5);

        // Start flying animation
        magpie.play('magpie_fly');

        // Custom properties for AI behavior
        magpie.swoopStarted = false;
        // No swooping before score 1000, then 50% chance after
        magpie.willSwoop = this.score >= 1000 ? Math.random() < 0.5 : false;
        magpie.straightenTime = 0;
        magpie.isClimbingBack = false;
        // Scale swoop and climb speeds with game speed for consistent challenge
        magpie.swoopSpeed = this.gameSpeed * 0.7; // 70% of game speed
        magpie.climbSpeed = this.gameSpeed * 0.7; // 120% of game speed
        // Scale down time inversely with game speed (faster game = less time down)
        magpie.downTime = Math.max(100, 500 - (this.gameSpeed * 0.5)); // Min 100ms, scales down as speed increases

        console.log(`🦅 MAGPIE spawned - willSwoop: ${magpie.willSwoop} (counts as normal obstacle)`);
        this.obstacles.add(magpie);

        // Bulletproof gravity shutdown (same as coins)
        this.time.delayedCall(0, () => {
            if (magpie.body) {
                magpie.body.setAllowGravity(false);      // 🔒 Turn off global gravity
                magpie.body.setVelocityY(0);              // 🔒 Reset velocity
                magpie.body.setGravity(0, 0);             // 🔒 Set local gravity to zero
                magpie.body.setBounce(0);                 // 🔒 Just in case of collision
            }
        });
    }

    spawnRunningEmu() {
        if (this.isGameOver) {
            return;
        }

        // Simplified approach: emu always runs 30% faster from fixed position
        const emuSpeedMultiplier = 1.3; // 30% faster (more conservative)
        const finalEmuSpeed = this.gameSpeed * emuSpeedMultiplier;
        const finalEmuSpawnX = 1350; // Fixed spawn position

        // Calculate actual timing for comparison
        const normalDistance = 1200 - 150; // 1050px
        const normalTime = normalDistance / this.gameSpeed;
        const emuDistance = finalEmuSpawnX - 150;
        const emuTime = emuDistance / finalEmuSpeed;

        console.log(`🦘 RUNNING EMU DEBUG:`);
        console.log(`  Normal: spawn=1200, speed=${this.gameSpeed}, time=${normalTime.toFixed(2)}s`);
        console.log(`  Emu: spawn=${Math.round(finalEmuSpawnX)}, speed=${Math.round(finalEmuSpeed)}, time=${emuTime.toFixed(2)}s`);
        console.log(`  Speed ratio: ${emuSpeedMultiplier}x, Time diff: ${((emuTime - normalTime) * 1000).toFixed(0)}ms`);

        const emu = this.physics.add.sprite(finalEmuSpawnX, this.groundY, 'emu');

        // Set up emu properties
        const baseSize = this.obstacleBaseSizes.emu || 0.8;
        const variation = this.obstacleSizeVariation;
        const randomMultiplier = 1 + (Math.random() * 2 - 1) * variation;
        const finalSize = baseSize * randomMultiplier;

        emu.setScale(finalSize);
        emu.setOrigin(0.5, 1);
        emu.body.setImmovable(true);
        emu.body.setGravityY(0);
        emu.body.setSize(emu.width * 0.6, emu.height * 0.8);
        emu.body.setOffset(0, emu.height * 0.2);

        // Start running animation
        emu.play('emu_run');

        // Mark as running emu for special movement behavior
        emu.isRunningEmu = true;
        emu.runSpeed = finalEmuSpeed;

        this.obstacles.add(emu);
    }

    spawnGap() {
        if (this.isGameOver) {
            return;
        }

        console.log('🚧 GAP: Spawning first obstacle');
        // Spawn first obstacle (no emus in gaps)
        this.spawnGapObstacle();

        // Spawn second obstacle after a delay with score-based spacing
        let minDelay = 300;
        let maxDelay = 400;

        if (this.score >= 3000) {
            minDelay = 250;
            maxDelay = 500;
        }

        const gapDelay = Phaser.Math.Between(minDelay, maxDelay);
        console.log(`🚧 GAP: Scheduling second obstacle in ${gapDelay}ms`);
        this.time.delayedCall(gapDelay, () => {
            if (!this.isGameOver && this.scene.isActive()) {
                console.log('🚧 GAP: Spawning second obstacle');
                this.spawnGapObstacle();
            }
        });
    }

    spawnGapObstacle() {
        if (this.isGameOver) {
            return;
        }

        // Get obstacle types but exclude emus for gaps
        const obstacleTypes = this.getObstacleTypes().filter(type => type.type !== 'emu');
        const randomType = this.selectRandomObstacle(obstacleTypes);
        console.log(`🎯 SPAWNING GAP ${randomType} obstacle`);

        if (randomType === 'magpie') {
            this.spawnMagpie();
        } else {
            // Spawn regular ground obstacle
            console.log(`🏃 Spawning gap ground obstacle: ${randomType}`);
            const obstacle = this.physics.add.sprite(1200, this.groundY, randomType);

            // Calculate random size based on base size and variation
            const baseSize = this.obstacleBaseSizes[randomType] || 0.5;
            const variation = this.obstacleSizeVariation;
            const randomMultiplier = 1 + (Math.random() * 2 - 1) * variation;
            const finalSize = baseSize * randomMultiplier;

            obstacle.setScale(finalSize);

            // Start animations for animated obstacles
            if (randomType === 'emu') {
                obstacle.play('emu_run');
            }
            obstacle.setOrigin(0.5, 1);
            obstacle.body.setImmovable(true);
            obstacle.body.setGravityY(0);

            // Adjust collision box - special handling for different obstacle types
            if (randomType === 'camel') {
                obstacle.body.setSize(obstacle.width * 0.8, obstacle.height * 0.7);
                obstacle.body.setOffset(obstacle.width * 0.1, obstacle.height * 0.25);
            } else if (randomType === 'koala') {
                // Smaller collision box for koala tree - only the bottom trunk area
                obstacle.body.setSize(obstacle.width * 0.3, obstacle.height * 0.7);
                obstacle.body.setOffset(obstacle.width * 0.35, obstacle.height * 0.23);
            } else if (randomType === 'spider_rock') {
                // Shorter collision box for spider rock - bottom 60% only
                obstacle.body.setSize(obstacle.width * 0.8, obstacle.height * 0.6);
                obstacle.body.setOffset(obstacle.width * 0.1, obstacle.height * 0.35);
            } else if (randomType === 'cactus') {
                // Custom collision box for cactus
                obstacle.body.setSize(obstacle.width * 0.8, obstacle.height * 0.8);
                obstacle.body.setOffset(obstacle.width * 0.1, obstacle.height * 0.2);
            } else if (randomType === 'snake_log') {
                // Shorter collision box for snake log - bottom 60% height, 70% width
                obstacle.body.setSize(obstacle.width * 0.7, obstacle.height * 0.6);
                obstacle.body.setOffset(obstacle.width * 0.15, obstacle.height * 0.35);
            } else {
                obstacle.body.setSize(obstacle.width * 0.8, obstacle.height * 0.8);
            }

            this.obstacles.add(obstacle);
        }
    }


    spawnCoin() {
        if (this.isGameOver) return;

        const coinY = Phaser.Math.Between(200, this.groundY - 50);
        const coin = this.physics.add.image(850, coinY, 'coin');
        coin.setScale(0.3);
        coin.setOrigin(0.5);
        coin.setImmovable(true);
        coin.setVelocityY(0); // 🔒 Freeze vertical movement
        coin.body.pushable = false;


        this.coins.add(coin);



        // Bulletproof gravity shutdown
        this.time.delayedCall(0, () => {
            if (coin.body) {
                coin.body.setAllowGravity(false);      // 🔒 Turn off global gravity
                coin.body.setVelocityY(0);              // 🔒 Reset velocity
                coin.body.setGravity(0, 0);             // 🔒 Set local gravity to zero
                coin.body.setBounce(0);                 // 🔒 Just in case of collision
            } 2
        });
    }


    collectCoin(kangaroo, coin) {
        if (this.coinCollectionCooldown.has(coin) || !coin.active) {
            return;
        }

        this.coinCollectionCooldown.add(coin);

        // Play coin collection sound
        this.audioManager?.playCoinCollect();

        // Add coins to persistent storage instead of score
        this.gameDataManager.addCoins(1);

        // Update coin UI
        this.coinText.setText(`${this.gameDataManager.getCoins()}`);

        // Add small score bonus for collecting coins
        this.score += 10;

        // Immediately disable physics and remove from group
        coin.body.setEnable(false);
        this.coins.remove(coin);

        // Simple collection effect
        const effectCoin = this.add.image(coin.x, coin.y, 'coin');
        effectCoin.setScale(0.3);

        this.tweens.add({
            targets: effectCoin,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                effectCoin.destroy();
            }
        });

        // Clean up original coin
        coin.destroy();
        this.coinCollectionCooldown.delete(coin);
    }

    hitObstacle(kangaroo, obstacle) {
        if (this.isGameOver || this.collisionCooldown) return;

        // Helmet protection against magpies (doesn't consume helmet)
        if (this.helmetEquipped && obstacle.texture && obstacle.texture.key === 'magpie') {
            console.log('🪖 Helmet protected from magpie attack!');

            // Play collision sound
            this.audioManager?.playCollision();

            // Visual feedback for helmet protection - blue flash
            this.kangaroo.setTint(0x00FFFF);
            this.time.delayedCall(200, () => {
                this.kangaroo.clearTint();
            });

            // Destroy the magpie
            obstacle.destroy();

            // Brief collision cooldown to prevent multiple hits
            this.collisionCooldown = true;
            this.time.delayedCall(300, () => {
                this.collisionCooldown = false;
            });

            return;
        }

        // Shield protection (one-time use)
        if (this.activePowerups.shield.active) {
            this.collisionCooldown = true;

            // Play collision sound for shield hit
            this.audioManager?.playCollision();

            // Deactivate shield after one use
            this.activePowerups.shield.active = false;
            this.activePowerups.shield.timeLeft = 0;

            // Remove shield orbs immediately
            this.removePowerupOrb('shield');

            // Visual feedback for shield protection - brief flash
            this.kangaroo.setTint(0x00FF00);
            this.time.delayedCall(200, () => {
                this.kangaroo.clearTint(); // Clear tint after brief flash
            });

            // Destroy the obstacle
            obstacle.destroy();

            // Reset collision cooldown after brief period
            this.time.delayedCall(500, () => {
                this.collisionCooldown = false;
            });

            return;
        }

        this.collisionCooldown = true;
        this.isGameOver = true;

        // Play game over sound after delay
        this.time.delayedCall(50, () => {
            this.audioManager?.playGameOver();
        });

        // Stop jump inputs
        this.input.off('pointerdown', this.jump, this);
        this.spaceKey.enabled = false;
        this.cursors.up.enabled = false;

        // Stop kangaroo
        this.kangaroo.setVelocity(0, 0);
        this.kangaroo.setTint(0xff6666);
        this.kangaroo.anims.stop();         // ❌ Stop animation
        this.kangaroo.setFrame(2);          // Optional: freeze on jump frame

        // Stop timers & obstacles
        this.cleanupTimers();
        this.obstacles.children.iterate(obs => obs?.body?.setVelocity(0, 0));
        this.coins.children.iterate(coin => coin?.body?.setVelocity(0, 0));
        this.powerups.children.iterate(powerup => powerup?.body?.setVelocity(0, 0));

        // Stop all tweens to prevent weird animations
        this.tweens.killTweensOf([...this.coins.children.entries, ...this.powerups.children.entries]);

        // Crash effect
        this.tweens.add({
            targets: this.kangaroo,
            angle: 90,
            duration: 500,
            ease: 'Power2'
        });

        // Game over screen
        this.time.delayedCall(1000, () => {
            const obstacleType = obstacle.texture ? obstacle.texture.key : 'rock';

            // Reset helmet when game ends (helmet lasts one game only)
            if (this.helmetEquipped) {
                this.storeManager.helmetCount = 0;
                this.storeManager.saveData();
                console.log(`🪖 Helmet used up - can now purchase again`);
            }

            this.scene.start('GameOverScene', {
                score: this.score,
                audioManager: this.audioManager,
                obstacleType: obstacleType
            });
        });
    }


    cleanupTimers() {
        if (this.obstacleTimer) {
            this.obstacleTimer.destroy();
            this.obstacleTimer = null;
        }
        if (this.coinTimer) {
            this.coinTimer.destroy();
            this.coinTimer = null;
        }
        if (this.powerupTimer) {
            this.powerupTimer.destroy();
            this.powerupTimer = null;
        }
        if (this.weedTimer) {
            this.weedTimer.destroy();
            this.weedTimer = null;
        }
        // Clean up powerup orbs
        Object.keys(this.powerupOrbs).forEach(type => {
            this.powerupOrbs[type].forEach(orb => {
                if (orb) orb.destroy();
            });
            this.powerupOrbs[type] = [];
        });
    }


    shutdown() {
        // Stop all timers
        this.cleanupTimers();

        // Clear all tweens
        this.tweens.killAll();

        // Remove input listeners
        this.input.off('pointerdown', this.jump, this);

        // Clear physics groups properly
        if (this.obstacles) {
            this.obstacles.clear(true, true);
        }
        if (this.coins) {
            this.coins.clear(true, true);
        }
        if (this.powerups) {
            this.powerups.clear(true, true);
        }
        if (this.weeds) {
            this.weeds.clear(true, true);
        }

        // Clear cooldown tracking
        this.coinCollectionCooldown.clear();

        // Clean up powerup orbs
        Object.keys(this.powerupOrbs).forEach(type => {
            this.removePowerupOrb(type);
        });

        // Reset game state
        this.isGameOver = false;
        this.collisionCooldown = false;
    }

    createBackgroundElements() {
        // Add a sun
        const sun = this.add.graphics();
        sun.fillStyle(0xFFD700, 0.9);
        sun.fillCircle(0, 0, 30);
        sun.lineStyle(3, 0xFFD700, 0.7);
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
        this.tweens.add({
            targets: sun,
            rotation: Math.PI * 2,
            duration: 20000,
            repeat: -1,
            ease: 'Linear'
        });

        // Generate random clouds
        const numClouds = Phaser.Math.Between(3, 6);

        for (let i = 0; i < numClouds; i++) {
            const cloud = this.add.graphics();

            // Random cloud opacity and size
            const opacity = Phaser.Math.FloatBetween(0.5, 0.8);
            const baseSize = Phaser.Math.Between(15, 25);

            cloud.fillStyle(0xFFFFFF, opacity);

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
            this.tweens.add({
                targets: cloud,
                x: cloud.x + Phaser.Math.Between(-30, 30),
                duration: Phaser.Math.Between(6000, 12000),
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
        }
    }

    addGroundWeeds() {
        // Start spawning weeds continuously
        this.scheduleNextWeed();
    }

    scheduleNextWeed() {
        if (this.isGameOver) {
            return;
        }

        const delay = Phaser.Math.Between(800, 1500); // Spawn weeds frequently
        this.weedTimer = this.time.delayedCall(delay, () => {
            if (!this.isGameOver && this.scene.isActive()) {
                this.spawnWeed();
                this.scheduleNextWeed();
            }
        });
    }

    spawnWeed() {
        if (this.isGameOver) return;

        const groundY = 500; // Ground level
        const floorHeight = 100; // Floor is 100px tall (500 to 600)
        const weedZoneHeight = floorHeight * 0.8; // Spread across 80% of floor for natural look

        const x = 850; // Spawn off-screen right
        const y = Phaser.Math.Between(groundY, groundY + weedZoneHeight); // Wider spread (500-580)
        const scale = Phaser.Math.FloatBetween(0.3, 0.8); // Smaller, more subtle scale

        const weed = this.add.image(x, y, 'weed');
        weed.setScale(scale);
        weed.setOrigin(0.5, 1);
        weed.setDepth(1); // Far background to look less prominent
        weed.setAlpha(Phaser.Math.FloatBetween(0.6, 0.8)); // Add transparency for background feel
        weed.setTint(0xB8860B); // Brownish tint for dried grass look

        this.weeds.add(weed);

        console.log(`🌿 Spawned weed: x=${x}, y=${y}, scale=${scale.toFixed(2)}, alpha=${weed.alpha.toFixed(2)}`);
    }

    addGroundTexture() {
        // Add moving ground texture dots that scroll with the game
        // Initial population across the screen
        for (let i = 0; i < 20; i++) {
            this.spawnGroundTextureDot();
        }

        // Add subtle horizontal lines for texture (these don't need to move)
        const textureGraphics = this.add.graphics();
        textureGraphics.lineStyle(1, 0xD2691E, 0.3);
        for (let i = 0; i < 4; i++) {
            const y = 520 + (i * 20);
            textureGraphics.moveTo(0, y);
            textureGraphics.lineTo(800, y);
            textureGraphics.stroke();
        }
        textureGraphics.setDepth(2);
    }

    spawnGroundTextureDot() {
        const x = Phaser.Math.Between(0, 800);
        const y = Phaser.Math.Between(510, 590);
        const size = Phaser.Math.FloatBetween(2, 6);
        const isDarkRock = Math.random() < 0.3; // 30% chance for dark rocks

        // Create a small circle graphic as a sprite
        const dot = this.add.graphics();
        if (isDarkRock) {
            dot.fillStyle(0x8B4513, 0.6); // Darker brown rocks
        } else {
            dot.fillStyle(0xD2691E, 0.4); // Brown dirt spots
        }
        dot.fillCircle(0, 0, size);
        dot.setPosition(x, y);
        dot.setDepth(2);

        this.groundTextures.add(dot);
    }

    // POWERUP SYSTEM METHODS

    scheduleNextPowerup() {
        if (this.isGameOver) {
            return;
        }

        const delay = Phaser.Math.Between(16000, 25000); // 16-25 seconds
        this.powerupTimer = this.time.delayedCall(delay, () => {
            if (!this.isGameOver && this.scene.isActive()) {
                this.spawnPowerup();
                this.scheduleNextPowerup();
            }
        });
    }

    spawnPowerup() {
        if (this.isGameOver) return;

        const powerupTypes = ['shield', 'magnet', 'double'];
        const randomType = Phaser.Utils.Array.GetRandom(powerupTypes);

        const powerupY = Phaser.Math.Between(200, this.groundY - 50);
        const powerup = this.physics.add.image(850, powerupY, randomType);
        powerup.setScale(0.3);
        powerup.setOrigin(0.5);
        powerup.setImmovable(true);
        powerup.setVelocityY(0);
        powerup.body.pushable = false;
        powerup.powerupType = randomType;

        this.powerups.add(powerup);

        // Bulletproof gravity shutdown
        this.time.delayedCall(0, () => {
            if (powerup.body) {
                powerup.body.setAllowGravity(false);
                powerup.body.setVelocityY(0);
                powerup.body.setGravity(0, 0);
                powerup.body.setBounce(0);
            }
        });

        // Add glow effect
        this.tweens.add({
            targets: powerup,
            scaleX: 0.4,
            scaleY: 0.4,
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    collectPowerup(kangaroo, powerup) {
        const type = powerup.powerupType;

        // Play powerup-specific sound
        if (type === 'shield') {
            this.audioManager?.playShieldActivate();
        } else if (type === 'magnet') {
            this.audioManager?.playMagnetActivate();
        } else if (type === 'double') {
            this.audioManager?.playDoubleJump();
        }

        // Activate powerup with durations
        this.activePowerups[type].active = true;
        this.activePowerups[type].timeLeft = 10000; // 10 seconds for all powerups

        if (type === 'double') {
            // Check if kangaroo is in the air when collecting double jump
            const isOnGround = this.kangaroo.body.blocked.down || this.kangaroo.body.touching.down;
            this.activePowerups[type].jumpsLeft = isOnGround ? 0 : 1; // Give immediate jump if mid-air
        }

        // Visual effect
        const effectPowerup = this.add.image(powerup.x, powerup.y, type);
        effectPowerup.setScale(0.6);

        this.tweens.add({
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

        console.log(`Collected ${type} powerup!`);

        // Create powerup orb
        this.createPowerupOrb(type);
    }

    updatePowerups(delta) {
        // Update powerup timers and UI
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

            // Update UI
            this.updateSimplePowerupUI(type);
        });

        // Update powerup orbs positions
        this.updatePowerupOrbs(delta);
    }
    updateSimplePowerupUI(type) {
        const powerup = this.activePowerups[type];
        const bar = this.activeBars[type];

        if (!bar) return;

        if (powerup.active) {
            // Show progress bar
            bar.container.setVisible(true);

            const secondsLeft = Math.ceil(powerup.timeLeft / 1000);
            const maxTime = 10; // All powerups last 10 seconds
            const progress = powerup.timeLeft / (maxTime * 1000);

            // Update progress bar
            bar.fillBar.clear();
            bar.fillBar.fillStyle(bar.color);
            const barWidth = 120 * progress;
            bar.fillBar.fillRoundedRect(0, 0, barWidth, 8, 4);

            // Update time text
            bar.timeText.setText(`${secondsLeft}s`);

            // Flash red when time is low
            if (secondsLeft <= 3) {
                bar.fillBar.clear();
                bar.fillBar.fillStyle(0xFF0000);
                bar.fillBar.fillRoundedRect(0, 0, barWidth, 8, 4);
            }
        } else {
            // Hide progress bar
            bar.container.setVisible(false);
        }
    }


    createPowerupOrb(type) {
        // Remove existing orbs of this type first
        this.removePowerupOrb(type);

        // Define orb colors and properties
        const orbConfigs = {
            shield: { color: 0x00FF00, radius: 20 },
            magnet: { color: 0xFF00FF, radius: 18 },
            double: { color: 0x00FFFF, radius: 16 }
        };

        const config = orbConfigs[type];

        // Create multiple orbs for this powerup
        for (let i = 0; i < this.orbsPerPowerup; i++) {
            const orb = this.add.graphics();
            orb.fillStyle(config.color, 0.7);
            orb.fillCircle(0, 0, config.radius);
            orb.lineStyle(2, config.color, 1);
            orb.strokeCircle(0, 0, config.radius);

            // Add glow effect
            orb.setBlendMode(Phaser.BlendModes.ADD);

            // Set initial position and rotation data
            orb.orbType = type;
            orb.orbRadius = 60; // Distance from kangaroo center
            orb.currentAngle = this.getOrbStartAngle(type, i);
            orb.orbIndex = i;

            this.powerupOrbs[type].push(orb);
        }
    }

    getOrbStartAngle(type, orbIndex) {
        // Start orbs at different angles to avoid overlap
        const baseAngles = {
            shield: 0,
            magnet: 120,
            double: 240
        };

        // Space multiple orbs evenly around the circle
        const angleSpacing = 360 / this.orbsPerPowerup;
        return (baseAngles[type] || 0) + (orbIndex * angleSpacing);
    }

    updatePowerupOrbs(delta) {
        Object.keys(this.powerupOrbs).forEach(type => {
            const orbs = this.powerupOrbs[type];
            if (orbs && this.activePowerups[type].active) {
                orbs.forEach(orb => {
                    if (orb) {
                        // Update rotation angle
                        orb.currentAngle += this.orbRotationSpeed * delta / 1000;

                        // Calculate position around kangaroo (moved up 50 pixels, right 10 pixels)
                        const angleRad = Phaser.Math.DegToRad(orb.currentAngle);
                        orb.x = this.kangaroo.x + 10 + Math.cos(angleRad) * orb.orbRadius;
                        orb.y = this.kangaroo.y - 50 + Math.sin(angleRad) * orb.orbRadius;
                    }
                });
            }
        });
    }

    removePowerupOrb(type) {
        if (this.powerupOrbs[type]) {
            this.powerupOrbs[type].forEach(orb => {
                if (orb) orb.destroy();
            });
            this.powerupOrbs[type] = [];
        }
    }

    activatePurchasedPowerup(type) {
        // Check if powerup is already active
        if (this.activePowerups[type].active) {
            console.log(`${type} powerup already active!`);
            return;
        }

        // Check if player has purchased this powerup
        const count = this.storeManager.getPowerUpCount(type === 'double' ? 'doubleJump' : type);
        if (count <= 0) {
            console.log(`No ${type} powerups available!`);
            return;
        }

        // Use the powerup (deduct from store)
        const storeType = type === 'double' ? 'doubleJump' : type;
        if (this.storeManager.usePowerUp(storeType)) {
            console.log(`Activated ${type} powerup! Remaining: ${this.storeManager.getPowerUpCount(storeType)}`);

            // Play powerup-specific sound
            if (type === 'shield') {
                this.audioManager?.playShieldActivate();
            } else if (type === 'magnet') {
                this.audioManager?.playMagnetActivate();
            } else if (type === 'double') {
                this.audioManager?.playDoubleJump();
            }

            // Activate powerup with durations
            this.activePowerups[type].active = true;
            this.activePowerups[type].timeLeft = 10000; // 10 seconds for all powerups

            if (type === 'double') {
                // Check if kangaroo is in the air when activating double jump
                const isOnGround = this.kangaroo.body.blocked.down || this.kangaroo.body.touching.down;
                this.activePowerups[type].jumpsLeft = isOnGround ? 0 : 1; // Give immediate jump if mid-air
            }

            // Create powerup orb
            this.createPowerupOrb(type);

            // Update inventory display
            this.updateSimpleInventoryUI();
        }
    }
    updateSimpleInventoryUI() {
        const shieldCount = this.storeManager.getPowerUpCount('shield');
        const magnetCount = this.storeManager.getPowerUpCount('magnet');
        const doubleCount = this.storeManager.getPowerUpCount('doubleJump');

        // Update counts
        this.shieldCount.setText(shieldCount.toString());
        this.magnetCount.setText(magnetCount.toString());
        this.doubleCount.setText(doubleCount.toString());

        // Dim icons when count is 0
        this.shieldIcon.setAlpha(shieldCount > 0 ? 1.0 : 0.4);
        this.shieldCount.setAlpha(shieldCount > 0 ? 1.0 : 0.4);

        this.magnetIcon.setAlpha(magnetCount > 0 ? 1.0 : 0.4);
        this.magnetCount.setAlpha(magnetCount > 0 ? 1.0 : 0.4);

        this.doubleIcon.setAlpha(doubleCount > 0 ? 1.0 : 0.4);
        this.doubleCount.setAlpha(doubleCount > 0 ? 1.0 : 0.4);
    }


}