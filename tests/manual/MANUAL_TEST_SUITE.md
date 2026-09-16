# Task Manager REST API — Manual QA Test Suite & Regression Matrix

> **Target System:** Task Manager REST API (`http://localhost:3000` / In-Memory App)  
> **Testing Level:** Functional, Boundary, Security, and Regression  
> **Auth Scheme:** JWT Bearer Token (`/auth/login`)  
> **Format:** Gherkin-aligned Step-by-Step Manual Test Cases  

---

## 📋 1. Test Execution Overview

This manual test suite provides structured test cases for QA engineers to validate API functionality, verify edge cases, and execute manual regression runs before major releases or deployments.

### Execution Legend
- **[ P ]** = Passed
- **[ F ]** = Failed
- **[ B ]** = Blocked
- **[ S ]** = Skipped

### Test Priority Levels
- **P1 (Critical / Smoke):** Core functionality without which the application is unusable (Auth, basic CRUD).
- **P2 (High / Regression):** Important business logic, boundary validation, and error states.
- **P3 (Medium / Edge):** Exploratory checks, edge-case headers, and non-standard payloads.

---

## 📊 2. Master Test Matrix

| Test Case ID | Feature Area | Test Scenario | Priority | Suite Tag | Status |
| :--- | :--- | :--- | :---: | :---: | :---: |
| `TC-AUTH-001` | Authentication | Valid Login with admin credentials | P1 | `@smoke @functional` | [ ] |
| `TC-AUTH-002` | Authentication | Invalid password rejected with 401 | P2 | `@regression @negative` | [ ] |
| `TC-AUTH-003` | Authentication | Missing username or password with 400 | P2 | `@regression @negative` | [ ] |
| `TC-AUTH-004` | Authentication | Token format validation (JWT 3-part format) | P1 | `@regression` | [ ] |
| `TC-HLTH-001` | System Health | Public GET /health returns 200 OK | P1 | `@smoke @functional` | [ ] |
| `TC-TASK-001` | Tasks CRUD | Retrieve all seed tasks with valid token | P1 | `@smoke @functional` | [ ] |
| `TC-TASK-002` | Tasks CRUD | Create task with default pending status | P1 | `@smoke @functional` | [ ] |
| `TC-TASK-003` | Tasks CRUD | Create task with explicit completed status | P2 | `@functional @regression` | [ ] |
| `TC-TASK-004` | Tasks CRUD | Retrieve specific task by valid ID | P1 | `@functional @regression` | [ ] |
| `TC-TASK-005` | Tasks CRUD | Retrieve non-existent task returns 404 | P2 | `@regression @negative` | [ ] |
| `TC-TASK-006` | Tasks CRUD | Full update (title, description, status) | P1 | `@functional @regression` | [ ] |
| `TC-TASK-007` | Tasks CRUD | Partial update (only status) preserves other fields | P2 | `@functional @regression` | [ ] |
| `TC-TASK-008` | Tasks CRUD | Delete task by ID returns 200 and removes record | P1 | `@functional @regression` | [ ] |
| `TC-TASK-009` | Tasks CRUD | Delete non-existent task ID returns 404 | P2 | `@regression @negative` | [ ] |
| `TC-VAL-001`  | Input Validation | Create task with missing title returns 400 | P2 | `@functional @negative` | [ ] |
| `TC-VAL-002`  | Input Validation | Create task with empty string title returns 400 | P2 | `@regression @negative` | [ ] |
| `TC-VAL-003`  | Input Validation | Create task with whitespace-only title returns 400 | P2 | `@regression @negative` | [ ] |
| `TC-VAL-004`  | Boundary Limits | Title with exactly 500 characters succeeds | P2 | `@regression @boundary` | [ ] |
| `TC-VAL-005`  | Boundary Limits | Title with 501 characters rejected with 400 | P2 | `@regression @boundary` | [ ] |
| `TC-VAL-006`  | Input Validation | Invalid status value rejected with 400 | P2 | `@regression @negative` | [ ] |
| `TC-VAL-007`  | Path Parameters | Non-numeric or negative ID rejected with 400 | P2 | `@regression @negative` | [ ] |
| `TC-SEC-001`  | Security / Auth | Access /tasks without Authorization header (401) | P1 | `@regression @security` | [ ] |
| `TC-SEC-002`  | Security / Auth | Access /tasks with Basic auth instead of Bearer (401) | P2 | `@regression @security` | [ ] |
| `TC-SEC-003`  | Security / Auth | Access /tasks with tampered token signature (401) | P1 | `@regression @security` | [ ] |
| `TC-SEC-004`  | Security / SQLi | SQL injection string in title handled safely | P1 | `@regression @security` | [ ] |
| `TC-SEC-005`  | Routing | Request non-existent route returns 404 JSON | P3 | `@regression` | [ ] |

---

## 📝 3. Detailed Test Specifications

### Module: Authentication & System Health

