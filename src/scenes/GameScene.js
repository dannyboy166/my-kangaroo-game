// src/scenes/GameScene.js

import Kangaroo from '../sprites/Kangaroo.js';
import Obstacle from '../sprites/Obstacle.js';
import Coin from '../sprites/Coin.js';
import PowerUp from '../sprites/PowerUp.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        console.log('📥 Loading game assets...');
        
        // Load kangaroo sprite sheet
        this.load.spritesheet('kangaroo_anim', 'assets/images/kangaroos.png', {
            frameWidth: 128,
            frameHeight: 128
        });
        
        // Load coin
        this.load.image('coin', 'assets/images/coin.png');
        
        // Obstacles
        this.load.image('rock', 'assets/images/rock.png');
        this.load.image('cactus', 'assets/images/cactus.png');
        this.load.image('log', 'assets/images/log.png');
        this.load.image('croc', 'assets/images/croc.png');
        this.load.image('emu', 'assets/images/emu.png');
        this.load.image('camel', 'assets/images/camel.png');
        
        // Power-ups
        this.load.image('shield', 'assets/images/shield.png');
        this.load.image('magnet', 'assets/images/magnet.png');
        this.load.image('double', 'assets/images/double.png');
        
        // Audio
        this.load.audio('jump', 'assets/audio/sfx/jump.mp3');
        this.load.audio('land', 'assets/audio/sfx/land.mp3');
        this.load.audio('coin_collect', 'assets/audio/sfx/coin_collect.mp3');
        this.load.audio('collision', 'assets/audio/sfx/collision.mp3');
        this.load.audio('game_over', 'assets/audio/sfx/game_over.mp3');
        this.load.audio('double_jump', 'assets/audio/sfx/double_jump.mp3');
        this.load.audio('shield_activate', 'assets/audio/sfx/shield_activate.mp3');
        this.load.audio('magnet_activate', 'assets/audio/sfx/magnet_activate.mp3');
    }

    create() {
        console.log('🎮 GAME SCENE LOADED!');
        
        // Initialize audio manager with this scene
        window.GameData.audioManager.init(this);
        
        // Load all sounds (only if they exist)
        const sounds = {};
        const soundKeys = ['jump', 'land', 'coin_collect', 'collision', 'game_over', 
                          'double_jump', 'shield_activate', 'magnet_activate', 'gameplay_music'];
        
        soundKeys.forEach(key => {
            if (this.cache.audio.exists(key)) {
                sounds[key] = this.sound.add(key);
            }
        });
        
        window.GameData.audioManager.setSounds(sounds);
        
        // Play background music if it exists
        if (sounds.gameplay_music) {
            window.GameData.audioManager.playMusic('gameplay_music', 0.3);
        }
        
        // Initialize game state
        this.gameSpeed = 250;
        this.score = 0;
        this.sessionCoins = 0;
        this.distanceTraveled = 0;
        this.gameActive = true;
        this.magnetActive = false;
        this.magnetTimer = null;
        
        // Background
        this.cameras.main.setBackgroundColor('#87CEEB');
        
        // Create ground - positioned at bottom of screen
        this.ground = this.add.rectangle(400, 550, 800, 100, 0xD2691E);
        this.physics.add.existing(this.ground, true);
        
        // Create kangaroo - position above ground
        this.kangaroo = new Kangaroo(this, 150, 450);
        this.add.existing(this.kangaroo);
        
        // Physics collision between kangaroo and ground
        this.physics.add.collider(this.kangaroo, this.ground);
        
        // Create groups
        this.obstacles = this.physics.add.group();
        this.coins = this.physics.add.group();
        this.powerUps = this.physics.add.group();
        
        // Collision detection - IMPORTANT: Add ground collision for obstacles
        this.physics.add.collider(this.obstacles, this.ground);
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
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        
        this.coinText = this.add.text(20, 60, 'Coins: 0', {
            fontSize: '24px',
            fill: '#F7B027',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        
        // Power-up indicators
        this.createPowerUpIndicators();
        
        // Start spawning
        this.startObstacleSpawning();
        this.startCoinSpawning();
        this.startPowerUpSpawning();
        
        console.log('✅ Game scene setup complete!');
    }

    createPowerUpIndicators() {
        // Shield indicator
        this.shieldIndicator = this.add.circle(750, 30, 15, 0x4169E1).setAlpha(0.3);
        
        // Double jump indicator
        this.doubleJumpIndicator = this.add.circle(750, 70, 15, 0x9370DB).setAlpha(0.3);
        
        // Magnet indicator
        this.magnetIndicator = this.add.circle(750, 110, 15, 0xFF1493).setAlpha(0.3);
    }

    update(time, delta) {
        if (!this.gameActive) return;
        
        // Update distance and score
        this.distanceTraveled += this.gameSpeed * delta / 1000;
        this.score = Math.floor(this.distanceTraveled / 25);
        this.scoreText.setText('Score: ' + this.score);
        this.coinText.setText('Coins: ' + this.sessionCoins);
        
        // Increase game speed
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
            
            // Magnet effect
            if (this.magnetActive) {
                const distance = Phaser.Math.Distance.Between(
                    this.kangaroo.x, this.kangaroo.y,
                    coin.x, coin.y
                );
                
                if (distance < 150) {
                    const angle = Phaser.Math.Angle.Between(
                        coin.x, coin.y,
                        this.kangaroo.x, this.kangaroo.y
                    );
                    coin.x += Math.cos(angle) * 5;
                    coin.y += Math.sin(angle) * 5;
                }
            }
            
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
        
        // Update power-up indicators
        this.shieldIndicator.setAlpha(this.kangaroo.hasShield() ? 1.0 : 0.3);
        this.doubleJumpIndicator.setAlpha(this.kangaroo.hasDoubleJump ? 1.0 : 0.3);
        this.magnetIndicator.setAlpha(this.magnetActive ? 1.0 : 0.3);
        
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
        // Initial spawn
        this.time.delayedCall(1500, () => this.spawnObstacle());
        
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
        const types = ['rock', 'cactus', 'log', 'croc', 'emu', 'camel'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        // Spawn higher so it falls to ground
        const obstacle = new Obstacle(this, 850, 450, type);
        this.add.existing(obstacle);
        this.obstacles.add(obstacle);
        
        console.log('🚫 Obstacle spawned:', type);
    }
    
    startCoinSpawning() {
        this.coinTimer = this.time.addEvent({
            delay: 1800,
            callback: () => {
                if (!this.gameActive) return;
                
                // Spawn coins at various heights
                const yPos = 320 + Math.random() * 120;
                const coin = new Coin(this, 850, yPos);
                this.add.existing(coin);
                this.coins.add(coin);
                
                console.log('💰 Coin spawned!');
            },
            loop: true
        });
    }
    
    startPowerUpSpawning() {
        this.powerUpTimer = this.time.addEvent({
            delay: 15000,
            callback: () => {
                if (!this.gameActive) return;
                
                const types = ['shield', 'magnet', 'double'];
                const type = types[Math.floor(Math.random() * types.length)];
                const yPos = 280 + Math.random() * 80;
                const powerUp = new PowerUp(this, 850, yPos, type);
                this.add.existing(powerUp);
                this.powerUps.add(powerUp);
                
                console.log('⚡ Power-up spawned:', type);
            },
            loop: true
        });
    }
    
    hitObstacle(kangaroo, obstacle) {
        console.log('💥 Hit obstacle!');
        
        if (kangaroo.hasShield()) {
            kangaroo.removeShield();
            obstacle.destroy();
            window.GameData.audioManager.playCollision();
            
            // Visual feedback
            this.cameras.main.shake(200, 0.01);
            this.cameras.main.flash(200, 255, 255, 255, true);
            
            console.log('🛡️ Shield protected you!');
        } else {
            this.gameOver();
        }
    }
    
    collectCoin(kangaroo, coin) {
        coin.destroy();
        this.sessionCoins += 5;
        window.GameData.audioManager.playCoinCollect();
        
        // Visual feedback
        const coinText = this.add.text(coin.x, coin.y, '+5', {
            fontSize: '24px',
            fill: '#F7B027',
            fontWeight: 'bold'
        });
        
        this.tweens.add({
            targets: coinText,
            y: coin.y - 50,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => coinText.destroy()
        });
        
        console.log('💰 Coin collected! Total:', this.sessionCoins);
    }
    
    collectPowerUp(kangaroo, powerUp) {
        const type = powerUp.powerType;
        powerUp.destroy();
        this.activatePowerUp(type);
        
        // Visual feedback
        this.cameras.main.flash(500, 255, 255, 255, true);
        
        console.log('⚡ Power-up collected:', type);
    }
    
    activatePowerUp(type) {
        switch (type) {
            case 'shield':
                this.kangaroo.addShield();
                window.GameData.audioManager.playShieldActivate();
                
                // Visual effect
                const shieldEffect = this.add.circle(this.kangaroo.x, this.kangaroo.y, 50, 0x00ff00, 0.3);
                this.tweens.add({
                    targets: shieldEffect,
                    scale: 2,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => shieldEffect.destroy()
                });
                
                // Auto-remove after 8 seconds
                this.time.delayedCall(8000, () => {
                    if (this.kangaroo.hasShield()) {
                        this.kangaroo.removeShield();
                    }
                });
                break;
                
            case 'magnet':
                this.magnetActive = true;
                window.GameData.audioManager.playMagnetActivate();
                
                // Clear existing timer
                if (this.magnetTimer) {
                    this.magnetTimer.destroy();
                }
                
                // Deactivate after 10 seconds
                this.magnetTimer = this.time.delayedCall(10000, () => {
                    this.magnetActive = false;
                    console.log('🧲 Magnet expired');
                });
                
                console.log('🧲 Magnet activated!');
                break;
                
            case 'double':
                this.kangaroo.hasDoubleJump = true;
                window.GameData.audioManager.playShieldActivate(); // Reuse sound
                
                console.log('🚀 Double jump activated!');
                
                // Deactivate after 10 seconds
                this.time.delayedCall(10000, () => {
                    this.kangaroo.hasDoubleJump = false;
                    console.log('🚀 Double jump expired');
                });
                break;
        }
    }
    
    gameOver() {
        console.log('💀 GAME OVER!');
        
        this.gameActive = false;
        
        // Stop music
        window.GameData.audioManager.stopMusic();
        
        // Stop spawning
        this.obstacleTimer?.destroy();
        this.coinTimer?.destroy();
        this.powerUpTimer?.destroy();
        
        // Clear magnet timer
        if (this.magnetTimer) {
            this.magnetTimer.destroy();
        }
        
        // Visual feedback
        this.kangaroo.setTint(0xFF0000);
        this.physics.pause();
        
        // Camera effects
        this.cameras.main.shake(500, 0.02);
        this.cameras.main.fade(500, 0, 0, 0, true);
        
        // Update high score
        if (this.score > window.GameData.highScore) {
            window.GameData.highScore = this.score;
            localStorage.setItem('kangaroo_hop_high_score', this.score.toString());
        }
        
        // Add coins to total
        window.GameData.storeManager.addCoins(this.sessionCoins);
        
        // Play game over sound
        window.GameData.audioManager.playGameOver();
        
        // Transition to game over scene after fade
        this.time.delayedCall(600, () => {
            this.scene.start('GameOverScene', {
                score: this.score,
                highScore: window.GameData.highScore,
                coinsEarned: this.sessionCoins
            });
        });
    }
}