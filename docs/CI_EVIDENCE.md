# Reproducible CI evidence

The numbers below come from completed GitHub Actions jobs on **25 November 2026**. They are snapshots of individual revisions, not permanent promises.

| Verification | Measured result | Evidence |
|---|---|---|
| Jest | 50 / 50 tests, 5 / 5 suites | [API Test Suite](https://github.com/Manvithagopireddy/TestingPro/actions/runs/45643148215) |
| Coverage | Statements 93.78%; branches 87.87%; functions 100%; lines 93.78% | [API Test Suite](https://github.com/Manvithagopireddy/TestingPro/actions/runs/45643148215) |
| Newman | 26 requests, 107 assertions, zero failures | [API Test Suite](https://github.com/Manvithagopireddy/TestingPro/actions/runs/45643148215) |
| Playwright | 4 API tests passed | [Advanced API Quality](https://github.com/Manvithagopireddy/TestingPro/actions/runs/45643944497) |
| k6 | 160 checks, 0 failed requests, p95 1.56 ms | [Advanced API Quality](https://github.com/Manvithagopireddy/TestingPro/actions/runs/45643944497) |
| ESLint | Rules passed | [Advanced API Quality](https://github.com/Manvithagopireddy/TestingPro/actions/runs/45643944497) |
| CodeQL | Analysis job succeeded (not equivalent to zero alerts) | [CodeQL run](https://github.com/Manvithagopireddy/TestingPro/actions/runs/45643944369) |
| Gitleaks | Git-history scanning job succeeded | [Security scan](https://github.com/Manvithagopireddy/TestingPro/actions/runs/45643944511) |
| npm audit | 2 runtime and 30 total dependency advisories | [Security audit](https://github.com/Manvithagopireddy/TestingPro/actions/runs/45643944511) |

The original HTML Newman/Cucumber reports and Jest coverage are available from the `test-reports` artifact in the first run. Advanced Playwright/k6 results are available from `playwright-api-report` and `k6-smoke-results` artifacts in the second. **Real report screenshots have been generated and uploaded:** download the `real-ci-report-screenshots` artifact from [Advanced API Quality run 45644309050](https://github.com/Manvithagopireddy/TestingPro/actions/runs/45644309050). It contains authentic screenshots of the Jest Istanbul coverage HTML and Playwright HTML reports, rendered during that same CI run.

The k6 result reflects a small two-VU local smoke test, not a production load claim.

## Dependency remediation evidence

[Verified npm lockfile regeneration and audits](https://github.com/Manvithagopireddy/TestingPro/actions/runs/45646931725): **0 runtime, 0 full-tree advisories** after replacing the vulnerable Newman reporter toolchain. The table above preserves historical Newman statistics and the earlier failed npm audit for transparency; those older numbers should not be interpreted as current dependency state.
