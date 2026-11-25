# REST API Testing & Validation Framework

> **QA/SDET Portfolio Project** — A local demonstration API testing framework demonstrating functional, negative, boundary, and auth testing with automated CI/CD.

[![API Tests](https://github.com/Manvithagopireddy/TestingPro/actions/workflows/api-tests.yml/badge.svg)](https://github.com/Manvithagopireddy/TestingPro/actions/workflows/api-tests.yml)

---

## 📋 Project Overview

This project demonstrates professional QA/SDET skills by building **both** the system under test and a comprehensive test suite around it:

- **Part 1** — A real Node.js REST API (Task Manager) with JWT auth, input validation, and SQLite persistence
- **Part 2** — A Postman collection with test assertions across 4 test categories
- **Part 3** — A SQL validation script that directly queries the database to independently verify API operations
- **Part 4** — A GitHub Actions CI pipeline that runs the full suite on every push
- **Part 5** — This documentation

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **API Runtime** | Node.js 20 + Express 4 |
| **Database** | SQLite via `sql.js` (file-persisted, pure WebAssembly, zero native compilation) |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) |
| **Collection Test Runner** | Newman (Postman CLI) |
| **Test Collection** | Postman Collection Format v2.1 |
| **Programmatic Test Suite** | Jest + Supertest (In-memory HTTP testing, coverage reporting) |
| **BDD Specification Framework** | Cucumber.js (Executable Gherkin specifications, tag filtering) |
| **Manual QA & Living Specs** | Structured Gherkin Scenarios + Manual QA Test Matrix |
| **HTML Reports** | `newman-reporter-htmlextra` & Cucumber Built-in HTML Reporter |
| **CI/CD** | GitHub Actions |

---

## 📁 Project Structure

```
rest-api-testing-framework/
├── .github/
│   └── workflows/
│       └── api-tests.yml          # GitHub Actions CI pipeline
├── src/
│   ├── app.js                     # Express app (routes, middleware)
│   ├── server.js                  # HTTP server entry point
│   ├── config.js                  # JWT secret, port, test credentials
│   ├── db.js                      # SQLite connection + schema init
│   ├── middleware/
│   │   └── auth.js                # JWT Bearer token verification
│   └── routes/
│       ├── auth.js                # POST /auth/login
│       └── tasks.js               # CRUD /tasks endpoints
├── scripts/
│   ├── seed.js                    # Reset DB to known test data
│   └── sql-validation.js          # Direct DB verification script
├── tests/
│   ├── cucumber/                  # BDD Cucumber test suite
│   │   ├── features/              # Executable Gherkin specifications (.feature)
│   │   │   ├── auth.feature       # @functional @regression @smoke @auth
│   │   │   ├── tasks_crud.feature # @functional @regression @smoke @crud
│   │   │   ├── tasks_validation.feature # @functional @regression @negative
│   │   │   ├── security.feature   # @regression @security
│   │   │   └── manual_scenarios.feature # @manual living specifications
│   │   ├── step_definitions/      # Step implementation mapping Gherkin to API calls
│   │   └── support/               # World context and clean test DB hooks
│   ├── manual/
│   │   └── MANUAL_TEST_SUITE.md   # Comprehensive QA Manual Matrix & Checklists
│   ├── jest/                      # Programmatic integration test suite
│   │   ├── helpers.js             # Test DB initialization & token helpers
│   │   ├── auth.test.js           # Auth & health test specifications
│   │   ├── tasks.crud.test.js     # CRUD lifecycle & persistence tests
│   │   ├── validation.test.js     # 400 validation & boundary tests
│   │   └── security.test.js       # JWT guards & SQLi resilience tests
│   ├── TaskManagerAPI.postman_collection.json   # Full Postman collection
│   └── TaskManager.postman_environment.json     # Environment variables
├── reports/                       # Newman & Cucumber HTML reports (gitignored)
├── coverage/                      # Jest code coverage reports (gitignored)
├── cucumber.json                  # Cucumber profile configuration
├── jest.config.js                 # Jest test runner configuration
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Quick Start — Run the API Locally

### Prerequisites
- [Node.js 20+](https://nodejs.org/) installed
- No database or external service setup required

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/Manvithagopireddy/TestingPro.git
cd TestingPro

# 2. Install all dependencies
npm ci

# 3. Seed the database with known test data
npm run seed

# 4. Start the API server
npm start
```

The API will be running at **http://localhost:3000**

#### Verify it's working:
```bash
curl http://localhost:3000/health
# → {"status":"OK","timestamp":"..."}
```

### API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| `POST` | `/auth/login` | ❌ | Get a JWT token |
| `GET` | `/health` | ❌ | Health check |
| `POST` | `/tasks` | ✅ | Create a task |
| `GET` | `/tasks` | ✅ | Get all tasks |
| `GET` | `/tasks/:id` | ✅ | Get task by ID |
| `PUT` | `/tasks/:id` | ✅ | Update a task |
| `DELETE` | `/tasks/:id` | ✅ | Delete a task |

### Example API Usage

```bash
# Login and capture token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}' \
  | node -e "process.stdin|require('stream').pipeline(process.stdin,new require('stream').Transform({transform(c,_,cb){cb(null,JSON.parse(c).token+'\n')}}),process.stdout)")

# Create a task
curl -X POST http://localhost:3000/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Task","description":"Do something","status":"pending"}'

# Get all tasks
curl http://localhost:3000/tasks \
  -H "Authorization: Bearer $TOKEN"
```

**Test credentials:** `testuser` / `password123`

---

## 🧪 Running Tests Locally

### Option 1 — Newman CLI (recommended)

```bash
# Install dependencies (includes Newman)
npm ci

# Seed the DB, run the full collection, generate HTML report
npm test
```

The HTML report will be generated at `reports/test-report.html`.

### Option 2 — Postman Desktop

1. Open Postman
2. **Import** → select `tests/TaskManagerAPI.postman_collection.json`
3. **Import** → select `tests/TaskManager.postman_environment.json`
4. Select the **"Task Manager — Local"** environment from the dropdown
5. Open the collection and click **"Run collection"**

> ⚠️ **Important:** Run `npm run seed` before each test run to reset the database to known state. The positive tests rely on seed data (e.g., task with id=1 titled "Write unit tests").

### Option 3 — SQL Validation Only

```bash
# Start the API first (it must be running)
npm start

# In a second terminal, run the direct DB validator
npm run validate:db
```

---

## ⚙️ How CI Works

The GitHub Actions workflow (`.github/workflows/api-tests.yml`) runs automatically on every push to `main` or `develop` and on every pull request.

### Pipeline Steps

```
1. Checkout code
2. Set up Node.js 20
3. npm ci  (clean install)
4. Seed the SQLite database
5. Start the API server in background
6. Wait for /health to return 200 (up to 30 retries)
7. Run Newman → generates HTML report
8. Run SQL validation script
9. Upload HTML report as a build artifact (retained 30 days)
10. Stop the API server
```

If **any step fails**, the build is marked ❌ and subsequent steps are skipped (except the report upload, which always runs so you can investigate failures).

### Viewing Reports

After a CI run, navigate to:
**GitHub → Actions → [workflow run] → Artifacts → `newman-html-report`**

---

## 📊 Test Coverage Summary

### By the Numbers

| Metric | Count |
|--------|------:|
| Total requests | 22 |
| Total test assertions | 65+ |
| Test folders | 4 |
| SQL validation checks | 18 |

### Test Categories

#### 🔐 Auth Tests (3 requests, 13 assertions)
- ✅ Login with valid credentials → 200 + JWT token
- ✅ Token auto-captured into environment variable
- ✅ Login with invalid credentials → 401
- ✅ Login with missing fields → 400

#### ✅ Positive / Functional Tests (6 requests, 30 assertions)
| Test | Status Code | Assertions |
|------|:-----------:|:----------:|
| Create task | 201 | Schema, title, status, id, createdAt |
| Get all tasks | 200 | Schema, array, count field, field keys |
| Get task by ID | 200 | Schema, id match, title match, enum |
| Update task | 200 | Schema, status updated, id match, message |
| Delete task | 200 | Schema, message, deletedTask body |
| Health check | 200 | status=OK, timestamp present |

#### ❌ Negative Tests (9 requests, 22+ assertions)
| Test | Expected Code |
|------|:------------:|
| Create task — missing `title` | 400 |
| Create task — empty body `{}` | 400 |
| GET non-existent task id | 404 |
| PUT non-existent task id | 404 |
| DELETE non-existent task id | 404 |
| GET /tasks — no auth token | 401 |
| GET /tasks — invalid token | 401 |
| GET /tasks — expired token | 401 |
| GET unknown route | 404 |

#### 🔬 Boundary Tests (8 requests, 16+ assertions)
| Test | Expected Code |
|------|:------------:|
| Title > 500 chars | 400 |
| Title = exactly 500 chars | 201 |
| Empty string `""` title | 400 |
| Whitespace-only `"   "` title | 400 |
| Invalid status enum on create | 400 |
| Invalid status enum on update | 400 |
| Non-numeric task ID | 400 |
| Boundary task cleanup | 200/404 |

#### 🗃️ SQL Validation (direct DB checks)
- Seed data integrity (3 checks)
- Create → row exists with correct values (6 checks)
- Update → changed values persisted (3 checks)
- Delete → row removed (1 check)
- Seed rows unaffected by operations (1 check)
- Boundary: 500-char title stored correctly (2 checks)

---

## 🔧 npm Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| `npm start` | `node src/server.js` | Start the API server |
| `npm run dev` | `nodemon src/server.js` | Start with auto-reload |
| `npm run seed` | `node scripts/seed.js` | Reset DB to seed data |
| `npm test` | seed + Newman | Run full Postman/Newman test suite (107 assertions) |
| `npm run test:jest` | `jest --runInBand` | Run Jest + Supertest test suite (37 tests) |
| `npm run test:coverage` | `jest --coverage --runInBand` | Run Jest tests and generate code coverage report |
| `npm run test:cucumber` | `cucumber-js` | Run all automated Cucumber BDD scenarios (32 scenarios) |
| `npm run test:cucumber:functional` | `cucumber-js --tags "@functional..."` | Run only functional BDD scenarios (25 scenarios) |
| `npm run test:cucumber:regression` | `cucumber-js --tags "@regression..."` | Run full automated BDD regression suite (32 scenarios) |
| `npm run test:cucumber:smoke` | `cucumber-js --tags "@smoke..."` | Run fast sanity/smoke BDD checks (4 scenarios) |
| `npm run test:cucumber:manual` | `cucumber-js --tags "@manual" --dry-run` | Inspect all manual & exploratory Gherkin scenarios |
| `npm run test:cucumber:html` | `cucumber-js --format html:...` | Run BDD suite and generate standalone HTML report |
| `npm run test:ci` | seed + Newman + SQL | Full Postman CI test run |
| `npm run test:all` | seed + Newman + Jest + Cucumber + SQL | Run all test layers end-to-end |
| `npm run validate:db` | `node scripts/sql-validation.js` | Direct SQL validation against database |

---

## 🥒 BDD & Cucumber: Functional, Regression & Manual Testing

This framework integrates Behavior-Driven Development (BDD) via Cucumber.js to bridge business requirements, automated execution, and manual QA workflows:

```gherkin
@functional @regression @crud
Scenario: Create a new task with default pending status
  Given I am authenticated with valid credentials
  When I send a POST request to "/tasks" with:
    | title       | Implement BDD Feature Files |
    | description | Write Gherkin tests for API |
  Then the response status code should be 201
  And the response body should contain the created task
  And the created task status should be "pending"
```

### 1. Functional Testing (`@functional`)
Validates individual user stories, API contracts, status transitions, boundary rules, and error handling across endpoints. Run with:
```bash
npm run test:cucumber:functional
```

### 2. Regression Testing (`@regression`)
Executes the full suite of automated scenarios across auth, CRUD, validation, and security layers to verify that new code additions do not break existing functionality. Run with:
```bash
npm run test:cucumber:regression
```

### 3. Manual Testing (`@manual` & Manual QA Matrix)
- **Living Documentation:** Gherkin scenarios serve as clear, non-technical test procedures for manual testers.
- **Manual QA Matrix:** Check out [`tests/manual/MANUAL_TEST_SUITE.md`](file:///c:/TestingPro/tests/manual/MANUAL_TEST_SUITE.md) for a complete QA matrix featuring Test Case IDs (`TC-AUTH-001` through `TC-SEC-005`), preconditions, steps, test data, and pass/fail checklists.
- **Dry-Run Inspection:** Review manual test scenarios via CLI:
```bash
npm run test:cucumber:manual
```

### 4. Standalone HTML Reporting
Generate an interactive, rich HTML test execution report:
```bash
npm run test:cucumber:html
```
Report saved to: `reports/cucumber-report.html`.


---

## 🏗️ Design Decisions

- **`sql.js` (WebAssembly SQLite)** — Zero native C++ build dependencies, 100% cross-platform (Windows/Linux/macOS CI), file-persisted on disk via `tasks.db`, zero external database setup required
- **Hardcoded test credentials** — Intentional for a demo; the `src/config.js` is the single place to change them
- **Seed before every run** — Ensures deterministic test results regardless of previous test runs
- **`pm.collectionVariables.set` + `pm.environment.set`** — Dual-setting the auth token ensures it works both in desktop Postman and in Newman CLI
- **`--bail` flag in Newman** — Stops the run on first failure in CI for faster feedback

---

## 📝 License

MIT — free to use as a portfolio reference or starting point.

## Reviewing test evidence

Use the linked GitHub Actions workflow for current execution status. Reproduce the documented suites locally and inspect generated reports; historical coverage or assertion counts are not guarantees of current results.

## Quality gates and deployment scope

Jest enforces minimum coverage of 80% for statements, functions and lines, and 75% for branches. CI uploads coverage alongside HTML reports. The demo API binds to loopback by default and is intentionally not a production authentication service. Latest results are available in [Actions](https://github.com/Manvithagopireddy/TestingPro/actions).
