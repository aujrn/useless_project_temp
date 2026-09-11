/* Random Relay Messaging Simulator - Standalone Bundle */

(function() {

'use strict';

// --- algorithms.js ---
/**
 * Core Encoder / Decoder Algorithms
 * 10 Paired Reversible Systems & Deterministic Corruption Logic
 * Fully Unicode-safe (supporting Emojis 😀🚀, Malayalam മലയാളം, symbols, newlines, tabs)
 */

const ALGORITHM_PAIRS = [
  {
    id: 1,
    key: 'caesar',
    pairId: 'caesar',
    name: 'Caesar Shift (+3)',
    encoderName: 'Encoder 01 · Caesar (+3)',
    decoderName: 'Decoder 01 · Caesar (-3)',
    description: 'Rotates alphabetical characters forward by 3 positions, preserving Unicode & symbols.',
    encode: (text) => {
      return text.replace(/[a-zA-Z]/g, (char) => {
        const code = char.charCodeAt(0);
        const base = code >= 65 && code <= 90 ? 65 : 97;
        return String.fromCharCode(((code - base + 3) % 26) + base);
      });
    },
    decode: (payload) => {
      return payload.replace(/[a-zA-Z]/g, (char) => {
        const code = char.charCodeAt(0);
        const base = code >= 65 && code <= 90 ? 65 : 97;
        return String.fromCharCode(((code - base - 3 + 26) % 26) + base);
      });
    }
  },
  {
    id: 2,
    key: 'atbash',
    pairId: 'atbash',
    name: 'Atbash Substitution',
    encoderName: 'Encoder 02 · Atbash Cipher',
    decoderName: 'Decoder 02 · Atbash Inverse',
    description: 'Replaces letters with their symmetric alphabet opposite (A ↔ Z, B ↔ Y).',
    encode: (text) => {
      return text.replace(/[a-zA-Z]/g, (char) => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          return String.fromCharCode(90 - (code - 65));
        } else {
          return String.fromCharCode(122 - (code - 97));
        }
      });
    },
    decode: (payload) => {
      return payload.replace(/[a-zA-Z]/g, (char) => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          return String.fromCharCode(90 - (code - 65));
        } else {
          return String.fromCharCode(122 - (code - 97));
        }
      });
    }
  },
  {
    id: 3,
    key: 'reverse-case',
    pairId: 'reverse-case',
    name: 'Reverse + Invert Case',
    encoderName: 'Encoder 03 · Reverse & Invert',
    decoderName: 'Decoder 03 · Revert & Restore',
    description: 'Reverses grapheme/character order and toggles letter casing, emoji-safe.',
    encode: (text) => {
      const chars = Array.from(text);
      const toggled = chars.map((c) => {
        if (c >= 'a' && c <= 'z') return c.toUpperCase();
        if (c >= 'A' && c <= 'Z') return c.toLowerCase();
        return c;
      });
      return toggled.reverse().join('');
    },
    decode: (payload) => {
      const chars = Array.from(payload).reverse();
      return chars
        .map((c) => {
          if (c >= 'a' && c <= 'z') return c.toUpperCase();
          if (c >= 'A' && c <= 'Z') return c.toLowerCase();
          return c;
        })
        .join('');
    }
  },
  {
    id: 4,
    key: 'xor-hex',
    pairId: 'xor-hex',
    name: 'XOR Mask (0x5A)',
    encoderName: 'Encoder 04 · XOR 0x5A Hex',
    decoderName: 'Decoder 04 · XOR 0x5A Revert',
    description: 'Applies bitwise XOR 0x5A over UTF-8 byte stream and formats as hyphenated hex.',
    encode: (text) => {
      const bytes = new TextEncoder().encode(text);
      const hexArr = [];
      for (let i = 0; i < bytes.length; i++) {
        const masked = (bytes[i] ^ 0x5a) & 0xff;
        hexArr.push(masked.toString(16).padStart(2, '0').toUpperCase());
      }
      return hexArr.join('-');
    },
    decode: (payload) => {
      try {
        const parts = payload.split('-');
        const bytes = new Uint8Array(parts.length);
        for (let i = 0; i < parts.length; i++) {
          const b = parseInt(parts[i], 16);
          if (isNaN(b)) return null;
          bytes[i] = (b ^ 0x5a) & 0xff;
        }
        return new TextDecoder().decode(bytes);
      } catch {
        return null;
      }
    }
  },
  {
    id: 5,
    key: 'base64',
    pairId: 'base64',
    name: 'Base64 Representation',
    encoderName: 'Encoder 05 · Base64 Wrapper',
    decoderName: 'Decoder 05 · Base64 Unwrapper',
    description: 'Encodes Unicode text into standard Base64 representation (clearly labeled as encoding, not encryption).',
    encode: (text) => {
      const bytes = new TextEncoder().encode(text);
      let binStr = '';
      for (let i = 0; i < bytes.length; i++) {
        binStr += String.fromCharCode(bytes[i]);
      }
      return btoa(binStr);
    },
    decode: (payload) => {
      try {
        const binStr = atob(payload);
        const bytes = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i++) {
          bytes[i] = binStr.charCodeAt(i);
        }
        return new TextDecoder().decode(bytes);
      } catch {
        return null;
      }
    }
  },
  {
    id: 6,
    key: 'vigenere',
    pairId: 'vigenere',
    name: 'Vigenère ("ENIGMA")',
    encoderName: 'Encoder 06 · Vigenère Polyalphabetic',
    decoderName: 'Decoder 06 · Vigenère Decryptor',
    description: 'Polyalphabetic substitution cipher using repeating key "ENIGMA".',
    encode: (text) => {
      const key = 'ENIGMA';
      let keyIdx = 0;
      return text.replace(/[a-zA-Z]/g, (char) => {
        const isUpper = char >= 'A' && char <= 'Z';
        const base = isUpper ? 65 : 97;
        const shift = key.charCodeAt(keyIdx % key.length) - 65;
        keyIdx++;
        return String.fromCharCode(((char.charCodeAt(0) - base + shift) % 26) + base);
      });
    },
    decode: (payload) => {
      const key = 'ENIGMA';
      let keyIdx = 0;
      return payload.replace(/[a-zA-Z]/g, (char) => {
        const isUpper = char >= 'A' && char <= 'Z';
        const base = isUpper ? 65 : 97;
        const shift = key.charCodeAt(keyIdx % key.length) - 65;
        keyIdx++;
        return String.fromCharCode(((char.charCodeAt(0) - base - shift + 26) % 26) + base);
      });
    }
  },
  {
    id: 7,
    key: 'binary-stream',
    pairId: 'binary-stream',
    name: '8-bit Binary Stream',
    encoderName: 'Encoder 07 · Binary Stream (8-bit)',
    decoderName: 'Decoder 07 · Binary to Text',
    description: 'Converts UTF-8 bytes into 8-bit binary strings separated by spaces.',
    encode: (text) => {
      const bytes = new TextEncoder().encode(text);
      const binArr = [];
      for (let i = 0; i < bytes.length; i++) {
        binArr.push(bytes[i].toString(2).padStart(8, '0'));
      }
      return binArr.join(' ');
    },
    decode: (payload) => {
      try {
        const chunks = payload.trim().split(/\s+/);
        const bytes = new Uint8Array(chunks.length);
        for (let i = 0; i < chunks.length; i++) {
          if (!/^[01]{8}$/.test(chunks[i])) return null;
          bytes[i] = parseInt(chunks[i], 2);
        }
        return new TextDecoder().decode(bytes);
      } catch {
        return null;
      }
    }
  },
  {
    id: 8,
    key: 'railfence',
    pairId: 'railfence',
    name: 'Rail Fence (3 Rails)',
    encoderName: 'Encoder 08 · Rail Fence Zig-Zag',
    decoderName: 'Decoder 08 · Rail Fence Reconstruct',
    description: 'Transposition cipher placing characters in a 3-rail zig-zag pattern, emoji-safe.',
    encode: (text) => {
      const chars = Array.from(text);
      if (chars.length <= 3) return text;
      const rails = [[], [], []];
      let rail = 0;
      let direction = 1;
      for (let i = 0; i < chars.length; i++) {
        rails[rail].push(chars[i]);
        rail += direction;
        if (rail === 2) direction = -1;
        else if (rail === 0) direction = 1;
      }
      return rails[0].join('') + rails[1].join('') + rails[2].join('');
    },
    decode: (payload) => {
      const chars = Array.from(payload);
      if (chars.length <= 3) return payload;
      const railLengths = [0, 0, 0];
      let rail = 0;
      let direction = 1;
      for (let i = 0; i < chars.length; i++) {
        railLengths[rail]++;
        rail += direction;
        if (rail === 2) direction = -1;
        else if (rail === 0) direction = 1;
      }

      const rails = [
        chars.slice(0, railLengths[0]),
        chars.slice(railLengths[0], railLengths[0] + railLengths[1]),
        chars.slice(railLengths[0] + railLengths[1])
      ];

      let out = '';
      rail = 0;
      direction = 1;
      for (let i = 0; i < chars.length; i++) {
        out += rails[rail].shift();
        rail += direction;
        if (rail === 2) direction = -1;
        else if (rail === 0) direction = 1;
      }
      return out;
    }
  },
  {
    id: 9,
    key: 'hex-byte',
    pairId: 'hex-byte',
    name: 'Hexadecimal Stream',
    encoderName: 'Encoder 09 · Hex Byte Stream',
    decoderName: 'Decoder 09 · Hex Byte Converter',
    description: 'Converts UTF-8 byte stream into contiguous uppercase hexadecimal bytes.',
    encode: (text) => {
      const bytes = new TextEncoder().encode(text);
      let hex = '';
      for (let i = 0; i < bytes.length; i++) {
        hex += bytes[i].toString(16).padStart(2, '0').toUpperCase();
      }
      return '0x' + hex;
    },
    decode: (payload) => {
      try {
        let clean = payload.startsWith('0x') ? payload.slice(2) : payload;
        if (clean.length % 2 !== 0) return null;
        const bytes = new Uint8Array(clean.length / 2);
        for (let i = 0; i < clean.length; i += 2) {
          const byteVal = parseInt(clean.substr(i, 2), 16);
          if (isNaN(byteVal)) return null;
          bytes[i / 2] = byteVal;
        }
        return new TextDecoder().decode(bytes);
      } catch {
        return null;
      }
    }
  },
  {
    id: 10,
    key: 'symbol-token',
    pairId: 'symbol-token',
    name: 'Symbol Token Substitution',
    encoderName: 'Encoder 10 · Symbol Token Matrix',
    decoderName: 'Decoder 10 · Symbol Matrix Reversal',
    description: 'Bijective mapping exchanging vowels and select consonants with phonetic symbols.',
    encode: (text) => {
      const map = {
        'a': 'α', 'A': 'Δ',
        'e': 'ε', 'E': 'Ξ',
        'i': 'ι', 'I': 'Ψ',
        'o': 'ω', 'O': 'Ω',
        'u': 'μ', 'U': 'θ',
        'σ': 's', 'S': '§',
        't': 'τ', 'T': '†',
        'r': 'ρ', 'R': '®',
        'n': 'η', 'N': 'Π'
      };
      return Array.from(text)
        .map((c) => map[c] || c)
        .join('');
    },
    decode: (payload) => {
      const reverseMap = {
        'α': 'a', 'Δ': 'A',
        'ε': 'e', 'Ξ': 'E',
        'ι': 'i', 'Ψ': 'I',
        'ω': 'o', 'Ω': 'O',
        'μ': 'u', 'θ': 'U',
        'σ': 's', '§': 'S',
        'τ': 't', '†': 'T',
        'ρ': 'r', '®': 'R',
        'η': 'n', 'Π': 'N'
      };
      return Array.from(payload)
        .map((c) => reverseMap[c] || c)
        .join('');
    }
  }
];

