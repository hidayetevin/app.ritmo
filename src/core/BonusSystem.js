import * as THREE from 'three';

export class BonusSystem {
    constructor(scene) {
        this.scene = scene;
        this.activeBonuses = [];
        this.collectibles = []; // Gems and powerups in world

        // Bonus types
        this.bonusTypes = {
            SLOW_MOTION: { duration: 3000, color: 0x00ffff },
            SHIELD: { duration: 0, color: 0xffaa00 }, // Duration 0 = single use
            MAGNET: { duration: 5000, color: 0xff00ff }
        };

        // Active effects
        this.activeEffects = {
            slowMotion: false,
            shield: false,
            magnet: false
        };

        this.spawnChance = 0.1; // 10% for powerups
        this.gemSpawnChance = 0.05; // 5% for gems

        this.lastSpawnY = 0;
        this.spawnInterval = 15; // Spawn every 15 units
    }

    createBonus(type, position) {
        const geometry = new THREE.SphereGeometry(0.4, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: this.bonusTypes[type].color,
            emissive: this.bonusTypes[type].color,
            emissiveIntensity: 0.5,
            metalness: 0.8,
            roughness: 0.2
        });

        const bonus = new THREE.Mesh(geometry, material);
        bonus.position.copy(position);
        bonus.userData.type = type;
        bonus.userData.isBonus = true;

        this.scene.add(bonus);
        this.collectibles.push(bonus);

        return bonus;
    }

    createGem(position) {
        const geometry = new THREE.OctahedronGeometry(0.3, 0);
        const material = new THREE.MeshStandardMaterial({
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 0.6,
            metalness: 1,
            roughness: 0
        });

        const gem = new THREE.Mesh(geometry, material);
        gem.position.copy(position);
        gem.userData.isGem = true;

        this.scene.add(gem);
        this.collectibles.push(gem);

        return gem;
    }

    spawnCollectibles(playerY) {
        const spawnY = playerY - 20; // Spawn ahead

        if (this.lastSpawnY - spawnY > this.spawnInterval) {
            // Random spawn
            if (Math.random() < this.spawnChance && this.collectibles.length < 10) {
                const bonusTypes = Object.keys(this.bonusTypes);
                const randomType = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];

                const x = (Math.random() - 0.5) * 4; // Random X position
                this.createBonus(randomType, new THREE.Vector3(x, spawnY, 0));
            }

            // Gem spawn
            if (Math.random() < this.gemSpawnChance && this.collectibles.length < 10) {
                const x = (Math.random() - 0.5) * 4;
                this.createGem(new THREE.Vector3(x, spawnY, 0));
            }

            this.lastSpawnY = spawnY;
        }
    }

    checkCollection(playerPos) {
        const collected = [];

        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const item = this.collectibles[i];
            const distance = playerPos.distanceTo(item.position);

            // Magnet effect - pull items
            if (this.activeEffects.magnet && distance < 5) {
                const dir = new THREE.Vector3().subVectors(playerPos, item.position).normalize();
                item.position.addScaledVector(dir, 0.2);
            }

            // Collection
            if (distance < 1) {
                if (item.userData.isGem) {
                    collected.push({ type: 'gem', item });
                } else if (item.userData.isBonus) {
                    collected.push({ type: 'bonus', bonusType: item.userData.type, item });
                }

                this.scene.remove(item);
                this.collectibles.splice(i, 1);
            }
        }

        return collected;
    }

    activateBonus(type) {
        // Only one active bonus at a time (except shield which is passive)
        if (type === 'SLOW_MOTION') {
            this.activeEffects.slowMotion = true;
            setTimeout(() => {
                this.activeEffects.slowMotion = false;
            }, this.bonusTypes.SLOW_MOTION.duration);
        }
        else if (type === 'SHIELD') {
            this.activeEffects.shield = true; // Single use, removed on hit
        }
        else if (type === 'MAGNET') {
            this.activeEffects.magnet = true;
            setTimeout(() => {
                this.activeEffects.magnet = false;
            }, this.bonusTypes.MAGNET.duration);
        }
    }

    useShield() {
        if (this.activeEffects.shield) {
            this.activeEffects.shield = false;
            return true; // Shield consumed
        }
        return false;
    }

    getTimeScale() {
        return this.activeEffects.slowMotion ? 0.5 : 1.0;
    }

    update(playerY, dt) {
        this.spawnCollectibles(playerY);

        // Animate collectibles
        for (const item of this.collectibles) {
            item.rotation.y += 2 * dt;

            // Remove if too far above player
            if (item.position.y > playerY + 15) {
                this.scene.remove(item);
                const index = this.collectibles.indexOf(item);
                if (index > -1) this.collectibles.splice(index, 1);
            }
        }
    }

    reset() {
        // Clean up all collectibles
        for (const item of this.collectibles) {
            this.scene.remove(item);
        }
        this.collectibles = [];

        this.activeEffects = {
            slowMotion: false,
            shield: false,
            magnet: false
        };
    }
}
