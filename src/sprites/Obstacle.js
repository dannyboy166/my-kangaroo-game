export default class Obstacle extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type) {
        // Check if texture exists
        const hasTexture = scene.textures.exists(type);
        super(scene, x, y, hasTexture ? type : '__DEFAULT');
        
        this.obstacleType = type;
        
        // Set up physics
        scene.physics.add.existing(this);
        this.body.setImmovable(true);
        this.body.setVelocity(0, 0);
        
        if (hasTexture) {
            // Set size based on type
            switch (type) {
                case 'rock':
                    this.setScale(0.8);
                    this.body.setSize(60, 70);
                    break;
                case 'cactus':
                    this.setScale(0.9);
                    this.body.setSize(50, 90);
                    break;
                case 'log':
                    this.setScale(0.8);
                    this.body.setSize(100, 50);
                    break;
                case 'croc':
                    this.setScale(0.8);
                    this.body.setSize(80, 60);
                    break;
                case 'emu':
                    this.setScale(0.9);
                    this.body.setSize(50, 80);
                    break;
                case 'camel':
                    this.setScale(0.8);
                    this.body.setSize(70, 70);
                    break;
                default:
                    this.setScale(0.8);
                    this.body.setSize(60, 70);
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
                rock: { w: 50, h: 70 },
                cactus: { w: 40, h: 90 },
                log: { w: 100, h: 40 },
                croc: { w: 80, h: 50 },
                emu: { w: 40, h: 80 },
                camel: { w: 60, h: 70 }
            };
            
            const size = sizes[type] || { w: 50, h: 70 };
            const color = colors[type] || 0xFF0000;
            
            this.setDisplaySize(size.w, size.h);
            this.setTint(color);
            this.body.setSize(size.w, size.h);
        }
    }
}