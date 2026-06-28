# Contributing / Standards

## Adding a finding
1. Copy `templates/writeup-template.md` to
   `writeups/<CVE-or-GHSA>-<slug>/README.md`.
2. Put runnable PoCs under that folder's `poc/`.
3. Add a row to the README index table.
4. If the class is detectable safely, add a detector under `scanners/`.

## Commit style (Conventional Commits)
- `feat: add CVE-2026-55509 wsgidav sqli writeup`
- `docs: clarify oracle behavior`
- `fix: correct dump.py boundary condition`

## PoC requirements
- Self-contained, documented setup (target version, install, config).
- No live third-party targets - use local/Docker reproduction.
- Pin versions where possible.