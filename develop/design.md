# Random Relay UI Update: Central Transmission Relay

## Purpose

Make the **Central Transmission Relay** the visual centerpiece of Random Relay without making the interface larger, noisier, or dashboard-like.

The relay should communicate the entire joke of the product at a glance:

> Message → Random Encoder → Payload travels → Random Decoder → Success or nonsense

This is a **UI/visual hierarchy update**, not a change to the simulator's underlying logic.

---

## 1. Design Goal

The central relay should feel like the system's visual heart.

The Sender and Receiver panels remain calm, readable, and functional. The Relay receives the strongest visual emphasis because it is where the project's core randomness happens.

### Desired hierarchy

```text
                SENDER
                   │
                   ▼
            ┌─────────────┐
            │   ENCODER   │
            │      ↓      │
            │   PAYLOAD   │
            │      ↓      │
            │   DECODER   │
            └─────────────┘
                   │
                   ▼
               RECEIVER
```

Do not literally make this a large rectangular box. Use nodes, a transmission path, restrained borders, and subtle illumination.

---

## 2. Preserve Existing Functionality

Do **not** remove or redesign the following existing behavior:

- Sender and Receiver messaging panels
- Random encoder selection
- Random decoder selection
- Correct-match decoding
- Mismatch corruption
- Encoder shuffle animation
- Decoder shuffle animation
- Traveling payload indicator
- Scramble/glitch character resolution
- Probability ring
- Transmission telemetry
- Payload copy button
- System count 1–10
- 3/5/10 presets
- Animation speed controls
- Reduced-motion behavior
- Sound effects
- Active Systems Browser
- Settings sheet
- `localStorage` preferences

This change should primarily affect layout, hierarchy, spacing, node styling, and animation emphasis.

---

## 3. Layout

### Desktop

Use a three-zone composition:

```text
┌──────────────────┐      ┌────────────────────┐      ┌──────────────────┐
│                  │      │                    │      │                  │
│     SENDER       │ ───► │   CENTRAL RELAY   │ ───► │     RECEIVER      │
│                  │      │                    │      │                  │
└──────────────────┘      └────────────────────┘      └──────────────────┘
```

The relay should occupy the visual center of the page.

Suggested desktop proportions:

- Sender: approximately 30%
- Relay: approximately 40%
- Receiver: approximately 30%

Do not force exact percentages if the existing layout requires different widths. The visual priority matters more than mathematical symmetry.

### Mobile

Stack the sections vertically:

```text
Sender
  ↓
Central Relay
  ↓
Receiver
```

The relay should remain visually prominent but should not consume excessive vertical space.

---

## 4. Central Relay Structure

Build the relay from four conceptual layers.

### Layer 1: Encoder Node

Display:

```text
ENCODER
System 03
Caesar Shift
✓
```

During selection, retain the existing shuffle animation.

The node should briefly show candidate systems before settling on the selected system.

On settle:

- selected name becomes stable
- subtle checkmark appears
- node receives a short visual emphasis
- no excessive bounce or glow

### Layer 2: Transmission Path

Between encoder and decoder, create a clear but restrained transmission path.

The path should communicate directionality.

Use:

- thin line or track
- subtle animated movement while transmitting
- traveling payload particle
- small visual activation when the payload enters the path

The existing payload particle should remain the primary motion element.

### Layer 3: Payload

The payload should be visually associated with the transmission path rather than appearing as an unrelated floating element.

Example:

```text
ENCODER
   │
   │
   ●  payload
   │
   │
   ↓
DECODER
```

The payload may briefly display a shortened raw representation if space allows, but avoid creating horizontal overflow with long encoded strings.

The full raw payload remains available in Transmission Details.

### Layer 4: Decoder Node

Display:

```text
DECODER
System 07
Binary Stream
✓
```

Retain the existing decoder shuffle animation.

After selection, clearly indicate whether the decoder matches the encoder.

---

## 5. Visual Emphasis

The relay should be more visually noticeable than Sender and Receiver, but not dramatically brighter.

