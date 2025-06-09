export default class StoreManager {
    constructor() {
        this.totalCoins = parseInt(localStorage.getItem('kangaroo_hop_total_coins')) || 0;
        this.doubleJumpCount = parseInt(localStorage.getItem('kangaroo_hop_double_jump')) || 0;
        this.shieldCount = parseInt(localStorage.getItem('kangaroo_hop_shield')) || 0;
        this.magnetCount = parseInt(localStorage.getItem('kangaroo_hop_magnet')) || 0;
        
        this.prices = {
            doubleJump: 75,
            shield: 100,
            magnet: 50
        };
        
        this.maxItemCount = 3;
    }
    
    saveData() {
        localStorage.setItem('kangaroo_hop_total_coins', this.totalCoins.toString());
        localStorage.setItem('kangaroo_hop_double_jump', this.doubleJumpCount.toString());
        localStorage.setItem('kangaroo_hop_shield', this.shieldCount.toString());
        localStorage.setItem('kangaroo_hop_magnet', this.magnetCount.toString());
    }
    
    addCoins(amount) {
        this.totalCoins += amount;
        this.saveData();
    }
    
    canPurchase(type) {
        const price = this.prices[type];
        const count = this.getPowerUpCount(type);
        return this.totalCoins >= price && count < this.maxItemCount;
    }
    
    purchasePowerUp(type) {
        if (!this.canPurchase(type)) return false;
        
        const price = this.prices[type];
        this.totalCoins -= price;
        
        switch (type) {
            case 'doubleJump':
                this.doubleJumpCount++;
                break;
            case 'shield':
                this.shieldCount++;
                break;
            case 'magnet':
                this.magnetCount++;
                break;
        }
        
        this.saveData();
        return true;
    }
    
    usePowerUp(type) {
        switch (type) {
            case 'doubleJump':
                if (this.doubleJumpCount > 0) {
                    this.doubleJumpCount--;
                    this.saveData();
                    return true;
                }
                break;
            case 'shield':
                if (this.shieldCount > 0) {
                    this.shieldCount--;
                    this.saveData();
                    return true;
                }
                break;
            case 'magnet':
                if (this.magnetCount > 0) {
                    this.magnetCount--;
                    this.saveData();
                    return true;
                }
                break;
        }
        return false;
    }
    
    getPowerUpCount(type) {
        switch (type) {
            case 'doubleJump':
                return this.doubleJumpCount;
            case 'shield':
                return this.shieldCount;
            case 'magnet':
                return this.magnetCount;
            default:
                return 0;
        }
    }
    
    getPowerUpPrice(type) {
        return this.prices[type] || 0;
    }
    
    getPowerUpName(type) {
        const names = {
            doubleJump: 'Double Jump',
            shield: 'Shield',
            magnet: 'Coin Magnet'
        };
        return names[type] || type;
    }
    
    getPowerUpDescription(type) {
        const descriptions = {
            doubleJump: 'Jump twice in the air!\nLasts 10 seconds',
            shield: 'Protects from one hit!\nLasts 8 seconds',
            magnet: 'Attracts nearby coins!\nLasts 10 seconds'
        };
        return descriptions[type] || '';
    }
}