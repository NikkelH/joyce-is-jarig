/**
 * JOYCE BIRTHDAY - APP
 * Premium "broken" website with terminal intro
 */

// ==========================================
// SOUND MANAGER
// ==========================================

class SoundManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.staticNode = null;
        this.staticGain = null;
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
            this.enabled = false;
        }
    }

    // Typing sound - mechanical keyboard
    playType() {
        if (!this.enabled || !this.audioContext) return;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'square';
        osc.frequency.setValueAtTime(1800 + Math.random() * 400, this.audioContext.currentTime);

        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);

        gain.gain.setValueAtTime(0.03, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.05);
    }

    // Dial-up modem simulation
    async playDialUp(duration = 3000) {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const masterGain = ctx.createGain();
        masterGain.connect(ctx.destination);
        masterGain.gain.setValueAtTime(0.08, ctx.currentTime);

        // Phase 1: Dial tones (0-500ms)
        const dialTones = [350, 440, 480, 620, 700, 800];
        for (let i = 0; i < 6; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(masterGain);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(dialTones[i], ctx.currentTime);

            const startTime = ctx.currentTime + i * 0.08;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
            gain.gain.linearRampToValueAtTime(0, startTime + 0.07);

            osc.start(startTime);
            osc.stop(startTime + 0.08);
        }

        // Phase 2: Handshake screech (500ms-2000ms)
        await this.sleep(500);

        const noise = ctx.createBufferSource();
        const bufferSize = ctx.sampleRate * 1.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            // Modulated noise for that classic modem sound
            const t = i / ctx.sampleRate;
            data[i] = Math.sin(t * 2000 + Math.sin(t * 100) * 500) * 0.3 +
                      (Math.random() * 2 - 1) * 0.2 * Math.sin(t * 50);
        }

        noise.buffer = buffer;

        const noiseGain = ctx.createGain();
        const noiseFilter = ctx.createBiquadFilter();

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(masterGain);

        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(1500, ctx.currentTime);
        noiseFilter.Q.setValueAtTime(2, ctx.currentTime);

        noiseGain.gain.setValueAtTime(0.4, ctx.currentTime);
        noiseGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);

        noise.start(ctx.currentTime);

        // Phase 3: Data bursts (high pitched)
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const burst = ctx.createOscillator();
                const burstGain = ctx.createGain();
                burst.connect(burstGain);
                burstGain.connect(masterGain);

                burst.type = 'square';
                burst.frequency.setValueAtTime(1200 + Math.random() * 800, ctx.currentTime);

                burstGain.gain.setValueAtTime(0.1, ctx.currentTime);
                burstGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

                burst.start(ctx.currentTime);
                burst.stop(ctx.currentTime + 0.1);
            }, 600 + i * 150);
        }

        // Fade out master
        setTimeout(() => {
            masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        }, duration - 500);
    }

    // Static noise
    startStatic(volume = 0.15) {
        if (!this.enabled || !this.audioContext) return;

        const bufferSize = 2 * this.audioContext.sampleRate;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        this.staticNode = this.audioContext.createBufferSource();
        this.staticNode.buffer = noiseBuffer;
        this.staticNode.loop = true;

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);

        this.staticGain = this.audioContext.createGain();
        this.staticGain.gain.setValueAtTime(volume, this.audioContext.currentTime);

        this.staticNode.connect(filter);
        filter.connect(this.staticGain);
        this.staticGain.connect(this.audioContext.destination);

        this.staticNode.start();
    }

    stopStatic(fadeTime = 0.3) {
        if (!this.staticGain || !this.staticNode) return;

        this.staticGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + fadeTime);
        setTimeout(() => {
            if (this.staticNode) {
                try { this.staticNode.stop(); } catch(e) {}
                this.staticNode = null;
                this.staticGain = null;
            }
        }, fadeTime * 1000 + 100);
    }

    // Click sound
    playClick() {
        if (!this.enabled || !this.audioContext) return;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.05);

        gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.05);
    }

    // Error buzzer
    playError() {
        if (!this.enabled || !this.audioContext) return;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'square';
        osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
        osc.frequency.setValueAtTime(150, this.audioContext.currentTime + 0.1);
        osc.frequency.setValueAtTime(100, this.audioContext.currentTime + 0.2);

        gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.3);
    }

    // Success chime
    playSuccess() {
        if (!this.enabled || !this.audioContext) return;

        const notes = [523.25, 659.25, 783.99, 1046.50];

        notes.forEach((freq, index) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.audioContext.currentTime + index * 0.1);

            gain.gain.setValueAtTime(0, this.audioContext.currentTime + index * 0.1);
            gain.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + index * 0.1 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + index * 0.1 + 0.3);

            osc.start(this.audioContext.currentTime + index * 0.1);
            osc.stop(this.audioContext.currentTime + index * 0.1 + 0.3);
        });
    }

    // Checkbox tick
    playCheckbox() {
        if (!this.enabled || !this.audioContext) return;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(900, this.audioContext.currentTime + 0.08);

        gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.1);
    }

    // Champagne pop + shimmer
    playChampagne() {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;

        // Pop sound
        const popOsc = ctx.createOscillator();
        const popGain = ctx.createGain();
        const popFilter = ctx.createBiquadFilter();

        popOsc.connect(popFilter);
        popFilter.connect(popGain);
        popGain.connect(ctx.destination);

        popFilter.type = 'lowpass';
        popFilter.frequency.setValueAtTime(3000, ctx.currentTime);
        popFilter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);

        popOsc.type = 'sawtooth';
        popOsc.frequency.setValueAtTime(150, ctx.currentTime);
        popOsc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);

        popGain.gain.setValueAtTime(0.3, ctx.currentTime);
        popGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

        popOsc.start(ctx.currentTime);
        popOsc.stop(ctx.currentTime + 0.15);

        // Fizz/shimmer sound
        setTimeout(() => {
            const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
            const data = noiseBuffer.getChannelData(0);
            for (let i = 0; i < data.length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 0.5);
            }

            const noise = ctx.createBufferSource();
            noise.buffer = noiseBuffer;

            const noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = 'highpass';
            noiseFilter.frequency.setValueAtTime(4000, ctx.currentTime);

            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.15, ctx.currentTime);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(ctx.destination);

            noise.start(ctx.currentTime);
        }, 100);

        // Sparkle tones
        const sparkleNotes = [1318, 1568, 2093, 2637, 3136];
        sparkleNotes.forEach((freq, i) => {
            setTimeout(() => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime);

                gain.gain.setValueAtTime(0.05, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.5);
            }, 200 + i * 100);
        });
    }

    // Drumroll
    playDrumroll() {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;
        const duration = 2.5;
        const masterGain = ctx.createGain();
        masterGain.connect(ctx.destination);
        masterGain.gain.setValueAtTime(0.15, ctx.currentTime);

        // Create rapid hits that build up
        const hitCount = 60;
        for (let i = 0; i < hitCount; i++) {
            const time = ctx.currentTime + (i / hitCount) * duration;
            const progress = i / hitCount;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(masterGain);

            // Low drum sound
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(80 + Math.random() * 20, time);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(200 + progress * 300, time);

            // Volume builds up
            const volume = 0.3 + progress * 0.7;
            gain.gain.setValueAtTime(volume, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

            osc.start(time);
            osc.stop(time + 0.05);
        }

        // Final cymbal crash at the end
        setTimeout(() => {
            const noise = ctx.createBufferSource();
            const bufferSize = ctx.sampleRate * 0.5;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 0.3);
            }

            noise.buffer = buffer;

            const noiseGain = ctx.createGain();
            const noiseFilter = ctx.createBiquadFilter();

            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(ctx.destination);

            noiseFilter.type = 'highpass';
            noiseFilter.frequency.setValueAtTime(3000, ctx.currentTime);

            noiseGain.gain.setValueAtTime(0.3, ctx.currentTime);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

            noise.start(ctx.currentTime);
        }, duration * 1000);
    }

    // Dramatic stinger for last warning
    playDramaticStinger() {
        if (!this.enabled || !this.audioContext) return;

        const ctx = this.audioContext;

        // Low rumble
        const rumble = ctx.createOscillator();
        const rumbleGain = ctx.createGain();

        rumble.connect(rumbleGain);
        rumbleGain.connect(ctx.destination);

        rumble.type = 'sawtooth';
        rumble.frequency.setValueAtTime(55, ctx.currentTime);

        rumbleGain.gain.setValueAtTime(0.15, ctx.currentTime);
        rumbleGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

        rumble.start(ctx.currentTime);
        rumble.stop(ctx.currentTime + 0.8);

        // Impact
        const impact = ctx.createOscillator();
        const impactGain = ctx.createGain();

        impact.connect(impactGain);
        impactGain.connect(ctx.destination);

        impact.type = 'sine';
        impact.frequency.setValueAtTime(80, ctx.currentTime);
        impact.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.3);

        impactGain.gain.setValueAtTime(0.2, ctx.currentTime);
        impactGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

        impact.start(ctx.currentTime);
        impact.stop(ctx.currentTime + 0.5);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ==========================================
