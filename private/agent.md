# Random Relay — Agent Specification

## 1. Product Definition

**Random Relay** is a deliberately unreliable messaging simulator.

Core concept:

> A perfectly functional messaging app deliberately designed to make communication unreliable.

The sender enters a message. The system randomly chooses an encoder and independently chooses a decoder. The message reaches the receiver correctly only when the decoder matches the encoder.

This is a simulation, not real secure encryption, real networking, or a production messaging service.

---

## 2. Core User Flow

1. User enters plaintext in the Sender panel.
2. User presses Send.
3. The simulation selects an encoder according to the active simulation mode.
4. The plaintext is encoded into a payload.
5. The payload travels through the central relay.
6. The simulation selects a decoder.
7. The decoder attempts to decode the payload.
8. If encoder and decoder are the compatible pair, the original plaintext is delivered.
9. Otherwise, the receiver displays deterministic, plausible gibberish/corruption.
10. The transmission is recorded in session statistics and transmission details.
11. After failure, the user can retry the exact same plaintext.

---

## 3. Encoder / Decoder Model

The application contains **10 paired reversible systems**:

1. Caesar Shift, +3 / -3
2. Atbash Substitution
3. Reverse + Invert Case
4. XOR Demonstration, `0x5A`
5. Base64 Representation
6. Vigenère, key `ENIGMA`
7. 8-bit Binary Stream
8. Rail Fence Transposition, 3 rails
9. Hexadecimal Byte Stream
10. Symbol Token Substitution

Each system must have a compatible encoder and decoder identified by a shared pair/system ID.

### Important

- Use the terms **encode/decode** and **encoder/decoder**.
- Do not describe these systems as secure encryption.
- Every compatible encode → decode path must reproduce the original supported plaintext.
- A mismatched decoder must not silently reproduce the original plaintext.

---

## 4. Simulation Modes

Provide three modes:

### Random

- Encoder is selected randomly.
- Decoder is selected independently and randomly.
- Success probability is theoretically `1/N`, where `N` is the number of active systems.

### Guaranteed Success

- Select a valid encoder/decoder pair.
- Always produce a successful transmission.
- Still show the normal relay animation and telemetry.

### Guaranteed Failure

- Select an encoder and a different decoder.
- Always produce a failed transmission.
- If `N = 1`, guaranteed failure is mathematically impossible and the UI must explain this rather than faking a result.

These modes exist primarily to make demonstrations reliable.

---

## 5. Transmission Timeline

Normal simulation sequence:

```text
0ms       Send tapped
100ms     Encoder selected
250ms     Encoding
500ms     Payload transmitted
700ms     Decoder selected
900ms     Decoding
1100ms    Receiver delivery
```

Animation speed settings may scale this sequence:

- **Normal:** approximately 1.1 seconds total
- **Fast:** approximately 0.55 seconds total
- **Instant:** no meaningful animation delay

The exact implementation may use event scheduling rather than literal fixed delays, but the visual order must remain clear.

---

## 6. Relay Visual System

The **Central Transmission Relay** is the visual centerpiece.

Desktop composition:

```text
Sender        Relay        Receiver
  │             │              │
  │          Encoder           │
  │             ↓              │
  │          PAYLOAD           │
  │             ↓              │
  │          Decoder           │
  │             │              │
  └─────────────┴──────────────┘
```

The relay must communicate the journey without becoming oversized or distracting.

### Relay interactions

- Encoder selection uses a subtle shuffle animation through candidate names before settling on the selected encoder.
- Decoder selection uses the same treatment.
- The selected system ends with a clear confirmation/checkmark.
- A traveling illuminated payload indicator moves from encoder toward decoder.
- The receiver begins with a short glyph/glitch scramble before resolving to the final result.
- Successful decoding resolves to the original message.
- Failed decoding resolves to deterministic corruption/gibberish.

Reduced-motion mode must simplify or remove these animations.

---

## 7. Failure Corruption

A mismatched decoder must produce output that looks intentionally corrupted rather than randomly crashing or producing unusable UI.

Requirements:

- Deterministic for a given relevant transmission state.
- Plausible visual gibberish/glitch output.
- Must not accidentally equal the original plaintext.
- Must preserve application stability for Unicode, emoji, long messages, and unusual characters.

Example visual progression:

```text
░▒▓!?#*&...
        ↓
Corrupted output
```

The corruption system is presentation/simulation logic, not a claim about real cryptographic behavior.

---

## 8. Retry Same Message

After a failed transmission, expose:

**Try Again**

Retry must:

