@manual
Feature: Manual QA Test Specifications & Exploratory Scenarios
  As a QA Engineer
  I want a standardized Gherkin specification of manual test checks
  So that exploratory, visual, and environmental verifications are consistently executed

  @smoke @TC-MAN-001
  Scenario: Manual verification of server cold startup logs
    Given the Node.js API server is stopped
    When a tester launches the server using "npm start"
    Then the console output should display the active port "3000"
    And the console output should display database initialization success
    And the process should remain active without unhandled rejections

  @exploratory @TC-MAN-002
  Scenario: Verify database file persistence across server restarts
    Given the server has been initialized and seeded with 3 tasks
    And a tester manually inserts a new task via Postman with title "Persistent Restart Task"
    When the Node.js server process is terminated via SIGINT
    And the server is restarted with "npm start"
    Then sending GET /tasks should still return "Persistent Restart Task"
    And the SQLite database file "tasks.db" file size should be greater than 0 bytes

  @regression @TC-MAN-003
  Scenario: Verify JWT token expiration behavior after expiry window
    Given an authenticated session was created with a short-lived token
    When the tester waits until the token expiry duration has elapsed
    And sends a GET request to "/tasks" with the expired token
    Then the response status code should be 401 Unauthorized
    And the error message should indicate token expiration

  @boundary @TC-MAN-004
  Scenario: High concurrent payload submission check
    Given 50 simultaneous POST /tasks requests are dispatched using a stress tool
    When all requests complete
    Then no database lock errors (SQLITE_BUSY) should be returned
    And all 50 tasks should be safely written to SQLite
