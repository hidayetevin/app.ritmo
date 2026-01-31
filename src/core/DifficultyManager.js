export class DifficultyManager {
    constructor() {
        this.level = 1;
        this.baseGravity = -2;
        this.baseFallSpeed = -5;
        this.baseSpacing = 12;

        // Current values
        this.gravity = this.baseGravity;
        this.fallSpeed = this.baseFallSpeed;
        this.obstacleSpacing = this.baseSpacing;
    }

    increaseDifficulty() {
        this.level++;

        // Increase fall speed slightly
        this.fallSpeed = Math.max(-20, this.baseFallSpeed - (this.level * 0.5));

        // Decrease spacing (but not too tight)
        this.obstacleSpacing = Math.max(6, this.baseSpacing - (this.level * 0.3));

        // Increase gravity slightly for faster acceleration
        this.gravity = Math.max(-10, this.baseGravity - (this.level * 0.1));

        return {
            level: this.level,
            fallSpeed: this.fallSpeed,
            spacing: this.obstacleSpacing,
            gravity: this.gravity
        };
    }

    getCurrentSettings() {
        return {
            level: this.level,
            gravity: this.gravity,
            fallSpeed: this.fallSpeed,
            spacing: this.obstacleSpacing
        };
    }

    reset() {
        this.level = 1;
        this.gravity = this.baseGravity;
        this.fallSpeed = this.baseFallSpeed;
        this.obstacleSpacing = this.baseSpacing;
    }
}
