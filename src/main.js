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

    // Performance optimizations
    fps: {
        target: 60,           // Target 60 FPS
        forceSetTimeOut: false // Use requestAnimationFrame for smoothest rendering
    },

    render: {
        pixelArt: false,      // Smoother graphics
        antialias: true,      // Better quality
        roundPixels: false    // Allow sub-pixel rendering for smooth movement
    },

    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false,     // Disabled: Clean gameplay
            fps: 60           // Physics at 60 FPS
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