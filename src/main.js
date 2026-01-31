import './style.css';
import { SceneManager } from './core/SceneManager.js';
import { CameraManager } from './core/CameraManager.js';
import { Player } from './core/Player.js';
import { GameLoop } from './core/GameLoop.js';
import { ObstacleFactory } from './core/ObstacleFactory.js';
import { CollisionSystem } from './core/CollisionSystem.js';
import { GameState } from './core/GameState.js';
import { BonusSystem } from './core/BonusSystem.js';
import { DifficultyManager } from './core/DifficultyManager.js';
import { ThemeManager } from './core/ThemeManager.js';
import { Menu } from './ui/Menu.js';
import { HUD } from './ui/HUD.js';
import { GameOver } from './ui/GameOver.js';
import { StorageManager } from './core/StorageManager.js';
import { DailyTaskManager } from './core/DailyTaskManager.js';
import { AudioManager } from './core/AudioManager.js';
import { HapticManager } from './core/HapticManager.js';

class Game {
  constructor() {
    this.sceneManager = new SceneManager();
    this.cameraManager = new CameraManager();
    this.player = new Player(this.sceneManager.scene);
    this.obstacleFactory = new ObstacleFactory(this.sceneManager.scene);
    this.collisionSystem = new CollisionSystem();
    this.gameState = new GameState();
    this.bonusSystem = new BonusSystem(this.sceneManager.scene);
    this.difficultyManager = new DifficultyManager();
    this.themeManager = new ThemeManager(this.sceneManager.scene);

    // Core Systems
    this.storage = new StorageManager();
    this.dailyTasks = new DailyTaskManager(this.storage);
    this.audio = new AudioManager();
    this.haptic = new HapticManager();

    // UI Components
    this.menu = new Menu(() => this.startGame(), (theme) => this.changeTheme(theme));
    this.hud = new HUD();
    this.gameOverScreen = new GameOver(() => this.restartGame(), () => this.showMenu());

    this.sceneManager.setCamera(this.cameraManager.camera);
    this.cameraManager.setTarget(this.player.mesh);

    this.gameLoop = new GameLoop(this.update.bind(this));

    this.init();
  }

  init() {
    console.log("Endless Drop 3D initialized");

    // Give theme manager access to lights
    const lights = this.sceneManager.scene.children.filter(c => c.isLight);
    if (lights.length >= 2) {
      this.themeManager.setLights(lights[0], lights[1]);
    }
    this.themeManager.reset(); // Apply initial biome

    this.hud.create();
    this.menu.show(); // Show menu on startup
    this.gameLoop.start(); // Start rendering loop
  }

  startGame() {
    this.gameState.reset();
    this.bonusSystem.reset();
    this.themeManager.reset();
    this.hud.show();
    this.audio.resume(); // Resume audio context for iOS
    this.storage.incrementStat('totalGamesPlayed');
    console.log("Game started!");
  }

  restartGame() {
    // Clean up and restart
    this.startGame();
  }

  showMenu() {
    this.hud.hide();
    this.menu.show();
  }

  changeTheme(theme) {
    // Future: Apply theme changes
    console.log("Theme changed to:", theme);
  }


  handleCollisionResult(result) {
    if (!result) return;

    if (result.type === 'perfect') {
      this.gameState.addPerfectPass();
      console.log('🎯 PERFECT! Combo: ' + this.gameState.perfectCombo);

      // Show combo UI
      this.hud.showCombo(this.gameState.perfectCombo);

      // Feedback
      this.audio.playPerfect();
      this.haptic.medium();

      // Update daily tasks
      this.dailyTasks.updateProgress('perfect', 1);
      this.dailyTasks.updateProgress('combo', this.gameState.perfectCombo);
    }
    else if (result.type === 'pass') {
      const shouldIncrease = this.gameState.ringPassed();

      this.audio.playPass();
      this.dailyTasks.updateProgress('rings', 1);
      this.storage.incrementStat('totalRingsPassed');

      if (this.gameState.perfectCombo === 0) {
        // Normal pass (no combo active)
      } else {
        // Passed but not perfect - break combo
        this.gameState.breakCombo();
        this.hud.hideCombo();
      }

      if (shouldIncrease) {
        this.obstacleFactory.increaseDifficulty();
        console.log('📈 Difficulty increased!');
      }
    }
    else if (result.type === 'bonus') {
      console.log('✨ Bonus collected: ' + result.bonusType);
      this.bonusSystem.collectBonus(result.bonusType);
    }
    else if (result.type === 'collision') {
      // Check shield
      if (this.bonusSystem.useShield()) {
        console.log('🛡️ Shield saved you!');
        this.audio.playBonus();
        this.haptic.light();
        return; // Shield consumed, no game over
      }

      console.log('💥 GAME OVER - Score: ' + this.gameState.score);
      this.audio.playCrash();
      this.haptic.error();
      this.gameState.gameOver();
      this.doGameOver();
    }
  }



  doGameOver() {
    console.log('💥 GAME OVER - Score: ' + this.gameState.score);
    this.gameState.gameOver();

    // Save data
    const state = this.gameState.getState();
    this.storage.setHighScore(state.score);
    this.storage.addGems(state.gems); // Permanent gem storage

    if (state.maxCombo > this.storage.getStats().longestCombo) {
      this.storage.data.stats.longestCombo = state.maxCombo;
      this.storage.save();
    }

    // Update daily tasks
    this.dailyTasks.updateProgress('score', state.score);
    this.dailyTasks.updateProgress('games', 1);

    this.gameOverScreen.show(
      state.score,
      this.storage.getHighScore(),
      this.storage.getTotalGems(),
      state.maxCombo
    );
  }

  update(dt) {
    if (this.gameState.state !== 'PLAYING') return;

    // Apply time scale for slow motion
    const timeScale = this.bonusSystem.getTimeScale();
    const scaledDt = dt * timeScale;

    // Update Game Logic
    this.player.update(scaledDt);
    this.cameraManager.update(scaledDt);
    this.obstacleFactory.update(this.player.mesh.position.y);
    this.bonusSystem.update(this.player.mesh.position.y, scaledDt);

    // Check Collisions
    const obstacles = this.obstacleFactory.getActiveObstacles();
    const collisionResult = this.collisionSystem.checkCollision(this.player, obstacles);
    this.handleCollisionResult(collisionResult);

    // Check Bonus Collection
    const collected = this.bonusSystem.checkCollection(this.player.mesh.position);
    for (const item of collected) {
      if (item.type === 'gem') {
        this.gameState.addGem();
        this.audio.playCoin();
        this.haptic.light();
        this.dailyTasks.updateProgress('gems', 1);
        console.log('💎 Gem collected! Total: ' + this.gameState.gems);
      } else if (item.type === 'bonus') {
        this.bonusSystem.activateBonus(item.bonusType);
        this.audio.playBonus();
        this.haptic.medium();
        console.log(`✨ ${item.bonusType} activated!`);
      }
    }

    // Update Biome based on score
    if (this.themeManager.updateBiome(this.gameState.score)) {
      // Biome changed - could trigger special effects
    }

    // Update HUD
    const state = this.gameState.getState();
    this.hud.updateScore(state.score);
    this.hud.updateGems(state.gems);
    this.hud.showShield(this.bonusSystem.activeEffects.shield);

    // Render
    this.sceneManager.render(this.cameraManager.camera);
  }
}

// Start the game
window.game = new Game();
