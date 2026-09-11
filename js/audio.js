/**
 * Audio Synthesizer Module (Web Audio API)
 * Zero-dependency synthesized sound effects inspired by Apple OS sound design.
 * Section 18 of agent.md
 */

export class AudioEngine {
  constructor() {
    this.audioCtx = null;
    this.soundEnabled = localStorage.getItem('sound_enabled') !== 'false';
    this.isMutedForExperiment = false;
  }

  getAudioContext() {
    if (!this.audioCtx && typeof window.AudioContext !== 'undefined') {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  setEnabled(val) {
    this.soundEnabled = val;
    localStorage.setItem('sound_enabled', val ? 'true' : 'false');
  }

  isEnabled() {
    return this.soundEnabled && !this.isMutedForExperiment;
  }

  setExperimentMute(isMuted) {
    this.isMutedForExperiment = isMuted;
  }

  /**
   * Soft keyboard / dispatch tap
   */
  playSendSound() {
    if (!this.isEnabled()) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(310, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  }

  /**
   * Subtle transit flutter
   */
  playTransitSound() {
    if (!this.isEnabled()) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(540, ctx.currentTime + 0.07);

      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch {}
  }

  /**
   * Crystal two-tone success chime
   */
  playSuccessSound() {
    if (!this.isEnabled()) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [587.33, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0.06, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.35);
      });
    } catch {}
  }

  /**
   * Soft mismatch / muted tone
   */
  playFailureSound() {
    this.playFailureFaah();
  }

  /**
   * Synthesized comedic "faah" disappointed vocal sound effect
   * Dual oscillator (sawtooth/triangle) with dynamic lowpass formant filter envelope
   * Frequency slides down from 220Hz to 110Hz over ~400ms
   */
  playFailureFaah() {
    if (!this.isEnabled()) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const duration = 0.42;

      // Primary voice oscillator (Sawtooth)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(220, now);
      osc1.frequency.exponentialRampToValueAtTime(110, now + duration);

      // Sub harmonic oscillator (Triangle for warmth)
      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(216, now); // Slight detune for vocal richness
      osc2.frequency.exponentialRampToValueAtTime(108, now + duration);

      // Vocal formant lowpass filter (simulates "aaah/faah" sound)
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.setValueAtTime(3.5, now);
      filter.frequency.setValueAtTime(750, now);
      filter.frequency.exponentialRampToValueAtTime(320, now + duration);

      // Master gain envelope
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.03); // Quick attack
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration); // Smooth release

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    } catch {}
  }
}
