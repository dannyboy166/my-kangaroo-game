# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kangaroo Hop is a Phaser.js browser-based endless runner game built with modern JavaScript (ES6+ modules). The game features a kangaroo jumping over obstacles, collecting coins, and using powerups in an Australian outback setting.

## Development Commands

- **Start development server**: `npm start` - Launches live-server on port 8080
- **Install dependencies**: `npm install`

## Tech Stack

- **Game Engine**: Phaser 3.90.0 (loaded from CDN)
- **Language**: JavaScript (ES6+ with modules)
- **Build**: No build step - runs directly in browser
- **Server**: live-server for local development
- **Architecture**: Modular manager-based design pattern

## Project Structure

```
my-kangaroo-game/
├── assets/
│   ├── images/          # All sprite sheets and images
│   └── audio/
│       └── sfx/         # Sound effects
├── src/
│   ├── config/
│   │   └── GameConfig.js         # Central game configuration constants
│   ├── managers/
│   │   ├── AudioManager.js       # Audio playback management
│   │   ├── GameDataManager.js    # Persistent data (coins, high scores)
│   │   ├── StoreManager.js       # Shop and inventory system
│   │   ├── ObstacleManager.js    # Obstacle spawning and behavior
│   │   ├── PowerupManager.js     # Powerup system and visual effects
│   │   ├── CollectibleManager.js # Coin spawning and collection
│   │   ├── AuthManager.js        # (Quiz feature - optional)
│   │   └── QuestionManager.js    # (Quiz feature - optional)
│   ├── scenes/
│   │   ├── MenuScene.js          # Main menu and asset loading
│   │   ├── GameScene.js          # Core gameplay loop
│   │   ├── GameOverScene.js      # End screen and score display
│   │   ├── StoreScene.js         # In-game shop
│   │   └── QuizScene.js          # (Optional quiz feature)
│   ├── ui/
│   │   ├── PurchaseConfirmPopup.js
│   │   └── FunFactPopup.js
│   └── main.js                   # Game initialization and config
├── index.html                    # Entry point
├── package.json
└── CLAUDE.md                     # This file
```

## Architecture Overview

The game follows a **manager-based architecture** for better separation of concerns and maintainability:

### Core Managers

1. **GameConfig.js** (`src/config/`)
   - Central configuration for all game constants
   - Physics settings, spawn timings, obstacle properties
   - Coordinate system reference and scrolling explanation
   - Easy to tune game balance without touching code

2. **EnvironmentManager** (`src/managers/EnvironmentManager.js`)
   - Handles multi-layer parallax background scrolling
   - Supports multiple themes (Outback, Beach) via BackgroundConfig
   - Uses TileSprites for infinite repeating backgrounds
   - Parallax layers create depth (slower = appears further away)
   - Ground positioned at GROUND_Y (520px)

3. **ObstacleManager** (`src/managers/ObstacleManager.js`)
   - Handles all obstacle spawning logic
   - Manages obstacle movement and behavior
   - Special AI for magpies (swooping) and emus (running)
   - Gap obstacle patterns for increased difficulty

4. **PowerupManager** (`src/managers/PowerupManager.js`)
   - Spawns and manages powerup items
   - Handles powerup activation (shield, magnet, double jump)
   - Visual orb system (rotating indicators around kangaroo)
   - Integrates with StoreManager for purchased powerups

5. **CollectibleManager** (`src/managers/CollectibleManager.js`)
   - Coin spawning and movement
   - Magnet attraction logic
   - Coin collection with visual effects

6. **AudioManager** (`src/managers/AudioManager.js`)
   - Centralized audio playback
   - Sound effects for all game events

7. **GameDataManager** (`src/managers/GameDataManager.js`)
   - Persistent data storage (localStorage)
   - Coin balance tracking
   - High score management

8. **StoreManager** (`src/managers/StoreManager.js`)
   - In-game shop inventory
   - Powerup purchase and consumption
   - Helmet (magpie protection) system

9. **UIManager** (`src/managers/UIManager.js`)
   - Handles all in-game UI elements
   - Score display, coin counter, powerup indicators
   - Inventory display for purchased items

### Scene Flow

```
MenuScene → GameScene ↔ StoreScene → GameOverScene → MenuScene
```

1. **MenuScene**: Asset loading, main menu, high score display
2. **GameScene**: Core gameplay with manager systems
3. **StoreScene**: Purchase powerups and helmet
4. **GameOverScene**: Score summary and retry options

## Key Game Systems

