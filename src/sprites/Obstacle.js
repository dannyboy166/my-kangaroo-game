export default class Obstacle extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type) {
        // Check if texture exists
        const hasTexture = scene.textures.exists(type);
        super(scene, x, y, hasTexture ? type : null);
        
        this.obstacleType = type;
        
        // Set up physics
        scene.physics.add.existing(this);
        this.body.setImmovable(true);
        this.body.setAllowGravity(true); // Let gravity affect obstacles
        
        // Adjust Y position to be above ground for proper collision
        this.y = y - 50; // Start higher so it can fall to ground
        
        if (hasTexture) {
            // Set size based on type with smaller scales
            switch (type) {
                case 'rock':
                    this.setScale(0.3);
                    this.body.setSize(50, 50);
                    break;
                case 'cactus':
                    this.setScale(0.4);
                    this.body.setSize(35, 70);
                    break;
                case 'log':
                    this.setScale(0.4);
                    this.body.setSize(80, 30);
                    break;
                case 'croc':
                    this.setScale(0.35);
                    this.body.setSize(70, 40);
                    break;
                case 'emu':
                    this.setScale(0.4);
                    this.body.setSize(35, 65);
                    break;
                case 'camel':
                    this.setScale(0.35);
                    this.body.setSize(60, 55);
                    break;
                default:
                    this.setScale(0.3);
                    this.body.setSize(50, 50);
            }
        } else {
            // Fallback to colored rectangles
            const colors = {
                rock: 0x808080,
                cactus: 0x228B22,
                log: 0x8B4513,
                croc: 0x006400,
                emu: 0x8B4513,
                camel: 0xD2691E
            };
            
            const sizes = {
                rock: { w: 40, h: 50 },
                cactus: { w: 30, h: 70 },
                log: { w: 80, h: 30 },
                croc: { w: 70, h: 40 },
                emu: { w: 30, h: 65 },
                camel: { w: 55, h: 55 }
            };
            
            const size = sizes[type] || { w: 40, h: 50 };
            const color = colors[type] || 0xFF0000;
            
            this.setDisplaySize(size.w, size.h);
            this.setTint(color);
            this.body.setSize(size.w, size.h);
        }
        
        // Center the physics body
        this.body.setOffset(
            (this.width * this.scaleX - this.body.width) / 2,
            (this.height * this.scaleY - this.body.height) / 2
        );
    }
}