// PARTICLE BACKGROUND
// ==========================================

class ParticleBackground {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.animating = true;

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.createParticles();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        const count = Math.floor((this.canvas.width * this.canvas.height) / 15000);
        this.particles = [];

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.5 + 0.1
            });
        }
    }

    animate() {
        if (!this.animating) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;

            // Wrap around
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(99, 102, 241, ${p.opacity})`;
            this.ctx.fill();
        });

        requestAnimationFrame(() => this.animate());
    }
}

// ==========================================
// CONFETTI
// ==========================================

class ConfettiManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.animating = false;
        this.colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ffffff', '#fbbf24'];

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    burst(x, y, count = 50) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                size: Math.random() * 10 + 5,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                velocityX: (Math.random() - 0.5) * 20,
                velocityY: (Math.random() - 0.5) * 20 - 10,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 15,
                opacity: 1,
                shape: Math.random() > 0.3 ? 'rect' : 'circle'
            });
        }

        if (!this.animating) {
            this.animating = true;
            this.animate();
        }
    }

    rain(duration = 4000) {
        const interval = setInterval(() => {
            for (let i = 0; i < 5; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: -20,
                    size: Math.random() * 8 + 4,
                    color: this.colors[Math.floor(Math.random() * this.colors.length)],
                    velocityX: (Math.random() - 0.5) * 4,
                    velocityY: Math.random() * 3 + 2,
                    rotation: Math.random() * 360,
                    rotationSpeed: (Math.random() - 0.5) * 10,
                    opacity: 1,
                    shape: Math.random() > 0.5 ? 'rect' : 'circle'
                });
            }
        }, 50);

        setTimeout(() => clearInterval(interval), duration);

        if (!this.animating) {
            this.animating = true;
            this.animate();
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles = this.particles.filter(p => {
            p.x += p.velocityX;
            p.y += p.velocityY;
            p.velocityY += 0.3;
            p.velocityX *= 0.99;
            p.rotation += p.rotationSpeed;
            p.opacity -= 0.008;

            if (p.opacity <= 0 || p.y > this.canvas.height + 50) {
                return false;
            }

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate((p.rotation * Math.PI) / 180);
            this.ctx.globalAlpha = p.opacity;
            this.ctx.fillStyle = p.color;

            if (p.shape === 'rect') {
                this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            } else {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
            }

            this.ctx.restore();
            return true;
        });

        if (this.particles.length > 0) {
            requestAnimationFrame(() => this.animate());
        } else {
            this.animating = false;
        }
    }
}

// ==========================================
// GLITCH MANAGER
// ==========================================

class GlitchManager {
    constructor() {
        this.overlay = document.getElementById('glitch-overlay');
    }

    trigger() {
        this.overlay.classList.add('active');

        document.querySelectorAll('.glitch').forEach(el => {
            el.classList.add('active');
        });

        setTimeout(() => {
            this.overlay.classList.remove('active');
            document.querySelectorAll('.glitch').forEach(el => {
                el.classList.remove('active');
            });
        }, 150);
    }

    triggerMultiple(times = 3, interval = 200) {
        let count = 0;
        const glitchInterval = setInterval(() => {
            this.trigger();
            count++;
            if (count >= times) {
                clearInterval(glitchInterval);
            }
        }, interval);
    }
}

// ==========================================
// SCREEN MANAGER
// ==========================================

class ScreenManager {
    constructor() {
        this.screens = document.querySelectorAll('.screen');
        this.currentScreen = 'screen-intro';
    }

    show(screenId) {
        this.screens.forEach(screen => {
            screen.classList.remove('active', 'fade-in');
        });

        const target = document.getElementById(screenId);
        if (target) {
            target.classList.add('active', 'fade-in');
            this.currentScreen = screenId;
        }
    }

    async transition(fromId, toId, delay = 300) {
        const from = document.getElementById(fromId);
        if (from) from.classList.add('fade-out');

        await this.sleep(delay);
        this.show(toId);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ==========================================
// TERMINAL INTRO
// ==========================================

class TerminalIntro {
    constructor(app) {
        this.app = app;
        this.output = document.getElementById('terminal-output');
        this.cursor = document.getElementById('terminal-cursor');
        this.container = document.querySelector('.terminal-container');
        this.currentText = '';
    }

    async play() {
        // Hide tap indicator
        document.getElementById('tap-to-start').classList.add('hidden');

        // Show terminal
        await this.sleep(300);
        this.container.classList.add('visible');

        await this.sleep(500);

        // Start dial-up sound
        this.app.soundManager.playDialUp(4000);

        // Type the intro sequence
        await this.typeLine('$ ./joyce_birthday.exe', 50);
        await this.sleep(300);

        await this.typeLine('\n> Connecting...', 40);
        await this.sleep(800);

        await this.typeLine('\n> Loading: JOYCE', 60);
        await this.sleep(200);
        await this.typeLine('\n> Loading: IS (BIJNA) JARIG!!', 60);
        await this.sleep(400);

        // First error
        await this.typeLineWithClass('\n> ERROR: Celebration overflow', 'terminal-error', 40);
        this.app.soundManager.playError();
        await this.sleep(600);

        await this.typeLine('\n> Retrying...', 50);
        await this.sleep(500);

        await this.typeLineWithClass('\n> ERROR: Too much fun detected', 'terminal-error', 40);
        this.app.soundManager.playError();
        await this.sleep(600);

        await this.typeLine('\n> Attempting recovery...', 50);
        await this.sleep(400);

        await this.typeLineWithClass('\n> WARNING: Gift too awesome', 'terminal-warning', 40);
        await this.sleep(500);

        await this.typeLine('\n> Falling back to safe mode...', 50);
        await this.sleep(800);

        await this.typeLineWithClass('\n> Success! Launching...', 'terminal-success', 40);
        this.app.soundManager.playSuccess();

        await this.sleep(800);

        // Transition to loading
        this.app.screenManager.transition('screen-intro', 'screen-loading');

        setTimeout(() => {
            this.app.startLoadingSequence();
        }, 500);
    }

    async typeLine(text, speed = 50) {
        for (const char of text) {
            this.currentText += char;
            this.output.textContent = this.currentText;
            if (char !== ' ' && char !== '\n') {
                this.app.soundManager.playType();
            }
            await this.sleep(speed + Math.random() * 30);
        }
    }

    async typeLineWithClass(text, className, speed = 50) {
        // Add span with class
        const startIndex = this.currentText.length;

        for (const char of text) {
            this.currentText += char;

            // Rebuild with span
            const beforeSpan = this.currentText.substring(0, startIndex);
            const spanContent = this.currentText.substring(startIndex);

            this.output.innerHTML = beforeSpan + `<span class="${className}">${spanContent}</span>`;

            if (char !== ' ' && char !== '\n') {
                this.app.soundManager.playType();
            }
            await this.sleep(speed + Math.random() * 30);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ==========================================
// MAIN APP
// ==========================================

class BirthdayApp {
    constructor() {
        this.screenManager = new ScreenManager();
        this.soundManager = new SoundManager();
        this.glitchManager = new GlitchManager();
        this.confetti = new ConfettiManager(document.getElementById('confetti-canvas'));
        this.particles = new ParticleBackground(document.getElementById('particle-canvas'));
        this.terminalIntro = new TerminalIntro(this);

        this.loadingStatuses = [
            'Voorbereiden...',
            'Cadeau inpakken...',
            'Strik erop doen...',
            'Glitter toevoegen...',
            'Bijna klaar...',
            'Hmm, even wachten...',
            'Nog heel even...'
        ];
    }

    init() {
        const startExperience = async () => {
            document.removeEventListener('click', startExperience);
            document.removeEventListener('touchstart', startExperience);

            // Request fullscreen
            this.requestFullscreen();

            if (!this.soundManager.audioContext) {
                this.soundManager.init();
            }

            await this.terminalIntro.play();
        };

        document.addEventListener('click', startExperience, { once: true });
        document.addEventListener('touchstart', startExperience, { once: true });

        this.setupEventListeners();
    }

    async startLoadingSequence() {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const loadingStatus = document.getElementById('loading-status');

        let progress = 0;
        const targetProgress = 94;
        let statusIndex = 0;

        const statusInterval = setInterval(() => {
            if (statusIndex < this.loadingStatuses.length) {
                loadingStatus.textContent = this.loadingStatuses[statusIndex];
                statusIndex++;
            }
        }, 600);

        const progressInterval = setInterval(() => {
            if (progress < targetProgress) {
                const increment = progress < 80 ? Math.random() * 8 + 2 : Math.random() * 2 + 0.5;
                progress = Math.min(progress + increment, targetProgress);
                progressFill.style.width = progress + '%';
                progressText.textContent = Math.floor(progress) + '%';
            } else {
                clearInterval(progressInterval);
                clearInterval(statusInterval);
                loadingStatus.textContent = 'Bijna klaar...';
                setTimeout(() => this.triggerCrash(), 1000);
            }
        }, 150);
    }

    async triggerCrash() {
        this.glitchManager.triggerMultiple(4, 100);
        this.soundManager.playError();

        await this.sleep(500);
        this.screenManager.transition('screen-loading', 'screen-error1');
    }

    setupEventListeners() {
        // Retry 1
        document.getElementById('btn-retry1').addEventListener('click', async () => {
            this.soundManager.playClick();
            this.glitchManager.trigger();

            await this.sleep(300);
            this.soundManager.playError();
            this.glitchManager.triggerMultiple(2, 150);

            await this.sleep(400);
            this.screenManager.transition('screen-error1', 'screen-error2');

            setTimeout(() => this.animateErrorList(), 300);
        });

        // Retry 2
        document.getElementById('btn-retry2').addEventListener('click', async () => {
            this.soundManager.playClick();
            this.glitchManager.trigger();

            await this.sleep(200);
            this.soundManager.playError();
            this.glitchManager.triggerMultiple(3, 100);

            await this.sleep(400);
            this.screenManager.transition('screen-error2', 'screen-error3');

            // Play dramatic stinger
            setTimeout(() => {
                this.soundManager.playDramaticStinger();
            }, 300);
        });

        // Confirm
        document.getElementById('btn-confirm').addEventListener('click', async () => {
            this.soundManager.playClick();
            this.glitchManager.triggerMultiple(5, 80);

            await this.sleep(600);
            this.soundManager.playSuccess();

            await this.sleep(200);
            this.screenManager.transition('screen-error3', 'screen-terms');
        });

        // Checkboxes
        const checkboxes = document.querySelectorAll('.term-checkbox');
        const acceptBtn = document.getElementById('btn-accept');

        checkboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                this.soundManager.playCheckbox();
                const allChecked = Array.from(checkboxes).every(c => c.checked);
                acceptBtn.disabled = !allChecked;
            });
        });

        // Replay
        document.getElementById('btn-replay').addEventListener('click', () => {
            this.soundManager.playClick();
            this.reset();
        });

        // Ticket click -> redirect with toast
        document.getElementById('ticket').addEventListener('click', () => {
            this.soundManager.playClick();
            const toast = document.getElementById('redirect-toast');
            toast.classList.add('visible');

            setTimeout(() => {
                window.location.href = 'https://hansteeuwen.nl';
            }, 1500);
        });

        // Accept
        acceptBtn.addEventListener('click', async () => {
            if (acceptBtn.disabled) return;

            this.soundManager.playClick();

            await this.sleep(200);
            this.screenManager.transition('screen-terms', 'screen-reveal');

            // Reveal sequence
            setTimeout(() => {
                // Activate spotlight
                document.getElementById('spotlight').classList.add('active');

                // Step 1: Show teaser "Je gaat naar..." + start drumroll
                setTimeout(() => {
                    document.getElementById('reveal-teaser').classList.add('visible');
                    this.soundManager.playDrumroll();
                }, 300);

                // Step 2: After drumroll - show HANS TEEUWEN + ticket + confetti together
                setTimeout(() => {
                    // Show HANS TEEUWEN
                    document.querySelector('.reveal-header').classList.add('visible');

                    // Show ticket
                    document.getElementById('ticket').classList.add('visible');

                    // Champagne + confetti
                    this.soundManager.playChampagne();
                    this.confetti.burst(window.innerWidth / 2, window.innerHeight / 3, 100);

                    // Confetti rain
                    setTimeout(() => {
                        this.confetti.rain(5000);
                    }, 300);
                }, 3200);

                // Step 3: Show footer
                setTimeout(() => {
                    document.querySelector('.reveal-footer').classList.add('visible');
                }, 4000);
            }, 400);
        });
    }

    animateErrorList() {
        const items = document.querySelectorAll('.error-list-item');
        items.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('visible');
            }, index * 300);
        });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    isIOSChrome() {
        const ua = navigator.userAgent;
        const isIOS = /iPad|iPhone|iPod/.test(ua);
        const isChrome = /CriOS/.test(ua);
        return isIOS && isChrome;
    }

    requestFullscreen() {
        const elem = document.documentElement;

        // Try standard Fullscreen API
        const requestFS = elem.requestFullscreen ||
                         elem.webkitRequestFullscreen ||
                         elem.mozRequestFullScreen ||
                         elem.msRequestFullscreen;

        if (requestFS) {
            requestFS.call(elem).catch(() => {
                // Fullscreen failed, try alternative for Chrome
                console.log('Fullscreen not available');
            });
        }

        // Lock orientation to portrait if possible
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('portrait').catch(() => {});
        }
    }

    reset() {
        // Reset terminal
        this.terminalIntro.currentText = '';
        this.terminalIntro.output.textContent = '';
        document.querySelector('.terminal-container').classList.remove('visible');
        document.getElementById('tap-to-start').classList.remove('hidden');

        // Reset progress
        document.getElementById('progress-fill').style.width = '0%';
        document.getElementById('progress-text').textContent = '0%';
        document.getElementById('loading-status').textContent = 'Voorbereiden...';

        // Reset checkboxes
        document.querySelectorAll('.term-checkbox').forEach(cb => cb.checked = false);
        document.getElementById('btn-accept').disabled = true;

        // Reset reveal elements
        document.getElementById('spotlight').classList.remove('active');
        document.querySelector('.reveal-header').classList.remove('visible');
        document.getElementById('ticket').classList.remove('visible');
        document.querySelector('.reveal-footer').classList.remove('visible');

        // Reset error list items
        document.querySelectorAll('.error-list-item').forEach(item => {
            item.classList.remove('visible');
        });

        // Go back to intro
        this.screenManager.show('screen-intro');
    }
}

// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const app = new BirthdayApp();
    app.init();
});
