// Question Manager - Similar to Unity's QAManager
class QuestionManager {
    // In your QuestionManager.js constructor, update the URLs:

    // Replace your QuestionManager constructor with this:

    constructor() {
        this.allCategories = [];
        this.isInitialized = false;
        this.isTesting = false; // Use real server

        // API endpoints matching your WorldWise backend
        this.baseURL = 'http://admin.worldwiseapp.com.au/backend';
        this.endpoints = {
            categories: '/category-list',
            questions: '/questions'
        };
    }

    // Singleton pattern like Unity version
    static getInstance() {
        if (!QuestionManager.instance) {
            QuestionManager.instance = new QuestionManager();
        }
        return QuestionManager.instance;
    }

    // Initialize the question system
    async initialize(userId, accessToken) {
        if (this.isInitialized) return;

        try {
            // Load saved categories from localStorage (like Unity's PlayerStatistics)
            this.loadSavedCategories();

            // Fetch categories from server
            await this.fetchCategories(userId, accessToken);

            // Load questions for each category
            await this.loadQuestionsForCategories(userId, accessToken);

            this.isInitialized = true;
        } catch (error) {
            console.error('❌ Failed to initialize Question Manager:', error);
            this.isTesting = true;
            this.createDummyCategories();
        }
    }

    // Fetch categories from server (similar to Unity's FetchCategory)
    async fetchCategories(userId, accessToken) {
        if (this.isTesting) {
            this.createDummyCategories();
            return;
        }

        try {
            const formData = new FormData();
            formData.append('user_id', userId.toString());
            formData.append('access_token', accessToken);

            const response = await fetch(`${this.baseURL}${this.endpoints.categories}`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (parseInt(data.error) === 0) {
                this.updateCategories(data.data);
                this.saveCategoriesToStorage();
            } else {
                console.error('Server error:', data.message);
            }
        } catch (error) {
            console.error('❌ Error fetching categories:', error);
        }
    }

    // Fetch questions for a specific category (similar to Unity's FetchQuestions)
    async fetchQuestions(category, userId, accessToken) {
        if (this.isTesting) {
            category.level.isFetching = false;
            return;
        }

        if (category.level.isFetching) return;

        category.level.isFetching = true;

        try {
            const formData = new FormData();
            formData.append('user_id', userId.toString());
            formData.append('access_token', accessToken);
            formData.append('academic_level', category.currentLevel.toString());
            formData.append('category_id', category.category_id);

            const response = await fetch(`${this.baseURL}${this.endpoints.questions}`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (parseInt(data.error) === 0) {
                const questions = data.data.map(qData => new Question(qData, category));
                category.level.setBank(questions);
                this.saveCategory(category);
            } else {
                console.error('Server error:', data.message);
            }
        } catch (error) {
            console.error('❌ Error fetching questions:', error);
        } finally {
            category.level.isFetching = false;
        }
    }

    // Load questions for all categories
    async loadQuestionsForCategories(userId, accessToken) {
        for (const category of this.allCategories) {
            category.loadLevel();
            if (!category.level.isFetched || category.level.bank.length === 0) {
                await this.fetchQuestions(category, userId, accessToken);
            }
        }
    }

    // Generate questions for quiz (similar to Unity's GenerateQuestionaries)
    generateQuestions(count) {
        const selectedQuestions = [];
        let attempts = 0;
        const maxAttempts = count * 2; // Prevent infinite loop

        while (selectedQuestions.length < count && attempts < maxAttempts) {
            attempts++;

            // Get available categories with questions
            const availableCategories = this.allCategories.filter(cat =>
                cat.availableQuesCount > 0
            );

            if (availableCategories.length === 0) {
                break;
            }

            // Select random category weighted by progress (like Unity version)
            const category = this.selectWeightedCategory(availableCategories);
            const availableQuestions = category.level.getAvailableQuestions();

            if (availableQuestions.length > 0) {
                const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
                randomQuestion.isUsing = true;
                selectedQuestions.push(randomQuestion);
            }
        }

        return selectedQuestions;
    }

    // Select category weighted by progress (inverse weighting - less progress = more questions)
    selectWeightedCategory(categories) {
        const weights = categories.map(cat => 100 - cat.progress); // Inverse weighting
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

        let random = Math.random() * totalWeight;

        for (let i = 0; i < categories.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return categories[i];
            }
        }

        return categories[0]; // Fallback
    }

    // Handle question answer (similar to Unity's OnQuestionAnswered)
    onQuestionAnswered(question, isCorrect) {
        question.isUsing = false;
        question.category.onQuestionAnswered(question, isCorrect);
        this.saveCategory(question.category);
    }

    // Storage methods (replacing Unity's file system)
    saveCategory(category) {
        const key = `kangaroo_category_${category.fileName}`;
        localStorage.setItem(key, JSON.stringify(category.level));
    }

    loadSavedCategories() {
        const savedCategories = localStorage.getItem('kangaroo_categories');
        if (savedCategories) {
            this.allCategories = JSON.parse(savedCategories);
        }
    }

    saveCategoriesToStorage() {
        localStorage.setItem('kangaroo_categories', JSON.stringify(this.allCategories));
    }

    updateCategories(categoryData) {
        this.allCategories = categoryData.map(data => new Category(data.category_id, data.category_name, 1));
    }

    // Create dummy data for testing
    createDummyCategories() {
        this.allCategories = [
            new Category(1, 'Math', 1),
            new Category(2, 'Science', 1),
            new Category(3, 'Geography', 1)
        ];

        // Add dummy questions
        this.allCategories.forEach(category => {
            category.loadLevel();

            // In testing mode, always create fresh dummy questions
            const dummyQuestions = this.createDummyQuestions(category, 10);
            category.level.setBank(dummyQuestions);
        });
    }

    createDummyQuestions(category, count) {
        const questions = [];
        for (let i = 0; i < count; i++) {
            const questionData = {
                question_id: `${category.category_id}_${i}`,
                category_id: category.category_id.toString(),
                question: `Sample question ${i + 1} for ${category.category_name}?`,
                option_1: 'Option A',
                option_2: 'Option B',
                option_3: 'Option C',
                option_4: 'Option D',
                answer: (Math.floor(Math.random() * 4) + 1).toString()
            };
            questions.push(new Question(questionData, category));
        }
        return questions;
    }

    // Get quiz questions for game
    getQuizQuestions(questionCount = 5, requiredCorrect = 3) {
        if (this.isTesting) {
            return this.generateQuestions(questionCount);
        }

        const questions = this.generateQuestions(questionCount);

        if (questions.length < requiredCorrect) {
            // Reset question usage flags
            questions.forEach(q => q.isUsing = false);
            return [];
        }

        return questions;
    }
}

// Category class (similar to Unity's Categories)
class Category {
    constructor(id, name, currentLevel = 1) {
        this.category_id = id;
        this.category_name = name;
        this.currentLevel = currentLevel;
        this.level = null;
    }

