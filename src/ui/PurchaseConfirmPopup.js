export default class PurchaseConfirmPopup extends Phaser.GameObjects.Container {
    constructor(scene, itemType, itemPrice, onConfirm, onCancel) {
        super(scene);
        this.scene = scene;
        this.itemType = itemType;
        this.itemPrice = itemPrice;
        this.onConfirm = onConfirm;
        this.onCancel = onCancel;

        // Item display info (animations mapped to powerup types)
        this.itemInfo = {
            doubleJump: { name: 'Double Jump', anim: 'powerup_star', description: 'Jump twice in mid-air!' },
            shield: { name: 'Shield', anim: 'powerup_heart', description: 'Protect from one hit!' },
            magnet: { name: 'Coin Magnet', anim: 'powerup_green_gem', description: 'Attract coins automatically!' },
            helmet: { name: 'Zip Tie Helmet', staticTexture: 'helmet', description: 'Blocks magpie swoops!' }
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

        // Use panel_small (back_small.png) as background
        this.panelBg = this.scene.add.image(0, 0, 'panel_small');
        this.panelBg.setScale(0.6);
        this.add(this.panelBg);

        // Title text in the purple header area
        this.titleText = this.scene.add.text(0, -145, 'CONFIRM PURCHASE', {
            fontSize: '20px',
            fontFamily: 'Carter One',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.add(this.titleText);

        // Get item info
        const info = this.itemInfo[this.itemType] || this.itemInfo.doubleJump;

        // Item icon sprite (animated powerup or static helmet)
        if (info.anim) {
            this.itemSprite = this.scene.add.sprite(-80, -35, 'powerup_items', 0);
            this.itemSprite.play(info.anim);
            this.itemSprite.setScale(2);
        } else if (info.staticTexture) {
            this.itemSprite = this.scene.add.sprite(-80, -35, info.staticTexture);
            this.itemSprite.setScale(0.5);
        }
        this.add(this.itemSprite);

        // Item name text - black for light background
        this.itemText = this.scene.add.text(-40, -35, info.name, {
            fontSize: '18px',
            fontFamily: 'Carter One',
            color: '#000000'
        }).setOrigin(0, 0.5);
        this.add(this.itemText);

        // Description text
        this.descText = this.scene.add.text(0, 5, info.description, {
            fontSize: '14px',
            fontFamily: 'Carter One',
            color: '#333333',
            align: 'center'
        }).setOrigin(0.5);
        this.add(this.descText);

        // Price display with coin
        this.priceText = this.scene.add.text(20, 40, `${this.itemPrice}`, {
            fontSize: '18px',
            fontFamily: 'Carter One',
            color: '#000000'
        }).setOrigin(0.5);
        this.add(this.priceText);

        // Coin icon next to price
        this.coinSprite = this.scene.add.sprite(55, 40, 'coin', 0);
        this.coinSprite.play('coin_spin');
        this.coinSprite.setScale(0.35);
        this.add(this.coinSprite);

        // Cancel button (red) - using btn2_red
        this.cancelBtnContainer = this.scene.add.container(-90, 110);
        this.cancelBtnBg = this.scene.add.image(0, 0, 'btn2_red');
        this.cancelBtnBg.setScale(0.45);
        this.cancelBtnText = this.scene.add.text(0, -3, 'CANCEL', {
            fontSize: '16px',
            fontFamily: 'Carter One',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.cancelBtnContainer.add([this.cancelBtnBg, this.cancelBtnText]);
        this.add(this.cancelBtnContainer);

        // Confirm button (green) - using btn_little_green
        this.confirmBtnContainer = this.scene.add.container(90, 110);
        this.confirmBtnBg = this.scene.add.image(0, 0, 'btn_little_green');
        this.confirmBtnBg.setScale(0.55);
        this.confirmBtnText = this.scene.add.text(0, -3, 'BUY IT!', {
            fontSize: '16px',
            fontFamily: 'Carter One',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.confirmBtnContainer.add([this.confirmBtnBg, this.confirmBtnText]);
        this.add(this.confirmBtnContainer);

        // Make buttons interactive
        this.setupButtonInteractions();

        // Position and depth
        this.setPosition(400, 300);
        this.setDepth(2000);
        this.setSize(800, 600);
    }

    setupButtonInteractions() {
        // Cancel button
        this.cancelBtnBg.setInteractive({ useHandCursor: true });

        this.cancelBtnBg.on('pointerdown', () => {
            this.close();
            if (this.onCancel) this.onCancel();
        });

        this.cancelBtnBg.on('pointerover', () => {
            this.cancelBtnContainer.setScale(1.1);
        });

        this.cancelBtnBg.on('pointerout', () => {
            this.cancelBtnContainer.setScale(1);
        });

        // Confirm button
        this.confirmBtnBg.setInteractive({ useHandCursor: true });

        this.confirmBtnBg.on('pointerdown', () => {
            this.close();
            if (this.onConfirm) this.onConfirm();
        });

        this.confirmBtnBg.on('pointerover', () => {
            this.confirmBtnContainer.setScale(1.1);
        });

        this.confirmBtnBg.on('pointerout', () => {
            this.confirmBtnContainer.setScale(1);
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
