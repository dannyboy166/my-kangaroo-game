export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        // Game variables
        this.gameSpeed = 300;
        this.score = 0;
        this.isGameOver = false;
        this.groundY = 450; // Define ground level
        
        // Groups for collision detection
        this.obstacles = null;
        this.coins = null;
        
        // Timers
        this.obstacleTimer = null;
        this.coinTimer = null;
    }

    create() {
        console.log('GameScene: Creating new game');
        
        // Reset all game state
        this.isGameOver = false;
        this.score = 0;
        this.gameSpeed = 300;
        this.obstacleTimer = null;
        this.coinTimer = null;

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

        // Create physics groups
        this.obstacles = this.physics.add.group();
        this.coins = this.physics.add.group();

        // Create kangaroo animations
        this.createKangarooAnimations();

        // Create kangaroo sprite
        this.kangaroo = this.physics.add.sprite(150, this.groundY, 'kangaroo');
        this.kangaroo.setScale(1);
        this.kangaroo.setCollideWorldBounds(true);
        this.kangaroo.body.setSize(80, 80); // Adjust hitbox
        
        // IMPORTANT: Set kangaroo physics properly
        this.kangaroo.body.setGravityY(800); // Add gravity to kangaroo only
        this.kangaroo.setOrigin(0.5, 1); // Set origin to bottom-center for ground positioning
        
        // Start with running animation
        this.kangaroo.play('kangaroo_run');

        // Create invisible ground for physics collision
        this.groundBody = this.physics.add.staticGroup();
        const groundCollider = this.groundBody.create(400, 550, null);
        groundCollider.setSize(800, 100);
        groundCollider.setVisible(false);
        
        // Add collision between kangaroo and ground
        this.physics.add.collider(this.kangaroo, this.groundBody);
        
        // IMPORTANT: Add collision between obstacles and ground so they don't fall through
        this.physics.add.collider(this.obstacles, this.groundBody);
        
        // Create UI
        this.scoreText = this.add.text(20, 20, 'Score: 0', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        });

        // Input handling
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.input.on('pointerdown', this.jump, this);

        // Start spawning obstacles and coins
        this.startSpawning();

        // Add collision detection
        this.physics.add.overlap(this.kangaroo, this.obstacles, this.hitObstacle, null, this);
        this.physics.add.overlap(this.kangaroo, this.coins, this.collectCoin, null, this);

        console.log('GameScene: Game scene started successfully');
    }

    createKangarooAnimations() {
        // Check if animations already exist to avoid duplicates
        if (this.anims.exists('kangaroo_run')) return;

        // Running animation using all 12 frames
        this.anims.create({
            key: 'kangaroo_run',
            frames: this.anims.generateFrameNumbers('kangaroo', { start: 0, end: 11 }),
            frameRate: 15, // Adjusted for smooth animation
            repeat: -1
        });

        // Jumping animation using frame 2 (static)
        this.anims.create({
            key: 'kangaroo_jump',
            frames: [{ key: 'kangaroo', frame: 2 }],
            frameRate: 1
        });

        // Idle animation using frame 0
        this.anims.create({
            key: 'kangaroo_idle',
            frames: [{ key: 'kangaroo', frame: 0 }],
            frameRate: 1
        });
    }

    update() {
        if (this.isGameOver) return;

        // Jump input
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || 
            Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.jump();
        }

        // Handle animations based on kangaroo state
        if (this.kangaroo.body.blocked.down || this.kangaroo.body.touching.down) {
            // On ground - play running animation
            if (this.kangaroo.anims.currentAnim?.key !== 'kangaroo_run') {
                this.kangaroo.play('kangaroo_run');
            }
        } else {
            // In air - play jumping animation
            if (this.kangaroo.anims.currentAnim?.key !== 'kangaroo_jump') {
                this.kangaroo.play('kangaroo_jump');
            }
        }

        // Update score based on time
        this.score += 1;
        this.scoreText.setText('Score: ' + this.score);

        // Gradually increase game speed
        if (this.score % 500 === 0) {
            this.gameSpeed += 25;
        }

        // Move obstacles and coins
        this.obstacles.children.entries.forEach((obstacle) => {
            obstacle.x -= this.gameSpeed * this.game.loop.delta / 1000;
            
            if (obstacle.x < -100) {
                obstacle.destroy();
            }
        });

        this.coins.children.entries.forEach((coin) => {
            coin.x -= this.gameSpeed * this.game.loop.delta / 1000;
            if (coin.x < -100) {
                coin.destroy();
            }
        });
    }

    jump() {
        // Only jump if kangaroo is on ground (check both blocked and touching)
        if (this.kangaroo.body.blocked.down || this.kangaroo.body.touching.down) {
            this.kangaroo.setVelocityY(-900); // Stronger jump
            this.kangaroo.play('kangaroo_jump');
        }
    }

    startSpawning() {
        // Start initial obstacle spawn
        this.scheduleNextObstacle();
        
        // Start initial coin spawn  
        this.scheduleNextCoin();
    }

    scheduleNextObstacle() {
        if (this.isGameOver) return;
        
        this.obstacleTimer = this.time.delayedCall(Phaser.Math.Between(1500, 3500), () => {
            if (!this.isGameOver && this.scene.isActive()) {
                this.spawnObstacle();
                this.scheduleNextObstacle(); // Schedule the next one
            }
        });
    }

    scheduleNextCoin() {
        if (this.isGameOver) return;
        
        this.coinTimer = this.time.delayedCall(Phaser.Math.Between(2500, 4500), () => {
            if (!this.isGameOver && this.scene.isActive()) {
                this.spawnCoin();
                this.scheduleNextCoin(); // Schedule the next one
            }
        });
    }

    spawnObstacle() {
        if (this.isGameOver) return;
        
        const obstacleTypes = ['rock', 'cactus', 'log'];
        const randomType = Phaser.Utils.Array.GetRandom(obstacleTypes);
        
        // Create obstacle as physics sprite but make it IMMOVABLE
        const obstacle = this.physics.add.sprite(850, this.groundY, randomType);
        obstacle.setScale(0.3);
        obstacle.setOrigin(0.5, 1); // Bottom-center origin for ground positioning
        
        // CRITICAL: Make obstacle immovable so it doesn't fall
        obstacle.body.setImmovable(true);
        obstacle.body.setGravityY(0); // Remove gravity from obstacles
        obstacle.body.setSize(obstacle.width * 0.8, obstacle.height * 0.8);
        
        // Add to physics group for collision detection
        this.obstacles.add(obstacle);
    }

    spawnCoin() {
        if (this.isGameOver) return;
        
        // Spawn coin at random height
        const coinY = Phaser.Math.Between(200, this.groundY - 50);
        const coin = this.add.image(850, coinY, 'coin');
        coin.setScale(0.3);
        
        // Add spinning animation
        this.tweens.add({
            targets: coin,
            rotation: Math.PI * 2,
            duration: 1000,
            repeat: -1
        });

        // Add floating animation
        this.tweens.add({
            targets: coin,
            y: coinY - 10,
            duration: 800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        this.coins.add(coin);
    }

    shutdown() {
        console.log('GameScene: Shutting down and cleaning up');
        
        // Stop all timers
        if (this.obstacleTimer) {
            this.obstacleTimer.destroy();
            this.obstacleTimer = null;
        }
        if (this.coinTimer) {
            this.coinTimer.destroy();
            this.coinTimer = null;
        }
        
        // Clear all tweens
        this.tweens.killAll();
        
        // Remove input listeners
        this.input.off('pointerdown', this.jump, this);
        
        // Clear physics groups
        if (this.obstacles) {
            this.obstacles.clear(true, true);
        }
        if (this.coins) {
            this.coins.clear(true, true);
        }
        
        // Reset game state
        this.isGameOver = false;
        
        console.log('GameScene: Cleanup complete');
    }

    collectCoin(kangaroo, coin) {
        // Add points
        this.score += 50;
        
        // Create collection effect
        this.tweens.add({
            targets: coin,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 300,
            onComplete: () => coin.destroy()
        });

        // Add sparkle effect
        const particles = this.add.particles(coin.x, coin.y, 'coin', {
            scale: 0.2,
            speed: { min: 50, max: 100 },
            lifespan: 500,
            quantity: 5
        });

        // Clean up particles
        this.time.delayedCall(500, () => particles.destroy());
    }

    hitObstacle(kangaroo, obstacle) {
        if (this.isGameOver) return;
        
        console.log('Hit obstacle - game over!');
        this.isGameOver = true;

        // Stop kangaroo
        this.kangaroo.setVelocity(0, 0);
        this.kangaroo.setTint(0xff6666);

        // Stop all spawning timers
        if (this.obstacleTimer) {
            this.obstacleTimer.destroy();
            this.obstacleTimer = null;
        }
        if (this.coinTimer) {
            this.coinTimer.destroy();
            this.coinTimer = null;
        }

        // Stop all existing obstacles and coins from moving
        this.obstacles.children.entries.forEach(obs => {
            obs.body.setVelocity(0, 0);
        });
        
        this.coins.children.entries.forEach(coin => {
            // Stop tweens on coins
            this.tweens.killTweensOf(coin);
        });

        // Add crash effect
        this.tweens.add({
            targets: this.kangaroo,
            angle: 90,
            duration: 500,
            ease: 'Power2'
        });

        // Show game over after delay
        this.time.delayedCall(1000, () => {
            this.scene.start('GameOverScene', { score: this.score });
        });
    }
}