// src/scenes/MenuScene.js

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        console.log('📥 Loading menu assets...');

        // Load assets (with error handling)
        this.load.image('kangaroo', 'assets/images/kangaroos.png');
        this.load.image('coin', 'assets/images/coin.png');
        this.load.image('cross', 'assets/images/cross.png');

        // Load audio
        this.load.audio('button_click', 'assets/audio/sfx/button_click.mp3');
    }

    create() {
        console.log('📋 MENU SCENE LOADED!');

        // Initialize audio manager
        window.GameData.audioManager.init(this);
        
        // Add button click sound if it exists
        if (this.cache.audio.exists('button_click')) {
            window.GameData.audioManager.setSounds({
                button_click: this.sound.add('button_click')
            });
        }

        // Background
        this.cameras.main.setBackgroundColor('#87CEEB');

        // Add some clouds for visual interest
        this.createClouds();

        // Add ground decoration
        this.add.rectangle(400, 550, 800, 100, 0xD2691E);

        // Title
        this.add.text(400, 150, 'KANGAROO HOP', {
            fontSize: '64px',
            fill: '#4F9DFF',
            fontStyle: 'bold',
            stroke: '#ffffff',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(400, 200, 'Phaser Version', {
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Create animated kangaroo on menu
        this.createMenuKangaroo();

        // Start button
        const startButton = this.add.text(400, 300, 'CLICK TO START!', {
            fontSize: '32px',
            fill: '#ffffff',
            backgroundColor: '#4F9DFF',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        startButton.on('pointerdown', () => {
            window.GameData.audioManager.playButtonClick();
            this.scene.start('GameScene');
        });

        // Store button
        const storeButton = this.add.text(400, 370, 'STORE', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#2ED573',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        storeButton.on('pointerdown', () => {
            window.GameData.audioManager.playButtonClick();
            this.scene.start('StoreScene');
        });

        // Coin display
        const coinBg = this.add.rectangle(100, 50, 150, 40, 0x000000, 0.5);
        coinBg.setStrokeStyle(2, 0xF7B027);
        
        if (this.textures.exists('coin')) {
            this.add.image(50, 50, 'coin').setScale(0.4);
        } else {
            this.add.circle(50, 50, 15, 0xFFD700);
        }

        this.coinText = this.add.text(80, 50, window.GameData.storeManager.totalCoins.toString(), {
            fontSize: '24px',
            fill: '#F7B027',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0, 0.5);

        // High score
        this.add.text(400, 450, `Best: ${window.GameData.highScore}`, {
            fontSize: '20px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Instructions
        this.add.text(400, 520, 'Use SPACE or Click to Jump!', {
            fontSize: '16px',
            fill: '#ffffff70'
        }).setOrigin(0.5);

        // Hover effects
        this.addButtonHoverEffects(startButton, 300);
        this.addButtonHoverEffects(storeButton, 370);
    }

    createMenuKangaroo() {
        // Create a hopping kangaroo on the menu
        const kangaroo = this.add.rectangle(100, 480, 50, 70, 0x3498db);
        
        // Make it hop
        this.tweens.add({
            targets: kangaroo,
            y: 420,
            duration: 500,
            ease: 'Power2',
            yoyo: true,
            repeat: -1,
            repeatDelay: 1000
        });
        
        // Move across screen
        this.tweens.add({
            targets: kangaroo,
            x: 700,
            duration: 8000,
            ease: 'Linear',
            repeat: -1,
            onRepeat: () => {
                kangaroo.x = 100;
            }
        });
    }

    addButtonHoverEffects(button, originalY) {
        button.on('pointerover', () => {
            button.setScale(1.1);
            this.tweens.add({
                targets: button,
                y: originalY - 5,
                duration: 100,
                ease: 'Power2'
            });
        });

        button.on('pointerout', () => {
            button.setScale(1.0);
            this.tweens.add({
                targets: button,
                y: originalY,
                duration: 100,
                ease: 'Power2'
            });
        });
    }

    createClouds() {
        // Create simple cloud shapes
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * 800;
            const y = 50 + Math.random() * 150;
            const scale = 0.5 + Math.random() * 0.5;

            const cloud = this.add.graphics();
            cloud.fillStyle(0xffffff, 0.7);
            cloud.fillCircle(0, 0, 30);
            cloud.fillCircle(25, 0, 25);
            cloud.fillCircle(-25, 0, 25);
            cloud.fillCircle(10, -10, 20);
            cloud.fillCircle(-10, -10, 20);

            cloud.x = x;
            cloud.y = y;
            cloud.setScale(scale);

            // Animate clouds
            this.tweens.add({
                targets: cloud,
                x: cloud.x + 100,
                duration: 20000 + Math.random() * 10000,
                repeat: -1,
                yoyo: true,
                ease: 'Sine.easeInOut'
            });
        }
    }

    update() {
        // Update coin display
        this.coinText.setText(window.GameData.storeManager.totalCoins.toString());
    }
}