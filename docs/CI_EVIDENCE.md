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

The original HTML Newman/Cucumber reports and Jest coverage are available from the `test-reports` artifact in the first run. Advanced Playwright/k6 results are available from `playwright-api-report` and `k6-smoke-results` artifacts in the second. A separate workflow step also generates **real browser screenshots of the actual CI-rendered reports** in a `real-ci-report-screenshots` artifact once that updated run succeeds; these screenshots must not be fabricated.

The k6 result reflects a small two-VU local smoke test, not a production load claim.
