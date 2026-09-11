/**
 * Automated Test Suite for 10 Algorithm Pairs
 * Section 26 & 27 of agent.md
 */

import { ALGORITHM_PAIRS, generateCorruptedOutput } from '../js/algorithms.js';

const TEST_INPUTS = [
  "Hello World!",
  "1234567890",
  "@#$%^&*()_+-=[]{}|;:,.<>/?`~",
  "Mixed CASE with Spaces and Punctuation!",
  "emoji 😀🚀 testing 🎉🔥",
  "Malayalam മലയാളം പരീക്ഷണം",
  "Line 1\nLine 2\nLine 3 with\ttabs",
  "A very long message demonstrating the resilience of the reversible paired encoder/decoder messaging pipeline across multi-sentence paragraphs."
];

let passed = 0;
let failed = 0;

console.log("=========================================");
console.log("Running Algorithm Reversibility Tests...");
console.log("=========================================");

for (const algo of ALGORITHM_PAIRS) {
  let pairSuccess = true;
  for (const input of TEST_INPUTS) {
    try {
      const encoded = algo.encode(input);
      const decoded = algo.decode(encoded);
      if (decoded !== input) {
        console.error(`[FAIL] System #${algo.id} (${algo.name}) on input: "${input.slice(0, 20)}..."`);
        console.error(`       Expected: "${input}"`);
        console.error(`       Got:      "${decoded}"`);
        pairSuccess = false;
        failed++;
        break;
      }
    } catch (err) {
      console.error(`[ERROR] System #${algo.id} (${algo.name}) threw error:`, err);
      pairSuccess = false;
      failed++;
      break;
    }
  }

  if (pairSuccess) {
    console.log(`✓ System #${algo.id.toString().padStart(2, '0')}: ${algo.name.padEnd(28)} - All inputs reversible`);
    passed++;
  }
}

console.log("\n=========================================");
console.log("Running Mismatch Non-Recovery Tests...");
console.log("=========================================");

let mismatchPassed = true;
for (let i = 0; i < ALGORITHM_PAIRS.length; i++) {
  const enc = ALGORITHM_PAIRS[i];
  const dec = ALGORITHM_PAIRS[(i + 1) % ALGORITHM_PAIRS.length]; // deliberate mismatch

  const plaintext = "Secret Message 12345";
  const payload = enc.encode(plaintext);
  const corrupted = generateCorruptedOutput(payload, enc, dec);

  if (corrupted === plaintext) {
    console.error(`[FAIL] Mismatch Enc #${enc.id} + Dec #${dec.id} silently recovered plaintext!`);
    mismatchPassed = false;
  }
}

if (mismatchPassed) {
  console.log("✓ All mismatched algorithm pairs produce corrupted output (no silent recovery).");
}

console.log("\n=========================================");
console.log(`Results: ${passed}/10 systems reversible. ${failed} failures.`);
console.log("=========================================");

if (failed > 0 || !mismatchPassed) {
  process.exit(1);
} else {
  console.log("All algorithm tests passed with 100% success!");
}
