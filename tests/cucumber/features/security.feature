@regression @security
Feature: Security, Authentication Guards, and SQL Injection Resilience
  As a security-conscious engineer
  I want all protected routes to require valid JWT Bearer authentication
  And I want malicious payloads to be sanitized safely without compromise

  Scenario: Reject GET /tasks when Authorization header is omitted
    Given I have no authentication token
    When I send a GET request to "/tasks"
    Then the response status code should be 401
    And the response error should be "Unauthorized"
    And the response message should contain "Missing or malformed Authorization header"

  Scenario: Reject POST /tasks when Authorization header is omitted
    Given I have no authentication token
    When I send a POST request to "/tasks" without authorization with:
      | title | Unauthorized task creation |
    Then the response status code should be 401
    And the response error should be "Unauthorized"

  Scenario: Reject request using Basic auth scheme instead of Bearer
    When I send a GET request to "/tasks" with header "Authorization" set to "Basic dXNlcjpwYXNz"
    Then the response status code should be 401
    And the response error should be "Unauthorized"

  Scenario: Reject request with malformed Bearer token
    Given I have an invalid Bearer token
    When I send a GET request to "/tasks"
    Then the response status code should be 401
    And the response error should be "Unauthorized"

  Scenario: Reject request with tampered JWT signature
    Given I have a tampered Bearer token
    When I send a GET request to "/tasks"
    Then the response status code should be 401
    And the response error should be "Unauthorized"

  Scenario: Safely store SQL injection string in task title without executing commands
    Given I am authenticated with valid credentials
    When I send a POST request to "/tasks" with:
      | title       | '; DROP TABLE tasks; -- |
      | description | SQL injection probe     |
    Then the response status code should be 201
    And the created task title should be "'; DROP TABLE tasks; --"
    And the database should contain a task with title "'; DROP TABLE tasks; --"
    And the database should still have 4 tasks

  Scenario: Return standard 404 JSON for non-existent routes
    When I send a GET request to "/api/unknown-endpoint"
    Then the response status code should be 404
    And the response error should be "Not Found"
