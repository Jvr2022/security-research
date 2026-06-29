#!/usr/bin/env node
// CVE-2026-6556 check — @fastify/express <= 4.0.6
// Probes a target for path-scoped middleware bypass via array/regex mounts.
// Usage: node check.js <BASE_URL>
// Exit: 1 = vulnerable, 0 = safe, 2 = error

const BASE = process.argv[2];
if (!BASE) {
  console.log("Usage: node check.js <BASE_URL>");
  process.exit(2);
}

const PATHS = ["/admin/private", "/admin/settings", "/private", "/settings"];

(async () => {
  for (const p of PATHS) {
    const url = BASE.replace(/\/+$/, "") + p;
    try {
      const res = await fetch(url);
      const body = await res.text();
      if (res.status === 200 && /secret|admin|protected/i.test(body)) {
        console.log(`[VULNERABLE] ${url} middleware bypassed`);
        process.exit(1);
      }
    } catch (e) {
      console.log("[ERROR]", e.message);
      process.exit(2);
    }
  }
  console.log("[SAFE] no bypass detected");
  process.exit(0);
})();
