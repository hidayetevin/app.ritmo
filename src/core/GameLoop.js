export class GameLoop {
    constructor(updateCallback) {
        this.updateCallback = updateCallback;
        this.clock = null;
        this.isRunning = false;

        // Bind loop to preserve context
        this.loop = this.loop.bind(this);
    }

    start() {
        if (this.isRunning) return;

        import('three').then((THREE) => {
            this.clock = new THREE.Clock();
            this.isRunning = true;
            this.loop();
        });
    }

    stop() {
        this.isRunning = false;
    }

    loop() {
        if (!this.isRunning) return;

        requestAnimationFrame(this.loop);

        const dt = this.clock.getDelta();
        this.updateCallback(dt);
    }
}
