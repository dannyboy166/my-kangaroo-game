import GameDataManager from '../managers/GameDataManager.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
        this.gameDataManager = GameDataManager.getInstance();
    }

    preload() {
        // Load kangaroo sprite sheet (768x256 with 6x2 frames, each 128x128)
        this.load.spritesheet('kangaroo', 'assets/images/kangaroos.png', {
            frameWidth: 128,
            frameHeight: 128
        });
        
        // Load obstacle sprites
        this.load.image('rock', 'assets/images/rock.png');
        this.load.image('cactus', 'assets/images/cactus.png');
        this.load.image('log', 'assets/images/log.png');
        this.load.spritesheet('emu', 'assets/images/emu_sheet.png', {
            frameWidth: 128, // 512 ÷ 4 frames = 128 per frame
            frameHeight: 128
        });
        this.load.image('croc', 'assets/images/croc.png');
        this.load.image('camel', 'assets/images/camel.png');
        
        // Load coin
        this.load.image('coin', 'assets/images/coin.png');
    }

    create() {
        // Add background color gradient effect
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xE0F6FF, 0xE0F6FF, 1);
        graphics.fillRect(0, 0, 800, 600);

        // Add title
        this.add.text(400, 200, 'KANGAROO HOP', {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#FF6B35',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Add subtitle
        const startText = this.add.text(400, 280, 'Press SPACE or Click to Start!', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Add pulsing effect to start text
        this.tweens.add({
            targets: startText,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Add preview kangaroo using first frame of sprite sheet
        const previewKangaroo = this.add.image(400, 380, 'kangaroo', 0);
        previewKangaroo.setScale(0.8);

        // Add bouncing animation to preview kangaroo
        this.tweens.add({
            targets: previewKangaroo,
            y: 360,
            duration: 600,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Add coin UI (top left)
        const coinIcon = this.add.image(30, 30, 'coin');
        coinIcon.setScale(0.17);
        coinIcon.setOrigin(0, 0.5);
        
        this.coinText = this.add.text(70, 30, `${this.gameDataManager.getCoins()}`, {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.coinText.setOrigin(0, 0.5);

        // Add ground line
        const ground = this.add.graphics();
        ground.lineStyle(4, 0x8B4513);
        ground.moveTo(0, 500);
        ground.lineTo(800, 500);
        ground.stroke();

        // Add some decorative elements
        this.add.image(150, 480, 'rock').setScale(0.4);
        this.add.image(650, 480, 'cactus').setScale(0.4);
        this.add.image(300, 460, 'coin').setScale(0.6);
        this.add.image(500, 460, 'coin').setScale(0.6);

        // Input handling
        this.input.keyboard.on('keydown-SPACE', this.startGame, this);
        this.input.on('pointerdown', this.startGame, this);

        console.log('Menu scene loaded');
    }

    startGame() {
        this.scene.start('GameScene');
    }
}