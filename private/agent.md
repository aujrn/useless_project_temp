# Agent Specification

## Project: Random Encoder / Decoder Messaging Simulator

### 1. Overview

Build a polished prototype of a messaging application that visually demonstrates how a message can pass through a randomly selected encoder and a randomly selected decoder.

The app is intentionally a **simulation**, not a production-secure messaging system.

The core interaction uses two chat panels:

- **Sender**: the user enters the original plaintext message.
- **Receiver**: the receiver sees the decoded result.
- In between them, the application simulates encoding, transmission, random decoder selection, and decoding.

### 2. Core Concept

The system contains:

- `N` encoders
- `N` decoders

When the sender sends a message:

1. Take the plaintext message from the Sender panel.
2. Randomly select one encoder from the available encoders.
3. Encode the plaintext using that encoder.
4. Simulate transmission of the encoded payload.
5. Randomly select one decoder from the available decoders.
6. Attempt to decode the encoded payload using the selected decoder.
7. If the selected decoder corresponds to the encoder used:
   - Recover the original plaintext.
8. Otherwise:
   - Display a deliberately generated gibberish/invalid decoded result.

The random selection should be visible in the prototype so that users can understand what happened.

### 3. Important Terminology

Use these terms consistently in the UI and code:

- **Encoder**: transforms plaintext into encoded text.
- **Decoder**: attempts to transform encoded text back into plaintext.
- **Plaintext**: the original message.
- **Encoded payload**: the intermediate message sent between the two simulated users.
- **Decoder match**: whether the decoder selected is compatible with the encoder used.
- **Transmission**: the simulated transfer from sender to receiver.

Avoid calling the system cryptographically secure unless real cryptographic primitives are implemented.

### 4. Prototype Architecture

Recommended logical flow:

```text
Sender Input
     ↓
Random Encoder Selection
     ↓
Encode Message
     ↓
Transmission Simulation
     ↓
Random Decoder Selection
     ↓
Decoder Compatibility Check
   ↙               ↘
MATCH             MISMATCH
 ↓                   ↓
Original text       Gibberish
 ↓                   ↓
Receiver Message
```

### 5. Encoder / Decoder Model

For the prototype, implement paired encoder/decoder systems.

Example:

```text
Encoder 1 ↔ Decoder 1
Encoder 2 ↔ Decoder 2
Encoder 3 ↔ Decoder 3
...
Encoder N ↔ Decoder N
```

Each encoder can use a different reversible transformation.

Suitable prototype algorithms include:

- Caesar/shift transformation
- Character substitution
- Reverse + transformation
- XOR-style demonstration with a fixed demo key
- Base64-style transformation, if clearly labeled as encoding rather than encryption

The implementation should be deterministic for a given encoder so its matching decoder can recover the original message.

### 6. Random Selection

Every send action should independently choose:

```text
selectedEncoder = random(availableEncoders)
selectedDecoder = random(availableDecoders)
```

Do not automatically choose the matching decoder.

This randomness is the central point of the prototype.

### 7. Success Condition

A message is successfully decoded when:

```text
selectedDecoder.pairId == selectedEncoder.pairId
```

Then:

```text
decodedMessage = decode(encodedPayload, selectedDecoder)
```

The Receiver should display the exact original message.

### 8. Failure Condition

When the decoder does not match the encoder:

```text
selectedDecoder.pairId != selectedEncoder.pairId
```

The app should not pretend that the decoder successfully decoded the message.

Instead, produce visibly corrupted/gibberish output.

Examples:

```text
H3llo ░▒?9x
```

or another deterministic corruption derived from the encoded payload.

The gibberish should remain clearly understandable as a failed decoding attempt.

### 9. Simulation Timeline

A send action should feel like a small communication event rather than an instant state change.

Recommended sequence:

```text
0 ms       User taps Send
100 ms     Encoder selected
250 ms     Encoding begins
500 ms     Encoded payload shown/transmitted
700 ms     Decoder selected
900 ms     Decoding begins
1100 ms    Result appears in Receiver
```

