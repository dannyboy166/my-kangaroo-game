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
        // Add background color gradient effect
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x39cef9, 0x39cef9, 0x7dd9fc, 0x7dd9fc, 1);
        graphics.fillRect(0, 0, 800, 600);

        // Add title
        this.add.text(400, 60, 'KANGAROO SHOP', {
            fontSize: '42px',
            fontFamily: 'Arial',
            color: '#FF6B35',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Add coin display (top left)
        const coinIcon = this.add.sprite(30, 30, 'coin', 0);
        coinIcon.play('coin_spin');
        coinIcon.setScale(0.5); // Increased from 0.17 for new 64x64 coin sprite
        coinIcon.setOrigin(0, 0.5);

        this.coinText = this.add.text(70, 30, `${this.gameDataManager.getCoins()}`, {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.coinText.setOrigin(0, 0.5);

        // Create shop items
        this.createShopItems();

        // Add back button
        const backButton = this.add.text(400, 550, `Back to ${this.fromScene === 'GameOverScene' ? 'Game Over' : 'Menu'}`, {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        backButton.setInteractive();
        backButton.on('pointerdown', () => {
            this.audioManager.playButtonClick();
            if (this.fromScene === 'GameOverScene') {
                // Don't show fun fact when returning from shop
                this.scene.start(this.fromScene, { audioManager: this.audioManager, showFunFact: false });
            } else {
                this.scene.start(this.fromScene, { audioManager: this.audioManager });
            }
        });

        // Add hover effect to back button
        backButton.on('pointerover', () => {
            backButton.setScale(1.1);
        });
        backButton.on('pointerout', () => {
            backButton.setScale(1);
        });
    }
    createShopItems() {
        const items = ['shield', 'magnet', 'doubleJump', 'helmet'];
        const startY = 140;
        const spacing = 110; // Increased from 90 to 110 for more space

        items.forEach((item, index) => {
            const y = startY + (index * spacing);
            this.createShopItem(item, 400, y);
        });
    }

    createShopItem(type, x, y) {
        const container = this.add.container(x, y);

        // Background panel for the item - INCREASED HEIGHT
        const panel = this.add.graphics();
        panel.fillStyle(0x000000, 0.3);
        panel.fillRoundedRect(-350, -45, 700, 90, 10); // Increased height from 70 to 90, adjusted y from -35 to -45
        panel.lineStyle(2, 0xFFFFFF, 0.5);
        panel.strokeRoundedRect(-350, -45, 700, 90, 10);
        container.add(panel);

        // Item icon (use appropriate sprite/image) - handle name mapping
        let iconKey = type;
        if (type === 'doubleJump') {
            iconKey = 'double'; // The image is loaded as 'double' not 'doubleJump'
        }

        const icon = this.add.image(-300, 0, iconKey);

        // Set appropriate scale for each item type
        switch (type) {
            case 'helmet':
                icon.setScale(0.8);
                break;
            case 'shield':
                icon.setScale(0.25);
                break;
            case 'magnet':
                icon.setScale(0.2);
                break;
            case 'doubleJump':
                icon.setScale(0.25);
                break;
            default:
                icon.setScale(0.3);
        }

        container.add(icon);

        // Item name and description
        const name = this.storeManager.getPowerUpName(type);
        const description = this.storeManager.getPowerUpDescription(type);
        const price = this.storeManager.getPowerUpPrice(type);
        const count = this.storeManager.getPowerUpCount(type);

        const nameText = this.add.text(-220, -25, name, { // Title at top
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 1
        });
        nameText.setOrigin(0, 0.5);
        container.add(nameText);

        const descText = this.add.text(-220, 5, description, { // Description in middle
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#CCCCCC',
            stroke: '#000000',
            strokeThickness: 1
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
                fontSize: '14px',
                fontFamily: 'Arial',
                color: '#FFD700',
                stroke: '#000000',
                strokeThickness: 1,
                fontStyle: 'italic'
            });
            keyInstructionText.setOrigin(0, 0.5);
            container.add(keyInstructionText);
        } else {
            // For helmet, add a third line explaining it's auto-equipped
            const autoEquipText = this.add.text(-220, 30, 'Auto-equipped when owned', {
                fontSize: '14px',
                fontFamily: 'Arial',
                color: '#FFD700', // Light blue color
                stroke: '#000000',
                strokeThickness: 1,
                fontStyle: 'italic'
            });
            autoEquipText.setOrigin(0, 0.5);
            container.add(autoEquipText);
        }

        // Price and count display - BETTER SPACING
        const priceText = this.add.text(150, -20, `${price} coins`, { // Price at top right
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 1
        });
        priceText.setOrigin(0, 0.5);
        container.add(priceText);

        const countText = this.add.text(150, 0, `Owned: ${count}${type === 'helmet' ? '/1' : '/3'}`, { // Count in middle right
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#CCCCCC',
            stroke: '#000000',
            strokeThickness: 1
        });
        countText.setOrigin(0, 0.5);
        container.add(countText);

        // Buy button - custom logic using GameDataManager for coins
        const maxCount = type === 'helmet' ? 1 : 3;
        const playerCoins = this.gameDataManager.getCoins();
        const canBuy = playerCoins >= price && count < maxCount;

        // Debug logging for helmet
        if (type === 'helmet') {
            const helmetCount = this.storeManager.getPowerUpCount('helmet');
            const coins = this.gameDataManager.getCoins();
            const helmetPrice = this.storeManager.getPowerUpPrice('helmet');
            console.log(`🪖 Shop debug - Helmet count: ${helmetCount}, Coins: ${coins}, Price: ${helmetPrice}, Can buy: ${canBuy}, maxCount: ${maxCount}`);
        }

        const buttonColor = canBuy ? '#00FF00' : '#666666';
        const buttonTextColor = canBuy ? '#000000' : '#999999';

        const buyButton = this.add.graphics();
        buyButton.fillStyle(buttonColor === '#00FF00' ? 0x00FF00 : 0x666666);
        buyButton.fillRoundedRect(-50, -15, 100, 30, 5);
        buyButton.lineStyle(2, 0x000000);
        buyButton.strokeRoundedRect(-50, -15, 100, 30, 5);
        buyButton.x = 280;
        container.add(buyButton);

        // Determine button text based on specific conditions
        let buttonText;
        if (canBuy) {
            buttonText = 'BUY';
        } else if (count >= maxCount) {
            buttonText = 'SOLD OUT';
        } else {
            buttonText = 'NEED COINS';
        }

        const buyText = this.add.text(280, 0, buttonText, {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: buttonTextColor,
            stroke: buttonTextColor === '#000000' ? '#FFFFFF' : '#000000',
            strokeThickness: 1
        });
        buyText.setOrigin(0.5);
        container.add(buyText);

        // Make button interactive if can buy
        if (canBuy) {
            buyButton.setInteractive(new Phaser.Geom.Rectangle(-40, -15, 80, 30), Phaser.Geom.Rectangle.Contains);
            buyButton.on('pointerdown', () => {
                const itemPrice = this.storeManager.getPowerUpPrice(type);
                const itemCount = this.storeManager.getPowerUpCount(type);
                const itemMaxCount = type === 'helmet' ? 1 : 3;
                const playerCoins = this.gameDataManager.getCoins();

                console.log(`💰 Purchase attempt - Type: ${type}, PlayerCoins: ${playerCoins}, ItemPrice: ${itemPrice}, ItemCount: ${itemCount}, ItemMaxCount: ${itemMaxCount}`);

                if (playerCoins >= itemPrice && itemCount < itemMaxCount) {
                    // Show confirmation popup
                    const confirmPopup = new PurchaseConfirmPopup(
                        this,
                        type,
                        itemPrice,
                        () => {
                            // On confirm - do the purchase
                            console.log(`✅ Purchase confirmed for ${type}`);
                            this.gameDataManager.spendCoins(itemPrice);

                            // Add powerup via StoreManager
                            switch (type) {
                                case 'doubleJump':
                                    this.storeManager.doubleJumpCount++;
                                    console.log(`🦘 DoubleJump count now: ${this.storeManager.doubleJumpCount}`);
                                    break;
                                case 'shield':
                                    this.storeManager.shieldCount++;
                                    console.log(`🛡️ Shield count now: ${this.storeManager.shieldCount}`);
                                    break;
                                case 'magnet':
                                    this.storeManager.magnetCount++;
                                    console.log(`🧲 Magnet count now: ${this.storeManager.magnetCount}`);
                                    break;
                                case 'helmet':
                                    this.storeManager.helmetCount++;
                                    console.log(`🪖 Helmet count now: ${this.storeManager.helmetCount}`);
                                    break;
                            }
                            this.storeManager.saveData();

                            this.audioManager.playButtonClick();
                            // Refresh the display
                            container.destroy();
                            this.createShopItem(type, x, y);
                            // Update coin display
                            this.coinText.setText(`${this.gameDataManager.getCoins()}`);
                        },
                        () => {
                            // On cancel - just close popup
                            console.log(`❌ Purchase cancelled for ${type}`);
                        }
                    );
                    this.add.existing(confirmPopup);
                } else {
                    console.log(`❌ Purchase denied for ${type} - insufficient coins or max reached`);
                }
            });

            buyButton.on('pointerover', () => {
                buyButton.setScale(1.1);
                buyText.setScale(1.1);
            });

            buyButton.on('pointerout', () => {
                buyButton.setScale(1);
                buyText.setScale(1);
            });
        }
    }
}