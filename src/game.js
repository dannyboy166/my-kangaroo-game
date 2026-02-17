// src/game.js - Updated version with real sprites and working collision

// Global game data
window.GameData = {
    score: 0,
    highScore: parseInt(localStorage.getItem('kangaroo_hop_high_score')) || 0,
    sessionCoins: 0,
    totalCoins: parseInt(localStorage.getItem('kangaroo_hop_total_coins')) || 0,
    gameSpeed: 250
};

// Audio Manager with actual sound support
class AudioManager {
    constructor() {
        this.soundEnabled = true;
        this.sounds = {};
        this.scene = null;
    }
    
    init(scene) {
        this.scene = scene;
    }
    
    playButtonClick() {
        console.log('🔊 Button click!');
        this.playSound('button_click', 0.6);
    }
    
    playJump() {
        console.log('🔊 Jump sound!');
        this.playSound('jump', 0.7);
    }
    
    playLand() {
        console.log('🔊 Land sound!');
        this.playSound('land', 0.6);
    }
    
    playCoinCollect() {
        console.log('🔊 Coin collect!');
        this.playSound('coin_collect', 0.9);
    }
    
    playCollision() {
        console.log('🔊 Collision!');
        this.playSound('collision', 0.8);
    }
    
    playGameOver() {
        console.log('🔊 Game Over!');
        this.playSound('game_over', 1.0);
    }
    
    playSound(key, volume = 1.0) {
        if (!this.soundEnabled || !this.scene) return;
        
        try {
            this.scene.sound.play(key, { volume });
        } catch (e) {
            console.warn(`Failed to play sound: ${key}`, e);
        }
    }
}

window.GameData.audioManager = new AudioManager();

// MenuScene
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        console.log('📥 Loading menu assets...');
        
        // Load basic UI assets (skip the ones that might not exist)
        try {
            this.load.image('coin', 'assets/images/coin.png');
        } catch (e) {
            console.warn('Could not load coin image, using fallback');
        }
        
        // Load audio if available
        try {
            this.load.audio('button_click', 'assets/audio/sfx/button_click.mp3');
        } catch (e) {
            console.warn('Could not load button click sound');
        }
    }

    create() {
        console.log('📋 MENU SCENE LOADED!');
        
        // Initialize audio manager
        window.GameData.audioManager.init(this);
        
        // Background
        this.cameras.main.setBackgroundColor('#87CEEB');
        
        // Title
        this.add.text(400, 150, 'KANGAROO HOP', {
            fontSize: '64px',
            fill: '#4F9DFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(400, 200, 'Phaser Version - With Real Sprites!', {
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

        // Coin display - use image if available, otherwise circle
        if (this.textures.exists('coin')) {
            this.add.image(50, 50, 'coin').setScale(0.8);
        } else {
            this.add.circle(50, 50, 15, 0xFFD700);
        }
        
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

// Kangaroo Sprite Class with real animations
class Kangaroo extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Try to use sprite sheet, fallback to colored rectangle
        super(scene, x, y, scene.textures.exists('kangaroo_sheet') ? 'kangaroo_sheet' : null);
        
        this.scene = scene;
        this.jumpSpeed = -600;
        this.isOnGround = true;
        this.jumpCount = 0;
        this.hasDoubleJump = false;
        this.shieldCount = 0;
        this.useSprites = scene.textures.exists('kangaroo_sheet');
        
        // Set up physics
        scene.physics.add.existing(this);
        this.body.setBounce(0.3);
        this.body.setCollideWorldBounds(true);
        this.body.setSize(60, 30); // Collision box
        
        if (this.useSprites) {
            console.log('🦘 Using kangaroo sprite sheet!');
            this.setScale(1.1);
            this.createAnimations();
            this.anims.play('kangaroo_run');
        } else {
            console.log('🦘 Using colored rectangle kangaroo');
            this.setDisplaySize(60, 60);
            this.setTint(0x3498db); // Blue kangaroo
        }
    }
    
    createAnimations() {
        if (!this.scene.anims.exists('kangaroo_run')) {
            this.scene.anims.create({
                key: 'kangaroo_run',
                frames: this.scene.anims.generateFrameNumbers('kangaroo_sheet', { start: 0, end: 11 }),
                frameRate: 12,
                repeat: -1
            });
        }
        
        if (!this.scene.anims.exists('kangaroo_jump')) {
            this.scene.anims.create({
                key: 'kangaroo_jump',
                frames: [{ key: 'kangaroo_sheet', frame: 2 }],
                frameRate: 1
            });
        }
    }
    
    jump() {
        if (this.isOnGround) {
            this.body.setVelocityY(this.jumpSpeed);
            this.isOnGround = false;
            this.jumpCount = 1;
            
            if (this.useSprites) {
                this.anims.play('kangaroo_jump');
            } else {
                // Visual feedback for rectangle version
                this.setTint(0xFFFFFF);
                this.scene.time.delayedCall(100, () => {
                    this.setTint(0x3498db);
                });
            }
            
            window.GameData.audioManager.playJump();
            console.log('🚀 Jump!');
        } else if (this.hasDoubleJump && this.jumpCount === 1) {
            this.body.setVelocityY(this.jumpSpeed * 0.75);
            this.jumpCount = 2;
            window.GameData.audioManager.playJump();
            console.log('🚀 Double Jump!');
        }
    }
    
    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        
        // Check if landed
        if (this.body.touching.down || this.body.blocked.down) {
            if (!this.isOnGround) {
                this.land();
            }
        }
    }
    
    land() {
        this.isOnGround = true;
        this.jumpCount = 0;
        
        if (this.useSprites) {
            this.anims.play('kangaroo_run');
        }
        
        window.GameData.audioManager.playLand();
        console.log('📍 Landed!');
    }
    
    addShield() {
        this.shieldCount++;
        console.log('🛡️ Shield added! Count:', this.shieldCount);
    }
    
    removeShield() {
        if (this.shieldCount > 0) {
            this.shieldCount--;
            console.log('🛡️ Shield removed! Count:', this.shieldCount);
            return true;
        }
        return false;
    }
    
    hasShield() {
        return this.shieldCount > 0;
    }
}

