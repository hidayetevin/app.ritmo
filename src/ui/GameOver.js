export class GameOver {
    constructor(onRestart, onMenu) {
        this.onRestart = onRestart;
        this.onMenu = onMenu;
        this.container = null;
    }

    show(score, highScore, gems, maxCombo) {
        if (this.container) {
            this.updateStats(score, highScore, gems, maxCombo);
            this.container.style.display = 'flex';
            return;
        }

        this.container = document.createElement('div');
        this.container.id = 'game-over';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            font-family: Arial, sans-serif;
        `;

        // Game Over Title
        const title = document.createElement('h1');
        title.textContent = 'GAME OVER';
        title.style.cssText = `
            color: #ff4444;
            font-size: var(--font-size-h1, 56px);
            margin-bottom: clamp(20px, 4vw, 30px);
            text-shadow: 3px 3px 6px rgba(0,0,0,0.8);
        `;
        this.container.appendChild(title);

        // Stats Container
        const statsContainer = document.createElement('div');
        statsContainer.style.cssText = `
            background: rgba(255,255,255,0.1);
            padding: var(--spacing-md, 30px);
            border-radius: 20px;
            margin-bottom: clamp(20px, 4vw, 30px);
            max-width: 90vw;
        `;


        // Score
        this.scoreLabel = document.createElement('div');
        this.scoreLabel.style.cssText = `
            color: white;
            font-size: var(--font-size-h2, 32px);
            margin: clamp(8px, 2vw, 10px) 0;
        `;
        statsContainer.appendChild(this.scoreLabel);

        // High Score
        this.highScoreLabel = document.createElement('div');
        this.highScoreLabel.style.cssText = `
            color: #ffaa00;
            font-size: var(--font-size-body, 28px);
            margin: clamp(8px, 2vw, 10px) 0;
        `;
        statsContainer.appendChild(this.highScoreLabel);

        // Gems
        this.gemsLabel = document.createElement('div');
        this.gemsLabel.style.cssText = `
            color: #ffff00;
            font-size: var(--font-size-body, 24px);
            margin: clamp(8px, 2vw, 10px) 0;
        `;
        statsContainer.appendChild(this.gemsLabel);

        // Max Combo
        this.comboLabel = document.createElement('div');
        this.comboLabel.style.cssText = `
            color: #00ffff;
            font-size: var(--font-size-small, 20px);
            margin: clamp(8px, 2vw, 10px) 0;
        `;
        statsContainer.appendChild(this.comboLabel);

        this.container.appendChild(statsContainer);

        // Restart Button
        const restartBtn = document.createElement('button');
        restartBtn.textContent = 'RESTART';
        restartBtn.style.cssText = `
            padding: var(--btn-padding, 15px 50px);
            font-size: var(--btn-font-size, 28px);
            font-weight: bold;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 50px;
            color: white;
            cursor: pointer;
            margin: clamp(8px, 2vw, 10px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            transition: transform 0.2s;
            min-height: 44px;
        `;
        restartBtn.ontouchstart = restartBtn.onmouseover = () => restartBtn.style.transform = 'scale(1.05)';
        restartBtn.ontouchend = restartBtn.onmouseout = () => restartBtn.style.transform = 'scale(1)';
        restartBtn.onclick = () => {
            this.hide();
            this.onRestart();
        };
        this.container.appendChild(restartBtn);

        // Menu Button
        const menuBtn = document.createElement('button');
        menuBtn.textContent = 'MENU';
        menuBtn.style.cssText = `
            padding: clamp(10px, 2.5vw, 12px) clamp(30px, 5vw, 40px);
            font-size: var(--font-size-small, 20px);
            background: rgba(255,255,255,0.2);
            border: 2px solid white;
            border-radius: 50px;
            color: white;
            cursor: pointer;
            margin: clamp(8px, 2vw, 10px);
            transition: background 0.2s;
            min-height: 44px;
        `;
        menuBtn.ontouchstart = menuBtn.onmouseover = () => menuBtn.style.background = 'rgba(255,255,255,0.3)';
        menuBtn.ontouchend = menuBtn.onmouseout = () => menuBtn.style.background = 'rgba(255,255,255,0.2)';
        menuBtn.onclick = () => {
            this.hide();
            this.onMenu();
        };
        this.container.appendChild(menuBtn);

        document.body.appendChild(this.container);
        this.updateStats(score, highScore, gems, maxCombo);
    }

    updateStats(score, highScore, gems, maxCombo) {
        if (this.scoreLabel) {
            this.scoreLabel.textContent = `Score: ${score}`;
        }
        if (this.highScoreLabel) {
            const isNewRecord = score > highScore;
            this.highScoreLabel.textContent = isNewRecord ?
                `🎉 NEW HIGH SCORE: ${score}` :
                `High Score: ${highScore}`;
        }
        if (this.gemsLabel) {
            this.gemsLabel.textContent = `💎 Gems: ${gems}`;
        }
        if (this.comboLabel) {
            this.comboLabel.textContent = `Max Combo: ${maxCombo}`;
        }
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }
}
