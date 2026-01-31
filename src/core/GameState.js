export class GameState {
    constructor() {
        this.state = 'MENU'; // MENU, PLAYING, GAME_OVER
        this.score = 0;
        this.gems = 0;
        this.highScore = this.loadHighScore();
        this.perfectCombo = 0;
        this.maxCombo = 0;

        // Difficulty progression
        this.passedRings = 0;
        this.difficultyLevel = 1;
    }

    loadHighScore() {
        const saved = localStorage.getItem('endless_drop_highscore');
        return saved ? parseInt(saved) : 0;
    }

    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('endless_drop_highscore', this.highScore.toString());
        }
    }

    addScore(points) {
        this.score += points;
    }

    addPerfectPass() {
        this.perfectCombo++;

        // Exponential scoring for combos
        const comboMultiplier = Math.pow(2, Math.min(this.perfectCombo - 1, 5));
        this.addScore(comboMultiplier);

        if (this.perfectCombo > this.maxCombo) {
            this.maxCombo = this.perfectCombo;
        }
    }

    breakCombo() {
        this.perfectCombo = 0;
    }

    addGem() {
        this.gems++;
    }

    ringPassed() {
        this.passedRings++;
        this.addScore(1);

        // Increase difficulty every 10 rings
        if (this.passedRings % 10 === 0) {
            this.difficultyLevel++;
            return true; // Signal difficulty increase
        }
        return false;
    }

    gameOver() {
        this.state = 'GAME_OVER';
        this.saveHighScore();
    }

    reset() {
        this.state = 'PLAYING';
        this.score = 0;
        this.passedRings = 0;
        this.perfectCombo = 0;
        this.difficultyLevel = 1;
    }

    getState() {
        return {
            state: this.state,
            score: this.score,
            highScore: this.highScore,
            gems: this.gems,
            combo: this.perfectCombo,
            maxCombo: this.maxCombo
        };
    }
}
