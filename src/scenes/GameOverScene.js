import GameDataManager from '../managers/GameDataManager.js';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
        this.gameDataManager = GameDataManager.getInstance();
    }

    init(data) {
        this.finalScore = data.score || 0;
        
        // Load/save high score from localStorage
        this.highScore = parseInt(localStorage.getItem('kangaroo_hop_highscore')) || 0;
        
        if (this.finalScore > this.highScore) {
            this.highScore = this.finalScore;
            localStorage.setItem('kangaroo_hop_highscore', this.highScore.toString());
            this.isNewRecord = true;
        }
    }

    create() {
        // Add background
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x330066, 0x330066, 0x87CEEB, 0x87CEEB, 1);
        graphics.fillRect(0, 0, 800, 600);

        // Add semi-transparent overlay
        graphics.fillStyle(0x000000, 0.6);
        graphics.fillRect(0, 0, 800, 600);

        // Add coin UI (top left)
        const coinIcon = this.add.image(30, 30, 'coin');
        coinIcon.setScale(0.4);
        coinIcon.setOrigin(0, 0.5);
        
        this.coinText = this.add.text(70, 30, `${this.gameDataManager.getCoins()}`, {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.coinText.setOrigin(0, 0.5);

        // Game Over title
        const gameOverText = this.add.text(400, 150, 'GAME OVER', {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#FF4444',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Add pulsing effect to game over text
        this.tweens.add({
            targets: gameOverText,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Score display
        this.add.text(400, 220, `Score: ${this.finalScore}`, {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // High score display
        const highScoreColor = this.isNewRecord ? '#FFD700' : '#CCCCCC';
        const highScoreText = this.isNewRecord ? `NEW RECORD: ${this.highScore}!` : `Best: ${this.highScore}`;
        
        this.add.text(400, 270, highScoreText, {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: highScoreColor,
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // New record celebration
        if (this.isNewRecord) {
            // Add celebration particles
            const particles = this.add.particles(400, 270, 'coin', {
                scale: 0.3,
                speed: { min: 100, max: 200 },
                lifespan: 2000,
                quantity: 2,
                frequency: 100
            });

            // Stop particles after 3 seconds
            this.time.delayedCall(3000, () => particles.destroy());
        }

        // Play again button
        const playAgainBtn = this.add.text(400, 350, 'PLAY AGAIN', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#00FF00',
            stroke: '#000000',
            strokeThickness: 2,
            backgroundColor: '#004400',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        playAgainBtn.setInteractive({ useHandCursor: true });
        playAgainBtn.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        playAgainBtn.on('pointerover', () => {
            playAgainBtn.setTint(0xccffcc);
        });

        playAgainBtn.on('pointerout', () => {
            playAgainBtn.clearTint();
        });

        // Menu button
        const menuBtn = this.add.text(400, 420, 'MAIN MENU', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2,
            backgroundColor: '#444400',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        menuBtn.setInteractive({ useHandCursor: true });
        menuBtn.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });

        menuBtn.on('pointerover', () => {
            menuBtn.setTint(0xffffcc);
        });

        menuBtn.on('pointerout', () => {
            menuBtn.clearTint();
        });

        // Add instruction text
        this.add.text(400, 500, 'Press SPACE to restart or click buttons above', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#CCCCCC',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);

        // Keyboard input
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start('GameScene');
        });

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('MenuScene');
        });

        console.log(`Game Over! Score: ${this.finalScore}, High Score: ${this.highScore}`);
    }
}