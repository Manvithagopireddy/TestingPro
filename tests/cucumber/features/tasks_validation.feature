@functional @regression @negative
Feature: Task Payload and Parameter Validation
  As an API guardian
  I want all invalid, boundary-exceeding, or malformed inputs to be rejected with 400 Bad Request
  So that data integrity is consistently enforced

  Background:
    Given I am authenticated with valid credentials

  Scenario: Reject task creation when title is omitted
    When I send a POST request to "/tasks" with:
      | description | Missing title payload |
    Then the response status code should be 400
    And the response error should be "Bad Request"
    And the response message should contain "Validation failed"

  Scenario: Reject task creation with whitespace-only title
    When I send a POST request to "/tasks" with:
      | title |    |
    Then the response status code should be 400
    And the response error should be "Bad Request"

  @boundary
  Scenario: Accept title with exactly 500 characters
    When I send a POST request to "/tasks" with title of length 500
    Then the response status code should be 201
    And the response body should contain the created task

  @boundary
  Scenario: Reject title exceeding 500 characters
    When I send a POST request to "/tasks" with title of length 501
    Then the response status code should be 400
    And the response error should be "Bad Request"

  Scenario: Reject task creation with invalid status enum value
    When I send a POST request to "/tasks" with:
      | title  | Task with invalid status |
      | status | in_review                |
    Then the response status code should be 400
    And the response error should be "Bad Request"

  Scenario: Reject task update with invalid status enum value
    When I send a PUT request to "/tasks/1" with:
      | status | archived |
    Then the response status code should be 400
    And the response error should be "Bad Request"

  Scenario: Reject non-numeric ID parameter on GET
    When I send a GET request to "/tasks/abc"
    Then the response status code should be 400
    And the response error should be "Bad Request"
    And the response message should contain "\"id\" must be a positive integer"

  Scenario: Reject non-positive integer ID parameter on GET
    When I send a GET request to "/tasks/0"
    Then the response status code should be 400
    And the response error should be "Bad Request"

  Scenario: Reject negative ID parameter on DELETE
    When I send a DELETE request to "/tasks/-5"
    Then the response status code should be 400
    And the response error should be "Bad Request"