#### `TC-AUTH-001`: Valid Login with Admin Credentials
- **Priority:** P1 | **Tags:** `@smoke @functional`
- **Precondition:** API server is running; test user `admin` exists in config.
- **Method & Endpoint:** `POST /auth/login`
- **Request Body:**
  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```
- **Expected Results:**
  1. Response status is `200 OK`.
  2. Response JSON contains `token` (non-empty string with standard JWT `header.payload.signature` format).
  3. Response contains `user.username` = `"admin"` and `user.role` = `"tester"`.
  4. Response time is under 500ms.

#### `TC-AUTH-002`: Invalid Credentials Rejected
- **Priority:** P2 | **Tags:** `@regression @negative`
- **Method & Endpoint:** `POST /auth/login`
- **Request Body:**
  ```json
  {
    "username": "admin",
    "password": "wrongpassword"
  }
  ```
- **Expected Results:**
  1. Response status is `401 Unauthorized`.
  2. Response body contains `"error": "Unauthorized"`.
  3. Response body does NOT expose sensitive system information or stack traces.

---

### Module: Tasks Management (CRUD)

#### `TC-TASK-001`: Retrieve All Seed Tasks
- **Priority:** P1 | **Tags:** `@smoke @functional`
- **Precondition:** Valid Bearer token obtained from `TC-AUTH-001`.
- **Method & Endpoint:** `GET /tasks`
- **Headers:** `Authorization: Bearer <valid_token>`
- **Expected Results:**
  1. Response status is `200 OK`.
  2. Response body contains `"count"` matching the length of `"tasks"` array.
  3. Each task object contains `id`, `title`, `description`, `status`, and `created_at`.

#### `TC-TASK-002`: Create New Task with Default Status
- **Priority:** P1 | **Tags:** `@smoke @functional`
- **Method & Endpoint:** `POST /tasks`
- **Headers:** `Authorization: Bearer <valid_token>`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "title": "Automated E2E Suite",
    "description": "Implement Playwright and Cucumber"
  }
  ```
- **Expected Results:**
  1. Response status is `201 Created`.
  2. Response message indicates `"Task created successfully."`.
  3. Returned task has an assigned positive integer `id`.
  4. Status defaults to `"pending"`.

#### `TC-TASK-007`: Partial Update Preserves Omitted Fields
- **Priority:** P2 | **Tags:** `@functional @regression`
- **Precondition:** Existing task with known title and description (e.g. ID = 1).
- **Method & Endpoint:** `PUT /tasks/1`
- **Request Body:**
  ```json
  {
    "status": "completed"
  }
  ```
- **Expected Results:**
  1. Response status is `200 OK`.
  2. Status is updated to `"completed"`.
  3. Original `title` and `description` remain unchanged.

---

### Module: Input Validation & Boundary Checks

#### `TC-VAL-004`: Title with Exactly 500 Characters (Boundary Test)
- **Priority:** P2 | **Tags:** `@regression @boundary`
- **Method & Endpoint:** `POST /tasks`
- **Request Body:** Title with string of length 500 characters (`'A'.repeat(500)`).
- **Expected Results:**
  1. Response status is `201 Created`.
  2. Task is persisted without character truncation.

#### `TC-VAL-005`: Title Exceeding 500 Characters Rejected
- **Priority:** P2 | **Tags:** `@regression @boundary`
- **Method & Endpoint:** `POST /tasks`
- **Request Body:** Title with string of length 501 characters.
- **Expected Results:**
  1. Response status is `400 Bad Request`.
  2. Error details explicitly note that title must not exceed 500 characters.

---

### Module: Security & Auth Guards

#### `TC-SEC-001`: Accessing Protected Routes Without Token
- **Priority:** P1 | **Tags:** `@regression @security`
- **Method & Endpoint:** `GET /tasks` without `Authorization` header.
- **Expected Results:**
  1. Response status is `401 Unauthorized`.
  2. Error message: `"Missing or malformed Authorization header. Expected: Bearer <token>"`.

#### `TC-SEC-004`: SQL Injection Sanitization
- **Priority:** P1 | **Tags:** `@regression @security`
- **Method & Endpoint:** `POST /tasks`
- **Request Body:**
  ```json
  {
    "title": "'; DROP TABLE tasks; --",
    "description": "SQL Injection payload check"
  }
  ```
- **Expected Results:**
  1. Response status is `201 Created`.
  2. Literal string is stored safely as text without executing SQL commands.
  3. Subsequent `GET /tasks` confirms database table remains intact and returns all tasks.

---

## 🔁 4. Regression Testing Procedure

1. **Database Reset:** Run `npm run seed` before commencing full regression to guarantee known baseline state.
2. **Execute Smoke Suite First (P1):** Validate that core authorization and endpoints are healthy.
3. **Execute Functional Suite:** Execute all P1 and P2 test cases sequentially.
4. **Execute Negative & Boundary Suite:** Ensure invalid inputs return appropriate 400/401/404 responses.
5. **Log Defects:** Any test case failing to meet expected behavior must be logged with:
   - Test Case ID
   - Request Headers and Payload
   - Expected vs Actual Response
   - Steps to Reproduce
