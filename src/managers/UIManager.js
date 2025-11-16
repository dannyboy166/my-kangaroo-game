import { GAME_CONFIG } from '../config/GameConfig.js';

/**
 * UIManager
 * Handles all UI elements including score, coins, inventory, and powerup displays
 */
export default class UIManager {
    /**
     * @param {Phaser.Scene} scene - The game scene
     * @param {GameDataManager} gameDataManager - Game data manager
     * @param {StoreManager} storeManager - Store manager
     */
    constructor(scene, gameDataManager, storeManager) {
        this.scene = scene;
        this.gameDataManager = gameDataManager;
        this.storeManager = storeManager;

        // Text elements
        this.scoreText = null;
        this.coinText = null;

        // Inventory UI
        this.shieldIcon = null;
        this.shieldCount = null;
        this.magnetIcon = null;
        this.magnetCount = null;
        this.doubleIcon = null;
        this.doubleCount = null;

        // Powerup progress bars
        this.activeBars = null;
    }

    /**
     * Create all UI elements
     */
    create() {
        this.createScoreDisplay();
        this.createCoinDisplay();
        this.createInventoryDisplay();
        this.createPowerupDisplay();
    }

    /**
     * Create score display
     */
    createScoreDisplay() {
        const config = GAME_CONFIG.UI;
        this.scoreText = this.scene.add.text(config.SCORE_X, config.SCORE_Y, 'Score: 0', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.scoreText.setScrollFactor(0); // Fix to camera
        this.scoreText.setDepth(1000); // Always on top
    }

    /**
     * Create coin display
     */
    createCoinDisplay() {
        const config = GAME_CONFIG.UI;

        // Coin icon (animated)
        const coinIcon = this.scene.add.sprite(config.COIN_ICON_X, config.COIN_ICON_Y, 'coin', 0);
        coinIcon.play('coin_spin');
        coinIcon.setScale(config.COIN_ICON_SCALE);
        coinIcon.setOrigin(0, 0.5);
        coinIcon.setScrollFactor(0); // Fix to camera
        coinIcon.setDepth(1000);

        // Coin text
        this.coinText = this.scene.add.text(
            config.COIN_TEXT_X,
            config.COIN_ICON_Y,
            `${this.gameDataManager.getCoins()}`,
            {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#FFD700',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        this.coinText.setOrigin(0, 0.5);
        this.coinText.setScrollFactor(0); // Fix to camera
        this.coinText.setDepth(1000);
    }

    /**
     * Create inventory display (powerup counts)
     */
    createInventoryDisplay() {
        const config = GAME_CONFIG.UI;
        const startY = config.INVENTORY_START_Y;
        const spacing = config.INVENTORY_SPACING;

        // Shield
        this.shieldIcon = this.scene.add.image(30, startY, 'shield');
        this.shieldIcon.setScale(0.15);
        this.shieldIcon.setOrigin(0.1, 0.5);
        this.shieldIcon.setScrollFactor(0);
        this.shieldIcon.setDepth(1000);

        this.shieldCount = this.scene.add.text(55, startY, '0', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#00FF00',
            stroke: '#000000',
            strokeThickness: 2,
            fontStyle: 'bold'
        });
        this.shieldCount.setOrigin(0, 0.5);
        this.shieldCount.setScrollFactor(0);
        this.shieldCount.setDepth(1000);

        // Magnet
        this.magnetIcon = this.scene.add.image(30, startY + spacing, 'magnet');
        this.magnetIcon.setScale(0.12);
        this.magnetIcon.setOrigin(0, 0.5);
        this.magnetIcon.setScrollFactor(0);
        this.magnetIcon.setDepth(1000);

        this.magnetCount = this.scene.add.text(55, startY + spacing, '0', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#FF00FF',
            stroke: '#000000',
            strokeThickness: 2,
            fontStyle: 'bold'
        });
        this.magnetCount.setOrigin(0, 0.5);
        this.magnetCount.setScrollFactor(0);
        this.magnetCount.setDepth(1000);

        // Double Jump
        this.doubleIcon = this.scene.add.image(30, startY + (spacing * 2), 'double');
        this.doubleIcon.setScale(0.15);
        this.doubleIcon.setOrigin(0.1, 0.5);
        this.doubleIcon.setScrollFactor(0);
        this.doubleIcon.setDepth(1000);

        this.doubleCount = this.scene.add.text(55, startY + (spacing * 2), '0', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#00FFFF',
            stroke: '#000000',
            strokeThickness: 2,
            fontStyle: 'bold'
        });
        this.doubleCount.setOrigin(0, 0.5);
        this.doubleCount.setScrollFactor(0);
        this.doubleCount.setDepth(1000);

        // Update initial counts
        this.updateInventoryDisplay();
    }

