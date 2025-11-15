import { DEFAULT_THEME } from '../config/BackgroundConfig.js';

export default class GameDataManager {
    constructor() {
        this.coins = this.loadCoins();
        this.highScore = this.loadHighScore();
        this.backgroundTheme = this.loadBackgroundTheme();
        this.saveTimer = null;
    }

    // Coin management
    loadCoins() {
        const saved = localStorage.getItem('kangaroo_coins');
        return saved ? parseInt(saved) : 0;
    }

    saveCoins() {
        localStorage.setItem('kangaroo_coins', this.coins.toString());
    }

    addCoins(amount) {
        this.coins += amount;
        // Debounce saving to reduce localStorage writes
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
        }
        this.saveTimer = setTimeout(() => {
            this.saveCoins();
        }, 100);
    }

    spendCoins(amount) {
        if (this.coins >= amount) {
            this.coins -= amount;
            this.saveCoins();
            return true;
        }
        return false;
    }

    getCoins() {
        return this.coins;
    }

    // High score management
    loadHighScore() {
        const saved = localStorage.getItem('kangaroo_highscore');
        return saved ? parseInt(saved) : 0;
    }

    saveHighScore() {
        localStorage.setItem('kangaroo_highscore', this.highScore.toString());
    }

    updateHighScore(score) {
        if (score > this.highScore) {
            this.highScore = score;
            this.saveHighScore();
            return true; // New high score achieved
        }
        return false;
    }

    getHighScore() {
        return this.highScore;
    }

    // Background theme management
    loadBackgroundTheme() {
        const saved = localStorage.getItem('kangaroo_background_theme');
        return saved || DEFAULT_THEME;
    }

    saveBackgroundTheme() {
        localStorage.setItem('kangaroo_background_theme', this.backgroundTheme);
    }

    setBackgroundTheme(themeId) {
        this.backgroundTheme = themeId;
        this.saveBackgroundTheme();
    }

    getBackgroundTheme() {
        return this.backgroundTheme;
    }

    // Global instance
    static instance = null;

    static getInstance() {
        if (!GameDataManager.instance) {
            GameDataManager.instance = new GameDataManager();
        }
        return GameDataManager.instance;
    }
}