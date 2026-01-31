export class AudioManager {
    constructor() {
        this.sounds = {};
        this.musicEnabled = true;
        this.soundEnabled = true;

        // HTML5 Audio for simplicity (can upgrade to Howler.js later)
        this.audioContext = null;
        this.initAudio();
    }

    initAudio() {
        // Simple audio setup using Web Audio API
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    // Simple beep generator for placeholder sounds
    playBeep(frequency = 440, duration = 0.1, type = 'sine') {
        if (!this.soundEnabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // Predefined sound effects
    playPerfect() {
        this.playBeep(880, 0.15, 'sine'); // High pitch
    }

    playPass() {
        this.playBeep(440, 0.08, 'square'); // Mid pitch
    }

    playCoin() {
        this.playBeep(660, 0.12, 'triangle'); // Coin sound
    }

    playBonus() {
        this.playBeep(1200, 0.2, 'sine'); // Power-up
    }

    playCrash() {
        this.playBeep(110, 0.3, 'sawtooth'); // Low crash
    }

    playClick() {
        this.playBeep(300, 0.05, 'square'); // UI click
    }

    setMusicEnabled(enabled) {
        this.musicEnabled = enabled;
    }

    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
    }

    // Resume audio context (required for iOS)
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}
