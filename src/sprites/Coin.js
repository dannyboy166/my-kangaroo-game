export default class Coin extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Check if coin texture exists, fallback to default texture
        const hasTexture = scene.textures.exists('coin');
        super(scene, x, y, hasTexture ? 'coin' : '__DEFAULT');
        
        // Set up physics
        scene.physics.add.existing(this);
        this.body.setSize(30, 30);
        
        if (hasTexture) {
            this.setScale(0.8);
        } else {
            // Fallback to yellow circle - set scale first, then size
            this.setScale(0.3); // Scale down the default texture first
            this.setDisplaySize(30, 30);
            this.setTint(0xFFD700);
        }
        
        // Add rotation animation
        scene.tweens.add({
            targets: this,
            scaleX: this.scaleX * -1,
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