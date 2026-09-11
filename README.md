<img width="1280" height="640" alt="Random Relay banner" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />

# Random Relay 🎯
*The Apple-Inspired Random Encoder / Decoder Messaging Simulator*

> **Core Premise:** A perfectly functional messaging system deliberately designed to make communication unreliable.

---

## 1. Basic Details
### Team Name: Core2k5

### Team Members
- **Team Lead:** Arjun Krishna - Sree Narayana Gurukulam College of Engineering
- **Member 2:** Abhiram P - Sree Narayana Gurukulam College of Engineering

---

## 2. Product Concept

Random Relay routes text messages through a central transmission relay with randomly chosen reversible encoders and decoders. When the sender presses **Send**, the simulator selects a random encoder. The receiver independently selects a random decoder from $N$ active paired systems.

- **Match ($P = 1/N$):** The receiver recovers the exact original plaintext message.
- **Mismatch:** The receiver delivers deterministic, plausible corrupted gibberish.

The central joke is **not** that the software is broken. The central joke is that **the software works exactly as designed, and the design is a terrible idea.**

---

## 3. Features & Architecture

- **Central Transmission Relay:** Visual centerpiece featuring a 4-layer architecture (Sender Node → Encoder Node → Animated Traveling Payload Particle → Decoder Node → Receiver Node).
- **10 Paired Reversible Algorithms:**
  1. Caesar Shift (+3 / -3)
  2. Atbash Substitution Cipher
  3. Reverse + Invert Case
  4. XOR Demonstration (`0x5A` hex stream)
  5. Base64 Representation
  6. Vigenère Cipher (key `ENIGMA`)
  7. 8-bit Binary Stream
  8. Rail Fence Transposition (3 rails)
  9. Hexadecimal Byte Stream
  10. Symbol Token Substitution
- **Simulation Modes:**
  - `Random`: Encoder and decoder chosen independently ($P = 1/N$).
  - `Guaranteed Success`: Forces matching pair for predictable demos.
  - `Guaranteed Failure`: Forces mismatching decoder ($N > 1$) with mathematical constraint feedback for $N = 1$.
- **Session Telemetry & Statistics:** Tracks total transmissions, success/failed counts, actual vs expected match rate, and a dynamic Uselessness Rating ($15\%\text{--}99\%$).
- **100-Message Automated Experiment:** Runs 100 rapid simulated transmissions and plots a live SVG cumulative success rate line chart against the theoretical expected probability reference line.
- **Progressive Transmission Details:** Expandable details showing Raw Payload, 1-click Payload Copying, Attempt Counter, and a step-by-step event timeline (`✓ Created` → `✓ Encoded` → `✓ Transmitted` → `✓ Decoded`).
- **Web Audio API Synthesizer:** Zero-dependency sound effects (soft key press, transit flutter, crystal success chime, soft mismatch tone).
- **Apple-Inspired Design Tokens:** Dark/light mode toggle, SF Pro typography, frosted glass `backdrop-filter`, and full `prefers-reduced-motion` compliance.

---

## 4. Technical Stack & Local Execution

- **Frontend:** Vanilla HTML5, CSS3, ES6+ JavaScript (Zero external libraries/frameworks).
- **Audio:** Web Audio API (Zero audio asset dependencies).
- **Testing:** Python 3 automated test suite (`tests/run_tests.py`).

### 1-Click Automated Setup (Windows)

Simply double-click `setup.bat` (or run `python setup.py` in your terminal):

```cmd
setup.bat
```

This automatically:
1. Re-builds the standalone JavaScript bundle (`js/bundle.js`).
2. Synchronizes the `develop/` workspace mirror.
3. Runs the automated verification test suite (`tests/run_tests.py`).
4. Starts the local HTTP server on `http://localhost:8000` and opens your default browser.

### Cloudflare Pages Deployment ⚡ (Recommended)

Random Relay is **100% optimized for Cloudflare Pages** with zero-dependency static edge distribution and custom HTTP security headers ([`_headers`](file:///c:/Users/abhir/OneDrive/Documents/GitHub/useless_project_temp/_headers)).

#### Option 1: Git Integration (Easiest)
1. Open [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Select repository: `useless_project_temp`.
3. Set **Framework preset**: `None` (Static HTML).
4. Set **Build output directory**: `/` (Root).
5. Click **Save and Deploy**. Cloudflare will deploy your app on global edge servers automatically on every commit!

#### Option 2: Direct Upload via Wrangler CLI
```bash
npx wrangler pages deploy . --project-name=random-relay
```

A GitHub Actions workflow is also provided at [`.github/workflows/cloudflare-pages.yml`](file:///c:/Users/abhir/OneDrive/Documents/GitHub/useless_project_temp/.github/workflows/cloudflare-pages.yml).

### Running Automated Verification Suite

```bash
python tests/run_tests.py
```

---

## 5. Codebase Structure

```text
random-relay/
├── index.html                  # Standalone semantic HTML5 application workspace
├── README.md                   # Root documentation
├── css/
│   └── styles.css              # Apple design tokens, layout grid, themes & animations
├── js/
│   ├── algorithms.js           # 10 paired reversible transformations & corruption logic
│   ├── audio.js                # Zero-dependency Web Audio synthesizer
│   ├── simulation.js           # Timeline state machine, mode rules & session stats
│   ├── ui.js                   # View controller, relay illumination & SVG chart
│   ├── app.js                  # ES Module entry point
│   └── bundle.js               # Standalone wrapped bundle for CORS-free file:// execution
├── develop/                    # Source-of-truth workspace mirror & design documentation
│   ├── index.html
│   ├── README.md
│   ├── css/styles.css
│   ├── js/
│   ├── agent.md
│   ├── design.md
│   ├── implementation_plan.md
│   └── walkthrough.md
└── tests/
    ├── algorithms.test.js      # JS test specs
    ├── simulation.test.js      # Simulation invariant specs
    └── run_tests.py            # Comprehensive Python 3 verification runner
```

---
Made with ❤️ at TinkerHub Useless Projects 3.0

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--26-26?link=https%3A%2F%2Ftinkerhub.org%2Fevents%2F1M8ORET9A1%2Fuseless-projects-3.0)



