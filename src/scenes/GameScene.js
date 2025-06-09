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
        // Load game assets
        this.load.spritesheet('kangaroo_anim', 'assets/images/kangaroos.png', {
            frameWidth: 128,
            frameHeight: 128
        });
        
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
        this.load.audio('gameplay_music', 'assets/audio/music/gameplay.mp3');
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
        
        // Create ground
        this.ground = this.add.rectangle(400, 550, 800, 100, 0xD2691E);
        this.physics.add.existing(this.ground, true);
        
        // Create kangaroo
        this.kangaroo = new Kangaroo(this, 150, 400);
        this.add.existing(this.kangaroo);
        
        // Physics collision between kangaroo and ground
        this.physics.add.collider(this.kangaroo, this.ground);
        
        // Create groups
        this.obstacles = this.physics.add.group();
        this.coins = this.physics.add.group();
        this.powerUps = this.physics.add.group();
        
        // Collision detection
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
        
        // Start spawning
        this.startObstacleSpawning();
        this.startCoinSpawning();
        this.startPowerUpSpawning();
        
        console.log('✅ Game scene setup complete!');
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
                
                const obstacle = new Obstacle(this, 850, 480, 'rock');
                this.obstacles.add(obstacle);
                console.log('🚫 Obstacle spawned!');
            },
            loop: true
        });
    }
    
    startCoinSpawning() {
        this.coinTimer = this.time.addEvent({
            delay: 2000,
            callback: () => {
                if (!this.gameActive) return;
                
                const coin = new Coin(this, 850, 300 + Math.random() * 150);
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
                const powerUp = new PowerUp(this, 850, 250 + Math.random() * 100, type);
                this.powerUps.add(powerUp);
                console.log('⚡ Power-up spawned!');
            },
            loop: true
        });
    }
    
    hitObstacle(kangaroo, obstacle) {
        console.log('💥 Hit obstacle! Game Over!');
        this.gameOver();
    }
    
    collectCoin(kangaroo, coin) {
        coin.destroy();
        this.sessionCoins += 5;
        window.GameData.audioManager.playCoinCollect();
        console.log('💰 Coin collected! Total:', this.sessionCoins);
    }
    
    collectPowerUp(kangaroo, powerUp) {
        powerUp.destroy();
        this.activatePowerUp(powerUp.powerType);
        console.log('⚡ Power-up collected:', powerUp.powerType);
    }
    
    activatePowerUp(type) {
        // Implement power-up logic
        console.log('Activating power-up:', type);
    }
    
    gameOver() {
        this.gameActive = false;
        
        // Stop spawning
        this.obstacleTimer?.destroy();
        this.coinTimer?.destroy();
        this.powerUpTimer?.destroy();
        
        // Update high score
        if (this.score > window.GameData.highScore) {
            window.GameData.highScore = this.score;
            localStorage.setItem('kangaroo_hop_high_score', this.score.toString());
        }
        
        // Add coins to total
        window.GameData.storeManager.addCoins(this.sessionCoins);
        
        // Go to game over scene
        this.scene.start('GameOverScene', {
            score: this.score,
            highScore: window.GameData.highScore,
            coinsEarned: this.sessionCoins
        });
    }
}