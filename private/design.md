# Design Specification

## Project: Random Encoder / Decoder Messaging Simulator

## 1. Design Direction

Create an interface inspired by Apple's design language:

- Calm
- Minimal
- Content-first
- High legibility
- Generous spacing
- Subtle depth
- Purposeful motion
- Native-feeling controls
- Technical complexity hidden behind progressive disclosure

Do **not** imitate Apple's exact UI or copy proprietary layouts/assets.

The goal is an Apple-inspired experience where the interface feels almost invisible and the communication simulation becomes the visual story.

---

## 2. Design Personality

The product should feel like:

**Messages on the surface. Machinery underneath.**

The normal state should look like a clean modern messaging app.

When a message is sent, the interface briefly reveals the hidden journey:

```text
Plaintext
   ↓
Encoder
   ↓
Encoded Payload
   ↓
Transmission
   ↓
Decoder
   ↓
Result
```

This reveal should feel elegant rather than like a debugging console.

---

## 3. Visual Principles

### Hierarchy

Use three levels:

1. **Primary**
   - Conversation
   - Current message
   - Send action

2. **Secondary**
   - Transmission status
   - Success/failure state
   - Selected encoder/decoder

3. **Tertiary**
   - Raw encoded payload
   - IDs
   - Probability
   - Technical details

Technical information should never compete with the actual messages.

### Whitespace

Use generous spacing.

Avoid filling every available pixel.

The interface should have enough breathing room that the transmission animation becomes noticeable.

---

## 4. Typography

Use Apple's typography principles.

Preferred font:

```text
SF Pro Display / SF Pro Text
```

When unavailable:

```text
-apple-system
BlinkMacSystemFont
"Segoe UI"
sans-serif
```

Suggested hierarchy:

```text
Large Title
32–40 px
Semibold

Section Title
20–24 px
Semibold

Message Text
16–17 px
Regular

Secondary Text
13–15 px
Regular

Technical Metadata
12–13 px
Medium
```

Avoid excessive font weights.

Use weight and spacing before decorative effects.

---

## 5. Color System

The UI should work beautifully in both light and dark appearance.

### Light

```text
Background
#F5F5F7

Primary Surface
#FFFFFF

Secondary Surface
rgba(255,255,255,0.72)

Primary Text
#1D1D1F

Secondary Text
#6E6E73

Separator
rgba(0,0,0,0.08)
```

### Dark

```text
Background
#000000

Primary Surface
#1C1C1E

Secondary Surface
#2C2C2E

Primary Text
#F5F5F7

Secondary Text
#98989D

Separator
rgba(255,255,255,0.12)
```

### Accent

Use one restrained accent color for actions and system state.

A cool blue is the default choice.

Success and failure should not rely on color alone. Pair them with icons, labels, and motion.

---

## 6. Materials

Use subtle translucent surfaces where appropriate.

Recommended:

```text
backdrop-filter: blur(...)
background: translucent surface
```

Use glass/material effects sparingly.

Do not turn the entire application into glass.

The conversation remains the visual anchor.

---

## 7. Main Layout

Desktop/tablet:

```text
┌─────────────────────────────────────────────┐
│                 Header                      │
├───────────────────┬─────────────────────────┤
│                   │                         │
│     SENDER        │       RECEIVER          │
│                   │                         │
│  message history  │    message history      │
│                   │                         │
│                   │                         │
│  [message input]  │                         │
│             Send  │                         │
└───────────────────┴─────────────────────────┘
```

The two panels should visually feel like two sides of the same conversation.

Mobile:

```text
┌──────────────────────┐
│ Header               │
├──────────────────────┤
│ Sender               │
│                      │
│ Message history      │
│                      │
├──────────────────────┤
│ Transmission         │
├──────────────────────┤
│ Receiver             │
│                      │
│ Message history      │
└──────────────────────┘
```

On mobile, sender and receiver become vertically stacked.

---

## 8. Header

Keep the header minimal.

Possible structure:

```text
Random Relay

● 3 encoder systems
```

or:

```text
Random Relay                         ⚙
Messaging Simulation
```

Do not put a large logo or oversized branding above the conversation.

---

## 9. Sender Panel

### Header

```text
You
Sender
```

Use a small avatar or abstract system icon.

### Message Composer

A rounded input surface:

```text
┌──────────────────────────────────┐
│ Message...                    ↑  │
└──────────────────────────────────┘
```

The send button should be circular and visually obvious.

### Interaction

When the user sends:

1. Composer clears.
2. Message appears in the Sender conversation.
3. Transmission animation starts.
4. Receiver result appears.

---

## 10. Receiver Panel

Header:

```text
Receiver
Listening
```

Incoming messages should be visually distinct from sender messages.

Successful decoding:

```text
┌──────────────────────────────┐
│ Hello, how are you?          │
└──────────────────────────────┘
```

Failed decoding:

```text
┌──────────────────────────────┐
│ H3llø ░▒?9x                  │
└──────────────────────────────┘

Decode failed
```

The failure should feel intentional and readable as a system state.

---

## 11. Transmission Card

This is the signature component of the product.

During transmission, show a compact floating card between the two chat areas.

Example:

```text
Encoding message

Encoder 03
● ● ● ○ ○
```

Then:

```text
Transmitting

KHOOR ZRUOG
```

Then:

```text
Decoder selected

Decoder 01
```

Then:

```text
Decode failed
```

The card should transition between states instead of displaying every state simultaneously.

---

## 12. Transmission Details

After completion, provide an expandable disclosure control:

```text
⌄ Transmission details
```

Expanded:

```text
Encoder                         Encoder 03
Encoded payload                KHOOR ZRUOG
Decoder                         Decoder 01

Compatibility                   No match

Result                          Decode failed
```

