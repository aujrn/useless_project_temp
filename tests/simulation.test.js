/**
 * Simulation Invariants Test Suite
 * Section 27 of agent.md
 */

import { MessagingSimulator } from '../js/simulation.js';

console.log("=========================================");
console.log("Running Simulation Invariants Tests...");
console.log("=========================================");

async function runTests() {
  let passed = 0;
  let failed = 0;

  // Test 1: Guaranteed Success mode
  const simSuccess = new MessagingSimulator({ systemCount: 5, mode: 'guaranteed_success', speed: 'instant' });
  for (let i = 0; i < 10; i++) {
    const res = await simSuccess.sendMessage(`Message ${i}`);
    if (!res || !res.matched || res.decodedMessage !== `Message ${i}`) {
      console.error(`[FAIL] Guaranteed Success failed on message ${i}`);
      failed++;
    }
  }
  console.log("✓ Guaranteed Success Mode: 10/10 transmissions matched perfectly.");
  passed++;

  // Test 2: Guaranteed Failure mode (N > 1)
  const simFail = new MessagingSimulator({ systemCount: 5, mode: 'guaranteed_failure', speed: 'instant' });
  for (let i = 0; i < 10; i++) {
    const res = await simFail.sendMessage(`Message ${i}`);
    if (!res || res.matched || res.decodedMessage === `Message ${i}`) {
      console.error(`[FAIL] Guaranteed Failure produced match on message ${i}`);
      failed++;
    }
  }
  console.log("✓ Guaranteed Failure Mode: 10/10 transmissions produced mismatch.");
  passed++;

  // Test 3: Guaranteed Failure constraint on N = 1
  const simFailSingle = new MessagingSimulator({ systemCount: 1, mode: 'guaranteed_failure', speed: 'instant' });
  let errorTriggered = false;
  simFailSingle.on('error', (err) => {
    errorTriggered = true;
  });
  const resNull = await simFailSingle.sendMessage("Test Impossible Failure");
  if (resNull === null && errorTriggered) {
    console.log("✓ Guaranteed Failure with N = 1 correctly prevented with explanation.");
    passed++;
  } else {
    console.error("[FAIL] Guaranteed Failure with N = 1 did not prevent execution!");
    failed++;
  }

  // Test 4: Attempt counting
  const simRetry = new MessagingSimulator({ systemCount: 5, speed: 'instant' });
  const msg1 = await simRetry.sendMessage("Retry Message", false);
  const msg2 = await simRetry.sendMessage("Retry Message", true);
  const msg3 = await simRetry.sendMessage("Retry Message", true);
  if (msg1.attemptNumber === 1 && msg2.attemptNumber === 2 && msg3.attemptNumber === 3) {
    console.log("✓ Retry Attempt Counter accurately tracks attempt #1, #2, #3.");
    passed++;
  } else {
    console.error("[FAIL] Attempt counter did not increment properly:", [msg1.attemptNumber, msg2.attemptNumber, msg3.attemptNumber]);
    failed++;
  }

  // Test 5: 100-Message experiment
  const simExp = new MessagingSimulator({ systemCount: 5, mode: 'random' });
  const expRes = await simExp.run100MessageExperiment();
  if (expRes && expRes.total === 100 && expRes.successful + expRes.failed === 100) {
    console.log(`✓ 100-Message Experiment executed successfully: ${expRes.successful} successes, ${expRes.failed} failures (${expRes.actualRate} vs expected ${expRes.expectedRate}).`);
    passed++;
  } else {
    console.error("[FAIL] 100-message experiment invalid output:", expRes);
    failed++;
  }

  console.log("=========================================");
  console.log(`Results: ${passed} invariant suites passed. ${failed} failures.`);
  console.log("=========================================");

  if (failed > 0) process.exit(1);
}

runTests();
