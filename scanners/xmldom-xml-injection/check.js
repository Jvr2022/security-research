#!/usr/bin/env node
// xmldom XML Injection Scanner (CVE-2026-41672)
// Usage: node check.js (Run inside the project directory)

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(process.cwd(), 'package.json');

function isVulnerable(versionString) {
  // Extract base version from string like "^0.8.12" or "~0.9.0"
  const cleanVersion = versionString.replace(/^[^\d]+/, '');
  if (!cleanVersion) return false;
  
  const parts = cleanVersion.split('.');
  const major = parseInt(parts[0] || '0', 10);
  const minor = parseInt(parts[1] || '0', 10);
  const patch = parseInt(parts[2] || '0', 10);

  // Vulnerable ranges: < 0.8.13 and >= 0.9.0, < 0.9.10
  if (major === 0) {
    if (minor === 8 && patch < 13) return true;
    if (minor === 9 && patch < 10) return true;
    if (minor < 8) return true;
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

const xmldomDep = dependencies['xmldom'] || dependencies['@xmldom/xmldom'];

if (xmldomDep) {
  if (isVulnerable(xmldomDep)) {
    console.log(`[VULNERABLE] Found @xmldom/xmldom version ${xmldomDep} which is vulnerable to CVE-2026-41672 (XML Injection).`);
    process.exit(1);
  } else {
    console.log(`[SAFE] Found @xmldom/xmldom version ${xmldomDep}. Target is not vulnerable.`);
    process.exit(0);
  }
} else {
  console.log("[SAFE] @xmldom/xmldom is not listed in package.json.");
  process.exit(0);
}
