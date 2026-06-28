# Responsible Disclosure & Ethics

## Principles
- I only publish after a vendor fix, a coordinated disclosure deadline, or
  vendor consent.
- PoCs and scanners are intended for authorized testing only - systems you
  own or have explicit written permission to assess.
- Scanners in `scanners/` are detection-only and do not extract data or
  cause damage. Weaponized extraction lives in per-writeup `poc/` folders,
  published only post-fix.

## Reporting a vuln in my code/PoCs
Email security@jvr2022.tech (or open a private advisory). I aim to respond
within 72 hours.

## Timeline I follow when reporting to others
1. Private report to vendor (advisory / security contact).
2. 90-day coordinated disclosure window (negotiable for complex fixes).
3. Public writeup after fix ships or deadline passes.