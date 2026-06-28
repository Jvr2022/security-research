#!/usr/bin/env node
// OpenLearn Moderation Bypass Scanner
// Usage: node check.js <BASE_URL> <POST_ID>

const [,, BASE_URL, POST_ID] = process.argv;

if (!BASE_URL || !POST_ID) {
  console.log("Usage: node check.js <BASE_URL> <POST_ID>");
  process.exit(1);
}

async function run() {
  console.log(`[*] Attempting to read hidden post ${POST_ID} directly...`);
  const res = await fetch(`${BASE_URL}/api/posts/${POST_ID}`);
  
  if (res.status === 200) {
    const data = await res.json().catch(() => ({}));
    if (data && data.id === POST_ID) {
        console.log("[VULNERABLE] Successfully read the pending post by direct ID without authentication!");
        process.exit(1);
    }
  }
  
  console.log("[SAFE] Could not read the pending post directly.");
  process.exit(0);
}
run();
