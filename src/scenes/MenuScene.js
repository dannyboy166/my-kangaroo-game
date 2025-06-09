// src/scenes/MenuScene.js

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        // Load assets
        this.load.image('kangaroo', 'assets/images/kangaroos.png');
        this.load.image('coin', 'assets/images/coin.png');
        this.load.image('cross', 'assets/images/cross.png');
        
        // Load audio
        this.load.audio('button_click', 'assets/audio/sfx/button_click.mp3');
        this.load.audio('menu_music', 'assets/audio/music/menu.mp3');
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

        this.add.text(400, 200, 'Phaser Version', {
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
        this.add.image(50, 50, 'coin').setScale(0.8);
        this.coinText = this.add.text(80, 50, window.GameData.storeManager.totalCoins.toString(), {
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
        storeButton.on('pointerover', () => storeButton.setScale(1.1));
        storeButton.on('pointerout', () => storeButton.setScale(1.0));
    }

    update() {
        // Update coin display
        this.coinText.setText(window.GameData.storeManager.totalCoins.toString());
    }
}