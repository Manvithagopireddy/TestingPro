# TestingPro — Security audit evidence

## Audit scope (25 November 2026)

[Dependency and Repository Secret Audit #45643944511](https://github.com/Manvithagopireddy/TestingPro/actions/runs/45643944511) ran `npm audit`, `npm audit --omit=dev` and a full Git-history Gitleaks scan.

| Dependency scope | Moderate | High | Critical | Total |
|---|---:|---:|---:|---:|
| Runtime only | 1 | 1 | 0 | 2 |
| All dependencies, including development tools | 15 | 14 | 1 | 30 |

### Runtime vulnerabilities

- **body-parser** (high): a transitive dependency affected by [GHSA-27r3-jxmh-p828](https://github.com/advisories/GHSA-27r3-jxmh-p828); versions below 1.20.9 are affected.
- **qs** (moderate): a transitive dependency affected by [GHSA-6pq8-jhm2-2vcw](https://github.com/advisories/GHSA-6pq8-jhm2-2vcw); versions up to 6.16.0 are affected.

### Development dependencies

The wider tree includes a critical `handlebars` advisory from the Newman HTML reporting dependency chain; other advisories affect transitive Newman, Cucumber and related packages. Development-only risks are different from runtime exposure, but should still be addressed.

### Other checks

- **Gitleaks history scan:** CI job succeeded. This is not proof that no sensitive information exists anywhere.
- **CodeQL:** the [static analysis workflow](https://github.com/Manvithagopireddy/TestingPro/actions/runs/45643944369) succeeded. Check the repository Security tab for actual alerts; a successful workflow only confirms analysis completed.
- **Functional tests:** the [Jest, Cucumber, Newman and SQL workflow](https://github.com/Manvithagopireddy/TestingPro/actions/runs/45643148215) succeeded.

### Next security steps

See [issue #9](https://github.com/Manvithagopireddy/TestingPro/issues/9) for dependency remediation. Do not run `npm audit fix --force` without reviewing breaking changes. Refresh the lockfile, run every regression suite and re-audit. The API remains a local synthetic test fixture with hardcoded demo credentials; never deploy it publicly.
