const db = require('../config/db');

class Task {
  static async findAllByUserId(userId) {
    try {
      const userIdInt = parseInt(userId, 10);
      const [rows] = await db.execute(
        'SELECT * FROM tasks WHERE userId = ? ORDER BY dueDate ASC, dueTime ASC, priority DESC',
        [userIdInt]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(taskId) {
    try {
      const taskIdInt = parseInt(taskId, 10);
      const [rows] = await db.execute(
        'SELECT * FROM tasks WHERE id = ?',
        [taskIdInt]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async create(taskData) {
    try {
      const {
        userId,
        title,
        notes,
        category,
        dueDate,
        dueTime,
        priority,
        reminderTime,
        completed = false
      } = taskData;

      // Convert userId to integer
      const userIdInt = parseInt(userId, 10);
      if (isNaN(userIdInt)) {
        throw new Error('Invalid userId');
      }

      // Handle empty strings as null
      const notesValue = (notes && notes.trim()) || null;
      const categoryValue = (category && category.trim()) || null;
      const dueDateValue = (dueDate && dueDate.trim()) || null;
      const dueTimeValue = (dueTime && dueTime.trim()) || null;
      const priorityValue = (priority && priority.trim()) || null;
      const reminderDateTime = (reminderTime && reminderTime.trim()) || null;

      const [result] = await db.execute(
        `INSERT INTO tasks (userId, title, notes, category, dueDate, dueTime, priority, reminderTime, completed)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userIdInt,
          title.trim(),
          notesValue,
          categoryValue,
          dueDateValue,
          dueTimeValue,
          priorityValue,
          reminderDateTime,
          completed === true || completed === 1 || completed === '1'
        ]
      );

      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async update(taskId, taskData) {
    try {
      const taskIdInt = parseInt(taskId, 10);
      if (isNaN(taskIdInt)) {
        throw new Error('Invalid taskId');
      }

      const {
        title,
        notes,
        category,
        dueDate,
        dueTime,
        priority,
        reminderTime,
        completed
      } = taskData;

      // Build dynamic update query
      const updates = [];
      const values = [];

      if (title !== undefined) {
        updates.push('title = ?');
        values.push(title.trim());
      }
      if (notes !== undefined) {
        updates.push('notes = ?');
        values.push((notes && notes.trim()) || null);
      }
      if (category !== undefined) {
        updates.push('category = ?');
        values.push((category && category.trim()) || null);
      }
      if (dueDate !== undefined) {
        updates.push('dueDate = ?');
        values.push((dueDate && dueDate.trim()) || null);
      }
      if (dueTime !== undefined) {
        updates.push('dueTime = ?');
        values.push((dueTime && dueTime.trim()) || null);
      }
      if (priority !== undefined) {
        updates.push('priority = ?');
        values.push((priority && priority.trim()) || null);
      }
      if (reminderTime !== undefined) {
        updates.push('reminderTime = ?');
        values.push((reminderTime && reminderTime.trim()) || null);
      }
      if (completed !== undefined) {
        updates.push('completed = ?');
        values.push(completed === true || completed === 1 || completed === '1');
      }

      if (updates.length === 0) {
        return false;
      }

      values.push(taskIdInt);

      const [result] = await db.execute(
        `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(taskId) {
    try {
      const taskIdInt = parseInt(taskId, 10);
      if (isNaN(taskIdInt)) {
        throw new Error('Invalid taskId');
      }
      const [result] = await db.execute(
        'DELETE FROM tasks WHERE id = ?',
        [taskIdInt]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Task;