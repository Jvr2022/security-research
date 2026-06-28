---
id: GHSA-5jg4-p4qw-cgfr
title: Stack exhaustion denial of service via deeply nested CBOR arrays, maps, or tags
target: "@stablelib/cbor"
ecosystem: npm
affected: <= 2.0.1
patched: 2.0.4
cwe: CWE-674
severity: Low
cvss: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L"
reporter: jvr2022
disclosed: "2026-04-02"
---

# Stack exhaustion denial of service via deeply nested CBOR arrays, maps, or tags

## Summary
The `@stablelib/cbor` package decodes nested CBOR structures using recursive function calls without enforcing a maximum depth limit. If an attacker supplies a deeply nested CBOR payload, they can force the decoder to recurse until the JavaScript engine's call stack is exhausted. This crashes the decoding process with a `RangeError: Maximum call stack size exceeded`.

## Affected / Patched
- **Affected:** `<= 2.0.1`
- **Patched:** `2.0.4`

## Root cause
In the decoding phase, processing arrays, maps, and tagged values triggers a recursive descent. Each nested structure consumes an additional JavaScript call stack frame. Because the decoder has no depth limit, no iterative fallback, and no protection against pathological nesting, supplying a payload with thousands of nested containers inevitably depletes the finite call stack limit of the JavaScript runtime.

## Details
This bug does not require authentication or valid inner data, only a correctly formatted outer shell of nested arrays/maps. The payload required to trigger this vulnerability is exceedingly small (a few kilobytes of `0x81` array-start bytes followed by a null terminator), making it highly efficient for an attacker to send.

## Proof of concept
A local Node.js PoC script demonstrating the crash is located under [pocs/](../../pocs/GHSA-5jg4-p4qw-cgfr-stablelib-cbor-dos/), and a local dependency scanner is under [scanners/](../../scanners/stablelib-cbor-dos/).

### Usage
Run the PoC to dynamically generate the malicious payload and observe the decoder crashing:
```bash
node poc.js
```

Run the local scanner inside your project directory to safely check your installed `@stablelib/cbor` version:
```bash
node check.js
```

## Impact
Any application that decodes attacker-controlled CBOR payloads can be subjected to a reliable denial of service. The immediate result is an uncaught exception during decoding. If the application or framework does not safely catch standard exception types, this can result in the termination of the worker or the entire Node.js process.

## Remediation
- Upgrade to `@stablelib/cbor` version `2.0.4` or later.
- The patched version introduces a default maximum depth limit of 128 (configurable via the `maxDepth` option) and will safely throw a catchable `CBORMaxDepthExceededError` instead of overflowing the stack.

## References
- Advisory: GHSA-5jg4-p4qw-cgfr
- Weakness: CWE-674 (Uncontrolled Recursion)
