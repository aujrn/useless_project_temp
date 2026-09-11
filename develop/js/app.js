/**
 * Application Entry Point
 * Initializes simulator engine, UI view controller, and system event bindings.
 */

import { MessagingSimulator } from './simulation.js';
import { SimulatorUI } from './ui.js';

function initApp() {
  if (window.__appInitialized) return;
  window.__appInitialized = true;

  // Initialize Simulator with default of 3 systems (Section 12 of agent.md)
  const simulator = new MessagingSimulator({
    systemCount: 3,
    speed: 'normal'
  });

  // Initialize UI layer
  const ui = new SimulatorUI(simulator);

  // Global debug hook if needed in dev tools
  window.RelaySimulator = {
    simulator,
    ui
  };

  console.log('⚡ Random Encoder / Decoder Messaging Simulator initialized.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
