---
id: GHSA-w48f-fwg7-ww6p
title: Prototype poisoning via `__proto__` map keys in CBOR decoding
target: "@stablelib/cbor"
ecosystem: npm
affected: <= 2.0.1
patched: 2.0.4
cwe: CWE-1321
severity: High
cvss: "CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:N/VC:N/VI:H/VA:N/SC:N/SI:H/SA:N"
reporter: jvr2022
disclosed: "2026-04-02"
---

# Prototype poisoning via `__proto__` map keys in CBOR decoding

## Summary
The `@stablelib/cbor` package decodes CBOR maps into ordinary JavaScript objects and assigns attacker-controlled keys directly using bracket notation (`obj[key] = value`). If an attacker provides a CBOR map containing the key `__proto__`, the JavaScript engine invokes the built-in `__proto__` setter instead of creating a standard data property. This poisons the prototype of the decoded object, replacing it entirely with attacker-supplied data.

## Affected / Patched
- **Affected:** `<= 2.0.1`
- **Patched:** `2.0.4`

## Root cause
When decoding a CBOR map, the library instantiates an empty object (`{}`) and iterates through the map entries, assigning them directly:
```javascript
let result = {};
// ... loop through entries ...
result[key] = value;
```
In JavaScript, assigning an object to the `__proto__` property of an Object instance mutates its prototype chain. By crafting a CBOR payload where the key is exactly the string `"__proto__"` and the value is a map, the decoder unknowingly replaces the object's prototype. 

## Details
This is a form of Prototype Poisoning (often conflated with Prototype Pollution, though here it strictly poisons the local decoded object rather than `Object.prototype`). If the decoded object is passed downstream, any application logic that uses `in` checks or simple property lookups (like `obj.isAdmin`) will observe the inherited malicious properties instead of realizing they exist on the prototype. If the object is later merged into other objects, the malicious properties might spread globally.

## Proof of concept
A local Node.js PoC script demonstrating the prototype modification is located under [pocs/](../../pocs/GHSA-w48f-fwg7-ww6p-stablelib-cbor-prototype-poisoning/), and a local dependency scanner is under [scanners/](../../scanners/stablelib-cbor-prototype-poisoning/).

### Usage
Run the PoC to decode a maliciously crafted CBOR payload and observe the prototype being poisoned:
```bash
node poc.js
```

Run the local scanner inside your project directory to safely check your installed `@stablelib/cbor` version:
```bash
node check.js
```

## Impact
Applications that decode untrusted CBOR into JavaScript objects can receive objects with attacker-controlled prototypes. This can be used to corrupt configuration objects, bypass authorization checks (e.g., inheriting `isAdmin: true`), alter feature flags, and break application logic that relies on typical object shape assumptions.

## Remediation
- Upgrade to `@stablelib/cbor` version `2.0.4` or later.
- As a general defense-in-depth, consider using `Object.create(null)` when deserializing key-value pairs into dictionary objects to prevent prototype-related issues entirely.

## References
- Advisory: GHSA-w48f-fwg7-ww6p
- Weakness: CWE-1321 (Improperly Controlled Modification of Object Prototype Attributes)
