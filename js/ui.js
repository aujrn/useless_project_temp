/**
 * UI Renderer and View Controller
 * Handles DOM updates, Apple-style animations, progressive disclosure,
 * Central Relay node illumination, character scramble resolution,
 * simulation modes, retry/attempt counter, stats, and 100-message experiment.
 * Conforming to updated private/agent.md and private/design.md.
 */

import { AudioEngine } from './audio.js';

export class SimulatorUI {
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

    this.probText.textContent = `${prob.percent} match`;
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

    // Uselessness Score (Section 13)
    const score = stats.uselessnessScore || 72;
    if (this.uselessnessScoreVal) this.uselessnessScoreVal.textContent = `${score}%`;
    if (this.uselessnessFill) this.uselessnessFill.style.width = `${score}%`;

    if (this.uselessnessCaption) {
      let caption = `${score}% useless. Excellent.`;
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

    const attemptTag = msg.attemptNumber > 1 ? `<span class="attempt-badge">Attempt #${msg.attemptNumber}</span>` : '';

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

    const failureExplanation = !isSuccess
      ? `<div class="failure-explanation">The receiver didn't have the right decoder (${this.escapeHTML(msg.decoder.name)} vs ${this.escapeHTML(msg.encoder.name)}).</div>`
      : '';

    // Retry "Try Again" Button (Section 8 of agent.md)
    const retryBtnHtml = !isSuccess
      ? `<button type="button" class="retry-btn" data-retry="${this.escapeHTML(msg.originalMessage)}">
           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
             <polyline points="1 4 1 10 7 10"/>
             <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
           </svg>
           <span>Try Again</span>
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
        this.nodeEncoderDesc.textContent = 'Shuffling candidate systems...';
        break;

      case 'encoder_selected':
        this.nodeEncoder.classList.add('active');
        this.nodeEncoderName.textContent = `${encoder.name} ✓`;
        this.nodeEncoderDesc.textContent = `Selected: System #${encoder.id}`;
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
        this.audio.playTransitSound();
        break;

      case 'selecting_decoder':
        this.nodeDecoder.classList.add('active');
        this.nodeDecoderDesc.textContent = 'Shuffling candidate decoders...';
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
        break;
    }
  }

  /**
   * 100-Message Automated Experiment UI (Section 12 of agent.md)
   */
  async startExperiment() {
    this.openModal(this.experimentModal);
    this.expProgressFill.style.width = '0%';
    this.expProgressText.textContent = 'Running 100 simulations...';
    this.expResultsBox.style.display = 'none';

    // Mute sound during bulk experiment
    this.audio.setExperimentMute(true);

    const result = await this.simulator.run100MessageExperiment((progress) => {
      const pct = progress.iteration;
      this.expProgressFill.style.width = `${pct}%`;
      this.expProgressText.textContent = `Simulating: ${progress.iteration} / 100 (${progress.successful} matched, ${progress.failed} failed)`;
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
      this.expProgressText.textContent = 'Experiment complete!';

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
