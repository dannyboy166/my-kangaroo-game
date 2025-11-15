# Ground Scroll Speed Mathematical Calculation

## Problem Statement
The ground layer needed to scroll at the exact speed to match the apparent backward movement of obstacles in the infinite runner game.

## Camera System Analysis

### Camera Configuration (from GameScene.js)
```javascript
this.cameras.main.startFollow(this.kangaroo, true, 0.1, 0);
this.cameras.main.setFollowOffset(-250, 0);
```

- **Horizontal Lerp**: 0.1 (smooth following with 10% interpolation per frame)
- **Vertical Lerp**: 0 (instant following)
- **Camera Offset**: -250px (kangaroo appears 250px from left edge of screen)

### Movement System
1. **Kangaroo**: Moves forward in world space at `gameSpeed` (starts at 300, increases over time)
2. **Obstacles**: Stationary in world space (velocityX = 0)
3. **Camera**: Follows kangaroo with smooth horizontal lerp

## Mathematical Relationship

### Key Insight
From the player's perspective:
- Obstacles appear to move backward at the rate the camera scrolls forward
- The camera scrolls forward as it follows the kangaroo
- Ground needs to appear stationary relative to obstacles

### Ground Scrolling Formula
```javascript
layer.sprite.tilePositionX = camera.scrollX * layer.scrollSpeed;
```

### Calculating the Correct ScrollSpeed

For the ground to match obstacle apparent movement:

1. **Obstacles in World Space**: Fixed position (velocityX = 0)
2. **Camera Movement**: camera.scrollX increases as kangaroo moves forward
3. **Obstacle Apparent Speed**: Equal to camera scroll rate
4. **Ground Scroll Requirement**: Must match camera scroll rate

Therefore:
```
scrollSpeed = 1.0
```

This creates a 1:1 relationship between camera movement and ground scrolling.

## Why Previous Values Were Wrong

### Outback Theme (was 4.5)
- With scrollSpeed 4.5, the ground scrolled 4.5x faster than the camera
- This made the ground appear to slide under the obstacles
- Obstacles seemed to "float" above the ground

### Beach Theme (was correct at 1.0)
- Already had the correct value
- Y position was misaligned (450 instead of 520)

## The Fix

Updated `/src/config/BackgroundConfig.js`:

### Outback Theme
```javascript
{
    key: 'parallax_ground',
    type: 'tileSprite',
    scrollSpeed: 1.0,  // Changed from 4.5
    depth: -20,
    tileScaleX: 0.25,
    tileScaleY: 0.25,
    y: 520
}
```

### Beach Theme
```javascript
{
    key: 'beach_land',
    type: 'tileSprite',
    scrollSpeed: 1.0,  // Already correct
    depth: -50,
    tileScaleX: 0.4,
    tileScaleY: 0.4,
    y: 520  // Changed from 450
}
```

## Verification

With scrollSpeed = 1.0:
- Ground tiles move at exactly the same rate as camera.scrollX
- Obstacles appear perfectly anchored to the ground
- No sliding or floating effect

## Debug Values Explained

From the debug output:
```
kangarooWorldX: 961
cameraScrollX: 757
kangarooVelocityX: 310
```

The difference (961 - 757 = 204) represents the camera lag due to lerp smoothing. This is normal and expected with lerp = 0.1.

## Conclusion

The mathematically correct `scrollSpeed` for ground layers in an infinite runner with a following camera is **1.0**, which creates perfect synchronization between ground scrolling and obstacle apparent movement.