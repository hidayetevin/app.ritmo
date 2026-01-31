import * as THREE from 'three';

export class ObstacleFactory {
    constructor(scene) {
        this.scene = scene;
        this.pool = [];
        this.activeObstacles = [];
        this.poolSize = 20; // Object pooling for performance

        // Spawn settings
        this.spawnDistance = 15;
        this.minSpacing = 8;
        this.maxSpacing = 12;
        this.currentSpacing = this.maxSpacing;

        this.lastSpawnY = 0;

        this.initPool();
    }

    initPool() {
        // Create pool of ring obstacles
        // TODO: Replace TorusGeometry with GLTFLoader when .glb model is ready
        for (let i = 0; i < this.poolSize; i++) {
            const ring = this.createRing();
            ring.visible = false;
            this.scene.add(ring);
            this.pool.push(ring);
        }
    }

    createRing() {
        // PLACEHOLDER: Using TorusGeometry until .glb model is provided
        // Production: Load from assets/models/ring.glb using GLTFLoader
        const geometry = new THREE.TorusGeometry(3, 0.3, 16, 32);
        const material = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            roughness: 0.3,
            metalness: 0.7,
            emissive: 0x00ffff,
            emissiveIntensity: 0.2
        });

        const ring = new THREE.Mesh(geometry, material);
        ring.rotation.x = Math.PI / 2; // Horizontal orientation
        ring.userData.isObstacle = true;
        ring.userData.isPerfect = false;

        return ring;
    }

    getFromPool() {
        for (let i = 0; i < this.pool.length; i++) {
            if (!this.pool[i].visible) {
                return this.pool[i];
            }
        }

        // If pool exhausted, create new (should not happen with proper sizing)
        console.warn('Obstacle pool exhausted, creating new ring');
        const ring = this.createRing();
        this.scene.add(ring);
        this.pool.push(ring);
        return ring;
    }

    returnToPool(ring) {
        ring.visible = false;
        const index = this.activeObstacles.indexOf(ring);
        if (index > -1) {
            this.activeObstacles.splice(index, 1);
        }
    }

    spawn(playerY) {
        // Spawn ahead of player
        const targetY = playerY - this.spawnDistance;

        if (this.lastSpawnY - targetY > this.currentSpacing) {
            const ring = this.getFromPool();
            ring.position.set(0, targetY, 0);
            ring.visible = true;
            this.activeObstacles.push(ring);

            this.lastSpawnY = targetY;
        }
    }

    update(playerY) {
        // Spawn new rings
        this.spawn(playerY);

        // Clean up rings that are above player (out of view)
        for (let i = this.activeObstacles.length - 1; i >= 0; i--) {
            const ring = this.activeObstacles[i];

            if (ring.position.y > playerY + 10) {
                this.returnToPool(ring);
            }
        }
    }

    increaseDifficulty() {
        // Gradually decrease spacing between rings
        this.currentSpacing = Math.max(this.minSpacing, this.currentSpacing - 0.5);
    }

    getActiveObstacles() {
        return this.activeObstacles;
    }
}