- Reuse the exact same plaintext.
- Start a new transmission.
- Randomly select encoder/decoder again in Random mode.
- Increment the attempt counter.
- Preserve the session statistics.

Example:

```text
Attempt 1  ✗ Decoder mismatch
Attempt 2  ✗ Decoder mismatch
Attempt 3  ✓ Successfully decoded
```

Show a subtle success state such as:

> Decoded on attempt #3

---

## 9. Failure Explanation

A failed transmission should explain the mismatch clearly.

Example:

```text
Encoder 02
Atbash

        ↓

Decoder 05
Binary Stream

        ↓

No compatible decoder
```

Follow with a human-readable explanation:

> The receiver didn't have the right decoder.

Avoid cryptographic jargon when a simple explanation is clearer.

---

## 10. Session Statistics

Maintain compact session-level statistics:

```text
TRANSMISSIONS
17

✓ 4 successful
✗ 13 failed

Success rate
23.5%

Expected
20%
```

Track at minimum:

- Total transmissions
- Successful transmissions
- Failed transmissions
- Success rate
- Expected probability
- Current attempt number

Do not turn this into a large analytics dashboard. The project should remain visually simple.

---

## 11. Probability

With `N` active systems:

```text
P(success) = 1/N
```

Examples:

- 3 systems → 33.3%
- 5 systems → 20%
- 10 systems → 10%

The probability ring must dynamically reflect the exact theoretical probability.

When changing the number of active systems, animate the displayed probability where animation is enabled.

Optional supporting message:

> Your odds just got worse.

---

## 12. 100-Message Experiment

Provide an optional **Run Experiment** feature.

The experiment automatically runs 100 simulated transmissions using the active system count and selected simulation rules.

Display:

```text
100 TRANSMISSIONS

Successful       18
Failed           82

Actual           18%
Expected         20%

Difference       -2%
```

For Random mode, actual results are expected to vary around the theoretical probability.

The experiment should not require 100 full-speed UI animations if that would become slow or annoying. It may use a compact progress treatment or accelerated simulation.

### Live probability visualization

During or after the experiment, optionally show a simple line chart of cumulative success rate with an expected-probability reference marker.

Do not build a complex charting framework.

---

## 13. Uselessness Score

Optional theme feature: a deliberately meaningless **Uselessness Score**.

Example:

```text
USELESSNESS

████████████████░░░░
84%

84% useless. Excellent.
```

Possible inputs:

- Messages sent
- Failed messages
- Retries
- Time spent
- Number of active systems

The score is entertainment only and must never be presented as a meaningful productivity metric.

---

## 14. Easter Eggs / Achievements

Use only a small number of hidden reactions.

Examples:

- After 10 consecutive failures:
  > Are you sure you want to keep doing this?
- After 10 successful messages:
  > Suspiciously competent.
- After 100 messages:
  > You could have just texted them.

Optional achievements may reward unusual simulation behavior.

These must not interrupt the primary flow.

---

## 15. Transmission Details

Transmission Details should be expandable/progressive-disclosure UI.

Include:

- Encoder ID
- Encoder name
- Raw encoded payload
- One-click copy button
- Decoder ID
- Decoder name
- Match: Yes / No
- Result: Success / Failure
- Attempt number

Copy feedback should briefly replace the copy control state with a checkmark/confirmation.

---

## 16. Expanded Transmission Timeline

The telemetry view may expand into a readable event timeline:

```text
✓ Message created
      ↓
✓ Encoder 03 selected
      ↓
✓ Message encoded
      ↓
✓ Payload transmitted
      ↓
✓ Decoder 07 selected
      ↓
✗ Decoder mismatch
      ↓
✗ Message corrupted
```

This should remain collapsed by default unless the user enables transmission details.

---

## 17. Settings / Active Systems Browser

Settings must support:

### Active systems

- Stepper from 1–10.
- Presets: 3, 5, 10.
- Active Systems Browser listing every enabled system.
- Each system has a human-readable description.

### Animation

- Normal
- Fast
- Instant

### Behavior toggles

- Show transmission details
- Animate decoding
- Sound effects
- Reduced motion where applicable

### Audio

Audio preferences should persist through `localStorage`.

---

## 18. Audio System

Use a zero-dependency Web Audio synthesizer.

Sounds:

- Soft keyboard/click sound when sending.
- Subtle transit hum.
- Crystal-like two-tone success chime.
- Soft mismatch/failure tone.

Rules:

