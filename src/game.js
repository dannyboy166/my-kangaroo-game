class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" });
    }

    preload() {
        this.add.graphics()
            .fillStyle(0x3498db)
            .fillRect(0, 0, 60, 60)
            .generateTexture("kangaroo", 60, 60);
    }

    create() {
        this.kangaroo = this.physics.add.sprite(100, 450, "kangaroo");
        this.kangaroo.setBounce(0.2);
        this.kangaroo.setCollideWorldBounds(true);
        
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.on("pointerdown", () => this.jump());
        
        this.add.text(20, 20, "Click or SPACE to Jump!", {
            fontSize: "24px",
            fill: "#ffffff"
        });
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
            this.jump();
        }
    }
    
    jump() {
        if (this.kangaroo.body.touching.down) {
            this.kangaroo.setVelocityY(-500);
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: "#87ceeb",
    scene: GameScene,
    physics: {
        default: "arcade",
        arcade: { gravity: { y: 800 } }
    }
};

new Phaser.Game(config);
