/* Random Relay Messaging Simulator - Standalone Bundle */

(function() {

'use strict';

// --- algorithms.js ---

/**
 * Core Encoder / Decoder Algorithms
 * 10 Paired Reversible Systems & Deterministic Corruption Logic
 */

const ALGORITHM_PAIRS = [
  {
    id: 1,
    key: 'caesar',
    name: 'Caesar Shift (+3)',
    encoderName: 'Encoder 01 · Caesar (+3)',
    decoderName: 'Decoder 01 · Caesar (-3)',
    description: 'Rotates each alphabetical character forward by 3 positions.',
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
    name: 'Atbash Substitution',
    encoderName: 'Encoder 02 · Atbash Cipher',
    decoderName: 'Decoder 02 · Atbash Inverse',
    description: 'Replaces each letter with its symmetric opposite in the alphabet (A ↔ Z, B ↔ Y).',
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
    name: 'Reverse + Invert Case',
    encoderName: 'Encoder 03 · Reverse & Invert',
    decoderName: 'Decoder 03 · Revert & Restore',
    description: 'Reverses character order and toggles uppercase to lowercase and vice versa.',
    encode: (text) => {
      const toggled = text
        .split('')
        .map((c) => {
          if (c >= 'a' && c <= 'z') return c.toUpperCase();
          if (c >= 'A' && c <= 'Z') return c.toLowerCase();
          return c;
        })
        .join('');
      return toggled.split('').reverse().join('');
    },
    decode: (payload) => {
      const reversed = payload.split('').reverse().join('');
      return reversed
        .split('')
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
    name: 'XOR Mask (0x5A)',
    encoderName: 'Encoder 04 · XOR 0x5A Hex',
    decoderName: 'Decoder 04 · XOR 0x5A Revert',
    description: 'Applies bitwise XOR with 0x5A key and formats as hyphenated hex bytes.',
    encode: (text) => {
      const bytes = [];
      for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        const masked = (code ^ 0x5a) & 0xff;
        bytes.push(masked.toString(16).padStart(2, '0').toUpperCase());
      }
      return bytes.join('-');
    },
    decode: (payload) => {
      try {
        const parts = payload.split('-');
        let out = '';
        for (const part of parts) {
          const byte = parseInt(part, 16);
          if (isNaN(byte)) return null;
          out += String.fromCharCode((byte ^ 0x5a) & 0xff);
        }
        return out;
      } catch {
        return null;
      }
    }
  },
  {
    id: 5,
    key: 'base64',
    name: 'Base64 Tokenizer',
    encoderName: 'Encoder 05 · Base64 Wrapper',
    decoderName: 'Decoder 05 · Base64 Unwrapper',
    description: 'Encodes Unicode text into standard Base64 representation (clearly labeled as encoding, not encryption).',
    encode: (text) => {
      try {
        return btoa(encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, (match, p1) => {
          return String.fromCharCode(parseInt('0x' + p1, 16));
        }));
      } catch {
        return btoa(text);
      }
    },
    decode: (payload) => {
      try {
        const decoded = atob(payload);
        return decodeURIComponent(
          decoded
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
      } catch {
        return null;
      }
    }
  },
  {
    id: 6,
    key: 'vigenere',
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
    name: '8-bit Binary Stream',
    encoderName: 'Encoder 07 · Binary Stream (8-bit)',
    decoderName: 'Decoder 07 · Binary to Text',
    description: 'Converts each character into an 8-bit binary representation separated by spaces.',
    encode: (text) => {
      return text
        .split('')
        .map((c) => c.charCodeAt(0).toString(2).padStart(8, '0'))
        .join(' ');
    },
    decode: (payload) => {
      try {
        const chunks = payload.trim().split(/\s+/);
        let out = '';
        for (const chunk of chunks) {
          if (!/^[01]{1,16}$/.test(chunk)) return null;
          out += String.fromCharCode(parseInt(chunk, 2));
        }
        return out;
      } catch {
        return null;
      }
    }
  },
  {
    id: 8,
    key: 'railfence',
    name: 'Rail Fence (3 Rails)',
    encoderName: 'Encoder 08 · Rail Fence Zig-Zag',
    decoderName: 'Decoder 08 · Rail Fence Reconstruct',
    description: 'Transposition cipher writing characters in a 3-rail zig-zag pattern.',
    encode: (text) => {
      if (text.length <= 3) return text;
      const rails = [[], [], []];
      let rail = 0;
      let direction = 1;
      for (let i = 0; i < text.length; i++) {
        rails[rail].push(text[i]);
        rail += direction;
        if (rail === 2) direction = -1;
        else if (rail === 0) direction = 1;
      }
      return rails[0].join('') + rails[1].join('') + rails[2].join('');
    },
    decode: (payload) => {
      if (payload.length <= 3) return payload;
      const railLengths = [0, 0, 0];
      let rail = 0;
      let direction = 1;
      for (let i = 0; i < payload.length; i++) {
        railLengths[rail]++;
        rail += direction;
        if (rail === 2) direction = -1;
        else if (rail === 0) direction = 1;
      }

      const rails = [
        payload.slice(0, railLengths[0]).split(''),
        payload.slice(railLengths[0], railLengths[0] + railLengths[1]).split(''),
        payload.slice(railLengths[0] + railLengths[1]).split('')
      ];

      let out = '';
      rail = 0;
      direction = 1;
      for (let i = 0; i < payload.length; i++) {
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
    name: 'Hexadecimal Stream',
    encoderName: 'Encoder 09 · Hex Byte Stream',
    decoderName: 'Decoder 09 · Hex Byte Converter',
    description: 'Converts UTF-8 characters into contiguous uppercase hexadecimal byte representation.',
    encode: (text) => {
      let hex = '';
      for (let i = 0; i < text.length; i++) {
        hex += text.charCodeAt(i).toString(16).padStart(2, '0').toUpperCase();
      }
      return '0x' + hex;
    },
    decode: (payload) => {
      try {
        let clean = payload.startsWith('0x') ? payload.slice(2) : payload;
        if (clean.length % 2 !== 0) return null;
        let out = '';
        for (let i = 0; i < clean.length; i += 2) {
          const code = parseInt(clean.substr(i, 2), 16);
          if (isNaN(code)) return null;
          out += String.fromCharCode(code);
        }
        return out;
      } catch {
        return null;
      }
    }
  },
  {
    id: 10,
    key: 'symbol-token',
    name: 'Symbol Token Substitution',
    encoderName: 'Encoder 10 · Symbol Token Matrix',
    decoderName: 'Decoder 10 · Symbol Matrix Reversal',
    description: 'Bijective mapping exchanging vowels and select common consonants with phonetic symbols.',
    encode: (text) => {
      const map = {
        'a': 'α', 'A': 'Δ',
        'e': 'ε', 'E': 'Ξ',
        'i': 'ι', 'I': 'Ψ',
        'o': 'ω', 'O': 'Ω',
        'u': 'μ', 'U': 'θ',
        's': 'σ', 'S': '§',
        't': 'τ', 'T': '†',
        'r': 'ρ', 'R': '®',
        'n': 'η', 'N': 'Π'
      };
      return text
        .split('')
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
      return payload
        .split('')
        .map((c) => reverseMap[c] || c)
        .join('');
    }
  }
];

/**
 * Generate deliberate, plausible corrupted gibberish output when an incompatible
 * decoder attempts to process an encoded payload.
 *
 * Implements requirement from Section 8 of agent.md:
 * "The app should not pretend that the decoder successfully decoded the message.
 *  Instead, produce visibly corrupted/gibberish output. Examples: H3llo ░▒?9x
 *  or another deterministic corruption derived from the encoded payload."
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
  for (let i = 0; i < Math.min(payload.length, 30); i++) {
    seed = (seed * 33 + payload.charCodeAt(i)) % 10007;
  }

  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  let base = attemptedDecode && attemptedDecode.length >= 3 ? attemptedDecode : payload;

  if (base.length > 36) {
    base = base.slice(0, 32) + '...';
  }

  const chars = base.split('');
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


// --- simulation.js ---

/**
 * Simulation Engine
 * Manages active encoder/decoder systems, state, timeline orchestration,
 * random selection, message history, and probability calculations.
 */



class MessagingSimulator {
  constructor(options = {}) {
    this.systemCount = options.systemCount || 3; // Default to 3 systems per spec
    this.speed = options.speed || 'normal'; // 'normal' (1.1s), 'fast' (0.55s), 'instant' (0s)
    this.autoExpandDetails = options.autoExpandDetails || false;
    this.animateResolve = options.animateResolve !== false;
    this.soundEnabled = options.soundEnabled !== false;
    this.history = [];
    this.isTransmitting = false;
    this.listeners = new Map();
  }

  /**
   * Register event listener
   * Events: 'phaseChange', 'messageSent', 'messageReceived', 'configChange', 'error', 'historyCleared'
   */
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

  /**
   * Get list of currently active paired systems (first N)
   */
  getActiveSystems() {
    return ALGORITHM_PAIRS.slice(0, this.systemCount);
  }

  /**
   * Get all 10 systems
   */
  getAllSystems() {
    return ALGORITHM_PAIRS;
  }

  /**
   * Set number of active systems (1 to 10)
   */
  setSystemCount(count) {
    const parsed = Math.max(1, Math.min(10, parseInt(count, 10) || 3));
    this.systemCount = parsed;
    this.emit('configChange', {
      systemCount: this.systemCount,
      probability: this.getProbability(),
      activeSystems: this.getActiveSystems()
    });
    return this.systemCount;
  }

  /**
   * Calculate theoretical success probability = 1 / N
   */
  getProbability() {
    return 1 / this.systemCount;
  }

  getProbabilityFormatted() {
    const p = this.getProbability();
    const percent = (p * 100).toFixed(p === 1 ? 0 : 1);
    return {
      ratio: `1 of ${this.systemCount}`,
      percent: `${percent}%`,
      value: p
    };
  }

  /**
   * Set animation speed
   */
  setSpeed(speed) {
    if (['normal', 'fast', 'instant'].includes(speed)) {
      this.speed = speed;
    }
  }

  /**
   * Delay helper respecting speed setting
   */
  _delay(baseMs) {
    if (this.speed === 'instant') return Promise.resolve();
    const multiplier = this.speed === 'fast' ? 0.5 : 1.0;
    return new Promise((resolve) => setTimeout(resolve, baseMs * multiplier));
  }

  /**
   * Core Send Interaction
   * Implements Sections 6, 7, 8, and 9 of agent.md
   */
  async sendMessage(plaintext) {
    const trimmed = (plaintext || '').trim();
    if (!trimmed) {
      this.emit('error', { message: 'Type a message first.' });
      return null;
    }

    if (this.isTransmitting) {
      this.emit('error', { message: 'Transmission in progress. Please wait.' });
      return null;
    }

    this.isTransmitting = true;
    const active = this.getActiveSystems();

    const messageId = 'msg_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

    const messageRecord = {
      id: messageId,
      originalMessage: trimmed,
      timestamp: new Date(),
      encoder: null,
      encodedPayload: '',
      decoder: null,
      matched: false,
      decodedMessage: '',
      status: 'pending'
    };

    try {
      // Step 1: User taps Send (0 ms)
      this.emit('phaseChange', {
        phase: 'started',
        step: 1,
        label: 'Preparing transmission...',
        message: messageRecord
      });
      this.emit('messageSent', { message: messageRecord });

      // Step 2: Encoder selection with shuffle preview (100 ms)
      this.emit('phaseChange', {
        phase: 'selecting_encoder',
        step: 2,
        label: 'Selecting random encoder...',
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

      // Step 3: Encoding message (250 ms)
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

      // Step 4: Transmitting payload across relay track (500 ms)
      await this._delay(250);
      this.emit('phaseChange', {
        phase: 'transmitting',
        step: 4,
        label: 'Transmitting payload...',
        payload: encodedPayload
      });

      // Step 5: Decoder selection with shuffle preview (700 ms)
      this.emit('phaseChange', {
        phase: 'selecting_decoder',
        step: 5,
        label: 'Selecting random decoder...',
        candidates: active.map((s) => s.decoderName)
      });

      await this._delay(200);
      const decoderIndex = Math.floor(Math.random() * active.length);
      const selectedDecoder = active[decoderIndex];
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

      // Step 6: Compatibility Check & Decoding (900 ms)
      await this._delay(200);
      const isMatch = selectedEncoder.id === selectedDecoder.id;
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

      this.emit('phaseChange', {
        phase: 'decoding',
        step: 6,
        label: isMatch ? 'Decoder matched · Recovering plaintext' : 'Decoder mismatch · Attempting decode',
        matched: isMatch,
        decodedMessage: finalDecodedText
      });

      // Step 7: Result appears in Receiver (1100 ms)
      await this._delay(200);
      this.history.push(messageRecord);

      this.emit('phaseChange', {
        phase: 'completed',
        step: 7,
        label: isMatch ? 'Transmission Complete · Message Recovered' : 'Transmission Complete · Decode Failed',
        message: messageRecord,
        matched: isMatch
      });

      this.emit('messageReceived', { message: messageRecord });

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
   * Clear message history
   */
  clearHistory() {
    this.history = [];
    this.emit('historyCleared');
  }
}


// --- ui.js ---

/**
 * UI Renderer and View Controller
 * Handles DOM updates, Apple-style animations, progressive disclosure,
 * central relay node illumination, character scramble resolution,
 * Web Audio synthesized feedback, and settings sheet.
 */

class SimulatorUI {
  constructor(simulator) {
    this.simulator = simulator;

    // Cache DOM Elements
    this.senderStream = document.getElementById('senderStream');
    this.receiverStream = document.getElementById('receiverStream');
    this.senderEmpty = document.getElementById('senderEmpty');
    this.receiverEmpty = document.getElementById('receiverEmpty');

    this.composerForm = document.getElementById('composerForm');
    this.messageInput = document.getElementById('messageInput');
    this.sendButton = document.getElementById('sendBtn');

    // Central Relay Components
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

    // Header & Stats Elements
    this.probBadge = document.getElementById('probBadge');
    this.probText = document.getElementById('probText');
    this.probRingCircle = document.getElementById('probRingCircle');
    this.activeSystemsCount = document.getElementById('activeSystemsCount');
    this.statProbBig = document.getElementById('statProbBig');
    this.statProbSub = document.getElementById('statProbSub');
    this.systemsChipsList = document.getElementById('systemsChipsList');

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

    // Web Audio Synthesizer
    this.audioCtx = null;
    this.soundEnabled = localStorage.getItem('sound_enabled') !== 'false';

    this.init();
  }

  init() {
    this.bindSimulatorEvents();
    this.bindUserEvents();
    this.initTheme();
    this.initAudioState();
    this.updateSystemDisplays();
    this.renderActiveSystemsList();
  }

  /**
   * Sound synthesizer using Web Audio API (Zero external assets)
   */
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

  playSendSound() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(640, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  playTransitSound() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(560, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  playSuccessSound() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      // Gentle dual-tone bell / chime
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

  playFailureSound() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(190, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.18);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch {}
  }

  /**
   * Bind event listeners from simulator engine
   */
  bindSimulatorEvents() {
    this.simulator.on('messageSent', ({ message }) => {
      this.hideEmptyStates();
      this.appendSenderMessage(message);
      this.sendButton.disabled = true;
      this.messageInput.disabled = true;
      this.playSendSound();
    });

    this.simulator.on('phaseChange', (data) => {
      this.renderTransmissionPhase(data);
    });

    this.simulator.on('messageReceived', ({ message }) => {
      this.appendReceiverMessage(message);
      this.sendButton.disabled = false;
      this.messageInput.disabled = false;
      this.messageInput.focus();

      if (message.matched) {
        this.playSuccessSound();
      } else {
        this.playFailureSound();
      }
    });

    this.simulator.on('configChange', () => {
      this.updateSystemDisplays();
      this.renderActiveSystemsList();
    });

    this.simulator.on('historyCleared', () => {
      this.resetChatUI();
    });

    this.simulator.on('error', ({ message }) => {
      this.showToast(message);
      this.shakeComposer();
      this.sendButton.disabled = false;
      this.messageInput.disabled = false;
    });
  }

  /**
   * Bind DOM user interactions
   */
  bindUserEvents() {
    this.composerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = this.messageInput.value;
      if (!text || !text.trim()) {
        this.shakeComposer();
        this.showToast('Type a message first.');
        return;
      }
      this.simulator.sendMessage(text);
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

    // Settings Modal
    this.openSettingsBtn.addEventListener('click', () => this.openModal());
    this.closeSettingsBtn.addEventListener('click', () => this.closeModal());
    this.settingsModal.addEventListener('click', (e) => {
      if (e.target === this.settingsModal) this.closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.settingsModal.classList.contains('open')) {
        this.closeModal();
      }
    });

    // Stepper
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
      this.chkSound.checked = this.soundEnabled;
      this.chkSound.addEventListener('change', (e) => {
        this.setSoundEnabled(e.target.checked);
      });
    }

    if (this.soundToggleHeaderBtn) {
      this.soundToggleHeaderBtn.addEventListener('click', () => {
        this.setSoundEnabled(!this.soundEnabled);
      });
    }

    // Clear history
    this.clearHistoryBtn.addEventListener('click', () => {
      this.simulator.clearHistory();
      this.closeModal();
      this.showToast('Conversation cleared');
    });

    // Theme toggle
    this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
  }

  setSoundEnabled(val) {
    this.soundEnabled = val;
    localStorage.setItem('sound_enabled', val ? 'true' : 'false');
    if (this.chkSound) this.chkSound.checked = val;
    this.updateSoundIcon();
    this.showToast(val ? 'Sound effects enabled' : 'Sound effects muted');
  }

  initAudioState() {
    this.updateSoundIcon();
    if (this.chkSound) this.chkSound.checked = this.soundEnabled;
  }

  updateSoundIcon() {
    if (!this.soundHeaderIcon) return;
    if (this.soundEnabled) {
      this.soundHeaderIcon.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
      this.soundToggleHeaderBtn.title = 'Mute Sounds';
    } else {
      this.soundHeaderIcon.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;
      this.soundToggleHeaderBtn.title = 'Enable Sounds';
    }
  }

  setSystems(count) {
    this.simulator.setSystemCount(count);
    this.stepperVal.textContent = count;
    document.querySelectorAll('.segment-btn[data-preset]').forEach((btn) => {
      btn.classList.toggle('active', parseInt(btn.getAttribute('data-preset'), 10) === count);
    });
  }

  /**
   * Update header, cards, and chips according to active systems & probability
   */
  updateSystemDisplays() {
    const prob = this.simulator.getProbabilityFormatted();
    const active = this.simulator.getActiveSystems();

    this.probText.textContent = `${prob.percent} match`;
    this.activeSystemsCount.textContent = `${this.simulator.systemCount} systems`;

    // Update SVG progress ring
    if (this.probRingCircle) {
      const radius = 9;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference * (1 - prob.value);
      this.probRingCircle.style.strokeDasharray = `${circumference}`;
      this.probRingCircle.style.strokeDashoffset = `${offset}`;
    }

    if (this.statProbBig) {
      this.statProbBig.textContent = prob.percent;
    }
    if (this.statProbSub) {
      this.statProbSub.textContent = `${prob.ratio} decoders compatible`;
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

  /**
   * Render Sender message bubble
   */
  appendSenderMessage(msg) {
    const timeStr = this.formatTime(msg.timestamp);
    const card = document.createElement('div');
    card.className = 'message-card sender-card';
    card.id = `sender_${msg.id}`;

    card.innerHTML = `
      <div class="message-bubble">${this.escapeHTML(msg.originalMessage)}</div>
      <div class="message-meta">
        <span>Sent</span> · <span>${timeStr}</span>
      </div>
    `;

    this.senderStream.appendChild(card);
    this.senderStream.scrollTop = this.senderStream.scrollHeight;
  }

  /**
   * Render Receiver message bubble with scramble resolution animation & details
   */
  appendReceiverMessage(msg) {
    const timeStr = this.formatTime(msg.timestamp);
    const isSuccess = msg.matched;
    const card = document.createElement('div');
    card.className = `message-card receiver-card ${isSuccess ? 'status-success' : 'status-failed'}`;
    card.id = `receiver_${msg.id}`;

    const statusTag = isSuccess
      ? `<span class="status-tag tag-success">✓ Decoded</span>`
      : `<span class="status-tag tag-failure">✗ Decode Failed</span>`;

    const summaryLabel = isSuccess
      ? '✓ Transmission details (Match)'
      : '⚠ Transmission details (Mismatch)';

    const autoOpen = this.simulator.autoExpandDetails ? 'open' : '';

    card.innerHTML = `
      <div class="message-bubble message-content" id="content_${msg.id}"></div>
      <div class="message-meta">
        ${statusTag}
        <span>${timeStr}</span>
      </div>

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
        </div>
      </details>
    `;

    this.receiverStream.appendChild(card);
    this.receiverStream.scrollTop = this.receiverStream.scrollHeight;

    // Attach copy button handler
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

    // Run character-by-character resolving animation
    const contentEl = card.querySelector(`#content_${msg.id}`);
    if (this.simulator.animateResolve && this.simulator.speed !== 'instant') {
      this.animateTextResolve(contentEl, msg.decodedMessage);
    } else {
      contentEl.textContent = msg.decodedMessage;
    }
  }

  /**
   * Scramble / Matrix Resolve Text Effect
   * Glitches characters and settles them into the final text
   */
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

  /**
   * Subtle candidate shuffle animation
   */
  shuffleCandidateNames(targetElement, candidates, finalName, onComplete) {
    if (!candidates || candidates.length <= 1) {
      targetElement.textContent = finalName;
      if (onComplete) onComplete();
      return;
    }

    let iterations = 0;
    const maxIterations = 4;
    const interval = setInterval(() => {
      iterations++;
      const randCand = candidates[Math.floor(Math.random() * candidates.length)];
      targetElement.textContent = randCand;

      if (iterations >= maxIterations) {
        clearInterval(interval);
        targetElement.textContent = `${finalName} ✓`;
        if (onComplete) onComplete();
      }
    }, 40);
  }

  /**
   * Update the Central Transmission Relay nodes and status
   */
  renderTransmissionPhase(data) {
    const { phase, step, label, payload, encoder, decoder, matched, candidates } = data;

    // Update status text
    this.relayStatusPill.textContent = label;
    this.relayStatusPill.classList.toggle('active', phase !== 'completed');

    // Progress bar fill (0 to 100%)
    const pct = Math.min(100, Math.round((step / 7) * 100));
    this.timelineFill.style.width = `${pct}%`;

    // Reset node active classes
    const nodes = [this.nodeSender, this.nodeEncoder, this.nodeDecoder, this.nodeReceiver];
    nodes.forEach((n) => {
      n.classList.remove('active', 'active-success', 'active-failed');
    });

    switch (phase) {
      case 'started':
        this.nodeSender.classList.add('active');
        this.payloadStreamBox.textContent = 'Preparing payload...';
        this.payloadStreamBox.classList.remove('has-data');
        this.nodeEncoderName.textContent = 'Selecting Encoder...';
        this.nodeEncoderDesc.textContent = 'Random draw';
        this.nodeDecoderName.textContent = 'Waiting for payload';
        this.nodeDecoderDesc.textContent = 'Decoder idle';
        if (this.travelingPayload) this.travelingPayload.classList.remove('traveling');
        break;

      case 'selecting_encoder':
        this.nodeEncoder.classList.add('active');
        this.nodeEncoderDesc.textContent = 'Shuffling available encoders...';
        break;

      case 'encoder_selected':
        this.nodeEncoder.classList.add('active');
        this.nodeEncoderName.textContent = `${encoder.name} ✓`;
        this.nodeEncoderDesc.textContent = `Selected: Pair #${encoder.id}`;
        break;

      case 'encoded':
        this.nodeEncoder.classList.add('active');
        this.payloadStreamBox.textContent = payload.length > 28 ? payload.slice(0, 26) + '...' : payload;
        this.payloadStreamBox.classList.add('has-data');
        break;

      case 'transmitting':
        this.nodeEncoder.classList.add('active');
        this.payloadStreamBox.classList.add('has-data');
        if (this.travelingPayload) {
          this.travelingPayload.classList.add('traveling');
        }
        this.playTransitSound();
        break;

      case 'selecting_decoder':
        this.nodeDecoder.classList.add('active');
        this.nodeDecoderDesc.textContent = 'Shuffling available decoders...';
        break;

      case 'decoder_selected':
        this.nodeDecoder.classList.add('active');
        this.nodeDecoderName.textContent = `${decoder.name} ✓`;
        this.nodeDecoderDesc.textContent = `Selected: Pair #${decoder.id}`;
        if (this.travelingPayload) this.travelingPayload.classList.remove('traveling');
        break;

      case 'decoding':
        this.nodeDecoder.classList.add(matched ? 'active-success' : 'active-failed');
        break;

      case 'completed':
        this.nodeReceiver.classList.add(matched ? 'active-success' : 'active-failed');
        this.relayStatusPill.textContent = matched ? 'Transmission Complete (Match)' : 'Transmission Complete (Mismatch)';
        break;
    }
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

  showToast(text) {
    if (!this.toastNotice) return;
    this.toastNotice.textContent = text;
    this.toastNotice.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this.toastNotice.classList.remove('show');
    }, 2400);
  }

  openModal() {
    this.settingsModal.classList.add('open');
    this.settingsModal.setAttribute('aria-hidden', 'false');
  }

  closeModal() {
    this.settingsModal.classList.remove('open');
    this.settingsModal.setAttribute('aria-hidden', 'true');
  }

  /* Theme Management */
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
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="23" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
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