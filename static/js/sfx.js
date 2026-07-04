export const Sfx = {
  ctx: null,
  init() {
    try {
      if (this.ctx) return;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.ctx = new AudioContext();
    } catch (e) {
      console.warn('[Sfx] AudioContext init failed:', e);
    }
  },
  playClick() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) { console.warn('[Sfx] playClick failed:', e); }
  },
  playHover() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(460, now);
      osc.frequency.setValueAtTime(580, now + 0.02);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) { console.warn('[Sfx] playHover failed:', e); }
  },
  playScramble() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200 + Math.random() * 1800, now);
      gain.gain.setValueAtTime(0.016, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.015);
    } catch (e) { console.warn('[Sfx] playScramble failed:', e); }
  },
  playSlide() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.4);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) { console.warn('[Sfx] playSlide failed:', e); }
  },
  playBoost() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(75, now);
      osc.frequency.linearRampToValueAtTime(220, now + 0.65);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.7);
    } catch (e) { console.warn('[Sfx] playBoost failed:', e); }
  },
  playGear(isOpen) {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      const startFreq = isOpen ? 500 : 250;
      const endFreq = isOpen ? 250 : 500;
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.22);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) { console.warn('[Sfx] playGear failed:', e); }
  },
  playArrival() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(180, now);
      osc1.frequency.exponentialRampToValueAtTime(65, now + 2.0);

      osc2.frequency.setValueAtTime(184, now);
      osc2.frequency.exponentialRampToValueAtTime(67, now + 2.0);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(150, now + 2.0);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.03, now + 2.0);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);

      gain.gain.setValueAtTime(0.03, now + 2.0);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);
      osc1.stop(now + 3.0);
      osc2.stop(now + 3.0);
    } catch (e) { console.warn('[Sfx] playArrival failed:', e); }
  },
  playManeuver() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.linearRampToValueAtTime(45, now + 0.15);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) { console.warn('[Sfx] playManeuver failed:', e); }
  },
  playStartup() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [0, 0.1, 0.2].forEach((delay, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const pitch = idx === 2 ? 1600 : 1200;
        osc.frequency.setValueAtTime(pitch, now + delay);
        gain.gain.setValueAtTime(0.02, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.06);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.06);
      });
    } catch (e) { console.warn('[Sfx] playStartup failed:', e); }
  },
  playGlitch() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(3000 + Math.random() * 2000, now);
      gain.gain.setValueAtTime(0.008, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.01);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.01);
    } catch (e) { console.warn('[Sfx] playGlitch failed:', e); }
  },
  playChime() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.03, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8 + idx * 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 1.2 + idx * 0.1);
      });
    } catch (e) { console.warn('[Sfx] playChime failed:', e); }
  }
};

const resumeAudio = () => {
  Sfx.init();
  if (Sfx.ctx && Sfx.ctx.state === 'suspended') {
    Sfx.ctx.resume();
  }
  removeEventListener('click', resumeAudio);
  removeEventListener('touchstart', resumeAudio);
};
addEventListener('click', resumeAudio);
addEventListener('touchstart', resumeAudio);
