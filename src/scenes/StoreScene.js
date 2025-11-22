import StoreManager from '../managers/StoreManager.js';
import GameDataManager from '../managers/GameDataManager.js';
import AudioManager from '../managers/AudioManager.js';
import PurchaseConfirmPopup from '../ui/PurchaseConfirmPopup.js';

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
        // Add background image
        const bg = this.add.image(400, 300, 'ui_background');
        bg.setDisplaySize(800, 600);

        // Add title with ribbon background
        const titleRibbon = this.add.image(400, 65, 'ribbon_red');
        titleRibbon.setScale(0.65);

        this.add.text(400, 53, 'SHOP', {
            fontSize: '36px',
            fontFamily: 'Arial Black',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Add coin display (top left) with new UI coin icon
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

        // Create shop items
        this.createShopItems();

        // Add back button with new UI graphics
        const backButtonContainer = this.add.container(400, 550);
        const backButtonBg = this.add.image(0, 0, 'btn_long_red');
        backButtonBg.setScale(0.5);
        const backIcon = this.add.image(-55, 0, 'icon_house');
        backIcon.setScale(0.4);
        const backButtonText = this.add.text(10, 0, this.fromScene === 'GameOverScene' ? 'BACK' : 'MENU', {
            fontSize: '22px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        backButtonContainer.add([backButtonBg, backIcon, backButtonText]);

        backButtonBg.setInteractive();
        backButtonBg.on('pointerdown', () => {
            this.audioManager.playButtonClick();
            if (this.fromScene === 'GameOverScene') {
                // Don't show fun fact when returning from shop
                this.scene.start(this.fromScene, { audioManager: this.audioManager, showFunFact: false });
            } else {
                this.scene.start(this.fromScene, { audioManager: this.audioManager });
            }
        });

        // Add hover effect to back button
        backButtonBg.on('pointerover', () => {
            backButtonContainer.setScale(1.1);
        });
        backButtonBg.on('pointerout', () => {
            backButtonContainer.setScale(1);
        });
    }
    createShopItems() {
        // Helmet temporarily disabled - needs helmet sprite for new kangaroo character
        const items = ['shield', 'magnet', 'doubleJump'];
        const startY = 200;
        const spacing = 120;

        items.forEach((item, index) => {
            const y = startY + (index * spacing);
            this.createShopItem(item, 400, y);
        });
    }

    createShopItem(type, x, y) {
        const container = this.add.container(x, y);

        // Background panel for the item - using UI pack panel
        const panel = this.add.image(0, 0, 'back_myname');
        panel.setScale(1.1, 1.3);
        container.add(panel);

        // Item icon - use animated sprites for powerups, static image for helmet
        let icon;
        if (type === 'helmet') {
            // Helmet uses static image
            icon = this.add.image(-300, 0, 'helmet');
            icon.setScale(0.8);
        } else {
            // Powerups use animated sprites
            let animKey;
            switch (type) {
                case 'shield':
                    animKey = 'powerup_heart'; // Pink heart
                    break;
                case 'magnet':
                    animKey = 'powerup_green_gem'; // Green gem
                    break;
                case 'doubleJump':
                    animKey = 'powerup_star'; // Star
                    break;
            }

            icon = this.add.sprite(-300, 0, 'powerup_items', 0);
            icon.play(animKey);
            icon.setScale(2.5); // Scale up the 32x32 sprites
        }

        container.add(icon);

        // Item name and description
        const name = this.storeManager.getPowerUpName(type);
        const description = this.storeManager.getPowerUpDescription(type);
        const price = this.storeManager.getPowerUpPrice(type);
        const count = this.storeManager.getPowerUpCount(type);

        const nameText = this.add.text(-220, -15, name, { // Title at top
            fontSize: '20px',
            fontFamily: 'Arial Black',
            color: '#000000'
        });
        nameText.setOrigin(0, 0.5);
        container.add(nameText);

        const descText = this.add.text(-220, 10, description, { // Description in middle
            fontSize: '14px',
            fontFamily: 'Arial',
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

            const keyInstructionText = this.add.text(-220, 30, `Press ${keyNumber} to activate`, { // Key instruction at bottom
                fontSize: '12px',
                fontFamily: 'Arial',
                color: '#666666',
                fontStyle: 'italic'
            });
            keyInstructionText.setOrigin(0, 0.5);
            container.add(keyInstructionText);
        } else {
            // For helmet, add a third line explaining it's auto-equipped
            const autoEquipText = this.add.text(-220, 30, 'Auto-equipped', {
                fontSize: '12px',
                fontFamily: 'Arial',
                color: '#666666',
                fontStyle: 'italic'
            });
            autoEquipText.setOrigin(0, 0.5);
            container.add(autoEquipText);
        }

        // Price and count display
        const priceText = this.add.text(80, -10, `${price} coins`, { // Price at top right
            fontSize: '16px',
            fontFamily: 'Arial Black',
            color: '#000000'
        });
        priceText.setOrigin(0, 0.5);
        container.add(priceText);

        const countText = this.add.text(80, 15, `Owned: ${count}${type === 'helmet' ? '/1' : '/3'}`, { // Count below price
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#333333'
        });
        countText.setOrigin(0, 0.5);
        container.add(countText);

        // Buy button - custom logic using GameDataManager for coins
        const maxCount = type === 'helmet' ? 1 : 3;
        const playerCoins = this.gameDataManager.getCoins();
        const canBuy = playerCoins >= price && count < maxCount;

        // Use graphical buttons from UI pack - little buttons
        const buttonKey = canBuy ? 'btn_little_green' : 'btn_little_gray';
        const buyButtonBg = this.add.image(245, 0, buttonKey);
        buyButtonBg.setScale(0.5);
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

        const buyText = this.add.text(245, -3, buttonText, {
            fontSize: '18px',
            fontFamily: 'Arial Black',
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
                            // Refresh the display
                            container.destroy();
                            this.createShopItem(type, x, y);
                            // Update coin display
                            this.coinText.setText(`${this.gameDataManager.getCoins()}`);
                        },
                        () => {
                            // On cancel - just close popup
                        }
                    );
                    this.add.existing(confirmPopup);
                }
            });

            buyButtonBg.on('pointerover', () => {
                buyButtonBg.setScale(0.55);
                buyText.setScale(1.1);
            });

            buyButtonBg.on('pointerout', () => {
                buyButtonBg.setScale(0.5);
                buyText.setScale(1);
            });
        }
    }
}