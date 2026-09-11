# Develop Directory - Random Relay Simulator

This directory contains the development build of the Random Encoder / Decoder Messaging Simulator.

## Architecture

- **`index.html`**: Semantic HTML5 workspace with dual conversation panels (Sender & Receiver), Central Transmission Relay card, and configuration modal.
- **`css/styles.css`**: Apple-inspired styling tokens, SF Pro typography, light/dark themes, responsive layout, and reduced-motion handling.
- **`js/algorithms.js`**: 10 paired reversible transformations and deterministic corrupted output generator.
- **`js/simulation.js`**: Simulation engine, timeline state machine (0-1100ms), probability engine ($P = 1/N$), and message history.
- **`js/ui.js`**: View controller, relay node illumination, progressive disclosure details, settings sheet, and DOM animations.
- **`js/app.js`**: Application bootstrapping and event orchestration.
- **`js/bundle.js`**: Self-contained bundle for zero-CORS standalone execution via file:// and web servers.

## Running Locally

Simply open `index.html` in any modern web browser or run:
```bash
python -m http.server 8000
```
