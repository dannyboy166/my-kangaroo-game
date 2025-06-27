// Import scenes
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import StoreScene from './scenes/StoreScene.js';

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false // Disable debug mode to hide collision boxes
        }
    },
    scene: [
        MenuScene,
        GameScene,
        GameOverScene,
        StoreScene
    ]
};

// Create and start the game
const game = new Phaser.Game(config);

console.log('🦘 Kangaroo Hop game initialized!');