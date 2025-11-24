import { UI_THEME } from '../config/UITheme.js';

/**
 * Reusable Button component for consistent UI across the game
 * Supports text-only or icon+text buttons with hover effects
 */
export default class Button extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene - The scene this button belongs to
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} config - Button configuration
     * @param {string} config.text - Button text
     * @param {string} config.bgKey - Background image key (e.g., 'btn_green', 'btn_long_yellow')
     * @param {number} [config.bgScale=0.5] - Background scale
     * @param {string} [config.iconKey] - Optional icon image key (e.g., 'icon_ok', 'icon_shop')
     * @param {number} [config.iconScale=0.4] - Icon scale
     * @param {number} [config.iconWidth=30] - Visual width of icon for centering (accounts for padding)
     * @param {number} [config.gap=8] - Gap between icon and text
     * @param {number} [config.textOffsetY=-5] - Vertical offset for content (icon+text)
     * @param {Object} [config.textStyle] - Custom text style overrides
     * @param {Function} [config.onClick] - Click handler
     * @param {boolean} [config.pulse=false] - Enable pulsing animation
     * @param {number} [config.pulseScale=1.05] - Pulse scale amount
     * @param {number} [config.pulseDuration=1500] - Pulse animation duration
     * @param {number} [config.hoverScale=1.1] - Scale on hover
     * @param {boolean} [config.disabled=false] - Whether button is disabled
     * @param {boolean} [config.addToScene=true] - Whether to auto-add to scene (false for popup use)
     */
    constructor(scene, x, y, config) {
        super(scene, x, y);

        this.scene = scene;
        this.config = {
            bgScale: 0.5,
            iconScale: 0.4,
            iconWidth: 30,
            gap: 8,
            textOffsetY: -5,
            textStyle: {},
            pulse: false,
            pulseScale: 1.05,
            pulseDuration: 1500,
            hoverScale: 1.1,
            disabled: false,
            addToScene: true,
            ...config
        };

        this.pulseTween = null;

        this.createButton();

        if (this.config.addToScene) {
            scene.add.existing(this);
        }
    }

    createButton() {
        const { bgKey, bgScale, text, iconKey, iconScale, iconWidth, gap, textOffsetY, textStyle, disabled } = this.config;

        // Background
        this.bg = this.scene.add.image(0, 0, bgKey);
        this.bg.setScale(bgScale);
        this.add(this.bg);

        // Use UITheme button style as default, merge with custom overrides
        const finalTextStyle = { ...UI_THEME.textStyles.button, ...textStyle };

        // Create text first to measure width
        this.text = this.scene.add.text(0, 0, text, finalTextStyle);
        this.text.setOrigin(0, 0.5);

        // Content container for icon + text
        this.content = this.scene.add.container(0, textOffsetY);

        if (iconKey) {
            // Calculate centering: icon + gap + text width
            const totalWidth = iconWidth + gap + this.text.width;
            const startX = -totalWidth / 2;

            // Icon
            this.icon = this.scene.add.image(startX + iconWidth / 2, 0, iconKey);
            this.icon.setScale(iconScale);

            // Position text after icon
            this.text.setX(startX + iconWidth + gap);

            this.content.add([this.icon, this.text]);
        } else {
            // Text only - center it
            this.text.setOrigin(0.5, 0.5);
            this.text.setX(0);
            this.content.add(this.text);
        }

        this.add(this.content);

        // Setup interactivity
        if (!disabled) {
            this.setupInteractivity();
        }

        // Setup pulse animation if enabled
        if (this.config.pulse && !disabled) {
            this.setupPulse();
        }
    }

    setupInteractivity() {
        const { onClick, hoverScale } = this.config;

        this.bg.setInteractive({ useHandCursor: true });

        if (onClick) {
            this.bg.on('pointerdown', onClick);
        }

        this.bg.on('pointerover', () => {
            if (this.pulseTween) {
                this.pulseTween.pause();
            }
            this.setScale(hoverScale);
        });

        this.bg.on('pointerout', () => {
            this.setScale(1);
            if (this.pulseTween) {
                this.pulseTween.resume();
            }
        });
    }

    setupPulse() {
        const { pulseScale, pulseDuration } = this.config;

        this.pulseTween = this.scene.tweens.add({
            targets: this,
            scaleX: pulseScale,
            scaleY: pulseScale,
            duration: pulseDuration,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    /**
     * Update button text
     * @param {string} newText - New text to display
     */
    setText(newText) {
        this.text.setText(newText);

        // Recalculate positions if we have an icon
        if (this.icon) {
            const { iconWidth, gap } = this.config;
            const totalWidth = iconWidth + gap + this.text.width;
            const startX = -totalWidth / 2;

            this.icon.setX(startX + iconWidth / 2);
            this.text.setX(startX + iconWidth + gap);
        }
    }

    /**
     * Enable the button
     */
    enable() {
        this.config.disabled = false;
        this.bg.setInteractive({ useHandCursor: true });
        this.setAlpha(1);
    }

    /**
     * Disable the button
     */
    disable() {
        this.config.disabled = true;
        this.bg.disableInteractive();
        this.setAlpha(0.5);
    }

    /**
     * Clean up the button
     */
    destroy() {
        if (this.pulseTween) {
            this.pulseTween.destroy();
        }
        super.destroy();
    }
}
