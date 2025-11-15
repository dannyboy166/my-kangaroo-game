# 🦘 Kangaroo Hop

A fast-paced endless runner game built with Phaser.js. Jump over obstacles, collect coins, and use powerups to achieve the highest score!

## 🎮 Play Now

[Play Kangaroo Hop](https://dannyboy166.github.io/my-kangaroo-game/) *(Coming soon)*

## ✨ Features

- **Endless Runner Gameplay**: Jump over increasingly difficult obstacles
- **Multiple Obstacle Types**: Rocks, cacti, logs, emus, magpies, and more
- **Powerup System**: Shield, magnet, and double jump abilities
- **Shop System**: Purchase powerups and protective helmet with collected coins
- **Progressive Difficulty**: New obstacles unlock as your score increases
- **Australian Outback Theme**: Unique character and environment designs
- **Mobile-Friendly**: Touch controls supported

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/dannyboy166/my-kangaroo-game.git

# Navigate to project directory
cd my-kangaroo-game

# Install dependencies
npm install

# Start development server
npm start
```

The game will open automatically in your default browser at `http://localhost:8080`

## 🎯 How to Play

### Controls
- **Space Bar** / **Up Arrow** / **Click/Tap**: Jump
- **Keys 1, 2, 3**: Activate purchased powerups (during gameplay)

### Objective
- Jump over obstacles to avoid game over
- Collect coins to purchase powerups in the shop
- Survive as long as possible to achieve a high score

### Powerups
- **Shield** (Green): Protects from one collision
- **Magnet** (Purple): Attracts nearby coins automatically
- **Double Jump** (Cyan): Allows mid-air jumping for 10 seconds

### Shop Items
- **Powerups**: 50 coins each (shield, magnet, double jump)
- **Helmet**: 100 coins (protects from magpie attacks for one game)

## 🏗️ Project Structure

```
my-kangaroo-game/
├── assets/              # Game assets (sprites, audio)
├── src/
│   ├── config/          # Game configuration constants
│   ├── managers/        # Game system managers
│   ├── scenes/          # Phaser scenes
│   ├── ui/              # UI components
│   └── main.js          # Game initialization
├── index.html           # Entry point
└── package.json         # Dependencies
```

## 🛠️ Technology Stack

- **Game Engine**: [Phaser 3.90.0](https://phaser.io/)
- **Language**: JavaScript (ES6+ modules)
- **Development Server**: live-server
- **Architecture**: Manager-based modular design

## 📖 Documentation

For detailed development documentation, see [CLAUDE.md](./CLAUDE.md)

### Key Documentation Topics
- Architecture overview
- Manager system explanation
- Adding new obstacles
- Tuning game difficulty
- Asset management
- Code patterns and best practices

## 🎨 Customization

### Changing Game Difficulty
Edit values in `src/config/GameConfig.js`:
```javascript
DIFFICULTY: {
    INITIAL_SPEED: 300,      // Starting game speed
    SPEED_INCREASE_AMOUNT: 5 // Speed increase per interval
}
```

### Adding New Obstacles
1. Add sprite to `assets/images/`
2. Load in `src/scenes/MenuScene.js`
3. Configure in `src/config/GameConfig.js`
4. Add spawn logic in `src/managers/ObstacleManager.js`

## 🐛 Known Issues

- Game canvas is fixed at 800x600 (mobile scaling TBD)
- No online leaderboard (localStorage only)

## 🔮 Future Enhancements

- [ ] Character unlocks (different animals)
- [ ] Particle effects and visual polish
- [ ] Achievement system
- [ ] Daily challenges
- [ ] Biome variations
- [ ] Online leaderboards
- [ ] Mobile responsive scaling

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Phaser 3](https://phaser.io/)
- Developed by Daniel Samus
- Inspired by classic endless runner games

## 📧 Contact

- GitHub: [@dannyboy166](https://github.com/dannyboy166)
- Project Link: [https://github.com/dannyboy166/my-kangaroo-game](https://github.com/dannyboy166/my-kangaroo-game)

---

**Enjoy the game!** 🦘✨
