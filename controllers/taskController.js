const Task = require('../models/Task');

// Get all tasks for a user
exports.getTasks = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const tasks = await Task.findAllByUserId(userId);
    
    // Format tasks for frontend compatibility
    const formattedTasks = tasks.map(task => ({
      id: task.id.toString(),
      userId: task.userId,
      title: task.title,
      notes: task.notes || '',
      category: task.category || '',
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : '',
      dueTime: task.dueTime ? task.dueTime.substring(0, 5) : '', // Format HH:MM
      priority: task.priority || '',
      reminderDate: task.reminderTime ? task.reminderTime.toISOString().split('T')[0] : '',
      reminderTime: task.reminderTime ? task.reminderTime.toTimeString().substring(0, 5) : '',
      createdAt: task.createdAt ? task.createdAt.toISOString() : new Date().toISOString(),
      completed: task.completed === 1 || task.completed === true
    }));

    res.json(formattedTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    // Don't expose internal error details in production
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? 'Failed to fetch tasks. Please try again later.' 
      : error.message;
    res.status(500).json({ error: 'Failed to fetch tasks', details: errorMessage });
  }
};

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const {
      userId,
      title,
      notes,
      category,
      dueDate,
      dueTime,
      priority,
      reminderDate,
      reminderTime,
      completed
    } = req.body;

    if (!userId || !title || !title.trim()) {
      return res.status(400).json({ error: 'User ID and title are required' });
    }

    // Verify user exists (security check)
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Combine reminderDate and reminderTime if both provided
    let reminderDateTime = null;
    if (reminderDate && reminderTime) {
      reminderDateTime = `${reminderDate}T${reminderTime}:00`;
    } else if (reminderDate) {
      reminderDateTime = `${reminderDate}T00:00:00`;
    } else if (reminderTime) {
      // If only time provided, use today's date
      const today = new Date().toISOString().split('T')[0];
      reminderDateTime = `${today}T${reminderTime}:00`;
    }

    const taskId = await Task.create({
      userId,
      title,
      notes: notes || null,
      category: category || null,
      dueDate: dueDate || null,
      dueTime: dueTime || null,
      priority: priority || null,
      reminderTime: reminderDateTime,
      completed: completed || false
    });

    // Fetch the created task
    const newTask = await Task.findById(taskId);
    
    if (!newTask) {
      return res.status(500).json({ error: 'Task created but could not be retrieved' });
    }
    
    // Format for response
    const formattedTask = {
      id: newTask.id.toString(),
      userId: newTask.userId,
      title: newTask.title,
      notes: newTask.notes || '',
      category: newTask.category || '',
      dueDate: newTask.dueDate ? newTask.dueDate.toISOString().split('T')[0] : '',
      dueTime: newTask.dueTime ? newTask.dueTime.substring(0, 5) : '',
      priority: newTask.priority || '',
      reminderDate: newTask.reminderTime ? newTask.reminderTime.toISOString().split('T')[0] : '',
      reminderTime: newTask.reminderTime ? newTask.reminderTime.toTimeString().substring(0, 5) : '',
      createdAt: newTask.createdAt ? newTask.createdAt.toISOString() : new Date().toISOString(),
      completed: newTask.completed === 1 || newTask.completed === true
    };

    res.status(201).json(formattedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    // Don't expose internal error details in production
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? 'Failed to create task. Please try again later.' 
      : error.message;
    res.status(500).json({ error: 'Failed to create task', details: errorMessage });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const {
      title,
      notes,
      category,
      dueDate,
      dueTime,
      priority,
      reminderDate,
      reminderTime,
      completed,
      userId // Optional: verify task belongs to user
    } = req.body;

    if (!taskId) {
      return res.status(400).json({ error: 'Task ID is required' });
    }

    // Check if task exists
    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Security: If userId provided, verify task belongs to that user
    if (userId && existingTask.userId !== parseInt(userId, 10)) {
      return res.status(403).json({ error: 'Access denied: Task does not belong to user' });
    }

    // Combine reminderDate and reminderTime if both provided
    let reminderDateTime = undefined;
    if (reminderDate !== undefined || reminderTime !== undefined) {
      if (reminderDate && reminderTime) {
        reminderDateTime = `${reminderDate}T${reminderTime}:00`;
      } else if (reminderDate) {
        reminderDateTime = `${reminderDate}T00:00:00`;
      } else if (reminderTime) {
        // If only time provided, use existing date or today
        const date = reminderDate || existingTask.reminderTime?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];
        reminderDateTime = `${date}T${reminderTime}:00`;
      } else {
        reminderDateTime = null;
      }
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (notes !== undefined) updateData.notes = notes;
    if (category !== undefined) updateData.category = category;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (dueTime !== undefined) updateData.dueTime = dueTime;
    if (priority !== undefined) updateData.priority = priority;
    if (reminderDateTime !== undefined) updateData.reminderTime = reminderDateTime;
    if (completed !== undefined) updateData.completed = completed;

    const updated = await Task.update(taskId, updateData);
    
    if (!updated) {
      return res.status(400).json({ error: 'No fields to update or update failed' });
    }

    // Fetch updated task
    const updatedTask = await Task.findById(taskId);
    
    if (!updatedTask) {
      return res.status(500).json({ error: 'Task updated but could not be retrieved' });
    }
    
    // Format for response
    const formattedTask = {
      id: updatedTask.id.toString(),
      userId: updatedTask.userId,
      title: updatedTask.title,
      notes: updatedTask.notes || '',
      category: updatedTask.category || '',
      dueDate: updatedTask.dueDate ? updatedTask.dueDate.toISOString().split('T')[0] : '',
      dueTime: updatedTask.dueTime ? updatedTask.dueTime.substring(0, 5) : '',
      priority: updatedTask.priority || '',
      reminderDate: updatedTask.reminderTime ? updatedTask.reminderTime.toISOString().split('T')[0] : '',
      reminderTime: updatedTask.reminderTime ? updatedTask.reminderTime.toTimeString().substring(0, 5) : '',
      createdAt: updatedTask.createdAt ? updatedTask.createdAt.toISOString() : new Date().toISOString(),
      completed: updatedTask.completed === 1 || updatedTask.completed === true
    };

    res.json(formattedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    // Don't expose internal error details in production
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? 'Failed to update task. Please try again later.' 
      : error.message;
    res.status(500).json({ error: 'Failed to update task', details: errorMessage });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userId } = req.query; // Optional: verify task belongs to user

    if (!taskId) {
      return res.status(400).json({ error: 'Task ID is required' });
    }

    // If userId provided, verify task belongs to that user before deleting
    if (userId) {
      const existingTask = await Task.findById(taskId);
      if (!existingTask) {
        return res.status(404).json({ error: 'Task not found' });
      }
      if (existingTask.userId !== parseInt(userId, 10)) {
        return res.status(403).json({ error: 'Access denied: Task does not belong to user' });
      }
    }

    const deleted = await Task.delete(taskId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully', taskId: taskId });
  } catch (error) {
    console.error('Error deleting task:', error);
    // Don't expose internal error details in production
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? 'Failed to delete task. Please try again later.' 
      : error.message;
    res.status(500).json({ error: 'Failed to delete task', details: errorMessage });
  }
};