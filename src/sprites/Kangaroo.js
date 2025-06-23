export default class Kangaroo extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Check if sprite exists, otherwise create without texture
        const hasSprite = scene.textures.exists('kangaroo_anim');
        super(scene, x, y, hasSprite ? 'kangaroo_anim' : null);
        
        this.scene = scene;
        this.jumpSpeed = -700;
        this.isOnGround = true;
        this.jumpCount = 0;
        this.hasDoubleJump = false;
        this.shieldCount = 0;
        this.hasSprite = hasSprite;
        
        // Set up physics
        scene.physics.add.existing(this);
        this.body.setBounce(0);
        this.body.setCollideWorldBounds(true);
        
        if (hasSprite) {
            this.setScale(0.8);
            this.body.setSize(80, 100);
            this.body.setOffset(24, 28);
            this.createAnimations();
            this.anims.play('kangaroo_run');
        } else {
            // Fallback to blue rectangle
            this.setDisplaySize(60, 80);
            this.setTint(0x3498db);
            this.body.setSize(60, 80);
        }
        
        // Set proper mass and drag
        this.body.setMass(1);
        this.body.setDragX(0);
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
        if (this.body.touching.down || this.body.blocked.down) {
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
        } else if (this.hasDoubleJump && this.jumpCount === 1 && this.body.velocity.y > -200) {
            this.body.setVelocityY(this.jumpSpeed * 0.85);
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
        // Add visual shield effect
        if (!this.shieldVisual) {
            this.shieldVisual = this.scene.add.circle(this.x, this.y, 50, 0x4169E1, 0.3);
        }
        console.log('🛡️ Shield added! Count:', this.shieldCount);
    }
    
    removeShield() {
        if (this.shieldCount > 0) {
            this.shieldCount--;
            if (this.shieldCount === 0 && this.shieldVisual) {
                this.shieldVisual.destroy();
                this.shieldVisual = null;
            }
            console.log('🛡️ Shield removed! Count:', this.shieldCount);
            return true;
        }
        return false;
    }
    
    hasShield() {
        return this.shieldCount > 0;
    }
    
    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        
        // Update shield position
        if (this.shieldVisual) {
            this.shieldVisual.x = this.x;
            this.shieldVisual.y = this.y;
        }
        
        // Check if landed
        if (this.body.touching.down || this.body.blocked.down) {
            if (!this.isOnGround) {
                this.land();
            }
        }
    }
}