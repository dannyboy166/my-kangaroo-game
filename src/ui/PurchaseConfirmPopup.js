export default class PurchaseConfirmPopup extends Phaser.GameObjects.Container {
    constructor(scene, itemType, itemPrice, onConfirm, onCancel) {
        super(scene);
        this.scene = scene;
        this.itemType = itemType;
        this.itemPrice = itemPrice;
        this.onConfirm = onConfirm;
        this.onCancel = onCancel;
        
        // Item display info
        this.itemInfo = {
            doubleJump: { name: 'Double Jump', emoji: '🦘', description: 'Jump twice in mid-air!' },
            shield: { name: 'Shield', emoji: '🛡️', description: 'Protect from one hit!' },
            magnet: { name: 'Coin Magnet', emoji: '🧲', description: 'Attract coins automatically!' },
            helmet: { name: 'Safety Helmet', emoji: '🪖', description: 'Reduce koala collision damage!' }
        };

        this.createPopup();
        this.animateIn();
    }

    createPopup() {
        // Semi-transparent backdrop
        this.backdrop = this.scene.add.graphics();
        this.backdrop.fillStyle(0x000000, 0.7);
        this.backdrop.fillRect(-400, -300, 800, 600);
        this.backdrop.setInteractive(new Phaser.Geom.Rectangle(-400, -300, 800, 600), Phaser.Geom.Rectangle.Contains);
        this.add(this.backdrop);

        // Popup background
        this.popupBg = this.scene.add.graphics();
        this.popupBg.fillStyle(0x2C3E50, 1);
        this.popupBg.fillRoundedRect(-200, -140, 400, 280, 15);
        
        // Border
        this.popupBg.lineStyle(2, 0x3498DB, 1);
        this.popupBg.strokeRoundedRect(-200, -140, 400, 280, 15);
        this.add(this.popupBg);

        // Inner glow
        const innerGlow = this.scene.add.graphics();
        innerGlow.fillStyle(0x3498DB, 0.1);
        innerGlow.fillRoundedRect(-195, -135, 390, 270, 12);
        this.add(innerGlow);

        // Title
        this.titleText = this.scene.add.text(0, -110, 'CONFIRM PURCHASE', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#E74C3C',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add(this.titleText);

        // Get item info
        const info = this.itemInfo[this.itemType] || this.itemInfo.doubleJump;

        // Item info
        this.itemText = this.scene.add.text(0, -60, `${info.emoji} ${info.name}`, {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ECF0F1',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add(this.itemText);

        this.descText = this.scene.add.text(0, -30, info.description, {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#BDC3C7',
            align: 'center'
        }).setOrigin(0.5);
        this.add(this.descText);

        // Price display
        this.priceText = this.scene.add.text(0, 10, `Cost: ${this.itemPrice} coins 🪙`, {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#F39C12',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add(this.priceText);

        // Cancel button
        this.cancelBtn = this.scene.add.graphics();
        this.cancelBtn.fillStyle(0xE74C3C, 1);
        this.cancelBtn.fillRoundedRect(-160, 70, 120, 40, 8);
        this.cancelBtn.lineStyle(2, 0xC0392B, 1);
        this.cancelBtn.strokeRoundedRect(-160, 70, 120, 40, 8);
        this.add(this.cancelBtn);

        this.cancelBtnText = this.scene.add.text(-100, 90, 'CANCEL', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add(this.cancelBtnText);

        // Confirm button
        this.confirmBtn = this.scene.add.graphics();
        this.confirmBtn.fillStyle(0x27AE60, 1);
        this.confirmBtn.fillRoundedRect(40, 70, 120, 40, 8);
        this.confirmBtn.lineStyle(2, 0x2ECC71, 1);
        this.confirmBtn.strokeRoundedRect(40, 70, 120, 40, 8);
        this.add(this.confirmBtn);

        this.confirmBtnText = this.scene.add.text(100, 90, 'BUY IT!', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add(this.confirmBtnText);

        // Make buttons interactive
        this.setupButtonInteractions();

        // Position and depth
        this.setPosition(400, 300);
        this.setDepth(2000);
        this.setSize(800, 600);
    }

    setupButtonInteractions() {
        // Cancel button
        const cancelBounds = new Phaser.Geom.Rectangle(-160, 70, 120, 40);
        this.cancelBtn.setInteractive(cancelBounds, Phaser.Geom.Rectangle.Contains);
        
        this.cancelBtn.on('pointerdown', () => {
            this.close();
            if (this.onCancel) this.onCancel();
        });

        this.cancelBtn.on('pointerover', () => {
            this.cancelBtn.clear();
            this.cancelBtn.fillStyle(0xC0392B, 1);
            this.cancelBtn.fillRoundedRect(-160, 70, 120, 40, 8);
            this.cancelBtn.lineStyle(2, 0xE74C3C, 1);
            this.cancelBtn.strokeRoundedRect(-160, 70, 120, 40, 8);
            this.cancelBtn.setScale(1.05);
            this.cancelBtnText.setScale(1.05);
        });

        this.cancelBtn.on('pointerout', () => {
            this.cancelBtn.clear();
            this.cancelBtn.fillStyle(0xE74C3C, 1);
            this.cancelBtn.fillRoundedRect(-160, 70, 120, 40, 8);
            this.cancelBtn.lineStyle(2, 0xC0392B, 1);
            this.cancelBtn.strokeRoundedRect(-160, 70, 120, 40, 8);
            this.cancelBtn.setScale(1);
            this.cancelBtnText.setScale(1);
        });

        // Confirm button
        const confirmBounds = new Phaser.Geom.Rectangle(40, 70, 120, 40);
        this.confirmBtn.setInteractive(confirmBounds, Phaser.Geom.Rectangle.Contains);
        
        this.confirmBtn.on('pointerdown', () => {
            this.close();
            if (this.onConfirm) this.onConfirm();
        });

        this.confirmBtn.on('pointerover', () => {
            this.confirmBtn.clear();
            this.confirmBtn.fillStyle(0x2ECC71, 1);
            this.confirmBtn.fillRoundedRect(40, 70, 120, 40, 8);
            this.confirmBtn.lineStyle(2, 0x27AE60, 1);
            this.confirmBtn.strokeRoundedRect(40, 70, 120, 40, 8);
            this.confirmBtn.setScale(1.05);
            this.confirmBtnText.setScale(1.05);
        });

        this.confirmBtn.on('pointerout', () => {
            this.confirmBtn.clear();
            this.confirmBtn.fillStyle(0x27AE60, 1);
            this.confirmBtn.fillRoundedRect(40, 70, 120, 40, 8);
            this.confirmBtn.lineStyle(2, 0x2ECC71, 1);
            this.confirmBtn.strokeRoundedRect(40, 70, 120, 40, 8);
            this.confirmBtn.setScale(1);
            this.confirmBtnText.setScale(1);
        });
    }

    animateIn() {
        this.setScale(0);
        this.setAlpha(0);

        this.scene.tweens.add({
            targets: this,
            scaleX: 1,
            scaleY: 1,
            alpha: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });
    }

    close() {
        this.scene.tweens.killTweensOf(this);
        
        this.scene.tweens.add({
            targets: this,
            scaleX: 0,
            scaleY: 0,
            alpha: 0,
            duration: 300,
            ease: 'Back.easeIn',
            onComplete: () => {
                this.removeAll(true);
                this.destroy();
            }
        });
    }

    destroy() {
        this.scene.tweens.killTweensOf(this);
        this.removeAll(true);
        super.destroy();
    }
}