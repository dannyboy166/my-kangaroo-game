export default class Coin extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Check if coin texture exists, fallback to creating a circle
        const hasTexture = scene.textures.exists('coin');
        super(scene, x, y, hasTexture ? 'coin' : null);
        
        // Set up physics
        scene.physics.add.existing(this);
        
        if (hasTexture) {
            this.setScale(0.25); // Much smaller scale
            this.body.setSize(30, 30);
            this.body.setOffset(
                (this.width * this.scaleX - 30) / 2,
                (this.height * this.scaleY - 30) / 2
            );
        } else {
            // Create a yellow circle as fallback
            if (!scene.textures.exists('coin_temp')) {
                const graphics = scene.add.graphics();
                graphics.fillStyle(0xFFD700);
                graphics.fillCircle(15, 15, 15);
                graphics.generateTexture('coin_temp', 30, 30);
                graphics.destroy();
            }
            
            this.setTexture('coin_temp');
            this.body.setSize(28, 28);
            this.body.setOffset(1, 1);
        }
        
        // Disable gravity for coins
        this.body.setAllowGravity(false);
        
        // Add rotation animation
        scene.tweens.add({
            targets: this,
            angle: 360,
            duration: 2000,
            repeat: -1,
            ease: 'Linear'
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
        
        // Add subtle pulse effect
        scene.tweens.add({
            targets: this,
            scale: this.scale * 1.1,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
}