import * as THREE from 'three';

export class CollisionSystem {
    constructor() {
        this.playerRadius = 0.5; // Sphere radius
        this.ringInnerRadius = 2.7; // Safe zone (slightly smaller than visual)
        this.ringOuterRadius = 3.3; // Danger zone
        this.perfectZoneRadius = 0.3; // Perfect pass tolerance
    }

    // AABB-based collision (simplified for ring)
    checkCollision(player, obstacles) {
        const playerPos = player.mesh.position;

        for (let i = 0; i < obstacles.length; i++) {
            const ring = obstacles[i];

            // Check if player is at ring's Y level
            const deltaY = Math.abs(playerPos.y - ring.position.y);

            if (deltaY < 0.5) { // Player is passing through ring plane
                const distanceFromCenter = Math.sqrt(
                    playerPos.x * playerPos.x +
                    playerPos.z * playerPos.z
                );

                // Check perfect pass (very center)
                if (distanceFromCenter < this.perfectZoneRadius && !ring.userData.isPerfect) {
                    ring.userData.isPerfect = true;
                    return { type: 'perfect', ring };
                }

                // Check if player is inside safe zone (passed)
                if (distanceFromCenter < this.ringInnerRadius) {
                    if (!ring.userData.passed) {
                        ring.userData.passed = true;
                        return { type: 'pass', ring };
                    }
                }

                // Check collision (hit the ring)
                if (distanceFromCenter >= this.ringInnerRadius &&
                    distanceFromCenter <= this.ringOuterRadius) {
                    return { type: 'collision', ring };
                }
            }
        }

        return null;
    }
}