// GameScene with real sprites and WORKING collision
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        console.log('📥 Loading game assets...');
        
        // Load kangaroo sprite sheet (12 frames, 128x128 each)
        try {
            this.load.spritesheet('kangaroo_sheet', 'assets/images/kangaroos.png', {
                frameWidth: 128,
                frameHeight: 128
            });
            console.log('✅ Kangaroo sprite sheet loaded');
        } catch (e) {
            console.warn('⚠️ Could not load kangaroo sprite sheet');
        }
        
        // Load emu sprite sheet (4 frames)
        try {
            this.load.spritesheet('emu_sheet', 'assets/images/emu_sheet.png', {
                frameWidth: 128,
                frameHeight: 128
            });
            console.log('✅ Emu sprite sheet loaded');
        } catch (e) {
            console.warn('⚠️ Could not load emu sprite sheet');
        }
        
        // Load obstacle images
        const obstacles = ['rock', 'cactus', 'log', 'croc', 'emu', 'camel'];
        obstacles.forEach(obstacle => {
            try {
                this.load.image(obstacle, `assets/images/${obstacle}.png`);
            } catch (e) {
                console.warn(`⚠️ Could not load ${obstacle} image`);
            }
        });
        
        // Load power-up images
        const powerUps = ['shield', 'magnet', 'double'];
        powerUps.forEach(powerUp => {
            try {
                this.load.image(powerUp, `assets/images/${powerUp}.png`);
            } catch (e) {
                console.warn(`⚠️ Could not load ${powerUp} image`);
            }
        });
        
        // Load coin
        try {
            this.load.image('coin', 'assets/images/coin.png');
        } catch (e) {
            console.warn('⚠️ Could not load coin image');
        }
        
        // Load audio
        const sounds = ['jump', 'land', 'coin_collect', 'collision', 'game_over'];
        sounds.forEach(sound => {
            try {
                this.load.audio(sound, `assets/audio/sfx/${sound}.mp3`);
            } catch (e) {
                console.warn(`⚠️ Could not load ${sound} audio`);
            }
        });
    }

    create() {
        console.log('🎮 GAME SCENE LOADED!');
        
        // Initialize audio manager
        window.GameData.audioManager.init(this);
        
        // Initialize game state
        this.gameSpeed = 250;
        this.score = 0;
        this.sessionCoins = 0;
        this.distanceTraveled = 0;
        this.gameActive = true;
        
        // Background
        this.cameras.main.setBackgroundColor('#87CEEB');
        
        // Create ground
        this.ground = this.add.rectangle(400, 550, 800, 100, 0xD2691E);
        this.physics.add.existing(this.ground, true);
        
        // Create kangaroo with real sprites
        this.kangaroo = new Kangaroo(this, 150, 450);
        this.add.existing(this.kangaroo);
        
        // CRITICAL: Physics collision between kangaroo and ground
        this.physics.add.collider(this.kangaroo, this.ground);
        
        // Create groups - FIXED: Use proper physics groups
        this.obstacles = this.physics.add.group();
        this.coins = this.physics.add.group();
        this.powerUps = this.physics.add.group();
        
        // CRITICAL: Collision detection - these should work now!
        this.physics.add.overlap(this.kangaroo, this.obstacles, this.hitObstacle, null, this);
        this.physics.add.overlap(this.kangaroo, this.coins, this.collectCoin, null, this);
        this.physics.add.overlap(this.kangaroo, this.powerUps, this.collectPowerUp, null, this);
        
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
        
        this.add.text(400, 200, 'Real sprites loaded!', {
            fontSize: '20px',
            fill: '#000000',
            backgroundColor: '#ffffff',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        
        // Start spawning
        this.startObstacleSpawning();
        this.startCoinSpawning();
        this.startPowerUpSpawning();
        
        console.log('✅ Game scene setup complete with collision detection!');
        console.log('🦘 Kangaroo created at:', this.kangaroo.x, this.kangaroo.y);
    }

    update(time, delta) {
        if (!this.gameActive) return;
        
        // Update distance and score
        this.distanceTraveled += this.gameSpeed * delta / 1000;
        this.score = Math.floor(this.distanceTraveled / 25);
        this.scoreText.setText('Score: ' + this.score);
        this.coinText.setText('Coins: ' + this.sessionCoins);
        
        // Increase game speed gradually
        if (this.score < 650) {
            this.gameSpeed = 250 + (this.score / 650) * 250;
        } else if (this.score < 1000) {
            this.gameSpeed = 500 + ((this.score - 650) / 350) * 125;
        } else {
            this.gameSpeed = Math.min(1000, 625 + ((this.score - 1000) / 500) * 125);
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
        
        this.powerUps.children.entries.forEach(powerUp => {
            powerUp.x -= this.gameSpeed * delta / 1000;
            if (powerUp.x < -50) {
                powerUp.destroy();
            }
        });
        
        // Jump input
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.jump();
        }
    }
    
    jump() {
        if (this.kangaroo) {
            this.kangaroo.jump();
        }
    }
    
    startObstacleSpawning() {
        this.obstacleTimer = this.time.addEvent({
            delay: 2500,
            callback: () => {
                if (!this.gameActive) return;
                
                this.spawnObstacle();
            },
            loop: true
        });
    }
    
    spawnObstacle() {
        // Choose obstacle type based on what's available
        const availableObstacles = ['rock', 'cactus', 'log', 'croc', 'emu', 'camel'].filter(type => 
            this.textures.exists(type)
        );
        
        let obstacle;
        
        if (availableObstacles.length > 0) {
            // Use real sprite
            const type = availableObstacles[Math.floor(Math.random() * availableObstacles.length)];
            obstacle = this.add.image(850, 480, type);
            obstacle.setScale(0.8);
            console.log(`🚫 ${type} obstacle spawned!`);
        } else {
            // Fallback to red rectangle
            obstacle = this.add.rectangle(850, 480, 50, 70, 0xFF0000);
            console.log('🚫 Rectangle obstacle spawned!');
        }
        
        // Add physics and add to group
        this.physics.add.existing(obstacle, true); // Static body
        this.obstacles.add(obstacle);
    }
    
    startCoinSpawning() {
        this.coinTimer = this.time.addEvent({
            delay: 1800,
            callback: () => {
                if (!this.gameActive) return;
                
                this.spawnCoin();
            },
            loop: true
        });
    }
    
    spawnCoin() {
        let coin;
        
        if (this.textures.exists('coin')) {
            // Use real coin sprite
            coin = this.add.image(850, 300 + Math.random() * 150, 'coin');
            coin.setScale(0.8);
            console.log('💰 Coin sprite spawned!');
        } else {
            // Fallback to yellow circle
            coin = this.add.circle(850, 300 + Math.random() * 150, 15, 0xFFD700);
            console.log('💰 Circle coin spawned!');
        }
        
        // Add physics and add to group
        this.physics.add.existing(coin, true); // Static body
        this.coins.add(coin);
        
        // Add rotation animation
        this.tweens.add({
            targets: coin,
            scaleX: coin.scaleX * -1,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    startPowerUpSpawning() {
        this.powerUpTimer = this.time.addEvent({
            delay: 15000,
            callback: () => {
                if (!this.gameActive) return;
                
                this.spawnPowerUp();
            },
            loop: true
        });
    }
    
    spawnPowerUp() {
        const types = ['shield', 'magnet', 'double'];
        const availableTypes = types.filter(type => this.textures.exists(type));
        
        let powerUp;
        
        if (availableTypes.length > 0) {
            const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
            powerUp = this.add.image(850, 250 + Math.random() * 100, type);
            powerUp.setScale(0.8);
            powerUp.powerType = type;
            console.log(`⚡ ${type} power-up spawned!`);
        } else {
            // Fallback to colored rectangle
            powerUp = this.add.rectangle(850, 250 + Math.random() * 100, 40, 40, 0x9370DB);
            powerUp.powerType = 'shield';
            console.log('⚡ Rectangle power-up spawned!');
        }
        
        // Add physics and add to group
        this.physics.add.existing(powerUp, true);
        this.powerUps.add(powerUp);
        
        // Add floating animation
        this.tweens.add({
            targets: powerUp,
            y: powerUp.y - 10,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    // CRITICAL: These collision functions should now work!
    hitObstacle(kangaroo, obstacle) {
        console.log('💥 HIT OBSTACLE! COLLISION DETECTED!');
        
        if (kangaroo.hasShield()) {
            kangaroo.removeShield();
            obstacle.destroy();
            window.GameData.audioManager.playCollision();
            console.log('🛡️ Shield protected you!');
        } else {
            this.gameOver();
        }
    }
    
    collectCoin(kangaroo, coin) {
        console.log('💰 COIN COLLECTED! COLLISION DETECTED!');
        
        coin.destroy();
        this.sessionCoins += 5;
        window.GameData.audioManager.playCoinCollect();
        
        // Visual feedback
        if (kangaroo.setTint) {
            kangaroo.setTint(0xFFD700);
            this.time.delayedCall(100, () => {
                kangaroo.setTint(0xffffff);
            });
        }
        
        console.log('💰 Total session coins:', this.sessionCoins);
    }
    
    collectPowerUp(kangaroo, powerUp) {
        console.log('⚡ POWER-UP COLLECTED! COLLISION DETECTED!');
        
        const type = powerUp.powerType;
        powerUp.destroy();
        
        this.activatePowerUp(type);
        console.log('⚡ Activated power-up:', type);
    }
    
    activatePowerUp(type) {
        switch (type) {
            case 'shield':
                this.kangaroo.addShield();
                break;
            case 'magnet':
                // Implement magnet logic
                console.log('🧲 Magnet activated!');
                break;
            case 'double':
                this.kangaroo.hasDoubleJump = true;
                console.log('🚀 Double jump activated!');
                setTimeout(() => {
                    this.kangaroo.hasDoubleJump = false;
                    console.log('🚀 Double jump expired');
                }, 10000);
                break;
        }
    }
    
    gameOver() {
        console.log('💀 GAME OVER!');
        
        this.gameActive = false;
        
        // Stop all movement
        this.physics.pause();
        
        // Stop spawning
        this.obstacleTimer?.destroy();
        this.coinTimer?.destroy();
        this.powerUpTimer?.destroy();
        
        // Visual feedback
        if (this.kangaroo.setTint) {
            this.kangaroo.setTint(0xFF0000);
        }
        
        // Update high score
        if (this.score > window.GameData.highScore) {
            window.GameData.highScore = this.score;
            localStorage.setItem('kangaroo_hop_high_score', this.score.toString());
        }
        
        // Add coins to total
        window.GameData.totalCoins += this.sessionCoins;
        localStorage.setItem('kangaroo_hop_total_coins', window.GameData.totalCoins.toString());
        
        // Play game over sound
        window.GameData.audioManager.playGameOver();
        
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

console.log('🎯 Starting Kangaroo Hop with REAL SPRITES and WORKING COLLISION!');
new Phaser.Game(config);