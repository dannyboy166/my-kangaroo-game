# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Portal Integration Context

**This game is part of the SASCO Games Portal project!**

This is one of **4 games** being integrated into Victor's **SASCO student/teacher portal platform** for schools. This game serves as a **free time reward** - students play it after earning free time credits from educational activities like MathCrush2.

### The 4 Games in the Portal:
1. **MathCrush2** (Unity) - Educational + Time Earner (currently integrating with Victor)
2. **Wordle** (React) - Educational (teacher-assigned vocabulary)
3. **Kangaroo Hop** (Phaser.js) - Free Time Reward ← **THIS GAME**
4. **2048** (Vanilla JS) - Free Time Reward

### Central Planning Location:
**All portal integration planning:** `/Users/danielsamus/sasco-games-portal/`
- README.md - Overall roadmap
- TASKS.md - Task tracking
- .claude/claude.md - Full project context

**Check the central folder for:**
- Victor's integration requirements
- URL parameter specifications
- Timeline and priorities
- Progress across all 4 games

### Integration Needs for This Game:
- Mobile responsive scaling (currently fixed 800x600)
- URL parameter support (studentId, sessionId, token)
- "Return to Portal" button
- Optional: Progress tracking (high score, coins)

---

## Project Overview

Kangaroo Hop is a Phaser.js browser-based endless runner game built with modern JavaScript (ES6+ modules). The game features a kangaroo jumping over obstacles, collecting coins, and using powerups in an Australian outback setting.

---

## Lottie Edition (kangaroo-lottie.html)

A **raw Canvas + Lottie** version of the game, built without Phaser for easier Lottie integration.

### Why Lottie Edition?
- Easier integration with LottieFiles animations
- Simpler codebase (single HTML file)
- Better for the SASCO learning platform deployment

### Tech Stack (Lottie Edition)
- **Rendering**: Raw Canvas 2D
- **Lottie Libraries**:
  - **lottie-web** for `.json` files (standard Lottie format)
  - **DotLottie Web** for `.lottie` files (compressed format)
- **Kangaroo**: Individual PNG frames (not sprite sheet)
- **Obstacles**: Lottie animations (camel, crocodile, snake, tree)
- **No build step**: Runs directly in browser

### File Location
- `kangaroo-lottie.html` - Main game file (self-contained)
- `assets/lottie/` - Lottie animation files (`.json` and `.lottie` formats)

### Lottie File Formats (IMPORTANT!)

**Use `.json` format for best compatibility!**

| Format | Library | Notes |
|--------|---------|-------|
| `.json` | lottie-web | ✅ Standard format, works reliably |
| `.lottie` | DotLottie | Compressed, but can have rendering issues |

When downloading from LottieFiles, choose **"Lottie JSON"** not "dotLottie".

The loader auto-detects format and uses the right library:
```javascript
if (config.src.endsWith('.json')) {
    // Uses lottie-web (canvas renderer)
    lottie.loadAnimation({...})
} else {
    // Uses DotLottie
    new DotLottie({...})
}
```

### Lottie Obstacles Configuration
```javascript
const LOTTIE_OBSTACLES = {
    camel: {
        src: 'assets/lottie/camel.json',
        width: 200, height: 180,
        hitboxWidth: 140, hitboxHeight: 80
    },
    crocodile: {
        src: 'assets/lottie/crocodile.json',
        width: 280, height: 230,
        hitboxWidth: 72, hitboxHeight: 96,
        speedMultiplier: 1.5,  // 50% faster!
        animationSpeed: 2.0
    },
    snake: {
        src: 'assets/lottie/snake.json',
        width: 150, height: 100,
        hitboxWidth: 100, hitboxHeight: 50
    },
    tree: {
        src: 'assets/lottie/tree.json',
        width: 200, height: 280,
        hitboxWidth: 50, hitboxHeight: 200
    }
};

// Background decorations (not obstacles)
const LOTTIE_DECORATIONS = {
    sun: {
        src: 'assets/lottie/sun.json',
        width: 100, height: 100,
        x: 700, y: 50  // Top right corner
    }
};
```

### Physics Constants
```javascript
const GRAVITY = 1.0;        // Snappy feel
const JUMP_FORCE = -22;     // Strong jump
const INITIAL_SPEED = 7;    // Starting game speed
const MAX_SPEED = 14;       // Cap
```