Use hierarchy through:

- slightly stronger surface separation
- subtle elevation
- stronger internal spacing
- clearer node boundaries
- restrained accent illumination during active transmission
- animation

Avoid:

- huge glowing borders
- neon effects
- excessive gradients
- constant animation
- large decorative illustrations
- gamer-style HUD elements

The aesthetic should remain clean, precise, and Apple-inspired.

---

## 6. Idle State

When no transmission is occurring, the relay should be quiet.

Show:

```text
        CENTRAL RELAY

        Encoder
           │
           │
        Payload
           │
           │
        Decoder
```

Use low-contrast inactive states.

The relay should feel ready rather than busy.

Do not continuously animate the payload or transmission line while idle.

---

## 7. Sending State

When the user presses Send:

### Sequence

1. Sender send interaction occurs.
2. Relay activates.
3. Encoder node begins subtle shuffle.
4. Encoder settles on selected system.
5. Payload is generated.
6. Payload particle launches onto the transmission path.
7. Payload travels toward decoder.
8. Decoder begins shuffle near the payload's arrival.
9. Decoder settles.
10. Match/mismatch is determined.
11. Receiver result resolves through the existing scramble effect.

The relay should visually make this sequence understandable without requiring the user to read telemetry.

---

## 8. Transmission Animation

The traveling payload is the primary "wow" moment.

Recommended behavior:

```text
Encoder
   │
   ●───────────────►
   │                 Payload
   │
Decoder
```

The particle should:

- begin near the encoder
- travel smoothly along the relay path
- accelerate slightly at launch
- decelerate naturally near the decoder
- disappear or resolve into the decoder state

Avoid excessive particle trails.

A subtle glow or opacity shift is enough.

---

## 9. Match State

When encoder and decoder match:

- transmission path briefly activates
- decoder node settles with a positive state
- payload transitions cleanly into decoded result
- receiver scramble resolves into the original message
- success state is visually clear

Example:

```text
ENCODER
Caesar Shift
   │
   ●────────────►
                 │
                 ▼
              DECODER
             Caesar Shift
                  ✓
```

The success state should feel satisfying but restrained.

---

## 10. Mismatch State

When encoder and decoder differ:

- transmission still completes normally
- decoder node indicates mismatch
- relay briefly enters a failure state
- receiver scramble resolves into corrupted text
- existing failure explanation/telemetry remains available

Example:

```text
ENCODER
Atbash
   │
   ●────────────►
                 │
                 ▼
              DECODER
             Binary Stream
                  ✕
```

Do not make failure visually aggressive. The joke should come from the result, not from a giant warning.

---

## 11. Relationship to Sender and Receiver

Sender and Receiver should frame the relay rather than compete with it.

### Sender

Keep focused on:

- message composition
- send action
- sent-message state

### Relay

Focus on:

- encoder selection
- payload movement
- decoder selection
- match/mismatch

### Receiver

Focus on:

- received result
- successful decoded message
- corrupted result
- retry action when applicable

This creates a natural visual narrative from left to right.

---

## 12. Typography

Keep the existing typography system.

Use hierarchy rather than adding new fonts or decorative text.

Suggested relay hierarchy:

- Section label: small uppercase / secondary
- Node role: medium emphasis
- Algorithm name: primary emphasis
- System ID: secondary metadata
- Payload: monospaced
- State: concise status

Do not use oversized headings inside the relay.

---

## 13. Color and State

Follow the existing design system and accent color.

The relay should not introduce a new color palette.

Use the existing accent for:

- active transmission
- payload particle
- selected node
- success confirmation

Use neutral secondary states for:

- idle
- waiting
- shuffle candidates

Use the existing failure styling for mismatch.

Color must not be the only indicator. Pair state changes with icons, text, or symbols.

---

## 14. Responsive Behavior

### Desktop

Keep Sender, Relay, and Receiver horizontally aligned.

### Tablet

Reduce horizontal spacing while maintaining the central relay's visual prominence.

### Mobile

Stack vertically:

