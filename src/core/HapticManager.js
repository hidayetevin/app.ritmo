export class HapticManager {
    constructor() {
        this.enabled = true;
        this.isSupported = 'vibrate' in navigator;
    }

    vibrate(pattern) {
        if (!this.enabled || !this.isSupported) return;

        try {
            navigator.vibrate(pattern);
        } catch (e) {
            console.warn('Vibration failed:', e);
        }
    }

    // Predefined patterns
    light() {
        this.vibrate(10); // Short tap
    }

    medium() {
        this.vibrate(25); // Medium tap
    }

    heavy() {
        this.vibrate(50); // Strong feedback
    }

    success() {
        this.vibrate([10, 50, 10]); // Double tap
    }

    error() {
        this.vibrate([50, 30, 50, 30, 50]); // Triple buzz
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }
}