- Audio is off by default if browser autoplay restrictions require it.
- No sound before user interaction.
- Header speaker control clearly shows enabled/disabled state.
- Settings provides the same audio preference.
- Bulk experiments must not become an irritating wall of repeated sounds.
- Audio preference persists locally.

---

## 19. Message Metadata

Each transmission may expose lightweight metadata such as:

- Attempt number
- Timestamp or relative transmission time
- Encoder/decoder IDs
- Match state
- Result state

Metadata should support the simulation rather than make the interface look like a real enterprise messaging platform.

---

## 20. Reset Behavior

**Reset Conversation** must reset the current simulation state:

```text
Messages        ✓ reset
Statistics      ✓ reset
Attempts        ✓ reset
Uselessness     ✓ reset
Experiment      ✓ reset
```

Settings/preferences should remain intact.

If desired, provide a separate **Reset All Settings** action for preferences.

---

## 21. Sender UI

The Sender panel should provide:

- Clear message composer.
- Send action.
- Useful example/quick prompt chips where already implemented.
- Keyboard-friendly interaction.
- Clear sending state during simulation.

The sender should make it obvious what plaintext is being transmitted.

---

## 22. Receiver UI

The Receiver panel should show:

- Delivered message on success.
- Corrupted/gibberish result on failure.
- Clear success/failure state.
- Attempt number where relevant.
- Human-readable failure explanation.
- Retry action after failure.

Success/failure must not rely on color alone.

---

## 23. Visual Design

Maintain the existing Apple-inspired visual direction:

- Clean typography.
- Generous spacing.
- Subtle material/surface hierarchy.
- Restrained animation.
- Light and dark appearance.
- Clear focus states.
- Central relay as the visual centerpiece.

The app should feel polished without becoming a generic corporate dashboard.

---

## 24. Responsive Layout

### Desktop

```text
Sender | Relay | Receiver
```

### Tablet

Maintain the three-part concept while adapting spacing and widths.

### Mobile

```text
Sender
  ↓
Relay
  ↓
Receiver
```

Test specifically:

- Long encoded payloads.
- Long plaintext messages.
- Settings sheet/modal.
- Probability ring.
- Transmission details.
- Horizontal overflow.
- Composer keyboard behavior.

---

## 25. Accessibility

Verify:

- Keyboard-only operation.
- Logical Tab navigation.
- Enter sends when appropriate.
- Escape closes settings/modal UI.
- Correct semantic controls.
- Appropriate `aria-label`s.
- Focus returns correctly after modal close.
- Screen-reader status updates for encoding, transmission, decoder selection, success, and failure.
- Success/failure is communicated with text/icons, not color alone.
- Reduced-motion behavior removes or simplifies nonessential motion.

---

## 26. Algorithm Testing

All 10 systems must be tested, not only the most obvious ones.

Test inputs should include:

```text
Hello World!
1234567890
@#$%^&*()
Mixed CASE
emoji 😀🚀
Malayalam മലയാളം
empty string
very long message
newlines
tabs
```

Particular attention is required for byte-oriented transformations, Base64, XOR, binary, hexadecimal, and symbol mappings.

For every compatible pair:

```text
encode → decode = original
```

The implementation must remain stable for Unicode and emoji.

---

## 27. Automated Tests

Provide a lightweight test suite where practical.

Minimum compatible-pair coverage:

```text
✓ Caesar
✓ Atbash
✓ Reverse
✓ XOR
✓ Base64
✓ Vigenère
✓ Binary
✓ Rail Fence
✓ Hex
✓ Symbol Token

10/10 algorithms reversible
```

Also verify mismatched pairs do not return the original plaintext:

```text
Encoder 01 + Decoder 02
→ must not silently produce original plaintext
```

The test suite should focus on the actual project algorithms and simulation invariants, not require a large testing framework.

---

## 28. Project Structure

Target structure:

```text
random-relay/
│
├── index.html
├── README.md
│
├── css/
│   └── styles.css
│
├── js/
│   ├── algorithms.js
│   ├── simulation.js
│   ├── audio.js
│   ├── ui.js
│   ├── app.js
│   └── bundle.js
│
├── develop/
│   ├── algorithms.js
│   ├── simulation.js
│   ├── audio.js
│   ├── ui.js
│   ├── app.js
│   ├── agent.md
│   ├── design.md
│   ├── implementation_plan.md
│   └── walkthrough.md
│
└── tests/
    ├── algorithms.test.js
    └── simulation.test.js
```

If `develop/` is the source-of-truth directory, document that clearly in the README and avoid unnecessary duplication.

---

## 29. Technical Architecture

