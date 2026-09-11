# Implementation Plan: Random Relay Development & Refinement

Refine and complete **Random Relay** (the Apple-inspired random encoder/decoder messaging simulator) strictly in accordance with [private/agent.md](file:///c:/Users/abhir/OneDrive/Documents/GitHub/useless_project_temp/private/agent.md) and [private/design.md](file:///c:/Users/abhir/OneDrive/Documents/GitHub/useless_project_temp/private/design.md).

## User Review Required

> [!IMPORTANT]
> - **Zero External Dependencies**: All features (including synthesized audio, probability ring, and experiment line chart) use zero third-party dependencies (vanilla JS, SVG, Web Audio API).
> - **Dual Loading Strategy**: The app supports both modular ES JavaScript (for local servers) and a single wrapped bundle `js/bundle.js` (for CORS-free `file://` execution).
> - **Codebase Synchronization**: Root files and `develop/` workspace files will be fully synchronized, and `private/agent.md` & `private/design.md` specifications will be mirrored in `develop/`.

## Open Questions

None. The specifications in [private/agent.md](file:///c:/Users/abhir/OneDrive/Documents/GitHub/useless_project_temp/private/agent.md) and [private/design.md](file:///c:/Users/abhir/OneDrive/Documents/GitHub/useless_project_temp/private/design.md) are comprehensive and unambiguous.

## Proposed Changes

---

### Central Transmission Relay & UI Hierarchy ([private/design.md](file:///c:/Users/abhir/OneDrive/Documents/GitHub/useless_project_temp/private/design.md))

#### [MODIFY] [index.html](file:///c:/Users/abhir/OneDrive/Documents/GitHub/useless_project_temp/index.html)
- Add SVG cumulative match rate chart container to `experimentModal`.
- Add expanded step-by-step transmission timeline template in message details.
- Add $N=1$ math explanation badge for Guaranteed Failure mode.

#### [MODIFY] [css/styles.css](file:///c:/Users/abhir/OneDrive/Documents/GitHub/useless_project_temp/css/styles.css)
- Refine Central Transmission Relay visual hierarchy (Node styling, track line glow, traveling payload particle keyframe animations, active vs idle state transitions).
- Add styles for SVG experiment line chart (cumulative rate curve & dashed expected probability reference line).
- Add styles for step-by-step expandable event timeline inside transmission details.

---

### Simulation Engine & Analytics ([private/agent.md](file:///c:/Users/abhir/OneDrive/Documents/GitHub/useless_project_temp/private/agent.md))

#### [MODIFY] [js/simulation.js](file:///c:/Users/abhir/OneDrive/Documents/GitHub/useless_project_temp/js/simulation.js)
- Enhance `run100MessageExperiment` to return cumulative points array for line chart rendering.
- Verify retry tracking, attempt counters, uselessness score calculation, and session statistics.
- Enforce $N=1$ mathematical constraint check for Guaranteed Failure.

#### [MODIFY] [js/ui.js](file:///c:/Users/abhir/OneDrive/Documents/GitHub/useless_project_temp/js/ui.js)
- Render live SVG cumulative success rate chart in the 100-message experiment modal.
- Render step-by-step expanded transmission timeline (`✓ Message created` → `✓ Encoder` → `✓ Payload` → `✓ Decoder` → `Result`) inside `<details class="transmission-details">`.
- Update header mode selector buttons and $N=1$ explanation badge.

#### [MODIFY] [js/bundle.js](file:///c:/Users/abhir/OneDrive/Documents/GitHub/useless_project_temp/js/bundle.js)
- Re-bundle updated `algorithms.js`, `audio.js`, `simulation.js`, `ui.js`, and `app.js` into single standalone file.

---

### Structure & Workspace Synchronization (Section 28)

#### [NEW] / [MODIFY] [develop/](file:///c:/Users/abhir/OneDrive/Documents/GitHub/useless_project_temp/develop)
- Synchronize `develop/index.html`, `develop/css/styles.css`, `develop/js/` files with root workspace.
- Place copies of `agent.md`, `design.md`, `implementation_plan.md`, and `walkthrough.md` in `develop/`.

#### [MODIFY] [README.md](file:///c:/Users/abhir/OneDrive/Documents/GitHub/useless_project_temp/README.md) & [develop/README.md](file:///c:/Users/abhir/OneDrive/Documents/GitHub/useless_project_temp/develop/README.md)
- Complete full documentation covering product concept, $P=1/N$ probability model, 10 paired algorithms, setup guide, keyboard/accessibility features, and codebase structure.

---

## Verification Plan

### Automated Tests
- Run Python reversibility & simulation invariant suite:
  ```bash
  python tests/run_tests.py
  ```
  Must verify:
  1. All 10 algorithm pairs are 100% reversible across text, emojis, Malayalam, symbols, newlines, and tabs.
  2. Mismatched decoder pairs never silently return original plaintext.
  3. Guaranteed Success, Guaranteed Failure, and $N=1$ edge case invariants hold.

### Manual Verification
1. Test message submission, encoder/decoder shuffle animation, and payload travel through Central Relay.
2. Test "Try Again" retry button, attempt counter incrementing, and celebratory decode badge on retry success.
3. Test 100-Message Experiment modal with live SVG cumulative probability line chart.
4. Verify expandable Transmission Details containing raw payload, copy button, and step-by-step event timeline.
5. Verify responsive desktop (30% | 40% | 30%) and mobile (stacked) layouts without horizontal overflow.
