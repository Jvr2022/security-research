#!/usr/bin/env node
// liquidjs Symlink Path Traversal Scanner (CVE-2026-35525)
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

  // Affected: <= 10.25.2
  if (major < 10) return true;
  if (major === 10) {
    if (minor < 25) return true;
    if (minor === 25 && patch <= 2) return true;
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

const dep = dependencies['liquidjs'];

if (dep) {
  if (isVulnerable(dep)) {
    console.log(`[VULNERABLE] Found liquidjs version ${dep} which is vulnerable to CVE-2026-35525.`);
    process.exit(1);
  } else {
    console.log(`[SAFE] Found liquidjs version ${dep}. Target is not vulnerable.`);
    process.exit(0);
  }
} else {
  console.log("[SAFE] liquidjs is not listed in package.json.");
  process.exit(0);
}
