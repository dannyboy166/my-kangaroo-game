export default class StoreScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StoreScene' });
    }

    create() {
        console.log('🏪 STORE SCENE LOADED!');
        
        // Background
        this.cameras.main.setBackgroundColor('#1A1A2E');
        
        // Store Panel
        const panel = this.add.rectangle(400, 300, 700, 500, 0x1A1A2E);
        panel.setStrokeStyle(3, 0x4F9DFF);
        
        // Title
        this.add.text(400, 80, 'POWER-UP STORE', {
            fontSize: '40px',
            fill: '#4F9DFF',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // Coin display
        this.add.image(320, 120, 'coin').setScale(0.7);
        this.coinText = this.add.text(350, 120, window.GameData.storeManager.totalCoins.toString(), {
            fontSize: '28px',
            fill: '#F7B027',
            fontWeight: 'bold'
        }).setOrigin(0, 0.5);
        
        // Power-up items
        this.createStoreItems();
        
        // Close button
        const closeButton = this.add.text(650, 80, '✕', {
            fontSize: '32px',
            fill: '#ffffff',
            backgroundColor: '#FF4757',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive();
        
        closeButton.on('pointerdown', () => {
            window.GameData.audioManager.playButtonClick();
            this.scene.start('MenuScene');
        });
        
        // Back button
        const backButton = this.add.text(400, 480, 'BACK TO MENU', {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: '#57606F',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive();
        
        backButton.on('pointerdown', () => {
            window.GameData.audioManager.playButtonClick();
            this.scene.start('MenuScene');
        });
        
        // Hover effects
        closeButton.on('pointerover', () => closeButton.setScale(1.1));
        closeButton.on('pointerout', () => closeButton.setScale(1.0));
        backButton.on('pointerover', () => backButton.setScale(1.1));
        backButton.on('pointerout', () => backButton.setScale(1.0));
    }
    
    createStoreItems() {
        const powerUps = [
            { type: 'doubleJump', x: 200 },
            { type: 'shield', x: 400 },
            { type: 'magnet', x: 600 }
        ];
        
        powerUps.forEach(powerUp => {
            this.createStoreItem(powerUp.type, powerUp.x, 280);
        });
    }
    
    createStoreItem(type, x, y) {
        const storeManager = window.GameData.storeManager;
        
        // Item background
        const itemBg = this.add.rectangle(x, y, 180, 250, 0x16213E);
        itemBg.setStrokeStyle(2, 0x4F9DFF);
        
        // Power-up image
        this.add.image(x, y - 60, type).setScale(0.8);
        
        // Name
        this.add.text(x, y - 10, storeManager.getPowerUpName(type), {
            fontSize: '18px',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // Description
        this.add.text(x, y + 20, storeManager.getPowerUpDescription(type), {
            fontSize: '12px',
            fill: '#ffffff70',
            align: 'center'
        }).setOrigin(0.5);
        
        // Price
        this.add.text(x, y + 60, `$ ${storeManager.getPowerUpPrice(type)}`, {
            fontSize: '20px',
            fill: '#FFD700',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // Count
        const countText = this.add.text(x, y + 85, `Owned: ${storeManager.getPowerUpCount(type)}/3`, {
            fontSize: '14px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Buy button
        const canPurchase = storeManager.canPurchase(type);
        const maxReached = storeManager.getPowerUpCount(type) >= 3;
        
        let buttonColor = canPurchase ? 0x2ED573 : 0xFF4757;
        let buttonText = maxReached ? 'MAX' : 'BUY';
        
        if (maxReached) {
            buttonColor = 0x57606F;
        }
        
        const buyButton = this.add.rectangle(x, y + 110, 120, 35, buttonColor);
        buyButton.setStrokeStyle(2, 0x4F9DFF);
        
        const buyButtonText = this.add.text(x, y + 110, buttonText, {
            fontSize: '16px',
            fill: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        if (canPurchase && !maxReached) {
            buyButton.setInteractive();
            buyButton.on('pointerdown', () => {
                if (storeManager.purchasePowerUp(type)) {
                    window.GameData.audioManager.playButtonClick();
                    this.updateStoreDisplay();
                }
            });
            
            buyButton.on('pointerover', () => buyButton.setScale(1.05));
            buyButton.on('pointerout', () => buyButton.setScale(1.0));
        }
    }
    
    updateStoreDisplay() {
        // Clear and recreate store items
        this.children.list.forEach(child => {
            if (child.x >= 150 && child.x <= 650 && child.y >= 200 && child.y <= 350) {
                child.destroy();
            }
        });
        
        this.createStoreItems();
        this.coinText.setText(window.GameData.storeManager.totalCoins.toString());
    }
}