/**
 * Generate deliberate, plausible corrupted gibberish output when an incompatible
 * decoder attempts to process an encoded payload.
 *
 * Requirements (Section 7 of agent.md):
 * - Deterministic for given transmission state.
 * - Plausible visual gibberish/glitch output.
 * - Must not accidentally equal the original plaintext.
 * - Must preserve application stability for Unicode, emoji, long messages.
 */
function generateCorruptedOutput(payload, encoder, decoder) {
  let attemptedDecode = null;
  try {
    attemptedDecode = decoder.decode(payload);
  } catch {
    attemptedDecode = null;
  }

  const glitchGlyphs = ['░', '▒', '▓', '?', '¿', '§', '¶', '×', 'ø', '¥', '9x', '#!'];

  let seed = (encoder.id * 73 + decoder.id * 31) % 10007;
  const safeChars = Array.from(payload);
  for (let i = 0; i < Math.min(safeChars.length, 30); i++) {
    seed = (seed * 33 + safeChars[i].codePointAt(0)) % 10007;
  }

  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  let base = attemptedDecode && attemptedDecode.length >= 3 ? attemptedDecode : payload;

  const baseChars = Array.from(base);
  if (baseChars.length > 36) {
    base = baseChars.slice(0, 32).join('') + '...';
  }

  const chars = Array.from(base);
  const corrupted = [];

  for (let i = 0; i < chars.length; i++) {
    const r = seededRandom();
    const c = chars[i];

    if (r < 0.25) {
      const glyph = glitchGlyphs[Math.floor(seededRandom() * glitchGlyphs.length)];
      corrupted.push(glyph);
    } else if (r < 0.45 && /[a-zA-Z]/.test(c)) {
      const leet = { a: '4', e: '3', i: '1', o: '0', s: '5', t: '7', b: '8' };
      const low = c.toLowerCase();
      corrupted.push(leet[low] || (seededRandom() > 0.5 ? c.toUpperCase() : c.toLowerCase()));
    } else if (r < 0.6 && /[a-zA-Z]/.test(c)) {
      const shift = Math.floor(seededRandom() * 10) + 1;
      corrupted.push(String.fromCharCode((c.charCodeAt(0) + shift) % 126));
    } else {
      corrupted.push(c);
    }
  }

  let result = corrupted.join('');
  if (!result.includes('░') && !result.includes('▒') && !result.includes('?')) {
    const insertPos = Math.floor(result.length / 2);
    result = result.slice(0, insertPos) + ' ░▒?9x ' + result.slice(insertPos);
  }

  return result;
}

// --- audio.js ---
/**
 * Audio Synthesizer Module (Web Audio API)
 * Zero-dependency synthesized sound effects inspired by Apple OS sound design.
 * Section 18 of agent.md
 */

class AudioEngine {
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

// --- simulation.js ---
/**
 * Simulation Engine
 * Manages active systems, simulation modes (Random, Guaranteed Success, Guaranteed Failure),
 * timeline orchestration, session statistics, retry/attempt tracking, 100-message experiment,
 * and uselessness scoring.
 */


class MessagingSimulator {
  constructor(options = {}) {
    this.systemCount = options.systemCount || 3;
    this.speed = options.speed || 'normal';
    this.mode = options.mode || 'random'; // 'random', 'guaranteed_success', 'guaranteed_failure'
    this.autoExpandDetails = options.autoExpandDetails || false;
    this.animateResolve = options.animateResolve !== false;

    this.history = [];
    this.isTransmitting = false;
    this.listeners = new Map();

    // Session Statistics (Section 10)
    this.stats = {
      total: 0,
      successful: 0,
      failed: 0,
      consecutiveFailures: 0,
      consecutiveSuccesses: 0
    };

    // Retry / Attempt Tracking (Section 8)
    this.lastPlaintext = '';
    this.currentAttempt = 1;
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    for (const cb of callbacks) {
      try {
        cb(data);
      } catch (err) {
        console.error(`Error in event listener for ${event}:`, err);
      }
    }
  }

