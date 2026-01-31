import * as THREE from 'three';

export class Player {
    constructor(scene) {
        // Player Mesh (Placeholder Sphere)
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: 0xff0055,
            roughness: 0.4,
            metalness: 0.3
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        scene.add(this.mesh);

        // Physics properties
        this.velocity = new THREE.Vector3(0, -5, 0); // Initial downward speed
        this.gravity = -2; // Gravity acceleration
        this.maxFallSpeed = -20;

        // Input properties
        this.lastTouchX = 0;
        this.isDragging = false;
        this.sensitivity = 0.015; // Setup for relative sensitivity

        this.setupInput();
    }

    setupInput() {
        // Touch events for mobile
        window.addEventListener('touchstart', (e) => {
            this.isDragging = true;
            this.lastTouchX = e.touches[0].clientX;
        });

        window.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;
            const currentX = e.touches[0].clientX;
            const deltaX = currentX - this.lastTouchX;
            this.moveHorizontal(deltaX);
            this.lastTouchX = currentX;
        });

        window.addEventListener('touchend', () => {
            this.isDragging = false;
        });

        // Mouse events for testing
        window.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastTouchX = e.clientX;
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            const deltaX = e.clientX - this.lastTouchX;
            this.moveHorizontal(deltaX);
            this.lastTouchX = e.clientX;
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
    }

    moveHorizontal(deltaX) {
        // Relative movement
        this.mesh.position.x += deltaX * this.sensitivity;

        // Clamp position to boundaries (e.g., tube width)
        this.mesh.position.x = Math.max(-4, Math.min(4, this.mesh.position.x));
    }

    update(dt) {
        // Apply Gravity
        this.velocity.y += this.gravity * dt;

        // Clamp Speed
        if (this.velocity.y < this.maxFallSpeed) {
            this.velocity.y = this.maxFallSpeed;
        }

        // Apply Velocity
        this.mesh.position.addScaledVector(this.velocity, dt);

        // Simple rotation for visual effect
        this.mesh.rotation.x -= 2 * dt;
        this.mesh.rotation.z -= this.velocity.y * 0.1 * dt;
    }
}