Use a standalone, zero-dependency web application.

Preferred characteristics:

- Vanilla HTML/CSS/JavaScript.
- Modular JavaScript responsibilities.
- Event-driven simulation state.
- No backend required.
- No database.
- No authentication.
- No accounts.
- No contacts.
- No cross-device persistence.
- No real network messaging.
- No real encryption/security claims.

The application should run directly where practical and through a simple local static server when needed, for example:

```bash
python -m http.server 8000
```

---

## 30. Demo Reliability

The hackathon demo must be predictable.

Recommended demo sequence:

1. Set a visible system count such as `N = 5`.
2. Enter a recognizable message such as:
   `Are you coming to the hackathon?`
3. Send in Random mode.
4. Show encoder shuffle.
5. Show payload traveling through the relay.
6. Show decoder shuffle.
7. Show mismatch and corrupted receiver output if it occurs.
8. Use **Try Again** with the exact same message.
9. Demonstrate a successful retry.
10. Open Transmission Details to explain the encoder/decoder mismatch.
11. Show `1/N` probability and session statistics.
12. Optionally demonstrate Guaranteed Success/Failure or Run Experiment.

Guaranteed modes exist specifically so the demo does not depend on luck.

---

## 31. Implementation Priorities

### Must-have

1. Retry exact same message.
2. Session statistics.
3. Guaranteed Success / Guaranteed Failure modes.
4. Test all 10 algorithms.
5. Accessibility pass.
6. Mobile pass.
7. Correct reset behavior.
8. Proper README.

### Strong additions

9. Expanded transmission timeline.
10. Better failure explanation.
11. 100-message experiment.
12. Actual vs expected probability visualization.
13. Uselessness score.

### Fun polish

14. Easter eggs.
15. Achievements.
16. Optional Spy Mode.

---

## 32. Scope Guardrails

Do **not** spend development time on:

- More algorithms.
- Login/authentication.
- Backend infrastructure.
- Database infrastructure.
- Real networking.
- Real encryption.
- Accounts.
- Contacts.
- Cross-device chat persistence.

These features undermine the intentionally useless premise and add complexity without improving the core demonstration.

---

## 33. Product Personality

The product should be:

- Technically coherent.
- Visually polished.
- Easy to understand within seconds.
- Slightly absurd.
- Demonstrably useless.
- Educational about probability and encoding/decoding concepts.

The humor should emerge from the system behaving correctly while producing an inconvenient outcome.

The central joke is not that the software is broken.

The central joke is that **the software works exactly as designed, and the design is a terrible idea.**

---

## 34. Final Acceptance Criteria

The current iteration is complete when:

- [ ] Sender can submit a plaintext message.
- [ ] Active systems can be configured from 1–10.
- [ ] Ten paired reversible systems are available.
- [ ] Random mode independently selects encoder and decoder.
- [ ] Correct pairs reproduce the original plaintext.
- [ ] Mismatched pairs produce stable corruption/gibberish.
- [ ] Encoder and decoder shuffle animations work.
- [ ] Payload visibly travels through the relay.
- [ ] Receiver scramble/resolve animation works when enabled.
- [ ] Retry resends the exact same plaintext.
- [ ] Attempt counter is accurate.
- [ ] Guaranteed Success works.
- [ ] Guaranteed Failure works when `N > 1` and is mathematically explained when `N = 1`.
- [ ] Session statistics are accurate.
- [ ] The probability ring reflects `1/N`.
- [ ] Transmission details show the actual encoder, payload, decoder, match, and result.
- [ ] Payload copy works.
- [ ] Settings persist appropriate preferences through `localStorage`.
- [ ] Audio respects user preference and browser interaction rules.
- [ ] Reduced motion is respected.
- [ ] Reset Conversation resets session state but not settings.
- [ ] Mobile layout has no problematic horizontal overflow.
- [ ] Keyboard and screen-reader interaction are usable.
- [ ] All 10 algorithms pass compatible encode/decode tests.
- [ ] Unicode, emoji, long strings, newlines, and tabs are handled safely.
- [ ] Mismatched algorithm tests verify that the original plaintext is not silently recovered.
- [ ] The project can run as a standalone static web app.
- [ ] README explains the concept, setup, controls, probability model, and scope.

---

## 35. Final Principle

Do not optimize Random Relay toward becoming a better messenger.

Optimize it toward becoming a **better demonstration of why this messenger is useless**.

The ideal user reaction is:

> "Why does this exist?"

followed immediately by:

> "Okay, that's actually pretty clever."