  getActiveSystems() {
    return ALGORITHM_PAIRS.slice(0, this.systemCount);
  }

  getAllSystems() {
    return ALGORITHM_PAIRS;
  }

  setSystemCount(count) {
    const parsed = Math.max(1, Math.min(10, parseInt(count, 10) || 3));
    this.systemCount = parsed;
    this.emit('configChange', {
      systemCount: this.systemCount,
      probability: this.getProbability(),
      activeSystems: this.getActiveSystems(),
      stats: this.getStats()
    });
    return this.systemCount;
  }

  setMode(mode) {
    if (['random', 'guaranteed_success', 'guaranteed_failure'].includes(mode)) {
      this.mode = mode;
      this.emit('modeChange', { mode: this.mode });
    }
  }

  getProbability() {
    if (this.mode === 'guaranteed_success') return 0.0; // Inverted comedy rule: Guaranteed Success fails
    if (this.mode === 'guaranteed_failure') return 1.0; // Inverted comedy rule: Guaranteed Failure succeeds
    return 1 / this.systemCount;
  }

  getProbabilityFormatted() {
    const p = this.getProbability();
    const percent = (p * 100).toFixed(p === 1 || p === 0 ? 0 : 1);
    return {
      ratio: this.mode === 'random' ? `1 of ${this.systemCount}` : (this.mode === 'guaranteed_success' ? '0%' : '100%'),
      percent: `${percent}%`,
      value: p
    };
  }

  setSpeed(speed) {
    if (['normal', 'fast', 'instant'].includes(speed)) {
      this.speed = speed;
    }
  }

  _delay(baseMs) {
    if (this.speed === 'instant') return Promise.resolve();
    const multiplier = this.speed === 'fast' ? 0.5 : 1.0;
    return new Promise((resolve) => setTimeout(resolve, baseMs * multiplier));
  }

  /**
   * Session Statistics Computation (Section 10)
   */
  getStats() {
    const total = this.stats.total;
    const succ = this.stats.successful;
    const actualRate = total > 0 ? ((succ / total) * 100).toFixed(1) : '0.0';
    const expectedRate = (this.getProbability() * 100).toFixed(1);

    return {
      total,
      successful: succ,
      failed: this.stats.failed,
      actualRate: `${actualRate}%`,
      expectedRate: `${expectedRate}%`,
      actualVal: total > 0 ? succ / total : 0,
      expectedVal: this.getProbability(),
      currentAttempt: this.currentAttempt,
      uselessnessScore: this.computeUselessnessScore()
    };
  }

  /**
   * Uselessness Score (Section 13 of agent.md)
   * A deliberately absurd entertainment metric
   */
  computeUselessnessScore() {
    if (this.stats.total === 0) return 72; // Baseline delightful uselessness
    const failRate = this.stats.failed / this.stats.total;
    const systemFactor = this.systemCount * 2.5;
    const score = Math.min(99, Math.max(15, Math.round(35 + failRate * 45 + systemFactor)));
    return score;
  }

  /**
   * Humor Microcopy Generators (Section 4-15 of updated agent.md)
   */
  getProbabilitySubtext() {
    const p = this.getProbabilityFormatted();
    if (this.mode === 'guaranteed_success') return `0% match · You selected Guaranteed Success. Probability took that personally.`;
    if (this.mode === 'guaranteed_failure') return `100% match · You selected Guaranteed Failure. The system refuses to cooperate with your pessimism.`;
    if (this.systemCount === 1) return `${p.percent} match · We have discovered a functioning messaging system.`;
    if (this.systemCount === 2) return `${p.percent} match · Coin-flipping, but with infrastructure.`;
    if (this.systemCount === 3) return `${p.percent} match · This is already getting irresponsible.`;
    if (this.systemCount === 5) return `${p.percent} match · Bold strategy.`;
    if (this.systemCount === 10) return `${p.percent} match · Excellent architecture. Terrible odds.`;
    return `${p.percent} match · We strongly recommend lowering your expectations.`;
  }

  getRetryButtonLabel(attemptNumber) {
    if (attemptNumber <= 3) return 'Try again';
    if (attemptNumber <= 5) return 'One more time';
    if (attemptNumber <= 9) return 'Surely now';
    return 'This is fine';
  }

  getAttemptSubtext(attemptNumber) {
    if (attemptNumber === 4) return 'We remain optimistic.';
    if (attemptNumber === 6) return 'This is becoming a lifestyle.';
    if (attemptNumber >= 11) return 'Statistically, we have learned nothing.';
    return '';
  }

  getSuccessSubtext() {
    const variants = [
      'The systems agree.',
      'Against all odds.',
      'A rare moment of competence.',
      'The decoder knew what it was doing.',
      'Probability has briefly been kind.'
    ];
    return variants[Math.floor(Math.random() * variants.length)];
  }

  getFailureSubtext() {
    const variants = [
      'The decoder and encoder disagreed.',
      'Technically, something arrived.',
      'The payload survived. Its meaning did not.',
      'A message was received. It was not your message.',
      'The system has produced modern art.',
      'Please do not attempt to interpret this.'
    ];
    return variants[Math.floor(Math.random() * variants.length)];
  }

