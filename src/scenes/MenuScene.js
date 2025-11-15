import GameDataManager from '../managers/GameDataManager.js';
import AudioManager from '../managers/AudioManager.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
        this.gameDataManager = GameDataManager.getInstance();
        this.audioManager = new AudioManager();
    }

    preload() {
        // Load kangaroo sprite sheet (768x256 with 6x2 frames, each 128x128)
        this.load.spritesheet('kangaroo', 'assets/images/kangaroos.png', {
            frameWidth: 128,
            frameHeight: 128
        });
        
        // Load kangaroo helmet sprite sheet (same dimensions as normal kangaroo)
        this.load.spritesheet('kangaroo_helmet', 'assets/images/kangaroos_helmet_sheet.png', {
            frameWidth: 128,
            frameHeight: 128
        });
        
        // Load obstacle sprites
        this.load.image('rock', 'assets/images/rock.png');
        this.load.image('spider_rock', 'assets/images/spider_rock.png');
        this.load.image('cactus', 'assets/images/cactus.png');
        this.load.image('log', 'assets/images/log.png');
        this.load.image('snake_log', 'assets/images/snake_log.png');
        this.load.spritesheet('emu', 'assets/images/emu_sheet.png', {
            frameWidth: 128, // 256 ÷ 2 frames = 128 per frame
            frameHeight: 128
        });
        this.load.image('croc', 'assets/images/croc.png');
        this.load.image('camel', 'assets/images/camel.png');
        this.load.image('koala', 'assets/images/koala.png');
        
        // Load magpie sprite sheet (512x128 with 4x1 frames)
        this.load.spritesheet('magpie', 'assets/images/magpie_sheet.png', {
            frameWidth: 128, // 512 ÷ 4 frames = 128 per frame
            frameHeight: 128
        });

        // Load Pixel Adventure obstacles (animated sprite sheets)
        this.load.spritesheet('bee', 'assets/images/pixel-adventure-obstacles/bee.png', {
            frameWidth: 36,
            frameHeight: 34
        });
        this.load.spritesheet('plant', 'assets/images/pixel-adventure-obstacles/plant.png', {
            frameWidth: 44,
            frameHeight: 42
        });
        this.load.spritesheet('snail', 'assets/images/pixel-adventure-obstacles/snail.png', {
            frameWidth: 38,
            frameHeight: 24
        });
        this.load.spritesheet('mushroom', 'assets/images/pixel-adventure-obstacles/mushroom.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('trunk', 'assets/images/pixel-adventure-obstacles/trunk.png', {
            frameWidth: 64,
            frameHeight: 32
        });

        // Load coin
        this.load.image('coin', 'assets/images/coin.png');
        
        // Load ground decoration
        this.load.image('weed', 'assets/images/weed.png');

        // Load parallax background layers
        this.load.image('parallax_background', 'assets/images/parallax/_11_background.png');
        this.load.image('parallax_distant_clouds', 'assets/images/parallax/_10_distant_clouds.png');
        this.load.image('parallax_distant_clouds1', 'assets/images/parallax/_09_distant_clouds1.png');
        this.load.image('parallax_clouds', 'assets/images/parallax/_08_clouds.png');
        this.load.image('parallax_hill2', 'assets/images/parallax/_06_hill2.png');
        this.load.image('parallax_hill1', 'assets/images/parallax/_05_hill1.png');
        this.load.image('parallax_bushes', 'assets/images/parallax/_04_bushes.png');
        this.load.image('parallax_distant_trees', 'assets/images/parallax/_03_distant_trees.png');
        this.load.image('parallax_trees_bushes', 'assets/images/parallax/_02_trees_and_bushes.png');
        this.load.image('parallax_ground', 'assets/images/parallax/_01_ground.png');

        // Load powerup images
        this.load.image('shield', 'assets/images/shield.png');
        this.load.image('magnet', 'assets/images/magnet.png');
        this.load.image('double', 'assets/images/double.png');
        this.load.image('helmet', 'assets/images/helmet.png');

        // Load audio files
        this.load.audio('button_click', 'assets/audio/sfx/button_click.mp3');
        this.load.audio('jump', 'assets/audio/sfx/jump.mp3');
        this.load.audio('land', 'assets/audio/sfx/land.mp3');
        this.load.audio('coin_collect', 'assets/audio/sfx/coin_collect.mp3');
        this.load.audio('collision', 'assets/audio/sfx/collision.mp3');
        this.load.audio('game_over', 'assets/audio/sfx/game_over.mp3');
        this.load.audio('double_jump', 'assets/audio/sfx/double_jump.mp3');
        this.load.audio('shield_activate', 'assets/audio/sfx/shield_activate.mp3');
        this.load.audio('magnet_activate', 'assets/audio/sfx/magnet_activate.mp3');
    }

    create() {
        // Initialize audio manager
        this.audioManager.init(this);
        this.audioManager.setSounds({
            button_click: this.sound.add('button_click'),
            jump: this.sound.add('jump'),
            land: this.sound.add('land'),
            coin_collect: this.sound.add('coin_collect'),
            collision: this.sound.add('collision'),
            game_over: this.sound.add('game_over'),
            double_jump: this.sound.add('double_jump'),
            shield_activate: this.sound.add('shield_activate'),
            magnet_activate: this.sound.add('magnet_activate')
        });

        // Create parallax background (static for menu)
        const GROUND_Y = 450; // Match physics ground
        const scale = 800 / 2048; // Scale parallax images to canvas width

        // Static sky background
        const sky = this.add.image(0, 0, 'parallax_background');
        sky.setOrigin(0, 0);
        sky.setDisplaySize(800, 600);
        sky.setDepth(-100);

        // Add parallax layers (static, no scrolling in menu)
        const clouds = this.add.image(0, 0, 'parallax_clouds');
        clouds.setOrigin(0, 0);
        clouds.setScale(scale);
        clouds.setDepth(-80);

        const hill2 = this.add.image(0, 0, 'parallax_hill2');
        hill2.setOrigin(0, 0);
        hill2.setScale(scale);
        hill2.setDepth(-60);

        const hill1 = this.add.image(0, 0, 'parallax_hill1');
        hill1.setOrigin(0, 0);
        hill1.setScale(scale);
        hill1.setDepth(-50);

        const trees = this.add.image(0, 0, 'parallax_distant_trees');
        trees.setOrigin(0, 0);
        trees.setScale(scale);
        trees.setDepth(-40);

        // Simple brown ground
        const groundGraphics = this.add.graphics();
        groundGraphics.fillStyle(0x8B4513, 1); // Brown ground
        groundGraphics.fillRect(0, GROUND_Y, 800, 150);

        // Ground line (darker brown)
        groundGraphics.lineStyle(3, 0x654321);
        groundGraphics.moveTo(0, GROUND_Y);
        groundGraphics.lineTo(800, GROUND_Y);
        groundGraphics.stroke();
        groundGraphics.setDepth(-10);

        // Add title with better positioning
        this.add.text(400, 150, 'KANGAROO HOP', {
            fontSize: '52px',
            fontFamily: 'Arial',
            color: '#FF6B35',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(1000); // High depth to be in front

        // Add subtitle
        const startText = this.add.text(400, 230, 'Press SPACE or Click to Start!', {
            fontSize: '26px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(1000);

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
        coinIcon.setDepth(1000);

        this.coinText = this.add.text(70, 30, `${this.gameDataManager.getCoins()}`, {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.coinText.setOrigin(0, 0.5);
        this.coinText.setDepth(1000);

        // No need for createSimpleGround - using parallax ground layer instead

        // Add high score display
        const highScore = parseInt(localStorage.getItem('kangaroo_hop_highscore')) || 0;
        if (highScore > 0) {
            this.add.text(400, 275, `Best Score: ${highScore}`, {
                fontSize: '20px',
                fontFamily: 'Arial',
                color: '#FFD700',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5).setDepth(1000);
        }

        // Add shop button
        const shopButton = this.add.text(400, 330, 'SHOP', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#00FFFF',
            stroke: '#000000',
            strokeThickness: 2,
            backgroundColor: '#008888',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setDepth(1000);

        shopButton.setInteractive();
        shopButton.on('pointerdown', () => {
            this.audioManager.playButtonClick();
            this.scene.start('StoreScene', { audioManager: this.audioManager, from: 'MenuScene' });
        });

        // Add pulsing effect to shop button
        const pulseTween = this.tweens.add({
            targets: shopButton,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Add hover effect to shop button
        shopButton.on('pointerover', () => {
            pulseTween.pause();
            shopButton.setScale(1.2);
        });
        shopButton.on('pointerout', () => {
            shopButton.setScale(1);
            pulseTween.resume();
        });

        // Add instructions
        this.add.text(400, 520, 'Jump over obstacles and collect coins!', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#CCCCCC',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5).setDepth(1000);

        // Input handling - only for non-interactive areas
        this.input.keyboard.on('keydown-SPACE', this.startGame, this);
        
        // Make clicking anywhere start the game (except on interactive elements)
        this.input.on('pointerdown', (_, gameObjects) => {
            // Check if any of the clicked objects are interactive (like the shop button)
            const hasInteractiveObject = gameObjects.some(obj => obj.input && obj.input.enabled);
            if (!hasInteractiveObject) {
                this.startGame();
            }
        });

        console.log('Menu scene loaded');
    }


    startGame() {
        this.audioManager.playButtonClick();
        this.scene.start('GameScene', { audioManager: this.audioManager });
    }
}