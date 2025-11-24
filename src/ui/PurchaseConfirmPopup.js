import Button from './Button.js';

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
        this.panelBg.setScale(0.5);
        this.add(this.panelBg);

        // ========================================
        // TITLE - moved up 50px, 2x bigger
        // ========================================
        this.titleText = this.scene.add.text(0, -155, 'CONFIRM PURCHASE', {
            fontSize: '32px',
            fontFamily: 'Carter One',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.add(this.titleText);

        // ========================================
        // ITEM INFO CONTAINER - groups icon + name (moved up 100px)
        // ========================================
        const info = this.itemInfo[this.itemType] || this.itemInfo.doubleJump;

        // Create text first to measure width for centering
        this.itemText = this.scene.add.text(0, 0, info.name, {
            fontSize: '24px',
            fontFamily: 'Carter One',
            color: '#000000',
            stroke: '#FFFFFF',
            strokeThickness: 1
        }).setOrigin(0, 0.5);

        // Calculate centering: icon (44px visual size at scale 2) + gap (10px) + text width
        const iconWidth = 40; // powerup sprite visual width (actual 64px but with padding)
        const gap = 10;
        const totalWidth = iconWidth + gap + this.itemText.width;
        const startX = -totalWidth / 2;

        this.itemContainer = this.scene.add.container(0, -80);

        // Item icon sprite (animated powerup or static helmet)
        if (info.anim) {
            this.itemSprite = this.scene.add.sprite(startX + iconWidth / 2, 0, 'powerup_items', 0);
            this.itemSprite.play(info.anim);
            this.itemSprite.setScale(2);
        } else if (info.staticTexture) {
            this.itemSprite = this.scene.add.sprite(startX + iconWidth / 2, 0, info.staticTexture);
            this.itemSprite.setScale(0.5);
        }

        // Position text after icon
        this.itemText.setX(startX + iconWidth + gap);

        this.itemContainer.add([this.itemSprite, this.itemText]);
        this.add(this.itemContainer);

        // ========================================
        // DESCRIPTION - moved up 100px
        // ========================================
        this.descText = this.scene.add.text(0, -25, info.description, {
            fontSize: '18px',
            fontFamily: 'Carter One',
            color: '#333333',
            align: 'center'
        }).setOrigin(0.5);
        this.add(this.descText);

        // ========================================
        // PRICE CONTAINER - groups price text + coin animation (centered)
        // ========================================
        this.priceContainer = this.scene.add.container(0, 20);

        this.priceText = this.scene.add.text(-20, 0, `${this.itemPrice}`, {
            fontSize: '28px',
            fontFamily: 'Carter One',
            color: '#000000'
        }).setOrigin(0.5);

        this.coinSprite = this.scene.add.sprite(25, 0, 'coin', 0);
        this.coinSprite.play('coin_spin');
        this.coinSprite.setScale(0.45);

        this.priceContainer.add([this.priceText, this.coinSprite]);
        this.add(this.priceContainer);

        // ========================================
        // CANCEL BUTTON
        // ========================================
        this.cancelBtn = new Button(this.scene, -90, 110, {
            text: 'CANCEL',
            bgKey: 'btn2_red',
            bgScale: 0.45,
            textStyle: { fontSize: '18px' },
            textOffsetY: -3,
            addToScene: false,
            onClick: () => {
                this.close();
                if (this.onCancel) this.onCancel();
            }
        });
        this.add(this.cancelBtn);

        // ========================================
        // CONFIRM BUTTON
        // ========================================
        this.confirmBtn = new Button(this.scene, 90, 110, {
            text: 'BUY IT!',
            bgKey: 'btn_little_green',
            bgScale: 0.55,
            textStyle: { fontSize: '18px' },
            textOffsetY: -3,
            addToScene: false,
            onClick: () => {
                this.close();
                if (this.onConfirm) this.onConfirm();
            }
        });
        this.add(this.confirmBtn);

        // Position and depth
        this.setPosition(400, 300);
        this.setDepth(2000);
        this.setSize(800, 600);
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