  /**
   * Core Send / Retry Transmission (Sections 2, 4, 8, 9)
   */
  async sendMessage(plaintext, isRetry = false) {
    const trimmed = (plaintext || '').trim();
    if (!trimmed) {
      this.emit('error', { message: 'Type a message first.' });
      return null;
    }

    if (this.isTransmitting) {
      this.emit('error', { message: 'Transmission in progress. Please wait.' });
      return null;
    }

    // Check Guaranteed Success (which fails) constraint when N = 1
    if (this.mode === 'guaranteed_success' && this.systemCount === 1) {
      this.emit('error', {
        message: 'Guaranteed Success is instructed to fail, but with 1 system (only 1 decoder exists!), failure is impossible. Increase systems to fail reliably.'
      });
      return null;
    }

    this.isTransmitting = true;
    const active = this.getActiveSystems();

    // Track attempts
    if (trimmed === this.lastPlaintext && isRetry) {
      this.currentAttempt++;
    } else {
      this.lastPlaintext = trimmed;
      this.currentAttempt = 1;
    }

    const messageId = 'msg_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

    const messageRecord = {
      id: messageId,
      originalMessage: trimmed,
      timestamp: new Date(),
      attemptNumber: this.currentAttempt,
      mode: this.mode,
      encoder: null,
      encodedPayload: '',
      decoder: null,
      matched: false,
      decodedMessage: '',
      status: 'pending'
    };

    try {
      // Step 1: Send initiated (0 ms)
      this.emit('phaseChange', {
        phase: 'started',
        step: 1,
        label: this.currentAttempt > 1 ? `Retry attempt #${this.currentAttempt}...` : 'Preparing transmission...',
        message: messageRecord
      });
      this.emit('messageSent', { message: messageRecord });

      // Step 2: Encoder selection (100 ms)
      this.emit('phaseChange', {
        phase: 'selecting_encoder',
        step: 2,
        label: 'Selecting encoder...',
        candidates: active.map((s) => s.encoderName)
      });

      await this._delay(150);
      const encoderIndex = Math.floor(Math.random() * active.length);
      const selectedEncoder = active[encoderIndex];

      messageRecord.encoder = {
        id: selectedEncoder.id,
        key: selectedEncoder.key,
        name: selectedEncoder.name,
        encoderName: selectedEncoder.encoderName,
        description: selectedEncoder.description
      };

      this.emit('phaseChange', {
        phase: 'encoder_selected',
        step: 2,
        label: `Selected: ${selectedEncoder.encoderName}`,
        encoder: selectedEncoder,
        candidateCount: active.length
      });

      // Step 3: Encoding (250 ms)
      await this._delay(150);
      const encodedPayload = selectedEncoder.encode(trimmed);
      messageRecord.encodedPayload = encodedPayload;

      this.emit('phaseChange', {
        phase: 'encoded',
        step: 3,
        label: 'Message encoded',
        payload: encodedPayload,
        encoder: selectedEncoder
      });

      // Step 4: Transmitting payload through central relay path (500 ms)
      await this._delay(250);
      this.emit('phaseChange', {
        phase: 'transmitting',
        step: 4,
        label: 'Transmitting payload through relay...',
        payload: encodedPayload
      });

      // Step 5: Decoder selection (700 ms)
      this.emit('phaseChange', {
        phase: 'selecting_decoder',
        step: 5,
        label: 'Selecting decoder...',
        candidates: active.map((s) => s.decoderName)
      });

      await this._delay(200);

      // Apply Simulation Mode logic (Inverted comedy rule)
      let selectedDecoder = null;
      if (this.mode === 'guaranteed_success') {
        // Guaranteed Success button clicked -> Force Failure by picking mismatching decoder!
        const otherDecoders = active.filter((d) => (d.pairId || d.id) !== (selectedEncoder.pairId || selectedEncoder.id));
        const randIdx = Math.floor(Math.random() * otherDecoders.length);
        selectedDecoder = otherDecoders[randIdx] || selectedEncoder;
      } else if (this.mode === 'guaranteed_failure') {
        // Guaranteed Failure button clicked -> Force Success by picking matching decoder!
        selectedDecoder = selectedEncoder;
      } else {
        // Random mode (uniformly random independent selection)
        const decoderIndex = Math.floor(Math.random() * active.length);
        selectedDecoder = active[decoderIndex];
      }

      messageRecord.decoder = {
        id: selectedDecoder.id,
        key: selectedDecoder.key,
        name: selectedDecoder.name,
        decoderName: selectedDecoder.decoderName,
        description: selectedDecoder.description
      };

      this.emit('phaseChange', {
        phase: 'decoder_selected',
        step: 5,
        label: `Selected: ${selectedDecoder.decoderName}`,
        decoder: selectedDecoder,
        candidateCount: active.length
      });

      // Step 6: Decoding & Compatibility evaluation (900 ms)
      await this._delay(200);
      const isMatch = (selectedEncoder.pairId || selectedEncoder.id) === (selectedDecoder.pairId || selectedDecoder.id);
      messageRecord.matched = isMatch;

      let finalDecodedText = '';
      if (isMatch) {
        finalDecodedText = selectedDecoder.decode(encodedPayload);
        if (finalDecodedText === null || finalDecodedText === undefined) {
          finalDecodedText = trimmed;
        }
      } else {
        finalDecodedText = generateCorruptedOutput(encodedPayload, selectedEncoder, selectedDecoder);
      }

      messageRecord.decodedMessage = finalDecodedText;
      messageRecord.status = isMatch ? 'success' : 'failed';

      // Update Session Stats
      this.stats.total++;
      if (isMatch) {
        this.stats.successful++;
        this.stats.consecutiveSuccesses++;
        this.stats.consecutiveFailures = 0;
      } else {
        this.stats.failed++;
        this.stats.consecutiveFailures++;
        this.stats.consecutiveSuccesses = 0;
      }

      this.emit('phaseChange', {
        phase: 'decoding',
        step: 6,
        label: isMatch ? 'Decoder matched · Recovering message' : 'Decoder mismatch · Decoding failure',
        matched: isMatch,
        decodedMessage: finalDecodedText
      });

      // Step 7: Receiver delivery (1100 ms)
      await this._delay(200);
      this.history.push(messageRecord);

      // Check Easter Eggs / Achievements (Section 15 of updated agent.md)
      let easterEgg = null;
      if (this.stats.successful === 1 && isMatch) {
        easterEgg = "It Worked · You successfully sent a message. This was not guaranteed.";
      } else if (this.currentAttempt === 5) {
        easterEgg = "Persistence · You could have copied and pasted the message.";
      } else if (this.currentAttempt === 10) {
        easterEgg = "Commitment · At this point, the project has won.";
      } else if (this.stats.total === 100) {
        easterEgg = "Researcher · You have generated statistically meaningful evidence for something nobody asked for.";
      } else if (this.systemCount === 1 && this.stats.total === 1) {
        easterEgg = "Efficiency · You removed the entire point of Random Relay.";
      }

      this.emit('phaseChange', {
        phase: 'completed',
        step: 7,
        label: isMatch ? 'Transmission Complete · Match' : 'Transmission Complete · Mismatch',
        message: messageRecord,
        matched: isMatch
      });

      this.emit('messageReceived', {
        message: messageRecord,
        stats: this.getStats(),
        easterEgg
      });

      return messageRecord;
    } catch (err) {
      console.error('Simulation error:', err);
      this.emit('error', { message: 'Transmission interrupted. Try again.' });
      return null;
    } finally {
      this.isTransmitting = false;
    }
  }

  /**
   * 100-Message Automated Experiment (Section 12)
   * Rapidly runs 100 simulated transmissions and emits progressive stats
   */
  async run100MessageExperiment(onProgress) {
    if (this.isTransmitting) return null;
    this.isTransmitting = true;

    const active = this.getActiveSystems();
    const sampleText = "The quick brown fox jumps over the lazy dog.";
    let succCount = 0;
    let failCount = 0;
    const historyPoints = [];

    const totalRuns = 100;

    for (let i = 1; i <= totalRuns; i++) {
      // Pick encoder
      const enc = active[Math.floor(Math.random() * active.length)];
      // Pick decoder based on mode
      let dec = null;
      if (this.mode === 'guaranteed_success' && active.length > 1) {
        // Guaranteed Success -> Fails!
        const others = active.filter((d) => (d.pairId || d.id) !== (enc.pairId || enc.id));
        dec = others[Math.floor(Math.random() * others.length)];
      } else if (this.mode === 'guaranteed_failure') {
        // Guaranteed Failure -> Succeeds!
        dec = enc;
      } else {
        dec = active[Math.floor(Math.random() * active.length)];
      }

      const match = (enc.pairId || enc.id) === (dec.pairId || dec.id);
      if (match) succCount++;
      else failCount++;

      const cumulativeRate = (succCount / i) * 100;
      historyPoints.push(cumulativeRate);

      if (onProgress && i % 5 === 0) {
        onProgress({
          iteration: i,
          total: totalRuns,
          successful: succCount,
          failed: failCount,
          currentRate: cumulativeRate
        });
        await new Promise((r) => setTimeout(r, 12));
      }
    }

    const actualRate = succCount; // out of 100
    const expectedRate = Math.round(this.getProbability() * 100);
    const difference = actualRate - expectedRate;

    const result = {
      total: 100,
      successful: succCount,
      failed: failCount,
      actualRate: `${actualRate}%`,
      expectedRate: `${expectedRate}%`,
      difference: (difference >= 0 ? `+${difference}%` : `${difference}%`),
      historyPoints
    };

    this.isTransmitting = false;
    this.emit('experimentComplete', result);
    return result;
  }

