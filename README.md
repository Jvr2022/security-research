# Security Research

Public CVE writeups, reproducible proof-of-concepts, and reusable scanners
from my vulnerability research.

I'm Joshua van Rijswijk (`jvr2022`) - security researcher focused on web,
Android, and open-source software.

- Website: https://jvr2022.tech
- Vuln research: https://jvr2022.tech/vulns
- GitHub: https://github.com/Jvr2022

## Contents

| Area        | What's in it                                            |
|-------------|---------------------------------------------------------|
| `writeups/` | Per-finding technical writeups                          |
| `pocs/`     | Proof-of-concepts, one folder per finding               |
| `scanners/` | Detection-only checks for vuln classes                  |
| `tools/`    | Shared helpers (HTTP, encoding, blind-extraction oracle)|

## Disclosed findings

| ID             | Target              | Class            | Severity | Writeup |
|----------------|---------------------|------------------|----------|---------|
| CVE-2026-55509 | WsgiDAV (MySQL provider) | Blind SQLi (CWE-89) | High | [link](writeups/CVE-2026-55509-wsgidav-mysql-sqli) |
| CVE-2026-48815 | sigstore-js (npm) | Signature-verification bypass (CWE-347) | High | [link](writeups/CVE-2026-48815-sigstore-js-certoid-bypass) |

## Disclosure & ethics

Everything here is published **after** responsible disclosure and a fix
(or a coordinated deadline). PoCs are for testing systems you own or are
authorized to test. See [DISCLOSURE.md](DISCLOSURE.md).