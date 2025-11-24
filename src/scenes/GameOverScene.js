import GameDataManager from '../managers/GameDataManager.js';
import FunFactPopup from '../ui/FunFactPopup.js';
import Button from '../ui/Button.js';
import CoinDisplay from '../ui/CoinDisplay.js';

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

        // Add coin UI (top left)
        this.coinDisplay = new CoinDisplay(this, 35, 30);
        this.coinDisplay.setCount(this.gameDataManager.getCoins());

        // Game Over ribbon with all info - HIGHER position
        const titleRibbon = this.add.image(400, 150, 'ribbon_red');
        titleRibbon.setScale(0.85);

        // Game Over title
        this.add.text(400, 100, 'GAME OVER', {
            fontSize: '38px',
            fontFamily: 'Carter One',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Score in ribbon
        this.add.text(400, 135, `Score: ${this.finalScore}`, {
            fontSize: '26px',
            fontFamily: 'Carter One',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // High score in ribbon
        const highScoreColor = this.isNewRecord ? '#FFD700' : '#FFFFFF';
        const highScoreText = this.isNewRecord ? `NEW RECORD: ${this.highScore}!` : `Best: ${this.highScore}`;

        // Add star icon for new high score
        if (this.isNewRecord) {
            const starIcon = this.add.image(280, 165, 'icon_star');
            starIcon.setScale(0.4);
        }

        this.add.text(400, 165, highScoreText, {
            fontSize: '22px',
            fontFamily: 'Carter One',
            color: highScoreColor,
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);


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
        this.playAgainButton = new Button(this, 400, 320, {
            text: 'PLAY AGAIN',
            bgKey: 'btn_long_green',
            bgScale: 0.7,
            iconKey: 'icon_ok',
            iconScale: 0.55,
            iconWidth: 32,
            gap: 10,
            textStyle: { fontSize: '34px' },
            pulse: true,
            pulseScale: 1.05,
            pulseDuration: 800,
            onClick: () => {
                this.audioManager?.playButtonClick();
                this.scene.start('GameScene', { audioManager: this.audioManager });
            }
        });

        // Shop button - LEFT side
        this.shopButton = new Button(this, 200, 460, {
            text: 'SHOP',
            bgKey: 'btn_blue',
            bgScale: 0.45,
            iconKey: 'icon_shop',
            iconScale: 0.35,
            iconWidth: 26,
            textStyle: { fontSize: '28px' },
            onClick: () => {
                this.audioManager?.playButtonClick();
                this.scene.start('StoreScene', { audioManager: this.audioManager, from: 'GameOverScene' });
            }
        });

        // Menu button - RIGHT side
        this.menuButton = new Button(this, 600, 460, {
            text: 'MENU',
            bgKey: 'btn_yellow',
            bgScale: 0.45,
            iconKey: 'icon_house',
            iconScale: 0.35,
            iconWidth: 26,
            textStyle: { fontSize: '28px' },
            onClick: () => {
                this.audioManager?.playButtonClick();
                this.scene.start('MenuScene');
            }
        });

        // Add instruction text
        this.add.text(400, 530, 'Press SPACE to restart or click buttons above', {
            fontSize: '20px',
            fontFamily: 'Carter One',
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