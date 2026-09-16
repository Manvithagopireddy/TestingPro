@functional @regression @crud
Feature: Tasks CRUD Lifecycle Management
  As an authenticated API client
  I want to create, read, update, and delete tasks
  So that I can manage task lifecycle states reliably

  Background:
    Given I am authenticated with valid credentials

  @smoke
  Scenario: Retrieve all baseline seed tasks
    When I send a GET request to "/tasks"
    Then the response status code should be 200
    And the task count should be 3

  @smoke
  Scenario: Create a new task with default pending status
    When I send a POST request to "/tasks" with:
      | title       | Implement BDD Feature Files |
      | description | Write Gherkin tests for API |
    Then the response status code should be 201
    And the response body should contain the created task
    And the created task status should be "pending"
    And the created task title should be "Implement BDD Feature Files"
    And the database should contain a task with title "Implement BDD Feature Files"

  Scenario: Create a new task with explicit completed status
    When I send a POST request to "/tasks" with:
      | title       | Design Architecture Document |
      | description | High level architecture map |
      | status      | completed                   |
    Then the response status code should be 201
    And the response body should contain the created task
    And the created task status should be "completed"

  Scenario: Retrieve a specific task by its ID
    Given I send a POST request to "/tasks" with:
      | title       | Task to Fetch |
      | description | Testing GET by ID |
    When I send a GET request to the created task
    Then the response status code should be 200
    And the created task title should be "Task to Fetch"

  @negative
  Scenario: Return 404 when retrieving a non-existent task ID
    When I send a GET request to "/tasks/99999"
    Then the response status code should be 404
    And the response error should be "Not Found"
    And the response message should contain "Task with id 99999 does not exist"

  Scenario: Update title, description, and status of an existing task
    Given I send a POST request to "/tasks" with:
      | title       | Original Title       |
      | description | Original Description |
      | status      | pending              |
    When I send a PUT request to the created task with:
      | title       | Updated Title       |
      | description | Updated Description |
      | status      | completed           |
    Then the response status code should be 200
    And the response body property "message" should equal "Task updated successfully."
    And the created task title should be "Updated Title"
    And the created task status should be "completed"

  Scenario: Partially update only status and preserve other attributes
    Given I send a POST request to "/tasks" with:
      | title       | Persistent Title       |
      | description | Persistent Description |
      | status      | pending                |
    When I send a PUT request to the created task with:
      | status | completed |
    Then the response status code should be 200
    And the created task status should be "completed"
    And the created task title should be "Persistent Title"
    And the created task description should be "Persistent Description"

  @negative
  Scenario: Return 404 when updating non-existent task ID
    When I send a PUT request to "/tasks/99999" with:
      | title | Some Title |
    Then the response status code should be 404
    And the response error should be "Not Found"

  Scenario: Delete an existing task successfully
    Given I send a POST request to "/tasks" with:
      | title | Task to Delete |
    When I send a DELETE request to the created task
    Then the response status code should be 200
    And the response message should contain "deleted successfully"

  @negative
  Scenario: Return 404 when deleting non-existent task ID
    When I send a DELETE request to "/tasks/99999"
    Then the response status code should be 404
    And the response error should be "Not Found"
