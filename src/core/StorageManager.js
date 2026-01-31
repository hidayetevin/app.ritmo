export class StorageManager {
    constructor() {
        this.storageKey = 'endless_drop_data';
        this.data = this.load();
    }

    getDefaultData() {
        return {
            highScore: 0,
            totalGems: 0,
            unlockedSkins: ['default'],
            selectedSkin: 'default',
            unlockedTrails: ['none'],
            selectedTrail: 'none',
            settings: {
                soundEnabled: true,
                musicEnabled: true,
                hapticEnabled: true
            },
            dailyTasks: {
                lastReset: new Date().toDateString(),
                tasks: [],
                completedToday: []
            },
            stats: {
                totalGamesPlayed: 0,
                totalRingsPassed: 0,
                totalPerfectPasses: 0,
                longestCombo: 0
            }
        };
    }

    load() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const parsed = JSON.parse(atob(saved)); // Simple base64 decode
                return { ...this.getDefaultData(), ...parsed };
            }
        } catch (e) {
            console.warn('Failed to load save data:', e);
        }
        return this.getDefaultData();
    }

    save() {
        try {
            const encoded = btoa(JSON.stringify(this.data)); // Simple base64 encode
            localStorage.setItem(this.storageKey, encoded);
        } catch (e) {
            console.error('Failed to save data:', e);
        }
    }

    // High Score
    getHighScore() {
        return this.data.highScore;
    }

    setHighScore(score) {
        if (score > this.data.highScore) {
            this.data.highScore = score;
            this.save();
            return true; // New record
        }
        return false;
    }

    // Gems
    getTotalGems() {
        return this.data.totalGems;
    }

    addGems(amount) {
        this.data.totalGems += amount;
        this.save();
    }

    spendGems(amount) {
        if (this.data.totalGems >= amount) {
            this.data.totalGems -= amount;
            this.save();
            return true;
        }
        return false;
    }

    // Skins & Trails
    unlockSkin(skinId) {
        if (!this.data.unlockedSkins.includes(skinId)) {
            this.data.unlockedSkins.push(skinId);
            this.save();
        }
    }

    unlockTrail(trailId) {
        if (!this.data.unlockedTrails.includes(trailId)) {
            this.data.unlockedTrails.push(trailId);
            this.save();
        }
    }

    setSelectedSkin(skinId) {
        if (this.data.unlockedSkins.includes(skinId)) {
            this.data.selectedSkin = skinId;
            this.save();
        }
    }

    setSelectedTrail(trailId) {
        if (this.data.unlockedTrails.includes(trailId)) {
            this.data.selectedTrail = trailId;
            this.save();
        }
    }

    // Settings
    getSettings() {
        return this.data.settings;
    }

    updateSetting(key, value) {
        this.data.settings[key] = value;
        this.save();
    }

    // Stats
    incrementStat(key, value = 1) {
        if (this.data.stats.hasOwnProperty(key)) {
            this.data.stats[key] += value;
            this.save();
        }
    }

    getStats() {
        return this.data.stats;
    }

    // Daily Tasks
    getDailyTasks() {
        return this.data.dailyTasks;
    }

    setDailyTasks(tasks) {
        this.data.dailyTasks.tasks = tasks;
        this.data.dailyTasks.lastReset = new Date().toDateString();
        this.save();
    }

    completeTask(taskId) {
        if (!this.data.dailyTasks.completedToday.includes(taskId)) {
            this.data.dailyTasks.completedToday.push(taskId);
            this.save();
        }
    }

    resetDailyTasks() {
        this.data.dailyTasks.completedToday = [];
        this.data.dailyTasks.lastReset = new Date().toDateString();
        this.save();
    }
}