Exact timings can be shortened for performance.

The animation should never make the app feel slow.

### 10. Message History

The prototype should maintain a message history.

Each transmission record may contain:

```text
id
originalMessage
encoderId
encodedMessage
decoderId
matched
decodedMessage
timestamp
```

The UI does not need to expose all raw data by default. Detailed technical information can appear in an expandable "Transmission Details" area.

### 11. Transmission Details

For each sent message, provide an optional inspection view:

```text
ENCODER
Encoder 03

PAYLOAD
KHOOR ZRUOG

DECODER
Decoder 01

RESULT
Decode failed

MATCH
No
```

For successful transmission:

```text
ENCODER
Encoder 03

PAYLOAD
KHOOR ZRUOG

DECODER
Decoder 03

RESULT
Decode successful

MATCH
Yes
```

### 12. Configuration

Allow the prototype to configure the number of encoder/decoder pairs.

Example:

```text
Number of systems
[ 3 ]

Encoder 1 ↔ Decoder 1
Encoder 2 ↔ Decoder 2
Encoder 3 ↔ Decoder 3
```

A simple preset selector can also be provided:

- 3 Systems
- 5 Systems
- 10 Systems

The default should remain small enough to understand visually.

### 13. Probability Explanation

The prototype may show the theoretical chance of randomly selecting the correct decoder:

```text
Success probability = 1 / N
```

Examples:

```text
3 decoders → 33.3%
5 decoders → 20%
10 decoders → 10%
```

This is only valid when there is exactly one compatible decoder for each encoder and selection is uniformly random.

### 14. UI Behavior

#### Sender

- Message input
- Send button
- Optional sender identity/avatar
- Sent message appears immediately in the sender conversation

#### Transmission Layer

Show the intermediate process:

```text
Encoding...
↓
Encoded payload
↓
Transmitting...
↓
Selecting decoder...
↓
Decoding...
```

This can be represented as a compact animated status card rather than a large technical dashboard.

#### Receiver

- Incoming message
- Success/failure state
- Optional decoder information
- Optional transmission details

### 15. Empty State

Before sending a message, the main screen should communicate the idea succinctly:

> Send a message.  
> We'll randomly encode it, transmit it, and try to decode it.

Avoid a large amount of explanatory text.

### 16. Error Handling

Handle:

- Empty message
- Very long message
- Invalid configuration
- `N < 1`
- Encoder/decoder implementation errors
- Animation interruption
- Rapid repeated sends

For an empty message, keep the UI calm:

> Type a message first.

Do not expose stack traces or technical errors to the user.

### 17. Technical Safety

This is an educational simulation.

The project must not imply:

- End-to-end encryption
- Secure messaging
- Cryptographic security
- Privacy guarantees
- Protection against interception

If actual cryptographic algorithms are added later, document them separately.

### 18. Agent Implementation Priorities

Build in this order:

1. Sender and Receiver panels
2. Message state
3. Encoder implementations
4. Decoder implementations
5. Random encoder selection
6. Random decoder selection
7. Match/mismatch logic
8. Gibberish failure output
9. Transmission animation
10. Transmission details
11. Configuration
12. Probability visualization
13. Polish and accessibility

### 19. Acceptance Criteria

The prototype is complete when:

- A user can enter a message.
- Pressing Send selects an encoder randomly.
- The message is encoded.
- A decoder is selected independently and randomly.
- A matching decoder produces the original message.
- A mismatching decoder produces gibberish.
- The user can see which encoder and decoder were selected.
- The process feels like a messaging interaction.
- Multiple messages can be sent.
- The system does not falsely claim to provide real security.
- The interface remains understandable without reading the source code.

### 20. Design Principle

The technical mechanism should be **discoverable without becoming visually overwhelming**.

The user should feel:

> "I'm chatting normally, but I can peek behind the curtain and see the message being transformed."

The prototype's personality comes from the reveal of the hidden transmission process, not from cluttering the interface with technical controls.
