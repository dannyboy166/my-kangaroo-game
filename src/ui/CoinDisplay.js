import { UI_THEME } from '../config/UITheme.js';

/**
 * Reusable CoinDisplay component for showing coin count with icon
 * Used in MenuScene, GameOverScene, StoreScene
 */
export default class CoinDisplay extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene - The scene this display belongs to
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} [config] - Display configuration
     * @param {number} [config.iconScale=0.6] - Scale for the coin icon
     * @param {number} [config.fontSize='24px'] - Font size for the count
     * @param {number} [config.gap=30] - Gap between icon and text
     * @param {boolean} [config.addToScene=true] - Whether to auto-add to scene
     */
    constructor(scene, x, y, config = {}) {
        super(scene, x, y);

        this.scene = scene;
        this.config = {
            iconScale: 0.6,
            fontSize: '24px',
            gap: 30,
            addToScene: true,
            ...config
        };

        this.createDisplay();

        if (this.config.addToScene) {
            scene.add.existing(this);
        }
    }

    createDisplay() {
        const { iconScale, fontSize, gap } = this.config;

        // Coin icon
        this.icon = this.scene.add.image(0, 0, 'ui_coin');
        this.icon.setScale(iconScale);
        this.icon.setOrigin(0.5, 0.5);
        this.add(this.icon);

        // Coin count text - use UITheme coinCount style with optional fontSize override
        const textStyle = {
            ...UI_THEME.textStyles.coinCount,
            fontSize: fontSize
        };
        this.text = this.scene.add.text(gap, 0, '0', textStyle);
        this.text.setOrigin(0, 0.5);
        this.add(this.text);
    }

    /**
     * Update the displayed coin count
     * @param {number} count - New coin count to display
     */
    setCount(count) {
        this.text.setText(`${count}`);
    }

    /**
     * Get the current displayed count
     * @returns {string} The current count text
     */
    getCount() {
        return this.text.text;
    }
}
