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
        const panel = this.add.rectangle(400, 300, 600, 400, 0x16213E);
        panel.setStrokeStyle(3, 0x4F9DFF);
        
        // Add some decorative elements
        this.createDecorations();
        
        // Title
        this.add.text(400, 180, 'GAME OVER', {
            fontSize: '48px',
            fill: '#FF4757',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Score display
        this.add.text(400, 240, `Score: ${this.finalScore}`, {
            fontSize: '32px',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // High score
        let highScoreText = `Best: ${this.highScore}`;
        let highScoreColor = '#B8B8B8';
        
        if (this.finalScore > this.highScore) {
            highScoreText = `🎉 NEW BEST: ${this.finalScore}! 🎉`;
            highScoreColor = '#F7B027';
            
            // Add celebration effect
            this.createCelebration();
        }
        
        const highScoreDisplay = this.add.text(400, 280, highScoreText, {
            fontSize: '24px',
            fill: highScoreColor,
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        if (this.finalScore > this.highScore) {
            // Animate new high score text
            this.tweens.add({
                targets: highScoreDisplay,
                scale: 1.1,
                duration: 500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
        
        // Coins earned
        const coinBg = this.add.rectangle(400, 320, 200, 35, 0x000000, 0.3);
        coinBg.setStrokeStyle(2, 0xF7B027);
        
        this.add.text(350, 320, 'Earned:', {
            fontSize: '20px',
            fill: '#ffffff'
        }).setOrigin(1, 0.5);
        
        this.add.text(360, 320, `${this.coinsEarned}`, {
            fontSize: '20px',
            fill: '#F7B027',
            fontWeight: 'bold'
        }).setOrigin(0, 0.5);
        
        // Draw a coin icon
        this.add.circle(430, 320, 10, 0xFFD700);
        
        // Buttons container
        const buttonY = 380;
        
        // Play Again button
        const playAgainButton = this.add.rectangle(300, buttonY, 140, 45, 0x2ED573);
        playAgainButton.setStrokeStyle(2, 0xffffff);
        playAgainButton.setInteractive();
        
        this.add.text(300, buttonY, 'PLAY AGAIN', {
            fontSize: '20px',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // Store button
        const storeButton = this.add.rectangle(500, buttonY, 100, 45, 0xE74C3C);
        storeButton.setStrokeStyle(2, 0xffffff);
        storeButton.setInteractive();
        
        this.add.text(500, buttonY, 'STORE', {
            fontSize: '20px',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // Menu button
        const menuButton = this.add.rectangle(400, 450, 160, 35, 0x57606F);
        menuButton.setStrokeStyle(2, 0xffffff);
        menuButton.setInteractive();
        
        this.add.text(400, 450, 'MAIN MENU', {
            fontSize: '18px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
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
            button.on('pointerover', () => {
                button.setScale(1.05);
                this.tweens.add({
                    targets: button,
                    alpha: 0.8,
                    duration: 100
                });
            });
            button.on('pointerout', () => {
                button.setScale(1.0);
                button.setAlpha(1);
            });
        });
        
        // Restart instruction
        this.add.text(400, 500, 'Press SPACE to play again', {
            fontSize: '16px',
            fill: '#ffffff70'
        }).setOrigin(0.5);
        
        // Keyboard input
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
    
    createDecorations() {
        // Add some decorative kangaroo silhouettes
        const kangaroo1 = this.add.rectangle(50, 150, 30, 40, 0x3498db, 0.2);
        const kangaroo2 = this.add.rectangle(750, 150, 30, 40, 0x3498db, 0.2);
        
        // Animate them
        this.tweens.add({
            targets: kangaroo1,
            y: 130,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        this.tweens.add({
            targets: kangaroo2,
            y: 170,
            duration: 2500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Add some stars
        for (let i = 0; i < 10; i++) {
            const x = 100 + Math.random() * 600;
            const y = 50 + Math.random() * 100;
            const star = this.add.star(x, y, 5, 2, 5, 0xFFFF00, 0.3);
            
            this.tweens.add({
                targets: star,
                alpha: 0.1,
                duration: 1000 + Math.random() * 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }
    
    createCelebration() {
        // Create confetti effect for new high score
        const colors = [0xFFD700, 0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0xF7DC6F];
        
        for (let i = 0; i < 20; i++) {
            const x = 100 + Math.random() * 600;
            const y = 0;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            const confetti = this.add.rectangle(x, y, 10, 15, color);
            confetti.setRotation(Math.random() * Math.PI);
            
            this.tweens.add({
                targets: confetti,
                y: 600 + Math.random() * 100,
                x: x + (Math.random() - 0.5) * 200,
                rotation: Math.random() * Math.PI * 4,
                duration: 2000 + Math.random() * 1000,
                ease: 'Sine.easeIn',
                onComplete: () => confetti.destroy()
            });
        }
        
        // Add sparkle effects around the high score text
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const radius = 100;
            const x = 400 + Math.cos(angle) * radius;
            const y = 280 + Math.sin(angle) * radius;
            
            const sparkle = this.add.star(x, y, 4, 4, 8, 0xF7B027);
            sparkle.setScale(0);
            
            this.tweens.add({
                targets: sparkle,
                scale: 0.5,
                alpha: 0,
                duration: 1000,
                delay: i * 100,
                ease: 'Power2',
                onComplete: () => sparkle.destroy()
            });
        }
    }
    
    update() {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            window.GameData.audioManager.playButtonClick();
            this.scene.start('GameScene');
        }
    }
}