'use client';

type Note = { freq: number; at: number; dur: number; type?: OscillatorType; gain?: number };

/** Small Web Audio synth for subtle feedback sounds. No audio files needed. */
class SoundFX {
  private ctx: AudioContext | null = null;
  private enabled = true;

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  private context(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  private play(notes: Note[]) {
    if (!this.enabled) return;
    const ctx = this.context();
    if (!ctx) return;
    const now = ctx.currentTime;
    for (const n of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = n.type ?? 'sine';
      osc.frequency.setValueAtTime(n.freq, now + n.at);
      const peak = n.gain ?? 0.12;
      gain.gain.setValueAtTime(0.0001, now + n.at);
      gain.gain.exponentialRampToValueAtTime(peak, now + n.at + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.at + n.dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + n.at);
      osc.stop(now + n.at + n.dur + 0.05);
    }
  }

  click() {
    this.play([{ freq: 520, at: 0, dur: 0.06, gain: 0.06 }]);
  }

  select() {
    this.play([{ freq: 660, at: 0, dur: 0.08, type: 'triangle', gain: 0.07 }]);
  }

  correct() {
    this.play([
      { freq: 523.25, at: 0, dur: 0.18, type: 'triangle' },
      { freq: 659.25, at: 0.09, dur: 0.18, type: 'triangle' },
      { freq: 783.99, at: 0.18, dur: 0.3, type: 'triangle' },
    ]);
  }

  incorrect() {
    this.play([
      { freq: 311.13, at: 0, dur: 0.2, type: 'sine', gain: 0.1 },
      { freq: 261.63, at: 0.16, dur: 0.3, type: 'sine', gain: 0.09 },
    ]);
  }

  activation() {
    if (!this.enabled) return;
    const ctx = this.context();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.45);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.07, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.65);
  }

  missionComplete() {
    this.play([
      { freq: 587.33, at: 0, dur: 0.15, type: 'triangle', gain: 0.08 },
      { freq: 880, at: 0.1, dur: 0.25, type: 'triangle', gain: 0.08 },
    ]);
  }

  chain() {
    this.play([
      { freq: 523.25, at: 0, dur: 0.14, type: 'square', gain: 0.04 },
      { freq: 659.25, at: 0.1, dur: 0.14, type: 'square', gain: 0.04 },
      { freq: 783.99, at: 0.2, dur: 0.14, type: 'square', gain: 0.04 },
      { freq: 1046.5, at: 0.3, dur: 0.35, type: 'triangle', gain: 0.1 },
    ]);
  }

  place() {
    this.play([{ freq: 740, at: 0, dur: 0.09, type: 'triangle', gain: 0.08 }]);
  }

  bounce() {
    this.play([{ freq: 200, at: 0, dur: 0.14, type: 'sine', gain: 0.08 }]);
  }

  tick() {
    this.play([{ freq: 1000, at: 0, dur: 0.04, gain: 0.04 }]);
  }

  finale() {
    this.play([
      { freq: 392, at: 0, dur: 0.4, type: 'triangle', gain: 0.08 },
      { freq: 523.25, at: 0.15, dur: 0.4, type: 'triangle', gain: 0.08 },
      { freq: 659.25, at: 0.3, dur: 0.4, type: 'triangle', gain: 0.08 },
      { freq: 783.99, at: 0.45, dur: 0.8, type: 'triangle', gain: 0.1 },
    ]);
  }
}

export const sfx = new SoundFX();
