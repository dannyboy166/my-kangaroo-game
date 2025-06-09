export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.highScore = data.highScore || 0;
        this.coinsEarned = data.coinsEarned || 0;
    }

    create() {
        console.log('💀 GAME OVER SCENE LOADED!');
        
        // Background
        this.cameras.main.setBackgroundColor('#1A1A2E');
        
        // Game Over Panel
        const panel = this.add.rectangle(400, 300, 600, 400, 0x1A1A2E);
        panel.setStrokeStyle(3, 0x4F9DFF);
        
        // Title
        this.add.text(400, 180, 'GAME OVER', {
            fontSize: '48px',
            fill: '#FF4757',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // Score display
        this.add.text(400, 240, `Score: ${this.finalScore}`, {
            fontSize: '32px',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // High score
        let highScoreText = `Best: ${this.highScore}`;
        let highScoreColor = '#F7B027';
        
        if (this.finalScore > this.highScore) {
            highScoreText = `🎉 NEW BEST: ${this.finalScore}! 🎉`;
            highScoreColor = '#F7B027';
        }
        
        this.add.text(400, 280, highScoreText, {
            fontSize: '24px',
            fill: highScoreColor,
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // Coins earned
        this.add.text(400, 320, `Coins Earned: ${this.coinsEarned}`, {
            fontSize: '20px',
            fill: '#F7B027'
        }).setOrigin(0.5);
        
        // Buttons
        const playAgainButton = this.add.text(300, 380, 'PLAY AGAIN', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#2ED573',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();
        
        const storeButton = this.add.text(500, 380, 'STORE', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#E74C3C',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();
        
        const menuButton = this.add.text(400, 450, 'MAIN MENU', {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: '#57606F',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive();
        
        // Button events
        playAgainButton.on('pointerdown', () => {
            window.GameData.audioManager.playButtonClick();
            this.scene.start('GameScene');
        });
        
        storeButton.on('pointerdown', () => {
            window.GameData.audioManager.playButtonClick();
            this.scene.start('StoreScene');
        });
        
        menuButton.on('pointerdown', () => {
            window.GameData.audioManager.playButtonClick();
            this.scene.start('MenuScene');
        });
        
        // Hover effects
        [playAgainButton, storeButton, menuButton].forEach(button => {
            button.on('pointerover', () => button.setScale(1.1));
            button.on('pointerout', () => button.setScale(1.0));
        });
        
        // Restart instruction
        this.add.text(400, 500, 'or press SPACE to play again', {
            fontSize: '16px',
            fill: '#ffffff70'
        }).setOrigin(0.5);
        
        // Keyboard input
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
    
    update() {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            window.GameData.audioManager.playButtonClick();
            this.scene.start('GameScene');
        }
    }
}