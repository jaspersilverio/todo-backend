const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// GET /tasks/:userId - Get all tasks for a user
router.get('/:userId', taskController.getTasks);

// POST /tasks - Create a new task
router.post('/', taskController.createTask);

// PUT /tasks/:taskId - Update a task
router.put('/:taskId', taskController.updateTask);

// DELETE /tasks/:taskId - Delete a task
router.delete('/:taskId', taskController.deleteTask);

module.exports = router;