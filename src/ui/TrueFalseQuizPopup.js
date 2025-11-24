import Button from './Button.js';

/**
 * TrueFalseQuizPopup - Bonus coin multiplier quiz popup
 * Shows a true/false question after game over
 * Correct answer = random coin multiplier applied to coins collected this run
 */
export default class TrueFalseQuizPopup extends Phaser.GameObjects.Container {
    constructor(scene, coinsCollected, onComplete) {
        super(scene);
        this.scene = scene;
        this.coinsCollected = coinsCollected; // Coins collected this run
        this.onComplete = onComplete; // Callback(bonusCoins, wasCorrect)

        // True/False questions about Australian animals and nature
        this.questions = [
            // Kangaroo facts
            { question: "Kangaroos can't walk backwards", answer: true },
            { question: "Kangaroos can swim", answer: true },
            { question: "A group of kangaroos is called a mob", answer: true },
            { question: "Kangaroos are native to Africa", answer: false },
            { question: "Baby kangaroos are called joeys", answer: true },

            // Emu facts
            { question: "Emus can fly short distances", answer: false },
            { question: "Australia lost a war against emus in 1932", answer: true },
            { question: "Emus are the world's largest birds", answer: false }, // Ostriches are
            { question: "Emus can run up to 50 km/h", answer: true },

            // Koala facts
            { question: "Koalas sleep up to 20 hours a day", answer: true },
            { question: "Koalas are bears", answer: false },
            { question: "Koalas only eat eucalyptus leaves", answer: true },
            { question: "All eucalyptus is safe for koalas to eat", answer: false }, // Only certain species

            // Crocodile facts
            { question: "Crocodiles have been around for 100 million years", answer: true },
            { question: "Crocodiles can't swim in saltwater", answer: false },
            { question: "Crocodile bites are stronger than T-Rex bites", answer: true },

            // Magpie facts
            { question: "Magpies attack humans during spring", answer: true },
            { question: "Magpies can recognize human faces", answer: true },
            { question: "All magpies swoop aggressively", answer: false },

            // Camel facts
            { question: "Australia has the largest wild camel population", answer: true },
            { question: "Camels were imported to Australia", answer: true },
            { question: "Camels can drink 100 liters in 10 minutes", answer: true },

            // Snake facts
            { question: "Australia has 20 of the world's 25 most venomous snakes", answer: true },
            { question: "All Australian snakes are deadly", answer: false },
            { question: "Snakes can blink", answer: false },

            // General Aussie facts
            { question: "Australia is home to over 2,000 spider species", answer: true },
            { question: "Funnel-web spiders can bite through toenails", answer: true },
            { question: "Dingoes are native to Australia", answer: false }, // Introduced ~4000 years ago
            { question: "Tasmania is part of Australia", answer: true }
        ];

        // Random multiplier options (weighted probabilities)
        // NOTE: Multiplier applies to BONUS only (not total)
        // e.g., collected 10 coins + 2x multiplier = 10 bonus coins (not 20 total)
        this.multiplierOptions = [
            { value: 1, weight: 40 },    // 40% chance - 1x (same amount as bonus)
            { value: 1.5, weight: 30 },  // 30% chance - 1.5x
            { value: 2, weight: 20 },    // 20% chance - 2x
            { value: 3, weight: 10 }     // 10% chance - 3x (jackpot!)
        ];

        this.createPopup();
        this.animateIn();
    }

    /**
     * Get random multiplier based on weighted probabilities
     */
    getRandomMultiplier() {
        const totalWeight = this.multiplierOptions.reduce((sum, opt) => sum + opt.weight, 0);
        const random = Math.random() * totalWeight;

        let weightSum = 0;
        for (const option of this.multiplierOptions) {
            weightSum += option.weight;
            if (random <= weightSum) {
                return option.value;
            }
        }
        return 2; // Fallback to 2x
    }

