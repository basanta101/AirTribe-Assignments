Brief
Table of Contents:

Objective:

Build a RESTful API for a simple task manager application.

Project Description:

In this project, we will create a RESTful API using Node.js, Express.js, and NPM packages. The API will allow users to perform CRUD operations (Create, Read, Update, and Delete) on tasks. The tasks should have a title, description, and a flag for completion status. The API should be tested using Postman or Curl.

Set up a basic Node.js project with Express.js and other necessary NPM packages.

Implement a RESTful API with the following endpoints:

GET /tasks: Retrieve all tasks.

GET /tasks/:id: Retrieve a single task by its ID.

POST /tasks: Create a new task.

PUT /tasks/:id: Update an existing task by its ID.

DELETE /tasks/:id: Delete a task by its ID.

Use an in-memory data store (e.g., an array) to store the tasks.

Implement proper error handling for invalid requests.

Add input validation for task creation and updates. Validate that the title and description are not empty, and that the completion status is a boolean value.

Test the API using Postman or Curl to ensure it works as expected.