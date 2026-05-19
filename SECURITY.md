# Security Policy

## Reporting a Vulnerability

Please **do not** open public GitHub issues for security problems.

Report suspected vulnerabilities privately via GitHub Security Advisories
(`Security` tab → `Report a vulnerability`) or by email to the repository
maintainers. Include:

- A description of the issue and its impact.
- Steps to reproduce (PoC, affected route, payload).
- Suggested fix if you have one.

You can expect an initial response within **5 business days**. Fixes for
confirmed issues are shipped in the next patch release; coordinated
disclosure timelines are negotiated per case.

## Supported Versions

Only the `main` branch and the latest tagged release receive security fixes.

## Scope

In scope:

- Code in this repository (`src/`, `proxy.ts`, middleware, server actions).
- Default security headers, CSP, rate-limit, cookie defaults.

Out of scope:

- Third-party services you integrate with (Sentry, analytics, CDN, etc.).
- Social engineering, physical attacks, denial of service via volumetric
  traffic.
