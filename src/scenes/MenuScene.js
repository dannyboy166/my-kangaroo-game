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
        
        // Load magpie sprite sheet (512x128 with 4x1 frames)
        this.load.spritesheet('magpie', 'assets/images/magpie_sheet.png', {
            frameWidth: 128, // 512 ÷ 4 frames = 128 per frame
            frameHeight: 128
        });
        
        // Load coin
        this.load.image('coin', 'assets/images/coin.png');
    }

    create() {
        // Add background color gradient effect
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xE0F6FF, 0xE0F6FF, 1);
        graphics.fillRect(0, 0, 800, 600);

        // Add title with better positioning
        this.add.text(400, 150, 'KANGAROO HOP', {
            fontSize: '52px',
            fontFamily: 'Arial',
            color: '#FF6B35',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Add subtitle
        const startText = this.add.text(400, 230, 'Press SPACE or Click to Start!', {
            fontSize: '26px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Add pulsing effect to start text
        this.tweens.add({
            targets: startText,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });



        // Add coin UI (top left) - keep this as it's functional
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

        // Create a more natural ground scene
        this.createGroundScene();

        // Add some atmospheric elements
        this.createBackgroundElements();

        // Add high score display
        const highScore = parseInt(localStorage.getItem('kangaroo_hop_highscore')) || 0;
        if (highScore > 0) {
            this.add.text(400, 275, `Best Score: ${highScore}`, {
                fontSize: '20px',
                fontFamily: 'Arial',
                color: '#FFD700',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);
        }

        // Add instructions
        this.add.text(400, 520, 'Jump over obstacles and collect coins!', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#CCCCCC',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);

        // Input handling
        this.input.keyboard.on('keydown-SPACE', this.startGame, this);
        this.input.on('pointerdown', this.startGame, this);

        console.log('Menu scene loaded');
    }

    createGroundScene() {
        // Add ground line
        const ground = this.add.graphics();
        ground.lineStyle(6, 0x8B4513);
        ground.moveTo(0, 500);
        ground.lineTo(800, 500);
        ground.stroke();

        // Add ground texture
        ground.fillStyle(0x654321);
        ground.fillRect(0, 500, 800, 100);
        
        // Add some ground detail
        ground.fillStyle(0x8B4513);
        for (let i = 0; i < 8; i++) {
            ground.fillRect(i * 100, 500, 50, 8);
        }

        // Add natural obstacles at proper scale and positioning
        this.add.image(120, 500, 'emu').setScale(0.5).setOrigin(0.5, 1);
        this.add.image(680, 500, 'cactus').setScale(0.6).setOrigin(0.5, 1);
        this.add.image(350, 500, 'camel').setScale(0.8).setOrigin(0.5, 1);

        // Add small coins scattered on the ground (much smaller and more natural)
        this.add.image(250, 400, 'coin').setScale(0.15);

        
        // Add subtle glow effect to ground coins
        const coins = [
            this.add.image(250, 400, 'coin').setScale(0.15),

        ];

        coins.forEach(coin => {
            this.tweens.add({
                targets: coin,
                alpha: 0.7,
                duration: 1500,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
        });
    }

    createBackgroundElements() {
        // Add some clouds in the sky
        const cloud1 = this.add.graphics();
        cloud1.fillStyle(0xFFFFFF, 0.8);
        cloud1.fillCircle(0, 0, 25);
        cloud1.fillCircle(15, 0, 20);
        cloud1.fillCircle(-15, 0, 20);
        cloud1.fillCircle(8, -8, 15);
        cloud1.x = 150;
        cloud1.y = 80;

        const cloud2 = this.add.graphics();
        cloud2.fillStyle(0xFFFFFF, 0.6);
        cloud2.fillCircle(0, 0, 20);
        cloud2.fillCircle(12, 0, 16);
        cloud2.fillCircle(-12, 0, 16);
        cloud2.x = 650;
        cloud2.y = 120;

        // Add subtle floating animation to clouds
        this.tweens.add({
            targets: [cloud1, cloud2],
            x: '+=20',
            duration: 8000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Add a sun
        const sun = this.add.graphics();
        sun.fillStyle(0xFFD700, 0.9);
        sun.fillCircle(0, 0, 30);
        sun.lineStyle(3, 0xFFD700, 0.7);
        for (let i = 0; i < 8; i++) {
            const angle = (i * 45) * Math.PI / 180;
            const x1 = Math.cos(angle) * 35;
            const y1 = Math.sin(angle) * 35;
            const x2 = Math.cos(angle) * 45;
            const y2 = Math.sin(angle) * 45;
            sun.moveTo(x1, y1);
            sun.lineTo(x2, y2);
            sun.stroke();
        }
        sun.x = 700;
        sun.y = 70;

        // Add subtle rotation to sun
        this.tweens.add({
            targets: sun,
            rotation: Math.PI * 2,
            duration: 20000,
            repeat: -1,
            ease: 'Linear'
        });
    }

    startGame() {
        this.scene.start('GameScene');
    }
}