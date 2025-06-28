export default class FunFactPopup extends Phaser.GameObjects.Container {
    constructor(scene, obstacleType, onClose) {
        super(scene);
        this.scene = scene;
        this.obstacleType = obstacleType;
        this.onClose = onClose;
        
        // Obstacle facts
        this.obstacleFacts = {
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

        this.obstacleEmojis = {
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

        this.createPopup();
        this.animateIn();
    }

    createPopup() {
        // Semi-transparent backdrop
        this.backdrop = this.scene.add.graphics();
        this.backdrop.fillStyle(0x000000, 0.7);
        this.backdrop.fillRect(0, 0, 800, 600);
        this.backdrop.setInteractive();
        this.add(this.backdrop);

        // Clean modern popup background
        this.popupBg = this.scene.add.graphics();
        this.popupBg.fillStyle(0x2C3E50, 1); // Dark blue-gray
        this.popupBg.fillRoundedRect(-220, -160, 440, 320, 15);
        
        // Subtle border
        this.popupBg.lineStyle(2, 0x3498DB, 1); // Light blue border
        this.popupBg.strokeRoundedRect(-220, -160, 440, 320, 15);
        this.add(this.popupBg);

        // Add subtle inner glow
        const innerGlow = this.scene.add.graphics();
        innerGlow.fillStyle(0x3498DB, 0.1);
        innerGlow.fillRoundedRect(-215, -155, 430, 310, 12);
        this.add(innerGlow);

        // Clean title
        this.titleText = this.scene.add.text(0, -130, 'DID YOU KNOW?', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#E74C3C',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add(this.titleText);

        // Get random fact and emoji
        const facts = this.obstacleFacts[this.obstacleType] || this.obstacleFacts.rock;
        const randomFact = Phaser.Utils.Array.GetRandom(facts);
        const emoji = this.obstacleEmojis[this.obstacleType] || '🪨';

        // Clean fact text
        this.factText = this.scene.add.text(0, -20, `${emoji} ${randomFact}`, {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ECF0F1',
            align: 'center',
            wordWrap: { width: 380 },
            lineSpacing: 6
        }).setOrigin(0.5);
        this.add(this.factText);

        // Clean modern button
        this.awesomeBtn = this.scene.add.graphics();
        this.awesomeBtn.fillStyle(0x27AE60, 1); // Green
        this.awesomeBtn.fillRoundedRect(-90, 90, 180, 50, 8);
        this.awesomeBtn.lineStyle(2, 0x2ECC71, 1);
        this.awesomeBtn.strokeRoundedRect(-90, 90, 180, 50, 8);
        this.add(this.awesomeBtn);

        this.awesomeBtnText = this.scene.add.text(0, 115, 'AWESOME!', {
            fontSize: '22px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add(this.awesomeBtnText);

        // Make button interactive
        const buttonBounds = new Phaser.Geom.Rectangle(-90, 90, 180, 50);
        this.awesomeBtn.setInteractive(buttonBounds, Phaser.Geom.Rectangle.Contains);
        
        this.awesomeBtn.on('pointerdown', () => {
            this.close();
        });

        this.awesomeBtn.on('pointerover', () => {
            this.awesomeBtn.clear();
            this.awesomeBtn.fillStyle(0x2ECC71, 1); // Lighter green on hover
            this.awesomeBtn.fillRoundedRect(-90, 90, 180, 50, 8);
            this.awesomeBtn.lineStyle(2, 0x27AE60, 1);
            this.awesomeBtn.strokeRoundedRect(-90, 90, 180, 50, 8);
        });

        this.awesomeBtn.on('pointerout', () => {
            this.awesomeBtn.clear();
            this.awesomeBtn.fillStyle(0x27AE60, 1); // Original green
            this.awesomeBtn.fillRoundedRect(-90, 90, 180, 50, 8);
            this.awesomeBtn.lineStyle(2, 0x2ECC71, 1);
            this.awesomeBtn.strokeRoundedRect(-90, 90, 180, 50, 8);
        });

        // Position the container in the center of the screen
        this.setPosition(400, 300);
        this.setDepth(1000); // Ensure it's on top
    }


    animateIn() {
        // Start small and invisible
        this.setScale(0);
        this.setAlpha(0);

        // Clean smooth entrance animation
        this.scene.tweens.add({
            targets: this,
            scaleX: 1,
            scaleY: 1,
            alpha: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });
    }

    close() {
        // Exit animation
        this.scene.tweens.add({
            targets: this,
            scaleX: 0,
            scaleY: 0,
            alpha: 0,
            duration: 300,
            ease: 'Back.easeIn',
            onComplete: () => {
                this.destroy();
                if (this.onClose) {
                    this.onClose();
                }
            }
        });
    }
}