class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.jumpCount = 0;
        this.score = 0;
        this.gameSpeed = 200;
    }

    create() {
        console.log('🎮 GAME SCENE LOADED!');
        
        // Change background to show we're in game
        this.cameras.main.setBackgroundColor('#87CEEB'); // Sky blue
        
        // Create kangaroo using rectangle (no images needed)
        this.kangaroo = this.add.rectangle(150, 400, 60, 60, 0x3498db);
        this.physics.add.existing(this.kangaroo);
        this.kangaroo.body.setBounce(0.3);
        this.kangaroo.body.setCollideWorldBounds(true);
        
        // Create ground using rectangle
        this.ground = this.add.rectangle(400, 550, 800, 100, 0xD2691E);
        this.physics.add.existing(this.ground, true); // Static ground
        this.physics.add.collider(this.kangaroo, this.ground);
        
        // Groups for obstacles and coins
        this.obstacles = this.physics.add.group();
        this.coins = this.physics.add.group();
        
        // Collision detection
        this.physics.add.overlap(this.kangaroo, this.obstacles, this.hitObstacle, null, this);
        this.physics.add.overlap(this.kangaroo, this.coins, this.collectCoin, null, this);
        
        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.on('pointerdown', () => this.jump());
        
        // UI
        this.scoreText = this.add.text(20, 20, 'Score: 0', {
            fontSize: '28px',
            fill: '#000000',
            backgroundColor: '#ffffff',
            padding: { x: 10, y: 5 }
        });
        
        this.jumpText = this.add.text(20, 60, 'Jumps: 0', {
            fontSize: '24px',
            fill: '#000000',
            backgroundColor: '#ffffff',
            padding: { x: 10, y: 5 }
        });
        
        // Instructions
        this.add.text(400, 150, 'CLICK OR SPACE TO JUMP!', {
            fontSize: '32px',
            fill: '#000000',
            backgroundColor: '#ffffff',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        
        this.add.text(400, 200, 'Blue square = Kangaroo', {
            fontSize: '20px',
            fill: '#000000',
            backgroundColor: '#ffffff',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        
        // Start spawning
        this.startObstacleSpawning();
        this.startCoinSpawning();
        
        console.log('✅ Game scene setup complete!');
    }

    update() {
        // Update score
        this.score += 0.1;
        this.scoreText.setText('Score: ' + Math.floor(this.score));
        
        // Move obstacles
        this.obstacles.children.entries.forEach(obstacle => {
            obstacle.x -= this.gameSpeed * 0.016;
            if (obstacle.x < -50) {
                obstacle.destroy();
            }
        });
        
        // Move coins  
        this.coins.children.entries.forEach(coin => {
            coin.x -= this.gameSpeed * 0.016;
            if (coin.x < -50) {
                coin.destroy();
            }
        });
        
        // Jump input
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
            this.jump();
        }
    }
    
    jump() {
        this.jumpCount++;
        this.jumpText.setText('Jumps: ' + this.jumpCount);
        
        console.log(`🚀 Jump #${this.jumpCount}!`);
        
        // Jump if on ground
        if (this.kangaroo.body.touching.down || this.kangaroo.body.blocked.down) {
            this.kangaroo.body.setVelocityY(-500);
            
            // Visual feedback - flash white
            this.kangaroo.setFillStyle(0xFFFFFF);
            this.time.delayedCall(100, () => {
                this.kangaroo.setFillStyle(0x3498db);
            });
        }
    }
    
    startObstacleSpawning() {
        this.time.addEvent({
            delay: 2500,
            callback: () => {
                // Create obstacle (red rectangle)
                const obstacle = this.add.rectangle(850, 480, 50, 70, 0xFF0000);
                this.physics.add.existing(obstacle);
                obstacle.body.setImmovable(true);
                this.obstacles.add(obstacle);
                
                console.log('🚫 Obstacle spawned!');
            },
            loop: true
        });
    }
    
    startCoinSpawning() {
        this.time.addEvent({
            delay: 1800,
            callback: () => {
                // Create coin (yellow circle)
                const coin = this.add.circle(850, 300 + Math.random() * 150, 15, 0xFFD700);
                this.physics.add.existing(coin);
                coin.body.setImmovable(true);
                this.coins.add(coin);
                
                // Rotate coin
                this.tweens.add({
                    targets: coin,
                    scaleX: 0.5,
                    duration: 500,
                    yoyo: true,
                    repeat: -1
                });
                
                console.log('💰 Coin spawned!');
            },
            loop: true
        });
    }
    
    hitObstacle(kangaroo, obstacle) {
        console.log('💥 Hit obstacle! Game Over!');
        
        // Stop the game
        this.physics.pause();
        kangaroo.setFillStyle(0xFF0000); // Turn red
        
        // Game over text
        this.add.text(400, 300, 'GAME OVER!', {
            fontSize: '48px',
            fill: '#FF0000',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        
        this.add.text(400, 370, 'Click to restart', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        
        // Restart on click
        this.input.once('pointerdown', () => {
            this.scene.restart();
        });
    }
    
    collectCoin(kangaroo, coin) {
        coin.destroy();
        this.score += 10;
        console.log('💰 Coin collected! Score:', Math.floor(this.score));
        
        // Flash effect
        kangaroo.setFillStyle(0xFFD700);
        this.time.delayedCall(100, () => {
            kangaroo.setFillStyle(0x3498db);
        });
    }
}

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        console.log('📋 MENU SCENE LOADED!');
        
        // Title
        this.add.text(400, 200, 'KANGAROO HOP', {
            fontSize: '64px',
            fill: '#4F9DFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(400, 280, 'Shape Version (No Images)', {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Start button
        const startButton = this.add.text(400, 400, 'CLICK TO START!', {
            fontSize: '32px',
            fill: '#ffffff',
            backgroundColor: '#4F9DFF',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        startButton.on('pointerdown', () => {
            console.log('🎮 Starting game...');
            this.scene.start('GameScene');
        });
        
        // Hover effect
        startButton.on('pointerover', () => startButton.setScale(1.1));
        startButton.on('pointerout', () => startButton.setScale(1.0));
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#87CEEB',
    scene: [MenuScene, GameScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    }
};

console.log('🎯 Starting shape-based game...');
new Phaser.Game(config);