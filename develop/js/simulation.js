/**
 * Simulation Engine
 * Manages active systems, simulation modes (Random, Guaranteed Success, Guaranteed Failure),
 * timeline orchestration, session statistics, retry/attempt tracking, 100-message experiment,
 * and uselessness scoring.
 */

import { ALGORITHM_PAIRS, generateCorruptedOutput } from './algorithms.js';

export class MessagingSimulator {
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
    if (this.mode === 'guaranteed_success') return 1.0;
    if (this.mode === 'guaranteed_failure') return 0.0;
    return 1 / this.systemCount;
  }

  getProbabilityFormatted() {
    const p = this.getProbability();
    const percent = (p * 100).toFixed(p === 1 || p === 0 ? 0 : 1);
    return {
      ratio: this.mode === 'random' ? `1 of ${this.systemCount}` : (this.mode === 'guaranteed_success' ? '100%' : '0%'),
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

    // Check Guaranteed Failure constraint when N = 1 (Section 4)
    if (this.mode === 'guaranteed_failure' && this.systemCount === 1) {
      this.emit('error', {
        message: 'Guaranteed Failure is impossible with 1 system (only 1 decoder exists!). Increase systems to fail reliably.'
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

      // Apply Simulation Mode logic (Section 4)
      let selectedDecoder = null;
      if (this.mode === 'guaranteed_success') {
        selectedDecoder = selectedEncoder; // Matching decoder
      } else if (this.mode === 'guaranteed_failure') {
        const otherDecoders = active.filter((d) => d.id !== selectedEncoder.id);
        const randIdx = Math.floor(Math.random() * otherDecoders.length);
        selectedDecoder = otherDecoders[randIdx] || selectedEncoder;
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

      // Check Easter Eggs (Section 14)
      let easterEgg = null;
      if (this.stats.consecutiveFailures === 10) {
        easterEgg = "Are you sure you want to keep doing this? (10 failures in a row)";
      } else if (this.stats.consecutiveSuccesses === 10) {
        easterEgg = "Suspiciously competent. (10 successful decodes in a row)";
      } else if (this.stats.total === 100) {
        easterEgg = "100 transmissions completed. You could have just texted them.";
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
      if (this.mode === 'guaranteed_success') {
        dec = enc;
      } else if (this.mode === 'guaranteed_failure' && active.length > 1) {
        const others = active.filter((d) => d.id !== enc.id);
        dec = others[Math.floor(Math.random() * others.length)];
      } else {
        dec = active[Math.floor(Math.random() * active.length)];
      }

      const match = enc.id === dec.id;
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