  /**
   * Reset Conversation (Section 20 of agent.md)
   * Resets messages, statistics, attempts, uselessness, and experiment.
   */
  resetConversation() {
    this.history = [];
    this.lastPlaintext = '';
    this.currentAttempt = 1;
    this.stats = {
      total: 0,
      successful: 0,
      failed: 0,
      consecutiveFailures: 0,
      consecutiveSuccesses: 0
    };
    this.emit('historyCleared');
    this.emit('configChange', {
      systemCount: this.systemCount,
      probability: this.getProbability(),
      activeSystems: this.getActiveSystems(),
      stats: this.getStats()
    });
  }
}

// --- ui.js ---
/**
 * UI Renderer and View Controller
 * Handles DOM updates, Apple-style animations, progressive disclosure,
 * Central Relay node illumination, character scramble resolution,
 * simulation modes, retry/attempt counter, stats, and 100-message experiment.
 * Conforming to updated private/agent.md and private/design.md.
 */


class SimulatorUI {
  constructor(simulator) {
    this.simulator = simulator;
    this.audio = new AudioEngine();

    // DOM Elements - Panels & Streams
    this.senderStream = document.getElementById('senderStream');
    this.receiverStream = document.getElementById('receiverStream');
    this.senderEmpty = document.getElementById('senderEmpty');
    this.receiverEmpty = document.getElementById('receiverEmpty');

    this.composerForm = document.getElementById('composerForm');
    this.messageInput = document.getElementById('messageInput');
    this.sendButton = document.getElementById('sendBtn');

    // Central Relay Components (Visual Centerpiece)
    this.relayStatusPill = document.getElementById('relayStatusPill');
    this.timelineFill = document.getElementById('timelineFill');
    this.payloadStreamBox = document.getElementById('payloadStreamBox');
    this.travelingPayload = document.getElementById('travelingPayload');

    this.nodeSender = document.getElementById('nodeSender');
    this.nodeEncoder = document.getElementById('nodeEncoder');
    this.nodeDecoder = document.getElementById('nodeDecoder');
    this.nodeReceiver = document.getElementById('nodeReceiver');

    this.nodeEncoderName = document.getElementById('nodeEncoderName');
    this.nodeEncoderDesc = document.getElementById('nodeEncoderDesc');
    this.nodeDecoderName = document.getElementById('nodeDecoderName');
    this.nodeDecoderDesc = document.getElementById('nodeDecoderDesc');

    // Header, Probability, & Stats Elements
    this.probBadge = document.getElementById('probBadge');
    this.probText = document.getElementById('probText');
    this.probRingCircle = document.getElementById('probRingCircle');
    this.activeSystemsCount = document.getElementById('activeSystemsCount');

    this.statTotalNum = document.getElementById('statTotalNum');
    this.statSuccNum = document.getElementById('statSuccNum');
    this.statFailNum = document.getElementById('statFailNum');
    this.statActualRate = document.getElementById('statActualRate');
    this.statExpectedRate = document.getElementById('statExpectedRate');

    this.uselessnessScoreVal = document.getElementById('uselessnessScoreVal');
    this.uselessnessFill = document.getElementById('uselessnessFill');
    this.uselessnessCaption = document.getElementById('uselessnessCaption');
    this.systemsChipsList = document.getElementById('systemsChipsList');

    // Mode Selector Controls
    this.modeButtons = document.querySelectorAll('.mode-btn');

    // Experiment Trigger & Modal
    this.experimentTriggerBtn = document.getElementById('experimentTriggerBtn');
    this.experimentModal = document.getElementById('experimentModal');
    this.closeExperimentBtn = document.getElementById('closeExperimentBtn');
    this.expProgressFill = document.getElementById('expProgressFill');
    this.expProgressText = document.getElementById('expProgressText');
    this.expResultsBox = document.getElementById('expResultsBox');
    this.expSuccVal = document.getElementById('expSuccVal');
    this.expFailVal = document.getElementById('expFailVal');
    this.expActualVal = document.getElementById('expActualVal');
    this.expExpectedVal = document.getElementById('expExpectedVal');
    this.expDiffBadge = document.getElementById('expDiffBadge');

    // Settings Modal
    this.settingsModal = document.getElementById('settingsModal');
    this.openSettingsBtn = document.getElementById('openSettingsBtn');
    this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
    this.stepperVal = document.getElementById('stepperVal');
    this.stepperMinus = document.getElementById('stepperMinus');
    this.stepperPlus = document.getElementById('stepperPlus');
    this.speedSelect = document.getElementById('speedSelect');
    this.chkAutoExpand = document.getElementById('chkAutoExpand');
    this.chkAnimateResolve = document.getElementById('chkAnimateResolve');
    this.chkSound = document.getElementById('chkSound');
    this.soundToggleHeaderBtn = document.getElementById('soundToggleHeaderBtn');
    this.soundHeaderIcon = document.getElementById('soundHeaderIcon');
    this.activeSystemsDetailList = document.getElementById('activeSystemsDetailList');

    this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
    this.themeToggleBtn = document.getElementById('themeToggleBtn');
    this.themeIcon = document.getElementById('themeIcon');

    this.toastNotice = document.getElementById('toastNotice');

    this.init();
  }

  init() {
    this.bindSimulatorEvents();
    this.bindUserEvents();
    this.initTheme();
    this.initAudioState();
    this.updateSystemDisplays();
    this.renderActiveSystemsList();
    this.updateStatsDisplay(this.simulator.getStats());
  }

  bindSimulatorEvents() {
    this.simulator.on('messageSent', ({ message }) => {
      this.hideEmptyStates();
      this.appendSenderMessage(message);
      this.sendButton.disabled = true;
      this.messageInput.disabled = true;
      this.audio.playSendSound();
    });

    this.simulator.on('phaseChange', (data) => {
      this.renderTransmissionPhase(data);
    });

    this.simulator.on('messageReceived', ({ message, stats, easterEgg }) => {
      this.appendReceiverMessage(message);
      this.sendButton.disabled = false;
      this.messageInput.disabled = false;
      this.messageInput.focus();

      if (message.matched) {
        this.audio.playSuccessSound();
      } else {
        this.audio.playFailureSound();
      }

      if (stats) {
        this.updateStatsDisplay(stats);
      }

      if (easterEgg) {
        this.showToast(easterEgg, 4000);
      }
    });

    this.simulator.on('configChange', ({ stats }) => {
      this.updateSystemDisplays();
      this.renderActiveSystemsList();
      if (stats) this.updateStatsDisplay(stats);
    });

    this.simulator.on('modeChange', ({ mode }) => {
      this.updateModeUI(mode);
      this.updateSystemDisplays();
    });

    this.simulator.on('historyCleared', () => {
      this.resetChatUI();
      this.updateStatsDisplay(this.simulator.getStats());
    });

    this.simulator.on('error', ({ message }) => {
      this.showToast(message);
      this.shakeComposer();
      this.sendButton.disabled = false;
      this.messageInput.disabled = false;
    });
  }

  bindUserEvents() {
    // Send form
    this.composerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = this.messageInput.value;
      if (!text || !text.trim()) {
        this.shakeComposer();
        this.showToast('Type a message first.');
        return;
      }
      this.simulator.sendMessage(text, false);
      this.messageInput.value = '';
    });

    // Quick sample chips
    document.querySelectorAll('.chip-btn').forEach((chip) => {
      chip.addEventListener('click', () => {
        const sampleText = chip.getAttribute('data-sample');
        this.messageInput.value = sampleText;
        this.messageInput.focus();
      });
    });

