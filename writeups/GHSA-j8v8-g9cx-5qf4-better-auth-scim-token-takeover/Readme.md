---
id: GHSA-j8v8-g9cx-5qf4
title: Account/provider takeover via missing owner binding on non-org SCIM providers in @better-auth/scim
target: better-auth (@better-auth/scim)
ecosystem: npm
affected: >= 1.5.0, < 1.7.0-beta.4
patched: 1.7.0-beta.4
cwe: CWE-862, CWE-639
severity: High
cvss: CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:L
reporter: jvr2022
disclosed: 2026-05-22
---

# Account/provider takeover via missing owner binding on non-org SCIM providers in @better-auth/scim

## Summary
better-auth's SCIM plugin does not bind personal, non-organization SCIM providers to their creator in the default configuration. Any authenticated user can manage another user's personal provider connection, including reading its metadata, listing connections, or regenerating its SCIM bearer token. I confirmed this by logging into a local instance with two sessions, generating a SCIM token as Alice, and then using Bob's session to successfully regenerate Alice's token and hijack the connection.

## Affected / Patched
- Affected: @better-auth/scim 1.5.0 and later, up to 1.7.0-beta.3.
- Patched: 1.7.0-beta.4 (and 1.7.0).
- Default config affected? Yes, personal providers are ownerless by default.

## Root cause
The plugin tracks provider ownership using an opt-in `providerOwnership` option and a `scimProvider.userId` column, both disabled by default. When ownership is disabled, a personal provider is created without a `userId`. The access check only denies access if a stored owner ID exists and differs from the caller:
```typescript
} else if (provider.userId && provider.userId !== userId) {
  throw new APIError("FORBIDDEN", { message: "You must be the owner to access this provider" });
}
```
Because the default row has no `userId`, the condition evaluates to false and any authenticated user gains full access.

## Details
An attacker can call `POST /scim/generate-token` with another user's `providerId`. The server passes the ownerless access check, deletes the existing token row, creates a new one, and returns a valid SCIM bearer token to the attacker. The original user's token is immediately invalidated.

## Proof of concept
A Node.js script showing token takeover is under [pocs/](../../pocs/GHSA-j8v8-g9cx-5qf4-better-auth-scim-token-takeover/), and a network scanner is located under [scanners/](../../scanners/better-auth-scim-ownership/).

### Usage
Run either the PoC or the Scanner against a target URL to verify the vulnerability:
```bash
node poc.js <BASE_URL> <ALICE_TOKEN> <BOB_TOKEN> [PROVIDER_ID]
# or
node check.js <BASE_URL> <ALICE_TOKEN> <BOB_TOKEN> [PROVIDER_ID]
```

## Impact
This is a provider takeover problem. An attacker can hijack another user's personal SCIM connection, read its metadata, rotate its token, and access SCIM user-provisioning routes.

## Remediation
- Upgrade to @better-auth/scim 1.7.0-beta.4 or later, which makes owner binding mandatory.
- Workaround: Set `providerOwnership: { enabled: true }` and run schema migrations, or ensure every SCIM provider is scoped to an organization.

## Timeline
- May 22 2026: reported privately to the maintainers.
- May 22 2026: report accepted, credited, and advisory published.

## References
- Advisory: GHSA-j8v8-g9cx-5qf4
- Weaknesses: CWE-862 (Missing Authorization), CWE-639 (Authorization Bypass)
