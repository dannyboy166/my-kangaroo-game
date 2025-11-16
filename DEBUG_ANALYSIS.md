# Debug Analysis - Why Obstacles Move Differently Than Ground

## The Problem

Obstacles appear to move at a different speed than the ground, causing misalignment.

## Root Cause

**Two different scrolling systems are being used:**

### Ground Layer (TileSprite)
```javascript
layer.setScrollFactor(0);  // Fixed to camera
layer.tilePositionX = camera.scrollX * 1.0;  // Manual scrolling
```
- ScrollFactor = 0 means "don't move with camera"
- But we manually update tilePositionX based on camera.scrollX
- This creates the scrolling effect

### Obstacles (Sprites)
```javascript
// No setScrollFactor() call, defaults to 1
obstacle.setVelocityX(0);  // Static in world
```
- ScrollFactor = 1 (default) means "move with camera 1:1"
- Velocity = 0 means "don't move in world space"
- Phaser automatically adjusts screen position as camera moves

## The Mismatch

**Ground scroll calculation:**
```
tilePositionX = camera.scrollX * 1.0
```

**Obstacle scroll (automatic):**
```
screenX = worldX - camera.scrollX
```

These should be the SAME, but there might be subtle differences in how Phaser handles them!

## The Solution

We have two options:

### Option 1: Make obstacles use scrollFactor = 0 and manual positioning (NOT RECOMMENDED)
This would match the ground's approach, but requires manually updating obstacle positions every frame.

### Option 2: Make ground use scrollFactor = 1 like obstacles (RECOMMENDED)
The ground TileSprite should use the same scrolling system as obstacles.

## Recommended Fix

Change ground from manual scrolling to scrollFactor-based scrolling:

```javascript
// In EnvironmentManager.addParallaxLayer():
if (scrollSpeed >= 1.0) {
    // Ground layer - use scrollFactor like obstacles
    layer.setScrollFactor(1); // Move with camera
    layer.setDepth(depth);
    // Don't manually update tilePositionX in update()
} else {
    // Background layers - use manual parallax
    layer.setScrollFactor(0);
    // Update tilePositionX in update()
}
```

This way:
- **Obstacles**: scrollFactor = 1, velocity = 0
- **Ground**: scrollFactor = 1, no manual tilePositionX updates
- **Background layers**: scrollFactor = 0, manual tilePositionX updates

All foreground elements (ground + obstacles) use the same scrolling system!
