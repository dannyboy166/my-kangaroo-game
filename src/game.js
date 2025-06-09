// src/game.js - Fixed version with visible kangaroo and proper obstacles

// Global game data
window.GameData = {
    score: 0,
    highScore: parseInt(localStorage.getItem('kangaroo_hop_high_score')) || 0,
    sessionCoins: 0,
    totalCoins: parseInt(localStorage.getItem('kangaroo_hop_total_coins')) || 0,
    gameSpeed: 250
};

// Simple Audio Manager
class AudioManager {
    constructor() {
        this.soundEnabled = true;
        this.sounds = {};
    }
    
    playButtonClick() {
        console.log('🔊 Button click!');
    }
    
    playJump() {
        console.log('🔊 Jump sound!');
    }
    
    playLand() {
        console.log('🔊 Land sound!');
    }
    
    playCoinCollect() {
        console.log('🔊 Coin collect!');
    }
}

window.GameData.audioManager = new AudioManager();

// MenuScene
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        console.log('📋 MENU SCENE LOADED!');
        
        // Background
        this.cameras.main.setBackgroundColor('#87CEEB');
        
        // Title
        this.add.text(400, 150, 'KANGAROO HOP', {
            fontSize: '64px',
            fill: '#4F9DFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(400, 200, 'Phaser Version - Testing', {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Start button
        const startButton = this.add.text(400, 300, 'CLICK TO START!', {
            fontSize: '32px',
            fill: '#ffffff',
            backgroundColor: '#4F9DFF',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        startButton.on('pointerdown', () => {
            window.GameData.audioManager.playButtonClick();
            console.log('Starting game...');
            this.scene.start('GameScene');
        });

        // Coin display (placeholder)
        this.add.circle(50, 50, 15, 0xFFD700);
        this.coinText = this.add.text(80, 50, window.GameData.totalCoins.toString(), {
            fontSize: '24px',
            fill: '#F7B027',
            fontWeight: 'bold'
        }).setOrigin(0, 0.5);

        // High score
        this.add.text(400, 450, `Best: ${window.GameData.highScore}`, {
            fontSize: '20px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Hover effects
        startButton.on('pointerover', () => startButton.setScale(1.1));
        startButton.on('pointerout', () => startButton.setScale(1.0));
    }
}

// GameScene
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        console.log('🎮 GAME SCENE LOADED!');
        
        // Initialize game state
        this.gameSpeed = 250;
        this.score = 0;
        this.sessionCoins = 0;
        this.distanceTraveled = 0;
        this.gameActive = true;
        
        // Background
        this.cameras.main.setBackgroundColor('#87CEEB');
        
        // Create ground - FIXED: Make it a proper static physics body
        this.ground = this.add.rectangle(400, 550, 800, 100, 0xD2691E);
        this.physics.add.existing(this.ground, true); // true = static body
        
        // Create kangaroo - FIXED: Make it visible and with proper physics
        this.kangaroo = this.add.rectangle(150, 450, 60, 60, 0x3498db);
        this.physics.add.existing(this.kangaroo);
        this.kangaroo.body.setBounce(0.3);
        this.kangaroo.body.setCollideWorldBounds(true);
        
        // FIXED: Add kangaroo properties
        this.kangaroo.jumpSpeed = -600;
        this.kangaroo.isOnGround = true;
        this.kangaroo.jumpCount = 0;
        
        // Physics collision between kangaroo and ground
        this.physics.add.collider(this.kangaroo, this.ground);
        
        // Create groups
        this.obstacles = this.physics.add.staticGroup();
        this.coins = this.physics.add.staticGroup();
        
        // Collision detection
        this.physics.add.overlap(this.kangaroo, this.obstacles, this.hitObstacle, null, this);
        this.physics.add.overlap(this.kangaroo, this.coins, this.collectCoin, null, this);
        
        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.input.on('pointerdown', () => this.jump());
        
        // UI
        this.scoreText = this.add.text(20, 20, 'Score: 0', {
            fontSize: '28px',
            fill: '#000000',
            backgroundColor: '#ffffff',
            padding: { x: 10, y: 5 }
        });
        
        this.coinText = this.add.text(20, 60, 'Coins: 0', {
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
        console.log('🦘 Kangaroo created at:', this.kangaroo.x, this.kangaroo.y);
    }

    update(time, delta) {
        if (!this.gameActive) return;
        
        // Update distance and score
        this.distanceTraveled += this.gameSpeed * delta / 1000;
        this.score = Math.floor(this.distanceTraveled / 25);
        this.scoreText.setText('Score: ' + this.score);
        this.coinText.setText('Coins: ' + this.sessionCoins);
        
        // Check if kangaroo landed
        if (this.kangaroo.body.touching.down && !this.kangaroo.isOnGround) {
            this.kangaroo.isOnGround = true;
            this.kangaroo.jumpCount = 0;
            window.GameData.audioManager.playLand();
            console.log('📍 Kangaroo landed!');
        }
        
        // Update moving objects
        this.obstacles.children.entries.forEach(obstacle => {
            obstacle.x -= this.gameSpeed * delta / 1000;
            if (obstacle.x < -50) {
                obstacle.destroy();
            }
        });
        
        this.coins.children.entries.forEach(coin => {
            coin.x -= this.gameSpeed * delta / 1000;
            if (coin.x < -50) {
                coin.destroy();
            }
        });
        
        // Jump input
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.jump();
        }
    }
    
    jump() {
        if (this.kangaroo && this.kangaroo.isOnGround) {
            this.kangaroo.body.setVelocityY(this.kangaroo.jumpSpeed);
            this.kangaroo.isOnGround = false;
            this.kangaroo.jumpCount++;
            
            // Visual feedback - flash white
            this.kangaroo.setFillStyle(0xFFFFFF);
            this.time.delayedCall(100, () => {
                this.kangaroo.setFillStyle(0x3498db);
            });
            
            window.GameData.audioManager.playJump();
            console.log(`🚀 Kangaroo jump #${this.kangaroo.jumpCount}!`);
        }
    }
    
    startObstacleSpawning() {
        this.obstacleTimer = this.time.addEvent({
            delay: 2500,
            callback: this.spawnObstacle,
            callbackScope: this,
            loop: true
        });
    }
    
    spawnObstacle() {
        if (!this.gameActive) return;
        
        // Create visual obstacle
        const obstacle = this.add.rectangle(850, 480, 50, 70, 0xFF0000);
        this.physics.add.existing(obstacle, true);
        this.obstacles.add(obstacle);
        
        console.log('🚫 Obstacle spawned at:', obstacle.x, obstacle.y);
    }
    
    startCoinSpawning() {
        this.coinTimer = this.time.addEvent({
            delay: 1800,
            callback: this.spawnCoin,
            callbackScope: this,
            loop: true
        });
    }
    
    spawnCoin() {
        if (!this.gameActive) return;
        
        // Create coin as graphics object
        const coin = this.add.graphics();
        coin.setPosition(850, 300 + Math.random() * 150);
        coin.fillStyle(0xFFD700);
        coin.fillCircle(0, 0, 15);
        
        // Add physics body and add to coins group
        this.physics.add.existing(coin, true); // true makes it static
        coin.body.setCircle(15);
        this.coins.add(coin);
        
        // Rotate coin
        this.tweens.add({
            targets: coin,
            scaleX: 0.5,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        
        console.log('💰 Coin spawned at:', coin.x, coin.y);
    }
    
    hitObstacle(kangaroo, obstacle) {
        console.log('💥 Hit obstacle! Game Over!');
        this.gameOver();
    }
    
    collectCoin(kangaroo, coin) {
        coin.destroy();
        this.sessionCoins += 5;
        window.GameData.audioManager.playCoinCollect();
        
        // Visual feedback - flash kangaroo gold
        this.kangaroo.setFillStyle(0xFFD700);
        this.time.delayedCall(100, () => {
            this.kangaroo.setFillStyle(0x3498db);
        });
        
        console.log('💰 Coin collected! Total:', this.sessionCoins);
    }
    
    gameOver() {
        this.gameActive = false;
        
        // Stop all movement
        this.physics.pause();
        
        // Stop spawning
        this.obstacleTimer?.destroy();
        this.coinTimer?.destroy();
        
        // Turn kangaroo red
        this.kangaroo.setFillStyle(0xFF0000);
        
        // Update high score
        if (this.score > window.GameData.highScore) {
            window.GameData.highScore = this.score;
            localStorage.setItem('kangaroo_hop_high_score', this.score.toString());
        }
        
        // Add coins to total
        window.GameData.totalCoins += this.sessionCoins;
        localStorage.setItem('kangaroo_hop_total_coins', window.GameData.totalCoins.toString());
        
        // Game over text
        this.add.text(400, 300, 'GAME OVER!', {
            fontSize: '48px',
            fill: '#FF0000',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        
        this.add.text(400, 370, `Score: ${this.score}`, {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        
        this.add.text(400, 410, `Coins: ${this.sessionCoins}`, {
            fontSize: '20px',
            fill: '#F7B027',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        
        this.add.text(400, 450, 'Click to restart', {
            fontSize: '18px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        
        // Restart on click
        this.input.once('pointerdown', () => {
            this.scene.restart();
        });
        
        console.log('💀 Game Over! Final score:', this.score);
    }
}

// Game configuration
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
            debug: false // Set to true to see collision boxes
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

console.log('🎯 Starting FIXED Kangaroo Hop Game...');
new Phaser.Game(config);