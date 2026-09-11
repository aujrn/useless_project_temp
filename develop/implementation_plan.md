# Implementation Plan: Comedic "Faah" Sound & Guaranteed Mode Enforcement

Implement the latest requirements from [agent.md](file:///c:/Users/abhir/OneDrive/Documents/GitHub/useless_project_temp/private/agent.md): adding the synthesized comedic **"faah" failure sound effect** (`playFailureFaah()`) and enforcing strict `pairId`-based mode selection for Guaranteed Success & Guaranteed Failure.

---

## User Review Required

> [!IMPORTANT]
> - **Zero External Audio Assets**: The comedic descending "faah" vocal sound effect will be synthesized live via Web Audio API (formant filtering & pitch descent), maintaining zero external asset dependencies.
> - **Strict Mode Enforcement**: Guaranteed Success & Guaranteed Failure will use explicit `pairId` filtering to guarantee 100% deterministic success / failure (for $N > 1$) across single runs and 100-message experiments.

## Open Questions

None.

---

## Proposed Changes

### 1. Algorithm Pair IDs & Synthesis

#### [MODIFY] [js/algorithms.js](file:///c:/Users/abhir/OneDrive/Documents/GitHub/useless_project_temp/js/algorithms.js)
- Add explicit `pairId` attribute (e.g. `'caesar'`, `'atbash'`, `'reverse-case'`, `'xor-hex'`, `'base64'`, `'vigenere'`, `'binary-stream'`, `'railfence'`, `'hex-byte'`, `'symbol-token'`) to every algorithm object in `ALGORITHM_PAIRS`.

#### [MODIFY] [js/audio.js](file:///c:/Users/abhir/OneDrive/Documents/GitHub/useless_project_temp/js/audio.js)
- Add `playFailureFaah()` method to `AudioEngine`:
  - Synthesizes a 400ms comedic descending "faah" disappointed vocal cue using dual oscillators (sawtooth/triangle blend with smooth lowpass formant filter envelope and gentle pitch ramp down from 220Hz to 110Hz).
  - Respects user sound toggle preferences and experiment mute state.

---

### 2. Simulation Logic & UI Integration

#### [MODIFY] [js/simulation.js](file:///c:/Users/abhir/OneDrive/Documents/GitHub/useless_project_temp/js/simulation.js)
- Enforce `pairId` filtering in `sendMessage()` and `run100MessageExperiment()`:
  - `guaranteed_success`: selects system where `decoder.pairId === encoder.pairId`.
  - `guaranteed_failure`: filters active systems where `decoder.pairId !== encoder.pairId`.

#### [MODIFY] [js/ui.js](file:///c:/Users/abhir/OneDrive/Documents/GitHub/useless_project_temp/js/ui.js)
- Call `this.audio.playFailureFaah()` on failure events in `messageReceived`.

---

### 3. Bundling & Synchronization

#### [MODIFY] [js/bundle.js](file:///c:/Users/abhir/OneDrive/Documents/GitHub/useless_project_temp/js/bundle.js)
- Re-bundle updated modular JS files into standalone `js/bundle.js`.

#### [MODIFY] [private/agent.md](file:///c:/Users/abhir/OneDrive/Documents/GitHub/useless_project_temp/private/agent.md) & [develop/](file:///c:/Users/abhir/OneDrive/Documents/GitHub/useless_project_temp/develop)
- Sync `private/agent.md` and `develop/` workspace files.

---

## Verification Plan

### Automated Tests
- Run Python test runner:
  ```bash
  python tests/run_tests.py
  ```
  Verify 100% pass across reversibility and simulation invariants.

### Manual Verification
1. Test message submission on Guaranteed Failure mode to hear the comedic "faah" sound effect.
2. Test Guaranteed Success mode to confirm 100% success rate.
3. Test 100-Message Experiment under Guaranteed Success (100% match) and Guaranteed Failure (0% match for $N > 1$).
