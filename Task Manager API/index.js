const express = require('express');
const fs = require('fs').promises;
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.json());

const JSON_FILE_PATH = './TaskList.json';

// Helper function to read data from the JSON file
async function readDataFromFile() {
  try {
    const data = await fs.readFile(JSON_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    throw error;
  }
}

// Helper function to write data to the JSON file
async function writeDataToFile(data) {
  try {
    await fs.writeFile(JSON_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    throw error;
  }
}

// Helper function to validate the presence of required fields in a request
function validateRequiredFields(req, res, requiredFields) {
  const missingFields = requiredFields.filter(field => !req.body[field]);
  if (missingFields.length > 0) {
    const errorMessage = `Missing required field(s): ${missingFields.join(', ')}`;
    return res.status(400).send(errorMessage);
  }
}

app.put('/tasks/:id', async (req, res) => {
  const taskId = req.params.id;
  
  try {
    const taskList = await readDataFromFile();
    const taskIndex = taskList.findIndex(task => task.id === taskId);

    if (taskIndex === -1) {
      return res.status(404).send('Task not found');
    }

    taskList[taskIndex] = { ...taskList[taskIndex], ...req.body };
    await writeDataToFile(taskList);

    console.log('Task updated successfully');
    return res.status(200).json(taskList[taskIndex]);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('Error processing request');
  }
});

app.get('/tasks/:id', async (req, res) => {
  const taskId = req.params.id;

  try {
    const taskList = await readDataFromFile();
    const task = taskList.find(task => task.id === taskId);

    if (!task) {
      return res.status(404).send('Task not found');
    }

    res.json(task);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('Error processing request');
  }
});

app.get('/tasks', async (req, res) => {
  try {
    const data = await readDataFromFile();
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('Error processing request');
  }
});

app.post('/task', async (req, res) => {
  const requiredFields = ['title', 'description', 'completed'];
  validateRequiredFields(req, res, requiredFields);

  try {
    const taskList = await readDataFromFile();
    const id = uuidv4();
    taskList.push({ ...req.body, id });
    await writeDataToFile(taskList);

    console.log('Task added successfully');
    return res.status(200).json({ msg: 'Task added successfully' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('Error processing request');
  }
});

app.delete('/tasks/:id', async (req, res) => {
  // Extract the task ID from the request parameters
  const taskId = req.params.id;

  try {
    // Read the data from the file
    let taskList = await readDataFromFile();

    // Find the index of the task with the specified ID
    const taskIndex = taskList.findIndex(task => task.id === taskId);

    if (taskIndex === -1) {
      return res.status(404).send('Task not found');
    }

    // Remove the task from the task list
    taskList = taskList.filter(task => task.id !== taskId);

    // Write the updated data back to the JSON file
    await writeDataToFile(taskList);

    console.log('Task deleted successfully');
    return res.status(200).send('Task deleted successfully');
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('Error processing request');
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