### Kangaroo Animations
Uses individual PNG frames from `assets/characters/kangaroo/brown/`:
- **moving**: 16 frames @ 20fps (running)
- **jump**: frames 0-6 @ 20fps, holds on frame 6 (airborne)
- **die**: 5 frames @ 10fps (death)
- **idle**: 20 frames @ 12fps (menu)

### Audio
All sounds from Phaser version work:
- jump, double_jump, land, coin_collect
- collision, game_over, button_click
- Menu music + game music (outback)

### Debug Flags
```javascript
const DEBUG = true;        // Show hitboxes
const JUMP_DEBUG = false;  // Test 4 jump configs side-by-side
const SPAWN_DEBUG = true;  // Cycle through all obstacles
```

### Lottie Integration Notes
- Lottie canvases render in hidden container (`#lottieContainer` with `opacity: 0.01`)
- Animations render to hidden canvases, then drawn to game canvas each frame
- Large animations (1MB+) may affect performance (tree.json is 1.7MB)
- Both lottie-web and DotLottie support pause/play for game over state

---

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
│   ├── lottie/          # Lottie animations (.lottie files)
│   │   ├── camel.lottie
│   │   ├── crocodile_scooter.lottie
│   │   └── play_button.lottie
│   ├── characters/      # Individual animation frames
│   │   └── kangaroo/brown/  # Kangaroo PNG frames
│   └── audio/
│       ├── sfx/         # Sound effects
│       └── music/       # Background music
├── src/
│   ├── config/
│   │   ├── GameConfig.js         # Central game configuration constants
│   │   ├── BackgroundConfig.js   # Background theme definitions (Outback, Beach)
│   │   └── UITheme.js            # Centralized UI styling (fonts, colors, text styles)
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
│   │   ├── Button.js             # Reusable button component (icon+text, hover, pulse)
│   │   ├── CoinDisplay.js        # Reusable coin count display component
│   │   ├── PurchaseConfirmPopup.js
│   │   └── FunFactPopup.js
│   └── main.js                   # Game initialization and config
├── index.html                    # Entry point (Phaser version)
├── kangaroo-lottie.html          # Lottie Edition (raw Canvas + Lottie)
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
   - **SPAWN ORCHESTRATOR**: Coordinates all obstacle, coin, and powerup spawning
   - Uses industry-standard "grouped spawning" pattern (Temple Run, Subway Surfers)
   - When obstacle spawns: 40% chance to spawn coin, 10% chance to spawn powerup
   - All spawns check for overlaps before placement (guaranteed no overlap!)
   - Special AI for magpies (swooping) and emus (running)
   - Gap obstacle patterns for increased difficulty

4. **PowerupManager** (`src/managers/PowerupManager.js`)
   - Handles powerup activation (shield, magnet, double jump)
   - Visual orb system (rotating indicators around kangaroo)
   - Integrates with StoreManager for purchased powerups
   - **Spawning**: Called by ObstacleManager via `spawnPowerupAtPosition(x, y)`

5. **CollectibleManager** (`src/managers/CollectibleManager.js`)
   - Handles coin collection and magnet attraction logic
   - Coin collection with visual effects
   - **Spawning**: Called by ObstacleManager via `spawnCoinAtPosition(x, y)`

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

### Reusable UI Components (`src/ui/`)

The game uses reusable UI components for consistency and reduced code duplication:

1. **Button.js** - Flexible button component
   - Supports text-only or icon+text layouts
   - Auto-centers icon and text as a group
   - Built-in hover effects and optional pulse animation
   - Uses UITheme for default styling
   ```javascript
   new Button(this, x, y, {
       text: 'Shop',
       bgKey: 'btn_blue',
       bgScale: 0.4,
       iconKey: 'icon_shop',
       iconScale: 0.38,
       iconWidth: 28,
       textStyle: { fontSize: '28px' },
       pulse: true,
       hoverScale: 1.15,
       onClick: () => { /* handler */ }
   });
   ```
   - For popups, use `addToScene: false` and manually add to container

2. **CoinDisplay.js** - Coin count display
   - Shows coin icon + count text
   - Simple `setCount(n)` method to update
   ```javascript
   this.coinDisplay = new CoinDisplay(this, 35, 30);
   this.coinDisplay.setCount(this.gameDataManager.getCoins());
   ```

