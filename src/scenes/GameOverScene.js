import GameDataManager from '../managers/GameDataManager.js';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
        this.gameDataManager = GameDataManager.getInstance();
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.audioManager = data.audioManager;
        this.obstacleType = data.obstacleType || 'rock';
        
        // Load/save high score from localStorage
        this.highScore = parseInt(localStorage.getItem('kangaroo_hop_highscore')) || 0;
        
        if (this.finalScore > this.highScore) {
            this.highScore = this.finalScore;
            localStorage.setItem('kangaroo_hop_highscore', this.highScore.toString());
            this.isNewRecord = true;
        }
    }

    create() {
        // Obstacle facts
        const obstacleFacts = {
            emu: [
                "Emus outran the Australian army in 1932.",
                "Emus can sprint at 50 km/h — good luck.",
                "Emus don't fly, but they do fight.",
                "Emus kick like they mean it.",
                "You just lost to a big angry bird.",
                "Emus swallow pebbles to help them digest food."
            ],
            camel: [
                "Camels were imported — now they rule the outback.",
                "Camels can drink 100 litres in 10 minutes.",
                "You got trampled by a desert beast.",
                "Camels don't forget… and they spit.",
                "Turns out humps don't make them friendly.",
                "Wild camels once caused so much damage, they started getting airlifted out."
            ],
            croc: [
                "Crocs launch out of water like missiles.",
                "You got chomped by a prehistoric tank.",
                "Crocodiles have been killing things for 100 million years.",
                "Their bite is stronger than a T-Rex.",
                "Rule #1: Never smile at a crocodile.",
                "A saltwater croc can swim 29 km in a day — you're not escaping."
            ],
            magpie: [
                "Magpies swoop humans every spring — you're not special.",
                "It remembered your face. And came back.",
                "Cyclists wear zip-ties to survive magpie season.",
                "You just got clapped by a black-and-white bird.",
                "Swoop! You've been magpie'd.",
                "Some magpies sing over 900 different sounds."
            ],
            log: [
                "Logs make great snake hotels. You stepped in.",
                "Wet logs = Aussie slip'n'slide of doom.",
                "Whoops — that wasn't a platform.",
                "Log 1, you 0.",
                "Nature just said 'nope.'",
                "Insects live rent-free in every Aussie log."
            ],
            rock: [
                "Australia's rocks are older than dinosaurs — and meaner.",
                "You tripped over a rock. Classic.",
                "That fall looked expensive.",
                "Rock solid mistake.",
                "Oof. That hurt to watch.",
                "Some Aussie rocks are over 3 billion years old."
            ],
            cactus: [
                "Prickly pears once took over Australia. Seriously.",
                "You just got owned by a plant.",
                "Spikes > dignity.",
                "Why were you even near that cactus?",
                "You've been cactus'd. That's a thing now.",
                "Some cacti shoot needles when touched. Nature's trap."
            ],
            koala: [
                "Koalas sleep up to 20 hours a day. You just woke one up.",
                "Ouch! That koala was not expecting visitors.",
                "You ran into a tree... with an angry tenant.",
                "Koalas aren't bears — but they do bear grudges.",
                "Boom! Straight into eucalyptus real estate.",
                "That koala's going to need therapy.",
                "Next time, try not to headbutt Australia's laziest animal."
            ],
            snake_log: [
                "Australia is home to 20 of the world's 25 most venomous snakes.",
                "Strike! You just stepped on a hissy fit.",
                "You found the wrong kind of noodle.",
                "Fun fact: Inland taipans can kill a human in under an hour. Sweet dreams!",
                "That snake was minding its business — until you flew into it.",
                "Snakes can't blink, but that one definitely judged you."
            ],
            spider_rock: [
                "Australia has over 2,000 types of spiders. Lucky you found one.",
                "Boom! Right into an 8-legged ambush.",
                "Don't worry — most Aussie spiders probably won't kill you.",
                "Yikes! That redback wasn't feeling friendly.",
                "You just met someone's worst fear.",
                "Fun fact: Funnel-web spiders can bite through toenails. Sleep tight!",
                "That spider didn't appreciate the surprise hug."
            ]
        };

        // Get random fact for this obstacle
        const facts = obstacleFacts[this.obstacleType] || obstacleFacts.rock;
        const randomFact = Phaser.Utils.Array.GetRandom(facts);

        // Add background
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x330066, 0x330066, 0x87CEEB, 0x87CEEB, 1);
        graphics.fillRect(0, 0, 800, 600);

        // Add semi-transparent overlay
        graphics.fillStyle(0x000000, 0.6);
        graphics.fillRect(0, 0, 800, 600);

        // Add coin UI (top left)
        const coinIcon = this.add.image(30, 30, 'coin');
        coinIcon.setScale(0.17);
        coinIcon.setOrigin(0, 0.5);
        
        this.coinText = this.add.text(70, 30, `${this.gameDataManager.getCoins()}`, {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.coinText.setOrigin(0, 0.5);

        // Game Over title
        const gameOverText = this.add.text(400, 150, 'GAME OVER', {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#FF4444',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Add pulsing effect to game over text
        this.tweens.add({
            targets: gameOverText,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Score display
        this.add.text(400, 220, `Score: ${this.finalScore}`, {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // High score display
        const highScoreColor = this.isNewRecord ? '#FFD700' : '#CCCCCC';
        const highScoreText = this.isNewRecord ? `NEW RECORD: ${this.highScore}!` : `Best: ${this.highScore}`;
        
        this.add.text(400, 270, highScoreText, {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: highScoreColor,
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // New record celebration
        if (this.isNewRecord) {
            // Add celebration particles
            const particles = this.add.particles(400, 270, 'coin', {
                scale: 0.3,
                speed: { min: 100, max: 200 },
                lifespan: 2000,
                quantity: 2,
                frequency: 100
            });

            // Stop particles after 3 seconds
            this.time.delayedCall(3000, () => particles.destroy());
        }

        // Obstacle fact display
        const obstacleEmojis = {
            log: '🪵',
            snake_log: '🐍',
            rock: '🪨',
            spider_rock: '🕷️', 
            cactus: '🌵',
            emu: '🦅',
            camel: '🐫',
            croc: '🐊',
            magpie: '🐦',
            koala: '🐨'
        };

        const emoji = obstacleEmojis[this.obstacleType] || '🪨';
        
        this.add.text(400, 320, `${emoji} ${randomFact}`, {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#FFAA44',
            stroke: '#000000',
            strokeThickness: 1,
            align: 'center',
            wordWrap: { width: 600 }
        }).setOrigin(0.5);

        // Play again button
        const playAgainBtn = this.add.text(400, 380, 'PLAY AGAIN', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#00FF00',
            stroke: '#000000',
            strokeThickness: 2,
            backgroundColor: '#004400',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        playAgainBtn.setInteractive({ useHandCursor: true });
        playAgainBtn.on('pointerdown', () => {
            this.audioManager?.playButtonClick();
            this.scene.start('GameScene', { audioManager: this.audioManager });
        });

        playAgainBtn.on('pointerover', () => {
            playAgainBtn.setTint(0xccffcc);
        });

        playAgainBtn.on('pointerout', () => {
            playAgainBtn.clearTint();
        });

        // Shop button
        const shopBtn = this.add.text(250, 450, 'SHOP', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#00FFFF',
            stroke: '#000000',
            strokeThickness: 2,
            backgroundColor: '#004444',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        shopBtn.setInteractive({ useHandCursor: true });
        shopBtn.on('pointerdown', () => {
            this.audioManager?.playButtonClick();
            this.scene.start('StoreScene', { audioManager: this.audioManager, from: 'GameOverScene' });
        });

        shopBtn.on('pointerover', () => {
            shopBtn.setTint(0xccffff);
        });

        shopBtn.on('pointerout', () => {
            shopBtn.clearTint();
        });

        // Menu button
        const menuBtn = this.add.text(550, 450, 'MAIN MENU', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2,
            backgroundColor: '#444400',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        menuBtn.setInteractive({ useHandCursor: true });
        menuBtn.on('pointerdown', () => {
            this.audioManager?.playButtonClick();
            this.scene.start('MenuScene');
        });

        menuBtn.on('pointerover', () => {
            menuBtn.setTint(0xffffcc);
        });

        menuBtn.on('pointerout', () => {
            menuBtn.clearTint();
        });

        // Add instruction text
        this.add.text(400, 530, 'Press SPACE to restart or click buttons above', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#CCCCCC',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);

        // Keyboard input
        this.input.keyboard.on('keydown-SPACE', () => {
            this.audioManager?.playButtonClick();
            this.scene.start('GameScene', { audioManager: this.audioManager });
        });

        this.input.keyboard.on('keydown-ESC', () => {
            this.audioManager?.playButtonClick();
            this.scene.start('MenuScene');
        });

        console.log(`Game Over! Score: ${this.finalScore}, High Score: ${this.highScore}`);
    }
}