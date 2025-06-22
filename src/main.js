// src/main.js - Main entry point for Kangaroo Hop

import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import StoreScene from './scenes/StoreScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import AudioManager from './managers/AudioManager.js';
import StoreManager from './managers/StoreManager.js';

// Initialize global game data
window.GameData = {
    score: 0,
    highScore: parseInt(localStorage.getItem('kangaroo_hop_high_score')) || 0,
    audioManager: new AudioManager(),
    storeManager: new StoreManager()
};

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#87CEEB',
    scene: [MenuScene, GameScene, StoreScene, GameOverScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false // Set to true to see collision boxes
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Start the game
console.log('🎯 Starting Kangaroo Hop with Modular Architecture!');
console.log('📁 Using proper file structure with scenes, sprites, and managers');
const game = new Phaser.Game(config);

// Make game instance available globally for debugging
window.game = game;