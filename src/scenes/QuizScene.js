import QuestionManager from '../managers/QuestionManager.js';

export default class QuizScene extends Phaser.Scene {
    constructor() {
        super({ key: 'QuizScene' });
        this.questionManager = QuestionManager.getInstance();
        this.currentQuestions = [];
        this.currentQuestionIndex = 0;
        this.correctAnswers = 0;
        this.requiredCorrect = 3;
        this.totalQuestions = 5;
        this.selectedAnswer = -1;
        this.isAnswerSelected = false;
    }

    init(data) {
        this.audioManager = data.audioManager;
        this.onQuizComplete = data.onQuizComplete; // Callback when quiz finishes
        this.requiredCorrect = data.requiredCorrect || 3;
        this.totalQuestions = data.totalQuestions || 5;
    }

    async create() {
        // Initialize question manager if needed
        if (!this.questionManager.isInitialized) {
            await this.questionManager.initialize('test_user', 'test_token');
        }

        // Get questions for the quiz
        this.currentQuestions = this.questionManager.getQuizQuestions(
            this.totalQuestions,
            this.requiredCorrect
        );

        if (this.currentQuestions.length === 0) {
            this.showNoQuestionsMessage();
            return;
        }

        this.createUI();
        this.displayCurrentQuestion();


        // ADD KEYBOARD CONTROLS HERE:
        this.cursors = this.input.keyboard.createCursorKeys();
        this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
        this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
        this.key4 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    createUI() {
        // Background
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x39cef9, 0x39cef9, 0x7dd9fc, 0x7dd9fc, 1);
        graphics.fillRect(0, 0, 800, 600);

        // Quiz header
        this.add.text(400, 40, 'KNOWLEDGE CHALLENGE', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#FF6B35',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Progress indicator
        this.progressText = this.add.text(400, 80, '', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Question container
        this.questionContainer = this.add.container(400, 300);

        // Score display
        this.scoreText = this.add.text(50, 50, '', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 1
        });

        this.updateProgressDisplay();


    }

    displayCurrentQuestion() {
        // Clear previous question
        this.questionContainer.removeAll(true);
        this.selectedAnswer = -1;
        this.isAnswerSelected = false;

        const question = this.currentQuestions[this.currentQuestionIndex];

        // Question text background
        const questionBg = this.add.graphics();
        questionBg.fillStyle(0x2C3E50, 0.9);
        questionBg.fillRoundedRect(-350, -100, 700, 120, 10);
        questionBg.lineStyle(2, 0x3498DB, 1);
        questionBg.strokeRoundedRect(-350, -100, 700, 120, 10);
        this.questionContainer.add(questionBg);

        // Question text
        const questionText = this.add.text(0, -40, question.queText, {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            align: 'center',
            wordWrap: { width: 650 },
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);
        this.questionContainer.add(questionText);

        // Answer options
        this.createAnswerOptions(question);

        // Next/Submit button (initially hidden)
        this.createNextButton();

        this.updateProgressDisplay();
    }

    createAnswerOptions(question) {
        const optionStartY = 50;
        const optionSpacing = 80;
        this.answerButtons = [];

        question.options.forEach((option, index) => {
            if (!option.answer || option.answer.trim() === '') return; // Skip empty options

            const y = optionStartY + (index * optionSpacing);

            // Option background
            const optionBg = this.add.graphics();
            optionBg.fillStyle(0x34495E, 0.8);
            optionBg.fillRoundedRect(-330, -25, 660, 60, 8);
            optionBg.lineStyle(2, 0x95A5A6, 0.5);
            optionBg.strokeRoundedRect(-330, -25, 660, 60, 8);
            optionBg.y = y;
            this.questionContainer.add(optionBg);

            // Option letter (A, B, C, D)
            const optionLetter = this.add.text(-300, y, String.fromCharCode(65 + index), {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#3498DB',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);
            this.questionContainer.add(optionLetter);

            // Option text
            const optionText = this.add.text(-250, y, option.answer, {
                fontSize: '18px',
                fontFamily: 'Arial',
                color: '#FFFFFF',
                wordWrap: { width: 500 },
                stroke: '#000000',
                strokeThickness: 1
            }).setOrigin(0, 0.5);
            this.questionContainer.add(optionText);

            // Make option interactive
            const optionButton = {
                bg: optionBg,
                letter: optionLetter,
                text: optionText,
                index: index
            };

            optionBg.setInteractive(new Phaser.Geom.Rectangle(-330, -25, 660, 60), Phaser.Geom.Rectangle.Contains);

            optionBg.on('pointerdown', () => {
                this.selectAnswer(index);
            });

            optionBg.on('pointerover', () => {
                if (this.selectedAnswer !== index && !this.isAnswerSelected) {
                    optionBg.clear();
                    optionBg.fillStyle(0x5D6D7E, 0.8);
                    optionBg.fillRoundedRect(-330, -25, 660, 60, 8);
                    optionBg.lineStyle(2, 0x3498DB, 0.8);
                    optionBg.strokeRoundedRect(-330, -25, 660, 60, 8);
                }
            });

            optionBg.on('pointerout', () => {
                if (this.selectedAnswer !== index && !this.isAnswerSelected) {
                    optionBg.clear();
                    optionBg.fillStyle(0x34495E, 0.8);
                    optionBg.fillRoundedRect(-330, -25, 660, 60, 8);
                    optionBg.lineStyle(2, 0x95A5A6, 0.5);
                    optionBg.strokeRoundedRect(-330, -25, 660, 60, 8);
                }
            });

            this.answerButtons.push(optionButton);
        });
    }

    selectAnswer(answerIndex) {
        if (this.isAnswerSelected) return;

        this.selectedAnswer = answerIndex;

        // Highlight selected answer
        this.answerButtons.forEach((button, index) => {
            button.bg.clear();
            if (index === answerIndex) {
                button.bg.fillStyle(0x3498DB, 0.8);
                button.bg.fillRoundedRect(-330, -25, 660, 60, 8);
                button.bg.lineStyle(2, 0x2980B9, 1);
                button.bg.strokeRoundedRect(-330, -25, 660, 60, 8);
            } else {
                button.bg.fillStyle(0x34495E, 0.8);
                button.bg.fillRoundedRect(-330, -25, 660, 60, 8);
                button.bg.lineStyle(2, 0x95A5A6, 0.5);
                button.bg.strokeRoundedRect(-330, -25, 660, 60, 8);
            }
        });

        // Show next button
        this.nextButton.setVisible(true);
        this.nextButtonText.setVisible(true);
    }

    createNextButton() {
        // Next/Submit button
        this.nextButton = this.add.graphics();
        this.nextButton.fillStyle(0x27AE60, 1);
        this.nextButton.fillRoundedRect(-80, -20, 160, 40, 8);
        this.nextButton.lineStyle(2, 0x2ECC71, 1);
        this.nextButton.strokeRoundedRect(-80, -20, 160, 40, 8);
        this.nextButton.y = 400;
        this.nextButton.setVisible(false);
        this.questionContainer.add(this.nextButton);

        const buttonText = this.currentQuestionIndex < this.currentQuestions.length - 1 ? 'NEXT' : 'FINISH';
        this.nextButtonText = this.add.text(0, 400, buttonText, {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.nextButtonText.setVisible(false);
        this.questionContainer.add(this.nextButtonText);

        // Make button interactive
        this.nextButton.setInteractive(new Phaser.Geom.Rectangle(-80, -20, 160, 40), Phaser.Geom.Rectangle.Contains);
        this.nextButton.on('pointerdown', () => {
            this.submitAnswer();
        });

        this.nextButton.on('pointerover', () => {
            this.nextButton.clear();
            this.nextButton.fillStyle(0x2ECC71, 1);
            this.nextButton.fillRoundedRect(-80, -20, 160, 40, 8);
            this.nextButton.lineStyle(2, 0x27AE60, 1);
            this.nextButton.strokeRoundedRect(-80, -20, 160, 40, 8);
        });

        this.nextButton.on('pointerout', () => {
            this.nextButton.clear();
            this.nextButton.fillStyle(0x27AE60, 1);
            this.nextButton.fillRoundedRect(-80, -20, 160, 40, 8);
            this.nextButton.lineStyle(2, 0x2ECC71, 1);
            this.nextButton.strokeRoundedRect(-80, -20, 160, 40, 8);
        });
    }

    submitAnswer() {
        if (this.selectedAnswer === -1 || this.isAnswerSelected) return;

        this.isAnswerSelected = true;
        const question = this.currentQuestions[this.currentQuestionIndex];
        const isCorrect = this.selectedAnswer === question.correctOption;

        if (isCorrect) {
            this.correctAnswers++;
            this.audioManager?.playCoinCollect(); // Reuse coin sound for correct answers
        } else {
            this.audioManager?.playCollision(); // Reuse collision sound for wrong answers
        }

        // Record answer in question manager
        this.questionManager.onQuestionAnswered(question, isCorrect);

        // Show correct answer
        this.showAnswerResult(isCorrect, question.correctOption);

        // Move to next question or finish quiz
        this.time.delayedCall(2000, () => {
            this.currentQuestionIndex++;

            if (this.currentQuestionIndex < this.currentQuestions.length) {
                this.displayCurrentQuestion();
            } else {
                this.finishQuiz();
            }
        });
    }

    showAnswerResult(isCorrect, correctOptionIndex) {
        // Highlight correct answer in green
        if (correctOptionIndex < this.answerButtons.length) {
            const correctButton = this.answerButtons[correctOptionIndex];
            correctButton.bg.clear();
            correctButton.bg.fillStyle(0x27AE60, 0.8);
            correctButton.bg.fillRoundedRect(-330, -25, 660, 60, 8);
            correctButton.bg.lineStyle(2, 0x2ECC71, 1);
            correctButton.bg.strokeRoundedRect(-330, -25, 660, 60, 8);
        }

        // If wrong answer selected, highlight it in red
        if (!isCorrect && this.selectedAnswer < this.answerButtons.length) {
            const wrongButton = this.answerButtons[this.selectedAnswer];
            wrongButton.bg.clear();
            wrongButton.bg.fillStyle(0xE74C3C, 0.8);
            wrongButton.bg.fillRoundedRect(-330, -25, 660, 60, 8);
            wrongButton.bg.lineStyle(2, 0xC0392B, 1);
            wrongButton.bg.strokeRoundedRect(-330, -25, 660, 60, 8);
        }

        // Show result text
        const resultText = isCorrect ? 'Correct!' : 'Wrong!';
        const resultColor = isCorrect ? '#27AE60' : '#E74C3C';

        const result = this.add.text(0, -150, resultText, {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: resultColor,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.questionContainer.add(result);

        // Animate result text
        this.tweens.add({
            targets: result,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 300,
            yoyo: true,
            repeat: 1
        });
    }

    updateProgressDisplay() {
        this.progressText.setText(`Question ${this.currentQuestionIndex + 1} of ${this.currentQuestions.length}`);
        this.scoreText.setText(`Correct: ${this.correctAnswers}/${this.requiredCorrect} needed`);
    }

    finishQuiz() {
        const passed = this.correctAnswers >= this.requiredCorrect;

        // Clear the scene
        this.questionContainer.removeAll(true);

        // Show final result
        const resultTitle = passed ? 'QUIZ PASSED!' : 'QUIZ FAILED!';
        const resultColor = passed ? '#27AE60' : '#E74C3C';
        this.add.text(400, 200, resultTitle, {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: resultColor,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Show score breakdown
        this.add.text(400, 280, `You answered ${this.correctAnswers} out of ${this.currentQuestions.length} questions correctly`, {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        if (passed) {
            this.add.text(400, 320, 'Great job! You can continue your adventure!', {
                fontSize: '20px',
                fontFamily: 'Arial',
                color: '#27AE60',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);
        } else {
            this.add.text(400, 320, `You needed ${this.requiredCorrect} correct answers to pass`, {
                fontSize: '20px',
                fontFamily: 'Arial',
                color: '#E74C3C',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);
        }

        // Continue button
        const continueButton = this.add.text(400, 450, 'CONTINUE', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2,
            backgroundColor: passed ? '#27AE60' : '#3498DB',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5);

        continueButton.setInteractive({ useHandCursor: true });
        continueButton.on('pointerdown', () => {
            this.audioManager?.playButtonClick();

            // Call the completion callback
            if (this.onQuizComplete) {
                this.onQuizComplete(passed);
            }
        });

        continueButton.on('pointerover', () => {
            continueButton.setScale(1.1);
        });

        continueButton.on('pointerout', () => {
            continueButton.setScale(1);
        });

        // Play appropriate sound
        if (passed) {
            this.audioManager?.playCoinCollect();
        } else {
            this.audioManager?.playGameOver();
        }

        // Add celebration particles if passed
        if (passed) {
            const particles = this.add.particles(400, 200, 'coin', {
                scale: 0.2,
                speed: { min: 100, max: 200 },
                lifespan: 3000,
                quantity: 3,
                frequency: 200
            });

            this.time.delayedCall(5000, () => particles.destroy());
        }
    }

    showNoQuestionsMessage() {
        this.add.text(400, 250, 'No Questions Available', {
            fontSize: '36px',
            fontFamily: 'Arial',
            color: '#E74C3C',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.add.text(400, 300, 'Please try again later or check your connection', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const backButton = this.add.text(400, 400, 'BACK TO GAME', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2,
            backgroundColor: '#3498DB',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        backButton.setInteractive({ useHandCursor: true });
        backButton.on('pointerdown', () => {
            this.audioManager?.playButtonClick();
            if (this.onQuizComplete) {
                this.onQuizComplete(true); // Allow continuation even without questions
            }
        });
    }


    update() {
        // Safety check for keyboard keys
        if (!this.key1 || !this.key2 || !this.key3 || !this.key4 || !this.enterKey) {
            return;
        }

        if (!this.isAnswerSelected && this.currentQuestions.length > 0) {
            // Allow keyboard selection of answers
            if (Phaser.Input.Keyboard.JustDown(this.key1)) {
                this.selectAnswer(0);
            } else if (Phaser.Input.Keyboard.JustDown(this.key2)) {
                this.selectAnswer(1);
            } else if (Phaser.Input.Keyboard.JustDown(this.key3)) {
                this.selectAnswer(2);
            } else if (Phaser.Input.Keyboard.JustDown(this.key4)) {
                this.selectAnswer(3);
            }
        }

        // Allow Enter to submit answer
        if (Phaser.Input.Keyboard.JustDown(this.enterKey) && this.selectedAnswer !== -1 && !this.isAnswerSelected) {
            this.submitAnswer();
        }
    }

    shutdown() {
        // Clean up resources
        if (this.currentQuestions) {
            this.currentQuestions.forEach(q => {
                q.isUsing = false; // Release questions back to pool
            });
        }

        this.currentQuestions = [];
        this.answerButtons = [];
    }
}