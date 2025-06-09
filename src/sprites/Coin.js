export default class Coin extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'coin');
        
        // Set up physics
        scene.physics.add.existing(this, true); // Static body
        this.body.setImmovable(true);
        this.setScale(0.8);
        this.body.setSize(30, 30);
        
        // Add rotation animation
        scene.tweens.add({
            targets: this,
            scaleX: -0.8,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Add floating animation
        scene.tweens.add({
            targets: this,
            y: y - 10,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
}