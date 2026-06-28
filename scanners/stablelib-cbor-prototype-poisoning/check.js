#!/usr/bin/env node
// @stablelib/cbor Prototype Poisoning Scanner (GHSA-w48f-fwg7-ww6p)
// Usage: node check.js (Run inside the project directory)

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(process.cwd(), 'package.json');

function isVulnerable(versionString) {
  const cleanVersion = versionString.replace(/^[^\d]+/, '');
  if (!cleanVersion) return false;
  
  const parts = cleanVersion.split('.');
  const major = parseInt(parts[0] || '0', 10);
  const minor = parseInt(parts[1] || '0', 10);
  const patch = parseInt(parts[2] || '0', 10);

  // Affected: <= 2.0.1
  if (major < 2) return true;
  if (major === 2) {
    if (minor === 0 && patch <= 1) return true;
  }
  
  return false;
}

if (!fs.existsSync(packageJsonPath)) {
  console.log("[ERROR] Could not find package.json in the current directory.");
  process.exit(2);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const dependencies = {
  ...(packageJson.dependencies || {}),
  ...(packageJson.devDependencies || {}),
  ...(packageJson.peerDependencies || {})
};

const dep = dependencies['@stablelib/cbor'];

if (dep) {
  if (isVulnerable(dep)) {
    console.log(`[VULNERABLE] Found @stablelib/cbor version ${dep} which is vulnerable to GHSA-w48f-fwg7-ww6p (Prototype Poisoning).`);
    process.exit(1);
  } else {
    console.log(`[SAFE] Found @stablelib/cbor version ${dep}. Target is not vulnerable.`);
    process.exit(0);
  }
} else {
  console.log("[SAFE] @stablelib/cbor is not listed in package.json.");
  process.exit(0);
}
