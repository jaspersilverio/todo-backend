const db = require('../config/db');

class User {
  static async create(pin = null) {
    try {
      const [result] = await db.execute(
        'INSERT INTO users (pin) VALUES (?)',
        [pin]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async findByPin(pin) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM users WHERE pin = ?',
        [pin]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async updatePin(userId, pin) {
    try {
      await db.execute(
        'UPDATE users SET pin = ? WHERE id = ?',
        [pin, userId]
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async removePin(userId) {
    try {
      await db.execute(
        'UPDATE users SET pin = NULL WHERE id = ?',
        [userId]
      );
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;