# Infinite Runner Architecture - Explained Simply

## Recommended: Static World Approach

### The Core Concept
Think of your game like a **video camera on a dolly** filming an actor running through a real set:
- **Kangaroo** = Actor running forward on the set
- **Obstacles/Ground** = Props placed on the set (they don't move!)
- **Camera** = Dolly following the actor
- **Background layers** = Painted backdrops at different distances

### How Movement Works

```
WORLD SPACE (The "Set"):
═══════════════════════════════════════════════
Ground: ████████████████████████████████████████
         🪨    🌵       🪨      🌵    🌳
                    🦘→→→ (velocity X: +300)

CAMERA VIEW (What player sees):
┌──────────────────────────┐
│       🦘  🌵    🪨       │  ← Camera follows kangaroo
└──────────────────────────┘
```

### The Math
1. **Kangaroo** moves forward: `x += 300 * deltaTime`
2. **Camera** follows kangaroo: `camera.x = kangaroo.x - 250`
3. **Obstacles** don't move: `velocity = 0` (placed at fixed X positions)
4. **Ground** doesn't move: `velocity = 0` (repeating TileSprite)
5. **Parallax layers** scroll based on camera: `tileX = camera.scrollX * 0.3`

### What the Player Sees
- Kangaroo appears to stay ~250px from left edge (camera offset)
- World scrolls past from right to left (camera movement)
- Background layers scroll slower (parallax effect)

### Code Structure

**GameScene.js:**
```javascript
createPlayer() {
    // Kangaroo moves forward in world space
    this.kangaroo.setVelocityX(300); // Only thing that moves!

    // Camera follows
    this.cameras.main.startFollow(this.kangaroo);
    this.cameras.main.setFollowOffset(-250, 0);
}
```

**ObstacleManager.js:**
```javascript
spawnObstacle() {
    // Place obstacle ahead of kangaroo in world space
    const spawnX = this.kangaroo.x + 800;
    const obstacle = this.scene.add.sprite(spawnX, GROUND_Y, 'rock');

    // NO VELOCITY! Obstacle stays put in world space
    obstacle.body.setVelocityX(0);
    obstacle.body.setAllowGravity(false);
}
```

**EnvironmentManager.js:**
```javascript
createGround() {
    // Ground is a huge TileSprite in world space
    const ground = this.scene.add.tileSprite(0, 520, 100000, 64, 'ground');
    ground.setScrollFactor(1); // Moves with world (camera)
    // NO VELOCITY! It's static in world space
}

update(delta) {
    // Parallax layers scroll based on camera position
    this.parallaxLayers.forEach(layer => {
        layer.tilePositionX = camera.scrollX * layer.scrollSpeed;
    });
}
```

## Why This Approach is Better

### ✅ Advantages:
1. **Conceptually simple**: Objects exist in world space, camera moves
2. **Physics-friendly**: Phaser's physics engine expects static world objects
3. **Industry standard**: Same as Temple Run, Subway Surfers, etc.
4. **Easier debugging**: Object positions make sense in world coordinates
5. **Collision detection**: More reliable with static obstacles
6. **Memory efficient**: Don't need physics bodies on static objects

### ❌ Your Current Hybrid Approach Problems:
1. **Confusing**: Kangaroo moves forward, everything moves backward
2. **Double movement**: Net speed is actually 600 (300 + 300)
3. **Physics overhead**: Every obstacle needs active physics body
4. **Alignment issues**: Ground and obstacles need constant velocity sync
5. **Hard to debug**: "Why is this moving at -300?" questions

## Summary

**Think of your game as a real movie set:**
- Kangaroo is the only thing that moves (the actor)
- Everything else is scenery (static props)
- Camera follows the actor (dolly tracking shot)
- Parallax is distant painted backdrops moving slower

**Your current approach is like:**
- Having the actor run on a treadmill (+300)
- While stagehands drag all the props backward (-300)
- It works, but it's unnecessarily complicated!

## What Should Move in Your Game?

| Object | Velocity | Reason |
|--------|----------|--------|
| Kangaroo | +300 | Only thing that actually moves |
| Obstacles | 0 | Static in world space |
| Ground TileSprite | 0 | Static, scrolls with camera |
| Parallax layers | 0 | Camera-based scrolling only |
| Camera | Follows kangaroo | Creates scrolling illusion |
| Coins/Powerups | 0 | Static in world space |

**One thing moves. Camera follows. Everything else is scenery.**
