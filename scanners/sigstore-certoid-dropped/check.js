#!/usr/bin/env node
// Detection-only check for CVE-2026-48815. Builds a policy that requires a
// certificate OID and reports whether the installed sigstore keeps it (4.1.1+)
// or silently drops it (<= 4.1.0). Run from a project that has sigstore
// installed: node check.js
let createVerificationPolicy, version;
try {
  ({ createVerificationPolicy } = require("sigstore/dist/config"));
  version = require("sigstore/package.json").version;
} catch (e) {
  console.error("Could not load sigstore. Install it first: npm i sigstore");
  process.exit(2);
}

const REQUESTED_OID = "1.2.3.4";

const policy = createVerificationPolicy({
  certificateIssuer: "https://issuer.example",
  certificateIdentityEmail: "id@example.com",
  certificateOIDs: { [REQUESTED_OID]: "required-value" },
});

const oids = Array.isArray(policy.oids) ? policy.oids : [];
const enforced = oids.some((entry) => {
  const id = entry && entry.oid && entry.oid.id;
  return Array.isArray(id) ? id.join(".") === REQUESTED_OID : true;
});

console.log(`sigstore ${version}`);
if (enforced) {
  console.log("[not affected] certificateOIDs is carried into the policy.");
  process.exit(0);
}
console.log("[affected] certificateOIDs is dropped: upgrade to sigstore 4.1.1+.");
process.exit(1);