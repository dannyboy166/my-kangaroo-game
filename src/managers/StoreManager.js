/**
 * StoreManager
 * Manages powerup inventory and purchases
 * Uses object mapping instead of switch statements for cleaner code
 * Coins are managed by GameDataManager (no duplication)
 */
export default class StoreManager {
    constructor() {
        // Powerup inventory with unified structure
        this.powerups = {
            doubleJump: {
                count: this.loadCount('kangaroo_hop_double_jump'),
                price: 50,
                name: 'Double Jump',
                description: 'Jump twice in the air!\nLasts 10 seconds',
                maxCount: 3
            },
            shield: {
                count: this.loadCount('kangaroo_hop_shield'),
                price: 50,
                name: 'Shield',
                description: 'Protects from one hit!\nLasts 10 seconds',
                maxCount: 3
            },
            magnet: {
                count: this.loadCount('kangaroo_hop_magnet'),
                price: 50,
                name: 'Coin Magnet',
                description: 'Attracts nearby coins!\nLasts 10 seconds',
                maxCount: 3
            },
            helmet: {
                count: this.loadCount('kangaroo_hop_helmet'),
                price: 100,
                name: 'Magpie Helmet',
                description: 'Protects from magpie swoops!\nLasts one game',
                maxCount: 1
            }
        };
    }

    /**
     * Load powerup count from localStorage
     */
    loadCount(key) {
        return parseInt(localStorage.getItem(key)) || 0;
    }

    /**
     * Save all powerup counts to localStorage
     */
    saveData() {
        Object.entries(this.powerups).forEach(([type, data]) => {
            const key = this.getStorageKey(type);
            localStorage.setItem(key, data.count.toString());
        });
    }

    /**
     * Get localStorage key for powerup type
     */
    getStorageKey(type) {
        const keys = {
            doubleJump: 'kangaroo_hop_double_jump',
            shield: 'kangaroo_hop_shield',
            magnet: 'kangaroo_hop_magnet',
            helmet: 'kangaroo_hop_helmet'
        };
        return keys[type];
    }

    /**
     * Use a powerup (decrement count)
     */
    usePowerUp(type) {
        const powerup = this.powerups[type];
        if (!powerup || powerup.count <= 0) return false;

        powerup.count--;
        this.saveData();
        return true;
    }

    /**
     * Get powerup count
     */
    getPowerUpCount(type) {
        return this.powerups[type]?.count || 0;
    }

    /**
     * Get powerup price
     */
    getPowerUpPrice(type) {
        return this.powerups[type]?.price || 0;
    }

    /**
     * Get powerup name
     */
    getPowerUpName(type) {
        return this.powerups[type]?.name || type;
    }

    /**
     * Get powerup description
     */
    getPowerUpDescription(type) {
        return this.powerups[type]?.description || '';
    }

    /**
     * Add a powerup to inventory
     */
    addPowerUp(type) {
        const powerup = this.powerups[type];
        if (!powerup) return false;

        powerup.count++;
        this.saveData();
        return true;
    }
}
