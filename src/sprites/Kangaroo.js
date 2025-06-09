export default class Kangaroo extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Check if sprite exists, otherwise create without texture
        const hasSprite = scene.textures.exists('kangaroo_anim');
        super(scene, x, y, hasSprite ? 'kangaroo_anim' : null);
        
        this.scene = scene;
        this.jumpSpeed = -600;
        this.isOnGround = true;
        this.jumpCount = 0;
        this.hasDoubleJump = false;
        this.shieldCount = 0;
        this.hasSprite = hasSprite;
        
        // Set up physics
        scene.physics.add.existing(this);
        this.body.setBounce(0.3);
        this.body.setCollideWorldBounds(true);
        this.body.setSize(60, 30); // Collision box
        
        if (hasSprite) {
            this.setScale(1.1);
            this.createAnimations();
            this.anims.play('kangaroo_run');
        } else {
            // Fallback to blue rectangle
            this.setDisplaySize(60, 60);
            this.setTint(0x3498db);
        }
    }
    
    createAnimations() {
        if (!this.scene.anims.exists('kangaroo_run')) {
            this.scene.anims.create({
                key: 'kangaroo_run',
                frames: this.scene.anims.generateFrameNumbers('kangaroo_anim', { start: 0, end: 11 }),
                frameRate: 12,
                repeat: -1
            });
        }
        
        if (!this.scene.anims.exists('kangaroo_jump')) {
            this.scene.anims.create({
                key: 'kangaroo_jump',
                frames: [{ key: 'kangaroo_anim', frame: 2 }],
                frameRate: 1
            });
        }
    }
    
    jump() {
        if (this.isOnGround) {
            this.body.setVelocityY(this.jumpSpeed);
            this.isOnGround = false;
            this.jumpCount = 1;
            
            if (this.hasSprite) {
                this.anims.play('kangaroo_jump');
            } else {
                // Visual feedback for rectangle
                this.setTint(0xFFFFFF);
                this.scene.time.delayedCall(100, () => {
                    this.setTint(0x3498db);
                });
            }
            
            window.GameData.audioManager.playJump();
            console.log('🚀 Jump!');
        } else if (this.hasDoubleJump && this.jumpCount === 1) {
            this.body.setVelocityY(this.jumpSpeed * 0.75);
            this.jumpCount = 2;
            window.GameData.audioManager.playDoubleJump();
            console.log('🚀 Double Jump!');
        }
    }
    
    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        
        // Check if landed
        if (this.body.touching.down || this.body.blocked.down) {
            if (!this.isOnGround) {
                this.land();
            }
        }
    }
    
    land() {
        this.isOnGround = true;
        this.jumpCount = 0;
        
        if (this.hasSprite) {
            this.anims.play('kangaroo_run');
        }
        
        window.GameData.audioManager.playLand();
        console.log('📍 Landed!');
    }
    
    addShield() {
        this.shieldCount++;
        // Visual shield effect would go here
        console.log('🛡️ Shield added! Count:', this.shieldCount);
    }
    
    removeShield() {
        if (this.shieldCount > 0) {
            this.shieldCount--;
            console.log('🛡️ Shield removed! Count:', this.shieldCount);
            return true;
        }
        return false;
    }
    
    hasShield() {
        return this.shieldCount > 0;
    }
}