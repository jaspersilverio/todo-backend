const mysql = require('mysql2/promise');
require('dotenv').config();

// First, connect without specifying database to create it if needed
const adminPool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create database if it doesn't exist
async function createDatabaseIfNotExists() {
  const dbName = process.env.DB_NAME || 'todo_db';
  try {
    // Skip database creation if DB_NAME contains special characters (cloud platforms often provide full connection strings)
    if (dbName.includes('://') || dbName.includes('?')) {
      console.log('Using provided database connection string');
      return;
    }
    await adminPool.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database '${dbName}' is ready`);
  } catch (error) {
    // Database might already exist or we're using a managed database - that's OK
    if (error.code === 'ER_DB_CREATE_EXISTS' || error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log(`Database '${dbName}' already exists or using managed database`);
    } else {
      console.error('Error creating database:', error.message);
    }
  }
}

// Create connection pool with database
// Production: Railway provides DB_HOST, DB_USER, DB_PASSWORD, DB_NAME via environment variables
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'todo_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Production settings for Railway
  reconnect: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Initialize database and tables
async function initializeDatabase() {
  const maxRetries = 5;
  const retryDelay = 2000; // 2 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // First create the database
      await createDatabaseIfNotExists();
      
      // Then create tables
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          pin VARCHAR(4) NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pool.execute(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          userId INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          notes TEXT NULL,
          category VARCHAR(100) NULL,
          dueDate DATE NULL,
          dueTime TIME NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completed BOOLEAN DEFAULT FALSE,
          priority ENUM('Low', 'Medium', 'High') NULL,
          reminderTime DATETIME NULL,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      console.log('Database tables initialized successfully');
      
      // Test connection
      const connection = await pool.getConnection();
      console.log('Connected to MySQL database');
      connection.release();
      
      return; // Success, exit retry loop
    } catch (error) {
      console.error(`Database initialization attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt === maxRetries) {
        console.error('Failed to initialize database after', maxRetries, 'attempts');
        console.error('Server will continue but database operations may fail');
        console.error('This is OK if database is temporarily unavailable - it will retry on next request');
        return; // Don't crash, just log the error
      }
      
      // Wait before retrying
      console.log(`Retrying in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

// Initialize on startup (non-blocking)
initializeDatabase().catch(err => {
  console.error('Database initialization error (non-fatal):', err.message);
  console.log('Server will continue - database will be retried on first request');
});

module.exports = pool;