```text
┌──────────────┐
│    SENDER    │
└──────────────┘
       ↓
┌──────────────┐
│ CENTRAL RELAY│
│              │
│   ENCODER    │
│      ●       │
│   DECODER    │
└──────────────┘
       ↓
┌──────────────┐
│   RECEIVER   │
└──────────────┘
```

The payload animation should remain understandable vertically.

Long payloads must never cause horizontal page overflow.

---

## 15. Reduced Motion

When reduced motion is enabled:

- remove or shorten payload travel
- replace animated movement with state transitions
- keep encoder/decoder selection understandable without rapid shuffling
- retain success/failure feedback
- do not remove important state information

The UI must remain fully functional without animation.

---

## 16. Accessibility

Verify:

- Relay nodes have meaningful accessible labels.
- Encoder and decoder changes are announced through the existing status mechanism.
- Match/mismatch is available as text, not only color.
- Keyboard navigation remains logical.
- Focus is not trapped or lost during transmission.
- Payload details remain accessible to screen readers.
- Reduced-motion preferences are respected.

Avoid using animation as the only way to understand what happened.

---

## 17. Do Not Change

This iteration is specifically a **visual hierarchy/UI refinement**.

Do not add:

- authentication
- backend services
- database
- real networking
- accounts
- contacts
- cloud persistence
- additional encryption systems
- additional algorithms

Do not rewrite the simulation architecture merely to support the UI change.

Do not turn the interface into a dashboard.

---

## 18. Implementation Guidance

Prefer modifying the existing relay markup and CSS rather than creating a second relay component.

Reuse existing:

- encoder selection state
- decoder selection state
- payload animation
- simulation timeline
- audio events
- success/failure state
- reduced-motion setting

If the existing DOM structure prevents the desired visual hierarchy, make the smallest structural change necessary.

Keep the implementation zero-dependency.

Preserve the existing root/develop synchronization workflow.

---

## 19. Demo Target

The finished UI should make this sequence visually obvious within a few seconds:

```text
User types:
"Are you coming to the hackathon?"

        ↓

ENCODER
Caesar Shift

        ↓

● PAYLOAD travels through relay

        ↓

DECODER
Binary Stream

        ↓

✕ MISMATCH

        ↓

Receiver:
corrupted nonsense
```

On a successful attempt:

```text
ENCODER
Caesar Shift

        ↓

● PAYLOAD

        ↓

DECODER
Caesar Shift ✓

        ↓

Receiver:
Are you coming to the hackathon?
```

The audience should understand the product's core mechanic **without the presenter explaining every UI element**.

---

## 20. Acceptance Criteria

The UI update is complete when:

- [ ] Central Relay is visually centered and clearly the primary interaction area.
- [ ] Sender and Receiver remain readable and uncluttered.
- [ ] Existing encoder shuffle works inside the new relay hierarchy.
- [ ] Existing decoder shuffle works inside the new relay hierarchy.
- [ ] Traveling payload remains visually connected to the transmission path.
- [ ] Successful transmission clearly communicates a match.
- [ ] Failed transmission clearly communicates a mismatch.
- [ ] Receiver scramble/resolve animation still works.
- [ ] Transmission Details still works.
- [ ] Payload copy still works.
- [ ] Settings still work.
- [ ] Audio behavior is unchanged.
- [ ] Reduced motion is respected.
- [ ] Desktop layout has Sender | Relay | Receiver hierarchy.
- [ ] Mobile layout has Sender ↓ Relay ↓ Receiver hierarchy.
- [ ] No horizontal overflow occurs with long payloads or messages.
- [ ] No new dependencies are introduced.
- [ ] No existing simulator behavior is broken.
- [ ] The relay looks calm while idle and becomes visually active only during transmission.

---

## Final Principle

**Make the relay the story.**

The interface should not merely contain a relay between two chat boxes. The relay should make the entire concept visible:

> A perfectly functional messaging system that goes through an unnecessarily unreliable middleman.

Keep it elegant. Keep it restrained. Let the payload's journey be the moment people remember.