3. **UITheme.js** (`src/config/`) - Centralized styling
   - All fonts, colors, and text styles in one place
   - Presets: `title`, `button`, `buttonLarge`, `coinCount`, `score`, etc.
   ```javascript
   import { UI_THEME, getTextStyle } from '../config/UITheme.js';

   // Use preset directly
   this.add.text(x, y, 'Score', UI_THEME.textStyles.score);

   // Use preset with overrides
   this.add.text(x, y, 'Custom', getTextStyle('title', { fontSize: '32px' }));
   ```

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
- **Ground Level**: y = 500 (GAME_CONFIG.DIFFICULTY.GROUND_Y)
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
- **Shield**: One-time collision protection (pink heart ❤️, pink orbs)
- **Magnet**: Attracts coins within 400px range (green gem 💎, blue orbs)
- **Double Jump**: Extra jump in mid-air (star ⭐, green orbs)

**Duration**: 10 seconds for all powerups

**Visual Sprites**:
- Uses animated sprite sheet from Dani Maccari's platformer items pack
- Heart animation (frames 8-13) for Shield
- Green gem animation (frames 48-55) for Magnet
- Star animation (frames 56-63) for Double Jump
- Mystery box animation (frames 24-31) reserved for future random powerup feature

**Visual Indicators**:
- Rotating orbs around kangaroo (3 per powerup type)
  - Shield: Pink orbs (0xFF69B4)
  - Magnet: Blue orbs (0x00BFFF)
  - Double Jump: Green orbs (0x00FF00)
- Progress bars showing time remaining (color-matched)
- Color-coded UI elements (inventory counts match orb colors)

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

## Recent Changes

### Independent Collectible Spawning & Quiz System (2025-11-24) - Latest
**The Goal**: Improve collectible variety and add optional bonus quiz feature.

**Collectible Spawning Overhaul**:
- **Removed normal log obstacle** - Only snake log variant spawns now
- **Independent spawn positioning** - Coins/powerups no longer tied to obstacle positions
  - Coins spawn 600-1400px ahead of kangaroo (always off-screen)
  - Powerups spawn 650-1500px ahead of kangaroo
  - Ensures collectibles appear smoothly into view
- **Increased spawn rates**:
  - 70% chance for coins per obstacle (up from 40%)
  - 50% chance for 1-2 coins (better collection rate)
  - 15% chance for powerups (down from 25%)
  - 15% chance for nothing (down from 35%)
- **Coin economy reset**: Coin value back to 5 (from debug value of 50)
- **Coin stack thresholds updated**:
  - 0-9 coins → coin1 image
  - 10-99 coins → coin2 image
  - 100-499 coins → coin3 image
  - 500+ coins → coin4 image

**Quiz System (Saved Feature)**:
- **TrueFalseQuizPopup component** created (`src/ui/TrueFalseQuizPopup.js`)
  - 30+ True/False questions about Australian wildlife
  - Random bonus multiplier system (1x, 1.5x, 2x, 3x with weighted odds)
  - Animated coin reward with +X COINS display
  - Tracks coins collected per game run
- **Currently disabled** - Fun fact popup active by default
- **Easy to enable**: Set `showQuiz: true` in GameOverScene data
- All quiz infrastructure ready (coin tracking, multiplier logic, animations)

**Files Modified**:
- `ObstacleManager.js`: Independent spawning, increased coin rates, removed normal log
- `GameConfig.js`: Reset coin value to 5
- `CoinDisplay.js`: Updated stack thresholds
- `GameScene.js`: Added `coinsCollectedThisRun` tracking
- `GameOverScene.js`: Quiz/fun fact toggle system
- `TrueFalseQuizPopup.js`: New quiz component (saved for future use)

### Reusable UI Components & UITheme (2025-11-24)
**The Goal**: Reduce code duplication and create consistent UI across all scenes.

**New Components Created**:
1. **Button.js** (`src/ui/`)
   - Reusable button with icon+text or text-only layouts
   - Auto-centers content, built-in hover/pulse effects
   - Config: `text`, `bgKey`, `iconKey`, `iconScale`, `iconWidth`, `textStyle`, `pulse`, `onClick`
   - Use `addToScene: false` for buttons inside popup containers

2. **CoinDisplay.js** (`src/ui/`)
   - Coin icon + count display
   - `setCount(n)` method to update

3. **UITheme.js** (`src/config/`)
   - Centralized fonts, colors, text style presets
   - All components import from here for consistency

**Scenes Refactored**:
- MenuScene: Shop button, Theme button, CoinDisplay
- GameOverScene: Play Again, Shop, Menu buttons, CoinDisplay
- StoreScene: Back button, CoinDisplay
- PurchaseConfirmPopup: Cancel, Confirm buttons
- FunFactPopup: Got It button