    createPopup() {
        // Semi-transparent backdrop
        this.backdrop = this.scene.add.graphics();
        this.backdrop.fillStyle(0x000000, 0.7);
        this.backdrop.fillRect(-400, -300, 800, 600);
        this.backdrop.setInteractive(new Phaser.Geom.Rectangle(-400, -300, 800, 600), Phaser.Geom.Rectangle.Contains);
        this.add(this.backdrop);

        // Pick random question
        this.currentQuestion = Phaser.Utils.Array.GetRandom(this.questions);

        // Generate random multiplier for this quiz
        this.multiplier = this.getRandomMultiplier();
        this.potentialBonus = Math.floor(this.coinsCollected * this.multiplier);

        // Create question text first (to measure height)
        const questionTextTop = -30;
        this.questionText = this.scene.add.text(0, questionTextTop, this.currentQuestion.question, {
            fontSize: '22px',
            fontFamily: 'Carter One',
            color: '#000000',
            align: 'center',
            wordWrap: { width: 300 },
            lineSpacing: 8
        }).setOrigin(0.5, 0);

        // Calculate button positions based on question height
        const questionBottom = questionTextTop + this.questionText.height;
        const trueButtonY = questionBottom + 40;
        const falseButtonY = trueButtonY + 80; // More spacing between buttons

        // Calculate panel height
        const contentTop = -125;
        const contentBottom = falseButtonY + 30;
        const totalContentHeight = contentBottom - contentTop;

        const baseYScale = 1.8;
        const baseDisplayHeight = 252; // Panel height at 1.8 scale
        const neededYScale = Math.max(baseYScale, (totalContentHeight / baseDisplayHeight) * baseYScale);

        const newDisplayHeight = (baseDisplayHeight / baseYScale) * neededYScale;
        const panelYOffset = (newDisplayHeight - baseDisplayHeight) / 2;

        // Panel background
        this.panelBg = this.scene.add.image(0, panelYOffset, 'back_days');
        this.panelBg.setScale(1.5, neededYScale);
        this.add(this.panelBg);

        // Title ribbon
        this.titleRibbon = this.scene.add.image(0, -105, 'ribbon_orange');
        this.titleRibbon.setScale(0.35);
        this.add(this.titleRibbon);

        // Title text
        this.titleText = this.scene.add.text(0, -113, 'BONUS ROUND!', {
            fontSize: '18px',
            fontFamily: 'Carter One',
            color: '#FFFFFF',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.add(this.titleText);

        // Coins collected and multiplier info - ABOVE question
        this.coinsCollectedText = this.scene.add.text(0, -70,
            `Coins This Run: ${this.coinsCollected}`, {
            fontSize: '16px',
            fontFamily: 'Carter One',
            color: '#FFD700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.add(this.coinsCollectedText);

        // Multiplier text
        const multiplierColor = this.multiplier >= 3 ? '#FF0000' : this.multiplier >= 2 ? '#FF00FF' : this.multiplier >= 1.5 ? '#00FFFF' : '#00FF00';
        this.multiplierText = this.scene.add.text(0, -50,
            `Bonus Multiplier: ${this.multiplier}x`, {
            fontSize: '18px',
            fontFamily: 'Carter One',
            color: multiplierColor,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.add(this.multiplierText);

        // Add question text to container
        this.add(this.questionText);

        // TRUE button (green)
        this.trueBtn = new Button(this.scene, 0, trueButtonY, {
            text: 'TRUE',
            bgKey: 'btn_green',
            bgScale: 0.35,
            iconKey: 'icon_ok',
            iconScale: 0.45,
            iconWidth: 24,
            gap: 5,
            textOffsetY: -5,
            textStyle: { fontSize: '24px', fontStyle: 'bold' },
            addToScene: false,
            onClick: () => this.answerQuestion(true)
        });
        this.add(this.trueBtn);

        // FALSE button (red)
        this.falseBtn = new Button(this.scene, 0, falseButtonY, {
            text: 'FALSE',
            bgKey: 'btn_red',
            bgScale: 0.35,
            iconKey: 'icon_close',
            iconScale: 0.45,
            iconWidth: 24,
            gap: 5,
            textOffsetY: -5,
            textStyle: { fontSize: '24px', fontStyle: 'bold' },
            addToScene: false,
            onClick: () => this.answerQuestion(false)
        });
        this.add(this.falseBtn);

        // Position in center
        this.setPosition(400, 300);
        this.setDepth(1000);
        this.setSize(800, 600);
    }

    answerQuestion(userAnswer) {
        const isCorrect = userAnswer === this.currentQuestion.answer;

        // Disable buttons to prevent double-clicks
        this.trueBtn.disableInteractive();
        this.falseBtn.disableInteractive();

        // Show result
        this.showResult(isCorrect);
    }

    showResult(isCorrect) {
        const bonusCoins = isCorrect ? this.potentialBonus : 0;

        // Change title ribbon color and text based on result
        if (isCorrect) {
            this.titleRibbon.setTexture('ribbon_green');
            this.titleText.setText('CORRECT! 🎉');
            this.titleText.setStyle({ color: '#FFFFFF' });
        } else {
            this.titleRibbon.setTexture('ribbon_red');
            this.titleText.setText('WRONG! 😢');
            this.titleText.setStyle({ color: '#FFFFFF' });
        }

        // Hide buttons
        this.trueBtn.setVisible(false);
        this.falseBtn.setVisible(false);

        // Hide question text
        this.questionText.setVisible(false);
        this.coinsCollectedText.setVisible(false);
        this.multiplierText.setVisible(false);

        if (isCorrect) {
            // Show animated coin + bonus text
            this.showCoinAnimation(bonusCoins);
        } else {
            // Show wrong answer message
            this.resultText = this.scene.add.text(0, -40,
                `Better luck next time!\n\nThe answer was ${this.currentQuestion.answer ? 'TRUE' : 'FALSE'}`, {
                fontSize: '20px',
                fontFamily: 'Carter One',
                color: '#AA0000',
                align: 'center',
                lineSpacing: 8
            }).setOrigin(0.5);
            this.add(this.resultText);

            // Create continue button
            this.addContinueButton(bonusCoins, isCorrect);
        }
    }

    showCoinAnimation(bonusCoins) {
        // Create animated coin sprite
        const coinSprite = this.scene.add.sprite(0, -60, 'coin', 0);
        coinSprite.setScale(2); // Start at 2x size
        coinSprite.play('coin_spin');
        this.add(coinSprite);

        // Bonus text
        this.bonusText = this.scene.add.text(0, 0,
            `+${bonusCoins} COINS!`, {
            fontSize: '32px',
            fontFamily: 'Carter One',
            color: '#FFD700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.add(this.bonusText);

        // Multiplier reminder text
        this.multiplierReminder = this.scene.add.text(0, 35,
            `(${this.multiplier}x Bonus Multiplier!)`, {
            fontSize: '18px',
            fontFamily: 'Carter One',
            color: '#00FF00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.add(this.multiplierReminder);

        // Animate coin - pulse effect
        this.scene.tweens.add({
            targets: coinSprite,
            scaleX: 2.5,
            scaleY: 2.5,
            duration: 500,
            yoyo: true,
            repeat: 2
        });

        // Animate text - fade in and pulse
        this.bonusText.setAlpha(0);
        this.scene.tweens.add({
            targets: this.bonusText,
            alpha: 1,
            duration: 300,
            delay: 200
        });

        this.multiplierReminder.setAlpha(0);
        this.scene.tweens.add({
            targets: this.multiplierReminder,
            alpha: 1,
            duration: 300,
            delay: 400,
            onComplete: () => {
                // After animation, show continue button
                this.addContinueButton(bonusCoins, true);
            }
        });
    }

    addContinueButton(bonusCoins, isCorrect) {
        const continueBtn = new Button(this.scene, 0, 90, {
            text: 'CONTINUE',
            bgKey: 'btn_blue',
            bgScale: 0.35,
            iconKey: 'icon_arrow_right',
            iconScale: 0.45,
            iconWidth: 24,
            gap: 5,
            textOffsetY: -5,
            textStyle: { fontSize: '24px', fontStyle: 'bold' },
            addToScene: false,
            onClick: () => {
                this.close(bonusCoins, isCorrect);
            }
        });
        this.add(continueBtn);
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

    close(bonusCoins, wasCorrect) {
        // Kill any existing tweens
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
                // Properly destroy all child elements
                this.removeAll(true);
                this.destroy();

                // Call completion callback with bonus coins
                if (this.onComplete) {
                    this.onComplete(bonusCoins, wasCorrect);
                }
            }
        });
    }

    destroy() {
        // Kill any running tweens
        this.scene.tweens.killTweensOf(this);

        // Remove all children and destroy them
        this.removeAll(true);

        // Call parent destroy
        super.destroy();
    }
}
