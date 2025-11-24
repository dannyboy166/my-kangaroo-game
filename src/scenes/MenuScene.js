import GameDataManager from '../managers/GameDataManager.js';
import AudioManager from '../managers/AudioManager.js';
import { BACKGROUND_THEMES } from '../config/BackgroundConfig.js';
import { CHARACTER_CONFIGS, getCharacterFramePaths } from '../config/CharacterConfig.js';
import Button from '../ui/Button.js';
import CoinDisplay from '../ui/CoinDisplay.js';

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

        // Load powerup images (static with tween animations)
        // Plain versions for shop/inventory UI
        this.load.image('powerup_shield', 'assets/images/powerups/shield.png');
        this.load.image('powerup_magnet', 'assets/images/powerups/magnet.png');
        this.load.image('powerup_double_jump', 'assets/images/powerups/double_jump.png');
        // Glow versions for in-game collectibles (more visible)
        this.load.image('powerup_shield_glow', 'assets/images/powerups/shield_glow.png');
        this.load.image('powerup_magnet_glow', 'assets/images/powerups/magnet_glow.png');
        this.load.image('powerup_double_jump_glow', 'assets/images/powerups/double_jump_glow.png');

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

        // ========================================
        // NEW UI PACK ASSETS
        // ========================================
        // Buttons
        this.load.image('btn_green', 'assets/images/ui/buttons/bttn_green.png');
        this.load.image('btn_sq_green', 'assets/images/ui/buttons/bttn2_sq_green.png');
        this.load.image('btn_sq_gray', 'assets/images/ui/buttons/bttn2_sq_gray.png');
        this.load.image('btn_little_green', 'assets/images/ui/buttons/bttn2_little_green.png');
        this.load.image('btn_little_gray', 'assets/images/ui/buttons/bttn2_little_gray.png');
        this.load.image('btn3_gray', 'assets/images/ui/buttons/bttn3_gray.png');
        this.load.image('btn3_green', 'assets/images/ui/buttons/bttn3_green.png');
        this.load.image('btn2_red', 'assets/images/ui/buttons/bttn2_red.png');
        this.load.image('btn_blue', 'assets/images/ui/buttons/bttn_blue.png');
        this.load.image('btn_red', 'assets/images/ui/buttons/bttn_red.png');
        this.load.image('btn_yellow', 'assets/images/ui/buttons/bttn_yellow.png');
        this.load.image('btn_pink', 'assets/images/ui/buttons/bttn_pink.png');
        this.load.image('btn_gray', 'assets/images/ui/buttons/bttn_gray.png');
        this.load.image('btn_long_green', 'assets/images/ui/buttons/bttn_long_green.png');
        this.load.image('btn_long_blue', 'assets/images/ui/buttons/bttn_long_blue.png');
        this.load.image('btn_long_yellow', 'assets/images/ui/buttons/bttn_long_yellow.png');
        this.load.image('btn_long_red', 'assets/images/ui/buttons/bttn_long_red.png');
        this.load.image('btn_sq_green', 'assets/images/ui/buttons/bttn_square_green.png');
        this.load.image('btn_sq_blue', 'assets/images/ui/buttons/bttn_square_blue.png');
        this.load.image('btn_sq_red', 'assets/images/ui/buttons/bttn_square_red.png');

        // Icons (64x64 size - good for game UI)
        this.load.image('icon_shop', 'assets/images/ui/icons/icons_color/64x64/shop.png');
        this.load.image('icon_house', 'assets/images/ui/icons/icons_color/64x64/house.png');
        this.load.image('icon_settings', 'assets/images/ui/icons/icons_color/64x64/settings.png');
        this.load.image('icon_sound', 'assets/images/ui/icons/icons_color/64x64/sound.png');
        this.load.image('icon_sound_off', 'assets/images/ui/icons/icons_color/64x64/sound_off.png');
        this.load.image('icon_star', 'assets/images/ui/icons/icons_color/64x64/star.png');
        this.load.image('icon_close', 'assets/images/ui/icons/icons_color/64x64/close.png');
        this.load.image('icon_ok', 'assets/images/ui/icons/icons_color/64x64/ok.png');
        this.load.image('icon_gold', 'assets/images/ui/icons/icons_color/64x64/gold.png');

        // Gold coin icons (128x128 for crisp scaling)
        // Different sizes based on coin count - using higher res shop icons
        this.load.image('ui_coin_1', 'assets/images/ui/icons/icons_for_shop/128x128/coin_gold1_shop.png');
        this.load.image('ui_coin_2', 'assets/images/ui/icons/icons_for_shop/128x128/coin_gold2_shop.png');
        this.load.image('ui_coin_3', 'assets/images/ui/icons/icons_for_shop/128x128/coin_gold3_shop.png');
        this.load.image('ui_coin_4', 'assets/images/ui/icons/icons_for_shop/128x128/coin_gold4_shop.png');
        // Keep ui_coin as alias for backwards compatibility
        this.load.image('ui_coin', 'assets/images/ui/icons/icons_for_shop/128x128/coin_gold1_shop.png');

        // Ribbons (for titles)
        this.load.image('ribbon_orange', 'assets/images/ui/ribbons/ribbon_orange.png');
        this.load.image('ribbon_green', 'assets/images/ui/ribbons/ribbon_green.png');
        this.load.image('ribbon_blue', 'assets/images/ui/ribbons/ribbon_blue.png');
        this.load.image('ribbon_red', 'assets/images/ui/ribbons/ribbon_red.png');

        // Panels/backgrounds
        this.load.image('panel_score', 'assets/images/ui/title/back_score.png');
        this.load.image('panel_shop', 'assets/images/ui/title/back_shop.png');
        this.load.image('panel_small', 'assets/images/ui/title/back_small.png');
        this.load.image('panel_uppanel', 'assets/images/ui/title/back_uppanel.png');
        this.load.image('back_days', 'assets/images/ui/title/back_days.png');
        this.load.image('back_myname', 'assets/images/ui/title/back_myname.png');
        this.load.image('ui_background', 'assets/images/ui/title/background_1920x1080.png');

        // Arrows
        this.load.image('arrow_green', 'assets/images/ui/buttons/arrow_green.png');

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

        // Add title with ribbon background
        const titleContainer = this.add.container(400, 130).setDepth(1000);
        const titleRibbon = this.add.image(0, 0, 'ribbon_orange');
        titleRibbon.setScale(0.7);
        const titleText = this.add.text(0, -15, 'KANGAROO HOP', {
            fontSize: '42px',
            fontFamily: 'Carter One',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        titleContainer.add([titleRibbon, titleText]);

        // Add subtitle - green color to match play button
        const startText = this.add.text(400, 235, 'Tap or Press SPACE to Play!', {
            fontSize: '26px',
            fontFamily: 'Carter One',
            color: '#4CAF50',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(1000);

        // Add green arrow pointing down to indicate "tap here"
        const playArrow = this.add.image(400, 300, 'arrow_green');
        playArrow.setScale(0.5);
        playArrow.setDepth(1000);

        // Add pulsing effect to start text and play arrow together
        this.tweens.add({
            targets: [startText, playArrow],
            scaleX: '*=1.15',
            scaleY: '*=1.15',
            duration: 800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });



        // Add coin UI (top left) - uses centralized position from UITheme
        this.coinDisplay = new CoinDisplay(this);
        this.coinDisplay.setCount(this.gameDataManager.getCoins());
        this.coinDisplay.setDepth(1000);

        // No need for createSimpleGround - using parallax ground layer instead

        // Add shop button with new UI graphics - DOWN LEFT
        this.shopButton = new Button(this, 250, 400, {
            text: 'Shop',
            bgKey: 'btn_blue',
            bgScale: 0.4,
            iconKey: 'icon_shop',
            iconScale: 0.38,
            iconWidth: 28,
            textStyle: { fontSize: '28px' },
            pulse: true,
            hoverScale: 1.15,
            onClick: () => {
                this.audioManager.playButtonClick();
                this.scene.start('StoreScene', { audioManager: this.audioManager, from: 'MenuScene' });
            }
        });
        this.shopButton.setDepth(1000);

        // Add background theme selector button with new UI graphics - DOWN RIGHT
        const currentTheme = this.gameDataManager.getBackgroundTheme();
        const themeName = BACKGROUND_THEMES[currentTheme]?.name || 'Outback';
        // Use different button colors per theme: red for outback, yellow for beach
        const themeBtnKey = currentTheme === 'outback' ? 'btn_red' : 'btn_yellow';

        this.bgButton = new Button(this, 550, 400, {
            text: themeName,
            bgKey: themeBtnKey,
            bgScale: 0.4,
            iconKey: 'icon_star',
            iconScale: 0.38,
            iconWidth: 28,
            textStyle: { fontSize: '28px' },
            pulse: true,
            hoverScale: 1.15,
            onClick: () => {
                this.audioManager.playButtonClick();
                this.toggleBackgroundTheme();
            }
        });
        this.bgButton.setDepth(1000);


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