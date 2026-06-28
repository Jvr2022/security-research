---
id: CVE-XXXX-XXXXX            # or GHSA-xxxx
title: <short title>
target: <package / product>
ecosystem: <pip / npm / ...>
affected: <version range>
patched: <version>
cwe: CWE-XX
severity: <Low|Medium|High|Critical>
cvss: <vector string>
reporter: jvr2022
disclosed: <YYYY-MM-DD>
---

# <Title>

## Summary
One paragraph: what, where, who's affected, impact.

## Affected / Patched
- Affected: <range>
- Patched: <version>
- Default config affected? <yes/no + why>

## Root cause
The exact code path and why it's vulnerable.

## Details
Step-by-step technical explanation.

## Proof of concept
Reproduction environment + commands. Scripts in ./poc/.

## Impact
Confidentiality / integrity / availability; realistic worst case.

## Remediation
The fix, plus general guidance for the class.

## Timeline
- YYYY-MM-DD reported
- YYYY-MM-DD fix released
- YYYY-MM-DD public

## References
- Advisory, commit, CVE record.