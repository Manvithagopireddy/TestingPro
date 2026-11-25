# TestingPro — Security audit and remediation

## Verified resolution: 25 November 2026

The original [dependency audit](https://github.com/Manvithagopireddy/TestingPro/actions/runs/45643944511) reported **30 advisories across the full npm tree** (15 moderate, 14 high, 1 critical), including **2 in runtime dependencies** (1 moderate, 1 high).

After removing the vulnerable Newman/HTML reporter dependency chain, updating Cucumber and other tooling, avoiding affected Jest and nodemon dependency versions, and regenerating the lockfile using `npm install --package-lock-only` followed by compatible `npm audit fix`, the [remediation workflow](https://github.com/Manvithagopireddy/TestingPro/actions/runs/45646931725) passed:

| npm audit scope | Before | After | Verification |
|---|---:|---:|---|
| Runtime only | 2 | **0** | `npm audit --omit=dev --audit-level=moderate` |
| Full dependency tree | 30 | **0** | `npm audit --audit-level=moderate` |
| Critical advisories | 1 | **0** | Full audit |

The lockfile was regenerated and a clean `npm ci` completed successfully in the same GitHub Actions run.

### What changed

- Removed `newman` and `newman-reporter-htmlextra`, which were the main source of unpatched development-tool advisories.
- Retained `tests/TaskManagerAPI.postman_collection.json` for manual Postman use; the Newman runner is no longer part of CI.
- Added Playwright API regression checks for authentication, CRUD, invalid IDs, invalid input and SQL injection resilience. Playwright does not claim one-for-one parity with every historical Newman assertion.
- Upgraded `@cucumber/cucumber` to a currently patched release and refreshed other development tooling.
- Kept Jest on a tested version with a clean npm audit after newer transitive dependencies triggered moderate advisories.
- Replaced nodemon with Node.js 22's built-in watch mode for local development.
- Regenerated `package-lock.json` in GitHub Actions and committed it to the review branch.

### Other security checks

The previous [Gitleaks Git-history scan](https://github.com/Manvithagopireddy/TestingPro/actions/runs/45643944511) succeeded, and [CodeQL static analysis](https://github.com/Manvithagopireddy/TestingPro/actions/runs/45643944369) completed. These tools are not penetration tests and do not prove the absence of all vulnerabilities.

### Verification and limitations

The zero-advisory result applies to the lockfile in the remediation branch at the linked audit revision and to advisories known to the npm advisory service at that time. Check the fresh post-merge workflow before asserting that the default branch is clean.

This project remains a synthetic local demonstration with shared test credentials. It must **not** be exposed publicly as an authentication service. Dependency remediation does not make the application production-ready.

Track the original finding and resolution at [issue #9](https://github.com/Manvithagopireddy/TestingPro/issues/9).
