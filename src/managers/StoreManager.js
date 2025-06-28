export default class StoreManager {
    constructor() {
        this.totalCoins = parseInt(localStorage.getItem('kangaroo_hop_total_coins')) || 0;
        this.doubleJumpCount = parseInt(localStorage.getItem('kangaroo_hop_double_jump')) || 0;
        this.shieldCount = parseInt(localStorage.getItem('kangaroo_hop_shield')) || 0;
        this.magnetCount = parseInt(localStorage.getItem('kangaroo_hop_magnet')) || 0;
        this.helmetCount = parseInt(localStorage.getItem('kangaroo_hop_helmet')) || 0;
        
        this.prices = {
            doubleJump: 20,
            shield: 40,
            magnet: 30,
            helmet: 100
        };
        
        this.maxItemCount = 3;
        this.maxHelmetCount = 1; // Only one helmet can be owned at a time
    }
    
    saveData() {
        localStorage.setItem('kangaroo_hop_total_coins', this.totalCoins.toString());
        localStorage.setItem('kangaroo_hop_double_jump', this.doubleJumpCount.toString());
        localStorage.setItem('kangaroo_hop_shield', this.shieldCount.toString());
        localStorage.setItem('kangaroo_hop_magnet', this.magnetCount.toString());
        localStorage.setItem('kangaroo_hop_helmet', this.helmetCount.toString());
    }
    
    addCoins(amount) {
        this.totalCoins += amount;
        this.saveData();
    }
    
    canPurchase(type) {
        const price = this.prices[type];
        const count = this.getPowerUpCount(type);
        const maxCount = type === 'helmet' ? this.maxHelmetCount : this.maxItemCount;
        return this.totalCoins >= price && count < maxCount;
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
            case 'helmet':
                this.helmetCount++;
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
            case 'helmet':
                if (this.helmetCount > 0) {
                    this.helmetCount--;
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
            case 'helmet':
                return this.helmetCount;
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
            magnet: 'Coin Magnet',
            helmet: 'Zip Tie Helmet'
        };
        return names[type] || type;
    }
    
    getPowerUpDescription(type) {
        const descriptions = {
            doubleJump: 'Jump twice in the air!\nLasts 10 seconds',
            shield: 'Protects from one hit!\nLasts 10 seconds',
            magnet: 'Attracts nearby coins!\nLasts 10 seconds',
            helmet: 'Protects from magpie swoops!\nLasts one game'
        };
        return descriptions[type] || '';
    }
}