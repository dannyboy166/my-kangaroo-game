# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm start` - Launches live-server on port 8080
- **Install dependencies**: `npm install`

## Project Architecture

This is a Phaser.js browser-based kangaroo jumping game built with vanilla JavaScript. The entire game logic is contained in a single file architecture:

### Core Structure
- **Entry point**: `index.html` - Loads Phaser from node_modules and the main game script
- **Game logic**: `src/game.js` - Contains all game scenes and configuration
- **Assets**: `assets/` directory exists but currently unused (game uses geometric shapes)

### Game Architecture (src/game.js)
The game uses Phaser's scene-based architecture with two main scenes:

1. **MenuScene**: Start screen with title and interactive start button
2. **GameScene**: Main gameplay loop containing:
   - Player (kangaroo as blue rectangle)
   - Physics-based jumping and collision detection
   - Obstacle spawning system (red rectangles)
   - Coin collection system (yellow circles with animation)
   - Score tracking and UI elements
   - Game over and restart functionality

### Key Game Systems
- **Physics**: Arcade physics with gravity (800), collision detection, and world bounds
- **Input**: Keyboard (spacebar) and mouse/touch controls for jumping
- **Spawning**: Time-based event system for obstacles (2.5s intervals) and coins (1.8s intervals)
- **Collision**: Overlap detection for coin collection and obstacle collision
- **Visual Feedback**: Color changes and tweens for player actions

### Development Notes
- Game uses simple geometric shapes instead of sprites for rapid prototyping
- All game state is managed within scene classes
- No external asset loading required - game runs immediately after npm install
- Console logging extensively used for debugging game events