/**
 * Simulation Engine
 * Manages active encoder/decoder systems, state, timeline orchestration,
 * random selection, message history, and probability calculations.
 */

import { ALGORITHM_PAIRS, generateCorruptedOutput } from './algorithms.js';

export class MessagingSimulator {
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
