# How to Add New Animals

This guide explains how to add new animated animals to the game using the centralized character system.

## Quick Overview

**Single Source of Truth**: All character data lives in **`src/config/CharacterConfig.js`**

The system automatically handles:
- Sprite scaling and physics calculations
- Animation loading and creation
- Collision box positioning

## Folder Structure

```
assets/characters/
├── kangaroo/
│   ├── brown/
│   │   └── __red_kangaroo_no_joey_moving_000.png, 001.png, ...
│   └── grey/
│       └── ... (same structure)
├── emu/brown/
├── camel/brown/
└── croc/green/
```

## Step-by-Step Guide

### 1. Add Asset Files

Place animation frames in:
```
assets/characters/[animal-name]/[color]/
```

### 2. Add Configuration

Edit `src/config/CharacterConfig.js` and add your animal:

```javascript
wombat: {
    name: 'Wombat',
    type: 'obstacle', // or 'player'
    colors: ['brown'],
    defaultColor: 'brown',
    basePath: 'assets/characters/wombat',

    // Original sprite dimensions (check your PNG file)
    spriteWidth: 937,
    spriteHeight: 1083,

    animations: {
        idle: {
            prefix: '__wombat_idle',    // Match filename prefix
            frameCount: 20,              // Count PNG files
            frameRate: 12,
            repeat: -1
        },
        moving: {
            prefix: '__wombat_moving',
            frameCount: 16,
            frameRate: 20,
            repeat: -1
        }
    },

    physics: {
        displayWidth: 128,    // Scaled display size
        displayHeight: 148,

        // Collision box (in scaled coordinates)
        bodyWidth: 70,
        bodyHeight: 80,
        bodyOffsetX: 29,
        bodyOffsetY: 68
    }
}
```

### 3. Load in MenuScene

In `MenuScene.preload()`:
```javascript
this.loadCharacterFrames('wombat', 'brown');
```

In `MenuScene.create()`:
```javascript
this.createCharacterAnimations('wombat', 'brown');
```

### 4. Use in Game

```javascript
import { getPhysicsBodyConfig } from '../config/CharacterConfig.js';

// Create sprite
const sprite = this.physics.add.sprite(x, y, 'wombat_brown_moving_000');
sprite.play('wombat_brown_moving');

// Apply physics (automatically converted from config)
const physics = getPhysicsBodyConfig('wombat');
sprite.setScale(physics.scale);
sprite.body.setSize(physics.bodyWidth, physics.bodyHeight);
sprite.body.setOffset(physics.bodyOffsetX, physics.bodyOffsetY);
```

## Adjusting Collision Boxes

Edit the `physics` section in `CharacterConfig.js`:

```javascript
physics: {
    displayWidth: 128,
    displayHeight: 148,

    bodyWidth: 60,        // Hitbox width
    bodyHeight: 70,       // Hitbox height (LOWER = more forgiving)
    bodyOffsetX: 34,      // Horizontal center: (displayWidth - bodyWidth) / 2
    bodyOffsetY: 68       // Vertical position (HIGHER = moves UP)
}
```

**Tips:**
- Smaller `bodyHeight` = more forgiving gameplay
- Higher `bodyOffsetY` = collision box positioned higher on sprite
- Enable debug mode in `main.js` to visualize: `debug: true`

## How the Physics System Works

### Coordinate Conversion

Phaser needs collision boxes in **original sprite coordinates** (before scaling).

The system handles this automatically:

1. **You configure** in scaled coordinates (easier):
   ```javascript
   bodyHeight: 70  // In 128x148 scaled space
   ```

2. **`getPhysicsBodyConfig()` converts** to original coordinates:
   ```javascript
   bodyHeight: 513  // In 937x1083 original space
   ```

3. **GameScene applies** the converted values

### Helper Functions

**`getPhysicsBodyConfig(characterKey)`**
- Converts physics values from scaled to original coordinates
- Returns ready-to-use values for Phaser
- Used by GameScene automatically

**`getAnimationKey(characterKey, animationKey, color)`**
- Returns: `'kangaroo_brown_moving'`

**`getCharacterFramePaths(characterKey, animationKey, color)`**
- Returns array of file paths for loading

## Complete Example: Kangaroo Setup

### CharacterConfig.js
```javascript
kangaroo: {
    name: 'Kangaroo',
    type: 'player',
    colors: ['brown', 'grey'],
    defaultColor: 'brown',
    basePath: 'assets/characters/kangaroo',

    spriteWidth: 937,
    spriteHeight: 1083,

    animations: {
        moving: {
            prefix: '__red_kangaroo_no_joey_moving',
            frameCount: 16,
            frameRate: 20,
            repeat: -1
        }
    },

    physics: {
        displayWidth: 128,
        displayHeight: 148,
        bodyWidth: 60,
        bodyHeight: 70,
        bodyOffsetX: 34,
        bodyOffsetY: 68
    }
}
```

### GameScene.js
```javascript
import { getPhysicsBodyConfig } from '../config/CharacterConfig.js';

// Create sprite
this.kangaroo = this.physics.add.sprite(x, y, 'kangaroo_brown_moving_000');

// Get pre-calculated physics config
const physics = getPhysicsBodyConfig('kangaroo');

// Apply settings (all values already converted!)
this.kangaroo.setOrigin(0.5, 1);
this.kangaroo.setScale(physics.scale);
this.kangaroo.body.setSize(physics.bodyWidth, physics.bodyHeight);
this.kangaroo.body.setOffset(physics.bodyOffsetX, physics.bodyOffsetY);
```

## Best Practices

✅ **DO:**
- Keep all character data in `CharacterConfig.js`
- Use `getPhysicsBodyConfig()` helper function
- Document sprite dimensions (`spriteWidth`, `spriteHeight`)
- Test collision boxes with debug mode enabled

❌ **DON'T:**
- Hardcode physics values in GameScene
- Calculate scale/offset manually
- Skip `spriteWidth` and `spriteHeight` properties
- Forget to load/create animations in MenuScene

## Troubleshooting

**Collision box not working?**
- Verify you're using `getPhysicsBodyConfig()` in GameScene
- Check values in `CharacterConfig.js` are being read
- Hard refresh browser (Cmd+Shift+R)

**Animation not playing?**
- Check `frameCount` matches number of PNG files
- Verify `prefix` matches filename pattern exactly
- Look for errors in browser console

**Character too big/small?**
- Adjust `displayWidth` and `displayHeight`
- Keep aspect ratio: `height = width * (spriteHeight / spriteWidth)`

## Common Tasks

### Enable Debug Mode
In `main.js`:
```javascript
physics: {
    arcade: {
        debug: true  // Shows collision boxes
    }
}
```

### Count Animation Frames
```bash
ls assets/characters/kangaroo/brown/ | grep "moving" | wc -l
```

### Find Sprite Dimensions
Open PNG in image editor and check properties, or:
```bash
identify assets/characters/kangaroo/brown/__red_kangaroo_no_joey_moving_000.png
```

## Architecture Summary

```
CharacterConfig.js
    ↓ (single source of truth)
    ├─→ MenuScene.js (loads & creates animations)
    ├─→ GameScene.js (creates player sprite)
    └─→ ObstacleManager.js (spawns obstacles)

Helper: getPhysicsBodyConfig()
    ↓ (automatic conversion)
    Scale coordinates: 128x148 → 937x1083
```

All physics calculations happen in **one place** (`getPhysicsBodyConfig()`), ensuring consistency across the entire game.