**Code Reduction**: ~200+ lines removed through component reuse

**Other Changes**:
- Theme names simplified: "AUSTRALIAN\nOUTBACK" → "Outback", "BEACH\nPARADISE" → "Beach"
- Magpie swoop behavior adjusted to climb back up 80px earlier

### Industry-Standard Grouped Spawning System (2025-11-18)
**The Goal**: Convert from independent timer-based spawning to coordinated grouped spawning (industry-standard pattern).

**The Problem**:
- Coins and powerups spawned independently with their own timers
- Complex collision detection with retry logic (up to 5 attempts)
- Still had overlaps despite buffer zones
- Confusing codebase with 3 separate spawn systems

**The Solution - Grouped Spawning**:
ObstacleManager now orchestrates ALL spawning:
1. When obstacle spawns:
   - 40% chance → spawn coin nearby (safe position)
   - 10% chance → spawn powerup nearby (safe position)
   - 50% chance → spawn nothing
2. Each collectible checks for overlaps with ALL obstacles before spawning
3. If overlap detected, skip spawning (guaranteed no overlap)

**Code Changes**:
- `ObstacleManager.spawnCoinsAroundObstacle()`: Spawns coins in safe positions
- `ObstacleManager.spawnPowerupAroundObstacle()`: Spawns powerups in safe positions
- `CollectibleManager.spawnCoinAtPosition(x, y)`: Called by ObstacleManager
- `PowerupManager.spawnPowerupAtPosition(x, y)`: Called by ObstacleManager

**Deleted Code**:
- `CollectibleManager.scheduleNextCoin()` - independent timer (obsolete)
- `CollectibleManager.spawnCoin()` - random spawning (obsolete)
- `PowerupManager.scheduleNextPowerup()` - independent timer (obsolete)
- All complex retry/buffer collision logic (no longer needed)
- `coinTimer` and `powerupTimer` properties

**Benefits**:
- Industry-standard pattern (Temple Run, Subway Surfers use this)
- Cleaner codebase: 50% less spawning code
- Better performance: 1 timer instead of 3
- Guaranteed fair spawns: always collectible, never overlap
- Easier for future Claude sessions to understand

**Files Modified**:
- `ObstacleManager.js`: Added spawn coordination
- `CollectibleManager.js`: Simplified to position-based spawning only
- `PowerupManager.js`: Simplified to position-based spawning only
- `main.js`: Disabled debug mode (collision boxes hidden)

### Major Codebase Cleanup (2025-11-18)
**The Goal**: Simplify codebase, remove duplication, fix critical bugs, and prepare for production.

**Critical Fixes**:
1. **Fixed localStorage Duplication** - Consolidated coin management into GameDataManager only
   - Removed duplicate coin handling in StoreManager
   - StoreManager now properly delegates to GameDataManager for all coin operations

2. **Fixed Memory Leak** - Added cleanup() method to GameDataManager
   - Debounce timer now properly cleaned up to prevent memory leaks

3. **Removed localStorage Key Conflict**:
   - Deleted `'kangaroo_hop_total_coins'` key (was conflicting with `'kangaroo_coins'`)
   - Single source of truth for coin data

**Code Simplification**:
1. **Refactored StoreManager** (137→123 lines, -10%)
   - Replaced 3 duplicate switch statements with object mapping
   - Removed all coin management code (now uses GameDataManager)
   - Cleaner, more maintainable powerup inventory system

2. **Removed All Debug Logging**
   - Cleaned 50+ console.log calls across entire codebase
   - Removed debug counters from all managers
   - Preserved critical error/warning logging only

3. **Removed Dead Code**:
   - Deleted old backup files: `GameScene_OLD.js`, `GameScene.OLD.js`
   - Deleted 10 outdated documentation files
   - Removed unused Pixel Adventure obstacle configurations
   - Removed 80+ lines of unused collision box config from GameConfig.js
   - Removed unused `setCollisionBox()` method from ObstacleManager

**Documentation Updates**:
- Fixed GROUND_Y inconsistency (was 520 in docs, actually 500)
- Removed references to unused obstacle types
- Simplified GameConfig documentation

