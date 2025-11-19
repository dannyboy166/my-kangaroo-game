import GameDataManager from '../managers/GameDataManager.js';
import AudioManager from '../managers/AudioManager.js';
import { BACKGROUND_THEMES } from '../config/BackgroundConfig.js';
import { CHARACTER_CONFIGS, getCharacterFramePaths } from '../config/CharacterConfig.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
        this.gameDataManager = GameDataManager.getInstance();
        this.audioManager = new AudioManager();
    }

    preload() {
        // ========================================
        // NEW PROFESSIONAL ANIMATED CHARACTERS
        // ========================================
        // Load new animated kangaroo frames (937x1083 per frame, high quality!)
        this.loadCharacterFrames('kangaroo', 'brown');

        // Load new obstacle animals
        this.loadCharacterFrames('emu', 'brown');      // Ostrich (looks like emu)
        this.loadCharacterFrames('camel', 'brown');    // Camel
        this.loadCharacterFrames('croc', 'green');     // Crocodile (uses sprite sheets)

        // Optional color variants:
        // this.loadCharacterFrames('kangaroo', 'grey');

        // OLD SPRITE SHEET (keeping as backup for now)
        // this.load.spritesheet('kangaroo_old', 'assets/images/kangaroos.png', {
        //     frameWidth: 128,
        //     frameHeight: 128
        // });

        // Load kangaroo helmet sprite sheet (same dimensions as normal kangaroo)
        // TODO: Replace with new character variant when we get helmet version
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

        // Load outback background layers - moved from parallax folder
        this.load.image('parallax_distant_trees', 'assets/images/outback-background/distant_trees.png');

        // Load beach background layers - Beach theme (game_background_3)
        this.load.image('beach_sky', 'assets/images/beach-background/game_background_3/layers/sky.png');
        this.load.image('beach_cloud', 'assets/images/beach-background/game_background_3/layers/cloud.png');
        this.load.image('beach_sea', 'assets/images/beach-background/game_background_3/layers/sea.png');
        this.load.image('beach_land', 'assets/images/beach-background/game_background_3/layers/land.png');

        // Load outback background layers (game_background_2 sky + game_background_1 cloud/land)
        this.load.image('outback_sky', 'assets/images/beach-background/game_background_2/layers/sky.png');
        this.load.image('outback_cloud', 'assets/images/beach-background/game_background_1/layers/cloud.png');
        this.load.image('outback_land', 'assets/images/beach-background/game_background_1/layers/land.png');

        // Load helmet image (only static image we still use)
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
        // ========================================
        // CREATE NEW CHARACTER ANIMATIONS
        // ========================================
        // Create animations for the new professional characters
        this.createCharacterAnimations('kangaroo', 'brown');
        this.createCharacterAnimations('emu', 'brown');
        this.createCharacterAnimations('camel', 'brown');
        this.createCharacterAnimations('croc', 'green');

        // Optional color variants:
        // this.createCharacterAnimations('kangaroo', 'grey');

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
        // Heart animation (row 1, frames 8-13) - for SHIELD (skip last 2 blank frames)
        if (!this.anims.exists('powerup_heart')) {
            this.anims.create({
                key: 'powerup_heart',
                frames: this.anims.generateFrameNumbers('powerup_items', { start: 8, end: 13 }),
                frameRate: 10,
                repeat: -1
            });
        }

        // Green gem animation (row 6, frames 48-55) - for MAGNET
        if (!this.anims.exists('powerup_green_gem')) {
            this.anims.create({
                key: 'powerup_green_gem',
                frames: this.anims.generateFrameNumbers('powerup_items', { start: 48, end: 55 }),
                frameRate: 10,
                repeat: -1
            });
        }

        // Star animation (row 7, frames 56-63) - for DOUBLE JUMP
        if (!this.anims.exists('powerup_star')) {
            this.anims.create({
                key: 'powerup_star',
                frames: this.anims.generateFrameNumbers('powerup_items', { start: 56, end: 63 }),
                frameRate: 10,
                repeat: -1
            });
        }

        // Mystery box animation (row 3, frames 24-31) - RESERVED for future random powerup
        if (!this.anims.exists('powerup_mystery_box')) {
            this.anims.create({
                key: 'powerup_mystery_box',
                frames: this.anims.generateFrameNumbers('powerup_items', { start: 24, end: 31 }),
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

        // Create static background layers (no scrolling in menu)
        theme.layers.forEach(layerConfig => {
            const yPos = layerConfig.y !== undefined ? layerConfig.y : 300;

            if (layerConfig.type === 'image') {
                const img = this.add.image(400, yPos, layerConfig.key);
                img.setDisplaySize(800, 600);
                img.setDepth(layerConfig.depth);
            } else if (layerConfig.type === 'tileSprite') {
                // For menu, show as static image at custom position with custom height
                const tileHeight = layerConfig.height !== undefined ? layerConfig.height : 600;
                const tile = this.add.tileSprite(400, yPos, 800, tileHeight, layerConfig.key);
                tile.setTileScale(layerConfig.tileScaleX, layerConfig.tileScaleY);
                tile.setDepth(layerConfig.depth);

                // Apply custom origin if specified
                if (layerConfig.originX !== undefined || layerConfig.originY !== undefined) {
                    const originX = layerConfig.originX !== undefined ? layerConfig.originX : 0.5;
                    const originY = layerConfig.originY !== undefined ? layerConfig.originY : 0.5;
                    tile.setOrigin(originX, originY);
                }
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

    /**
     * Load character animation frames
     * USE THIS METHOD TO ADD NEW ANIMALS!
     *
     * @param {string} characterKey - Character name from CHARACTER_CONFIGS
     * @param {string} color - Color variant (brown, grey, etc.)
     */
    loadCharacterFrames(characterKey, color) {
        const config = CHARACTER_CONFIGS[characterKey];
        if (!config) {
            console.error(`Character config not found: ${characterKey}`);
            return;
        }

        // Check if this character uses sprite sheets or individual frames
        if (config.useSpriteSheet) {
            // Load sprite sheets (like crocodile)
            Object.keys(config.animations).forEach(animKey => {
                const animConfig = config.animations[animKey];
                const spriteSheetKey = `${characterKey}_${color}_${animKey}`;
                const path = `${config.basePath}/${color}/${animConfig.spriteSheet}.png`;

                this.load.spritesheet(spriteSheetKey, path, {
                    frameWidth: animConfig.frameWidth,
                    frameHeight: animConfig.frameHeight
                });
            });
        } else {
            // Load individual frames (like kangaroo, emu, camel)
            Object.keys(config.animations).forEach(animKey => {
                const frames = getCharacterFramePaths(characterKey, animKey, color);
                const textureKey = `${characterKey}_${color}_${animKey}`;

                // Load each frame as individual image
                frames.forEach((path, index) => {
                    const frameKey = `${textureKey}_${String(index).padStart(3, '0')}`;
                    this.load.image(frameKey, path);
                });
            });
        }
    }

    /**
     * Create character animations from loaded frames
     * Call this in create() after preload() completes
     *
     * @param {string} characterKey - Character name
     * @param {string} color - Color variant
     */
    createCharacterAnimations(characterKey, color) {
        const config = CHARACTER_CONFIGS[characterKey];
        if (!config) return;

        Object.keys(config.animations).forEach(animKey => {
            const animConfig = config.animations[animKey];
            const animationKey = `${characterKey}_${color}_${animKey}`;

            // Skip if animation already exists
            if (this.anims.exists(animationKey)) return;

            if (config.useSpriteSheet) {
                // Create animation from sprite sheet (like crocodile)
                const spriteSheetKey = `${characterKey}_${color}_${animKey}`;
                this.anims.create({
                    key: animationKey,
                    frames: this.anims.generateFrameNumbers(spriteSheetKey, {
                        start: 0,
                        end: animConfig.frameCount - 1
                    }),
                    frameRate: animConfig.frameRate,
                    repeat: animConfig.repeat
                });
            } else {
                // Create animation from individual frames (like kangaroo, emu, camel)
                const frames = [];

                // Support both frameCount and frameStart/frameEnd
                if (animConfig.frameStart !== undefined && animConfig.frameEnd !== undefined) {
                    // Use specific frame range (e.g., frames 3-5 for jump)
                    for (let i = animConfig.frameStart; i <= animConfig.frameEnd; i++) {
                        const frameKey = `${characterKey}_${color}_${animKey}_${String(i - animConfig.frameStart).padStart(3, '0')}`;
                        frames.push({ key: frameKey });
                    }
                } else {
                    // Use all frames (traditional frameCount)
                    for (let i = 0; i < animConfig.frameCount; i++) {
                        const frameKey = `${characterKey}_${color}_${animKey}_${String(i).padStart(3, '0')}`;
                        frames.push({ key: frameKey });
                    }
                }

                this.anims.create({
                    key: animationKey,
                    frames: frames,
                    frameRate: animConfig.frameRate,
                    repeat: animConfig.repeat
                });
            }
        });
    }
}