export default class PowerUp extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type) {
        // Check if texture exists
        const hasTexture = scene.textures.exists(type);
        super(scene, x, y, hasTexture ? type : '__DEFAULT');
        
        this.powerType = type;
        
        // Set up physics
        scene.physics.add.existing(this);
        this.body.setImmovable(true);
        this.body.setVelocity(0, 0);
        this.body.setSize(35, 35);
        
        if (hasTexture) {
            this.setScale(0.8);
        } else {
            // Fallback to colored shapes
            const colors = {
                shield: 0x4169E1,    // Royal Blue
                magnet: 0xFF1493,    // Deep Pink
                double: 0x9370DB     // Medium Purple
            };
            
            this.setDisplaySize(40, 40);
            this.setTint(colors[type] || 0x9370DB);
        }
        
        // Add spin animation
        scene.tweens.add({
            targets: this,
            scaleX: hasTexture ? -0.8 : -1,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Add floating animation
        scene.tweens.add({
            targets: this,
            y: y - 8,
            duration: 1800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Add glow effect
        scene.tweens.add({
            targets: this,
            scale: hasTexture ? 0.9 : 1.1,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
}