**Files Deleted** (11 total):
- `src/scenes/GameScene_OLD.js`
- `src/scenes/GameScene.OLD.js`
- `INFINITE_RUNNER_EXPLAINED.md`
- `ARCHITECTURE.md`
- `REFACTOR_SUMMARY.md`
- `TILESPRITE_FIX_EXPLAINED.md`
- `MEMORY_EFFICIENCY_REPORT.md`
- `THE_BIG_FIX.md`
- `BUGFIX_NOTES.md`
- `DEBUG_ANALYSIS.md`
- `SCROLL_SPEED_CALCULATION.md`
- `PRODUCTION_ROADMAP.md`

**Result**:
- Cleaner, simpler codebase focused on core gameplay
- No localStorage conflicts or memory leaks
- Production-ready logging (errors only)
- Easier to maintain and extend

### Unified Animated Powerup Sprites (2025-11-18)
**The Goal**: Create consistent, visually appealing powerup system across all game contexts.

**Changes Made**:
1. **Replaced Static Icons with Animated Sprites**:
   - Shield: Pink heart animation (frames 8-13) ❤️
   - Magnet: Green gem animation (frames 48-55) 💎
   - Double Jump: Star animation (frames 56-63) ⭐
   - Mystery box (frames 24-31) reserved for future random powerup feature

2. **Updated All Powerup Contexts**:
   - In-game collectibles (`PowerupManager.js:119-123`)
   - Collection animation effect (`PowerupManager.js:170-190`)
   - Shop display (`StoreScene.js:108-125`)
   - Inventory UI (`UIManager.js:100-146`)

3. **Color-Coordinated UI System**:
   - Shield: Pink orbs/bars/text (0xFF69B4 / #FF69B4)
   - Magnet: Blue orbs/bars/text (0x00BFFF / #00BFFF)
   - Double Jump: Green orbs/bars/text (0x00FF00 / #00FF00)
   - Updated in `GameConfig.js:186-190` and `UIManager.js:173-175`

4. **Cleanup**:
   - Removed old static images (shield.png, magnet.png, double.png)
   - Removed unused _words.png variants
   - Removed static image loading from `MenuScene.js:101-105`

**Result**:
- Consistent animated sprites across gameplay, shop, and UI
- Color-matched visual indicators (orbs, progress bars, inventory counts)
- Cleaner asset folder and codebase

### Smoothness & Performance Optimization (2025-11-16)
**The Challenge**: Game felt choppy with visible stuttering, rubber-banding camera, and seams in background tiles.

**Root Causes Identified**:
1. **Camera Lerp Too Slow**: 0.1 lerp created rubber-band lag effect
2. **roundPixels Enabled**: Forced whole-pixel snapping causing micro-stutters at decimal velocities
3. **TileSprite Sub-Pixel Artifacts**: Decimal scroll positions caused visible seams
4. **Manual Coin Movement**: Direct position updates caused jittery magnet attraction

**The Solution**:
- **Camera Following** (`GameScene.js:193`): Changed lerp from `0.1` to `1.0` for instant following
  - Eliminates rubber-band effect
  - Creates silky-smooth scrolling like professional endless runners
- **Sub-Pixel Rendering** (`main.js:24`): Changed `roundPixels: true` to `false`
  - Allows smooth movement at decimal velocities (e.g., 300px/sec = 5px per frame)
  - Prevents visible "stepping" artifacts
- **TileSprite Scrolling** (`EnvironmentManager.js:151`): Added `Math.round()` to tile positions
  - Prevents gaps/seams where background tiles connect
  - Keeps tiles crisp while allowing smooth camera movement
- **Physics-Based Magnet** (`CollectibleManager.js:71-83`): Changed from manual position updates to velocity-based movement
  - Phaser physics engine handles smooth interpolation
  - Eliminates jittery coin attraction

**Performance Impact**:
- Buttery smooth 60 FPS scrolling
- Zero visible seams or stuttering
- Professional-grade feel matching Temple Run/Subway Surfers quality

**Key Insight**: Endless runner smoothness requires:
1. Instant camera following (lerp = 1.0)
2. Sub-pixel rendering for smooth movement
3. Whole-pixel tile positions to prevent seams
4. Physics velocity over manual position updates

### Obstacle & Ground Alignment Fix (2025-11-15)
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
- **GROUND_Y**: 500 (defined in GAME_CONFIG.DIFFICULTY.GROUND_Y)
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

**Last Updated**: 2025-11-24
**Game Version**: 3.2 (Independent Collectible Spawning + Quiz System)
**Phaser Version**: 3.90.0