    get fileName() {
        return `${this.category_name}${this.currentLevel}`;
    }

    get progress() {
        return this.level ? this.level.progress : 0;
    }

    get availableQuesCount() {
        return this.level ? this.level.availableQuesCount : 0;
    }

    loadLevel() {
        // Try to load from localStorage first
        const key = `kangaroo_category_${this.fileName}`;
        const savedLevel = localStorage.getItem(key);

        if (savedLevel) {
            this.level = new AcademicLevel(this.currentLevel);
            Object.assign(this.level, JSON.parse(savedLevel));
        } else {
            this.level = new AcademicLevel(this.currentLevel);
        }

        this.level.setCategory(this);
    }

    onQuestionAnswered(question, isCorrect) {
        this.level.onQuestionAnswered(question, isCorrect);
    }
}

// Academic Level class (similar to Unity's AcademicLevel)
class AcademicLevel {
    constructor(levelID) {
        this.levelID = levelID;
        this.totalQuestions = 0;
        this.totalCorrectAnswered = 0;
        this.counter = 0;
        this.isFetched = false;
        this.isFetching = false;
        this.bank = [];
    }

    get performance() {
        if (this.counter > 0) {
            return Math.round((this.totalCorrectAnswered / this.totalQuestions) * 100);
        }
        return 0;
    }

    get progress() {
        if (this.bank.length === 0) return 0;

        const clearedQuestions = this.bank.filter(q => q.isCleared).length;
        return Math.round((clearedQuestions / this.bank.length) * 100);
    }

    get availableQuesCount() {
        return this.bank.filter(q => !q.isCleared && !q.isUsing).length;
    }

    getAvailableQuestions() {
        return this.bank.filter(q => !q.isCleared && !q.isUsing);
    }

    setBank(questions) {
        if (!this.bank) this.bank = [];

        questions.forEach(q => {
            if (!this.bank.find(existing => existing.question_id === q.question_id)) {
                this.bank.push(q);
            }
        });

        this.totalQuestions = this.bank.length;
        this.isFetched = true;
    }

    setCategory(category) {
        if (!this.bank) {
            this.bank = [];
            return;
        }

        this.bank.forEach(q => {
            q.category = category;
            q.isUsing = false;
        });
    }

    onQuestionAnswered(question, isCorrect) {
        question.isUsing = false;

        if (isCorrect) {
            question.isCleared = true;
            this.totalCorrectAnswered++;
            this.counter = Math.max(1, this.counter + 1);

            // Level promotion logic (like Unity version)
            if (this.counter >= 10 || this.progress >= 99) {
                this.promoteLevel(1, question.category);
            }
        } else {
            this.counter = Math.max(0, this.counter - 1);
            if (this.counter <= -4 && this.levelID > 1) {
                this.promoteLevel(-1, question.category);
            }
        }
    }

    promoteLevel(value, category) {
        // Implementation would depend on your game's progression system
    }
}

// Question class (similar to Unity's Questions)
class Question {
    constructor(questionData, category) {
        this.question_id = parseInt(questionData.question_id);
        this.category_id = parseInt(questionData.category_id);
        this.queText = questionData.question;
        this.queURI = questionData.question_image || '';

        this.options = [
            new Option(questionData.option_1, questionData.imgoption_1),
            new Option(questionData.option_2, questionData.imgoption_2),
            new Option(questionData.option_3, questionData.imgoption_3),
            new Option(questionData.option_4, questionData.imgoption_4)
        ];

        this.correctOption = questionData.answer ? parseInt(questionData.answer) - 1 : 0;
        this.isCleared = false;
        this.isUsing = false;
        this.category = category;
    }

    preloadImage() {
        if (this.queURI && !this.queImage) {
            // Implement image loading for Phaser
        }

        this.options.forEach(opt => opt.preloadImage());
    }
}

// Option class (similar to Unity's Option)
class Option {
    constructor(answer, imgUrl) {
        this.answer = answer || '';
        this.imgUrl = imgUrl || '';
        this.image = null;
    }

    preloadImage() {
        if (this.imgUrl && !this.image) {
            // Implement image loading for Phaser
        }
    }
}

// Export for use in your Phaser game
export default QuestionManager;