### Physics & Movement
- **Engine**: Phaser Arcade Physics
- **Gravity**: 800 (global), 900 (kangaroo-specific)
- **Jump Velocity**: -950 (normal), -750 (double jump)
- **Ground Level**: y = 520 (GAME_CONFIG.DIFFICULTY.GROUND_Y)
- **Physics Ground**: Wide platform (1,000,000px x 50px) at GROUND_Y, invisible
- **Collision Detection**: Overlap-based for precise hit detection
- **World Bounds**: Kangaroo NOT constrained (infinite forward movement)
- **Animation System**: Uses `body.blocked.down` for reliable ground detection (prevents flickering during mid-air collisions)
- **Scrolling System**: Camera-based infinite runner (kangaroo moves forward in world space, camera follows)

### Obstacle System
- **Base Obstacles**: Rock, cactus, log (available from start)
- **Variants**: Spider rock, snake log (60% spawn chance)
- **Score-Unlocked**: Koala (1000), Emu (2000), Camel (3000), Croc (4000)
- **Flying**: Magpie with AI swooping behavior
- **Running**: Emu runs 30% faster than normal speed
- **Gap Patterns**: Two obstacles close together (after score 1500)
- **Size Variation**: ±20% random scaling for visual variety

### Powerup System

**Types**:
- **Shield**: One-time collision protection (green orbs)
- **Magnet**: Attracts coins within 400px range (purple orbs)
- **Double Jump**: Extra jump in mid-air (cyan orbs)

**Duration**: 10 seconds for all powerups

**Visual Indicators**:
- Rotating orbs around kangaroo (3 per powerup type)
- Progress bars showing time remaining
- Color-coded UI elements

**Sources**:
- Random spawns during gameplay
- Purchased from store (activated with keys 1, 2, 3)

### Collectibles
- **Coins**: Worth 5 coins + 10 score points
- **Spawn Rate**: Every 1.75-3.15 seconds
- **Magnet Effect**: Attracted when magnet powerup active

### Difficulty Progression
- **Speed Increase**: +5 every 50 score points
- **Obstacle Frequency**: Increases at score 1000+
- **New Obstacles**: Unlock at specific score thresholds
- **Gap Obstacles**: Introduced at score 1500+

### Shop System
- **Currency**: Coins (persistent across sessions)
- **Items**: Shield (50 coins), Magnet (50 coins), Double Jump (50 coins), Helmet (100 coins)
- **Helmet**: Special item - protects from magpies for one game only

## Code Patterns & Best Practices

### Manager Pattern
All managers follow this structure:
```javascript
export default class ManagerName {
    constructor(scene, dependencies) {
        this.scene = scene;
        // Store dependencies
        // Initialize state
    }

    create() {
        // Set up physics groups, timers, etc.
    }

    update(delta) {
        // Per-frame updates
    }

    cleanup() {
        // Destroy timers, clear groups
    }
}
```

### Configuration-Driven Development
- All magic numbers live in `GameConfig.js`
- Tuning game balance = editing config file
- No code changes needed for gameplay tweaks

### JSDoc Documentation
All classes and methods use JSDoc comments:
```javascript
/**
 * Brief description
 * @param {Type} paramName - Description
 * @returns {Type} Description
 */
```

### Scene Lifecycle
```javascript
preload() {
    // Load assets
}

create(data) {
    // Initialize managers
    // Set up UI
    // Start game loops
}

update(time, delta) {
    // Call manager updates
    // Handle input
    // Update score/UI
}

shutdown() {
    // Cleanup managers
    // Remove listeners
}
```

## Asset Management

### Sprite Sheets
- **Kangaroo**: 768x256 total (6 columns x 2 rows), each frame 128x128
  - 12 frames for running animation
  - Artwork sits at bottom ~64px of each frame with empty space above
  - Origin set to (0.5, 1) - bottom-center anchor point
- **Kangaroo Helmet**: Same dimensions and layout as normal kangaroo
- **Emu**: 128x128 frames (4 frames for running)
- **Magpie**: 128x128 frames (4 frames for flying)

### Images
- **Obstacles**: PNG files (rock, cactus, log, etc.)
- **Coins**: Single PNG with scale animation
- **Powerups**: Shield, magnet, double jump icons

