export default class PowerUp extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type) {
        // Check if texture exists
        const hasTexture = scene.textures.exists(type);
        super(scene, x, y, hasTexture ? type : null);
        
        this.powerType = type;
        
        // Set up physics
        scene.physics.add.existing(this);
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
        
        if (hasTexture) {
            this.setScale(0.6);
            this.body.setSize(50, 50);
            this.body.setOffset(39, 39);
        } else {
            // Fallback to colored shapes
            const colors = {
                shield: 0x4169E1,    // Royal Blue
                magnet: 0xFF1493,    // Deep Pink
                double: 0x9370DB     // Medium Purple
            };
            
            // Create a star shape for power-ups
            const graphics = scene.add.graphics();
            const color = colors[type] || 0x9370DB;
            
            graphics.fillStyle(color);
            graphics.beginPath();
            
            // Draw star
            const centerX = 25;
            const centerY = 25;
            const outerRadius = 25;
            const innerRadius = 12;
            const points = 5;
            
            for (let i = 0; i < points * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (i * Math.PI) / points;
                const x = centerX + Math.sin(angle) * radius;
                const y = centerY - Math.cos(angle) * radius;
                
                if (i === 0) {
                    graphics.moveTo(x, y);
                } else {
                    graphics.lineTo(x, y);
                }
            }
            
            graphics.closePath();
            graphics.fillPath();
            
            graphics.generateTexture(type + '_temp', 50, 50);
            graphics.destroy();
            
            this.setTexture(type + '_temp');
            this.body.setSize(45, 45);
            this.body.setOffset(2.5, 2.5);
        }
        
        // Add spin animation
        scene.tweens.add({
            targets: this,
            angle: 360,
            duration: 3000,
            repeat: -1,
            ease: 'Linear'
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
        
        // Add glow effect with scale
        scene.tweens.add({
            targets: this,
            scale: this.scale * 1.2,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Add particle effect
        const particles = scene.add.particles(x, y);
        const emitter = particles.createEmitter({
            x: 0,
            y: 0,
            speed: { min: 20, max: 50 },
            scale: { start: 0.3, end: 0 },
            blendMode: 'ADD',
            lifespan: 1000,
            quantity: 1,
            frequency: 200,
            tint: colors[type] || 0x9370DB
        });
        
        // Make particles follow the power-up
        scene.tweens.add({
            targets: particles,
            x: x,
            y: y - 8,
            duration: 1800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Store reference to destroy particles when collected
        this.particleEmitter = particles;
    }
    
    destroy() {
        if (this.particleEmitter) {
            this.particleEmitter.destroy();
        }
        super.destroy();
    }
}