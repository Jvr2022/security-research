#!/usr/bin/env node
// Quarkus OpenAPI Generator Credential Leak Scanner (CVE-2026-42333)
// Usage: node check.js (Run inside the project directory)

const fs = require('fs');
const path = require('path');

const pomPath = path.join(process.cwd(), 'pom.xml');
const gradlePath = path.join(process.cwd(), 'build.gradle');

function checkVersion(version) {
  // Vulnerable versions: < 2.16.0, < 2.15.0-lts
  // We'll do a simple semantic version check for the most common vulnerable ranges
  if (!version) return false;
  
  // Clean up property interpolations if they weren't resolved (simple check)
  if (version.startsWith('$')) return "unknown";

  const parts = version.split(/[-.]/);
  const major = parseInt(parts[0], 10);
  const minor = parseInt(parts[1], 10);

  if (major < 2) return true;
  if (major === 2) {
    if (minor < 16 && minor !== 11) return true;
    if (minor === 11 && parts[2] && parseInt(parts[2], 10) < 1) return true; // < 2.11.1
    if (minor === 15 && version.includes('lts')) return true; // < 2.15.0-lts (not typically a thing, but per advisory)
    if (minor === 16 && version.includes('lts')) return false; // >= 2.16.0-lts are safe
  }
  
  return false;
}

if (fs.existsSync(pomPath)) {
  const content = fs.readFileSync(pomPath, 'utf8');
  
  // Basic regex to find quarkus-openapi-generator dependency and its version
  const generatorRegex = /<artifactId>quarkus-openapi-generator<\/artifactId>[\s\S]*?<version>(.*?)<\/version>/;
  const match = content.match(generatorRegex);
  
  if (match && match[1]) {
    const version = match[1].trim();
    const isVuln = checkVersion(version);
    
    if (isVuln === true) {
      console.log(`[VULNERABLE] Found quarkus-openapi-generator version ${version} in pom.xml, which is vulnerable to CVE-2026-42333.`);
      process.exit(1);
    } else if (isVuln === false) {
      console.log(`[SAFE] Found quarkus-openapi-generator version ${version} in pom.xml. Target is not vulnerable.`);
      process.exit(0);
    } else {
      console.log(`[WARNING] Found quarkus-openapi-generator but version (${version}) relies on a property. Please verify it is >= 2.16.0 or >= 2.16.0-lts.`);
      process.exit(0);
    }
  } else {
    console.log("[SAFE] quarkus-openapi-generator not found in pom.xml.");
    process.exit(0);
  }
} else if (fs.existsSync(gradlePath)) {
  const content = fs.readFileSync(gradlePath, 'utf8');
  const generatorRegex = /quarkus-openapi-generator:([^"'\s]+)/;
  const match = content.match(generatorRegex);
  
  if (match && match[1]) {
    const version = match[1].trim();
    const isVuln = checkVersion(version);
    
    if (isVuln === true) {
      console.log(`[VULNERABLE] Found quarkus-openapi-generator version ${version} in build.gradle, which is vulnerable to CVE-2026-42333.`);
      process.exit(1);
    } else {
      console.log(`[SAFE] Found quarkus-openapi-generator version ${version} in build.gradle. Target is not vulnerable.`);
      process.exit(0);
    }
  } else {
    console.log("[SAFE] quarkus-openapi-generator not found in build.gradle.");
    process.exit(0);
  }
} else {
  console.log("[ERROR] Could not find pom.xml or build.gradle. Ensure you run this inside the Java project directory.");
  process.exit(2);
}
