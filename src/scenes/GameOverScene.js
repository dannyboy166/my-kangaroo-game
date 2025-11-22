import GameDataManager from '../managers/GameDataManager.js';
import FunFactPopup from '../ui/FunFactPopup.js';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
        this.gameDataManager = GameDataManager.getInstance();
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.audioManager = data.audioManager;
        this.obstacleType = data.obstacleType || 'rock';
        this.showFunFact = data.showFunFact !== false; // Default true, but can be overridden
        
        // Load/save high score from localStorage
        this.highScore = parseInt(localStorage.getItem('kangaroo_hop_highscore')) || 0;
        
        if (this.finalScore > this.highScore) {
            this.highScore = this.finalScore;
            localStorage.setItem('kangaroo_hop_highscore', this.highScore.toString());
            this.isNewRecord = true;
        }
    }

    create() {

        // Add UI background image
        const bg = this.add.image(400, 300, 'ui_background');
        bg.setDisplaySize(800, 600);

        // Add semi-transparent overlay for better text readability
        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.5);
        graphics.fillRect(0, 0, 800, 600);

        // Add coin UI (top left) with new UI coin icon
        const coinIcon = this.add.image(35, 30, 'ui_coin');
        coinIcon.setScale(0.6);
        coinIcon.setOrigin(0.5, 0.5);

        this.coinText = this.add.text(65, 30, `${this.gameDataManager.getCoins()}`, {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.coinText.setOrigin(0, 0.5);

        // Game Over ribbon with all info - HIGHER position
        const titleRibbon = this.add.image(400, 150, 'ribbon_red');
        titleRibbon.setScale(0.85);

        // Game Over title
        this.add.text(400, 100, 'GAME OVER', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Score in ribbon
        this.add.text(400, 135, `Score: ${this.finalScore}`, {
            fontSize: '22px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // High score in ribbon
        const highScoreColor = this.isNewRecord ? '#FFD700' : '#FFFFFF';
        const highScoreText = this.isNewRecord ? `NEW RECORD: ${this.highScore}!` : `Best: ${this.highScore}`;

        // Add star icon for new high score
        if (this.isNewRecord) {
            const starIcon = this.add.image(290, 185, 'icon_star');
            starIcon.setScale(0.4);
        }

        this.add.text(400, 165, highScoreText, {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: highScoreColor,
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Add pulsing effect to ribbon
        this.tweens.add({
            targets: titleRibbon,
            scaleX: 0.88,
            scaleY: 0.88,
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Show fun fact popup after a short delay (only if not returning from shop)
        if (this.showFunFact) {
            this.time.delayedCall(300, () => {
                const popup = new FunFactPopup(this, this.obstacleType, () => {
                    // Callback when popup is closed - can add any cleanup here if needed
                });
                this.add.existing(popup);
            });
        }

        // Play again button with new UI graphics - HIGHER
        const playAgainContainer = this.add.container(400, 320);
        const playAgainBg = this.add.image(0, 0, 'btn_long_green');
        playAgainBg.setScale(0.7);
        const playAgainIcon = this.add.image(-80, 0, 'icon_ok');
        playAgainIcon.setScale(0.55);
        const playAgainText = this.add.text(10, 0, 'PLAY AGAIN', {
            fontSize: '26px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        playAgainContainer.add([playAgainBg, playAgainIcon, playAgainText]);

        playAgainBg.setInteractive({ useHandCursor: true });
        playAgainBg.on('pointerdown', () => {
            this.audioManager?.playButtonClick();
            this.scene.start('GameScene', { audioManager: this.audioManager });
        });

        playAgainBg.on('pointerover', () => {
            playAgainContainer.setScale(1.1);
        });

        playAgainBg.on('pointerout', () => {
            playAgainContainer.setScale(1);
        });

        // Shop button - LEFT side
        const shopContainer = this.add.container(200, 460);
        const shopBg = this.add.image(0, 0, 'btn_blue');
        shopBg.setScale(0.45);
        const shopIcon = this.add.image(-22, 0, 'icon_shop');
        shopIcon.setScale(0.35);
        const shopText = this.add.text(14, 0, 'SHOP', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        shopContainer.add([shopBg, shopIcon, shopText]);

        shopBg.setInteractive({ useHandCursor: true });
        shopBg.on('pointerdown', () => {
            this.audioManager?.playButtonClick();
            this.scene.start('StoreScene', { audioManager: this.audioManager, from: 'GameOverScene' });
        });

        shopBg.on('pointerover', () => {
            shopContainer.setScale(1.1);
        });

        shopBg.on('pointerout', () => {
            shopContainer.setScale(1);
        });

        // Menu button - RIGHT side
        const menuContainer = this.add.container(600, 460);
        const menuBg = this.add.image(0, 0, 'btn_yellow');
        menuBg.setScale(0.45);
        const menuIcon = this.add.image(-22, 0, 'icon_house');
        menuIcon.setScale(0.35);
        const menuText = this.add.text(12, 0, 'MENU', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        menuContainer.add([menuBg, menuIcon, menuText]);

        menuBg.setInteractive({ useHandCursor: true });
        menuBg.on('pointerdown', () => {
            this.audioManager?.playButtonClick();
            this.scene.start('MenuScene');
        });

        menuBg.on('pointerover', () => {
            menuContainer.setScale(1.1);
        });

        menuBg.on('pointerout', () => {
            menuContainer.setScale(1);
        });

        // Add instruction text
        this.add.text(400, 530, 'Press SPACE to restart or click buttons above', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#CCCCCC',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);

        // Keyboard input
        this.input.keyboard.on('keydown-SPACE', () => {
            this.audioManager?.playButtonClick();
            this.scene.start('GameScene', { audioManager: this.audioManager });
        });

        this.input.keyboard.on('keydown-ESC', () => {
            this.audioManager?.playButtonClick();
            this.scene.start('MenuScene');
        });
    }
}