export default class PowerUp extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type) {
        super(scene, x, y, type);
        
        this.powerType = type;
        
        // Set up physics
        scene.physics.add.existing(this, true); // Static body
        this.body.setImmovable(true);
        this.setScale(0.8);
        this.body.setSize(35, 35);
        
        // Add spin animation
        scene.tweens.add({
            targets: this,
            scaleX: -0.8,
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
            scale: 0.9,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
}