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
                "That was a rock solid mistake.",
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
        this.backdrop.fillRect(-400, -300, 800, 600);
        this.backdrop.setInteractive(new Phaser.Geom.Rectangle(-400, -300, 800, 600), Phaser.Geom.Rectangle.Contains);
        this.add(this.backdrop);

        // Use panel from UI pack as background
        this.panelBg = this.scene.add.image(0, 0, 'panel_small');
        this.panelBg.setScale(0.55);
        this.add(this.panelBg);

        // Title ribbon
        this.titleRibbon = this.scene.add.image(0, -85, 'ribbon_orange');
        this.titleRibbon.setScale(0.35);
        this.add(this.titleRibbon);

        // Title text
        this.titleText = this.scene.add.text(0, -85, 'DID YOU KNOW?', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.add(this.titleText);

        // Get random fact and emoji
        const facts = this.obstacleFacts[this.obstacleType] || this.obstacleFacts.rock;
        const randomFact = Phaser.Utils.Array.GetRandom(facts);
        const emoji = this.obstacleEmojis[this.obstacleType] || '🪨';

        // Fact text - BLACK color
        this.factText = this.scene.add.text(0, -10, `${emoji} ${randomFact}`, {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#000000',
            align: 'center',
            wordWrap: { width: 280 },
            lineSpacing: 6
        }).setOrigin(0.5);
        this.add(this.factText);

        // Use green button from UI pack
        this.awesomeBtn = this.scene.add.image(0, 75, 'btn_green');
        this.awesomeBtn.setScale(0.45);
        this.add(this.awesomeBtn);

        // Button icon - separated a bit more from text
        this.btnIcon = this.scene.add.image(-40, 75, 'icon_ok');
        this.btnIcon.setScale(0.35);
        this.add(this.btnIcon);

        this.awesomeBtnText = this.scene.add.text(20, 75, 'GOT IT!', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.add(this.awesomeBtnText);

        // Make button interactive
        this.awesomeBtn.setInteractive({ useHandCursor: true });

        this.awesomeBtn.on('pointerdown', () => {
            this.close();
        });

        this.awesomeBtn.on('pointerover', () => {
            this.awesomeBtn.setScale(0.5);
            this.btnIcon.setScale(0.38);
            this.awesomeBtnText.setScale(1.1);
        });

        this.awesomeBtn.on('pointerout', () => {
            this.awesomeBtn.setScale(0.45);
            this.btnIcon.setScale(0.35);
            this.awesomeBtnText.setScale(1);
        });

        // Position in center
        this.setPosition(400, 300);
        this.setDepth(1000);
        this.setSize(800, 600);
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
        // FIXED: Ensure all graphics are properly cleaned up
        this.scene.tweens.killTweensOf(this);
        
        // Exit animation
        this.scene.tweens.add({
            targets: this,
            scaleX: 0,
            scaleY: 0,
            alpha: 0,
            duration: 300,
            ease: 'Back.easeIn',
            onComplete: () => {
                // FIXED: Properly destroy all child elements
                this.removeAll(true); // Remove and destroy all children
                this.destroy();
                if (this.onClose) {
                    this.onClose();
                }
            }
        });
    }

    // FIXED: Add proper cleanup method
    destroy() {
        // Kill any running tweens
        this.scene.tweens.killTweensOf(this);
        
        // Remove all children and destroy them
        this.removeAll(true);
        
        // Call parent destroy
        super.destroy();
    }
}