    // Mode Selector Segmented Buttons (Header)
    this.modeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const selectedMode = btn.getAttribute('data-mode');
        this.simulator.setMode(selectedMode);
      });
    });

    // Settings Modal
    this.openSettingsBtn.addEventListener('click', () => this.openModal(this.settingsModal));
    this.closeSettingsBtn.addEventListener('click', () => this.closeModal(this.settingsModal));
    this.settingsModal.addEventListener('click', (e) => {
      if (e.target === this.settingsModal) this.closeModal(this.settingsModal);
    });

    // Experiment Trigger & Modal
    if (this.experimentTriggerBtn) {
      this.experimentTriggerBtn.addEventListener('click', () => this.startExperiment());
    }
    if (this.closeExperimentBtn) {
      this.closeExperimentBtn.addEventListener('click', () => this.closeModal(this.experimentModal));
    }
    if (this.experimentModal) {
      this.experimentModal.addEventListener('click', (e) => {
        if (e.target === this.experimentModal) this.closeModal(this.experimentModal);
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.settingsModal.classList.contains('open')) this.closeModal(this.settingsModal);
        if (this.experimentModal && this.experimentModal.classList.contains('open')) this.closeModal(this.experimentModal);
      }
    });

    // Systems Stepper
    this.stepperMinus.addEventListener('click', () => {
      const current = this.simulator.systemCount;
      if (current > 1) {
        this.setSystems(current - 1);
      }
    });

    this.stepperPlus.addEventListener('click', () => {
      const current = this.simulator.systemCount;
      if (current < 10) {
        this.setSystems(current + 1);
      }
    });

    // Preset segment buttons
    document.querySelectorAll('.segment-btn[data-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const count = parseInt(btn.getAttribute('data-preset'), 10);
        this.setSystems(count);
      });
    });

    // Speed selection
    if (this.speedSelect) {
      this.speedSelect.addEventListener('change', (e) => {
        this.simulator.setSpeed(e.target.value);
      });
    }

    // Behavior checkboxes
    if (this.chkAutoExpand) {
      this.chkAutoExpand.checked = this.simulator.autoExpandDetails;
      this.chkAutoExpand.addEventListener('change', (e) => {
        this.simulator.autoExpandDetails = e.target.checked;
      });
    }

    if (this.chkAnimateResolve) {
      this.chkAnimateResolve.checked = this.simulator.animateResolve;
      this.chkAnimateResolve.addEventListener('change', (e) => {
        this.simulator.animateResolve = e.target.checked;
      });
    }

    if (this.chkSound) {
      this.chkSound.checked = this.audio.soundEnabled;
      this.chkSound.addEventListener('change', (e) => {
        this.setSoundEnabled(e.target.checked);
      });
    }

    if (this.soundToggleHeaderBtn) {
      this.soundToggleHeaderBtn.addEventListener('click', () => {
        this.setSoundEnabled(!this.audio.soundEnabled);
      });
    }

    // Reset Conversation
    this.clearHistoryBtn.addEventListener('click', () => {
      this.simulator.resetConversation();
      this.closeModal(this.settingsModal);
      this.showToast('Conversation & session statistics reset');
    });

    // Theme toggle
    this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
  }

  setSoundEnabled(val) {
    this.audio.setEnabled(val);
    if (this.chkSound) this.chkSound.checked = val;
    this.updateSoundIcon();
    this.showToast(val ? 'Sound effects enabled' : 'Sound effects muted');
  }

  initAudioState() {
    this.updateSoundIcon();
    if (this.chkSound) this.chkSound.checked = this.audio.soundEnabled;
  }

  updateSoundIcon() {
    if (!this.soundHeaderIcon) return;
    if (this.audio.soundEnabled) {
      this.soundHeaderIcon.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
      this.soundToggleHeaderBtn.title = 'Mute Sounds';
    } else {
      this.soundHeaderIcon.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;
      this.soundToggleHeaderBtn.title = 'Enable Sounds';
    }
  }

  updateModeUI(mode) {
    this.modeButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
    });
  }

  setSystems(count) {
    this.simulator.setSystemCount(count);
    this.stepperVal.textContent = count;
    document.querySelectorAll('.segment-btn[data-preset]').forEach((btn) => {
      btn.classList.toggle('active', parseInt(btn.getAttribute('data-preset'), 10) === count);
    });
  }

  updateSystemDisplays() {
    const prob = this.simulator.getProbabilityFormatted();
    const active = this.simulator.getActiveSystems();
    const probSubtext = this.simulator.getProbabilitySubtext();

    this.probText.textContent = probSubtext;
    this.activeSystemsCount.textContent = `${this.simulator.systemCount} systems`;

    // Circular SVG Progress Ring
    if (this.probRingCircle) {
      const radius = 9;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference * (1 - prob.value);
      this.probRingCircle.style.strokeDasharray = `${circumference}`;
      this.probRingCircle.style.strokeDashoffset = `${offset}`;
    }

    if (this.stepperVal) {
      this.stepperVal.textContent = this.simulator.systemCount;
    }

    if (this.systemsChipsList) {
      this.systemsChipsList.innerHTML = active
        .map((s) => `<span class="system-tag" title="${this.escapeHTML(s.description)}">${s.name}</span>`)
        .join('');
    }
  }

  updateStatsDisplay(stats) {
    if (!stats) return;
    if (this.statTotalNum) this.statTotalNum.textContent = stats.total;
    if (this.statSuccNum) this.statSuccNum.textContent = stats.successful;
    if (this.statFailNum) this.statFailNum.textContent = stats.failed;
    if (this.statActualRate) this.statActualRate.textContent = stats.actualRate;
    if (this.statExpectedRate) this.statExpectedRate.textContent = stats.expectedRate;

    // Uselessness Score (Section 13 & 14)
    const score = stats.uselessnessScore || 72;
    if (this.uselessnessScoreVal) this.uselessnessScoreVal.textContent = `${score}%`;
    if (this.uselessnessFill) this.uselessnessFill.style.width = `${score}%`;

    if (this.uselessnessCaption) {
      let caption = `${score}% useless. Excellent work. Almost completely unnecessary.`;
      if (score > 90) caption = `${score}% useless. Masterpiece of inefficiency.`;
      else if (score < 40) caption = `${score}% useless. Suspiciously functional.`;
      this.uselessnessCaption.textContent = caption;
    }
  }

  renderActiveSystemsList() {
    if (!this.activeSystemsDetailList) return;
    const active = this.simulator.getActiveSystems();
    this.activeSystemsDetailList.innerHTML = active
      .map(
        (s) => `
        <div class="system-detail-item">
          <div class="system-detail-header">
            <span class="system-detail-badge">Pair #${s.id}</span>
            <span class="system-detail-title">${this.escapeHTML(s.name)}</span>
          </div>
          <p class="system-detail-desc">${this.escapeHTML(s.description)}</p>
        </div>
      `
      )
      .join('');
  }

  hideEmptyStates() {
    if (this.senderEmpty) this.senderEmpty.style.display = 'none';
    if (this.receiverEmpty) this.receiverEmpty.style.display = 'none';
  }

  appendSenderMessage(msg) {
    const timeStr = this.formatTime(msg.timestamp);
    const card = document.createElement('div');
    card.className = 'message-card sender-card';
    card.id = `sender_${msg.id}`;

    const subtextNote = this.simulator.getAttemptSubtext(msg.attemptNumber);
    const attemptTag = msg.attemptNumber > 1
      ? `<span class="attempt-badge">Attempt #${msg.attemptNumber}${subtextNote ? ' · ' + subtextNote : ''}</span>`
      : '';

    card.innerHTML = `
      <div class="message-bubble">${this.escapeHTML(msg.originalMessage)}</div>
      <div class="message-meta">
        ${attemptTag}
        <span>Sent · ${timeStr}</span>
      </div>
    `;

    this.senderStream.appendChild(card);
    this.senderStream.scrollTop = this.senderStream.scrollHeight;
  }

  appendReceiverMessage(msg) {
    const timeStr = this.formatTime(msg.timestamp);
    const isSuccess = msg.matched;
    const card = document.createElement('div');
    card.className = `message-card receiver-card ${isSuccess ? 'status-success' : 'status-failed'}`;
    card.id = `receiver_${msg.id}`;

    const statusTag = isSuccess
      ? `<span class="status-tag tag-success">✓ Decoded</span>`
      : `<span class="status-tag tag-failure">✕ Decode Failed</span>`;

    const celebrationBadge = (isSuccess && msg.attemptNumber > 1)
      ? `<span class="attempt-badge celebrate">Decoded on attempt #${msg.attemptNumber}</span>`
      : '';

    const receiverSubtext = isSuccess ? this.simulator.getSuccessSubtext() : this.simulator.getFailureSubtext();

    const failureExplanation = !isSuccess
      ? `<div class="failure-explanation">${receiverSubtext} (Decoder ${this.escapeHTML(msg.decoder.name)} vs ${this.escapeHTML(msg.encoder.name)}).</div>`
      : `<div class="success-explanation" style="font-size: 0.76rem; color: var(--text-secondary); font-style: italic; margin-top: 4px;">${receiverSubtext}</div>`;

    // Dynamic Retry Button Copy (Section 10 of updated agent.md)
    const retryLabel = this.simulator.getRetryButtonLabel(msg.attemptNumber);
    const retryBtnHtml = !isSuccess
      ? `<button type="button" class="retry-btn" data-retry="${this.escapeHTML(msg.originalMessage)}">
           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
             <polyline points="1 4 1 10 7 10"/>
             <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
           </svg>
           <span>${retryLabel}</span>
         </button>`
      : '';

    const summaryLabel = isSuccess
      ? '✓ Transmission details (Match)'
      : '⚠ Transmission details (Mismatch)';

    const autoOpen = this.simulator.autoExpandDetails ? 'open' : '';

    card.innerHTML = `
      <div class="message-bubble message-content" id="content_${msg.id}"></div>
      <div class="message-meta">
        ${statusTag}
        ${celebrationBadge}
        <span>${timeStr}</span>
      </div>
      ${failureExplanation}
      ${retryBtnHtml}

      <details class="transmission-details" ${autoOpen}>
        <summary><span>${summaryLabel}</span></summary>
        <div class="details-table">
          <div class="details-row">
            <span class="details-label">ENCODER</span>
            <span class="details-val">${this.escapeHTML(msg.encoder.encoderName)}</span>
          </div>
          <div class="details-row">
            <span class="details-label">PAYLOAD</span>
            <div class="payload-copy-wrapper">
              <span class="details-val mono" id="payload_text_${msg.id}">${this.escapeHTML(msg.encodedPayload)}</span>
              <button type="button" class="copy-payload-btn" title="Copy encoded payload" data-copy="${this.escapeHTML(msg.encodedPayload)}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="details-row">
            <span class="details-label">DECODER</span>
            <span class="details-val">${this.escapeHTML(msg.decoder.decoderName)}</span>
          </div>
          <div class="details-row">
            <span class="details-label">MATCH</span>
            <span class="details-val" style="color: ${isSuccess ? 'var(--success-text)' : 'var(--failure-text)'}">
              ${isSuccess ? 'Yes' : 'No'}
            </span>
          </div>
          <div class="details-row">
            <span class="details-label">RESULT</span>
            <span class="details-val">
              ${isSuccess ? 'Decode successful' : 'Decode failed'}
            </span>
          </div>
          <div class="details-row">
            <span class="details-label">ATTEMPT</span>
            <span class="details-val">#${msg.attemptNumber}</span>
          </div>

          <!-- Section 16 of agent.md: Expanded Transmission Timeline -->
          <div class="event-timeline-section" style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--separator);">
            <div class="timeline-step">✓ Message created</div>
            <div class="timeline-arrow">↓</div>
            <div class="timeline-step">✓ ${this.escapeHTML(msg.encoder.encoderName)} selected</div>
            <div class="timeline-arrow">↓</div>
            <div class="timeline-step">✓ Message encoded</div>
            <div class="timeline-arrow">↓</div>
            <div class="timeline-step">✓ Payload transmitted</div>
            <div class="timeline-arrow">↓</div>
            <div class="timeline-step">✓ ${this.escapeHTML(msg.decoder.decoderName)} selected</div>
            <div class="timeline-arrow">↓</div>
            <div class="timeline-step ${isSuccess ? 'step-success' : 'step-failure'}">
              ${isSuccess ? '✓ Decoder matched' : '✕ Decoder mismatch'}
            </div>
            <div class="timeline-arrow">↓</div>
            <div class="timeline-step ${isSuccess ? 'step-success' : 'step-failure'}">
              ${isSuccess ? '✓ Original plaintext restored' : '✕ Message corrupted'}
            </div>
          </div>
        </div>
      </details>
    `;

    this.receiverStream.appendChild(card);
    this.receiverStream.scrollTop = this.receiverStream.scrollHeight;

    // Retry Button Click
    const retryBtn = card.querySelector('.retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        const textToRetry = retryBtn.getAttribute('data-retry');
        this.simulator.sendMessage(textToRetry, true);
      });
    }

    // Copy Payload Click
    const copyBtn = card.querySelector('.copy-payload-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const payloadText = copyBtn.getAttribute('data-copy');
        navigator.clipboard.writeText(payloadText).then(() => {
          this.showToast('Payload copied to clipboard');
          copyBtn.innerHTML = '✓';
          setTimeout(() => {
            copyBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
          }, 1500);
        });
      });
    }

    // Scramble Text Resolving Effect
    const contentEl = card.querySelector(`#content_${msg.id}`);
    if (this.simulator.animateResolve && this.simulator.speed !== 'instant') {
      this.animateTextResolve(contentEl, msg.decodedMessage);
    } else {
      contentEl.textContent = msg.decodedMessage;
    }
  }

  animateTextResolve(element, targetText) {
    const glyphs = '░▒▓01!?#*&%^$@abcdefghijklmnopqrstuvwxyz';
    const totalFrames = 12;
    let frame = 0;
    const len = targetText.length;

    const interval = setInterval(() => {
      frame++;
      const resolvedCount = Math.floor((frame / totalFrames) * len);
      let display = targetText.slice(0, resolvedCount);

      for (let i = resolvedCount; i < len; i++) {
        if (targetText[i] === ' ') {
          display += ' ';
        } else {
          display += glyphs[Math.floor(Math.random() * glyphs.length)];
        }
      }

      element.textContent = display;

      if (frame >= totalFrames) {
        clearInterval(interval);
        element.textContent = targetText;
      }
    }, 28);
  }

  renderTransmissionPhase(data) {
    const { phase, step, label, payload, encoder, decoder, matched } = data;

    this.relayStatusPill.textContent = label;
    this.relayStatusPill.classList.toggle('active', phase !== 'completed');

    const pct = Math.min(100, Math.round((step / 7) * 100));
    this.timelineFill.style.width = `${pct}%`;

    const nodes = [this.nodeSender, this.nodeEncoder, this.nodeDecoder, this.nodeReceiver];
    nodes.forEach((n) => {
      n.classList.remove('active', 'active-success', 'active-failed');
    });

    const relaySubtextEl = document.getElementById('relaySubtext');

    switch (phase) {
      case 'started':
        this.nodeSender.classList.add('active');
        this.payloadStreamBox.textContent = 'Preparing payload...';
        this.payloadStreamBox.classList.remove('has-data');
        this.nodeEncoderName.textContent = 'Selecting Encoder...';
        this.nodeEncoderDesc.textContent = 'Random draw';
        this.nodeDecoderName.textContent = 'Waiting for payload';
        this.nodeDecoderDesc.textContent = 'Decoder idle';
        if (relaySubtextEl) relaySubtextEl.textContent = 'Nothing has gone wrong yet.';
        if (this.travelingPayload) this.travelingPayload.classList.remove('traveling');
        break;

      case 'selecting_encoder':
        this.nodeEncoder.classList.add('active');
        this.nodeEncoderDesc.textContent = 'Shuffling candidate systems...';
        if (relaySubtextEl) relaySubtextEl.textContent = 'There are several perfectly good options. We will pick one at random.';
        break;

      case 'encoder_selected':
        this.nodeEncoder.classList.add('active');
        this.nodeEncoderName.textContent = `${encoder.name} ✓`;
        this.nodeEncoderDesc.textContent = `Selected: System #${encoder.id}`;
        if (relaySubtextEl) relaySubtextEl.textContent = 'Making the message unnecessarily complicated.';
        break;

      case 'encoded':
        this.nodeEncoder.classList.add('active');
        this.payloadStreamBox.textContent = payload.length > 28 ? payload.slice(0, 26) + '...' : payload;
        this.payloadStreamBox.classList.add('has-data');
        break;

      case 'transmitting':
        this.nodeEncoder.classList.add('active');
        this.payloadStreamBox.classList.add('has-data');
        if (relaySubtextEl) relaySubtextEl.textContent = 'It is traveling approximately nowhere.';
        if (this.travelingPayload) {
          this.travelingPayload.classList.add('traveling');
        }
        this.audio.playTransitSound();
        break;

      case 'selecting_decoder':
        this.nodeDecoder.classList.add('active');
        this.nodeDecoderDesc.textContent = 'Shuffling candidate decoders...';
        if (relaySubtextEl) relaySubtextEl.textContent = 'Hopefully the correct one.';
        break;

      case 'decoder_selected':
        this.nodeDecoder.classList.add('active');
        this.nodeDecoderName.textContent = `${decoder.name} ${matched ? '✓' : '✕'}`;
        this.nodeDecoderDesc.textContent = `Selected: System #${decoder.id}`;
        if (this.travelingPayload) this.travelingPayload.classList.remove('traveling');
        break;

      case 'decoding':
        this.nodeDecoder.classList.add(matched ? 'active-success' : 'active-failed');
        break;

      case 'completed':
        this.nodeReceiver.classList.add(matched ? 'active-success' : 'active-failed');
        this.relayStatusPill.textContent = matched ? 'Transmission Complete · Match' : 'Transmission Complete · Mismatch';
        if (relaySubtextEl) relaySubtextEl.textContent = matched ? 'Against all odds.' : 'The message has been interpreted incorrectly, with confidence.';
        break;
    }
  }

  /**
   * 100-Message Automated Experiment UI (Section 12 & 13 of agent.md)
   */
  async startExperiment() {
    this.openModal(this.experimentModal);
    this.expProgressFill.style.width = '0%';
    this.expProgressText.textContent = 'Running 100 simulations... This is scientifically unnecessary.';
    this.expResultsBox.style.display = 'none';

    // Mute sound during bulk experiment
    this.audio.setExperimentMute(true);

    const result = await this.simulator.run100MessageExperiment((progress) => {
      const pct = progress.iteration;
      this.expProgressFill.style.width = `${pct}%`;

      let milestoneCopy = `Simulating: ${progress.iteration} / 100 (${progress.successful} matched, ${progress.failed} failed)`;
      if (pct === 25) milestoneCopy = '25 / 100 · Quarter complete. We have learned very little.';
      else if (pct === 50) milestoneCopy = '50 / 100 · Halfway there. The spreadsheet would like this.';
      else if (pct === 75) milestoneCopy = '75 / 100 · 75% complete. Surely this information will be useful.';

      this.expProgressText.textContent = milestoneCopy;
    });

    this.audio.setExperimentMute(false);

    if (result) {
      this.expResultsBox.style.display = 'flex';
      this.expSuccVal.textContent = result.successful;
      this.expFailVal.textContent = result.failed;
      this.expActualVal.textContent = result.actualRate;
      this.expExpectedVal.textContent = result.expectedRate;

      this.expDiffBadge.textContent = result.difference;
      this.expDiffBadge.className = `exp-diff-tag ${result.difference.startsWith('+') ? 'diff-positive' : 'diff-negative'}`;

      // Deadpan result commentary (Section 13 of agent.md)
      const actualNum = result.successful;
      const expectedNum = Math.round(this.simulator.getProbability() * 100);
      const diff = Math.abs(actualNum - expectedNum);

      let deadpanSummary = 'Close enough for a system that should not exist.';
      if (this.simulator.systemCount === 1) deadpanSummary = '100% · Congratulations. You invented normal messaging.';
      else if (diff <= 2) deadpanSummary = 'Remarkably consistent.';
      else if (diff >= 10) deadpanSummary = 'Probability appears to have developed opinions.';

      this.expProgressText.textContent = `Experiment complete. ${deadpanSummary}`;

      this.renderExperimentChart(result);
    }
  }

  /**
   * Render SVG Cumulative Success Rate Line Chart (Section 12 of agent.md)
   */
  renderExperimentChart(result) {
    const refLine = document.getElementById('expChartRefLine');
    const path = document.getElementById('expChartPath');
    if (!refLine || !path || !result.historyPoints) return;

    const expectedPct = this.simulator.getProbability() * 100;
    const refY = (100 - Math.min(100, Math.max(0, expectedPct))).toFixed(1);
    refLine.setAttribute('y1', refY);
    refLine.setAttribute('y2', refY);

    const pts = result.historyPoints;
    let d = '';
    for (let i = 0; i < pts.length; i++) {
      const x = ((i / (pts.length - 1)) * 300).toFixed(1);
      const y = (100 - Math.min(100, Math.max(0, pts[i]))).toFixed(1);
      d += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
    }
    path.setAttribute('d', d.trim());
  }

  resetChatUI() {
    this.senderStream.innerHTML = '';
    this.receiverStream.innerHTML = '';
    if (this.senderEmpty) {
      this.senderEmpty.style.display = 'flex';
      this.senderStream.appendChild(this.senderEmpty);
    }
    if (this.receiverEmpty) {
      this.receiverEmpty.style.display = 'flex';
      this.receiverStream.appendChild(this.receiverEmpty);
    }

    this.payloadStreamBox.textContent = 'Idle · Waiting for message';
    this.payloadStreamBox.classList.remove('has-data');
    this.timelineFill.style.width = '0%';
    this.relayStatusPill.textContent = 'Idle';
    this.relayStatusPill.classList.remove('active');
    if (this.travelingPayload) this.travelingPayload.classList.remove('traveling');

    this.nodeEncoderName.textContent = 'Encoder Node';
    this.nodeEncoderDesc.textContent = 'Random selection';
    this.nodeDecoderName.textContent = 'Decoder Node';
    this.nodeDecoderDesc.textContent = 'Random selection';
  }

  shakeComposer() {
    this.composerForm.classList.add('shake');
    setTimeout(() => {
      this.composerForm.classList.remove('shake');
    }, 400);
  }

  showToast(text, duration = 2400) {
    if (!this.toastNotice) return;
    this.toastNotice.textContent = text;
    this.toastNotice.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this.toastNotice.classList.remove('show');
    }, duration);
  }

  openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add('open');
    modalEl.setAttribute('aria-hidden', 'false');
  }

  closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('open');
    modalEl.setAttribute('aria-hidden', 'true');
  }

  initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) {
      this.applyTheme(saved);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.applyTheme(prefersDark ? 'dark' : 'light');
    }
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    this.applyTheme(next);
    localStorage.setItem('theme', next);
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (this.themeIcon) {
      this.themeIcon.innerHTML = theme === 'dark'
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    }
  }

  formatTime(date) {
    const d = date instanceof Date ? date : new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// --- app.js ---
/**
 * Application Entry Point
 * Initializes simulator engine, UI view controller, and system event bindings.
 */


document.addEventListener('DOMContentLoaded', () => {
  // Initialize Simulator with default of 3 systems (Section 12 of agent.md)
  const simulator = new MessagingSimulator({
    systemCount: 3,
    speed: 'normal'
  });

  // Initialize UI layer
  const ui = new SimulatorUI(simulator);

  // Global debug hook if needed in dev tools
  window.RelaySimulator = {
    simulator,
    ui
  };

  console.log('⚡ Random Encoder / Decoder Messaging Simulator initialized.');
});

})();
