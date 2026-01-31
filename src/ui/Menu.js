export class Menu {
    constructor(onStart, onThemeChange) {
        this.onStart = onStart;
        this.onThemeChange = onThemeChange;
        this.container = null;
        this.isVisible = false;
    }

    show() {
        if (this.container) {
            this.container.style.display = 'flex';
            this.isVisible = true;
            return;
        }

        this.container = document.createElement('div');
        this.container.id = 'main-menu';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 3000;
            font-family: 'Arial', sans-serif;
        `;

        // Title
        const title = document.createElement('h1');
        title.textContent = 'ENDLESS DROP 3D';
        title.style.cssText = `
            color: white;
            font-size: var(--font-size-h1, 48px);
            margin-bottom: clamp(20px, 5vw, 40px);
            text-shadow: 3px 3px 6px rgba(0,0,0,0.5);
            letter-spacing: 2px;
            padding: 0 var(--spacing-sm, 20px);
        `;
        this.container.appendChild(title);

        // Play Button
        const playBtn = document.createElement('button');
        playBtn.textContent = 'PLAY';
        playBtn.style.cssText = `
            padding: var(--btn-padding, 20px 60px);
            font-size: var(--btn-font-size, 32px);
            font-weight: bold;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            border: none;
            border-radius: 50px;
            color: white;
            cursor: pointer;
            margin: clamp(10px, 2vw, 20px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            transition: transform 0.2s, box-shadow 0.2s;
            min-height: 44px;
            min-width: 120px;
        `;
        playBtn.ontouchstart = playBtn.onmouseover = () => {
            playBtn.style.transform = 'scale(1.05)';
            playBtn.style.boxShadow = '0 8px 20px rgba(0,0,0,0.4)';
        };
        playBtn.ontouchend = playBtn.onmouseout = () => {
            playBtn.style.transform = 'scale(1)';
            playBtn.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
        };
        playBtn.onclick = () => {
            this.hide();
            this.onStart();
        };
        this.container.appendChild(playBtn);

        // Theme Selection (future feature)
        const themeLabel = document.createElement('div');
        themeLabel.textContent = 'Theme: Neon';
        themeLabel.style.cssText = `
            color: rgba(255,255,255,0.8);
            font-size: var(--font-size-small, 18px);
            margin-top: clamp(20px, 4vw, 30px);
        `;
        this.container.appendChild(themeLabel);

        // High Score Display
        const highScore = localStorage.getItem('endless_drop_highscore') || 0;
        const scoreLabel = document.createElement('div');
        scoreLabel.textContent = `High Score: ${highScore}`;
        scoreLabel.style.cssText = `
            color: rgba(255,255,255,0.9);
            font-size: var(--font-size-body, 24px);
            margin-top: clamp(15px, 3vw, 20px);
            font-weight: bold;
        `;
        this.container.appendChild(scoreLabel);

        document.body.appendChild(this.container);
        this.isVisible = true;
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
            this.isVisible = false;
        }
    }
}