### Background System
- **Multi-Theme Support**: Outback and Beach themes (configurable in BackgroundConfig.js)
- **Parallax Scrolling**: Multiple TileSprite layers that repeat infinitely
- **Depth Illusion**: Layers scroll at different speeds (0.1 to 1.0)
  - scrollSpeed 0.0 = Fixed (distant sky)
  - scrollSpeed 0.1-0.3 = Far background (clouds, distant elements)
  - scrollSpeed 0.6 = Mid-ground (trees, bushes)
  - scrollSpeed 1.0 = Foreground ground (matches obstacle movement)
- **Visual Ground**: Comes from foreground parallax layer at y=520
- **Physics Ground**: Separate invisible platform for collision detection
- **Theme Selection**: Stored in GameDataManager (persistent across sessions)

### Audio
All sound effects in `assets/audio/sfx/`:
- Jump, land, coin collect
- Collision, game over
- Powerup activation sounds

## Common Development Tasks

### Adding a New Obstacle
1. Add image to `assets/images/`
2. Load in `MenuScene.preload()`
3. Add to `GAME_CONFIG.OBSTACLES.BASE_SIZES`
4. Add unlock score to `GAME_CONFIG.OBSTACLES.UNLOCK_SCORES`
5. Set collision box in `ObstacleManager.setCollisionBox()`

### Tuning Game Difficulty
Edit values in `src/config/GameConfig.js`:
- `DIFFICULTY.SPEED_INCREASE_AMOUNT` - How fast game speeds up
- `OBSTACLES.MIN_SPAWN_DELAY` - Obstacle frequency
- `OBSTACLES.UNLOCK_SCORES` - When new obstacles appear

### Adding a New Powerup
1. Add icon to `assets/images/`
2. Add to `POWERUPS.ORBS.PROPERTIES` in GameConfig
3. Implement activation logic in `PowerupManager.activatePowerup()`
4. Add UI elements in `GameScene.createSimplePowerupUI()`

### Changing Visual Theme
- Replace sprite sheets in `assets/images/`
- Maintain same dimensions and frame counts
- Update `GAME_CONFIG.COLORS` for background colors

## Performance Considerations

- **Object Pooling**: Phaser groups automatically pool destroyed objects
- **Off-screen Culling**: Objects destroyed when x < -100
- **Collision Optimization**: Uses overlap instead of collider for better control
- **Minimal DOM**: Canvas-only rendering, no HTML overlays during gameplay

## Mobile Optimization

- **Touch Input**: Pointer events work on mobile
- **Responsive**: Game canvas fixed at 800x600 (add scaling for mobile)
- **Performance**: Lightweight - runs well on older devices

## Known Issues & Technical Debt

1. **No mobile responsive scaling**
   - Canvas is fixed 800x600
   - Could add viewport scaling logic

2. **No online leaderboard**
   - Currently localStorage only
   - Could integrate backend API

## Recent Changes (2025-11-15)

### Obstacle & Ground Alignment Fix (Latest)
**The Challenge**: Getting obstacles to stay perfectly aligned with the ground texture in an infinite runner was more complex than expected due to multiple movement systems interacting.

**The Solution**:
- **Ground Layer**: Changed from camera-fixed parallax to a physics sprite moving at -300 velocity
- **Obstacles**: Spawn at velocity -300, perfectly synchronized with ground movement
- **Critical Fix**: Set obstacle velocity AFTER adding to physics group (group was resetting it)
- **Removed**: Obstacle-ground collision (was stopping obstacle movement)
- **Parallax Layers**: Clouds/trees remain camera-fixed for depth effect

**Key Insight**: In this hybrid infinite runner:
1. Kangaroo moves forward (+300 velocity)
2. Ground sprite moves backward (-300 velocity)
3. Obstacles move backward (-300 velocity)
4. Camera follows kangaroo
5. Result: Ground and obstacles perfectly synchronized visually

**Technical Details**:
- Ground created as 100,000px wide TileSprite in world space
- Physics group add order matters: add to group → set physics → set velocity
- `setImmovable(false)` required for obstacles to maintain velocity
- Speed increases temporarily disabled for testing (constant 300)

### Code Structure & Documentation Overhaul
- **Fixed GROUND_Y Consistency**: All references now correctly use 520px (was incorrectly documented as 450px)
- **Added Comprehensive Comments**:
  - GameConfig.js: Added coordinate system reference and infinite runner explanation
  - EnvironmentManager.js: Added detailed parallax scrolling explanation
  - GameScene.js: Added camera system documentation and world space concepts
  - BackgroundConfig.js: Added layer system explanation
- **Fixed Background Configuration**: Beach land layer now correctly positioned at y=520
- **Improved Code Clarity**: All manager files now have clear, educational comments explaining how systems work