    /**
     * Create powerup progress bars display
     */
    createPowerupDisplay() {
        const config = GAME_CONFIG.UI;
        const startY = config.POWERUP_BAR_START_Y;
        const spacing = config.POWERUP_BAR_SPACING;

        this.activeBars = {
            shield: this.createProgressBar(config.POWERUP_BAR_X, startY, '#00FF00'),
            magnet: this.createProgressBar(config.POWERUP_BAR_X, startY + spacing, '#FF00FF'),
            double: this.createProgressBar(config.POWERUP_BAR_X, startY + (spacing * 2), '#00FFFF')
        };

        // Initially hide all bars
        Object.values(this.activeBars).forEach(bar => {
            bar.container.setVisible(false);
        });
    }

    /**
     * Create a single progress bar
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} color - Bar color (hex string)
     * @returns {Object} Progress bar components
     */
    createProgressBar(x, y, color) {
        const container = this.scene.add.container(x, y);
        container.setScrollFactor(0); // Fix to camera
        container.setDepth(1000);

        // Background bar
        const bgBar = this.scene.add.graphics();
        bgBar.fillStyle(0x333333, 0.8);
        bgBar.fillRoundedRect(0, 0, 120, 8, 4);
        container.add(bgBar);

        // Progress fill
        const fillBar = this.scene.add.graphics();
        container.add(fillBar);

        // Time text
        const timeText = this.scene.add.text(130, 4, '', {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: color,
            fontStyle: 'bold'
        });
        timeText.setOrigin(0, 0.5);
        container.add(timeText);

        return {
            container: container,
            bgBar: bgBar,
            fillBar: fillBar,
            timeText: timeText,
            color: color
        };
    }

    /**
     * Update score display
     * @param {number} score - Current score
     */
    updateScore(score) {
        this.scoreText.setText('Score: ' + Math.floor(score));
    }

    /**
     * Update coin display
     */
    updateCoins() {
        this.coinText.setText(`${this.gameDataManager.getCoins()}`);
    }

    /**
     * Update inventory display (powerup counts)
     */
    updateInventoryDisplay() {
        const shieldCount = this.storeManager.getPowerUpCount('shield');
        const magnetCount = this.storeManager.getPowerUpCount('magnet');
        const doubleCount = this.storeManager.getPowerUpCount('doubleJump');

        // Update counts
        this.shieldCount.setText(shieldCount.toString());
        this.magnetCount.setText(magnetCount.toString());
        this.doubleCount.setText(doubleCount.toString());

        // Dim icons when count is 0
        this.shieldIcon.setAlpha(shieldCount > 0 ? 1.0 : 0.4);
        this.shieldCount.setAlpha(shieldCount > 0 ? 1.0 : 0.4);

        this.magnetIcon.setAlpha(magnetCount > 0 ? 1.0 : 0.4);
        this.magnetCount.setAlpha(magnetCount > 0 ? 1.0 : 0.4);

        this.doubleIcon.setAlpha(doubleCount > 0 ? 1.0 : 0.4);
        this.doubleCount.setAlpha(doubleCount > 0 ? 1.0 : 0.4);
    }

    /**
     * Update powerup progress bars
     * @param {Object} activePowerups - Active powerup states from PowerupManager
     */
    updatePowerupDisplay(activePowerups) {
        Object.keys(activePowerups).forEach(type => {
            this.updateProgressBar(type, activePowerups[type]);
        });
    }

    /**
     * Update a single progress bar
     * @param {string} type - Powerup type
     * @param {Object} powerup - Powerup state
     */
    updateProgressBar(type, powerup) {
        const bar = this.activeBars[type];
        if (!bar) return;

        if (powerup.active) {
            // Show progress bar
            bar.container.setVisible(true);

            const secondsLeft = Math.ceil(powerup.timeLeft / 1000);
            const maxTime = 10; // All powerups last 10 seconds
            const progress = powerup.timeLeft / (maxTime * 1000);

            // Update progress bar
            bar.fillBar.clear();
            const barColor = secondsLeft <= 3 ? 0xFF0000 : parseInt(bar.color.replace('#', '0x'));
            bar.fillBar.fillStyle(barColor);
            const barWidth = 120 * progress;
            bar.fillBar.fillRoundedRect(0, 0, barWidth, 8, 4);

            // Update time text
            bar.timeText.setText(`${secondsLeft}s`);
        } else {
            // Hide progress bar
            bar.container.setVisible(false);
        }
    }
}
