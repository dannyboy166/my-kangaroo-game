import StoreManager from '../managers/StoreManager.js';
import GameDataManager from '../managers/GameDataManager.js';
import AudioManager from '../managers/AudioManager.js';
import PurchaseConfirmPopup from '../ui/PurchaseConfirmPopup.js';
import Button from '../ui/Button.js';
import CoinDisplay, { getCoinIconForAmount } from '../ui/CoinDisplay.js';
import { GAME_CONFIG } from '../config/GameConfig.js';

export default class StoreScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StoreScene' });
        this.gameDataManager = GameDataManager.getInstance();
    }

    init(data) {
        this.audioManager = data.audioManager || new AudioManager();
        this.fromScene = data.from || 'MenuScene';
        this.storeManager = new StoreManager();
    }

    create() {
        // Start menu music (will not restart if already playing)
        this.audioManager?.playMusic('music_menu', 0.3, true);

        // Add background image
        const bg = this.add.image(400, 300, 'ui_background');
        bg.setDisplaySize(800, 600);

        // Add title with ribbon background
        const titleContainer = this.add.container(400, 65);
        const titleRibbon = this.add.image(0, 0, 'ribbon_red');
        titleRibbon.setScale(0.55);
        const titleText = this.add.text(0, -12, 'SHOP', {
            fontSize: '36px',
            fontFamily: 'Carter One',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        titleContainer.add([titleRibbon, titleText]);

        // Add coin display (top left) - uses centralized position from UITheme
        this.coinDisplay = new CoinDisplay(this);
        this.coinDisplay.setCount(this.gameDataManager.getCoins());

        // Create shop items
        this.createShopItems();

        // Add music toggle button
        this.createMusicToggle();

        // Add back button with new UI graphics
        this.backButton = new Button(this, 400, 550, {
            text: this.fromScene === 'GameOverScene' ? 'BACK' : 'MENU',
            bgKey: 'btn_long_yellow',
            bgScale: 0.5,
            iconKey: 'icon_house',
            iconScale: 0.4,
            iconWidth: 28,
            textStyle: { fontSize: '22px' },
            onClick: () => {
                this.audioManager.playButtonClick();
                if (this.fromScene === 'GameOverScene') {
                    // Don't show fun fact when returning from shop
                    this.scene.start(this.fromScene, { audioManager: this.audioManager, showFunFact: false });
                } else {
                    this.scene.start(this.fromScene, { audioManager: this.audioManager });
                }
            }
        });
    }
    createShopItems() {
        // Helmet temporarily disabled - needs helmet sprite for new kangaroo character
        this.shopItems = ['shield', 'magnet', 'doubleJump'];
        this.itemContainers = {};
        const startY = 200;
        const spacing = 120;

        this.shopItems.forEach((item, index) => {
            const y = startY + (index * spacing);
            this.createShopItem(item, 400, y);
        });
    }

    refreshAllItems() {
        // Destroy all item containers and recreate them
        const startY = 200;
        const spacing = 120;

        this.shopItems.forEach((item, index) => {
            if (this.itemContainers[item]) {
                this.itemContainers[item].destroy();
            }
            const y = startY + (index * spacing);
            this.createShopItem(item, 400, y);
        });

        // Update coin display
        this.coinDisplay.setCount(this.gameDataManager.getCoins());
    }

    createShopItem(type, x, y) {
        const container = this.add.container(x, y);
        this.itemContainers[type] = container; // Store reference for refreshing

        // Background panel for the item - using UI pack panel
        const panel = this.add.image(0, 0, 'back_myname');
        panel.setScale(1.1, 1.3);
        container.add(panel);

        // Item icon - use plain (non-glow) images for shop UI
        let icon;
        if (type === 'helmet') {
            // Helmet uses static image
            icon = this.add.image(-300, 0, 'helmet');
            icon.setScale(0.8);
        } else {
            // Powerups use plain static images with config-based scales
            const imageMap = {
                'shield': 'powerup_shield',
                'magnet': 'powerup_magnet',
                'doubleJump': 'powerup_double_jump'
            };
            // Map store type to config type
            const configType = type === 'doubleJump' ? 'double' : type;
            const scale = GAME_CONFIG.POWERUPS.SCALES.SHOP[configType];

            icon = this.add.image(-300, 0, imageMap[type]);
            icon.setScale(scale);
        }

        container.add(icon);

        // Item name and description
        const name = this.storeManager.getPowerUpName(type);
        const description = this.storeManager.getPowerUpDescription(type);
        const price = this.storeManager.getPowerUpPrice(type);
        const count = this.storeManager.getPowerUpCount(type);

        const nameText = this.add.text(-220, -20, name, { // Title at top
            fontSize: '20px',
            fontFamily: 'Carter One',
            color: '#000000'
        });
        nameText.setOrigin(0, 0.5);
        container.add(nameText);

        const descText = this.add.text(-220, 5, description, { // Description in middle
            fontSize: '14px',
            fontFamily: 'Carter One',
            color: '#333333'
        });
        descText.setOrigin(0, 0.5);
        container.add(descText);

        // Add activation key instruction (only for non-helmet items)
        if (type !== 'helmet') {
            let keyNumber;
            switch (type) {
                case 'shield':
                    keyNumber = '1';
                    break;
                case 'magnet':
                    keyNumber = '2';
                    break;
                case 'doubleJump':
                    keyNumber = '3';
                    break;
            }

            const keyInstructionText = this.add.text(-220, 25, `Press ${keyNumber} to activate`, { // Key instruction at bottom
                fontSize: '12px',
                fontFamily: 'Carter One',
                color: '#666666',
                fontStyle: 'italic'
            });
            keyInstructionText.setOrigin(0, 0.5);
            container.add(keyInstructionText);
        } else {
            // For helmet, add a third line explaining it's auto-equipped
            const autoEquipText = this.add.text(-220, 25, 'Auto-equipped', {
                fontSize: '12px',
                fontFamily: 'Carter One',
                color: '#666666',
                fontStyle: 'italic'
            });
            autoEquipText.setOrigin(0, 0.5);
            container.add(autoEquipText);
        }

        // Price and count display - with coin icon
        const priceText = this.add.text(80, -10, `${price}`, { // Price at top right
            fontSize: '16px',
            fontFamily: 'Carter One',
            color: '#000000'
        });
        priceText.setOrigin(0, 0.5);
        container.add(priceText);

        // Coin icon next to price - based on item price (more gap for separation)
        const priceCoinIconKey = getCoinIconForAmount(price);
        const priceCoinIcon = this.add.image(80 + priceText.width + 25, -10, priceCoinIconKey);
        priceCoinIcon.setScale(0.3);  // 128px * 0.3 = 38px display
        priceCoinIcon.setOrigin(0.5, 0.5);
        container.add(priceCoinIcon);

        const countText = this.add.text(80, 15, `Owned: ${count}${type === 'helmet' ? '/1' : '/3'}`, { // Count below price
            fontSize: '14px',
            fontFamily: 'Carter One',
            color: '#333333'
        });
        countText.setOrigin(0, 0.5);
        container.add(countText);

        // Buy button - custom logic using GameDataManager for coins
        const maxCount = type === 'helmet' ? 1 : 3;
        const playerCoins = this.gameDataManager.getCoins();
        const canBuy = playerCoins >= price && count < maxCount;

        // Use graphical buttons from UI pack - matching green/gray buttons
        const buttonKey = canBuy ? 'btn3_green' : 'btn3_gray';
        const buyButtonBg = this.add.image(245, 0, buttonKey);
        buyButtonBg.setScale(0.65);
        container.add(buyButtonBg);

        // Determine button text based on specific conditions
        let buttonText;
        if (canBuy) {
            buttonText = 'BUY';
        } else if (count >= maxCount) {
            buttonText = 'MAX';
        } else {
            buttonText = '---';
        }

        const buyText = this.add.text(245, -5, buttonText, {
            fontSize: '18px',
            fontFamily: 'Carter One',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        });
        buyText.setOrigin(0.5);
        container.add(buyText);

        // Make button interactive if can buy
        if (canBuy) {
            buyButtonBg.setInteractive();
            buyButtonBg.on('pointerdown', () => {
                const itemPrice = this.storeManager.getPowerUpPrice(type);
                const itemCount = this.storeManager.getPowerUpCount(type);
                const itemMaxCount = type === 'helmet' ? 1 : 3;
                const playerCoins = this.gameDataManager.getCoins();

                if (playerCoins >= itemPrice && itemCount < itemMaxCount) {
                    // Show confirmation popup
                    const confirmPopup = new PurchaseConfirmPopup(
                        this,
                        type,
                        itemPrice,
                        () => {
                            // On confirm - do the purchase
                            this.gameDataManager.spendCoins(itemPrice);
                            this.storeManager.addPowerUp(type);
                            this.audioManager.playButtonClick();
                            // Refresh all items (so buttons gray out if can't afford)
                            this.refreshAllItems();
                        },
                        () => {
                            // On cancel - just close popup
                        }
                    );
                    this.add.existing(confirmPopup);
                }
            });

            buyButtonBg.on('pointerover', () => {
                buyButtonBg.setScale(0.72);
                buyText.setScale(1.1);
            });

            buyButtonBg.on('pointerout', () => {
                buyButtonBg.setScale(0.65);
                buyText.setScale(1);
            });
        }
    }

    /**
     * Create music toggle button (bottom-right corner)
     */
    createMusicToggle() {
        const x = 750;
        const y = 560;

        // Get current music state
        const musicEnabled = this.audioManager.musicEnabled;
        const iconKey = musicEnabled ? 'icon_music' : 'icon_music_off';

        // Create icon
        this.musicToggleIcon = this.add.image(x, y, iconKey);
        this.musicToggleIcon.setScale(0.2);
        this.musicToggleIcon.setInteractive({ useHandCursor: true });
        this.musicToggleIcon.setDepth(2000);

        // Add hover effect
        this.musicToggleIcon.on('pointerover', () => {
            this.musicToggleIcon.setScale(0.22);
        });

        this.musicToggleIcon.on('pointerout', () => {
            this.musicToggleIcon.setScale(0.2);
        });

        // Add click handler
        this.musicToggleIcon.on('pointerdown', () => {
            this.audioManager.playButtonClick();
            const newState = this.audioManager.toggleMusic();

            // Update icon
            const newIconKey = newState ? 'icon_music' : 'icon_music_off';
            this.musicToggleIcon.setTexture(newIconKey);
        });
    }
}