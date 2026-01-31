import * as THREE from 'three';

export class CameraManager {
    constructor() {
        this.camera = new THREE.PerspectiveCamera(
            60, // FOV - slightly wider 
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        // Initial position
        this.offset = new THREE.Vector3(0, 5, 8); // Up and back
        this.camera.position.copy(this.offset);
        this.camera.lookAt(0, 0, 0);

        this.target = null;
    }

    setTarget(targetObject) {
        this.target = targetObject;
    }

    update(dt) {
        if (!this.target) return;

        // Smooth follow on Y axis
        const targetY = this.target.position.y + this.offset.y;
        this.camera.position.y += (targetY - this.camera.position.y) * 5 * dt; // Lerp

        // Keep looking at the target's Y level (but center X/Z)
        this.camera.lookAt(0, this.target.position.y, 0);
    }
}