### Background System
- **Multi-Theme Parallax**: Outback and Beach themes with multiple scrolling layers
- **TileSprite Implementation**: Infinite repeating backgrounds using Phaser TileSprites
- **Parallax Depth**: Layers scroll at different speeds (0.1 to 1.0) to create depth illusion
- **Hybrid System**: Parallax layers camera-fixed, ground layer moves as physics sprite

### Physics & Animation
- **Animation System**: Uses `body.blocked.down` for reliable ground detection
- **Physics Ground**: Wide invisible platform (1,000,000px) for infinite gameplay (kangaroo collision only)
- **Camera Following**: Smooth horizontal following with offset to keep kangaroo visible
- **Obstacle Movement**: Velocity -300, gravity disabled, no ground collision

## Future Enhancement Ideas

### Visual Polish
- Particle effects for collisions
- Dust clouds on landing
- Re-add parallax background layers (with proper alignment)
- Ground decorations and atmospheric elements
- Animated obstacles

### Gameplay Features
- Character unlocks (different animals)
- Daily challenges
- Power-up combos
- Boss encounters
- Biome changes (desert → forest → outback)

### Progression Systems
- Achievement system
- Level-based progression (not just endless)
- Unlockable skins
- Seasonal events

### Technical Improvements
- TypeScript migration for type safety
- Build system (Webpack/Vite) for bundling
- Unit tests for game logic
- Mobile-first responsive design

## Testing & Debugging

### Local Testing
1. Run `npm start`
2. Open `http://localhost:8080`
3. Open browser console for logs

### Debug Mode
Enable physics debug in `src/main.js`:
```javascript
physics: {
    default: 'arcade',
    arcade: {
        debug: true  // Shows collision boxes
    }
}
```

### Common Issues
- **"Cannot read property of undefined"**: Check asset loading in MenuScene
- **Collision not working**: Verify collision box setup in ObstacleManager
- **Powerup not activating**: Check StoreManager inventory counts
- **Kangaroo floating above ground**: Check physics ground position matches GROUND_Y (520px)
- **Animation flickering mid-air**: Ensure ground detection only uses `body.blocked.down`, not `touching.down`
- **Obstacles not aligned with ground**: Verify all obstacle spawn positions use GROUND_Y constant
- **Background not scrolling**: Check EnvironmentManager update() is called and parallax layers have correct scrollSpeed
- **Background layers misaligned**: Verify Y positions in BackgroundConfig.js align with GROUND_Y (520px)

## Git Workflow

- **Main branch**: Stable, tested code
- **Feature branches**: For new features (optional)
- **Commits**: Descriptive messages with emoji where appropriate

## Contributing Guidelines

1. Follow existing code style (ES6 modules, JSDoc comments)
2. Update GameConfig.js for new constants
3. Add JSDoc comments to all new methods
4. Test thoroughly before committing
5. Update this CLAUDE.md if architecture changes

## Resources

- **Phaser 3 Docs**: https://photonstorm.github.io/phaser3-docs/
- **Phaser Examples**: https://phaser.io/examples
- **Game Design**: Keep it simple, accessible, fun

## Important Constants

### Ground & Physics
- **GROUND_Y**: 520 (defined in GAME_CONFIG.DIFFICULTY.GROUND_Y)
- **Canvas Size**: 800x600
- **Physics Ground**: Wide platform (1,000,000px x 50px) at y=520 (invisible)
- **Visual Ground**: Comes from background parallax layers (Beach/Outback themes)
- All obstacles, kangaroo, and collectibles must align to GROUND_Y

### Camera System
- **Kangaroo Start Position**: x=50 (world space)
- **Camera Follow Mode**: Smooth horizontal (lerp 0.1), instant vertical
- **Camera Offset**: -250px (keeps kangaroo 250px from left edge of screen)
- **Camera Bounds**: Infinite right boundary (Number.MAX_SAFE_INTEGER)
- **Scrolling Method**: Kangaroo moves forward, camera follows (industry-standard infinite runner)

### Sprite Origins
- **Kangaroo**: setOrigin(0.5, 1) - bottom-center anchor
- **Obstacles**: Most use setOrigin(0.5, 1) - check ObstacleManager for specifics
- **Coins/Powerups**: Check CollectibleManager and PowerupManager

---

**Last Updated**: 2025-11-15
**Game Version**: 2.2 (Code Structure & Documentation Overhaul)
**Phaser Version**: 3.90.0
