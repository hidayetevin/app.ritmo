export class DailyTaskManager {
    constructor(storage) {
        this.storage = storage;
        this.taskPool = [
            { id: 'score_500', type: 'score', target: 500, reward: 10, desc: 'Score 500 points' },
            { id: 'score_1000', type: 'score', target: 1000, reward: 20, desc: 'Score 1000 points' },
            { id: 'rings_20', type: 'rings', target: 20, reward: 15, desc: 'Pass through 20 rings' },
            { id: 'rings_50', type: 'rings', target: 50, reward: 30, desc: 'Pass through 50 rings' },
            { id: 'gems_10', type: 'gems', target: 10, reward: 15, desc: 'Collect 10 gems' },
            { id: 'perfect_5', type: 'perfect', target: 5, reward: 20, desc: 'Get 5 perfect passes' },
            { id: 'perfect_10', type: 'perfect', target: 10, reward: 35, desc: 'Get 10 perfect passes' },
            { id: 'games_3', type: 'games', target: 3, reward: 10, desc: 'Play 3 games' },
            { id: 'combo_5', type: 'combo', target: 5, reward: 25, desc: 'Get a 5x combo' }
        ];

        this.dailyTasks = [];
        this.taskProgress = {};

        this.checkAndResetTasks();
    }

    checkAndResetTasks() {
        const saved = this.storage.getDailyTasks();
        const today = new Date().toDateString();

        if (saved.lastReset !== today) {
            // New day, generate new tasks
            this.generateDailyTasks();
            this.storage.resetDailyTasks();
        } else {
            // Load existing tasks
            this.dailyTasks = saved.tasks;
        }
    }

    generateDailyTasks() {
        // Pick 3 random tasks
        const shuffled = [...this.taskPool].sort(() => Math.random() - 0.5);
        this.dailyTasks = shuffled.slice(0, 3).map(task => ({
            ...task,
            progress: 0,
            completed: false
        }));

        this.storage.setDailyTasks(this.dailyTasks);
        console.log('📅 Daily tasks generated:', this.dailyTasks);
    }

    updateProgress(type, value) {
        let updated = false;

        for (const task of this.dailyTasks) {
            if (task.type === type && !task.completed) {
                if (type === 'combo') {
                    // For combo, check if value reached target
                    if (value >= task.target) {
                        task.progress = task.target;
                        task.completed = true;
                        updated = true;
                    }
                } else {
                    // For accumulative tasks
                    task.progress = Math.min(task.progress + value, task.target);
                    if (task.progress >= task.target) {
                        task.completed = true;
                        updated = true;
                    }
                }
            }
        }

        if (updated) {
            this.storage.setDailyTasks(this.dailyTasks);
        }

        return updated;
    }

    claimReward(taskId) {
        const task = this.dailyTasks.find(t => t.id === taskId);
        if (task && task.completed) {
            this.storage.addGems(task.reward);
            this.storage.completeTask(taskId);
            console.log(`✅ Task "${task.desc}" claimed! +${task.reward} gems`);
            return task.reward;
        }
        return 0;
    }

    getTasks() {
        return this.dailyTasks;
    }

    getCompletedCount() {
        return this.dailyTasks.filter(t => t.completed).length;
    }

    getAllCompleted() {
        return this.dailyTasks.length > 0 && this.dailyTasks.every(t => t.completed);
    }
}
