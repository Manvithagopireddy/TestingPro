# TestingPro — Quality verification guide

## Existing quality gate

```bash
npm ci
npm run seed
npm run test:coverage
```

The existing CI runs Jest, Cucumber, Newman and SQLite validation.

## Optional Playwright API tests

These tests use the **APIRequestContext only**, so no browser binaries are needed. Playwright is installed reproducibly from the committed lockfile; no browser binaries are needed for API-only tests.

```bash
npm ci
# Playwright is included in the lockfile
npm run seed
npm start
# New terminal
npm run test:playwright
```

## k6 smoke load testing

Start the API locally; install k6 using the official k6 installation instructions, then run:

```bash
k6 run --summary-export=reports/k6-summary.json performance/smoke.js
```

The smoke test uses two virtual users for ten seconds and should **not** be interpreted as a high-scale production benchmark.

## ESLint and Prettier

```bash
npm ci
# ESLint and Prettier are installed by npm ci
npm run lint
npm run format:check
# For full-repository formatting (not yet a required CI gate): npx prettier --check .
# To format edited files:
npx prettier --write path/to/file.js
```

The formatter is configured but entire-repository formatting is intentionally not enforced until existing files have been normalized.

## Evidence and security

- Download actual reports from the GitHub Actions workflow artifacts; **do not infer test success from README badges alone**.
- Dedicated workflows check dependency advisories, commit-history secrets, and CodeQL static analysis.
- Security workflows may fail on real findings. Treat red checks as investigation tasks, not as cosmetic failures to hide.
- `docs/openapi.yaml` documents API contracts and sample responses.
- A local Docker configuration exists exclusively for reproducible demonstration.
