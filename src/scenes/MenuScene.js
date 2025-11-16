import GameDataManager from '../managers/GameDataManager.js';
import AudioManager from '../managers/AudioManager.js';
import { BACKGROUND_THEMES } from '../config/BackgroundConfig.js';

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

        // Load coin sprite sheet (25 frames, 64x64 each in horizontal strip - better performance!)
        this.load.spritesheet('coin', 'assets/images/coin/coin-64x64.png', {
            frameWidth: 64,
            frameHeight: 64
        });

        // Load powerup items sprite sheet (animated items from itch.io - Dani Maccari)
        // 32x32 per frame, 8 frames per row, 15 rows total
        this.load.spritesheet('powerup_items', 'assets/images/powerup_items.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        // Load ground decoration
        this.load.image('weed', 'assets/images/weed.png');

        // Load parallax background layers - Outback theme
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

        // Load beach background layers - Beach theme
        this.load.image('beach_sky', 'assets/images/beach-background/game_background_3/layers/sky.png');
        this.load.image('beach_cloud', 'assets/images/beach-background/game_background_3/layers/cloud.png');
        this.load.image('beach_sea', 'assets/images/beach-background/game_background_3/layers/sea.png');
        this.load.image('beach_land', 'assets/images/beach-background/game_background_3/layers/land.png');

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
        // Create coin animation from sprite sheet
        if (!this.anims.exists('coin_spin')) {
            this.anims.create({
                key: 'coin_spin',
                frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 24 }), // 25 frames (0-24)
                frameRate: 20,
                repeat: -1
            });
        }

        // Create powerup animations from sprite sheet
        // Star animation (row 6, frames 48-55) - for SHIELD
        if (!this.anims.exists('powerup_star')) {
            this.anims.create({
                key: 'powerup_star',
                frames: this.anims.generateFrameNumbers('powerup_items', { start: 48, end: 55 }),
                frameRate: 10,
                repeat: -1
            });
        }

        // Gem animation (row 5, frames 40-47) - for DOUBLE JUMP
        if (!this.anims.exists('powerup_gem')) {
            this.anims.create({
                key: 'powerup_gem',
                frames: this.anims.generateFrameNumbers('powerup_items', { start: 40, end: 47 }),
                frameRate: 10,
                repeat: -1
            });
        }

        // Rainbow ball animation (row 7, frames 56-63) - for MAGNET
        if (!this.anims.exists('powerup_rainbow')) {
            this.anims.create({
                key: 'powerup_rainbow',
                frames: this.anims.generateFrameNumbers('powerup_items', { start: 56, end: 63 }),
                frameRate: 10,
                repeat: -1
            });
        }

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

        // Create background based on selected theme
        this.createThemeBackground();

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
        const coinIcon = this.add.sprite(30, 30, 'coin', 0);
        coinIcon.play('coin_spin');
        coinIcon.setScale(0.5); // Increased from 0.17 for new 64x64 coin sprite
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
        const shopButton = this.add.text(300, 330, 'SHOP', {
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
        const shopPulseTween = this.tweens.add({
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
            shopPulseTween.pause();
            shopButton.setScale(1.2);
        });
        shopButton.on('pointerout', () => {
            shopButton.setScale(1);
            shopPulseTween.resume();
        });

        // Add background theme selector button
        const currentTheme = this.gameDataManager.getBackgroundTheme();
        const themeName = BACKGROUND_THEMES[currentTheme]?.name || 'Outback';

        this.bgButton = this.add.text(500, 330, `Theme: ${themeName}`, {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2,
            backgroundColor: '#886600',
            padding: { x: 15, y: 10 }
        }).setOrigin(0.5).setDepth(1000);

        this.bgButton.setInteractive();
        this.bgButton.on('pointerdown', () => {
            this.audioManager.playButtonClick();
            this.toggleBackgroundTheme();
        });

        // Add pulsing effect to background button
        const bgPulseTween = this.tweens.add({
            targets: this.bgButton,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Add hover effect to background button
        this.bgButton.on('pointerover', () => {
            bgPulseTween.pause();
            this.bgButton.setScale(1.2);
        });
        this.bgButton.on('pointerout', () => {
            this.bgButton.setScale(1);
            bgPulseTween.resume();
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

    /**
     * Create background based on selected theme
     */
    createThemeBackground() {
        const themeId = this.gameDataManager.getBackgroundTheme();
        const theme = BACKGROUND_THEMES[themeId] || BACKGROUND_THEMES.outback;

        console.log(`🎨 MenuScene: Loading ${theme.name} background`);

        // Create static background layers (no scrolling in menu)
        theme.layers.forEach(layerConfig => {
            const yPos = layerConfig.y !== undefined ? layerConfig.y : 300;

            if (layerConfig.type === 'image') {
                const img = this.add.image(400, yPos, layerConfig.key);
                img.setDisplaySize(800, 600);
                img.setDepth(layerConfig.depth);
            } else if (layerConfig.type === 'tileSprite') {
                // For menu, show as static image at custom position
                const tile = this.add.tileSprite(400, yPos, 800, 600, layerConfig.key);
                tile.setTileScale(layerConfig.tileScaleX, layerConfig.tileScaleY);
                tile.setDepth(layerConfig.depth);
            }
        });
    }

    /**
     * Toggle between background themes
     */
    toggleBackgroundTheme() {
        const currentTheme = this.gameDataManager.getBackgroundTheme();
        const themeKeys = Object.keys(BACKGROUND_THEMES);
        const currentIndex = themeKeys.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % themeKeys.length;
        const nextTheme = themeKeys[nextIndex];

        // Save new theme
        this.gameDataManager.setBackgroundTheme(nextTheme);

        // Update button text
        const themeName = BACKGROUND_THEMES[nextTheme].name;
        this.bgButton.setText(`Theme: ${themeName}`);

        // Restart the scene to show new background
        this.scene.restart();
    }
}