For success:

```text
Compatibility                   Match
Result                          Original message recovered
```

Use monospaced typography only for raw encoded payloads and technical values.

---

## 13. Encoder / Decoder Visualization

Avoid a literal engineering flowchart in the primary UI.

Instead, use a lightweight animated relay:

```text
[Sender]  →  [Encoder 03]  →  [••••••]  →  [Decoder 01]  →  [Receiver]
```

Each node can briefly illuminate during its operation.

The encoded payload can travel visually between the encoder and decoder.

---

## 14. Randomness Visualization

Random selection should feel intentional.

When selecting an encoder:

```text
Choosing encoder
Encoder 01
Encoder 02
Encoder 03 ✓
Encoder 04
```

Do not create a slot-machine effect.

A quick subtle shuffle followed by a settle is enough.

Repeat for the decoder.

---

## 15. Success State

Success should be understated.

Use:

- Soft scale-in
- Small checkmark
- Original message appearing naturally
- Short status text

Example:

```text
✓ Message decoded

"Meet me at 5."
```

Avoid confetti.

The project is technical, not a birthday party.

---

## 16. Failure State

Failure should be visually interesting without becoming alarming.

Use:

- Brief text distortion
- Slight glitch on the decoded payload
- Small failure icon
- Clear explanation

Example:

```text
Decoder mismatch

"Me3t m░ at 5?"
```

Then:

```text
The selected decoder could not recover
the original message.
```

Keep the explanation secondary.

---

## 17. Animation

Motion should communicate state.

Recommended principles:

- 150–250 ms for small UI transitions
- 250–450 ms for panel/card transitions
- Ease-out for entering elements
- Ease-in-out for state transitions
- Avoid constant motion

### Message Send

```text
Tap
 ↓
Message lifts slightly
 ↓
Moves into conversation
```

### Encoding

Encoded characters can briefly morph or transition.

### Transmission

Use a small moving payload indicator.

### Decoding

Characters settle into the final result.

For successful decoding, the gibberish/encoded representation should visually resolve into the original message.

For failure, it should settle into corrupted text.

---

## 18. Reduced Motion

Respect:

```text
prefers-reduced-motion
```

When enabled:

- Remove character morphing
- Remove travelling payload animations
- Use simple fades
- Preserve all state information through text and icons

---

## 19. Controls

Use familiar rounded controls.

Primary action:

```text
Send
```

Secondary controls:

```text
Details
Configure
Reset
```

Avoid excessive pill-shaped controls.

Use segmented controls only where they genuinely represent mutually exclusive modes.

---

## 20. Configuration Screen

A lightweight settings sheet:

```text
Simulation

Encoder / Decoder systems

        −     5     +

Selection
● Random

Behavior
☑ Show transmission details
☑ Animate encoding
☑ Animate decoding
```

Optional presets:

```text
3 systems
5 systems
10 systems
```

The configuration should never overwhelm the messaging interface.

---

## 21. Probability Display

Show only when useful.

Example:

```text
Random decoder success chance

20%

1 of 5 decoders matches
```

A simple circular indicator or horizontal progress representation is sufficient.

Do not turn this into a financial dashboard.

---

## 22. Empty State

Centered composition:

```text
◉

Send a message

Your message will travel through a
random encoder and decoder.

See what comes out the other side.
```

Primary action remains the composer.

---

## 23. Error States

### Empty message

```text
Type a message first.
```

### Configuration error

```text
Choose at least one encoder system.
```

### Processing error

```text
Transmission interrupted.

Try again.
```

Keep errors inline and contextual.

---

## 24. Responsive Behavior

### Desktop

- Two-column conversation
- Transmission card centered between panels
- Comfortable maximum content width
- Avoid full-width stretched chat bubbles

### Tablet

- Two-column layout when space allows
- Reduce panel padding

### Mobile

- Single-column layout
- Sender → Transmission → Receiver
- Sticky composer if appropriate
- Transmission details become a bottom sheet or expandable card

---

## 25. Accessibility

Required:

- Keyboard navigation
- Visible focus states
- Semantic buttons
- Proper labels for inputs
- Sufficient text contrast
- No information conveyed by color alone
- Reduced-motion support
- Screen-reader-friendly transmission states

The encoded payload must remain selectable and readable.

---

## 26. Component Inventory

Recommended components:

```text
AppShell
Header
ConversationPanel
ChatMessage
MessageComposer
SendButton
TransmissionCard
TransmissionStep
EncoderNode
DecoderNode
PayloadDisplay
TransmissionDetails
StatusBadge
SystemSelector
ProbabilityCard
SettingsSheet
EmptyState
ErrorState
```

Keep components composable and avoid one enormous application component.

---

## 27. Design Tokens

Centralize:

```text
--radius-small
--radius-medium
--radius-large
--spacing-xs
--spacing-sm
--spacing-md
--spacing-lg
--spacing-xl
--text-primary
--text-secondary
--surface-primary
--surface-secondary
--separator
--accent
```

Do not scatter visual constants throughout the application.

---

## 28. Overall Experience

The experience should tell a story in three layers:

### Layer 1: Chat

The user simply sends a message.

### Layer 2: Magic Window

The interface reveals:

```text
Encoder → Payload → Decoder
```

### Layer 3: Explanation

The user can inspect exactly why the receiver got the original message or gibberish.

The default experience should stay simple.

The complexity should appear only when the user asks to see it.

---

## 29. Final Design Test

Ask:

> Could someone understand the app in five seconds?

Then:

> Could someone understand what happened to their message in thirty seconds?

Then:

> Could someone inspect the technical mechanism without opening developer tools?

If all three answers are yes, the design is doing its job.
