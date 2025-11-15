# Bug Fix Notes - Ground Layer Not Visible

## Date: 2025-11-15

## Problem
Added a ground layer (`parallax_ground`) to the Outback theme in BackgroundConfig.js, but it wasn't visible on screen despite:
- Being loaded correctly in MenuScene
- Being created successfully (logs showed layer creation)
- Having correct position, depth, and visibility properties

## Root Cause
**The tileScale was too large!**

The parallax ground texture is 2048 x 1546 pixels. When we initially set:
- `tileScaleX: 0.4` and `tileScaleY: 0.4`
- Then tried `1.0` and `1.5`

The tiles were SO LARGE that the TileSprite (which is only 800x600) was showing only a tiny portion of one tile - likely a transparent or empty part of the texture. This made it appear invisible even though it was rendering.

## Solution
Changed the tileScale to **0.25** (much smaller):
```javascript
{
    key: 'parallax_ground',
    type: 'tileSprite',
    scrollSpeed: 1.0,
    depth: -20,
    tileScaleX: 0.25,  // KEY FIX: Was 0.4, then 1.5, now 0.25
    tileScaleY: 0.25,  // KEY FIX: Was 0.4, then 1.5, now 0.25
    y: 520
}
```

## Key Lesson
**TileSprite scale matters!** When a texture is very large (2048x1546) and the TileSprite viewport is small (800x600), you need a very small tileScale to see the repeating pattern. Otherwise you're just looking at a small section of one huge tile.

## Debugging Steps That Helped
1. Added console logs showing texture dimensions
2. Added red tint to make layer visible (proved it was rendering)
3. Tested with a different texture (`beach_land`) to rule out image file issues
4. Tried tileScale 0.2 which finally showed the texture
5. Adjusted to 0.25 for the final look

## Final Working Configuration
- Texture: `parallax_ground` (2048 x 1546)
- Position: y = 520 (aligned with GROUND_Y)
- Depth: -20 (in front of trees at -50, behind kangaroo)
- TileScale: 0.25 x 0.25
- ScrollSpeed: 1.0 (matches obstacle movement)

---

**Remember:** Always check tileScale when TileSprites appear invisible but logs show they're created!
