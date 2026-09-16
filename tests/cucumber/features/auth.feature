@functional @regression @auth
Feature: Authentication and System Health API
  As a client application or API consumer
  I want to verify API health and authenticate with valid credentials
  So that I can obtain a JWT token for authorized requests

  @smoke
  Scenario: Public health check endpoint returns 200 OK
    When I send a GET request to "/health"
    Then the response status code should be 200
    And the response body property "status" should equal "OK"
    And the response body should have property "timestamp"

  @smoke
  Scenario: Successfully authenticate with valid credentials
    When I send a POST request to "/auth/login" with credentials:
      | username | testuser    |
      | password | password123 |
    Then the response status code should be 200
    And the response should contain a valid JWT token
    And the user username should be "testuser"
    And the response body property "message" should equal "Login successful"

  @negative
  Scenario: Reject login attempt with incorrect password
    When I send a POST request to "/auth/login" with credentials:
      | username | testuser      |
      | password | wrongpassword |
    Then the response status code should be 401
    And the response error should be "Unauthorized"
    And the response message should contain "Invalid username or password"

  @negative
  Scenario: Reject login attempt with unknown username
    When I send a POST request to "/auth/login" with credentials:
      | username | unknown_user |
      | password | password123  |
    Then the response status code should be 401
    And the response error should be "Unauthorized"
    And the response message should contain "Invalid username or password"

  @negative
  Scenario: Reject login attempt with missing username
    When I send a POST request to "/auth/login" with credentials:
      | password | password123 |
    Then the response status code should be 400
    And the response error should be "Bad Request"
    And the response message should contain "Both \"username\" and \"password\" fields are required"

  @negative
  Scenario: Reject login attempt with completely empty body
    When I send a POST request to "/auth/login" with empty body
    Then the response status code should be 400
    And the response error should be "Bad Request"
