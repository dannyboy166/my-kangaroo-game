import GameDataManager from '../managers/GameDataManager.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.gameSpeed = 500;
        this.score = 0;
        this.isGameOver = false;
        this.groundY = 450;
        this.obstacles = null;
        this.coins = null;
        this.obstacleTimer = null;
        this.coinTimer = null;
        this.lastSpeedIncrease = false;
        this.gameDataManager = GameDataManager.getInstance();

        // OBSTACLE SIZE CONFIGURATION
        this.obstacleSizeVariation = 0.20; // ±20% variation from base size
        this.obstacleBaseSizes = {
            rock: 0.75,
            cactus: 0.75,
            log: 0.5,
            emu: 0.8,
            croc: 0.6,
            camel: 1.2
        };

        // COLLISION PROTECTION
        this.collisionCooldown = false;
        this.coinCollectionCooldown = new Set(); // Track coins that are being collected
    }

    create() {

        // Reset all game state
        this.isGameOver = false;
        this.score = 0;
        this.gameSpeed = 300;
        this.obstacleTimer = null;
        this.coinTimer = null;
        this.collisionCooldown = false;
        this.coinCollectionCooldown.clear();

        // Add background
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xE0F6FF, 0xE0F6FF, 1);
        graphics.fillRect(0, 0, 800, 600);

        // Create ground
        this.ground = this.add.graphics();
        this.ground.fillStyle(0x8B4513);
        this.ground.fillRect(0, 500, 800, 100);

        // Add some ground texture
        this.ground.fillStyle(0x654321);
        for (let i = 0; i < 10; i++) {
            this.ground.fillRect(i * 80, 500, 40, 5);
        }

        // Create physics groups with debug tracking
        this.obstacles = this.physics.add.group();
        this.coins = this.physics.add.group();


        // Create kangaroo animations
        this.createKangarooAnimations();
        
        // Create emu animations
        this.createEmuAnimations();

        // Create kangaroo sprite
        this.kangaroo = this.physics.add.sprite(150, this.groundY, 'kangaroo');
        this.kangaroo.setScale(1.2);
        this.kangaroo.setCollideWorldBounds(true);
        this.kangaroo.body.setSize(80, 50);
        this.kangaroo.body.setOffset(30, 70);
        this.kangaroo.body.setGravityY(800);
        this.kangaroo.setOrigin(0.5, 1);
        this.kangaroo.play('kangaroo_run');

        // Create invisible ground for physics collision
        this.groundBody = this.physics.add.staticGroup();
        const groundCollider = this.groundBody.create(400, 550, null);
        groundCollider.setSize(1500, 100);
        groundCollider.setVisible(false);

        // Add collision between kangaroo and ground
        this.physics.add.collider(this.kangaroo, this.groundBody);
        this.physics.add.collider(this.obstacles, this.groundBody);

        // Create UI
        this.scoreText = this.add.text(20, 60, 'Score: 0', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        });

        // Add coin UI (top left)
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


        // Input handling
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.input.on('pointerdown', this.jump, this);


        // Start spawning obstacles and coins
        this.startSpawning();

        // Add collision detection
        this.physics.add.overlap(this.kangaroo, this.obstacles, (kangaroo, obstacle) => {
            if (!this.collisionCooldown && !this.isGameOver) {
                this.hitObstacle(kangaroo, obstacle);
            }
        }, null, this);

        this.physics.add.overlap(this.kangaroo, this.coins, (kangaroo, coin) => {
            if (!this.coinCollectionCooldown.has(coin) && !this.isGameOver) {
                this.collectCoin(kangaroo, coin);
            }
        }, null, this);

    }

    createKangarooAnimations() {
        if (this.anims.exists('kangaroo_run')) return;

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

    update(time, delta) {
        if (this.isGameOver) return;

        // Jump input
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
            Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.jump();
        }

        // Handle kangaroo animations
        const isOnGround = this.kangaroo.body.blocked.down || this.kangaroo.body.touching.down;
        const currentAnim = this.kangaroo.anims.currentAnim?.key;

        if (isOnGround) {
            if (currentAnim !== 'kangaroo_run') {
                this.kangaroo.play('kangaroo_run');
            }
        } else {
            if (currentAnim !== 'kangaroo_jump') {
                this.kangaroo.play('kangaroo_jump');
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

            obstacle.x -= this.gameSpeed * delta / 1000;

            if (obstacle.x < -100) {
                obstacle.destroy();
            }
        });

        // Move coins and clean up off-screen ones
        this.coins.children.entries.slice().forEach((coin) => {
            if (!coin || !coin.active) {
                return;
            }

            coin.x -= this.gameSpeed * delta / 1000;

            if (coin.x < -100) {
                this.coinCollectionCooldown.delete(coin);
                coin.destroy();
            }
        });

    }


    jump() {
        if (this.kangaroo.body.blocked.down || this.kangaroo.body.touching.down) {
            this.kangaroo.setVelocityY(-950);
        }
    }

    startSpawning() {
        this.scheduleNextObstacle();
        this.scheduleNextCoin();
    }

    scheduleNextObstacle() {
        if (this.isGameOver) {
            return;
        }

        const delay = Phaser.Math.Between(1500, 3500);
        this.obstacleTimer = this.time.delayedCall(delay, () => {
            if (!this.isGameOver && this.scene.isActive()) {
                this.spawnObstacle();
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

    spawnObstacle() {
        if (this.isGameOver) {
            return;
        }

        let obstacleTypes = ['rock', 'cactus', 'log'];
        
        // Add new obstacles based on score
        if (this.score >= 1000) {
            obstacleTypes.push('emu');
        }
        if (this.score >= 2000) {
            obstacleTypes.push('croc');
        }
        if (this.score >= 3000) {
            obstacleTypes.push('camel');
        }
        
        const randomType = Phaser.Utils.Array.GetRandom(obstacleTypes);

        const obstacle = this.physics.add.sprite(1200, this.groundY, randomType);
        
        // Calculate random size based on base size and variation
        const baseSize = this.obstacleBaseSizes[randomType] || 0.5;
        const variation = this.obstacleSizeVariation;
        const randomMultiplier = 1 + (Math.random() * 2 - 1) * variation; // Random between (1-variation) and (1+variation)
        const finalSize = baseSize * randomMultiplier;
        
        obstacle.setScale(finalSize);
        
        // Start animations for animated obstacles
        if (randomType === 'emu') {
            obstacle.play('emu_run');
        }
        obstacle.setOrigin(0.5, 1);
        obstacle.body.setImmovable(true);
        obstacle.body.setGravityY(0);
        obstacle.body.setSize(obstacle.width * 0.8, obstacle.height * 0.8);

        this.obstacles.add(obstacle);
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
            }
        });
    }


    collectCoin(kangaroo, coin) {
        if (this.coinCollectionCooldown.has(coin) || !coin.active) {
            return;
        }

        this.coinCollectionCooldown.add(coin);

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

        this.collisionCooldown = true;
        this.isGameOver = true;

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

        // Crash effect
        this.tweens.add({
            targets: this.kangaroo,
            angle: 90,
            duration: 500,
            ease: 'Power2'
        });

        // Game over screen
        this.time.delayedCall(1000, () => {
            this.scene.start('GameOverScene', { score: this.score });
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

        // Clear cooldown tracking
        this.coinCollectionCooldown.clear();

        // Reset game state
        this.isGameOver = false;
        this.collisionCooldown = false;
    }

}