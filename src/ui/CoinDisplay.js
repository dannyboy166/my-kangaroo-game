import { UI_THEME } from '../config/UITheme.js';

/**
 * Get the appropriate coin icon key based on amount
 * Thresholds: 10, 100, 500
 * @param {number} amount - Coin amount
 * @returns {string} Icon texture key
 */
export function getCoinIconForAmount(amount) {
    if (amount >= 500) return 'ui_coin_4';
    if (amount >= 100) return 'ui_coin_3';
    if (amount >= 10) return 'ui_coin_2';
    return 'ui_coin_1';
}

/**
 * Reusable CoinDisplay component for showing coin count with icon
 * Used in MenuScene, GameOverScene, StoreScene
 *
 * Icon changes dynamically based on coin count:
 * - ui_coin_1: 0-9 coins
 * - ui_coin_2: 10-99 coins
 * - ui_coin_3: 100-499 coins
 * - ui_coin_4: 500+ coins
 *
 * Position defaults to UI_THEME.positions.coinDisplay for consistency across all scenes
 */
export default class CoinDisplay extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene - The scene this display belongs to
     * @param {number} [x] - X position (defaults to UI_THEME.positions.coinDisplay.x)
     * @param {number} [y] - Y position (defaults to UI_THEME.positions.coinDisplay.y)
     * @param {Object} [config] - Display configuration
     * @param {number} [config.iconScale=0.4] - Scale for the coin icon
     * @param {number} [config.fontSize='24px'] - Font size for the count
     * @param {number} [config.baseGap=30] - Base gap between icon and text
     * @param {boolean} [config.addToScene=true] - Whether to auto-add to scene
     */
    constructor(scene, x, y, config = {}) {
        // Use centralized position from UITheme as default
        const pos = UI_THEME.positions.coinDisplay;
        const finalX = x !== undefined ? x : pos.x;
        const finalY = y !== undefined ? y : pos.y;
        super(scene, finalX, finalY);

        this.scene = scene;
        this.config = {
            iconScale: 0.4,  // 128px * 0.4 = 51px display
            fontSize: '24px',
            baseGap: 30,
            addToScene: true,
            ...config
        };

        this.currentCount = 0;
        this.currentIconKey = 'ui_coin_1';

        this.createDisplay();

        if (this.config.addToScene) {
            scene.add.existing(this);
        }
    }

    createDisplay() {
        const { iconScale, fontSize, baseGap } = this.config;

        // Coin icon - starts with smallest
        this.icon = this.scene.add.image(0, 0, 'ui_coin_1');
        this.icon.setScale(iconScale);
        this.icon.setOrigin(0.5, 0.5);
        this.add(this.icon);

        // Coin count text - use UITheme coinCount style with optional fontSize override
        const textStyle = {
            ...UI_THEME.textStyles.coinCount,
            fontSize: fontSize
        };
        this.text = this.scene.add.text(baseGap, 0, '0', textStyle);
        this.text.setOrigin(0, 0.5);
        this.add(this.text);
    }


    /**
     * Update the displayed coin count and icon
     * @param {number} count - New coin count to display
     */
    setCount(count) {
        this.currentCount = count;
        this.text.setText(`${count}`);

        // Update icon based on count using shared helper
        const newIconKey = getCoinIconForAmount(count);
        if (newIconKey !== this.currentIconKey) {
            this.currentIconKey = newIconKey;
            this.icon.setTexture(newIconKey);

            // Adjust text position based on icon size (larger icons need more gap)
            const iconIndex = parseInt(newIconKey.slice(-1));
            const extraGap = (iconIndex - 1) * 4; // 0, 4, 8, 12 extra pixels
            this.text.setX(this.config.baseGap + extraGap);
        }
    }

    /**
     * Get the current displayed count
     * @returns {number} The current count
     */
    getCount() {
        return this.currentCount;
    }
}
