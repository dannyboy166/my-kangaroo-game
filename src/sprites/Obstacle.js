export default class Obstacle extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type) {
        super(scene, x, y, type);
        
        this.obstacleType = type;
        
        // Set up physics
        scene.physics.add.existing(this, true); // Static body
        this.body.setImmovable(true);
        
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
            default:
                this.setScale(0.8);
                this.body.setSize(60, 70);
        }
    }
}
